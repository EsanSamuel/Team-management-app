import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Appsidebar";
import { Navbar } from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import { getUser } from "@/lib/actions/user.service";
import { getWorkSpace } from "@/lib/actions/workspace.service";
import { WorkspaceProvider } from "@/context/workspaceContext";
import { authorizeRole } from "@/lib/actions/member.service";
import { Toaster } from "@/components/ui/sonner";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const workspace = (await getWorkSpace()) as any;
  const userWorkspace = workspace?.filter((item: any) =>
    item?.Member?.some((member: any) => member?.user?.id === user?.id)
  );
  console.log("Your workspace:", userWorkspace);
  if (!user) redirect("/");
  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <div className="flex flex-row w-full">
          <AppSidebar user={user!} workspace={userWorkspace as any} />
          <main className="w-[100vw] ">
            <div className="flex p-2 w-[100%] border-b top-0 z-50 bg-white dark:bg-[#09090b] sticky ">
              <div className="flex gap-2 items-center w-full ">
                <SidebarTrigger className="gap-1" />
                <Separator orientation="vertical" className="h-5 mr-1" />
                <Navbar />
              </div>
            </div>
            {children}
          </main>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
