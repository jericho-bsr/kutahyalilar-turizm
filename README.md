# Kütahyalılar Turizm Biletleme Sistemi

Bu proje, modern mikroservis mimarisi ile tasarlanmış bir otobüs biletleme sistemidir. Kullanıcıların güvenli bir şekilde üye olabileceği, sefer arayabileceği, 2+1 koltuk düzeni üzerinden koltuk seçip sahte ödeme (mock) yapabileceği uçtan uca bir çözümdür.

## 🚀 Teknolojiler
- **Frontend:** Next.js (App Router), React, TailwindCSS, shadcn/ui
- **Backend:** Python (FastAPI)
- **Database:** PostgreSQL
- **Cache:** Redis (Trips ve oturum yönetimi için)
- **Message Broker:** Kafka & Zookeeper (Bilet onaylarında asenkron mail/sms bildirimi)
- **DevOps:** Docker, Docker Compose, Kubernetes (K8s)

## 📌 Versiyon Geçmişi (Versioning)
- **v1.0.0:** Temel mikroservis altyapısı, backend API endpoint'leri ve basit veritabanı entegrasyonu.
- **v2.0.0:** Next.js ile tamamen dinamik (2+1 koltuk seçimi) frontend arayüzü eklendi. Redis Cache ve Kafka Message Queue sistemleri entegre edildi. Kubernetes Deployment dosyaları tamamlandı.

## 🏗 Mimari Yapı

Proje toplam 6 mikroservis ve 1 API Gateway içermektedir. Frontend, tüm isteklerini Gateway üzerinden yapar.

1. **API Gateway (FastAPI):** Dışarıdan (`8080` portu) gelen frontend isteklerini mikroservislere yönlendirir (Proxy/CORS çözümü).
2. **Auth Service:** Kayıt ve Login işlemlerini JWT token üreterek yapar. PostgreSQL `users` tablosunu kullanır.
3. **User Service:** Kullanıcı profillerini listeler ve günceller. PostgreSQL `users` tablosuna (Auth ile ortak veri modeli üzerinden) bağlıdır.
4. **Trip Service:** Sefer listesini, yeni sefer eklemeyi ve 2+1 koltuk doluluk durumunu kontrol eder. Sonuçlar **Redis** üzerinde cache'lenir.
5. **Booking Service:** Satın alınan biletleri PostgreSQL `bookings` tablosuna kaydeder ve **Kafka**'daki `bilet_onay_kanali` topic'ine mesaj fırlatır.
6. **Payment Service:** Ödeme sayfasında (Mock) banka süresini simüle ederek başarılı yanıt döner.
7. **Notification Service:** Kafka'yı dinleyerek bilet onaylandığında sahte mail/SMS bildirimi atar (Konsol çıktısı olarak).

## 📂 Klasör Dizilimi

```text
bus-ticket-app/
├── services/                 # Backend Mikroservisleri
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── trip-service/
│   ├── booking-service/
│   ├── payment-service/
│   └── notification-service/
├── frontend/                 # Next.js Uygulaması
│   ├── app/                  # Sayfalar (Booking, Auth, Payment vb.)
│   └── components/           # Navbar ve UI bileşenleri
├── k8s/                      # Kubernetes Dağıtım YAML Dosyaları
├── docker-compose.yml        # Tüm altyapıyı tek tuşla çalıştırmak için
├── .gitignore
└── README.md
```

## ⚙️ Kurulum & Çalıştırma (Lokal)

Tüm sistemi ayağa kaldırmak için bilgisayarınızda **Docker** kurulu olmalıdır.

1. Ana dizinde terminali açıp arka plan servislerini başlatın:
   ```bash
   docker-compose up --build -d
   ```
   *Not: Kafka ve PostgreSQL'in hazır olması birkaç saniye sürebilir.*

2. Frontend'i (Next.js) çalıştırmak için yeni bir terminalde `frontend` klasörüne girin:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Gerekirse test verisi yüklemek veya test script'ini çalıştırmak için `test_bilet.py` dosyasını inceleyebilirsiniz.

4. Tarayıcınızda **http://localhost:3000** adresine giderek sistemi kullanmaya başlayabilirsiniz!

## ☸️ Kubernetes Ortamına Dağıtım

K8s klasöründeki YAML dosyaları kullanılarak Kubernetes'e de deploy edilebilir. Bunun için Minikube vb. ortamda:

```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/kafka.yaml
# ... diger tum deployment'lar
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/ingress.yaml
```
