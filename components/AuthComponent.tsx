"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { FieldValues, Form, SubmitHandler, useForm } from "react-hook-form";
import { registerUser } from "@/lib/actions/user.service";
import { redirect, useRouter } from "next/navigation";

type IAuthState = "LOGIN" | "SIGNUP";

const Authform = ({ setShowAuthModal }: { setShowAuthModal: any }) => {
  const router = useRouter();
  const { status } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  const [authState, setAuthState] = useState<IAuthState>("LOGIN");

  const toogleAuthState = () => {
    if (authState === "LOGIN") {
      setAuthState("SIGNUP");
    } else {
      setAuthState("LOGIN");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      setShowAuthModal(false);
    }
  }, [status, router]);

  const handleAuth: SubmitHandler<FieldValues> = async ({
    username,
    email,
    password,
  }) => {
    try {
      if (authState === "SIGNUP") {
        const register = await registerUser({ username, email, password });
        console.log(register);
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.ok) {
          console.log("signIn successful!");
        } else {
          console.log("signIn failed", res);
        }
      } else if (authState === "LOGIN") {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.ok) {
          console.log("signIn successful!");
        } else {
          console.log("signIn failed", res);
        }
      }
    } catch (error) {
      console.log("Signing Up failed");
    }
  };

  const handleGoogleAuth = async () => {
    await signIn("google");
  };
  return (
    <Card className="p-5  bg-white xl:w-[400px] w-full rounded-[10px]">
      <h1 className="text-center font-bold">
        {authState === "SIGNUP" ? "Sign Up" : "Login"}
      </h1>
      <p className="text-gray-600 text-[12px] text-center">
        {authState === "SIGNUP"
          ? "Create an account with your email or google account."
          : "Login to your account with your email or google account."}
      </p>
      <Button
        className="bg-white border-[1px] text-black hover:bg-neutral-50 text-[13px] flex items-center"
        onClick={handleGoogleAuth}
      >
        <FcGoogle size={16} /> Continue with Google
      </Button>
      <div className="flex items-center -6">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">or continue with</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>
      <form onSubmit={handleSubmit(handleAuth)} className="flex flex-col gap-4">
        {authState === "SIGNUP" && (
          <label className="flex flex-col gap-1">
            <Input
              className="w-full h-[50px] border-[1px] placeholder:text-[13px]"
              placeholder="Enter Username"
              type="text"
              {...register("username")}
            />
          </label>
        )}
        <label className="flex flex-col gap-1">
          <Input
            className="w-full h-[50px] placeholder:text-[13px]"
            placeholder="Enter Email"
            type="email"
            {...register("email")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <Input
            className="w-full h-[50px] placeholder:text-[13px]"
            placeholder="Enter Password"
            type="password"
            {...register("password")}
          />
        </label>
        <Button className="" type="submit">
          {authState === "SIGNUP" ? "Sign Up" : "Login"}
        </Button>
      </form>
      {authState === "SIGNUP" ? (
        <p className="text-[12px] text-center">
          Already have an account?{" "}
          <span className="underline cursor-pointer" onClick={toogleAuthState}>
            Login
          </span>
        </p>
      ) : (
        <p className="text-[12px] text-center">
          Don't have an account?{" "}
          <span className="underline cursor-pointer" onClick={toogleAuthState}>
            SignUp
          </span>
        </p>
      )}
    </Card>
  );
};

export default Authform;
