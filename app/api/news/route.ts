import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await getAdminClient().from("game_news").select("id,title,body,published_at").eq("published", true).order("published_at", { ascending: false }).limit(6);
  if (error) return NextResponse.json({ news: [] });
  return NextResponse.json({ news: data ?? [] });
}
