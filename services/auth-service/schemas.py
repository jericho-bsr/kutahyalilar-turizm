from pydantic import BaseModel, EmailStr
from typing import Optional

# Kullanıcı kayıt olurken bizden beklenen veriler
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

# Kullanıcı bilgilerini geri dönerken şifreyi GİZLEMEK için kullanacağımız şema
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True




# ... (önceki kodlar yukarıda kalsın) ...

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str