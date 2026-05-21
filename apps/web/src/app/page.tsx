import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { StatsSection } from "@/components/sections/StatsSection";

export const metadata: Metadata = {
  title: "SiteScope — Free Website Analyzer",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
    </>
  );
}
