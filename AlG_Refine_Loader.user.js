// ==UserScript==
// @name         AlGzawy - بوت الصقل المطور (Loader)
// @namespace    AlGzawy-Scripts-refine-loader
// @version      1.0
// @description  يقوم بتحميل وتشغيل بوت الصقل المطور من AlGzawy
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php?*screen=market&mode=call*
// @match        https://*.tribalwars.ae/game.php?*screen=snob*
// @icon         https://i.imgur.com/5p33oA9.png
// @connect      raw.githubusercontent.com
// @updateURL    !!!ضع هنا رابط اللودر!!!
// @downloadURL  !!!ضع هنا رابط اللودر!!!
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        GM_info
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    const SCRIPT_URL = '!!!ضع هنا رابط الكود المشفر!!!';
    const UPDATE_URL = GM_info.script.updateURL;
    const CURRENT_VERSION = GM_info.script.version;

    const SETTINGS_PREFIX = 'algzawy_refine_bot_';
    const DEFAULTS = {
        stepMarket: true,
        stepAcademy: true,
        scheduleMarket: false,
        marketInterval: 60,
        lastMarketRun: 0,
        minDelay: 1500,
        maxDelay: 6000,
        minRetry: 8000,
        maxRetry: 15000,
        isRunning: false,
        panelTop: '250px',
        panelLeft: '10px'
    };

    // تجهيز الإعدادات لتمريرها للكود الخارجي
    const settingsForExternalCode = {
        save: function(key, value) {
            GM_setValue(SETTINGS_PREFIX + key, value);
        }
    };

    for (const key in DEFAULTS) {
        settingsForExternalCode[key] = GM_getValue(SETTINGS_PREFIX + key, DEFAULTS[key]);
    }

    unsafeWindow.ALGZAWY_SETTINGS = settingsForExternalCode;

    // دالة فحص التحديثات
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
                            alert(`تحديث مطلوب!\n\nالإصدار الحالي: ${CURRENT_VERSION}\nالإصدار الجديد: ${newVersion}\n\nسيتم تحديث السكربت تلقائياً.`);
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

    // مراقب لإضافة زر التحديثات بعد بناء الواجهة
    const observer = new MutationObserver((mutations, obs) => {
        const panelBody = document.querySelector('#algzawy-refine-body');
        if (panelBody && !document.getElementById('check-update-btn')) {
            const updateRow = document.createElement('div');
            updateRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid #c1a264; padding-top: 10px;';
            updateRow.innerHTML = `
                <button id="check-update-btn" style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline; padding: 0;">تحقق من التحديثات</button>
                <span style="font-size: 11px; color: #542e0a;">الإصدار: ${CURRENT_VERSION}</span>
            `;
            panelBody.appendChild(updateRow);
            document.getElementById('check-update-btn').addEventListener('click', checkForUpdates);
            obs.disconnect(); // نوقف المراقب بعد إضافة الزر
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // تحميل الكود الأساسي
    console.log('[AlGzawy Loader] جاري تحميل بوت الصقل...');
    GM_xmlhttpRequest({
        method: "GET",
        url: SCRIPT_URL + '?t=' + Date.now( ), // إضافة متغير عشوائي لمنع التخزين المؤقت
        onload: function(response) {
            if (response.status === 200) {
                console.log('[AlGzawy Loader] تم التحميل بنجاح. جاري تشغيل البوت...');
                new Function(response.responseText)();
            } else if (response.status === 404) {
                alert('فشل تحميل الكود الأساسي (ملف غير موجود). يرجى التواصل مع AlGzawy.');
            } else {
                alert('فشل تحميل بوت الصقل. قد تكون هناك مشكلة في الخادم. يرجى المحاولة لاحقاً.');
            }
        },
        onerror: function() {
            alert('حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن GitHub ليس محجوباً.');
        }
    });

})();
