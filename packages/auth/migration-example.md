# Migration Example: NextAuth → Better Auth

## Before (NextAuth)

### Server-side Page
```typescript
// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  const { isOnboarded, companyId, memberId, status } = session.user;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Company: {companyId}</p>
      <p>Member ID: {memberId}</p>
      <p>Status: {status}</p>
      <p>Onboarded: {isOnboarded ? "Yes" : "No"}</p>
    </div>
  );
}
```

### API Route
```typescript
// app/api/user/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return Response.json({
    user: session.user,
    companyId: session.user.companyId,
  });
}
```

### Client Component
```typescript
// components/UserProfile.tsx
import { useSession } from "@captable/auth";

export function UserProfile() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;
  
  return (
    <div>
      <p>{session.user.name}</p>
      <p>Company: {session.user.companyId}</p>
      <p>Status: {session.user.status}</p>
    </div>
  );
}
```

## After (Better Auth)

### Server-side Page  
```typescript
// app/dashboard/page.tsx
import { serverSideSession } from "@captable/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await serverSideSession({ headers: await headers() });
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  const { isOnboarded, companyId, memberId, status } = session.user;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Company: {companyId}</p>
      <p>Member ID: {memberId}</p>
      <p>Status: {status}</p>
      <p>Onboarded: {isOnboarded ? "Yes" : "No"}</p>
    </div>
  );
}
```

### API Route
```typescript
// app/api/user/route.ts
import { serverSideSession } from "@captable/auth";

export async function GET(request: Request) {
  const session = await serverSideSession({ headers: request.headers });
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return Response.json({
    user: session.user,
    companyId: session.user.companyId,
  });
}
```

### Client Component
```typescript
// components/UserProfile.tsx
import { useSession } from "@captable/auth";

export function UserProfile() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;
  
  return (
    <div>
      <p>{session.user.name}</p>
      <p>Company: {session.user.companyId}</p>
      <p>Status: {session.user.status}</p>
    </div>
  );
}
```

## Key Changes Summary

1. **Import change**: `@captable/auth` instead of NextAuth imports
2. **Server function**: Use `serverSideSession({ headers })` for both server components and API routes
3. **Error handling**: Better Auth throws on no session, NextAuth returns null
4. **Client hook**: Same `useSession()` name, just change import from `next-auth/react` to `@captable/auth`
5. **Status prop**: `isPending` instead of `status === "loading"`

## Migration Checklist

- [ ] Update all server-side code to use `serverSideSession({ headers: await headers() })`
- [ ] Update API routes to use `serverSideSession({ headers: request.headers })`
- [ ] Update `useSession()` imports from `next-auth/react` to `@captable/auth`
- [ ] Update loading states from `status === "loading"` to `isPending`