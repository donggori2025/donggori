import MyPageLayout from "@/components/MyPageLayout";
import { UserProfile } from "@clerk/nextjs";

export default function MyPageProfile() {
  return (
    <MyPageLayout>
      {/* Clerk의 UserProfile 컴포넌트를 인라인으로 렌더링 */}
      <div className="max-w-xl mx-auto py-10">
        <UserProfile appearance={{ elements: { card: 'shadow-none border-none' } }} />
      </div>
    </MyPageLayout>
  );
} 