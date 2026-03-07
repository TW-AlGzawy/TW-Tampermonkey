// ==UserScript==
// @name         loader.AlG_scavenge.user.js
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  يقوم بتحميل وتشغيل بوت الإغارات الخاص بـ AlGzawy مع لوحة تحكم
// @author       AlGzawy
// @match        https://*/*=scavenge_mass*
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// ==/UserScript==

(function( ) {
    'use strict';

    // --- الرابط للملف المشفر على GitHub ---
    const SCRIPT_URL = 'https://github.com/TW-AlGzawy/TW-Tampermonkey/raw/main/AlG_scavenge.js';

    // --- الإعدادات الافتراضية والتحميل ---
    const SETTINGS_PREFIX = 'alg_scavenge_';
    const DEFAULTS = {
        botEnabled: false,
        minReload: 15,
        maxReload: 25,
        clickInterval: 1050,
        panelTop: '150px',
        panelLeft: '10px'
    };

    const settingsForExternalCode = {};
    for (const key in DEFAULTS ) {
        settingsForExternalCode[key] = GM_getValue(SETTINGS_PREFIX + key, DEFAULTS[key]);
    }
    
    // --- جعل الإعدادات متاحة للكود الخارجي ---
    unsafeWindow.ALGZAWY_SETTINGS = settingsForExternalCode;

    // --- بناء لوحة التحكم ---
    const panelHTML = `
        <div id="alg-panel" style="position: fixed; top: ${settingsForExternalCode.panelTop}; left: ${settingsForExternalCode.panelLeft}; z-index: 9999; background-color: #f4e4bc; border: 2px solid #804000; border-radius: 5px; color: #603000; font-family: 'Verdana', sans-serif; direction: rtl;">
            <div id="alg-header" style="padding: 5px 10px; background-color: #c1a264; cursor: move; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #804000;">
                <span style="font-weight: bold;">AlGzawy - بوت الاغارات</span>
                <span id="alg-toggle" style="cursor: pointer; font-weight: bold; font-size: 20px;">-</span>
            </div>
            <div id="alg-content" style="padding: 10px;">
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; font-size: 12px;">
                    <input type="number" id="alg-min-reload" value="${settingsForExternalCode.minReload}" style="width: 100%; text-align: center; border: 1px solid #804000; background-color: #fff5e1;">
                    <label>:إعادة التحميل (min)</label>
                    <input type="number" id="alg-max-reload" value="${settingsForExternalCode.maxReload}" style="width: 100%; text-align: center; border: 1px solid #804000; background-color: #fff5e1;">
                    <label>:إعادة التحميل (max)</label>
                    <input type="number" id="alg-click-interval" value="${settingsForExternalCode.clickInterval}" style="width: 100%; text-align: center; border: 1px solid #804000; background-color: #fff5e1;">
                    <label>:(ms) الفاصل</label>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="alg-toggle-bot" class="btn" style="flex-grow: 1;">${settingsForExternalCode.botEnabled ? 'إيقاف البوت' : 'تشغيل البوت'}</button>
                    <button id="alg-save" class="btn">حفظ</button>
                </div>
                <div style="border-top: 1px solid #c1a264; margin-top: 10px; padding-top: 5px; text-align: center; font-size: 10px;">
                    <span>© جميع الحقوق محفوظة - AlGzawy</span>
                </div>
            </div>
        </div>
    `;
    $('body').append(panelHTML);
    $('#alg-toggle-bot').css('background-color', settingsForExternalCode.botEnabled ? '#e53935' : '#43a047');

    // --- وظائف لوحة التحكم ---
    $('#alg-save').on('click', function() {
        GM_setValue(SETTINGS_PREFIX + 'minReload', parseInt($('#alg-min-reload').val(), 10));
        GM_setValue(SETTINGS_PREFIX + 'maxReload', parseInt($('#alg-max-reload').val(), 10));
        GM_setValue(SETTINGS_PREFIX + 'clickInterval', parseInt($('#alg-click-interval').val(), 10));
        alert('تم حفظ الإعدادات بنجاح!');
    });

    $('#alg-toggle-bot').on('click', function() {
        const newState = !GM_getValue(SETTINGS_PREFIX + 'botEnabled', false);
        GM_setValue(SETTINGS_PREFIX + 'botEnabled', newState);
        alert(newState ? 'تم تشغيل البوت. أعد تحميل الصفحة لتطبيق التغيير.' : 'تم إيقاف البوت.');
        location.reload();
    });

    $('#alg-toggle').on('click', function() {
        $('#alg-content').slideToggle();
        $(this).text($(this).text() === '-' ? '+' : '-');
    });

    $('#alg-panel').draggable({
        handle: '#alg-header',
        stop: function(event, ui) {
            GM_setValue(SETTINGS_PREFIX + 'panelTop', ui.position.top + 'px');
            GM_setValue(SETTINGS_PREFIX + 'panelLeft', ui.position.left + 'px');
        }
    });

    // --- تحميل وتشغيل السكربت الأساسي ---
    console.log('[AlGzawy Loader] جاري تحميل البوت...');
    GM_xmlhttpRequest({
        method: "GET",
        url: SCRIPT_URL + '?t=' + Date.now( ),
        onload: function(response) {
            if (response.status === 200) {
                console.log('[AlGzawy Loader] تم التحميل بنجاح. جاري تشغيل البوت...');
                new Function(response.responseText)();
            } else {
                alert(`فشل تحميل بوت الإغارات. رمز الحالة: ${response.status}`);
            }
        },
        onerror: function() {
            alert('حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن GitHub ليس محجوباً.');
        }
    });

})();
