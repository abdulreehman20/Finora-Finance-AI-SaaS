 

To integrate Better Auth in your Next.js frontend with your Express backend, you need to create an API route handler and a client instance.[(1)](https://www.better-auth.com/docs/integrations/next)

## Create API Route Handler

Create a route file at `app/api/auth/[...all]/route.ts`:


```typescript
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler({
  // Point to your Express backend
  baseURL: "http://localhost:7000"
});

```

[(1)](https://www.better-auth.com/docs/integrations/next)

This proxies auth requests from Next.js to your Express backend.[(1)](https://www.better-auth.com/docs/integrations/next)

## Create Client Instance

Create `lib/auth-client.ts`:


```typescript
import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: "http://localhost:7000", // Your Express backend URL
  plugins: [
    usernameClient()
  ]
})

```

[(2)](https://www.better-auth.com/docs/basic-usage), [(1)](https://www.better-auth.com/docs/integrations/next)

## Using Features in Your Frontend

### Sign Up with Email & Password


```typescript
import { authClient } from "@/lib/auth-client";

const { data, error } = await authClient.signUp.email({
  email,
  password,
  name,
  image, // optional
  callbackURL: "/dashboard"
}, {
  onRequest: (ctx) => {
    //show loading
  },
  onSuccess: (ctx) => {
    //redirect to the dashboard or sign in page
  },
  onError: (ctx) => {
    alert(ctx.error.message);
  },
});

```

[(2)](https://www.better-auth.com/docs/basic-usage)

### Sign In


```typescript
const { data, error } = await authClient.signIn.email({
  email,
  password,
  callbackURL: "/dashboard",
  rememberMe: false
}, {
  //callbacks
})

```

[(2)](https://www.better-auth.com/docs/basic-usage)

### Get Session Data


```typescript
import { authClient } from "@/lib/auth-client"

export function User(){
  const { 
    data: session, 
    isPending,
    error,
    refetch
  } = authClient.useSession() 
  
  return (
    //...
  )
}

```

[(2)](https://www.better-auth.com/docs/basic-usage)

### Server-Side Session


```typescript
import { headers } from "next/headers";

const session = await authClient.getSession({
  fetchOptions: {
    headers: await headers()
  }
})

```

[(2)](https://www.better-auth.com/docs/basic-usage)

## Important Configuration

Since your frontend (`localhost:3000`) and backend (`localhost:7000`) are on different origins, you've already correctly configured `trustedOrigins` in your Express backend.[(1)](https://www.better-auth.com/docs/integrations/next), [(3)](https://github.com/better-auth/better-auth/discussions/5578)

For cross-origin requests to work properly, you may need to configure cookies with `sameSite: 'none'` and `secure: true` in your backend, and use `credentials: 'include'` in frontend fetches.[(3)](https://github.com/better-auth/better-auth/discussions/5578)

Your setup follows the pattern of separate frontend and backend, which is well-supported by Better Auth.[(3)](https://github.com/better-auth/better-auth/discussions/5578)