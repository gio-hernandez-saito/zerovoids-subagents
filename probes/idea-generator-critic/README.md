# Idea Generator & Critic Probe

> AI가 프로젝트 아이디어를 생성하고, 스스로 평가하며, 기준을 통과할 때까지 개선하는 자동화 Probe

---

## 📖 개요

이 Probe는 zerovoids-cosmos의 첫 번째 실전 Probe로, 다음을 수행합니다:

1. **생성**: 프로젝트 아이디어를 자동으로 생성
2. **평가**: 8가지 기준으로 품질 평가 (8각형 평가)
3. **개선**: 기준 미달 시 자체적으로 아이디어 개선 (최대 3회)
4. **출력**: 정형화된 Markdown 문서로 저장

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Anthropic API Key

### Installation

```bash
# 프로젝트 루트에서
pnpm install

# .env 설정
cp .env.example .env
# ANTHROPIC_API_KEY 입력
```

### Run

```bash
# 기본 실행
pnpm run probe:idea-generator-critic

# 옵션
pnpm run probe:idea-generator-critic --output ./my-ideas/         # 출력 경로 지정
pnpm run probe:idea-generator-critic --ideas-dir ./ideas/         # 기존 아이디어 디렉토리 지정
pnpm run probe:idea-generator-critic --dry-run                    # 저장 없이 테스트
pnpm run probe:idea-generator-critic --verbose                    # 상세 로그
pnpm run probe:idea-generator-critic --json                       # JSON 출력 (CI용)
```

---

## 📂 문서 구조

| 파일 | 목적 | 상태 |
|------|------|------|
| `0-context.md` | 유저 페르소나, 스킬, 관심사 정의 | ✅ 완료 |
| `1-frontmatter-spec.md` | YAML 메타데이터 스펙 | ✅ 완료 |
| `2-output-template.md` | 결과물 마크다운 템플릿 | ✅ 완료 |
| `3-evaluation-criteria.md` | 8개 평가 기준 상세 | ✅ 완료 |
| `4-refinement-protocol.md` | 자체 개선 프로토콜 | ✅ 완료 |
| `5-deployment.md` | GitHub Actions 자동화 | ✅ 완료 |
| `agent.md` | 최종 Probe 정의 | ✅ 완료 |
| `run.ts` | 실행 스크립트 | ✅ 완료 |

---

## 🔄 워크플로우

```
┌─────────────────────────────────────────────────────────┐
│  1. Context Loading                                      │
│  - 사용자 관심사, 기술 스택, 프로젝트 맥락 로드           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. Idea Generation                                      │
│  - Frontmatter spec에 따라 아이디어 생성                 │
│  - Output template 형식으로 문서 작성                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. Evaluation (8각형 평가)                              │
│  - 독창성, 실현가능성, 시장필요성, 수익화가능성          │
│  - 기술적흥미, 학습가치, 오픈소스가치, 차별성            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Score meets criteria?  │
        └────┬──────────────┬────┘
          NO │              │ YES
             ▼              ▼
    ┌──────────┐    ┌──────────────────┐
    │ Refine   │    │ 4. Output        │
    │ (최대 3회)│    │ - MD 파일 저장    │
    └────┬─────┘    │ - Stats 업데이트  │
         │          └──────────────────┘
         │
         └──► 반복 후 실패 시 Archive

```

---

## 📊 평가 기준 (8각형)

| Dimension | Weight | Description |
|-----------|--------|-------------|
| originality | 12% | 독창성 - 얼마나 새로운가? |
| feasibility | 18% | 실현가능성 - 2-4주 내 가능? |
| market_need | 12% | 시장 필요성 - 실제 문제 해결? |
| monetization_potential | 8% | 수익화 가능성 |
| tech_interest | 12% | 기술적 흥미 - 만들기 재밌나? |
| learning_value | 12% | 학습 가치 - 얼마나 성장할 수 있나? |
| open_source_value | 8% | 오픈소스 가치 |
| distinctness | 18% | 차별성 - 기존 아이디어와 얼마나 다른가? |

### Pass 조건

- `total >= 7.0` OR
- `(originality >= 8 AND tech_interest >= 8)` OR
- `(learning_value >= 9 AND feasibility >= 7)` OR
- `(feasibility >= 8 AND market_need >= 8) AND (total_score >= 6.5)`

---

## 📁 출력 예시

### 파일 구조

```
output/
└── 0001-metroidvania-code-explorer.md
```

### 파일 내용

```markdown
---
id: idea-0001
title: "Metroidvania Code Explorer"
generated: 2026-01-15T09:00:00+09:00
category: visualization
difficulty: advanced
tags: [threejs, metroidvania, code-visualization]

evaluation:
  originality: 10
  feasibility: 6
  market_need: 5
  monetization_potential: 3
  tech_interest: 10
  learning_value: 9
  open_source_value: 7
  distinctness: 10
  total: 7.5
  iterations: 1
  status: pass

tech_stack:
  - TypeScript
  - Three.js
  - React

estimated_time: 3-4 weeks
---

# Metroidvania Code Explorer

> Navigate your codebase like exploring a Metroidvania game world

## 🎯 Problem
...
```

---

## 🛠️ Development

### 파일 수정 시

| 변경 대상 | 파일 |
|-----------|------|
| 평가 기준 조정 | `3-evaluation-criteria.md` |
| 출력 형식 변경 | `2-output-template.md` |
| 관심사/스킬 업데이트 | `0-context.md` |
| 개선 전략 추가 | `4-refinement-protocol.md` |
| 실행 로직 변경 | `run.ts` |

### 테스트

```bash
# Dry run으로 테스트
pnpm run probe:idea-generator-critic --dry-run --verbose

# JSON 출력 확인
pnpm run probe:idea-generator-critic --json | jq .
```

---

## 🚀 다음 단계

- [x] 폴더 구조 생성
- [x] README 작성
- [x] `0-context.md` 작성
- [x] `1-frontmatter-spec.md` 작성
- [x] `2-output-template.md` 작성
- [x] `3-evaluation-criteria.md` 작성
- [x] `4-refinement-protocol.md` 작성
- [x] `5-deployment.md` 작성
- [x] `agent.md` 통합 작성
- [x] `run.ts` 실행 스크립트 작성
- [ ] 로컬 테스트
- [ ] GitHub Actions 배포
- [ ] zerovoids-idea-bank 레포 생성

---

**Last Updated**: 2026-03-23
