// ==UserScript==
// @name         سكربت الغزاوي للإغارات (الإصدار 9.2 - لوحة تحكم مطورة)
// @namespace    http://tampermonkey.net/
// @version      9.2
// @description  أتمتة كاملة مع لوحة تحكم مطورة (تصغير/تكبير، تحقق من التحديثات، إعدادات مخصصة).
// @author       AlGzawy
// @match        https://*/*=scavenge_mass*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @connect      raw.githubusercontent.com
// @connect      github.com
// @updateURL    https://github.com/TW-AlGzawy/TW-Tampermonkey/raw/main/loader.AlG_scavenge.user.js
// @downloadURL  https://github.com/TW-AlGzawy/TW-Tampermonkey/raw/main/loader.AlG_scavenge.user.js
// ==/UserScript==

(function ($) {
    'use strict';

    // ========================================================================
    // رابط الكود الأساسي المشفّر
    // ========================================================================
    const MAIN_SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_scavenge.js';
    const UPDATE_URL = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.updateURL) ? GM_info.script.updateURL : '';

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
    // بناء لوحة التحكم العائمة
    // ========================================================================
    function buildControlPanel() {
        const panelHTML = `
            <div id="algzawy-panel" style="position: fixed; top: 100px; left: 10px; z-index: 9999; background: #f4e4bc; border: 2px solid #804000; border-radius: 5px; font-family: 'Trebuchet MS', sans-serif; width: 250px;">
                <div id="algzawy-header" style="background: #c1a264; padding: 8px; display: flex; justify-content: space-between; align-items: center; cursor: move;">
                    <div id="panel-controls" style="cursor: pointer; order: 1;">
                        <span id="minimize-btn" title="تصغير" style="font-weight: bold; font-size: 16px;">—</span>
                        <span id="maximize-btn" title="تكبير" style="display: none; font-weight: bold; font-size: 16px;">+</span>
                    </div>
                    <h4 style="margin:0; color: #542e0a; order: 2; font-size: 14px;">سكربت الاغارات - AlGzawy</h4>
                </div>
                <div id="algzawy-body" style="padding: 10px; text-align: center;">
                    <button id="toggle-bot-btn" class="btn" style="width: 100%; margin-bottom: 10px;"></button>

                    <div id="settings-section" style="border-top: 1px solid #c1a264; padding-top: 10px; margin-top: 5px; text-align: left; font-size: 12px;">
                        <h5 style="text-align: center; margin: 0 0 10px 0; color: #542e0a;">الإعدادات</h5>
                        <div class="setting-row">
                            <label>إعادة التحميل (دقائق):</label>
                            <input type="number" id="minReload" class="settings-input" value="${settings.minReload}" title="أقل مدة"> -
                            <input type="number" id="maxReload" class="settings-input" value="${settings.maxReload}" title="أقصى مدة">
                        </div>
                        <div class="setting-row">
                            <label>انتظار الواجهة (ms):</label>
                            <input type="number" id="delayUiLoad" class="settings-input full-width" value="${settings.delayUiLoad}">
                        </div>
                        <div class="setting-row">
                            <label>انتظار الحساب (ms):</label>
                            <input type="number" id="delayAfterCalc" class="settings-input full-width" value="${settings.delayAfterCalc}">
                        </div>
                        <div class="setting-row">
                            <label>بين المجموعات (ms):</label>
                            <input type="number" id="delayBetweenGroups" class="settings-input full-width" value="${settings.delayBetweenGroups}">
                        </div>
                    </div>

                    <div id="update-section" style="border-top: 1px solid #c1a264; padding-top: 10px; margin-top: 10px;">
                        <button id="check-update-btn" class="btn" style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline; padding: 0;">التحقق من التحديثات</button>
                        <span style="font-size: 11px; color: #542e0a; display: block; margin-top: 5px;">الإصدار: ${(typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.version : '9.2'}</span>
                    </div>
                    <p style="font-size: 10px; color: #7d510f; margin: 10px 0 0 0;">&copy; الحقوق محفوظة / AlGzawy</p>
                </div>
            </div>
            <style>
                .setting-row { margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
                .setting-row label { flex-basis: 50%; }
                .settings-input { width: 55px; padding: 2px; border: 1px solid #c1a264; background: #fff; text-align: center; }
                .settings-input.full-width { width: 115px; }
            </style>
        `;
        $('body').append(panelHTML);
        $('#algzawy-panel').draggable({ handle: '#algzawy-header' });

        const $toggleBtn = $('#toggle-bot-btn');
        const $panelBody = $('#algzawy-body');

        $('#minimize-btn').on('click', () => {
            $panelBody.slideUp();
            $('#minimize-btn').hide();
            $('#maximize-btn').show();
        });
        $('#maximize-btn').on('click', () => {
            $panelBody.slideDown();
            $('#maximize-btn').hide();
            $('#minimize-btn').show();
        });

        function updateButtonState() {
            if (GM_getValue('isBotEnabled', true)) {
                $toggleBtn.text('إيقاف البوت').css({ 'background-color': '#dc3545', 'color': 'white' });
            } else {
                $toggleBtn.text('تشغيل البوت').css({ 'background-color': '#28a745', 'color': 'white' });
            }
        }
        $toggleBtn.on('click', function () {
            const currentState = GM_getValue('isBotEnabled', true);
            GM_setValue('isBotEnabled', !currentState);
            updateButtonState();
            if (!currentState) {
                alert('تم تفعيل البوت. سيتم بدء التشغيل عند إعادة تحميل الصفحة التالية.');
                location.reload();
            } else {
                alert('تم إيقاف البوت. سيتوقف عن العمل ولن يتم إعادة تحميل الصفحة.');
            }
        });

        $('#settings-section').on('change', 'input', function () {
            const key = $(this).attr('id');
            const value = parseInt($(this).val(), 10);
            if (!isNaN(value)) {
                GM_setValue(key, value);
                settings[key] = value;
                console.log(`[سكربت الغزاوي] تم حفظ الإعداد: ${key} = ${value}`);
            }
        });

        $('#check-update-btn').on('click', function () {
            if (!UPDATE_URL) {
                alert('رابط التحديث غير محدد في إعدادات السكربت.');
                return;
            }
            const $btn = $(this);
            const currentVersion = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.version : '9.2';
            $btn.text('جاري البحث...');

            fetch(UPDATE_URL + '?t=' + Date.now())
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.text();
                })
                .then(function (text) {
                    const match = text.match(/@version\s+([0-9.]+)/);
                    if (match && match[1]) {
                        if (match[1] > currentVersion) {
                            alert('تحديث جديد متوفر!\n\nالإصدار الحالي: ' + currentVersion + '\nالإصدار الجديد: ' + match[1] + '\n\nيرجى تحديث السكربت.');
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
    // تحميل وتنفيذ الكود الأساسي (fetch أولاً، ثم GM_xmlhttpRequest كبديل)
    // ========================================================================
    function executeCode(code) {
        try {
            // eslint-disable-next-line no-new-func
            (new Function(code))();
            console.log('[AlGzawy Loader] تم تحميل الكود الأساسي بنجاح.');
        } catch (e) {
            console.error('[AlGzawy Loader] خطأ أثناء تنفيذ الكود الأساسي:', e);
        }
    }

    function loadMainScript() {
        const url = MAIN_SCRIPT_URL + '?t=' + Date.now();

        fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(function (code) {
                executeCode(code);
            })
            .catch(function (fetchErr) {
                console.warn('[AlGzawy Loader] fetch فشل، جاري المحاولة بـ GM_xmlhttpRequest...', fetchErr);
                if (typeof GM_xmlhttpRequest === 'undefined') {
                    console.error('[AlGzawy Loader] GM_xmlhttpRequest غير متاح أيضاً.');
                    return;
                }
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    onload: function (response) {
                        if (response.status === 200) {
                            executeCode(response.responseText);
                        } else {
                            console.error('[AlGzawy Loader] فشل تحميل الكود الأساسي. كود الحالة:', response.status);
                        }
                    },
                    onerror: function () {
                        console.error('[AlGzawy Loader] خطأ في الشبكة أثناء تحميل الكود الأساسي.');
                    }
                });
            });
    }

    // ========================================================================
    // التشغيل
    // ========================================================================
    $(document).ready(function () {
        buildControlPanel();
        loadMainScript();
    });

})(jQuery);
