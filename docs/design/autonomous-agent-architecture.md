# Autonomous Agent Architecture — Design Draft

사람의 인지적 작업 방식을 형식화하고, 도메인 무관한 자율 에이전트 행동 규칙으로 조합 가능하게 만든다.

## 1. 비전

```mermaid
graph TD
    subgraph "zerovoids-cosmos (도메인 무관)"
        S[Skills — 인지 행동 규칙]
        C[Commands — 사용자 트리거 행동]
        A[Agents — 자율 판단 에이전트]
        W[Workflows — 오케스트레이션]
        W --> A --> C --> S
    end

    subgraph "프로젝트 (도메인 특화)"
        I[Instruction.md — 도메인 지식]
        P[PIPELINE.md — 작업 트리/그래프]
        PC[Project Commands — 프로젝트별 command]
    end

    W -. "읽고 파싱" .-> I
    W -. "생성/갱신" .-> P
    PC -. "uses" .-> S
```

**핵심 분리**: 방법론(zerovoids-cosmos)과 도메인(프로젝트)은 완전히 분리된다. `npm install`로 방법론을 주입하고, `Instruction.md`로 도메인을 주입한다.

---

## 2. 인지 행동 (Cognitive Actions)

사람이 복잡한 프로젝트를 진행할 때 하는 "생각의 동작"을 열거한다.

### 2.1 Action 분류

```mermaid
graph TD
    subgraph "탐색 (Navigation)"
        NEXT[next — 다음 단계 진행]
        PREV[prev — 이전 단계 복귀 N단계]
        JUMP[jump — 특정 지점으로 즉시 이동]
        DD[drill-down — 추상 → 구체]
        DU[drill-up — 구체 → 추상]
    end

    subgraph "판단 (Decision)"
        EST[estimate — 작업량/복잡도 판단]
        PRI[prioritize — 우선순위 재조정]
        DEFER[defer — 의식적으로 미루기]
        ESC[escalate — 능력 밖 → 사람에게 질문]
    end

    subgraph "실행 (Execution)"
        EXEC[execute — 리프 노드 작업 실행]
        VERIFY[verify — 결과 검증]
        DECOMP[decompose — 큰 문제를 작은 문제로 분해]
        DEL[delegate — 하위 에이전트에 위임]
    end

    subgraph "전환 (Context Switch)"
        SUSP[suspend — 현재 컨텍스트 저장 + 다른 일]
        RES[resume — 저장된 컨텍스트로 복귀]
        BACK[backtrack — 잘못된 방향 인지 → 되돌아가서 다른 길]
    end
```

### 2.2 Action 상세

| Action | 설명 | 트리거 조건 | 관련 자료구조 |
|---|---|---|---|
| **next** | 자동 판단으로 다음 단계 진행 | 현재 노드 완료 또는 진입 시 | Stack (DFS) |
| **prev** | N단계 이전으로 되돌아감 | 사용자 명시 요청 | Stack |
| **jump** | 특정 노드로 즉시 이동, 현재 위치 저장 | 사용자 명시 또는 impact 감지 | Stack + Suspended |
| **drill-down** | 추상 노드 → 자식 노드로 진입 | 현재 노드에 미완료 자식 존재 | Tree |
| **drill-up** | 자식 전부 완료 → 부모로 복귀 | 형제 모두 `[x]` | Tree |
| **estimate** | 노드의 작업량/복잡도 판단 | 노드 최초 진입 시 | Priority Queue (weight 결정) |
| **prioritize** | 가중치 기반 순서 재조정 | estimate 후 또는 상황 변경 시 | Priority Queue |
| **defer** | "지금 안 해도 됨" — 의식적 미룸 | estimate 결과 낮은 우선순위 | Queue (후순위 삽입) |
| **escalate** | 능력 밖의 문제 → 사람에게 질문 | 반복 실패, 판단 불가 | — |
| **execute** | 리프 노드에서 실제 작업 수행 | 리프 도달 시 | — |
| **verify** | 작업 결과 검증 | execute 완료 후 | — |
| **decompose** | 큰 노드를 서브노드로 분해 | 노드가 너무 크다고 판단 시 | Tree (동적 자식 생성) |
| **delegate** | 하위 에이전트/command에 위임 | 독립적 서브태스크 식별 시 | — |
| **suspend** | 현재 컨텍스트 저장 + 다른 작업으로 전환 | jump, 블로커 발견 시 | Stack (LIFO) |
| **resume** | 저장된 컨텍스트로 복귀 | suspended 항목 존재 + 현재 작업 완료 | Stack (LIFO) |
| **backtrack** | 잘못된 경로 인지 → 되돌아가서 대안 선택 | verify 실패, 반복 실패 감지 | Stack + State rollback |

### 2.3 next 자동 판단 플로우

```mermaid
flowchart TD
    START[현재 노드] --> Q1{미완료 자식 존재?}
    Q1 -- Yes --> DD[drill-down]
    Q1 -- No --> Q2{현재 노드 완료?}
    Q2 -- No --> EXEC[execute]
    Q2 -- Yes --> Q3{미완료 형제 존재?}
    Q3 -- Yes --> PQ{Priority Queue로 선택}
    PQ --> SIBLING[형제 이동]
    Q3 -- No --> DU[drill-up]
    DU --> Q4{부모의 형제 중 미완료?}
    Q4 -- Yes --> PQ
    Q4 -- No --> Q5{Suspended 항목 존재?}
    Q5 -- Yes --> RES[resume — LIFO]
    Q5 -- No --> DONE[종료]
```

---

## 3. 자료구조 (Data Structures)

인지 행동이 작동하는 기반 구조. 각각이 skill로 규격화된다.

### 3.1 자료구조 맵

```mermaid
graph LR
    subgraph "선형 (Linear)"
        STACK[Stack — LIFO]
        QUEUE[Queue — FIFO]
        PQ[Priority Queue — 가중치 기반]
        RB[Ring Buffer — 제한된 작업 기억]
    end

    subgraph "계층 (Hierarchical)"
        TREE[Tree — 작업 분해 골격]
    end

    subgraph "관계 (Relational)"
        DAG[DAG — 비순환 의존성]
        GRAPH[Graph — 순환 허용 의존성]
    end

    subgraph "상태 (State)"
        SM[State Machine — 모드 전환]
    end
```

### 3.2 자료구조 → 인지 행동 매핑

| 자료구조 | 매핑되는 인지 행동 | 역할 |
|---|---|---|
| **Stack** | drill-down/up, suspend/resume, backtrack | 깊이 탐색, 컨텍스트 전환, 되돌리기 |
| **Queue** | 순차 실행, defer | 선형 파이프라인, 미룬 작업 후순위 처리 |
| **Priority Queue** | prioritize, next (형제 선택) | 가중치 기반 "다음에 뭐 할지" 결정 |
| **Ring Buffer** | 최근 컨텍스트 유지 | 토큰 제한 환경에서 작업 기억 관리 |
| **Tree** | decompose, progress tracking | 작업 분해의 골격, `[x]`/`[ ]` 진행 추적 |
| **DAG** | dependency resolution | 의존성 있는 작업의 실행 순서 결정 (topological sort) |
| **Graph** | impact propagation, cycle detection | cross-branch 영향 분석, 순환 감지 |
| **State Machine** | 에이전트 모드 전환 | coding → reviewing → debugging → testing |

---

## 4. 그래프 이론 & 순환 처리

### 4.1 Tree → Graph 진화

```mermaid
graph TD
    subgraph "Phase 1-2: Tree"
        T_A[Stage A] --> T_B[Page B]
        T_A --> T_C[Page C]
        T_B --> T_D[Leaf D]
        T_B --> T_E[Leaf E]
        T_C --> T_F[Leaf F]
    end
```

```mermaid
graph TD
    subgraph "Phase 3: Graph"
        G_A[Stage A] --> G_B[Page B]
        G_A --> G_C[Page C]
        G_B --> G_D[Leaf D]
        G_B --> G_E[Leaf E]
        G_C --> G_F[Leaf F]
        G_D -. "cross-branch 의존" .-> G_F
        G_E -. "영향" .-> G_F
    end
```

### 4.2 Cycle 처리 전략

사람의 사고에서 cycle은 존재한다. "수정 → 테스트 → 실패 → 수정"이 cycle이다.

```mermaid
flowchart TD
    CYCLE[반복 감지] --> Q{매 cycle마다 상태가 변하는가?}
    Q -- Yes --> ITER[의도된 반복 — Iteration]
    ITER --> MAX{max iteration 도달?}
    MAX -- No --> CONTINUE[계속]
    MAX -- Yes --> ESC[escalate — 사람에게 판단 요청]
    Q -- No --> LOOP[무한 루프 — Infinite Loop]
    LOOP --> BREAK[break + backtrack]
    BREAK --> ALT[대안 경로 탐색]
```

| 유형 | 판별 기준 | 처리 |
|---|---|---|
| **Iteration** (의도된 반복) | 매 cycle마다 상태(코드, 파일)가 변함 | 허용. max iteration 설정 |
| **Infinite Loop** (무한 루프) | 상태가 변하지 않는데 반복 | break → backtrack → 대안 경로 |
| **Oscillation** (진동) | A → B → A → B 반복 | N회 감지 시 escalate |

### 4.3 Impact Propagation

수정 발생 시 영향받는 노드를 최우선 처리한다.

```mermaid
flowchart LR
    MOD[노드 X 수정] --> FIND[directed edge 따라 영향 노드 탐색]
    FIND --> INJ[영향받는 노드를 Priority Queue 최상위에 삽입]
    INJ --> VERIFY_ALL[각 영향 노드에 verify 실행]
    VERIFY_ALL --> Q{verify 통과?}
    Q -- Yes --> CONTINUE[원래 흐름 복귀]
    Q -- No --> FIX[해당 노드 execute — 수정]
    FIX --> FIND
```

---

## 5. 자동화 인프라 (Automation Infrastructure)

100% 자율 실행을 위한 규칙들.

### 5.1 인프라 레이어

```mermaid
graph TD
    subgraph "모니터링 (Monitoring)"
        TL[token-logger — 토큰 사용량 기록]
        WL[work-logger — 작업 내역 로깅]
    end

    subgraph "내결함성 (Fault Tolerance)"
        EF[error-fallback — 실패 시 대안 경로]
        LD[loop-detection — 무한 루프 감지 + break]
        BT[backtrack — 잘못된 경로 되돌리기]
    end

    subgraph "자원 관리 (Resource Management)"
        TS[threshold-sleep — 토큰 한도 → sleep → 재시도]
        CR[checkpoint-resume — 상태 직렬화 → 중단/재개]
        RB2[ring-buffer — 컨텍스트 윈도우 관리]
    end

    EF --> BT
    LD --> BT
    TS --> CR
```

### 5.2 자동화 흐름

```mermaid
flowchart TD
    START[작업 시작] --> EXEC[execute]
    EXEC --> LOG[work-logger + token-logger]
    LOG --> Q1{에러 발생?}
    Q1 -- Yes --> EF[error-fallback]
    EF --> RETRY{재시도 가능?}
    RETRY -- Yes --> EXEC
    RETRY -- No --> BT[backtrack → 대안 경로]
    BT --> EXEC
    Q1 -- No --> Q2{토큰 threshold 도달?}
    Q2 -- Yes --> CP[checkpoint 저장]
    CP --> SLEEP[sleep]
    SLEEP --> RESUME[checkpoint에서 resume]
    RESUME --> EXEC
    Q2 -- No --> Q3{루프 감지?}
    Q3 -- Yes --> BREAK[break + escalate]
    Q3 -- No --> NEXT[next action 판단]
    NEXT --> EXEC
```

---

## 6. 페르소나 & 가중치 (Persona & Weighting)

### 6.1 페르소나 구조

개발자 페르소나는 다각적(multi-dimensional) 프로파일로 정의된다. 이 프로파일이 Priority Queue의 비교 함수를 결정한다.

```mermaid
graph TD
    subgraph "Persona Definition"
        DIM[주안점 Dimensions]
        BEH[행동 성향 Behavioral Traits]
    end

    DIM --> W[Weight Function 생성]
    BEH --> W
    W --> PQ[Priority Queue 비교 함수]
    PQ --> NEXT[next action 결정]
```

### 6.2 주안점 (Dimensions)

작업의 가치를 평가하는 축. 0.0 ~ 1.0 스케일.

| Dimension | 설명 | 높으면 | 낮으면 |
|---|---|---|---|
| `code-quality` | 코드 품질, 가독성, 패턴 준수 | verify 빈도 증가 | 빠른 통과 |
| `speed` | 작업 완료 속도 | defer/skip 적극 활용 | 꼼꼼한 진행 |
| `error-detection` | 에러 감지/방지 | verify + test 가중치 상승 | 낙관적 진행 |
| `test-coverage` | 테스트 커버리지 | 테스트 노드 weight 상승 | 구현 우선 |
| `maintainability` | 유지보수성, 문서화 | 리팩터링/문서 노드 weight 상승 | 기능 우선 |
| `security` | 보안 관점 | 보안 검증 노드 자동 삽입 | 생략 |

### 6.3 행동 성향 (Behavioral Traits)

action 선택 확률에 영향을 주는 성향.

| Trait | 설명 | 영향 |
|---|---|---|
| `risk-tolerance` | 위험 감수 정도 | low → verify 자주, high → skip 허용 |
| `depth-preference` | 깊이 vs 넓이 | deep → drill-down 선호, broad → 형제 우선 |
| `context-switch-cost` | 전환 비용 인식 | high → suspend 최소화, low → jump 자유 |
| `iteration-patience` | 반복 인내도 | high → max iteration 높음, low → 빠른 escalate |

### 6.4 Weight Function

```
weight(node) = Σ(dimension_i × relevance_i(node)) + trait_modifier

예시 — "품질 우선" 페르소나:
  code-quality: 0.9, speed: 0.3, error-detection: 0.8

  verify 노드:  0.9 × 0.8 + 0.3 × 0.1 + 0.8 × 0.9 = 1.47
  implement 노드: 0.9 × 0.5 + 0.3 × 0.9 + 0.8 × 0.3 = 0.96

  → verify가 implement보다 높은 priority
```

---

## 7. Skill 구조 제안

```mermaid
graph TD
    subgraph "skills/"
        subgraph "navigation/"
            PM[progress-marker]
            TT[tree-traversal]
            CS[context-switch]
            DG[dependency-graph — Phase 3]
        end
        subgraph "data-structure/"
            DS_PQ[priority-queue]
            DS_SM[state-machine]
            DS_RB[ring-buffer]
        end
        subgraph "automation/"
            TL[token-logger]
            WL[work-logger]
            EF[error-fallback]
            LD[loop-detection]
            TS[threshold-sleep]
            CP[checkpoint-resume]
        end
        subgraph "persona/"
            PD[persona-definition]
            WF[weight-function]
            EV[evaluation-dimensions]
        end
        subgraph "architecture/"
            FSD[feature-sliced-design ✅]
        end
        subgraph "convention/"
            CM[commit-message ✅]
        end
    end

    subgraph "commands/"
        NAV[nav]
        PIPE[pipeline/run]
        IMP[impact — Phase 3]
    end

    subgraph "agents/"
        AA[autonomous-executor — Phase 3]
    end

    subgraph "workflows/"
        AW[autonomous-pipeline — Phase 3]
    end

    NAV --> PM & TT & CS
    PIPE --> PM & TL & WL
    IMP --> DG & PM
    AA --> NAV & PIPE & EF & LD & TS & CP
    AW --> AA & PD & WF
```

---

## 8. 구현 로드맵

```mermaid
gantt
    title Zerovoids-cosmos Roadmap
    dateFormat YYYY-MM
    axisFormat %Y-%m

    section Phase 1 — 기반
    nav command 이관                    :p1a, 2026-03, 1w
    pipeline/run command 이관           :p1b, after p1a, 1w
    progress-marker skill 분리          :p1c, after p1b, 1w
    tree-traversal skill 분리           :p1d, after p1c, 1w
    context-switch skill 분리           :p1e, after p1d, 1w

    section Phase 1.5 — Skill 세분화
    command 내 반복 패턴 → skill 추출     :p15a, after p1e, 2w

    section Phase 2 — 자동화 인프라
    token-logger skill                  :p2a, after p15a, 1w
    work-logger skill                   :p2b, after p2a, 1w
    error-fallback skill                :p2c, after p2b, 1w
    loop-detection skill                :p2d, after p2c, 1w
    checkpoint-resume skill             :p2e, after p2d, 1w
    threshold-sleep skill               :p2f, after p2e, 1w
    다른 프로젝트 적용 + 검증             :p2g, after p2f, 2w

    section Phase 3 — Autonomous
    persona-definition skill            :p3a, after p2g, 1w
    weight-function skill               :p3b, after p3a, 1w
    dependency-graph skill              :p3c, after p3b, 2w
    impact command                      :p3d, after p3c, 1w
    autonomous-executor agent           :p3e, after p3d, 2w
    autonomous-pipeline workflow        :p3f, after p3e, 2w
    Instruction.md 스키마 확정           :p3g, after p3f, 1w
```

---

## 9. 학술적 배경

이 설계가 참조하는 기존 개념들.

| 개념 | 분야 | 이 프로젝트에서의 위치 |
|---|---|---|
| HTN (Hierarchical Task Networks) | AI Planning | decompose + tree-traversal |
| BDI (Belief-Desire-Intention) | Multi-Agent Systems | persona + weight-function |
| MCDM (Multi-Criteria Decision Making) | Operations Research | evaluation-dimensions + weight-function |
| Topological Sort | Graph Theory | dependency-graph (DAG 실행 순서) |
| Eigenvector Centrality | Network Science | dependency-graph (영향력 큰 노드 식별) |
| Iterative Deepening | AI Search | loop-detection + backtrack |
| Checkpoint-Restart | Distributed Systems | checkpoint-resume + threshold-sleep |

---

## 10. 미결정 사항

- [ ] Persona dimension 목록 확정 — 현재는 예시 수준
- [ ] Weight function 수식 확정 — 선형 조합 vs 비선형
- [ ] Ring buffer 크기 — 토큰 한도 기반 동적 조절?
- [ ] Iteration max count — 고정값 vs persona의 iteration-patience 기반
- [ ] Instruction.md 스키마 — 도메인 지식 주입 포맷
- [ ] State machine 상태 목록 — coding, reviewing, debugging, testing 외 추가?
- [ ] Impact propagation 깊이 — 몇 hop까지 추적할 것인가
- [ ] Graph에서 edge weight — 의존성 강도를 어떻게 정량화하는가
