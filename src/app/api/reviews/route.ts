import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";

const schema = z.object({
  restaurantId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const data = schema.parse(body);
    await db.review.create({ data });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
