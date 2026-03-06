// ==UserScript==
// @name         Farm_bot_algzawy (Loader)
// @namespace    AlGzawy-Scripts-farm
// @version      1.3
// @description  سكربت يقوم بالنهب بمساعد النهب بشكل تلقائي مع إمكانية اختيار القالب
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php?*
// @connect      raw.githubusercontent.com
// @icon         https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    // --- منطقة الإعدادات ---
    // جلب القالب المحفوظ، وإذا لم يوجد، استخدم القالب 'A' كقيمة افتراضية
    let savedTemplate = GM_getValue('farmTemplate', 'A');

    // تسجيل أمر في قائمة Tampermonkey لتغيير الإعدادات
    GM_registerMenuCommand(`تغيير قالب النهب (الحالي: ${savedTemplate})`, () => {
        let newTemplate = prompt("اختر قالب النهب: A, B, or C", savedTemplate);
        if (newTemplate && ['A', 'B', 'C'].includes(newTemplate.toUpperCase())) {
            GM_setValue('farmTemplate', newTemplate.toUpperCase());
            alert(`تم تغيير القالب إلى ${newTemplate.toUpperCase()}. الرجاء تحديث الصفحة لتطبيق التغيير.`);
            location.reload(); // إعادة تحميل الصفحة لتطبيق الإعدادات الجديدة
        } else {
            alert("إدخال غير صالح. الرجاء اختيار A, B, أو C.");
        }
    });

    // --- منطقة تحميل السكربت ---
    const scriptUrl = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_farm.js';
    console.log('جاري تحميل سكربت النهب غزااوي...' );

    GM_xmlhttpRequest({
        method: "GET",
        url: scriptUrl + '?t=' + Date.now( ), // لمنع التخزين المؤقت
        onload: function(response) {
            if (response.status === 200) {
                console.log('تم التحميل بنجاح، جاري التشغيل...');
                // تمرير الإعدادات إلى السكربت الذي تم تحميله
                // نمرر الدالة كمعامل يحتوي على الإعدادات
                new Function('settings', response.responseText)({
                    template: savedTemplate
                });
            } else {
                console.error('فشل تحميل السكربت. الحالة:', response.status);
                alert('فشل تحميل سكربت النهب. يرجى التواصل مع المطور.');
            }
        },
        onerror: function(response) {
            console.error('حدث خطأ في الشبكة أثناء تحميل السكربت.', response);
            alert('حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن @connect يعمل بشكل صحيح.');
        }
    });
})();
