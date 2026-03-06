// ==UserScript==
// @name        Farm_bot_algzawy
// @namespace    AlGzawy-Scripts-farm
// @version      1.1
// @description  سكربت يقوم بالنهب بمساعد النهب بشكل تلقائي
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php?*
// @connect      raw.githubusercontent.com
// @icon  https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';
/*
A = 8
B = 9
C = 10
*/
var type = 8;
var speed = Math.random() * 20000 + 35000;
   
    const scriptUrl = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_farm.js';

    console.log('جاري تحميل سكربت النهب غزااوي...' );

    GM_xmlhttpRequest({
        method: "GET",
        url: scriptUrl,
        onload: function(response ) {
            if (response.status === 200) {
                console.log('تم التحميل بنجاح، جاري التشغيل...');
                
                new Function(response.responseText)();
            } else {
                console.error('فشل تحميل السكربت. الحالة:', response.status);
                alert('فشل تحميل سكربت النهب. يرجى التواصل مع المطور.');
            }
        },
        onerror: function(response) {
            console.error('حدث خطأ في الشبكة أثناء تحميل السكربت.');
            alert('حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن @connect يعمل بشكل صحيح.');
        }
    });
})();
