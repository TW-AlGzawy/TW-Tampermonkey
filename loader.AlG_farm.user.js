// ==UserScript==
// @name         AlGzawy - Farm Bot professional
// @namespace    AlG-Scripts-farm-professional
// @version      1.0
// @description  يقوم بتحميل وتشغيل بوت النهب الآمن من AlGzawy
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php?*screen=am_farm*
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    // --- تم وضع الرابط الصحيح الذي أرسلته ---
    const SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_farm.js';

    const SETTINGS_PREFIX = 'algzawy_farm_bot_';
    const DEFAULTS = {
        template: 'A',
        minDelay: 220,
        maxDelay: 350,
        minSwitch: 20000,
        maxSwitch: 35000,
        refresh: 10,
        pagesToFarm: 0,
        isRunning: false,
        panelTop: '150px',
        panelLeft: '10px'
    };

    const settingsForExternalCode = {
        save: function(key, value ) {
            GM_setValue(SETTINGS_PREFIX + key, value);
        }
    };

    for (const key in DEFAULTS) {
        settingsForExternalCode[key] = GM_getValue(SETTINGS_PREFIX + key, DEFAULTS[key]);
    }

    unsafeWindow.ALGZAWY_SETTINGS = settingsForExternalCode;

    console.log('[AlGzawy Loader] جاري تحميل البوت...');
    GM_xmlhttpRequest({
        method: "GET",
        url: SCRIPT_URL + '?t=' + Date.now( ),
        onload: function(response) {
            if (response.status === 200) {
                console.log('[AlGzawy Loader] تم التحميل بنجاح. جاري تشغيل البوت...');
                new Function(response.responseText)();
            } else if (response.status === 404) {
                alert('تم إيقاف البوت من قبل المطور. يرجى التواصل مع AlGzawy.');
            } else {
                alert('فشل تحميل بوت النهب. قد تكون هناك مشكلة في الخادم. يرجى المحاولة لاحقاً.');
            }
        },
        onerror: function() {
            alert('حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن GitHub ليس محجوباً.');
        }
    });

})();
