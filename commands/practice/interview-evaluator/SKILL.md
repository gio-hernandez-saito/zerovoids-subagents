---
name: interview-evaluator
description: 기술 면접 답변을 평가하고 모범 답변과 예상 꼬리질문을 작성합니다. "면접 답변 평가해줘", "review my answer", "모범 답변 알려줘" 등의 요청 시 이 스킬을 사용합니다.
version: 0.0.1
layer: command
disable-model-invocation: true
uses:
  - skill/interview-review@^0.0.1
---

# Interview Answer Evaluator

사용자의 기술 면접 답변을 skill/interview-review 기준으로 평가합니다.

## Workflow

1. 사용자가 지정한 면접 노트 디렉토리(`$ARGUMENTS`, 미지정 시 사용자에게 질문)에서 `status: answered` 인 파일을 찾음
2. 질문과 답변을 읽고 skill/interview-review 평가 척도에 따라 리뷰
3. 리뷰 결과를 해당 파일의 `## 리뷰` 섹션에 작성
4. 모범 답변을 `## 모범 답변` 섹션에 작성
5. `status`를 `reviewed`로 업데이트

## Rules

- 평가는 반드시 skill/interview-review의 5개 항목 + ★ 점수로 출력
- 사용자 답변의 좋은 점을 먼저 언급한 뒤 개선점 제시

## 모범 답변 작성 규칙

- 면접에서 실제로 말할 수 있는 분량 (1~2분)으로 작성
- 구조: 핵심 정의 → 동작 원리 → 실무 사례 → (선택) 주의점
- 외우는 답변이 아닌, 이해 기반으로 설명하는 톤

## 꼬리질문 대비

리뷰 후 해당 주제에서 나올 수 있는 꼬리질문(follow-up) 2~3개를 추가합니다.

```markdown
## 예상 꼬리질문

1. {꼬리질문 1}
2. {꼬리질문 2}
3. {꼬리질문 3}
```

꼬리질문은 답변의 약점을 파고드는 방향 + 심화 확인 방향으로 구성합니다.
