// ==UserScript==
// @name         AlGzawy - بوت الصقل المطور (Loader)
// @namespace    AlGzawy-Scripts-refine-loader
// @version      2.0 // إصدار جديد كلياً ليعكس التغيير الجذري
// @description  يقوم بتحميل وتشغيل بوت الصقل المطور من AlGzawy
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php*
// @icon         https://i.imgur.com/5p33oA9.png
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_Refine_Loader.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_Refine_Loader.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    const SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_COINS.js';
    const UPDATE_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_Refine_Loader.user.js';
    const CURRENT_VERSION = GM_info.script.version;

    const SETTINGS_PREFIX = 'algzawy_refine_bot_';
    const DEFAULTS = {
        stepMarket: true, stepAcademy: true, scheduleMarket: false, marketInterval: 60,
        lastMarketRun: 0, minDelay: 1500, maxDelay: 6000, minRetry: 8000,
        maxRetry: 15000, isRunning: false, panelTop: '250px', panelLeft: '10px'
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

    console.log('[AlGzawy Loader] جاري تحميل بوت الصقل...');
    GM_xmlhttpRequest({
        method: "GET",
        url: SCRIPT_URL + '?t=' + Date.now( ),
        onload: function(response) {
            if (response.status === 200) {
                console.log('[AlGzawy Loader] تم التحميل بنجاح. جاري تشغيل البوت...');
              new Function('unsafeWindow', response.responseText)(unsafeWindow);
            } else {
                alert(`[AlGzawy Loader] فشل تحميل الكود الأساسي. كود الحالة: ${response.status}`);
            }
        },
        onerror: function() {
            alert('[AlGzawy Loader] حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن GitHub ليس محجوباً.');
        }
    });

    function checkForUpdates() {
      
    }
    const observer = new MutationObserver((mutations, obs) => {
      
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
