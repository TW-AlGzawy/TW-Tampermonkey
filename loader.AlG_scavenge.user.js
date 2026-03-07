// ==UserScript==
// @name         AlGzawy - Scavenge Loader (v5.0 - No Quickbar)
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Loads UI from GitHub and runs automation directly. NO QUICKBAR NEEDED.
// @author       AlGzawy
// @match        https://*/*=scavenge_mass*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @resource     ALG_UI_ORIGINAL https://raw.githubusercontent.com/TW-AlGzawy/TW-Tampermonkey/main/AlG_scavenge.original.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function( ) {
    'use strict';

    console.log("[LOADER v5.0] Starting Direct-Execution Loader. No quickbar needed.");

    // --- Part 1: Inject the UI Script from GitHub ---
    const uiScriptText = GM_getResourceText("ALG_UI_ORIGINAL");
    if (!uiScriptText) {
        alert("فشل تحميل سكربت الواجهة من GitHub. تأكد من اتصالك بالإنترنت.");
        return;
    }
    
    // Create a script element to run the UI code
    const uiScriptElement = document.createElement('script');
    uiScriptElement.textContent = `(function($){ ${uiScriptText} })(jQuery);`;
    document.head.appendChild(uiScriptElement);
    console.log("[LOADER] UI script has been injected and executed.");

    // --- Part 2: The Automation Bot (integrated directly) ---
    
    // Settings for the automation
    const CLICK_INTERVAL_MS = 1050;
    const MIN_RELOAD_MINUTES = 15;
    const MAX_RELOAD_MINUTES = 25;

    /**
     * Waits for an element to be visible and then clicks it.
     */
    function waitAndClick(selector, description, timeout = 15000) {
        return new Promise((resolve, reject) => {
            console.log(`[BOT] Waiting for: "${description}" (${selector})`);
            const startTime = Date.now();
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                if (element && element.offsetParent !== null) {
                    clearInterval(interval);
                    console.log(`[BOT] Found and clicking "${description}".`);
                    element.click();
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    reject(new Error(`[BOT] Timed out waiting for "${description}" (${selector})`));
                }
            }, 500);
        });
    }

    /**
     * Schedules the page to reload.
     */
    function schedulePageReload() {
        const reloadInterval = (Math.random() * (MAX_RELOAD_MINUTES - MIN_RELOAD_MINUTES) + MIN_RELOAD_MINUTES) * 60 * 1000;
        const reloadInMinutes = (reloadInterval / 60000).toFixed(2);
        console.log(`[BOT] Page reload scheduled in ${reloadInMinutes} minutes.`);
        setTimeout(() => {
            console.log("[BOT] Reloading page now...");
            location.reload();
        }, reloadInterval);
    }

    /**
     * Main automation chain.
     */
    async function startAutomation() {
        console.log("[BOT] Automation will start after a brief delay for the UI to build.");
        // Wait a moment for the injected UI script to build the DOM elements
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Step 1: Click "Calculate Runtimes"
            await waitAndClick('#sendMass', "حساب المدة");
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 2: Click "Start Group 1"
            await waitAndClick('#sendMass', "تشغيل المجموعة");
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 3: Start the final clicking loop
            console.log("[BOT] Starting final attack sending loop.");
            (function startFinalClickingLoop() {
                const sendButton = document.querySelector('#massScavengeFinal #sendMass');
                if (sendButton && sendButton.offsetParent !== null) {
                    console.log(`[BOT] Sending an attack...`);
                    sendButton.click();
                    setTimeout(startFinalClickingLoop, CLICK_INTERVAL_MS + Math.random() * 400);
                } else {
                    console.log("[BOT] All attacks have been sent. Loop stopped.");
                    schedulePageReload();
                }
            })();
        } catch (error) {
            console.error("[BOT] A fatal error occurred:", error.message);
            alert(`[BOT] حدث خطأ فادح: ${error.message}.`);
            setTimeout(() => location.reload(), 5000);
        }
    }

    // --- Main Execution ---
    // Start the automation process after the page has fully loaded.
    window.addEventListener('load', startAutomation);

})();
