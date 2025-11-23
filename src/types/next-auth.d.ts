import { DefaultSession } from 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      orgId: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    orgId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    orgId: string;
  }
}
