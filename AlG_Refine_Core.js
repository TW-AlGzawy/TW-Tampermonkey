(function(SETTINGS) { 
    'use strict';
    let currentTimeoutId = null;
    let isBotActive = SETTINGS.isRunning;
    let audioEnabled = false;
    let detectionAudio = new Audio('https://cdn.freesound.org/previews/441/441089_8691539-lq.mp3' );

    function createSettingsPanel() {
        const currentSettings = SETTINGS;
        const panelHTML = `
            <div id="algzawy-refine-panel" style="position: fixed; top: ${currentSettings.panelTop}; left: ${currentSettings.panelLeft}; z-index: 9998; background-color: #f4e4bc; border: 2px solid #7d510f; border-radius: 8px; font-family: 'Trebuchet MS', sans-serif; width: 280px; direction: rtl;">
                <div id="algzawy-refine-header" style="background-color: #c1a264; padding: 8px; cursor: move; border-radius: 6px 6px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <div id="refine-panel-controls" style="cursor: pointer; order: 1;"><span id="refine-minimize-btn" title="تصغير"><b>—</b></span><span id="refine-maximize-btn" title="تكبير" style="display:none;"><b>□</b></span></div>
                    <h4 style="margin: 0; color: #542e0a; font-size: 14px; order: 2;">بوت الصقل - AlGzawy</h4>
                </div>
                <div id="algzawy-refine-body" style="padding: 10px;">
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px 12px; align-items: center;">
                        <div style="display: flex; gap: 15px;"><label><input type="checkbox" id="step-market"> السوق</label><label><input type="checkbox" id="step-academy"> الأكاديمية</label></div><label>:الخطوات</label>
                        <div style="display: flex; gap: 5px;"><input type="number" id="max-delay" style="width: 100%; text-align: center;"><input type="number" id="min-delay" style="width: 100%; text-align: center;"></div><label>:(ms) بين الخطوات</label>
                        <div style="display: flex; gap: 5px;"><input type="number" id="max-retry" style="width: 100%; text-align: center;"><input type="number" id="min-retry" style="width: 100%; text-align: center;"></div><label>:(ms) إعادة محاولة</label>
                        <div style="border-top: 1px solid #c1a264; grid-column: 1 / -1; padding-top: 8px; margin-top: 5px;"></div>
                        <input type="number" id="market-interval" style="width: 100%; text-align: center;"><label>:(min) فاصل السوق</label>
                        <label style="grid-column: 1 / -1; display: flex; align-items: center;"><input type="checkbox" id="schedule-market" style="margin-left: 8px;">تفعيل الجدولة للسوق فقط</label>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button id="toggle-run-btn" style="flex-grow: 1; padding: 8px; border: none; color: white; border-radius: 5px; cursor: pointer;"></button>
                        <button id="save-settings-btn" style="padding: 8px 12px; background-color: #007bff; border: none; color: white; border-radius: 5px; cursor: pointer;">حفظ</button>
                    </div>
                    <!-- سيتم إضافة زر التحقق من التحديثات من خلال اللودر -->
                </div>
            </div>
        `;
        $('body').append(panelHTML);

        $('#step-market').prop('checked', currentSettings.stepMarket);
        $('#step-academy').prop('checked', currentSettings.stepAcademy);
        $('#schedule-market').prop('checked', currentSettings.scheduleMarket);
        $('#market-interval').val(currentSettings.marketInterval);
        $('#min-delay').val(currentSettings.minDelay);
        $('#max-delay').val(currentSettings.maxDelay);
        $('#min-retry').val(currentSettings.minRetry);
        $('#max-retry').val(currentSettings.maxRetry);

        $("#algzawy-refine-panel").draggable({ handle: "#algzawy-refine-header", stop: (e, ui) => {
            SETTINGS.save('panelTop', ui.position.top + 'px');
            SETTINGS.save('panelLeft', ui.position.left + 'px');
        }});
        $('#refine-minimize-btn').on('click', () => { $('#algzawy-refine-body').slideUp(); $('#refine-minimize-btn').hide(); $('#refine-maximize-btn').show(); });
        $('#refine-maximize-btn').on('click', () => { $('#algzawy-refine-body').slideDown(); $('#refine-maximize-btn').hide(); $('#refine-minimize-btn').show(); });

        $('#save-settings-btn').on('click', function() {
            SETTINGS.save('stepMarket', $('#step-market').is(':checked'));
            SETTINGS.save('stepAcademy', $('#step-academy').is(':checked'));
            SETTINGS.save('scheduleMarket', $('#schedule-market').is(':checked'));
            SETTINGS.save('marketInterval', parseInt($('#market-interval').val()));
            SETTINGS.save('minDelay', parseInt($('#min-delay').val()));
            SETTINGS.save('maxDelay', parseInt($('#max-delay').val()));
            SETTINGS.save('minRetry', parseInt($('#min-retry').val()));
            SETTINGS.save('maxRetry', parseInt($('#max-retry').val()));
            alert('تم حفظ الإعدادات. يرجى تحديث الصفحة لتطبيق التغييرات.');
        });

        $('#toggle-run-btn').on('click', function() {
            isBotActive = !isBotActive;
            SETTINGS.save('isRunning', isBotActive);
            updateToggleButton();
            if (isBotActive) { console.log("[AlGzawy] تم تشغيل بوت الصقل يدوياً."); main(); }
            else { console.log("[AlGzawy] تم إيقاف بوت الصقل يدوياً."); clearTimeout(currentTimeoutId); }
        });
    }

    function updateToggleButton() {
        const btn = $('#toggle-run-btn');
        if (isBotActive) { btn.text('إيقاف').css('background-color', '#dc3545'); }
        else { btn.text('بدء').css('background-color', '#28a745'); }
    }

    const getNumberInRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    function detectBotDetection() {
        if ($('#botprotection_quest').length > 0 || $('.bot-protection-row').length > 0) {
            console.warn('🚨 BOT PROTECTION DETECTED!');
            if (audioEnabled) { detectionAudio.play().catch(e => {}); }
            if (Notification.permission === 'granted') { new Notification('🚨 BOT PROTECTION DETECTED!'); }
            return true;
        }
        return false;
    }

    async function market() {
        console.log("Executing market step...");
        $('#checkbox_wood, #checkbox_stone, #checkbox_iron').prop('checked', true);
        await new Promise(r => setTimeout(r, getNumberInRange(100, 300)));
        const selectAllButton = $('input.select-all').get(0);
        if (!selectAllButton) { console.warn("Select all button not found."); return true; }
        selectAllButton.click();
        await new Promise(r => setTimeout(r, getNumberInRange(500, 1200)));
        const submitButton = $('form[name="call-resources"] input.btn[type="submit"]').get(0);
        if (!submitButton) { console.warn("Submit button not found"); return false; }
        submitButton.click();
        console.log("Market step completed.");
        return true;
    }

    async function academy() {
        console.log("Executing academy step...");
        const coinsButton = $("#coin_mint_fill_max").get(0);
        if (!coinsButton) { console.warn("Coins button not found - skipping"); return true; }
        coinsButton.click();
        await new Promise(r => setTimeout(r, getNumberInRange(100, 1500)));
        const submitButton = $("input.btn.btn-default").get(0);
        if (submitButton) { submitButton.click(); }
        return true;
    }

    async function main() {
        if (!isBotActive) return;
        if (detectBotDetection()) { console.log("Bot detection found, stopping script"); return; }

        const currentSettings = SETTINGS;
        const steps = [
            { id: 'market', enabled: currentSettings.stepMarket, uri: 'screen=market&mode=call', func: market },
            { id: 'academy', enabled: currentSettings.stepAcademy, uri: 'screen=snob', func: academy }
        ];
        const enabledSteps = steps.filter(s => s.enabled);
        if (enabledSteps.length === 0) { console.log("No steps enabled."); return; }

        const currentStep = enabledSteps.find(s => location.href.includes(s.uri));
        const marketURL = `${location.origin}/game.php?village=${game_data.village.id}&screen=market&mode=call`;
        const academyURL = `${location.origin}/game.php?village=${game_data.village.id}&screen=snob`;

        if (currentSettings.scheduleMarket && currentSettings.stepMarket) {
            const lastRun = SETTINGS.lastMarketRun || 0;
            const interval = currentSettings.marketInterval * 60 * 1000;
            const timeToRunMarket = (Date.now() - lastRun) > interval;

            if (timeToRunMarket) {
                if (location.href.includes('screen=market&mode=call')) {
                    const success = await market();
                    if (success) {
                        SETTINGS.save('lastMarketRun', Date.now());
                        console.log(`Market step done. Next run in ~${currentSettings.marketInterval} minutes.`);
                        if (currentSettings.stepAcademy) {
                            currentTimeoutId = setTimeout(() => location.replace(academyURL), getNumberInRange(currentSettings.minDelay, currentSettings.maxDelay));
                        }
                    } else {
                        currentTimeoutId = setTimeout(main, getNumberInRange(currentSettings.minRetry, currentSettings.maxRetry));
                    }
                } else {
                    console.log("Time to run market. Navigating to market...");
                    location.replace(marketURL);
                }
            } else {
                if (currentSettings.stepAcademy) {
                    if (location.href.includes('screen=snob')) {
                        await academy();
                        currentTimeoutId = setTimeout(() => location.reload(), getNumberInRange(currentSettings.minDelay, currentSettings.maxDelay));
                    } else {
                        location.replace(academyURL);
                    }
                } else {
                     const remainingTime = Math.round((interval - (Date.now() - lastRun)) / 1000 / 60);
                     console.log(`Market is scheduled, but it's not time yet. Next run in ${remainingTime} minutes. No other steps enabled. Waiting...`);
                }
            }
        } else {
            if (currentStep) {
                const success = await currentStep.func();
                if (success) {
                    const delay = getNumberInRange(currentSettings.minDelay, currentSettings.maxDelay);
                    currentTimeoutId = setTimeout(() => {
                        const currentIndex = enabledSteps.findIndex(s => s.id === currentStep.id);
                        const nextStep = enabledSteps[(currentIndex + 1) % enabledSteps.length];
                        const nextURL = nextStep.id === 'market' ? marketURL : academyURL;
                        location.replace(nextURL);
                    }, delay);
                } else {
                    currentTimeoutId = setTimeout(main, getNumberInRange(currentSettings.minRetry, currentSettings.maxRetry));
                }
            } else {
                location.replace(enabledSteps[0].id === 'market' ? marketURL : academyURL);
            }
        }
    }

    function init() {
        if (location.href.includes('screen=market&mode=call') || location.href.includes('screen=snob')) {
            $(document).one('click', () => {
                detectionAudio.play().then(() => { audioEnabled = true; detectionAudio.pause(); detectionAudio.currentTime = 0; }).catch(e => {});
            });
            if (Notification.permission === 'default') { Notification.requestPermission(); }

            createSettingsPanel();
            updateToggleButton();
            if (isBotActive) {
                setTimeout(main, getNumberInRange(1000, 4000));
            }
        }
    }

    init();

})(unsafeWindow.ALGZAWY_SETTINGS); // <-- لاحظ أننا نمرر الإعدادات هنا
