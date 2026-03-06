// ==UserScript==
// @name         Set Arrival Time - بوت أرساليات التلقائية [v1.4]
// @namespace    AlGzawy-Scripts-scavenge
// @version      1.4
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @description  سكربت يقوم بارسال الهجمات او الدعم عنك تلقائيا بالجزء 
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_Arrival_Time.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.AlG_Arrival_Time.user.js
// @author       AlGzawy
// @match         https://*.tribalwars.pt/*confirm*
// @match         https://*.tribalwars.pt/*map*
// @match         https://*.tribalwars.ae/game.php?*
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// ==/UserScript==

(function( ) {
    'use strict';

   
    const scriptUrl = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_Set_Arrival_Time.js';

    console.log('جاري تحميل سكربت الارساليات غزااوي...' );

    GM_xmlhttpRequest({
        method: "GET",
        url: scriptUrl,
        onload: function(response ) {
            if (response.status === 200) {
                console.log('تم التحميل بنجاح، جاري التشغيل...');
                
                new Function(response.responseText)();
            } else {
                console.error('فشل تحميل السكربت. الحالة:', response.status);
                alert('فشل تحميل سكربت الإرساليات. يرجى التواصل مع المطور.');
            }
        },
        onerror: function(response) {
            console.error('حدث خطأ في الشبكة أثناء تحميل السكربت.');
            alert('حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن @connect يعمل بشكل صحيح.');
        }
    });
})();
