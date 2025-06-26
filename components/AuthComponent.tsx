"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { FieldValues, Form, SubmitHandler, useForm } from "react-hook-form";
import { registerUser } from "@/lib/actions/user.service";
import { redirect, useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

type IAuthState = "LOGIN" | "SIGNUP";

type AuthformProps = React.ComponentPropsWithoutRef<"div"> & {
  setShowAuthModal: any;
};

const Authform: React.FC<AuthformProps> = ({
  setShowAuthModal,
  className,
  ...props
}) => {
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
  }, [status, router, setShowAuthModal]);

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {authState === "SIGNUP" ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {authState === "LOGIN"
              ? "Login with your Email or Google account"
              : "Create an account with your Email or Google account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleAuth}
                >
                  <FcGoogle />
                  Login with Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <form className="grid gap-6" onSubmit={handleSubmit(handleAuth)}>
                {authState === "SIGNUP" && (
                  <div className="grid gap-2">
                    <Label htmlFor="email">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="John Doe"
                      required
                      {...register("username")}
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    {...register("email")}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    {...register("password")}
                  />
                </div>
                <Button type="submit" className="w-full" onClick={handleAuth}>
                  Login
                </Button>
              </form>
              <div className="text-center text-sm flex items-center justify-center gap-1">
                {authState === "LOGIN" ? (
                  <p>Don&apos;t have an account?</p>
                ) : (
                  <p>Already have an account</p>
                )}
                <a
                  href="#"
                  className="underline underline-offset-4"
                  onClick={toogleAuthState}
                >
                  {authState === "SIGNUP" ? "Login" : " Sign up"}
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
};

export default Authform;
