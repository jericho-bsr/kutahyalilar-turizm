import requests

print("--- KÜTAHYALILAR TURİZM YENİ KAYIT ---")

yeni_kullanici = {
    "email": "test@simav.com",
    "password": "supergizlisifre",
    "full_name": "Test Kullanıcısı"
}

# Gateway üzerinden Auth servisine kayıt isteği atıyoruz
cevap = requests.post("http://127.0.0.1:8080/auth/register", json=yeni_kullanici)

print("Durum Kodu:", cevap.status_code)
if cevap.status_code == 200:
    print("✅ Kullanıcı başarıyla oluşturuldu!")
    print("Bilgiler:", cevap.json())
else:
    print("❌ Bir hata oluştu:", cevap.text)