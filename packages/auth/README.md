# @captable/auth

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.15. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# Better Auth Migration

This package provides Better Auth configuration with extended session data including member information.

## Features

- Email/password authentication
- Google OAuth
- Extended session with member data:
  - `isOnboarded`: boolean
  - `companyId`: string  
  - `memberId`: string
  - `companyPublicId`: string
  - `status`: MemberStatusEnum | ""

## Usage

### Server-side (App Router)

```typescript
import { serverSideSession } from "@captable/auth";

export default async function Page() {
  const session = await serverSideSession({ request });
  
  console.log(session.user.isOnboarded);
  console.log(session.user.companyId);
  console.log(session.user.memberId);
  console.log(session.user.status);
  
  return <div>Hello {session.user.name}</div>;
}
```

### API Routes

```typescript
import { serverSideSession } from "@captable/auth";

export async function GET(request: Request) {
  try {
    const session = await serverSideSession({ request });
    
    // Access member data
    const { isOnboarded, companyId, memberId, status } = session.user;
    
    return Response.json({ success: true, user: session.user });
  } catch (error) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

### Client-side (React Components)

```typescript
import { useSession, signIn, signOut } from "@captable/auth";

export function MyComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  
  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }
  
  return (
    <div>
      <p>Welcome {session.user.name}</p>
      <p>Company: {session.user.companyId}</p>
      <p>Status: {session.user.status}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Middleware

```typescript
import { auth } from "@captable/auth";

export default auth.handler;

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

## Migration from NextAuth

The key differences:

1. **Server session**: Use `serverSideSession({ request })` instead of `getServerSession(authOptions)`
2. **Client hook**: Use `useSession()` from `@captable/auth` instead of `next-auth/react`
3. **Sign in/out**: Use `signIn()` and `signOut()` from the package
4. **Session data**: All the same member data is available (`isOnboarded`, `companyId`, etc.)
5. **Status prop**: Use `isPending` instead of `status === "loading"`

## Session Data

The extended session includes all the member information that was previously in NextAuth:

```typescript
interface ExtendedSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Extended member data
    isOnboarded: boolean;
    companyId: string;
    memberId: string;
    companyPublicId: string;
    status: MemberStatusEnum | "";
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    userId: string;
    activeOrganizationId?: string | null;
  };
}
```

## Notes

- The `serverSideSession` function automatically fetches the most recently accessed active member for the user
- It updates the `lastAccessed` timestamp when fetching member data
- If no active member is found, the member fields will be empty/false
- Client-side session data may not include the full member information - use server-side for complete data
