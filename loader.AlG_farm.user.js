// ==UserScript==
// @name         AlGzawy-Farm Bot-النهب
// @namespace    AlGzawy-Scripts-farm-loader
// @version      2.3
// @description  يقوم بتحميل وتشغيل بوت النهب الآمن من AlGzawy
// @author       AlGzawy
// @include      https://*.tribalwars.*/game.php?*screen=am_farm*
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_farm.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_farm.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_farm.js';
    const CURRENT_VERSION = GM_info.script.version;
    const UPDATE_URL = GM_info.script.updateURL;

    function checkForUpdates() {
        var btn = document.getElementById('check-update-btn');
        btn.textContent = 'جاري البحث...';
        GM_xmlhttpRequest({
            method: 'GET',
            url: UPDATE_URL + '?t=' + Date.now(),
            onload: function (res) {
                if (res.status === 200) {
                    var match = res.responseText.match(/@version\s+([0-9.]+)/);
                    if (match && match[1] > CURRENT_VERSION) {
                        alert('تحديث مطلوب!\n\nالإصدار الحالي: ' + CURRENT_VERSION + '\nالإصدار الجديد: ' + match[1] + '\n\nالرجاء تحديث السكربت.');
                        btn.textContent = 'يوجد تحديث!';
                        btn.style.color = 'red';
                    } else {
                        alert('أنت تستخدم أحدث إصدار.');
                        btn.textContent = 'تحقق من التحديثات';
                    }
                }
            },
            onerror: function () {
                alert('خطأ في الشبكة.');
                btn.textContent = 'تحقق من التحديثات';
            }
        });
    }

    var observer = new MutationObserver(function (mutations, obs) {
        var body = document.querySelector('#alg-farm-body');
        if (body) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:8px;border-top:1px solid #c1a264;padding-top:8px;';
            row.innerHTML = '<button id="check-update-btn" style="background:none;border:none;color:#007bff;cursor:pointer;text-decoration:underline;padding:0;font-size:11px;">تحقق من التحديثات</button><span style="font-size:10px;color:#542e0a;">v' + CURRENT_VERSION + '</span>';
            body.appendChild(row);
            document.getElementById('check-update-btn').addEventListener('click', checkForUpdates);
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[AlGzawy Farm Loader] جاري تحميل البوت...');
    GM_xmlhttpRequest({
        method: 'GET',
        url: SCRIPT_URL + '?t=' + Date.now(),
        onload: function (res) {
            if (res.status === 200) {
                console.log('[AlGzawy Farm Loader] تم التحميل. جاري التشغيل...');
                eval(res.responseText);
            } else if (res.status === 404) {
                alert('تم إيقاف البوت من قبل المطور.');
            } else {
                alert('فشل تحميل البوت. كود الحالة: ' + res.status);
            }
        },
        onerror: function () {
            alert('خطأ في الشبكة. تأكد من اتصالك بالإنترنت.');
        }
    });

})();
