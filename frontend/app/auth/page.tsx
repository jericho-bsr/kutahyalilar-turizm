"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusFront, Mail, Lock, User } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const res = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          const errorMsg = Array.isArray(err.detail) ? err.detail[0].msg : err.detail;
          throw new Error(errorMsg || "Giriş başarısız!");
        }
        
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_email", email);
        
        // Refresh to update navbar and route to home or back
        window.location.href = "/";
      } else {
        const res = await fetch("http://localhost:8080/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName }),
        });

        if (!res.ok) {
          const err = await res.json();
          const errorMsg = Array.isArray(err.detail) ? err.detail[0].msg : err.detail;
          throw new Error(errorMsg || "Kayıt başarısız!");
        }

        // Auto login after register
        const loginFormData = new URLSearchParams();
        loginFormData.append("username", email);
        loginFormData.append("password", password);
        const loginRes = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          body: loginFormData,
        });
        
        if (loginRes.ok) {
           const data = await loginRes.json();
           localStorage.setItem("token", data.access_token);
           localStorage.setItem("user_email", email);
           window.location.href = "/";
        } else {
           setIsLogin(true);
           setError("Kayıt başarılı, lütfen giriş yapın.");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] py-12">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <BusFront className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isLogin ? "Tekrar Hoş Geldiniz" : "Kütahyalılar'a Katılın"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Biletlerinizi yönetmek ve hızlı işlem yapmak için giriş yapın." 
              : "Kolay bilet alım işlemi için hemen hesabınızı oluşturun."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullname">Ad Soyad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="fullname" 
                    placeholder="Ad Soyad" 
                    className="pl-9 h-11" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="isim@ornek.com" 
                  className="pl-9 h-11" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                {isLogin && (
                  <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-primary">
                    Şifremi Unuttum
                  </Button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-9 h-11" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
              {loading ? "İşleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center border-t p-6 bg-muted/20">
          <p className="text-sm text-muted-foreground text-center">
            {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
            <Button 
              variant="link" 
              className="p-0 font-semibold text-primary" 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
            >
              {isLogin ? "Hemen Kayıt Olun" : "Giriş Yapın"}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
