from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class TripCreate(BaseModel):
    kalkis_sehri: str
    varis_sehri: str
    kalkis_zamani: datetime
    fiyat: float
    toplam_koltuk: int = 40
    otobus_plakasi: Optional[str] = "43 KT 001"

class TripResponse(BaseModel):
    id: int
    kalkis_sehri: str
    varis_sehri: str
    kalkis_zamani: datetime
    fiyat: float
    toplam_koltuk: int
    dolu_koltuklar: List[int] = []
    otobus_plakasi: Optional[str] = None

    class Config:
        from_attributes = True

class SeatReserve(BaseModel):
    koltuk_no: int