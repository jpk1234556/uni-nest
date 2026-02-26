import './globals.css';
import { Inter } from 'next/font/google';
import { ClientSessionProvider } from "../components/providers/client-session-provider"
import MobileNavigation from "../components/ui/MobileNavigation"
import MobileBottomNav from "../components/ui/MobileBottomNav"

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Uni-Nest - Find Your Perfect Student Home in Uganda',
  description: 'Discover and book student hostels near your university. Safe, affordable, and verified accommodations for Ugandan students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSessionProvider>
          <MobileNavigation />
          <div className="pb-16 md:pb-0">
            {children}
          </div>
          <MobileBottomNav />
        </ClientSessionProvider>
      </body>
    </html>
  );
}
