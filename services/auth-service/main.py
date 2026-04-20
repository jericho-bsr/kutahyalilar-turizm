from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import models, database, schemas, security, oauth2

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Kütahyalılar Turizm - Auth Service",
    description="Kullanıcı giriş ve kayıt işlemlerini yöneten mikroservis"
)

@app.get("/")
def ana_sayfa():
    return {"mesaj": "Auth Service veritabanına bağlandı! 🚀", "durum": "aktif"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- KAYIT OLMA (REGISTER) ---
@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu email adresi zaten sistemde kayıtlı!")
    
    hashed_password = security.get_password_hash(user.password)
    
    yeni_kullanici = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name
    )
    
    db.add(yeni_kullanici)
    db.commit()
    db.refresh(yeni_kullanici)
    
    return yeni_kullanici

# --- GİRİŞ YAPMA (LOGIN) ---
# Form verisi kullandık ki Swagger ekranındaki "Authorize" butonu otomatik çalışsın
@app.post("/login", response_model=schemas.Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not db_user or not security.verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email veya şifre hatalı!")
    
    access_token = security.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- YENİ EKLENEN KORUMALI PROFİL ROTASI ---
@app.get("/me", response_model=schemas.UserResponse)
def profilimi_getir(current_user: models.User = Depends(oauth2.get_current_user)):
    """Sadece geçerli bir Token'ı olanlar bu rotaya erişebilir."""
    return current_user