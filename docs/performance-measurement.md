# 가상화 스크롤 성능 측정 기록

mock 데이터 개수(1000 / 5000 / 10000)별로 적용 전/후 성능을 비교한다. 
`web/src/utils/mockData.js`의 `MOCK_COUNT`를 바꿔가며 측정

## 측정 방법

- **DOM 노드 수**: 콘솔에서 `document.querySelectorAll('.notification-item').length` (게시글은 `.post-card`)
- **렌더 시간/커밋 수**: React DevTools Profiler → 녹화 → 페이지 진입 → Flamegraph에서 확인
- **스크롤 FPS**: Chrome DevTools Performance 탭 → 녹화 → 리스트 스크롤 → FPS 그래프 확인

## 왜 이 세 지표를 선택했는지

브라우저가 화면을 그리는 과정은 `JS 실행 → Style 계산 → Layout(Reflow) → Paint → Composite` 순서로 진행된다. 이 중 **Layout 단계는 DOM 노드 수에 비례해서 비용이 커지는 단계**라서, 리스트 렌더링 성능을 이야기할 때는 "실제로 DOM에 몇 개의 노드가 존재하는가"가 가장 근본적인 지표가 된다. 가상화의 핵심 효과도 결국 "전체 데이터 개수와 무관하게 DOM 노드 수를 화면에 보이는 만큼으로 고정한다"는 것이므로, DOM 노드 수는 가상화가 실제로 작동하는지를 가장 직접적으로 보여주는 지표다.

브라우저는 이 파이프라인 전체를 초당 60번(60fps), 즉 한 프레임당 16.6ms 안에 끝내야 스크롤이 부드럽게 보인다. React 입장에서 이 16.6ms 예산을 채우는 것은 **render phase(Virtual DOM 계산)와 commit phase(실제 DOM 반영)**이고, React DevTools Profiler는 정확히 이 두 단계에 걸린 시간과 커밋된 컴포넌트 수를 보여준다. 즉 Profiler 수치는 "왜 느린가"를 React 렌더링 관점에서 설명해주는 지표다.

마지막으로 이 렌더 비용이 실제로 사용자 경험에 어떤 영향을 주는지는 **스크롤 FPS와 Long Task(50ms 이상 메인 스레드 점유)** 로 확인할 수 있다. FPS 드랍은 "몇 번째 프레임에서 예산을 초과했는가"를, Long Task는 "그 초과가 사용자 입력 반응 지연으로 이어질 만큼 심각한가"를 보여준다. 이 지표는 앞의 두 지표(DOM 노드 수, Profiler 시간)가 만들어내는 결과를 사용자 체감 성능으로 연결해주는 역할을 한다.

DOM 노드 수(원인) → React 렌더 비용(Profiler, 중간 과정) → 사용자 체감 성능(FPS/Long Task, 결과) 순으로 하나의 인과관계를 이루기 때문에, 세 지표를 함께 측정해야 "가상화가 왜, 어떻게 성능을 개선하는지"를 온전히 설명할 수 있기에 선택했다.

## 알림 페이지 (직접 구현 예정)

### 적용 전 (baseline)

| 개수 | DOM 노드 수 | Profiler 렌더 시간 | 스크롤 FPS / Long Task | 스크린샷 |
|---|---|---|---|---|
| 1000 | 1000 | 171.7ms (NotificationList 자체 28.8ms) | Main thread 188.2ms 점유 (6.06s 중) | |
| 5000 | 5000 | 341.2ms (NotificationList 자체 145.9ms) | Main thread 461ms 점유, 스크롤 중 dropped frame 2회+ 관찰 | |
| 10000 | 10000 | 517.8ms (NotificationList 자체 145.9ms) | Main thread 613.8ms 점유 (6.99s 중) | |

### 측정 방법 보완 — 자동 스크롤 기반 재측정

적용 후 성능을 Scripting 시간으로만 비교했더니, 적용 전보다 오히려 커 보이는 수치가 나왔다. 그런데 이는 부적절한 비교였다 — 적용 전에는 스크롤할 때 반응하는 리액트 코드가 없어서 Scripting 시간이 애초에 0에 가까웠고, 적용 후에는 windowing 계산 때문에 Scripting이 발생하는 게 당연하다. Scripting만 떼어놓고 비교할 게 아니라, Rendering/Painting/System을 다 합친 **전체 Main thread 점유 시간**으로 비교해야 공정한 비교가 된다.

또한 손으로 스크롤을 재현하다 보니 매번 스크롤 시간/속도가 달라져서 측정값이 들쭉날쭉했다. 이를 해결하기 위해 `element.scrollTo`를 `requestAnimationFrame`으로 감싸서 항상 동일한 조건(3000px, 3000ms)으로 스크롤을 재현하는 스크립트를 사용해 다시 측정했다. 보조 지표로 React Profiler의 렌더 커밋 횟수도 함께 기록한다.

```js
function autoScrollPage(distance = 3000, duration = 3000) {
    const startTop = window.scrollY;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startTop + distance * progress);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}
```

**적용 전 (자동 스크롤 기준)**

| 개수 | Main thread 총 점유 | Profiler 커밋 수 |
|---|---|---|
| 1000 | 123.3ms (4.91s 녹화 중, System 98ms/Scripting 13ms/Painting 8ms/Rendering 5ms) | 0개 — 적용 전엔 스크롤에 반응하는 리액트 코드가 없어서, 스크롤만으로는 리렌더 자체가 발생하지 않음 |
| 5000 | 181.0ms (6.04s 녹화 중, System 132ms/Scripting 18ms/Painting 16ms/Rendering 15ms) | 0개 |
| 10000 | 197.5ms (5.78s 녹화 중, System 132ms/Painting 28ms/Rendering 21ms/Scripting 16ms) | 0개 |

Scripting이 13ms로 거의 0에 가까운 것과, 커밋이 0개인 것 둘 다 "적용 전엔 스크롤 시 리액트가 관여하지 않는다"는 걸 그대로 보여준다.

### 적용 후 (직접 구현)

| 개수 | DOM 노드 수 | Profiler 렌더 시간 | 스크롤 FPS / Long Task | 스크린샷 |
|---|---|---|---|---|
| 1000 | 12 | 6.9ms | Main thread 1252ms 점유 (4.13s 중, Scripting 1039ms) — onScroll이 스크롤 픽셀마다 리렌더를 발생시켜 누적된 것으로 추정 | |
| 5000 | | | | |
| 10000 | 12 (overscan 적용 전 측정한 9에서 갱신) | | | |

### 측정 방법 보완 — 자동 스크롤 기반 재측정 (적용 후)

적용 전과 동일한 조건(3000px, 3000ms)으로, `.notification-list` 컨테이너를 대상으로 자동 스크롤해서 재측정한다.

```js
function autoScroll(selector, distance = 3000, duration = 3000) {
    const el = document.querySelector(selector);
    const startTop = el.scrollTop;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        el.scrollTop = startTop + distance * progress;
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}
```

| 개수 | Main thread 총 점유 | Profiler 커밋 수 |
|---|---|---|
| 1000 | 396.1ms → memo 적용 후 299.8ms (4.91s 녹화 중, Scripting 137ms/System 153ms/Rendering 19ms/Painting 13ms) | 41개 (커밋당 렌더 4.9ms 수준) |
| 5000 | 311.6ms (5.49s 녹화 중, System 159ms/Scripting 145ms/Rendering 19ms/Painting 13ms) — memo 적용 상태 | 42개 (커밋당 렌더 1.6~2.3ms 수준) |
| 10000 | 330.7ms (5.21s 녹화 중, System 178ms/Scripting 142ms/Rendering 20ms/Painting 15ms) — memo 적용 상태 | 41개 (커밋당 렌더 2ms 수준) |

같은 3000px 스크롤 기준으로 적용 전(123.3ms)과 비교하면 오히려 늘었다. Scripting이 13ms→240ms로 크게 증가한 게 원인이다. DOM/초기 렌더 관점에서는 가상화가 확실히 이득이지만, 스크롤 중 총 메인 스레드 비용만 보면 추가 최적화 없이는 오히려 손해라는 걸 수치로 확인했다. (정확한 원인 분석과 추가 최적화 시도는 아래 "구현 과정 기록" 참고)

### 구현 과정 기록 — overscan 버그 디버깅

기본 windowing(고정 높이 컨테이너 + spacer + slice)까지 구현한 뒤 빠르게 스크롤해보니, 새 아이템이 그려지기 전에 흰 화면이 스치는 문제가 있었다. 화면에 딱 보이는 개수(9개, `Math.ceil(600/73)`)만 렌더링하고 있어서, 스크롤이 리액트의 재렌더링 속도보다 빠르면 아직 안 그려진 영역이 그대로 노출되는 것이었다. 이를 해결하기 위해 위아래로 여유분을 더 그리는 overscan을 도입했다.

**1차 시도 — 상쇄 버그**

```jsx
const OVERSCAN = 3;
const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
const endIndex = startIndex + visibleCount + OVERSCAN;
```

리스트 맨 위 근처에서는 흰 화면이 사라진 것처럼 보였지만, 리스트 **중간**에서 빠르게 스크롤하면 여전히 문제가 재현됐다. 원인은 대입해보면 바로 드러난다. `scrollTop = 730`(73px짜리 아이템 기준 10번째 근처)이라고 하면:

- `startIndex = Math.max(0, 10 - 3) = 7` — 위쪽 여유분은 정상 반영
- `endIndex = startIndex + visibleCount + OVERSCAN = 7 + 9 + 3 = 19`

그런데 overscan을 아예 적용하지 않았을 때의 `endIndex`도 `10 + 9 = 19`로 **정확히 같은 값**이었다. `startIndex`를 구할 때 이미 `-OVERSCAN`을 반영해놓고, `endIndex`를 그 `startIndex`에 다시 `+OVERSCAN`을 더해서 구하다 보니 `-OVERSCAN`과 `+OVERSCAN`이 대수적으로 상쇄돼버린 것이다. 그 결과 뒤쪽(스크롤 진행 방향)에는 overscan이 사실상 전혀 적용되지 않고 있었다 — 위쪽 근처에서만 `Math.max(0, ...)`의 clamp 때문에 우연히 효과가 있어 보였을 뿐

**2차 시도 — `OVERSCAN * 2`**

```jsx
const endIndex = startIndex + visibleCount + OVERSCAN * 2;
```

상쇄되는 `OVERSCAN` 한 몫을 미리 계산에 넣어 대입하면(`(rawStart - OVERSCAN) + visibleCount + OVERSCAN*2 = rawStart + visibleCount + OVERSCAN`), 원하던 결과가 나온다는 걸 대수적으로 확인하고 적용했다. 실제로 리스트 중간에서의 흰 화면 문제는 해결됐다. 다만 리스트 맨 위 근처에서는 `startIndex`가 `Math.max(0, ...)`에 의해 clamp되면서 상쇄가 깨지고, 그만큼 `endIndex`가 필요한 것보다 더 커져서 항목을 몇 개 더 그리는 부작용이 남았다 — 버그는 아니지만 clamp 여부에 따라 계산의 의미가 달라지는 결합된 구조였음

**최종 — `rawStartIndex` 분리**

```jsx
const rawStartIndex = Math.floor(scrollTop / ITEM_HEIGHT); // clamp 전 원본
const startIndex = Math.max(0, rawStartIndex - OVERSCAN);   // 렌더링용
const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
const endIndex = rawStartIndex + visibleCount + OVERSCAN;   // 원본 기준으로 계산
```

`endIndex`를 clamp된 `startIndex`가 아니라 clamp 전의 `rawStartIndex`를 기준으로 계산하도록 분리했다. 이렇게 하면 `startIndex`가 clamp되든 안 되든 `endIndex`는 항상 "원래 보여야 할 위치 + OVERSCAN"이라는 동일한 의미를 유지한다. 즉 렌더링 범위 계산과 clamp 처리가 서로 영향을 주지 않도록 완전히 분리된 것이 핵심이다.

이 과정에서 배운 것: 한쪽 값을 다른 쪽 값 계산에 재사용할 때는, 그 값에 이미 어떤 보정(clamp, 오프셋 등)이 들어가 있는지 항상 확인해야 한다. 특히 "빼고 - 더하고"처럼 대수적으로 상쇄될 수 있는 연산은 코드만 봐서는 버그가 잘 안 보이고, 실제 숫자를 대입해봐야 드러난다.

### 구현 과정 기록 — onScroll 리렌더 최적화 시도

overscan까지 반영한 뒤 mock 1000개 기준으로 적용 후 성능을 측정했는데, Profiler 렌더 시간은 6.9ms로 크게 줄었지만(적용 전 171.7ms) Chrome Performance 탭의 Scripting 시간은 오히려 1039ms(4.13s 녹화 중)로 적용 전(188.2ms)보다 커 보이는 수치가 나왔다.

**원인 추정**: 지금 구현은 `onScroll` 이벤트가 발생할 때마다(스크롤 픽셀 단위로, 초당 수십~수백 번) `setScrollTop`을 호출해서 리렌더를 트리거하고 있었다. 개별 렌더 자체는 가볍지만(DOM 노드가 12개뿐이라 6~8ms 수준), 스크롤 몇 초 동안 이 가벼운 렌더가 수백 번 누적되면 총 Scripting 시간이 커질 수 있다.

**1차 최적화 — index가 실제로 바뀔 때만 상태 업데이트**

```jsx
function handleOnScroll(nextScrollTop) {
    const nextRawIndex = Math.floor(nextScrollTop / ITEM_HEIGHT);
    const currentRawIndex = Math.floor(scrollTop / ITEM_HEIGHT);

    if (nextRawIndex !== currentRawIndex) {
        setScrollTop(nextScrollTop);
    }
}
```

아이템이 절대 위치(`top: index * ITEM_HEIGHT`)로 고정돼 있고 실제 스크롤은 브라우저 네이티브 스크롤바가 처리하므로, "화면에 보여줄 아이템 구간(index)"이 바뀔 때만 리렌더하면 충분하다는 논리로 적용했다.

**결과— 뚜렷한 개선을 확인하지 못함**: 같은 방식(3~4초 스크롤)으로 다시 측정했지만 Scripting 시간은 1215~1259ms 선으로 비슷했다. 원인을 다시 짚어보면:

- `onScroll` 핸들러 자체(state를 갱신하지 않더라도 `Math.floor` 비교 로직)는 상태 업데이트 여부와 무관하게 **모든 스크롤 이벤트마다 계속 호출**된다. 즉 이 최적화는 "리렌더 횟수"는 줄여주지만 "핸들러 호출 횟수"는 줄여주지 못한다.
- 손으로 스크롤을 재현하다 보니 매 측정마다 스크롤 시간/속도가 미묘하게 달라져서(4.13s, 4.45s, 5.51s...), Chrome Performance 탭의 총합 수치만으로는 정확한 before/after 비교가 어려웠다. React Profiler로 커밋(리렌더) 횟수를 직접 세는 방식이 더 신뢰할 수 있는 지표이지 않을까 라는 생각이 들었다.

**결론적으로 남은 최적화 여지**: 아래와 같은 방식으로 추가 최적화를 시도해볼 수 있을 것 같다.

1. **`requestAnimationFrame` throttling** — 지금처럼 브라우저가 쏘는 모든 스크롤 이벤트에 반응하는 대신, 프레임당(최대 초당 60번) 한 번만 스크롤 위치를 확인하도록 제한하는 것 (`onScroll` 핸들러 실행 횟수 자체를 줄인다.)
2. **`React.memo`** — 리렌더가 발생해도 props가 바뀌지 않은 `NotificationItem`은 다시 그리지 않도록 방지하는 것

react-window 같은 라이브러리가 빠르다고 느껴지는 이유는 이런 세부 최적화들을 이미 내장하고 있기 때문이라는 걸 이번 시도로 확인했다. 직접 구현에서는 이런 기법들을 하나하나 별도로 적용해야 하고, 그 격차 자체가 "왜 라이브러리를 쓰는가"에 대한 실증적인 답이 될 수 있을 것 같다는 생각이 든다.

### 구현 과정 기록 — rAF 쓰로틀링 시도와 재분석

위에서 제안한 두 방향 중 `requestAnimationFrame` 쓰로틀링을 먼저 시도했다. 손 스크롤 대신 자동 스크롤(3000px/3000ms)로 정확히 같은 조건에서 다시 측정할 수 있게 된 상태였으므로, 이번엔 신뢰할 수 있는 비교가 가능했다.

```jsx
const tickingRef = useRef(false);

function handleOnScroll(nextScrollTop) {
    if (tickingRef.current) {
        return;
    }

    tickingRef.current = true;

    requestAnimationFrame(() => {
        const nextRawIndex = Math.floor(nextScrollTop / ITEM_HEIGHT);
        const currentRawIndex = Math.floor(scrollTop / ITEM_HEIGHT);

        if (nextRawIndex !== currentRawIndex) {
            setScrollTop(nextScrollTop);
        }

        tickingRef.current = false;
    });
}
```

같은 조건(3000px, 3000ms)으로 측정한 결과, 적용 전(123.3ms) 대비 적용 후는 396.1ms였고, rAF 쓰로틀링을 추가한 뒤에도 396.5ms로 **거의 변화가 없었다.**

**재분석**: 애초에 이 최적화들(index 체크, rAF 쓰로틀링)은 전부 "중복으로 발생하는 불필요한 리렌더를 걸러내는" 방식이었다. 그런데 3000px ÷ 아이템 높이(73px) ≈ 41번은 보여줄 구간(index) 자체가 실제로 바뀌므로, 이 41번의 리렌더는 애초에 걸러낼 수 없는 **필수 리렌더**다. 41번 × 렌더 1회 비용(Profiler 기준 ~6~8ms) ≈ 250~330ms로, 실제 측정된 240ms대와 비슷한 규모다. 즉 지금까지 시도한 두 최적화는 "렌더 횟수를 줄이는" 접근이었는데, 애초에 줄일 만한 중복 렌더가 거의 없었기 때문에 효과가 없었던 것으로 보인다.

측정에서 뚜렷한 효과가 없었으므로, rAF 쓰로틀링 코드는 제거했다. 다음으로는 "렌더 횟수"가 아니라 "렌더 1회당 비용"을 줄이는 방향(`React.memo`)을 시도해본다.

### 구현 과정 기록 — React.memo 적용

`NotificationItem`을 `memo`로 감쌌다. `notification`과 `onChanged` props가 이전 커밋과 동일한 아이템(스크롤로 새로 진입하지 않은, 계속 화면에 남아있는 아이템)은 리렌더를 건너뛰도록 하는 목적이다. `onChanged`로 전달되는 `refetch`가 `useCallback`으로 감싸져 있어 참조가 안정적이라는 것도 미리 확인했다 — 그렇지 않으면 매 렌더마다 `onChanged`가 새 함수로 바뀌어 memo가 무의미해진다.

```jsx
function NotificationItem({ notification, onChanged }) {
    // ...
}

export default memo(NotificationItem);
```

같은 조건(3000px, 3000ms)으로 측정한 결과 **396.1ms → 299.8ms로 개선됐다** (Scripting 240ms → 137ms, 약 43% 감소). rAF 쓰로틀링과 달리 이번엔 재분석에서 예상한 대로 효과가 있었다. overscan을 포함해 한 번에 12~15개 정도가 렌더되는데, 스크롤 한 번에 그중 실제로 "새로 화면에 들어오는" 아이템은 1~2개뿐이고 나머지는 이미 떠 있던 아이템이 위치만 유지되는 것이었다. memo 덕분에 이 나머지 아이템들의 리렌더 비용이 걸러진 것으로 판단했다. 적용 전 baseline인 123.3ms보다는 여전히 높았지만, 최적화 시도들 중 유일하게 측정 가능한 개선을 보였다.

## 알림 페이지 구현 후 총평

### DOM 노드 수 / 초기 렌더

가상화 적용 후 DOM 노드 수는 1000/5000/10000 어느 개수에서도 항상 12개 안팎(overscan 포함)으로 고정됐다. 데이터가 몇 개든 화면에 보이는 만큼만 그린다는 windowing의 핵심 효과가 그대로 확인된 셈이다. 초기 렌더(Profiler 마운트 기준)도 1000개에서 171.7ms → 6.9ms로 약 25배 개선됐다. DOM 노드 수가 고정되므로 5000/10000에서도 비슷한 수준일 것으로 예상되지만, 이 두 구간은 별도로 재측정하지는 않았다.

### 스크롤 중 Main thread 점유

자동 스크롤(3000px/3000ms) 기준으로 최종(memo 적용) 상태를 측정한 결과:

| 개수 | 적용 전 | 적용 후(memo) |
|---|---|---|
| 1000 | 123.3ms | 299.8ms |
| 5000 | 181.0ms | 311.6ms |
| 10000 | 197.5ms | 330.7ms |

세 구간 모두 적용 후 수치가 적용 전보다 높았다. 적용 전은 브라우저 네이티브 스크롤이라 리액트가 전혀 관여하지 않아 비용이 낮았다고 판단했다. 적용 후는 스크롤 구간(3000px ÷ 73px ≈ 41회)마다 리액트가 windowing을 다시 계산하고 커밋해야 하므로, 이 비용은 구조적으로 없애기 어렵다고 본다. rAF 쓰로틀링은 효과가 없었는데, 애초에 걸러낼 만한 중복 렌더가 없었기 때문으로 분석했다. `React.memo`는 렌더 1회당 비용을 줄여 396ms대에서 300ms대로 개선했지만, 적용 전 수치(123.3ms)보다는 여전히 높았다.

### 결론

가상화는 스크롤 성능보다 초기 렌더와 DOM/메모리 쪽에서 이득이 크다고 판단했다. 알림처럼 아이템이 가볍고 개수가 수천~수만 단위인 경우, 초기 렌더 이득은 뚜렷했지만 스크롤 중 비용만 보면 오히려 손해일 수 있었다. 이는 직접 구현이 미숙해서라기보다 브라우저 네이티브 컴포지팅이 원래 매우 저렴하다는 구조적인 이유 때문이라고 생각한다. `React.memo` 같은 기법으로 격차를 줄일 수는 있었지만 완전히 없애지는 못했다. 이미지가 포함돼 데이터 개수에 비례해 baseline 자체가 무거워지는 게시글 목록에서는 이 트레이드오프가 어떻게 나타나는지가 다음 비교 지점이다.

## 게시글 목록

### 적용 전 (baseline)

| 개수 | DOM 노드 수 | Profiler 렌더 시간 | 스크롤 FPS / Long Task | 스크린샷 |
|---|---|---|---|---|
| 1000 | 1000 | 276.4ms (PostList 자체 29.2ms) | Main thread 516.5ms 점유 (5.38s 중) | |
| 5000 | 5000 | 783.5ms (PostList 자체 163.8ms) | Main thread 2038ms 점유(6.36s 중, Rendering 868ms/System 727ms/Painting 404ms/Scripting 50ms) | |
| 10000 | 10000 | 1484.5ms (PostList 자체 278ms) | Main thread 9710.1ms 점유 (12.09s 중, 약 80%), Main 트랙에 Long Task 경고 플래그 다수 관찰. 체감상 새로고침 시 로딩이 멈춘 듯한 지연 발생 | |

### 측정 방법 보완 — 자동 스크롤 기반 재측정

알림 페이지와 같은 이유로, 손 스크롤 대신 `autoScrollPage(3000, 3000)` 스크립트로 동일 조건에서 다시 측정한다.

| 개수 | Main thread 총 점유 | Profiler 커밋 수 |
|---|---|---|
| 1000 | 173.9ms (5.66s 녹화 중, System 121ms/Rendering 19ms/Scripting 18ms/Painting 16ms) | 0개 |
| 5000 | 385.8ms (5.45s 녹화 중, System 244ms/Rendering 81ms/Painting 40ms/Scripting 21ms) | 0개 |
| 10000 | 664.3ms (5.14s 녹화 중, System 393ms/Rendering 172ms/Painting 76ms/Scripting 23ms) | 0개 |

### 구현 과정 기록 — 라이브러리 선정까지의 흐름

**1. 기존 masonry의 성능 문제**

게시글 목록은 `.post-list`에 `column-count: 3` + `column-gap`을 적용한 3단 CSS masonry다. 카드가 늘어날수록 위 baseline에서 확인한 문제가 그대로 나타났다 — 10000개 기준 초기 렌더가 Profiler 1484.5ms, 새로고침 시 Main thread를 녹화 시간의 약 80%(9710.1ms) 점유하며 화면이 멈춘 듯한 지연이 체감됐고, 스크롤 중 Main thread 점유도 데이터 개수에 비례해 173.9ms → 385.8ms → 664.3ms로 계속 커졌다. 전체 카드를 한 번에 DOM에 그리는 구조라, 가상화로 보이는 만큼만 그리도록 개선할 여지가 명확했다.

**2. react-window 적용 시도 → masonry 구조와 충돌**

알림 페이지처럼 react-window(`List`)를 적용하자마자 화면이 깨졌다. 카드 사이 간격이 사라지고 카드끼리 겹쳐 보였다.

**3. 왜 구조적으로 맞지 않는지**

- masonry는 카드마다 높이가 다르고(이미지 있는 카드 378px, 없는 카드 214px), `column-count`가 카드를 3개 열에 빈틈없이 분배한다.
- 반면 react-window(`List`)는 한 줄짜리 세로 리스트(또는 균일한 행 높이의 `Grid`)만 가상화한다. 렌더 결과가 단일 컨테이너라, 3열 masonry처럼 콘텐츠가 여러 열로 흐르는 레이아웃 자체를 표현할 수 없다.
- 카드 간격을 만들던 `margin-bottom: 24px`도 react-window의 고정 행 높이 계산에 포함되지 않아, 카드가 자기 행 박스를 넘쳐 다음 카드를 덮었다.
- 즉 "열 분배 + 카드별 가변 높이"라는 masonry의 요구사항이 react-window의 전제(단일 축, 균일·예측 가능한 크기)와 구조적으로 맞지 않았다. `Grid`로 3열을 흉내내도 한 행 높이가 그 행에서 가장 큰 카드에 맞춰 고정되어 짧은 카드 밑에 빈 공간이 생기므로, masonry의 빈틈없이 채우는 특성은 재현되지 않는다.

**4. masonry를 지원하는 가상화 라이브러리 선정**

masonry 레이아웃을 유지하면서 가상화하려면 masonry를 지원하는 라이브러리가 필요했다. 두 가지 후보를 두고 고민했다.

- **masonic** — masonry 전용 라이브러리. 열 분배와 window 스크롤 기반 가상화가 전부 내장돼 있어, 카드 컴포넌트와 데이터만 넘기면 되는 "배터리 포함" 방식이다. 지금 프로젝트의 3열 그리드에 가장 쉽게 들어맞는다.
- **@tanstack/react-virtual** — 범용 가상화 라이브러리. 컴포넌트가 아니라 훅(`useVirtualizer`)으로 "무엇을 어디에 그릴지" 계산 결과만 제공하고, 실제 렌더링·배치는 직접 담당한다. masonry도 열 분배 로직을 얹어 구성할 수 있지만 손이 더 간다.

지금 프로젝트는 3열 그리드라 masonic도 충분히 적합하지만, TanStack Virtual로 결정했다. 현업에서 더 널리 쓰이는 라이브러리라 배워두고 더 공부해보고 싶기도 했고, 나중에 이 그리드 디자인을 다른 형태로 바꾸게 될 수도 있어 특정 레이아웃에 묶이지 않는 범용 도구가 유지보수 측면에서 낫겠다고 판단했다.

### 적용 후 (TanStack Virtual)

mock 데이터는 3개 중 1개꼴로 이미지 있는 카드(가변 높이)로 섞음

**초기 렌더 (마운트) + DOM 노드 수 — 가상화 핵심 개선 지표**

| 개수 | DOM 노드 수 | 초기 렌더 Profiler 시간 | (baseline 대비) |
|---|---|---|---|
| 1000 | 12 | 14.4ms (PostList 자체 3.2ms) | baseline 276.4ms → 약 19배 개선 |
| 5000 | 12 | 15ms (PostList 자체 4.6ms) | baseline 783.5ms → 약 52배 개선 |
| 10000 | 12 | 18.1ms (PostList 자체 2.4ms) | baseline 1484.5ms(화면 프리징) → 약 82배 개선, 프리징 해소 |

**스크롤 중 Main thread 점유 (트레이드오프 참고용, 자동 스크롤 3000px/3000ms)**

| 개수 | Main thread 총 점유 | Profiler 커밋 수 |
|---|---|---|
| 1000 | 733.7ms (5.41s 녹화 중, Scripting 525ms/System 170ms/Painting 36ms/Rendering 34ms) | 28개 (커밋당 렌더 최대 26.1ms 수준) |
| 5000 | 618.7ms (5.53s 녹화 중, Scripting 429ms/System 118ms/Painting 49ms/Rendering 47ms) | 20개 |
| 10000 | 571.4ms (5.43s 녹화 중, Scripting 429ms/System 109ms/Rendering 32ms/Painting 30ms) | 21개 |

## 게시글 목록 구현 후 총평

### 애초에 해결하려던 문제

게시글 목록은 원래 무한스크롤이 적용돼 있어 처음엔 10개만 불러온다. 즉 첫 진입에 전체를 다 그리는 문제는 무한스크롤이 이미 막아준다. 문제는 그다음이다. 무한스크롤은 불러온 카드를 DOM에서 지우지 않고 계속 쌓기만 하기 때문에, 아래로 내려갈수록 DOM에 카드가 수백~수천 개 누적된다. baseline에서 mock으로 1000/5000/10000개를 한 번에 올린 상태는, 실제로는 무한스크롤로 그만큼 스크롤해 내려온 시점의 DOM 상태에 해당한다.

이렇게 카드가 쌓인 상태에서 리렌더가 일어나면 Layout·Paint 대상이 누적된 카드 전체가 되어, 렌더 비용이 개수에 비례해 커졌다(초기 렌더 276.4ms → 783.5ms → 1484.5ms, 10000개에서는 Main thread를 녹화의 약 80% 점유하며 화면 프리징 체감). 무한스크롤이 네트워크·초기 로드를 줄이는 최적화라면, 가상화의 목표는 이렇게 **누적된 카드 중 화면 밖 카드는 DOM에서 빼서 그리지 않도록** 만들어 누적 렌더 비용을 없애는 것이었다. 둘은 해결하는 병목이 다르며, 서로 대체가 아니라 보완 관계다.

### 개선된 부분 1 — DOM 노드 수 (원인 자체를 고정)

가상화 적용 후 DOM에 실제로 존재하는 `.post-card`는 데이터가 1000개든 10000개든 항상 12개(overscan 포함)로 고정됐다. baseline은 개수만큼(최대 10000개) 그대로 DOM에 쌓였으니, 브라우저가 Layout·Paint를 계산해야 할 대상 자체가 수백~수천 배 줄어든 것이다. 이 DOM 노드 수 고정이 아래 초기 렌더 개선의 근본 원인이다.

### 개선된 부분 2 — 초기 렌더 (의도한 지점에서 정확히 개선)

DOM 노드 수가 12개로 고정되면서, 초기 렌더 시간도 데이터 개수와 무관하게 14~18ms 수준으로 평평해졌다.

| 개수 | baseline 초기 렌더 | TanStack 초기 렌더 | 개선 배율 |
|---|---|---|---|
| 1000 | 276.4ms | 14.4ms | 약 19배 |
| 5000 | 783.5ms | 15ms | 약 52배 |
| 10000 | 1484.5ms (프리징) | 18.1ms | 약 82배 |

여기서 초기 렌더는 첫 진입 렌더만이 아니라, 카드가 누적된 상태에서 발생하는 리렌더(마운트 커밋)를 뜻한다. 주목할 점은 **개선 배율이 데이터가 많아질수록 커진다(19배 → 52배 → 82배)**는 것이다. baseline은 누적된 카드 개수에 비례해 계속 무거워지는데 가상화 후에는 항상 12개만 그려서 거의 일정하기 때문이다. 즉 가상화의 이득은 **카드가 많이 쌓여서 실제로 문제가 되는 구간**에서 가장 커지며, 특히 10000개 누적 시 체감되던 화면 프리징이 완전히 사라졌다. 원래 해결하려던 문제가 의도한 지점에서 정확히 해소된 것이다.

### 트레이드오프 — 스크롤 중 비용

대신 스크롤 중 Main thread 점유는 baseline보다 높아졌다. baseline은 스크롤할 때 리액트가 관여하지 않아(브라우저 네이티브 스크롤) 비용이 낮았지만, 가상화 후에는 스크롤 구간마다 지금 무엇을 어디에 그릴지를 다시 계산·커밋하므로 이 비용이 새로 생긴다. 알림 페이지에서 확인한 것과 같은 성격의 트레이드오프다.

다만 게시글 목록에서는 한 가지 차이가 있다. baseline의 스크롤 비용은 개수에 비례해 커졌지만(173.9ms → 385.8ms → 664.3ms), 가상화 후에는 개수와 무관하게 일정하다(733.7ms → 618.7ms → 571.4ms, 측정 노이즈 범위 내에서 평평) 카드의 이미지 페인트 비용이 baseline에서는 데이터가 많을수록 커졌지만, 가상화 후에는 보이는 만큼으로 고정되기 때문이다. 그래서 데이터가 더 많아질수록 스크롤 비용에서도 baseline과의 격차가 좁혀지고, 어느 지점을 넘으면 스크롤에서도 가상화가 유리해질 것으로 판단한다.

### 디자인 — masonry 유지

TanStack Virtual의 `lanes` 옵션으로 3열 masonry 배치(어느 카드가 몇 번 열, 세로 위치 얼마)를 라이브러리가 계산하고, `estimateSize`로 이미지 유무에 따른 가변 높이(378px / 214px)를 반영했다. 그 결과 react-window에서 깨졌던 기존 masonry 디자인을 그대로 유지하면서 가상화를 적용할 수 있었다.

## 구현 전 총평 (baseline 결과 정리)

### 초기 렌더 비용 (페이지 로드 시, Profiler 렌더 시간 기준)

데이터 개수를 1000 → 5000 → 10000으로 늘려가며 측정한 결과, 알림/게시글 목록 모두 DOM 노드 수, Profiler 렌더 시간이 개수에 따라 함께 증가하는 걸 확인했다. 다만 증가 폭이 정확히 비례하지는 않았다. 알림 페이지의 경우 1000→5000(데이터 5배)일 때 렌더 시간은 171.7ms→341.2ms(약 2배)로, 5000→10000(데이터 2배)일 때는 341.2ms→517.8ms(약 1.5배)로 늘었다. 데이터가 늘어날수록 항목 하나당 추가되는 비용의 비중이 상대적으로 줄어드는 것처럼 보이는데, 이는 초기 커밋에 고정으로 들어가는 오버헤드(Provider 트리 구성 등)가 있고 그 위에 항목 수에 비례하는 비용이 더해지는 구조이기 때문으로 보인다.

같은 개수에서 알림과 게시글 목록을 비교하면 게시글 쪽이 훨씬 무겁다. 1000개에서 171.7ms(알림) vs 276.4ms(게시글), 5000개에서 341.2ms vs 783.5ms, 10000개에서 517.8ms vs 1484.5ms로, 개수가 늘어날수록 두 페이지의 격차도 함께 벌어졌다. `PostCard`가 이미지, 아바타, 좋아요/댓글/조회수 3종 통계까지 렌더링하는 반면 `NotificationItem`은 아이콘과 텍스트 한 줄뿐이라, 항목 하나의 구조 복잡도가 그대로 총 렌더 비용 차이로 이어진 것으로 판단된다.

게시글 목록 10000개에서는 새로고침 시 화면이 다 그려지지 않고 로딩이 멈춘 듯한 지연을 체감할 수 있었다 — 이건 초기 렌더(Profiler 기준 1484.5ms) 자체가 무거워서 나타나는 현상이다.

### 스크롤 중 성능 (자동 스크롤 3000px/3000ms 고정, 재측정 기준)

초기 렌더와 별개로, 스크롤 중 Main thread 점유는 자동 스크롤 스크립트(`autoScrollPage`)로 항상 동일한 조건에서 다시 측정했다. 알림 페이지는 1000→5000→10000에서 Main thread 점유가 123.3ms→181.0ms→197.5ms로 거의 평평했다. 스크롤은 항상 같은 거리만 움직이고, 이미 다 그려진 DOM 중 새로 화면에 나타나는 영역만 다시 페인트하면 되기 때문에 전체 리스트 길이와는 크게 상관없다. 반면 게시글 목록은 173.9ms→385.8ms→664.3ms로 뚜렷하게 증가했는데, `PostCard`의 이미지 페인트/디코딩 비용이 커서 스크롤 중 새로 노출되는 영역 자체의 비용이 더 크기 때문으로 보인다.

두 페이지 모두 스크롤 중 React Profiler 커밋 수는 0개였다. 가상화 적용 전에는 스크롤에 반응하는 리액트 코드가 아예 없어서, 스크롤로 인한 성능 비용은 전부 브라우저 자체의 레이아웃/페인트 작업이지 React 렌더링과는 무관하다는 뜻이다. 이는 가상화 적용 후(스크롤마다 리액트가 windowing을 다시 계산하고 커밋함)와 근본적으로 다른 지점이라, 적용 전/후를 비교할 때 "숫자가 작아졌다/커졌다"만 볼 게 아니라 "비용의 종류 자체가 브라우저 렌더링 비용에서 React 렌더링 비용으로 바뀐다"는 것도 함께 봐야 한다.

### 결론

이 결과는 가상화가 필요한 이유를 뒷받침한다. 초기 렌더 비용은 두 페이지 모두 데이터 개수에 비례해 커지고, 게시글 목록은 만 단위에서 체감 가능한 지연까지 발생한다. 다음 단계로 알림 페이지엔 직접 구현(onScroll + slice)을, 게시글 목록엔 react-window를 적용해서, 초기 렌더 비용과 스크롤 중 Main thread 점유 두 가지 모두 얼마나 개선되는지를 비교할 예정이다.

## 비교 소감 (직접 구현 vs 라이브러리)

<!-- 구현 끝나고 작성 -->
