import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kütahyalılar Turizm | Güvenli Yolculuk",
  description: "Simav'ın dünyaya açılan güvenli kapısı. Online otobüs bileti al, seferleri sorgula.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t py-6 bg-muted/40 mt-auto">
            <div className="container flex flex-col items-center justify-center gap-4 text-center md:flex-row md:justify-between px-4">
              <p className="text-sm text-muted-foreground">
                © 2026 Kütahyalılar Turizm. Tüm hakları saklıdır.
              </p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="hover:text-primary cursor-pointer transition-colors">Gizlilik</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Şartlar</span>
                <span className="hover:text-primary cursor-pointer transition-colors">İletişim</span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}