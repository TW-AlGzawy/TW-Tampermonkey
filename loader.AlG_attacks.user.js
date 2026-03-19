// ==UserScript==
// @name         AlGzawy - تنبيه الهجمات (Telegram)
// @namespace    AlGzawy-Scripts-attacks-loader
// @version      1.9
// @description  ينبهك على التليجرام عند وجود هجمات على قريتك في Tribal Wars
// @author       AlGzawy
// @include      https://*.tribalwars.*/game.php*
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @connect      raw.githubusercontent.com
// @connect      api.telegram.org
// @connect      tribalwars.ae
// @connect      tribalwars.net
// @connect      tribalwars.com
// @connect      tribalwars.nl
// @connect      tribalwars.com.br
// @connect      tribalwars.us
// @connect      *
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_attacks.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_attacks.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        GM_info
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_attacks.js';
    const UPDATE_URL = GM_info.script.updateURL;
    const CURRENT_VERSION = GM_info.script.version;

    const SETTINGS_PREFIX = 'algzawy_attacks_';
    const DEFAULTS = {
        botToken: '',
        chatId: '',
        checkInterval: 60,
        alertSound: true,
        showVillage: true,
        isRunning: false,
        panelTop: '150px',
        panelLeft: '250px'
    };

    const settingsForExternalCode = {
        save: function (key, value) {
            GM_setValue(SETTINGS_PREFIX + key, value);
        }
    };

    for (const key in DEFAULTS) {
        settingsForExternalCode[key] = GM_getValue(SETTINGS_PREFIX + key, DEFAULTS[key]);
    }
    settingsForExternalCode['version'] = CURRENT_VERSION;

    unsafeWindow.ALGZAWY_ATK_SETTINGS = settingsForExternalCode;

    function checkForUpdates() {
        const updateButton = document.getElementById('alg-atk-update-btn');
        updateButton.textContent = 'جاري البحث...';

        GM_xmlhttpRequest({
            method: 'GET',
            url: UPDATE_URL + '?t=' + Date.now(),
            onload: function (response) {
                if (response.status === 200) {
                    const match = response.responseText.match(/@version\s+([0-9.]+)/);
                    if (match && match[1]) {
                        if (match[1] > CURRENT_VERSION) {
                            alert(`تحديث مطلوب!\n\nالإصدار الحالي: ${CURRENT_VERSION}\nالإصدار الجديد: ${match[1]}\n\nالرجاء تحديث السكربت.`);
                            updateButton.textContent = 'يوجد تحديث!';
                            updateButton.style.color = 'red';
                        } else {
                            alert('أنت تستخدم أحدث إصدار بالفعل.');
                            updateButton.textContent = 'تحقق من التحديثات';
                        }
                    } else {
                        alert('لم يتم العثور على رقم الإصدار.');
                        updateButton.textContent = 'خطأ';
                    }
                } else {
                    alert('فشل الاتصال بخادم التحديثات.');
                    updateButton.textContent = 'تحقق من التحديثات';
                }
            },
            onerror: function () {
                alert('خطأ في الشبكة أثناء التحقق من التحديث.');
                updateButton.textContent = 'تحقق من التحديثات';
            }
        });
    }

    const observer = new MutationObserver((mutations, obs) => {
        const panelBody = document.querySelector('#alg-atk-body');
        if (panelBody) {
            const updateRow = document.createElement('div');
            updateRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:8px;border-top:1px solid #c1a264;padding-top:8px;';
            updateRow.innerHTML = `
                <button id="alg-atk-update-btn" style="background:none;border:none;color:#007bff;cursor:pointer;text-decoration:underline;padding:0;font-size:11px;">تحقق من التحديثات</button>
                <span style="font-size:10px;color:#542e0a;">v${CURRENT_VERSION}</span>
            `;
            panelBody.appendChild(updateRow);
            document.getElementById('alg-atk-update-btn').addEventListener('click', checkForUpdates);
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[AlGzawy Attacks Loader] جاري تحميل بوت تنبيه الهجمات...');
    GM_xmlhttpRequest({
        method: 'GET',
        url: SCRIPT_URL + '?t=' + Date.now(),
        onload: function (response) {
            if (response.status === 200) {
                console.log('[AlGzawy Attacks Loader] تم التحميل. جاري التشغيل...');
                eval(response.responseText);
            } else if (response.status === 404) {
                alert('تم إيقاف البوت من قبل المطور. يرجى التواصل مع AlGzawy.');
            } else {
                alert('فشل تحميل بوت تنبيه الهجمات. كود الحالة: ' + response.status);
            }
        },
        onerror: function () {
            alert('خطأ في الشبكة. تأكد من اتصالك بالإنترنت.');
        }
    });

})();
