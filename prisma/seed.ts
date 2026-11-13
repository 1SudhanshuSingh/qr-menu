import { PrismaClient, type DietaryTag } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const restaurant = await db.restaurant.upsert({
    where: { slug: "alma-portuguesa" },
    update: {},
    create: {
      slug: "alma-portuguesa",
      name: "Alma Portuguesa",
      tagline: "Sabores autênticos de Portugal",
      defaultLocale: "pt",
      enabledLocales: ["pt", "en"],
      currency: "EUR",
      isPublished: true,
      theme: {
        preset: "tinto",
        colorBg: "#FAF7F2",
        colorSurface: "#FFFFFF",
        colorInk: "#1C1917",
        colorMuted: "#78716C",
        colorAccent: "#6B1D2A",
        colorAccentInk: "#FAF7F2",
        colorLine: "#E8E0D5",
        colorCategory: "#1A3A6C",
        fontDisplay: "Cormorant Garamond",
        fontBody: "Inter",
        radius: "0.5rem",
      },
    },
  });

  const categories: Array<{
    ptName: string;
    enName: string;
    sortOrder: number;
    dishes: Array<{
      ptName: string;
      enName: string;
      pricecents: number;
      dietaryTags?: DietaryTag[];
      isFeatured?: boolean;
    }>;
  }> = [
    {
      ptName: "Entradas",
      enName: "Starters",
      sortOrder: 1,
      dishes: [
        { ptName: "Azeitonas", enName: "Olives", pricecents: 150, dietaryTags: ["VEGAN"] },
        { ptName: "Saco de Pão", enName: "Bread Basket", pricecents: 250, dietaryTags: ["VEGAN"] },
        { ptName: "Croquete", enName: "Croquettes", pricecents: 160, dietaryTags: ["BEEF"] },
        { ptName: "Pastel de Bacalhau", enName: "Codfish Pastry", pricecents: 160, dietaryTags: ["FISH"] },
        { ptName: "Queijo com Doce", enName: "Cheese and Jam", pricecents: 450, dietaryTags: ["VEGETARIAN"] },
      ],
    },
    {
      ptName: "Sopas",
      enName: "Soups",
      sortOrder: 2,
      dishes: [
        { ptName: "Caldo Verde", enName: "Green Broth", pricecents: 280, dietaryTags: ["VEGAN"] },
        { ptName: "Sopa da Pedra", enName: "Stone Soup", pricecents: 400, dietaryTags: ["PORK"] },
      ],
    },
    {
      ptName: "Petiscos",
      enName: "Snacks",
      sortOrder: 3,
      dishes: [
        { ptName: "Chouriço Assado", enName: "Flame-Grilled Chorizo", pricecents: 970, dietaryTags: ["PORK"] },
        { ptName: "Tábua Presunto e Queijo", enName: "Cured Ham and Cheese Board", pricecents: 1400, dietaryTags: ["PORK"] },
        { ptName: "Amêijoa à Taberna", enName: "Clams", pricecents: 1365, dietaryTags: ["SEAFOOD"] },
        { ptName: "Choco Frito", enName: "Fried Cuttlefish", pricecents: 1125, dietaryTags: ["SEAFOOD"] },
        { ptName: "Cogumelos Salteados", enName: "Sautéed Mushrooms", pricecents: 970, dietaryTags: ["VEGAN"] },
        { ptName: "Pica-Pau Lombinho", enName: "Pork Strips — Original", pricecents: 1465, dietaryTags: ["PORK"] },
        { ptName: "Pica-Pau Molho de Mostarda", enName: "Pork Strips — Mustard Sauce", pricecents: 1465, dietaryTags: ["PORK"] },
        { ptName: "Pica-Pau Frango", enName: "Chicken Strips", pricecents: 1465, dietaryTags: ["CHICKEN"] },
      ],
    },
    {
      ptName: "No Prato",
      enName: "On Plate",
      sortOrder: 4,
      dishes: [
        { ptName: "Bife à Portuguesa", enName: "Portugal Steak", pricecents: 1880, dietaryTags: ["BEEF"], isFeatured: true },
        { ptName: "Bacalhau à Brás", enName: "Codfish À Brás", pricecents: 1545, dietaryTags: ["FISH"], isFeatured: true },
        { ptName: "Bochecha de Porco", enName: "Pork Cheek", pricecents: 1785, dietaryTags: ["PORK"] },
        { ptName: "Chanfana", enName: "Chanfana (Braised Goat)", pricecents: 1895, dietaryTags: ["OLD_GOAT"] },
        { ptName: "Cogumelos", enName: "Mushrooms", pricecents: 1295, dietaryTags: ["VEGAN"] },
        { ptName: "Salada da Taberna", enName: "Tavern Salad", pricecents: 1190, dietaryTags: ["VEGAN"] },
      ],
    },
    {
      ptName: "No Pão",
      enName: "On Bread",
      sortOrder: 5,
      dishes: [
        { ptName: "Bifana", enName: "Portuguese Pork Sandwich", pricecents: 550, dietaryTags: ["PORK"] },
        { ptName: "Prego", enName: "Portuguese Steak Sandwich", pricecents: 890, dietaryTags: ["BEEF"] },
        { ptName: "Cogumelo", enName: "Mushroom Sandwich", pricecents: 690, dietaryTags: ["VEGAN"] },
      ],
    },
    {
      ptName: "Criança",
      enName: "Children",
      sortOrder: 6,
      dishes: [
        { ptName: "Prego (Criança)", enName: "Steak Sandwich (Child)", pricecents: 995, dietaryTags: ["BEEF"] },
        { ptName: "Bacalhau à Brás (Criança)", enName: "Codfish À Brás (Child)", pricecents: 1095, dietaryTags: ["FISH"] },
        { ptName: "Bife de Frango", enName: "Chicken Steak", pricecents: 995, dietaryTags: ["CHICKEN"] },
      ],
    },
    {
      ptName: "Bebidas",
      enName: "Drinks",
      sortOrder: 7,
      dishes: [
        { ptName: "Água (0.50cl)", enName: "Still Water (0.50cl)", pricecents: 150, dietaryTags: ["VEGAN"] },
        { ptName: "Água Com Gás", enName: "Sparkling Water", pricecents: 160, dietaryTags: ["VEGAN"] },
        { ptName: "Coca Cola (0.33cl)", enName: "Coke (0.33cl)", pricecents: 240, dietaryTags: ["VEGAN"] },
        { ptName: "Coca Cola Zero (0.33cl)", enName: "Coke Zero (0.33cl)", pricecents: 240, dietaryTags: ["VEGAN"] },
        { ptName: "Seven Up (0.33cl)", enName: "Seven Up (0.33cl)", pricecents: 240, dietaryTags: ["VEGAN"] },
        { ptName: "Sumol de Laranja (0.33cl)", enName: "Orange Sumol (0.33cl)", pricecents: 240, dietaryTags: ["VEGAN"] },
        { ptName: "Sumol de Ananás (0.33cl)", enName: "Pineapple Sumol (0.33cl)", pricecents: 240, dietaryTags: ["VEGAN"] },
        { ptName: "FuzeTea Limão (0.33cl)", enName: "Lemon FuzeTea (0.33cl)", pricecents: 240, dietaryTags: ["VEGAN"] },
        { ptName: "FuzeTea Pêssego (0.33cl)", enName: "Peach FuzeTea (0.33cl)", pricecents: 240, dietaryTags: ["VEGAN"] },
        { ptName: "Ginger Ale (0.33cl)", enName: "Ginger Ale (0.33cl)", pricecents: 200, dietaryTags: ["VEGAN"] },
      ],
    },
    {
      ptName: "Cerveja",
      enName: "Beer",
      sortOrder: 8,
      dishes: [
        { ptName: "Fino (0.20cl)", enName: "Tap Beer (0.20cl)", pricecents: 150 },
        { ptName: "Caneca (0.40cl)", enName: "Beer Mug (0.40cl)", pricecents: 280 },
        { ptName: "Sagres Preta (0.33cl)", enName: "Black Beer (0.33cl)", pricecents: 230 },
        { ptName: "Sagres sem Álcool (0.33cl)", enName: "Alcohol Free Beer (0.33cl)", pricecents: 230 },
        { ptName: "Sidra (0.33cl)", enName: "Cider (0.33cl)", pricecents: 230 },
        { ptName: "Tango (0.20cl)", enName: "Beer + Grenadine (0.20cl)", pricecents: 150 },
        { ptName: "Panaché (0.20cl)", enName: "Beer + Soda (0.20cl)", pricecents: 150 },
      ],
    },
    {
      ptName: "Cafetaria",
      enName: "Cafeteria",
      sortOrder: 9,
      dishes: [
        { ptName: "Café", enName: "Espresso", pricecents: 100, dietaryTags: ["VEGAN"] },
        { ptName: "Café Pingado", enName: "Espresso with a dash of Milk", pricecents: 100 },
        { ptName: "Descafeinado", enName: "Decaffeinated", pricecents: 100, dietaryTags: ["VEGAN"] },
        { ptName: "Carioca de Café", enName: "Weak Coffee", pricecents: 100, dietaryTags: ["VEGAN"] },
        { ptName: "Carioca de Limão", enName: "Lemon Tea", pricecents: 95, dietaryTags: ["VEGAN"] },
        { ptName: "Abatanado", enName: "Long Espresso", pricecents: 200, dietaryTags: ["VEGAN"] },
        { ptName: "Meia de Leite", enName: "Coffee + Milk", pricecents: 150 },
        { ptName: "Chá Preto", enName: "Black Tea", pricecents: 150, dietaryTags: ["VEGAN"] },
        { ptName: "Chá Verde", enName: "Green Tea", pricecents: 150, dietaryTags: ["VEGAN"] },
      ],
    },
  ];

  for (const cat of categories) {
    const category = await db.category.create({
      data: {
        restaurantId: restaurant.id,
        sortOrder: cat.sortOrder,
        isVisible: true,
        translations: {
          create: [
            { locale: "pt", name: cat.ptName },
            { locale: "en", name: cat.enName },
          ],
        },
      },
    });

    for (let i = 0; i < cat.dishes.length; i++) {
      const dish = cat.dishes[i]!;
      await db.dish.create({
        data: {
          categoryId: category.id,
          pricecents: dish.pricecents,
          dietaryTags: dish.dietaryTags ?? [],
          isFeatured: dish.isFeatured ?? false,
          sortOrder: i,
          translations: {
            create: [
              { locale: "pt", name: dish.ptName },
              { locale: "en", name: dish.enName },
            ],
          },
        },
      });
    }
  }

  console.log(
    `Seeded restaurant "${restaurant.name}" (${restaurant.slug}) with ${categories.length} categories.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void db.$disconnect());
