import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PopularDestinations from "@/components/PopularDestinations";
import TrendingExperiences from "@/components/TrendingExperiences";
import AITripPlanner from "@/components/AITripPlanner";
import FeaturedPackages from "@/components/FeaturedPackages";
import AppShowcase from "@/components/AppShowcase";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-bg-main text-fg-main selection:bg-accent-primary/20">
      {/* Floating Header */}
      <Navbar />

      {/* Hero Header Presentation */}
      <Hero />

      {/* Content Blocks */}
      <main className="relative z-10 space-y-12">
        {/* Popular Destinations Grid Section */}
        <PopularDestinations />

        {/* Dynamic switcher: Excursion Listings */}
        <TrendingExperiences />

        {/* Dynamic form assistant to prompt travel generator */}
        <AITripPlanner />

        {/* Handpicked Premium packages cards */}
        <FeaturedPackages />

        {/* Phone screen preview showcasing mobile dashboard features */}
        <AppShowcase />
      </main>

      {/* Styled Multi-column footer and sitemaps */}
      <Footer />
    </div>
  );
}

