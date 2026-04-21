from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
import models, database, schemas

app = FastAPI(title="Kütahyalılar Turizm - User Service")

@app.get("/")
def ana_sayfa():
    return {"mesaj": "User Service çalışıyor! 👤", "durum": "aktif"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- KULLANICI PROFİLİNİ GETİR (email ile) ---
@app.get("/profile/{email}", response_model=schemas.UserProfile)
def get_user_profile(email: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")
    return user

# --- KULLANICI PROFİLİNİ GÜNCELLE ---
@app.put("/profile/{email}", response_model=schemas.UserProfile)
def update_user_profile(email: str, update_data: schemas.UserUpdate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")
    
    if update_data.full_name is not None:
        user.full_name = update_data.full_name
    if update_data.phone is not None:
        user.phone = update_data.phone
    
    db.commit()
    db.refresh(user)
    return user