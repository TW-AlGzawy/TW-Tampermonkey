// ==UserScript==
// @name         AlGzawy - بوت الاغارات (الإصدار 9.0 للتجربة)
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  بوت إغارات احترافي مع لوحة تحكم عائمة لحفظ الإعدادات والتحكم الكامل.
// @author       AlGzawy (تم التطوير بواسطة Manus )
// @match        https://*/*=scavenge_mass*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function( ) {
    'use strict';

    // --- الإعدادات الافتراضية ---
    const SCRIPT_URL = 'https://shinko-to-kuma.com/scripts/massScavenge.js';
    const VERSION = '9.0';
    // هام: استبدل هذا الرابط برابط مستودعك على GitHub لاحقاً
    const UPDATE_URL = 'https://github.com/TW-AlGzawy/TW-Tampermonkey';

    // --- تحميل الإعدادات المحفوظة أو استخدام القيم الافتراضية ---
    let config = {
        botEnabled: GM_getValue('botEnabled', false ),
        minReload: GM_getValue('minReload', 15),
        maxReload: GM_getValue('maxReload', 25),
        clickInterval: GM_getValue('clickInterval', 1050)
    };

    let isRunning = false; // متغير لتتبع ما إذا كانت عملية الإرسال تعمل حالياً

    // --- بناء لوحة التحكم (HTML) ---
    const panelHTML = `
        <div id="alg-panel" class="draggable">
            <div id="alg-header">
                <span id="alg-title">AlGzawy - بوت الاغارات</span>
                <span id="alg-toggle">-</span>
            </div>
            <div id="alg-content">
                <div class="alg-row">
                    <label>إعادة التحميل (min):</label>
                    <input type="number" id="alg-min-reload" class="alg-input" value="${config.minReload}">
                </div>
                <div class="alg-row">
                    <label>إعادة التحميل (max):</label>
                    <input type="number" id="alg-max-reload" class="alg-input" value="${config.maxReload}">
                </div>
                <div class="alg-row">
                    <label>الفاصل بين النقرات (ms):</label>
                    <input type="number" id="alg-click-interval" class="alg-input" value="${config.clickInterval}">
                </div>
                <div class="alg-buttons">
                    <button id="alg-save" class="btn">حفظ الإعدادات</button>
                    <button id="alg-toggle-bot" class="btn">${config.botEnabled ? 'إيقاف البوت' : 'تشغيل البوت'}</button>
                </div>
                <div id="alg-footer">
                    <span>الإصدار: ${VERSION}</span>
                    <a href="${UPDATE_URL}" target="_blank">التحقق من التحديثات</a>
                    <span>© جميع الحقوق محفوظة - AlGzawy</span>
                </div>
            </div>
        </div>
    `;

    // --- إضافة الأنماط (CSS) للوحة التحكم ---
    GM_addStyle(`
        #alg-panel { position: fixed; top: 150px; left: 10px; z-index: 9999; background-color: #f4e4bc; border: 2px solid #804000; border-radius: 5px; color: #603000; font-family: "Verdana", "Arial", sans-serif; }
        #alg-header { padding: 5px 10px; background-color: #c1a264; cursor: move; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #804000; }
        #alg-title { font-weight: bold; }
        #alg-toggle { cursor: pointer; font-weight: bold; font-size: 20px; }
        #alg-content { padding: 10px; display: ${GM_getValue('panelMinimized', false) ? 'none' : 'block'}; }
        .alg-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .alg-row label { margin-right: 10px; font-size: 12px; }
        .alg-input { width: 60px; text-align: center; border: 1px solid #804000; background-color: #fff5e1; }
        .alg-buttons { display: flex; justify-content: space-around; margin-top: 10px; }
        #alg-save { background-color: #3a72c2; color: white; }
        #alg-toggle-bot { background-color: ${config.botEnabled ? '#e53935' : '#43a047'}; color: white; }
        #alg-footer { border-top: 1px solid #c1a264; margin-top: 10px; padding-top: 5px; text-align: center; font-size: 10px; }
        #alg-footer span, #alg-footer a { margin: 0 5px; }
    `);

    // --- إضافة اللوحة إلى الصفحة ---
    document.body.insertAdjacentHTML('beforeend', panelHTML);

    // --- وظائف لوحة التحكم ---
    const minReloadInput = document.getElementById('alg-min-reload');
    const maxReloadInput = document.getElementById('alg-max-reload');
    const clickIntervalInput = document.getElementById('alg-click-interval');
    const saveButton = document.getElementById('alg-save');
    const toggleBotButton = document.getElementById('alg-toggle-bot');
    const togglePanelButton = document.getElementById('alg-toggle');
    const panelContent = document.getElementById('alg-content');

    saveButton.addEventListener('click', () => {
        config.minReload = parseInt(minReloadInput.value, 10);
        config.maxReload = parseInt(maxReloadInput.value, 10);
        config.clickInterval = parseInt(clickIntervalInput.value, 10);
        GM_setValue('minReload', config.minReload);
        GM_setValue('maxReload', config.maxReload);
        GM_setValue('clickInterval', config.clickInterval);
        alert('تم حفظ الإعدادات بنجاح!');
    });

    toggleBotButton.addEventListener('click', () => {
        config.botEnabled = !config.botEnabled;
        GM_setValue('botEnabled', config.botEnabled);
        alert(config.botEnabled ? 'تم تشغيل البوت. سيبدأ العمل عند إعادة تحميل الصفحة.' : 'تم إيقاف البوت. لن يعمل عند إعادة التحميل.');
        location.reload();
    });

    togglePanelButton.addEventListener('click', () => {
        const isMinimized = panelContent.style.display === 'none';
        panelContent.style.display = isMinimized ? 'block' : 'none';
        togglePanelButton.textContent = isMinimized ? '-' : '+';
        GM_setValue('panelMinimized', !isMinimized);
    });

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
        function dragMouseDown(e) { e = e || window.event; e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmouseup = closeDragElement; document.onmousemove = elementDrag; }
        function elementDrag(e) { e = e || window.event; e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"; }
        function closeDragElement() { document.onmouseup = null; document.onmousemove = null; }
    }
    dragElement(document.getElementById("alg-panel"));

    // --- المنطق الأساسي للبوت ---
    async function mainBotLogic() {
        if (!config.botEnabled || isRunning) return;
        isRunning = true;
        console.log("[AlGzawy Bot] البوت يعمل...");
        try {
            await injectScript(SCRIPT_URL);
            console.log("[AlGzawy Bot] تم تحميل الواجهة.");
            await waitAndClick('#sendMass');
            await new Promise(resolve => setTimeout(resolve, 1500));
            await waitAndClick('#sendMass');
            await new Promise(resolve => setTimeout(resolve, 1500));
            startFinalClickingLoop();
        } catch (error) {
            console.error("[AlGzawy Bot] خطأ:", error.message);
            schedulePageReload(5000);
            return;
        }
        schedulePageReload();
    }

    // --- دوال المساعدة للبوت (كاملة) ---
    function injectScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function waitAndClick(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                if (element && element.offsetParent !== null) {
                    clearInterval(interval);
                    console.log(`[AlGzawy Bot] تم العثور على "${selector}"، جاري النقر...`);
                    element.click();
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    reject(new Error(`فشل العثور على العنصر المرئي: ${selector} خلال ${timeout}ms`));
                }
            }, 500);
        });
    }

    function startFinalClickingLoop() {
        console.log("[AlGzawy Bot] بدء حلقة الإرسال النهائية.");
        (function clickLoop() {
            const sendButton = document.querySelector('#sendMass');
            if (sendButton && sendButton.offsetParent !== null) {
                sendButton.click();
                console.log(`[AlGzawy Bot] تم إرسال هجمة...`);
                setTimeout(clickLoop, config.clickInterval + Math.random() * 400);
            } else {
                console.log("[AlGzawy Bot] اكتملت جميع الهجمات.");
            }
        })();
    }

    function schedulePageReload(fixedTime) {
        let reloadInterval;
        if (fixedTime) {
            reloadInterval = fixedTime;
        } else {
            reloadInterval = (Math.random() * (config.maxReload - config.minReload) + config.minReload) * 60 * 1000;
        }
        const reloadInMinutes = (reloadInterval / 60000).toFixed(2);
        console.log(`[AlGzawy Bot] جدولة إعادة التحميل خلال ${reloadInMinutes} دقيقة.`);
        setTimeout(() => location.reload(), reloadInterval);
    }

    // --- بدء التنفيذ ---
    window.addEventListener('load', mainBotLogic);
})();
