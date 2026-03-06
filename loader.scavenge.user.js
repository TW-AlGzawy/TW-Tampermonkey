// ==UserScript==
// @name         AlG_scavenge- الأغارات [v1.4]
// @namespace    AlGzawy-Scripts-scavenge
// @version      1.4
// @description  سكربت يقوم بتشغيل سكربت الاغارات المشهور تلقائيا 
// @author       AlGzawy
// @match        https://*/*=scavenge_mass*
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.scavenge.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/loader.scavenge.user.js
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

   
    const scriptUrl = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_scavenge.js';

    console.log('جاري تحميل سكربت اغارات غزااوي...' );

    GM_xmlhttpRequest({
        method: "GET",
        url: scriptUrl,
        onload: function(response ) {
            if (response.status === 200) {
                console.log('تم التحميل بنجاح، جاري التشغيل...');
                
                new Function(response.responseText)();
            } else {
                console.error('فشل تحميل السكربت. الحالة:', response.status);
                alert('فشل تحميل سكربت الإغارات. يرجى التواصل مع المطور.');
            }
        },
        onerror: function(response) {
            console.error('حدث خطأ في الشبكة أثناء تحميل السكربت.');
            alert('حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن @connect يعمل بشكل صحيح.');
        }
    });
})();
