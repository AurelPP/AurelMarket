import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "ID manquant" }, { status: 400 });
  }
  try {
    await prisma.pokemonListing.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Pokémon introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: e?.message || "Erreur" }, { status: 500 });
  }
}
