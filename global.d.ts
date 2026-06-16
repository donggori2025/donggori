export {};

declare global {
  interface Window {
    // 네이버 지도 스크립트가 런타임에 주입합니다.
    // 타입 패키지를 쓰지 않는 현재 구조에서는 any로 둡니다.
    naver?: any;
  }
}

