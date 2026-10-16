import { Alert, Platform } from 'react-native';

/** 삭제 등 확인이 필요한 동작. 웹은 window.confirm, 네이티브는 Alert */
export function confirmAsync(title: string, message?: string, confirmLabel = '삭제'): Promise<boolean> {
  if (Platform.OS === 'web') {
    const g = globalThis as unknown as { confirm?: (text: string) => boolean };
    return Promise.resolve(g.confirm ? g.confirm(message ? `${title}\n${message}` : title) : true);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: '취소', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
