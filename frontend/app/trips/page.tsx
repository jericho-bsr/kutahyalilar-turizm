"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bus, Clock, MapPin, ChevronRight, Users } from "lucide-react";

interface Trip {
  id: number;
  kalkis_sehri: string;
  varis_sehri: string;
  kalkis_zamani: string;
  fiyat: number;
  toplam_koltuk: number;
  dolu_koltuklar?: number[];
  otobus_plakasi?: string;
}

function TripsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const kalkis = searchParams.get("kalkis") || "";
  const varis = searchParams.get("varis") || "";
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      try {
        let url = "http://localhost:8080/trips/trips";
        const queryParams = new URLSearchParams();
        if (kalkis) queryParams.append("kalkis", kalkis);
        if (varis) queryParams.append("varis", varis);
        if (queryParams.toString()) url += `?${queryParams.toString()}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Seferler getirilemedi.");
        const data = await res.json();
        setTrips(data);
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [kalkis, varis]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("tr-TR", { 
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  const getDayOnly = (isoString: string) => {
    return new Intl.DateTimeFormat("tr-TR", { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(isoString));
  };
  
  const getTimeOnly = (isoString: string) => {
    return new Intl.DateTimeFormat("tr-TR", { hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-lg text-muted-foreground">Seferler aranıyor...</div>;
  if (error) return <div className="text-center py-20 text-destructive">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {kalkis && varis ? `${kalkis} - ${varis} Seferleri` : "Tüm Seferler"}
        </h2>
        <span className="text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm font-medium">
          {trips.length} Sefer Bulundu
        </span>
      </div>

      {trips.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Bus className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">Sefer Bulunamadı</h3>
            <p className="text-muted-foreground max-w-sm">Arama kriterlerinize uygun geçmiş veya gelecek sefer bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {trips.map(trip => {
            const doluKoltukSayisi = trip.dolu_koltuklar?.length || 0;
            const bosKoltuk = trip.toplam_koltuk - doluKoltukSayisi;
            
            return (
              <Card key={trip.id} className="overflow-hidden hover:border-primary/50 transition-colors shadow-sm group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Time & Route Info */}
                    <div className="flex-1 p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50 bg-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                        <Clock className="w-4 h-4 text-primary" /> {getDayOnly(trip.kalkis_zamani)}
                        <span className="mx-2 text-border">•</span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-muted">
                           {trip.otobus_plakasi || "Araç Atanmadı"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center text-primary">
                            <span className="text-2xl font-bold tracking-tighter">{getTimeOnly(trip.kalkis_zamani)}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full border-2 border-primary bg-background z-10" />
                              <div className="w-0.5 h-10 border-l-2 border-dashed border-border" />
                              <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary z-10" />
                            </div>
                            
                            <div className="flex flex-col justify-between h-[4.5rem]">
                              <span className="font-semibold text-lg">{trip.kalkis_sehri}</span>
                              <span className="font-semibold text-lg text-muted-foreground">{trip.varis_sehri}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="w-full md:w-64 p-6 bg-muted/10 flex flex-col items-center justify-center gap-4 group-hover:bg-primary/5 transition-colors">
                      <div className="text-center">
                        <div className="text-3xl font-extrabold text-foreground mb-1">
                          {trip.fiyat} <span className="text-lg font-medium text-muted-foreground">TL</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium bg-green-500/10 px-3 py-1 rounded-full">
                          <Users className="w-4 h-4" />
                          {bosKoltuk} Koltuk Boş
                        </div>
                      </div>
                      
                      <Button 
                        size="lg" 
                        className="w-full font-semibold shadow-md"
                        onClick={() => router.push(`/booking/${trip.id}`)}
                        disabled={bosKoltuk === 0}
                      >
                        {bosKoltuk === 0 ? "Dolu" : "Koltuk Seç"} <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
       <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Yükleniyor...</div>}>
         <TripsContent />
       </Suspense>
    </div>
  );
}
