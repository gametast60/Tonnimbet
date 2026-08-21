// ==UserScript==
// @name         Boxing Odds Scraper & Auto Bet Relay
// @namespace    http://tampermonkey.net/
// @version      7.2
// @description  Scrape exact Head-boxer rate-red/blue match odds accurately with smooth UX
// @match        *://mpk2.pkplay-live.com/*
// @match        *://127.0.0.1/*
// @match        *://localhost/*
// @include      file:///*Muypakyok2.html*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function() {
    'use strict';

    const currentUrl = window.location.href;

    // ============================================================
    // 1. ฝั่งเว็บมวยต้นทาง (pkplay-live.com)
    // ============================================================
    if (currentUrl.includes('pkplay-live.com')) {

        let lastConfirmSignature = '';
        let isActionPending = false;
        let actionPendingTimer = null;

        function getBalance() {
            const balanceEl = document.querySelector('.balance p, .balance');
            if (!balanceEl) return null;

            const text = balanceEl.innerText || balanceEl.textContent;
            const match = text.match(/[\d,]+\.\d+|\d+/);
            return match ? parseFloat(match[0].replace(/,/g, '')) : null;
        }

        function getLimits() {
            let min = 10, max = 0;
            const minEl = document.querySelector('.bet-limit.min');
            const maxEl = document.querySelector('#max_bet_pc_normal_pool') || document.querySelector('.bet-limit.max');

            if (minEl) {
                const nums = minEl.innerText.match(/[\d,]+/g);
                if (nums) min = nums[nums.length - 1];
            }
            if (maxEl) {
                const nums = maxEl.innerText.match(/[\d,]+/g);
                if (nums) max = nums[nums.length - 1];
            }
            return { minBet: min, maxBet: max };
        }

        // ค้นหา Header ของคู่ถ่ายทอดสดจริง (คัดการ์ดลิสต์ที่มีปุ่ม PLAY ออก)
        function getActiveMatchBoxers() {
            const allReds = Array.from(document.querySelectorAll('.Head-boxer-red'));
            const allBlues = Array.from(document.querySelectorAll('.Head-boxer-blue'));

            if (allReds.length === 0) return { headRed: null, headBlue: null };

            const arenaReds = allReds.filter(el => {
                const cardParent = el.closest('.card, .match-card, .box-match, .item-match, [class*="card"]');
                if (!cardParent) return true;
                const playBtn = cardParent.querySelector('button.PLAY, .btn-play, [class*="play"], [class*="Play"]');
                return !playBtn;
            });

            if (arenaReds.length > 0) {
                const activeRed = arenaReds[arenaReds.length - 1];
                const activeBlue = activeRed.parentElement?.querySelector('.Head-boxer-blue') ||
                                   activeRed.closest('.Boxer-info')?.parentElement?.querySelector('.Head-boxer-blue') ||
                                   allBlues[allReds.indexOf(activeRed)] || allBlues[0];
                return { headRed: activeRed, headBlue: activeBlue };
            }

            return { headRed: allReds[0], headBlue: allBlues[0] };
        }

        // ดึงราคาและชื่อนักมวยของคู่ที่กำลังดูอยู่
        function checkAndSendOdds() {
            const currentBalance = getBalance();
            const { minBet, maxBet } = getLimits();

            const { headRed, headBlue } = getActiveMatchBoxers();

            let redName = '';
            let blueName = '';
            let redText = '';
            let blueText = '';

            // 1. ดึงชื่อและราคาฝั่งแดง
            if (headRed) {
                const first = headRed.querySelector('.first')?.innerText.trim() || '';
                const last = headRed.querySelector('.last')?.innerText.trim() || '';
                redName = (first || last) ? `${first} ${last}`.trim() : (headRed.querySelector('.boxer-name')?.innerText.replace('Name', '').trim() || '');

                const rateEl = headRed.querySelector('.rate-red');
                redText = rateEl ? rateEl.innerText.trim() : '';
                if (!redText) {
                    const m = headRed.innerText.match(/HDP\s*\d+\s*:\s*\d+|\d+\s*:\s*\d+\s*HDP|\d+\s*:\s*\d+/i);
                    if (m) redText = m[0];
                }
            }

            // 2. ดึงชื่อและราคาฝั่งน้ำเงิน
            if (headBlue) {
                const first = headBlue.querySelector('.first')?.innerText.trim() || '';
                const last = headBlue.querySelector('.last')?.innerText.trim() || '';
                blueName = (first || last) ? `${first} ${last}`.trim() : (headBlue.querySelector('.boxer-name')?.innerText.replace('Name', '').trim() || '');

                const rateEl = headBlue.querySelector('.rate-blue');
                blueText = rateEl ? rateEl.innerText.trim() : '';
                if (!blueText) {
                    const m = headBlue.innerText.match(/HDP\s*\d+\s*:\s*\d+|\d+\s*:\s*\d+\s*HDP|\d+\s*:\s*\d+/i);
                    if (m) blueText = m[0];
                }
            }

            const redNums = redText.match(/\d+/g)?.map(Number) || [];
            const blueNums = blueText.match(/\d+/g)?.map(Number) || [];

            const hasNumbers = (redNums.length >= 2) || (blueNums.length >= 2);

            // ถ้าไม่มีตัวเลขราคา -> ปิดรับแทง
            if (!hasNumbers || (!redText && !blueText)) {
                GM_setValue('boxingOddsData', {
                    isClosed: true,
                    redName: redName,
                    blueName: blueName,
                    balance: currentBalance,
                    minBet: minBet,
                    maxBet: maxBet,
                    timestamp: Date.now()
                });
                return;
            }

            let favCorner = 'red';
            let oddA = 1;
            let oddB = 1;
            let displayOddsText = '';

            // คำนวณฝั่งต่อ/รองจากตัวเลขราคา
            if (redNums.length >= 2 && redNums[0] > redNums[1]) {
                favCorner = 'red';
                oddA = redNums[0];
                oddB = redNums[1];
                displayOddsText = `🔴 แดงต่อ ${oddA}:${oddB}`;
            } else if (blueNums.length >= 2 && blueNums[0] > blueNums[1]) {
                favCorner = 'blue';
                oddA = blueNums[0];
                oddB = blueNums[1];
                displayOddsText = `🔵 น้ำเงินต่อ ${oddA}:${oddB}`;
            } else if (redNums.length >= 2 && redNums[0] < redNums[1]) {
                favCorner = 'blue';
                oddA = redNums[1];
                oddB = redNums[0];
                displayOddsText = `🔵 น้ำเงินต่อ ${oddA}:${oddB}`;
            } else if (blueNums.length >= 2 && blueNums[0] < blueNums[1]) {
                favCorner = 'red';
                oddA = blueNums[1];
                oddB = blueNums[0];
                displayOddsText = `🔴 แดงต่อ ${oddA}:${oddB}`;
            } else if (redNums.length >= 2) {
                favCorner = 'red';
                oddA = Math.max(redNums[0], redNums[1]);
                oddB = Math.min(redNums[0], redNums[1]);
                displayOddsText = `🔴 แดงต่อ ${oddA}:${oddB}`;
            } else if (blueNums.length >= 2) {
                favCorner = 'blue';
                oddA = Math.max(blueNums[0], blueNums[1]);
                oddB = Math.min(blueNums[0], blueNums[1]);
                displayOddsText = `🔵 น้ำเงินต่อ ${oddA}:${oddB}`;
            }

            GM_setValue('boxingOddsData', {
                isClosed: false,
                redName: redName,
                blueName: blueName,
                rawRedText: redText,
                rawBlueText: blueText,
                favCorner: favCorner,
                oddA: oddA,
                oddB: oddB,
                displayText: displayOddsText,
                balance: currentBalance,
                minBet: minBet,
                maxBet: maxBet,
                timestamp: Date.now()
            });
        }

        setInterval(checkAndSendOdds, 250);

        // ตรวจจับหน้าต่าง Confirm Bet (.Confirm-Content)
        function checkConfirmModal() {
            // ถ้ากำลังส่งคำสั่งกดยืนยัน/ยกเลิก ให้งดส่งสัญญาณ isOpen ซ้ำ
            if (isActionPending) return;

            const modal = document.querySelector('.Confirm-Content');
            if (modal && modal.offsetParent !== null) {
                const title = modal.querySelector('.title')?.innerText.trim() || 'Confirm Bet';
                const groupTexts = modal.querySelectorAll('.group-text');

                let rateText = '';
                let amountText = '';
                let sideText = '';
                let isBlueSide = false;
                let isRedSide = false;
                let winText = '';
                let fighterName = '';
                let loseText = '';

                if (groupTexts[0]) {
                    const rateAmounts = groupTexts[0].querySelectorAll('.rate-amount');
                    if (rateAmounts[0]) rateText = rateAmounts[0].innerText.trim();
                    if (rateAmounts[1]) amountText = rateAmounts[1].innerText.trim();
                }
                if (groupTexts[1]) {
                    const pLeft = groupTexts[1].querySelector('p:first-child');
                    const pRight = groupTexts[1].querySelector('.amount-win, p:last-child');
                    if (pLeft) {
                        sideText = pLeft.innerText.trim();
                        isBlueSide = !!pLeft.querySelector('.BLUE') || sideText.toLowerCase().includes('blue');
                        isRedSide = !!pLeft.querySelector('.RED') || sideText.toLowerCase().includes('red');
                    }
                    if (pRight) winText = pRight.innerText.trim();
                }
                if (groupTexts[2]) {
                    const pLeft = groupTexts[2].querySelector('p:first-child');
                    const pRight = groupTexts[2].querySelector('.amount-lose, p:last-child');
                    if (pLeft) fighterName = pLeft.innerText.trim();
                    if (pRight) loseText = pRight.innerText.trim();
                }

                if (rateText && amountText) {
                    const currentSig = `open|${rateText}|${amountText}|${sideText}|${fighterName}|${winText}|${loseText}`;
                    if (currentSig !== lastConfirmSignature) {
                        lastConfirmSignature = currentSig;
                        GM_setValue('boxingConfirmBetState', {
                            isOpen: true,
                            title: title,
                            rateText: rateText,
                            amountText: amountText,
                            sideText: sideText,
                            isBlueSide: isBlueSide,
                            isRedSide: isRedSide,
                            fighterName: fighterName,
                            winText: winText,
                            loseText: loseText,
                            timestamp: Date.now()
                        });
                    }
                    return;
                }
            }

            if (lastConfirmSignature !== 'closed') {
                lastConfirmSignature = 'closed';
                GM_setValue('boxingConfirmBetState', {
                    isOpen: false,
                    timestamp: Date.now()
                });
            }
        }

        setInterval(checkConfirmModal, 150);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        async function executeHumanBet(corner, amount) {
            isActionPending = false;
            const inputEl = document.querySelector('input.Amount-box');
            const redBtn = document.querySelector('#ปุ่มแทงมุมแดง-PC') || document.querySelector('.btn-bet.red') || document.querySelector('.btn-red');
            const blueBtn = document.querySelector('#ปุ่มแทงมุมน้ำเงิน-PC') || document.querySelector('.btn-bet.blue') || document.querySelector('.btn-blue');

            if (!inputEl) return;

            // 1. ใส่เงิน
            inputEl.focus();
            inputEl.click();
            await sleep(60);

            inputEl.value = amount;
            inputEl.dispatchEvent(new Event('focus', { bubbles: true }));
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
            inputEl.dispatchEvent(new Event('blur', { bubbles: true }));

            await sleep(100);

            // 2. กดปุ่มฝั่งแดง หรือ น้ำเงิน
            if (corner === 'red' && redBtn) {
                redBtn.click();
            } else if (corner === 'blue' && blueBtn) {
                blueBtn.click();
            }
        }

        // รับคำสั่งจาก Dashboard
        GM_addValueChangeListener('boxingBetCommand', function(name, oldValue, newValue) {
            if (!newValue || !newValue.timestamp) return;

            if (newValue.action === 'PLACE_BET_HUMAN') {
                executeHumanBet(newValue.corner, newValue.amount);
            }
            else if (newValue.action === 'CLICK_MIN_BET') {
                const minBtn = document.querySelector('button.bet-limit.min');
                if (minBtn && !minBtn.disabled) minBtn.click();
            }
            else if (newValue.action === 'CLICK_MAX_BET') {
                const maxBtn = document.querySelector('#max_bet_pc_normal_pool') || document.querySelector('button.bet-limit.max');
                if (maxBtn && !maxBtn.disabled) maxBtn.click();
            }
            else if (newValue.action === 'CONFIRM_BET_CLICK') {
                isActionPending = true;
                clearTimeout(actionPendingTimer);
                actionPendingTimer = setTimeout(() => { isActionPending = false; }, 2000);

                lastConfirmSignature = 'closed';
                GM_setValue('boxingConfirmBetState', { isOpen: false, timestamp: Date.now() });

                const confirmBtn = document.querySelector('#ยืนยันการเดิมพัน-PC') ||
                                   document.querySelector('.Confirm-Content .btn-bet') ||
                                   document.querySelector('.Confirm-Content button.btn-theme-event') ||
                                   document.querySelector('.Confirm-Content button:not(.btn-close)');
                if (confirmBtn && !confirmBtn.disabled) {
                    confirmBtn.click();
                }
            }
            else if (newValue.action === 'CONFIRM_BET_CANCEL') {
                isActionPending = true;
                clearTimeout(actionPendingTimer);
                actionPendingTimer = setTimeout(() => { isActionPending = false; }, 2000);

                lastConfirmSignature = 'closed';
                GM_setValue('boxingConfirmBetState', { isOpen: false, timestamp: Date.now() });

                const closeBtn = document.querySelector('.Confirm-Content .btn-close') ||
                                 document.querySelector('.Confirm-Content button.btn-close');
                if (closeBtn && !closeBtn.disabled) {
                    closeBtn.click();
                }
            }
        });
    }

    // ============================================================
    // 2. ฝั่ง Dashboard (127.0.0.1 / localhost / file://)
    // ============================================================
    if (currentUrl.includes('127.0.0.1') || currentUrl.includes('localhost') || currentUrl.includes('file:///')) {
        const bc = new BroadcastChannel('muay_channel');

        // ส่งราคาและ Min/Max ไป Dashboard
        GM_addValueChangeListener('boxingOddsData', function(name, oldValue, newValue) {
            if (newValue) bc.postMessage(newValue);
        });

        // ส่งสถานะ Confirm Modal ไป Dashboard เมื่อมี Event เปลี่ยนแปลงจริง
        GM_addValueChangeListener('boxingConfirmBetState', function(name, oldValue, newValue) {
            if (newValue) {
                bc.postMessage({ type: 'CONFIRM_BET_STATE', ...newValue });
            }
        });

        // ซิงค์ราคาอย่างต่อเนื่อง
        setInterval(() => {
            const lastData = GM_getValue('boxingOddsData');
            if (lastData) bc.postMessage(lastData);
        }, 300);

        // รับคำสั่งจาก Dashboard ส่งไปหาเว็บมวย
        bc.onmessage = function(event) {
            if (event.data && event.data.action) {
                GM_setValue('boxingBetCommand', {
                    ...event.data,
                    timestamp: Date.now()
                });
            }
        };
    }
})();