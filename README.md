# 🎛 Admin Panel (Vite + TypeScript + TailwindCSS)

Bu loyiha foydalanuvchilar, mahsulotlar, buyurtmalar yoki boshqa tizim resurslarini boshqarish uchun mo‘ljallangan **admin panel**dir. Loyihada zamonaviy texnologiyalar — **Vite**, **TypeScript** va **TailwindCSS** ishlatilgan.

---

## 📌 Asosiy imkoniyatlar

- 🔐 Kirish (Login) tizimi
- 👤 Foydalanuvchilarni boshqarish
- 📊 Dashboard (grafikalar, statistikalar)
- 🔄 API bilan integratsiya
- 🎨 Yengil, zamonaviy UI (Tailwind bilan)

---

## 🧰 Texnologiyalar

| Texnologiya | Tavsifi                        |
| ----------- | ------------------------------ |
| Vite        | Tez va yengil frontend bundler |
| TypeScript  | Xatolarga chidamli JavaScript  |
| TailwindCSS | Utility-first CSS framework    |
| PostCSS     | CSS transformatsiyasi          |

---

## ⚙️ Loyihani ishga tushirish

Quyidagi bosqichlarni bajaring:

### 1. Repozitoriyani yuklab olish

```bash
git clone https://github.com/ErgashevNur/admin-panel.git
cd admin
```

### 2. Bog‘liqliklarni o‘rnatish

```bash
npm install
# yoki
yarn install
```

### 3. Muhit sozlamalarini yaratish

`.env` faylni `admin` papkasiga yarating va quyidagicha to‘ldiring:

```env

VITE_API_KEY=https://mlm-backend.pixl.uz

```

### 4. Lokal serverni ishga tushirish

```bash
npm run dev
# yoki
yarn dev
```

### 5. Production build (majburiy emas)

```bash
npm run build
# yoki
yarn build
```

---

## 📁 Loyihaning tuzilmasi

```
admin/
├── public/               # Statik fayllar (favicon, logo, va boshqalar)
├── src/                  # Asosiy frontend manbalari
│   ├── components/       # UI komponentlar
│   ├── pages/            # Sahifalar
│   ├── i18n/             # Tarjima hizmati
│   ├── types/            # Typelar typescriptniki
│   └── App.tsx           # Asosiy ilova
├── .env                  # Maxfiy o‘zgaruvchilar (API URL)
├── package.json          # Loyihaning bog‘liqliklari
├── tailwind.config.js    # Tailwind sozlamalari
├── vite.config.ts        # Vite konfiguratsiyasi
└── tsconfig.json         # TypeScript konfiguratsiyasi
```

---

## 🚧 Eslatma

- Brauzerda test qilish uchun `localhost:5173` ni oching
- Agar siz boshqa portda ishga tushirishni xohlasangiz, `vite.config.ts` yoki `.env` faylida `PORT` belgilashingiz mumkin

---

## ✉️ Aloqa

Agar loyiha bo‘yicha savollaringiz bo‘lsa, quyidagi manzilga yozing:

- Telegram: [@CodeNur](https://t.me/CodeNur)
- Telegram: [@@rzmuxammed](https://t.me/@rzmuxammed)
- Email: muhammadnurullohergashev@gmail.com

---

### ✅ Tayyor
# frontend-mlm-marketing-admin-panel
