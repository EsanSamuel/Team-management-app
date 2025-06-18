// app/dashboard/[workspaceId]/layout.tsx
import { WorkspaceProvider } from "@/context/workspaceContext";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
