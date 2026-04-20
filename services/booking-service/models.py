from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    kullanici_email = Column(String, index=True, nullable=False) # Bilet kimin?
    trip_id = Column(Integer, nullable=False)                    # Hangi sefer?
    islem_zamani = Column(DateTime, default=datetime.datetime.utcnow)
    durum = Column(String, default="Onaylandı")