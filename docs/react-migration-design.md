# BABBLE. React Migration 설계 문서

현재 바닐라 JS/HTML/CSS로 만들어진 게시판 서비스 "BABBLE."을 React로 마이그레이션하기 위한 설계 문서입니다.

## 1. 기존 프로젝트 분석

### 1-1. 페이지 구성 (8개)

| 페이지 | 파일 | 주요 기능 |
|---|---|---|
| 로그인 | index.html | 이메일/비밀번호 로그인, 유효성 검사 |
| 회원가입 | signup.html | 프로필 이미지 업로드, 이메일/비밀번호/닉네임 입력·검증 |
| 게시글 목록 | posts.html | 게시글 그리드 카드, 무한 스크롤, 사이드바(소개/로그인·회원가입/글쓰기/기여자 목록) |
| 게시글 상세 | post-detail.html | 본문, 좋아요, 조회수, 댓글 CRUD, 게시글 수정/삭제(작성자만) |
| 게시글 작성 | post-create.html | 제목/내용/이미지 입력 |
| 게시글 수정 | post-edit.html | 작성 폼과 동일 구조 + 기존 값 프리필 |
| 회원정보수정 | profile-edit.html | 프로필 사진, 닉네임 수정, 회원 탈퇴 |
| 비밀번호수정 | password-edit.html | 현재/새 비밀번호 변경 |

### 1-2. 공통 요소

- **헤더**: 로고(BABBLE.) + 로그인 상태에 따라 분기되는 영역
  - 비로그인: 로그인/회원가입 버튼 (게시글 목록 사이드바에 위치)
  - 로그인: 프로필 아바타 → 클릭 시 드롭다운(로그아웃/회원정보수정/비밀번호수정)
- **모달**: `alert()`/`confirm()`을 대체하는 커스텀 확인/알림 모달 (삭제 확인, 에러 안내 등 전역 공용)
- **인증**: JWT `accessToken`을 `localStorage`에 저장, `js/api.js`의 공통 `request()` 함수가 매 요청에 `Authorization` 헤더 자동 부착

### 1-3. 핵심 기능

- 회원가입/로그인/로그아웃, 회원정보·비밀번호 수정, 회원 탈퇴
- 게시글 CRUD (이미지 업로드 포함)
- 댓글 CRUD (내가 쓴 댓글에만 수정/삭제 버튼 노출, 서버가 내려주는 `myComment` 값으로 판단)
- 좋아요 토글
- 조회수 카운트 (작성자 본인 제외, 새로고침 시 중복 방지 — `PerformanceNavigationTiming`으로 새로고침 여부 판단)
- 무한 스크롤 (IntersectionObserver로 다음 페이지 로드)
- 폼 유효성 검사 및 인라인 에러 메시지

### 1-4. 현재 구조의 한계 (마이그레이션 동기)

- 페이지마다 `<script>`로 로드되는 JS 파일이 독립적으로 DOM을 직접 조작(`querySelector` + `innerHTML`) → 상태와 뷰가 강하게 결합되어 있어 재사용/테스트가 어려움
- "로그인 여부", "내 댓글인지" 같은 값을 페이지마다 각자 `localStorage`/API 응답에서 다시 계산 → 로직 중복
- 컴포넌트 단위 재사용이 불가능해서 카드/버튼/폼 필드 같은 반복 UI를 매번 문자열 템플릿으로 새로 씀

## 2. 예상 컴포넌트 구조

### 2-1. 컴포넌트 분리 기준

무작정 잘게 쪼개지 않고, 아래 4가지 기준에 해당할 때만 별도 컴포넌트로 분리합니다.

1. **목록/아이템 분리** — `.map()`으로 반복 렌더링되는 대상은 분리 (`PostList`/`PostCard`, `CommentList`/`CommentItem`)
2. **독립적인 상태·로직 보유** — 자체 입력 상태나 제출 로직이 있으면 분리 (`CommentForm`은 텍스트 입력 상태 + 제출 로직이 있어 단순 표시용인 `CommentList`와 분리)
3. **여러 페이지에서 재사용** — 2곳 이상에서 쓰이면 공용 컴포넌트로 (`Header`, `Modal`, `SidebarTag`, `PrimaryButton`)
4. **위 세 조건에 해당 안 되면 분리하지 않음** — 한 페이지에서만 쓰이고 표시 로직만 있는 경우 상위 컴포넌트에 인라인으로 유지 (예: 좋아요/조회수/댓글수 표시는 `PostDetailPage` 안에 그대로 둠)

### 2-2. 폴더 구조

```
src/
├── App.jsx                     # 라우터 진입점
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── PostsPage.jsx
│   ├── PostDetailPage.jsx
│   ├── PostCreatePage.jsx
│   ├── PostEditPage.jsx
│   ├── ProfileEditPage.jsx
│   └── PasswordEditPage.jsx
├── components/
│   ├── layout/
│   │   ├── Header.jsx           # 로고 + AuthMenu
│   │   └── AuthMenu.jsx         # 로그인 상태에 따라 AuthLinks | ProfileDropdown 분기
│   ├── post/
│   │   ├── PostList.jsx         # 무한 스크롤 컨테이너
│   │   ├── PostCard.jsx         # 목록 카드 1개
│   │   ├── PostForm.jsx         # 작성/수정 공용 폼
│   │   └── PostSidebar.jsx      # Info/Auth/Contributors/글쓰기 버튼
│   ├── comment/
│   │   ├── CommentForm.jsx
│   │   ├── CommentList.jsx
│   │   └── CommentItem.jsx      # myComment면 수정/삭제 버튼 노출
│   ├── common/
│   │   ├── Modal.jsx            # ConfirmModal / AlertModal 공용 베이스
│   │   ├── SidebarTag.jsx       # 색상 태그 칩
│   │   ├── PrimaryButton.jsx
│   │   └── FormField.jsx        # label + input + helperText 묶음
│   └── ProtectedRoute.jsx       # accessToken 없으면 로그인 페이지로 리다이렉트
├── hooks/
│   ├── useAuth.js               # AuthContext 소비용
│   ├── useModal.js              # 모달 열기/닫기 + Promise 기반 confirm/alert
│   └── useInfiniteScroll.js     # IntersectionObserver 래핑
├── contexts/
│   └── AuthContext.jsx          # accessToken, 로그인 여부, 로그아웃 함수 전역 제공
└── api/
    ├── client.js                # 기존 js/api.js(request 함수) 포팅
    ├── authApi.js
    ├── postApi.js
    ├── commentApi.js
    └── userApi.js
```

(`PostStats`처럼 한 페이지에서만 쓰이고 표시 전용인 요소는 위 분리 기준 4번에 따라 별도 파일로 빼지 않고 `PostDetailPage` 내부에 둡니다.)

### 2-3. 라우팅

| 경로 | 페이지 | 인증 필요 |
|---|---|---|
| `/` | `PostsPage` (게시글 목록) | X — 로그인 여부와 무관하게 진입 가능한 홈 화면 역할을 겸함 |
| `/login` | `LoginPage` | X |
| `/signup` | `SignupPage` | X |
| `/posts/:postId` | `PostDetailPage` | X (단, 좋아요·댓글 작성은 로그인 필요) |
| `/posts/new` | `PostCreatePage` | O |
| `/posts/:postId/edit` | `PostEditPage` | O (작성자만) |
| `/profile/edit` | `ProfileEditPage` | O |
| `/password/edit` | `PasswordEditPage` | O |

`PostsPage`는 이름은 "게시글 목록"이지만 실제로는 `/` 루트 경로에 매핑되어 로그인 여부와 상관없이 첫 진입 화면(홈) 역할도 겸합니다. 컴포넌트 이름을 `HomePage` 등으로 따로 바꾸지 않고, 라우팅 표로 역할을 명시하는 방식을 택했습니다.

### 2-4. 컴포넌트별 역할 요약

- **Header / AuthMenu**: 전역에서 로그인 상태만 구독하고, 실제 로그인/회원가입/프로필 링크는 `AuthMenu`가 조건부 렌더링
- **PostCard**: 목록 API 응답 하나(post)를 props로 받아 순수하게 렌더링만 담당 (색상 태그/그래픽 패턴은 postId 기반으로 컴포넌트 내부에서 결정)
- **PostForm**: 작성/수정 페이지가 동일한 필드 구성을 쓰므로 `mode="create" | "edit"` prop으로 하나의 컴포넌트를 공유
- **CommentItem**: `myComment`(서버 응답)를 기준으로 수정/삭제 버튼 노출 여부만 결정, 실제 삭제 확인은 `useModal` 훅 통해 처리
- **Modal**: `ConfirmModal`/`AlertModal`이 하나의 `Modal` 베이스 위에서 버튼 구성만 다르게 가져가는 구조. 현재 바닐라 JS의 Promise 기반 `showConfirmModal`/`showAlertModal`(`js/modal.js`)을 `useModal` 훅으로 그대로 승격
- **ProtectedRoute**: `js/profile-edit.js`에 있던 "로그인 안 되어 있으면 index로 리다이렉트" 로직을 라우트 가드로 승격

## 3. 상태와 데이터 흐름

### 3-1. 전역 상태 (Context)

- **AuthContext**: `accessToken`, `isLoggedIn`, `login()`, `logout()`
  - 지금은 각 JS 파일(`header-menu.js`, `post-detail.js`, `profile-edit.js` 등)이 각자 `localStorage.getItem('accessToken')`을 호출하는데, React에서는 Context 하나로 통합해서 헤더/보호 라우트/댓글 소유권 판단이 전부 같은 소스를 구독하도록 함
  - 로그인/로그아웃 시 Context 값만 바꾸면 헤더, 사이드바, 라우트 가드가 자동으로 리렌더링됨 (지금처럼 페이지 이동 후 헤더를 다시 그릴 필요 없음)

### 3-2. 서버 데이터 상태 (컴포넌트 로컬)

- 게시글 목록/상세/댓글 데이터는 전역으로 둘 필요가 없어서 각 페이지 컴포넌트의 `useState` + `useEffect`로 관리 (마운트 시 fetch)
- 목록 페이지의 무한 스크롤: `posts` 배열 state + `page`/`hasNext` state를 `useInfiniteScroll` 훅으로 캡슐화
- 게시글 상세: `post` 하나의 state 안에 좋아요 여부/댓글 배열까지 포함된 응답을 그대로 담아서 좋아요·댓글 액션 후 다시 fetch → setState (지금 구조와 동일하게 유지, "낙관적 업데이트"는 이후 개선 과제로 분리)

### 3-3. 폼 상태

- 로그인/회원가입/게시글 작성/비밀번호 수정 등 각 폼은 해당 페이지 컴포넌트 내부의 로컬 `useState`로 시작 (지금 수준의 유효성 검사 로직을 그대로 유지)
- 필드가 많고 검증 로직이 반복되는 회원가입/비밀번호 수정 폼은 이후 `react-hook-form` 도입을 검토 (1차 마이그레이션 범위에는 포함하지 않음)

### 3-4. 데이터 흐름 원칙

- 부모→자식은 props로 단방향 전달 (예: `PostsPage` → `PostList` → `PostCard`)
- 자식에서 발생한 이벤트(좋아요 클릭, 댓글 삭제 등)는 콜백 props로 부모에 위임하거나, 해당 도메인 훅(`usePostDetail` 등)에서 직접 API 호출 후 state 갱신
- 전역으로 꼭 필요한 값(로그인 여부)만 Context, 나머지는 최대한 지역 상태로 유지해서 불필요한 전역 리렌더링 방지

## 4. 단계별 마이그레이션 순서

| 단계 | 작업 | AI 활용 |
|---|---|---|
| 0 | 프로젝트 세팅: React 빌드 툴(Vite 등) 도입, `react-router-dom` 설치, 폴더 구조 생성, 기존 `style.css`를 그대로 가져와 전역 스타일로 유지 | 폴더/보일러플레이트 초안 생성 |
| 1 | 공통 인프라: `api/client.js`(기존 `js/api.js` 포팅), `AuthContext`, `useModal`(기존 `js/modal.js` 로직 승격) | 바닐라 JS → 훅/Context 패턴 변환 초안 |
| 2 | 공통 컴포넌트: `Header`, `AuthMenu`, `Modal`, `SidebarTag`, `PrimaryButton` — 기존 HTML 마크업/클래스명을 그대로 JSX로 이식 | 기존 HTML 템플릿 문자열 → JSX 변환 (반복 작업이라 자동화 효과 큼) |
| 3 | 인증 페이지: `LoginPage`, `SignupPage` (`ProtectedRoute` 포함) | 기존 유효성 검사 정규식/로직 그대로 포팅 |
| 4 | 게시글 목록: `PostsPage`, `PostList`, `PostCard`, `PostSidebar`, `useInfiniteScroll` | 카드 반복 렌더링 로직 변환, IntersectionObserver → 훅화 |
| 5 | 게시글 상세: `PostDetailPage`(좋아요/조회수 포함), `CommentForm/List/Item` | 조회수 중복 방지 로직(`PerformanceNavigationTiming`) 포팅, 댓글 소유권 분기 변환 |
| 6 | 게시글 작성/수정: 공용 `PostForm` (`mode` prop 분기) | 작성/수정 두 페이지 코드 diff 보고 공용 컴포넌트로 병합하는 초안 작성 |
| 7 | 회원정보/비밀번호 수정: `ProfileEditPage`, `PasswordEditPage`, 회원 탈퇴 플로우 | 폼 검증 로직 변환 |
| 8 | 마무리: 페이지 간 라우팅 전체 연결, 전체 QA, 불필요해진 바닐라 JS/HTML 파일 정리 | 회귀 테스트 케이스 초안 작성 |

### 참고

- 위 순서는 의존성이 적은 것부터(공통 인프라 → 인증 → 목록 → 상세 → 작성/수정 → 마이페이지) 진행해서, 각 단계마다 실제로 동작하는 화면을 눈으로 확인하며 넘어가는 것을 원칙으로 함
- 설계는 구현 과정에서 바뀔 수 있으며, 변경 시 사유는 회고 문서에 기록

## 5. AI 협업 프로세스 (Human-in-the-Loop)

이번 마이그레이션은 "AI가 코드를 생성했다"에서 끝나지 않고, 작업 단위(컴포넌트/기능)마다 아래 사이클을 반복하는 것을 원칙으로 합니다.

1. **AI 분석** — 기존 바닐라 JS 파일의 로직·DOM 구조를 AI에게 분석시켜 책임 범위를 파악
2. **AI 제안** — 컴포넌트 분리안, 상태 설계, 변환 코드 초안을 AI가 제시
3. **사람 검토** — 제안이 실제 요구사항과 맞는지, 과설계는 아닌지, 기존 동작과 달라진 부분은 없는지 확인
   - 예: 이 설계 문서를 쓰는 과정에서도 "컴포넌트 구조가 맞는지", "PostsPage라는 이름이 실제 역할(홈 겸용)과 맞는지"를 검토하며 여러 차례 수정함 — 이런 검토 자체가 human-in-the-loop 과정
4. **실행 및 테스트** — 검토를 통과한 코드를 실제로 적용하고 브라우저에서 동작 확인 (기존 기능과 동일하게 동작하는지 회귀 확인)
5. **수정 또는 채택** — 문제 있으면 AI에게 재요청하거나 직접 수정, 문제 없으면 그대로 채택하고 다음 작업으로 이동

### 5-1. 기록 방법

4장의 단계별 작업마다 아래 항목을 회고 문서에 남깁니다. 결과물(마이그레이션된 코드)뿐 아니라 "AI 제안을 어떻게 검증하며 썼는지"를 남기는 것이 목적입니다.

| 항목 | 내용 |
|---|---|
| 작업 | 어떤 컴포넌트/기능을 마이그레이션했는지 |
| AI 제안 요약 | AI가 처음 제시한 접근·코드의 핵심 |
| 검토 포인트 | 사람이 확인한 것 (기존 동작 일치 여부, 네이밍, 과설계 여부 등) |
| 채택/수정 여부 | 그대로 채택했는지, 어떤 부분을 왜 고쳤는지 |
| 소요 시간 | AI 활용 전후 체감 소요 시간 (정량적이지 않아도 무방, 대략적인 기록으로 충분) |
