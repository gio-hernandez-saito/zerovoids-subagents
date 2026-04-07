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

> ⚠️ **0.0.x 단계에서 주의**: pre-1.0.0 semver에서 `^0.0.2`는 사실상 `>=0.0.2 <0.0.3` (즉 0.0.2 고정)을 의미합니다. 0.0.x 의존을 추가한 뒤 다운그레이드(0.0.2 → 0.0.1)하면 의존이 깨지므로 `validate.cjs`가 reject합니다.

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

> 표준 Claude Code Skill에는 inter-skill dependency 개념이 없습니다. `uses:` 필드는 cosmos 빌드 시스템(`scripts/validate.cjs`)에서만 의미를 가지며, `dist/`로 빌드된 결과물에서는 단순 메타데이터로만 남습니다.

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

cosmos는 [Claude Code Skills 표준](https://code.claude.com/docs/en/skills)의 **superset**입니다. 표준 frontmatter 필드를 모두 그대로 받아 빌드 시 `dist/`로 통과시키고, 빌드 시스템 운영을 위해 4개 필드를 추가합니다.

### 전체 예시

```yaml
---
# === 표준 Claude Code Skill 필드 ===
name: feature-sliced-design                       # 필수, 디렉토리명과 일치 (lowercase + hyphens, ≤64자)
description: This skill should be used when ...   # 권장 (third-person, ≤250자)
disable-model-invocation: true                    # 선택, side-effect 있는 task에 권장
user-invocable: false                             # 선택, reference-only 스킬에 권장
allowed-tools: Read Grep Glob                     # 선택, 권한 제한
paths:                                            # 선택, 자동 활성화 path 패턴
  - "src/**/*.ts"
argument-hint: "[component] [target]"             # 선택, autocomplete 힌트

# === cosmos 확장 필드 ===
version: 0.0.1               # 필수, semver (npm 패키지 버전과 별개)
layer: skill                 # 필수: skill|command|agent|workflow
uses:                        # 선택, 의존성 (cosmos validate.cjs에서만 강제)
  - skill/commit-message@^0.0.1
external:                    # 선택, 외부 참조 메타데이터
  - type: library
    name: d3
    topic: scales
  - type: url
    href: https://example.com
    description: 참고 문서
---
```

### 표준 필드

| 필드                         | 필수    | 설명                                                                                          |
|----------------------------|-------|---------------------------------------------------------------------------------------------|
| `name`                     | No    | 표시명. 생략 시 디렉토리명 사용. lowercase + hyphens, ≤64자.                                              |
| `description`              | 권장    | 스킬이 무엇을 하고 언제 쓰는지. third-person 형식, 사용자가 칠 정확한 트리거 phrase를 따옴표로 인용. ≤250자. front-load 핵심 use case. |
| `disable-model-invocation` | No    | `true`로 설정하면 Claude가 자동 호출하지 못함. side-effect 있는 task(`commit`, `deploy`, `mock-interview` 등)에 권장. |
| `user-invocable`           | No    | `false`로 설정하면 `/` 메뉴에 노출되지 않음. reference-only 스킬(rubrics, 규칙 모음)에 권장.                       |
| `allowed-tools`            | No    | 활성화 시 자동 허용할 도구 목록. space-separated 또는 YAML 리스트.                                            |
| `paths`                    | No    | 이 패턴에 매칭되는 파일 작업 시에만 자동 활성화. comma-separated 또는 YAML 리스트.                                   |
| `argument-hint`            | No    | autocomplete 힌트. 예: `[issue-number]`.                                                       |
| `model`, `effort`, `context`, `agent`, `hooks`, `shell` | No | 고급 설정. 자세한 내용은 [출처](#standards-compliance) 참조. |

### cosmos 확장 필드

| 필드         | 필수 | 설명                                                                  |
|------------|----|---------------------------------------------------------------------|
| `version`  | 필수 | semver. 자산 단위 변경 이력. **npm 패키지 버전과 무관.** `bump.cjs`로 갱신.            |
| `layer`    | 필수 | `skill` \| `command` \| `agent` \| `workflow`. 디렉토리 구조와 일치해야 함.     |
| `uses`     | 선택 | 다른 자산 의존성. `<layer>/<name>@<semver-range>` 형식. validate.cjs에서만 강제.  |
| `external` | 선택 | 외부 라이브러리/URL 메타데이터. 빌드 결과물에 통과되지만 Claude Code는 무시.                  |

### description 작성 가이드

표준 Claude Code Skill의 권장 형식을 따릅니다:

1. **third-person 형식** — "This skill should be used when..." 패턴 (한국어는 "...할 때 이 스킬을 사용합니다" 등)
2. **사용자가 칠 정확한 트리거 phrase를 따옴표로 인용** — vague하면 Claude가 자동 매칭에 실패함
3. **front-load 핵심 use case** — 250자가 넘으면 잘리므로 가장 중요한 정보가 앞에 와야 함

좋은 예:
```yaml
description: 변경사항 분석 후 컨벤션에 맞게 커밋. "커밋해줘", "commit" 등의 요청 시 사용합니다.
```

나쁜 예:
```yaml
description: 커밋 메시지 포맷 규칙. 커밋 관련 작업 시 자동으로 참고됩니다.
```
(트리거 phrase 인용 없음, "참고됩니다" 수동태가 자동 매칭 시그널을 약화)

### Body 작성 가이드

표준 Claude Code Skill 작성 규칙:

1. **imperative / infinitive form** 사용 ("Analyze the changes", "변경사항을 분석한다")
2. **second-person ("you", "your") 금지** — "You are a commit author" 같은 문장 X
3. **lean SKILL.md** — 본문이 길어지면 같은 디렉토리의 별도 파일(`REFERENCE.md`, `EXAMPLES.md` 등)로 분리하고 SKILL.md에서 링크. 예: `skills/architecture/feature-sliced-design/REFERENCE.md`

## Standards Compliance

이 toolkit이 따르는 Claude Code Skills 표준은 아래 출처를 1차 권위로 삼습니다.

| 출처                                              | 권위                       | URL                                                                                                                             |
|-------------------------------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Claude Code 공식 문서 — Skills                       | Anthropic 공식             | https://code.claude.com/docs/en/skills                                                                                          |
| Anthropic plugin-dev: skill-development SKILL.md | Anthropic 자체 가이드 (가장 구체적) | https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/skill-development/SKILL.md |
| Agent Skills 오픈 표준                               | Cross-tool 표준            | https://agentskills.io                                                                                                          |

### 적용 규칙 (위 출처에서 직접 인용)

1. **description은 third-person 형식**, 사용자가 칠 정확한 트리거 phrase를 따옴표로 인용 — *(Anthropic skill-development SKILL.md)*
2. **body는 imperative / infinitive form**, second-person ("you") 금지 — *(Anthropic skill-development SKILL.md)*
3. **description ≤ 250자**, 핵심 use case front-load — *(code.claude.com/docs/en/skills)*
4. **SKILL.md는 lean하게**, 상세는 같은 디렉토리의 reference 파일 또는 supporting files로 분리 — *(Anthropic skill-development SKILL.md)*
5. **표준 frontmatter 필드**: `name`, `description`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `paths`, `argument-hint`, `model`, `effort`, `context`, `agent`, `hooks`, `shell` — *(code.claude.com/docs/en/skills)*
6. **name은 lowercase + hyphens**, ≤64자 — *(code.claude.com/docs/en/skills)*

### cosmos는 superset

cosmos는 위 표준의 **superset**입니다:

- 표준 필드를 모두 받습니다 (build.cjs가 frontmatter를 변형 없이 dist로 통과시킴 — `name` 필드만 빌드 ID로 rename).
- 빌드 시스템(`scripts/build.cjs` + `scripts/validate.cjs`) 운영을 위해 `version`, `layer`, `uses`, `external` 4개 필드를 추가합니다.
- Claude Code는 모르는 frontmatter 필드를 무시하므로, cosmos 확장 필드가 표준 위반을 일으키지 않습니다.
- 빌드 결과(`dist/skills/skill-{layer}-{name}/SKILL.md`)는 표준 형식으로 Claude Code에 직접 인식됩니다.
