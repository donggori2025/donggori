import React from "react";

const HeroSection = () => (
  <section className="w-full relative h-[420px] flex items-center justify-center overflow-hidden">
    {/* 배경 동영상 */}
    <video
      src="/250402_동대문구 봄꽃 패션쇼 영상.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-0"
    />
    {/* 어두운 오버레이 */}
    <div className="absolute inset-0 bg-black/60 z-10" />
    {/* 중앙 텍스트 */}
    <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-[48px] font-extrabold text-white mb-4 drop-shadow-lg">
        동고리는<br />
        동대문구 지역의 패션봉제공장과 디자이너들을 연결하는<br />
        패션봉제 올인원 플랫폼 입니다.
      </h1>
    </div>
  </section>
);

export default HeroSection;