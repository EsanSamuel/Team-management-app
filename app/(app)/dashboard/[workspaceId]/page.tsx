import DashboardPage from "@/components/DashboardPage";
import { getUser } from "@/lib/actions/user.service";

interface IParams {
  params: Promise<{ workspaceId: string }>;
}

const page = async ({ params }: IParams) => {
  const workspaceId = (await params).workspaceId;
  const user = await getUser();

  return <DashboardPage workspaceId={workspaceId} user={user!} />;
};

export default page;
