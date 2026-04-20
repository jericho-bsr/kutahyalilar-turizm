from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Docker-compose dosyamızdaki veritabanı bilgileri
# localhost yerine 127.0.0.1 ve 5432 yerine 5433 yazıyoruz
SQLALCHEMY_DATABASE_URL = "postgresql://kturizm_admin:secretpassword@kturizm-postgres:5432/kturizm_db"

# Veritabanı motorunu oluşturuyoruz
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Veritabanı işlemleri için bir oturum (session) oluşturucu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tablo modellerimizi türeteceğimiz temel sınıf
Base = declarative_base()

# FastAPI'nin veritabanına bağlanıp işlem bitince bağlantıyı kapatmasını sağlayan fonksiyon
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()