import ProfileView from "@/components/profile/profile-view";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <ProfileView />
    </div>
  );
};

export default page;
