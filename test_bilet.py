import requests
import time

print("--- KÜTAHYALILAR TURİZM SİSTEM TESTİ ---")

# 1. GİRİŞ YAP VE TOKEN AL
print("\n1. Gateway üzerinden Auth Servisine gidiliyor (Giriş yapılıyor)...")
login_bilgileri = {
    "username": "test@simav.com", # Kendi kayıt olduğun e-posta
    "password": "supergizlisifre"  # Kendi şifren
}
auth_cevap = requests.post("http://127.0.0.1:8080/auth/login", data=login_bilgileri)

if auth_cevap.status_code == 200:
    token = auth_cevap.json().get("access_token")
    print(f"✅ Giriş Başarılı! Token alındı: {token[:15]}...")
else:
    print(f"❌ Giriş Başarısız! Hata: {auth_cevap.text}")
    exit()

time.sleep(1)

# 2. BİLET SATIN AL (KAFKA'YI TETİKLE)
print("\n2. Gateway üzerinden Booking Servisine gidiliyor (Bilet alınıyor)...")
basliklar = {
    "Authorization": f"Bearer {token}"
}
bilet_bilgisi = {
    "trip_id": 1 # 1 Numaralı Simav - Kütahya seferi
}

bilet_cevap = requests.post(
    "http://127.0.0.1:8080/bookings/bookings", 
    json=bilet_bilgisi, 
    headers=basliklar
)

if bilet_cevap.status_code == 200:
    print("✅ Bilet Başarıyla Satın Alındı!")
    print("Gelen Cevap:", bilet_cevap.json())
else:
    print(f"❌ Bilet Alınamadı! Hata: {bilet_cevap.text}")