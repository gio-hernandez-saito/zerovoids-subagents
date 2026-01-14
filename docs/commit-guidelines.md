# 커밋 메시지 가이드

커밋할 때 빠르게 참조하는 규칙 모음입니다.

---

## 📋 형식

```
prefix: 제목

- 세부 내용 1
- 세부 내용 2
```

---

## 🏷️ 허용된 Prefix

| Prefix     | 용도              | 예시                              |
|------------|-----------------|---------------------------------|
| `feat`     | 새 기능이나 Agent 추가 | feat: add debugger agent        |
| `fix`      | 버그 수정           | fix: correct template error     |
| `docs`     | 문서만 변경          | docs: update architecture guide |
| `refactor` | 기능 변경 없는 리팩토링   | refactor: reorganize agents     |
| `chore`    | 유지보수 작업         | chore: update dependencies      |
| `revert`   | 이전 커밋 되돌리기      | revert: rollback agent changes  |

---

## ✅ 좋은 예시

### Agent 추가
```
feat: add debugger agent

- 체계적 디버깅 접근법 추가
- 에러 패턴 인식 포함
- 문제 해결 예시 추가
```

### 버그 수정
```
fix: correct template frontmatter

- created 필드 누락 수정
- 날짜 형식 표준화
- 예시 업데이트
```

### 문서 업데이트
```
docs: improve agent writing guide

- 베스트 프랙티스 섹션 추가
- 더 많은 예시 포함
- 안티패턴 설명 개선
```

### 리팩토링
```
refactor: reorganize specialized agents

- database 서브디렉토리 생성
- 5개 Agent 이동
- profiles 업데이트
```

---

## ❌ 나쁜 예시

### 콜론 뒤 띄어쓰기 없음
```
feat:add agent          # ❌ 잘못됨
feat: add agent         # ✅ 올바름
```

### Prefix 누락
```
add agent               # ❌ 잘못됨
feat: add agent         # ✅ 올바름
```

### 두 번째 줄이 비어있지 않음
```
feat: add agent
- 내용 추가             # ❌ 잘못됨
```
```
feat: add agent

- 내용 추가             # ✅ 올바름
```

### 본문이 '- '로 시작하지 않음
```
feat: add agent

내용 추가               # ❌ 잘못됨
```
```
feat: add agent

- 내용 추가             # ✅ 올바름
```

---

## 🎯 규칙 요약

1. **첫 줄**: `prefix: 제목` (콜론 뒤 띄어쓰기!)
2. **두 번째 줄**: 반드시 비어있어야 함
3. **본문**: 각 줄은 `- `(대시 + 띄어쓰기)로 시작

---

## ⚡ 빠른 템플릿

```
feat: 

- 
- 
```

```
fix: 

- 
- 
```

```
docs: 

- 
- 
```

---

## 🔍 왜 이런 규칙?

### 일관성
- 커밋 히스토리 읽기 쉬움
- 패턴 인식 용이

### 명확성
- 목적이 즉시 명확함
- 변경 사항 추적 쉬움

### 자동화
- Changelog 생성 가능
- 릴리스 노트 자동화

### 표준
- Conventional Commits에 느슨하게 따름
- 업계 표준과 호환

---

## 💡 팁

### 제목 작성
- **간결하게**: 50자 이내
- **명령형**: "add" not "added"
- **소문자**: 첫 글자 소문자
- **마침표 없음**: 제목 끝에 마침표 불필요

### 본문 작성
- **왜**: 무엇을 했는지뿐만 아니라 왜 했는지
- **구체적**: "개선함"보다 "React 렌더링 성능 20% 향상"
- **짧게**: 각 항목은 한 줄로
- **목록**: 여러 변경사항은 별도 항목으로

---

## 🚨 자동 검증

커밋 시 Git hook이 자동으로 형식을 검증합니다.

실패하면:
- 문제를 명확히 설명하는 에러 메시지
- 올바른 형식 예시
- 수정 방법 안내

---

**Last Updated**: 2026-01-14
