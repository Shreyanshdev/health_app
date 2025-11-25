import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { CTASection } from "@/components/landing/CTASection";
import { TabbedFeatureSection } from '@/components/landing/TabbedFeatureSection';

export const metadata: Metadata = {
  title: "Health App - Your Trusted Healthcare Partner",
  description: "Book appointments with expert doctors, read health blogs, and manage your healthcare needs. Online and in-clinic consultations available.",
  keywords: ["healthcare", "doctor appointments", "medical consultation", "health blog"],
  openGraph: {
    title: "Health App - Your Trusted Healthcare Partner",
    description: "Book appointments with expert doctors and manage your healthcare needs",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <TabbedFeatureSection />
      <StatsSection />
      <FeaturesGrid />
      <TestimonialSection />
      <CTASection />
    </div>
  );
}
