from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from kafka import KafkaProducer
import json
import urllib.request
import urllib.error
import models, database, schemas, auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Kütahyalılar Turizm - Booking Service",
    description="Bilet satın alma ve rezervasyon servisi",
    version="1.0.0"
)

# Kafka'ya bağlanıyoruz
try:
    producer = KafkaProducer(
        bootstrap_servers='kafka:9092',
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
except Exception as e:
    print(f"Kafka bağlantı hatası: {e}")
    producer = None

@app.get("/")
def ana_sayfa():
    return {"mesaj": "Booking Service veritabanına bağlandı! 🎟️", "durum": "aktif"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/bookings", response_model=schemas.BookingResponse)
def create_booking(
    booking: schemas.BookingCreate, 
    db: Session = Depends(database.get_db),
    user_email: str = Depends(auth.get_current_user_email)
):
    # 1. Koltuk Müsaitliğini Kontrol Et ve Rezerve Et (Trip Service API Çağrısı)
    try:
        req = urllib.request.Request(
            f"http://trip-service:8001/trips/{booking.trip_id}/reserve-seat",
            data=json.dumps({"koltuk_no": booking.koltuk_no}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            pass # Başarılıysa devam et, koltuk ayrıldı
    except urllib.error.HTTPError as e:
        if e.code == 400:
            err_data = json.loads(e.read().decode("utf-8"))
            raise HTTPException(status_code=400, detail=err_data.get("detail", "Koltuk rezerve edilemedi."))
        elif e.code == 404:
            raise HTTPException(status_code=404, detail="Sefer bulunamadı.")
        else:
            raise HTTPException(status_code=500, detail="Trip servisiyle iletişim kurulamadı.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"İç hata: {str(e)}")

    # 2. Bileti Veritabanına Kaydet
    yeni_bilet = models.Booking(
        kullanici_email=user_email, 
        trip_id=booking.trip_id,
        koltuk_no=booking.koltuk_no,
        yolcu_adi=booking.yolcu_adi,
        yolcu_tc=booking.yolcu_tc,
        fiyat=booking.fiyat
    )
    db.add(yeni_bilet)
    db.commit()
    db.refresh(yeni_bilet)
    
    # 2. KAFKA'YA MESAJ GÖNDER
    if producer:
        mesaj = {
            "kullanici_email": user_email, 
            "trip_id": booking.trip_id,
            "koltuk_no": booking.koltuk_no,
            "yolcu_adi": booking.yolcu_adi,
            "durum": "ONAYLANDI"
        }
        producer.send('bilet_onay_kanali', mesaj)
        producer.flush()
    
    return yeni_bilet

# --- KULLANICININ BİLETLERİNİ GETİR ---
@app.get("/bookings/my", response_model=list[schemas.BookingResponse])
def get_my_bookings(
    db: Session = Depends(database.get_db),
    user_email: str = Depends(auth.get_current_user_email)
):
    biletler = db.query(models.Booking).filter(models.Booking.kullanici_email == user_email).all()
    return biletler