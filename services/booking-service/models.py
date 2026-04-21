from sqlalchemy import Column, Integer, String, DateTime, Float
from database import Base
import datetime

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    kullanici_email = Column(String, index=True, nullable=False)  # Bilet kimin?
    trip_id = Column(Integer, nullable=False)                      # Hangi sefer?
    koltuk_no = Column(Integer, nullable=True)                     # Hangi koltuk?
    yolcu_adi = Column(String, nullable=True)                      # Yolcu adı
    yolcu_tc = Column(String, nullable=True)                       # Yolcu TC
    islem_zamani = Column(DateTime, default=datetime.datetime.utcnow)
    durum = Column(String, default="Onaylandı")
    fiyat = Column(Float, nullable=True)