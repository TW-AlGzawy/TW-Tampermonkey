(function () {
    'use strict';

    var S = unsafeWindow.ALGZAWY_SETTINGS;

    var isRunning = !!S.isRunning;
    var balanceTimer = null;
    var countdownTimer = null;
    var statusEl = null;

    function getS(key, def) {
        var v = S[key];
        return (v !== undefined && v !== null) ? v : def;
    }

    function saveS(key, val) {
        S.save(key, val);
        S[key] = val;
    }

    function setStatus(msg) {
        if (statusEl) statusEl.textContent = msg;
    }

    var inputStyle = 'padding:3px;border:1px solid #2d6a2d;background:#f0fff0;border-radius:4px;box-sizing:border-box;';
    var btnStyle = 'width:100%;padding:6px;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;display:block;';

    function rowHtml(label, inputHtml) {
        return '<div style="margin-bottom:6px;"><label style="display:block;margin-bottom:2px;font-weight:bold;">' + label + '</label>' + inputHtml + '</div>';
    }

    function makeDraggable(el, handle) {
        var sX, sY, sL, sT;
        handle.onmousedown = function (e) {
            sX = e.clientX; sY = e.clientY;
            sL = parseInt(el.style.left) || 0;
            sT = parseInt(el.style.top) || 0;
            document.onmousemove = function (e) {
                el.style.left = (sL + e.clientX - sX) + 'px';
                el.style.top = (sT + e.clientY - sY) + 'px';
            };
            document.onmouseup = function () {
                document.onmousemove = null;
                document.onmouseup = null;
                GM_setValue('algzawy_balance_panelTop', el.style.top);
                GM_setValue('algzawy_balance_panelLeft', el.style.left);
            };
        };
    }

    // ===================== K-MEANS =====================
    function calcMean(coords) {
        if (!coords.length) return [0, 0];
        var sx = 0, sy = 0;
        for (var i = 0; i < coords.length; i++) { sx += coords[i][0]; sy += coords[i][1]; }
        return [sx / coords.length, sy / coords.length];
    }

    function getClusters(coords, options) {
        var k = Math.min(options.numberOfClusters || 1, coords.length);
        var maxIter = options.maxIterations || 100;
        if (k <= 1 || !coords.length) {
            return [{ data: coords.slice(), mean: calcMean(coords) }];
        }
        var centroids = [], used = [];
        for (var i = 0; i < k; i++) {
            var idx;
            do { idx = Math.floor(Math.random() * coords.length); } while (used.indexOf(idx) !== -1);
            used.push(idx);
            centroids.push([coords[idx][0], coords[idx][1]]);
        }
        var assignments = new Array(coords.length).fill(0);
        for (var iter = 0; iter < maxIter; iter++) {
            var changed = false;
            for (var i = 0; i < coords.length; i++) {
                var minD = Infinity, minC = 0;
                for (var j = 0; j < k; j++) {
                    var dx = coords[i][0] - centroids[j][0], dy = coords[i][1] - centroids[j][1];
                    var d = dx * dx + dy * dy;
                    if (d < minD) { minD = d; minC = j; }
                }
                if (assignments[i] !== minC) { assignments[i] = minC; changed = true; }
            }
            if (!changed) break;
            for (var j = 0; j < k; j++) {
                var m = [];
                for (var i = 0; i < coords.length; i++) { if (assignments[i] === j) m.push(coords[i]); }
                if (m.length) centroids[j] = calcMean(m);
            }
        }
        var clusters = [];
        for (var j = 0; j < k; j++) {
            var m = [];
            for (var i = 0; i < coords.length; i++) { if (assignments[i] === j) m.push(coords[i]); }
            if (m.length) clusters.push({ data: m, mean: centroids[j] });
        }
        return clusters;
    }

    function calcDistance(c1, c2) {
        var x1 = parseInt(c1.split('|')[0]), y1 = parseInt(c1.split('|')[1]);
        var x2 = parseInt(c2.split('|')[0]), y2 = parseInt(c2.split('|')[1]);
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    // ===================== HTTP =====================
    function httpGet(url) {
        return new Promise(function (resolve, reject) {
            GM_xmlhttpRequest({ method: 'GET', url: url, onload: function (r) { resolve(r.responseText); }, onerror: reject });
        });
    }

    function sleep(ms) {
        return new Promise(function (r) { setTimeout(r, ms); });
    }

    // ===================== DATA FETCHING =====================
    async function fetchPages(baseUrl) {
        var html = await httpGet(baseUrl);
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var pages = [];
        var navItems = doc.querySelectorAll('.paged-nav-item');
        if (navItems.length > 0) {
            var nr = 0;
            navItems.forEach(function (item) {
                pages.push(item.href.split('page=')[0] + 'page=' + (nr++));
            });
            pages = pages.reverse();
        } else {
            pages.push(baseUrl);
        }
        return { firstDoc: doc, pages: pages };
    }

    function parseNum(text) {
        return parseInt((text || '').replace(/\D/g, '')) || 0;
    }

    async function getDataProduction() {
        var base = unsafeWindow.game_data.link_base_pure + 'overview_villages&mode=prod';
        var result = await fetchPages(base);
        var list = [];
        var parser = new DOMParser();

        for (var p = 0; p < result.pages.length; p++) {
            if (p > 0) await sleep(250);
            var html = await httpGet(result.pages[p]);
            var doc = parser.parseFromString(html, 'text/html');
            var rows = doc.querySelectorAll('.row_a, .row_b');
            rows.forEach(function (row) {
                try {
                    var vnEl = row.querySelector('.quickedit-vn');
                    if (!vnEl) return;
                    var name = (vnEl.innerText || vnEl.textContent || '').trim();
                    var cm = name.match(/\d+\|\d+/);
                    if (!cm) return;
                    var coord = cm[0];
                    var id = vnEl.getAttribute('data-id');

                    var wood = parseNum((row.querySelector('.wood') || {}).innerText);
                    var stone = parseNum((row.querySelector('.stone') || {}).innerText);
                    var iron = parseNum((row.querySelector('.iron') || {}).innerText);

                    var mLink = row.querySelector('a[href*="market"]');
                    var merchants = 0, merchants_total = 0;
                    if (mLink) {
                        var mt = (mLink.innerText || mLink.textContent || '').trim();
                        merchants = parseInt(mt.split('/')[0]) || 0;
                        merchants_total = parseInt(mt.split('/')[1]) || 0;
                    }
                    var capEl = row.children[4];
                    var capacity = capEl ? parseNum(capEl.innerText || capEl.textContent) || 100000 : 100000;

                    list.push({ coord: coord, id: id, name: name, wood: wood, stone: stone, iron: iron, merchants: merchants, merchants_total: merchants_total, capacity: capacity });
                } catch (e) {}
            });
        }
        return list;
    }

    async function getDataIncoming() {
        var base = unsafeWindow.game_data.link_base_pure + 'overview_villages&mode=trader&type=inc';
        var result = await fetchPages(base);
        var map = new Map();
        var parser = new DOMParser();

        for (var p = 0; p < result.pages.length; p++) {
            if (p > 0) await sleep(250);
            var html = await httpGet(result.pages[p]);
            var doc = parser.parseFromString(html, 'text/html');
            var rows = doc.querySelectorAll('.row_a, .row_b');
            rows.forEach(function (row) {
                try {
                    var c4 = row.children[4];
                    if (!c4) return;
                    var m = (c4.innerText || c4.textContent || '').match(/\d+\|\d+/);
                    if (!m) return;
                    var coord = m[0];

                    var woodEl = row.querySelector('.wood');
                    var stoneEl = row.querySelector('.stone');
                    var ironEl = row.querySelector('.iron');
                    var wood = woodEl ? parseNum((woodEl.parentElement || woodEl).innerText) : 0;
                    var stone = stoneEl ? parseNum((stoneEl.parentElement || stoneEl).innerText) : 0;
                    var iron = ironEl ? parseNum((ironEl.parentElement || ironEl).innerText) : 0;

                    if (map.has(coord)) {
                        var ex = map.get(coord);
                        ex.wood += wood; ex.stone += stone; ex.iron += iron;
                    } else {
                        map.set(coord, { wood: wood, stone: stone, iron: iron });
                    }
                } catch (e) {}
            });
        }
        return map;
    }

    // ===================== CALCULATE LAUNCHES =====================
    function calculateLaunches(list_prod_cluster, list_prod_home_cluster, avgFactor, reserveMerchants, merchantCap) {
        var list_launches = [];

        for (var ci = 0; ci < list_prod_cluster.length; ci++) {
            var prod = list_prod_cluster[ci];
            var prodHome = list_prod_home_cluster[ci];
            if (!prod.length) continue;

            var avg_w = 0, avg_s = 0, avg_i = 0;
            for (var j = 0; j < prod.length; j++) {
                avg_w += prod[j].wood / prod.length;
                avg_s += prod[j].stone / prod.length;
                avg_i += prod[j].iron / prod.length;
            }
            avg_w *= avgFactor; avg_s *= avgFactor; avg_i *= avgFactor;

            var list_send = [], list_get = [];

            for (var j = 0; j < prod.length; j++) {
                var p = prod[j], ph = prodHome[j];
                var merchants = Math.max(0, p.merchants - reserveMerchants);
                var cap = p.capacity * 0.95;
                var cap_travel = merchants * merchantCap;

                var dw = p.wood - Math.round(avg_w);
                var ds = p.stone - Math.round(avg_s);
                var di = p.iron - Math.round(avg_i);

                dw = (dw < 0) ? dw : (ph.wood - dw > 0) ? dw : ph.wood;
                ds = (ds < 0) ? ds : (ph.stone - ds > 0) ? ds : ph.stone;
                di = (di < 0) ? di : (ph.iron - di > 0) ? di : ph.iron;

                var avail = (dw > 0 ? dw : 0) + (ds > 0 ? ds : 0) + (di > 0 ? di : 0);
                var nf = (cap_travel > 0 && cap_travel <= avail) ? cap_travel / avail : 1;

                var sw = dw > 0 ? parseInt(dw * nf) : 0;
                var ss = ds > 0 ? parseInt(ds * nf) : 0;
                var si = di > 0 ? parseInt(di * nf) : 0;

                var gw = dw > 0 ? 0 : (p.wood + Math.abs(dw) < cap) ? Math.abs(dw) : cap - p.wood;
                var gs = ds > 0 ? 0 : (p.stone + Math.abs(ds) < cap) ? Math.abs(ds) : cap - p.stone;
                var gi = di > 0 ? 0 : (p.iron + Math.abs(di) < cap) ? Math.abs(di) : cap - p.iron;

                if (sw > 0 || ss > 0 || si > 0) list_send.push({ coord: p.coord, id: p.id, name: p.name, wood: sw, stone: ss, iron: si });
                if (gw > 0 || gs > 0 || gi > 0) list_get.push({ coord: p.coord, id: p.id, name: p.name, wood: parseInt(gw), stone: parseInt(gs), iron: parseInt(gi) });
            }

            var tw_s = 0, ts_s = 0, ti_s = 0, tw_g = 0, ts_g = 0, ti_g = 0;
            list_send.forEach(function (o) { tw_s += o.wood; ts_s += o.stone; ti_s += o.iron; });
            list_get.forEach(function (o) { tw_g += o.wood; ts_g += o.stone; ti_g += o.iron; });

            var nw = (tw_g > tw_s && tw_g > 0) ? tw_s / tw_g : 1;
            var ns = (ts_g > ts_s && ts_g > 0) ? ts_s / ts_g : 1;
            var ni = (ti_g > ti_s && ti_g > 0) ? ti_s / ti_g : 1;
            list_get.forEach(function (o) { o.wood = parseInt(o.wood * nw); o.stone = parseInt(o.stone * ns); o.iron = parseInt(o.iron * ni); });

            for (var j = 0; j < list_get.length; j++) {
                var g = list_get[j];
                list_send.sort(function (a, b) { return calcDistance(g.coord, a.coord) - calcDistance(g.coord, b.coord); });

                for (var k = 0; k < list_send.length; k++) {
                    var s = list_send[k];
                    var sw = Math.min(g.wood, s.wood);
                    var ss = Math.min(g.stone, s.stone);
                    var si = Math.min(g.iron, s.iron);
                    var total = sw + ss + si;
                    var minim = merchantCap === 1500 ? 1200 : 700;

                    var rest = total % merchantCap;
                    if (rest < minim) {
                        if (sw > rest) { sw -= rest; total -= rest; }
                        else if (ss > rest) { ss -= rest; total -= rest; }
                        else if (si > rest) { si -= rest; total -= rest; }
                    }

                    g.wood -= sw; g.stone -= ss; g.iron -= si;
                    s.wood -= sw; s.stone -= ss; s.iron -= si;

                    if (total >= minim) {
                        list_launches.push({
                            wood: sw, stone: ss, iron: si, total_send: total,
                            coord_origin: s.coord, id_origin: s.id, name_origin: s.name,
                            coord_destination: g.coord, id_destination: g.id, name_destination: g.name,
                            distance: calcDistance(g.coord, s.coord)
                        });
                    }
                    if (g.wood + g.stone + g.iron < minim) break;
                }
            }
        }
        return list_launches;
    }

    // ===================== SEND RESOURCES =====================
    function sendResources(target_id, data) {
        return new Promise(function (resolve) {
            var options = { village: target_id, ajaxaction: 'call', h: unsafeWindow.csrf_token };
            try {
                unsafeWindow.TribalWars.post('market', options, data, function (r) { resolve(r); });
            } catch (e) { resolve(null); }
        });
    }

    // ===================== BOT LOGIC =====================
    async function runBalance() {
        if (!isRunning) return;

        var reserveMerchants = getS('reserveMerchants', 0);
        var averageFactor = parseFloat(getS('averageFactor', 1.0)) || 1.0;
        var nrClusters = parseInt(getS('nrClusters', 1)) || 1;
        var merchantCap = 1000;
        var sendDelay = getS('sendDelay', 400);

        try {
            setStatus('جاري جلب بيانات الإنتاج...');
            var list_production = await getDataProduction();

            if (!list_production.length) {
                setStatus('لم يتم العثور على قرى!');
                scheduleNext();
                return;
            }

            setStatus('جاري جلب الموارد الواردة...');
            var map_incoming = await getDataIncoming();

            var list_home = list_production.map(function (p) { return Object.assign({}, p); });

            list_production.forEach(function (p) {
                if (map_incoming.has(p.coord)) {
                    var inc = map_incoming.get(p.coord);
                    p.wood = Math.min(p.wood + inc.wood, p.capacity);
                    p.stone = Math.min(p.stone + inc.stone, p.capacity);
                    p.iron = Math.min(p.iron + inc.iron, p.capacity);
                }
            });

            setStatus('حساب التوزيع (' + list_production.length + ' قرية)...');

            var kmeans_coords = list_production.map(function (p) {
                return [parseInt(p.coord.split('|')[0]), parseInt(p.coord.split('|')[1])];
            });
            var clusters = getClusters(kmeans_coords, { numberOfClusters: nrClusters, maxIterations: 100 });

            var list_prod_cluster = [], list_prod_home_cluster = [];
            for (var ci = 0; ci < clusters.length; ci++) {
                var lp = [], lph = [];
                clusters[ci].data.forEach(function (xy) {
                    var coord_str = xy[0] + '|' + xy[1];
                    for (var k = 0; k < list_production.length; k++) {
                        if (list_production[k].coord === coord_str) {
                            lp.push(list_production[k]);
                            lph.push(list_home[k]);
                            break;
                        }
                    }
                });
                if (lp.length) { list_prod_cluster.push(lp); list_prod_home_cluster.push(lph); }
            }

            var list_launches = calculateLaunches(list_prod_cluster, list_prod_home_cluster, averageFactor, reserveMerchants, merchantCap);

            var map_mass = new Map();
            list_launches.forEach(function (l) {
                var tid = l.id_destination;
                var oid = l.id_origin;
                var wk = 'resource[' + oid + '][wood]';
                var sk = 'resource[' + oid + '][stone]';
                var ik = 'resource[' + oid + '][iron]';
                if (map_mass.has(tid)) {
                    var ex = map_mass.get(tid);
                    ex.send_resources[wk] = l.wood;
                    ex.send_resources[sk] = l.stone;
                    ex.send_resources[ik] = l.iron;
                    ex.total += l.total_send;
                } else {
                    var sr = {}; sr[wk] = l.wood; sr[sk] = l.stone; sr[ik] = l.iron;
                    map_mass.set(tid, { target_id: tid, name: l.name_destination, send_resources: sr, total: l.total_send });
                }
            });

            var launches = Array.from(map_mass.values());

            if (!launches.length) {
                setStatus('الموارد متوازنة، لا شيء للإرسال');
                GM_setValue('algzawy_balance_lastRun', Date.now().toString());
                scheduleNext();
                return;
            }

            setStatus('يرسل: 0/' + launches.length);

            for (var i = 0; i < launches.length; i++) {
                if (!isRunning) break;
                await sleep(sendDelay + Math.floor(Math.random() * 200));
                await sendResources(launches[i].target_id, launches[i].send_resources);
                setStatus('يرسل: ' + (i + 1) + '/' + launches.length);
            }

            if (isRunning) {
                var now = new Date().toLocaleTimeString('ar');
                setStatus('اكتمل ' + now + ' (' + launches.length + ' إرسال)');
                GM_setValue('algzawy_balance_lastRun', Date.now().toString());
                scheduleNext();
            }
        } catch (e) {
            setStatus('خطأ: ' + (e.message || e));
            if (isRunning) scheduleNext();
        }
    }

    function scheduleNext() {
        if (balanceTimer) clearTimeout(balanceTimer);
        if (countdownTimer) clearInterval(countdownTimer);
        if (!isRunning) return;

        var interval = getS('interval', 7200000);
        var lastRun = parseInt(GM_getValue('algzawy_balance_lastRun', '0')) || 0;
        var elapsed = Date.now() - lastRun;
        var remaining = Math.max(10000, interval - elapsed);

        setStatus('التشغيل القادم بعد ' + formatTime(Math.ceil(remaining / 1000)));

        var rem = Math.ceil(remaining / 1000);
        countdownTimer = setInterval(function () {
            rem--;
            if (rem > 0) setStatus('التشغيل القادم بعد ' + formatTime(rem));
            else { clearInterval(countdownTimer); countdownTimer = null; }
        }, 1000);

        balanceTimer = setTimeout(function () {
            clearInterval(countdownTimer); countdownTimer = null;
            runBalance();
        }, remaining);
    }

    function formatTime(sec) {
        if (sec >= 3600) return Math.floor(sec / 3600) + 'س ' + Math.floor((sec % 3600) / 60) + 'د';
        if (sec >= 60) return Math.floor(sec / 60) + 'د ' + (sec % 60) + 'ث';
        return sec + 'ث';
    }

    // ===================== PANEL =====================
    function buildPanel() {
        var top = GM_getValue('algzawy_balance_panelTop', '150px');
        var left = GM_getValue('algzawy_balance_panelLeft', '10px');
        var minimized = GM_getValue('algzawy_balance_panelMinimized', false);

        var interval = getS('interval', 7200000);
        var reserveMerchants = getS('reserveMerchants', 0);
        var averageFactor = getS('averageFactor', 1.0);
        var nrClusters = getS('nrClusters', 1);
        var sendDelay = getS('sendDelay', 400);

        var panel = document.createElement('div');
        panel.id = 'alg-balance-panel';
        panel.style.cssText = [
            'position:fixed', 'top:' + top, 'left:' + left, 'z-index:99999',
            'background:linear-gradient(to bottom,#e8f5e9,#c8e6c9)',
            'border:2px solid #2d6a2d', 'border-radius:8px',
            'font-family:Trebuchet MS,sans-serif', 'font-size:13px',
            'color:#1a3a1a', 'direction:rtl', 'min-width:225px',
            'box-shadow:3px 3px 10px rgba(0,0,0,0.5)', 'user-select:none'
        ].join(';');

        panel.innerHTML =
            '<div id="alg-balance-hdr" style="background:linear-gradient(to bottom,#1a4d1a,#0d3000);color:#c8e6c9;padding:7px 10px;border-radius:6px 6px 0 0;cursor:move;display:flex;justify-content:space-between;align-items:center;">' +
                '<b>AlGzawy - موازنة الموارد</b>' +
                '<button id="alg-balance-min" style="background:none;border:none;color:#c8e6c9;cursor:pointer;font-size:16px;line-height:1;padding:0 4px;">' + (minimized ? '+' : '−') + '</button>' +
            '</div>' +
            '<div id="alg-balance-body" style="padding:10px;display:' + (minimized ? 'none' : 'block') + ';">' +
                rowHtml('الفترة (ms)', '<input id="alg-b-interval" type="number" min="60000" value="' + interval + '" style="' + inputStyle + 'width:100%;" title="مثال: 7200000 = ساعتان">') +
                rowHtml('احتياطي تجار', '<input id="alg-b-reserve" type="number" min="0" value="' + reserveMerchants + '" style="' + inputStyle + 'width:100%;">') +
                rowHtml('عامل التوزيع (0-1)', '<input id="alg-b-factor" type="number" min="0" max="1" step="0.1" value="' + averageFactor + '" style="' + inputStyle + 'width:100%;" title="1 = توزيع متساوٍ تام، 0 = للبناء فقط">') +
                rowHtml('عدد المجموعات', '<input id="alg-b-clusters" type="number" min="1" value="' + nrClusters + '" style="' + inputStyle + 'width:100%;" title="1 = موازنة عالمية، أكثر = مجموعات محلية">') +
                rowHtml('تأخير الإرسال (ms)', '<input id="alg-b-delay" type="number" min="100" value="' + sendDelay + '" style="' + inputStyle + 'width:100%;">') +
                '<button id="alg-b-save" style="' + btnStyle + 'background:#4a7c4a;margin-bottom:6px;">حفظ</button>' +
                '<button id="alg-b-now" style="' + btnStyle + 'background:#2980b9;margin-bottom:6px;">تشغيل الآن</button>' +
                '<button id="alg-b-run" style="' + btnStyle + 'background:' + (isRunning ? '#c0392b' : '#27ae60') + ';font-size:14px;margin-bottom:4px;">' + (isRunning ? 'إيقاف التلقائي' : 'تشغيل تلقائي') + '</button>' +
                '<div id="alg-b-status" style="margin-top:6px;font-size:11px;color:#1a3a1a;text-align:center;min-height:16px;">' + (isRunning ? 'يحسب الجدول...' : 'متوقف') + '</div>' +
                '<div style="text-align:center;margin-top:8px;font-size:10px;color:#4a7c4a;border-top:1px solid #a5d6a7;padding-top:6px;">AlGzawy • موازنة الموارد v1.0</div>' +
            '</div>';

        document.body.appendChild(panel);
        statusEl = document.getElementById('alg-b-status');

        makeDraggable(panel, document.getElementById('alg-balance-hdr'));

        document.getElementById('alg-balance-min').onclick = function () {
            var body = document.getElementById('alg-balance-body');
            var isMin = body.style.display === 'none';
            body.style.display = isMin ? 'block' : 'none';
            this.textContent = isMin ? '−' : '+';
            GM_setValue('algzawy_balance_panelMinimized', !isMin);
        };

        document.getElementById('alg-b-save').onclick = saveSettings;

        document.getElementById('alg-b-now').onclick = function () {
            if (balanceTimer) clearTimeout(balanceTimer);
            if (countdownTimer) clearInterval(countdownTimer);
            runBalance();
        };

        document.getElementById('alg-b-run').onclick = toggleBot;

        if (isRunning) scheduleNext();
    }

    function saveSettings() {
        saveS('interval', parseInt(document.getElementById('alg-b-interval').value) || 7200000);
        saveS('reserveMerchants', parseInt(document.getElementById('alg-b-reserve').value) || 0);
        saveS('averageFactor', parseFloat(document.getElementById('alg-b-factor').value) || 1.0);
        saveS('nrClusters', parseInt(document.getElementById('alg-b-clusters').value) || 1);
        saveS('sendDelay', parseInt(document.getElementById('alg-b-delay').value) || 400);
        setStatus('تم الحفظ ✓');
        setTimeout(function () { setStatus(isRunning ? 'جاري العمل...' : 'متوقف'); }, 1500);
    }

    function toggleBot() {
        if (isRunning) {
            isRunning = false;
            saveS('isRunning', false);
            if (balanceTimer) clearTimeout(balanceTimer);
            if (countdownTimer) clearInterval(countdownTimer);
            var btn = document.getElementById('alg-b-run');
            if (btn) { btn.textContent = 'تشغيل تلقائي'; btn.style.background = '#27ae60'; }
            setStatus('متوقف');
        } else {
            saveSettings();
            isRunning = true;
            saveS('isRunning', true);
            var btn = document.getElementById('alg-b-run');
            if (btn) { btn.textContent = 'إيقاف التلقائي'; btn.style.background = '#c0392b'; }
            runBalance();
        }
    }

    buildPanel();

})();
