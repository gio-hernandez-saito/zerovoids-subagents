# zerovoids-cosmos

> 흩어진 조각들을 우주로 만들다

개발 경험에서 얻은 파편화된 지식과 패턴을 체계화하는 프로젝트. **범용 방법론 toolkit**과 **자율 실행 에이전트(probes)**로 구성됩니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Architecture

### Two Pillars

```
zerovoids-cosmos
├── Toolkit (4계층)     ← 우주의 법칙. 범용 방법론 규칙
└── Probes             ← 탐사선. 실제 작동하는 에이전트
```

### Toolkit: 4계층 단방향 구조

```
Workflow → Agent → Command → Skill
   (L4)     (L3)     (L2)     (L1)
```

| Layer | Role | Can reference |
|-------|------|---------------|
| **Skill** | 원자적 규칙 (커밋 컨벤션, FSD 등) | 없음 (leaf) |
| **Command** | 사용자 트리거 워크플로우 | Skill |
| **Agent** | 자율 에이전트 정의 | Skill, Command |
| **Workflow** | 오케스트레이션 | Skill, Command, Agent |

같은 계층 간 참조는 금지됩니다. Toolkit은 빌드 시 `.claude/skills/`와 `.claude/agents/`로 변환되어 Claude Code에 주입됩니다.

### Probes: 실행 에이전트

4계층 바깥에서 **독립적으로 실행**되는 에이전트 프로그램입니다. Anthropic API를 직접 호출하고, GitHub Actions로 자동 스케줄링됩니다.

Probes에서 반복되는 패턴이 발견되면 Toolkit의 skill로 추출합니다 (premature abstraction 금지).

```
[진화 경로]
probe에서 패턴 발견 → skill로 추출 → probe가 skill 참조 (uses:)
```

---

## Structure

```
zerovoids-cosmos/
├── skills/                              # L1: 범용 규칙
│   ├── convention/commit-message/
│   └── architecture/feature-sliced-design/
│
├── commands/                            # L2: 범용 커맨드
│   └── convention/commit/
│
├── agents/                              # L3: 범용 에이전트 정의 (미래)
├── workflows/                           # L4: 범용 워크플로우 (미래)
│
├── probes/                              # 실행 에이전트 (4계층 밖)
│   └── idea-generator-critic/
│       ├── agent.md                     # 에이전트 정의 + 실행 흐름
│       ├── run.ts                       # Anthropic API 런타임
│       ├── 0-context.md                 # 사용자 페르소나
│       ├── 1-frontmatter-spec.md        # 출력 메타데이터 규격
│       ├── 2-output-template.md         # 마크다운 출력 템플릿
│       ├── 3-evaluation-criteria.md     # 7차원 평가 체계
│       ├── 4-refinement-protocol.md     # 자기 개선 프로토콜
│       └── 5-deployment.md             # CI/CD 설정
│
├── scripts/                             # Toolkit 빌드/검증
│   ├── build.cjs
│   ├── validate.cjs
│   └── bump.cjs
│
├── docs/design/                         # 설계 문서
├── .github/workflows/
│   ├── validate.yml                     # Toolkit PR 검증
│   └── weekly-idea.yml                  # Probe 주간 자동 실행
│
├── package.json
├── CONTRIBUTING.md
└── LICENSE
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm

### Setup

```bash
pnpm install
```

### Run Probe

```bash
# .env에 ANTHROPIC_API_KEY 설정 필요
cp .env.example .env

pnpm run probe:idea-generator-critic
pnpm run probe:idea-generator-critic --dry-run --verbose
pnpm run probe:idea-generator-critic --json
```

### Validate & Build Toolkit

```bash
node scripts/validate.cjs    # 레이어 규칙 + semver 검증
node scripts/build.cjs       # dist/ 생성
```

---

## Toolkit: Skill Versioning

개별 skill 버전은 frontmatter의 `version`으로 관리됩니다:

```bash
node scripts/bump.cjs skill/commit-message patch
node scripts/bump.cjs command/commit minor
```

## Toolkit: Frontmatter

```yaml
---
name: feature-sliced-design   # 필수, 디렉토리명과 일치
description: 한 줄 설명         # 권장
version: 0.0.1               # 필수, semver
layer: skill                 # 필수: skill|command|agent|workflow
uses:                        # 선택, 의존성
  - skill/commit-message@^0.0.1
---
```

---

## Design Principles

### 1. 명확성 > 영리함
각 skill과 probe는 즉시 이해 가능해야 합니다.

### 2. 전문성 > 범용성
하나를 잘하는 10개의 probe가 모든 것을 대충 하는 1개보다 낫습니다.

### 3. 추출은 반복 후에
Probe에서 패턴이 2회 이상 반복될 때 skill로 추출합니다. Premature abstraction 금지.

### 4. 조합 가능성
Skills는 atomic하고, commands가 조합하고, agents/workflows가 오케스트레이션합니다.

---

## License

[MIT](LICENSE)
