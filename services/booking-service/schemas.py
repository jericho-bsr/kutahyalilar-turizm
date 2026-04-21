from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BookingCreate(BaseModel):
    trip_id: int
    koltuk_no: int
    yolcu_adi: Optional[str] = None
    yolcu_tc: Optional[str] = None
    fiyat: Optional[float] = None

class BookingResponse(BaseModel):
    id: int
    kullanici_email: str
    trip_id: int
    koltuk_no: Optional[int] = None
    yolcu_adi: Optional[str] = None
    islem_zamani: datetime
    durum: str
    fiyat: Optional[float] = None

    class Config:
        from_attributes = True