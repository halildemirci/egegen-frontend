# egegen-front-end

Next.js 16 tabanlı, tam özellikli e-ticaret ön yüzü. shadcn/ui bileşenleri ve Tailwind CSS v4 ile geliştirilmiştir.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Kullanılabilir Komutlar](#kullanılabilir-komutlar)
- [Admin Paneli](#admin-paneli)
- [Ürün Sistemi](#ürün-sistemi)
- [Deploy](#deploy)

---

## Özellikler

- 🛍️ Ürün listeleme ve detay sayfaları
- 🔧 Admin paneli (ürün, varyasyon ve dinamik alan yönetimi)
- 🎨 Açık/koyu tema desteği
- 📱 Tam responsive tasarım
- 🖼️ Çoklu ürün görseli yükleme
- ⚡ Varyasyon tabanlı stok ve fiyat yönetimi
- 📝 Ürüne özel dinamik alanlar (müşteri seçilebilir veya bilgi amaçlı)
- 🔍 SEO başlığı ve meta açıklaması desteği

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Dil | TypeScript |
| UI | shadcn/ui + Base UI |
| Stil | Tailwind CSS v4 |
| Tema | next-themes |
| Bildirim | Sonner |
| İkonlar | Lucide React |

---

## Proje Yapısı

```
src/
├── app/
│   ├── page.tsx                  # Ana sayfa (ürün listesi)
│   ├── product/[slug]/           # Ürün detay sayfası (EN)
│   ├── urun/[slug]/              # Ürün detay sayfası (TR)
│   ├── admin/                    # Admin paneli
│   │   ├── giris/                # Admin girişi
│   │   ├── urunler/              # Ürün yönetimi (liste, yeni, düzenle)
│   │   └── varyasyonlar/         # Varyasyon grup yönetimi
│   └── api/                      # API route'ları
├── components/
│   ├── admin/                    # Admin bileşenleri
│   ├── product/                  # Ürün detay bileşenleri
│   ├── store/                    # Mağaza shell bileşenleri
│   ├── shared/                   # Paylaşımlı bileşenler
│   └── ui/                       # shadcn/ui bileşenleri
├── lib/
│   ├── admin-catalog.ts          # Admin form → FormData dönüşümü
│   ├── backend-mappers.ts        # Backend yanıtı → frontend tipi eşleşmesi
│   ├── catalog.ts                # Mağaza tarafı veri çekme
│   └── routes.ts                 # API route sabitleri
└── types/                        # TypeScript tip tanımları
```

---

## Kurulum

**Gereksinimler:** Node.js 20+

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## Ortam Değişkenleri

Proje kökünde `.env.local` dosyası oluşturun:

```env
# Backend API adresi (zorunlu)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Sitenin genel URL'i (SEO ve meta tag'ler için)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Vercel'e deploy ederken** bu değişkenleri Vercel dashboard → Settings → Environment Variables bölümünden ekleyin.

---

## Kullanılabilir Komutlar

```bash
npm run dev      # Geliştirme sunucusunu başlatır (Turbopack)
npm run build    # Production build alır
npm run start    # Production build'i başlatır
npm run lint     # ESLint kontrolü çalıştırır
```

---

## Admin Paneli

Admin paneline `/admin/giris` üzerinden erişilir. Oturum açıldıktan sonra:

| Sayfa | Adres | Açıklama |
|-------|-------|----------|
| Dashboard | `/admin` | Genel bakış |
| Ürünler | `/admin/urunler` | Ürün listeleme |
| Yeni Ürün | `/admin/urunler/yeni` | 4 adımlı ürün oluşturma sihirbazı |
| Ürün Düzenle | `/admin/urunler/[id]/duzenle` | Mevcut ürünü düzenleme |
| Varyasyonlar | `/admin/varyasyonlar` | Varyasyon grup ve değer yönetimi |

### Ürün Oluşturma Sihirbazı

Dört adımdan oluşur:

1. **Temel Bilgiler** — Ad, slug, açıklama, fiyat, stok, SKU, durum, SEO
2. **Ürüne Özel Alanlar** — Ürüne özgü dinamik alanlar (metin, seçim, radyo, onay kutusu)
3. **Varyasyonlar** — Beden/renk gibi varyasyon grupları ve kombinasyonları
4. **Medya** — Ürün görselleri (sürükle-bırak destekli)

### Dinamik Alanlar

Her ürüne özel alan için:
- **Alan tipi:** `input`, `textarea`, `select`, `radio`, `checkbox`, `switch`
- **Müşteri seçebilir mi (isInteractive):** Açıksa, ürün sayfasında müşteriye seçim olarak gösterilir. Kapalıysa yalnızca bilgi amaçlı görüntülenir.

---

## Ürün Sistemi

### Varyasyon Mantığı

- Ürünün varyasyonu varsa stok/fiyat varyasyondan hesaplanır
- Varyasyon yoksa `baseStock` / `basePrice` kullanılır
- Seçilen varyasyon kombinasyonu `VariationSelector` bileşeniyle yönetilir

### Backend Entegrasyonu

API istekleri `src/lib/backend-api.ts` üzerinden gönderilir. Yanıtlar `src/lib/backend-mappers.ts` içindeki `mapBackendProductToFrontend` fonksiyonuyla frontend tiplerine dönüştürülür.

Ortam değişkeni tanımlı değilse varsayılan olarak `http://localhost:8000/api/v1` kullanılır.

---

## Deploy

### Vercel (Önerilen)

```bash
# Vercel CLI ile
npm i -g vercel
vercel
```

Ya da [vercel.com](https://vercel.com) → **Import Git Repository** → GitHub reposunu seçin.

Deploy sonrası `.env` değişkenlerini Vercel dashboard'dan ayarlamayı unutmayın.

### Diğer Platformlar

```bash
npm run build
npm run start
```

`npm run build` çıktısı `.next/` klasörüne yazılır. Node.js 20+ gerektiren herhangi bir sunucuda çalıştırılabilir.
