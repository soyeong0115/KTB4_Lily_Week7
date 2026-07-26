# React Migration 작업 로그

`docs/react-migration-design.md` 5-1 기록 방식에 표에다가, **왜 그렇게 판단했는지 + 그때그때 내 생각**을 같이 남깁니다. 나중에 전환기 쓸 때 표만 보면 "뭘 했는지"는 알아도 "왜 그렇게 했는지"는 기억 안 나서, 이유/생각을 따로 적어두는 게 근거 자료로 더 쓸모 있을 것 같아서요.

---

## 0단계 — Vite + React 프로젝트 세팅

| 항목 | 내용 |
|---|---|
| 작업 | Vite + React 스캐폴딩, 설계 문서 폴더 구조 생성, `App.jsx` 라우팅 연결 |
| AI 제안 요약 | 폴더 구조는 stub 파일로만 생성(로직 없음), 라우팅은 설계 문서 표 그대로 연결 |
| 검토 포인트 | `npm run dev`/`npm run build`로 정상 동작 확인 |
| 채택/수정 여부 | 그대로 채택 |
| 소요 시간 | - |

**왜 이렇게 했는지 / 내 생각**
- 

---

## 1단계 — 공통 인프라 (api/client.js, AuthContext, useModal)

| 항목 | 내용 |
|---|---|
| 작업 | `api/client.js`(request 함수 포팅), `AuthContext`/`useAuth`(accessToken state, login/logout), `ModalContext`/`useModal`/`Modal`(Promise 기반 confirm/alert, 로그인 필요 모달) 구현, `App.jsx`에 두 Provider 연결 |
| AI 제안 요약 | 설계 문서 2-5에 `useModal` 관련 state/함수/의존관계 초안 제시 후 검토받음. 구현은 "퀘스트" 방식 — 작은 과제로 쪼개서 순서대로 제시하고, 코드는 대부분 직접 작성. `api/client.js`는 리액트 문법이 필요 없는 순수 포팅이라 그대로 옮김. `Modal.jsx`의 JSX 마크업(기존 vanilla HTML 이식 부분)만 AI가 작성 |
| 검토 포인트 | 퀘스트마다 직접 작성한 코드를 AI가 리뷰 — `useState`/`useRef` 오용, Hooks 규칙 위반(`useNavigate`를 중첩 함수 안에서 호출), `setState`에 함수 직접 대입, Promise `resolve` 관련 실수 등 여러 차례 지적받고 수정. `npm run build`로 최종 빌드 확인 |
| 채택/수정 여부 | 설계 방향은 유지, 구현 코드는 직접 작성 — AI 제안을 그대로 받은 게 아니라 퀘스트마다 직접 코드를 치고, 버그를 리뷰받아 수정하며 완성 |
| 소요 시간 | |

**왜 이렇게 했는지 / 내 생각**
- 

---

<!-- 다음 단계부터는 아래 템플릿을 복사해서 이어붙이기 -->

## N단계 — 작업명

| 항목 | 내용 |
|---|---|
| 작업 | |
| AI 제안 요약 | |
| 검토 포인트 | |
| 채택/수정 여부 | |
| 소요 시간 | |

**왜 이렇게 했는지 / 내 생각**
-
