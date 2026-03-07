import { LandingNavbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/Hero";
import { PurposeSection } from "@/components/landing/PurposeGrid";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ReviewsSection } from "@/components/landing/Reviews";
import { PricingSection } from "@/components/landing/Pricing";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { GridDotBackground } from "@/components/landing/GridBackground";

export default function Home() {
  return (
    <main className="relative text-white overflow-x-hidden bg-transparent">
      {/* 
        Global green-tinted grid+dot background — fixed behind all sections.
        The Hero has its own BackgroundRippleEffect that renders on top of this
        via its z-0 stacking, so this grid won't interfere.
      */}
      <GridDotBackground />

      <LandingNavbar />
      <HeroSection />
      <PurposeSection />
      <FeaturesGrid />
      <ReviewsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
