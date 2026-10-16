# 퀵캘린더 (Quick Calendar)

이마트 퀵커머스 매장 **주간 근무표를 폰에서 짜고, 카톡으로 이미지 한 장으로 보내는** 앱입니다.
엑셀 근무표와 같은 구조(가로 = 일~토, 세로 = 근무자, 칸 = 출근 시각 / 정일 / 연차)를 그대로 옮겼습니다.

- Android · iOS (Expo / React Native)
- 데이터는 폰에만 저장 (가입·서버 없음), JSON 백업 내보내기/가져오기
- 카톡 공유: 근무표를 선명한 PNG로 만들어 공유 시트 → 카카오톡

## 기능

| 화면 | 할 수 있는 것 |
| --- | --- |
| 근무표 | 주 이동(이전/다음/오늘), 칸 탭 → 출근 시간 칩 · 직접 입력 · 상태 카드 선택 · 지우기, 지난주 복사 · 이번 주 비우기 |
| 행사 띠 | 날짜 위에 "고래잇 행사" 같은 기간 띠 추가/수정/삭제 (제목 · 기간 달력 · 색 · ★) |
| 카톡 공유 | 공유 미리보기 → 1200px PNG → 공유 시트(카카오톡) |
| 관리 | 근무자 추가 · 이름 · 순서 · 숨김 · 삭제 / 카드(시간 5종 + 휴무·정일·연차 + 커스텀 카드) |
| 설정 | 매장명, 시간 표기(1000 / 10:00), 백업 내보내기·가져오기, 예시 데이터, 초기화 |

디자인·구조·결정 사항은 [`docs/PLAN.md`](docs/PLAN.md)에 있습니다.

## 폰에서 바로 실행해 보기 (Expo Go)

1. 폰에 **Expo Go** 설치 (App Store / Play 스토어)
2. 컴퓨터에서:
   ```bash
   npm install
   npx expo start
   ```
3. 터미널의 QR 코드를 Expo Go(Android) 또는 카메라(iOS)로 스캔

> 공유 시트(카톡 보내기)는 실제 기기에서만 동작합니다. 웹(`npx expo start --web`)은 화면 확인용입니다.

## 개발 명령

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest (날짜 계산, 스토어, 행사 띠 배치, 백업)
npm run web         # 브라우저에서 화면 확인
```

## 앱 설치 파일 만들기 (EAS Build)

Mac 없이도 클라우드에서 빌드합니다. [Expo 계정](https://expo.dev)이 필요합니다.

```bash
npm install -g eas-cli
eas login
eas init            # 프로젝트 ID를 app.json에 기록
eas build -p android --profile preview   # 테스트용 APK (링크로 설치)
eas build -p ios --profile preview       # iOS: Apple Developer Program 필요
```

- `preview`: 지인끼리 설치하는 내부 배포 (Android APK, iOS는 등록된 기기)
- `production`: 스토어 제출용 (`eas submit`)

## 구조

```
src/app/            expo-router 화면 (탭: 근무표 · 관리 · 설정, 모달: 공유)
src/features/       schedule(그리드·셀 편집·주 작업), events(행사 띠), cards, workers, share, backup
src/store/          zustand + AsyncStorage (근무자 · 카드 · 칸 · 행사 · 설정)
src/lib/            날짜(일요일 시작 주), 백업 직렬화, 확인창, 햅틱
src/theme/          색·간격·폰트(Pretendard) 토큰
assets/fonts/       Pretendard (OFL)
```

## 라이선스

MIT (Pretendard 폰트는 SIL Open Font License)
