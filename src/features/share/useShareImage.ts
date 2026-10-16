import * as Sharing from 'expo-sharing';
import { type ComponentRef, useCallback, useRef, useState } from 'react';
import { Platform, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { successHaptic } from '@/lib/haptics';

export const SHARE_PIXEL_SCALE = 3;

/** ShareCard를 PNG로 캡처해 OS 공유 시트(카카오톡 포함)로 넘긴다 */
export function useShareImage(cardHeight: number, cardWidth: number) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = useCallback(async () => {
    if (!ref.current || busy) return;
    if (Platform.OS === 'web') {
      setError('웹 미리보기에서는 공유가 지원되지 않아요. 폰에서 이용해 주세요.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const uri = await captureRef(ref, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: Math.round(cardWidth * SHARE_PIXEL_SCALE),
        height: Math.round(cardHeight * SHARE_PIXEL_SCALE),
      });
      if (!(await Sharing.isAvailableAsync())) {
        setError('이 기기에서는 공유 기능을 사용할 수 없어요.');
        return;
      }
      successHaptic();
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: '근무표 보내기', UTI: 'public.png' });
    } catch (e) {
      setError(e instanceof Error ? e.message : '이미지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  }, [busy, cardHeight, cardWidth]);

  return { ref, share, busy, error };
}
