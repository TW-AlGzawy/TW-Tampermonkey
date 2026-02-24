// ==UserScript==
// @name         Set Arrival Time - بوت أرساليات التلقائية [v1.2]
// @namespace    AlGzawy-Scripts-scavenge
// @version      1.2
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @description  سكربت يقوم بارسال الهجمات او الدعم عنك تلقائيا بالجزء 
// @author       AlGzawy
// @match         https://*.tribalwars.pt/*confirm*
// @match         https://*.tribalwars.pt/*map*
// @match         https://*.tribalwars.ae/game.php?*
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
