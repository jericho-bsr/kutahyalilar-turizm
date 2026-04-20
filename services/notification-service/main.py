from kafka import KafkaConsumer
import json
import time

print("Notification Service başlatılıyor... Kafka'nın uyanması için 15 saniye bekleniyor...")
time.sleep(15) # Docker ayağa kalkarken Kafka'nın tamamen hazır olmasını bekliyoruz

# Kafka'yı sürekli dinleyecek olan alıcıyı (Consumer) ayarlıyoruz
consumer = KafkaConsumer(
    'bilet_onay_kanali',
    bootstrap_servers='kafka:9092',
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    auto_offset_reset='latest'
)

print("Notification Service çalışıyor. Posta kutusu dinleniyor... 📧")

# Sonsuz döngü: Kafka'dan yeni bir mesaj geldikçe bu döngü çalışır
for message in consumer:
    veri = message.value
    email = veri.get('kullanici_email')
    trip = veri.get('trip_id')
    
    # Gerçek bir projede burada SMTP ile mail atılır. Biz terminale yazdırıyoruz.
    print(f"\n==========================================")
    print(f"📧 E-POSTA GÖNDERİLDİ!")
    print(f"Kime: {email}")
    print(f"Konu: Biletiniz Onaylandı! 🚌")
    print(f"İçerik: {trip} numaralı sefer için biletiniz başarıyla oluşturulmuştur. İyi yolculuklar dileriz!")
    print(f"==========================================\n")