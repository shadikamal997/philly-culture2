import AboutUsSection from "@/components/ui/about-us-section";

export const metadata = {
  title: 'About Us | Philly Culture Academy',
  description: 'Learn about our mission to provide world-class culinary education and preserve authentic Philadelphia food culture',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutUsSection />
    </main>
  );
}
