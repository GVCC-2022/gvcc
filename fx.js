/* GVCC soft-glass look: floating shapes, liquid glass filter, tap sparkles, light parallax.
   This file only adds decoration (empty boxes drawn with CSS). It never reads or changes any text. */
(function () {
    "use strict";
    if (window.gvccFx) { return; }

    var doc = document, root = doc.documentElement;
    var SVGNS = "http://www.w3.org/2000/svg";
    function mm(s) { try { return window.matchMedia(s).matches; } catch (e) { return false; } }
    function qa(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
    function el(tag, cls, css) { var e = doc.createElement(tag); if (cls) { e.className = cls; } if (css) { e.style.cssText = css; } return e; }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
    function onReady(fn) { if (doc.readyState === "loading") { doc.addEventListener("DOMContentLoaded", fn); } else { fn(); } }

    var reduce = mm("(prefers-reduced-motion: reduce)");
    var fine = mm("(hover: hover) and (pointer: fine)");
    var special = !!doc.getElementById("secretWorld");
    var lite = false;
    var forced = (/[?&]fx=(full|lite)/.exec(location.search) || [])[1];
    try {
        var stamp = Number(localStorage.getItem("gvccFxLite"));      // time when this phone was found slow
        if (stamp > 1 && Date.now() - stamp < 3 * 86400000) { lite = true; }
        else if (stamp) { localStorage.removeItem("gvccFxLite"); }    // look again after 3 days
    } catch (e) { }
    if (forced === "lite") { lite = true; }
    if (forced === "full") { lite = false; }
    if (lite) { root.classList.add("fx-lite"); }
    if (fine) { root.classList.add("fx-fine"); }
    if (reduce) { root.classList.add("fx-calm"); }
    if (special) { root.classList.add("fx-special"); }

    // ---------- liquid glass: an SVG filter that bends what is behind the glass (Chrome/Edge; other browsers just blur) ----------
    function addFilter() {
        if (doc.getElementById("fxLiquidSvg") || !doc.body) { return; }
        var s = doc.createElementNS(SVGNS, "svg");
        s.setAttribute("id", "fxLiquidSvg");
        s.setAttribute("width", "0");
        s.setAttribute("height", "0");
        s.setAttribute("aria-hidden", "true");
        s.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
        s.innerHTML = '<defs>' +
            '<filter id="fxLiquid" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">' +
            '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="11" result="n"/>' +
            '<feGaussianBlur in="n" stdDeviation="1.6" result="m"/>' +
            '<feDisplacementMap in="SourceGraphic" in2="m" scale="22" xChannelSelector="R" yChannelSelector="G"/>' +
            '</filter></defs>';
        doc.body.appendChild(s);
    }

    // ---------- parallax: pointer / finger / phone tilt move the layers a little ----------
    var par = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
    var parTargets = [];
    var cards = [];
    function parApply() {
        var px = par.x.toFixed(3), py = par.y.toFixed(3);
        for (var i = 0; i < parTargets.length; i++) {
            parTargets[i].style.setProperty("--px", px);
            parTargets[i].style.setProperty("--py", py);
        }
        for (var c = 0; c < cards.length; c++) {
            var ry = par.x * 7, rx = -par.y * 5;
            if (Math.abs(rx) < 0.06 && Math.abs(ry) < 0.06) { cards[c].style.transform = ""; }
            else { cards[c].style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)"; }
        }
    }
    function parTick() {
        par.raf = 0;
        par.x += (par.tx - par.x) * 0.1;
        par.y += (par.ty - par.y) * 0.1;
        parApply();
        if (Math.abs(par.tx - par.x) > 0.002 || Math.abs(par.ty - par.y) > 0.002) { par.raf = requestAnimationFrame(parTick); }
    }
    function parSet(x, y) {
        if (reduce) { return; }
        par.tx = clamp(x, -1, 1);
        par.ty = clamp(y, -1, 1);
        if (!par.raf) { par.raf = requestAnimationFrame(parTick); }
    }
    function spot(x, y) {
        for (var c = 0; c < cards.length; c++) {
            var r = cards[c].getBoundingClientRect();
            if (!r.width) { continue; }
            cards[c].style.setProperty("--mx", clamp((x - r.left) / r.width * 100, -20, 120).toFixed(1) + "%");
            cards[c].style.setProperty("--my", clamp((y - r.top) / r.height * 100, -20, 120).toFixed(1) + "%");
        }
    }

    // ---------- tap sparkles ----------
    var layer = null;
    var SKY = ["#ffd7e6", "#ff9fc2", "#ffe3a3", "#ecd09a", "#ffffff", "#c9d6ff"];          // special page (dark photo)
    var NIGHT = ["#7dd3fc", "#c4b5fd", "#f9a8d4", "#fde68a", "#86efac", "#ffffff"];       // dark theme
    var DAY = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];         // light theme (stronger, so they show on pale glass)
    function palette() { return special ? SKY : (root.getAttribute("data-theme") === "dark" ? NIGHT : DAY); }
    var KINDS = special ? ["heart", "star", "heart", "dot", "star"] : ["star", "dot", "diamond", "star", "dot"];
    var BASE = { dot: 12, star: 18, diamond: 14, heart: 20 };

    function room() { return layer && layer.childElementCount < 90; }
    function particle(kind, color) {
        var p = el("i", "fx-p fx-" + kind);
        p.style.setProperty("--pc", color);
        return p;
    }
    function fly(p, x, y, dx, dy, fall, dur, spin, size) {
        p.style.left = x + "px";
        p.style.top = y + "px";
        layer.appendChild(p);
        var k = size / BASE[p.className.split(" ")[1].slice(3)];
        if (!p.animate) { setTimeout(function () { p.remove(); }, dur); return; }
        var a = p.animate([
            { transform: "translate(-50%,-50%) translate(0,0) scale(" + (k * 0.2) + ") rotate(0deg)", opacity: 1 },
            { transform: "translate(-50%,-50%) translate(" + (dx * 0.65) + "px," + (dy * 0.65) + "px) scale(" + k + ") rotate(" + (spin * 0.5) + "deg)", opacity: 1, offset: 0.38 },
            { transform: "translate(-50%,-50%) translate(" + dx + "px," + (dy + fall) + "px) scale(" + (k * 0.15) + ") rotate(" + spin + "deg)", opacity: 0 }
        ], { duration: dur, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" });
        a.onfinish = function () { p.remove(); };
    }
    function ring(x, y, color) {
        var r = el("i", "fx-ripple");
        r.style.left = x + "px";
        r.style.top = y + "px";
        r.style.setProperty("--pc", color || "#ffffff");
        layer.appendChild(r);
        if (!r.animate) { setTimeout(function () { r.remove(); }, 700); return; }
        r.animate([
            { transform: "translate(-50%,-50%) scale(0.12)", opacity: 0.85 },
            { transform: "translate(-50%,-50%) scale(1)", opacity: 0 }
        ], { duration: 720, easing: "cubic-bezier(.15,.7,.25,1)", fill: "forwards" }).onfinish = function () { r.remove(); };
    }
    function burst(x, y, n, tint) {
        if (reduce || !layer) { return; }
        var free = 90 - layer.childElementCount;          // never more than 90 pieces at a time
        if (free < 3) { return; }
        var pal = palette();
        ring(x, y, tint || pal[0]);
        if (lite) { n = Math.ceil(n / 2); }
        n = Math.min(n, free - 1);
        for (var i = 0; i < n; i++) {
            var kind = pick(KINDS), a = rnd(0, 6.2832), d = rnd(34, 96);
            fly(particle(kind, tint && i % 2 ? tint : pick(pal)), x, y,
                Math.cos(a) * d, Math.sin(a) * d - 10, rnd(18, 46), rnd(650, 1150), rnd(-160, 160), rnd(11, 24));
        }
    }
    function trail(x, y) {
        if (reduce || !layer || !room()) { return; }
        var kind = Math.random() < 0.5 ? "dot" : "star";
        fly(particle(kind, pick(palette())), x + rnd(-4, 4), y + rnd(-4, 4), rnd(-16, 16), rnd(6, 22), 18, rnd(480, 760), rnd(-90, 90), rnd(6, 11));
    }
    function rain() {
        if (reduce || !layer) { return; }
        var h = window.innerHeight, w = window.innerWidth;
        var pal = palette();
        var total = Math.min(lite ? 22 : 44, 120 - layer.childElementCount);
        for (var i = 0; i < total; i++) {
            var kind = pick(KINDS);
            var p = particle(kind, pick(pal));
            p.style.left = rnd(0, w) + "px";
            p.style.top = "-24px";
            layer.appendChild(p);
            var k = rnd(0.7, 1.35), sway = rnd(-70, 70);
            if (!p.animate) { p.remove(); continue; }
            p.animate([
                { transform: "translate(-50%,-50%) translate(0,0) scale(" + k + ") rotate(0deg)", opacity: 1 },
                { transform: "translate(-50%,-50%) translate(" + sway + "px," + (h * 0.55) + "px) scale(" + k + ") rotate(" + rnd(120, 420) + "deg)", opacity: 1, offset: 0.6 },
                { transform: "translate(-50%,-50%) translate(" + (sway * -0.4) + "px," + (h + 50) + "px) scale(" + k + ") rotate(" + rnd(300, 700) + "deg)", opacity: 0.9 }
            ], { duration: rnd(2200, 3800), delay: rnd(0, 700), easing: "cubic-bezier(.3,.1,.5,1)", fill: "both" }).onfinish = (function (n) { return function () { n.remove(); }; })(p);
        }
    }

    // ---------- floating shapes (home + login) ----------
    var BLOBS = [
        "--w:54vmax;--h:44vmax;left:-20vmax;top:-17vmax;--c:var(--fx-b1);--d:26s;--dl:-3s",
        "--w:46vmax;--h:52vmax;right:-18vmax;top:-6vmax;--c:var(--fx-b2);--d:31s;--dl:-11s",
        "--w:52vmax;--h:40vmax;left:-15vmax;bottom:-17vmax;--c:var(--fx-b3);--d:29s;--dl:-7s",
        "--w:42vmax;--h:42vmax;right:-11vmax;bottom:-15vmax;--c:var(--fx-b4);--d:34s;--dl:-16s",
        "--w:38vmax;--h:34vmax;left:28vw;top:34vh;--c:var(--fx-b5);--d:37s;--dl:-9s"
    ];
    // kind, left %, top %, size (vmin), colour, depth, float seconds
    var SHAPES = [
        ["sphere", 6, 9, 15, "pink", 0.95, 9],
        ["ring", 78, 6, 21, "sky", 0.7, 12],
        ["pill", 66, 76, 24, "lilac", 1, 10],
        ["bubble", 3, 60, 26, "", 0.55, 13],
        ["squircle", 85, 38, 12, "peach", 0.85, 8.5],
        ["sphere", 22, 86, 9, "mint", 1.1, 7.5],
        ["bubble", 88, 80, 12, "", 0.6, 11],
        ["ring", 12, 36, 9, "pink", 0.8, 9.5],
        ["sphere", 58, 3, 7, "sky", 1.2, 8],
        ["pill", -2, 88, 18, "peach", 0.65, 12]
    ];
    function buildHome() {
        var w = el("div", "fx-world");
        w.setAttribute("aria-hidden", "true");
        BLOBS.forEach(function (css) { w.appendChild(el("i", "fx-blob", css)); });
        SHAPES.forEach(function (s, i) {
            var wrap = el("i", "fx-s", "left:" + s[1] + "%;top:" + s[2] + "%;--z:" + s[5]);
            var b = el("b", "fx-b fx-" + s[0] + (s[4] ? " fx-" + s[4] : ""),
                "--s:" + s[3] + ";--d:" + s[6] + "s;--dl:" + (-i * 1.7).toFixed(1) + "s;--fx:" + Math.round(rnd(-16, 16)) + "px;--fy:" + Math.round(rnd(-26, -10)) + "px;--r:" + Math.round(rnd(-40, 40)) + "deg");
            wrap.appendChild(b);
            w.appendChild(wrap);
        });
        doc.body.insertBefore(w, doc.body.firstChild);
        return w;
    }
    function popShapes(x, y) {
        qa(".fx-s").forEach(function (s) {
            var b = s.firstChild.getBoundingClientRect();
            var cx = b.left + b.width / 2, cy = b.top + b.height / 2, r = Math.max(b.width, b.height) / 2 + 8;
            if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r) {
                s.classList.remove("pop");
                void s.offsetWidth;
                s.classList.add("pop");
                burst(cx, cy, 14, getComputedStyle(s.firstChild).getPropertyValue("--c2").trim() || null);
            }
        });
    }

    // ---------- special page: drifting lights + a shooting star ----------
    function attach(world) {
        if (!world || world.querySelector(".fx-world")) { return; }
        addFilter();
        var w = el("div", "fx-world fx-sky-world");
        w.setAttribute("aria-hidden", "true");
        var n = lite ? 6 : 13;
        for (var i = 0; i < n; i++) {
            var size = rnd(5, 26);
            w.appendChild(el("i", "fx-orb",
                "left:" + rnd(2, 96).toFixed(1) + "%;width:" + size.toFixed(1) + "px;height:" + size.toFixed(1) + "px;--o:" + rnd(0.25, 0.7).toFixed(2) +
                ";--d:" + rnd(15, 30).toFixed(1) + "s;--dl:" + (-rnd(0, 30)).toFixed(1) + "s;--sw:" + Math.round(rnd(-26, 26)) + "px"));
        }
        world.insertBefore(w, world.firstChild);
        parTargets.push(w);
        var bg = world.querySelector(".bg-image");
        if (bg) { parTargets.push(bg); }
        function shoot() {
            if (!doc.hidden && !reduce && !lite && w.isConnected) {
                var s = el("i", "fx-shoot");
                var W = world.clientWidth || 360, H = world.clientHeight || 640;
                var sx = rnd(W * 0.45, W * 1.0), sy = rnd(H * 0.04, H * 0.26);
                var len = rnd(190, 300), ang = rnd(28, 40) * Math.PI / 180;
                s.style.left = sx + "px";
                s.style.top = sy + "px";
                s.style.transform = "rotate(" + (180 - ang * 180 / Math.PI) + "deg)";
                w.appendChild(s);
                if (s.animate) {
                    var dx = -Math.cos(ang) * len * 1.6, dy = Math.sin(ang) * len * 1.6;
                    s.animate([
                        { translate: "0 0", opacity: 0 },
                        { translate: (dx * 0.15) + "px " + (dy * 0.15) + "px", opacity: 1, offset: 0.12 },
                        { translate: dx + "px " + dy + "px", opacity: 0 }
                    ], { duration: rnd(900, 1400), easing: "cubic-bezier(.3,.1,.6,1)", fill: "forwards" }).onfinish = function () { s.remove(); };
                } else { s.remove(); }
            }
            setTimeout(shoot, rnd(6500, 12500));
        }
        setTimeout(shoot, 4200);
        sampleFrames(2800);
    }

    // ---------- slow phones: drop the heavy parts automatically ----------
    var sampled = false;
    function sampleFrames(wait) {
        if (sampled || lite || reduce || forced || navigator.webdriver) { return; }
        sampled = true;
        setTimeout(function run() {
            if (doc.hidden) { setTimeout(run, 1500); return; }
            var gaps = [], last = 0, count = 0;
            function frame(t) {
                if (last) { gaps.push(t - last); }
                last = t;
                if (++count < 110 && !doc.hidden) { requestAnimationFrame(frame); return; }
                if (gaps.length < 40) { return; }
                gaps.sort(function (a, b) { return a - b; });
                if (gaps[Math.floor(gaps.length / 2)] > 40) {
                    lite = true;
                    root.classList.add("fx-lite");
                    try { localStorage.setItem("gvccFxLite", String(Date.now())); } catch (e) { }
                }
            }
            requestAnimationFrame(frame);
        }, wait);
    }

    // ---------- events ----------
    var lastTrail = 0, eggTaps = 0, eggTimer = 0, downNow = false;
    function interactive(t) {
        return !!(t && t.closest && t.closest("button,input,textarea,a,select,label,.landing-card,.login-card,.glass-panel,.action-btn"));
    }
    function eggTarget() { return special ? doc.querySelector(".live-timer") : doc.querySelector(".landing-logo,.login-logo"); }
    function bind() {
        layer = el("div", "fx-layer");
        layer.setAttribute("aria-hidden", "true");
        doc.body.appendChild(layer);

        doc.addEventListener("pointerdown", function (e) {
            downNow = true;
            var x = e.clientX, y = e.clientY;
            spot(x, y);
            burst(x, y, special ? 9 : 10);
            if (!special && !interactive(e.target)) { popShapes(x, y); }
            var egg = eggTarget();
            if (egg) {
                var r = egg.getBoundingClientRect();
                if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                    if (!special) { egg.classList.remove("fx-bounce"); void egg.offsetWidth; egg.classList.add("fx-bounce"); }
                    eggTaps++;
                    clearTimeout(eggTimer);
                    eggTimer = setTimeout(function () { eggTaps = 0; }, 2200);
                    if (eggTaps >= 5) { eggTaps = 0; rain(); }
                }
            }
        }, { passive: true, capture: true });
        doc.addEventListener("pointerup", function () { downNow = false; }, { passive: true, capture: true });
        doc.addEventListener("pointercancel", function () { downNow = false; }, { passive: true, capture: true });
        doc.addEventListener("pointermove", function (e) {
            var x = e.clientX, y = e.clientY;
            if (e.pointerType === "mouse" || downNow) {
                parSet((x / window.innerWidth - 0.5) * 2, (y / window.innerHeight - 0.5) * 2);
                spot(x, y);
            }
            var now = Date.now();
            if ((e.pointerType === "mouse" || downNow) && now - lastTrail > 55) { lastTrail = now; trail(x, y); }
        }, { passive: true });
        doc.addEventListener("mouseleave", function () { parSet(0, 0); }, { passive: true });
        window.addEventListener("blur", function () { parSet(0, 0); });

        var g0 = null, b0 = null;
        window.addEventListener("deviceorientation", function (e) {
            if (e.gamma == null || e.beta == null) { return; }
            if (g0 === null) { g0 = e.gamma; b0 = e.beta; }
            g0 += (e.gamma - g0) * 0.004;
            b0 += (e.beta - b0) * 0.004;
            parSet((e.gamma - g0) / 18, (e.beta - b0) / 18);
        }, { passive: true });
    }

    window.gvccFx = { attach: attach, burst: burst, isLite: function () { return lite; } };

    onReady(function () {
        addFilter();
        if (!special) {
            var w = buildHome();
            parTargets.push(w);
            cards = qa(".landing-card,.login-card");
            sampleFrames(2200);
        }
        bind();
    });
})();
