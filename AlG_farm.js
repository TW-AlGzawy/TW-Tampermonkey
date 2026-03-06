// هذا هو الكود الخام الذي سيتم حقنه داخل new Function
// لا تضعه داخل (function(...) { ... })();

'use strict';

// 1. تحقق من الصفحة أولاً
if (!window.location.href.includes('screen=am_farm')) {
    // لا تفعل شيئاً إذا لم نكن في صفحة مساعد النهب
    return;
}

// 2. استقبل الإعدادات
// 'settings' يتم تمريره مباشرة من new Function
const templateMap = { 'A': 8, 'B': 9, 'C': 10 };
const selectedTemplate = settings.template || 'A';
const type = templateMap[selectedTemplate];

console.log(`[AlGzawy Farm Bot] بدأ التشغيل. القالب: ${selectedTemplate}`);

// 3. بقية الكود كما هو
var speed = Math.random() * 20000 + 35000;

var attackInterval = setInterval(function() {
    var plunderList = $('#plunder_list tr.plunder_row');
    if (plunderList.length > 0) {
        var firstRow = plunderList.first();
        var attackButton = firstRow.find('td:eq(' + type + ') a');
        if (attackButton.length > 0) {
            console.log(`[AlGzawy Farm Bot] إرسال هجوم من الصف الأول باستخدام القالب ${selectedTemplate}`);
            attackButton.click();
        }
        firstRow.remove();
    } else {
        // لا يوجد المزيد من الأهداف في القائمة
        clearInterval(attackInterval);
        switchToNextVillage();
    }
}, Math.ceil((Math.random() * 200) + 500)); // زدنا الوقت قليلاً ليكون أكثر أماناً

function switchToNextVillage() {
    console.log("[AlGzawy Farm Bot] قائمة النهب فارغة، سيتم الانتقال للقرية التالية.");
    setTimeout(function() {
        var nextVillageButton = $('#village_switch_right');
        if (nextVillageButton.length > 0) {
            location.href = nextVillageButton.attr('href');
        } else {
            location.reload();
        }
    }, speed);
}

// تحقق أولي: إذا كانت القائمة فارغة عند بدء التشغيل
if ($('#plunder_list tr.plunder_row').length === 0) {
    clearInterval(attackInterval);
    switchToNextVillage();
}
