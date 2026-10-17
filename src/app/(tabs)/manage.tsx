import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CardEditorModal, type CardEditorState } from '@/features/cards/CardEditorModal';
import { WorkerEditorModal, type WorkerEditorState } from '@/features/workers/WorkerEditorModal';
import { formatTimeRange } from '@/lib/date';
import { tapHaptic } from '@/lib/haptics';
import { useAllWorkers, useSettings, useStatusCards, useTimeCards } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme/tokens';

type Tab = 'workers' | 'cards';
const TABS = [
  { key: 'workers', label: '근무자' },
  { key: 'cards', label: '카드' },
] as const;

export default function ManageScreen() {
  const { tab: initialTab, add } = useLocalSearchParams<{ tab?: string; add?: string }>();
  const [tab, setTab] = useState<Tab>(initialTab === 'cards' ? 'cards' : 'workers');
  const [workerEditor, setWorkerEditor] = useState<WorkerEditorState>(
    add === '1' ? { mode: 'new' } : null,
  );
  const [cardEditor, setCardEditor] = useState<CardEditorState>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <AppText variant="title">관리</AppText>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </View>
      {tab === 'workers' ? (
        <WorkersPanel
          onAdd={() => setWorkerEditor({ mode: 'new' })}
          onEdit={(worker) => setWorkerEditor({ mode: 'edit', worker })}
        />
      ) : (
        <CardsPanel
          onNew={(kind) => setCardEditor({ mode: 'new', kind })}
          onEdit={(card) => setCardEditor({ mode: 'edit', card })}
        />
      )}
      <WorkerEditorModal state={workerEditor} onClose={() => setWorkerEditor(null)} />
      <CardEditorModal state={cardEditor} onClose={() => setCardEditor(null)} />
    </SafeAreaView>
  );
}

function WorkersPanel({
  onAdd,
  onEdit,
}: {
  onAdd: () => void;
  onEdit: (worker: ReturnType<typeof useAllWorkers>[number]) => void;
}) {
  const workers = useAllWorkers();
  const moveWorker = useAppStore((s) => s.moveWorker);
  return (
    <ScrollView contentContainerStyle={styles.panel} keyboardShouldPersistTaps="handled">
      <Button title="근무자 추가" variant="primary" icon={<PlusIcon size={16} />} onPress={onAdd} />
      {workers.length === 0 ? (
        <AppText variant="caption" color={colors.text.secondary} style={styles.hint}>
          아직 근무자가 없어요. 추가하면 근무표에 행이 생겨요.
        </AppText>
      ) : (
        <View style={styles.list}>
          {workers.map((worker, index) => (
            <Animated.View
              key={worker.id}
              layout={LinearTransition.springify().damping(20).stiffness(220)}>
              <Pressable
                onPress={() => onEdit(worker)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.row,
                  index === workers.length - 1 && styles.rowLast,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.rowText}>
                  <AppText
                    color={worker.active ? colors.text.primary : colors.text.tertiary}
                    numberOfLines={1}>
                    {worker.name}
                  </AppText>
                  {!worker.active ? (
                    <View style={styles.badge}>
                      <AppText variant="caption" color={colors.text.secondary}>
                        숨김
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <View style={styles.rowActions}>
                  <IconButton
                    size={32}
                    disabled={index === 0}
                    accessibilityLabel="위로"
                    onPress={() => {
                      moveWorker(worker.id, -1);
                      tapHaptic();
                    }}>
                    <ArrowUpIcon size={16} />
                  </IconButton>
                  <IconButton
                    size={32}
                    disabled={index === workers.length - 1}
                    accessibilityLabel="아래로"
                    onPress={() => {
                      moveWorker(worker.id, 1);
                      tapHaptic();
                    }}>
                    <ArrowDownIcon size={16} />
                  </IconButton>
                  <IconButton
                    size={32}
                    filled={false}
                    accessibilityLabel="수정"
                    onPress={() => onEdit(worker)}>
                    <PencilIcon size={16} color={colors.text.secondary} />
                  </IconButton>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}
      <AppText variant="caption" color={colors.text.tertiary} style={styles.hint}>
        순서는 근무표 행 순서예요. 이름을 누르면 수정·숨김·삭제할 수 있어요.
      </AppText>
    </ScrollView>
  );
}

function CardsPanel({
  onNew,
  onEdit,
}: {
  onNew: (kind: 'time' | 'status') => void;
  onEdit: (card: ReturnType<typeof useTimeCards>[number]) => void;
}) {
  const timeCards = useTimeCards();
  const statusCards = useStatusCards();
  const { timeStyle } = useSettings();
  return (
    <ScrollView contentContainerStyle={styles.panel}>
      <View style={styles.section}>
        <AppText variant="heading">출근 시간</AppText>
        <View style={styles.chips}>
          {timeCards.map((card) => (
            <Animated.View
              key={card.id}
              entering={FadeIn.duration(180)}
              layout={LinearTransition.springify().damping(18)}>
              <Chip
                label={formatTimeRange(card.time ?? card.label, card.endTime, timeStyle)}
                onPress={() => onEdit(card)}
              />
            </Animated.View>
          ))}
          <Chip label="추가" dashed icon={<PlusIcon size={14} />} onPress={() => onNew('time')} />
        </View>
      </View>
      <View style={styles.section}>
        <AppText variant="heading">상태 · 내 카드</AppText>
        <View style={styles.chips}>
          {statusCards.map((card) => (
            <Animated.View
              key={card.id}
              entering={FadeIn.duration(180)}
              layout={LinearTransition.springify().damping(18)}>
              <Chip
                label={card.label}
                bg={card.bg}
                bg2={card.bg2}
                fg={card.fg}
                onPress={() => onEdit(card)}
              />
            </Animated.View>
          ))}
          <Chip
            label="새 카드"
            dashed
            icon={<PlusIcon size={14} />}
            onPress={() => onNew('status')}
          />
        </View>
      </View>
      <AppText variant="caption" color={colors.text.tertiary} style={styles.hint}>
        카드를 누르면 이름·색을 바꾸거나 삭제할 수 있어요. 휴무·정일·연차 외에 반차, 교육, 오픈 같은
        카드를 만들어 보세요.
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  panel: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  list: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  rowLast: { borderBottomWidth: 0 },
  pressed: { backgroundColor: colors.surface.bg },
  rowText: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: {
    backgroundColor: colors.surface.muted,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { lineHeight: 18 },
});
