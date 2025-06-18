"use client"
import { createContext, useContext, useState } from "react";

const WorkspaceContext = createContext<any>(null);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
