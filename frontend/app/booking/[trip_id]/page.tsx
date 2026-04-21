"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, Info, AlertCircle, ArrowRight } from "lucide-react";

interface Trip {
  id: number;
  kalkis_sehri: string;
  varis_sehri: string;
  kalkis_zamani: string;
  fiyat: number;
  toplam_koltuk: number;
  dolu_koltuklar: number[];
  otobus_plakasi: string;
}

export default function BookingPage({ params }: { params: Promise<{ trip_id: string }> }) {
  const router = useRouter();
  const { trip_id } = use(params);
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [passengerName, setPassengerName] = useState("");
  const [passengerTc, setPassengerTc] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`http://localhost:8080/trips/trips/${trip_id}`);
        if (!res.ok) throw new Error("Sefer bilgileri alınamadı.");
        const data = await res.json();
        setTrip(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [trip_id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) {
      alert("Lütfen önce bir koltuk seçin!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("İşleme devam etmek için giriş yapmalısınız.");
      router.push("/auth");
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        trip_id: parseInt(trip_id),
        koltuk_no: selectedSeat,
        yolcu_adi: passengerName,
        yolcu_tc: passengerTc,
        fiyat: trip?.fiyat
      };

      const res = await fetch("http://localhost:8080/bookings/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Rezervasyon başarısız.");
      }

      const booking = await res.json();
      router.push(`/payment/${booking.id}`);

    } catch (err: any) {
       alert(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground animate-pulse">Sefer Yükleniyor...</div>;
  if (error || !trip) return <div className="text-center py-20 text-destructive">{error || "Sefer bulunamadı"}</div>;

  // 2+1 Bus Layout Generation
  const rows = Math.ceil(trip.toplam_koltuk / 3);
  const busSeats = [];
  for (let r = 0; r < rows; r++) {
    const seatLeft = r * 3 + 1;
    const seatRight1 = r * 3 + 2;
    const seatRight2 = r * 3 + 3;
    
    busSeats.push(
      <div key={`row-${r}`} className="flex justify-between items-center w-full max-w-[200px] mb-3">
        {/* Left Seat (1) */}
        {seatLeft <= trip.toplam_koltuk ? (
           <SeatButton num={seatLeft} trip={trip} selectedSeat={selectedSeat} onSelect={setSelectedSeat} />
        ) : <div className="w-10 h-10" />}
        
        {/* Aisle */}
        <div className="w-8" />
        
        {/* Right Seats (2) */}
        <div className="flex gap-2">
          {seatRight1 <= trip.toplam_koltuk ? (
             <SeatButton num={seatRight1} trip={trip} selectedSeat={selectedSeat} onSelect={setSelectedSeat} />
          ) : <div className="w-10 h-10" />}
          {seatRight2 <= trip.toplam_koltuk ? (
             <SeatButton num={seatRight2} trip={trip} selectedSeat={selectedSeat} onSelect={setSelectedSeat} />
          ) : <div className="w-10 h-10" />}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h2 className="text-3xl font-bold mb-8">Koltuk Seçimi & Yolcu Bilgileri</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bus Layout */}
        <Card className="lg:col-span-5 bg-card border-border/50 shadow-md flex flex-col items-center p-6">
           <div className="w-full max-w-[280px] bg-muted/30 border-4 border-muted rounded-full rounded-b-lg p-6 pb-8 flex flex-col items-center relative">
              <div className="absolute top-4 w-16 h-8 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center">
                 <div className="w-10 h-2 bg-black/20 dark:bg-white/20 rounded-full"/>
              </div>
              <div className="mt-8 mb-6 border-b-2 border-dashed border-border/50 w-full text-center text-xs text-muted-foreground pb-2">Şoför Mahalli</div>
              
              <div className="flex flex-col items-center w-full">
                 {busSeats}
              </div>
           </div>
           
           {/* Legend */}
           <div className="flex gap-4 mt-6 text-sm">
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-background border border-border"></div> Boş</div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-muted text-muted-foreground flex items-center justify-center">X</div> Dolu</div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-primary"></div> Seçili</div>
           </div>
        </Card>

        {/* Passenger Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/50 shadow-md">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle>Sefer Özeti</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Güzergah</p>
                    <p className="font-bold text-lg">{trip.kalkis_sehri} - {trip.varis_sehri}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tarih & Saat</p>
                    <p className="font-bold text-lg">{new Intl.DateTimeFormat("tr-TR", {day: "numeric", month: "long", hour:"2-digit", minute:"2-digit"}).format(new Date(trip.kalkis_zamani))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Araç Plaka</p>
                    <p className="font-bold text-lg">{trip.otobus_plakasi}</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Yolcu Bilgileri</CardTitle>
              <CardDescription>Lütfen yolculuk yapacak kişinin bilgilerini eksiksiz girin.</CardDescription>
            </CardHeader>
            <CardContent>
               <form id="booking-form" onSubmit={handleBooking} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="tc">T.C. Kimlik No</Label>
                       <Input id="tc" required pattern="\d{11}" maxLength={11} value={passengerTc} onChange={e=>setPassengerTc(e.target.value)} placeholder="11 Haneli TC Kimlik No" className="h-11" />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="name">Ad Soyad</Label>
                       <Input id="name" required value={passengerName} onChange={e=>setPassengerName(e.target.value)} placeholder="Kart üzerindeki isim" className="h-11" />
                     </div>
                  </div>
               </form>

               {selectedSeat ? (
                  <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                     <div>
                       <p className="text-sm text-muted-foreground">Seçilen Koltuk</p>
                       <p className="text-2xl font-bold text-primary">No: {selectedSeat}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                       <p className="text-3xl font-extrabold">{trip.fiyat} TL</p>
                     </div>
                  </div>
               ) : (
                  <div className="mt-8 p-4 bg-muted border border-border rounded-lg flex items-center gap-3 text-muted-foreground">
                    <AlertCircle className="w-5 h-5"/> Devam etmek için lütfen yandaki şemadan koltuk seçin.
                  </div>
               )}
            </CardContent>
            <CardFooter className="bg-muted/20 border-t p-6">
               <Button type="submit" form="booking-form" size="lg" className="w-full h-12 text-lg" disabled={!selectedSeat || bookingLoading}>
                 {bookingLoading ? "İşleniyor..." : "Ödeme Adımına Geç"} <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SeatButton({ num, trip, selectedSeat, onSelect }: { num: number, trip: Trip, selectedSeat: number|null, onSelect: (n: number)=>void }) {
   const isDolu = trip.dolu_koltuklar?.includes(num);
   const isSelected = selectedSeat === num;
   
   return (
     <button 
       type="button"
       disabled={isDolu}
       onClick={() => onSelect(num)}
       className={`
         w-10 h-10 rounded-t-lg rounded-b-sm border-2 font-bold text-sm transition-all relative overflow-hidden flex items-center justify-center
         ${isDolu 
            ? 'bg-muted border-border cursor-not-allowed text-muted-foreground' 
            : isSelected 
               ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110 z-10' 
               : 'bg-background hover:border-primary/50 border-border hover:bg-muted text-foreground'
         }
       `}
     >
       {isDolu ? 'X' : num}
       {/* Small visual detail for seat headrest */}
       <div className={`absolute top-0 left-0 right-0 h-2 border-b border-inherit opacity-20 ${isDolu ? 'hidden' : 'block'}`} />
     </button>
   );
}
