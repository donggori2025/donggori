"use client";
import { useUser } from "@clerk/nextjs";
import { factories } from "@/lib/factories";
import { matchRequests } from "@/lib/matchRequests";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import MyPageLayout from "@/components/MyPageLayout";
import InquiryList from "@/components/InquiryList";

export default function MyPage() {
  return (
    <MyPageLayout>
      <div className="text-center text-gray-500 py-20 text-lg">좌측 메뉴에서 원하는 항목을 선택하세요.</div>
    </MyPageLayout>
  );
} 