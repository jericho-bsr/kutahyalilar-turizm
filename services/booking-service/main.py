from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from kafka import KafkaProducer
import json
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
    # 1. Bileti Veritabanına Kaydet
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