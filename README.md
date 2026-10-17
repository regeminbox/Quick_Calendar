# 퀵캘린더 (Quick Calendar)

이마트 퀵커머스 매장 **주간 근무표를 폰에서 짜고, 카톡으로 이미지 한 장으로 보내는** 앱입니다.
엑셀 근무표와 같은 구조(가로 = 일~토, 세로 = 근무자, 칸 = 출근 시각 / 정일 / 연차)를 그대로 옮겼습니다.

- Android · iOS (Expo / React Native)
- 데이터는 폰에만 저장 (가입·서버 없음), JSON 백업 내보내기/가져오기
- 카톡 공유: 근무표를 선명한 PNG로 만들어 공유 시트 → 카카오톡
- 디자인: 밝은 중성 배경 + 인디고 포인트 + 파스텔 상태색. 카드·헤더·행사 띠는 이웃한 두 파스텔을 살짝 섞은 그라데이션, 앱 아이콘은 마트 카트

## 기능

| 화면 | 할 수 있는 것 |
| --- | --- |
| 처음 시작 | 온보딩 3단계(소개 → 매장 이름 → 근무자 추가), 또는 예시 근무표로 바로 둘러보기 |
| 근무표 | 주 이동(이전/다음/오늘). 표 위 **카드 줄**에서 카드를 고르면 칸을 **한 번** 눌러 바로 넣고, **두 번** 누르면 직접 입력(`930`, `1530~22`)·다른 카드·지우기 시트, 칸을 **꾹 누른 채 끌면** 그 카드가 지나간 칸에 복사. 지우개·직접 입력 도구. ⋯ 메뉴: 지난주 복사 · **다른 주에서 가져오기** · 이번 주 비우기 |
| 캘린더 | 주 제목(10/11 ~ 10/17)을 누르면 3열 연간 개요(앞뒤 2년). 위 검색창에 `2027 3`, `3월`처럼 치면 바로 이동, 달을 누르면 큰 달 카드가 열리고 주를 고르면 그 주로 이동. 날짜 아래 점 = 근무(초록)·상태 카드 색, 행사 기간은 날짜에 띠 색 |
| 행사 띠 | 날짜 위에 "고래잇 행사" 같은 기간 띠 추가/수정/삭제 (제목 · 기간 달력 · 색 · ★) |
| 카톡 공유 | 공유 미리보기 → 1200px PNG → 공유 시트(카카오톡) |
| 관리 | 근무자 추가 · 이름 · 순서 · 숨김 · 삭제 / 카드(시간 5종 + 범위 시간 카드 + 휴무·정일·연차 + 커스텀 카드 8색) |
| 설정 | 매장명, 시간 표기(1000 / 10:00), 백업 내보내기·가져오기, 예시 데이터, 초기화 |

디자인·구조·결정 사항은 [`docs/PLAN.md`](docs/PLAN.md)에 있습니다.

## 폰에 설치해 보기

### A. 가장 쉬운 길 — GitHub에서 버튼 한 번으로 APK 받기 (Android)

1. **한 번만 준비**: [expo.dev](https://expo.dev) 가입 → 프로필 → *Access tokens* → 토큰 만들기 → 이 저장소 *Settings → Secrets and variables → Actions → New repository secret* 에 이름 `EXPO_TOKEN`으로 저장.
2. 저장소 **Actions** 탭 → **Android APK** → *Run workflow*.
3. 10~20분 뒤 끝나면 그 실행 페이지 아래 **Artifacts → quickcalendar-apk** 를 내려받아 폰으로 보내고(카톡 나에게 보내기 등) 열면 설치됩니다. 처음엔 "출처를 알 수 없는 앱 허용"을 켜 달라고 합니다. Summary에 EAS 다운로드 링크도 함께 적힙니다.

> 워크플로는 빌드 전에 lint · 타입체크 · 테스트를 먼저 돌리고, 하나라도 실패하면 APK를 만들지 않습니다.

### B. 컴퓨터에서 직접

```bash
npm install
npx eas-cli login      # expo.dev 계정
npm run apk            # 오류 점검(lint·typecheck·test) 후 EAS preview APK 빌드 → 링크/QR
```

iOS는 Apple Developer Program(유료) 계정과 기기 등록이 필요합니다: `npx eas-cli build -p ios --profile preview`.

### C. 설치 없이 바로 보기 (Expo Go, 개발용)

1. 폰에 **Expo Go** 설치 (App Store / Play 스토어)
2. 컴퓨터에서 `npm install && npx expo start`
3. 터미널의 QR 코드를 Expo Go(Android) 또는 카메라(iOS)로 스캔 (같은 와이파이)

> 공유 시트(카톡 보내기)·햅틱은 실제 기기에서만 동작합니다. 웹(`npm run web`, `npm run demo:web`)은 화면 확인용입니다.

## 설치 전 오류 점검

```bash
npm run check          # lint + typecheck + 테스트 (CI와 같은 검사)
npm run export:native  # Android/iOS 번들을 실제로 만들어 보는 가장 확실한 검사 (dist-native/)
npx expo-doctor        # 의존성·설정 진단 (인터넷 필요)
```

## 개발 명령

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest (날짜 계산, 스토어, 행사 띠 배치, 백업, 캘린더 검색, 칸 좌표)
npm run web         # 브라우저에서 화면 확인
npm run demo:web    # dist-demo/quickcalendar-demo.html — 한 파일짜리 웹 데모 (아무 데나 올려서 공유)
```

## 구조

```
src/app/            expo-router 화면 (탭: 근무표 · 관리 · 설정, 모달: 공유 · 캘린더, 첫 실행: 온보딩)
src/features/       schedule(그리드·셀 편집·주 작업), events(행사 띠), cards, workers, share, backup
src/store/          zustand + AsyncStorage (근무자 · 카드 · 칸 · 행사 · 설정) + 보고 있는 주(useWeekView, 저장 안 함)
src/lib/            날짜(일요일 시작 주), 백업 직렬화, 확인창, 햅틱
src/theme/          색·간격·폰트(Pretendard) 토큰
assets/fonts/       Pretendard (OFL)
```

## 라이선스

MIT (Pretendard 폰트는 SIL Open Font License)
