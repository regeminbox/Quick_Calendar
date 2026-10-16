import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { exportBackupFile, pickBackupText } from '@/features/backup/backupIO';
import { backupFileName, parseBackup, serializeBackup } from '@/lib/backup';
import { confirmAsync } from '@/lib/confirm';
import type { TimeStyle } from '@/lib/date';
import { successHaptic } from '@/lib/haptics';
import { useSettings } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme/tokens';

const TIME_STYLE_OPTIONS = [
  { key: 'compact', label: '1000 표기' },
  { key: 'colon', label: '10:00 표기' },
] as const;

type Notice = { kind: 'ok' | 'error'; text: string } | null;

export default function SettingsScreen() {
  const settings = useSettings();
  const updateSettings = useAppStore((s) => s.updateSettings);
  const importBackup = useAppStore((s) => s.importBackup);
  const seedSample = useAppStore((s) => s.seedSample);
  const resetAll = useAppStore((s) => s.resetAll);
  const workerCount = useAppStore((s) => s.workers.length);

  const [storeName, setStoreName] = useState(settings.storeName);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  const commitStoreName = () => {
    const text = storeName.trim();
    if (!text) {
      setStoreName(settings.storeName);
      return;
    }
    if (text !== settings.storeName) updateSettings({ storeName: text });
  };

  const onExport = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const state = useAppStore.getState();
      await exportBackupFile(
        serializeBackup({ version: state.version, workers: state.workers, cards: state.cards, events: state.events, cells: state.cells, settings: state.settings }),
        backupFileName(),
      );
      setNotice({ kind: 'ok', text: '백업 파일을 만들었어요. 저장하거나 카톡·드라이브로 보내 두세요.' });
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : '백업을 만들지 못했어요.' });
    } finally {
      setBusy(false);
    }
  };

  const onImport = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const text = await pickBackupText();
      if (text === null) return;
      const data = parseBackup(text);
      const ok = await confirmAsync(
        '백업으로 되돌릴까요?',
        `근무자 ${data.workers.length}명, 칸 ${Object.keys(data.cells).length}개를 불러와요. 지금 데이터는 사라져요.`,
        '불러오기',
      );
      if (!ok) return;
      importBackup(data);
      setStoreName(data.settings.storeName);
      successHaptic();
      setNotice({ kind: 'ok', text: '백업을 불러왔어요.' });
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : '백업을 불러오지 못했어요.' });
    } finally {
      setBusy(false);
    }
  };

  const onSeed = async () => {
    if (workerCount > 0) {
      const ok = await confirmAsync('예시 데이터로 바꿀까요?', '지금 근무자와 근무표가 예시로 바뀌어요.', '바꾸기');
      if (!ok) return;
    }
    seedSample();
    setNotice({ kind: 'ok', text: '예시 데이터를 넣었어요.' });
  };

  const onReset = async () => {
    const ok = await confirmAsync('모든 데이터를 지울까요?', '근무자·근무표·카드·행사가 모두 사라져요. 되돌릴 수 없어요.');
    if (!ok) return;
    resetAll();
    setStoreName(useAppStore.getState().settings.storeName);
    setNotice({ kind: 'ok', text: '모두 지웠어요.' });
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="title">설정</AppText>

        <Section title="매장">
          <TextField
            label="매장명 (공유 이미지 제목에 들어가요)"
            value={storeName}
            onChangeText={setStoreName}
            onBlur={commitStoreName}
            onSubmitEditing={commitStoreName}
            returnKeyType="done"
            maxLength={20}
          />
        </Section>

        <Section title="시간 표기">
          <SegmentedControl options={TIME_STYLE_OPTIONS} value={settings.timeStyle} onChange={(v: TimeStyle) => updateSettings({ timeStyle: v })} />
          <AppText variant="caption" color={colors.text.secondary}>
            근무표와 공유 이미지에 같이 적용돼요.
          </AppText>
        </Section>

        <Section title="백업">
          <AppText variant="caption" color={colors.text.secondary}>
            데이터는 이 폰에만 저장돼요. 폰을 바꾸거나 앱을 지우기 전에 백업 파일을 만들어 두세요.
          </AppText>
          <View style={styles.buttonRow}>
            <Button title="백업 파일 내보내기" variant="primary" onPress={onExport} disabled={busy} style={styles.flex} />
            <Button title="가져오기" variant="secondary" onPress={onImport} disabled={busy} style={styles.flex} />
          </View>
        </Section>

        <Section title="데이터">
          <View style={styles.buttonRow}>
            <Button title="예시 데이터 넣기" variant="secondary" onPress={onSeed} style={styles.flex} />
            <Button title="모두 지우기" variant="danger" onPress={onReset} style={styles.flex} />
          </View>
        </Section>

        {notice ? (
          <View style={[styles.notice, notice.kind === 'error' && styles.noticeError]}>
            <AppText variant="caption" color={notice.kind === 'error' ? colors.feedback.danger : colors.text.primary}>
              {notice.text}
            </AppText>
          </View>
        ) : null}

        <AppText variant="caption" color={colors.text.tertiary} style={styles.version}>
          퀵캘린더 v{version}
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  card: { backgroundColor: colors.surface.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.surface.border, padding: spacing.lg, gap: spacing.md },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  notice: { backgroundColor: colors.brand.yellowPale, borderRadius: radius.md, padding: spacing.md },
  noticeError: { backgroundColor: '#FDE2E2' },
  version: { textAlign: 'center', marginTop: spacing.md },
});
