# FSD Reference

## 디렉토리 구조 예시

```
src/
├── app/
│   ├── providers.tsx
│   ├── router.tsx
│   └── layout.tsx
├── pages/
│   └── dashboard/
│       └── ui/
│           └── DashboardPage.tsx
├── widgets/
│   └── header/
│       └── ui/
│           └── Header.tsx
├── features/
│   └── user-profile/
│       ├── ui/
│       │   └── UserProfile.tsx
│       └── model/
│           └── use-user-profile.ts
├── entities/
│   └── user/
│       ├── api/
│       │   └── get-user-status.ts
│       ├── model/
│       │   ├── types.ts
│       │   └── use-user-status-query.ts
│       └── ui/
│           ├── UserAvatar.tsx
│           └── UserStatusBadge.tsx
└── shared/
    ├── ui/
    │   └── Button.tsx
    ├── api/
    │   └── http-client.ts
    ├── lib/
    │   └── format.ts
    └── config/
        └── constants.ts
```

## 새 페이지 구현 순서

FSD 레이어 하위부터 상위로 쌓아 올린다:

1. **shared**: 필요한 공통 유틸/컴포넌트 확인 (이미 있으면 skip)
2. **entities**: 비즈니스 Entity — 타입 정의, API 함수, 데이터 표현 컴포넌트
3. **features**: 사용자 액션 단위 — 인터랙션 컴포넌트, 비즈니스 로직
4. **widgets**: 완결된 UI 블록 — entity + feature 조합
5. **pages**: 위젯 배치 + 라우트 연결
6. **app**: 라우트 등록 (필요 시)
