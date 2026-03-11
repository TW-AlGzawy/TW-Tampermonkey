(function () {
    'use strict';

    var S = unsafeWindow.ALGZAWY_SETTINGS;
    var PAGE_IDX_KEY = 'alg_farm_pageIdx';
    var LAST_ATTACK_PREFIX = 'alg_farm_lastAttack_';

    var isRunning = !!S.isRunning;
    var switchTimer = null;
    var countdownTimer = null;
    var botMonitor = null;
    var statusEl = null;
    var lastBotAlert = 0;

    var CARRY = { lc: 80, hc: 50, spear: 25, sword: 25, axe: 25, ram: 0, catapult: 0 };

    function getS(key, def) {
        var stored = GM_getValue('algzawy_farm_bot_' + key, undefined);
        if (stored !== undefined && stored !== null) return stored;
        var v = S[key];
        return (v !== undefined && v !== null) ? v : def;
    }

    function saveS(key, val) {
        GM_setValue('algzawy_farm_bot_' + key, val);
        S[key] = val;
    }

    function setStatus(msg) {
        if (statusEl) statusEl.textContent = msg;
    }

    var inputStyle = 'padding:3px;border:1px solid #8b6914;background:#fff8e8;border-radius:4px;box-sizing:border-box;';
    var btnStyle = 'width:100%;padding:6px;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;display:block;';

    function row(label, inputHtml) {
        return '<div style="margin-bottom:6px;"><label style="display:block;margin-bottom:2px;font-weight:bold;">' + label + '</label>' + inputHtml + '</div>';
    }

    function opt(val, sel) {
        return '<option value="' + val + '"' + (sel === val ? ' selected' : '') + '>' + val + '</option>';
    }

    function makeDraggable(el, handle) {
        var sX, sY, sL, sT;
        handle.onmousedown = function (e) {
            sX = e.clientX; sY = e.clientY;
            sL = parseInt(el.style.left) || 0;
            sT = parseInt(el.style.top) || 0;
            document.onmousemove = function (e) {
                el.style.left = (sL + e.clientX - sX) + 'px';
                el.style.top = (sT + e.clientY - sY) + 'px';
            };
            document.onmouseup = function () {
                document.onmousemove = null;
                document.onmouseup = null;
                GM_setValue('algzawy_farm_bot_panelTop', el.style.top);
                GM_setValue('algzawy_farm_bot_panelLeft', el.style.left);
            };
        };
    }

    function buildPanel() {
        var top = GM_getValue('algzawy_farm_bot_panelTop', '150px');
        var left = GM_getValue('algzawy_farm_bot_panelLeft', '10px');
        var minimized = GM_getValue('algzawy_farm_bot_panelMinimized', false);

        var tpl = getS('template', 'A');
        var minD = getS('minDelay', 200);
        var maxD = getS('maxDelay', 300);
        var swt = getS('switchDelay', 30000);
        var ref = getS('refresh', 600000);
        var pgs = getS('pagesToFarm', 0);
        var maxWallA = getS('maxWallForA', 5);
        var minWallB = getS('minWallForB', 0);
        var refarmDelay = getS('refarmDelay', 7200000);
        var mergeEnabled = getS('mergeEnabled', false);
        var mergeA = getS('mergeA', true);
        var mergeB = getS('mergeB', false);
        var mergeC = getS('mergeC', false);

        var panel = document.createElement('div');
        panel.id = 'alg-farm-panel';
        panel.style.cssText = [
            'position:fixed',
            'top:' + top,
            'left:' + left,
            'z-index:99999',
            'background:linear-gradient(to bottom,#f4e4bc,#e8c97a)',
            'border:2px solid #8b6914',
            'border-radius:8px',
            'font-family:Trebuchet MS,sans-serif',
            'font-size:13px',
            'color:#3b1f00',
            'direction:rtl',
            'min-width:220px',
            'box-shadow:3px 3px 10px rgba(0,0,0,0.5)',
            'user-select:none'
        ].join(';');

        panel.innerHTML =
            '<div id="alg-farm-hdr" style="background:linear-gradient(to bottom,#8b4513,#5c2d0a);color:#f4e4bc;padding:7px 10px;border-radius:6px 6px 0 0;cursor:move;display:flex;justify-content:space-between;align-items:center;">' +
                '<b>AlGzawy - النهب الذكي</b>' +
                '<button id="alg-farm-min" style="background:none;border:none;color:#f4e4bc;cursor:pointer;font-size:16px;line-height:1;padding:0 4px;">' + (minimized ? '+' : '−') + '</button>' +
            '</div>' +
            '<div id="alg-farm-body" style="padding:10px;display:' + (minimized ? 'none' : 'block') + ';">' +
                row('القالب الافتراضي', '<select id="alg-f-tpl" style="' + inputStyle + 'width:100%;">' + opt('A', tpl) + opt('B', tpl) + opt('C', tpl) + '</select>') +
                '<div style="margin-bottom:6px;">' +
                    '<label style="display:block;margin-bottom:2px;font-weight:bold;">التأخير (ms)</label>' +
                    '<div style="display:flex;gap:4px;">' +
                        '<input id="alg-f-mind" type="number" min="50" value="' + minD + '" placeholder="200" style="' + inputStyle + 'width:50%;">' +
                        '<input id="alg-f-maxd" type="number" min="50" value="' + maxD + '" placeholder="300" style="' + inputStyle + 'width:50%;">' +
                    '</div>' +
                '</div>' +
                row('تنقل (ms)', '<input id="alg-f-swt" type="number" min="1000" value="' + swt + '" style="' + inputStyle + 'width:100%;">') +
                row('تحديث (ms)', '<input id="alg-f-ref" type="number" min="10000" value="' + ref + '" style="' + inputStyle + 'width:100%;">') +
                row('عدد الصفحات', '<input id="alg-f-pgs" type="number" min="0" value="' + pgs + '" style="' + inputStyle + 'width:100%;">') +
                '<div style="border-top:1px solid #c1a264;margin:8px 0 6px;padding-top:6px;font-weight:bold;color:#5c2d0a;">⚙ الفلاتر الذكية</div>' +
                row('حائط A ≤', '<input id="alg-f-maxwalla" type="number" min="0" max="20" value="' + maxWallA + '" style="' + inputStyle + 'width:100%;" title="استخدم القالب A إذا كان مستوى الحائط أقل من أو يساوي هذه القيمة">') +
                row('حائط B ≥', '<input id="alg-f-minwallb" type="number" min="0" max="20" value="' + minWallB + '" style="' + inputStyle + 'width:100%;" title="استخدم القالب B إذا كان مستوى الحائط أكبر من أو يساوي هذه القيمة">') +
                row('إعادة نهب بعد (ms)', '<input id="alg-f-refarm" type="number" min="0" value="' + refarmDelay + '" style="' + inputStyle + 'width:100%;" title="0 = بدون قيد. مدة الانتظار قبل إعادة نهب نفس القرية">') +
                '<div style="border-top:1px solid #c1a264;margin:8px 0 6px;padding-top:6px;">' +
                    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:bold;color:#5c2d0a;">' +
                        '<input type="checkbox" id="alg-f-merge" ' + (mergeEnabled ? 'checked' : '') + ' style="width:16px;height:16px;cursor:pointer;">' +
                        '⚔ دمج القوالب' +
                    '</label>' +
                '</div>' +
                '<div id="alg-f-merge-opts" style="display:' + (mergeEnabled ? 'block' : 'none') + ';background:rgba(139,105,20,0.1);border:1px solid #c1a264;border-radius:4px;padding:8px;margin-bottom:6px;">' +
                    '<div style="font-size:11px;color:#5c2d0a;margin-bottom:6px;">اختر القوالب التي تُرسل لكل قرية:</div>' +
                    '<div style="display:flex;gap:12px;justify-content:center;">' +
                        '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-weight:bold;">' +
                            '<input type="checkbox" id="alg-f-merge-a" ' + (mergeA ? 'checked' : '') + ' style="width:16px;height:16px;cursor:pointer;"> A' +
                        '</label>' +
                        '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-weight:bold;">' +
                            '<input type="checkbox" id="alg-f-merge-b" ' + (mergeB ? 'checked' : '') + ' style="width:16px;height:16px;cursor:pointer;"> B' +
                        '</label>' +
                        '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-weight:bold;">' +
                            '<input type="checkbox" id="alg-f-merge-c" ' + (mergeC ? 'checked' : '') + ' style="width:16px;height:16px;cursor:pointer;"> C' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<button id="alg-f-save" style="' + btnStyle + 'background:#7a5c2a;margin-bottom:6px;">حفظ</button>' +
                '<button id="alg-f-run" style="' + btnStyle + 'background:' + (isRunning ? '#c0392b' : '#27ae60') + ';font-size:14px;margin-bottom:4px;">' + (isRunning ? 'إيقاف' : 'تشغيل') + '</button>' +
                '<div id="alg-f-status" style="margin-top:6px;font-size:11px;color:#542e0a;text-align:center;min-height:16px;">' + (isRunning ? 'جاري العمل...' : 'متوقف') + '</div>' +
                '<div style="text-align:center;margin-top:8px;font-size:10px;color:#7a5c2a;border-top:1px solid #c1a264;padding-top:6px;">AlGzawy • الإصدار 2.0 ذكي</div>' +
            '</div>';

        document.body.appendChild(panel);
        statusEl = document.getElementById('alg-f-status');

        document.getElementById('alg-f-merge').onchange = function () {
            document.getElementById('alg-f-merge-opts').style.display = this.checked ? 'block' : 'none';
        };

        makeDraggable(panel, document.getElementById('alg-farm-hdr'));

        document.getElementById('alg-farm-min').onclick = function () {
            var body = document.getElementById('alg-farm-body');
            var isMin = body.style.display === 'none';
            body.style.display = isMin ? 'block' : 'none';
            this.textContent = isMin ? '−' : '+';
            GM_setValue('algzawy_farm_bot_panelMinimized', !isMin);
        };

        document.getElementById('alg-f-save').onclick = saveSettings;
        document.getElementById('alg-f-run').onclick = toggleBot;

        startBotMonitor();

        if (isRunning) startBot();
    }

    function saveSettings() {
        saveS('template', document.getElementById('alg-f-tpl').value);
        saveS('minDelay', parseInt(document.getElementById('alg-f-mind').value) || 200);
        saveS('maxDelay', parseInt(document.getElementById('alg-f-maxd').value) || 300);
        saveS('switchDelay', parseInt(document.getElementById('alg-f-swt').value) || 30000);
        saveS('refresh', parseInt(document.getElementById('alg-f-ref').value) || 600000);
        saveS('pagesToFarm', parseInt(document.getElementById('alg-f-pgs').value) || 0);
        saveS('maxWallForA', parseInt(document.getElementById('alg-f-maxwalla').value));
        saveS('minWallForB', parseInt(document.getElementById('alg-f-minwallb').value));
        saveS('refarmDelay', parseInt(document.getElementById('alg-f-refarm').value) || 0);
        saveS('mergeEnabled', document.getElementById('alg-f-merge').checked);
        saveS('mergeA', document.getElementById('alg-f-merge-a').checked);
        saveS('mergeB', document.getElementById('alg-f-merge-b').checked);
        saveS('mergeC', document.getElementById('alg-f-merge-c').checked);
        setStatus('تم الحفظ ✓');
        setTimeout(function () { setStatus(isRunning ? 'جاري العمل...' : 'متوقف'); }, 1500);
    }

    function toggleBot() {
        if (isRunning) {
            stopBot();
        } else {
            saveSettings();
            startBot();
        }
    }

    function startBot() {
        isRunning = true;
        saveS('isRunning', true);
        var btn = document.getElementById('alg-f-run');
        if (btn) { btn.textContent = 'إيقاف'; btn.style.background = '#c0392b'; }
        sessionStorage.setItem(PAGE_IDX_KEY, '0');

        var toRemove = [];
        for (var i = 0; i < sessionStorage.length; i++) {
            var k = sessionStorage.key(i);
            if (k && k.indexOf(LAST_ATTACK_PREFIX) === 0) toRemove.push(k);
        }
        toRemove.forEach(function (k) { sessionStorage.removeItem(k); });

        farmRows();
    }

    function stopBot() {
        isRunning = false;
        saveS('isRunning', false);
        clearTimers();
        var btn = document.getElementById('alg-f-run');
        if (btn) { btn.textContent = 'تشغيل'; btn.style.background = '#27ae60'; }
        setStatus('متوقف');
    }

    function clearTimers() {
        if (switchTimer) { clearTimeout(switchTimer); switchTimer = null; }
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    }

    // ===================== BOT PROTECTION =====================
    function playAlertSound() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            function beep(freq, start, dur) {
                var o = ctx.createOscillator();
                var g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.frequency.value = freq;
                o.type = 'square';
                g.gain.setValueAtTime(0.3, ctx.currentTime + start);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
                o.start(ctx.currentTime + start);
                o.stop(ctx.currentTime + start + dur + 0.05);
            }
            beep(880, 0.0, 0.18);
            beep(660, 0.2, 0.18);
            beep(880, 0.4, 0.18);
            beep(660, 0.6, 0.18);
            beep(440, 0.8, 0.35);
        } catch (e) {}
    }

    function fireBotAlert() {
        var now = Date.now();
        if (now - lastBotAlert < 10000) return;
        lastBotAlert = now;

        isRunning = false;
        saveS('isRunning', false);
        clearTimers();

        var btn = document.getElementById('alg-f-run');
        if (btn) { btn.textContent = 'تشغيل'; btn.style.background = '#27ae60'; }
        setStatus('⚠ تم اكتشاف حماية البوت!');

        playAlertSound();

        var panel = document.getElementById('alg-farm-panel');
        if (panel) {
            panel.style.border = '3px solid red';
            setTimeout(function () { panel.style.border = '2px solid #8b6914'; }, 5000);
        }
    }

    function startBotMonitor() {
        if (botMonitor) clearInterval(botMonitor);
        botMonitor = setInterval(function () {
            if (
                document.getElementById('botprotection_quest') ||
                document.querySelector('.bot-protection-row') ||
                document.querySelector('#botprotection') ||
                (document.body && document.body.innerHTML.indexOf('bot_check') !== -1)
            ) {
                fireBotAlert();
            }
        }, 2000);
    }

    // ===================== SMART PARSING =====================

    function parseWallLevel(tr) {
        var tds = tr.querySelectorAll('td');
        for (var i = 0; i < tds.length; i++) {
            var txt = tds[i].textContent.trim();
            if (txt === '?' || txt === '') continue;
            var n = parseInt(txt);
            if (!isNaN(n) && n >= 0 && n <= 20 && tds[i].style.textAlign === 'center') {
                return n;
            }
        }
        return -1;
    }

    function parseResources(tr) {
        var resSpans = tr.querySelectorAll('span.res');
        if (resSpans.length < 3) return null;
        var wood = parseInt(resSpans[0].textContent) || 0;
        var stone = parseInt(resSpans[1].textContent) || 0;
        var iron = parseInt(resSpans[2].textContent) || 0;
        return wood + stone + iron;
    }

    function hasCurrentAttack(tr) {
        return !!tr.querySelector('img[src*="command/attack.webp"], img[src*="attack_small"]');
    }

    function getVillageId(tr) {
        var link = tr.querySelector('a[href*="village="]');
        if (!link) return null;
        var m = link.href.match(/village=(\d+)/);
        return m ? m[1] : null;
    }

    function shouldSkipRefarm(villageId) {
        var refarmDelay = getS('refarmDelay', 7200000);
        if (!refarmDelay || refarmDelay <= 0) return false;
        var lastAttack = parseInt(sessionStorage.getItem(LAST_ATTACK_PREFIX + villageId) || '0');
        return (Date.now() - lastAttack) < refarmDelay;
    }

    function markAttacked(villageId) {
        if (villageId) {
            sessionStorage.setItem(LAST_ATTACK_PREFIX + villageId, Date.now().toString());
        }
    }

    function chooseTemplate(tr, defaultTpl) {
        var d = defaultTpl.toLowerCase();
        var wallLevel = parseWallLevel(tr);

        if (wallLevel === -1) return d;

        var maxWallA = getS('maxWallForA', 5);
        var minWallB = getS('minWallForB', 6);

        if (wallLevel <= maxWallA && tr.querySelector('.farm_icon_a:not([disabled])')) return 'a';
        if (minWallB > 0 && wallLevel >= minWallB && tr.querySelector('.farm_icon_b:not([disabled])')) return 'b';

        if (tr.querySelector('.farm_icon_' + d + ':not([disabled])')) return d;
        if (tr.querySelector('.farm_icon_a:not([disabled])')) return 'a';
        if (tr.querySelector('.farm_icon_b:not([disabled])')) return 'b';
        if (tr.querySelector('.farm_icon_c:not([disabled])')) return 'c';
        return d;
    }

    function chooseMergeTemplate(tr, useA, useB, useC) {
        var wallLevel = parseWallLevel(tr);
        var maxWallA = getS('maxWallForA', 5);
        var minWallB = getS('minWallForB', 6);
        var hasA = !!tr.querySelector('.farm_icon_a:not([disabled])');
        var hasB = !!tr.querySelector('.farm_icon_b:not([disabled])');
        var hasC = !!tr.querySelector('.farm_icon_c:not([disabled])');

        // Wall-based rules
        if (useA && wallLevel !== -1 && wallLevel <= maxWallA && hasA) return 'a';
        if (useB && minWallB > 0 && wallLevel !== -1 && wallLevel >= minWallB && hasB) return 'b';

        // Fallback: A → B → C
        if (useA && hasA) return 'a';
        if (useB && hasB) return 'b';
        if (useC && hasC) return 'c';
        return null;
    }

    // ===================== FARM LOGIC =====================
    function farmRows() {
        var defaultTpl = getS('template', 'A');
        var minD = getS('minDelay', 200);
        var maxD = getS('maxDelay', 300);
        var mergeEnabled = getS('mergeEnabled', false);
        var mergeA = getS('mergeA', true);
        var mergeB = getS('mergeB', false);
        var mergeC = getS('mergeC', false);

        var allRows = document.querySelectorAll('#plunder_list tbody tr');
        var targets = [];
        var skippedRefarm = 0;
        var skippedAttack = 0;

        for (var i = 0; i < allRows.length; i++) {
            var tr = allRows[i];

            if (hasCurrentAttack(tr)) { skippedAttack++; continue; }

            var villageId = getVillageId(tr);
            if (villageId && shouldSkipRefarm(villageId)) { skippedRefarm++; continue; }

            if (mergeEnabled) {
                var tpl = chooseMergeTemplate(tr, mergeA, mergeB, mergeC);
                if (!tpl) continue;
                targets.push({ tr: tr, tpl: tpl, villageId: villageId });
            } else {
                var tpl = chooseTemplate(tr, defaultTpl);
                if (!tr.querySelector('.farm_icon_' + tpl)) continue;
                targets.push({ tr: tr, tpl: tpl, villageId: villageId });
            }
        }

        if (targets.length === 0) {
            var total = allRows.length;
            var skipMsg = ' [' + total + ' صف]';
            if (skippedAttack > 0) skipMsg += ' (' + skippedAttack + ' تحت هجوم)';
            if (skippedRefarm > 0) skipMsg += ' (' + skippedRefarm + ' انتظار إعادة نهب)';
            var noIcon = total - skippedAttack - skippedRefarm;
            if (noIcon > 0) skipMsg += ' (' + noIcon + ' بلا أيقونة)';
            setStatus('لا توجد أهداف' + skipMsg);
            scheduleNavigation();
            return;
        }

        var setStatus_msg = mergeEnabled ? 'يحصد ' + targets.length + ' قرية (دمج ذكي)...' : 'يحصد ' + targets.length + ' قرية...';
        setStatus(setStatus_msg);

        var cumDelay = 0;
        targets.forEach(function (target) {
            var delay = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
            cumDelay += delay;
            (function (t, d) {
                setTimeout(function () {
                    if (!isRunning) return;
                    var btn = t.tr.querySelector('.farm_icon_' + t.tpl);
                    if (btn) {
                        btn.click();
                        markAttacked(t.villageId);
                    }
                }, d);
            })(target, cumDelay);
        });

        setTimeout(function () {
            if (isRunning) scheduleNavigation();
        }, cumDelay + 200);
    }

    function scheduleNavigation() {
        clearTimers();
        var swtMs = getS('switchDelay', 30000);
        var jitter = Math.floor(swtMs * 0.05 * (2 * Math.random() - 1));
        var finalMs = Math.max(1000, swtMs + jitter);

        var remaining = Math.ceil(finalMs / 1000);
        setStatus('تنقل بعد ' + remaining + ' ث...');

        countdownTimer = setInterval(function () {
            remaining--;
            if (remaining > 0) {
                setStatus('تنقل بعد ' + remaining + ' ث...');
            } else {
                clearInterval(countdownTimer);
                countdownTimer = null;
            }
        }, 1000);

        switchTimer = setTimeout(function () {
            clearTimers();
            if (isRunning) navigate();
        }, finalMs);
    }

    function navigate() {
        var pagesToFarm = getS('pagesToFarm', 0);

        if (pagesToFarm > 1) {
            var pageIdx = parseInt(sessionStorage.getItem(PAGE_IDX_KEY) || '0');
            var nextIdx = pageIdx + 1;

            if (nextIdx < pagesToFarm) {
                sessionStorage.setItem(PAGE_IDX_KEY, nextIdx);

                var links = document.querySelectorAll('a.paged-nav-item');
                var target = null;
                for (var i = 0; i < links.length; i++) {
                    if (links[i].href.indexOf('Farm_page=' + nextIdx) !== -1) {
                        target = links[i];
                        break;
                    }
                }

                if (target) {
                    setStatus('الانتقال للصفحة ' + (nextIdx + 1) + '...');
                    location.href = target.href;
                    return;
                }
            }

            sessionStorage.setItem(PAGE_IDX_KEY, '0');
        }

        switchVillage();
    }

    function switchVillage() {
        var switchRight = document.getElementById('village_switch_right');
        if (switchRight) {
            setStatus('الانتقال للقرية التالية...');
            location.href = switchRight.getAttribute('href');
        } else {
            var refMs = getS('refresh', 600000);
            var refSec = Math.ceil(refMs / 1000);
            setStatus('تحديث بعد ' + refSec + ' ث...');
            switchTimer = setTimeout(function () {
                location.reload();
            }, refMs);
        }
    }

    buildPanel();

})();
