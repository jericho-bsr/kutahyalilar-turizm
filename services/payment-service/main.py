from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
import random

app = FastAPI(title="Kütahyalılar Turizm - Payment Service (Mock)")

class PaymentRequest(BaseModel):
    ticket_id: int
    amount: float
    card_number: str

@app.post("/process")
async def process_payment(request: PaymentRequest):
    # Gerçekçilik katmak için sanki bankayla iletişime geçiyormuş gibi 1.5 saniye bekletelim
    await asyncio.sleep(1.5)
    
    # Başarılı bir banka dekontu simüle edelim
    return {
        "status": "success", 
        "transaction_id": f"TXN-{random.randint(10000, 99999)}", 
        "message": f"Bilet ID {request.ticket_id} için {request.amount} TL ödeme başarıyla alındı!"
    }