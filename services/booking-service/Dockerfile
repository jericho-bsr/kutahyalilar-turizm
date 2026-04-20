# Resmi Python sürümünü kullanıyoruz
FROM python:3.10-slim

# Konteyner içindeki çalışma klasörümüz
WORKDIR /app

# Kütüphane listesini kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tüm kodları kopyala
COPY . .

# (Başlatma komutunu docker-compose'dan vereceğimiz için burası temiz kalıyor)