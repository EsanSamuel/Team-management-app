"use server";
import { revalidatePath } from "next/cache";
import prisma from "../prismadb";
import bcrypt from "bcryptjs";
import getSession from "../session";

interface UserType {
  username: string;
  email: string;
  password: string;
}

export const registerUser = async ({ username, email, password }: UserType) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        hashedPassword: hashedPassword,
      },
    });
    console.log(user);
    return user;
  } catch (error) {
    console.log("Something went wrong!");
  }
};

export const getUser = async () => {
  try {
    const session = await getSession();
    console.log(session?.user?.email)
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email,
      },
    });
    console.log(user)
    return user;
  } catch (error) {
    console.log("User not found!");
  }
};
