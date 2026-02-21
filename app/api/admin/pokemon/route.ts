import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await prisma.pokemonListing.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      species: true,
      nickname: true,
      level: true,
      shiny: true,
      exportUuid: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ ok: true, data: list });
}

export async function DELETE() {
  const result = await prisma.pokemonListing.deleteMany({});
  return NextResponse.json({ ok: true, deleted: result.count });
}
