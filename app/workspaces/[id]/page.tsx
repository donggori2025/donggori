"use client";

import { use, useEffect } from "react";
import { WorkspaceDrive } from "@/components/workspace-drive";
import { useWorkspace } from "@/lib/store";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { workspaces, setWorkspace } = useWorkspace();

  useEffect(() => {
    if (workspaces.some((w) => w.id === id)) setWorkspace(id);
  }, [id, workspaces, setWorkspace]);

  return <WorkspaceDrive />;
}
