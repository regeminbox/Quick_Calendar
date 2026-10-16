// 웹 데모(단일 HTML)용 엔트리.
// 어느 경로에 호스팅돼도 '/'(근무표)에서 시작하고 브라우저 URL을 바꾸지 않는다.
import '@expo/metro-runtime';
import { ctx } from 'expo-router/_ctx';
import { ExpoRoot } from 'expo-router';
import Head from 'expo-router/head';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { Platform } from 'react-native';

function App() {
  const demo = Platform.OS === 'web';
  return (
    <Head.Provider>
      <ExpoRoot context={ctx} location={demo ? '/' : undefined} linking={demo ? { enabled: false } : undefined} />
    </Head.Provider>
  );
}

renderRootComponent(App);
