// Jest에서는 AsyncStorage 네이티브 모듈이 없으므로 공식 메모리 mock을 사용한다
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
