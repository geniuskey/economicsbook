/* Copyright (c) 2026 geniuskey and EconomicsBook contributors.
   Derived from MoneyBook (https://github.com/geniuskey/moneybook), MIT.
   Executable code: MIT (see ../LICENSE-MIT).
   Educational content and illustrations: CC-BY-4.0 (see ../LICENSE.md). */
/* ==========================================================================
   EconomicsBook 공통 스크립트 — 전역 객체 EB
   - 레이아웃(상단바, 목차, 이전/다음, 테마) 자동 생성
   - 시뮬레이터 헬퍼: canvas, chart, bars, donut, range, seg, drag, 색/난수/포맷
   이 파일은 <head>에서 defer 없이 로드된다. 페이지 스크립트는 </body> 직전에 둔다.
   ========================================================================== */
(function () {
  "use strict";

  // part: 책의 부(PARTS의 인덱스). 도입·실험실·용어집처럼 부가 없는 장은 생략한다.
  const PARTS = [
    { key: "market",  name: "시장",       short: "시장", en: "Market" },
    { key: "economy", name: "경기",       short: "경기", en: "Business Cycle" },
    { key: "money",   name: "돈과 금리",   short: "금리", en: "Money & Rates" },
    { key: "world",   name: "바깥 세계",   short: "해외", en: "Open Economy" },
    { key: "state",   name: "정부",       short: "정부", en: "Fiscal Policy" },
    { key: "crisis",  name: "위기",       short: "위기", en: "Crisis" },
  ];

  const CHAPTERS = [
    { slug: "overview",     num: "01",          title: "경제 뉴스의 지도",          desc: "가계·기업·정부·해외가 주고받는 돈의 순환도 위에 헤드라인 한 줄을 올려놓는 법. 숫자 하나에 붙는 기준 시점·비교 기준·출처를 읽는다.", tags: ["도입", "sim"] },
    { slug: "market",       num: "02", part: 0, title: "수요와 공급",               desc: "가격은 누가 정하는가. 수요·공급 곡선의 이동, 탄력성, 가격 상한과 세금이 누구에게 떨어지는가. 쌀값과 배추값 기사를 곡선으로 다시 그린다.", tags: ["시장", "sim"] },
    { slug: "gdp",          num: "03", part: 1, title: "GDP: 나라 경제의 성적표",   desc: "생산·지출·분배 세 갈래로 잰 같은 숫자. 명목과 실질, 전기 대비와 전년 동기 대비, 연율, 성장 기여도를 계산하며 성장률 기사를 읽는다.", tags: ["경기", "sim"] },
    { slug: "cycle",        num: "04", part: 1, title: "경기 순환과 경기 지표",      desc: "확장과 수축, 산출 갭, 선행·동행지수와 순환변동치, 심리지수. 승수와 재고가 출렁임을 키우는 원리.", tags: ["경기", "sim"] },
    { slug: "jobs",         num: "05", part: 1, title: "고용",                    desc: "취업자·실업자·비경제활동인구, 실업률과 고용률, 취업자 증감과 기저효과, 확장실업률, 오쿤의 법칙. 고용 동향 기사의 숫자를 다시 계산한다.", tags: ["경기", "sim"] },
    { slug: "inflation",    num: "06", part: 2, title: "물가",                    desc: "소비자물가지수의 장바구니와 가중치, 근원물가, 체감물가와의 차이, 기대 인플레이션, 수요 견인과 비용 상승. 물가 2%의 의미.", tags: ["금리", "sim"] },
    { slug: "rates",        num: "07", part: 2, title: "금리: 돈의 가격",           desc: "명목과 실질 금리, 채권 가격과 금리의 시소, 만기별 금리와 수익률 곡선, 신용 스프레드, 내 대출금리가 정해지는 구조.", tags: ["금리", "sim"] },
    { slug: "bok",          num: "08", part: 2, title: "중앙은행과 통화정책",        desc: "한국은행과 금융통화위원회, 기준금리가 시장 금리를 붙잡는 방법, 은행이 돈을 만드는 원리, 테일러 준칙, 양적완화와 포워드 가이던스.", tags: ["금리", "sim"] },
    { slug: "transmission", num: "09", part: 2, title: "기준금리가 퍼지는 길",       desc: "기준금리 0.25%p가 대출금리·주가·집값·환율·소비·물가로 번지는 경로와 시차. 연결판 시뮬레이터로 한꺼번에 움직여 본다.", tags: ["금리", "sim"] },
    { slug: "fx",           num: "10", part: 3, title: "환율",                    desc: "원/달러 환율이 오른다는 말의 뜻, 외환시장의 수요와 공급, 금리 차와 자본 이동, 구매력평가, 수입물가로의 전가.", tags: ["해외", "sim"] },
    { slug: "trade",        num: "11", part: 3, title: "무역과 경상수지",           desc: "비교우위와 교역의 이득, 경상수지의 네 갈래, 수출 증가율과 반도체, 교역조건, 관세가 가격과 물량에 미치는 영향.", tags: ["해외", "sim"] },
    { slug: "fiscal",       num: "12", part: 4, title: "재정과 국가부채",           desc: "예산의 수입과 지출, 통합재정수지와 관리재정수지, 국가채무 D1·D2, 재정 승수, 금리와 성장률로 보는 부채 비율의 길.", tags: ["정부", "sim"] },
    { slug: "crisis",       num: "13", part: 5, title: "금융위기",                 desc: "레버리지와 만기 불일치, 뱅크런, 1997년 외환위기와 2008년 글로벌 금융위기, 2020년 코로나 충격. 위기가 번지는 구조와 막는 장치.", tags: ["위기", "sim"] },
    { slug: "lab",          num: "14",          title: "경제 뉴스 실험실",          desc: "금리·재정·환율·유가 충격을 넣으면 성장·물가·고용·환율·집값이 2년 동안 어떻게 움직이는지 작은 경제 모형으로 돌려 보고, 1년치 헤드라인 노트를 결산한다.", tags: ["실험실", "sim"] },
    { slug: "glossary",     num: "15",          title: "용어집 & 종합 퀴즈",         desc: "경제 기사에 자주 나오는 용어를 검색하고, 종합 퀴즈로 실력을 점검하자.", tags: ["정리"] },
  ];
  const EB = (window.EB = {});
  // 공개한 장. 집필 중인 장은 목록에 '집필 중'으로 보이고 링크·이전/다음·검색에서 빠진다. 장을 공개하면 여기에 slug를 더한다.
  const READY = new Set(["overview", "market", "gdp", "cycle", "jobs", "inflation", "rates", "bok", "transmission", "fx", "trade", "fiscal", "crisis", "lab", "glossary"]);
  CHAPTERS.forEach((c) => { c.ready = READY.has(c.slug); });
  EB.CHAPTERS = CHAPTERS;
  EB.PARTS = PARTS;

  /* ------------------------------------------------------------ math utils */
  EB.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  EB.lerp = (a, b, t) => a + (b - a) * t;
  EB.map = (x, a, b, c, d) => c + ((x - a) * (d - c)) / (b - a);
  EB.randn = function () {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  EB.poisson = function (lambda) {
    if (lambda <= 0) return 0;
    if (lambda > 40) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * EB.randn()));
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  };
  /** 숫자 포맷: 유효 자리 */
  EB.fmt = function (x, digits = 3) {
    if (!isFinite(x)) return "—";
    if (x === 0) return "0";
    const a = Math.abs(x);
    if (a >= 1e5 || a < 1e-3) return x.toExponential(digits - 1).replace("e+", "e");
    return Number(x.toPrecision(digits)).toLocaleString("en-US", { maximumFractionDigits: 6 });
  };
  /**
   * 원화 포맷: EB.won(123456789) → "1억 2,346만원", EB.won(8500) → "8,500원"
   * digits: 만원 단위 아래 반올림 기준(기본 0 → 만원 단위). short=true면 "원"을 뺀다.
   */
  EB.won = function (x, opt = {}) {
    if (!isFinite(x)) return "—";
    const neg = x < 0, a = Math.abs(x), unit = opt.short ? "" : "원";
    let s;
    if (a < 1e5 && !opt.digits) s = Math.round(a).toLocaleString("ko-KR") + unit;
    else {
      const man = Math.round(a / 1e4 * Math.pow(10, opt.digits || 0)) / Math.pow(10, opt.digits || 0);
      const eok = Math.floor(man / 1e4), rest = Math.round((man - eok * 1e4) * 100) / 100;
      if (eok >= 1e4) s = (Math.floor(eok / 1e4)).toLocaleString("ko-KR") + "조" + (eok % 1e4 ? " " + (eok % 1e4).toLocaleString("ko-KR") + "억" : "") + unit;
      else if (eok > 0) s = eok.toLocaleString("ko-KR") + "억" + (rest ? " " + rest.toLocaleString("ko-KR") + "만" : "") + unit;
      else s = rest.toLocaleString("ko-KR") + "만" + unit;
    }
    return (neg ? "−" : "") + s.trim();
  };
  /** 축 눈금용 짧은 원화: 1.2억, 3,500만, 800만, 5만, 9천 */
  EB.wonAxis = function (x) {
    const a = Math.abs(x), sg = x < 0 ? "−" : "";
    if (a >= 1e12) return sg + +(a / 1e12).toFixed(1) + "조";
    if (a >= 1e8) return sg + +(a / 1e8).toFixed(a >= 1e9 ? 0 : 1) + "억";
    if (a >= 1e5) return sg + Math.round(a / 1e4).toLocaleString("ko-KR") + "만";
    if (a >= 1e4) return sg + +(a / 1e4).toFixed(1) + "만";
    if (a >= 1e3) return sg + +(a / 1e3).toFixed(1) + "천";
    return sg + Math.round(a);
  };
  /** 퍼센트: EB.pct(0.0345) → "3.45%" */
  EB.pct = (x, digits = 2) => (isFinite(x) ? +(x * 100).toFixed(digits) + "%" : "—");


  /** 오차 함수 (Abramowitz–Stegun 7.1.26, |ε| < 1.5e-7) */
  EB.erf = function (x) {
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  };
  EB.erfc = (x) => 1 - EB.erf(x);
  /** 캔버스 글꼴 문자열: EB.font(12) / EB.font(11, true) */
  EB.font = function (px, mono, weight) {
    const cs = getComputedStyle(document.body);
    return (weight ? weight + " " : "") + px + "px " + (mono ? cs.getPropertyValue("--mono") : cs.getPropertyValue("--font"));
  };
  /** 호출을 묶어 마지막 한 번만 실행 */
  EB.debounce = function (fn, ms = 120) { let t = 0; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; };
  /** 정규 난수 시드 고정용 간단 PRNG (mulberry32) */
  EB.rng = function (seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  /** 시드 고정 정규 난수 함수: const g = EB.randnSeeded(7); g() */
  EB.randnSeeded = function (seed) {
    const r = EB.rng(seed);
    return function () { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  };

  /* ------------------------------------------------------------ theme */
  const themeCbs = [];
  EB.onTheme = (cb) => themeCbs.push(cb);
  EB.isDark = function () {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  /** CSS 변수 값 읽기: EB.color('accent') */
  EB.color = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim();
  };
  /** 자주 쓰는 색 묶음 (테마 변경 시 다시 호출할 것) */
  EB.palette = function () {
    const c = EB.color;
    return {
      bg: c("canvas-bg"), text: c("text"), dim: c("text-dim"), faint: c("text-faint"),
      grid: c("grid"), axis: c("axis"), border: c("border"), surface: c("surface"),
      accent: c("accent"), accent2: c("accent-2"), ok: c("ok"), warn: c("warn"), bad: c("bad"),
      red: c("red"), green: c("green"), blue: c("blue"),
      // 데이터 시리즈용 기본 순서
      series: [c("accent"), c("accent-2"), c("warn"), c("ok"), c("bad"), c("text-dim")],
    };
  };
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } });
  }
  try { const saved = localStorage.getItem("eb-theme"); if (saved) document.documentElement.setAttribute("data-theme", saved); } catch (e) {}
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      if (!document.documentElement.getAttribute("data-theme")) applyTheme(null);
    });
  }

  /* ------------------------------------------------------------ canvas helper */
  /**
   * HiDPI 캔버스. 폭은 부모 폭을 따르고 높이는 aspect(높이/폭) 또는 height(px)로 결정.
   * draw(ctx, w, h)는 리사이즈·테마 변경 시 자동 호출된다. 애니메이션이면 직접 redraw() 호출.
   *   const cv = EB.canvas(el, (ctx,w,h)=>{...}, {aspect:0.5, maxHeight: 420});
   *   cv.redraw(); cv.ctx; cv.w; cv.h
   */
  EB.canvas = function (canvas, draw, opts = {}) {
    if (typeof canvas === "string") canvas = document.querySelector(canvas);
    const ctx = canvas.getContext("2d");
    const st = { ctx, w: 0, h: 0, canvas, dpr: 1 };
    function resize() {
      const parent = canvas.parentElement;
      const w = Math.max(200, Math.floor(opts.width || parent.clientWidth || 600));
      let h = opts.height || Math.round(w * (opts.aspect || 0.5));
      if (opts.minHeight) h = Math.max(h, opts.minHeight);
      if (opts.maxHeight) h = Math.min(h, opts.maxHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.w = w; st.h = h; st.dpr = dpr;
      st.redraw();
    }
    st.redraw = function () {
      if (!st.w) return;
      ctx.save();
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      if (!opts.noClear) {
        ctx.clearRect(0, 0, st.w, st.h);
        ctx.fillStyle = canvas.closest(".sim-view.scope") ? "#0b0d12" : EB.color("canvas-bg");
        ctx.fillRect(0, 0, st.w, st.h);
      }
      try { draw && draw(ctx, st.w, st.h); } finally { ctx.restore(); }
    };
    st.resize = resize;
    if (window.ResizeObserver) {
      let lastW = -1;
      new ResizeObserver(() => { const w = canvas.parentElement.clientWidth; if (w !== lastW) { lastW = w; resize(); } }).observe(canvas.parentElement);
    } else window.addEventListener("resize", resize);
    EB.onTheme(() => st.redraw());
    resize();
    return st;
  };

  /**
   * 화면에 보일 때만 도는 애니메이션 루프. fn(dt초, t초)
   *   const loop = EB.loop(el, (dt,t)=>{...}); loop.stop(); loop.start();
   */
  EB.loop = function (el, fn) {
    let raf = 0, last = 0, t = 0, visible = true, running = true;
    function frame(ts) {
      raf = 0;
      if (!running || !visible) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
      last = ts; t += dt;
      fn(dt, t);
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && running && visible) { last = 0; raf = requestAnimationFrame(frame); } }
    if (window.IntersectionObserver && el) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); }).observe(el);
    }
    kick();
    return {
      start() { running = true; kick(); },
      stop() { running = false; },
      get running() { return running; },
      toggle() { running ? (running = false) : ((running = true), kick()); return running; },
    };
  };

  /* ------------------------------------------------------------ chart helper */
  /**
   * 간단한 선 그래프. box = {x,y,w,h}(생략 시 캔버스 전체에 여백 자동)
   * opts: { x:[min,max], y:[min,max], logX, logY, xLabel, yLabel, xTicks, yTicks,
   *         xFmt, yFmt, series:[{data:[[x,y],...], color, width, dash, fill, label}],
   *         vlines:[{x,color,label,dash}], hlines:[{y,color,label,dash}], points:[{x,y,color,r,label}],
   *         bands:[{x0,x1,color}] }
   * 반환: { X(v)->px, Y(v)->px, box }
   */
  EB.chart = function (ctx, box, opts) {
    const P = EB.palette();
    const dpr = (ctx.getTransform && ctx.getTransform().a) || 1;
    const W = ctx.canvas.width / dpr, H = ctx.canvas.height / dpr;
    if (!box) box = { x: 58, y: 16, w: W - 58 - 18, h: H - 16 - 46 };
    const [x0, x1] = opts.x, [y0, y1] = opts.y;
    const lx = (v) => (opts.logX ? Math.log10(v) : v);
    const ly = (v) => (opts.logY ? Math.log10(v) : v);
    const X = (v) => box.x + ((lx(v) - lx(x0)) / (lx(x1) - lx(x0))) * box.w;
    const Y = (v) => box.y + box.h - ((ly(v) - ly(y0)) / (ly(y1) - ly(y0))) * box.h;
    const ticks = (a, b, log, n) => {
      if (log) { const out = []; for (let e = Math.ceil(Math.log10(a) - 1e-9); e <= Math.log10(b) + 1e-9; e++) out.push(Math.pow(10, e)); return out; }
      const span = b - a, raw = span / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= (n || 5) + 0.5) || raw;
      const out = []; for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
      return out;
    };
    const defFmt = (v) => (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(0).replace("e+", "e") : String(Number(v.toPrecision(4))));
    const xFmt = opts.xFmt || defFmt, yFmt = opts.yFmt || defFmt;
    ctx.save();
    ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--mono");
    ctx.lineWidth = 1;
    // bands
    (opts.bands || []).forEach((b) => { ctx.fillStyle = b.color; ctx.fillRect(X(b.x0), box.y, X(b.x1) - X(b.x0), box.h); });
    // grid + ticks
    const xt = opts.xTicks || ticks(x0, x1, opts.logX, 6);
    const yt = opts.yTicks || ticks(y0, y1, opts.logY, 5);
    ctx.strokeStyle = P.grid; ctx.fillStyle = P.dim;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    xt.forEach((v) => { const px = X(v); if (px < box.x - 1 || px > box.x + box.w + 1) return; ctx.beginPath(); ctx.moveTo(px, box.y); ctx.lineTo(px, box.y + box.h); ctx.stroke(); ctx.fillText(xFmt(v), px, box.y + box.h + 6); });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    let yTickW = 0;
    yt.forEach((v) => { const py = Y(v); if (py < box.y - 1 || py > box.y + box.h + 1) return; ctx.beginPath(); ctx.moveTo(box.x, py); ctx.lineTo(box.x + box.w, py); ctx.stroke(); const s = yFmt(v); yTickW = Math.max(yTickW, ctx.measureText(s).width); ctx.fillText(s, box.x - 6, py); });
    ctx.strokeStyle = P.axis;
    ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke();
    // labels
    ctx.fillStyle = P.dim; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--font");
    if (opts.xLabel) { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(opts.xLabel, box.x + box.w / 2, box.y + box.h + 40); }
    if (opts.yLabel) { ctx.save(); ctx.translate(Math.max(8, box.x - Math.max(44, yTickW + 16)), box.y + box.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(opts.yLabel, 0, 0); ctx.restore(); }
    // clip plot area
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y - 2, box.w + 2, box.h + 4); ctx.clip();
    (opts.series || []).forEach((s, i) => {
      if (!s.data || !s.data.length) return;
      ctx.strokeStyle = s.color || P.series[i % P.series.length];
      ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      let started = false;
      s.data.forEach(([x, y]) => { if (!isFinite(y) || (opts.logY && y <= 0) || (opts.logX && x <= 0)) { started = false; return; } const px = X(x), py = Y(y); started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; });
      ctx.stroke();
      if (s.fill) {
        ctx.lineTo(X(s.data[s.data.length - 1][0]), Y(opts.logY ? y0 : Math.max(y0, 0)));
        ctx.lineTo(X(s.data[0][0]), Y(opts.logY ? y0 : Math.max(y0, 0)));
        ctx.closePath(); ctx.fillStyle = s.fill; ctx.fill();
      }
      ctx.setLineDash([]);
    });
    (opts.vlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(X(l.x), box.y); ctx.lineTo(X(l.x), box.y + box.h); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(l.label, X(l.x) + 4, box.y + 4); } });
    (opts.hlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(box.x, Y(l.y)); ctx.lineTo(box.x + box.w, Y(l.y)); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(l.label, box.x + box.w - 4, Y(l.y) - 3); } });
    (opts.points || []).forEach((p) => { ctx.fillStyle = p.color || P.accent; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r || 4, 0, Math.PI * 2); ctx.fill(); if (p.label) { ctx.fillStyle = P.text; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(p.label, X(p.x) + 6, Y(p.y) - 4); } });
    ctx.restore();
    ctx.restore();
    return { X, Y, box };
  };

  /* ------------------------------------------------------------ controls */
  /**
   * range 입력 바인딩. output은 id+"-out" 요소 또는 <output for=id>.
   *   const get = EB.range('wl', v => v+' nm', v => redraw());  get() → 현재 값(Number)
   */
  EB.range = function (id, fmt, onInput) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const out = document.getElementById(el.id + "-out") || document.querySelector(`output[for="${el.id}"]`);
    const update = (fire) => {
      const v = Number(el.value);
      const pct = ((v - Number(el.min || 0)) / (Number(el.max || 100) - Number(el.min || 0))) * 100;
      el.style.setProperty("--fill", pct + "%");
      if (out) out.textContent = fmt ? fmt(v) : String(v);
      if (fire && onInput) onInput(v);
    };
    el.addEventListener("input", () => update(true));
    update(false);
    const get = () => Number(el.value);
    get.set = (v) => { el.value = v; update(true); };
    get.el = el;
    return get;
  };
  /**
   * 세그먼트 버튼: <div class="seg" id="mode"><button data-value="a" class="on">A</button>...</div>
   *   const mode = EB.seg('mode', v => redraw());  mode() → 현재 값
   */
  EB.seg = function (id, onChange) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const btns = [...el.querySelectorAll("button")];
    let cur = (btns.find((b) => b.classList.contains("on")) || btns[0]).dataset.value;
    const set = (v, fire = true) => {
      cur = v;
      btns.forEach((b) => { const on = b.dataset.value === v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      if (fire && onChange) onChange(v);
    };
    btns.forEach((b) => b.addEventListener("click", () => set(b.dataset.value)));
    set(cur, false);
    const get = () => cur;
    get.set = set;
    return get;
  };
  /**
   * 캔버스 위 끌기(마우스·터치). 좌표는 CSS px.
   *   EB.drag(cv.canvas, { start(x, y, e) {}, move(x, y, e) {}, end() {}, hover(x, y, e) {} });
   * 누르는 순간 start와 move가 한 번씩 불린다. 끄는 동안 페이지 스크롤은 막힌다.
   */
  EB.drag = function (canvas, on) {
    if (typeof canvas === "string") canvas = document.querySelector(canvas);
    canvas.classList.add("drag");
    let act = false;
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener("pointerdown", (e) => { act = true; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} const [x, y] = pos(e); if (on.start) on.start(x, y, e); if (on.move) on.move(x, y, e); e.preventDefault(); });
    canvas.addEventListener("pointermove", (e) => { const [x, y] = pos(e); if (act) { if (on.move) on.move(x, y, e); } else if (on.hover) on.hover(x, y, e); });
    const up = () => { if (act) { act = false; if (on.end) on.end(); } };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  };
  /** 통계 표시: EB.stat('snr', '32.1 dB') → id 요소의 textContent 설정(HTML 허용) */
  EB.stat = function (id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  /* ------------------------------------------------------------ bar / donut */
  /**
   * 막대(누적 가능) 그래프. EB.chart와 같은 축을 쓴다.
   *   EB.bars(ctx, box|null, { labels:["1월",...], stacks:[{label, color, data:[...]}, ...],
   *     y:[min,max](생략 시 자동), yFmt, yLabel, gap:0.28, hlines, highlight: 인덱스, valueFmt(합계 표시) })
   * 음수 값은 0 아래로 쌓는다. 반환: { X(i) 막대 중심 px, Y(v), box, bw(막대 폭) }
   */
  EB.bars = function (ctx, box, o) {
    const P = EB.palette();
    const n = o.labels.length, stacks = o.stacks;
    let lo = 0, hi = 0;
    for (let i = 0; i < n; i++) {
      let p = 0, m = 0;
      stacks.forEach((s) => { const v = s.data[i] || 0; if (v >= 0) p += v; else m += v; });
      hi = Math.max(hi, p); lo = Math.min(lo, m);
    }
    const y = o.y || [lo * 1.08, hi * 1.08 || 1];
    const xLab = (o.labels.length > 14) ? Math.ceil(o.labels.length / 12) : 1;
    const c = EB.chart(ctx, box, { x: [0, n], y, yFmt: o.yFmt, yLabel: o.yLabel, xLabel: o.xLabel, xTicks: [], hlines: o.hlines });
    const B = c.box, slot = B.w / n, bw = slot * (1 - (o.gap == null ? 0.28 : o.gap));
    ctx.save();
    for (let i = 0; i < n; i++) {
      const cx = B.x + slot * (i + 0.5);
      let p = 0, m = 0;
      stacks.forEach((s, k) => {
        const v = s.data[i] || 0; if (!v) return;
        const a = v >= 0 ? p : m, b = a + v;
        if (v >= 0) p = b; else m = b;
        ctx.fillStyle = (typeof s.color === "function" ? s.color(i, v) : s.color) || P.series[k % P.series.length];
        if (o.highlight != null && o.highlight !== i) ctx.globalAlpha = 0.35;
        const y0 = c.Y(a), y1 = c.Y(b);
        ctx.fillRect(cx - bw / 2, Math.min(y0, y1), bw, Math.max(1, Math.abs(y1 - y0)));
        ctx.globalAlpha = 1;
      });
      if (i % xLab === 0) {
        ctx.fillStyle = P.dim; ctx.font = EB.font(11); ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(o.labels[i], cx, B.y + B.h + 6);
      }
      if (o.valueFmt) {
        ctx.fillStyle = P.text; ctx.font = EB.font(11, true); ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(o.valueFmt(p + m, i), cx, c.Y(p) - 3);
      }
    }
    ctx.restore();
    return { X: (i) => B.x + slot * (i + 0.5), Y: c.Y, box: B, bw };
  };
  /**
   * 도넛(파이) 그래프. items:[{label, value, color}], 가운데 글자 center:{big, small}
   *   EB.donut(ctx, cx, cy, R, items, { inner:0.6, center:{big:"300만", small:"월 실수령"}, labels:true, highlight })
   * 반환: hit(x, y) → 마우스 위치의 항목 인덱스(없으면 -1)
   */
  EB.donut = function (ctx, cx, cy, R, items, o = {}) {
    const P = EB.palette();
    const total = items.reduce((s, it) => s + Math.max(0, it.value), 0) || 1;
    const inner = o.inner == null ? 0.6 : o.inner;
    let a = -Math.PI / 2;
    const arcs = [];
    ctx.save();
    items.forEach((it, i) => {
      const da = (Math.max(0, it.value) / total) * Math.PI * 2;
      const pop = o.highlight === i ? R * 0.06 : 0, mid = a + da / 2;
      const ox = Math.cos(mid) * pop, oy = Math.sin(mid) * pop;
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, R, a, a + da);
      ctx.arc(cx + ox, cy + oy, R * inner, a + da, a, true);
      ctx.closePath();
      ctx.fillStyle = it.color || P.series[i % P.series.length]; ctx.fill();
      ctx.strokeStyle = EB.color("canvas-bg"); ctx.lineWidth = 2; ctx.stroke();
      if (o.labels !== false && da > 0.32) {
        const rr = R * (1 + inner) / 2;
        ctx.fillStyle = "#fff"; ctx.font = EB.font(11, true, 600); ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(Math.round((it.value / total) * 100) + "%", cx + ox + Math.cos(mid) * rr, cy + oy + Math.sin(mid) * rr);
      }
      arcs.push([a, a + da]);
      a += da;
    });
    if (o.center) {
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = P.text; ctx.font = EB.font(Math.max(14, R * 0.22), false, 800);
      ctx.fillText(o.center.big || "", cx, cy - (o.center.small ? R * 0.08 : 0));
      if (o.center.small) { ctx.fillStyle = P.dim; ctx.font = EB.font(Math.max(11, R * 0.11)); ctx.fillText(o.center.small, cx, cy + R * 0.16); }
    }
    ctx.restore();
    return {
      hit(x, y) {
        const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy);
        if (r > R * 1.06 || r < R * inner) return -1;
        let t = Math.atan2(dy, dx); if (t < -Math.PI / 2) t += Math.PI * 2;
        return arcs.findIndex(([s, e]) => t >= s && t < e);
      },
    };
  };

  /* ------------------------------------------------------------ layout build */
  const LOGO = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="ebg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="8" fill="url(#ebg)"/><path d="M9 23V18M14 23v-7M19 23v-4M24 23V12" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M8 14.5l5-4 4 3 7-5.5" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_MENU = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
  const ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
  const ICON_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;

  function build() {
    const body = document.body;
    const root = body.dataset.root != null ? body.dataset.root : body.dataset.chapter ? "../" : "";
    const curSlug = body.dataset.chapter || "";
    const href = (slug) => (slug ? `${root}chapters/${slug}.html` : `${root}index.html`);
    const feedbackUrl = "https://books.euiyun.com/feedback.html?book=economicsbook&page=" + encodeURIComponent(location.href);

    // favicon
    if (!document.querySelector('link[rel="icon"]')) { const fi = document.createElement("link"); fi.rel = "icon"; fi.type = "image/svg+xml"; fi.href = root + "favicon.svg"; document.head.appendChild(fi); }

    // top bar
    const bar = document.createElement("header");
    bar.className = "eb-topbar";
    bar.innerHTML = `
      <button class="eb-btn icon" id="eb-menu" aria-label="챕터 목록">${ICON_MENU}</button>
      <a class="eb-logo" href="${href("")}">${LOGO}<span>EconomicsBook <small>경제 뉴스 교과서</small></span></a>
      <span class="spacer"></span>
      <a class="eb-btn series-link" href="https://books.euiyun.com/" aria-label="전체 책 보기" title="전체 책 보기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5h6v14H4zM10 5.5h6v14h-6zM17 7l3-1 2 13-3 1z"/></svg><span>전체 책</span></a>
      <button class="eb-btn icon" id="eb-theme" aria-label="테마 전환"></button>
      <div class="eb-progress" id="eb-progress"></div>`;
    const feedbackButton = document.createElement("a");
    feedbackButton.className = bar.className.replace("-topbar", "-btn") + " icon feedback-button";
    feedbackButton.href = feedbackUrl;
    feedbackButton.target = "_blank";
    feedbackButton.rel = "noopener";
    feedbackButton.setAttribute("aria-label", "독자 의견 보내기");
    feedbackButton.title = "독자 의견 보내기";
    feedbackButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2z"/><path d="M8 9h8M8 13h5"/></svg>';
    bar.querySelector("[id$='-theme']").before(feedbackButton);
    body.prepend(bar);

    // Search chapter metadata immediately; load section and visual titles on demand.
    const progressBar = bar.querySelector("[id$='-progress']");
    const spacer = bar.querySelector(".spacer");
    const leftNav = document.createElement("div");
    leftNav.className = "book-nav-left";
    leftNav.append(bar.querySelector("[id$='-menu']"), bar.querySelector("a[class$='-logo']"));
    const rightNav = document.createElement("div");
    rightNav.className = "book-nav-right";
    [...bar.children].filter((el) => el !== spacer && el !== progressBar).forEach((el) => rightNav.appendChild(el));
    spacer.remove();
    const search = document.createElement("div");
    search.className = "book-search";
    search.innerHTML = '<svg class="book-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input type="search" aria-label="이 책의 챕터, 섹션, 시뮬레이터, 그림 검색" placeholder="이 책 검색" autocomplete="off"><div class="book-search-results" aria-live="polite"></div>';
    bar.prepend(leftNav);
    bar.insertBefore(search, progressBar);
    bar.insertBefore(rightNav, progressBar);
    const searchInput = search.querySelector("input");
    const searchResults = search.querySelector(".book-search-results");
    const closeSearch = () => { search.classList.remove("open"); searchResults.replaceChildren(); };
    let detailEntries = [];
    let detailsLoaded = false;
    let detailPromise;
    function loadDetails() {
      if (detailPromise) return detailPromise;
      detailPromise = Promise.all(CHAPTERS.filter((c) => c.ready).map(async (chapter) => {
        try {
          const response = await fetch(href(chapter.slug));
          if (!response.ok) return [];
          const doc = new DOMParser().parseFromString(await response.text(), "text/html");
          const main = doc.querySelector("main.chapter");
          if (!main) return [];
          const entries = [];
          [...main.querySelectorAll("section > h2")].forEach((heading, i) => {
            entries.push({ type: "섹션", title: heading.textContent.trim(), chapter, hash: heading.parentElement.id || `s${i + 1}` });
          });
          [...main.querySelectorAll(".sim")].filter((sim) => sim.querySelector(".sim-head h3")).forEach((sim, i) => {
            entries.push({ type: "시뮬레이터", title: sim.querySelector(".sim-head h3").textContent.trim(), chapter, hash: sim.id || `search-sim-${i + 1}` });
          });
          [...main.querySelectorAll("figure")].filter((figure) => figure.querySelector("figcaption")).forEach((figure, i) => {
            const caption = figure.querySelector("figcaption").textContent.replace(/\s+/g, " ").trim();
            entries.push({ type: "그림", title: caption.slice(0, 140), chapter, hash: figure.id || `search-fig-${i + 1}` });
          });
          return entries;
        } catch (error) { return []; }
      })).then((parts) => { detailEntries = parts.flat(); detailsLoaded = true; renderSearch(); });
      return detailPromise;
    }
    function renderSearch() {
      const words = searchInput.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      searchResults.replaceChildren();
      if (!words.length) { closeSearch(); return; }
      const includesWords = (value) => words.every((word) => value.toLocaleLowerCase().includes(word));
      const chapterMatches = CHAPTERS.filter((c) => includesWords([c.num, c.title, c.desc, ...(c.tags || [])].join(" ")))
        .map((c) => ({ type: "챕터", title: c.title, chapter: c, hash: "" }));
      const detailMatches = detailEntries.filter((entry) => includesWords(entry.title));
      const matches = [
        ...chapterMatches.slice(0, 4),
        ...detailMatches.filter((entry) => entry.type === "섹션").slice(0, 5),
        ...detailMatches.filter((entry) => entry.type === "시뮬레이터").slice(0, 4),
        ...detailMatches.filter((entry) => entry.type === "그림").slice(0, 4),
      ];
      matches.forEach((entry) => {
        const link = document.createElement("a");
        link.href = href(entry.chapter.slug) + (entry.hash ? `#${entry.hash}` : "");
        const title = document.createElement("strong");
        title.textContent = entry.title;
        const context = document.createElement("small");
        context.textContent = `${entry.chapter.num} · ${entry.chapter.title} · ${entry.type}`;
        link.append(title, context);
        searchResults.appendChild(link);
      });
      if (chapterMatches.length + detailMatches.length > matches.length) {
        const more = document.createElement("p");
        more.textContent = `상위 ${matches.length}개 표시 · 검색어를 더 구체적으로 입력해 보세요`;
        searchResults.appendChild(more);
      }
      if (detailPromise && !detailsLoaded) {
        const status = document.createElement("p");
        status.textContent = "섹션·시뮬레이터·그림 목록을 불러오는 중…";
        searchResults.appendChild(status);
      } else if (!matches.length) {
        const empty = document.createElement("p");
        empty.textContent = "검색 결과가 없습니다";
        searchResults.appendChild(empty);
      }
      search.classList.add("open");
    }
    searchInput.addEventListener("input", () => { if (searchInput.value.trim()) loadDetails(); renderSearch(); });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeSearch(); searchInput.blur(); }
      else if (e.key === "ArrowDown") { const first = searchResults.querySelector("a"); if (first) { e.preventDefault(); first.focus(); } }
      else if (e.key === "Enter") { const first = searchResults.querySelector("a"); if (first) { e.preventDefault(); first.click(); } }
    });
    searchResults.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeSearch(); searchInput.focus(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const links = [...searchResults.querySelectorAll("a")];
        const next = links.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1);
        e.preventDefault();
        (links[next] || searchInput).focus();
      }
    });
    document.addEventListener("pointerdown", (e) => { if (!search.contains(e.target)) closeSearch(); });


    // drawer
    const drawer = document.createElement("nav");
    drawer.className = "eb-drawer";
    drawer.innerHTML = `<h4>Chapters</h4><ul class="eb-chlist">
      <li><a href="${href("")}" class="${curSlug ? "" : "active"}"><span class="num">00</span><span>홈 · 경제 뉴스 읽기</span></a></li>
      ${CHAPTERS.map((c) => c.ready ? `<li><a href="${href(c.slug)}" class="${c.slug === curSlug ? "active" : ""}"><span class="num">${c.num}</span><span>${c.title}</span></a></li>` : `<li><span class="soon"><span class="num">${c.num}</span><span>${c.title}</span><small>집필 중</small></span></li>`).join("")}
    </ul>`;
    const backdrop = document.createElement("div");
    backdrop.className = "eb-drawer-backdrop";
    body.append(backdrop, drawer);
    const toggleDrawer = (o) => body.classList.toggle("drawer-open", o);
    bar.querySelector("#eb-menu").addEventListener("click", () => toggleDrawer(true));
    backdrop.addEventListener("click", () => toggleDrawer(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleDrawer(false); });

    // theme toggle
    const tbtn = bar.querySelector("#eb-theme");
    const setIcon = () => (tbtn.innerHTML = EB.isDark() ? ICON_SUN : ICON_MOON);
    setIcon();
    tbtn.addEventListener("click", () => {
      const next = EB.isDark() ? "light" : "dark";
      try { localStorage.setItem("eb-theme", next); } catch (e) {}
      applyTheme(next); setIcon();
    });

    // progress
    const prog = bar.querySelector("#eb-progress");
    const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%"; };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    // chapter page extras
    const main = document.querySelector("main.chapter");
    if (main) {
      // Give search results stable anchors even when the source has no id.
      [...main.querySelectorAll(".sim")].filter((sim) => sim.querySelector(".sim-head h3")).forEach((sim, i) => { if (!sim.id) sim.id = `search-sim-${i + 1}`; });
      [...main.querySelectorAll("figure")].filter((figure) => figure.querySelector("figcaption")).forEach((figure, i) => { if (!figure.id) figure.id = `search-fig-${i + 1}`; });
      if (/^#(?:s\d+|search-(?:sim|fig)-)/.test(location.hash)) {
        requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
      }
      // 여섯 부 띠
      const curCh = CHAPTERS.find((c) => c.slug === curSlug);
      const hero = main.querySelector(".chapter-hero");
      if (hero && curCh && curCh.part != null) {
        const first = (i) => CHAPTERS.find((c) => c.part === i);
        const strip = document.createElement("nav");
        strip.className = "eb-stages";
        strip.setAttribute("aria-label", "책의 여섯 부");
        strip.innerHTML = PARTS.map((st, i) => `<a href="${href(first(i).slug)}" class="${i === curCh.part ? "cur" : ""}"${i === curCh.part ? ' aria-current="step"' : ""}><b><span class="pt-full">${st.name}</span><span class="pt-short">${st.short || st.name}</span></b><small>${st.en}</small></a>`).join("");
        hero.after(strip);
      }
      // numbered h2 + TOC
      const layout = document.createElement("div");
      layout.className = "eb-layout";
      main.parentNode.insertBefore(layout, main);
      layout.appendChild(main);
      const toc = document.createElement("aside");
      toc.className = "eb-toc";
      const h2s = [...main.querySelectorAll("section > h2")];
      let n = 0;
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + h2s.map((h, i) => {
        const sec = h.parentElement;
        if (!sec.id) sec.id = "s" + (i + 1);
        const numbered = !sec.classList.contains("keypoints") && !sec.classList.contains("quiz-sec") && !sec.hasAttribute("data-nonum");
        if (numbered && !h.querySelector(".h-num")) { n++; h.insertAdjacentHTML("afterbegin", `<span class="h-num">${String(n).padStart(2, "0")}</span>`); }
        return `<a href="#${sec.id}">${h.textContent.replace(/^\d\d/, "").trim()}</a>`;
      }).join("");
      layout.appendChild(toc);
      const links = [...toc.querySelectorAll("a")];
      if (window.IntersectionObserver && h2s.length) {
        const io = new IntersectionObserver((es) => {
          es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); } });
        }, { rootMargin: "-20% 0px -70% 0px" });
        h2s.forEach((h) => io.observe(h.parentElement));
      }

      // pager
      const idx = CHAPTERS.findIndex((c) => c.slug === curSlug);
      const prev = idx > 0 ? CHAPTERS.slice(0, idx).reverse().find((c) => c.ready) || null : null;
      const next = idx >= 0 ? CHAPTERS.slice(idx + 1).find((c) => c.ready) || null : null;
      const pager = document.createElement("nav");
      pager.className = "eb-pager";
      pager.innerHTML =
        (prev ? `<a class="prev" href="${href(prev.slug)}"><small>← 이전 · ${prev.num}</small>${prev.title}</a>` : `<a class="prev" href="${href("")}"><small>← 처음으로</small>홈 · 경제 뉴스 읽기</a>`) +
        (next ? `<a class="next" href="${href(next.slug)}"><small>다음 · ${next.num} →</small>${next.title}</a>` : "");
      layout.after(pager);
    }
    const foot = document.createElement("footer");
    foot.className = "eb-foot";
    foot.innerHTML = `EconomicsBook — 경제 뉴스 읽는 인터랙티브 교과서 · 통계 수치는 장마다 밝힌 기준 시점의 공식 발표값이며 이후 수정·갱신될 수 있습니다. 시뮬레이터는 원리를 보여 주는 교육용 모델이며 경기·금리·환율·주가·집값 전망이 아닙니다. 투자 자문이 아닙니다.<br>
      © 2026 geniuskey 및 EconomicsBook 기여자 · 콘텐츠 <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · 코드 <a href="${root}LICENSE-MIT">MIT</a> · <a href="${root}LICENSE.md">라이선스 안내</a>`;
    const feedbackLink = document.createElement("a");
    feedbackLink.href = feedbackUrl;
    feedbackLink.target = "_blank";
    feedbackLink.rel = "noopener";
    feedbackLink.textContent = "독자 의견";
    foot.append(" · ", feedbackLink);
    body.appendChild(foot);

    // quiz
    document.querySelectorAll(".quiz-q").forEach((q) => {
      const opts = [...q.querySelectorAll("button.opt")];
      opts.forEach((b) => b.addEventListener("click", () => {
        opts.forEach((o) => { o.disabled = true; if (o.hasAttribute("data-correct")) o.classList.add("right"); });
        if (!b.hasAttribute("data-correct")) b.classList.add("wrong");
        q.classList.add("done");
        q.dispatchEvent(new CustomEvent("answered", { bubbles: true, detail: { correct: b.hasAttribute("data-correct") } }));
      }));
    });

    // KaTeX
    const renderMath = () => {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
          throwOnError: false,
          ignoredClasses: ["no-math"],
        });
      }
    };
    if (window.renderMathInElement) renderMath();
    else window.addEventListener("load", renderMath);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
