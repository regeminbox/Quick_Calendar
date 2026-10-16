import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { confirmAsync } from '@/lib/confirm';
import { successHaptic } from '@/lib/haptics';
import type { Worker } from '@/store/types';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme/tokens';

export type WorkerEditorState = { mode: 'new' } | { mode: 'edit'; worker: Worker } | null;

export interface WorkerEditorModalProps {
  state: WorkerEditorState;
  onClose: () => void;
}

export function WorkerEditorModal({ state, onClose }: WorkerEditorModalProps) {
  return (
    <Sheet visible={!!state} onClose={onClose} title={state?.mode === 'edit' ? '근무자 수정' : '근무자 추가'}>
      {state ? <WorkerForm key={state.mode === 'edit' ? state.worker.id : 'new'} state={state} onClose={onClose} /> : null}
    </Sheet>
  );
}

function WorkerForm({ state, onClose }: { state: NonNullable<WorkerEditorState>; onClose: () => void }) {
  const addWorker = useAppStore((s) => s.addWorker);
  const renameWorker = useAppStore((s) => s.renameWorker);
  const setWorkerActive = useAppStore((s) => s.setWorkerActive);
  const removeWorker = useAppStore((s) => s.removeWorker);
  const worker = state.mode === 'edit' ? state.worker : null;

  const [name, setName] = useState(worker?.name ?? '');
  const [active, setActive] = useState(worker?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const text = name.trim();
    if (!text) {
      setError('이름을 입력해 주세요');
      return;
    }
    if (worker) {
      renameWorker(worker.id, text);
      if (worker.active !== active) setWorkerActive(worker.id, active);
    } else {
      addWorker(text);
    }
    successHaptic();
    onClose();
  };

  const remove = async () => {
    if (!worker) return;
    const ok = await confirmAsync(`${worker.name} 님을 삭제할까요?`, '이 근무자의 근무표 칸도 함께 지워져요.');
    if (!ok) return;
    removeWorker(worker.id);
    onClose();
  };

  return (
    <>
      <TextField
        label="이름"
        value={name}
        onChangeText={(t) => {
          setName(t);
          setError(null);
        }}
        placeholder="예: 홍길동"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={save}
        error={error}
      />
      {worker ? (
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <AppText>근무표에 표시</AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              끄면 표에서 숨겨지고 기록은 남아요
            </AppText>
          </View>
          <Switch value={active} onValueChange={setActive} trackColor={{ true: colors.brand.yellow, false: colors.surface.border }} thumbColor={colors.surface.card} />
        </View>
      ) : null}
      <View style={styles.buttons}>
        {worker ? <Button title="삭제" variant="danger" onPress={remove} /> : null}
        <View style={styles.spacer} />
        <Button title="취소" variant="secondary" onPress={onClose} />
        <Button title={worker ? '저장' : '추가'} variant="primary" onPress={save} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  switchText: { flex: 1, gap: 2 },
  buttons: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  spacer: { flex: 1 },
});
