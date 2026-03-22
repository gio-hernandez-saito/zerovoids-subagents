# OMC(oh-my-claudecode) 통합 분석

zerovoids-cosmos와 OMC의 관계를 정리하고, Phase 2-3에서 "직접 만들 것"과 "OMC 것을 쓸 것"을 판단하기 위한 문서.

---

## 1. 두 시스템의 본질적 차이

| | **zerovoids-cosmos** | **OMC** |
|---|---|---|
| **정체성** | 방법론 규칙 패키지 (**what to do**) | 실행 엔진 (**how to do**) |
| **배포** | npm 패키지 → `.claude/skills/` 심링크 | Claude Code 플러그인 (마켓플레이스) |
| **런타임** | 정적 — 파일을 놓으면 Claude가 읽음 | 동적 — hooks, MCP 서버, 상태 관리 |
| **자동화** | 없음 (사람이 skill을 트리거) | hooks로 키워드 감지 → skill 자동 주입 |
| **범위** | 프로젝트별 도메인 규칙 코드화 | 에이전트 오케스트레이션 + 실행 자동화 |

**결론: 경쟁이 아니라 보완 관계.**

- zerovoids-cosmos = "우리 팀은 FSD 구조를 따르고, 커밋은 Conventional Commits로 쓴다"
- OMC = "그 규칙을 지키면서 autopilot/ralph/ultrawork로 실행한다"

---

## 2. 공통점

- Markdown + YAML frontmatter 기반 skill/agent 정의
- 계층적 구조 (skill → command → agent → workflow)
- 재사용 가능한 원자적 단위로 지시를 분리
- Claude Code 위에서 동작

---

## 3. Phase 2-3 구성요소별 OMC 중복 분석

### 3.1 OMC와 겹치는 영역 (직접 만들지 않아도 됨)

| zerovoids-cosmos 계획 | OMC 대응 기능 | 겹침 정도 | 판단 |
|---|---|---|---|
| checkpoint-resume skill | `.omc/state/` + PreCompact hook | ~90% | **OMC 사용** |
| loop-detection skill | cycle 감지 (iteration vs infinite loop 구분) | ~90% | **OMC 사용** |
| error-fallback skill | PostToolUseFailure hook + escalate | ~85% | **OMC 사용** |
| token-logger skill | token tracking + context guard | ~80% | **OMC 사용** |
| threshold-sleep skill | context guard + session persistence | ~80% | **OMC 사용** |
| work-logger skill | work-logger + session state | ~70% | **OMC 사용** |
| autonomous-executor agent | ralph (verify/fix 루프), autopilot (5-phase) | ~60% | **부분 사용** (아래 참고) |

> **autonomous-executor가 "부분 사용"인 이유:**
> OMC의 ralph/autopilot은 범용 실행 엔진이다. zerovoids-cosmos의 autonomous-executor는 **트리 순회(nav) + FSD 규칙 + Instruction.md 파싱**이 결합된 도메인 특화 에이전트이므로, 실행 인프라는 OMC에 맡기되 **판단 로직(next action, priority)은 zerovoids-cosmos가 정의**해야 한다.

### 3.2 zerovoids-cosmos 고유 가치 (직접 만들어야 함)

| 구성요소 | OMC에 없는 이유 | zerovoids-cosmos에서의 역할 |
|---|---|---|
| **Instruction.md 스키마 + 파싱** | OMC는 도메인 지식 주입 규격이 없음 | 프로젝트별 목표/제약/우선순위를 구조화 |
| **PIPELINE.md 자동 생성** | OMC에는 작업 트리 자동 분해 개념 없음 | Instruction.md → 실행 가능한 트리로 변환 |
| **페르소나 기반 weight function** | OMC는 모든 작업을 동일 가중치로 처리 | 같은 트리라도 페르소나에 따라 행동이 달라짐 |
| **dependency-graph + impact propagation** | OMC는 독립 태스크 병렬 실행만 지원 | cross-branch 의존성 추적, 수정 영향 전파 |
| **트리 순회 엔진 (nav)** | OMC에는 구조적 작업 순회 개념 없음 | DFS + Priority Queue + suspend/resume |

---

## 4. 통합 전략

### 4.1 현재 (이미 작동하는 것)

zerovoids-cosmos를 `npm install`하면 `.claude/skills/`에 심링크가 생긴다. OMC의 executor 에이전트가 코드를 작성할 때, 이 skill 파일들이 컨텍스트에 포함되어 **FSD 규칙을 준수하면서 실행**한다. 별도 설정 없이 작동.

### 4.2 단기 — zerovoids-cosmos command를 OMC skill로 등록

zerovoids-cosmos의 command(예: commit)를 OMC의 `/skill add`로 등록하면, OMC hook 시스템이 키워드 감지 → 자동 활성화 가능.

### 4.3 중기 — Phase 2 인프라를 OMC에 위임

Phase 2에서 계획했던 자동화 인프라(token-logger, loop-detection, checkpoint-resume 등)를 직접 만들지 않고, zerovoids-cosmos의 autonomous-executor agent가 OMC의 ralph/autopilot **위에서** 동작하는 구조:

```
zerovoids-cosmos autonomous-executor (판단: what to do next)
    ↓ 위임
OMC ralph/autopilot (실행: how to do it)
    ↓ 참조
zerovoids-cosmos skills (규칙: FSD, commit convention 등)
```

### 4.4 장기 — Phase 3 고유 가치에 집중

zerovoids-cosmos가 만들어야 할 것:
1. **Instruction.md 스키마** — 도메인 지식 주입 표준
2. **PIPELINE.md 자동 생성** — 스키마 → 실행 트리 변환
3. **weight function** — 페르소나 기반 우선순위 결정
4. **dependency-graph** — cross-branch 영향 분석
5. **nav 엔진 고도화** — graph 기반 순회

zerovoids-cosmos가 OMC에 맡길 것:
1. checkpoint-resume (상태 저장/복원)
2. loop-detection (무한 루프 감지)
3. error-fallback (에러 복구)
4. token/resource 관리
5. 에이전트 실행 인프라 (ralph, autopilot)

---

## 5. OMC 주요 기능 참조

zerovoids-cosmos 개발 시 활용할 수 있는 OMC 기능 목록.

### 5.1 실행 모드

| 모드 | 트리거 | 용도 |
|---|---|---|
| `autopilot` | "autopilot" 키워드 | 5-phase 자율 실행 (분석→설계→구현→검증→완료) |
| `ralph` | "ralph" 키워드 | 완료까지 verify/fix 루프 반복 |
| `ultrawork` | "ulw" 키워드 | 독립 태스크 병렬 실행 |
| `ultraqa` | "ultraqa" 키워드 | QA 사이클 (테스트→검증→수정→반복) |
| `team` | `/team N:executor "task"` | N개 에이전트 협업 |

### 5.2 에이전트

| 에이전트 | 모델 | 용도 |
|---|---|---|
| executor | sonnet/opus | 코드 작성 실행 |
| architect | opus | 아키텍처 설계/리뷰 |
| code-reviewer | opus | 코드 리뷰 |
| verifier | sonnet | 결과 검증 |
| test-engineer | sonnet | 테스트 작성 |
| debugger | sonnet | 디버깅 |

### 5.3 상태 관리

- `.omc/state/` — 실행 모드별 상태 파일
- `.omc/notepad.md` — 세션 간 메모 (priority/working/manual)
- `.omc/project-memory.json` — 프로젝트 컨텍스트 자동 관리

### 5.4 MCP 도구

- LSP: hover, goto-definition, find-references, diagnostics
- AST: ast_grep_search, ast_grep_replace
- Data: python_repl

---

## 6. 미결정 사항

- [ ] zerovoids-cosmos agent가 OMC ralph 위에서 동작하는 구체적 인터페이스 설계
- [ ] zerovoids-cosmos command → OMC skill 자동 등록 메커니즘
- [ ] OMC 버전 의존성 관리 (OMC 업데이트 시 호환성)
- [ ] zerovoids-cosmos 없이 OMC만 쓰는 프로젝트에서의 graceful degradation
