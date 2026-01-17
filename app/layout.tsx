import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://calrouter.app'),
  title: {
    default: "CalRouter for Calendly - Webhook Enrichment & Routing",
    template: "%s | CalRouter"
  },
  description: "Stop wasting time parsing Calendly webhooks. Automatically detect reschedules, parse custom questions, and track lead sources. Get clean, enriched data—not messy JSON.",
  keywords: ["calendly", "webhook", "automation", "zapier", "make", "n8n", "enrichment", "lead tracking", "utm tracking"],
  authors: [{ name: "CalRouter" }],
  creator: "CalRouter",
  publisher: "CalRouter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://calrouter.app',
    siteName: 'CalRouter',
    title: "CalRouter for Calendly - Webhook Enrichment & Routing",
    description: "Stop wasting time parsing Calendly webhooks. Automatically detect reschedules, parse custom questions, and track lead sources.",
  },
  twitter: {
    card: 'summary_large_image',
    title: "CalRouter for Calendly - Webhook Enrichment & Routing",
    description: "Stop wasting time parsing Calendly webhooks. Get clean, enriched data automatically.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${plusJakartaSans.variable} ${robotoMono.variable}`} suppressHydrationWarning>
        <body
          className="font-sans antialiased dark"
          suppressHydrationWarning
        >
          {children}
          {/* OPTIMIZATION: Toaster using CSS variables from globals.css (bundle-defer-third-party) */}
          <Toaster
            position="top-center"
            theme="dark"
            toastOptions={{
              classNames: {
                toast: 'bg-card text-card-foreground border-border shadow-xl rounded-xl',
                title: 'font-semibold text-foreground',
                description: 'text-muted-foreground',
                actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
                cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
                success: 'bg-card border-2 border-primary text-foreground [&>svg]:text-primary',
                error: 'bg-card border-2 border-destructive text-foreground [&>svg]:text-destructive',
                warning: 'bg-card border-2 border-accent text-foreground [&>svg]:text-accent-foreground',
                info: 'bg-card border-2 border-primary/50 text-foreground [&>svg]:text-primary',
              },
            }}
            richColors={false}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
