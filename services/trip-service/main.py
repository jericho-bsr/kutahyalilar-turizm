from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, database, schemas

# Tabloları oluştur
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Kütahyalılar Turizm - Trip Service",
    description="Otobüs seferleri ve rota yönetim servisi",
    version="1.0.0"
)

@app.get("/")
def ana_sayfa():
    return {"mesaj": "Trip Service veritabanına bağlandı! 🚌", "durum": "aktif"}

# --- YENİ SEFER EKLEME ---
@app.post("/trips", response_model=schemas.TripResponse)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(database.get_db)):
    yeni_sefer = models.Trip(
        kalkis_sehri=trip.kalkis_sehri,
        varis_sehri=trip.varis_sehri,
        kalkis_zamani=trip.kalkis_zamani,
        fiyat=trip.fiyat,
        toplam_koltuk=trip.toplam_koltuk
    )
    db.add(yeni_sefer)
    db.commit()
    db.refresh(yeni_sefer)
    
    return yeni_sefer

# --- TÜM SEFERLERİ LİSTELEME ---
@app.get("/trips", response_model=list[schemas.TripResponse])
def get_all_trips(db: Session = Depends(database.get_db)):
    seferler = db.query(models.Trip).all()
    return seferler