import { ShieldHalf, Zap } from "lucide-react";
import React from "react";
import Authform from "./(auth)/Authform";

const page = () => {
  return (
    <div className="bg-neutral-50 w-[100vw] h-[100vh] xl:px-10 px-5 flex flex-col items-center justify-center py-5 ">
      <div className="flex flex-col items-center justify-center">
        <div className="flex gap-2 items-center mb-4">
          <button className="bg-black text-white rounded-full p-1">
            <Zap />
          </button>{" "}
          <h1 className="">Sync Corp.</h1>
        </div>
        <Authform />
      </div>
    </div>
  );
};

export default page;
