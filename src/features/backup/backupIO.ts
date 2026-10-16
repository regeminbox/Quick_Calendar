import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** 백업 JSON을 파일로 써서 공유 시트(파일 저장·카톡·드라이브 등)로 넘긴다 */
export async function exportBackupFile(json: string, fileName: string): Promise<void> {
  if (Platform.OS === 'web') {
    webDownload(json, fileName);
    return;
  }
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  await file.write(json);
  if (!(await Sharing.isAvailableAsync())) throw new Error('이 기기에서는 공유를 사용할 수 없어요.');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: '백업 파일 저장 / 공유', UTI: 'public.json' });
}

/** 파일 선택기에서 백업 파일을 골라 텍스트로 읽는다. 취소하면 null */
export async function pickBackupText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  if (Platform.OS === 'web') {
    return asset.file ? await asset.file.text() : null;
  }
  return await new File(asset.uri).text();
}

interface WebGlobals {
  Blob?: new (parts: string[], options: { type: string }) => unknown;
  URL?: { createObjectURL: (blob: unknown) => string; revokeObjectURL: (url: string) => void };
  document?: { createElement: (tag: string) => { href: string; download: string; click: () => void } };
}

function webDownload(text: string, fileName: string) {
  const g = globalThis as unknown as WebGlobals;
  if (!g.Blob || !g.URL || !g.document) throw new Error('이 브라우저에서는 파일 저장을 지원하지 않아요.');
  const url = g.URL.createObjectURL(new g.Blob([text], { type: 'application/json' }));
  const anchor = g.document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => g.URL?.revokeObjectURL(url), 1000);
}
