import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

// Public site layout
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </>
  );
}

