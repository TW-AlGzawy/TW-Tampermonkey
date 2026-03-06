// ==UserScript==
// @name         AlGzawy - Farm Bot Loader
// @namespace    AlGzawy-Scripts-farm-loader
// @version      1.0
// @description  يقوم بتحميل وتشغيل بوت النهب الآمن من AlGzawy
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php?*screen=am_farm*
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_farm.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_farm.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        GM_info
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    const SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_farm.js';
    const UPDATE_URL = GM_info.script.updateURL;
    const CURRENT_VERSION = GM_info.script.version;

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

    function checkForUpdates() {
        const updateButton = document.getElementById('check-update-btn');
        updateButton.textContent = 'جاري البحث...';

        GM_xmlhttpRequest({
            method: 'GET',
            url: UPDATE_URL + '?t=' + Date.now( ),
            onload: function(response) {
                if (response.status === 200) {
                    const newVersionMatch = response.responseText.match(/@version\s+([0-9.]+)/);
                    if (newVersionMatch && newVersionMatch[1]) {
                        const newVersion = newVersionMatch[1];
                        if (newVersion > CURRENT_VERSION) {
                            alert(`تحديث مطلوب!\n\nالإصدار الحالي: ${CURRENT_VERSION}\nالإصدار الجديد: ${newVersion}\n\nالرجاء تحديث السكربت. إذا لم يتم التحديث تلقائياً خلال 24 ساعة، تواصل مع المطور.`);
                            updateButton.textContent = 'يوجد تحديث!';
                            updateButton.style.color = 'red';
                        } else {
                            alert('أنت تستخدم أحدث إصدار بالفعل.');
                            updateButton.textContent = 'تحقق من التحديثات';
                        }
                    } else {
                        alert('لم يتم العثور على رقم الإصدار في الملف المصدر.');
                        updateButton.textContent = 'خطأ';
                    }
                } else {
                    alert('فشل الاتصال بخادم التحديثات.');
                    updateButton.textContent = 'تحقق من التحديثات';
                }
            },
            onerror: function() {
                alert('خطأ في الشبكة أثناء التحقق من التحديث.');
                updateButton.textContent = 'تحقق من التحديثات';
            }
        });
    }

    const observer = new MutationObserver((mutations, obs) => {
        const panelBody = document.querySelector('#algzawy-body');
        if (panelBody) {
            const updateRow = document.createElement('div');
            updateRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid #c1a264; padding-top: 10px;';
            updateRow.innerHTML = `
                <button id="check-update-btn" style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline; padding: 0;">تحقق من التحديثات</button>
                <span style="font-size: 11px; color: #542e0a;">الإصدار: ${CURRENT_VERSION}</span>
            `;
            panelBody.appendChild(updateRow);
            document.getElementById('check-update-btn').addEventListener('click', checkForUpdates);
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

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
