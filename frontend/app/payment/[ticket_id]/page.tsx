"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, CreditCard, Lock } from "lucide-react";

export default function PaymentPage({ params }: { params: Promise<{ ticket_id: string }> }) {
  const router = useRouter();
  const { ticket_id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ticket_id: parseInt(ticket_id),
        amount: 250.0, // Should be fetched from backend normally, static for mock
        card_number: cardNumber
      };

      const res = await fetch("http://localhost:8080/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Ödeme işlemi reddedildi. Lütfen bilgilerinizi kontrol edin.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Ödeme Başarılı!</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Biletiniz başarıyla oluşturuldu. Bilet detayları kayıtlı e-posta adresinize (SMS/E-posta simülasyonu) gönderildi.
        </p>
        <div className="p-6 bg-card border rounded-xl shadow-sm text-left max-w-sm w-full mb-8 space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Kayıt No (PNR)</span>
            <span className="font-bold font-mono">KTUR-{ticket_id.padStart(5, '0')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durum</span>
            <span className="font-bold text-green-500">ONAYLANDI</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => router.push("/profile")} variant="outline">Biletlerim</Button>
          <Button onClick={() => router.push("/")}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <Card className="border-border/50 shadow-xl overflow-hidden">
        <div className="bg-primary/10 p-6 flex flex-col md:flex-row items-center justify-between border-b">
           <div>
             <h2 className="text-2xl font-bold text-foreground">Güvenli Ödeme</h2>
             <p className="text-muted-foreground flex items-center gap-1.5"><Lock className="w-4 h-4"/> 256-bit SSL Korunmaktadır</p>
           </div>
           <div className="text-right mt-4 md:mt-0">
             <p className="text-sm font-medium text-muted-foreground">Ödenecek Tutar</p>
             <p className="text-4xl font-extrabold text-primary">250.00 TL</p>
           </div>
        </div>
        
        <form onSubmit={handlePayment}>
          <CardContent className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-6 flex gap-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0"/> {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cname">Kart Üzerindeki İsim</Label>
              <Input id="cname" required value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="Örn: AHMET YILMAZ" className="uppercase" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccnum">Kart Numarası</Label>
              <div className="relative">
                 <CreditCard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                 <Input 
                   id="ccnum" 
                   required 
                   maxLength={19}
                   value={cardNumber} 
                   onChange={e => {
                     let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                     let formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                     setCardNumber(formatted);
                   }}
                   placeholder="0000 0000 0000 0000" 
                   className="pl-10 font-mono text-lg" 
                 />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="exp">Son Kullanma (AA/YY)</Label>
                 <Input 
                   id="exp" 
                   required 
                   maxLength={5}
                   placeholder="12/28" 
                   value={expiry}
                   onChange={e => {
                     let v = e.target.value.replace(/\D/g, '');
                     if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2,4);
                     setExpiry(v);
                   }}
                   className="font-mono text-center text-lg" 
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="cvv">CVV Güvenlik Kodu</Label>
                 <Input id="cvv" required maxLength={3} value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,''))} type="password" placeholder="•••" className="font-mono text-center text-lg" />
               </div>
            </div>
            
            <div className="pt-4 flex items-center justify-center gap-6 opacity-60 grayscale">
               <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-8 object-contain" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-8 object-contain" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Logo_TROY.svg" alt="Troy" className="h-8 object-contain" />
            </div>
          </CardContent>

          <CardFooter className="bg-muted/30 p-6 md:p-8 border-t">
            <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-xl" disabled={loading}>
               {loading ? "Ödeme Onaylanıyor..." : "250.00 TL Öde ve Biletini Al"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Quick fallback for AlertCircle locally if not imported
function AlertCircle(props:any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
