"use client";
import { createContext, CSSProperties, useContext, useState } from "react";
import { ClipLoader } from "react-spinners";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const WorkspaceContext = createContext<any>(null);

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const loader = () => {
    return (
      <ClipLoader
        color="oklch(0.55 0.02 264)"
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    );
  };

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId ,loader}}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
