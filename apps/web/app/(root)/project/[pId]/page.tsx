import ProjectView from "@/components/project/project-view";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { redirect } from "next/navigation";

const page = async ({ params }: { params: Promise<{ pId: string }> }) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const project = await db.project.findUnique({
    where: {
      id: (await params).pId,
    },
  });

  if (!project) {
    redirect("/");
  }

  return <ProjectView project={project} />;
};

export default page;
