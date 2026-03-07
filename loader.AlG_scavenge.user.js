// ==UserScript==
// @name         AlGzawy - Scavenge Bot Loader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  يقوم بتحميل وتشغيل بوت الإغارات الخاص بـ AlGzawy
// @author       AlGzawy
// @match        https://*/*=scavenge_mass*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    // ====================================================================================
    // هام جداً: استبدل هذا الرابط بالرابط الخام الحقيقي للكود المشفر على GitHub
    // ====================================================================================
    const SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/YOUR-OBFUSCATED-FILE-NAME.js';

    fetch(SCRIPT_URL )
        .then(response => {
            if (!response.ok) {
                throw new Error(`فشل تحميل السكربت من الشبكة: ${response.statusText}`);
            }
            return response.text();
        })
        .then(text => {
            // يقوم بتشغيل الكود الذي تم تحميله من GitHub
            new Function(text)();
            console.log('تم تحميل بوت الغزاوي بنجاح.');
        })
        .catch(error => {
            console.error('فشل تحميل بوت الغزاوي:', error);
            alert('حدث خطأ أثناء تحميل بوت الإغارات. يرجى التأكد من اتصالك بالإنترنت وتحديث الصفحة.');
        });
})();
