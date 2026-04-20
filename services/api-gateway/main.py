from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <-- İŞTE EKSİK OLAN HAYAT KURTARICI SATIR
import httpx

app = FastAPI(
    title="Kütahyalılar Turizm - API Gateway",
    description="Tüm mikroservislerin tek giriş noktası ve trafik yönlendiricisi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Arka planda çalışan servislerimizin adres defteri
SERVICES = {
    "auth": "http://auth-service:8000",
    "trips": "http://trip-service:8001",
    "bookings": "http://booking-service:8002",
}

@app.get("/")
def gateway_merkez():
    return {"mesaj": "API Gateway Çalışıyor. Trafik yönlendirmeye hazır! 🚦", "durum": "aktif"}

# --- BÜYÜLÜ YÖNLENDİRİCİ ---
# Kullanıcıdan gelen isteği alır, ilgili servise iletir ve cevabı geri döndürür.
@app.api_route("/{service_name}/{api_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def trafik_polisi(service_name: str, api_path: str, request: Request):
    # İstenen servis bizim adres defterimizde var mı?
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail="Böyle bir servis bulunamadı!")
        
    # Hedef URL'i oluştur (Örn: http://127.0.0.1:8000/login)
    hedef_url = f"{SERVICES[service_name]}/{api_path}"
    
    async with httpx.AsyncClient() as client:
        # Gelen isteğin içeriğini (body) ve başlıklarını (headers) kopyala
        body = await request.body()
        headers = dict(request.headers)
        headers.pop("host", None) # Çakışmayı engellemek için host'u siliyoruz
        
        try:
            # İsteği ilgili mikroservise fırlat
            r = await client.request(
                method=request.method,
                url=hedef_url,
                headers=headers,
                content=body
            )
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail=f"{service_name} servisi şu an ulaşılamaz durumda.")
        
        # O servisten gelen cevabı (şifrelenmiş token, bilet vb.) aynen kullanıcıya ilet
        return Response(content=r.content, status_code=r.status_code, headers=dict(r.headers))