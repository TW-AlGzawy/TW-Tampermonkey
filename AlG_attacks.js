(function () {
    'use strict';

    var S = unsafeWindow.ALGZAWY_ATK_SETTINGS;
    var PREFIX = 'algzawy_attacks_';

    var checkTimer = null;
    var statusEl = null;
    var isRunning = !!S.isRunning;

    function getS(key, def) {
        var v = S[key];
        return (v !== undefined && v !== null) ? v : def;
    }

    function saveS(key, val) {
        GM_setValue(PREFIX + key, val);
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
                GM_setValue(PREFIX + 'panelTop', el.style.top);
                GM_setValue(PREFIX + 'panelLeft', el.style.left);
            };
        };
    }

    function buildPanel() {
        var top = GM_getValue(PREFIX + 'panelTop', '150px');
        var left = GM_getValue(PREFIX + 'panelLeft', '250px');
        var minimized = GM_getValue(PREFIX + 'panelMinimized', false);

        var botToken = getS('botToken', '');
        var chatId = getS('chatId', '');
        var interval = getS('checkInterval', 60);
        var alertSound = getS('alertSound', true);
        var showVillage = getS('showVillage', true);

        var panel = document.createElement('div');
        panel.id = 'alg-atk-panel';
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
            'min-width:240px',
            'box-shadow:3px 3px 10px rgba(0,0,0,0.5)',
            'user-select:none'
        ].join(';');

        panel.innerHTML =
            '<div id="alg-atk-hdr" style="background:linear-gradient(to bottom,#8b1a1a,#5c0a0a);color:#f4e4bc;padding:7px 10px;border-radius:6px 6px 0 0;cursor:move;display:flex;justify-content:space-between;align-items:center;">' +
                '<b>AlGzawy - تنبيه الهجمات</b>' +
                '<button id="alg-atk-min" style="background:none;border:none;color:#f4e4bc;cursor:pointer;font-size:16px;line-height:1;padding:0 4px;">' + (minimized ? '+' : '−') + '</button>' +
            '</div>' +
            '<div id="alg-atk-body" style="padding:10px;display:' + (minimized ? 'none' : 'block') + ';">' +
                row('Telegram Bot Token', '<input id="alg-atk-token" type="text" value="' + botToken + '" placeholder="123456:ABC-..." style="' + inputStyle + 'width:100%;">') +
                row('Chat ID / Channel ID', '<input id="alg-atk-chatid" type="text" value="' + chatId + '" placeholder="-100123456789" style="' + inputStyle + 'width:100%;">') +
                row('فترة الفحص (ثانية)', '<input id="alg-atk-interval" type="number" min="10" value="' + interval + '" style="' + inputStyle + 'width:100%;">') +
                '<div style="margin-bottom:6px;"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="alg-atk-sound" ' + (alertSound ? 'checked' : '') + ' style="width:16px;height:16px;cursor:pointer;"><span style="font-weight:bold;">صوت تنبيه</span></label></div>' +
                '<div style="margin-bottom:6px;"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="alg-atk-village" ' + (showVillage ? 'checked' : '') + ' style="width:16px;height:16px;cursor:pointer;"><span style="font-weight:bold;">أرسل تفاصيل القرية</span></label></div>' +
                '<button id="alg-atk-test" style="' + btnStyle + 'background:#2980b9;margin-bottom:6px;">اختبار التليجرام</button>' +
                '<button id="alg-atk-save" style="' + btnStyle + 'background:#7a5c2a;margin-bottom:6px;">حفظ</button>' +
                '<button id="alg-atk-run" style="' + btnStyle + 'background:' + (isRunning ? '#c0392b' : '#27ae60') + ';font-size:14px;margin-bottom:4px;">' + (isRunning ? 'إيقاف' : 'تشغيل') + '</button>' +
                '<div id="alg-atk-status" style="margin-top:6px;font-size:11px;color:#542e0a;text-align:center;min-height:16px;">' + (isRunning ? 'يراقب...' : 'متوقف') + '</div>' +
                '<div id="alg-atk-lastcheck" style="margin-top:4px;font-size:10px;color:#7a5c2a;text-align:center;min-height:14px;"></div>' +
                '<div style="text-align:center;margin-top:8px;font-size:10px;color:#7a5c2a;border-top:1px solid #c1a264;padding-top:6px;">AlGzawy • تنبيه الهجمات 1.0</div>' +
            '</div>';

        document.body.appendChild(panel);
        statusEl = document.getElementById('alg-atk-status');

        makeDraggable(panel, document.getElementById('alg-atk-hdr'));

        document.getElementById('alg-atk-min').onclick = function () {
            var body = document.getElementById('alg-atk-body');
            var isMin = body.style.display === 'none';
            body.style.display = isMin ? 'block' : 'none';
            this.textContent = isMin ? '−' : '+';
            GM_setValue(PREFIX + 'panelMinimized', !isMin);
        };

        document.getElementById('alg-atk-save').onclick = saveSettings;
        document.getElementById('alg-atk-run').onclick = toggleBot;
        document.getElementById('alg-atk-test').onclick = testTelegram;

        if (isRunning) startBot();
    }

    function saveSettings() {
        saveS('botToken', document.getElementById('alg-atk-token').value.trim());
        saveS('chatId', document.getElementById('alg-atk-chatid').value.trim());
        saveS('checkInterval', parseInt(document.getElementById('alg-atk-interval').value) || 60);
        saveS('alertSound', document.getElementById('alg-atk-sound').checked);
        saveS('showVillage', document.getElementById('alg-atk-village').checked);
        setStatus('تم الحفظ ✓');
        setTimeout(function () { setStatus(isRunning ? 'يراقب...' : 'متوقف'); }, 1500);
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
        var btn = document.getElementById('alg-atk-run');
        if (btn) { btn.textContent = 'إيقاف'; btn.style.background = '#c0392b'; }
        setStatus('يراقب...');
        checkAttacks();
    }

    function stopBot() {
        isRunning = false;
        saveS('isRunning', false);
        if (checkTimer) { clearTimeout(checkTimer); checkTimer = null; }
        var btn = document.getElementById('alg-atk-run');
        if (btn) { btn.textContent = 'تشغيل'; btn.style.background = '#27ae60'; }
        setStatus('متوقف');
    }

    function getGameUrl() {
        var m = location.href.match(/^(https?:\/\/[^\/]+\/game\.php)/);
        return m ? m[1] : null;
    }

    function getCurrentVillageId() {
        var m = location.href.match(/[?&]village=(\d+)/);
        return m ? m[1] : null;
    }

    function checkAttacks() {
        if (!isRunning) return;

        var base = getGameUrl();
        if (!base) {
            setStatus('خطأ: لم يتم العثور على رابط اللعبة');
            scheduleNext();
            return;
        }

        var url = base + '?screen=overview_villages&mode=incomings&type=attacks&group=0&page=-1&t=' + Date.now();

        setStatus('جاري الفحص...');

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (resp) {
                if (!isRunning) return;
                if (resp.status === 200) {
                    parseAndAlert(resp.responseText);
                } else {
                    setStatus('فشل الفحص (' + resp.status + ')');
                }
                updateLastCheck();
                scheduleNext();
            },
            onerror: function () {
                if (!isRunning) return;
                setStatus('خطأ في الشبكة');
                updateLastCheck();
                scheduleNext();
            }
        });
    }

    function scheduleNext() {
        if (!isRunning) return;
        var interval = (getS('checkInterval', 60)) * 1000;
        checkTimer = setTimeout(checkAttacks, interval);
    }

    function updateLastCheck() {
        var el = document.getElementById('alg-atk-lastcheck');
        if (el) {
            var now = new Date();
            var h = now.getHours().toString().padStart(2, '0');
            var mi = now.getMinutes().toString().padStart(2, '0');
            var s = now.getSeconds().toString().padStart(2, '0');
            el.textContent = 'آخر فحص: ' + h + ':' + mi + ':' + s;
        }
    }

    function parseAndAlert(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        var rows = doc.querySelectorAll('#incomings_table tr.row_a, #incomings_table tr.row_b');
        if (!rows || rows.length === 0) {
            setStatus('لا توجد هجمات');
            return;
        }

        var known = getKnownAttacks();
        var newAttacks = [];

        rows.forEach(function (row) {
            var attackId = extractAttackId(row);
            if (!attackId) return;
            if (known.indexOf(attackId) === -1) {
                newAttacks.push(row);
            }
        });

        if (newAttacks.length > 0) {
            setStatus('هجمات جديدة: ' + newAttacks.length);
            var allIds = [];
            rows.forEach(function (r) {
                var id = extractAttackId(r);
                if (id) allIds.push(id);
            });
            saveKnownAttacks(allIds);

            sendTelegramAlerts(newAttacks);

            if (getS('alertSound', true)) playAlertSound();
        } else {
            setStatus('لا هجمات جديدة (' + rows.length + ' إجمالي)');
            var allIds2 = [];
            rows.forEach(function (r) {
                var id = extractAttackId(r);
                if (id) allIds2.push(id);
            });
            saveKnownAttacks(allIds2);
        }
    }

    function extractAttackId(row) {
        var links = row.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
            var m = links[i].href.match(/id=(\d+)/);
            if (m) return m[1];
        }
        var m2 = row.innerHTML.match(/id=(\d+)/);
        return m2 ? m2[1] : null;
    }

    function getKnownAttacks() {
        var stored = GM_getValue(PREFIX + 'knownAttacks', '');
        return stored ? stored.split(',') : [];
    }

    function saveKnownAttacks(ids) {
        GM_setValue(PREFIX + 'knownAttacks', ids.join(','));
    }

    function buildAttackMessage(row) {
        var msg = 'تنبيه هجوم على Tribal Wars!\n\n';

        var cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            var targetCell = cells[0] ? cells[0].textContent.trim() : '';
            var originCell = cells[1] ? cells[1].textContent.trim() : '';
            var timeCell = cells[cells.length - 2] ? cells[cells.length - 2].textContent.trim() : '';

            if (getS('showVillage', true) && targetCell) {
                msg += 'القرية المستهدفة: ' + targetCell + '\n';
            }
            if (originCell) {
                msg += 'من: ' + originCell + '\n';
            }
            if (timeCell) {
                msg += 'وقت الوصول: ' + timeCell + '\n';
            }
        }

        var attackId = extractAttackId(row);
        if (attackId) {
            var base = getGameUrl();
            if (base) {
                msg += '\nرابط: ' + base + '?screen=overview&mode=incomings';
            }
        }

        return msg;
    }

    function sendTelegramAlerts(attacks) {
        var token = getS('botToken', '');
        var chatId = getS('chatId', '');

        if (!token || !chatId) {
            setStatus('خطأ: Bot Token أو Chat ID غير محدد');
            return;
        }

        var summary = 'تنبيه: ' + attacks.length + ' هجمة جديدة على قريتك في Tribal Wars!\n';
        summary += 'الوقت: ' + new Date().toLocaleString('ar') + '\n';
        summary += 'رابط اللعبة: ' + (getGameUrl() || '') + '?screen=overview&mode=incomings';

        sendTelegram(token, chatId, summary);

        if (attacks.length <= 5) {
            attacks.forEach(function (row, i) {
                setTimeout(function () {
                    sendTelegram(token, chatId, buildAttackMessage(row));
                }, (i + 1) * 1000);
            });
        }
    }

    function sendTelegram(token, chatId, text) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://api.telegram.org/bot' + token + '/sendMessage',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ chat_id: chatId, text: text, parse_mode: '' }),
            onload: function (resp) {
                if (resp.status !== 200) {
                    console.warn('[AlGzawy Attacks] فشل إرسال تليجرام:', resp.status, resp.responseText);
                }
            },
            onerror: function () {
                console.warn('[AlGzawy Attacks] خطأ في إرسال تليجرام');
            }
        });
    }

    function testTelegram() {
        var token = document.getElementById('alg-atk-token').value.trim();
        var chatId = document.getElementById('alg-atk-chatid').value.trim();

        if (!token || !chatId) {
            alert('الرجاء إدخال Bot Token و Chat ID أولاً.');
            return;
        }

        setStatus('جاري اختبار التليجرام...');
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://api.telegram.org/bot' + token + '/sendMessage',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ chat_id: chatId, text: 'اختبار بوت AlGzawy - تنبيه الهجمات\nالاتصال يعمل بشكل صحيح!' }),
            onload: function (resp) {
                if (resp.status === 200) {
                    setStatus('تم الإرسال بنجاح!');
                    setTimeout(function () { setStatus(isRunning ? 'يراقب...' : 'متوقف'); }, 2000);
                } else {
                    var err = '';
                    try { err = JSON.parse(resp.responseText).description || ''; } catch (e) {}
                    alert('فشل الإرسال!\nكود: ' + resp.status + '\n' + err);
                    setStatus('فشل الاختبار');
                }
            },
            onerror: function () {
                alert('خطأ في الشبكة أثناء الاختبار.');
                setStatus('خطأ في الشبكة');
            }
        });
    }

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
                o.stop(ctx.currentTime + start + dur);
            }
            beep(880, 0, 0.15);
            beep(660, 0.2, 0.15);
            beep(880, 0.4, 0.2);
        } catch (e) {}
    }

    buildPanel();

})();
