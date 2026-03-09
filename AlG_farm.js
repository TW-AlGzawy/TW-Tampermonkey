(function () {
    'use strict';

    var S = unsafeWindow.ALGZAWY_SETTINGS;
    var PAGE_IDX_KEY = 'alg_farm_pageIdx';

    var isRunning = !!S.isRunning;
    var switchTimer = null;
    var countdownTimer = null;
    var statusEl = null;

    function getS(key, def) {
        var v = S[key];
        return (v !== undefined && v !== null) ? v : def;
    }

    function saveS(key, val) {
        S.save(key, val);
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
        var swt = getS('switchDelay', 30);
        var ref = getS('refresh', 10);
        var pgs = getS('pagesToFarm', 0);

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
            'min-width:215px',
            'box-shadow:3px 3px 10px rgba(0,0,0,0.5)',
            'user-select:none'
        ].join(';');

        panel.innerHTML =
            '<div id="alg-farm-hdr" style="background:linear-gradient(to bottom,#8b4513,#5c2d0a);color:#f4e4bc;padding:7px 10px;border-radius:6px 6px 0 0;cursor:move;display:flex;justify-content:space-between;align-items:center;">' +
                '<b>AlGzawy - النهب</b>' +
                '<button id="alg-farm-min" style="background:none;border:none;color:#f4e4bc;cursor:pointer;font-size:16px;line-height:1;padding:0 4px;">' + (minimized ? '+' : '−') + '</button>' +
            '</div>' +
            '<div id="alg-farm-body" style="padding:10px;display:' + (minimized ? 'none' : 'block') + ';">' +
                row('القالب', '<select id="alg-f-tpl" style="' + inputStyle + 'width:100%;">' + opt('A', tpl) + opt('B', tpl) + opt('C', tpl) + '</select>') +
                '<div style="margin-bottom:6px;">' +
                    '<label style="display:block;margin-bottom:2px;font-weight:bold;">التأخير (ms)</label>' +
                    '<div style="display:flex;gap:4px;">' +
                        '<input id="alg-f-mind" type="number" min="50" value="' + minD + '" placeholder="200" style="' + inputStyle + 'width:50%;">' +
                        '<input id="alg-f-maxd" type="number" min="50" value="' + maxD + '" placeholder="300" style="' + inputStyle + 'width:50%;">' +
                    '</div>' +
                '</div>' +
                row('تنقل (s)', '<input id="alg-f-swt" type="number" min="5" value="' + swt + '" style="' + inputStyle + 'width:100%;">') +
                row('تحديث (min)', '<input id="alg-f-ref" type="number" min="1" value="' + ref + '" style="' + inputStyle + 'width:100%;">') +
                row('عدد الصفحات', '<input id="alg-f-pgs" type="number" min="0" value="' + pgs + '" style="' + inputStyle + 'width:100%;">') +
                '<button id="alg-f-save" style="' + btnStyle + 'background:#7a5c2a;margin-bottom:6px;">حفظ</button>' +
                '<button id="alg-f-run" style="' + btnStyle + 'background:' + (isRunning ? '#c0392b' : '#27ae60') + ';font-size:14px;margin-bottom:4px;">' + (isRunning ? 'إيقاف' : 'تشغيل') + '</button>' +
                '<div id="alg-f-status" style="margin-top:6px;font-size:11px;color:#542e0a;text-align:center;min-height:16px;">' + (isRunning ? 'جاري العمل...' : 'متوقف') + '</div>' +
                '<div style="text-align:center;margin-top:8px;font-size:10px;color:#7a5c2a;border-top:1px solid #c1a264;padding-top:6px;">AlGzawy • الإصدار 1.0</div>' +
            '</div>';

        document.body.appendChild(panel);
        statusEl = document.getElementById('alg-f-status');

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

        if (isRunning) startBot();
    }

    function saveSettings() {
        saveS('template', document.getElementById('alg-f-tpl').value);
        saveS('minDelay', parseInt(document.getElementById('alg-f-mind').value) || 200);
        saveS('maxDelay', parseInt(document.getElementById('alg-f-maxd').value) || 300);
        saveS('switchDelay', parseInt(document.getElementById('alg-f-swt').value) || 30);
        saveS('refresh', parseInt(document.getElementById('alg-f-ref').value) || 10);
        saveS('pagesToFarm', parseInt(document.getElementById('alg-f-pgs').value) || 0);
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

    function farmRows() {
        var tpl = getS('template', 'A').toLowerCase();
        var minD = getS('minDelay', 200);
        var maxD = getS('maxDelay', 300);

        var allRows = document.querySelectorAll('#plunder_list tbody tr');
        var rows = [];
        for (var i = 0; i < allRows.length; i++) {
            if (allRows[i].querySelector('.farm_icon_' + tpl)) {
                rows.push(allRows[i]);
            }
        }

        if (rows.length === 0) {
            setStatus('لا توجد أهداف في هذه الصفحة');
            scheduleNavigation();
            return;
        }

        setStatus('يحصد ' + rows.length + ' قرية...');

        var cumDelay = 0;
        rows.forEach(function (row) {
            var delay = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
            cumDelay += delay;
            (function (r, d) {
                setTimeout(function () {
                    var btn = r.querySelector('.farm_icon_' + tpl);
                    if (btn) btn.click();
                }, d);
            })(row, cumDelay);
        });

        setTimeout(function () {
            if (isRunning) scheduleNavigation();
        }, cumDelay + 400);
    }

    function scheduleNavigation() {
        clearTimers();
        var swtSec = getS('switchDelay', 30);
        var swtMs = swtSec * 1000;
        var jitter = Math.floor(swtMs * 0.1 * (2 * Math.random() - 1));
        var finalMs = Math.max(3000, swtMs + jitter);

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
            var refMin = getS('refresh', 10);
            var refMs = refMin * 60 * 1000;
            setStatus('تحديث بعد ' + refMin + ' د...');
            switchTimer = setTimeout(function () {
                location.reload();
            }, refMs);
        }
    }

    buildPanel();

})();
