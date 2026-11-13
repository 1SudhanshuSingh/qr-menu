import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=400&q=80`;

const IMAGES: Record<string, string> = {
  // ── Entradas ──────────────────────────────────────────────
  "Azeitonas":           U("1488459716781-31db52582fe9"),
  "Saco de Pão":         U("1549931319-a545dcf3bc73"),
  "Croquete":            U("1565958011703-44f9829ba187"),
  "Pastel de Bacalhau":  U("1565958011703-44f9829ba187"),
  "Queijo com Doce":     U("1452195100486-9cc805987862"),

  // ── Sopas ─────────────────────────────────────────────────
  "Caldo Verde":         U("1547592180-85f173990554"),
  "Sopa da Pedra":       U("1476718406336-bb5a9690ee2a"),

  // ── Petiscos ──────────────────────────────────────────────
  "Chouriço Assado":             U("1529694157872-4e0c0f3b238b"),
  "Tábua Presunto e Queijo":     U("1555396273-367ea4eb4db5"),
  "Amêijoa à Taberna":           U("1534422298391-e4f8c172dddb"),
  "Choco Frito":                 U("1562802378-063ec186a863"),
  "Cogumelos Salteados":         U("1504868584819-f8e8b4b6d7e3"),
  "Pica-Pau Lombinho":           U("1529694157872-4e0c0f3b238b"),
  "Pica-Pau Molho de Mostarda":  U("1529694157872-4e0c0f3b238b"),
  "Pica-Pau Frango":             U("1546069901-ba9599a7e63c"),

  // ── No Prato ──────────────────────────────────────────────
  "Bife à Portuguesa":   U("1544025162-d76538d4d4d6"),
  "Bacalhau à Brás":     U("1467003909585-2f8a72700288"),
  "Bochecha de Porco":   U("1529692236671-f1f6cf9683ba"),
  "Chanfana":            U("1504674900247-0877df9cc836"),
  "Cogumelos":           U("1518977676601-b53f82aba655"),
  "Salada da Taberna":   U("1540420773420-3366772f4999"),

  // ── No Pão ────────────────────────────────────────────────
  "Bifana":    U("1509722747041-616f39b57569"),
  "Prego":     U("1565299507177-b0ac66763828"),
  "Cogumelo":  U("1540420773420-3366772f4999"),

  // ── Criança ───────────────────────────────────────────────
  "Prego (Criança)":            U("1565299507177-b0ac66763828"),
  "Bacalhau à Brás (Criança)":  U("1467003909585-2f8a72700288"),
  "Bife de Frango":             U("1546069901-ba9599a7e63c"),

  // ── Bebidas ───────────────────────────────────────────────
  "Água (0.50cl)":          U("1548839140-29a749e1cf4d"),
  "Água Com Gás":           U("1548839140-29a749e1cf4d"),
  "Coca Cola (0.33cl)":     U("1527960669566-f882ba85a4c9"),
  "Coca Cola Zero (0.33cl)":U("1527960669566-f882ba85a4c9"),
  "Seven Up (0.33cl)":      U("1570197788417-0e82375c9371"),
  "Sumol de Laranja (0.33cl)": U("1621506289937-a8e4df240d0b"),
  "Sumol de Ananás (0.33cl)":  U("1559181567-c3190ca9959b"),
  "FuzeTea Limão (0.33cl)":    U("1556679343-c7306c1976bc"),
  "FuzeTea Pêssego (0.33cl)":  U("1556679343-c7306c1976bc"),
  "Ginger Ale (0.33cl)":       U("1544145945-f90425340c7e"),

  // ── Cerveja ───────────────────────────────────────────────
  "Fino (0.20cl)":            U("1535958636474-b021ee887b13"),
  "Caneca (0.40cl)":          U("1558642452-9d2a7deb7f62"),
  "Sagres Preta (0.33cl)":    U("1608270586620-248524c67de9"),
  "Sagres sem Álcool (0.33cl)":U("1535958636474-b021ee887b13"),
  "Sidra (0.33cl)":           U("1600788886242-5c96aabe3757"),
  "Tango (0.20cl)":           U("1535958636474-b021ee887b13"),
  "Panaché (0.20cl)":         U("1535958636474-b021ee887b13"),

  // ── Cafetaria ─────────────────────────────────────────────
  "Café":               U("1495474472287-4d71bcdd2085"),
  "Café Pingado":       U("1521302080334-4bebac2763a6"),
  "Descafeinado":       U("1495474472287-4d71bcdd2085"),
  "Carioca de Café":    U("1521302080334-4bebac2763a6"),
  "Carioca de Limão":   U("1556679343-c7306c1976bc"),
  "Abatanado":          U("1485808191679-5f86510bd9d5"),
  "Meia de Leite":      U("1534687941688-651ccaafbff8"),
  "Chá Preto":          U("1544787219-7f47ccb76574"),
  "Chá Verde":          U("1544787219-7f47ccb76574"),
};

async function main() {
  const restaurant = await db.restaurant.findUnique({
    where: { slug: "alma-portuguesa" },
    include: {
      categories: {
        include: {
          dishes: {
            include: { translations: { where: { locale: "pt" } } },
          },
        },
      },
    },
  });

  if (!restaurant) {
    console.error("Restaurant not found — run pnpm db:seed first.");
    return;
  }

  let updated = 0;
  let skipped = 0;
  for (const cat of restaurant.categories) {
    for (const dish of cat.dishes) {
      const ptName = dish.translations[0]?.name;
      if (ptName && IMAGES[ptName]) {
        await db.dish.update({
          where: { id: dish.id },
          data: { imageUrl: IMAGES[ptName] },
        });
        updated++;
      } else {
        skipped++;
        if (ptName) console.log("  No image for:", ptName);
      }
    }
  }

  console.log(`Updated ${updated} dishes. Skipped ${skipped}.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => void db.$disconnect());
