// ==UserScript==
// @name         AlGzawy - موازنة الموارد [v1.0]
// @namespace    AlGzawy-Scripts-balance-loader
// @version      1.0
// @description  يقوم بتحميل وتشغيل بوت موازنة الموارد التلقائي من AlGzawy
// @author       AlGzawy
// @include      https://*.tribalwars.*/game.php*
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_balance.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_balance.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    const MAIN_SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_balance.js';
    const UPDATE_URL = GM_info.script.updateURL;
    const CURRENT_VERSION = GM_info.script.version;

    const SETTINGS_PREFIX = 'algzawy_balance_bot_';
    const DEFAULTS = {
        interval: 7200000,
        reserveMerchants: 0,
        averageFactor: 1.0,
        nrClusters: 1,
        sendDelay: 400,
        isRunning: false
    };

    const settingsForExternalCode = {
        save: function (key, value) {
            GM_setValue(SETTINGS_PREFIX + key, value);
        }
    };

    for (const key in DEFAULTS) {
        const stored = GM_getValue(SETTINGS_PREFIX + key, undefined);
        settingsForExternalCode[key] = (stored !== undefined && stored !== null) ? stored : DEFAULTS[key];
    }

    unsafeWindow.ALGZAWY_SETTINGS = settingsForExternalCode;

    // ===================== UPDATE CHECK =====================
    function checkForUpdates() {
        if (!UPDATE_URL) return;
        GM_xmlhttpRequest({
            method: 'GET',
            url: UPDATE_URL,
            onload: function (response) {
                const match = response.responseText.match(/@version\s+([\d.]+)/);
                if (match && match[1] !== CURRENT_VERSION) {
                    const banner = document.createElement('div');
                    banner.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:999999;background:#1a4d1a;color:#c8e6c9;padding:8px 20px;border-radius:0 0 8px 8px;font-size:13px;direction:rtl;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer;';
                    banner.innerHTML = 'يتوفر تحديث جديد للودر v' + match[1] + ' — <a href="' + UPDATE_URL + '" style="color:#a5d6a7;">تحديث</a>';
                    banner.onclick = function () { banner.remove(); };
                    document.body.appendChild(banner);
                    setTimeout(function () { if (banner.parentNode) banner.remove(); }, 10000);
                }
            }
        });
    }

    // ===================== LOAD MAIN SCRIPT =====================
    function loadMainScript() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: MAIN_SCRIPT_URL,
            onload: function (response) {
                if (response.status === 200) {
                    try {
                        eval(response.responseText);
                    } catch (e) {
                        console.error('[AlGzawy Balance] خطأ في تنفيذ السكربت:', e);
                    }
                } else {
                    console.warn('[AlGzawy Balance] فشل تحميل الكود الأساسي. كود الحالة:', response.status);
                }
            },
            onerror: function () {
                console.error('[AlGzawy Balance] تعذر الاتصال بـ GitHub');
            }
        });
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            loadMainScript();
            setTimeout(checkForUpdates, 5000);
        });
    } else {
        loadMainScript();
        setTimeout(checkForUpdates, 5000);
    }

})();
