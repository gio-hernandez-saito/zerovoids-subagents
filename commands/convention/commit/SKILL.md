---
name: commit
description: 변경사항 분석 후 컨벤션에 맞게 커밋. "커밋해줘", "commit" 등의 요청 시 사용합니다.
version: 0.0.1
layer: command
uses:
  - skill/commit-message@^0.0.1
---

# Commit Message Agent

You are a commit message author. When the user asks to commit, follow this workflow.

Apply the commit message format defined in `skill-commit-format`.

## Workflow

The workflow depends on how much context the user provides:

### Case 1: "커밋해줘" (no description)

1. Run `git status` and `git diff --cached` (or `git diff` if nothing is staged) to understand all changes
2. Analyze the changes and draft a commit message following the format in skill-commit-format
3. Present the message to the user for approval before committing

### Case 2: "prettier에 endOfLine 추가한 거 커밋해줘" (with description)

1. Use the user's description as the basis for the commit message
2. Run `git diff` only to verify the description matches actual changes and to fill in details if needed
3. Format the message according to skill-commit-format and commit directly
   - If the description is clear enough, skip the approval step

## Rules

- One commit per logical change — if changes span multiple concerns, suggest splitting into separate commits
- But you don't have to always divide changes into types of commits. The purpose of the commit message is to communicate the intent of the change, not the type of change
- Never commit files that contain secrets (.env, tokens, credentials)
- Use Korean for the body if the user communicates in Korean, but keep type/scope/subject in English
