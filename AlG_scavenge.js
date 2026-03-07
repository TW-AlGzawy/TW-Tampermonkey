// AlG_scavenge.js
// © جميع الحقوق محفوظة / AlGzawy
// هذا الملف يُحمَّل تلقائياً من ملف اللودر — لا تعدّل هذا الملف مباشرة

(function () {
    'use strict';

    const SCRIPT_URL = 'https://shinko-to-kuma.com/scripts/massScavenge.js';

    // استرجاع الإعدادات المحفوظة أو استخدام القيم الافتراضية
    const settings = {
        minReload:          GM_getValue('minReload',          15),
        maxReload:          GM_getValue('maxReload',          25),
        delayUiLoad:        GM_getValue('delayUiLoad',        2000),
        delayAfterCalc:     GM_getValue('delayAfterCalc',     1500),
        delayBetweenGroups: GM_getValue('delayBetweenGroups', 1050)
    };

    // ----------------------------------------------------------------
    // دوال التشغيل
    // ----------------------------------------------------------------
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

    function schedulePageReload() {
        if (GM_getValue('isBotEnabled', true)) {
            const reloadInterval = (Math.random() * (settings.maxReload - settings.minReload) + settings.minReload) * 60 * 1000;
            const reloadInMinutes = (reloadInterval / 60000).toFixed(2);
            console.log(`[سكربت الغزاوي] تم جدولة إعادة تحميل الصفحة خلال ${reloadInMinutes} دقيقة.`);
            setTimeout(() => {
                console.log('[سكربت الغزاوي] جاري إعادة تحميل الصفحة الآن...');
                location.reload();
            }, reloadInterval);
        } else {
            console.log('[سكربت الغزاوي] البوت متوقف، لن يتم إعادة تحميل الصفحة.');
        }
    }

    function waitAndClick(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                if (!GM_getValue('isBotEnabled', true)) {
                    clearInterval(interval);
                    return reject(new Error('تم إيقاف البوت يدوياً.'));
                }
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

    // ----------------------------------------------------------------
    // نقطة البداية
    // ----------------------------------------------------------------
    async function run() {
        if (!GM_getValue('isBotEnabled', true)) {
            console.log("[سكربت الغزاوي] البوت متوقف حالياً.");
            return;
        }

        console.log('[سكربت الغزاوي] يعمل الآن.');

        try {
            await injectScript(SCRIPT_URL);
            console.log('[سكربت الغزاوي] تم تحميل الواجهة بنجاح.');

            await new Promise(resolve => setTimeout(resolve, settings.delayUiLoad));

            console.log("[سكربت الغزاوي] البحث عن زر 'حساب المدة'...");
            await waitAndClick('#sendMass');

            await new Promise(resolve => setTimeout(resolve, settings.delayAfterCalc));

            console.log("[سكربت الغزاوي] البحث عن زر 'تشغيل المجموعة'...");
            await waitAndClick('#sendMass');

            console.log('[سكربت الغزاوي] بدء حلقة الإرسال النهائية.');
            (function startFinalClickingLoop() {
                if (!GM_getValue('isBotEnabled', true)) {
                    console.log('[سكربت الغزاوي] تم إيقاف البوت يدوياً أثناء حلقة الإرسال.');
                    return;
                }
                const sendButton = document.querySelector('#sendMass');
                if (sendButton && sendButton.offsetParent !== null) {
                    sendButton.click();
                    console.log('[سكربت الغزاوي] تم إرسال هجمة...');
                    setTimeout(startFinalClickingLoop, settings.delayBetweenGroups + Math.random() * 400);
                } else {
                    console.log('[سكربت الغزاوي] اكتملت جميع الهجمات. حلقة النقر توقفت.');
                    schedulePageReload();
                }
            })();

        } catch (error) {
            if (error.message !== 'تم إيقاف البوت يدوياً.') {
                console.error('[سكربت الغزاوي] حدث خطأ فادح:', error.message);
                alert(`حدث خطأ في سكربت الإغارات: ${error.message}.`);
            } else {
                console.log('[سكربت الغزاوي] تم إيقاف سلسلة الأتمتة بنجاح.');
            }
        }
    }

    run();
})();
