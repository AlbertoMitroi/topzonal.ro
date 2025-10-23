import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex justify-center py-12">
      <UserProfile path="/profile" routing="path" />
    </div>
  );
}
