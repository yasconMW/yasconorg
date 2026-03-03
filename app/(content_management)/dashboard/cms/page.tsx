import { redirect } from "next/navigation";
import { getCurrentDashboardUser } from "@/lib/cms/auth";
import CmsClient from "./CmsClient";

export default async function CmsDashboardPage() {
  const user = await getCurrentDashboardUser();
  if (!user) {
    redirect("/dashboard/login");
  }

  return <CmsClient initialUser={user} />;
}

