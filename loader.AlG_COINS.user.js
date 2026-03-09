// ==UserScript==
// @name         AlGzawy - بوت الصقل المطور [v1.5]
// @namespace    AlGzawy-Scripts-refine-loader
// @version      1.5
// @description  يقوم بتحميل وتشغيل بوت الصقل المطور من AlGzawy
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php?*screen=snob*
// @match        https://*.tribalwars.ae/game.php?*screen=market*mode=call*
// @match        https://*.tribalwars.ae/game.php?*mode=call*screen=market*
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @connect      raw.githubusercontent.com
// @connect      api.telegram.org
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_COINS.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_COINS.user.js
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
    const CURRENT_VERSION = GM_info.script.version;

    let tabId = sessionStorage.getItem('algzawy_refine_tab_id');
    if (!tabId) {
        tabId = 'tab_' + Date.now();
        sessionStorage.setItem('algzawy_refine_tab_id', tabId);
    }

    const SETTINGS_PREFIX = `algzawy_refine_bot_${tabId}_`;
    const DEFAULTS = {
        stepMarket: true, stepAcademy: true, scheduleMarket: false, marketInterval: 60,
        lastMarketRun: 0, minDelay: 1500, maxDelay: 6000, minRetry: 8000,
        maxRetry: 15000, isRunning: false, panelTop: '150px', panelLeft: '10px',
        tgEnabled: false, tgToken: '', tgChatId: ''
    };

    const settingsForExternalCode = {
        tabId: tabId,
        save: function(key, value) {
            GM_setValue(SETTINGS_PREFIX + key, value);
        }
    };

    for (const key in DEFAULTS) {
        settingsForExternalCode[key] = GM_getValue(SETTINGS_PREFIX + key, DEFAULTS[key]);
    }

    unsafeWindow.ALGZAWY_SETTINGS = settingsForExternalCode;

    GM_xmlhttpRequest({
        method: 'GET',
        url: SCRIPT_URL + '?t=' + Date.now(),
        onload: function(response) {
            if (response.status === 200) {
                eval(response.responseText);
            } else {
                console.error('[AlGzawy Loader] فشل تحميل الكود الأساسي. كود الحالة: ' + response.status);
            }
        },
        onerror: function() {
            console.error('[AlGzawy Loader] خطأ في الشبكة.');
        }
    });

})();
