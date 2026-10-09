# EconomicsBook 챕터 작성 가이드

빌드 과정 없는 정적 사이트다. `index.html` + `chapters/<slug>.html` + 공통 `css/style.css`, `js/common.js`(전역 `EB`), `js/econ.js`(전역 `EC`).
로컬 실행: `python3 -m http.server 8000` → http://localhost:8000 (file://로 열어도 동작하게 classic script만 쓴다. ES module 금지.)
레이아웃·헬퍼 코드는 같은 시리즈의 [EstateBook](https://github.com/geniuskey/estatebook)(원래는 [MoneyBook](https://github.com/geniuskey/moneybook))에서 가져왔다. 전역 `EB`와 CSS 접두사 `eb-`는 그대로 쓴다(EconomicsBook의 약자로 읽는다). 계산 엔진만 `EC`다.
문체와 시뮬레이터 수준은 MoneyBook의 [금리·환율·경기](https://moneybook.euiyun.com/chapters/economy.html)와 EstateBook의 [집값과 금리](https://estatebook.euiyun.com/chapters/value.html)를 본보기로 삼는다.

## 기여물의 라이선스
실행 코드는 MIT, 본문·그림·문제·해설 등 교육 콘텐츠는 CC BY 4.0. 구분은 [라이선스 안내](LICENSE.md)를 따른다.

## 이 책이 답하려는 질문
1. **이 헤드라인의 숫자는 무엇을 잰 것인가.** 성장률·물가·실업률·환율·국가채무 같은 숫자는 정의, 기준 시점, 비교 기준(전기 대비·전년 동기 대비·연율), 계절 조정 여부, 속보와 수정치가 있다. 장마다 "이 숫자는 무엇과 비교한 것인가"를 한 번은 짚는다.
2. **이 변화는 무엇이 일으켰고 어디로 번지는가.** 수요·공급, 금리, 환율, 재정이 서로 이어져 있다는 것을 조작으로 보여 준다. 한 변수를 움직이면 다른 변수가 어떤 순서와 시차로 따라오는지 본다.
3. **내 생활에는 무엇을 뜻하는가.** 대출 이자, 월급의 실질 가치, 일자리, 해외 직구 값, 주식과 집값. 경제 뉴스를 내 가계부의 숫자로 옮긴다.
4. **독자 모두에게 쓸모 있게.** 경제 기사를 읽다 막히는 사회초년생, 대출·투자를 시작한 직장인, 시사 상식이 필요한 수험생. 본문은 사전 지식 없는 일반인 기준으로 쓰고, 기사 쓰는 쪽의 사정과 흔한 오독은 `.callout.news`(기자 노트), 원자료를 직접 찾고 확인하는 법은 `.callout.stat`(통계 확인), 깊은 이야기는 `.callout.deep`(심화), 시리즈의 다른 책으로 이어지는 길은 `.callout.link`(함께 읽기)로 덧붙인다.

## 원칙
- **한국어**, 평서문 "~다", 이모지 금지. 용어는 처음 나올 때 `<span class="term">국내총생산</span><span class="en">(GDP, Gross Domestic Product)</span>`처럼 쓰고 한 문장으로 풀어 준다. 기사 말투(빅컷, 매파·비둘기파, 킹달러, 영끌, 연착륙)는 쓰되 바로 뜻을 풀어 준다.
- **만져 보며 배우기**(Bartosz Ciechanowski가 본보기). 읽고 외우는 책이 아니라, 변수를 직접 끌고 바꿔 보면서 "아, 그래서"를 얻는 책이다.
  - 개념 하나에 조작 가능한 그림 하나. 정적인 SVG는 조작으로 대신할 수 없을 때만 쓴다(장마다 2~3개: 구조도, 흐름도).
  - 한 시뮬레이터는 **한 가지**만 보여 준다. 슬라이더는 1~3개. 장마다 5~7개, 장의 대표 시뮬레이터(여러 변수를 한꺼번에 움직이는 것)를 장 끝 쪽에 하나.
  - 글은 시뮬레이터 바로 앞에서 "무엇을 움직여 볼지"를, 바로 뒤에서 "무엇을 봤는지"를 말한다.
  - 캔버스 위 직접 끌기(`EB.drag`)를 적극적으로 쓴다(수요 곡선 끌기, 금리 경로의 점 끌기, 시점 세로선 끌기). 끌 수 있는 것에는 손잡이를 그린다.
  - 값을 끝까지 밀었을 때 **무너지는 모습**이 보여야 한다: 가격 상한이 품귀를 만든다, 금리가 성장률보다 높으면 부채 비율이 끝없이 오른다, 레버리지가 높으면 작은 손실이 은행을 무너뜨린다. 한계가 배울 점이다.
  - 결과는 숫자(`.sim-readout`)로도 함께 보여 준다. 원화는 `EB.won()`, 퍼센트는 `EB.pct()`, 퍼센트포인트는 "0.25%p"로 쓴다.
  - 애니메이션은 `EB.loop`(화면 밖에서는 자동으로 멈춘다).
- 순서: 이 장의 헤드라인 → 일상의 질문 → 조작 가능한 그림 → 원리(필요하면 수식, KaTeX, 장마다 0~3개) → 시뮬레이터 → 실제 통계 → 지우의 헤드라인 노트 → 핵심 정리 → 확인 퀴즈(4문항, 정답 위치 섞기).
- **수치는 공식 통계로 확인하고 출처와 기준 시점을 단다.** 한국은행(ECOS, 보도자료), 통계청(국가데이터처, KOSIS), 기획재정부(2026년부터 재정경제부로 표기되는 자료가 있다), 고용노동부, 관세청·산업통상자원부, 국회예산정책처, e-나라지표, 미국 연준(FOMC) 같은 1차 출처를 쓴다. 엔진의 `EC.KR`과 `EC.HIST`에 모아 두고, 본문에서는 `<span class="src">(한국은행, 2026년 2분기 실질 GDP 속보치)</span>`처럼 숫자 곁에 출처와 시점을 붙인다. 확인 결과는 [SOURCES.md](SOURCES.md)에 모은다. 확인하지 못한 값은 쓰지 않거나 '약', "확인 필요"로 남긴다.
- 통계는 **수정된다**(GDP 속보치 → 잠정치 → 확정치, 계절조정 재추정). 장마다 한 번은 `.callout.warn`으로 "숫자는 기준 시점의 값이며 수정될 수 있다" 또는 "시뮬레이터는 교육용 모형이며 전망이 아니다"를 말한다.
- **지어낸 통계·기사·발언을 쓰지 않는다.** 헤드라인은 실제 공식 발표(보도자료·통계 공표)를 바탕으로 이 책이 다시 쓴 문장이며, 특정 언론사의 기사 제목을 옮기지 않는다. 실제 데이터를 확보하지 못한 그림은 "교육용 가상 데이터"라고 표시한다.
- **투자 권유와 전망을 하지 않는다.** 특정 종목·펀드·금융회사·유튜버 이름을 쓰지 않는다. 금리·환율·주가·집값의 방향을 예측하지 않는다. 정책을 평가할 때는 찬반 양쪽의 근거를 함께 쓴다.
- 외부 라이브러리는 KaTeX만. 이미지 대신 인라인 SVG/canvas.
- 색은 CSS 변수(`var(--accent)`)나 `EB.palette()`를 쓴다. 오름·흑자·들어오는 돈은 `--ok`, 내림·적자·나가는 돈은 `--bad`, 주의는 `--warn`, 주제색은 `--accent`(남색), 보조는 `--accent-2`(주황).
- 모바일(폭 360px)에서 가로 스크롤 금지. SVG는 `viewBox`만 주고(폭 420~480) width/height 생략.
- 다른 장을 언급할 때는 `<a href="rates.html">7장</a>`처럼 링크한다. 시리즈의 다른 책은 전체 URL로 링크한다(아래 표).

## 시리즈 연결
금리·주식·집 이야기가 나오면 `.callout.link`로 해당 장을 연결한다. 이 책은 거시경제의 흐름을, 연결된 책은 내 돈의 결정을 맡는다. 같은 설명을 길게 되풀이하지 않는다.

| 이 책의 주제 | 연결할 장 |
|---|---|
| 돈과 신용 창조 | MoneyBook [돈은 어떻게 생겨나는가](https://moneybook.euiyun.com/chapters/money.html) |
| 물가와 구매력 | MoneyBook [물가와 구매력](https://moneybook.euiyun.com/chapters/inflation.html) |
| 금리와 복리, 대출 상환 | MoneyBook [금리와 복리](https://moneybook.euiyun.com/chapters/interest.html), [대출 상환의 구조](https://moneybook.euiyun.com/chapters/loan.html), [신용과 빚](https://moneybook.euiyun.com/chapters/credit.html) |
| 금리·환율·경기 개관 | MoneyBook [금리·환율·경기](https://moneybook.euiyun.com/chapters/economy.html) |
| 채권 가격 | MoneyBook [채권](https://moneybook.euiyun.com/chapters/bond.html) |
| 주가와 금리·경기 | StockBook [주가는 왜 움직이는가](https://stockbook.euiyun.com/chapters/price.html), [가치평가](https://stockbook.euiyun.com/chapters/valuation.html), [금리·경기·주식](https://stockbook.euiyun.com/chapters/macro.html) |
| 해외 주식과 환율 | StockBook [해외 주식과 환율](https://stockbook.euiyun.com/chapters/global.html) |
| 집값과 금리 | EstateBook [집값과 금리](https://estatebook.euiyun.com/chapters/value.html), [주택담보대출](https://estatebook.euiyun.com/chapters/mortgage.html) |
| 집값 통계, 거품 | EstateBook [집값 통계 읽기](https://estatebook.euiyun.com/chapters/data.html), [거품과 하락](https://estatebook.euiyun.com/chapters/bubble.html), [공급의 시차](https://estatebook.euiyun.com/chapters/supply.html) |
| 전세와 금리 | EstateBook [전세의 경제학](https://estatebook.euiyun.com/chapters/jeonse.html) |

## head 블록

모든 HTML 페이지에는 아래 Cloudflare Web Analytics 코드를 `<head>`에 한 번 포함한다. SEO 자동 생성 블록 밖에 두며, 시리즈 공통 Site Token을 유지한다.

각 챕터 `<head>`에는 아래 표식만 두고 `python3 tools/head.py <slug>`를 실행한다(인자 없이 실행하면 전체 장 + 사이트맵 + `index.html`의 JSON-LD를 갱신한다). 제목·번호는 `js/common.js`의 `CHAPTERS`에서 읽는다. `js/econ.js`는 항상 함께 불러온다.
```html
<!doctype html>
<!-- Copyright (c) 2026 geniuskey and EconomicsBook contributors.
     Executable code: MIT (see ../LICENSE-MIT).
     Text, illustrations, questions and explanations: CC-BY-4.0 (see ../LICENSE.md). -->
<html lang="ko">
<head>
<!--head:start {"desc": "한 문장 설명"}-->
<!--head:end-->
<!-- Cloudflare Web Analytics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"3d6151a0abc94ede89285d462527fa80"}'></script>
<!-- End Cloudflare Web Analytics -->
</head>
```

## 페이지 골격
```html
<body data-chapter="slug">
<main class="chapter">
  <header class="chapter-hero">
    <div class="eyebrow">Chapter NN</div><h1>제목</h1><p class="lead">…</p>
    <ul class="objectives"><li>…</li></ul>
  </header>
  <div class="headline">이 장의 헤드라인 한 줄<small>지우의 헤드라인 노트 · 2026년 1월 · 근거: 통계청 「2025년 12월 및 연간 소비자물가 동향」(2026-01-0X)</small></div>
  <section id="영문-id"><h2>절 제목</h2> … </section>
  <section class="keypoints" id="summary"><h2>핵심 정리</h2><ol><li>…</li></ol></section>
  <section class="quiz-sec" id="quiz"><h2>확인 퀴즈</h2><div class="quiz"> … </div></section>
</main>
<script>(function () { "use strict"; /* 시뮬레이터 */ })();</script>
</body>
```
상단바·챕터 목록·여섯 부 띠·오른쪽 목차·h2 번호·이전/다음·푸터·퀴즈 동작·KaTeX 렌더는 `common.js`가 자동으로 만든다. 직접 넣지 않는다.

## 컴포넌트
- 헤드라인: `<div class="headline">문장<small>근거·날짜</small></div>`. 장 머리(hero 바로 뒤)에 하나, 케이스 안에 하나.
- 그림: `<figure class="diagram"><svg viewBox="0 0 440 300" role="img" aria-label="…">…</svg><figcaption><b>그림 1. 제목.</b> 설명</figcaption></figure>`. SVG 안에서는 `.lbl`, `.lbl-dim`, `.lbl-b`, `.lbl-acc`, `.lbl-acc2`, `.lbl-bad`, `.t-mono`, `.s-line`, `.s-axis`, `.s-acc`, `.s-acc2`, `.s-ok`, `.s-dash`, `.s-bad`, `.f-surface`, `.f-elev`, `.f-acc`, `.f-acc2`, `.f-ok`, `.f-warn`, `.f-bad`, `.f-acc-soft`, `.f-acc2-soft`, `.f-ok-soft`, `.f-warn-soft`, `.f-bad-soft` 클래스를 쓴다. 색을 직접 적지 않는다(다크 모드). 화살표 머리는 `<marker>`에 `fill="context-stroke"`. marker id는 장 안에서 겹치지 않게 짓는다.
- 시뮬레이터:
```html
<div class="sim" id="sim-x">
  <div class="sim-head"><span class="sim-tag">SIMULATOR</span><h3>제목</h3></div>
  <div class="sim-body side">
    <div class="sim-view"><canvas id="x-cv"></canvas></div>
    <div class="sim-controls">
      <label class="ctrl"><span>이름 <output id="x-a-out"></output></span><input type="range" id="x-a" min="0" max="10" step="0.1" value="3"></label>
      <div class="seg" id="x-mode"><button data-value="a" class="on">A</button><button data-value="b">B</button></div>
      <label class="check"><input type="checkbox" id="x-c"> 옵션</label>
      <div class="btn-row"><button class="btn primary" id="x-go">실행</button><button class="btn" id="x-re">다시</button></div>
    </div>
  </div>
  <div class="sim-readout"><div class="stat"><span class="k">이름</span><span class="v" id="x-o-1">—</span></div></div>
  <div class="sim-note">해볼 것: ① … ② … ③ … (모델의 가정)</div>
</div>
```
  시뮬레이터 id는 `sim-`으로 시작하고 장 안에서 겹치지 않게 짓는다(외부 링크·실험 검색이 이 id를 쓴다). 컨트롤이 없거나 캔버스를 직접 끄는 시뮬레이터는 `.sim-body`에서 `side`를 빼고 `.sim-view` 안에 `<span class="hint">끌어서 움직인다</span>`를 둔다. `<select>`는 쓰지 않는다(`.seg`를 쓴다).
- 수식: `<div class="formula">$$…$$<div class="where">기호 설명</div></div>`, 문장 속은 `\(…\)`.
- 강조 상자: `.callout`, `.callout.tip`, `.callout.warn`, `.callout.deep`(심화), `.callout.news`(기자 노트), `.callout.stat`(통계 확인), `.callout.link`(함께 읽기). 첫 `<strong>`이 제목이다(라벨은 CSS가 앞에 붙인다). **장마다 `.callout.news` 1~2개, `.callout.stat` 1~2개**를 넣는다. 기자 노트는 백정호의 목소리로 헤드라인이 만들어지는 사정과 흔한 오독(기저효과, 전기비와 전년비 혼동, 속보치의 수정, 사상 최대라는 말의 함정)을, 통계 확인은 그 숫자의 원자료가 어디에 언제 공표되는지(ECOS 100대 통계지표, KOSIS, 보도자료 일정)와 정의를 담는다.
- 표: `<div class="table-wrap"><table>…</table></div>`. 숫자 칸은 `class="num"`.
- 계산서: `<div class="slip"><div class="row"><span>항목</span><span>값</span></div>…<div class="row total"><span>합계</span><span>…</span></div></div>`.
- 금액·변화 색: `<span class="won plus">+0.3%</span>`, `<span class="won minus">−0.2%</span>`.
- 범례: `<div class="legend"><span><i style="background:var(--bad)"></i>이자</span></div>`, `.pill`, `.ok-t` `.bad-t` `.warn-t`.
- 퀴즈: `<div class="quiz-q"><p>문제</p><div class="opts"><button class="opt">…</button><button class="opt" data-correct>정답</button></div><div class="quiz-exp">해설</div></div>` (장마다 4문항, 정답 위치를 섞는다).
- 지우의 헤드라인 노트:
```html
<div class="casefile">
  <div class="tag"><b>CASE 지우</b><span>헤드라인 노트 · 2026년 1월</span></div>
  <div class="headline">헤드라인<small>근거</small></div>
  <h4>지우가 노트에 적은 질문</h4>
  <p>…이 장의 방법으로 헤드라인을 해석한 과정. 삼촌(백정호)의 질문, 지우의 계산, 지우의 생활(대출 이자, 회사 원가, ETF)에 미치는 영향…</p>
  <div class="clue"><div><b>헤드라인이 말한 것</b>…</div><div><b>숫자를 다시 보니</b>…</div><div><b>내 생활에는</b>…</div></div>
</div>
```

## 이어지는 케이스: 지우의 헤드라인 노트
모든 장은 같은 가상의 인물이 1년(2025년 10월~2026년 9월) 동안 매달 헤드라인 하나를 골라 해석하는 노트를 따라간다. 노트는 날짜순으로 쓰였고, 책은 그것을 주제순으로 엮는다. 1장에 1년치 헤드라인 달력이 있다. 각 장 끝(핵심 정리 앞)에 `.casefile` 하나를 넣고, **아래 표에서 자기 장에 해당하는 내용만** 다룬다. 숫자는 `EC.CASE`, `EC.KR`과 엔진으로 직접 계산해서 쓴다(`node -e "require('./js/econ.js'); const E = globalThis.EC; …"`로 확인). 인물과 회사는 가상이다.

- `EC.CASE.jiwoo` 서지우(31): 식품 제조사(가상의 D식품) 원료구매팀 대리 6년 차. 수입 밀·원당·대두유를 달러로 계약하므로 환율과 국제 곡물값이 곧 원가다. 연봉 4,600만원, 월 실수령 약 320만원. 경기 F시 투룸 빌라 전세 2억원(그중 1억 4,000만원이 전세대출, 6개월마다 금리 재산정, 2025년 10월 연 3.9%), 정기예금 1,500만원, 지수 ETF 적립(평가액 1,200만원, 월 40만원), 월 생활비 210만원(대출 이자 포함). 목표: 3년 안에 내 집 마련을 할 수 있을지 판단하기.
- `EC.CASE.mentor` 백정호(64): 지우의 외삼촌, 경제신문 기자 32년 뒤 은퇴. 원칙은 "헤드라인보다 표를 먼저 본다". 숫자를 보면 세 가지를 묻는다: 언제 기준인가, 무엇과 비교했나, 누가 쟀나.

헤드라인 달력과 장별 내용은 [SOURCES.md](SOURCES.md)의 "헤드라인 노트" 표가 원본이다.

## JS 헬퍼 (`EB`, `js/common.js`)
- `EB.canvas(el|선택자, draw(ctx, w, h), {aspect, minHeight, maxHeight})` → `{redraw(), ctx, w, h, canvas}`. 리사이즈·테마 변경 시 자동으로 다시 그린다. draw 안에서 `EB.palette()`를 매번 다시 읽는다. w, h는 CSS px. 문자열은 `querySelector` 선택자이므로 `"#id"`로 넘긴다. 만들자마자 draw를 한 번 부르므로 draw가 읽는 상태와 컨트롤(`EB.range`, `EB.seg`)을 먼저 만든다. draw 안에서 자기 반환값을 참조하지 않는다(초기화 전 접근 오류).
- `EB.drag(canvas|선택자, {start(x, y, e), move(x, y, e), end(), hover(x, y, e)})` 캔버스 위 끌기(마우스·터치, CSS px). draw에서 계산한 배치(상자, 축 변환)를 바깥 변수에 저장해 두고 move에서 역변환한다.
- `EB.chart(ctx, box|null, {x:[min,max], y:[min,max], logX, logY, xLabel, yLabel, xFmt, yFmt, xTicks, yTicks, series:[{data:[[x,y]], color, width, dash, fill}], vlines:[{x,color,label}], hlines:[{y,color,label}], points:[{x,y,color,r,label}], bands:[{x0,x1,color}]})` → `{X, Y, box}`. box를 생략하면 왼쪽 여백 58px이다.
- `EB.bars(ctx, box|null, {labels, stacks:[{label, color, data}], y, yFmt, yLabel, gap, hlines, highlight, valueFmt})` → `{X(i), Y, box, bw}` 누적 막대(음수는 아래로).
- `EB.donut(ctx, cx, cy, R, [{label, value, color}], {inner, center:{big, small}, labels, highlight})` → `{hit(x, y)}`.
- `EB.range(id, fmt, onInput)` → `get()`, `get.set(v)`. 출력은 `id + "-out"` 요소. `EB.seg(id, onChange)` → `get()`, `get.set(v)`. `EB.stat(id, html)`.
- `EB.loop(el, (dt, t) => {})` 화면에 보일 때만 도는 애니메이션. `.stop()`, `.start()`, `.toggle()`.
- `EB.palette()` → `{bg, text, dim, faint, grid, axis, border, surface, accent, accent2, ok, warn, bad, red, green, blue, series}`, `EB.color(name)`, `EB.isDark()`, `EB.onTheme(cb)`. 반투명 칠은 `EB.color("accent-soft")`, `"accent-2-soft"`, `"ok-soft"`, `"warn-soft"`, `"bad-soft"`.
- `EB.won(x)` "1억 2,346만원", `EB.wonAxis(x)` "1.2억", `EB.pct(x, digits)` "3.45%", `EB.fmt(x, digits)`, `EB.font(px, mono, weight)`, `EB.rng(seed)`, `EB.randnSeeded(seed)`, `EB.clamp/lerp/map`, `EB.debounce`.
- 고정폭 글꼴(`EB.font(px, true)`, SVG의 `.t-mono`)은 숫자·영문에만 쓴다. 한글은 자간이 벌어진다.
- `EB.CHAPTERS`, `EB.PARTS`(여섯 부). 장을 공개할 때 slug를 `READY`에 더하고 `python3 tools/head.py <slug>`, `python3 tools/head.py --site`를 실행한다.

## 경제 계산 엔진 (`EC`, `js/econ.js`)
모든 장이 같은 숫자와 모형을 쓰게 하는 공통 엔진이다. 공식 통계는 직접 적지 말고 `EC.KR`·`EC.HIST`에서 읽는다(본문 문장 속 숫자는 같은 값을 쓰고 출처를 단다). 장 고유의 작은 계산은 장 안에서 해도 된다. 엔진 값은 본문에서 "이 책의 모형으로 계산하면"이라고 밝힌다.
- 통계 `EC.KR`(각 값에 출처·기준 시점 주석), 역사 기준값 `EC.HIST`.
- 시장: `EC.market({a, b, c, d, tax, ceiling, floor})` → `{q, p, pBuyer, pSeller, cs, ps, taxRevenue, dwl, shortage, surplus, qd, qs, q0, p0}`(수요 P = a − bQ, 공급 P = c + dQ), `EC.elasticity(b, p, q)`.
- 성장: `EC.annualize(g)`, `EC.yoy(arr, i, lag)`, `EC.contrib(prevPart, curPart, prevTotal)`, `EC.real(nominal, deflator)`.
- 금리: `EC.payment(principal, rate, years)` → `{level, interestOnly}`, `EC.bond({face, coupon, yld, years, freq})` → `{price, duration, modified, flows}`, `EC.fisher(nominal, inflation)`, `EC.taylor({inflation, gap, neutral, target, a, b})`.
- 연결판: `EC.transmit({dRate, surprise, usRate, months, reset, debt, base0, bond0, loan0})` → `{rows:[{m, base, bond3, loan, loanMine, stock, house, fx, gdp, cpi}], peak}`. 반응 계수는 `EC.TRANSMIT`(교육용 가정, 9장에서 근거 범위를 밝힌다).
- 작은 경제: `EC.economy({quarters, rule, ratePath, shocks:{demand, oil, fiscal, us, risk}, start, params})` → `{rows:[{t, y, pi, i, e, u, h, fiscal}]}`. 계수는 `EC.ECONOMY`.
- 재정: `EC.debtPath({b0, r, g, pb, years})` → `{rows:[{year, b}], steady}`.
- 반응 곡선: `EC.ramp(t, half, k)`, `EC.hump(t, peak)`. 난수: `EC.rng(seed)`, `EC.gauss(seed)`.
- 케이스: `EC.CASE`(위 인물 값, 파생값 `monthlyInterest`, `monthlySaving`, `netWorth`).

## 점검
- `python3 tools/check.py <slug>` (playwright 필요). 넓은 화면·라이트와 360px·다크로 열어 콘솔 오류, 가로 넘침, 조작 중 예외를 보고한다. `--shots 폴더`로 스크린샷을 남겨 눈으로도 본다. 크로미움 경로는 `CHROMIUM_PATH` 환경 변수로 바꿀 수 있다.
- 장을 끝낼 때마다 쓴 통계와 출처를 [SOURCES.md](SOURCES.md)에 적고, 확인하지 못한 값을 따로 표시한다.
