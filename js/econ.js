/* Copyright (c) 2026 geniuskey and EconomicsBook contributors.
   Executable code: MIT (see ../LICENSE-MIT).
   Educational values and explanations: CC-BY-4.0 (see ../LICENSE.md). */
/* ==========================================================================
   EconomicsBook 경제 계산 엔진 — 전역 객체 EC
   모든 장이 같은 숫자와 같은 모형을 쓰도록 모아 둔다.
   단위: 금리·성장률·물가상승률은 소수(0.025 = 2.5%), 금액은 원, 기간은 개월 또는 분기.
   - 공식 통계(기준 시점·출처 주석): EC.KR, EC.HIST
   - 시장: EC.market (선형 수요·공급, 세금·가격 상한, 잉여)
   - 성장: EC.annualize, EC.yoy, EC.contrib, EC.real
   - 금리: EC.payment, EC.bond, EC.fisher, EC.taylor
   - 연결판: EC.transmit (기준금리 → 대출금리·주가·집값·환율·성장·물가, 월별)
   - 작은 경제: EC.economy (분기별 산출 갭·물가·금리·환율·실업·집값)
   - 재정: EC.debtPath
   - 케이스: EC.CASE (지우의 헤드라인 노트)
   브라우저(window.EC)와 node(require) 둘 다에서 쓴다.
   ========================================================================== */
(function (root) {
  "use strict";
  const EC = {};

  /* ------------------------------------------------------------ 공식 통계 */
  // KR-STATS-START
  // 공식 발표값. 각 값 옆 주석: 기관 「자료명」(발표일), 기준 시점, 상태. 확인일 2026-10-09.
  // 이 날 작업 환경에서 한국은행·국가데이터처 등 정부 사이트를 직접 열지 못해, 공식 발표를 인용한 보도 2건 이상으로 교차 확인했다(SOURCES.md).
  // 2025년 정부조직 개편으로 통계청은 국가데이터처, 기획재정부는 재정경제부(예산은 기획예산처), 산업통상자원부는 산업통상부가 되었다.
  EC.KR = {
    asOf: "2026-10-09",

    /* 금리 */
    baseRate: 0.03,          // 한국은행 기준금리. 2026-08-27 2.75→3.00%(6:1), 2026-07-16 2.50→2.75%. 다음 회의 2026-10-22. 확인
    bond3y: 0.03961,         // 국고채 3년물 연 3.961%(2026-10-07 장 마감, 금융투자협회 최종호가). 대체로 확인
    bond10y: 0.04376,        // 국고채 10년물 연 4.376%(2026-10-07). 대체로 확인
    mortgageRate: 0.0466,    // 예금은행 주택담보대출 금리 연 4.66%(2026년 8월 신규취급액, 한국은행 「금융기관 가중평균금리」 2026-09-30). 대체로 확인
    mortgageRateJun: 0.0436, // 같은 기준 2026년 6월 4.36%
    loanRateAll: 0.044,      // 예금은행 대출 전체 4.40%(2026년 8월 신규취급액)
    usRate: [0.0375, 0.04],  // 미국 연방기금금리 목표범위 3.75~4.00%(FOMC 2026-09-16, 0.25%p 인상). 확인
    inflationTarget: 0.02,   // 한국은행 물가안정목표: 소비자물가 상승률(전년동기비) 2%

    /* 물가: 국가데이터처 「소비자물가동향」 */
    cpi: 0.029,              // 2026년 9월 전년동월비 2.9%(2026-10-02 발표), 8월 3.1%. 확인
    cpiIndex: 120.43,        // 2026년 9월 지수(2020=100)
    coreCpi: 0.027,          // 농산물 및 석유류 제외 2.7%(2026년 9월). 확인
    coreCpiOecd: 0.028,      // 식료품 및 에너지 제외 2.8%(2026년 9월). 확인
    cpi2025: 0.021,          // 2025년 연간 2.1%(2025-12-31 발표). 확인

    /* 성장: 한국은행 「국민소득」 */
    gdpQoQ: 0.006,           // 2026년 2분기 실질 GDP 전기비 0.6%(잠정 2026-09-08, 속보 07-23과 같음). 확인
    gdpYoY: 0.037,           // 2026년 2분기 전년동기비 3.7%. 확인
    gdpQ1QoQ: 0.018,         // 2026년 1분기 전기비 1.8%(속보 1.7%에서 수정). 대체로 확인
    gdpQ4_2025: -0.001,      // 2025년 4분기 전기비 −0.1%(수정치). 대체로 확인
    growth2025: 0.010,       // 2025년 연간 1.0%(2026-03 잠정). 2026년 7월 연간 국민계정에서 1.1%로 수정 보도(대체로 확인)
    growth2025rev: 0.011,
    growth2024: 0.020,       // 2024년 2.0%. 대체로 확인
    nominalGdp2025: 2676.7e12, // 2025년 명목 GDP 약 2,676.7조원. 대체로 확인
    gniPerCapita2025: 36963, // 2025년 1인당 GNI 36,963달러(7월 수정, 3월 잠정 36,855달러). 대체로 확인

    /* 고용: 국가데이터처 「고용동향」 */
    jobsChange: 184000,      // 2026년 8월 취업자 전년동월대비 +18.4만명(취업자 2,915.1만명, 2026-09-09 발표). 확인
    employed: 29151000,
    unemployment: 0.020,     // 2026년 8월 실업률(원계열) 2.0%. 확인. 계절조정 값은 확인 필요
    youthUnemployment: 0.054,// 2026년 8월 청년(15~29세) 실업률 5.4%
    employmentRate1564: 0.704, // 2026년 8월 고용률(15~64세, OECD 비교기준) 70.4%. 확인
    employmentRate15: 0.633, // 2026년 8월 고용률(15세 이상) 63.3%
    extUnemployment: 0.076,  // 2026년 8월 확장실업률(고용보조지표3) 7.6%. 대체로 확인
    unemployment2025: 0.028, // 2025년 연간 실업률 2.8%(2026-01-14 발표). 확인
    employmentRate2025: 0.629, // 2025년 연간 고용률(15세 이상) 62.9%, 15~64세 69.8%. 확인
    employmentRate1564_2025: 0.698,
    jobsChange2025: 193000,  // 2025년 연간 취업자 +19.3만명(2,876.9만명). 확인

    /* 환율 */
    usdkrw: 1338.5,          // 원/달러 2026-10-08 주간거래 종가(서울외환시장). 확인
    usdkrw2025avg: 1421.97,  // 2025년 연평균(한국은행 자료 인용 보도, 1998년 1,394.97원을 넘는 역대 최고). 대체로 확인

    /* 국제수지·무역: 한국은행 「국제수지」, 산업통상부 「수출입 동향」 */
    currentAccount2025: 1230.5e8,  // 2025년 경상수지 1,230.5억 달러 흑자(사상 최대). 대체로 확인
    currentAccountAug: 461.1e8,    // 2026년 8월 461.1억 달러 흑자(2026-10-08 발표, 40개월 연속 흑자). 확인
    exports2025: 7097e8,           // 2025년 수출 7,097억 달러(+3.8%, 2026-01-01 발표). 대체로 확인(이후 7,093억 달러로도 표기)
    chipExports2025: 1734e8,       // 2025년 반도체 수출 1,734억 달러(+22.2%). 대체로 확인
    exportsSep: 1209.4e8,          // 2026년 9월 수출 1,209.4억 달러, 전년동월비 +83.5%(2026-10-01 발표). 확인(원문 대조 권장)
    exportsSepYoY: 0.835,
    chipShareSep: 0.499,           // 2026년 9월 반도체 603억 달러, 수출의 49.9%. 확인
    fxReserves: 4405.6e8,          // 2026년 9월 말 외환보유액 4,405.6억 달러(2026-10-06 발표). 확인

    /* 재정: 재정경제부 「국가결산」, 기획예산처 「예산안」 */
    budget2026: 727.9e12,          // 2026년 본예산 총지출 727.9조원(2025-12-02 국회 통과). 확인
    budget2027: 820.9e12,          // 2027년 정부예산안 총지출 820.9조원(+12.8%, 2026-09-01 국무회의). 확인
    revenue2027: 880.8e12,         // 2027년 예산안 총수입 880.8조원. 대체로 확인
    debt2025: 1304.5e12,           // 2025 회계연도 국가채무(D1, 중앙+지방) 1,304.5조원. 확인
    debtRatio2025: 0.490,          // GDP 대비 49.0%. 확인
    debtRatio2026: 0.516,          // 2026년 본예산 기준 국가채무비율 51.6%. 확인
    debtRatio2027: 0.483,          // 2027년 예산안 기준 48.3%. 대체로 확인
    mgmtBalance2025: -104.2e12,    // 2025년 관리재정수지 −104.2조원(GDP 대비 −3.9%). 확인
    mgmtBalanceRatio2025: -0.039,
    totalBalance2025: -46.7e12,    // 2025년 통합재정수지 −46.7조원. 확인
    d2Ratio2024: 0.497,            // 2024 회계연도 일반정부부채(D2) GDP 대비 49.7%(1,270.8조원). 확인

    /* 가계부채: 한국은행 「가계신용」 */
    householdCredit: 2019.8e12,    // 2026년 2분기 말 가계신용 2,019.8조원(처음 2,000조원 돌파). 확인
    householdDebtGdp2025: 0.89,    // 2025년 말 가계부채 GDP 대비 89.0%. 대체로 확인(산출 기준 확인 필요)

    /* 시장(참고) */
    kospi: 6625.93,                // KOSPI 2026-10-08 종가. 시장 데이터
  };

  // 역사 기준값. 개편된 현행 시계열 값이 있으면 그것을 쓴다.
  EC.HIST = {
    // 기준금리 경로(결정일, 결정 후 금리). 한국은행 기준금리 추이. 확인(2008~09 일부 날짜 제외)
    baseRate: [
      ["2008-08-07", 0.0525], ["2008-10-09", 0.05], ["2008-10-27", 0.0425], ["2008-11", 0.04], ["2008-12", 0.03], ["2009-01", 0.025], ["2009-02", 0.02],
      ["2020-03-16", 0.0075], ["2020-05-28", 0.005],
      ["2021-08-26", 0.0075], ["2021-11-25", 0.01], ["2022-01-14", 0.0125], ["2022-04-14", 0.015], ["2022-05-26", 0.0175], ["2022-07-13", 0.0225], ["2022-08-25", 0.025], ["2022-10-12", 0.03], ["2022-11-24", 0.0325], ["2023-01-13", 0.035],
      ["2024-10-11", 0.0325], ["2024-11-28", 0.03], ["2025-02-25", 0.0275], ["2025-05-29", 0.025], ["2026-07-16", 0.0275], ["2026-08-27", 0.03],
    ],
    cpiAnnual: { 2021: 0.025, 2022: 0.051, 2023: 0.036, 2024: 0.023, 2025: 0.021 }, // 국가데이터처. 확인
    cpiPeak2022: { month: "2022-07", value: 0.063 },   // 1998년 11월(6.8%) 이후 최고. 확인
    growth2020: -0.007,      // 현행 시계열(첫 속보치 −1.0%). 대체로 확인
    growth1998: -0.051,      // 오래 인용된 값. 개편 시계열 −4.9% 보도가 있어 본문에 "약 −5%"로 쓴다. 확인 필요
    fx1997Peak: { date: "1997-12-23", close: 1962.0 },  // 종가. 대체로 확인
    fx2009Peak: { date: "2009-03-02", close: 1570.3 },  // 대체로 확인
    fx1998avg: 1394.97,
    imf1997: { request: "1997-11-21", approved: "1997-12-04", imfLoan: 210e8, drawn: 195e8, total: 550e8, repaid: "2001-08-23" }, // IMF Press Release 97/55. 확인
    fxReservesLow1997: 39e8, // 가용 외환보유액 약 39억 달러(1997-12-18). 대체로 확인
    lehman: "2008-09-15",
    swap2008: { date: "2008-10-30", size: 300e8 },
    swap2020: { date: "2020-03-19", size: 600e8 },
    currentAccountPrevMax: 1051.2e8, // 2015년. 대체로 확인
  };
  // KR-STATS-END

  /* ------------------------------------------------------------ 기본 수학 */
  EC.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  EC.lerp = (a, b, t) => a + (b - a) * t;
  EC.rng = function (seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  EC.gauss = function (seed) {
    const r = EC.rng(seed);
    return function () { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  };
  /** 0에서 1로 S자로 올라가는 반응 곡선. t: 경과 기간, half: 절반에 도달하는 기간, k: 가파름 */
  EC.ramp = function (t, half, k = 2) {
    if (t <= 0) return 0;
    const x = Math.pow(t / half, k);
    return x / (1 + x);
  };
  /** 올라갔다가 서서히 사라지는 혹 모양 반응(최대값 1, peak 시점에서 최대). 감마 커널 */
  EC.hump = function (t, peak) {
    if (t <= 0) return 0;
    const x = t / peak;
    return x * Math.exp(1 - x);
  };

  /* ------------------------------------------------------------ 시장: 수요와 공급 */
  /**
   * 선형 수요 P = a − b·Q, 선형 공급 P = c + d·Q.
   * tax: 공급자에게 매기는 단위당 세금(공급 곡선이 tax만큼 위로), ceiling/floor: 가격 상한·하한(없으면 null)
   * 반환: {q, p, pBuyer, pSeller, cs, ps, tax, dwl, shortage, surplus, qd, qs}
   */
  EC.market = function (o) {
    const a = o.a, b = o.b, c = o.c, d = o.d, tax = o.tax || 0;
    const q0 = Math.max(0, (a - c) / (b + d));                     // 세금 없는 균형
    let q = Math.max(0, (a - c - tax) / (b + d));
    let pBuyer = a - b * q, pSeller = pBuyer - tax;
    let shortage = 0, surplus = 0, qd = q, qs = q;
    if (o.ceiling != null && o.ceiling < pBuyer && !tax) {
      const pc = o.ceiling;
      qd = Math.max(0, (a - pc) / b); qs = Math.max(0, (pc - c) / d);
      q = Math.min(qd, qs); shortage = Math.max(0, qd - qs); pBuyer = pSeller = pc;
    } else if (o.floor != null && o.floor > pBuyer && !tax) {
      const pf = o.floor;
      qd = Math.max(0, (a - pf) / b); qs = Math.max(0, (pf - c) / d);
      q = Math.min(qd, qs); surplus = Math.max(0, qs - qd); pBuyer = pSeller = pf;
    }
    // 잉여: 실제 거래량 q까지의 면적
    const cs = (a - pBuyer) * q - 0.5 * b * q * q;
    const ps = (pSeller - c) * q - 0.5 * d * q * q;
    const total0 = 0.5 * (a - c) * q0;
    const dwl = Math.max(0, total0 - cs - ps - tax * q);
    return { q, p: pBuyer, pBuyer, pSeller, cs, ps, taxRevenue: tax * q, dwl, shortage, surplus, qd, qs, q0, p0: a - b * q0 };
  };
  /** 가격 탄력성(선형 수요의 한 점): (dQ/Q)/(dP/P) */
  EC.elasticity = (b, p, q) => (q > 0 ? -(1 / b) * (p / q) : -Infinity);

  /* ------------------------------------------------------------ 성장 */
  /** 전기 대비 성장률(분기) → 연율. (1+g)^4 − 1 */
  EC.annualize = (g, periods = 4) => Math.pow(1 + g, periods) - 1;
  /** 수준 배열에서 i번째 값의 전년 동기 대비(분기면 lag 4, 월이면 12) */
  EC.yoy = (arr, i, lag = 4) => (i >= lag && arr[i - lag] ? arr[i] / arr[i - lag] - 1 : NaN);
  /** 성장 기여도: 항목 변화 ÷ 지난 기 전체 */
  EC.contrib = (prevPart, curPart, prevTotal) => (curPart - prevPart) / prevTotal;
  /** 실질화: 명목 ÷ (물가지수/100) */
  EC.real = (nominal, deflator) => nominal / (deflator / 100);

  /* ------------------------------------------------------------ 금리 */
  /** 원리금균등 월 상환액과 이자만 낼 때 월 이자 */
  EC.payment = function (principal, rate, years) {
    const r = rate / 12, n = Math.max(1, Math.round(years * 12));
    const level = Math.abs(r) < 1e-12 ? principal / n : principal * r / (1 - Math.pow(1 + r, -n));
    return { level, interestOnly: principal * r };
  };
  /**
   * 고정금리 채권. face 액면, coupon 연 표면금리, yld 연 시장금리(만기수익률), years 남은 만기, freq 연 이자 지급 횟수
   * 반환: {price, duration(맥컬리, 년), modified(수정 듀레이션), flows:[{t, cf, pv}]}
   */
  EC.bond = function (o) {
    const face = o.face || 10000, freq = o.freq || 1, n = Math.max(1, Math.round(o.years * freq));
    const c = face * o.coupon / freq, y = o.yld / freq;
    let price = 0, dur = 0;
    const flows = [];
    for (let k = 1; k <= n; k++) {
      const cf = c + (k === n ? face : 0), pv = cf / Math.pow(1 + y, k);
      price += pv; dur += (k / freq) * pv; flows.push({ t: k / freq, cf, pv });
    }
    const duration = dur / price;
    return { price, duration, modified: duration / (1 + y), flows };
  };
  /** 피셔 방정식: 실질금리 = (1+명목)/(1+기대인플레) − 1 */
  EC.fisher = (nominal, inflation) => (1 + nominal) / (1 + inflation) - 1;
  /**
   * 테일러 준칙: i = r* + π + a(π − π*) + b·gap
   * 반환 금리는 소수. 기본 a = b = 0.5(Taylor 1993)
   */
  EC.taylor = function (o) {
    const rStar = o.neutral != null ? o.neutral : 0.01, target = o.target != null ? o.target : 0.02;
    const a = o.a != null ? o.a : 0.5, b = o.b != null ? o.b : 0.5;
    return rStar + o.inflation + a * (o.inflation - target) + b * o.gap;
  };

  /* ------------------------------------------------------------ 연결판: 기준금리가 퍼지는 길 */
  /**
   * 기준금리 변화가 여러 가격으로 번지는 월별 경로(교육용 축약 모형).
   * 반응의 크기와 시차는 국내외 연구가 보고하는 범위 안에서 고른 교육용 가정이다(본문 9장 '모형의 가정' 참조).
   * o: {dRate 기준금리 변화(소수, 0.0025 = 0.25%p), surprise 예상하지 못한 몫(0~1), usRate 같은 기간 미국 정책금리 변화(소수),
   *     months 볼 기간(기본 24), reset 변동금리 대출의 금리 재산정 주기(개월, 기본 6), debt 가계부채 민감도 배율(기본 1)}
   * 반환: {rows:[{m, base, bond3, loan, stock, house, fx, gdp, cpi}], peak:{…}} — 금리는 수준(소수), 나머지는 기준선 대비 %(소수)
   */
  EC.TRANSMIT = {
    bondPass: 0.8,      // 국고채 3년물이 예상 밖 기준금리 변화에 반응하는 비율
    bondExpected: 0.15, // 이미 예상된 몫은 발표 전에 대부분 반영되어 발표일에 덜 움직인다
    loanPass: 0.9,      // 은행 조달금리(COFIX 등)를 거쳐 변동 대출금리로 전가되는 비율
    loanHalf: 2,        // 조달금리가 절반쯤 따라오는 데 걸리는 개월
    stockNow: -4.0,     // 예상 밖 1%p 인상에 대한 발표 직후 주가 반응(%)
    stockLater: -3.0,   // 할인율·이익 경로로 1년에 걸쳐 더해지는 반응(%/1%p)
    houseLong: -4.0,    // 1%p 인상이 2년 뒤 집값 수준에 주는 영향(%)
    houseHalf: 9,       // 집값 반응이 절반에 이르는 개월
    fxNow: -2.0,        // 예상 밖 1%p 인상(내외 금리차 확대)에 대한 원/달러 환율 반응(%) — 음수는 원화 강세
    fxDecay: 18,        // 환율 반응이 서서히 되돌아가는 시간 상수(개월)
    usFx: 2.0,          // 미국 금리 1%p 인상에 대한 원/달러 환율 반응(%)
    gdpPeak: -0.5,      // 1%p 인상이 GDP 수준에 주는 최대 영향(%)
    gdpPeakAt: 15,      // 최대 영향이 나오는 개월
    cpiPeak: -0.35,     // 1%p 인상이 물가 수준에 주는 최대 영향(%)
    cpiPeakAt: 24,      // 물가는 가장 늦게 반응한다
    fxToCpi: 0.08,      // 환율 1% 변화가 물가 수준에 옮겨 가는 비율(수입물가 경로)
  };
  EC.transmit = function (o) {
    const T = EC.TRANSMIT, K = EC.KR;
    const dR = o.dRate || 0, s = o.surprise != null ? o.surprise : 1, dUS = o.usRate || 0;
    const months = o.months || 24, reset = o.reset || 6, debt = o.debt != null ? o.debt : 1;
    const base0 = o.base0 != null ? o.base0 : (K.baseRate || 0.025);
    const bond0 = o.bond0 != null ? o.bond0 : (K.bond3y || base0 + 0.003);
    const loan0 = o.loan0 != null ? o.loan0 : (K.mortgageRate || base0 + 1.5e-2);
    const p = dR * 100;          // %p 단위
    const ps = p * s, pe = p * (1 - s);
    const rows = [];
    for (let m = 0; m <= months; m++) {
      const base = base0 + dR;
      // 시장금리: 예상 밖 몫은 발표 즉시, 예상된 몫은 대부분 이미 반영(발표일 이후 변화는 작다)
      const bond3 = bond0 + (T.bondPass * ps + T.bondExpected * pe) / 100;
      // 변동 대출금리: 조달금리가 따라오고(loanHalf), 내 대출은 재산정 주기가 돌아올 때 바뀐다
      const funding = T.loanPass * p * EC.ramp(m, T.loanHalf, 1.5);
      const myStep = Math.floor(m / reset) * reset;   // 마지막 재산정 시점
      const loanMarket = loan0 + funding / 100;
      const loanMine = loan0 + (T.loanPass * p * EC.ramp(myStep, T.loanHalf, 1.5)) / 100;
      // 주가: 예상 밖 몫의 즉시 반응 + 1년에 걸친 할인율·이익 경로
      const stock = (T.stockNow * ps + T.stockLater * p * EC.ramp(m, 6, 1.5) * debt) / 100;
      // 환율(원/달러 % 변화): 금리차 충격은 즉시 원화 강세 후 서서히 되돌림, 미국 금리 인상은 반대 방향
      const fxShock = T.fxNow * ps;   // 예상된 몫은 발표 전에 반영되어 발표 뒤에는 움직이지 않는다
      const fx = ((fxShock + T.usFx * dUS * 100) * Math.exp(-m / T.fxDecay)) / 100;
      // 집값: 이자 부담·대출 한도·기대를 거쳐 천천히
      const house = (T.houseLong * p * debt * EC.ramp(m, T.houseHalf, 1.8) / EC.ramp(24, T.houseHalf, 1.8)) / 100;
      // 성장(GDP 수준): 소비·투자가 줄며 혹 모양으로 나타났다가 사라진다
      const gdp = (T.gdpPeak * p * debt * EC.hump(m, T.gdpPeakAt) + 0.1 * T.usFx * dUS * 100 * 0.02 * EC.hump(m, 6)) / 100;
      // 물가 수준: 수요 경로(늦게) + 환율 경로(수입물가, 빨리)
      const cpi = (T.cpiPeak * p * debt * EC.hump(m, T.cpiPeakAt)) / 100 + T.fxToCpi * fx * EC.ramp(m, 4, 1.5);
      rows.push({ m, base, bond3, loan: loanMarket, loanMine, stock, house, fx, gdp, cpi });
    }
    const pick = (k, f) => rows.reduce((best, r) => (f(r[k], best[k]) ? r : best), rows[0]);
    const peak = {};
    ["stock", "house", "fx", "gdp", "cpi"].forEach((k) => {
      const r = Math.abs(dR) + Math.abs(dUS) > 0 ? pick(k, (a, b) => Math.abs(a) > Math.abs(b)) : rows[0];
      peak[k] = { m: r.m, v: r[k] };
    });
    return { rows, peak, base0, bond0, loan0 };
  };

  /* ------------------------------------------------------------ 작은 경제(분기) */
  /**
   * 분기별 작은 개방경제 모형(교육용). 산출 갭(y, %), 물가상승률(pi, %), 기준금리(i, %), 원/달러 환율 누적 변화(e, %),
   * 실업률(u, %), 집값 상승률(h, 전년 대비 %)을 함께 굴린다.
   * o: {quarters, rule:true(테일러 준칙으로 금리 결정) | false(path 고정), ratePath:[분기별 금리 변화 %p],
   *     shocks:{demand:[%], oil:[%], fiscal:[%GDP], us:[%p], risk:[%]}, start:{pi, i, u}, params}
   */
  EC.ECONOMY = {
    rho: 0.7,        // 산출 갭의 지속성
    sigma: 0.25,     // 실질금리 갭 1%p가 산출 갭에 주는 영향
    fiscalMult: 0.6, // 정부지출 1%(GDP 대비) 충격의 첫 분기 승수
    fxExport: 0.04,  // 원화 약세 1%가 순수출을 거쳐 산출 갭에 주는 영향
    oilGap: 0.01,    // 유가 10% 상승이 산출 갭에 주는 영향(−0.1%p)
    piPersist: 0.6,  // 물가상승률의 관성
    kappa: 0.2,      // 산출 갭 1%p가 물가상승률에 주는 영향(필립스 곡선 기울기)
    fxPass: 0.05,    // 환율 1% 변화가 물가상승률에 옮겨 가는 몫(그 분기)
    oilPass: 0.02,   // 유가 1% 변화가 물가상승률에 옮겨 가는 몫(그 분기)
    target: 2.0,     // 물가안정목표(%)
    neutral: 2.25,   // 중립 명목금리(%) — 교육용 가정
    smooth: 0.7,     // 금리 평활화(준칙을 한 번에 따르지 않는다)
    uip: 1.5,        // 내외 금리차 1%p 변화에 대한 환율 반응(%)
    okun: 0.4,       // 산출 갭 1%p ↔ 실업률 −0.4%p
    uStar: 3.0,      // 자연실업률(%) — 교육용 가정
    houseRate: 3.0,  // 금리 1%p 상승이 집값 상승률을 낮추는 정도(%p)
    houseGap: 1.5,   // 산출 갭 1%p가 집값 상승률을 높이는 정도(%p)
  };
  EC.economy = function (o) {
    const P = Object.assign({}, EC.ECONOMY, o.params || {});
    const Q = o.quarters || 12, sh = o.shocks || {}, st = o.start || {};
    const at = (arr, t) => (arr && arr[t] != null ? arr[t] : 0);
    let y = st.y || 0, pi = st.pi != null ? st.pi : P.target, i = st.i != null ? st.i : P.neutral, e = 0, iUS = 0, fiscal = 0;
    const i0 = i, rows = [{ t: 0, y, pi, i, e, u: P.uStar - P.okun * y, h: 2 + P.houseGap * y, fiscal: 0 }];
    let rateAdj = 0;
    for (let t = 1; t <= Q; t++) {
      // 충격
      iUS += at(sh.us, t);
      fiscal = 0.6 * fiscal + at(sh.fiscal, t);               // 재정 충격은 서서히 사라진다
      const oil = at(sh.oil, t);
      // 금리 결정
      let iNew;
      if (o.rule) {
        const tr = P.neutral + 1.5 * (pi - P.target) + 0.5 * y;
        iNew = P.smooth * i + (1 - P.smooth) * tr;
        iNew = Math.max(0, iNew);
      } else {
        rateAdj += at(o.ratePath, t);
        iNew = Math.max(0, i0 + rateAdj);
      }
      const di = iNew - i;
      i = iNew;
      // 환율: 내외 금리차가 벌어지면 원화 강세(e 하락), 위험 회피 충격은 원화 약세
      const de = -P.uip * (di - at(sh.us, t)) + at(sh.risk, t);
      e += de;
      // 산출 갭
      const realGap = (i - pi) - (P.neutral - P.target);
      y = P.rho * y - P.sigma * realGap + P.fiscalMult * fiscal + P.fxExport * e * 0.25 - P.oilGap * oil * 0.1 + at(sh.demand, t);
      // 물가상승률(연율 개념의 전년 대비 근사)
      pi = P.piPersist * pi + (1 - P.piPersist) * P.target + P.kappa * y + P.fxPass * de + P.oilPass * oil;
      const u = P.uStar - P.okun * y;
      const h = 2 + P.houseGap * y - P.houseRate * (i - i0);
      rows.push({ t, y, pi, i, e, u, h, fiscal });
    }
    return { rows, params: P };
  };

  /* ------------------------------------------------------------ 재정 */
  /**
   * 국가채무 비율의 길: b(t+1) = b(t)·(1+r)/(1+g) − pb(t)
   * o: {b0 시작 부채비율(소수), r 명목 이자율, g 명목 성장률, pb 기초재정수지(GDP 대비, 흑자 +), years}
   */
  EC.debtPath = function (o) {
    const rows = [{ year: 0, b: o.b0 }];
    let b = o.b0;
    for (let t = 1; t <= (o.years || 30); t++) {
      const pb = typeof o.pb === "function" ? o.pb(t) : o.pb || 0;
      b = b * (1 + o.r) / (1 + o.g) - pb;
      rows.push({ year: t, b });
    }
    return { rows, steady: o.r === o.g ? Infinity : -(o.pb || 0) * (1 + o.g) / (o.r - o.g) };
  };

  /* ------------------------------------------------------------ 케이스: 지우의 헤드라인 노트 */
  // 가상의 인물이며 실제와 무관하다. 금액은 교육용으로 정한 값이다.
  // CASE-START
  EC.CASE = {
    // 노트는 2025년 10월에 시작해 2026년 9월에 한 바퀴를 돈다. 14장 실험실에서 1년을 결산한다.
    start: "2025-10", end: "2026-09",
    jiwoo: {
      name: "서지우", age: 31, job: "식품 제조사(가상의 D식품) 원료구매팀 대리, 6년 차",
      salary: 4.6e7,            // 연봉
      monthlyNet: 3.2e6,        // 월 실수령
      work: "수입 밀·원당·대두유를 달러로 계약한다. 환율과 국제 곡물값이 곧 원가다.",
    },
    home: {
      kind: "경기 F시 투룸 빌라 전세",
      deposit: 2.0e8,           // 전세 보증금
      loan: 1.4e8,              // 전세대출(변동금리)
      loanRate: 0.039,          // 2025년 10월 적용 금리(교육용)
      reset: 6,                 // 6개월마다 금리 재산정
      end: "2027-03",           // 전세 만기
    },
    savings: 1.5e7,             // 정기예금
    etf: { value: 1.2e7, monthly: 4.0e5 },  // 국내·미국 지수 ETF 적립(평가액, 월 적립액)
    livingCost: 2.1e6,          // 월 생활비(전세대출 이자 포함)
    goal: "3년 안에 내 집 마련을 할 수 있을지 판단하기",
    mentor: {
      name: "백정호", age: 64, relation: "외삼촌",
      career: "경제신문 기자 32년, 은퇴",
      rule: "헤드라인보다 표를 먼저 본다. 숫자를 보면 세 가지를 묻는다: 언제 기준인가, 무엇과 비교했나, 누가 쟀나.",
    },
  };
  const C = EC.CASE;
  C.monthlyInterest = C.home.loan * C.home.loanRate / 12;   // 월 이자
  C.monthlySaving = C.jiwoo.monthlyNet - C.livingCost;       // 월 저축 여력
  C.netWorth = C.home.deposit - C.home.loan + C.savings + C.etf.value;
  // CASE-END

  root.EC = EC;
  if (typeof module !== "undefined" && module.exports) module.exports = EC;
})(typeof window !== "undefined" ? window : globalThis);
