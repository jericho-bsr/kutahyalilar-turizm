from pydantic import BaseModel
from datetime import datetime

class BookingCreate(BaseModel):
    trip_id: int

class BookingResponse(BaseModel):
    id: int
    kullanici_email: str
    trip_id: int
    islem_zamani: datetime
    durum: str

    class Config:
        from_attributes = True