---
name: commit-message
description: 커밋 메시지 포맷 규칙. 커밋 관련 작업 시 자동으로 참고됩니다.
version: 0.0.1
layer: skill
external:
  - type: url
    href: https://www.conventionalcommits.org/en/v1.0.0/
    description: Conventional Commits 공식 스펙
---

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (required)

| Type     | Description                                                 |
|----------|-------------------------------------------------------------|
| feat     | New feature                                                 |
| fix      | Bug fix                                                     |
| docs     | Documentation only                                          |
| style    | Code style (formatting, semicolons, etc.) — no logic change |
| refactor | Code change that neither fixes a bug nor adds a feature     |
| perf     | Performance improvement                                     |
| test     | Adding or updating tests                                    |
| build    | Build system or external dependency changes                 |
| ci       | CI configuration changes                                    |
| chore    | Other changes that don't modify src or test files           |
| revert   | Reverts a previous commit                                   |

### Scope (optional)

The package or area affected. Omit when changes span multiple areas or the scope is clear from context.

### Subject (required)

- Imperative present tense: "add" not "added" or "adds"
- Do NOT capitalize the first letter
- No period (.) at the end
- Keep under 50 characters

### Body (optional, but recommended for non-trivial changes)

- Imperative present tense
- Explain the **motivation** for the change
- Describe the **difference from previous behavior**
- Separate from a subject with a blank line
- Wrap at 72 characters

### Footer (optional)

- **Breaking Changes**: `BREAKING CHANGE: <description>`
  - Can also be indicated with `!` after scope: `feat(sdk)!: <subject>`
- **Issue references**: `Refs: #123`, `Closes: #456`, or Jira issue keys (`Refs: PROJ-123`)

### Examples

Simple:
```
fix(sdk): resolve null check in useTheme hook
```

With body:
```
feat(sdk): add color token system

Replace hardcoded color values with design token based system.
Consuming applications can now override theme colors through
token configuration instead of CSS overrides.
```

With breaking change:
```
refactor(sdk)!: rename ThemeProvider to SdkThemeProvider

Rename to avoid naming conflicts with consuming app's own
ThemeProvider.

BREAKING CHANGE: ThemeProvider is now SdkThemeProvider.
All consuming applications must update their imports:
- import { ThemeProvider } -> import { SdkThemeProvider }
```
