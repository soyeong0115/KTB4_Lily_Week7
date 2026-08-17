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
| 1000 | | | | |
| 5000 | | | | |
| 10000 | | | | |

## 게시글 목록 (react-window 예정)

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

### 적용 후 (react-window)

| 개수 | DOM 노드 수 | Profiler 렌더 시간 | 스크롤 FPS / Long Task | 스크린샷 |
|---|---|---|---|---|
| 1000 | | | | |
| 5000 | | | | |
| 10000 | | | | |

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
