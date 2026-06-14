import createMiddleware from "next-intl/middleware"
// In Next.js 16, middleware.ts is renamed to proxy.ts
// next-intl still uses createMiddleware internally
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
