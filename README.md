# School News-feed

## 기술스택
- 언어: TypeScript
- 실행환경: Node.js
- 프레임워크: Nest.js
- DB: SQLite
- ORM: Prisma
- 테스트: Jest
- API 문서화: OpenAPI + Tspec + Swagger UI

## 요구사항에 대한 e2e 테스트 결과
> 테스트 커버리지 결과는 /test/coverage 폴더에 있습니다.

```
 PASS  test/posts.e2e-spec.ts (5.828 s)
  Posts (e2e)
    POST /posts
      ✓ 페이지 권한을 가진 관리자는 학교 소식을 발행할 수 있다. (91 ms)
      ✓ 페이지 권한을 가진 관리자 이외의 유저는 학교 소식을 발행할 수 없다. (19 ms)
      ✓ 소식이 발행되면 구독 중인 학생들의 피드에 소식이 추가되어야 한다. (1028 ms)
    DELETE /posts/{postId}
      ✓ 페이지 권한을 가진 관리자는 학교 소식을 삭제할 수 있다. (46 ms)
      ✓ 페이지 권한을 가진 관리자 이외의 유저는 학교 소식을 삭제할 수 없다. (21 ms)
      ✓ 소식이 삭제되면 구독 중인 학생들의 피드에서도 소식이 삭제되어야 한다. (22 ms)
    PATCH /posts/{postId}
      ✓ 학교 관리자는 학교 소식을 수정할 수 있다. (31 ms)
      ✓ 학교 관리자 이외의 유저는 학교 소식을 수정할 수 없다. (15 ms)

 PASS  test/feeds.e2e-spec.ts
  Feeds (e2e)
    GET /feeds
      ✓ 학교 페이지를 구독하는 시점 이후 소식부터 뉴스피드를 받는다. (1109 ms)
      ✓ 뉴스피드는 최신순으로 소식을 노출한다. (53 ms)
      ✓ 학교 페이지 구독을 취소해도 기존 뉴스피드에 나타난 소식은 유지한다. (13 ms)

 PASS  test/subscriptions.e2e-spec.ts
  Subscriptions (e2e)
    GET /subscriptions/pages
      ✓ 학생은 구독 중인 학교 페이지 목록을 조회할 수 있다. (67 ms)
    POST /subscriptions/pages/{pageId}
      ✓ 학생은 학교 페이지를 구독할 수 있다. (33 ms)
    DELETE /subscriptions/pages/{pageId}
      ✓ 학생은 학교 페이지 구독을 취소할 수 있다. (28 ms)
    GET /subscriptions/{pageId}/posts
      ✓ 유저는 구독 중인 학교 페이지의 소식 목록을 조회할 수 있다. (32 ms)
      ✓ 학교별 소식은 최신순으로 노출해해야 한다. (59 ms)
      ✓ 유저는 구독 중이 아닌 학교 페이지별 소식을 볼 수 없다. (14 ms)

 PASS  test/pages.e2e-spec.ts
  Pages (e2e)
    POST /pages
      ✓ 학교 관리자는 지역, 학교명으로 학교 페이지를 생성할 수 있다. (67 ms)
      ✓ 학교 관리자 이외의 유저는 학교 페이지를 생성할 수 없다. (11 ms)
      ✓ 지역과 학교명이 동일한 학교 페이지는 생성할 수 없다. (15 ms)
    GET /pages
      ✓ 유저는 전체 학교 페이지 목록을 조회할 수 있다. (25 ms)

 PASS  test/auth.e2e-spec.ts
  Auth (e2e)
    POST /auth/signup
      ✓ 이메일과 관리자 여부를 입력받아 유저를 생성하고 토큰을 발급한다. (41 ms)

Test Suites: 5 passed, 5 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        10.125 s
Ran all test suites.
```

## 설치 및 실행 (Docker 기준)

### 1. Docker 설치
```
brew install docker
```

### 2. Docker 빌드
```
docker build -t newsfeed .
```

### 3. Docker 실행
```
docker run -p 80:80 newsfeed
```


## 설치 및 실행 (Mac 기준)

### 1. Node.js 설치
```
brew install node
```

### 2. Yarn 설치
```
brew install yarn
```

### 3. 의존성 설치
```
yarn install
```

### 4. 데이터베이스 마이그레이션
```
yarn prisma migrate dev --name init
```

### 5. 서버 실행
```
yarn start
```

## 테스트
> 테스트코드는 E2E 테스트만 작성했으며, 테스트 파일은 `test` 폴더에 있습니다.

```
yarn test:e2e
```

## API 문서화
**직접 개발한 오픈소스 라이브러리**인 [Tspec](https://ts-spec.github.io/tspec/)을 사용하여 API 문서를 작성했습니다.
서버를 실행한 뒤 http://localhost/docs 에서 확인할 수 있습니다.
