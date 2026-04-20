from datetime import datetime, timedelta
from jose import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

# Diğer servislerle aynı dili konuşabilmek için aynı anahtarı kullanıyoruz
SECRET_KEY = "kutahyalilar_turizm_cok_gizli_anahtar" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Yeni ve güvenli şifreleme sistemimiz
password_hash = PasswordHash((BcryptHasher(),))

def get_password_hash(password: str) -> str:
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)

# YANLIŞLIKLA SİLDİĞİMİZ TOKEN ÜRETME FONKSİYONU
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt