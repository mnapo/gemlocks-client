import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? "1") || 1);
  const { data, error } = await getAdminClient().rpc("get_user_ranking_v2", {
    p_page: page,
    p_page_size: PAGE_SIZE + 1,
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo obtener el ranking." }, { status: 500 });
  }

  const rows = data ?? [];
  return NextResponse.json({
    page,
    pageSize: PAGE_SIZE,
    hasNextPage: rows.length > PAGE_SIZE,
    players: rows.slice(0, PAGE_SIZE),
  });
}
