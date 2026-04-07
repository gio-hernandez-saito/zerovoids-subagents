---
name: feature-sliced-design
description: Feature-Sliced Design(FSD) 아키텍처 규칙. Layer(app/pages/widgets/features/entities/shared) → Slice → Segment 3단계 구조와 단방향 의존성. "FSD", "feature-sliced", 프론트엔드 디렉토리 구조 작업 시 이 스킬을 사용합니다.
version: 0.0.1
layer: skill
user-invocable: false
external:
  - type: url
    href: https://feature-sliced.design/docs/get-started/overview
    description: FSD 공식 문서
---

## Feature-Sliced Design

프론트엔드 애플리케이션의 코드를 구조화하기 위한 아키텍처 방법론.
코드를 Layer → Slice → Segment 3단계로 구조화한다.

## Layer

단방향 의존만 허용한다. 상위 → 하위 참조만 가능, 역방향 금지.

```
app → pages → widgets → features → entities → shared
```

| Layer      | 역할                                                    |
|------------|-------------------------------------------------------|
| `app`      | 앱 실행 환경. Routing, Entrypoint, Global Styles, Provider |
| `pages`    | 라우트 기준 화면 단위. 위젯/피처를 조합                               |
| `widgets`  | 크고 독립적인 UI 단위. 하나의 완결된 화면 기능(use case) 제공             |
| `features` | 사용자에게 비즈니스 가치를 제공하는 액션. 재사용 가능한 기능 단위                 |
| `entities` | 비즈니스 Entity. 데이터 모델 + 표현                              |
| `shared`   | 모든 Layer에서 재사용되는 코드. 비즈니스 로직 없음                       |

`app`과 `shared`는 Slice 없이 직접 Segment로 구성한다.

## Slice

Layer 내부를 비즈니스 도메인별로 나누는 단위.
같은 Layer 내 다른 Slice를 참조할 수 없다.

## Segment

Slice 내부를 코드 역할에 따라 분류하는 단위.

| Segment   | 포함 내용                                              |
|-----------|----------------------------------------------------|
| `ui/`     | UI 컴포넌트, date formatter, styles 등 UI 표현 관련 코드      |
| `api/`    | request functions, data types, mappers 등 백엔드 통신 로직 |
| `model/`  | schema, interfaces, store, business logic 등 도메인 모델 |
| `lib/`    | 해당 Slice 내 공통 library code                         |
| `config/` | configuration files, feature flags 등 설정            |

추가 Segment는 `app` 또는 `shared` Layer에서만 정의한다.

## 의존성 규칙

1. **상위 → 하위만 허용**: `features/`는 `entities/`, `shared/`만 import 가능
2. **같은 레이어 간 참조 금지**: `entities/user`가 `entities/message`를 직접 import 불가
3. **Cross-reference 필요 시**: 상위 레이어에서 조합하거나 `shared/`로 내린다
4. **Public API**: 각 슬라이스는 `index.ts`로 외부 노출 인터페이스를 제한한다
5. **데이터 호출 기반**: axios, useQuery, useMutation 등 공통 fetching 유틸은 `shared`에 위치

## Layer 선택 기준

컴포넌트의 활용도와 복잡성에 따라 구조가 달라질 수 있다.
모든 Slice가 모든 Segment를 가질 필요는 없다. 참조 관계의 명확성이 구조의 형태보다 중요하다.

| 상황                             | 패턴                                                 |
|--------------------------------|----------------------------------------------------|
| 단순 데이터 표현만 필요                  | `entities`만으로 충분                                   |
| 사용자 액션/인터랙션이 있음                | `entities` + `features`                            |
| 동일 UI, 다른 데이터 소스               | `features`에서 interface 정의 → `widgets`에서 adapter 주입 |
| 여러 feature/entity를 조합하는 완결된 UI | `widgets`에서 조립                                     |

상세 디렉토리 구조와 구현 순서는 [REFERENCE.md](REFERENCE.md) 참고.
