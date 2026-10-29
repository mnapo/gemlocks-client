import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import LandingPage from "@/components/public-landing-page";
import LogoutButton from "@/components/logout-button";

export default async function Home() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  return <LandingPage user={user ? { name: user.name, email: user.email } : null} logout={user ? <LogoutButton /> : null} />;
}
