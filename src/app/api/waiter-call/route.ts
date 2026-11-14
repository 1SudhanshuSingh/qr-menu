import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";

const schema = z.object({
  restaurantId: z.string().min(1),
  tableNumber: z.string().min(1),
  type: z.enum(["waiter", "bill", "help"]).default("waiter"),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    await db.waiterCall.create({ data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json({ error: "missing restaurantId" }, { status: 400 });
  const calls = await db.waiterCall.findMany({
    where: { restaurantId, resolved: false },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(calls);
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = z.object({ id: z.string() }).parse(await req.json());
    await db.waiterCall.update({ where: { id }, data: { resolved: true } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
