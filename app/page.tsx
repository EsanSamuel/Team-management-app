import { ShieldHalf, Zap } from "lucide-react";
import React from "react";
import Authform from "./(auth)/Authform";

const page = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-2 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </div>
          Sync Corp.
        </a>
        <Authform />
      </div>
    </div>
  );
};

export default page;
