import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";

const schema = z.object({
  restaurantId: z.string().min(1),
  type: z.enum(["page_view", "dish_view", "language_change", "qr_scan"]),
  meta: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { restaurantId, type, meta } = schema.parse(await req.json());
    await db.analyticsEvent.create({
      data: {
        restaurantId,
        type,
        // Prisma Json fields require explicit cast
        ...(meta ? { meta: meta as Record<string, string> } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
