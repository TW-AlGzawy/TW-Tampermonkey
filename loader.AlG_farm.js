// ==UserScript==
// @name         Farm Bot Loader by AlGzawy
// @namespace    AlGzawy-Scripts-farm
// @version      3.0
// @description  يقوم بتحميل وتشغيل سكربت النهب التلقائي مع إمكانية اختيار القالب
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php?*screen=am_farm*
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    // --- الإعدادات ---
    let savedTemplate = GM_getValue('farmTemplate', 'A');
    GM_registerMenuCommand(`تغيير قالب النهب (الحالي: ${savedTemplate})`, () => {
        let newTemplate = prompt("اختر قالب النهب: A, B, or C", savedTemplate);
        if (newTemplate && ['A', 'B', 'C'].includes(newTemplate.toUpperCase())) {
            GM_setValue('farmTemplate', newTemplate.toUpperCase());
            alert(`تم تغيير القالب إلى ${newTemplate.toUpperCase()}. سيتم تطبيق التغيير عند تحديث الصفحة.`);
            location.reload();
        } else {
            alert("إدخال غير صالح. الرجاء اختيار A, B, أو C.");
        }
    });

    // --- تحميل السكربت الخارجي ---
    const scriptUrl = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_farm.js';

    GM_xmlhttpRequest({
        method: "GET",
        url: scriptUrl + '?t=' + Date.now( ), // لمنع تخزين النسخة القديمة
        onload: function(response) {
            if (response.status === 200) {
                console.log('[AlGzawy] تم تحميل السكربت بنجاح، جاري التشغيل...');
                // تمرير الإعدادات و jQuery إلى الكود الخارجي
                let runExternalCode = new Function('$', 'settings', response.responseText);
                runExternalCode(unsafeWindow.jQuery, { template: savedTemplate });
            } else {
                alert('فشل تحميل سكربت النهب. يرجى التواصل مع المطور.');
            }
        },
        onerror: function() {
            alert('حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت.');
        }
    });
})();
