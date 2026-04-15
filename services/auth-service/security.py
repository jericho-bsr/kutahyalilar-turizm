from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Güvenlik Ayarları (Gerçek projelerde SECRET_KEY .env dosyasında saklanır)
SECRET_KEY = "kutahyalilar_turizm_cok_gizli_anahtar" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Token 1 saat geçerli olacak

# Şifre hash'leme ayarları
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Kullanıcının girdiği şifre ile veritabanındaki gizli şifreyi karşılaştırır"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Şifreyi gizler (hash'ler)"""
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """Verilen bilgilerle yeni bir JWT token üretir"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt