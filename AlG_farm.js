// هذا الكود يستقبل كائن "settings" من سكربت التحميل
// لاحظ التغيير في السطر الأول والأخير
(function(settings) { // <--- 1. تعديل هنا: استقبال المعامل
    'use strict';

    if (!window.location.href.includes('screen=am_farm')) {
        return;
    }

    const templateMap = { 'A': 8, 'B': 9, 'C': 10 };

    // الآن هذا السطر سيعمل بشكل صحيح لأن 'settings' معرف كمعامل للدالة
    const selectedTemplate = settings.template || 'A';
    const type = templateMap[selectedTemplate];

    console.log(`تم اختيار قالب النهب: ${selectedTemplate} (العمود: ${type})`);

    var speed = Math.random() * 20000 + 35000;

    var attackInterval = setInterval(function() {
        var plunderList = $('#plunder_list tr.plunder_row');
        if (plunderList.length > 0) {
            var firstRow = plunderList.first();
            // تأكد من وجود الزر قبل النقر عليه
            var attackButton = firstRow.find('td:eq(' + type + ') a');
            if (attackButton.length > 0) {
                attackButton.click();
            }
            firstRow.remove();
        } else {
            console.log("قائمة النهب فارغة، سيتم الانتقال للقرية التالية.");
            clearInterval(attackInterval);
            switchToNextVillage();
        }
    }, Math.ceil((Math.random() * 200) + 300));

    function switchToNextVillage() {
        setTimeout(function() {
            var nextVillageButton = $('#village_switch_right');
            if (nextVillageButton.length > 0) {
                location.href = nextVillageButton.attr('href');
            } else {
                location.reload();
            }
        }, speed);
    }

    if ($('#plunder_list tr.plunder_row').length === 0) {
        console.log("لم يتم العثور على أهداف في القائمة عند بدء التشغيل.");
        clearInterval(attackInterval);
        switchToNextVillage();
    }

})(settings); // <--- 2. تعديل هنا: تمرير المعامل
