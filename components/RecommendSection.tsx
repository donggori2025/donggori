import React from "react";
import Image from "next/image";

const cards = [
  {
    label: "AI로 추천 받기",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "카테고리로 직접 찾기",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
  },
];

const RecommendSection = () => (
  <section className="w-full bg-neutral-900 py-16">
    <div className="max-w-[1200px] mx-auto px-4 flex flex-col items-center">
      <h2 className="text-xl md:text-2xl font-extrabold text-white text-center mb-2">지금 동고리에서</h2>
      <p className="text-lg text-gray-200 text-center mb-8">최상의 품질의 봉제공장을 만나보세요!</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="relative rounded-2xl overflow-hidden h-56 flex items-center justify-center group shadow-lg cursor-pointer"
          >
            <Image
              src={card.image}
              alt={card.label}
              width={112}
              height={112}
              className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 z-10" />
            <span className="relative z-20 text-white text-2xl font-bold drop-shadow-lg text-center">
              {card.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RecommendSection; 