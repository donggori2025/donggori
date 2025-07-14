import React from "react";

const HeroSection = () => (
  <section className="w-full relative h-[600px] flex items-center justify-center overflow-hidden">
    {/* 배경 동영상 */}
    <video
      src="/250402_동대문구 봄꽃 패션쇼 영상.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-0"
    />
  </section>
);

export default HeroSection;