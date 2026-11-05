/* Shiny: micro-interactions and component behaviour as window.Shiny. No dependencies, no network.
   Colours are read from tokens.css at run time (hex fallbacks only if a page has no tokens).
   Everything is a no-op under prefers-reduced-motion. */
(function () {
  "use strict";
  var w = window, doc = document;
  if (w.Shiny && w.Shiny.__ready) return;

  var never = { matches: false, addEventListener: function () {} };
  var reduce = w.matchMedia ? w.matchMedia("(prefers-reduced-motion: reduce)") : never;
  var fine = w.matchMedia ? w.matchMedia("(hover: hover) and (pointer: fine)") : never;
  function motionOK() { return !reduce.matches; }

  function cssVar(name, fallback) {
    var v = getComputedStyle(doc.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function palette(list) { return list.map(function (p) { return cssVar(p[0], p[1]); }); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  var STARLIGHT = [["--ctp-text", "#cad3f5"], ["--ctp-text", "#cad3f5"], ["--ctp-lavender", "#b7bdf8"], ["--ctp-mauve", "#c6a0f6"], ["--ctp-blue", "#8aadf4"], ["--ctp-teal", "#8bd5ca"], ["--ctp-pink", "#f5bde6"]];
  var SHOOTING = [["--ctp-mauve", "#c6a0f6"], ["--ctp-blue", "#8aadf4"], ["--ctp-pink", "#f5bde6"], ["--ctp-teal", "#8bd5ca"]];
  var SPARKS = [["--ctp-mauve", "#c6a0f6"], ["--ctp-blue", "#8aadf4"], ["--ctp-teal", "#8bd5ca"], ["--ctp-pink", "#f5bde6"], ["--ctp-lavender", "#b7bdf8"], ["--ctp-sky", "#91d7e3"], ["--ctp-yellow", "#eed49f"]];

  /* ---------- Starfield: draws into a canvas.sh-stars, sized to its box ---------- */
  function starfield(canvas) {
    if (!canvas || !canvas.getContext || canvas.__shStop) return canvas && canvas.__shStop || function () {};
    var ctx = canvas.getContext("2d");
    if (!ctx) return function () {};
    var colors = palette(STARLIGHT), shootColors = palette(SHOOTING);
    var W = 1, H = 1, stars = [], shooting = null, raf = 0, alive = true;
    var px = 0, py = 0, tx = 0, ty = 0;

    function makeStar(anyY) {
      return {
        x: Math.random() * W, y: anyY ? Math.random() * H : H + 4,
        r: Math.random() * 1.15 + 0.3, z: Math.random() * 0.8 + 0.2, c: pick(colors),
        t: Math.random() * Math.PI * 2, s: Math.random() * 0.025 + 0.006, v: Math.random() * 0.07 + 0.015
      };
    }
    function resize() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(w.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(clamp((W * H) / 9500, 40, 150));
      stars = [];
      for (var i = 0; i < n; i++) stars.push(makeStar(true));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      px += (tx - px) * 0.04; py += (ty - py) * 0.04;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.t += s.s; s.y -= s.v * s.z;
        if (s.y < -4) { var n = makeStar(false); for (var k in n) s[k] = n[k]; }
        var a = (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.t))) * s.z;
        var x = s.x - px * s.z * 18, y = s.y - py * s.z * 18;
        ctx.globalAlpha = a; ctx.fillStyle = s.c;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.r > 1.25 && a > 0.75) {
          ctx.globalAlpha = (a - 0.75) * 2;
          ctx.fillRect(x - s.r * 3, y - 0.25, s.r * 6, 0.5);
          ctx.fillRect(x - 0.25, y - s.r * 3, 0.5, s.r * 6);
        }
      }
      if (!shooting && Math.random() < 0.0018) {
        shooting = { x: W * (0.35 + Math.random() * 0.65), y: H * Math.random() * 0.35,
          vx: -(5 + Math.random() * 4), vy: 2 + Math.random() * 2, life: 1, c: pick(shootColors) };
      }
      if (shooting) {
        var sh = shooting; sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.012;
        var len = Math.hypot(sh.vx, sh.vy), ex = sh.x - (sh.vx / len) * 90, ey = sh.y - (sh.vy / len) * 90;
        var g = ctx.createLinearGradient(sh.x, sh.y, ex, ey);
        g.addColorStop(0, sh.c); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = clamp(sh.life, 0, 1) * 0.9; ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(ex, ey); ctx.stroke();
        if (sh.life <= 0 || sh.x < -90 || sh.y > H + 90) shooting = null;
      }
      ctx.globalAlpha = 1;
      raf = w.requestAnimationFrame(frame);
    }
    function run() {
      w.cancelAnimationFrame(raf);
      if (alive && !doc.hidden && motionOK()) raf = w.requestAnimationFrame(frame);
    }
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / W - 0.5; ty = (e.clientY - r.top) / H - 0.5;
    }
    var ro = w.ResizeObserver ? new w.ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas); else w.addEventListener("resize", resize);
    w.addEventListener("pointermove", onMove, { passive: true });
    doc.addEventListener("visibilitychange", run);
    if (reduce.addEventListener) reduce.addEventListener("change", run);
    resize(); run();
    w.requestAnimationFrame(function () { if (alive) canvas.classList.add("is-on"); });

    function stop() {
      alive = false; w.cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else w.removeEventListener("resize", resize);
      w.removeEventListener("pointermove", onMove);
      doc.removeEventListener("visibilitychange", run);
      canvas.classList.remove("is-on"); ctx.clearRect(0, 0, W, H);
      canvas.__shStop = null;
    }
    canvas.__shStop = stop;
    return stop;
  }

  /* ---------- Sparks: a burst of sparkles at a viewport point ---------- */
  function sparks(x, y, count) {
    if (!motionOK() || !doc.body) return;
    count = count || 12;
    var colors = palette(SPARKS);
    for (var i = 0; i < count; i++) {
      var s = doc.createElement("span");
      var ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      var dist = 28 + Math.random() * 34, size = 6 + Math.random() * 6;
      s.className = "sh-spark";
      s.setAttribute("aria-hidden", "true");
      s.style.left = x - size / 2 + "px"; s.style.top = y - size / 2 + "px";
      s.style.width = s.style.height = size + "px";
      s.style.color = pick(colors);
      s.style.animationDelay = Math.random() * 60 + "ms";
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      doc.body.appendChild(s);
      setTimeout(s.remove.bind(s), 850);
    }
  }

  /* ---------- Spotlight: the card's accent light follows the pointer ---------- */
  function spotlight(card, e) {
    var r = card.getBoundingClientRect();
    card.style.setProperty("--sh-mx", e.clientX - r.left + "px");
    card.style.setProperty("--sh-my", e.clientY - r.top + "px");
  }

  /* ---------- Logo boop and field shake ---------- */
  function boop(logo) {
    if (!motionOK() || !logo) return;
    logo.classList.remove("is-booped"); void logo.offsetWidth; logo.classList.add("is-booped");
    setTimeout(function () { logo.classList.remove("is-booped"); }, 650);
    var r = logo.getBoundingClientRect();
    sparks(r.left + r.width / 2, r.top + r.height / 2, 10);
  }
  function shake(el) {
    if (!motionOK() || !el) return;
    el.classList.remove("sh-shake"); void el.offsetWidth; el.classList.add("sh-shake");
  }


  /* ---------- Toast: Shiny.toast("Saved", { tone, title, timeout, position }) ---------- */
  var TONE_ICON = { info: "info", success: "circle-check", warning: "triangle-alert", danger: "alert" };
  function toast(message, opts) {
    opts = opts || {};
    var tone = TONE_ICON[opts.tone] ? opts.tone : "info";
    var timeout = opts.timeout == null ? 5000 : +opts.timeout;
    var pos = /^(top|bottom)-(start|center|end)$/.test(opts.position || "") ? opts.position : "bottom-end";
    var host = doc.querySelector('.sh-toast[data-sh-toast="' + pos + '"]');
    if (!host) {
      host = doc.createElement("div");
      host.className = "sh-toast" + (pos.indexOf("top") === 0 ? " sh-toast--top" : "") +
        (/start$/.test(pos) ? " sh-toast--start" : /center$/.test(pos) ? " sh-toast--center" : "");
      host.setAttribute("data-sh-toast", pos);
      host.setAttribute("role", "region");
      host.setAttribute("aria-label", "Notifications");
      doc.body.appendChild(host);
    }
    var el = doc.createElement("div");
    el.className = "sh-alert sh-alert--" + tone;
    el.setAttribute("role", tone === "danger" ? "alert" : "status");
    var icon = doc.createElement("span");
    icon.className = "sh-icon"; icon.setAttribute("data-icon", TONE_ICON[tone]); icon.setAttribute("aria-hidden", "true");
    var body = doc.createElement("div");
    body.className = "sh-alert__body";
    if (opts.title) {
      var t = doc.createElement("p"); t.className = "sh-alert__title"; t.textContent = opts.title; body.appendChild(t);
    }
    var d = doc.createElement("p");
    d.className = opts.title ? "sh-alert__desc" : "";
    d.style.margin = "0";
    d.textContent = message;
    body.appendChild(d);
    var actions = doc.createElement("div");
    actions.className = "sh-alert__actions";
    var close = doc.createElement("button");
    close.type = "button"; close.className = "sh-btn sh-btn--icon sh-btn--xs"; close.setAttribute("aria-label", "Dismiss");
    var x = doc.createElement("span"); x.className = "sh-icon"; x.setAttribute("data-icon", "x"); x.setAttribute("aria-hidden", "true");
    close.appendChild(x); actions.appendChild(close);
    el.appendChild(icon); el.appendChild(body); el.appendChild(actions);
    if (timeout > 0) { el.setAttribute("data-timeout", ""); el.style.setProperty("--sh-timeout", timeout + "ms"); }
    host.appendChild(el);
    function dismiss() {
      if (el.__gone) return;
      el.__gone = true;
      if (!motionOK()) { el.remove(); return; }
      el.classList.add("is-leaving");
      setTimeout(function () { el.remove(); }, 220);
    }
    close.addEventListener("click", dismiss);
    if (timeout > 0) setTimeout(dismiss, timeout);
    return dismiss;
  }

  /* ---------- Small helpers for the component set ---------- */
  function rangeFill(r) {
    var min = +r.min || 0, max = r.max === "" ? 100 : +r.max, v = +r.value;
    r.style.setProperty("--sh-pct", ((v - min) / ((max - min) || 1)) * 100 + "%");
  }
  function diffSet(r) {
    var d = r.closest(".sh-diff");
    if (d) d.style.setProperty("--sh-pos", r.value + "%");
  }
  function selectTab(tab, focus) {
    var list = tab.closest('[role="tablist"]');
    if (!list) return;
    var tabs = list.querySelectorAll('[role="tab"]');
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i], on = t === tab, panel = doc.getElementById(t.getAttribute("aria-controls") || "");
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (panel) panel.hidden = !on;
    }
    if (focus) tab.focus();
  }
  function otpDigits(g) { return Array.prototype.slice.call(g.querySelectorAll(".sh-otp__digit")); }
  function otpCheck(g) {
    var ds = otpDigits(g), code = ds.map(function (d) { return d.value; }).join("");
    var done = ds.length > 0 && code.length === ds.length;
    g.classList.toggle("is-complete", done);
    if (done) g.dispatchEvent(new CustomEvent("sh-otp-complete", { bubbles: true, detail: { code: code } }));
  }
  function galleryShow(g, idx) {
    var items = Array.prototype.filter.call(g.children, function (c) { return !c.classList.contains("sh-gallery__pips"); });
    var pips = g.querySelector(".sh-gallery__pips");
    if (pips && pips.children.length !== items.length) {
      pips.textContent = "";
      for (var k = 0; k < items.length; k++) pips.appendChild(doc.createElement("i"));
    }
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("is-active", i === idx);
      if (pips) pips.children[i].classList.toggle("is-active", i === idx);
    }
    g.classList.toggle("is-hovering", idx > -1);
  }
  function textRotate(el) {
    var track = el.querySelector(".sh-text-rotate__track");
    if (!track || track.__shRot) return function () {};
    var items = Array.prototype.slice.call(track.children);
    if (items.length < 2) return function () {};
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", items.map(function (n) { return n.textContent.trim(); }).join(", "));
    track.setAttribute("aria-hidden", "true");
    var clone = items[0].cloneNode(true);
    track.appendChild(clone);
    var all = items.concat([clone]), i = 0;
    all[0].classList.add("is-active");
    /* the box takes the width of the word showing, so a centred title stays centred */
    function fit() { el.style.width = all[i].offsetWidth + "px"; }
    function show(n) {
      i = n;
      track.style.setProperty("--sh-i", String(n));
      for (var k = 0; k < all.length; k++) all[k].classList.toggle("is-active", k === n);
      fit();
    }
    fit();
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fit);
    w.addEventListener("resize", fit);
    var timer = setInterval(function () {
      if (!motionOK() || doc.hidden) return;
      show(i + 1);
      if (i === all.length - 1) {
        setTimeout(function () {
          track.classList.add("is-resetting");
          show(0);
          void track.offsetWidth;
          track.classList.remove("is-resetting");
        }, 650);
      }
    }, +el.getAttribute("data-interval") || 2400);
    track.__shRot = true;
    return function () { clearInterval(timer); w.removeEventListener("resize", fit); clone.remove(); track.__shRot = false; show(0); el.style.width = ""; };
  }
  function carousel(wrap) {
    var c = wrap.querySelector(".sh-carousel");
    if (!c || c.__shCar) return function () {};
    c.__shCar = true;
    var items = Array.prototype.slice.call(c.querySelectorAll(".sh-carousel__item"));
    var dots = Array.prototype.slice.call(wrap.querySelectorAll(".sh-carousel__dot"));
    function mark(idx) { for (var k = 0; k < dots.length; k++) dots[k].setAttribute("aria-current", k === idx ? "true" : "false"); }
    var vis = [];
    var io = w.IntersectionObserver ? new w.IntersectionObserver(function (es) {
      for (var k = 0; k < es.length; k++) {
        var ix = items.indexOf(es[k].target), at = vis.indexOf(ix);
        if (es[k].isIntersecting && at < 0) vis.push(ix);
        if (!es[k].isIntersecting && at > -1) vis.splice(at, 1);
      }
      if (vis.length) mark(Math.min.apply(Math, vis));
    }, { root: c, threshold: 0.6 }) : null;
    if (io) items.forEach(function (it) { io.observe(it); });
    mark(0);
    function go(idx) {
      idx = Math.max(0, Math.min(items.length - 1, idx));
      var it = items[idx];
      if (it) c.scrollTo({ left: it.offsetLeft - c.offsetLeft, top: it.offsetTop - c.offsetTop, behavior: motionOK() ? "smooth" : "auto" });
    }
    function current() {
      for (var k = 0; k < dots.length; k++) if (dots[k].getAttribute("aria-current") === "true") return k;
      return 0;
    }
    function onClick(e) {
      var dot = e.target.closest(".sh-carousel__dot"), btn = e.target.closest("[data-dir]");
      if (dot && wrap.contains(dot)) { e.preventDefault(); go(dots.indexOf(dot)); }
      else if (btn && wrap.contains(btn)) { e.preventDefault(); go(current() + (btn.getAttribute("data-dir") === "prev" ? -1 : 1)); }
    }
    wrap.addEventListener("click", onClick);
    return function () { if (io) io.disconnect(); wrap.removeEventListener("click", onClick); c.__shCar = false; };
  }

  /* ---------- Showcase carousel: one slide in front, its neighbours either side, looping ----------
     Every slide gets data-pos -2 … 2 (CSS places it); ±2 are parked out of sight. */
  var SHOW_FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]";
  function showcase(root) {
    var track = root.querySelector(".sh-showcase__track");
    if (!track || track.__shShow) return function () {};
    var slides = Array.prototype.filter.call(track.children, function (c) { return c.classList.contains("sh-showcase__slide"); });
    var n = slides.length;
    if (!n) return function () {};
    track.__shShow = true;
    var dots = Array.prototype.slice.call(root.querySelectorAll(".sh-carousel__dot"));
    var cur = 0, added = [], k;
    function give(el, name, value) { if (!el.hasAttribute(name)) { el.setAttribute(name, value); added.push([el, name]); } }
    give(root, "aria-roledescription", "carousel");
    give(track, "aria-live", "polite");
    for (k = 0; k < n; k++) {
      if (slides[k].getAttribute("aria-current") === "true") cur = k;
      give(slides[k], "role", "group");
      give(slides[k], "aria-roledescription", "slide");
      give(slides[k], "aria-label", (k + 1) + " of " + n);
    }
    function wrapI(i) { return ((i % n) + n) % n; }
    /* where slide i sits relative to the front; the one straight opposite goes the way things are moving */
    function offset(i, travel) { var d = wrapI(i - cur); if (d > n / 2 || (d === n / 2 && travel < 0)) d -= n; return d; }
    function put(el, p) { el.__shPos = p; el.setAttribute("data-pos", String(p)); }
    function snap(el, p) { el.style.transition = "none"; put(el, p); void el.offsetWidth; el.style.transition = ""; }
    function render(travel) {
      for (var i = 0; i < n; i++) {
        var el = slides[i], v = clamp(offset(i, travel), -2, 2), c = el.__shPos, front = v === 0;
        if (c === undefined || !travel || (Math.abs(c) === 2 && Math.abs(v) === 2)) snap(el, v);
        else if ((v - c) * travel < 0) {
          /* it went round the loop: leave toward the side everything moves to, come back in from the other */
          if (Math.abs(v) === 2) put(el, clamp(c + travel, -2, 2));
          else { snap(el, v > 0 ? 2 : -2); put(el, v); }
        } else put(el, v);
        if (front) { el.setAttribute("aria-current", "true"); el.removeAttribute("aria-hidden"); }
        else { el.removeAttribute("aria-current"); el.setAttribute("aria-hidden", "true"); }
        /* only the front slide is in the tab order */
        var fs = el.querySelectorAll(SHOW_FOCUSABLE);
        for (var f = 0; f < fs.length; f++) {
          if (!("__shTab" in fs[f])) fs[f].__shTab = fs[f].getAttribute("tabindex");
          if (!front) fs[f].setAttribute("tabindex", "-1");
          else if (fs[f].__shTab === null) fs[f].removeAttribute("tabindex");
          else fs[f].setAttribute("tabindex", fs[f].__shTab);
        }
      }
      for (var j = 0; j < dots.length; j++) dots[j].setAttribute("aria-current", j === cur ? "true" : "false");
    }
    function go(idx) {
      var to = wrapI(idx);
      if (to === cur) return;
      var steps = wrapI(to - cur);
      if (steps > n / 2) steps -= n;
      var hadFocus = track.contains(doc.activeElement);
      cur = to;
      render(-steps);
      if (hadFocus) { var f = slides[cur].querySelector(SHOW_FOCUSABLE); if (f) f.focus({ preventScroll: true }); }
    }
    render(0);

    var swiped = false, swipeTimer = 0, down = false, sx = 0, sy = 0;
    function onClick(e) {
      var t = e.target;
      if (!t.closest) return;
      if (swiped) { e.preventDefault(); swiped = false; return; }
      var dot = t.closest(".sh-carousel__dot"), btn = t.closest("[data-dir]"), slide = t.closest(".sh-showcase__slide");
      if (dot && root.contains(dot)) { e.preventDefault(); go(dots.indexOf(dot)); }
      else if (btn && root.contains(btn)) { e.preventDefault(); go(cur + (btn.getAttribute("data-dir") === "prev" ? -1 : 1)); }
      else if (slide) {
        /* a neighbour comes to the front instead of following its link */
        var ix = slides.indexOf(slide);
        if (ix > -1 && ix !== cur) { e.preventDefault(); go(ix); }
      }
    }
    function onKey(e) {
      var t = e.target;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (t.closest && t.closest("input, textarea, select, [contenteditable]")) return;
      var to = e.key === "ArrowRight" ? cur + 1 : e.key === "ArrowLeft" ? cur - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
      if (to === null) return;
      e.preventDefault();
      var onDot = dots.indexOf(t) > -1;
      go(to);
      if (onDot && dots[cur]) dots[cur].focus();
    }
    function onDown(e) { if (e.button > 0) return; down = true; sx = e.clientX; sy = e.clientY; }
    function onUp(e) {
      if (!down) return;
      down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      swiped = true;
      clearTimeout(swipeTimer);
      swipeTimer = setTimeout(function () { swiped = false; }, 400);
      go(cur + (dx < 0 ? 1 : -1));
    }
    function onCancel() { down = false; }
    function onDrag(e) { e.preventDefault(); }
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onCancel);
    track.addEventListener("dragstart", onDrag);
    return function () {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onCancel);
      track.removeEventListener("dragstart", onDrag);
      clearTimeout(swipeTimer);
      for (var i = 0; i < n; i++) {
        var el = slides[i];
        el.removeAttribute("data-pos"); el.removeAttribute("aria-hidden"); el.style.transition = ""; delete el.__shPos;
        if (i !== cur) el.removeAttribute("aria-current");
        var fs = el.querySelectorAll(SHOW_FOCUSABLE);
        for (var f = 0; f < fs.length; f++) {
          if (!("__shTab" in fs[f])) continue;
          if (fs[f].__shTab === null) fs[f].removeAttribute("tabindex"); else fs[f].setAttribute("tabindex", fs[f].__shTab);
          delete fs[f].__shTab;
        }
      }
      for (var j = 0; j < dots.length; j++) dots[j].removeAttribute("aria-current");
      for (var a = 0; a < added.length; a++) added[a][0].removeAttribute(added[a][1]);
      track.__shShow = false;
    };
  }

  /* ---------- Navbar: docks to the top edge, floats once its scroller moves; folds into a menu on narrow bars ---------- */
  var FLOAT_AT = 8;
  function scrollerOf(el) {
    for (var p = el.parentElement; p && p !== doc.body && p !== doc.documentElement; p = p.parentElement) {
      var o = getComputedStyle(p).overflowY;
      if (o === "auto" || o === "scroll" || o === "overlay") return p;
    }
    return w;
  }
  function navbar(bar) {
    if (bar.__shNav) return function () {};
    bar.__shNav = true;
    var offs = [];
    function on(t, type, fn, o) { t.addEventListener(type, fn, o); offs.push(function () { t.removeEventListener(type, fn, o); }); }

    if (!bar.classList.contains("sh-navbar--floating")) {
      var sc = scrollerOf(bar), raf = 0;
      var update = function () {
        raf = 0;
        var y = sc === w ? (w.scrollY || doc.documentElement.scrollTop || 0) : sc.scrollTop;
        bar.classList.toggle("is-floating", y > FLOAT_AT);
      };
      on(sc, "scroll", function () { if (!raf) raf = w.requestAnimationFrame(update); }, { passive: true });
      offs.push(function () { if (raf) w.cancelAnimationFrame(raf); bar.classList.remove("is-floating"); });
      update();
    }

    var toggle = bar.querySelector(".sh-navbar__toggle");
    if (toggle) {
      var isOpen = function () { return toggle.getAttribute("aria-expanded") === "true"; };
      var setOpen = function (open) { toggle.setAttribute("aria-expanded", open ? "true" : "false"); };
      if (!toggle.hasAttribute("aria-expanded")) setOpen(false);
      on(toggle, "click", function () { setOpen(!isOpen()); });
      on(doc, "click", function (e) {
        if (!isOpen()) return;
        var t = e.target, picked = t.closest && t.closest(".sh-navbar__center a");
        if (!bar.contains(t) || (picked && bar.contains(picked))) setOpen(false);
      });
      on(doc, "keydown", function (e) {
        if (e.key !== "Escape" || !isOpen()) return;
        var hadFocus = bar.contains(doc.activeElement);
        setOpen(false);
        if (hadFocus) toggle.focus();
      });
      if (w.ResizeObserver) {
        /* a bar that grows wide again shows its sections in a row: forget the open menu */
        var ro = new w.ResizeObserver(function () { if (isOpen() && getComputedStyle(toggle).display === "none") setOpen(false); });
        ro.observe(bar);
        offs.push(function () { ro.disconnect(); });
      }
    }
    return function () { while (offs.length) offs.pop()(); bar.__shNav = false; };
  }

  /* ---------- Table of contents: traces the rail, follows the reader, lights where they are ---------- */
  var SVG_NS = "http://www.w3.org/2000/svg";
  var READ_LINE = 0.25, AT_END = 2, TOC_EDGE = 12;
  var NAV_KEYS = { ArrowUp: 1, ArrowDown: 1, PageUp: 1, PageDown: 1, Home: 1, End: 1, " ": 1, Spacebar: 1 };
  function r2(n) { return Math.round(n * 100) / 100; }
  /* a bend is a cubic from (x0, y0) to (x1, y1) with both handles at the middle height: measure it by sampling */
  function bendLength(x0, y0, x1, y1) {
    var my = (y0 + y1) / 2, len = 0, px = x0, py = y0;
    for (var k = 1; k <= 16; k++) {
      var t = k / 16, u = 1 - t, a = u * u * u + 3 * u * u * t, b = 3 * u * t * t + t * t * t;
      var x = a * x0 + b * x1, y = u * u * u * y0 + 3 * u * t * my + t * t * t * y1;
      len += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py)); px = x; py = y;
    }
    return len;
  }
  function toc(box) {
    if (box.__shToc) return function () {};
    var nav = box.querySelector(".sh-toc__nav");
    var links = nav ? Array.prototype.slice.call(nav.querySelectorAll(".sh-toc__link")) : [];
    var targets = links.map(function (a) {
      var h = a.getAttribute("href") || "", id = h.charAt(0) === "#" ? h.slice(1) : "";
      try { id = decodeURIComponent(id); } catch (err) { /* keep it as written */ }
      return id ? doc.getElementById(id) : null;
    });
    var first = -1, last = -1;
    for (var i = 0; i < targets.length; i++) if (targets[i]) { if (first < 0) first = i; last = i; }
    if (first < 0) return function () {};
    box.__shToc = true;

    var offs = [], segs = [], total = 0, cur = -1, placed = false, pinned = null, seen = false, raf = 0, alive = true;
    function on(t, type, fn, o) { t.addEventListener(type, fn, o); offs.push(function () { t.removeEventListener(type, fn, o); }); }
    var authored = links.map(function (a) { var v = a.getAttribute("aria-current"); a.removeAttribute("aria-current"); return v; });
    var sc = scrollerOf(targets[first]);
    var host = scrollerOf(links[0]);
    if (host !== w && host.contains(targets[first])) host = w;

    var rail = doc.createElementNS(SVG_NS, "svg"), bends = doc.createElementNS(SVG_NS, "path"), lit = doc.createElementNS(SVG_NS, "path");
    rail.setAttribute("class", "sh-toc__rail"); rail.setAttribute("aria-hidden", "true"); rail.setAttribute("focusable", "false");
    bends.setAttribute("class", "sh-toc__bends"); lit.setAttribute("class", "sh-toc__lit");
    rail.appendChild(bends); rail.appendChild(lit);
    nav.insertBefore(rail, nav.firstChild);

    /* One path down every link's left edge (the light rides it); the bends and any gaps go in a second path. */
    function trace() {
      var nr = nav.getBoundingClientRect();
      if (!nr.width && !nr.height) return false;
      var d = "", b = "", len = 0, prev = null;
      segs = [];
      for (var k = 0; k < links.length; k++) {
        var r = links[k].getBoundingClientRect();
        var x = r2(r.left - nr.left + 1), top = r2(r.top - nr.top), bot = r2(r.bottom - nr.top);
        if (!prev) d += "M" + x + " " + top;
        else if (Math.abs(x - prev.x) < 0.5) {
          if (top - prev.bot > 0.5) b += "M" + x + " " + prev.bot + "L" + x + " " + top;
          d += "L" + x + " " + top; len += Math.max(0, top - prev.bot);
        } else {
          var my = r2((prev.bot + top) / 2), c = "C" + prev.x + " " + my + " " + x + " " + my + " " + x + " " + top;
          b += "M" + prev.x + " " + prev.bot + c; d += c; len += bendLength(prev.x, prev.bot, x, top);
        }
        segs.push({ start: len, length: bot - top });
        d += "L" + x + " " + bot; len += bot - top;
        prev = { x: x, bot: bot };
      }
      bends.setAttribute("d", b); lit.setAttribute("d", d); total = len;
      return true;
    }
    function light(k, glide) {
      var s = segs[k];
      if (!s) { lit.style.opacity = "0"; return; }
      if (!glide) lit.style.transition = "opacity var(--sh-duration-fast) var(--sh-ease-out)";
      lit.style.strokeDasharray = r2(s.length) + " " + r2(total + 1);
      lit.style.strokeDashoffset = String(r2(-s.start));
      lit.style.opacity = "1";
      if (!glide) { lit.getBoundingClientRect(); lit.style.transition = ""; }
    }
    function view() {
      if (sc === w) return { top: 0, height: w.innerHeight };
      return { top: sc.getBoundingClientRect().top + sc.clientTop, height: sc.clientHeight };
    }
    function atEnd() {
      var st, max;
      if (sc === w) { var se = doc.scrollingElement || doc.documentElement; st = se.scrollTop; max = se.scrollHeight - w.innerHeight; }
      else { st = sc.scrollTop; max = sc.scrollHeight - sc.clientHeight; }
      return max > AT_END && st >= max - AT_END;
    }
    /* the section being read: the last heading past a line a quarter of the way down; at the very end, the last */
    function reading() {
      if (pinned !== null) return pinned;
      if (atEnd()) return last;
      var v = view(), line = v.top + v.height * READ_LINE, k = first;
      for (var j = 0; j < targets.length; j++) if (targets[j] && targets[j].getBoundingClientRect().top <= line) k = j;
      return k;
    }
    /* a picked link stays lit until its heading has been in view and left it again */
    function checkPin() {
      if (pinned === null) return;
      var r = targets[pinned].getBoundingClientRect(), v = view();
      if (r.bottom >= v.top && r.top <= v.top + v.height) seen = true;
      else if (seen) { pinned = null; seen = false; }
    }
    function keepVisible(a) {
      if (host === w) return;
      var hr = host.getBoundingClientRect(), r = a.getBoundingClientRect();
      if (r.top < hr.top + TOC_EDGE) host.scrollTop += r.top - hr.top - TOC_EDGE;
      else if (r.bottom > hr.bottom - TOC_EDGE) host.scrollTop += r.bottom - hr.bottom + TOC_EDGE;
    }
    function select(k) {
      if (k === cur) return;
      if (cur >= 0) links[cur].removeAttribute("aria-current");
      cur = k;
      links[k].setAttribute("aria-current", "location");
      keepVisible(links[k]);
      light(k, placed && motionOK());
      placed = true;
    }
    function update() { raf = 0; checkPin(); select(reading()); }
    function schedule() { if (!raf) raf = w.requestAnimationFrame(update); }
    function refresh() { if (!alive) return; if (trace() && cur >= 0) light(cur, false); update(); }
    function unpin() { if (pinned !== null) { pinned = null; seen = false; schedule(); } }

    on(sc, "scroll", schedule, { passive: true });
    on(w, "resize", refresh, { passive: true });
    on(w, "wheel", unpin, { passive: true });
    on(w, "touchmove", unpin, { passive: true });
    on(w, "keydown", function (e) { if (NAV_KEYS[e.key]) unpin(); });
    on(nav, "click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest(".sh-toc__link") : null, k = links.indexOf(a), t = targets[k];
      if (!t) return;
      e.preventDefault();
      var m = parseFloat(getComputedStyle(t).scrollMarginTop) || 0, y;
      if (sc === w) y = t.getBoundingClientRect().top + (w.pageYOffset || 0) - m;
      else y = t.getBoundingClientRect().top - view().top + sc.scrollTop - m;
      pinned = k; seen = false;
      (sc === w ? w : sc).scrollTo({ top: Math.max(0, y), behavior: motionOK() ? "smooth" : "auto" });
      if (sc === w && w.history && w.history.replaceState) { try { w.history.replaceState(w.history.state, "", a.getAttribute("href")); } catch (err) { /* sandboxed */ } }
      select(k);
    });
    if (w.ResizeObserver) {
      /* a font swap, a wrap, or a closed Collapse opening: trace again */
      var ro = new w.ResizeObserver(refresh);
      ro.observe(nav);
      offs.push(function () { ro.disconnect(); });
    }
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refresh);
    refresh();

    return function () {
      alive = false;
      while (offs.length) offs.pop()();
      if (raf) w.cancelAnimationFrame(raf);
      if (rail.parentNode) rail.parentNode.removeChild(rail);
      for (var j = 0; j < links.length; j++) {
        if (authored[j] === null) links[j].removeAttribute("aria-current"); else links[j].setAttribute("aria-current", authored[j]);
      }
      box.__shToc = false;
    };
  }

  /* Opens or closes a checkbox-driven part (a Drawer), moving focus into it and back to its opener. */
  function setToggle(box, on) {
    if (box.checked === on) return;
    box.checked = on;
    box.dispatchEvent(new Event("change", { bubbles: true }));
    if (!box.classList.contains("sh-drawer__toggle")) return;
    var panel = box.parentNode.querySelector(".sh-drawer__panel");
    if (on && panel) {
      w.setTimeout(function () {
        var f = panel.querySelector('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (f) f.focus(); else { panel.tabIndex = -1; panel.focus(); }
      }, 60);
    } else if (!on && panel && panel.contains(doc.activeElement)) {
      var opener = doc.querySelector('[data-sh-open="' + box.id + '"]');
      if (opener) opener.focus();
    }
  }

  /* ---------- Wires the component set inside init() ---------- */
  function wireSet(host, on, offs, inside) {
    var i;
    var ranges = host.querySelectorAll(".sh-range");
    for (i = 0; i < ranges.length; i++) rangeFill(ranges[i]);
    var diffs = host.querySelectorAll(".sh-diff__range");
    for (i = 0; i < diffs.length; i++) diffSet(diffs[i]);
    var rots = host.querySelectorAll(".sh-text-rotate");
    for (i = 0; i < rots.length; i++) offs.push(textRotate(rots[i]));
    var cars = host.querySelectorAll(".sh-carousel-wrap");
    for (i = 0; i < cars.length; i++) offs.push(carousel(cars[i]));
    var shows = host.querySelectorAll(".sh-showcase");
    for (i = 0; i < shows.length; i++) offs.push(showcase(shows[i]));
    var bars = host.querySelectorAll(".sh-navbar");
    for (i = 0; i < bars.length; i++) offs.push(navbar(bars[i]));
    var tocs = host.querySelectorAll(".sh-toc");
    for (i = 0; i < tocs.length; i++) offs.push(toc(tocs[i]));

    on(doc, "input", function (e) {
      var t = e.target;
      if (!inside(t) || !t.classList) return;
      if (t.classList.contains("sh-range")) rangeFill(t);
      else if (t.classList.contains("sh-diff__range")) diffSet(t);
      else if (t.classList.contains("sh-otp__digit")) {
        var g = t.closest(".sh-otp"), ds = otpDigits(g), ix = ds.indexOf(t), v = t.value.replace(/\s/g, "");
        if (t.inputMode === "numeric" || t.getAttribute("inputmode") === "numeric") v = v.replace(/\D/g, "");
        if (v.length > 2) {
          /* a whole code arrived in one box (phone autofill): spread it along */
          for (var k = 0; k < v.length && ix + k < ds.length; k++) ds[ix + k].value = v[k];
          ds[Math.min(ds.length - 1, ix + v.length - 1)].focus();
        } else {
          t.value = v.slice(-1);
          if (t.value) { var nx = ds[ix + 1]; if (nx) nx.focus(); }
        }
        otpCheck(g);
      }
    });
    on(doc, "keydown", function (e) {
      var t = e.target;
      if (e.key === "Escape") {
        var drawers = host.querySelectorAll(".sh-drawer__toggle:checked");
        for (var q = 0; q < drawers.length; q++) setToggle(drawers[q], false);
        var open = host.querySelectorAll("details.sh-dropdown[open], details.sh-megamenu__item[open]");
        for (var k = 0; k < open.length; k++) {
          var hadFocus = open[k].contains(doc.activeElement);
          open[k].removeAttribute("open");
          if (hadFocus) { var s = open[k].querySelector("summary"); if (s) s.focus(); }
        }
      }
      if (!inside(t) || !t.closest) return;
      if (t.getAttribute && t.getAttribute("role") === "tab") {
        var list = t.closest('[role="tablist"]'), tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]:not([disabled])'));
        var at = tabs.indexOf(t), to = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (at + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (at - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") to = 0;
        else if (e.key === "End") to = tabs.length - 1;
        if (to > -1) { e.preventDefault(); selectTab(tabs[to], true); }
      }
      if (t.classList && t.classList.contains("sh-otp__digit")) {
        var ds = otpDigits(t.closest(".sh-otp")), ix = ds.indexOf(t);
        if (e.key === "Backspace" && !t.value && ix > 0) { e.preventDefault(); ds[ix - 1].value = ""; ds[ix - 1].focus(); otpCheck(t.closest(".sh-otp")); }
        else if (e.key === "ArrowLeft" && ix > 0) { e.preventDefault(); ds[ix - 1].focus(); }
        else if (e.key === "ArrowRight" && ix < ds.length - 1) { e.preventDefault(); ds[ix + 1].focus(); }
      }
    });
    on(doc, "focusin", function (e) {
      var t = e.target;
      if (inside(t) && t.classList && t.classList.contains("sh-otp__digit") && t.select) t.select();
    });
    on(doc, "paste", function (e) {
      var t = e.target;
      if (!inside(t) || !t.classList || !t.classList.contains("sh-otp__digit")) return;
      var g = t.closest(".sh-otp"), ds = otpDigits(g), text = (e.clipboardData || w.clipboardData).getData("text").replace(/\s/g, "");
      if (!text) return;
      e.preventDefault();
      var start = ds.indexOf(t);
      for (var k = 0; k < text.length && start + k < ds.length; k++) ds[start + k].value = text[k];
      var last = ds[Math.min(ds.length - 1, start + text.length - 1)];
      if (last) last.focus();
      otpCheck(g);
    });
    on(doc, "click", function (e) {
      var t = e.target;
      var open = host.querySelectorAll("details.sh-dropdown[open], details.sh-megamenu__item[open]");
      for (var k = 0; k < open.length; k++) {
        var picked = t.closest && t.closest(".sh-dropdown__content a, .sh-dropdown__content button, .sh-megamenu__panel a");
        if (!open[k].contains(t) || (picked && open[k].contains(picked))) open[k].removeAttribute("open");
      }
      if (!inside(t) || !t.closest) return;
      var tab = t.closest('[role="tab"]');
      if (tab && tab.closest(".sh-tabs")) selectTab(tab, false);
      var opener = t.closest("[data-sh-open]");
      if (opener) {
        var target = doc.getElementById(opener.getAttribute("data-sh-open"));
        if (target && target.showModal) { if (!target.open) target.showModal(); }
        else if (target && target.type === "checkbox") setToggle(target, !target.checked);
      }
      var closer = t.closest("[data-sh-close]");
      if (closer) {
        var cid = closer.getAttribute("data-sh-close"), ct = cid ? doc.getElementById(cid) : null;
        if (ct && ct.type === "checkbox") setToggle(ct, false);
        else { var dlg = closer.closest("dialog"); if (dlg) dlg.close(); }
      }
    });

    var tiltEl = null, galEl = null;
    on(doc, "pointermove", function (e) {
      var t = e.target && e.target.closest ? e.target : null;
      var tl = t && t.closest(".sh-tilt"), gl = t && t.closest(".sh-gallery");
      if (tiltEl && tiltEl !== tl) { tiltEl.classList.remove("is-tilting"); tiltEl.style.setProperty("--sh-rx", "0deg"); tiltEl.style.setProperty("--sh-ry", "0deg"); tiltEl = null; }
      if (galEl && galEl !== gl) { galleryShow(galEl, -1); galEl = null; }
      if (tl && inside(tl) && fine.matches && motionOK()) {
        var r = tl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        tl.style.setProperty("--sh-rx", ((0.5 - y) * 10).toFixed(2) + "deg");
        tl.style.setProperty("--sh-ry", ((x - 0.5) * 12).toFixed(2) + "deg");
        tl.style.setProperty("--sh-mx", e.clientX - r.left + "px");
        tl.style.setProperty("--sh-my", e.clientY - r.top + "px");
        tl.classList.add("is-tilting");
        tiltEl = tl;
      }
      if (gl && inside(gl)) {
        var gr = gl.getBoundingClientRect();
        var n = Array.prototype.filter.call(gl.children, function (c) { return !c.classList.contains("sh-gallery__pips"); }).length;
        galleryShow(gl, Math.max(0, Math.min(n - 1, Math.floor(((e.clientX - gr.left) / gr.width) * n))));
        galEl = gl;
      }
    }, { passive: true });
    on(doc.documentElement, "mouseleave", function () {
      if (tiltEl) { tiltEl.classList.remove("is-tilting"); tiltEl.style.setProperty("--sh-rx", "0deg"); tiltEl.style.setProperty("--sh-ry", "0deg"); tiltEl = null; }
      if (galEl) { galleryShow(galEl, -1); galEl = null; }
    });
  }

  /* ---------- init: wires everything inside a root; returns a teardown ---------- */
  function init(opts) {
    opts = opts || {};
    var root = opts.root || doc;
    var host = root === doc ? doc.documentElement : root;
    var offs = [];
    function on(target, type, fn, o) { target.addEventListener(type, fn, o); offs.push(function () { target.removeEventListener(type, fn, o); }); }
    function inside(el) { return el && host.contains(el); }

    if (opts.themeColor !== false && doc.head) {
      var m = doc.querySelector('meta[name="theme-color"]');
      if (!m) { m = doc.createElement("meta"); m.name = "theme-color"; doc.head.appendChild(m); }
      m.content = cssVar("--sh-page", "#24273a");
    }

    if (opts.stars !== false) {
      var canvases = host.querySelectorAll("canvas.sh-stars");
      for (var i = 0; i < canvases.length; i++) offs.push(starfield(canvases[i]));
    }

    if (opts.sparks !== false) {
      on(doc, "click", function (e) {
        var btn = e.target.closest && e.target.closest(".sh-btn--primary");
        if (!inside(btn) || btn.disabled || btn.getAttribute("aria-disabled") === "true") return;
        var x = e.clientX, y = e.clientY;
        if (!x && !y) { var r = btn.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
        sparks(x, y);
      }, true);
      on(doc, "click", function (e) {
        var logo = e.target.closest && e.target.closest(".sh-logo");
        if (inside(logo)) boop(logo);
      });
    }

    if (opts.spotlight !== false) {
      var pending = 0, last = null;
      on(doc, "pointermove", function (e) {
        if (!fine.matches || !motionOK()) return;
        last = e;
        if (pending) return;
        pending = w.requestAnimationFrame(function () {
          pending = 0;
          var cards = host.querySelectorAll(".sh-card:not(.sh-card--plain)");
          for (var j = 0; j < cards.length; j++) spotlight(cards[j], last);
        });
      }, { passive: true });
    }

    var dragDepth = new WeakMap();
    on(doc, "dragenter", function (e) {
      var d = e.target.closest && e.target.closest(".sh-drop");
      if (!inside(d)) return;
      dragDepth.set(d, (dragDepth.get(d) || 0) + 1); d.classList.add("is-dragover");
    });
    on(doc, "dragleave", function (e) {
      var d = e.target.closest && e.target.closest(".sh-drop");
      if (!inside(d)) return;
      var n = (dragDepth.get(d) || 1) - 1; dragDepth.set(d, n);
      if (n <= 0) d.classList.remove("is-dragover");
    });
    on(doc, "drop", function (e) {
      var d = e.target.closest && e.target.closest(".sh-drop");
      if (!inside(d)) return;
      dragDepth.set(d, 0); d.classList.remove("is-dragover");
    });

    on(doc, "animationend", function (e) {
      if (e.animationName === "sh-shake" && e.target.classList) e.target.classList.remove("sh-shake");
    });
    if (w.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        for (var k = 0; k < muts.length; k++) {
          var t = muts[k].target;
          if (t.getAttribute("aria-invalid") === "true" && (t.classList.contains("sh-input") || t.classList.contains("sh-otp"))) shake(t);
        }
      });
      mo.observe(host, { subtree: true, attributes: true, attributeFilter: ["aria-invalid"] });
      offs.push(function () { mo.disconnect(); });
    }

    wireSet(host, on, offs, inside);

    return function teardown() { while (offs.length) offs.pop()(); };
  }

  w.Shiny = {
    version: "2.3.0",
    __ready: true,
    init: init,
    starfield: starfield,
    sparks: sparks,
    spotlight: spotlight,
    boop: boop,
    shake: shake,
    toast: toast,
    selectTab: selectTab,
    motionOK: motionOK
  };
})();
