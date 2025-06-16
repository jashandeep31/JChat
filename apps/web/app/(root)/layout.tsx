import React from "react";
import { Provider } from "./provider";
import { cookies } from "next/headers";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <div>
      <Provider defaultOpen={defaultOpen}>{children}</Provider>
    </div>
  );
};

export default Layout;
