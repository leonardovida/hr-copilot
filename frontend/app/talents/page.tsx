import { Metadata } from "next";
import Image from "next/image";

import { MainNav } from "@/components/shared/nav-main";
import { UserNav } from "@/components/shared/nav-user";
import { ModeToggle } from "@/components/shared/nav-theme-toogle";

export const metadata: Metadata = {
  title: "Talent Agent",
  description: "by Data Build Company.",
};

export default function DashboardPage() {
  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <Image
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">Talent Page</div>
      </div>
    </>
  );
}
