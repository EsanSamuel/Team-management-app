import { AuthOptions, getServerSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prismadb";
import { AdapterUser } from "next-auth/adapters";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("No user found");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Incorrect password");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      const user = await prisma.user.findUnique({
        where: {
          email: session?.user?.email,
        },
      });
      session.user.id = user?.id.toString();
      return session;
    },
    async signIn({ user }: { user: User | AdapterUser }) {
      try {
        const userExists = await prisma?.user?.findUnique({
          where: {
            email: user?.email as string,
          },
        });

        if (!userExists) {
          await prisma.user.create({
            data: {
              username: user?.name!,
              email: user.email!,
              profilePicture: user.image!,
            },
          });
        }
        console.log("Sign In successful!!");
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};

export default async function getSession() {
  return await getServerSession(authOptions);
}
