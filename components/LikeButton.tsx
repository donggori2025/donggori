"use client";

import { useEffect, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  courseId: string;
}

export default function LikeButton({ courseId }: LikeButtonProps) {
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // 좋아요 상태 및 개수 불러오기
  useEffect(() => {
    if (!user) return;
    const fetchLike = async () => {
      const { data: likeData } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();
      setLiked(!!likeData);
    };
    fetchLike();
  }, [user, courseId]);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("course_id", courseId);
      setLikeCount(count || 0);
    };
    fetchCount();
  }, [courseId, liked]);

  const handleLike = async () => {
    if (!user) return;
    startTransition(async () => {
      if (liked) {
        // 좋아요 취소
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("course_id", courseId);
        setLiked(false);
      } else {
        // 좋아요 추가
        await supabase
          .from("likes")
          .insert({ user_id: user.id, course_id: courseId });
        setLiked(true);
      }
    });
  };

  if (!user) {
    return (
      <Button variant="ghost" disabled title="로그인 후 이용 가능">
        <Heart className="w-5 h-5 mr-1" />
        {likeCount}
      </Button>
    );
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      onClick={handleLike}
      disabled={isPending}
      aria-pressed={liked}
    >
      <Heart className={`w-5 h-5 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
      {likeCount}
    </Button>
  );
} 