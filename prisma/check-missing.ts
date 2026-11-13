import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const dishes = await db.dish.findMany({
  where: { imageUrl: null },
  include: { translations: { where: { locale: "pt" } } },
});
console.log("Missing images:", dishes.length);
dishes.forEach((d) => console.log(" -", d.translations[0]?.name));
await db.$disconnect();
