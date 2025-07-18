import React from "react";

const HeroSection = () => (
  <section className="w-screen bg-white py-0 md:py-0 pt-[80px] md:mt-12 mt-8 relative left-1/2 right-1/2 -mx-[50vw]" style={{ left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
    <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch min-h-[480px] gap-0 md:gap-4 px-0">
      {/* 왼쪽: 동영상 */}
      <div className="flex-[0_0_70%] min-w-0 flex items-end md:items-center justify-center relative overflow-hidden bg-white rounded-3xl" style={{height: '480px'}}>
        <video
          src="/250402_dongdaemun_compressed.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-3xl"
          style={{ background: '#000' }}
        />
        <div className="absolute left-0 bottom-0 bg-white/80 px-6 py-4 rounded-tr-2xl md:rounded-tr-none md:rounded-br-2xl md:rounded-tl-2xl md:rounded-bl-none shadow md:hidden">
          <div className="text-lg font-bold text-gray-900">디자이너와 봉제공장과의 연결고리,<br/>동고리</div>
        </div>
      </div>
      {/* 오른쪽: 텍스트/버튼 */}
      <div className="flex-[0_0_30%] min-w-0 flex flex-col justify-center bg-[#35383B] text-white px-8 md:px-12 py-10 md:py-0 rounded-3xl" style={{height: '480px'}}>
        <div className="max-w-[420px] mx-auto flex flex-col gap-6">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold leading-tight mb-2">
              <span className="text-white">최고의 디자이너</span>에게<br/>
              <span className="text-white">최고의 봉제공장과 기술자</span>
            </div>
            <div className="text-base md:text-lg text-gray-200 mt-4">
              최상의 퀄리티, 최상의 기술력을 보유한<br/>
              봉제공장이 함께하는 동고리와 함께 여러분의 꿈을 펼쳐보세요.
            </div>
          </div>
          <button className="mt-2 bg-[#52565A] hover:bg-[#44474A] text-white px-6 py-3 rounded-full font-bold text-base flex items-center gap-2 w-fit transition">
            봉제공장 바로찾기
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white ml-2">
              <span className="text-base text-[#35383B]">→</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;