// ==UserScript==
// @name         AlGzawy - بوت الصقل المطور (Loader)
// @namespace    AlGzawy-Scripts-refine-loader
// @version      1.5 // <-- الإصدار النهائي
// @description  يقوم بتحميل وتشغيل بوت الصقل المطور من AlGzawy
// @author       AlGzawy
// @match        https://*.tribalwars.ae/game.php*
// @icon         https://i.imgur.com/5p33oA9.png
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_Refine_Loader.user.js
// @downloadURL  https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_Refine_Loader.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    const SCRIPT_URL = 'https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_Refine_Core.js';

    console.log('[AlGzawy Loader] جاري تحميل بوت الصقل...' );
    GM_xmlhttpRequest({
        method: "GET",
        url: SCRIPT_URL + '?t=' + Date.now( ),
        onload: function(response) {
            if (response.status === 200) {
                console.log('[AlGzawy Loader] تم التحميل بنجاح. جاري حقن السكربت...');
                const script = document.createElement('script');
                script.textContent = response.responseText;
                document.head.appendChild(script).remove();
            } else {
                alert(`[AlGzawy Loader] فشل تحميل الكود الأساسي. كود الحالة: ${response.status}`);
            }
        },
        onerror: function() {
            alert('[AlGzawy Loader] حدث خطأ في الشبكة. تأكد من اتصالك بالإنترنت أو أن GitHub ليس محجوباً.');
        }
    });
})();
