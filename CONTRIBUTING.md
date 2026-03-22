# Contributing

zerovoids-cosmos에 기여하기 위한 가이드입니다.

## Toolkit (4계층)

### 파일 생성/수정

레이어에 맞는 디렉토리에 `SKILL.md` 파일을 생성합니다. 디렉토리명은 frontmatter `name`과 일치해야 합니다.

| Layer    | 소스 위치                                | 예시                                                   |
|----------|--------------------------------------|------------------------------------------------------|
| Skill    | `skills/{mid...}/{name}/SKILL.md`    | `skills/architecture/feature-sliced-design/SKILL.md` |
| Command  | `commands/{mid...}/{name}/SKILL.md`  | `commands/convention/commit/SKILL.md`                |
| Agent    | `agents/{mid...}/{name}/SKILL.md`    | `agents/fe-reviewer/SKILL.md`                        |
| Workflow | `workflows/{mid...}/{name}/SKILL.md` | `workflows/release/deploy/SKILL.md`                  |

추가 참조 파일(REFERENCE.md, EXAMPLES.md 등)은 같은 디렉토리에 배치합니다.

### Version bump

```bash
node scripts/bump.cjs <layer>/<name> <patch|minor|major>
```

| 변경 종류               | bump  |
|---------------------|-------|
| 오타, 문구 다듬기          | patch |
| 규칙/기능 추가 (기존 호환)    | minor |
| 규칙 구조 변경 (기존 호환 깨짐) | major |

### 검증

```bash
node scripts/validate.cjs    # 레이어 규칙 + semver 검증
node scripts/build.cjs       # 빌드 테스트
```

### Layer 규칙

| Layer    | 참조 가능                 | 참조 불가                              |
|----------|-----------------------|------------------------------------|
| Skill    | 없음 (leaf)             | command, agent, workflow, 다른 skill |
| Command  | skill                 | agent, workflow, 다른 command        |
| Agent    | skill, command        | workflow, 다른 agent                 |
| Workflow | skill, command, agent | 다른 workflow                        |

### Build 변환

```
skills/{mid}/{name}/SKILL.md     →  dist/skills/skill-{mid}-{name}/SKILL.md
commands/{mid}/{name}/SKILL.md   →  dist/skills/command-{mid}-{name}/SKILL.md
agents/{mid}/{name}/SKILL.md     →  dist/agents/agent-{mid}-{name}.md
workflows/{mid}/{name}/SKILL.md  →  dist/agents/workflow-{mid}-{name}.md
```

## Probes (실행 에이전트)

### 새 probe 추가

`probes/{probe-name}/` 디렉토리를 생성하고 최소한 다음을 포함:

- `agent.md` — 에이전트 정의, 미션, 실행 흐름
- `run.ts` — 런타임 (Anthropic API 호출)
- 참조 문서 — 에이전트가 필요로 하는 규칙/컨텍스트

### package.json에 스크립트 추가

```json
{
  "scripts": {
    "probe:{name}": "tsx probes/{name}/run.ts"
  }
}
```

### Probe → Skill 추출 기준

- 2개 이상의 probe에서 동일한 패턴이 반복될 때
- 패턴을 일반화해도 각 probe에서의 의미가 유지될 때
- 추출 후 probe의 agent.md에 `uses:` 참조를 추가

## Frontmatter

```yaml
---
name: feature-sliced-design
description: 한 줄 설명
version: 0.0.1
layer: skill
uses:
  - skill/commit-message@^0.0.1
external:
  - type: library
    name: d3
    topic: scales
  - type: url
    href: https://example.com
    description: 참고 문서
---
```
