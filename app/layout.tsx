import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CoreProviders } from "@/components/layout/CoreProviders";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import "./globals.css";

export const metadata = {
  title: "Philly Culture Academy",
  description: "Online Culinary Programs & Certifications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <ErrorBoundary>
          <CoreProviders>
            <Navbar />
            <div className="pt-20 min-h-screen">{children}</div>
            <Footer />
          </CoreProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
