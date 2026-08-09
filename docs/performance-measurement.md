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

### 적용 후 (직접 구현)

| 개수 | DOM 노드 수 | Profiler 렌더 시간 | 스크롤 FPS / Long Task | 스크린샷 |
|---|---|---|---|---|
| 1000 | | | | |
| 5000 | | | | |
| 10000 | 9 | | | |

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

그런데 overscan을 아예 적용하지 않았을 때의 `endIndex`도 `10 + 9 = 19`로 **정확히 같은 값**이었다. `startIndex`를 구할 때 이미 `-OVERSCAN`을 반영해놓고, `endIndex`를 그 `startIndex`에 다시 `+OVERSCAN`을 더해서 구하다 보니 `-OVERSCAN`과 `+OVERSCAN`이 대수적으로 상쇄돼버린 것이다. 그 결과 뒤쪽(스크롤 진행 방향)에는 overscan이 사실상 전혀 적용되지 않고 있었다 — 위쪽 근처에서만 `Math.max(0, ...)`의 clamp 때문에 우연히 효과가 있어 보였을 뿐이다.

**2차 시도 — `OVERSCAN * 2`**

```jsx
const endIndex = startIndex + visibleCount + OVERSCAN * 2;
```

상쇄되는 `OVERSCAN` 한 몫을 미리 계산에 넣어 대입하면(`(rawStart - OVERSCAN) + visibleCount + OVERSCAN*2 = rawStart + visibleCount + OVERSCAN`), 원하던 결과가 나온다는 걸 대수적으로 확인하고 적용했다. 실제로 리스트 중간에서의 흰 화면 문제는 해결됐다. 다만 리스트 맨 위 근처에서는 `startIndex`가 `Math.max(0, ...)`에 의해 clamp되면서 상쇄가 깨지고, 그만큼 `endIndex`가 필요한 것보다 더 커져서 항목을 몇 개 더 그리는 부작용이 남았다 — 버그는 아니지만 clamp 여부에 따라 계산의 의미가 달라지는 결합된 구조였다.

**최종 — `rawStartIndex` 분리**

```jsx
const rawStartIndex = Math.floor(scrollTop / ITEM_HEIGHT); // clamp 전 원본
const startIndex = Math.max(0, rawStartIndex - OVERSCAN);   // 렌더링용 (0 밑으로 안 내려감)
const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
const endIndex = rawStartIndex + visibleCount + OVERSCAN;   // "원본" 기준으로 계산
```

`endIndex`를 clamp된 `startIndex`가 아니라 clamp 전의 `rawStartIndex`를 기준으로 계산하도록 분리했다. 이렇게 하면 `startIndex`가 clamp되든 안 되든 `endIndex`는 항상 "원래 보여야 할 위치 + OVERSCAN"이라는 동일한 의미를 유지한다. 즉 렌더링 범위 계산과 clamp 처리가 서로 영향을 주지 않도록 완전히 분리된 것이 핵심이다.

이 과정에서 배운 것: 한쪽 값을 다른 쪽 값 계산에 재사용할 때는, 그 값에 이미 어떤 보정(clamp, 오프셋 등)이 들어가 있는지 항상 확인해야 한다. 특히 "빼고 - 더하고"처럼 대수적으로 상쇄될 수 있는 연산은 코드만 봐서는 버그가 잘 안 보이고, 실제 숫자를 대입해봐야 드러난다.

## 게시글 목록 (react-window 예정)

### 적용 전 (baseline)

| 개수 | DOM 노드 수 | Profiler 렌더 시간 | 스크롤 FPS / Long Task | 스크린샷 |
|---|---|---|---|---|
| 1000 | 1000 | 276.4ms (PostList 자체 29.2ms) | Main thread 516.5ms 점유 (5.38s 중) | |
| 5000 | 5000 | 783.5ms (PostList 자체 163.8ms) | Main thread 2038ms 점유(6.36s 중, Rendering 868ms/System 727ms/Painting 404ms/Scripting 50ms) | |
| 10000 | 10000 | 1484.5ms (PostList 자체 278ms) | Main thread 9710.1ms 점유 (12.09s 중, 약 80%), Main 트랙에 Long Task 경고 플래그 다수 관찰. 체감상 새로고침 시 로딩이 멈춘 듯한 지연 발생 | |

### 적용 후 (react-window)

| 개수 | DOM 노드 수 | Profiler 렌더 시간 | 스크롤 FPS / Long Task | 스크린샷 |
|---|---|---|---|---|
| 1000 | | | | |
| 5000 | | | | |
| 10000 | | | | |

## 가상화 스크롤 구현 전 성능 총평 (baseline 결과 정리)

데이터 개수를 1000 → 5000 → 10000으로 늘려가며 측정한 결과, 알림/게시글 목록 모두 DOM 노드 수, Profiler 렌더 시간, Main thread 점유 시간이 개수에 따라 함께 증가하는 걸 확인했다. 다만 증가 폭이 정확히 비례하지는 않았다. 알림 페이지의 경우 1000→5000(데이터 5배)일 때 렌더 시간은 171.7ms→341.2ms(약 2배)로, 5000→10000(데이터 2배)일 때는 341.2ms→517.8ms(약 1.5배)로 늘었다. 데이터가 늘어날수록 항목 하나당 추가되는 비용의 비중이 상대적으로 줄어드는 것처럼 보이는데, 이는 초기 커밋에 고정으로 들어가는 오버헤드(Provider 트리 구성 등)가 있고 그 위에 항목 수에 비례하는 비용이 더해지는 구조이기 때문으로 보인다.

같은 개수에서 알림과 게시글 목록을 비교하면 게시글 쪽이 훨씬 무겁다. 1000개에서 171.7ms(알림) vs 276.4ms(게시글), 5000개에서 341.2ms vs 783.5ms, 10000개에서 517.8ms vs 1484.5ms로, 개수가 늘어날수록 두 페이지의 격차도 함께 벌어졌다. `PostCard`가 이미지, 아바타, 좋아요/댓글/조회수 3종 통계까지 렌더링하는 반면 `NotificationItem`은 아이콘과 텍스트 한 줄뿐이라, 항목 하나의 구조 복잡도가 그대로 총 렌더 비용 차이로 이어진 것으로 판단된다.

가장 뚜렷한 신호는 게시글 목록 10000개에서 나왔다. Main thread가 전체 녹화 시간(12.09s)의 약 80%(9710.1ms)를 차지했고, 실제로 새로고침 시 화면이 다 그려지지 않고 로딩이 멈춘 듯한 지연을 체감할 수 있었다. 같은 10000개에서 알림 페이지는 Main thread 점유가 613.8ms/6.99s(약 8.8%)로 상대적으로 양호했는데, 이 차이 역시 항목 하나의 렌더 비용 차이가 누적된 결과로 보인다. 즉 "느려진다"는 감각적인 표현이 아니라, 특정 지점(게시글 목록 기준 대략 만 단위)을 넘어서면 브라우저가 실질적으로 응답하지 못하는 수준까지 갈 수 있다는 걸 수치로 확인했다.

이 결과는 가상화가 필요한 이유를 뒷받침한다. 다음 단계로 알림 페이지엔 직접 구현(onScroll + slice)을, 게시글 목록엔 react-window를 적용해서, 특히 게시글 목록 10000개 케이스가 얼마나 개선되는지를 핵심 비교 지점으로 삼을 예정이다.

## 비교 소감 (직접 구현 vs 라이브러리)

<!-- 구현 끝나고 작성 -->
