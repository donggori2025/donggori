"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import courses from '../lib/courses';

// 메인 페이지 컴포넌트
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 메인 배너 - motion.section + 어두운 오버레이 */}
      <motion.section
        className="relative w-full h-[420px] flex items-center justify-center bg-white overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* 배경 이미지는 section 전체를 absolute로 덮음 */}
        <img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1920&q=80"
          alt="봉제공장 배경"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
          style={{ zIndex: 1 }}
          draggable={false}
        />
        {/* 어두운 투명 오버레이 */}
        <div className="absolute inset-0 bg-black/40" style={{ zIndex: 2 }} />
        {/* 텍스트는 중앙 1200px로 제한, z-10 */}
        <div className="relative z-10 w-full">
          <div className="max-w-[1200px] mx-auto px-4 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">동고리<br />동대문구 지역의 패션봉제공장과 디자이너들을 연결하는<br />패션봉제 올인원 플랫폼입니다.</h1>
          </div>
        </div>
      </motion.section>

      {/* 센터 소개 섹션 - motion.section */}
      <motion.section
        className="w-full bg-white px-0 py-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="max-w-[1200px] mx-auto w-full px-4">
          {/* 센터소개 상단 설명 텍스트 - 매칭절차 상단과 폰트 크기 통일 (text-2xl md:text-3xl font-bold) */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              동대문구 패션봉제복합지원센터는
            </h2>
            <div className="text-2xl md:text-3xl font-semibold text-gray-400 mb-2">
              <span className="underline">스마트 제조장비</span>, <span className="underline">공용작업장</span>, <span className="underline">제품개발</span>, <span className="underline">일감연계</span> 지원을 통해
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-gray-400">
              소공인 혁신시간을 <span className="text-gray-500">조성</span>합니다.
            </div>
          </div>
          {/* 4개 카드 - flex/grid로 가로 배치, 반응형 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 min-h-[400px]">
            {/* 카드 1 */}
            <div className="flex flex-col items-center bg-gray-100 rounded-2xl py-16 shadow-sm h-full justify-between">
              <div className="w-52 h-52 rounded-full bg-gray-300 mb-6 flex items-center justify-center">
                {/* 실제 이미지는 추후 교체 */}
              </div>
              <div className="text-xl font-medium text-gray-700">스마트 제조장비</div>
            </div>
            {/* 카드 2 */}
            <div className="flex flex-col items-center bg-gray-100 rounded-2xl py-16 shadow-sm h-full justify-between">
              <div className="w-52 h-52 rounded-full bg-gray-300 mb-6 flex items-center justify-center"></div>
              <div className="text-xl font-medium text-gray-700">공용작업장</div>
            </div>
            {/* 카드 3 */}
            <div className="flex flex-col items-center bg-gray-100 rounded-2xl py-16 shadow-sm h-full justify-between">
              <div className="w-52 h-52 rounded-full bg-gray-300 mb-6 flex items-center justify-center"></div>
              <div className="text-xl font-medium text-gray-700">제품개발</div>
            </div>
            {/* 카드 4 */}
            <div className="flex flex-col items-center bg-gray-100 rounded-2xl py-16 shadow-sm h-full justify-between">
              <div className="w-52 h-52 rounded-full bg-gray-300 mb-6 flex items-center justify-center"></div>
              <div className="text-xl font-medium text-gray-700">일감연계</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 매칭절차 섹션 - motion.section */}
      <motion.section
        className="w-full bg-white py-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="max-w-[1200px] mx-auto w-full px-4">
          {/* 매칭절차 상단 설명 - 센터소개와 폰트 크기 통일 (text-2xl md:text-3xl font-bold) */}
          <div className="flex flex-col items-center justify-center mb-10 md:mb-16">
            <div className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">동고리에서는</div>
            <div className="flex flex-row justify-center items-center gap-2">
              <div className="bg-gray-800 text-white text-base font-bold rounded-lg px-3 py-1 md:text-2xl md:px-4 md:py-2 text-center flex-none">5단계로</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-400 flex-none">봉제공장 매칭이 이루어져요!</div>
            </div>
          </div>
          {/* 5단계 카드 - 좌우 번갈아 배치, 반응형 */}
          <div className="flex flex-col gap-12">
            {/* 단계별 데이터 */}
            {[
              { key: 1, left: true,  title: "원하는 의류 넣고\n의뢰서 작성하면", strong: "매칭 준비 끝." },
              { key: 2, left: false, title: "봉제공장에서\n확인하고 연락오면", strong: "제작 준비 끝." },
              { key: 3, left: true,  title: "원하는 의류 넣고\n의뢰서 작성하면", strong: "매칭 준비 끝." },
              { key: 4, left: false, title: "봉제공장에서\n확인하고 연락오면", strong: "제작 준비 끝." },
              { key: 5, left: true,  title: "원하는 의류 넣고\n의뢰서 작성하면", strong: "매칭 준비 끝." },
            ].map((step, idx) => (
              <div
                key={step.key}
                className={`flex flex-col md:flex-row items-center justify-between gap-6 ${step.left ? '' : 'md:flex-row-reverse'}`}
                style={{ minHeight: 220 }}
              >
                {/* 텍스트 */}
                <div className={`flex-1 ${step.left ? 'text-left md:text-left' : 'text-left md:text-right'}`}>
                  <div className="text-gray-400 text-2xl md:text-3xl font-semibold mb-2 whitespace-pre-line">{step.title}</div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{step.strong}</div>
                </div>
                {/* 카드(이미지 자리) */}
                <div className="w-[416px] h-[250px] bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA: AI 추천/카테고리 찾기 - motion.section */}
      <motion.section
        className="w-full bg-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="max-w-[1200px] mx-auto w-full py-12 px-4">
          <h3 className="text-center text-xl font-bold mb-6">지금 동고리에서<br />최상의 품질의 봉제공장을 만나보세요!</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/factories?ai=1">
              <Card className="bg-gray-800 hover:bg-gray-700 transition cursor-pointer">
                <CardContent className="flex flex-col items-center py-8">
                  <Image src="/file.svg" alt="AI 추천" width={48} height={48} className="mb-3" />
                  <span className="text-white font-semibold">AI로 추천 받기</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/factories">
              <Card className="bg-gray-800 hover:bg-gray-700 transition cursor-pointer">
                <CardContent className="flex flex-col items-center py-8">
                  <Image src="/globe.svg" alt="카테고리 찾기" width={48} height={48} className="mb-3" />
                  <span className="text-white font-semibold">카테고리로 직접 찾기</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 푸터 - Figma 스타일, motion.footer */}
      <motion.footer
        className="w-full bg-white border-t border-gray-100 mt-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="max-w-[1200px] mx-auto w-full px-4 py-8 flex flex-col items-center gap-6">
          {/* 상단 네비게이션 */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-4">
            {/* 좌측 메뉴 */}
            <nav className="flex flex-row items-center gap-4 text-sm text-gray-700 font-medium">
              <a href="/factories" className="hover:underline">봉제공장 찾기</a>
              <span className="text-gray-300">|</span>
              <a href="/matching" className="hover:underline">AI 매칭</a>
              <span className="text-gray-300">|</span>
              <a href="/notices" className="hover:underline">공지사항</a>
            </nav>
            {/* 우측 메뉴 */}
            <nav className="flex flex-row items-center gap-4 text-sm text-gray-500">
              <a href="#" className="hover:underline">고객센터</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:underline">제휴문의</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:underline">이용약관</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:underline">개인정보처리방침</a>
            </nav>
          </div>
          {/* 중앙: 로고, 서비스명, 협회명 등 안내 */}
          <div className="flex flex-col items-center gap-2 py-2">
            <img src="/logo_0624.svg" alt="동고리 로고" className="h-8 mb-1" />
            <div className="text-lg font-bold text-gray-800 mb-1">동고리</div>
            <div className="text-xs text-gray-500 text-center">
              (사)DDM패션봉제산업연합회 &nbsp;|&nbsp; (사)동대문패션봉제발전산업협의회 &nbsp;|&nbsp; (사)동대문구의류봉제산업연합회
            </div>
          </div>
          {/* 하단: 저작권 */}
          <div className="text-xs text-gray-400 text-center pt-2">
            &copy; {new Date().getFullYear()} donggori. All rights reserved.
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
