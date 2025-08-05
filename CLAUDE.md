# 유튜브 다운로드 서비스

- PRD.md를 참고한다.

## Package Manager

- **Use pnpm ONLY** - Do not suggest npm commands
- User exclusively uses pnpm for all package management

## 기술스택

### 프론트엔드

- 리액트, vite, tailwind, zustand, typescript, react-router

### 백엔드

- express, typescript, typeorm, postgres

## 작업방식

TDD를 한다. 테스트코드를 먼저 작성하고 그 후에 테스트를 통과하도록 기능을 구현한다.

## 컨벤션

### 프론트엔드

- 컴포넌트 이름은 PascalCase, 그 외 ts파일 이름은 camelCase로 작성한다.
- useEffect는 꼭 필요한 순간에만 사용한다.
- css에서 wrapper 역할을 하는 요소에 min-h-screen 을 사용하지 않는다.
- css의 단위는 상대값을 사용하지 않고 px을 사용한다. (절대값)
- 인라인 스타일을 작성하지 않는다.
- Tailwind CSS 사용 시 px 단위로 작성한다. (예: py-4 ❌, py-[16px] ✅)

### 백엔드

- 모든 api controller에는 주석으로 api endpoint를 작성한다.
- typeorm을 이용한다.

## Do not allow

- frontend 파일 내에서 컴포넌트 이름을 snake_case로 적지 않는다.

## 기술적 교훈 (Lessons Learned)

### AWS SDK 사용 시 주의사항

- **AWS SDK v3 스트림 처리**: readable stream을 직접 PutObjectCommand Body에 전달하면 "Unable to calculate hash for flowing readable stream" 에러 발생
- **해결방법**: 스트림을 Buffer.concat()으로 수집한 후 업로드

```javascript
// ❌ 잘못된 방법
Body: readableStream;

// ✅ 올바른 방법
const chunks = [];
stream.on("data", (chunk) => chunks.push(chunk));
stream.on("end", () => {
  const buffer = Buffer.concat(chunks);
  // S3 업로드
});
```

### 디버깅 베스트 프랙티스

- **단계별 검증**: 복잡한 플로우는 각 단계별로 테스트 엔드포인트 생성 (예: /test-s3)
- **충분한 로깅**: 에러 발생 시 각 단계별 상세 로그 필수
- **근본 원인 추적**: 표면적 에러 메시지에 속지 말고 실제 원인 파악
- **외부 라이브러리 제약사항**: 사용 전 공식 문서에서 제한사항 확인

### Node.js Child Process 주의사항

- spawn으로 실행한 프로세스의 stdout은 flowing readable stream
- 대용량 데이터 처리 시 메모리 사용량 고려 필요
- 프로세스 종료 코드와 데이터 수신 완료를 모두 확인해야 함
