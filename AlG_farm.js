// هذا الكود يستقبل '$' و 'settings' من سكربت التحميل

// 1. تحديد المتغيرات من الإعدادات
const templateMap = { 'A': 8, 'B': 9, 'C': 10 };
const type = templateMap[settings.template] || 8; // القيمة الافتراضية 8 (A)
const speed = Math.random() * 20000 + 35000;

console.log(`[AlGzawy] بدء النهب باستخدام القالب ${settings.template}`);

// 2. دالة إرسال الهجمات (السكربت الأصلي مع تعديل بسيط)
const attackInterval = setInterval(function() {
    const firstRow = $('#plunder_list tr.plunder_row:first');
    if (firstRow.length > 0) {
        firstRow.find('td:eq(' + type + ') a').click();
        // لا نستخدم remove() لأن اللعبة تزيله تلقائياً بعد النقر
    } else {
        // إذا لم تعد هناك صفوف، أوقف التكرار
        clearInterval(attackInterval);
    }
}, Math.ceil((Math.random() * 200) + 300));

// 3. دالة الانتقال للقرية التالية (السكربت الأصلي)
setTimeout(function() {
    if ($('#village_switch_right').length === 0) {
        location.reload();
    } else {
        // استخدام click() أفضل لأنه يشغل أي أوامر مرتبطة بالزر
        $('#village_switch_right').click();
    }
}, speed);
