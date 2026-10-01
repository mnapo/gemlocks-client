import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? "1") || 1);
  const { data, error } = await getAdminClient().rpc("get_user_ranking", {
    p_page: page,
    p_page_size: 10,
  });
  if (error) return NextResponse.json({ error: "No se pudo obtener el ranking." }, { status: 500 });
  return NextResponse.json({ page, pageSize: 10, players: data ?? [] });
}
