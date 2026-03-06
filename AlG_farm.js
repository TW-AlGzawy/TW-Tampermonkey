// هذا الكود يستقبل كائن "settings" من سكربت التحميل
// لا تقم بتعريف المتغير settings هنا، سيتم تمريره عند التشغيل

(function() {
    'use strict';

    if (!window.location.href.includes('screen=am_farm')) {
        return;
    }

    // تحويل حرف القالب إلى رقم العمود الصحيح
    // A -> 8, B -> 9, C -> 10
    const templateMap = {
        'A': 8,
        'B': 9,
        'C': 10
    };

    // اقرأ القالب من الإعدادات التي تم تمريرها، وإذا لم توجد، استخدم 'A' كافتراضي
    const selectedTemplate = settings.template || 'A';
    const type = templateMap[selectedTemplate];

    console.log(`تم اختيار قالب النهب: ${selectedTemplate} (العمود: ${type})`);

    // سرعة التنقل بين القرى
    var speed = Math.random() * 20000 + 35000;

    var attackInterval = setInterval(function() {
        var plunderList = $('#plunder_list tr.plunder_row');
        if (plunderList.length > 0) {
            var firstRow = plunderList.first();
            firstRow.find('td:eq(' + type + ') a').click();
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

})();
