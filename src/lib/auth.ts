import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "USER" | "AUTHOR" | "EDITOR" | "ADMIN"
    } & DefaultSession["user"]
    accessToken?: string
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    role: "USER" | "AUTHOR" | "EDITOR" | "ADMIN"
    accessToken?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call Express API at localhost:3000/api/auth/login
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
            headers: { "Content-Type": "application/json" }
          })

          if (!res.ok) {
            return null
          }

          const data = await res.json()
          
          if (data.token && data.user) {
            return {
              id: String(data.user.id),
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              accessToken: data.token
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "USER" | "AUTHOR" | "EDITOR" | "ADMIN"
        session.accessToken = token.accessToken as string | undefined
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})
