# School News-feed

## API 명세
API 문서화는 제가 직접 개발한 오픈소스 라이브러리인 [Tspec](https://ts-spec.github.io/tspec/)을 사용했습니다.
서버를 실행한 뒤 http://localhost:3000/docs 에서 확인할 수 있습니다.

## Specification

[pages] 학교 관리자는 학교를 페이지를 운영하여 학교 소식을 발행할 수 있다.
  - 학교 관리자는 지역, 학교명으로 학교 페이지를 생성할 수 있다. - `POST /pages`
  - [추가] 유저는 학교 페이지 목록을 조회할 수 있다. - `GET /pages`
  
[posts] 학교 관리자는 학교를 페이지를 운영하여 학교 소식을 발행할 수 있다.
- 학교 관리자는 학교 페이지 내에 소식을 작성할 수 있다. - `POST /posts`
- 학교 관리자는 작성된 소식을 삭제할 수 있다. - `DELETE /posts/{postId}`
- 학교 관리자는 작성된 소식을 수정할 수 있다. - `PATCH /posts/{postId}`

[subscriptions] 학생은 학교 페이지를 구독하여 학교 소식을 받아 볼 수 있다.
- 학생은 학교 페이지를 구독할 수 있다. - `POST /subscriptions`
- 학생은 구독 중인 학교 페이지 목록을 확인할 수 있다. - `GET /subscriptions`
- 학생은 구독 중인 학교 페이지를 구독 취소할 수 있다. - `DELETE /subscriptions/{pageId}`
- 학생은 구독 중인 학교 페이지별 소식을 볼 수 있다. - `GET /subscriptions/{pageId}/posts`
  - 학교별 소식은 최신순으로 노출해야 함

[feeds] 학생은 구독 중인 학교 소식을 자신의 뉴스피드에서 모아볼 수 있다.
- 구독중인 모든 학교의 소식을 모아볼 수 있어야 함 - `GET /feeds`
  - 학교 소식이 노출되는 뉴스피드는 최신순으로 소식을 노출
  - 학교 페이지를 구독하는 시점 이후 소식부터 뉴스피드를 받음 
  - 학교 페이지 구독을 취소해도 기존 뉴스피드에 나타난 소식은 유지해야 함

[test]
- 단위 테스트 또는 통합 테스트를 구현해주세요. (100% Coverage를 달성할 필요는 없습니다.)

[docs] 구현에 맞는 API 명세 문서화해주세요.
- OpenAPI 3.0 Specification


## Getting Started

### 1. Install dependencies

```
yarn install
```

### 2. Create and seed the database

```
yarn prisma migrate dev --name init
```

### 3. Start the REST API server

```
yarn dev
```
