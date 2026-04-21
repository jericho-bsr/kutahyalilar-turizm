"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, User, LogOut } from "lucide-react";

interface Profile {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
}

interface Booking {
  id: number;
  trip_id: number;
  koltuk_no: number;
  yolcu_adi: string;
  islem_zamani: string;
  durum: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("user_email");
      if (!token || !email) {
        router.push("/auth");
        return;
      }

      try {
        // Fetch Profile
        const profRes = await fetch(`http://localhost:8080/users/profile/${email}`);
        if(profRes.ok) setProfile(await profRes.json());
        
        // Fetch Bookings
        const bkgRes = await fetch("http://localhost:8080/bookings/bookings/my", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if(bkgRes.ok) setBookings(await bkgRes.json());
        
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    window.location.href = "/";
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground animate-pulse">Profil yükleniyor...</div>;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold flex items-center gap-3"><User className="w-8 h-8 text-primary"/> Hesabım</h1>
         <Button variant="destructive" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2"/> Çıkış Yap</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="md:col-span-1 shadow-sm h-min">
            <CardHeader className="bg-muted/20 border-b">
               <CardTitle>Profil Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div>
                 <p className="text-sm text-muted-foreground">E-posta Adresi</p>
                 <p className="font-semibold">{profile?.email || localStorage.getItem("user_email")}</p>
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Ad Soyad</p>
                 <p className="font-semibold">{profile?.full_name || "Belirtilmemiş"}</p>
               </div>
               <Button variant="outline" className="w-full mt-2">Bilgileri Güncelle</Button>
            </CardContent>
         </Card>

         <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="bg-muted/20 border-b">
               <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5 text-primary"/> Biletlerim ({bookings.length})</CardTitle>
               <CardDescription>Geçmiş ve gelecek tüm yolculuklarınız</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {bookings.length === 0 ? (
                 <div className="p-12 text-center text-muted-foreground">
                    Henüz hiç biletiniz bulunmuyor.
                    <br/>
                    <Button variant="link" onClick={()=>router.push("/")}>Hemen bilet al</Button>
                 </div>
               ) : (
                 <div className="divide-y">
                   {bookings.map(b => (
                     <div key={b.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/10 transition-colors">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded text-muted-foreground">PNR: KTUR-{b.id.toString().padStart(5,'0')}</span>
                           <span className="text-xs font-bold px-2 py-0.5 bg-green-500/10 text-green-600 rounded uppercase">{b.durum}</span>
                         </div>
                         <h4 className="font-bold text-lg">Sefer No: {b.trip_id}</h4>
                         <p className="text-sm text-muted-foreground">Yolcu: {b.yolcu_adi || "Belirtilmemiş"}</p>
                       </div>
                       <div className="text-left sm:text-right">
                         <div className="text-sm text-muted-foreground mb-1">
                            Alım Tarihi
                         </div>
                         <div className="font-medium">
                            {new Intl.DateTimeFormat("tr-TR").format(new Date(b.islem_zamani))}
                         </div>
                         <div className="text-primary font-bold mt-1">Koltuk {b.koltuk_no}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
