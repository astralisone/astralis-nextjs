import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/utils/crypto";
import { loginSchema } from "@/lib/validators/auth.validators";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate input
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        // Find user
        const user = await prisma.users.findUnique({
          where: { email },
          include: { organization: true }
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId || '',
          image: user.avatar,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session: updateSession }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.orgId = user.orgId;
        token.picture = user.image;
      }

      // Handle session updates (e.g., avatar change)
      if (trigger === "update" && updateSession) {
        if (updateSession.image !== undefined) {
          token.picture = updateSession.image;
        }
        if (updateSession.name !== undefined) {
          token.name = updateSession.name;
        }
      }

      // Google OAuth - find or create organization
      if (account?.provider === "google" && user) {
        const dbUser = await prisma.users.findUnique({
          where: { id: user.id },
          include: { organization: true }
        });

        if (dbUser) {
          token.orgId = dbUser.orgId || '';
          token.role = dbUser.role;
          token.picture = dbUser.avatar;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.orgId = token.orgId as string;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow email verification without full profile
      if (account?.provider === "email") {
        return true;
      }

      // For OAuth, ensure user has organization
      if (account?.provider === "google") {
        const dbUser = await prisma.users.findUnique({
          where: { email: user.email! },
          include: { organization: true }
        });

        // If user doesn't have org, create one (first-time OAuth)
        if (!dbUser?.organization) {
          const org = await prisma.organization.create({
            data: {
              name: `${user.name}'s Organization`,
              users: {
                connect: { id: dbUser!.id }
              }
            }
          });

          await prisma.users.update({
            where: { id: dbUser!.id },
            data: { orgId: org.id, role: 'ADMIN' }
          });
        }

        return true;
      }

      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },
  events: {
    async signIn({ user }) {
      // Log successful sign-in
      // TODO: Re-enable when activityLog model is added to schema
      // if (user.id) {
      //   await prisma.activityLog.create({
      //     data: {
      //       userId: user.id,
      //       orgId: user.orgId || '',
      //       action: 'LOGIN',
      //       entity: 'USER',
      //       entityId: user.id,
      //     }
      //   });
      // }
    },
  },
};

/**
 * Helper function to get the current session in Server Components
 * Usage: const session = await auth();
 */
export const auth = () => getServerSession(authOptions);
