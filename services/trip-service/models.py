from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    kalkis_sehri = Column(String, index=True, nullable=False)
    varis_sehri = Column(String, index=True, nullable=False)
    kalkis_zamani = Column(DateTime, nullable=False)
    fiyat = Column(Float, nullable=False)
    toplam_koltuk = Column(Integer, default=40)
    # Dolu koltuk numaralarını JSON liste olarak tutuyoruz: [1, 5, 12, ...]
    dolu_koltuklar = Column(JSON, default=[])
    otobus_plakasi = Column(String, nullable=True, default="43 KT 001")