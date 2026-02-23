// ==UserScript==
// @name         سكربت الإغارات الجماعية - غزااوي
// @namespace    Gzawy-Scripts
// @version      1.0
// @description  تحميل وتنفيذ سكربت الإغارات الجماعية
// @author       الغزااوي
// @match        https://*/*=scavenge_mass*
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    // الرابط الصحيح والدائم للكود المشفر
    const scriptUrl = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_scavenge.js';

    console.log('جاري تحميل سكربت غزااوي...' );

    GM_xmlhttpRequest({
        method: "GET",
        url: scriptUrl,
        onload: function(response ) {
            if (response.status === 200) {
                console.log('تم التحميل بنجاح، جاري التشغيل...');
                // يقوم بتشغيل الكود المشفر الذي تم تحميله
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
