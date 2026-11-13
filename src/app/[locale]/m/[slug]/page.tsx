import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { MenuPage } from "~/components/menu/MenuPage";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const restaurant = await db.restaurant.findFirst({
    where: { slug, isPublished: true },
  });

  if (!restaurant) return { title: "Ementa" };

  return {
    title: `${restaurant.name} — Ementa`,
    description: restaurant.tagline ?? undefined,
    openGraph: {
      title: `${restaurant.name} — Ementa`,
      images: restaurant.coverUrl ? [restaurant.coverUrl] : [],
      locale,
    },
  };
}

export default async function MenuRoute({ params }: Props) {
  const { slug, locale } = await params;

  const restaurant = await db.restaurant.findFirst({
    where: { slug, isPublished: true },
    include: {
      categories: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          translations: true,
          dishes: {
            orderBy: { sortOrder: "asc" },
            include: { translations: true },
          },
        },
      },
    },
  });

  if (!restaurant) notFound();

  return <MenuPage restaurant={restaurant} locale={locale} />;
}
