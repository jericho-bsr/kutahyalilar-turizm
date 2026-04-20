from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from kafka import KafkaProducer
import json
import models, database, schemas, auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Kafka'ya bağlanıyoruz (Eğer Kafka henüz hazır değilse hata vermesin diye try-except kullanıyoruz)
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

@app.post("/bookings", response_model=schemas.BookingResponse)
def create_booking(
    booking: schemas.BookingCreate, 
    db: Session = Depends(database.get_db),
    user_email: str = Depends(auth.get_current_user_email)
):
    # 1. Bileti Veritabanına Kaydet
    yeni_bilet = models.Booking(kullanici_email=user_email, trip_id=booking.trip_id)
    db.add(yeni_bilet)
    db.commit()
    db.refresh(yeni_bilet)
    
    # 2. KAFKA'YA MESAJ GÖNDER (Bilet onaylandı haberini ver)
    if producer:
        mesaj = {
            "kullanici_email": user_email, 
            "trip_id": booking.trip_id, 
            "durum": "ONAYLANDI"
        }
        producer.send('bilet_onay_kanali', mesaj) # 'bilet_onay_kanali' adlı gruba bağırıyoruz
        producer.flush()
    
    return yeni_bilet