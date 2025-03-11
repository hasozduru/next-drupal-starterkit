import "@/styles/globals.css";
import "instantsearch.css/themes/satellite-min.css";

import { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import DraftAlert from "@/components/draft-alert";
import { Footer } from "@/components/footer/footer";
import ReactQueryClientProvider from "@/components/query-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { preloadMenus } from "@/lib/drupal/get-menus";
import { inter, overpass } from "@/styles/fonts";

import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const viewport: Viewport = {
  width: "device-width, shrink-to-fit=no",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "cyan" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });

  return {
    title: {
      template: `%s | ${t("meta-site-name")}`,
      default: t("meta-site-name"),
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  // We preload the menus here to avoid unnecessary delays in rendering
  preloadMenus(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <NextIntlClientProvider messages={messages}>
              <ReactQueryClientProvider>
                <Fonts>
                  <DraftAlert />
                  <div className="flex min-h-screen flex-col">
                    {children}
                    <Footer />
                  </div>
                  <Toaster />
                </Fonts>
                <ReactQueryDevtools />
              </ReactQueryClientProvider>
            </NextIntlClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Fonts({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${overpass.variable} font-overpass antialiased`}
    >
      {children}
    </div>
  );
}
