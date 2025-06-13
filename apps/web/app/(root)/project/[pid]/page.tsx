import ProjectViewContainer from "@/components/project/project-view-container";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { redirect } from "next/navigation";

const page = async ({ params }: { params: Promise<{ pid: string }> }) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const project = await db.project.findUnique({
    where: {
      id: (await params).pid,
    },
  });

  if (!project) {
    redirect("/");
  }

  return <ProjectViewContainer project={project} />;
};

export default page;
