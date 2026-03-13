import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { CryptoProvider } from '@/lib/crypto-context';
import { CompareProvider } from '@/lib/compare-context';
import Footer from '@/components/Footer';
import AiAssistant from '@/components/AiAssistant';
import CompareBar from '@/components/CompareBar';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Hagenz - Premium Marketplace',
  description: 'High-quality food, essentials, and hardware for your everyday life.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-white text-black antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <CryptoProvider>
                  {children}
                  <Footer />
                  <AiAssistant />
                  <CompareBar />
                </CryptoProvider>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
