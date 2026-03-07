// ==UserScript==
// @name         AlGzawy - Scavenge UI Core
// @version      1.0
// @description  Core UI script for AlGzawy's Scavenge Bot. Not meant for direct installation.
// @author       AlGzawy (Original by Sophie)
// ==/UserScript==

// This script is not meant to be run directly. It is loaded by other scripts.
(function($) {
    'use strict';
    
    // --- Start of customized massScavenge.js ---
    var serverTimeTemp = $("#serverDate")[0].innerText + " " + $("#serverTime")[0].innerText;
    var serverTime = serverTimeTemp.match(/^([0][1-9]|[12][0-9]|3[01])[\/\-]([0][1-9]|1[012])[\/\-](\d{4})( (0?[0-9]|[1][0-9]|[2][0-3])[:]([0-5][0-9])([:]([0-5][0-9]))?)?$/);
    var serverDate = Date.parse(serverTime[3] + "/" + serverTime[2] + "/" + serverTime[1] + serverTime[4]);
    var is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;
    var scavengeInfo;
    var tempElementSelection = "";

    if (window.location.href.indexOf('screen=place&mode=scavenge_mass') < 0) {
        window.location.assign(game_data.link_base_pure + "place&mode=scavenge_mass");
    }
    $("#massScavengeAlGzawy").remove();

    var langShinko = [
        "الاغارات", "اختر الوحدات المستخدمة فى الاغارات", "اختر انواع الاغارات المستخدمة",
        "ما المده الزمنيه المراد ارسال الاغارات بها", "ضع المده هنا", "حساب المده لكل صفحه",
        "المطور:", "الاغارات : ترسل لكل 50 قريه على حدى", "تشغيل المجموعة"
    ];

    var troopTypeEnabled, keepHome, categoryEnabled, prioritiseHighCat, sendOrder, runTimes;
    
    troopTypeEnabled = JSON.parse(localStorage.getItem("troopTypeEnabled")) || {};
    keepHome = JSON.parse(localStorage.getItem("keepHome")) || { "spear": 0, "sword": 0, "axe": 0, "archer": 0, "light": 0, "marcher": 0, "heavy": 0 };
    categoryEnabled = JSON.parse(localStorage.getItem("categoryEnabled")) || [true, true, true, true];
    prioritiseHighCat = JSON.parse(localStorage.getItem("prioritiseHighCat")) || false;
    tempElementSelection = localStorage.getItem("timeElement") || "Date";
    sendOrder = JSON.parse(localStorage.getItem("sendOrder")) || game_data.units.filter(u => !["militia", "snob", "ram", "catapult", "spy", "knight"].includes(u));
    runTimes = JSON.parse(localStorage.getItem("runTimes")) || { "off": 4, "def": 3 };

    var URLReq = game_data.player.sitter > 0 ? `game.php?t=${game_data.player.id}&screen=place&mode=scavenge_mass` : "game.php?&screen=place&mode=scavenge_mass";
    var arrayWithData, enabledCategories = [], squad_requests = [], squad_requests_premium = [];
    var duration_factor = 0, duration_exponent = 0, duration_initial_seconds = 0;
    var categoryNames = JSON.parse("[" + $.find('script:contains("ScavengeMassScreen")')[0].innerHTML.match(/\{.*\:\{.*\:.*\}\}/g) + "]")[0];
    var time = { 'off': 0, 'def': 0 };

    var backgroundColor = "#F4E4BC", borderColor = "#ecd7ac", headerColor = "#c6a768", titleColor = "#803000";
    var cssClasses = `<style>
        .sophRowA { background-color: #f4e4bc; color: black; } .sophRowB { background-color: #fff5da; color: black; }
        .sophHeader { background-color: #c6a768; font-weight: bold; color: #803000; } .sophLink { color:#803000; }
        .btnSophie { background-image: linear-gradient(to bottom, #947a62 0%,#7b5c3d 22%,#6c4824 30%,#6c4824 100%) !important; color:white !important; border: 1px solid #4d3319 !important; }
        .btnSophie:hover { background-image: linear-gradient(to bottom, #b69471 0%,#9f764d 22%,#8f6133 30%,#6c4d2d 100%) !important; color: white !important; }
    </style>`;
    $("head").append(cssClasses);

    $.getAll = function(urls, onLoad, onDone, onError) {
        var numDone = 0, lastRequestTime = 0, minWaitTime = 200;
        loadNext();
        function loadNext() {
            if (numDone == urls.length) { onDone(); return; }
            let now = Date.now(), timeElapsed = now - lastRequestTime;
            if (timeElapsed < minWaitTime) { setTimeout(loadNext, minWaitTime - timeElapsed); return; }
            lastRequestTime = now;
            $.get(urls[numDone]).done(data => {
                try { onLoad(numDone, data); ++numDone; loadNext(); } catch (e) { onError(e); }
            }).fail(xhr => onError(xhr));
        }
    };

    window.getData = function() {
        $("#massScavengeAlGzawy").remove();
        var URLs = [];
        $.get(URLReq, function(data) {
            var amountOfPages = $(".paged-nav-item").length > 0 ? parseInt($(".paged-nav-item").last().attr('href').match(/page=(\d+)/)[1]) : 0;
            for (var i = 0; i <= amountOfPages; i++) { URLs.push(URLReq + "&page=" + i); }
            var tempData = JSON.parse($(data).find('script:contains("ScavengeMassScreen")').html().match(/\{.*\:\{.*\:.*\}\}/g)[0]);
            duration_exponent = tempData[1].duration_exponent;
            duration_factor = tempData[1].duration_factor;
            duration_initial_seconds = tempData[1].duration_initial_seconds;
        }).done(function() {
            arrayWithData = "[";
            $.getAll(URLs, (i, data) => {
                arrayWithData += $(data).find('script:contains("ScavengeMassScreen")').html().match(/\{.*\:\{.*\:.*\}\}/g)[2] + ",";
            }, () => {
                arrayWithData = arrayWithData.slice(0, -1) + "]";
                scavengeInfo = JSON.parse(arrayWithData);
                squad_requests = []; squad_requests_premium = [];
                scavengeInfo.forEach(info => { calculateHaulCategories(info); });
                var squads = {}, squads_premium = {}, per50 = 0, groupNumber = 0;
                squads[0] = []; squads_premium[0] = [];
                for(let i = 0; i < squad_requests.length; i++) {
                    if (per50 === 50) { groupNumber++; squads[groupNumber] = []; squads_premium[groupNumber] = []; per50 = 0; }
                    per50++;
                    squads[groupNumber].push(squad_requests[i]);
                    squads_premium[groupNumber].push(squad_requests_premium[i]);
                }
                var htmlWithLaunchButtons = `<div id="massScavengeFinal" class="ui-widget-content" style="position:fixed; top: 150px; left: 150px; background-color:${backgroundColor};cursor:move;z-index:5000; border: 2px solid #804000; border-radius: 5px;">
                    <button class="btn" onclick="$(this).parent().remove()" style="position: absolute; background: red; color: white; top: -1px; right: -1px; width: 25px; height: 25px; border-radius: 5px;">X</button>
                    <table class="vis" border="1" style="width: 100%;background-color:${backgroundColor};border-color:${borderColor}">
                    <tr><td colspan="2" style="text-align:center;background-color:${headerColor}"><h3 style="margin:10px; cursor:move;"><font color="${titleColor}">${langShinko[7]}</font></h3></td></tr>`;
                Object.keys(squads).forEach(s => {
                    htmlWithLaunchButtons += `<tr id="sendRow${s}"><td style="text-align:center; padding: 5px;"><input type="button" class="btn btnSophie" id="sendMass" onclick="sendGroup(${s},false)" value="${langShinko[8]}${parseInt(s) + 1}"></td></tr>`;
                });
                htmlWithLaunchButtons += "</table></div>";
                $("body").append(htmlWithLaunchButtons);
                if (!is_mobile) $("#massScavengeFinal").draggable({ handle: "h3" });
                $("#sendMass").first().focus();
            }, error => console.error(error));
        });
    };

    var html = `
        <div id="massScavengeAlGzawy" class="ui-widget-content" style="width:600px;background-color:${backgroundColor};cursor:move;z-index:5000; position:fixed; top: 50px; left: 50px; border: 2px solid #804000; border-radius: 5px;">
            <button class="btn" onclick="$(this).parent().remove()" style="position: absolute; background: red; color: white; top: -1px; right: -1px; width: 25px; height: 25px; border-radius: 5px;">X</button>
            <table class="vis" border="1" style="width: 100%;background-color:${backgroundColor};border-color:${borderColor}">
                <tr><td colspan="10" style="text-align:center;background-color:${headerColor}"><h3 style="margin:10px; cursor:move;"><font color="${titleColor}">${langShinko[0]}</font></h3></td></tr>
                <tr><td colspan="15" style="text-align:center;background-color:${headerColor}"><h3 style="margin:10px"><font color="${titleColor}">${langShinko[1]}</font></h3></td></tr>
                <tr id="imgRow"></tr>
            </table><hr>
            <table class="vis" border="1" style="width: 100%;background-color:${backgroundColor};border-color:${borderColor}">
                <tr><td colspan="4" style="text-align:center;background-color:${headerColor}"><h3 style="margin:10px"><font color="${titleColor}">${langShinko[2]}</font></h3></td></tr>
                <tr style="text-align:center;background-color:${headerColor}">
                    <td><font color="${titleColor}">${categoryNames[1].name}</font></td><td><font color="${titleColor}">${categoryNames[2].name}</font></td>
                    <td><font color="${titleColor}">${categoryNames[3].name}</font></td><td><font color="${titleColor}">${categoryNames[4].name}</font></td>
                </tr>
                <tr>
                    <td style="text-align:center;"><input type="checkbox" ID="category1"></td><td style="text-align:center;"><input type="checkbox" ID="category2"></td>
                    <td style="text-align:center;"><input type="checkbox" ID="category3"></td><td style="text-align:center;"><input type="checkbox" ID="category4"></td>
                </tr>
            </table><hr>
            <table class="vis" border="1" style="width: 100%;background-color:${backgroundColor};border-color:${borderColor}">
                <tr><td colspan="3" style="text-align:center;background-color:${headerColor}"><h3 style="margin:10px"><font color="${titleColor}">${langShinko[3]}</font></h3></td></tr>
                <tr style="text-align:center;background-color:${headerColor}">
                    <td></td><td><font color="${titleColor}">Off villages</font></td><td><font color="${titleColor}">Def villages</font></td>
                </tr>
                <tr>
                    <td><input type="radio" ID="timeSelectorDate" name="timeSelector"></td>
                    <td style="text-align:center;"><input type="date" id="offDay"><input type="time" id="offTime"></td>
                    <td style="text-align:center;"><input type="date" id="defDay"><input type="time" id="defTime"></td>
                </tr>
                <tr>
                    <td><input type="radio" ID="timeSelectorHours" name="timeSelector"></td>
                    <td style="text-align:center;"><input type="text" class="runTime_off" value="${runTimes['off']}" onclick="this.select();"></td>
                    <td style="text-align:center;"><input type="text" class="runTime_def" value="${runTimes['def']}" onclick="this.select();"></td>
                </tr>
                <tr><td></td><td style="text-align:center;"><span id="offDisplay"></span></td><td style="text-align:center;"><span id="defDisplay"></span></td></tr>
            </table><hr>
            <table class="vis" border="1" style="width: 100%;background-color:${backgroundColor};border-color:${borderColor}">
                <tr><td colspan="2" style="text-align:center;background-color:${headerColor}"><h3 style="margin:10px"><font color="${titleColor}">Which setting?</font></h3></td></tr>
                <tr style="text-align:center;background-color:${headerColor}"><td><font color="${titleColor}">Balanced over all categories</font></td><td><font color="${titleColor}">Priority on filling higher categories</font></td></tr>
                <tr><td style="text-align:center;"><input type="radio" ID="settingPriorityBalanced" name="prio"></td><td style="text-align:center;"><input type="radio" ID="settingPriorityPriority" name="prio"></td></tr>
                <tr><td style="text-align:center;"><font color="${titleColor}">Settings bugged?</font></td><td style="text-align:center;"><input type="button" class="btn btnSophie" onclick="resetSettings()" value="Reset settings"></td></tr>
            </table><hr>
            <center><input type="button" class="btn btnSophie" id="sendMass" onclick="readyToSend()" value="${langShinko[5]}"></center><hr>
            <center><img id="algzawyImg" class="tooltip-delayed" title="AlGzawy" src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029215752/GYTOxdyXXZqmFprq.jpg" style="cursor:help; position: relative; max-width: 90%; height: 150px;"></center>  

            <center><p style="color:${titleColor};">${langShinko[6]} AlGzawy / حقوق محفوظة</p></center>
        </div>`;
    $("body" ).append(html);
    if (!is_mobile) $("#massScavengeAlGzawy").draggable({ handle: "h3" });

    window.readyToSend = function() {
        if (!$("#settingPriorityPriority").is(":checked") && !$("#settingPriorityBalanced").is(":checked")) { alert("You have not chosen how you want to split your troops!"); throw new Error("didn't choose type"); }
        if (!$("#category1").is(":checked") && !$("#category2").is(":checked") && !$("#category3").is(":checked") && !$("#category4").is(":checked")) { alert("You have not chosen which categories you want to use!"); throw new Error("didn't choose category"); }
        sendOrder.forEach(unit => { troopTypeEnabled[unit] = $(`#${unit}`).is(":checked"); keepHome[unit] = $(`#${unit}Backup`).val(); });
        enabledCategories = [$("#category1").is(":checked"), $("#category2").is(":checked"), $("#category3").is(":checked"), $("#category4").is(":checked")];
        if ($("#timeSelectorDate").is(":checked")) {
            localStorage.setItem("timeElement", "Date");
            time.off = (Date.parse($("#offDay").val().replace(/-/g, "/") + " " + $("#offTime").val()) - serverDate) / 3600000;
            time.def = (Date.parse($("#defDay").val().replace(/-/g, "/") + " " + $("#defTime").val()) - serverDate) / 3600000;
        } else {
            localStorage.setItem("timeElement", "Hours");
            time.off = $('.runTime_off').val();
            time.def = $('.runTime_def').val();
        }
        if (time.off > 24 || time.def > 24) alert("Your runtime is higher than 24h!");
        prioritiseHighCat = $("#settingPriorityPriority").is(":checked");
        sendOrder = $("#imgRow :checkbox").map((i, el) => el.name).get();
        localStorage.setItem("troopTypeEnabled", JSON.stringify(troopTypeEnabled));
        localStorage.setItem("keepHome", JSON.stringify(keepHome));
        localStorage.setItem("categoryEnabled", JSON.stringify(enabledCategories));
        localStorage.setItem("prioritiseHighCat", JSON.stringify(prioritiseHighCat));
        localStorage.setItem("sendOrder", JSON.stringify(sendOrder));
        localStorage.setItem("runTimes", JSON.stringify(time));
        categoryEnabled = enabledCategories;
        getData();
    };
    window.sendGroup = function(groupNr, premiumEnabled) {
        var tempSquads = premiumEnabled && confirm("Are you sure?") ? squads_premium[groupNr] : squads[groupNr];
        $(':button[id^="sendMass"]').prop('disabled', true);
        TribalWars.post('scavenge_api', { ajaxaction: 'send_squads' }, { "squad_requests": tempSquads }, () => UI.SuccessMessage("Group sent successfully"), !1);
        setTimeout(() => { $(`#sendRow${groupNr}`).remove(); if ($("#massScavengeFinal input").length === 0) $("#massScavengeFinal").remove(); else $(':button[id^="sendMass"]').prop('disabled', false).first().focus(); }, 200);
    };
    window.calculateHaulCategories = function(data) {
        if (!data.has_rally_point) return;
        var troopsAllowed = {};
        Object.keys(troopTypeEnabled).forEach(key => { if (troopTypeEnabled[key]) troopsAllowed[key] = Math.max(0, data.unit_counts_home[key] - keepHome[key]); });
        var unitType = { "spear": 'def', "sword": 'def', "axe": 'off', "archer": 'def', "light": 'off', "marcher": 'off', "heavy": 'def' };
        var typeCount = { 'off': 0, 'def': 0 };
        Object.keys(troopsAllowed).forEach(prop => { if(unitType[prop]) typeCount[unitType[prop]] += troopsAllowed[prop] });
        var totalLoot = Object.keys(troopsAllowed).reduce((sum, key) => sum + troopsAllowed[key] * (data.unit_carry_factor * { spear: 25, sword: 15, axe: 10, archer: 10, light: 80, marcher: 50, heavy: 50, knight: 100 }[key] || 0), 0);
        if (totalLoot == 0) return;
        var haul = Math.pow(parseInt((( (typeCount.off > typeCount.def ? time.off : time.def) * 3600) / duration_factor - duration_initial_seconds) ** (1 / duration_exponent)) / 100, 0.5);
        var haulCategoryRate = {};
        [1, 2, 3, 4].forEach(i => { haulCategoryRate[i] = (!data.options[i].is_locked && data.options[i].scavenging_squad == null && categoryEnabled[i - 1]) ? haul / [0.1, 0.25, 0.5, 0.75][i - 1] : 0; });
        var totalHaul = Object.values(haulCategoryRate).reduce((a, b) => a + b, 0);
        var unitsReadyForSend = calculateUnitsPerVillage(troopsAllowed, totalLoot, totalHaul, haulCategoryRate);
        Object.keys(unitsReadyForSend).forEach(k => {
            var candidate_squad = { "unit_counts": unitsReadyForSend[k], "carry_max": 9999999999 };
            if (data.options[parseInt(k) + 1] && !data.options[parseInt(k) + 1].is_locked) {
                squad_requests.push({ "village_id": data.village_id, "candidate_squad": candidate_squad, "option_id": parseInt(k) + 1, "use_premium": false });
                squad_requests_premium.push({ "village_id": data.village_id, "candidate_squad": candidate_squad, "option_id": parseInt(k) + 1, "use_premium": true });
            }
        });
    };
    window.calculateUnitsPerVillage = function(troopsAllowed, totalLoot, totalHaul, haulCategoryRate) {
        var unitHaul = { "spear": 25, "sword": 15, "axe": 10, "archer": 10, "light": 80, "marcher": 50, "heavy": 50, "knight": 100 };
        var unitsReadyForSend = { 0: {}, 1: {}, 2: {}, 3: {} };
        var troopsAllowedCopy = JSON.parse(JSON.stringify(troopsAllowed)); 
        if (totalLoot > totalHaul) {
            for (var j = 3; j >= 0; j--) {
                var reach = haulCategoryRate[j + 1];
                sendOrder.forEach(unit => {
                    if (troopsAllowedCopy[unit] > 0 && reach > 0) {
                        var amountNeeded = Math.floor(reach / unitHaul[unit]);
                        var amountToSend = Math.min(amountNeeded, troopsAllowedCopy[unit]);
                        unitsReadyForSend[j][unit] = (unitsReadyForSend[j][unit] || 0) + amountToSend;
                        reach -= amountToSend * unitHaul[unit];
                        troopsAllowedCopy[unit] -= amountToSend;
                    }
                });
            }
        } else {
            var troopNumber = Object.values(troopsAllowed).reduce((a, b) => a + b, 0);
            if (!prioritiseHighCat && troopNumber > 130) {
                for (var j = 0; j < 4; j++) {
                    Object.keys(troopsAllowed).forEach(key => {
                        unitsReadyForSend[j][key] = Math.floor((totalLoot / totalHaul * haulCategoryRate[j + 1]) * (troopsAllowed[key] / totalLoot));
                    });
                }
            } else {
                 for (var j = 3; j >= 0; j--) {
                    var reach = haulCategoryRate[j + 1];
                    sendOrder.forEach(unit => {
                        if (troopsAllowedCopy[unit] > 0 && reach > 0) {
                            var amountNeeded = Math.floor(reach / unitHaul[unit]);
                            var amountToSend = Math.min(amountNeeded, troopsAllowedCopy[unit]);
                            unitsReadyForSend[j][unit] = (unitsReadyForSend[j][unit] || 0) + amountToSend;
                            reach -= amountToSend * unitHaul[unit];
                            troopsAllowedCopy[unit] -= amountToSend;
                        }
                    });
                }
            }
        }
        return unitsReadyForSend;
    };
    window.resetSettings = function() {
        ["troopTypeEnabled", "categoryEnabled", "prioritiseHighCat", "sendOrder", "runTimes", "keepHome"].forEach(item => localStorage.removeItem(item));
        UI.BanneredRewardMessage("Settings reset");
        window.location.reload();
    };
    window.zeroPadded = val => val >= 10 ? val : '0' + val;
    window.setTimeToField = runtimeType => {
        var d = new Date(Date.parse(new Date(serverDate)) + runtimeType * 3600000);
        return zeroPadded(d.getHours()) + ":" + zeroPadded(d.getMinutes());
    };
    window.setDayToField = runtimeType => {
        var d = new Date(Date.parse(new Date(serverDate)) + runtimeType * 3600000);
        return d.getFullYear() + "-" + zeroPadded(d.getMonth() + 1) + "-" + zeroPadded(d.getDate());
    };
    window.fancyTimeFormat = time => {
        if (time < 0) return "الوقت في الماضي!";
        var hrs = ~~(time / 3600), mins = ~~((time % 3600) / 60), secs = ~~time % 60;
        return `المدة القصوى: ${hrs > 0 ? hrs + ":" : "0:"}${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };
    window.updateTimers = function() {
        if ($("#timeSelectorDate").is(":checked")) {
            $("#offDisplay").text(fancyTimeFormat((Date.parse($("#offDay").val().replace(/-/g, "/") + " " + $("#offTime").val()) - serverDate) / 1000));
            $("#defDisplay").text(fancyTimeFormat((Date.parse($("#defDay").val().replace(/-/g, "/") + " " + $("#defTime").val()) - serverDate) / 1000));
        } else {
            $("#offDisplay").text(fancyTimeFormat($(".runTime_off").val() * 3600));
            $("#defDisplay").text(fancyTimeFormat($(".runTime_def").val() * 3600));
        }
    };
    window.selectType = function(type) {
        var isDate = type === 'Date';
        $("#offDay, #defDay, #offTime, #defTime").prop("disabled", !isDate);
        $(".runTime_off, .runTime_def").prop("disabled", isDate);
    };

    sendOrder.forEach(unit => {
        $("#imgRow").append(`<td align="center"><table class="vis" border="1" style="width: 100%">
            <tr><td style="text-align:center;background-color:${headerColor};"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_${unit}.png"></td></tr>
            <tr><td align="center"><input type="checkbox" ID="${unit}" name="${unit}"></td></tr>
            <tr><td style="text-align:center;background-color:#333; color: white;"><font>Backup</font></td></tr>
            <tr><td align="center"><input type="text" ID="${unit}Backup" name="${unit}" value="${keepHome[unit] || 0}" size="5"></td></tr>
        </table></td>` );
    });
    $("#imgRow").sortable({ axis: "x", revert: 100, containment: "parent", forceHelperSize: true, delay: 100, scroll: false }).disableSelection();
    $(`#settingPriority${prioritiseHighCat ? 'Priority' : 'Balanced'}`).prop("checked", true);
    Object.keys(troopTypeEnabled).forEach(unit => { if (troopTypeEnabled[unit]) $(`#${unit}`).prop("checked", true); });
    categoryEnabled.forEach((enabled, i) => { if (enabled) $(`#category${i + 1}`).prop("checked", true); });

    $("#offDay").val(setDayToField(runTimes.off)); $("#offTime").val(setTimeToField(runTimes.off));
    $("#defDay").val(setDayToField(runTimes.def)); $("#defTime").val(setTimeToField(runTimes.def));
    updateTimers();
    $(`#timeSelector${tempElementSelection}`).prop("checked", true);
    selectType(tempElementSelection);
    
    $("#timeSelectorDate, #timeSelectorHours").on("input", function() { 
        selectType(this.id.includes('Date') ? 'Date' : 'Hours'); 
        updateTimers(); 
    });
    $("#offDay, #defDay, #offTime, #defTime, .runTime_off, .runTime_def").on("input", updateTimers);
    $("#sendMass").focus();

})(jQuery);
