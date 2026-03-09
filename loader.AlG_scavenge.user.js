// ==UserScript==
// @name         سكربت الغزاوي للإغارات (الإصدار 9.2 - لوحة تحكم مطورة)
// @namespace    http://tampermonkey.net/
// @version      9.2
// @description  أتمتة كاملة مع لوحة تحكم مطورة (تصغير/تكبير، تحقق من التحديثات، إعدادات مخصصة).
// @author       AlGzawy
// @match        https://*/*=scavenge_mass*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @connect      raw.githubusercontent.com
// @connect      github.com
// @connect      code.jquery.com
// @updateURL    https://github.com/TW-AlGzawy/TW-Tampermonkey/raw/main/loader.AlG_scavenge.user.js
// @downloadURL  https://github.com/TW-AlGzawy/TW-Tampermonkey/raw/main/loader.AlG_scavenge.user.js
// ==/UserScript==

(function () {
    'use strict';

    // ========================================================================
    // الإعدادات
    // ========================================================================
    const MAIN_SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_scavenge.js';
    const JQUERY_URL      = 'https://code.jquery.com/jquery-3.6.0.min.js';
    const JQUERYUI_URL    = 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js';
    const SCRIPT_VERSION  = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.version : '9.2';
    const UPDATE_URL      = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.updateURL) ? GM_info.script.updateURL : '';

    // ========================================================================
    // استرجاع الإعدادات المحفوظة
    // ========================================================================
    const settings = {
        minReload:          GM_getValue('minReload',          15),
        maxReload:          GM_getValue('maxReload',          25),
        delayUiLoad:        GM_getValue('delayUiLoad',        2000),
        delayAfterCalc:     GM_getValue('delayAfterCalc',     1500),
        delayBetweenGroups: GM_getValue('delayBetweenGroups', 1050)
    };

    // ========================================================================
    // تحميل سكريبت خارجي بـ <script> tag (للـ page context)
    // ========================================================================
    function injectScriptTag(url) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = url;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // ========================================================================
    // التأكد من توفر jQuery و jQuery UI
    // ========================================================================
    function ensureJQuery() {
        return new Promise(function (resolve) {
            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.draggable !== 'undefined') {
                return resolve(jQuery);
            }
            if (typeof jQuery === 'undefined') {
                injectScriptTag(JQUERY_URL)
                    .then(function () { return injectScriptTag(JQUERYUI_URL); })
                    .then(function () { resolve(jQuery); })
                    .catch(function () { resolve(null); });
            } else {
                injectScriptTag(JQUERYUI_URL)
                    .then(function () { resolve(jQuery); })
                    .catch(function () { resolve(jQuery); });
            }
        });
    }

    // ========================================================================
    // بناء لوحة التحكم
    // ========================================================================
    function buildControlPanel($) {
        var panelHTML = '<div id="algzawy-panel" style="position:fixed;top:100px;left:10px;z-index:9999;background:#f4e4bc;border:2px solid #804000;border-radius:5px;font-family:\'Trebuchet MS\',sans-serif;width:250px;">' +
            '<div id="algzawy-header" style="background:#c1a264;padding:8px;display:flex;justify-content:space-between;align-items:center;cursor:move;">' +
            '<div id="panel-controls" style="cursor:pointer;order:1;">' +
            '<span id="minimize-btn" title="تصغير" style="font-weight:bold;font-size:16px;">—</span>' +
            '<span id="maximize-btn" title="تكبير" style="display:none;font-weight:bold;font-size:16px;">+</span>' +
            '</div>' +
            '<h4 style="margin:0;color:#542e0a;order:2;font-size:14px;">سكربت الاغارات - AlGzawy</h4>' +
            '</div>' +
            '<div id="algzawy-body" style="padding:10px;text-align:center;">' +
            '<button id="toggle-bot-btn" class="btn" style="width:100%;margin-bottom:10px;"></button>' +
            '<div id="settings-section" style="border-top:1px solid #c1a264;padding-top:10px;margin-top:5px;text-align:left;font-size:12px;">' +
            '<h5 style="text-align:center;margin:0 0 10px 0;color:#542e0a;">الإعدادات</h5>' +
            '<div class="setting-row"><label>إعادة التحميل (دقائق):</label>' +
            '<input type="number" id="minReload" class="settings-input" value="' + settings.minReload + '" title="أقل مدة"> - ' +
            '<input type="number" id="maxReload" class="settings-input" value="' + settings.maxReload + '" title="أقصى مدة"></div>' +
            '<div class="setting-row"><label>انتظار الواجهة (ms):</label>' +
            '<input type="number" id="delayUiLoad" class="settings-input full-width" value="' + settings.delayUiLoad + '"></div>' +
            '<div class="setting-row"><label>انتظار الحساب (ms):</label>' +
            '<input type="number" id="delayAfterCalc" class="settings-input full-width" value="' + settings.delayAfterCalc + '"></div>' +
            '<div class="setting-row"><label>بين المجموعات (ms):</label>' +
            '<input type="number" id="delayBetweenGroups" class="settings-input full-width" value="' + settings.delayBetweenGroups + '"></div>' +
            '</div>' +
            '<div id="update-section" style="border-top:1px solid #c1a264;padding-top:10px;margin-top:10px;">' +
            '<button id="check-update-btn" class="btn" style="background:none;border:none;color:#007bff;cursor:pointer;text-decoration:underline;padding:0;">التحقق من التحديثات</button>' +
            '<span style="font-size:11px;color:#542e0a;display:block;margin-top:5px;">الإصدار: ' + SCRIPT_VERSION + '</span>' +
            '</div>' +
            '<p style="font-size:10px;color:#7d510f;margin:10px 0 0 0;">&copy; الحقوق محفوظة / AlGzawy</p>' +
            '</div></div>' +
            '<style>' +
            '.setting-row{margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;}' +
            '.setting-row label{flex-basis:50%;}' +
            '.settings-input{width:55px;padding:2px;border:1px solid #c1a264;background:#fff;text-align:center;}' +
            '.settings-input.full-width{width:115px;}' +
            '</style>';

        $('body').append(panelHTML);

        // draggable اختياري (قد لا يتوفر jQuery UI)
        try {
            $('#algzawy-panel').draggable({ handle: '#algzawy-header' });
        } catch (e) {
            // تمكين السحب اليدوي كبديل
            enableManualDrag(document.getElementById('algzawy-panel'), document.getElementById('algzawy-header'));
        }

        var $toggleBtn  = $('#toggle-bot-btn');
        var $panelBody  = $('#algzawy-body');

        $('#minimize-btn').on('click', function () { $panelBody.slideUp(); $('#minimize-btn').hide(); $('#maximize-btn').show(); });
        $('#maximize-btn').on('click', function () { $panelBody.slideDown(); $('#maximize-btn').hide(); $('#minimize-btn').show(); });

        function updateButtonState() {
            if (GM_getValue('isBotEnabled', true)) {
                $toggleBtn.text('إيقاف البوت').css({ 'background-color': '#dc3545', 'color': 'white' });
            } else {
                $toggleBtn.text('تشغيل البوت').css({ 'background-color': '#28a745', 'color': 'white' });
            }
        }

        $toggleBtn.on('click', function () {
            var current = GM_getValue('isBotEnabled', true);
            GM_setValue('isBotEnabled', !current);
            updateButtonState();
            if (!current) {
                alert('تم تفعيل البوت. سيتم بدء التشغيل عند إعادة تحميل الصفحة التالية.');
                location.reload();
            } else {
                alert('تم إيقاف البوت. سيتوقف عن العمل ولن يتم إعادة تحميل الصفحة.');
            }
        });

        $('#settings-section').on('change', 'input', function () {
            var key   = $(this).attr('id');
            var value = parseInt($(this).val(), 10);
            if (!isNaN(value)) {
                GM_setValue(key, value);
                settings[key] = value;
                console.log('[سكربت الغزاوي] تم حفظ الإعداد: ' + key + ' = ' + value);
            }
        });

        $('#check-update-btn').on('click', function () {
            if (!UPDATE_URL) { alert('رابط التحديث غير محدد.'); return; }
            var $btn = $(this);
            $btn.text('جاري البحث...');
            fetch(UPDATE_URL + '?t=' + Date.now())
                .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
                .then(function (text) {
                    var m = text.match(/@version\s+([0-9.]+)/);
                    if (m && m[1]) {
                        if (m[1] > SCRIPT_VERSION) {
                            alert('تحديث جديد متوفر!\nالإصدار الحالي: ' + SCRIPT_VERSION + '\nالإصدار الجديد: ' + m[1] + '\nيرجى تحديث السكربت.');
                            $btn.text('يوجد تحديث!').css('color', 'red');
                        } else {
                            alert('أنت تستخدم أحدث إصدار بالفعل.');
                            $btn.text('التحقق من التحديثات');
                        }
                    } else {
                        alert('لم يتم العثور على رقم الإصدار.');
                        $btn.text('خطأ في القراءة');
                    }
                })
                .catch(function () {
                    alert('خطأ في الشبكة أثناء التحقق من التحديث.');
                    $btn.text('التحقق من التحديثات');
                });
        });

        updateButtonState();
    }

    // ========================================================================
    // سحب يدوي للوحة (بديل jQuery UI لـ iOS)
    // ========================================================================
    function enableManualDrag(panel, handle) {
        if (!panel || !handle) return;
        var startX, startY, startLeft, startTop;
        handle.addEventListener('touchstart', function (e) {
            var t = e.touches[0];
            startX   = t.clientX;
            startY   = t.clientY;
            startLeft = panel.offsetLeft;
            startTop  = panel.offsetTop;
        }, { passive: true });
        handle.addEventListener('touchmove', function (e) {
            var t = e.touches[0];
            panel.style.left = (startLeft + t.clientX - startX) + 'px';
            panel.style.top  = (startTop  + t.clientY - startY) + 'px';
        }, { passive: true });
    }

    // ========================================================================
    // تنفيذ الكود المُحمَّل في نفس scope اللودر (eval → GM_* متاحة)
    // ========================================================================
    function executeCode(code) {
        try {
            // eval يُشغَّل في نفس الـ scope فتكون GM_* متاحة
            // eslint-disable-next-line no-eval
            eval(code);  // jshint ignore:line
            console.log('[AlGzawy Loader] تم تحميل الكود الأساسي بنجاح.');
        } catch (e) {
            console.error('[AlGzawy Loader] خطأ أثناء تنفيذ الكود الأساسي:', e);
        }
    }

    // ========================================================================
    // تحميل الكود الأساسي من GitHub
    // ========================================================================
    function loadMainScript() {
        var url = MAIN_SCRIPT_URL + '?t=' + Date.now();

        fetch(url)
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
            .then(function (code) { executeCode(code); })
            .catch(function (err) {
                console.warn('[AlGzawy Loader] fetch فشل، جاري المحاولة بـ GM_xmlhttpRequest...', err);
                if (typeof GM_xmlhttpRequest === 'undefined') {
                    console.error('[AlGzawy Loader] لا تتوفر طريقة لتحميل الكود.');
                    return;
                }
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    onload: function (r) {
                        if (r.status === 200) { executeCode(r.responseText); }
                        else { console.error('[AlGzawy Loader] فشل التحميل. كود الحالة:', r.status); }
                    },
                    onerror: function () { console.error('[AlGzawy Loader] خطأ في الشبكة.'); }
                });
            });
    }

    // ========================================================================
    // نقطة البداية — تنتظر jQuery ثم تبني اللوحة وتحمّل الكود
    // ========================================================================
    function init() {
        ensureJQuery().then(function ($) {
            if (!$) {
                console.error('[AlGzawy Loader] فشل تحميل jQuery.');
                return;
            }
            $(document).ready(function () {
                buildControlPanel($);
                loadMainScript();
            });
        });
    }

    init();

})();
