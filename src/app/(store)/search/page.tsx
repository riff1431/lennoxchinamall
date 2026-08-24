import React from "react";
import type { Metadata } from "next";
import { SearchPageClient } from "./SearchPageClient";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q ? `"${resolvedParams.q}"` : "All Products";

  return {
    title: `Search: ${query} — Direct China Sourcing`,
    description: `Browse wholesale factory search results for ${query} on Lennox ChinaMall.`,
    robots: {
      index: false, // Prevent search parameter duplicate content indexation
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const category = resolvedParams.category || "all";

  return (
    <SearchPageClient
      initialQuery={q}
      initialCategory={category}
    />
  );
}
