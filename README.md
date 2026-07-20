# مجمع الإمام أحمد بن حنبل

موقع تعليمي أكاديمي إسلامي — محاضرات يوتيوب، مقالات، وكتب PDF.  
تابع للشيخ شعبان العودة.

## التقنيات

- **Frontend:** React + Vite (RTL، عربي)
- **Backend:** Node.js + Express + MongoDB
- **أمان:** Helmet, Rate Limiting, JWT (httpOnly cookies), bcrypt, multer آمن, DOMPurify

## هيكل المشروع

```
├── client/     # React (Vite)
├── server/     # Express API
└── assests/    # ملفات التخطيط
```

## التشغيل المحلي

### 1. إعداد قاعدة البيانات

أنشئ cluster على [MongoDB Atlas](https://www.mongodb.com/atlas) وانسخ رابط الاتصال.

### 2. Backend

```bash
cd server
cp .env.example .env
# عدّل .env: MONGODB_URI, JWT secrets, CLIENT_URL, ADMIN_*

npm install
npm run seed:admin    # إنشاء حساب الأدمن
npm run dev           # http://localhost:5000
```

### 3. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev           # http://localhost:5173
```

## لوحة التحكم

- المسار: `/admin/login`
- بيانات الدخول: ما في `.env` تحت `ADMIN_EMAIL` / `ADMIN_PASSWORD`

## API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/login` | تسجيل دخول |
| POST | `/api/auth/refresh` | تجديد التوكن |
| POST | `/api/auth/logout` | تسجيل خروج |
| GET/POST/PUT/DELETE | `/api/lectures` | المحاضرات |
| GET/POST/PUT/DELETE | `/api/articles` | المقالات |
| GET/POST/PUT/DELETE | `/api/books` | الكتب |
| POST | `/api/contact` | نموذج التواصل |

## النشر

| الجزء | المنصة المقترحة |
|-------|-----------------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| ملفات PDF | Render Disk أو Cloudinary |

## الأمان

- Rate limit: 100 طلب/15 دقيقة (عام) + 5 محاولات دخول/15 دقيقة
- JWT: access 15 دقيقة + refresh 7 أيام (httpOnly cookie)
- رفع ملفات: تحقق MIME + extension + magic bytes
- CORS: `CLIENT_URL` فقط — بدون `*` في الإنتاج
