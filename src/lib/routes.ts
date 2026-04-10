export const ROUTES = {
  home: '/',
  yonetim: '/admin',
  yonetimGiris: '/admin/giris',
  yonetimUrunler: '/admin/urunler',
  yonetimUrunYeni: '/admin/urunler/yeni',
  yonetimVaryasyonlar: '/admin/varyasyonlar',
  /** @deprecated Use yonetimVaryasyonlar */
  yonetimVaryasyonAtamalari: '/admin/varyasyonlar',
  urun: '/product',
  legacyUrun: '/urun',
} as const;

export const API_ROUTES = {
  urunler: '/api/urunler',
  yonetimUrunler: '/api/admin/urunler',
  yonetimAlanSablonlari: '/api/admin/alan-sablonlari',
  yonetimUrunTipleri: '/api/admin/urun-tipleri',
  yonetimVaryasyonGruplari: '/api/admin/varyasyon-gruplari',
  upload: '/api/upload',
  yonetimOturumGiris: '/api/admin/oturum/giris',
  yonetimOturumBen: '/api/admin/oturum/ben',
  yonetimOturumCikis: '/api/admin/oturum/cikis',
} as const;

export function urunDetayRoute(slug: string) {
  return `${ROUTES.urun}/${slug}`;
}

export function yonetimUrunDuzenleRoute(id: string) {
  return `${ROUTES.yonetimUrunler}/${id}/duzenle`;
}

export function yonetimVaryasyonGrubuByIdRoute(id: string) {
  return `${API_ROUTES.yonetimVaryasyonGruplari}/${id}`;
}

export function apiUrunByIdRoute(id: string) {
  return `${API_ROUTES.yonetimUrunler}/${id}`;
}

export function apiVaryasyonAtamasiByIdRoute(id: string) {
  return `${API_ROUTES.yonetimAlanSablonlari}/${id}`;
}
