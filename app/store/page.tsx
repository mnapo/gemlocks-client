import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import StoreBrowser from "./store-browser";

export default async function StorePage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) redirect("/login");

  const client = getAdminClient();
  const [{ data: userData }, { data: ownedData }] = await Promise.all([
    client.from("app_users").select("gems,coins").eq("id", user.sub).single(),
    client.from("user_store_items").select("item_id").eq("user_id", user.sub),
  ]);

  return <StoreBrowser coins={userData?.coins ?? 0} gems={userData?.gems ?? 0} owned={ownedData?.map((item) => item.item_id) ?? []} />;
}
