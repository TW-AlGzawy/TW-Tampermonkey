(function ($, SETTINGS) {
    'use strict';

    // --- الإعدادات يتم استقبالها الآن من اللودر ---
    const MIN_RELOAD_MINUTES = SETTINGS.minReload;
    const MAX_RELOAD_MINUTES = SETTINGS.maxReload;
    const CLICK_INTERVAL_MS = SETTINGS.clickInterval;
    const SCRIPT_URL = 'https://shinko-to-kuma.com/scripts/massScavenge.js';
    // -------------------

    function injectScript(url ) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function schedulePageReload() {
        const reloadInterval = (Math.random() * (MAX_RELOAD_MINUTES - MIN_RELOAD_MINUTES) + MIN_RELOAD_MINUTES) * 60 * 1000;
        const reloadInMinutes = (reloadInterval / 60000).toFixed(2);
        console.log(`[سكربت الغزاوي] تم جدولة إعادة تحميل الصفحة خلال ${reloadInMinutes} دقيقة.`);
        setTimeout(() => {
            console.log("[سكربت الغزاوي] جاري إعادة تحميل الصفحة الآن...");
            location.reload();
        }, reloadInterval);
    }

    function waitAndClick(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                if (element && element.offsetParent !== null) {
                    clearInterval(interval);
                    console.log(`[سكربت الغزاوي] تم العثور على "${selector}"، جاري النقر...`);
                    element.click();
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    reject(new Error(`فشل العثور على العنصر المرئي: ${selector} خلال ${timeout}ms`));
                }
            }, 500);
        });
    }

    $(window).on('load', async () => {
        if (!SETTINGS.botEnabled) {
            console.log("[سكربت الغزاوي] البوت متوقف من لوحة التحكم.");
            return;
        }

        console.log("[سكربت الغزاوي] الإصدار المحمل يعمل.");
        try {
            await injectScript(SCRIPT_URL);
            console.log("[سكربت الغزاوي] تم تحميل الواجهة بنجاح.");
            console.log("[سكربت الغزاوي] الخطوة 2: البحث عن زر 'حساب المدة'...");
            await waitAndClick('#sendMass');
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log("[سكربت الغزاوي] الخطوة 3: البحث عن زر 'تشغيل المجموعة'...");
            await waitAndClick('#sendMass');
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log("[سكربت الغزاوي] الخطوة 4: بدء حلقة الإرسال النهائية.");
            (function startFinalClickingLoop() {
                const sendButton = document.querySelector('#sendMass');
                if (sendButton && sendButton.offsetParent !== null) {
                    sendButton.click();
                    console.log(`[سكربت الغزاوي] تم إرسال هجمة...`);
                    setTimeout(startFinalClickingLoop, CLICK_INTERVAL_MS + Math.random() * 400);
                } else {
                    console.log("[سكربت الغزاوي] اكتملت جميع الهجمات. حلقة النقر توقفت.");
                }
            })();
        } catch (error) {
            console.error("[سكربت الغزاوي] حدث خطأ فادح أثناء سلسلة الأتمتة:", error.message);
            alert(`حدث خطأ في سكربت الإغارات: ${error.message}. سيتم إعادة تحميل الصفحة للمحاولة مرة أخرى.`);
            setTimeout(() => location.reload(), 5000);
            return;
        }
        schedulePageReload();
    });

})(window.jQuery, window.ALGZAWY_SETTINGS);
