from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import models, database, schemas
import redis
import json

# Tabloları oluştur
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Kütahyalılar Turizm - Trip Service",
    description="Otobüs seferleri ve rota yönetim servisi",
    version="1.0.0"
)

# Redis bağlantısı (cache için)
try:
    redis_client = redis.Redis(host='kturizm-redis', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    print("✅ Redis bağlantısı başarılı!")
except Exception as e:
    print(f"⚠️ Redis bağlantı hatası: {e} - Cache devre dışı.")
    redis_client = None

CACHE_TTL = 60  # 60 saniye cache süresi

@app.get("/")
def ana_sayfa():
    return {"mesaj": "Trip Service veritabanına bağlandı! 🚌", "durum": "aktif"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- YENİ SEFER EKLEME ---
@app.post("/trips", response_model=schemas.TripResponse)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(database.get_db)):
    yeni_sefer = models.Trip(
        kalkis_sehri=trip.kalkis_sehri,
        varis_sehri=trip.varis_sehri,
        kalkis_zamani=trip.kalkis_zamani,
        fiyat=trip.fiyat,
        toplam_koltuk=trip.toplam_koltuk,
        dolu_koltuklar=[],
        otobus_plakasi=trip.otobus_plakasi
    )
    db.add(yeni_sefer)
    db.commit()
    db.refresh(yeni_sefer)
    
    # Cache'i temizle (yeni sefer eklendi)
    if redis_client:
        keys = redis_client.keys("trips:*")
        for key in keys:
            redis_client.delete(key)
    
    return yeni_sefer

# --- TÜM SEFERLERİ LİSTELEME (Filtreleme + Redis Cache) ---
@app.get("/trips", response_model=list[schemas.TripResponse])
def get_all_trips(
    kalkis: Optional[str] = Query(None, description="Kalkış şehri filtresi"),
    varis: Optional[str] = Query(None, description="Varış şehri filtresi"),
    db: Session = Depends(database.get_db)
):
    cache_key = f"trips:{kalkis or 'all'}:{varis or 'all'}"
    
    # Önce Redis cache'e bak
    if redis_client:
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
    
    # Cache yoksa veritabanından çek
    query = db.query(models.Trip)
    if kalkis:
        query = query.filter(models.Trip.kalkis_sehri.ilike(f"%{kalkis}%"))
    if varis:
        query = query.filter(models.Trip.varis_sehri.ilike(f"%{varis}%"))
    
    seferler = query.all()
    
    # Sonucu cache'e yaz
    if redis_client and seferler:
        trip_list = [schemas.TripResponse.model_validate(s).model_dump(mode="json") for s in seferler]
        redis_client.setex(cache_key, CACHE_TTL, json.dumps(trip_list, default=str))
    
    return seferler

# --- TEK SEFER GETİRME ---
@app.get("/trips/{trip_id}", response_model=schemas.TripResponse)
def get_trip(trip_id: int, db: Session = Depends(database.get_db)):
    sefer = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not sefer:
        raise HTTPException(status_code=404, detail="Sefer bulunamadı!")
    return sefer

# --- KOLTUK REZERVASYONU ---
@app.post("/trips/{trip_id}/reserve-seat")
def reserve_seat(trip_id: int, seat: schemas.SeatReserve, db: Session = Depends(database.get_db)):
    sefer = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not sefer:
        raise HTTPException(status_code=404, detail="Sefer bulunamadı!")
    
    dolu = sefer.dolu_koltuklar or []
    
    if seat.koltuk_no in dolu:
        raise HTTPException(status_code=400, detail=f"Koltuk {seat.koltuk_no} zaten dolu!")
    
    if seat.koltuk_no < 1 or seat.koltuk_no > sefer.toplam_koltuk:
        raise HTTPException(status_code=400, detail=f"Geçersiz koltuk numarası! (1-{sefer.toplam_koltuk})")
    
    dolu.append(seat.koltuk_no)
    sefer.dolu_koltuklar = dolu.copy()  # SQLAlchemy JSON mutation detection için copy
    db.commit()
    db.refresh(sefer)
    
    # Cache temizle
    if redis_client:
        keys = redis_client.keys("trips:*")
        for key in keys:
            redis_client.delete(key)
    
    return {"mesaj": f"Koltuk {seat.koltuk_no} başarıyla rezerve edildi!", "dolu_koltuklar": sefer.dolu_koltuklar}