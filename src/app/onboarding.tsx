import { router } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInRight, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CalendarIcon,
  ChevronLeftIcon,
  PlusIcon,
  ShareIcon,
  SparkleIcon,
} from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { GradientFill } from '@/components/ui/GradientFill';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { TextField } from '@/components/ui/TextField';
import { DayHeaderRow } from '@/features/schedule/DayHeaderRow';
import { EventBands } from '@/features/schedule/EventBands';
import { WorkerRow } from '@/features/schedule/WorkerRow';
import { layoutEventLanes } from '@/features/schedule/eventLanes';
import { computeGridMetrics } from '@/features/schedule/useGridMetrics';
import { weekDates } from '@/lib/date';
import { successHaptic, tapHaptic } from '@/lib/haptics';
import { useAllWorkers, useSettings } from '@/store/selectors';
import { buildSample, currentWeekStart, useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius, spacing, gradients } from '@/theme/tokens';

const STEPS = 3;

/** 첫 실행 안내: 소개 → 매장 이름 → 근무자 추가 */
export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const settings = useSettings();
  const updateSettings = useAppStore((s) => s.updateSettings);
  const seedSample = useAppStore((s) => s.seedSample);
  const [storeName, setStoreName] = useState(settings.storeName);

  const finish = () => {
    updateSettings({ storeName: storeName.trim() || settings.storeName, onboarded: true });
    successHaptic();
    router.replace('/');
  };
  const finishWithSample = () => {
    seedSample();
    updateSettings({ storeName: storeName.trim() || settings.storeName, onboarded: true });
    router.replace('/');
  };
  const next = () => {
    tapHaptic();
    setStep((s) => Math.min(STEPS - 1, s + 1));
  };
  const back = () => {
    tapHaptic();
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.top}>
        <View style={styles.topSide}>
          {step > 0 ? (
            <IconButton onPress={back} accessibilityLabel="이전">
              <ChevronLeftIcon />
            </IconButton>
          ) : null}
        </View>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <Animated.View
              key={i}
              layout={LinearTransition.springify().damping(18)}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>
        <View style={styles.topSide} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View
          key={step}
          entering={step === 0 ? FadeIn.duration(260) : FadeInRight.duration(240)}
          style={styles.step}>
          {step === 0 ? (
            <WelcomeStep />
          ) : step === 1 ? (
            <StoreStep value={storeName} onChange={setStoreName} />
          ) : (
            <WorkersStep />
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {step === 0 ? (
          <>
            <Button title="시작하기" variant="primary" size="lg" onPress={next} />
            <Button
              title="예시 근무표로 먼저 둘러보기"
              variant="ghost"
              onPress={finishWithSample}
            />
          </>
        ) : step === 1 ? (
          <Button title="다음" variant="primary" size="lg" onPress={next} />
        ) : (
          <>
            <Button title="완료" variant="primary" size="lg" onPress={finish} />
            <Button title="나중에 추가할게요" variant="ghost" onPress={finish} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function WelcomeStep() {
  const { width } = useWindowDimensions();
  // 실제 그리드 컴포넌트로 만든 미니 미리보기
  const sample = useMemo(() => buildSample(), []);
  const weekStart = currentWeekStart();
  const dates = weekDates(weekStart);
  const innerWidth = Math.min(width, 520) - spacing.lg * 2 - spacing.md * 2 - 2;
  const metrics = computeGridMetrics(innerWidth, 52);
  const lanes = layoutEventLanes(sample.events, weekStart);
  const workers = sample.workers.slice(0, 3);

  return (
    <View style={styles.welcome}>
      <GradientFill colors={gradients.hero} style={styles.hero}>
        <View style={{ width: metrics.tableWidth + 2 }} pointerEvents="none">
          <EventBands items={lanes.items} laneCount={lanes.laneCount} metrics={metrics} compact />
          <View style={styles.miniTable}>
            <DayHeaderRow dates={dates} today="" metrics={metrics} />
            {workers.map((w) => (
              <WorkerRow
                key={w.id}
                worker={w}
                dates={dates}
                cells={sample.cells}
                today=""
                timeStyle="compact"
                metrics={metrics}
              />
            ))}
          </View>
        </View>
      </GradientFill>
      <View style={styles.copy}>
        <AppText style={styles.headline}>근무표, 폰에서{'\n'}1분이면 끝나요</AppText>
        <AppText variant="body" color={colors.text.secondary}>
          엑셀 대신 칸을 누르고 카드만 고르세요. 완성된 표는 카톡으로 이미지 한 장.
        </AppText>
      </View>
      <View style={styles.features}>
        <Feature
          icon={<CalendarIcon size={20} />}
          title="칸 누르고 카드 선택"
          text="1000 · 1530~22 같은 시간, 휴무·정일·연차, 내가 만든 카드"
        />
        <Feature
          icon={<SparkleIcon size={20} />}
          title="고래잇 행사 띠"
          text="행사 기간을 날짜 위에 띠로 표시해 인력 배치가 한눈에"
        />
        <Feature
          icon={<ShareIcon size={20} />}
          title="카톡으로 한 장"
          text="선명한 이미지로 만들어 공유 시트에서 바로 전송"
        />
      </View>
    </View>
  );
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureText}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="caption" color={colors.text.secondary}>
          {text}
        </AppText>
      </View>
    </View>
  );
}

function StoreStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.form}>
      <AppText style={styles.headline}>매장 이름을{'\n'}알려주세요</AppText>
      <AppText variant="body" color={colors.text.secondary}>
        카톡으로 보내는 근무표 이미지 제목에 들어가요. 나중에 설정에서 바꿀 수 있어요.
      </AppText>
      <TextField
        value={value}
        onChangeText={onChange}
        placeholder="예: 이마트 퀵커머스 ○○점"
        maxLength={20}
        autoFocus
        returnKeyType="done"
      />
    </View>
  );
}

function WorkersStep() {
  const workers = useAllWorkers();
  const addWorker = useAppStore((s) => s.addWorker);
  const removeWorker = useAppStore((s) => s.removeWorker);
  const [name, setName] = useState('');

  const add = () => {
    const text = name.trim();
    if (!text) return;
    addWorker(text);
    tapHaptic();
    setName('');
  };

  return (
    <View style={styles.form}>
      <AppText style={styles.headline}>같이 일하는 분들을{'\n'}추가해 볼까요</AppText>
      <AppText variant="body" color={colors.text.secondary}>
        근무표의 행이 돼요. 순서나 이름은 관리 탭에서 언제든 바꿀 수 있어요.
      </AppText>
      <View style={styles.addRow}>
        <View style={styles.addField}>
          <TextField
            value={name}
            onChangeText={setName}
            placeholder="이름 입력 후 추가"
            returnKeyType="done"
            onSubmitEditing={add}
            blurOnSubmit={false}
            autoFocus
          />
        </View>
        <Button
          title="추가"
          variant="primary"
          icon={<PlusIcon size={16} />}
          onPress={add}
          disabled={!name.trim()}
          style={styles.addButton}
        />
      </View>
      <View style={styles.chips}>
        {workers.map((w) => (
          <Animated.View
            key={w.id}
            entering={FadeIn.duration(200)}
            layout={LinearTransition.springify().damping(18)}>
            <Chip label={w.name} onPress={() => removeWorker(w.id)} />
          </Animated.View>
        ))}
      </View>
      {workers.length > 0 ? (
        <AppText variant="caption" color={colors.text.tertiary}>
          {workers.length}명 · 이름을 누르면 빠져요
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.bg },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    height: 52,
  },
  topSide: { width: 36 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surface.border },
  dotActive: { width: 24, backgroundColor: colors.brand.primary },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  step: { gap: spacing.lg },
  welcome: { gap: spacing.xl },
  hero: {
    backgroundColor: colors.brand.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  miniTable: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: 'hidden',
  },
  copy: { gap: spacing.sm },
  headline: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, color: colors.text.primary },
  features: { gap: spacing.md },
  feature: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primaryPale,
    borderWidth: 1,
    borderColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, gap: 2 },
  form: { gap: spacing.md },
  addRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  addField: { flex: 1 },
  addButton: { height: 46 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
});
