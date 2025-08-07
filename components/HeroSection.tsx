import React from "react";

const HeroSection = () => (
  <section className="w-screen bg-white py-0 relative left-1/2 right-1/2 -mx-[50vw]" style={{ left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
    <div className="w-full mx-auto flex flex-col items-stretch h-[50vh] sm:h-[60vh] gap-0 px-0">
      {/* 동영상 - 전체 너비 */}
      <div className="flex-1 min-w-0 flex items-end justify-center relative overflow-hidden bg-white h-full">
        <video
          src="https://res.cloudinary.com/dvvqaywkd/video/upload/v1752911173/250402_dongdaemun_compressed_50mb_tcbcpm.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute left-0 bottom-0 bg-white/90 sm:bg-white/80 px-3 sm:px-4 py-2 sm:py-3 rounded-tr-xl sm:rounded-tr-2xl shadow md:hidden">
          <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">디자이너와 봉제공장과의 연결고리,<br/>동고리</div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;