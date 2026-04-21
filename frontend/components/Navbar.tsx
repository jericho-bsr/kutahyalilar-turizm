"use client";

import Link from "next/link";
import { Bus, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("user_email");
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    setIsLoggedIn(false);
    setUserEmail("");
    window.location.href = "/";
  };

  if (!isClient) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight text-primary hidden md:inline-block">
            Kütahyalılar Turizm
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href={isLoggedIn ? "/profile" : "/trips"}>
              <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary">
                {isLoggedIn ? "Seferlerim" : "Seferler"}
              </Button>
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/profile">
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{userEmail}</span>
                  </Button>
                </Link>
                <Button variant="destructive" size="icon" onClick={handleLogout} title="Çıkış Yap">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button>Giriş Yap / Üye Ol</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
}
