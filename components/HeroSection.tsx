import React from "react";

const HeroSection = () => (
  <section className="w-screen bg-white py-0 md:py-0 relative left-1/2 right-1/2 -mx-[50vw]" style={{ left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
    <div className="w-full mx-auto flex flex-col md:flex-row items-stretch min-h-[480px] gap-0 md:gap-4 px-0">
      {/* 동영상 - 전체 너비 */}
      <div className="flex-1 min-w-0 flex items-end md:items-center justify-center relative overflow-hidden bg-white" style={{height: '480px'}}>
        <video
          src="https://res.cloudinary.com/dvvqaywkd/video/upload/v1752911173/250402_dongdaemun_compressed_50mb_tcbcpm.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute left-0 bottom-0 bg-white/80 px-6 py-4 rounded-tr-2xl md:rounded-tr-none md:rounded-br-2xl md:rounded-tl-2xl md:rounded-bl-none shadow md:hidden">
          <div className="text-lg font-bold text-gray-900">디자이너와 봉제공장과의 연결고리,<br/>동고리</div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;