// ==UserScript==
// @name         AlGzawy - Scavenge Bot Core
// @version      2.0
// @description  Automation script for AlGzawy's Scavenge Bot. Not meant for direct installation.
// @author       AlGzawy
// ==/UserScript==

// This script is not meant to be run directly. It is loaded by the loader.
(function() {
    'use strict';

    // --- الإعدادات ---
    const QUICKBAR_SCRIPT_NAME = "أغارات- AlG"; // هذا هو الاسم الذي ستبحث عنه في البار السريع
    const CLICK_INTERVAL_MS = 1050;
    const MIN_RELOAD_MINUTES = 15;
    const MAX_RELOAD_MINUTES = 25;
    // -------------------

    /**
     * Searches for a quickbar link by its exact text content and clicks it.
     */
    function findAndClickQuickbarLink() {
        console.log(`[BOT] Searching for quickbar link with text: "${QUICKBAR_SCRIPT_NAME}"`);
        const links = document.querySelectorAll('a.quickbar_link');
        for (const link of links) {
            if (link.textContent.trim() === QUICKBAR_SCRIPT_NAME) {
                console.log("[BOT] Found the link! Clicking to inject the UI script.");
                link.click();
                return true;
            }
        }
        console.error(`[BOT] Quickbar link named "${QUICKBAR_SCRIPT_NAME}" not found!`);
        alert(`[BOT] لم يتم العثور على سكربت بالاسم "${QUICKBAR_SCRIPT_NAME}" في البار السريع! تأكد من أن الاسم متطابق تماماً.`);
        return false;
    }

    /**
     * Waits for an element to be visible and then clicks it.
     * @param {string} selector - The CSS selector for the element.
     * @param {string} description - A description for logging purposes.
     * @param {number} timeout - Max time to wait in milliseconds.
     */
    function waitAndClick(selector, description, timeout = 15000) {
        return new Promise((resolve, reject) => {
            console.log(`[BOT] Waiting for button: "${description}" (${selector})`);
            const startTime = Date.now();
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                // Check if the element exists and is visible
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
     * The main automation chain.
     */
    async function startAutomationChain() {
        // Step 1: Find and click the quickbar link to load the UI
        if (!findAndClickQuickbarLink()) {
            return; // Stop if the link isn't found
        }

        // Wait for the UI to be built by the injected script
        // A short delay is needed for the DOM to update after the click.
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            console.log("[BOT] Automation chain started. Waiting for UI elements.");
            
            // Step 2: Click "Calculate Runtimes"
            await waitAndClick('#sendMass', "حساب المدة");

            // Wait for the next UI to appear
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 3: Click "Start Group 1"
            await waitAndClick('#sendMass', "تشغيل المجموعة");

            // Wait for the final sending loop
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 4: Start the final clicking loop
            console.log("[BOT] Starting final attack sending loop.");
            (function startFinalClickingLoop() {
                const sendButton = document.querySelector('#massScavengeFinal #sendMass');
                if (sendButton && sendButton.offsetParent !== null) {
                    console.log(`[BOT] Sending an attack...`);
                    sendButton.click();
                    // Continue the loop as long as the button exists
                    setTimeout(startFinalClickingLoop, CLICK_INTERVAL_MS + Math.random() * 400);
                } else {
                    console.log("[BOT] All attacks have been sent. Loop stopped.");
                    // Once all attacks are sent, schedule the page reload.
                    schedulePageReload();
                }
            })();

        } catch (error) {
            console.error("[BOT] A fatal error occurred during the automation chain:", error.message);
            alert(`[BOT] حدث خطأ فادح: ${error.message}. سيتم إعادة تحميل الصفحة للمحاولة مرة أخرى.`);
            setTimeout(() => location.reload(), 5000);
        }
    }

    /**
     * Schedules the page to reload after a random interval.
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

    // --- Main Execution ---
    console.log("[BOT] AlGzawy Scavenge Bot (Automation Core) is running.");
    // We wait for the full page to load before starting anything.
    window.addEventListener('load', startAutomationChain);

})();
