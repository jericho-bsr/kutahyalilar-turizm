from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import database, models, security

# FastAPI'nin test ekranındaki (Swagger) "Kilit" butonunun çalışması için ayar
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Korumalı rotalara girerken çalışacak olan Güvenlik Görevlisi fonksiyonumuz
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı. Token geçersiz veya süresi dolmuş olabilir.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 1. Bize verilen token'ın şifresini gizli anahtarımızla çözüyoruz
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 2. Token'ın içinden çıkan email ile veritabanında o kullanıcıyı buluyoruz
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    # 3. Her şey yolundaysa kullanıcı bilgilerini içeriye gönderiyoruz
    return user