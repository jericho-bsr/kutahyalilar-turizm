"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusFront, MapPin, CalendarDays } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [kalkis, setKalkis] = useState("");
  const [varis, setVaris] = useState("");
  const [tarih, setTarih] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (kalkis) query.append("kalkis", kalkis);
    if (varis) query.append("varis", varis);
    if (tarih) query.append("tarih", tarih);
    
    router.push(`/trips?${query.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay dark:opacity-5"></div>
        <div className="z-10 text-center mb-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <BusFront className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            Yolculuk Başlıyor.
          </h1>
          <p className="text-xl text-muted-foreground md:px-20 leading-relaxed font-medium">
            Simav'dan Türkiye'nin dört bir yanına uzanan güvenli, konforlu ve huzurlu seyahat deneyimi.
          </p>
        </div>

        {/* Search Widget */}
        <Card className="z-10 w-full max-w-4xl border-border/60 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <BusFront className="w-5 h-5 text-primary" />
              Otobüs Bileti Ara
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 w-full">
                <Label htmlFor="kalkis" className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> Nereden
                </Label>
                <Input 
                  id="kalkis" 
                  placeholder="Kalkış Şehri (Örn: Simav)" 
                  value={kalkis} 
                  onChange={(e) => setKalkis(e.target.value)}
                  className="h-12 text-lg focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="varis" className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> Nereye
                </Label>
                <Input 
                  id="varis" 
                  placeholder="Varış Şehri (Örn: Kütahya)" 
                  value={varis} 
                  onChange={(e) => setVaris(e.target.value)}
                  className="h-12 text-lg focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="tarih" className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" /> Tarih
                </Label>
                <Input 
                  id="tarih" 
                  type="date" 
                  value={tarih} 
                  onChange={(e) => setTarih(e.target.value)}
                  className="h-12 text-lg focus-visible:ring-primary" 
                />
              </div>
              <Button type="submit" size="lg" className="h-12 w-full md:w-auto px-8 text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Sefer Bul
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background container mx-auto px-4 max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-3 p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <BusFront className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Lüks Filo</h3>
            <p className="text-muted-foreground">2+1 geniş koltuklarımızla konforlu TV ve internet keyfi.</p>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="text-xl font-bold">Güvenli Seyahat</h3>
            <p className="text-muted-foreground">Deneyimli kaptanlarımızla her zaman emniyetli yolculuk.</p>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="text-xl font-bold">Uygun Fiyatlar</h3>
            <p className="text-muted-foreground">Kaliteyi en iyi fiyatlarla bütçenizi yormadan sunuyoruz.</p>
          </div>
        </div>
      </section>
    </div>
  );
}