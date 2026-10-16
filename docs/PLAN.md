# 퀵캘린더 (Quick Calendar) — 이마트 퀵커머스 근무표 앱 계획서

> 작성일 2026-10-16 · 상태: M1~M4 구현 완료, M5·M6 진행 중 (README 참고)

## 1. 배경 (Context)

이마트 퀵커머스 매장 관리자가 지금은 엑셀로 주간 근무표를 만든다.
사진으로 확인한 표 구조:

- 가로축: 한 주 7일, **일요일 시작** (예: 10/25 일 … 10/31 토). 노란 헤더에 날짜 + 요일.
- 세로축: 근무자 이름 (한서울, 손기성, 홍수빈, 김태양, 정현석 …).
- 셀: 출근 시각 4자리(`1000`, `1300`, `1400`, `1530`, `1900`) 또는 **정일**·**연차**(분홍 배경 + 빨간 글자).
- 주 단위 블록이 세로로 쌓임.

목표: 이 표를 **폰에서 쉽고 빠르게** 만들고, **카톡으로 깔끔한 이미지**로 바로 보낸다.
저장소(`regeminbox/Quick_Calendar`)는 비어 있어 처음부터 설계한다.

## 2. 확정된 결정

| 항목 | 결정 | 이유 |
| --- | --- | --- |
| 플랫폼 | Android + iOS | 팀원 폰이 섞여 있음 |
| 스택 | **Expo (React Native) + TypeScript + expo-router** | 한 코드로 양쪽, Mac 없이 EAS 클라우드 빌드로 iOS 가능 |
| 데이터 | **폰 로컬 저장만** (zustand + AsyncStorage), JSON 백업 내보내기/가져오기 | 가입·서버 없이 가장 빨리 완성 |
| 카톡 공유 | **이미지만** — 표를 PNG로 렌더 → OS 공유 시트 → 카카오톡 | Kakao SDK·앱 등록 불필요 |
| 디자인 | 이마트 **노랑** 포인트 + 심플한 밝은 배경, 나머지는 미니멀 + 상태색만 | 작은 화면/카톡 이미지에서 또렷하게 |
| 로딩/빈 화면 | 마스코트 없이 **근무표 스켈레톤 로더**(실제 표와 같은 치수, 펄스) + **아이콘 타일 빈 상태** | 레이아웃이 흔들리지 않고 가장 심플함. 캐릭터 IP 이슈 없음 |
| 행사 띠 | 별도 화면 없이, 근무표 **날짜 헤더 위에 "고래잇 행사" 띠를 기간(예: 3일~6일)으로 표시** (공유 이미지에도 포함) | 행사 기간 인력 배치 한눈에 |
| 카드 | 기본 카드(시간 5종, 휴무·정일·연차) 외에 **사용자 커스텀 카드**(라벨+색) 추가 | 반차·교육·병가·오픈·마감 등 매장마다 다름 |

## 3. 디자인 레퍼런스 (The Seeker Reference MCP)

조사: 태그 조사 → 검색 7회 → 컨택트 시트 3장(38개 후보) → 아래 선정.

**채택 (구조·톤)**
- [#7391 투어 예약 앱](https://ref.theseeker.io/r/7391) — 웜 그레이 배경 + 흰 카드 + 검정 알약 버튼, **노랑은 날짜 블록에만**. 요일 칩·바텀시트 폼·플로팅 탭바. → 앱 전체 톤의 기준.
- [#3398 옐로 강조 대시보드](https://ref.theseeker.io/r/3398) — 노랑 하나로 위계 잡기, 옅은 노랑(#FDF7DD) 배경 활용. → 헤더/행사 띠 색 운용.
- [#7484 근무 스케줄러](https://ref.theseeker.io/r/7484) — 행=직원, 알약형 근무 블록, 하단 상태 범례. → 표 구조·범례.
- [#8181 Week ahead](https://ref.theseeker.io/r/8181) — 날짜 알약 스트립, 큰 2줄 헤드라인, 하단 고정 CTA. → 주 이동 헤더·공유 버튼 배치.
- [#6257 캘린더 위젯](https://ref.theseeker.io/r/6257) — 선택 날짜만 강조하는 절제된 토큰. → 오늘 표시.
- [#5337 팀 타임시트](https://ref.theseeker.io/r/5337) — 사람×요일 고밀도 표, 주말 열 흐리게. → 셀 밀도·주말 처리.
- [#10195 Shift Work Calendar](https://ref.theseeker.io/r/10195) — 근무 유형을 색 칩으로만 구분. → 카드 색 체계.

**제외**: 파스텔 카드형(#9155 등)은 7열 표 가독성 저하. 병원 대시보드(#6613 등)는 데스크톱 사이드바 레이아웃. 라임-옐로 임대 앱(#7872 등)은 톤은 참고하되 형광 라임이 이마트 노랑과 다름.

### 3.1 테마 토큰 (`src/theme/tokens.ts`)

```
brand.yellow      #FFD200   헤더·행사 띠·주요 버튼
brand.yellowSoft  #FFF1A8   선택/오늘 강조
brand.yellowPale  #FFFBE6   은은한 배경 강조
surface.bg        #F6F5F1   앱 배경 (웜 그레이)
surface.card      #FFFFFF
surface.border    #E6E3DC
text.primary      #141414
text.secondary    #6F6B63
status.jeongil    bg #FDE2E2 / fg #D13B3B   정일 (엑셀과 동일한 분홍+빨강)
status.yeoncha    bg #EDE4FF / fg #6B3FD1   연차
status.hyumu      bg #ECEAE4 / fg #6F6B63   휴무
cell.time         bg #FFFFFF / fg #141414   출근 시각
weekday.sun       #D13B3B   weekday.sat #2F6BD6
radius 10/14/20 · spacing 4/8/12/16/24 · 폰트 Pretendard (OFL)
```

## 4. 기능 범위

### MVP (M1–M4)
1. **주간 근무표 그리드**: 이름 열 + 7일. 셀 탭 → 카드 선택 바텀시트. 이전/다음 주, 오늘.
2. **카드 시스템**: 기본 시간 카드(10:00·13:00·14:00·15:30·19:00, 편집 가능), 상태 카드(휴무·정일·연차), **커스텀 카드 추가**(라벨 ≤4자, 색 8종 중 선택), 직접 시간 입력, 지우기.
3. **행사 띠**: 근무표 상단 "+ 행사" 버튼(또는 날짜 헤더 길게 누르기) → 시작일·종료일 + 라벨(기본 "고래잇 행사") → 해당 날짜 열 위에 노란 띠 + 반짝이(★) 아이콘. 띠 탭으로 수정/삭제. 겹치면 줄 추가. 별도 화면·탭 없음.
4. **근무자 관리**: 추가·이름 변경·순서(위/아래)·비활성.
5. **카톡 공유**: 공유 미리보기 화면에서 PNG 생성 → 공유 시트. 이미지 = 매장명 + 주간 범위 제목, 행사 띠, 노란 헤더, 표, 하단 범례.
6. **스켈레톤 로딩**: 앱 시작(스토어 복원·폰트 로드) 동안 근무표 화면과 같은 모양의 회색 블록 스켈레톤이 펄스하다가 실제 표로 전환. 빈 상태(근무자 없음)는 아이콘 타일 + 안내 + 버튼.
7. **설정**: 매장명, 시간 표기(10:00 / 1000), 백업 내보내기(JSON 공유), 가져오기(파일 선택).

### 이후 (M5+)
- 지난주 복사, 주 비우기, 햅틱, 앱 아이콘/스플래시(노랑), 월간 개요, 다크 모드, 위젯.

## 5. 아키텍처

### 5.1 폴더 구조
```
app/
  _layout.tsx                 폰트·스토어 하이드레이션 게이트(MascotLoader), Providers
  (tabs)/_layout.tsx          탭: 근무표 / 관리 / 설정
  (tabs)/index.tsx            주간 근무표 (+ 행사 띠, "+ 행사" 버튼)
  (tabs)/manage.tsx           근무자·카드 (세그먼트)
  (tabs)/settings.tsx         설정·백업
  share.tsx                   공유 미리보기 (modal)
src/
  theme/tokens.ts, typography.ts
  components/ui/              Button, Chip, Sheet(BottomSheet 래퍼), SegmentedControl, ColorSwatch
  components/AppLoader.tsx           스켈레톤 로딩 오버레이 (근무표 화면 모양)
  features/schedule/WeekGridSkeleton.tsx  실제 그리드와 같은 치수의 스켈레톤 (펄스)
  features/schedule/WeekGrid.tsx, WeekHeader.tsx, CellEditorSheet.tsx, EventBands.tsx
  features/share/ShareCard.tsx, useShareImage.ts
  features/events/EventSheet.tsx     행사 띠 추가/수정 바텀시트 (기간 + 라벨, 기본 '고래잇 행사')
  features/cards/CardEditor.tsx, defaultCards.ts
  features/workers/WorkerList.tsx
  store/useAppStore.ts        zustand + persist(AsyncStorage), version 1, migrate()
  store/selectors.ts
  lib/date.ts                 주 범위(일~토), ISO 변환, 요일 라벨, 날짜 연산
  lib/backup.ts               JSON export/import + 스키마 검증
  lib/id.ts
assets/fonts/ (pretendard npm에서 복사), assets/icon.png, splash
docs/PLAN.md
```

### 5.2 데이터 모델 (`src/store/types.ts`)
```ts
type ISODate = string;                       // 'yyyy-MM-dd'
interface Worker { id: string; name: string; order: number; active: boolean }
interface Card   { id: string; label: string; kind: 'time' | 'status'; bg: string; fg: string; order: number; builtIn: boolean }
interface CellValue { cardId: string | null; label: string; bg: string; fg: string }   // 카드 삭제 대비 스냅샷
interface CalendarEvent { id: string; title: string; start: ISODate; end: ISODate; color: string; icon: 'whale' | 'none'; template?: 'goraeit' }
interface Settings { storeName: string; timeStyle: 'colon' | 'compact' }
interface AppState {
  version: 1; workers: Worker[]; cards: Card[]; events: CalendarEvent[];
  cells: Record<`${string}|${ISODate}`, CellValue>;   // key = workerId|date
  settings: Settings;
  // actions: addWorker, renameWorker, moveWorker, toggleWorker, setCell, clearCell,
  //          upsertCard, deleteCard, upsertEvent, deleteEvent, copyPreviousWeek, clearWeek,
  //          updateSettings, importBackup
}
```
셀을 **날짜 기준**으로 저장하므로 "지난주 복사"는 `date-7` 값을 복사하면 된다.

### 5.3 그리드 치수 (390pt 기준)
- 이름 열 60pt, 날짜 열 7×46pt = 322pt, 좌우 여백 4pt → 가로 스크롤 없이 한 화면.
- 행 높이 44pt, 셀 글자 12pt(시간) / 12pt 굵게(상태), 라벨 4자까지 1줄.
- 헤더(날짜 큰 글자 + 요일 작은 글자)는 ScrollView 밖에 고정, 일=빨강·토=파랑, 오늘 열은 yellowSoft.
- 행사 띠는 헤더 아래 24pt 줄, 해당 열 범위만 노랑으로 채우고 제목 + 반짝이 아이콘.

### 5.4 공유 이미지
- `ShareCard`를 **고정 400pt 폭**으로 미리보기 화면에 실제 렌더 → `captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile', pixelRatio: 3 })` → 1200px 폭 PNG → `Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' })`.
- 캡처 전 폰트 로드 완료·레이아웃 완료(onLayout) 대기. 미리보기에 실제로 그리므로 오프스크린 트릭 불필요.
- 구성: 제목(매장명 · 10/25~10/31 근무표) → 행사 띠 → 노란 헤더 → 표 → 범례(상태색) + 생성일.

### 5.5 로딩·빈 상태 (레퍼런스: /r/5029, /r/6740, /r/4276)
- `AppLoader`: 폰트·스토어 준비 전까지 근무표 화면과 같은 레이아웃(헤더 바 + 노란 날짜 헤더 + 5행)을 회색 블록으로 그리고 opacity 펄스. 준비되면 FadeOut → 같은 자리에 실제 표.
- `EmptyState`: 64pt 노란 아이콘 타일(캘린더) + 제목 + 설명 + "근무자 추가"/"예시로 채우기".
- 행사 띠 아이콘은 작은 반짝이(★). 캐릭터/마스코트는 사용하지 않음.

## 6. 라이브러리 (모두 Expo Go에서 동작)
expo-router · zustand · @react-native-async-storage/async-storage · date-fns · react-native-svg · react-native-reanimated · react-native-gesture-handler · @gorhom/bottom-sheet · react-native-view-shot · expo-sharing · expo-file-system · expo-document-picker · expo-haptics · expo-font + `pretendard`(npm) · @react-native-community/datetimepicker · expo-splash-screen
개발: typescript · eslint-config-expo · prettier · jest-expo · @testing-library/react-native

## 7. 마일스톤 (각각 독립 검증)
- **M1 스캐폴드 + 테마 + 그리드(목 데이터)** — 탭 뼈대, 토큰, WeekGrid, MascotLoader
- **M2 편집 + 저장** — 스토어, 셀 에디터 시트, 카드 CRUD, 근무자 CRUD, persist
- **M3 공유 이미지** — ShareCard, 미리보기, captureRef → 공유 시트
- **M4 행사 띠 + 설정 + 백업** — 이벤트 모델, 날짜 헤더 위 띠(그리드·이미지), 기간/라벨 시트, 설정, JSON 백업
- **M5 폴리시** — 지난주 복사, 햅틱, 앱 아이콘·스플래시, 빈 상태
- **M6 EAS** — eas.json(development / preview APK / production), 스토어 메타

## 8. 검증 (클라우드 컨테이너, 에뮬레이터 없음)
- `npx tsc --noEmit`, `npx expo lint`, `npx jest` — `lib/date`(일~토 주 범위, 포맷), 스토어 액션(setCell·copyPreviousWeek·카드 삭제 스냅샷·이벤트 주간 교차), 백업 스키마.
- `npx expo export --platform web` — 번들 컴파일 증명.
- `npx expo start --web` + Playwright(Chromium 사전 설치) 스크린샷 → 근무표·공유 미리보기 시각 확인 후 사용자에게 전달.
- 여기서 못 하는 것: 실제 공유 시트, 폰트 렌더 미세 차이, 햅틱 → 사용자가 **Expo Go로 QR 스캔**해 폰에서 확인. 이후 EAS preview(APK) / TestFlight.

## 9. 리스크
- 캡처 시점에 폰트 미로딩 → 폰트 로드 게이트 후에만 공유 버튼 활성.
- Android 공유 URI(file:// vs content://) → expo-sharing이 처리.
- 카톡이 이미지를 압축 → 1200px 폭·PNG, "원본" 전송 안내.
- 커스텀 라벨이 길면 셀 넘침 → 4자 제한 + 자동 축소(adjustsFontSizeToFit).
- Expo SDK new architecture 호환 → 최신 SDK 기준 라이브러리 버전 고정.
- iOS 배포에는 Apple Developer Program(연 $129) 필요. Android는 APK 직접 설치 가능.
