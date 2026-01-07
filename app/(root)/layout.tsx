import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
const layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return redirect("/sign-in");
  }
  return (
    <main className="flex h-screen">
      <Sidebar
        fullName={currentUser.fullName}
        avatar={currentUser.avatar}
        email={currentUser.email}
      />
      <section className="flex flex-1 h-full flex-col">
        <MobileNavigation {...currentUser} />
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  );
};

export default layout;
