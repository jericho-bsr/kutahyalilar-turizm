from pydantic import BaseModel
from datetime import datetime

class TripCreate(BaseModel):
    kalkis_sehri: str
    varis_sehri: str
    kalkis_zamani: datetime
    fiyat: float
    toplam_koltuk: int = 40

class TripResponse(BaseModel):
    id: int
    kalkis_sehri: str
    varis_sehri: str
    kalkis_zamani: datetime
    fiyat: float
    toplam_koltuk: int

    class Config:
        from_attributes = True