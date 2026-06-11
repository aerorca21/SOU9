var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  adminLimiter: () => adminLimiter,
  auditLogger: () => auditLogger,
  authFlowLocks: () => authFlowLocks,
  authorizeOwnership: () => authorizeOwnership,
  checkProductRisk: () => checkProductRisk,
  csrfAndOriginProtection: () => csrfAndOriginProtection,
  emitProductCreatedEvent: () => emitProductCreatedEvent,
  enforceAdminSession: () => enforceAdminSession,
  generalApiLimiter: () => generalApiLimiter,
  generateDeviceFingerprint: () => generateDeviceFingerprint,
  lockAuthFlow: () => lockAuthFlow,
  loginLimiter: () => loginLimiter,
  paymentsLogger: () => paymentsLogger,
  paypalVerifyLimiter: () => paypalVerifyLimiter,
  processNotificationQueue: () => processNotificationQueue,
  pushNotificationQueue: () => pushNotificationQueue,
  registerLimiter: () => registerLimiter,
  resetPasswordLimiter: () => resetPasswordLimiter,
  revokeAllSessions: () => revokeAllSessions,
  revokedSessions: () => revokedSessions,
  securityLogger: () => securityLogger,
  sellerSpamTracker: () => sellerSpamTracker,
  sessionStore: () => sessionStore,
  setSessionCookie: () => setSessionCookie,
  unlockAuthFlow: () => unlockAuthFlow,
  webhookLimiter: () => webhookLimiter
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_crypto2 = __toESM(require("crypto"), 1);
var import_fs3 = __toESM(require("fs"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_express_rate_limit = require("express-rate-limit");
var import_winston2 = __toESM(require("winston"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "db.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var SEED_CITIES = [
  { id: "c1", nameAr: "\u0627\u0644\u062F\u0627\u0631 \u0627\u0644\u0628\u064A\u0636\u0627\u0621", nameFr: "Casablanca", slug: "casablanca", region: "Casablanca-Settat", latitude: 33.5731, longitude: -7.5898 },
  { id: "c2", nameAr: "\u0627\u0644\u0631\u0628\u0627\u0637", nameFr: "Rabat", slug: "rabat", region: "Rabat-Sal\xE9-K\xE9nitra", latitude: 34.0209, longitude: -6.8416 },
  { id: "c3", nameAr: "\u0645\u0631\u0627\u0643\u0634", nameFr: "Marrakech", slug: "marrakech", region: "Marrakech-Safi", latitude: 31.6295, longitude: -7.9811 },
  { id: "c4", nameAr: "\u0641\u0627\u0633", nameFr: "F\xE8s", slug: "fes", region: "F\xE8s-Mekn\xE8s", latitude: 34.0181, longitude: -5.0078 },
  { id: "c5", nameAr: "\u0637\u0646\u062C\u0629", nameFr: "Tanger", slug: "tanger", region: "Tanger-Tetouan-Al Hoceima", latitude: 35.7595, longitude: -5.834 },
  { id: "c6", nameAr: "\u0623\u0643\u0627\u062F\u064A\u0631", nameFr: "Agadir", slug: "agadir", region: "Souss-Massa", latitude: 30.4278, longitude: -9.5981 },
  { id: "c7", nameAr: "\u0648\u062C\u062F\u0629", nameFr: "Oujda", slug: "oujda", region: "Oriental", latitude: 34.6867, longitude: -1.9114 },
  { id: "c8", nameAr: "\u0627\u0644\u0642\u0646\u064A\u0637\u0631\u0629", nameFr: "K\xE9nitra", slug: "kenitra", region: "Rabat-Sal\xE9-K\xE9nitra", latitude: 34.2541, longitude: -6.589 },
  { id: "c9", nameAr: "\u062A\u0637\u0648\u0627\u0646", nameFr: "T\xE9touan", slug: "tetouan", region: "Tanger-Tetouan-Al Hoceima", latitude: 35.5889, longitude: -5.3626 },
  { id: "c10", nameAr: "\u062A\u0645\u0627\u0631\u0629", nameFr: "T\xE9mara", slug: "temara", region: "Rabat-Sal\xE9-K\xE9nitra", latitude: 33.9267, longitude: -6.9121 },
  { id: "c11", nameAr: "\u0622\u0633\u0641\u064A", nameFr: "Safi", slug: "safi", region: "Marrakech-Safi", latitude: 32.2994, longitude: -9.2372 },
  { id: "c12", nameAr: "\u0627\u0644\u0645\u062D\u0645\u062F\u064A\u0629", nameFr: "Mohamm\xE9dia", slug: "mohammedia", region: "Casablanca-Settat", latitude: 33.6835, longitude: -7.3849 },
  { id: "c13", nameAr: "\u0627\u0644\u062C\u062F\u064A\u062F\u0629", nameFr: "El Jadida", slug: "el-jadida", region: "Casablanca-Settat", latitude: 33.2323, longitude: -8.5034 },
  { id: "c14", nameAr: "\u0628\u0646\u064A \u0645\u0644\u0627\u0644", nameFr: "Beni Mellal", slug: "beni-mellal", region: "B\xE9ni Mellal-Kh\xE9nifra", latitude: 32.3373, longitude: -6.3498 },
  { id: "c15", nameAr: "\u0627\u0644\u0646\u0627\u0638\u0648\u0631", nameFr: "Nador", slug: "nador", region: "Oriental", latitude: 35.1681, longitude: -2.9335 },
  { id: "c16", nameAr: "\u062A\u0627\u0632\u0629", nameFr: "Taza", slug: "taza", region: "F\xE8s-Mekn\xE8s", latitude: 34.2189, longitude: -4.01 },
  { id: "c17", nameAr: "\u0627\u0644\u0639\u064A\u0648\u0646", nameFr: "La\xE2youne", slug: "laayoune", region: "La\xE2youne-Sakia El Hamra", latitude: 27.1253, longitude: -13.1625 }
];
var SEED_CATEGORIES = [
  { id: "cat1", nameAr: "\u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0648\u0627\u0644\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A", nameFr: "V\xEAtements & Accessoires", slug: "clothing-accessories", icon: "Shirt", subcategories: ["Men Clothing", "Women Clothing", "Shoes", "Bags & Accessories", "Wholesale Fabrics"], sortOrder: 10 },
  { id: "cat2", nameAr: "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", nameFr: "\xC9lectronique grand public", slug: "consumer-electronics", icon: "Smartphone", subcategories: ["Smartphones & Tablets", "PCs & Laptops", "Cameras", "Smart Wearables", "Cables & Power"], sortOrder: 20 },
  { id: "cat3", nameAr: "\u0627\u0644\u0631\u064A\u0627\u0636\u0629 \u0648\u0627\u0644\u062A\u0631\u0641\u064A\u0647", nameFr: "Sports & Loisirs", slug: "sports-leisure", icon: "Activity", subcategories: ["Fitness Equipment", "Outdoor Gear", "Team Sports", "Water Sports", "Bicycles"], sortOrder: 30 },
  { id: "cat4", nameAr: "\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062A\u062C\u0645\u064A\u0644 \u0648\u0627\u0644\u0639\u0646\u0627\u064A\u0629", nameFr: "Produits de beaut\xE9", slug: "beauty-cosmetics", icon: "Sparkles", subcategories: ["Skincare", "Makeup", "Fragrances", "Haircare", "Salon Supplies"], sortOrder: 40 },
  { id: "cat5", nameAr: "\u0627\u0644\u0645\u062C\u0648\u0647\u0631\u0627\u062A\u060C \u0627\u0644\u0646\u0638\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0633\u0627\u0639\u0627\u062A", nameFr: "Bijoux, Lunettes & Montres", slug: "jewelry-watches", icon: "Watch", subcategories: ["Fine Jewelry", "Fashion Watches", "Sunglasses", "Optical Frames", "Cases & Cleaners"], sortOrder: 50 },
  { id: "cat6", nameAr: "\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u062A\u063A\u0630\u064A\u0629", nameFr: "Alimentation & Nutrition", slug: "food-nutrition", icon: "UtensilsCrossed", subcategories: ["Spices & Herbs", "Dry Fruits", "Oils & Fats", "Canned Goods", "Tea & Coffee"], sortOrder: 60 },
  { id: "cat7", nameAr: "\u0627\u0644\u0645\u0646\u0632\u0644 \u0648\u0627\u0644\u0645\u0637\u0628\u062E", nameFr: "Maison & Cuisine", slug: "home-kitchen", icon: "Home", subcategories: ["Appliances", "Cookware", "Home Decoration", "Bedding & Linens", "Storage & Organization"], sortOrder: 70 }
];
var DEFAULT_PASSWORDS = {
  "u-admin": "@@Admindegogh-/147147@@",
  "u-seller1": "seller123",
  "u-buyer1": "buyer123"
};
var DEFAULT_USERS = [
  {
    id: "u-admin",
    email: "admin@sou9aljoumla.com",
    name: "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 (Super Admin)",
    role: "superadmin",
    phone: "+212676543210",
    whatsapp: "+212676543210",
    city: "Rabat",
    points: 1e4,
    referralCode: "ADMIN7147",
    createdAt: "2026-01-10T00:00:00Z",
    isVerified: true,
    status: "active",
    profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    sales_count: 521,
    rating: 5
  },
  {
    id: "u-seller1",
    email: "maroc.wholesale@gmail.com",
    name: "\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629 (Maroc Wholesale)",
    role: "seller",
    phone: "+212611223344",
    whatsapp: "+212611223344",
    companyName: "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u0644\u062C\u0645\u0644\u0629",
    companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
    companyBanner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
    companyDesc: "\u0627\u0644\u0645\u0648\u0631\u062F \u0627\u0644\u0623\u0648\u0644 \u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0623\u0632\u064A\u0627\u0621\u060C \u0627\u0644\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A \u0627\u0644\u0641\u0627\u062E\u0631\u0629\u060C \u0648\u0627\u0644\u0639\u0637\u0648\u0631 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629 \u0641\u064A \u0627\u0644\u062F\u0627\u0631 \u0627\u0644\u0628\u064A\u0636\u0627\u0621 \u0648\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629.",
    city: "Casablanca",
    points: 850,
    referralCode: "MAROC2026",
    createdAt: "2026-02-01T12:00:00Z",
    isVerified: true,
    status: "active",
    profile_image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
    sales_count: 142,
    rating: 4.8
  },
  {
    id: "u-buyer1",
    email: "mohammed.boutique@yahoo.com",
    name: "\u0645\u062D\u0645\u062F \u0644\u0644\u0628\u0642\u0627\u0644\u0629 \u0648\u0627\u0644\u0623\u0632\u064A\u0627\u0621 (Mohamed Boutique)",
    role: "buyer",
    phone: "+212655667788",
    whatsapp: "+212655667788",
    city: "Marrakech",
    points: 200,
    referralCode: "BOUTIQ123",
    createdAt: "2026-03-15T08:30:00Z",
    isVerified: false,
    status: "active",
    profile_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    sales_count: 12,
    rating: 4.5
  }
];
var DEFAULT_PRODUCTS = [
  {
    id: "p1",
    title: "\u0639\u0637\u0631 \u0639\u0631\u0628\u064A \u0623\u0635\u064A\u0644 \u0641\u0627\u062E\u0631 \u0628\u0627\u0644\u062C\u0645\u0644\u0629 - \u0643\u0648\u0644\u0648\u0646\u064A\u0627 \u0627\u0644\u0639\u0648\u062F \u0648\u0627\u0644\u0645\u0633\u0643",
    titleFr: "Parfum Arabe Original de Gros Essence de Parfum Oud & Musk",
    description: "\u062A\u0645\u062A\u0639 \u0628\u0623\u0631\u0642\u0649 \u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u0639\u0637\u0631\u064A\u0629 \u0627\u0644\u0634\u0631\u0642\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629. \u0639\u0628\u0648\u0629 \u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0628\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u062D\u0644\u0627\u062A \u0627\u0644\u0631\u0627\u063A\u0628\u0629 \u0641\u064A \u062C\u0648\u062F\u0629 \u0645\u062A\u0645\u064A\u0632\u0629 \u0644\u0644\u0645\u0633\u062A\u0647\u0644\u0643 \u0627\u0644\u0645\u063A\u0631\u0628\u064A \u0627\u0644\u062D\u0635\u0631\u064A. \u062B\u0628\u0627\u062A \u064A\u062F\u0648\u0645 \u0644\u0623\u0643\u062B\u0631 \u0645\u0646 48 \u0633\u0627\u0639\u0629.",
    descriptionFr: "Profitez des meilleurs ingr\xE9dients de parfum oriental haut de gamme. Bouteille con\xE7ue pour les d\xE9taillants recherchant une qualit\xE9 sup\xE9rieure pour le consommateur marocain. Tenue de plus de 48 heures.",
    shortDescription: "\u0639\u0637\u0631 \u0639\u0631\u0628\u064A \u0623\u0635\u064A\u0644 \u0641\u0648\u0627\u062D \u0644\u0644\u0628\u064A\u0639 \u0628\u0627\u0644\u062C\u0645\u0644\u0629 \u062B\u0628\u0627\u062A \u0645\u0630\u0647\u0644",
    shortDescriptionFr: "Parfum arabe original de gros, tenue incroyable",
    category: "Produits de beaut\xE9",
    subcategory: "Fragrances",
    brand: "Al-Haramain",
    condition: "new",
    priceMin: 47.92,
    priceMax: 59.9,
    unitPrice: 59.9,
    bulkPrice: 47.92,
    currency: "MAD",
    moq: 2,
    maxOrder: 1e3,
    stock: 500,
    sku: "PERF-OUD-01",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["\u0639\u0637\u0648\u0631", "\u0639\u0648\u062F", "\u062C\u0645\u0644\u0629", "\u062A\u062C\u0645\u064A\u0644"],
    location: "Casablanca",
    sellerId: "u-seller1",
    createdAt: "2026-05-10T14:22:00Z",
    views: 683,
    status: "active",
    isFeatured: true,
    isPinned: false,
    slug: "parfum-arabe-original-oud-musk",
    sellerName: "\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629",
    sellerVerified: true,
    sellerCity: "Casablanca",
    sellerRating: 4.8
  },
  {
    id: "p2",
    title: "\u0646\u0638\u0627\u0631\u0627\u062A \u0634\u0645\u0633\u064A\u0629 \u0630\u0643\u064A\u0629 \u0641\u0648\u062A\u0648\u0643\u0631\u0648\u0645\u064A\u0629 \u0628\u0623\u0637\u0648\u0627\u0642 \u062D\u062F\u064A\u062F\u064A\u0629 \u0645\u062A\u064A\u0646\u0629",
    titleFr: "Lunettes de Soleil Photochromiques Carr\xE9es Sans Monture",
    description: "\u0646\u0638\u0627\u0631\u0627\u062A \u0639\u0645\u0644\u064A\u0629 \u0645\u0636\u0627\u062F\u0629 \u0644\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0641\u0648\u0642 \u0628\u0646\u0641\u0633\u062C\u064A\u0629 \u0648\u0645\u0645\u062A\u0627\u0632\u0629 \u0644\u0644\u062A\u0648\u0635\u064A\u0644 \u0648\u0627\u0644\u0633\u0641\u0631. \u0645\u0642\u0627\u0648\u0645\u0629 \u0644\u0644\u062E\u062F\u0634 \u0628\u0623\u0630\u0631\u0639 \u0645\u0631\u0646\u0629 \u062A\u0646\u0627\u0633\u0628 \u062C\u0645\u064A\u0639 \u0623\u062D\u062C\u0627\u0645 \u0627\u0644\u0648\u062C\u0647.",
    descriptionFr: "Lunettes pratiques anti-UV, parfaites pour la livraison et le voyage. R\xE9sistantes aux rayures avec branches flexibles adapt\xE9es \xE0 tous.",
    shortDescription: "\u0646\u0638\u0627\u0631\u0627\u062A \u0634\u0645\u0633\u064A\u0629 \u0645\u062A\u0637\u0648\u0631\u0629 \u0641\u0648\u062A\u0648\u0643\u0631\u0648\u0645\u064A\u0629 \u0644\u0644\u0628\u064A\u0639 \u0628\u0627\u0644\u062C\u0645\u0644\u0629",
    shortDescriptionFr: "Lunettes de soleil photochromiques pour vente en gros",
    category: "Bijoux, Lunettes & Montres",
    subcategory: "Sunglasses",
    brand: "photo-lens",
    condition: "new",
    priceMin: 13.48,
    priceMax: 18,
    unitPrice: 18,
    bulkPrice: 13.48,
    currency: "MAD",
    moq: 2,
    maxOrder: 5e3,
    stock: 1200,
    sku: "SHAD-PHOTO-02",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["\u0646\u0638\u0627\u0631\u0627\u062A", "\u0634\u0645\u0633\u064A\u0629", "\u0627\u0644\u0645\u0648\u0636\u0629", "\u0627\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A"],
    location: "Casablanca",
    sellerId: "u-seller1",
    createdAt: "2026-05-12T10:15:22Z",
    views: 427,
    status: "active",
    isFeatured: true,
    isPinned: false,
    slug: "lunettes-soleil-photochromiques",
    sellerName: "\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629",
    sellerVerified: true,
    sellerCity: "Casablanca",
    sellerRating: 4.8
  },
  {
    id: "p3",
    title: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0623\u0644\u0639\u0627\u0628 \u0627\u0644\u062F\u0648\u0645\u064A\u0646\u0648 \u0648\u0627\u0644\u0645\u0627\u0647\u062C\u0648\u0646\u062C \u0627\u0644\u0635\u064A\u0646\u064A\u0629 \u0627\u0644\u062A\u0642\u0644\u064A\u062F\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629",
    titleFr: "2026 Jeu de tuiles de Mahjong am\xE9ricain en acrylique de haute qualit\xE9",
    description: "\u0623\u062D\u062C\u0627\u0631 \u0645\u0627\u0647\u062C\u0648\u0646\u062C \u0623\u0643\u0631\u064A\u0644\u064A\u0643 \u0635\u0644\u0628\u0629 \u062B\u0642\u064A\u0644\u0629 \u0648\u0645\u062D\u0641\u0648\u0631\u0629 \u0628\u0646\u0642\u0648\u0634 \u0648\u0627\u0636\u062D\u0629\u060C \u0645\u0639 \u062D\u0642\u064A\u0628\u0629 \u0633\u0641\u0631 \u0643\u0644\u0627\u0633\u064A\u0643\u064A\u0629 \u0645\u062F\u0645\u062C\u0629. \u0647\u062F\u064A\u0629 \u0631\u0627\u0626\u0639\u0629 \u0648\u0645\u0645\u062A\u0627\u0632\u0629 \u0644\u0644\u0645\u0642\u0627\u0647\u064A \u0648\u0627\u0644\u0646\u0648\u0627\u062F\u064A.",
    descriptionFr: "Tuiles de mahjong acryliques lourdes et grav\xE9es avec sac de voyage classique int\xE9gr\xE9. Excellent pour caf\xE9s et clubs.",
    shortDescription: "\u0644\u0639\u0628\u0629 \u0645\u0627\u0647\u062C\u0648\u0646\u062C \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062C\u0648\u062F\u0629 \u062A\u062C\u0627\u0631\u0629 \u062C\u0645\u0644\u0629",
    shortDescriptionFr: "Mahjong de luxe acrylique haute qualit\xE9 gros",
    category: "Sports & Loisirs",
    subcategory: "Team Sports",
    brand: "ImperialGamer",
    condition: "new",
    priceMin: 269.51,
    priceMax: 970.24,
    unitPrice: 970.24,
    bulkPrice: 269.51,
    currency: "MAD",
    moq: 1,
    maxOrder: 100,
    stock: 80,
    sku: "BOARD-MAHJ-03",
    images: [
      "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["\u0627\u0644\u0639\u0627\u0628", "\u062A\u0633\u0644\u064A\u0629", "\u0645\u0627\u0647\u062C\u0648\u0646\u062C", "\u062C\u0645\u0644\u0629"],
    location: "Tangier",
    sellerId: "u-seller1",
    createdAt: "2026-05-20T17:40:02Z",
    views: 91,
    status: "active",
    isFeatured: true,
    isPinned: false,
    slug: "jeu-de-mahjong-acrylique-luxe",
    sellerName: "\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629",
    sellerVerified: true,
    sellerCity: "Casablanca",
    sellerRating: 4.8
  },
  {
    id: "p4",
    title: "\u062D\u0627\u0633\u0648\u0628 \u0645\u062D\u0645\u0648\u0644 \u0644\u0644\u0623\u0639\u0645\u0627\u0644 \u0628\u0645\u0639\u0627\u0644\u062C\u0627\u062A \u0642\u0648\u064A\u0629 \u0648\u0646\u0627\u0642\u0644 \u062A\u062E\u0632\u064A\u0646 \u0633\u0631\u064A\u0639 \u062C\u062F\u0627\u064B",
    titleFr: "PC Ordinateur Portable Professionnel Rapide Intel Core",
    description: "\u0623\u062C\u0647\u0632\u0629 \u062D\u0648\u0627\u0633\u064A\u0628 \u0645\u062D\u0645\u0648\u0644\u0629 \u0645\u0633\u062A\u0648\u0631\u062F\u0629 \u062F\u0631\u062C\u0629 \u0623\u0648\u0644\u0649 \u0644\u0644\u0634\u0631\u0643\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0632\u0639\u064A\u0646 \u0648\u0627\u0644\u0645\u0642\u0627\u0647\u064A \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0646\u0627\u0634\u0626\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629.",
    descriptionFr: "Ordinateurs portables d\u2019affaires reconditionn\xE9s d\u2019importation classe A pour les entreprises et revendeurs marocains.",
    shortDescription: "\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0645\u062D\u0645\u0648\u0644 \u0644\u0644\u0623\u0634\u063A\u0627\u0644 \u062C\u0648\u062F\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u0633\u0639\u0631 \u0645\u062B\u0627\u0644\u064A \u0644\u0644\u062C\u0645\u0644\u0629",
    shortDescriptionFr: "PC portable pro id\xE9ale en gros",
    category: "\xC9lectronique grand public",
    subcategory: "PCs & Laptops",
    brand: "ThinkNotebook",
    condition: "refurbished",
    priceMin: 2500,
    priceMax: 3800,
    unitPrice: 3800,
    bulkPrice: 2500,
    currency: "MAD",
    moq: 5,
    maxOrder: 500,
    stock: 250,
    sku: "LAP-THINK-04",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["\u062D\u0627\u0633\u0648\u0628", "\u0627\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", "\u0645\u0643\u062A\u0628", "\u062C\u0645\u0644\u0629"],
    location: "Rabat",
    sellerId: "u-seller1",
    createdAt: "2026-05-25T11:20:00Z",
    views: 1104,
    status: "active",
    isFeatured: true,
    isPinned: false,
    slug: "pc-ordinateur-portable-professionnel",
    sellerName: "\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629",
    sellerVerified: true,
    sellerCity: "Casablanca",
    sellerRating: 4.8
  }
];
var DEFAULT_COUPONS = [
  {
    id: "c-welcome",
    code: "WELCOME2026",
    type: "points",
    value: 100,
    expiryDate: "2026-12-31T23:59:59Z",
    usageLimit: 1e3,
    usageCount: 15,
    status: "active"
  },
  {
    id: "c-mad50",
    code: "MAD50OFF",
    type: "fixed",
    value: 50,
    minPurchase: 200,
    expiryDate: "2026-09-30T23:59:59Z",
    usageLimit: 500,
    usageCount: 8,
    status: "active"
  }
];
var DEFAULT_RECHARGE_CODES = [
  { id: "rc1", code: "SOU9-7147-CODE1", points: 300, expiryDate: "2026-12-31T23:59:59Z", status: "active" },
  { id: "rc2", code: "SOU9-2026-BONUS", points: 500, expiryDate: "2026-12-31T23:59:59Z", status: "active" },
  { id: "rc3", code: "SOU9-VIP-9999", points: 1200, expiryDate: "2026-12-31T23:59:59Z", status: "active" }
];
var DEFAULT_AUDIT_LOGS = [
  {
    id: "l1",
    adminId: "u-admin",
    adminEmail: "admin@sou9aljoumla.com",
    adminName: "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
    action: "\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0645\u0646\u0635\u0629",
    ip: "197.230.14.78",
    details: "\u062A\u0647\u064A\u0626\u0629 \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0648\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631 \u0627\u0644\u0634\u0631\u0643\u0627\u0621.",
    createdAt: "2026-06-10T00:00:00Z"
  }
];
var DEFAULT_COMMENTS = [
  {
    id: "cm1",
    productId: "p1",
    userId: "u-buyer1",
    userName: "\u0645\u062D\u0645\u062F \u0644\u0644\u0628\u0642\u0627\u0644\u0629 \u0648\u0627\u0644\u0623\u0632\u064A\u0627\u0621",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    text: "\u0647\u0644 \u062A\u062A\u0648\u0641\u0631 \u0639\u0637\u0648\u0631 \u0623\u062E\u0631\u0649 \u0645\u062B\u0644 \u0628\u0631\u0627\u0626\u062D\u0629 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0648\u0627\u0644\u0648\u0631\u062F \u0627\u0644\u0628\u0644\u062F\u064A \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u061F \u0646\u0631\u064A\u062F \u0637\u0644\u0628 \u0643\u0645\u064A\u0629 \u0643\u0628\u064A\u0631\u0629 \u0644\u062A\u062C\u0631\u0628\u062A\u0647\u0627 \u0623\u0648\u0644\u0627\u064B \u0641\u064A \u0627\u0644\u0645\u0631\u0627\u0643\u0634.",
    replies: [
      {
        id: "cmr1",
        userId: "u-seller1",
        userName: "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u0644\u062C\u0645\u0644\u0629",
        userAvatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
        text: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0623\u062E\u064A \u0627\u0644\u0643\u0631\u064A\u0645\u060C \u0646\u0639\u0645 \u0644\u062F\u064A\u0646\u0627 \u062A\u0634\u0643\u064A\u0644\u0629 \u0648\u0627\u0633\u0639\u0629 \u0628\u0631\u0627\u0626\u062D\u0629 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0648\u0627\u0644\u0648\u0631\u062F \u0627\u0644\u0645\u063A\u0631\u0628\u064A \u0627\u0644\u0623\u0635\u064A\u0644\u060C \u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628 \u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0644\u0644\u062C\u0645\u0644\u0629.",
        createdAt: "2026-05-11T16:00:00Z"
      }
    ],
    createdAt: "2026-05-11T09:12:00Z"
  }
];
var DEFAULT_REVIEWS = [
  {
    id: "r1",
    productId: "p1",
    userId: "u-buyer1",
    userName: "\u0645\u062D\u0645\u062F \u0644\u0644\u0628\u0642\u0627\u0644\u0629 \u0648\u0627\u0644\u0623\u0632\u064A\u0627\u0621",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    rating: 5,
    comment: "\u062C\u0648\u062F\u0629 \u0645\u062A\u0645\u064A\u0632\u0629 \u0648\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639 \u0648\u062A\u063A\u0644\u064A\u0641 \u0645\u062D\u0643\u0645 \u0644\u0644\u0632\u062C\u0627\u062C\u0627\u062A. \u0627\u0644\u0639\u0637\u0648\u0631 \u0646\u0641\u062F\u062A \u0645\u0646 \u0645\u062A\u062C\u0631\u0646\u0627 \u0641\u064A \u063A\u0636\u0648\u0646 \u0623\u0633\u0628\u0648\u0639 \u0648\u0627\u062D\u062F. \u0633\u0646\u0648\u0627\u0635\u0644 \u0627\u0644\u0634\u0631\u0627\u0621 \u0645\u0626\u0629 \u0628\u0627\u0644\u0645\u0626\u0629!",
    createdAt: "2026-05-15T12:00:00Z"
  }
];
var DEFAULT_REPORTS = [];
var DEFAULT_CONTACT_THREADS = [
  {
    id: "ct-1",
    userId: "u-seller1",
    name: "\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629 (Maroc Wholesale)",
    email: "maroc.wholesale@gmail.com",
    phone: "+212611223344",
    title: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0628\u062E\u0635\u0648\u0635 \u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0634\u0631\u0627\u0643\u0629 VIP",
    snippet: "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0625\u062F\u0627\u0631\u0629 \u0633\u0648\u0642 \u0627\u0644\u062C\u0645\u0644\u0629\u060C \u0623\u0631\u0633\u0644\u0646\u0627 \u0644\u0643\u0645 \u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0634\u0631\u0643\u0629 \u0648\u0646\u0631\u063A\u0628 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0634\u0627\u0631\u0629 \u0634\u0631\u064A\u0643 \u0645\u0648\u062B\u0642 \u0631\u0633\u0645\u064A \u0644\u062A\u0623\u0643\u064A\u062F \u0639\u0631\u0648\u0636 \u0627\u0644\u062C\u0645\u0644\u0629.",
    status: "unread",
    isImportant: true,
    isArchived: false,
    isTrash: false,
    createdAt: "2026-06-10T10:14:00Z",
    updatedAt: "2026-06-10T10:14:00Z",
    messages: [
      {
        id: "cm-1-1",
        sender: "user",
        senderName: "\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629",
        senderEmail: "maroc.wholesale@gmail.com",
        text: "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0625\u062F\u0627\u0631\u0629 \u0633\u0648\u0642 \u0627\u0644\u062C\u0645\u0644\u0629\u060C \u0623\u0631\u0633\u0644\u0646\u0627 \u0644\u0643\u0645 \u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0634\u0631\u0643\u0629 \u0648\u0646\u0631\u063A\u0628 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0634\u0627\u0631\u0629 \u0634\u0631\u064A\u0643 \u0645\u0648\u062B\u0642 \u0631\u0633\u0645\u064A \u0644\u062A\u0623\u0643\u064A\u062F \u0639\u0631\u0648\u0636 \u0627\u0644\u062C\u0645\u0644\u0629 \u0644\u0644\u0645\u062D\u0644\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u062A\u0639 \u0628\u0627\u0644\u062D\u0642\u0648\u0642 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064A\u0629 \u0627\u0644\u0645\u0648\u0633\u0639\u0629.",
        createdAt: "2026-06-10T10:14:00Z"
      }
    ]
  },
  {
    id: "ct-2",
    userId: "u-buyer1",
    name: "\u0645\u062D\u0645\u062F \u0644\u0644\u0628\u0642\u0627\u0644\u0629 \u0648\u0627\u0644\u0623\u0632\u064A\u0627\u0621",
    email: "mohammed.boutique@yahoo.com",
    phone: "+212655667788",
    title: "\u0645\u0634\u0643\u0644\u0629 \u0641\u064A \u0643\u0648\u062F \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A",
    snippet: "\u062A\u0645 \u062D\u0644 \u0625\u0634\u0643\u0627\u0644 \u0634\u062D\u0646 \u0646\u0642\u0627\u0637 \u0627\u0644\u0643\u0648\u062F \u0648\u062D\u0635\u0644\u062A \u0639\u0644\u0649 \u0631\u0635\u064A\u062F 500 \u0646\u0642\u0637\u0629 \u0628\u0646\u062C\u0627\u062D\u060C \u0634\u0643\u0631\u0627\u064B \u0644\u0643\u0645.",
    status: "read",
    isImportant: false,
    isArchived: false,
    isTrash: false,
    createdAt: "2026-06-09T15:30:00Z",
    updatedAt: "2026-06-09T16:15:00Z",
    messages: [
      {
        id: "cm-2-1",
        sender: "user",
        senderName: "\u0645\u062D\u0645\u062F \u0644\u0644\u0628\u0642\u0627\u0644\u0629 \u0648\u0627\u0644\u0623\u0632\u064A\u0627\u0621",
        senderEmail: "mohammed.boutique@yahoo.com",
        text: "\u0645\u0631\u062D\u0628\u0627\u064B\u060C \u0644\u062F\u064A \u0635\u0639\u0648\u0628\u0629 \u0641\u064A \u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062A\u0631\u062D\u064A\u0628\u064A \u0627\u0644\u062E\u0627\u0635 \u0628\u0627\u0644\u0646\u0642\u0627\u0637\u060C \u0639\u0646\u062F \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u064A\u0638\u0647\u0631 \u0623\u0646 \u0627\u0644\u0643\u0648\u062F \u0645\u0633\u062A\u0639\u0645\u0644.",
        createdAt: "2026-06-09T15:30:00Z"
      },
      {
        id: "cm-2-2",
        sender: "admin",
        senderName: "\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A \u0644\u0644\u0645\u0646\u0635\u0629",
        text: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 \u0641\u0646\u062F\u0645\u060C \u0642\u0645\u0646\u0627 \u0628\u0627\u0644\u062A\u062D\u0642\u0642 \u064A\u062F\u0648\u064A\u064B\u0627 \u0648\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u062D\u0633\u0627\u0628\u0643 \u0648\u0625\u0636\u0627\u0641\u0629 500 \u0646\u0642\u0637\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0645\u062D\u0641\u0638\u062A\u0643\u0645. \u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0631\u0635\u064A\u062F \u0648\u0627\u0633\u062A\u0645\u062A\u0627\u0639 \u0628\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0634\u0631\u0627\u0621.",
        createdAt: "2026-06-09T16:00:00Z"
      },
      {
        id: "cm-2-3",
        sender: "user",
        senderName: "\u0645\u062D\u0645\u062F \u0644\u0644\u0628\u0642\u0627\u0644\u0629 \u0648\u0627\u0644\u0623\u0632\u064A\u0627\u0621",
        senderEmail: "mohammed.boutique@yahoo.com",
        text: "\u062A\u0645 \u062D\u0644 \u0625\u0634\u0643\u0627\u0644 \u0634\u062D\u0646 \u0646\u0642\u0627\u0637 \u0627\u0644\u0643\u0648\u062F \u0648\u062D\u0635\u0644\u062A \u0639\u0644\u0649 \u0631\u0635\u064A\u062F 500 \u0646\u0642\u0637\u0629 \u0628\u0646\u062C\u0627\u062D\u060C \u0634\u0643\u0631\u0627\u064B \u0644\u0643\u0645 \u0639\u0644\u0649 \u0633\u0631\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0648\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0631\u0627\u0642\u064A.",
        createdAt: "2026-06-09T16:15:00Z"
      }
    ]
  }
];
var DEFAULT_WALLET_TRANSACTIONS = [
  {
    id: "wt1",
    userId: "u-seller1",
    type: "credit",
    amount: 1e3,
    points: 850,
    description: "\u0634\u062D\u0646 \u0631\u0635\u064A\u062F \u0628\u0627\u0642\u0629 \u0627\u0644\u0640 Pro \u0627\u0644\u0645\u062A\u0645\u064A\u0632\u0629 \u0644\u0644\u0645\u0639\u0644\u0646\u064A\u0646",
    status: "completed",
    createdAt: "2026-02-01T12:05:00Z"
  }
];
var DEFAULT_SETTINGS = {
  maintenanceMode: false,
  siteName: "Sou9AlJoumla",
  siteNameAr: "\u0633\u0648\u0642 \u0627\u0644\u062C\u0645\u0644\u0629",
  siteDescription: "\u0633\u0648\u0642 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A \u0627\u0644\u0623\u0648\u0644 \u0644\u0631\u0628\u0637 \u062A\u062C\u0627\u0631 \u0627\u0644\u062C\u0645\u0644\u0629 \u0628\u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0648\u0627\u0644\u0645\u062D\u0644\u0627\u062A \u0628\u062C\u0645\u064A\u0639 \u0645\u062F\u0646 \u0627\u0644\u0645\u0645\u0644\u0643\u0629.",
  primaryColor: "#ff6600",
  secondaryColor: "#1d2731",
  contactEmail: "support@sou9aljoumla.com",
  contactPhone: "+212522778899",
  address: "\u0634\u0627\u0631\u0639 \u0627\u0644\u0632\u0631\u0642\u0637\u0648\u0646\u064A\u060C \u0639\u0645\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u060C \u0627\u0644\u062F\u0627\u0631 \u0627\u0644\u0628\u064A\u0636\u0627\u0621\u060C \u0627\u0644\u0645\u063A\u0631\u0628",
  currency: "MAD"
};
var JsonDatabase = class {
  constructor() {
    this.data = this.load();
  }
  load() {
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const fileContent = import_fs.default.readFileSync(DB_FILE, "utf8");
        const parsed = JSON.parse(fileContent);
        const loadedData = {
          users: (parsed.users || []).map((u) => {
            const created_at = u.created_at || u.createdAt || (/* @__PURE__ */ new Date()).toISOString();
            const roleIsAdmin = u.role === "superadmin" || u.role === "admin" || u.role === "owner";
            const isAdmin = typeof u.isAdmin === "boolean" ? u.isAdmin : roleIsAdmin;
            const passChangedRec = parsed.passwordChanged || {};
            const passwordVersion = typeof u.passwordVersion === "number" ? u.passwordVersion : u.firstLoginDone === true || passChangedRec[u.id] === true || u.id !== "u-admin" && roleIsAdmin ? 1 : 0;
            const passwordChangedManually = typeof u.passwordChangedManually === "boolean" ? u.passwordChangedManually : passwordVersion > 0 || passChangedRec[u.id] === true;
            const firstLoginDone = typeof u.firstLoginDone === "boolean" ? u.firstLoginDone : passwordVersion > 0;
            let mustChangePassword = isAdmin && passwordVersion === 0;
            if (isAdmin && passwordChangedManually) {
              mustChangePassword = false;
            }
            return {
              ...u,
              created_at,
              createdAt: u.createdAt || created_at,
              verificationStatus: u.verificationStatus || (u.isVerified ? "verified" : "pending"),
              badges: u.badges || [],
              isAdmin,
              firstLoginDone,
              passwordVersion,
              passwordChangedManually,
              mustChangePassword
            };
          }),
          passwords: parsed.passwords || {},
          passwordChanged: parsed.passwordChanged || {},
          products: parsed.products || [],
          walletTransactions: parsed.walletTransactions || [],
          chatRooms: parsed.chatRooms || [],
          messages: parsed.messages || [],
          reviews: parsed.reviews || [],
          comments: parsed.comments || [],
          coupons: parsed.coupons || [],
          rechargeCodes: parsed.rechargeCodes || [],
          cities: parsed.cities || [],
          categories: (parsed.categories || []).map((c, idx) => ({
            ...c,
            sortOrder: typeof c.sortOrder === "number" ? c.sortOrder : (idx + 1) * 10
          })),
          auditLogs: parsed.auditLogs || [],
          reports: parsed.reports || [],
          settings: parsed.settings || {},
          contactThreads: parsed.contactThreads || [],
          profileStats: parsed.profile_stats || parsed.profileStats || [],
          reviewMedia: parsed.review_media || parsed.reviewMedia || [],
          reviewQuestions: parsed.review_questions || parsed.reviewQuestions || [],
          reviewAnswers: parsed.review_answers || parsed.reviewAnswers || [],
          orders: parsed.orders || [],
          moderationQueue: parsed.moderationQueue || [],
          notificationQueue: parsed.notificationQueue || [],
          publishEvents: parsed.publishEvents || [],
          otpVerifications: parsed.otpVerifications || []
        };
        let statsUpdated = false;
        loadedData.users.forEach((user) => {
          const statsExist = loadedData.profileStats.some((ps) => ps.user_id === user.id);
          if (!statsExist) {
            let viewsCount = 0;
            let salesCount = 0;
            if (user.id === "u-seller1") {
              viewsCount = 97;
              salesCount = 142;
            } else if (user.id === "u-admin") {
              salesCount = 521;
            } else if (user.role === "seller") {
              salesCount = user.sales_count || 0;
              viewsCount = 0;
            }
            loadedData.profileStats.push({
              user_id: user.id,
              views_count: viewsCount,
              sales_count: salesCount,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            statsUpdated = true;
          }
        });
        let updated = false;
        const uAdmin = loadedData.users.find((u) => u.id === "u-admin");
        if (uAdmin && uAdmin.role !== "superadmin") {
          uAdmin.role = "superadmin";
          updated = true;
        }
        if (statsUpdated || loadedData.users.some((u) => !u.badges || !u.verificationStatus)) {
          updated = true;
        }
        if (updated) {
          try {
            this.save(loadedData);
          } catch (e) {
          }
        }
        return loadedData;
      }
    } catch (e) {
      console.error("Error loading database, resetting to default seed data:", e);
    }
    const initialDb = {
      users: DEFAULT_USERS.map((u) => {
        const created_at = u.created_at || u.createdAt || (/* @__PURE__ */ new Date()).toISOString();
        const roleIsAdmin = u.role === "superadmin" || u.role === "admin" || u.role === "owner";
        const isAdmin = roleIsAdmin;
        const passwordVersion = u.id === "u-admin" ? 0 : 1;
        const passwordChangedManually = u.id !== "u-admin";
        const firstLoginDone = u.id !== "u-admin";
        let mustChangePassword = isAdmin && passwordVersion === 0;
        if (isAdmin && passwordChangedManually) {
          mustChangePassword = false;
        }
        return {
          ...u,
          created_at,
          createdAt: u.createdAt || created_at,
          verificationStatus: u.verificationStatus || (u.isVerified ? "verified" : "pending"),
          badges: u.badges || [],
          isAdmin,
          firstLoginDone,
          passwordVersion,
          passwordChangedManually,
          mustChangePassword
        };
      }),
      passwords: DEFAULT_PASSWORDS,
      passwordChanged: { "u-admin": false, "u-seller1": true, "u-buyer1": true },
      products: DEFAULT_PRODUCTS,
      walletTransactions: DEFAULT_WALLET_TRANSACTIONS,
      chatRooms: [],
      messages: [],
      reviews: DEFAULT_REVIEWS,
      comments: DEFAULT_COMMENTS,
      coupons: DEFAULT_COUPONS,
      rechargeCodes: DEFAULT_RECHARGE_CODES,
      cities: SEED_CITIES,
      categories: SEED_CATEGORIES,
      auditLogs: DEFAULT_AUDIT_LOGS,
      reports: DEFAULT_REPORTS,
      settings: DEFAULT_SETTINGS,
      contactThreads: DEFAULT_CONTACT_THREADS,
      profileStats: [],
      reviewMedia: [],
      reviewQuestions: [],
      reviewAnswers: [],
      orders: [],
      moderationQueue: [],
      notificationQueue: [],
      publishEvents: [],
      otpVerifications: []
    };
    initialDb.profileStats = initialDb.users.map((user) => {
      let viewsCount = 0;
      let salesCount = 0;
      if (user.id === "u-seller1") {
        viewsCount = 97;
        salesCount = 142;
      } else if (user.id === "u-admin") {
        salesCount = 521;
      } else if (user.role === "seller") {
        salesCount = user.sales_count || 0;
        viewsCount = 0;
      }
      return {
        user_id: user.id,
        views_count: viewsCount,
        sales_count: salesCount,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    });
    this.save(initialDb);
    return initialDb;
  }
  save(customData) {
    try {
      const dbToSave = customData || this.data;
      if (dbToSave.auditLogs) {
        const sanitizeSensitiveText = (text) => {
          if (!text) return text;
          let sanitized = text;
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          sanitized = sanitized.replace(emailRegex, "[REDACTED_EMAIL]");
          const phoneRegex = /(?:\+212|212|0)[ \-_]?[567]\d{8}\b|(?:\+?\d{1,3}[ \-_]?)?\(?\d{3}\)?[\s\-_]?\d{3}[\s\-_]?\d{4}\b/g;
          sanitized = sanitized.replace(phoneRegex, "[REDACTED_PHONE]");
          const otpRegex = /\b\d{6}\b/g;
          sanitized = sanitized.replace(otpRegex, "[REDACTED_OTP]");
          const tokenRegex = /\b(token|password|pass|secret|key|otp)=["']?[a-zA-Z0-9_\-=@/]+["']?/gi;
          sanitized = sanitized.replace(tokenRegex, (m) => m.split("=")[0] + "=[REDACTED]");
          return sanitized;
        };
        dbToSave.auditLogs = dbToSave.auditLogs.map((log) => ({
          ...log,
          adminEmail: log.adminEmail ? "[REDACTED_EMAIL]" : log.adminEmail,
          adminName: log.adminName ? "[REDACTED_NAME]" : log.adminName,
          action: log.action ? sanitizeSensitiveText(log.action) : log.action,
          details: log.details ? sanitizeSensitiveText(log.details) : log.details
        }));
      }
      const payload = {
        ...dbToSave,
        profile_stats: dbToSave.profileStats,
        review_media: dbToSave.reviewMedia,
        review_questions: dbToSave.reviewQuestions,
        review_answers: dbToSave.reviewAnswers
      };
      delete payload.profileStats;
      delete payload.reviewMedia;
      delete payload.reviewQuestions;
      delete payload.reviewAnswers;
      const TEMP_DB_FILE = DB_FILE + ".tmp";
      import_fs.default.writeFileSync(TEMP_DB_FILE, JSON.stringify(payload, null, 2), "utf8");
      import_fs.default.renameSync(TEMP_DB_FILE, DB_FILE);
      try {
        import_fs.default.copyFileSync(DB_FILE, import_path.default.join(DATA_DIR, "db_backup.json"));
      } catch (backupError) {
        console.error("Error creating database backup:", backupError);
      }
    } catch (e) {
      console.error("Error saving database:", e);
    }
  }
  // General low-level table getters
  getUsers() {
    return this.data.users;
  }
  getPasswords() {
    return this.data.passwords;
  }
  getPasswordChanged() {
    return this.data.passwordChanged;
  }
  getProducts() {
    return this.data.products;
  }
  getWalletTransactions() {
    return this.data.walletTransactions;
  }
  getChatRooms() {
    return this.data.chatRooms;
  }
  getMessages() {
    return this.data.messages;
  }
  getReviews() {
    return this.data.reviews;
  }
  getComments() {
    return this.data.comments;
  }
  getCoupons() {
    return this.data.coupons;
  }
  getRechargeCodes() {
    return this.data.rechargeCodes;
  }
  getCities() {
    return this.data.cities;
  }
  getCategories() {
    return this.data.categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
  getAuditLogs() {
    return this.data.auditLogs;
  }
  getReports() {
    return this.data.reports;
  }
  getSettings() {
    return this.data.settings;
  }
  getContactThreads() {
    return this.data.contactThreads;
  }
  getProfileStats() {
    return this.data.profileStats;
  }
  getReviewMedia() {
    if (!this.data.reviewMedia) this.data.reviewMedia = [];
    return this.data.reviewMedia;
  }
  getReviewQuestions() {
    if (!this.data.reviewQuestions) this.data.reviewQuestions = [];
    return this.data.reviewQuestions;
  }
  getReviewAnswers() {
    if (!this.data.reviewAnswers) this.data.reviewAnswers = [];
    return this.data.reviewAnswers;
  }
  getOrders() {
    if (!this.data.orders) this.data.orders = [];
    return this.data.orders;
  }
  getModerationQueue() {
    if (!this.data.moderationQueue) this.data.moderationQueue = [];
    return this.data.moderationQueue;
  }
  getNotificationQueue() {
    if (!this.data.notificationQueue) this.data.notificationQueue = [];
    return this.data.notificationQueue;
  }
  getPublishEvents() {
    if (!this.data.publishEvents) this.data.publishEvents = [];
    return this.data.publishEvents;
  }
  getOtpVerifications() {
    if (!this.data.otpVerifications) this.data.otpVerifications = [];
    return this.data.otpVerifications;
  }
  setReviewMedia(media) {
    this.data.reviewMedia = media;
  }
  setReviewQuestions(questions) {
    this.data.reviewQuestions = questions;
  }
  setReviewAnswers(answers) {
    this.data.reviewAnswers = answers;
  }
  // Flush table state changes directly
  persist() {
    this.save();
  }
};
var dbInstance = new JsonDatabase();

// server/utils/otp.ts
function generateOTP() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}

// server/services/otpService.ts
var import_crypto = __toESM(require("crypto"), 1);

// server/services/emailService.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var transporterInstance = null;
function getTransporter() {
  if (!transporterInstance) {
    const host = process.env.SMTP_HOST || "";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";
    if (!host || !user || !pass) {
      console.warn("SMTP is not fully configured (SMTP_HOST, SMTP_USER, SMTP_PASS are missing). Standard fallback simulation mode.");
      return null;
    }
    try {
      transporterInstance = import_nodemailer.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } catch (err) {
      console.error("Failed to initialize Nodemailer SMTP transporter:", err);
      transporterInstance = null;
    }
  }
  return transporterInstance;
}
async function sendEmailOTP(email, otp) {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || "no-reply@sou9aljoumla.com";
  console.log(`[EMAIL SERVICE LOG] Intending to send OTP ${otp} to email: ${email}`);
  if (!transporter) {
    console.log(`[SIMULATED EMAIL SERVICE] To: ${email} | OTP Code: ${otp}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: "Verification Code | \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 - \u0633\u0648\u0642 \u0627\u0644\u062C\u0645\u0644\u0629",
      text: `Your verification code is: ${otp}
\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0647\u0648: ${otp}`,
      html: `
        <div style="font-family: 'Cairo', 'Inter', sans-serif; text-align: center; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: 0 auto; direction: rtl;">
          <h2 style="color: #ff6600; margin-bottom: 5px;">\u0633\u0648\u0642 \u0627\u0644\u062C\u0645\u0644\u0629 | Sou9AlJoumla</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">\u0645\u0646\u0635\u0629 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0627\u0644\u0623\u0648\u0644\u0649</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 16px; color: #1d2731;">\u064A\u0631\u062C\u0649 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062A\u0627\u0644\u064A \u0644\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0629:</p>
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #ff6600; margin: 20px 0; border-radius: 6px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
            \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 10 \u062F\u0642\u0627\u0626\u0642 \u0641\u0642\u0637 \u0644\u062F\u0648\u0627\u0639\u064A \u0623\u0645\u0646\u064A\u0629.<br/>
            \u0625\u0630\u0627 \u0644\u0645 \u062A\u0643\u0646 \u0623\u0646\u062A \u0645\u0646 \u0637\u0644\u0628 \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632\u060C \u064A\u0631\u062C\u0649 \u062A\u062C\u0627\u0647\u0644 \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A.
          </p>
        </div>
      `
    });
    console.log(`[EMAIL SERVICE] Real OTP email sent successfully to ${email}`);
  } catch (err) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send real SMTP email to ${email}:`, err);
    console.log(`[EMAIL SERVICE FALLBACK] Simulated OTP console dump for ${email}: ${otp}`);
  }
}

// server/services/smsService.ts
var import_twilio = __toESM(require("twilio"), 1);
var twilioClientInstance = null;
function getTwilioClient() {
  if (!twilioClientInstance) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    const authToken = process.env.TWILIO_AUTH_TOKEN || "";
    if (!accountSid || !authToken) {
      console.warn("SMS disabled - Twilio is not configured (TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing).");
      return null;
    }
    try {
      twilioClientInstance = (0, import_twilio.default)(accountSid, authToken);
    } catch (err) {
      console.error("SMS initialization failed - unable to build twilio client instance:", err);
      twilioClientInstance = null;
    }
  }
  return twilioClientInstance;
}
async function sendSMSOTP(phone, otp) {
  const twilioClient = getTwilioClient();
  const fromNumber = process.env.TWILIO_FROM_NUMBER || "";
  console.log(`[SMS SERVICE LOG] Intending to send OTP ${otp} via SMS to phone: ${phone}`);
  if (!twilioClient) {
    console.warn("SMS disabled - Twilio not configured");
    return;
  }
  if (!fromNumber) {
    console.warn("SMS sending failed: TWILIO_FROM_NUMBER environment variable is not defined");
    return;
  }
  try {
    const message = await twilioClient.messages.create({
      body: `Your verification code is: ${otp} / \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0644\u0640 \u0633\u0648\u0642 \u0627\u0644\u062C\u0645\u0644\u0629 \u0647\u0648: ${otp}`,
      from: fromNumber,
      to: phone
    });
    console.log(`[SMS SERVICE] Real Twilio SMS sent successfully. Message SID: ${message.sid}`);
  } catch (err) {
    console.error(`[SMS SERVICE ERROR] Failed to send real Twilio SMS to ${phone}:`, err);
    console.log(`[SMS SERVICE FALLBACK] Simulated SMS dump for ${phone}: ${otp}`);
  }
}

// server/services/securityLogger.ts
var import_winston = __toESM(require("winston"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var LOGS_DIR = import_path2.default.join(process.cwd(), "data", "logs");
if (!import_fs2.default.existsSync(LOGS_DIR)) {
  import_fs2.default.mkdirSync(LOGS_DIR, { recursive: true });
}
var securityWinstonLogger = import_winston.default.createLogger({
  level: "info",
  format: import_winston.default.format.combine(
    import_winston.default.format.timestamp(),
    import_winston.default.format.json()
  ),
  transports: [
    new import_winston.default.transports.File({ filename: import_path2.default.join(LOGS_DIR, "security.log") }),
    new import_winston.default.transports.Console()
  ]
});
function logSecurityEvent(event) {
  try {
    securityWinstonLogger.info({
      message: `Security Event: ${event.type}`,
      userId: event.userId,
      method: event.method,
      ip: event.ip,
      timestamp: event.timestamp ? event.timestamp.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      details: event.details
    });
  } catch (err) {
    console.error("Failed writing to security log transporter:", err);
  }
}

// server/services/otpService.ts
function calculateOtpHash(userId, otp, expiresAt, context) {
  return import_crypto.default.createHash("sha256").update(`${userId}:${otp.trim()}:${expiresAt}:${context}`).digest("hex");
}
async function saveOTPToDatabase(data) {
  const list = dbInstance.getOtpVerifications();
  const filtered = list.filter((item) => !(item.userId === data.userId && item.context === data.context && !item.used));
  list.length = 0;
  list.push(...filtered);
  const hash = calculateOtpHash(data.userId, data.otp, data.expiresAt, data.context);
  const verification = {
    id: "otp-" + Math.random().toString(36).substring(2, 11),
    userId: data.userId,
    otp: data.otp,
    otpHash: hash,
    context: data.context,
    deviceId: data.deviceId,
    attempts: 0,
    ip: data.ip,
    expiresAt: data.expiresAt,
    createdAt: Date.now(),
    used: false
  };
  list.push(verification);
  dbInstance.persist();
  return verification;
}
async function markOTPAsUsedByRecord(id) {
  const list = dbInstance.getOtpVerifications();
  const record = list.find((item) => item.id === id);
  if (record) {
    record.used = true;
    dbInstance.persist();
  }
}
async function sendOTP(user, otp, context, ip = "unknown", deviceId) {
  const userId = user.id;
  const email = user.email || "";
  const phone = user.phone || "";
  const list = dbInstance.getOtpVerifications();
  const tenMinutesAgo = Date.now() - 10 * 60 * 1e3;
  const recentCountForUser = list.filter(
    (item) => item.userId === userId && item.createdAt > tenMinutesAgo
  ).length;
  if (recentCountForUser >= 5) {
    logSecurityEvent({
      type: "OTP_RATE_LIMITED",
      userId,
      ip,
      timestamp: /* @__PURE__ */ new Date(),
      details: { email, phone, context, recentCountForUser }
    });
    throw new Error("\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0637\u0644\u0628\u0627\u062A \u0631\u0645\u0648\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 (5 \u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0643\u0644 10 \u062F\u0642\u0627\u0626\u0642). \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0634\u0643\u0644 \u0623\u0628\u0637\u0623.");
  }
  const expiresAt = Date.now() + 10 * 60 * 1e3;
  await saveOTPToDatabase({
    userId,
    otp,
    expiresAt,
    context,
    ip,
    deviceId
  });
  try {
    await sendEmailOTP(email, otp);
  } catch (emailErr) {
    console.error(`Failed sending basic email OTP to ${email}:`, emailErr);
  }
  if (phone) {
    try {
      await sendSMSOTP(phone, otp);
    } catch (smsErr) {
      console.error(`Non-blocking Twilio dispatch failure for phone ${phone}:`, smsErr);
    }
  }
  logSecurityEvent({
    type: "OTP_SENT",
    userId,
    method: phone ? ["email", "sms"] : ["email"],
    ip,
    timestamp: /* @__PURE__ */ new Date(),
    details: { context, expiresAt, deviceId }
  });
}
async function verifyOTP(userId, otp, requiredContext, ip = "unknown", deviceId, consume = true) {
  const list = dbInstance.getOtpVerifications();
  const record = list.find(
    (item) => item.userId === userId && item.context === requiredContext && !item.used
  );
  if (!record) {
    logSecurityEvent({
      type: "OTP_FAILED_ATTEMPT",
      userId,
      ip,
      timestamp: /* @__PURE__ */ new Date(),
      details: { otpAttempt: otp, error: "No active unused OTP found for this context", requiredContext, deviceId }
    });
    throw new Error("\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u060C \u0623\u0648 \u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u062A\u0647\u060C \u0623\u0648 \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647 \u0645\u0633\u0628\u0642\u0627\u064B.");
  }
  const computedCurrentHash = calculateOtpHash(userId, otp, record.expiresAt, record.context);
  const anyReplayedRecord = list.find((item) => item.otpHash === computedCurrentHash && item.used);
  if (anyReplayedRecord) {
    logSecurityEvent({
      type: "OTP_REPLAY_ATTEMPT",
      userId,
      ip,
      timestamp: /* @__PURE__ */ new Date(),
      details: { requiredContext, replayedOtpId: anyReplayedRecord.id, deviceId, suspiciousHash: computedCurrentHash }
    });
    throw new Error("\u0645\u062D\u0627\u0648\u0644\u0629 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647\u0627: \u062A\u0645 \u0627\u0644\u0643\u0634\u0641 \u0639\u0646 \u0645\u062D\u0627\u0648\u0644\u0629 \u0625\u0639\u0627\u062F\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0631\u0645\u0632 \u0623\u0645\u0627\u0646 \u0645\u0641\u0639\u0651\u0644 \u0633\u0627\u0628\u0642\u0627\u064B (Replay Attack Protection).");
  }
  if (record.context !== requiredContext) {
    logSecurityEvent({
      type: "OTP_CONTEXT_MISMATCH",
      userId,
      ip,
      timestamp: /* @__PURE__ */ new Date(),
      details: { requestedContext: requiredContext, savedContext: record.context, recordId: record.id, deviceId }
    });
    throw new Error("\u0645\u062D\u0627\u0648\u0644\u0629 \u0641\u0643 \u062D\u0638\u0631 \u062A\u0627\u0644\u0641\u0629: \u0644\u0627 \u064A\u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u062B\u0646\u0627\u0626\u064A \u0627\u0644\u0645\u062E\u062A\u0627\u0631 \u0645\u0639 \u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0623\u0645\u0646\u064A\u0629.");
  }
  const now = Date.now();
  if (record.lastAttemptAt && now - record.lastAttemptAt < 2e3) {
    logSecurityEvent({
      type: "OTP_WINDOW_VIOLATION",
      userId,
      ip,
      timestamp: /* @__PURE__ */ new Date(),
      details: { lastAttemptDelta: now - record.lastAttemptAt, recordId: record.id, deviceId }
    });
    throw new Error("\u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0644\u0645\u062F\u0629 \u062B\u0627\u0646\u064A\u062A\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0628\u064A\u0646 \u0625\u062F\u062E\u0627\u0644 \u0648\u0625\u062F\u062E\u0627\u0644 \u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u062D\u0642\u0642 \u0644\u0645\u0646\u0639 \u0647\u062C\u0645\u0627\u062A \u0627\u0644\u062A\u062E\u0645\u064A\u0646.");
  }
  record.lastAttemptAt = now;
  dbInstance.persist();
  if (now > record.expiresAt) {
    logSecurityEvent({
      type: "OTP_FAILED_ATTEMPT",
      userId,
      ip,
      timestamp: /* @__PURE__ */ new Date(),
      details: { error: "OTP has already expired", expiresAt: record.expiresAt, recordId: record.id, deviceId }
    });
    throw new Error("\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u0623\u0645\u0646\u064A. \u064A\u0631\u062C\u0649 \u0637\u0644\u0628 \u0643\u0648\u062F \u062C\u062F\u064A\u062F.");
  }
  if (record.otp.trim() !== otp.trim()) {
    record.attempts += 1;
    dbInstance.persist();
    if (record.attempts >= 3 && record.attempts < 5) {
      logSecurityEvent({
        type: "OTP_BRUTE_FORCE_LOCKOUT",
        userId,
        ip,
        timestamp: /* @__PURE__ */ new Date(),
        details: { attempts: record.attempts, recordId: record.id, deviceId }
      });
      throw new Error(`\u0644\u0642\u062F \u0642\u0645\u062A \u0628\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0628\u0634\u0643\u0644 \u062E\u0627\u0637\u0626 (${record.attempts} \u0645\u0631\u0627\u062A). \u064A\u0631\u062C\u0649 \u062A\u0648\u062E\u064A \u0627\u0644\u062D\u0630\u0631\u060C \u0633\u064A\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u0645\u0632 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0639\u0646\u062F \u0627\u0644\u062E\u0637\u0623 \u0627\u0644\u062E\u0627\u0645\u0633.`);
    }
    if (record.attempts >= 5) {
      record.used = true;
      dbInstance.persist();
      logSecurityEvent({
        type: "OTP_BRUTE_FORCE_REGENERATION_FORCED",
        userId,
        ip,
        timestamp: /* @__PURE__ */ new Date(),
        details: { attempts: record.attempts, recordId: record.id, deviceId }
      });
      throw new Error("\u062A\u0645 \u062A\u0639\u0637\u064A\u0644 \u0631\u0645\u0632 \u0627\u0644\u0623\u0645\u0627\u0646 \u0647\u0630\u0627 \u0644\u062A\u062C\u0627\u0648\u0632\u0643 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062E\u0627\u0637\u0626\u0629 (5 \u0645\u062D\u0627\u0648\u0644\u0627\u062A). \u064A\u0631\u062C\u0649 \u062A\u0648\u0644\u064A\u062F \u0631\u0645\u0632 \u062C\u062F\u064A\u062F \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0646 \u062C\u062F\u064A\u062F.");
    }
    logSecurityEvent({
      type: "OTP_FAILED_ATTEMPT",
      userId,
      ip,
      timestamp: /* @__PURE__ */ new Date(),
      details: { attempts: record.attempts, recordId: record.id, deviceId }
    });
    throw new Error("\u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0623\u0645\u0646\u064A \u0627\u0644\u0630\u064A \u0623\u062F\u062E\u0644\u062A\u0647 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u062B\u0628\u062A \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B.");
  }
  if (consume) {
    await markOTPAsUsedByRecord(record.id);
  }
  logSecurityEvent({
    type: "OTP_SUCCESS",
    userId,
    ip,
    timestamp: /* @__PURE__ */ new Date(),
    details: { context: requiredContext, deviceId }
  });
  return true;
}

// server.ts
var passPhrase = process.env.CLOUDFLARE_ENCRYPTION_KEY || "sou9aljoumla-cloudflare-secret-key-phrase-2026";
var SECRET_KEY = import_crypto2.default.createHash("sha256").update(passPhrase).digest();
var ALGORITHM = "aes-256-cbc";
var IV_LENGTH = 16;
function encrypt(text) {
  if (!text) return "";
  const iv = import_crypto2.default.randomBytes(IV_LENGTH);
  const cipher = import_crypto2.default.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
function decrypt(text) {
  if (!text) return "";
  try {
    const parts = text.split(":");
    if (parts.length < 2) return text;
    const iv = Buffer.from(parts.shift() || "", "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = import_crypto2.default.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText).toString("utf8");
    decrypted += decipher.final().toString("utf8");
    return decrypted;
  } catch (err) {
    return text;
  }
}
function validateStrongPassword(password) {
  if (!password || password.length < 12) {
    return "\u064A\u062C\u0628 \u0623\u0646 \u062A\u062A\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0646 12 \u062D\u0631\u0641\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0636\u0645\u0627\u0646 \u0623\u0645\u0627\u0646 \u062D\u0633\u0627\u0628\u0643.";
  }
  const low = password.toLowerCase();
  const commonWeak = ["password", "12345678", "123456789", "admin123", "qwerty", "maroc123", "morocco123", "sou9aljoumla", "1234567890"];
  if (commonWeak.some((w) => low.includes(w))) {
    return "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0636\u0639\u064A\u0641\u0629 \u062C\u062F\u0627\u064B \u0648\u062A\u062A\u0636\u0645\u0646 \u0643\u0644\u0645\u0627\u062A \u0634\u0627\u0626\u0639\u0629 \u0648\u0645\u062E\u062A\u0631\u0642\u0629 \u0628\u0633\u0647\u0648\u0644\u0629. \u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0623\u0643\u062B\u0631 \u062A\u0639\u0642\u064A\u062F\u0627\u064B.";
  }
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  if (!hasLetter || !hasDigit) {
    return "\u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0639\u0644\u0649 \u0623\u062D\u0631\u0641 \u0648\u0623\u0631\u0642\u0627\u0645 \u0645\u0639\u0627\u064B \u0644\u0632\u064A\u0627\u062F\u0629 \u0645\u0633\u062A\u0648\u0649 \u0642\u0648\u0629 \u0627\u0644\u0623\u0645\u0627\u0646.";
  }
  return null;
}
function sanitizeHTML(text) {
  if (!text || typeof text !== "string") return text;
  let sanitized = text;
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, "");
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  sanitized = sanitized.replace(/\bon[a-z]+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\bon[a-z]+\s*=\s*[^ >]+/gi, "");
  sanitized = sanitized.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return sanitized;
}
function hashPassword(pass) {
  const salt = import_crypto2.default.randomBytes(16).toString("hex");
  const hash = import_crypto2.default.pbkdf2Sync(pass, salt, 1e5, 64, "sha512").toString("hex");
  return `pbkdf2:${salt}:${hash}`;
}
function comparePassword(userId, inputPass, storedPass) {
  if (!storedPass) return false;
  if (storedPass.startsWith("pbkdf2:")) {
    const parts = storedPass.split(":");
    if (parts.length === 3) {
      const salt = parts[1];
      const hash = parts[2];
      const inputHash = import_crypto2.default.pbkdf2Sync(inputPass, salt, 1e5, 64, "sha512").toString("hex");
      return hash === inputHash;
    }
  }
  if (storedPass.length === 64 && /^[0-9a-f]+$/i.test(storedPass)) {
    const sha256 = import_crypto2.default.createHash("sha256").update(inputPass).digest("hex");
    return storedPass === sha256;
  }
  return storedPass === inputPass;
}
var app = (0, import_express.default)();
var PORT = 3e3;
var LOGS_DIR2 = import_path3.default.join(process.cwd(), "data", "logs");
if (!import_fs3.default.existsSync(LOGS_DIR2)) {
  import_fs3.default.mkdirSync(LOGS_DIR2, { recursive: true });
}
var securityLogger = import_winston2.default.createLogger({
  level: "info",
  format: import_winston2.default.format.combine(
    import_winston2.default.format.timestamp(),
    import_winston2.default.format.json()
  ),
  transports: [
    new import_winston2.default.transports.File({ filename: import_path3.default.join(LOGS_DIR2, "security.log") }),
    new import_winston2.default.transports.Console()
  ]
});
var paymentsLogger = import_winston2.default.createLogger({
  level: "info",
  format: import_winston2.default.format.combine(
    import_winston2.default.format.timestamp(),
    import_winston2.default.format.json()
  ),
  transports: [
    new import_winston2.default.transports.File({ filename: import_path3.default.join(LOGS_DIR2, "payments.log") }),
    new import_winston2.default.transports.Console()
  ]
});
var auditLogger = import_winston2.default.createLogger({
  level: "info",
  format: import_winston2.default.format.combine(
    import_winston2.default.format.timestamp(),
    import_winston2.default.format.json()
  ),
  transports: [
    new import_winston2.default.transports.File({ filename: import_path3.default.join(LOGS_DIR2, "audit.log") }),
    new import_winston2.default.transports.Console()
  ]
});
var sessionStore = /* @__PURE__ */ new Map();
function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("s9_session", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1e3
    // 2 hours
  });
}
app.use((0, import_helmet.default)({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.google.com", "https://*.googleusercontent.com"],
      mediaSrc: ["'self'", "data:", "/uploads/"],
      connectSrc: ["'self'", "https://api-m.sandbox.paypal.com", "https://api-m.paypal.com", "https://*.google.com"],
      frameAncestors: ["'self'", "https://ai.studio", "https://*.run.app"]
      // Embeddable only in trusted domains!
    }
  },
  frameguard: false
  // Securely managed via frameAncestors directive above
}));
app.use((0, import_cookie_parser.default)("sou9aljoumla-cookie-secret-2026"));
var isProdEnv = process.env.NODE_ENV === "production";
var allowedOrigins = [
  process.env.APP_URL,
  "https://ai.studio",
  "https://ai.studio/build"
].filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    if (!isProdEnv) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      } else {
        securityLogger.warn({ event: "CORS_BLOCKED", origin, path: req.path });
        return res.status(403).json({ error: "CORS Blocked: Origin unauthorized." });
      }
    }
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProdEnv) {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var loginLimiter = (0, import_express_rate_limit.rateLimit)({
  windowMs: 15 * 60 * 1e3,
  // 15 mins
  max: 5,
  // 5 attempts per 15 mins
  message: { error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 15 \u062F\u0642\u064A\u0642\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u062B\u0627\u0646\u064A\u0629." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: "LOGIN_RATE_LIMITED", ip: req.ip });
    res.status(429).json(options.message);
  }
});
var registerLimiter = (0, import_express_rate_limit.rateLimit)({
  windowMs: 15 * 60 * 1e3,
  // 15 mins
  max: 10,
  // 10 attempts per 15 mins
  message: { error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u0633\u062C\u064A\u0644. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 15 \u062F\u0642\u064A\u0642\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: "REGISTRATION_RATE_LIMITED", ip: req.ip });
    res.status(429).json(options.message);
  }
});
var resetPasswordLimiter = (0, import_express_rate_limit.rateLimit)({
  windowMs: 15 * 60 * 1e3,
  // 15 mins
  max: 10,
  // 10 attempts per 15 mins
  message: { error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 15 \u062F\u0642\u064A\u0642\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: "RESET_PASSWORD_RATE_LIMITED", ip: req.ip });
    res.status(429).json(options.message);
  }
});
var generalApiLimiter = (0, import_express_rate_limit.rateLimit)({
  windowMs: 15 * 60 * 1e3,
  // 15 mins
  max: 100,
  // 100 requests per 15 mins
  message: { error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0622\u0645\u0646\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0639\u062F 15 \u062F\u0642\u064A\u0642\u0629." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: "API_RATE_LIMITED", ip: req.ip, path: req.path });
    res.status(429).json(options.message);
  }
});
var paypalVerifyLimiter = (0, import_express_rate_limit.rateLimit)({
  windowMs: 5 * 60 * 1e3,
  max: 5,
  message: { error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062F\u0641\u0639. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 5 \u062F\u0642\u0627\u0626\u0642 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: "PAYPAL_VERIFICATION_RATE_LIMITED", ip: req.ip });
    res.status(429).json(options.message);
  }
});
var webhookLimiter = (0, import_express_rate_limit.rateLimit)({
  windowMs: 1 * 60 * 1e3,
  max: 60,
  message: { error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: "WEBHOOK_RATE_LIMITED", ip: req.ip });
    res.status(429).json(options.message);
  }
});
var adminLimiter = (0, import_express_rate_limit.rateLimit)({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  message: { error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u062D\u062F \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0648\u0642\u062A \u0644\u0627\u062D\u0642." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: "ADMIN_ROUTE_RATE_LIMITED", ip: req.ip, path: req.path });
    res.status(429).json(options.message);
  }
});
function csrfAndOriginProtection(req, res, next) {
  const method = req.method;
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    const origin = req.headers.origin || req.headers.referer;
    const host = req.headers.host;
    if (origin && host) {
      try {
        const originUrl = new URL(origin.startsWith("/") ? `http://${host}${origin}` : origin);
        const isAllowed = originUrl.host === host || originUrl.host.includes("run.app") || originUrl.host.includes("localhost") || originUrl.host.includes("127.0.0.1");
        if (!isAllowed) {
          securityLogger.warn({ event: "CSRF_ORIGIN_MISMATCH_BLOCKED", origin, host });
          return res.status(403).json({ error: "\u062D\u0638\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644: \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647\u0627 \u0645\u0646 \u0645\u0635\u062F\u0631 \u062E\u0627\u0631\u062C\u064A (\u062D\u0645\u0627\u064A\u0629 CSRF)." });
        }
      } catch (err) {
      }
    }
  }
  next();
}
function authorizeOwnership(req, res, next) {
  const sessionUser = req.sessionUser;
  if (!sessionUser) {
    return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0642\u064A\u0627\u0645 \u0628\u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621." });
  }
  const targetUserId = req.params.userId || req.body.userId || req.query.userId || req.body.sellerId;
  if (targetUserId && sessionUser.role !== "superadmin" && sessionUser.role !== "admin" && sessionUser.userId !== targetUserId) {
    securityLogger.warn({
      event: "IDOR_PREVENTED",
      sessionUserId: sessionUser.userId,
      requestedUserId: targetUserId,
      path: req.path
    });
    return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0643\u0627\u0641\u064A\u0629 \u0644\u0625\u062A\u0645\u0627\u0645 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0644\u062D\u0633\u0627\u0628 \u0622\u062E\u0631 (IDOR Protection)." });
  }
  next();
}
app.use("/api/admin", adminLimiter);
app.use((req, res, next) => {
  const token = req.cookies?.s9_session;
  if (token) {
    const session = sessionStore.get(token);
    if (session && Date.now() < session.expiresAt) {
      const user = dbInstance.getUsers().find((u) => u.id === session.userId);
      if (user) {
        const isRevoked = revokedSessions.some((rs) => rs.sessionId === token);
        if (isRevoked) {
          sessionStore.delete(token);
          res.clearCookie("s9_session");
          return next();
        }
        const currentVersion = user.passwordVersion || 0;
        const sessionVersion = session.passwordVersion || 0;
        if (sessionVersion !== currentVersion) {
          sessionStore.delete(token);
          res.clearCookie("s9_session");
          return next();
        }
        if (user.isAdmin || user.role === "admin" || user.role === "superadmin") {
          const fingerprint = generateDeviceFingerprint(req);
          const currentIp = getClientIp(req);
          if (session.deviceFingerprint && session.deviceFingerprint !== fingerprint) {
            sessionStore.delete(token);
            res.clearCookie("s9_session");
            return res.status(401).json({ error: "\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0633\u0628\u0628 \u0627\u0644\u0643\u0634\u0641 \u0639\u0646 \u0628\u0635\u0645\u0629 \u062C\u0647\u0627\u0632 \u0645\u062E\u062A\u0644\u0641\u0629 \u0644\u062D\u0633\u0627\u0628 \u0645\u062F\u064A\u0631." });
          }
          if (session.ipAddress && session.ipAddress !== currentIp) {
            sessionStore.delete(token);
            res.clearCookie("s9_session");
            return res.status(401).json({ error: "\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0633\u0628\u0628 \u0627\u0644\u0643\u0634\u0641 \u0639\u0646 \u0645\u062D\u0627\u0648\u0644\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062A\u0648\u0643\u0646 \u0645\u0646 \u0639\u0646\u0648\u0627\u0646 IP \u0645\u062E\u062A\u0644\u0641 \u0644\u062D\u0633\u0627\u0628 \u0645\u062F\u064A\u0631." });
          }
        }
        session.expiresAt = Date.now() + 2 * 60 * 60 * 1e3;
        req.sessionUser = session;
      } else {
        sessionStore.delete(token);
        res.clearCookie("s9_session");
      }
    }
  }
  next();
});
app.use((req, res, next) => {
  if (req.sessionUser) {
    const user = dbInstance.getUsers().find((u) => u.id === req.sessionUser.userId);
    if (user && user.isAdmin && user.mustChangePassword) {
      const allowedRoutesDuringForce = [
        "/api/auth/force-change-password"
      ];
      if (req.path.startsWith("/api/") && !allowedRoutesDuringForce.includes(req.path)) {
        dbInstance.getAuditLogs().push({
          id: "aud-" + Math.random().toString(36).substr(2, 9),
          adminId: user.id,
          adminEmail: user.email,
          adminName: user.name,
          action: "ADMIN_FORCE_ACCESS_BLOCKED",
          ip: getClientIp(req),
          details: `\u062A\u0645 \u0645\u0646\u0639 \u0648\u0635\u0648\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 \u0630\u064A \u0627\u0644\u0645\u0639\u0631\u0641 ${user.id} \u0644\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0641\u062A\u0648\u062D ${req.path} \u0623\u062B\u0646\u0627\u0621 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064A\u0629 \u0644\u0641\u0631\u0636 \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0640 bypass.`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        dbInstance.persist();
        return res.status(403).json({
          error: "PASSWORD_CHANGE_REQUIRED",
          forcePasswordChange: true,
          redirect: "/admin-change-password",
          lockNavigation: true,
          message: "\u064A\u062C\u0628 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0644\u0644\u0645\u062F\u064A\u0631 \u0642\u0628\u0644 \u0625\u062A\u0645\u0627\u0645 \u0623\u064A \u0639\u0645\u0644\u064A\u0629 \u0623\u062E\u0631\u0649."
        });
      }
    }
  }
  next();
});
app.use(csrfAndOriginProtection);
function enforceAdminSession(req, res, next) {
  if (!req.sessionUser) {
    return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u062C\u0644\u0633\u0629 \u0644\u062A\u0623\u062F\u064A\u0629 \u0627\u0644\u0625\u062C\u0631\u0627\u0621." });
  }
  const actorId = req.body.adminId || req.body.callerId || req.query.adminId || req.query.callerId;
  if (actorId && req.sessionUser.userId !== actorId) {
    securityLogger.warn({
      event: "SESSION_MISMAPPED_HIJACK_BLOCK",
      sessionUserId: req.sessionUser.userId,
      payloadActorId: actorId,
      path: req.path
    });
    return res.status(403).json({ error: "\u062E\u0637\u0623 \u0623\u0645\u0646\u064A: \u0643\u0627\u0634\u0641 \u0627\u0644\u062A\u0644\u0627\u0639\u0628 \u0628\u0627\u0644\u062C\u0644\u0633\u0629 \u0646\u0634\u0637. \u062A\u0645 \u0645\u0646\u0639 \u0637\u0644\u0628\u0643 \u0646\u0638\u0631\u0627\u064B \u0644\u0641\u0631\u0637 \u062A\u0634\u0627\u0628\u0647 \u0627\u0644\u0647\u0648\u064A\u0627\u062A \u063A\u064A\u0631 \u0627\u0644\u0645\u0635\u0631\u062D \u0628\u0647\u0627." });
  }
  const role = req.sessionUser.role;
  if (role !== "superadmin" && role !== "admin" && role !== "moderator") {
    return res.status(403).json({ error: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A: \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645." });
  }
  const isWriteRoute = req.method === "POST" || req.method === "PUT" || req.method === "DELETE";
  const pathLower = req.path.toLowerCase();
  if (role === "moderator") {
    const blockedKeywords = [
      "settings",
      "packages",
      "payment-settings",
      "cloudflare-settings",
      "roles/change",
      "recharge-codes",
      "coupons"
    ];
    const isBlocked = blockedKeywords.some((kw) => pathLower.includes(kw));
    if (isBlocked && isWriteRoute) {
      securityLogger.warn({
        event: "MODERATOR_PRIVILEGE_ESCALATION_VIOLATION",
        userId: req.sessionUser.userId,
        path: req.path,
        ip: req.ip
      });
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0631\u062A\u0628\u0629 \u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0634\u0631\u0641 (Moderator) \u063A\u064A\u0631 \u0645\u062E\u0648\u0644\u0629 \u0628\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0623\u0648 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0644\u0644\u0645\u0646\u0635\u0629." });
    }
  }
  if (role === "admin" && pathLower.includes("roles/change") && isWriteRoute) {
    const targetRole = req.body.role;
    if (targetRole === "superadmin" || targetRole === "admin") {
      securityLogger.warn({
        event: "ADMIN_PRIVILEGE_ESCALATION_ATTEMPT",
        userId: req.sessionUser.userId,
        targetRole,
        ip: req.ip
      });
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0631\u062A\u0628\u0629 \u0645\u062F\u064A\u0631 (Admin) \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0625\u0644\u0649 \u0631\u062A\u0628 \u0627\u0644\u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u0639\u0644\u064A\u0627 (Super Admin)." });
    }
  }
  next();
}
app.use("/api/admin", enforceAdminSession);
var UPLOADS_DIR = import_path3.default.join(process.cwd(), "data", "uploads");
if (!import_fs3.default.existsSync(UPLOADS_DIR)) {
  import_fs3.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", import_express.default.static(UPLOADS_DIR));
app.use(import_express.default.json({ limit: "150mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "150mb" }));
app.use((req, res, next) => {
  if (req.path === "/api/auth/force-change-password") {
    return next();
  }
  const adminId = req.query.adminId || req.body.adminId || req.query.callerId || req.body.callerId || req.query.userId || req.body.userId;
  if (adminId && typeof adminId === "string") {
    const passwordChanged = dbInstance.getPasswordChanged();
    if (passwordChanged[adminId] === false) {
      const users = dbInstance.getUsers();
      const user = users.find((u) => u.id === adminId);
      if (user && (user.role === "superadmin" || user.role === "admin")) {
        return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629 \u0644\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0623\u0648\u0644\u0627\u064B \u0644\u062A\u062A\u0645\u0643\u0646 \u0645\u0646 \u062A\u0635\u0641\u062D \u0627\u0644\u0645\u0646\u0635\u0629 \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645." });
      }
    }
  }
  next();
});
var securityOtps = /* @__PURE__ */ new Map();
var PRODUCT_VISITS_FILE = import_path3.default.join(process.cwd(), "data", "product_visits.json");
var productVisitsCache = /* @__PURE__ */ new Map();
function loadVisitsCache() {
  try {
    if (import_fs3.default.existsSync(PRODUCT_VISITS_FILE)) {
      const data = JSON.parse(import_fs3.default.readFileSync(PRODUCT_VISITS_FILE, "utf8"));
      for (const [prodId, mapData] of Object.entries(data)) {
        const innerMap = /* @__PURE__ */ new Map();
        for (const [trackKey, timestamp] of Object.entries(mapData)) {
          innerMap.set(trackKey, timestamp);
        }
        productVisitsCache.set(prodId, innerMap);
      }
    }
  } catch (err) {
    console.error("Error loading product visits cache:", err);
  }
}
function saveVisitsCache() {
  try {
    const obj = {};
    for (const [prodId, innerMap] of productVisitsCache.entries()) {
      obj[prodId] = {};
      for (const [trackKey, timestamp] of innerMap.entries()) {
        obj[prodId][trackKey] = timestamp;
      }
    }
    import_fs3.default.writeFileSync(PRODUCT_VISITS_FILE, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving product visits cache:", err);
  }
}
loadVisitsCache();
function getClientIp(req) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  return Array.isArray(ip) ? ip[0] : String(ip).split(",")[0];
}
function generateDeviceFingerprint(req) {
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "unknown";
  return import_crypto2.default.createHash("sha256").update(ip + "|" + userAgent).digest("hex");
}
var revokedSessions = [];
function revokeAllSessions(userId, reason = "MANDATORY_PASSWORD_CHANGE") {
  for (const [token, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(token);
      revokedSessions.push({
        sessionId: token,
        reason,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
}
var authFlowLocks = /* @__PURE__ */ new Set();
function lockAuthFlow(userId) {
  if (authFlowLocks.has(userId)) {
    return false;
  }
  authFlowLocks.add(userId);
  return true;
}
function unlockAuthFlow(userId) {
  authFlowLocks.delete(userId);
}
function checkAndCleanExpiredPremiums() {
  try {
    const now = /* @__PURE__ */ new Date();
    let hasChanges = false;
    const products = dbInstance.getProducts();
    products.forEach((p) => {
      if (p.isFeatured || p.is_premium) {
        const premiumTime = p.premium_created_at ? new Date(p.premium_created_at) : new Date(p.createdAt);
        const ageInMs = now.getTime() - premiumTime.getTime();
        const ageInDays = ageInMs / (1e3 * 60 * 60 * 24);
        if (ageInDays >= 3) {
          p.isFeatured = false;
          p.is_premium = false;
          hasChanges = true;
        } else {
          if (!p.is_premium) {
            p.is_premium = true;
            hasChanges = true;
          }
          if (!p.premium_created_at) {
            p.premium_created_at = p.createdAt;
            hasChanges = true;
          }
          if (!p.isFeatured) {
            p.isFeatured = true;
            hasChanges = true;
          }
        }
      }
    });
    if (hasChanges) {
      dbInstance.persist();
    }
  } catch (err) {
    console.error("Error during checkAndCleanExpiredPremiums:", err);
  }
}
function isAdminRole(role) {
  if (!role) return false;
  const n = role.trim().toLowerCase().replace(/[\s\-_]+/g, "");
  return n === "admin" || n === "superadmin" || n === "owner";
}
function validateFullName(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0637\u0644\u0648\u0628";
  }
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 2) {
    return "\u0627\u0644\u0627\u0633\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u062D\u0642\u064A\u0642\u064A \u0645\u0643\u0648\u0646 \u0645\u0646 \u0643\u0644\u0645\u062A\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 (\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u062B\u0627\u0646\u064A \u0648\u0627\u0644\u0644\u0642\u0628)";
  }
  if (/^\d+$/.test(trimmed.replace(/\s+/g, ""))) {
    return "\u0627\u0644\u0627\u0633\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u0627\u0644\u0627\u0633\u0645 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u064A\u062A\u0643\u0648\u0646 \u0645\u0646 \u0623\u0631\u0642\u0627\u0645 \u0641\u0642\u0637";
  }
  const nameRegex = /^[a-zA-Z\u0600-\u06FFàâæçéèêëîïôœùûüÿÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ\s]+$/;
  if (!nameRegex.test(trimmed)) {
    return "\u0627\u0644\u0627\u0633\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0623\u0648 \u0627\u0644\u0631\u0645\u0648\u0632 \u0627\u0644\u062E\u0627\u0635\u0629";
  }
  const spamWords = ["test", "testing", "admin", "user", "qwerty", "asdasd", "juhjdijed", "abc123", "123456"];
  const hasSpam = words.some((w) => {
    const lw = w.toLowerCase();
    return spamWords.includes(lw) || lw.length < 2;
  });
  if (hasSpam) {
    return "\u0627\u0644\u0627\u0633\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0643\u0644\u0645\u0627\u062A \u0639\u0634\u0648\u0627\u0626\u064A\u0629 \u0623\u0648 \u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629";
  }
  if (/([a-zA-Z\u0600-\u06FF])\1\1\1/i.test(trimmed)) {
    return "\u0627\u0644\u0627\u0633\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u0627\u0644\u0627\u0633\u0645 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0623\u062D\u0631\u0641 \u0645\u0643\u0631\u0631\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0629 \u063A\u064A\u0631 \u0645\u0646\u0637\u0642\u064A\u0629";
  }
  return null;
}
function validatePhoneNumber(phone) {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0637\u0644\u0648\u0628";
  }
  const cleaned = trimmed.replace(/[\s\-()]+/g, "");
  if (/[a-zA-Z]/i.test(cleaned)) {
    return "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u0644\u0627 \u064A\u0633\u0645\u062D \u0628\u0625\u062F\u062E\u0627\u0644 \u062D\u0631\u0648\u0641 \u0623\u0648 \u0631\u0645\u0648\u0632 \u062E\u0627\u0635\u0629 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629";
  }
  const moroccanPhoneRegex = /^(?:0|\+212|00212)[567]\d{8}$/;
  if (!moroccanPhoneRegex.test(cleaned)) {
    return "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0645\u063A\u0631\u0628\u064A \u062D\u0642\u064A\u0642\u064A \u0645\u0643\u0648\u0646 \u0645\u0646 10 \u0623\u0631\u0642\u0627\u0645 (\u0628\u062F\u0621\u0627\u064B \u0628\u0640 06 \u0623\u0648 07 \u0623\u0648 05) \u0623\u0648 \u0628\u0627\u0644\u0635\u064A\u063A\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629 (+212)";
  }
  return null;
}
function validateAddress(address) {
  const trimmed = (address || "").trim();
  if (!trimmed) {
    return "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0645\u0637\u0644\u0648\u0628 \u0628\u0627\u0644\u0643\u0627\u0645\u0644";
  }
  if (trimmed.length < 10) {
    return "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0634\u062D\u0646 \u0642\u0635\u064A\u0631 \u062C\u062F\u0627\u064B. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0639\u0646\u0648\u0627\u0646 \u062D\u0642\u064A\u0642\u064A \u0648\u0645\u0641\u0635\u0644 (\u0627\u0633\u0645 \u0627\u0644\u062D\u064A\u060C \u0631\u0642\u0645 \u0639\u0645\u0627\u0631\u0629/\u0645\u0646\u0632\u0644\u060C \u0627\u0644\u0634\u0642\u0629 \u0648\u0627\u0644\u0645\u062F\u064A\u0646\u0629) \u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0633\u0644\u064A\u0645 \u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u062C\u0645\u0644\u0629.";
  }
  if (/(.)\1\1\1\1\1/.test(trimmed)) {
    return "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0627\u0644\u064A \u0623\u0648 \u063A\u064A\u0631 \u0645\u0646\u0637\u0642\u064A. \u064A\u0631\u062C\u0649 \u0643\u062A\u0627\u0628\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u062D\u0642\u064A\u0642\u064A\u0629 \u0644\u0644\u0639\u0646\u0648\u0627\u0646 \u0644\u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u0634\u062D\u0646.";
  }
  return null;
}
function validateEmailAddress(email) {
  const trimmed = (email || "").trim().toLowerCase();
  if (!trimmed) {
    return "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0644\u0644\u0634\u0631\u0643\u0629 \u0645\u0637\u0644\u0648\u0628";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u0635\u064A\u063A\u0629 \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u062F\u062E\u0644\u0629 \u0628\u0634\u0643\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D";
  }
  const domain = trimmed.split("@")[1];
  if (!domain) {
    return "\u062A\u0623\u0643\u062F \u0645\u0646 \u0643\u062A\u0627\u0628\u0629 \u0646\u0637\u0627\u0642 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0628\u0634\u0643\u0644 \u0635\u062D\u064A\u062D";
  }
  const disposableKeywords = [
    "mailinator",
    "tempmail",
    "guerrillamail",
    "10minutemail",
    "yopmail",
    "throwaway",
    "disposable",
    "temp-mail",
    "trashmail",
    "getairmail",
    "sharklasers",
    "guerrillamailblock",
    "pokemail",
    "dispostable",
    "fakeinbox",
    "generator"
  ];
  const isDisposable = disposableKeywords.some((keyword) => domain.includes(keyword));
  if (isDisposable) {
    return "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0624\u0642\u062A \u0648\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0628\u0627\u0644\u0645\u0646\u0635\u0629 \u0644\u062A\u0641\u0627\u062F\u064A \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0648\u0647\u0645\u064A\u0629";
  }
  return null;
}
var registerRateLimits = /* @__PURE__ */ new Map();
var otpRateLimits = /* @__PURE__ */ new Map();
var forgotRateLimits = /* @__PURE__ */ new Map();
var redeemRateLimits = /* @__PURE__ */ new Map();
function checkRateLimit(key, limitMap, maxHits, windowMs) {
  const now = Date.now();
  const record = limitMap.get(key) || { timestamps: [] };
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
  if (record.timestamps.length >= maxHits) {
    return false;
  }
  record.timestamps.push(now);
  limitMap.set(key, record);
  return true;
}
var emailOtps = /* @__PURE__ */ new Map();
var recoveryOtps = /* @__PURE__ */ new Map();
app.post("/api/auth/register", registerLimiter, async (req, res) => {
  try {
    const { email, name, role, phone, whatsapp, city, password, referredBy } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const rateLimitKey = `${ip}-${email || ""}`;
    if (!checkRateLimit(rateLimitKey, registerRateLimits, 5, 10 * 60 * 1e3)) {
      return res.status(429).json({ error: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u0633\u062C\u064A\u0644. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 10 \u062F\u0642\u0627\u0626\u0642 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B." });
    }
    if (!email || !name || !role || !phone || !whatsapp || !city || !password) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u0631\u062C\u0649 \u0645\u0644\u0621 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    const nameErr = validateFullName(name);
    if (nameErr) return res.status(400).json({ error: nameErr });
    const phoneErr = validatePhoneNumber(phone);
    if (phoneErr) return res.status(400).json({ error: phoneErr });
    const emailErr = validateEmailAddress(email);
    if (emailErr) return res.status(400).json({ error: emailErr });
    const passErr = validateStrongPassword(password);
    if (passErr) return res.status(400).json({ error: passErr });
    const users = dbInstance.getUsers();
    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u0628\u0642\u0627\u064B" });
    }
    if (users.find((u) => (u.phone || "").trim() === phone.trim())) {
      return res.status(400).json({ error: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u0628\u0642\u0627\u064B" });
    }
    const userId = "u-" + Math.random().toString(36).substr(2, 9);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let referralCode = "";
    for (let i = 0; i < 9; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    let points = 200;
    const referralTx = [];
    let referrerUser;
    if (referredBy) {
      referrerUser = users.find((u) => u.referralCode === referredBy);
      if (referrerUser && referrerUser.id !== userId) {
        points += 60;
        referrerUser.points += 120;
        const refTxId1 = "tx-" + Math.random().toString(36).substr(2, 9);
        dbInstance.getWalletTransactions().push({
          id: refTxId1,
          userId: referrerUser.id,
          type: "credit",
          amount: 0,
          points: 120,
          description: `\u0645\u0643\u0627\u0641\u0623\u0629 \u0625\u062D\u0627\u0644\u0629 \u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u062F\u064A\u062F: ${name}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "completed"
        });
        const refTxId2 = "tx-" + Math.random().toString(36).substr(2, 9);
        referralTx.push({
          id: refTxId2,
          userId,
          type: "credit",
          amount: 0,
          points: 60,
          description: `\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0639\u0628\u0631 \u0643\u0648\u062F \u0627\u0644\u0625\u062D\u0627\u0644\u0629 \u0627\u0644\u062E\u0627\u0635 \u0628\u0627\u0644\u0628\u0627\u0626\u0639: ${referrerUser.name}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "completed"
        });
      }
    }
    const companyName = role === "seller" ? `${name} \u0644\u0644\u062C\u0645\u0644\u0629` : void 0;
    const companyLogo = role === "seller" ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200" : void 0;
    const companyBanner = role === "seller" ? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200" : void 0;
    const companyDesc = role === "seller" ? "\u0628\u0627\u0626\u0639 \u062C\u0645\u0644\u0629 \u0648\u0645\u0648\u0631\u062F \u0645\u0648\u062B\u0648\u0642 \u0644\u062A\u0642\u062F\u064A\u0645 \u0623\u062C\u0648\u062F \u0627\u0644\u0633\u0644\u0639 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0628\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631." : void 0;
    const isAdmin = isAdminRole(role);
    const newUser = {
      id: userId,
      email,
      name,
      role,
      phone,
      whatsapp,
      city,
      points,
      referralCode,
      referredBy: referrerUser?.referralCode,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isVerified: isAdmin ? true : false,
      status: isAdmin ? "active" : "pending_verification",
      companyName,
      companyLogo,
      companyBanner,
      companyDesc,
      badges: role === "seller" ? ["New Seller"] : []
    };
    users.push(newUser);
    passwords[userId] = hashPassword(password);
    passwordChanged[userId] = true;
    dbInstance.getWalletTransactions().push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId,
      type: "credit",
      amount: 0,
      points: 200,
      description: "\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0644\u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062C\u062F\u064A\u062F \u0641\u064A Sou9AlJoumla",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "completed"
    });
    if (referralTx.length > 0) {
      dbInstance.getWalletTransactions().push(...referralTx);
    }
    if (isAdmin) {
      dbInstance.persist();
      const sessionToken = import_crypto2.default.randomBytes(32).toString("hex");
      sessionStore.set(sessionToken, {
        userId: newUser.id,
        role: newUser.role,
        passwordVersion: newUser.passwordVersion || 0,
        deviceFingerprint: generateDeviceFingerprint(req),
        ipAddress: getClientIp(req),
        expiresAt: Date.now() + 2 * 60 * 60 * 1e3
        // 2 hours
      });
      setSessionCookie(res, sessionToken);
      res.json({
        success: true,
        pendingVerification: false,
        email,
        user: newUser
      });
    } else {
      const code = generateOTP();
      emailOtps.set(email.toLowerCase(), {
        code,
        expiresAt: Date.now() + 15 * 60 * 1e3
      });
      await sendOTP(newUser, code, "REGISTER", getClientIp(req));
      dbInstance.persist();
      res.json({
        success: true,
        pendingVerification: true,
        email,
        otpCodeSimulated: code,
        user: newUser
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628 \u0644\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644" });
    }
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const rateLimitKey = `${ip}-${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, otpRateLimits, 3, 5 * 60 * 1e3)) {
      return res.status(429).json({ error: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0631\u0645\u0648\u0632. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 5 \u062F\u0642\u0627\u0626\u0642 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B." });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0627\u0644\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629" });
    }
    const code = generateOTP();
    emailOtps.set(email.toLowerCase(), {
      code,
      expiresAt: Date.now() + 15 * 60 * 1e3
    });
    await sendOTP(user, code, "REGISTER", getClientIp(req));
    res.json({ success: true, email, otpCodeSimulated: code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0648\u0627\u0644\u0631\u0645\u0632 \u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629" });
    }
    try {
      await verifyOTP(user.id, code, "REGISTER", getClientIp(req));
    } catch (verifyErr) {
      return res.status(400).json({ error: verifyErr.message });
    }
    user.status = "active";
    dbInstance.persist();
    emailOtps.delete(email.toLowerCase());
    const sessionToken = import_crypto2.default.randomBytes(32).toString("hex");
    sessionStore.set(sessionToken, {
      userId: user.id,
      role: user.role,
      passwordVersion: user.passwordVersion || 0,
      deviceFingerprint: generateDeviceFingerprint(req),
      ipAddress: getClientIp(req),
      expiresAt: Date.now() + 2 * 60 * 60 * 1e3
      // 2 hours
    });
    setSessionCookie(res, sessionToken);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0645\u0645\u062A\u0644\u0626 \u0644\u0644\u0645\u0648\u0627\u0635\u0644\u0629" });
    }
    const emailErr = validateEmailAddress(email);
    if (emailErr) {
      return res.status(400).json({ error: emailErr });
    }
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const rateLimitKey = `${ip}-${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, forgotRateLimits, 3, 5 * 60 * 1e3)) {
      return res.status(429).json({ error: "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u062D\u062F \u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647. \u0627\u0644\u0631\u062C\u0627\u0621 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 5 \u062F\u0642\u0627\u0626\u0642." });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0627\u0644\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0644\u062F\u064A\u0646\u0627 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1e3;
    let timestamps = user.passwordResetTimestamps || [];
    timestamps = timestamps.filter((t) => new Date(t).getTime() > oneDayAgo);
    user.passwordResetTimestamps = timestamps;
    if (timestamps.length >= 3 && !isAdminRole(user.role)) {
      return res.status(400).json({ error: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0623\u0643\u062B\u0631 \u0645\u0646 3 \u0645\u0631\u0627\u062A \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629." });
    }
    const recoveryCode = generateOTP();
    recoveryOtps.set(email.toLowerCase(), {
      code: recoveryCode,
      expiresAt: Date.now() + 15 * 60 * 1e3
    });
    await sendOTP(user, recoveryCode, "RESET_PASSWORD", getClientIp(req));
    const isGM = user.role === "superadmin" || user.id === "u-admin";
    res.json({ success: true, email, otpCodeSimulated: recoveryCode, isGMAccount: isGM });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/verify-recovery", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629" });
    }
    try {
      await verifyOTP(user.id, code, "RESET_PASSWORD", getClientIp(req), void 0, false);
    } catch (verifyErr) {
      return res.status(400).json({ error: verifyErr.message });
    }
    res.json({ success: true, verified: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/reset-password", resetPasswordLimiter, async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0645\u0644\u0621 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0644\u062A\u0648\u0644\u064A\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "\u062A\u0639\u0630\u0631 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0635\u0627\u062D\u0628 \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A." });
    }
    try {
      await verifyOTP(user.id, code, "RESET_PASSWORD", getClientIp(req), void 0, true);
    } catch (verifyErr) {
      return res.status(400).json({ error: verifyErr.message });
    }
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1e3;
    let timestamps = user.passwordResetTimestamps || [];
    timestamps = timestamps.filter((t) => new Date(t).getTime() > oneDayAgo);
    if (timestamps.length >= 3 && !isAdminRole(user.role)) {
      return res.status(400).json({ error: "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0623\u0643\u062B\u0631 \u0645\u0646 3 \u0645\u0631\u0627\u062A \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629." });
    }
    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();
    passwords[user.id] = hashPassword(newPassword);
    passwordChanged[user.id] = true;
    timestamps.push((/* @__PURE__ */ new Date()).toISOString());
    user.passwordResetTimestamps = timestamps;
    user.passwordResetCount = (user.passwordResetCount || 0) + 1;
    recoveryOtps.delete(email.toLowerCase());
    dbInstance.persist();
    res.json({ success: true, message: "\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0648\u0631\u0628\u0637\u0647\u0627 \u0628\u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0646\u062C\u0627\u062D!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var loginFailures = /* @__PURE__ */ new Map();
app.post("/api/auth/login", loginLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" });
    }
    const failureRecord = loginFailures.get(email.toLowerCase()) || { count: 0, lockedUntil: 0 };
    if (failureRecord.lockedUntil > Date.now()) {
      const remainingMin = Math.ceil((failureRecord.lockedUntil - Date.now()) / 6e4);
      securityLogger.warn({ event: "LOGIN_ATTEMPT_ON_LOCKED_ACCOUNT", email, ip: req.ip });
      return res.status(403).json({ error: `\u062A\u0645 \u0642\u0641\u0644 \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0643\u062B\u0631\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u0641\u0627\u0634\u0644\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 ${remainingMin} \u062F\u0642\u064A\u0642\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u062B\u0627\u0646\u064A\u0629.` });
    }
    const users = dbInstance.getUsers();
    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      securityLogger.warn({ event: "LOGIN_ATTEMPT_USER_NOT_FOUND", email, ip: req.ip });
      return res.status(400).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0648\u0642\u0648\u0641 \u062D\u0627\u0644\u064A\u0627\u064B \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0625\u062F\u0627\u0631\u0629" });
    }
    const isUserAdmin = isAdminRole(user.role);
    if (isUserAdmin) {
      user.isAdmin = true;
      if (!user.firstLoginDone) {
        user.mustChangePassword = true;
      }
      if (user.status === "pending_verification" || !user.isVerified) {
        user.status = "active";
        user.isVerified = true;
        dbInstance.persist();
      }
    } else if (user.status === "pending_verification") {
      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      emailOtps.set(email.toLowerCase(), {
        code,
        expiresAt: Date.now() + 15 * 60 * 1e3
      });
      console.log(`[SIMULATED EMAIL SERVICE] Login Verification OTP for ${email}: ${code}`);
      return res.status(401).json({
        error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0644\u0645 \u064A\u062A\u0645 \u062A\u0641\u0639\u064A\u0644\u0647 \u0628\u0639\u062F. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 OTP \u0644\u0644\u062A\u0641\u0639\u064A\u0644.",
        pendingVerification: true,
        email: user.email,
        otpCodeSimulated: code
      });
    }
    if (!comparePassword(user.id, password, passwords[user.id])) {
      const failedCount = failureRecord.count + 1;
      let lockTime = 0;
      if (failedCount >= 5) {
        lockTime = Date.now() + 15 * 60 * 1e3;
      }
      loginFailures.set(email.toLowerCase(), { count: failedCount, lockedUntil: lockTime });
      securityLogger.warn({
        event: "LOGIN_PASSWORD_MISMATCH",
        email: email.toLowerCase(),
        failedCount,
        locked: failedCount >= 5,
        ip: req.ip
      });
      return res.status(400).json({
        error: failedCount >= 5 ? "\u062A\u0645 \u0642\u0641\u0644 \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0643\u062B\u0631\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u0641\u0627\u0634\u0644\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 15 \u062F\u0642\u064A\u0642\u0629 \u062B\u0627\u0646\u064A\u0629." : "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629"
      });
    }
    loginFailures.delete(email.toLowerCase());
    if (user.isAdmin && user.mustChangePassword) {
      dbInstance.getAuditLogs().push({
        id: "aud-" + Math.random().toString(36).substr(2, 9),
        adminId: user.id,
        adminEmail: user.email,
        adminName: user.name,
        action: "ADMIN_FIRST_LOGIN_TRIGGERED",
        ip: getClientIp(req),
        details: "\u062A\u0645 \u0631\u0635\u062F \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0623\u0648\u0644 \u0644\u0644\u0645\u0633\u0624\u0648\u0644 \u0648\u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0628\u0625\u0644\u0632\u0627\u0645\u064A\u0629 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      dbInstance.persist();
      return res.status(403).json({
        forcePasswordChange: true,
        requirePasswordChange: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        redirect: "/admin-change-password",
        lockNavigation: true,
        error: "\u064A\u062C\u0628 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0641\u064A \u0623\u0648\u0644 \u062F\u062E\u0648\u0644 \u0641\u0642\u0637",
        message: "\u064A\u062C\u0628 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0641\u064A \u0623\u0648\u0644 \u062F\u062E\u0648\u0644 \u0641\u0642\u0637"
      });
    }
    if ((user.role === "admin" || user.role === "superadmin") && passwordChanged[user.id] === false) {
      user.mustChangePassword = true;
      dbInstance.getAuditLogs().push({
        id: "aud-" + Math.random().toString(36).substr(2, 9),
        adminId: user.id,
        adminEmail: user.email,
        adminName: user.name,
        action: "ADMIN_FIRST_LOGIN_TRIGGERED",
        ip: getClientIp(req),
        details: "\u062A\u0645 \u0631\u0635\u062F \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0623\u0648\u0644 \u0644\u0644\u0645\u0633\u0624\u0648\u0644 \u0648\u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0628\u0625\u0644\u0632\u0627\u0645\u064A\u0629 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 (Legacy check).",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      dbInstance.persist();
      return res.status(403).json({
        forcePasswordChange: true,
        requirePasswordChange: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        redirect: "/admin-change-password",
        lockNavigation: true,
        error: "\u064A\u062C\u0628 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0641\u064A \u0623\u0648\u0644 \u062F\u062E\u0648\u0644 \u0641\u0642\u0637",
        message: "\u064A\u062C\u0628 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0641\u064A \u0623\u0648\u0644 \u062F\u062E\u0648\u0644 \u0641\u0642\u0637"
      });
    }
    const sessionToken = import_crypto2.default.randomBytes(32).toString("hex");
    sessionStore.set(sessionToken, {
      userId: user.id,
      role: user.role,
      passwordVersion: user.passwordVersion || 0,
      deviceFingerprint: generateDeviceFingerprint(req),
      ipAddress: getClientIp(req),
      expiresAt: Date.now() + 2 * 60 * 60 * 1e3
      // 2 hours
    });
    setSessionCookie(res, sessionToken);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/force-change-password", (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629 \u0644\u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" });
  }
  const users = dbInstance.getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  }
  if (user.mustChangePassword) {
    if (!lockAuthFlow(user.id)) {
      return res.status(429).json({ error: "\u062A\u0645 \u0643\u0634\u0641 \u0639\u0645\u0644\u064A\u0629 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u0627\u0631\u064A\u0629 \u0628\u0627\u0644\u0641\u0639\u0644 \u0644\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628." });
    }
  }
  try {
    const passErr = validateStrongPassword(newPassword);
    if (passErr) {
      return res.status(400).json({ error: passErr });
    }
    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();
    revokeAllSessions(userId);
    passwords[userId] = hashPassword(newPassword);
    passwordChanged[userId] = true;
    user.passwordVersion = (user.passwordVersion || 0) + 1;
    user.passwordChangedManually = true;
    user.firstLoginDone = true;
    user.mustChangePassword = false;
    user.isAdmin = true;
    if (user.role === "admin" || user.role === "superadmin") {
      dbInstance.getAuditLogs().push({
        id: "aud-" + Math.random().toString(36).substr(2, 9),
        adminId: user.id,
        adminEmail: user.email,
        adminName: user.name,
        action: "ADMIN_PASSWORD_CHANGED",
        ip: getClientIp(req),
        details: "\u062A\u0645 \u0628\u0646\u062C\u0627\u062D \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064A\u0629 \u0644\u0644\u0645\u0634\u0631\u0641 \u0644\u0623\u0648\u0644 \u0645\u0631\u0629 \u0648\u062A\u062D\u062F\u064A\u062B \u0631\u0642\u0645 \u0641\u062D\u0635 \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0644\u062A\u0639\u0637\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0642\u062F\u064A\u0645\u0629.",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      dbInstance.getAuditLogs().push({
        id: "aud-" + Math.random().toString(36).substr(2, 9),
        adminId: user.id,
        adminEmail: user.email,
        adminName: user.name,
        action: "\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064A\u0629 \u0644\u0644\u0645\u062F\u064A\u0631",
        ip: getClientIp(req),
        details: "\u062A\u0645 \u0625\u062C\u0631\u0627\u0621 \u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u0628\u0646\u062C\u0627\u062D \u0644\u0644\u0645\u0631\u0629 \u0627\u0644\u0623\u0648\u0644\u0649.",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    dbInstance.persist();
    const sessionToken = import_crypto2.default.randomBytes(32).toString("hex");
    sessionStore.set(sessionToken, {
      userId: user.id,
      role: user.role,
      passwordVersion: user.passwordVersion,
      deviceFingerprint: generateDeviceFingerprint(req),
      ipAddress: getClientIp(req),
      expiresAt: Date.now() + 2 * 60 * 60 * 1e3
      // 2 hours
    });
    setSessionCookie(res, sessionToken);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    unlockAuthFlow(userId);
  }
});
app.post("/api/auth/update-profile", (req, res) => {
  try {
    const { userId, name, whatsapp, phone, companyName, companyLogo, companyBanner, companyDesc, city, profile_image, banner_image, password, otpCode } = req.body;
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0642\u064A\u0627\u0645 \u0628\u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621." });
    }
    if (sessionUser.role !== "superadmin" && sessionUser.role !== "admin" && sessionUser.userId !== userId) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u062D\u062F\u064A\u062B \u062D\u0633\u0627\u0628 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645." });
    }
    const users = dbInstance.getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
    }
    const user = users[userIndex];
    const isGM = user.role === "superadmin" || user.id === "u-admin";
    if (isGM) {
      const hasSensitiveChange = phone && phone !== user.phone || whatsapp && whatsapp !== user.whatsapp || city && city !== user.city || name && name !== user.name || profile_image !== void 0 && profile_image !== user.profile_image || banner_image !== void 0 && banner_image !== user.banner_image;
      if (hasSensitiveChange) {
        if (!password) {
          return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0642\u062F\u064A\u0645 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u0644\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0623\u0648\u0644 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0647\u0648\u064A\u0629 (Re-authentication)." });
        }
        const passwords = dbInstance.getPasswords();
        if (!comparePassword(user.id, password, passwords[user.id])) {
          return res.status(400).json({ error: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u062F\u062E\u0644\u0629 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0647\u0648\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629." });
        }
        if (!otpCode) {
          return res.status(400).json({ error: "\u0645\u0646 \u0641\u0636\u0644\u0643 \u0623\u0631\u0633\u0644 \u0648\u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0625\u0636\u0627\u0641\u064A \u0627\u0644\u0645\u062D\u0645\u064A (OTP) \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u0649 \u0647\u0627\u062A\u0641\u0643 06******46 (\u0645\u0637\u0644\u0648\u0628 \u0644\u062D\u0645\u0627\u064A\u0629 \u062D\u0633\u0627\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0645\u0629)." });
        }
        const savedOtp = securityOtps.get(userId);
        if (!savedOtp) {
          return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 (OTP) \u0623\u0648\u0644\u0627\u064B \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0646 \u062C\u062F\u064A\u062F." });
        }
        if (Date.now() > savedOtp.expiresAt) {
          return res.status(400).json({ error: "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062B\u0646\u0627\u0626\u064A \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629\u060C \u064A\u0631\u062C\u0649 \u0637\u0644\u0628 \u0631\u0645\u0632 \u062C\u062F\u064A\u062F." });
        }
        if (savedOtp.code !== otpCode.trim()) {
          return res.status(400).json({ error: "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062B\u0646\u0627\u0626\u064A (OTP) \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0644\u0631\u0628\u0637 \u0627\u0644\u062D\u0633\u0627\u0628." });
        }
        securityOtps.delete(userId);
      }
    }
    if (name && name !== user.name) {
      const lastUpdateKey = `name_last_update_of_${user.id}`;
      const settings = dbInstance.getSettings();
      const lastUpdateTime = settings[lastUpdateKey] || user.last_name_change_at;
      if (lastUpdateTime) {
        const lastDate = new Date(lastUpdateTime);
        const differenceInDays = ((/* @__PURE__ */ new Date()).getTime() - lastDate.getTime()) / (1e3 * 3600 * 24);
        if (differenceInDays < 60) {
          const daysLeft = Math.ceil(60 - differenceInDays);
          return res.status(400).json({
            error: `\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0627\u0633\u0645 \u062D\u0627\u0644\u064A\u0627\u064B. \u0627\u0644\u062A\u063A\u064A\u064A\u0631 \u0645\u062A\u0627\u062D \u0645\u0631\u0629 \u0643\u0644 \u0634\u0647\u0631\u064A\u0646 (60 \u064A\u0648\u0645\u0627\u064B)\u060C \u064A\u062A\u0628\u0642\u0649 \u0644\u0643 ${daysLeft} \u064A\u0648\u0645.`
          });
        }
      }
      user.name = name;
      user.last_name_change_at = (/* @__PURE__ */ new Date()).toISOString();
      settings[lastUpdateKey] = user.last_name_change_at;
    }
    user.phone = phone || user.phone;
    user.whatsapp = whatsapp || user.whatsapp;
    user.city = city || user.city;
    if (profile_image !== void 0) user.profile_image = profile_image;
    if (banner_image !== void 0) user.banner_image = banner_image;
    if (user.role === "seller") {
      user.companyName = companyName || user.companyName;
      user.companyLogo = profile_image || companyLogo || user.companyLogo;
      user.companyBanner = banner_image || companyBanner || user.companyBanner;
      user.companyDesc = companyDesc || user.companyDesc;
    }
    if (!user.companyLogo && user.profile_image) {
      user.companyLogo = user.profile_image;
    }
    if (!user.companyBanner && user.banner_image) {
      user.companyBanner = user.banner_image;
    }
    user.sales_count = user.sales_count !== void 0 ? user.sales_count : 0;
    user.rating = user.rating !== void 0 ? user.rating : user.role === "seller" ? 5 : 0;
    user.points_spent = user.points_spent !== void 0 ? user.points_spent : 0;
    user.badges = user.badges || [];
    dbInstance.persist();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/send-security-otp", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0645\u062A\u0644\u0626" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0644\u0645\u0646\u0635\u0629" });
    }
    const isGM = user.role === "superadmin" || user.id === "u-admin";
    if (!isGM) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0645\u062E\u0635\u0635 \u0648\u062E\u0627\u0635 \u0628\u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0644\u0644\u0645\u0646\u0635\u0629 \u0644\u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062B\u0646\u0627\u0626\u064A." });
    }
    const code = generateOTP();
    securityOtps.set(userId, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1e3
      // Valid for 10 minutes
    });
    await sendOTP(user, code, "CHANGE_PASSWORD", getClientIp(req));
    res.json({
      success: true,
      maskedPhone: "06******46",
      otpCodeSimulated: code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/change-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, otpCode } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u062C\u0645\u064A\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    const users = dbInstance.getUsers();
    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0644\u0645\u0646\u0635\u0629" });
    }
    const isGM = user.role === "superadmin" || user.id === "u-admin";
    if (isGM) {
      if (!otpCode) {
        return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062B\u0646\u0627\u0626\u064A (OTP) \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u0649 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u062E\u0627\u0635 \u0628\u062D\u0645\u0627\u064A\u0629 \u062D\u0633\u0627\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u0629." });
      }
      try {
        await verifyOTP(userId, otpCode, "CHANGE_PASSWORD", getClientIp(req));
      } catch (verifyErr) {
        return res.status(400).json({ error: verifyErr.message });
      }
      securityOtps.delete(userId);
    }
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1e3;
    let timestamps = user.passwordResetTimestamps || [];
    timestamps = timestamps.filter((t) => new Date(t).getTime() > oneDayAgo);
    user.passwordResetTimestamps = timestamps;
    if (timestamps.length >= 3 && !isAdminRole(user.role)) {
      return res.status(400).json({ error: "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0623\u0643\u062B\u0631 \u0645\u0646 3 \u0645\u0631\u0627\u062A \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629." });
    }
    const passErr = validateStrongPassword(newPassword);
    if (passErr) {
      return res.status(400).json({ error: passErr });
    }
    if (!comparePassword(user.id, oldPassword, passwords[user.id])) {
      return res.status(400).json({ error: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
    passwords[userId] = hashPassword(newPassword);
    passwordChanged[userId] = true;
    timestamps.push((/* @__PURE__ */ new Date()).toISOString());
    user.passwordResetTimestamps = timestamps;
    user.passwordResetCount = (user.passwordResetCount || 0) + 1;
    dbInstance.persist();
    res.json({ success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/cities", (req, res) => {
  res.json(dbInstance.getCities());
});
app.get("/api/categories", (req, res) => {
  res.json(dbInstance.getCategories());
});
app.post("/api/categories/reorder", (req, res) => {
  try {
    const { adminId, orderedIds } = req.body;
    if (!adminId || !orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "\u0645\u0646 \u0641\u0636\u0644\u0643 \u0623\u0631\u0633\u0644 \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0648\u0645\u0635\u0641\u0648\u0641\u0629 \u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u062C\u062F\u064A\u062F." });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin" || u.role === "moderator"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u0639\u0627\u062F\u0629 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u0642\u0633\u0627\u0645." });
    }
    const categories = dbInstance.getCategories();
    categories.forEach((c) => {
      const idx = orderedIds.indexOf(c.id);
      if (idx !== -1) {
        c.sortOrder = idx * 10;
      } else {
        c.sortOrder = 9999;
      }
    });
    dbInstance.persist();
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u0642\u0633\u0627\u0645",
      details: `\u0642\u0627\u0645 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 ${admin.name} \u0628\u0625\u0639\u0627\u062F\u0629 \u062A\u0631\u062A\u064A\u0628 \u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A.`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, categories: dbInstance.getCategories() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/categories/reset", (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0645\u0637\u0644\u0648\u0628 \u0644\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A." });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin" || u.role === "moderator"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u0642\u0633\u0627\u0645." });
    }
    const defaultSeedIds = ["cat1", "cat2", "cat3", "cat4", "cat5", "cat6", "cat7"];
    const categories = dbInstance.getCategories();
    categories.forEach((c) => {
      const idx = defaultSeedIds.indexOf(c.id);
      if (idx !== -1) {
        c.sortOrder = idx * 10;
      } else {
        c.sortOrder = 9999;
      }
    });
    dbInstance.persist();
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0644\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A",
      details: `\u0642\u0627\u0645 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 ${admin.name} \u0628\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637 \u062A\u0631\u062A\u064A\u0628 \u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0644\u0648\u0636\u0639 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A.`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, categories: dbInstance.getCategories() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var productsCache = /* @__PURE__ */ new Map();
var originalPersist = dbInstance.persist.bind(dbInstance);
dbInstance.persist = () => {
  productsCache.clear();
  originalPersist();
};
app.get("/sitemap.xml", (req, res) => {
  try {
    const products = dbInstance.getProducts().filter((p) => p.status === "active" || p.status === "approved");
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}` || "https://sou9aljoumla.com";
    const staticUrls = [
      "",
      "/about",
      "/contact"
    ].map((p) => `  <url>
    <loc>${baseUrl}${p}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n");
    const productUrls = products.map((p) => {
      const slug = p.slug || p.id;
      return `  <url>
    <loc>${baseUrl}/product/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${productUrls}
</urlset>`;
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error compiling XML Sitemap");
  }
});
app.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}` || "https://sou9aljoumla.com";
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: ${baseUrl}/sitemap.xml`);
});
app.get("/api/products", (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    if (productsCache.has(cacheKey)) {
      return res.json(productsCache.get(cacheKey));
    }
    checkAndCleanExpiredPremiums();
    const { q, category, city, sortBy, filterFeatured, sellerId, viewerId } = req.query;
    const usersList = dbInstance.getUsers();
    let list = [...dbInstance.getProducts()].filter((p) => {
      const isOwner = sellerId && String(sellerId) === p.sellerId && viewerId && String(viewerId) === p.sellerId;
      const isApproved = p.status === "active" || p.status === "approved";
      if (!isApproved && !isOwner) {
        return false;
      }
      if (sellerId && p.sellerId !== String(sellerId)) {
        return false;
      }
      const seller = usersList.find((u) => u.id === p.sellerId);
      if (seller && (seller.role === "superadmin" || seller.id === "u-admin")) {
        return false;
      }
      return true;
    });
    if (q) {
      const qStr = String(q).toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(qStr) || p.description.toLowerCase().includes(qStr) || p.titleFr && p.titleFr.toLowerCase().includes(qStr) || p.shortDescription && p.shortDescription.toLowerCase().includes(qStr) || p.tags.some((t) => t.toLowerCase().includes(qStr))
      );
    }
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    if (city) {
      list = list.filter((p) => p.location.toLowerCase() === String(city).toLowerCase());
    }
    if (filterFeatured === "true") {
      list = list.filter((p) => p.isFeatured || p.is_premium || p.isPinned);
    }
    const getPremiumTime = (p) => {
      const d = p.premium_created_at || p.createdAt;
      return d ? new Date(d).getTime() : 0;
    };
    const getCreatedTime = (p) => {
      return p.createdAt ? new Date(p.createdAt).getTime() : 0;
    };
    const pinnedAds = list.filter((p) => p.isPinned);
    const unpinnedPremium = list.filter((p) => !p.isPinned && (p.isFeatured || p.is_premium));
    const normalAds = list.filter((p) => !p.isPinned && !p.isFeatured && !p.is_premium);
    unpinnedPremium.sort((a, b) => getPremiumTime(b) - getPremiumTime(a));
    pinnedAds.sort((a, b) => {
      const aPremium = a.isFeatured || a.is_premium;
      const bPremium = b.isFeatured || b.is_premium;
      if (aPremium && !bPremium) return -1;
      if (!aPremium && bPremium) return 1;
      return getPremiumTime(b) - getPremiumTime(a);
    });
    if (sortBy === "price_asc") {
      normalAds.sort((a, b) => a.priceMin - b.priceMin);
    } else if (sortBy === "price_desc") {
      normalAds.sort((a, b) => b.priceMin - a.priceMin);
    } else if (sortBy === "views") {
      normalAds.sort((a, b) => b.views - a.views);
    } else {
      normalAds.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
    }
    list = [...pinnedAds, ...unpinnedPremium, ...normalAds];
    const enrichedList = list.map((p) => {
      const seller = usersList.find((u) => u.id === p.sellerId);
      return {
        ...p,
        sellerVerified: seller ? seller.isVerified : p.sellerVerified,
        sellerName: seller ? seller.companyName || seller.name : p.sellerName,
        sellerBadges: seller ? seller.badges || [] : []
      };
    });
    productsCache.set(cacheKey, enrichedList);
    res.json(enrichedList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/products/:id", (req, res) => {
  try {
    checkAndCleanExpiredPremiums();
    const { id: paramId } = req.params;
    const products = dbInstance.getProducts();
    const item = products.find((p) => p.id === paramId || p.slug === paramId);
    if (!item) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
    }
    const id = item.id;
    const ipStr = getClientIp(req);
    const userIdVal = req.query.userId || req.body.userId || "guest";
    const trackingKey = `${ipStr}-${userIdVal}`;
    if (!productVisitsCache.has(id)) {
      productVisitsCache.set(id, /* @__PURE__ */ new Map());
    }
    const productCache = productVisitsCache.get(id);
    const nowTime = Date.now();
    const lastVisit = productCache.get(trackingKey) || 0;
    if (nowTime - lastVisit > 864e5) {
      item.views = (item.views || 0) + 1;
      productCache.set(trackingKey, nowTime);
      saveVisitsCache();
      dbInstance.persist();
    }
    const reviews = dbInstance.getReviews().filter((r) => r.productId === id).map((r) => {
      const media = dbInstance.getReviewMedia().filter((m) => m.review_id === r.id);
      return {
        ...r,
        media
      };
    });
    const comments = dbInstance.getComments().filter((c) => c.productId === id);
    const seller = dbInstance.getUsers().find((u) => u.id === item.sellerId);
    const isGMSeller = seller && (seller.role === "superadmin" || seller.id === "u-admin");
    const questions = dbInstance.getReviewQuestions().filter((q) => q.product_id === id).map((q) => {
      const answers = dbInstance.getReviewAnswers().filter((a) => a.question_id === q.id);
      return {
        ...q,
        answers
      };
    });
    res.json({
      product: item,
      reviews,
      questions,
      comments,
      seller: seller && !isGMSeller ? {
        id: seller.id,
        name: seller.name,
        companyName: seller.companyName,
        companyLogo: seller.companyLogo,
        companyDesc: seller.companyDesc,
        companyBanner: seller.companyBanner,
        phone: seller.phone,
        whatsapp: seller.whatsapp,
        city: seller.city,
        isVerified: seller.isVerified,
        createdAt: seller.createdAt,
        verifiedBadge: seller.isVerified,
        profile_image: seller.profile_image,
        sales_count: seller.sales_count,
        rating: seller.rating,
        badges: seller.badges
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/products/:id/record-contact", (req, res) => {
  try {
    const { id } = req.params;
    const products = dbInstance.getProducts();
    const prod = products.find((p) => p.id === id);
    if (!prod) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0628\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631" });
    }
    const ipStr = getClientIp(req);
    const userIdVal = req.query.userId || req.body.userId || "guest";
    const trackingKey = `${ipStr}-${userIdVal}`;
    if (!productVisitsCache.has(id)) {
      productVisitsCache.set(id, /* @__PURE__ */ new Map());
    }
    const productCache = productVisitsCache.get(id);
    const nowTime = Date.now();
    const lastVisit = productCache.get(trackingKey) || 0;
    if (nowTime - lastVisit > 864e5) {
      prod.views = (prod.views || 0) + 1;
      productCache.set(trackingKey, nowTime);
      saveVisitsCache();
    }
    const users = dbInstance.getUsers();
    const seller = users.find((u) => u.id === prod.sellerId);
    dbInstance.persist();
    res.json({
      success: true,
      sales_count: seller ? seller.sales_count || 0 : 0,
      views: prod.views
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/profile/stats/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u0646\u062F \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0623\u0648 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u062D\u062F\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    const stats = dbInstance.getProfileStats();
    let stat = stats.find((ps) => ps.user_id === userId);
    if (!stat) {
      stat = {
        user_id: userId,
        views_count: userId === "u-seller1" ? 97 : user.role === "seller" ? 15 : 0,
        sales_count: user.sales_count !== void 0 ? user.sales_count : userId === "u-seller1" ? 142 : 0,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      stats.push(stat);
      dbInstance.persist();
    }
    res.json({
      views: stat.views_count,
      sales: stat.sales_count,
      createdAt: user.created_at || user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var profileVisitsCache = {};
app.post("/api/profile/view/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u0646\u062F \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0623\u0648 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u062D\u062F\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    const stats = dbInstance.getProfileStats();
    let stat = stats.find((ps) => ps.user_id === userId);
    if (!stat) {
      stat = {
        user_id: userId,
        views_count: userId === "u-seller1" ? 97 : user.role === "seller" ? 15 : 0,
        sales_count: user.sales_count !== void 0 ? user.sales_count : userId === "u-seller1" ? 142 : 0,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      stats.push(stat);
    }
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;
    if (!profileVisitsCache[userId]) {
      profileVisitsCache[userId] = {};
    }
    const now = Date.now();
    const lastVisit = profileVisitsCache[userId][ipStr] || 0;
    if (now - lastVisit > 3e5) {
      stat.views_count = (stat.views_count || 0) + 1;
      stat.updated_at = (/* @__PURE__ */ new Date()).toISOString();
      profileVisitsCache[userId][ipStr] = now;
      dbInstance.persist();
    }
    res.json({
      views: stat.views_count,
      sales: stat.sales_count,
      createdAt: user.created_at || user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var sellerSpamTracker = {};
function checkProductRisk(productTitle, description, priceMin, priceMax, sellerId) {
  let score = 0;
  const reasons = [];
  const users = dbInstance.getUsers();
  const seller = users.find((u) => u.id === sellerId);
  if (seller) {
    const createdDate = new Date(seller.createdAt || seller.created_at || /* @__PURE__ */ new Date()).getTime();
    const oneDay = 24 * 60 * 60 * 1e3;
    if (Date.now() - createdDate < oneDay) {
      score += 20;
      reasons.push("\u062D\u0633\u0627\u0628 \u0628\u0627\u0626\u0639 \u062C\u062F\u064A\u062F \u062A\u0645 \u0625\u0646\u0634\u0627\u0624\u0647 \u0645\u0624\u062E\u0631\u0627\u064B");
    }
  } else {
    score += 20;
    reasons.push("\u062D\u0633\u0627\u0628 \u0628\u0627\u0626\u0639 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641 \u0623\u0648 \u0645\u062D\u0630\u0648\u0641");
  }
  if (priceMax > 15e4 || priceMin <= 1) {
    score += 15;
    reasons.push("\u0634\u0630\u0648\u0630 \u0645\u0644\u062D\u0648\u0638 \u0641\u064A \u0646\u0637\u0627\u0642 \u062A\u0633\u0639\u064A\u0631 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D");
  }
  const textToAnalyze = (productTitle + " " + description).toLowerCase();
  const bannedKeywords = [
    "\u0648\u0627\u062A\u0633\u0627\u0628",
    "\u0647\u0627\u062A\u0641",
    "\u0627\u062A\u0635\u0627\u0644",
    "\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u064A",
    "\u0631\u0642\u0645\u064A",
    "\u0633\u0643\u0633",
    "\u0645\u062A\u0627\u0628\u0639\u064A\u0646",
    "\u0644\u0627\u064A\u0643\u0627\u062A",
    "whatsapp",
    "phone",
    "call",
    "contact me",
    "follow",
    "subscribers",
    "telegram",
    "http",
    "www."
  ];
  const matchedWords = bannedKeywords.filter((word) => textToAnalyze.includes(word));
  if (matchedWords.length > 0) {
    score += 25;
    reasons.push(`\u0631\u0635\u062F \u0645\u0635\u0637\u0644\u062D\u0627\u062A \u062A\u0631\u0648\u064A\u062C\u064A\u0629 \u0623\u0648 \u0631\u0648\u0627\u0628\u0637 \u062E\u0627\u0631\u062C\u064A\u0629 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647\u0627: ${matchedWords.join(", ")}`);
  }
  const existingProducts = dbInstance.getProducts();
  const cleanCurrentTitle = productTitle.trim().toLowerCase();
  const isDuplicate = existingProducts.some((p) => p.sellerId === sellerId && p.title.trim().toLowerCase() === cleanCurrentTitle);
  if (isDuplicate) {
    score += 40;
    reasons.push("\u0627\u0634\u062A\u0628\u0627\u0647 \u062A\u0643\u0631\u0627\u0631 \u0645\u0641\u0631\u0637 \u0644\u0625\u0639\u0644\u0627\u0646 \u062A\u062C\u0627\u0631\u064A \u0645\u062A\u0637\u0627\u0628\u0642");
  }
  const postTimes = sellerSpamTracker[sellerId] || [];
  const now = Date.now();
  const recentPosts = postTimes.filter((t) => now - t < 5 * 60 * 1e3);
  if (recentPosts.length >= 2) {
    score += 30;
    reasons.push("\u0645\u0639\u062F\u0644 \u062A\u0643\u0631\u0627\u0631 \u0625\u063A\u0631\u0627\u0642 \u0641\u0627\u0626\u0642 \u0627\u0644\u0633\u0631\u0639\u0629 \u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A");
  }
  return { score, reasons };
}
function pushNotificationQueue(userId, text, type = "info") {
  const notifyItem = {
    id: "nq-" + import_crypto2.default.randomUUID(),
    userId,
    text,
    type,
    status: "pending",
    attempts: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbInstance.getNotificationQueue().push(notifyItem);
  processNotificationQueue();
}
function processNotificationQueue() {
  const queue = dbInstance.getNotificationQueue();
  const users = dbInstance.getUsers();
  queue.forEach((item) => {
    if (item.status === "pending" || item.status === "failed") {
      item.attempts += 1;
      const user = users.find((u) => u.id === item.userId);
      if (user) {
        if (!user.notifications) user.notifications = [];
        user.notifications.unshift({
          id: "nt-" + import_crypto2.default.randomUUID(),
          text: item.text,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          isRead: false,
          type: item.type
        });
        item.status = "sent";
        item.sentAt = (/* @__PURE__ */ new Date()).toISOString();
      } else {
        item.status = item.attempts >= 3 ? "failed" : "pending";
      }
    }
  });
  dbInstance.persist();
}
function emitProductCreatedEvent(productId) {
  const products = dbInstance.getProducts();
  const prod = products.find((p) => p.id === productId);
  if (!prod) return;
  if (!sellerSpamTracker[prod.sellerId]) {
    sellerSpamTracker[prod.sellerId] = [];
  }
  sellerSpamTracker[prod.sellerId].push(Date.now());
  const check = checkProductRisk(prod.title, prod.description, prod.priceMin, prod.priceMax, prod.sellerId);
  prod.riskScore = check.score;
  prod.riskReasons = check.reasons;
  let decisionStatus = "queued";
  let priorityOrder = "low";
  if (check.score >= 70) {
    decisionStatus = "blocked";
    prod.status = "rejected";
    prod.rejectionReason = `\u062A\u0645 \u0627\u0644\u062D\u062C\u0628 \u0627\u0644\u0641\u0648\u0631\u064A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0648\u0642\u0627\u0626\u064A \u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u062C\u0631\u062F. \u0627\u0644\u0623\u0633\u0628\u0627\u0628: ${check.reasons.join("\u060C ")}`;
    priorityOrder = "high";
  } else if (check.score >= 30) {
    decisionStatus = "human_review";
    prod.status = "pending_review";
    priorityOrder = "medium";
  } else {
    decisionStatus = "approved";
    prod.status = "approved";
  }
  prod.moderationStatus = decisionStatus === "approved" ? void 0 : decisionStatus;
  prod.publisherEventId = "pub-evt-" + import_crypto2.default.randomUUID();
  const queueElement = {
    id: "mq-" + import_crypto2.default.randomUUID(),
    productId: prod.id,
    productTitle: prod.title,
    sellerId: prod.sellerId,
    sellerName: prod.sellerName || "\u062A\u0627\u062C\u0631 \u0645\u0633\u062C\u0644",
    riskScore: check.score,
    riskReasons: check.reasons,
    status: decisionStatus,
    priority: priorityOrder,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbInstance.getModerationQueue().push(queueElement);
  let text = `\u0645\u0633\u062A\u0644\u0645: \u0627\u0644\u0645\u0646\u062A\u062C "${prod.title}" \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629. `;
  let nType = "info";
  if (decisionStatus === "blocked") {
    text += `\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0644\u0644\u0623\u0645\u0627\u0646 \u0627\u0644\u0648\u0642\u0627\u0626\u064A \u0644\u062A\u0641\u0627\u062F\u064A \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0644 \u0627\u0644\u0645\u062A\u0643\u0631\u0631. \u0627\u0644\u0623\u0633\u0628\u0627\u0628: ${check.reasons.join(", ")}`;
    nType = "danger";
  } else if (decisionStatus === "approved") {
    text += `\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0622\u0644\u064A\u0627\u064B \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u0645 \u062A\u0646\u0634\u064A\u0637 \u0639\u0631\u0636 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u062F\u0648\u0646 \u0627\u0646\u062A\u0638\u0627\u0631!`;
    nType = "success";
  } else {
    text += `\u064A\u062A\u0637\u0644\u0628 \u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u062F\u0642\u064A\u0642 \u0645\u062A\u0642\u062F\u0645\u0629 \u0645\u0646 \u0645\u0634\u0631\u0641\u064A \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0648\u0633\u064A\u062A\u0645 \u0627\u0644\u0628\u062A \u0641\u064A\u0647 \u0633\u0631\u064A\u0639\u0627\u064B \u0644\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0623\u0645\u0646\u064A\u0629.`;
  }
  pushNotificationQueue(prod.sellerId, text, nType);
  dbInstance.persist();
}
app.post("/api/products/create", (req, res) => {
  try {
    const {
      sellerId,
      title,
      titleFr,
      description,
      descriptionFr,
      shortDescription,
      category,
      subcategory,
      brand,
      condition,
      priceMin,
      priceMax,
      moq,
      maxOrder,
      stock,
      sku,
      images,
      videoUrl,
      pdfUrl,
      tags,
      location,
      isFeatured,
      shipping_type,
      shipping_cost
    } = req.body;
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0642\u064A\u0627\u0645 \u0628\u0627\u0644\u0639\u0645\u0644\u064A\u0629." });
    }
    if (sessionUser.role !== "superadmin" && sessionUser.role !== "admin" && sessionUser.userId !== sellerId) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u0625\u0646\u0634\u0627\u0621 \u0645\u0646\u062A\u062C\u0627\u062A \u0628\u0627\u0633\u0645 \u062D\u0633\u0627\u0628 \u0622\u062E\u0631 (\u062D\u0645\u0627\u064A\u0629 IDOR)." });
    }
    if (!sellerId || !title || !description || !category || !subcategory || !priceMin || !priceMax || !moq) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064A\u0629 \u0644\u0644\u0645\u0646\u062A\u062C" });
    }
    if (Number(moq) < 10) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0637\u0644\u0628 (MOQ) 10 \u062D\u0628\u0627\u062A \u0623\u0648 \u0623\u0643\u062B\u0631." });
    }
    let finalShippingType = shipping_type === "paid" ? "paid" : "free";
    let finalShippingCost = 0;
    if (finalShippingType === "paid") {
      const parsedCost = Number(shipping_cost);
      if (shipping_cost === void 0 || shipping_cost === null || shipping_cost === "" || isNaN(parsedCost)) {
        return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0633\u0639\u0631 \u0627\u0644\u0634\u062D\u0646 \u0628\u0645\u0627 \u0623\u0646\u0643 \u0627\u062E\u062A\u0631\u062A \u0634\u062D\u0646\u0627\u064B \u0645\u062F\u0641\u0648\u0639\u0627\u064B" });
      }
      if (parsedCost < 0) {
        return res.status(400).json({ error: "\u0633\u0639\u0631 \u0627\u0644\u0634\u062D\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0633\u0627\u0644\u0628\u0627\u064B" });
      }
      finalShippingCost = parsedCost;
    }
    const users = dbInstance.getUsers();
    const seller = users.find((u) => u.id === sellerId);
    if (!seller) {
      return res.status(404).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0644\u0628\u0627\u0626\u0639 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    if (seller.status === "suspended") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0648\u0642\u0648\u0641 \u0623\u0648 \u0645\u062D\u0638\u0648\u0631 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646\u0647 \u0627\u0644\u0646\u0634\u0631 \u062D\u0627\u0644\u064A\u0627\u064B." });
    }
    let listImages = Array.isArray(images) ? images : [];
    if (listImages.length > 9) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B \u0644\u0627 \u064A\u0633\u0645\u062D \u0628\u0631\u0641\u0639 \u0623\u0643\u062B\u0631 \u0645\u0646 9 \u0635\u0648\u0631 \u0641\u064A \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u0648\u0627\u062D\u062F." });
    }
    const settings = dbInstance.getSettings();
    const dynamicCost = settings.publishingCost !== void 0 ? Number(settings.publishingCost) : 20;
    const paidPublishingEnabled = settings.paidPublishingEnabled !== void 0 ? !!settings.paidPublishingEnabled : true;
    let requiredPoints = 0;
    if (paidPublishingEnabled) {
      requiredPoints = isFeatured ? 60 : dynamicCost;
      if (listImages.length > 4) {
        const extraCount = listImages.length - 4;
        requiredPoints += extraCount * 5;
      }
    }
    if (requiredPoints > 0 && seller.points < requiredPoints) {
      return res.status(402).json({
        error: `\u0631\u0635\u064A\u062F \u0627\u0644\u0646\u0642\u0627\u0637 \u0644\u062F\u064A\u0643 \u063A\u064A\u0631 \u0643\u0627\u0641\u064D. \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${requiredPoints} \u0646\u0642\u0637\u0629\u060C \u0631\u0635\u064A\u062F\u0643 \u0627\u0644\u062D\u0627\u0644\u064A: ${seller.points} \u0646\u0642\u0637\u0629. \u064A\u0631\u062C\u0649 \u0634\u062D\u0646 \u0645\u062D\u0641\u0638\u062A\u0643 \u0644\u0644\u0645\u0648\u0627\u0635\u0644\u0629.`,
        requiredPoints,
        currentPoints: seller.points
      });
    }
    if (requiredPoints > 0) {
      seller.points -= requiredPoints;
    }
    const pId = "p-" + Math.random().toString(36).substr(2, 9);
    const slug = title.toLowerCase().replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-") + "-" + Math.random().toString(36).substr(2, 4);
    const newProduct = {
      id: pId,
      title,
      titleFr: titleFr || title,
      description,
      descriptionFr: descriptionFr || description,
      shortDescription: shortDescription || "",
      shortDescriptionFr: shortDescription || "",
      category,
      subcategory,
      brand: brand || "Generic",
      condition: condition || "new",
      priceMin: Number(priceMin),
      priceMax: Number(priceMax),
      unitPrice: Number(priceMax),
      bulkPrice: Number(priceMin),
      currency: "MAD",
      moq: Number(moq),
      maxOrder: Number(maxOrder || 1e4),
      stock: Number(stock || 100),
      sku: sku || "SKU-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      images: listImages.length > 0 ? listImages : ["https://images.unsplash.com/photo-1546213290-e1b7610339ef?auto=format&fit=crop&q=80&w=600"],
      videoUrl: videoUrl || "",
      pdfUrl: pdfUrl || "",
      tags: Array.isArray(tags) ? tags : [],
      location: location || seller.city,
      sellerId: seller.id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      views: 0,
      status: "pending_review",
      // direct approval by default or admin review configurable
      isFeatured: !!isFeatured,
      is_premium: !!isFeatured,
      premium_created_at: isFeatured ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
      isPinned: false,
      slug,
      sellerName: seller.name,
      sellerVerified: seller.isVerified,
      sellerCity: seller.city,
      sellerRating: 5,
      shipping_type: finalShippingType,
      shipping_cost: finalShippingCost
    };
    dbInstance.getProducts().push(newProduct);
    emitProductCreatedEvent(newProduct.id);
    dbInstance.getWalletTransactions().push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId: seller.id,
      type: "debit",
      amount: 0,
      points: requiredPoints,
      description: `\u0646\u0634\u0631 \u0645\u0646\u062A\u062C: ${title} (${isFeatured ? "\u0645\u0645\u064A\u0632" : "\u0639\u0627\u062F\u064A"}) - \u062F\u062E\u0644 \u062E\u0637 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0648\u0627\u0644\u064A\u062F\u0648\u064A`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "completed"
    });
    dbInstance.persist();
    res.json({ success: true, product: newProduct, currentPoints: seller.points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/orders/create", (req, res) => {
  try {
    const { productId, buyerId, buyerName, buyerPhone, shippingAddress, quantity, couponCode } = req.body;
    if (!productId || !buyerId || !buyerName || !buyerPhone || !shippingAddress || !quantity) {
      return res.status(400).json({ error: "\u0645\u0646 \u0641\u0636\u0644\u0643 \u0623\u0643\u0645\u0644 \u062C\u0645\u064A\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629." });
    }
    const user = dbInstance.getUsers().find((u) => u.id === buyerId);
    if (!user) {
      return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0633\u0627\u0628 \u0635\u062D\u064A\u062D \u0644\u062A\u0642\u062F\u064A\u0645 \u0637\u0644\u0628 \u0627\u0644\u0634\u0631\u0627\u0621." });
    }
    const nameErr = validateFullName(buyerName);
    if (nameErr) return res.status(400).json({ error: nameErr });
    const phoneErr = validatePhoneNumber(buyerPhone);
    if (phoneErr) return res.status(400).json({ error: phoneErr });
    const addressErr = validateAddress(shippingAddress);
    if (addressErr) return res.status(400).json({ error: addressErr });
    const product = dbInstance.getProducts().find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u062D\u0627\u0644\u064A\u0627\u064B." });
    }
    const qty = Number(quantity);
    const minQtyAllowed = Math.max(10, product.moq || 0);
    if (isNaN(qty) || qty < minQtyAllowed) {
      return res.status(400).json({ error: `\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u062F\u062E\u0644\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629\u060C \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0637\u0644\u0628 \u0647\u0648 ${minQtyAllowed} \u0642\u0637\u0639.` });
    }
    const unitPrice = product.unitPrice || product.priceMax || 0;
    const shippingType = product.shipping_type || "free";
    const shippingCost = shippingType === "paid" ? product.shipping_cost || 0 : 0;
    const totalProductPrice = unitPrice * qty;
    let discountApplied = 0;
    let appliedCouponObj = null;
    if (couponCode) {
      const codeClean = String(couponCode).trim().toUpperCase();
      const coupons = dbInstance.getCoupons();
      const coupon = coupons.find((c) => c.code.toUpperCase() === codeClean);
      if (!coupon) {
        return res.status(400).json({ error: "\u0631\u0645\u0632 \u0643\u0648\u0628\u0648\u0646 \u0627\u0644\u062E\u0635\u0645 \u0627\u0644\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0628\u0645\u0631\u0648\u062D\u0629 \u0627\u0644\u0645\u0646\u0635\u0629." });
      }
      if (coupon.status !== "active") {
        return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u0647\u0630\u0627 \u0645\u0639\u0637\u0644 \u0623\u0648 \u062A\u0645 \u0625\u064A\u0642\u0627\u0641\u0647." });
      }
      if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
        return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0646\u062A\u0647\u062A \u0645\u062F\u0629 \u0635\u0644\u0627\u062D\u064A\u0629 \u0631\u0645\u0632 \u0627\u0644\u062E\u0635\u0645 \u0647\u0630\u0627." });
      }
      if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
        return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0646\u062A\u0647\u0649 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u0628\u0648\u0646." });
      }
      if (coupon.minPurchase && totalProductPrice < coupon.minPurchase) {
        return res.status(400).json({ error: `\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u0623\u0646 \u062A\u0628\u062F\u0623 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629 \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0646 ${coupon.minPurchase} MAD \u0644\u062A\u0637\u0628\u064A\u0642 \u0647\u0630\u0627 \u0627\u0644\u062E\u0635\u0645.` });
      }
      if (coupon.type === "percentage") {
        discountApplied = totalProductPrice * (coupon.value / 100);
        if (coupon.maxDiscount && discountApplied > coupon.maxDiscount) {
          discountApplied = coupon.maxDiscount;
        }
      } else if (coupon.type === "fixed") {
        discountApplied = coupon.value;
      }
      discountApplied = Math.min(discountApplied, totalProductPrice);
      coupon.usageCount = (coupon.usageCount || 0) + 1;
      appliedCouponObj = coupon;
    }
    const totalPrice = Math.max(0, totalProductPrice - discountApplied + shippingCost);
    const newOrder = {
      id: "ord-" + Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || "",
      sellerId: product.sellerId,
      buyerId,
      buyerName,
      buyerPhone,
      shippingAddress,
      quantity: qty,
      unitPrice,
      shippingType,
      shippingCost,
      totalPrice,
      couponCode: appliedCouponObj ? appliedCouponObj.code : void 0,
      discountApplied: discountApplied > 0 ? discountApplied : void 0,
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getOrders().push(newOrder);
    const rooms = dbInstance.getChatRooms();
    let room = rooms.find((r) => r.buyerId === buyerId && r.sellerId === product.sellerId);
    if (!room) {
      const users = dbInstance.getUsers();
      const buyer = users.find((u) => u.id === buyerId);
      const seller = users.find((u) => u.id === product.sellerId);
      room = {
        id: "room-" + Math.random().toString(35).substr(2, 9),
        buyerId,
        sellerId: product.sellerId,
        buyerName: buyer?.name || buyerName,
        sellerName: seller?.companyName || seller?.name || "\u0645\u0648\u0631\u062F \u0627\u0644\u062C\u0645\u0644\u0629",
        buyerLogo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        sellerLogo: seller?.companyLogo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
        lastMessage: "",
        lastMessageTime: (/* @__PURE__ */ new Date()).toISOString(),
        unreadCountBuyer: 0,
        unreadCountSeller: 0
      };
      rooms.push(room);
    }
    const notificationText = `\u{1F6D2} [\u0637\u0644\u0628 \u0634\u0631\u0627\u0621 \u062C\u062F\u064A\u062F \u0645\u0631\u062C\u0639 \u0631\u0642\u0645 ${newOrder.id}]: \u0644\u0642\u062F \u0642\u0627\u0645 \u0627\u0644\u0645\u0634\u062A\u0631\u064A \u0628\u062A\u0642\u062F\u064A\u0645 \u0637\u0644\u0628 \u0634\u0631\u0627\u0621 \u0644\u0644\u0645\u0646\u062A\u062C "${newOrder.productTitle}" \u0628\u0643\u0645\u064A\u0629 ${qty} \u0642\u0637\u0639\u0629. \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629: ${totalPrice.toLocaleString()} MAD.${discountApplied > 0 ? ` (\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645: ${appliedCouponObj.code} \u0648\u062E\u0641\u0636 ${discountApplied.toLocaleString()} MAD)` : ""} \u064A\u0631\u062C\u0649 \u0645\u0646 \u0627\u0644\u0645\u0648\u0631\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0644\u0628 \u0648\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0644\u0628\u062F\u0621 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644.`;
    const automaticMsg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      roomId: room.id,
      senderId: buyerId,
      text: notificationText,
      imageUrl: "",
      status: "sent",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);
    room.lastMessage = notificationText;
    room.lastMessageTime = automaticMsg.createdAt;
    room.unreadCountSeller += 1;
    dbInstance.persist();
    res.json({ success: true, order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/orders", (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "\u0645\u0637\u0644\u0648\u0628 \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645." });
    }
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0631\u0624\u064A\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A." });
    }
    if (sessionUser.role !== "superadmin" && sessionUser.role !== "admin" && sessionUser.userId !== String(userId)) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u062E\u062F\u0645 \u0622\u062E\u0631 (\u062D\u0645\u0627\u064A\u0629 IDOR)." });
    }
    const allOrders = dbInstance.getOrders();
    const filteredOrders = allOrders.filter((o) => o.buyerId === userId || o.sellerId === userId);
    res.json({ success: true, orders: filteredOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/orders/:orderId/approve", authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: "\u0645\u0637\u0644\u0648\u0628 \u062A\u062D\u062F\u064A\u062F \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0627\u0644\u062F\u0631\u062F\u0634\u0629." });
    }
    const order = dbInstance.getOrders().find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." });
    }
    if (order.sellerId !== userId) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628." });
    }
    order.status = "approved";
    const msgText = `\u{1F4E2} [\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId}]: \u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628\u0643\u0645 \u0644\u0644\u0645\u0646\u062A\u062C "${order.productTitle}" \u0648\u0647\u0648 \u0627\u0644\u0622\u0646 \u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0644\u062A\u062D\u0636\u064A\u0631 \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u0644\u0644\u0634\u062D\u0646.`;
    const automaticMsg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: "",
      status: "sent",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);
    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex((r) => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      rooms[rIdx].unreadCountBuyer += 1;
    }
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0644\u0628",
      details: `\u0642\u0627\u0645 \u0627\u0644\u062A\u0627\u062C\u0631 \u0630\u0648 \u0627\u0644\u0645\u0639\u0631\u0641 ${userId} \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId} \u0644\u0644\u0645\u0646\u062A\u062C "${order.productTitle}" \u0648\u0628\u062F\u0621 \u062A\u062D\u0636\u064A\u0631\u0647 \u0644\u0644\u0634\u062D\u0646 \u0644\u0644\u0645\u0634\u062A\u0631\u064A \u0630\u0648 \u0627\u0644\u0645\u0639\u0631\u0641 ${order.buyerId}.`,
      adminId: userId,
      adminName: order.buyerName,
      adminEmail: "seller@sou9aljoumla.com",
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/orders/:orderId/ship", authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: "\u0645\u0637\u0644\u0648\u0628 \u062A\u062D\u062F\u064A\u062F \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0627\u0644\u062F\u0631\u062F\u0634\u0629." });
    }
    const order = dbInstance.getOrders().find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." });
    }
    if (order.sellerId !== userId) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0634\u062D\u0646 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628." });
    }
    order.status = "shipped";
    const msgText = `\u{1F69A} [\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0634\u062D\u0646 \u0631\u0642\u0645 ${orderId}]: \u0644\u0642\u062F \u062A\u0645 \u0634\u062D\u0646 \u0637\u0644\u0628\u0643\u0645 \u0628\u0646\u062C\u0627\u062D! \u0627\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0622\u0646 \u0641\u064A \u0637\u0631\u064A\u0642\u0647\u0627 \u0625\u0644\u064A\u0643\u0645 \u0648\u062A\u0633\u062A\u063A\u0631\u0642 \u0639\u0627\u062F\u0629 \u0645\u0646 \u06F2\u0664 \u0625\u0644\u0649 \u0664\u0668 \u0633\u0627\u0639\u0629 \u0644\u0644\u062A\u0633\u0644\u064A\u0645. \u0634\u0643\u0631\u0627\u064B \u0644\u062B\u0642\u062A\u0643\u0645.`;
    const automaticMsg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: "",
      status: "sent",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);
    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex((r) => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      rooms[rIdx].unreadCountBuyer += 1;
    }
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u0634\u062D\u0646 \u0627\u0644\u0637\u0644\u0628 \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A",
      details: `\u0642\u0627\u0645 \u0627\u0644\u062A\u0627\u062C\u0631 \u0630\u0648 \u0627\u0644\u0645\u0639\u0631\u0641 ${userId} \u0628\u062A\u0623\u0643\u064A\u062F \u0634\u062D\u0646 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId} \u0628\u0646\u062C\u0627\u062D\u060C \u0648\u062A\u063A\u064A\u064A\u0631 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0625\u0644\u0649 "\u0645\u0634\u062D\u0648\u0646" \u0644\u0635\u0627\u0644\u0650\u062D \u0627\u0644\u0645\u0634\u062A\u0631\u0650\u064A ${order.buyerName}.`,
      adminId: userId,
      adminName: order.buyerName,
      adminEmail: "seller@sou9aljoumla.com",
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/orders/:orderId/complete", authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: "\u0645\u0637\u0644\u0648\u0628 \u062A\u062D\u062F\u064A\u062F \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0627\u0644\u062F\u0631\u062F\u0634\u0629." });
    }
    const order = dbInstance.getOrders().find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." });
    }
    if (order.sellerId !== userId) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u063A\u064A\u064A\u0631 \u062D\u0627\u0644\u0629 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628." });
    }
    order.status = "completed";
    try {
      const seller = dbInstance.getUsers().find((u) => u.id === order.sellerId);
      if (seller) {
        seller.sales_count = (seller.sales_count || 0) + 1;
        const stats = dbInstance.getProfileStats();
        let stat = stats.find((ps) => ps.user_id === order.sellerId);
        if (!stat) {
          stat = {
            user_id: order.sellerId,
            views_count: 0,
            sales_count: seller.sales_count,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          stats.push(stat);
        } else {
          stat.sales_count = seller.sales_count;
          stat.updated_at = (/* @__PURE__ */ new Date()).toISOString();
        }
      }
    } catch (salesCountErr) {
      console.error("Error incrementing seller verified sales count:", salesCountErr);
    }
    try {
      const seller = dbInstance.getUsers().find((u) => u.id === order.sellerId);
      if (seller && seller.role === "seller") {
        seller.badges = seller.badges || [];
        if (seller.badges.includes("New Seller")) {
          seller.badges = seller.badges.filter((b) => b !== "New Seller");
          if (!seller.badges.includes("Verified Seller")) {
            seller.badges.push("Verified Seller");
          }
          dbInstance.getAuditLogs().push({
            id: "log-" + Math.random().toString(36).substr(2, 9),
            action: "\u062A\u0631\u0642\u064A\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u0644\u0634\u0627\u0631\u0629 \u0627\u0644\u0628\u0627\u0626\u0639",
            details: `\u062A\u0645\u062A \u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0628\u0627\u0626\u0639 ${seller.name} \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0645\u0646 \u0634\u0627\u0631\u0629 "\u0628\u0627\u0626\u0639 \u062C\u062F\u064A\u062F" \u0625\u0644\u0649 \u0634\u0627\u0631\u0629 "\u0645\u0648\u0631\u062F \u0645\u0648\u062B\u0648\u0642" \u0628\u0639\u062F \u0625\u062A\u0645\u0627\u0645 \u0623\u0648\u0644 \u0639\u0645\u0644\u064A\u0629 \u062A\u0633\u0644\u064A\u0645 \u0646\u0627\u062C\u062D\u0629 \u0644\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId}.`,
            adminId: seller.id,
            adminName: seller.name,
            adminEmail: "system@sou9aljoumla.com",
            ip: req.ip || "127.0.0.1",
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
    } catch (badgeErr) {
      console.error("Error upgrading seller badge:", badgeErr);
    }
    const msgText = `\u2705 [\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId}]: \u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0628\u0644\u063A \u0628\u0646\u062C\u0627\u062D! \u062A\u0645 \u0648\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 "\u0645\u0643\u062A\u0645\u0644 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0628\u0646\u062C\u0627\u062D" \u0639\u0644\u0649 \u0645\u0639\u0627\u0645\u0644\u062A\u0643\u0645. \u0634\u0643\u0631\u0627\u064B \u062C\u0632\u064A\u0644\u0627\u064B \u0644\u062A\u0639\u0627\u0645\u0644\u0643\u0645 \u0645\u0639\u0646\u0627.`;
    const automaticMsg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: "",
      status: "sent",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);
    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex((r) => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      rooms[rIdx].unreadCountBuyer += 1;
    }
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0637\u0644\u0628 \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
      details: `\u0642\u0627\u0645 \u0627\u0644\u062A\u0627\u062C\u0631 \u0630\u0648 \u0627\u0644\u0645\u0639\u0631\u0641 ${userId} \u0628\u062A\u0623\u0643\u064A\u062F \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId} \u0628\u0646\u062C\u0627\u062D \u0644\u0644\u0632\u0628\u0648\u0646 \u0648\u0627\u0633\u062A\u0644\u0627\u0645 \u062B\u0645\u0646 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0643\u0627\u0645\u0644\u0629 \u0648\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0637\u0644\u0628 \u0643\u0640 "\u0645\u0643\u062A\u0645\u0644".`,
      adminId: userId,
      adminName: order.buyerName,
      adminEmail: "seller@sou9aljoumla.com",
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/orders/:orderId/cancel", authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: "\u0645\u0637\u0644\u0648\u0628 \u062A\u062D\u062F\u064A\u062F \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0627\u0644\u062F\u0631\u062F\u0634\u0629." });
    }
    const order = dbInstance.getOrders().find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." });
    }
    if (order.sellerId !== userId && order.buyerId !== userId) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0625\u0644\u063A\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628." });
    }
    if (order.status === "completed") {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0644\u063A\u0627\u0621 \u0637\u0644\u0628 \u062A\u0645 \u062A\u0633\u0644\u064A\u0645\u0647 \u0648\u0627\u0633\u062A\u0644\u0627\u0645 \u0645\u0628\u0644\u063A\u0647 \u0628\u0627\u0644\u0641\u0639\u0644." });
    }
    order.status = "cancelled";
    const isSeller = order.sellerId === userId;
    const msgText = isSeller ? `\u274C [\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId}]: \u0646\u0639\u062A\u0630\u0631 \u0645\u0646\u0643\u060C \u0644\u0642\u062F \u0642\u0627\u0645 \u0627\u0644\u0645\u0648\u0631\u062F \u0628\u0631\u0641\u0636/\u0625\u0644\u063A\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.` : `\u274C [\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId}]: \u0646\u0639\u062A\u0630\u0631\u060C \u0644\u0642\u062F \u0642\u0627\u0645 \u0627\u0644\u0645\u0634\u062A\u0631\u064A \u0628\u0625\u0644\u063A\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.`;
    const automaticMsg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: "",
      status: "sent",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);
    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex((r) => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      if (isSeller) {
        rooms[rIdx].unreadCountBuyer += 1;
      } else {
        rooms[rIdx].unreadCountSeller += 1;
      }
    }
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u0625\u0644\u063A\u0627\u0621/\u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628",
      details: `\u0642\u0627\u0645 ${isSeller ? "\u0627\u0644\u0645\u0648\u0631\u062F" : "\u0627\u0644\u0645\u0634\u062A\u0631\u064A"} \u0630\u0648 \u0627\u0644\u0645\u0639\u0631\u0641 ${userId} \u0628\u0625\u0644\u063A\u0627\u0621/\u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId} \u0644\u0644\u0645\u0646\u062A\u062C "${order.productTitle}".`,
      adminId: userId,
      adminName: isSeller ? "\u0627\u0644\u0645\u0648\u0631\u062F" : order.buyerName,
      adminEmail: isSeller ? "seller@sou9aljoumla.com" : "buyer@sou9aljoumla.com",
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/orders/:orderId/no-contact", authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: "\u0645\u0637\u0644\u0648\u0628 \u062A\u062D\u062F\u064A\u062F \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0627\u0644\u062F\u0631\u062F\u0634\u0629." });
    }
    const order = dbInstance.getOrders().find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." });
    }
    if (order.sellerId !== userId && order.buyerId !== userId) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0627\u062A\u062E\u0627\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628." });
    }
    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0644\u0637\u0644\u0628 \u0645\u063A\u0644\u0642 \u0628\u0627\u0644\u0641\u0639\u0644 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u062A\u0647 \u0644\u0639\u062F\u0645 \u0627\u0644\u0631\u062F." });
    }
    order.status = "cancelled";
    order.noContact = true;
    const isSeller = order.sellerId === userId;
    const msgText = `\u26A0\uFE0F [\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId}]: \u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0648\u062A\u0633\u062C\u064A\u0644 \u062D\u0627\u0644\u0629 "\u0639\u062F\u0645 \u0627\u0644\u0631\u062F \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u0644" \u0646\u0638\u0631\u0627\u064B \u0644\u0639\u062F\u0645 \u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0622\u062E\u0631 \u0644\u0644\u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A.`;
    const automaticMsg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: "",
      status: "sent",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);
    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex((r) => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      if (isSeller) {
        rooms[rIdx].unreadCountBuyer += 1;
      } else {
        rooms[rIdx].unreadCountSeller += 1;
      }
    }
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u062A\u0633\u062C\u064A\u0644 \u062D\u0627\u0644\u0629 \u0639\u062F\u0645 \u0631\u062F \u0648\u062A\u0648\u0627\u0635\u0644 \u0644\u0644\u0637\u0644\u0628",
      details: `\u0642\u0627\u0645 \u0627\u0644\u0637\u0631\u0641 \u0630\u0648 \u0627\u0644\u0645\u0639\u0631\u0641 ${userId} \u0628\u062A\u0633\u062C\u064A\u0644 "\u0639\u062F\u0645 \u0627\u0644\u0631\u062F" \u0648\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${orderId} \u0646\u0638\u0631\u0627\u064B \u0644\u0627\u0646\u0642\u0637\u0627\u0639 \u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0645\u0642\u0627\u0628\u0644.`,
      adminId: userId,
      adminName: isSeller ? "\u0627\u0644\u0645\u0648\u0631\u062F" : order.buyerName,
      adminEmail: isSeller ? "seller@sou9aljoumla.com" : "buyer@sou9aljoumla.com",
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/orders/:orderId/report", authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId, reason, details } = req.body;
    if (!userId || !roomId || !reason) {
      return res.status(400).json({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0644\u0627\u063A \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629." });
    }
    const order = dbInstance.getOrders().find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "\u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0645\u062D\u062F\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." });
    }
    const reporter = dbInstance.getUsers().find((u) => u.id === userId);
    if (!reporter) {
      return res.status(404).json({ error: "\u0631\u0642\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D." });
    }
    const sellerObj = dbInstance.getUsers().find((u) => u.id === order.sellerId);
    const buyerObj = dbInstance.getUsers().find((u) => u.id === order.buyerId);
    const newReport = {
      id: "rep-" + Math.random().toString(36).substr(2, 9),
      reporterId: userId,
      reporterName: reporter.name || "\u0639\u0636\u0648 \u0645\u0646 \u0627\u0644\u0645\u0646\u0635\u0629",
      targetType: userId === order.sellerId ? "buyer" : "seller",
      targetId: userId === order.sellerId ? order.buyerId : order.sellerId,
      reason,
      details: details || `\u0628\u0644\u0627\u063A \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u0637\u0644\u0628 ${orderId} - \u0633\u0628\u0628: ${reason}`,
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getReports().push(newReport);
    const roomMessages = dbInstance.getMessages().filter((m) => m.roomId === roomId);
    const sortedMsgs = roomMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const chatLog = sortedMsgs.map((m) => {
      const senderName = m.senderId === order.sellerId ? sellerObj?.companyName || sellerObj?.name || "\u0627\u0644\u0628\u0627\u0626\u0639" : buyerObj?.name || "\u0627\u0644\u0645\u0634\u062A\u0631\u064A";
      return `[${m.createdAt}] ${senderName}: ${m.text}`;
    }).join("\n");
    const emailBody = `
========================================
\u{1F6A8} \u0628\u0644\u0627\u063A \u0625\u062F\u0627\u0631\u064A \u0648\u0634\u0643\u0648\u0649 \u0631\u0633\u0645\u064A\u0629 \u0628\u062E\u0635\u0648\u0635 \u0645\u0639\u0627\u0645\u0644\u0629 \u062A\u062C\u0627\u0631\u064A\u0629
========================================
\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0627\u0644\u0628\u0644\u0627\u063A: ${(/* @__PURE__ */ new Date()).toLocaleString("ar-MA")}

[\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0644\u0628]
--------------
\u0645\u0631\u062C\u0639 \u0627\u0644\u0637\u0644\u0628: ${orderId}
\u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0645\u0637\u0644\u0648\u0628: ${order.productTitle}
\u0627\u0644\u0643\u0645\u064A\u0629: ${order.quantity} \u062D\u0628\u0629
\u0633\u0639\u0631 \u0627\u0644\u0648\u062D\u062F\u0629: ${order.unitPrice} MAD
\u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u0648\u0635\u064A\u0644: ${order.shippingCost} MAD
\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: ${order.totalPrice} MAD
\u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: ${order.status}
\u062A\u0627\u0631\u064A\u062E \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0637\u0644\u0628: ${order.createdAt}

[\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0627\u0626\u0639 / \u0627\u0644\u062A\u0627\u062C\u0631]
-------------------------
\u0627\u0644\u0627\u0633\u0645: ${sellerObj?.name || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}
\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629: ${sellerObj?.companyName || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}
\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${sellerObj?.email || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}
\u0627\u0644\u0647\u0627\u062A\u0641: ${sellerObj?.phone || order.buyerPhone}
\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0645\u062F\u064A\u0646\u0629: ${sellerObj?.city || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}

[\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0634\u062A\u0631\u064A]
------------------
\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644: ${buyerObj?.name || order.buyerName}
\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${buyerObj?.email || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}
\u0627\u0644\u0647\u0627\u062A\u0641: ${buyerObj?.phone || order.buyerPhone}
\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u062D\u062F\u062F: ${order.shippingAddress}

[\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0628\u0644\u0627\u063A]
----------------
\u0645\u0642\u062F\u0651\u0645 \u0627\u0644\u0628\u0644\u0627\u063A: ${reporter.name} (${reporter.role === "seller" ? "\u062A\u0627\u062C\u0631" : "\u0645\u0634\u062A\u0631\u064A"})
\u0633\u0628\u0628 \u0627\u0644\u0634\u0643\u0648\u0649: ${reason}
\u0627\u0644\u0634\u0631\u062D: ${details || "\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0641\u0627\u0635\u064A\u0644 \u0625\u0636\u0627\u0641\u064A\u0629 \u0645\u0636\u0627\u0641\u0629 \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0628\u0644\u063A."}

[\u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0646\u0635\u064A\u0629 \u0644\u0644\u0645\u062D\u0627\u062F\u062B\u0629]
---------------------------------------
${chatLog || "\u0644\u0627 \u062A\u062A\u0648\u0641\u0631 \u0631\u0633\u0627\u0626\u0644 \u0645\u0633\u062C\u0644\u0629 \u0628\u064A\u0646 \u0627\u0644\u0637\u0631\u0641\u064A\u0646 \u062D\u062A\u0649 \u0627\u0644\u0622\u0646."}
========================================
`;
    console.log(`[SIMULATED EMAIL SERVICE] Sending Complaint Email to admin@sou9aljoumla.com...`);
    console.log(emailBody);
    let isSuspendedAction = false;
    if (userId === order.sellerId) {
      reporter.status = "suspended";
      isSuspendedAction = true;
    }
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u0628\u0644\u0627\u063A \u0648\u0634\u0643\u0648\u0649 \u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0625\u064A\u0642\u0627\u0641 \u0645\u0624\u0642\u062A",
      details: `\u0642\u0627\u0645 \u0627\u0644\u0639\u0636\u0648 ${reporter.name} \u0628\u062A\u0642\u062F\u064A\u0645 \u0628\u0644\u0627\u063A \u0631\u0633\u0645\u064A \u0636\u062F \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0622\u062E\u0631 \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u0637\u0644\u0628 ${orderId} \u0644\u0633\u0628\u0628: "${reason}". ${isSuspendedAction ? "\u062A\u0645 \u062A\u0642\u064A\u064A\u062F \u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0627\u062C\u0631 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0642\u0636\u064A\u0629." : ""}`,
      adminId: userId,
      adminName: reporter.name,
      adminEmail: reporter.email || "user@sou9aljoumla.com",
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({
      success: true,
      reportId: newReport.id,
      suspended: isSuspendedAction,
      message: isSuspendedAction ? "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0628\u0644\u0627\u063A \u0628\u0646\u062C\u0627\u062D \u0648\u0625\u0631\u0633\u0627\u0644\u0647 \u0644\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0625\u062F\u0627\u0631\u0629\u060C \u0648\u062A\u0645 \u062A\u0642\u064A\u064A\u062F \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0644\u0633\u0644\u0627\u0645\u0629." : "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0628\u0644\u0627\u063A \u0648\u0625\u0639\u0644\u0627\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644."
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/products/:id/comments", generalApiLimiter, (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, userAvatar, text } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0646\u0635 \u0627\u0644\u062A\u0639\u0644\u064A\u0642 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0633\u0627\u0628 \u0635\u062D\u064A\u062D \u0644\u0643\u062A\u0627\u0628\u0629 \u062A\u0639\u0644\u064A\u0642\u0627\u062A." });
    }
    const newComment = {
      id: "cm-" + Math.random().toString(36).substr(2, 9),
      productId: id,
      userId,
      userName: userName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u062C\u0644",
      userAvatar: userAvatar || "",
      text: sanitizeHTML(text),
      replies: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getComments().push(newComment);
    dbInstance.save();
    res.json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/products/:id/reviews", (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, title, comment, media, question } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "\u064A\u062C\u0628 \u0639\u0644\u064A\u0643 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B \u0644\u0625\u0631\u0633\u0627\u0644 \u0645\u0631\u0627\u062C\u0639\u0629" });
    }
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u062A\u062D\u062F\u064A\u062F \u062A\u0642\u064A\u064A\u0645 \u0635\u0627\u0644\u062D \u0628\u064A\u0646 1 \u0648 5 \u0646\u062C\u0648\u0645" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    if (!user.isVerified && user.verificationStatus !== "verified") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0641\u0642\u0637 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0627\u0644\u0645\u0648\u062B\u0642\u064A\u0646 \u0644\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A (Verified) \u064A\u0645\u0643\u0646\u0647\u0645 \u0643\u062A\u0627\u0628\u0629 \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0644\u0645\u0646\u0639 \u0627\u0644\u062A\u0642\u0627\u064A\u064A\u0645 \u0627\u0644\u0645\u0632\u064A\u0641\u0629" });
    }
    const existingReview = dbInstance.getReviews().find((r) => r.productId === id && r.userId === userId);
    if (existingReview) {
      return res.status(400).json({ error: "\u0644\u0642\u062F \u0642\u0645\u062A \u0628\u0625\u0636\u0627\u0641\u0629 \u062A\u0642\u064A\u064A\u0645 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u0628\u0627\u0644\u0641\u0639\u0644. \u064A\u064F\u0633\u0645\u062D \u0628\u062A\u0642\u064A\u064A\u0645 \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u0644\u0643\u0644 \u0645\u0646\u062A\u062C." });
    }
    const newReviewId = "rev-" + Math.random().toString(36).substr(2, 9);
    const newReview = {
      id: newReviewId,
      productId: id,
      product_id: id,
      userId,
      user_id: userId,
      userName: user.name,
      userAvatar: user.profile_image || "",
      rating: Number(rating),
      title: sanitizeHTML(title || ""),
      comment: sanitizeHTML(comment || ""),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getReviews().push(newReview);
    const storedMedia = [];
    if (Array.isArray(media)) {
      media.forEach((item) => {
        const newMedia = {
          id: "rm-" + Math.random().toString(36).substr(2, 9),
          review_id: newReviewId,
          file_url: item.file_url,
          file_type: item.file_type
          // 'image' or 'video'
        };
        dbInstance.getReviewMedia().push(newMedia);
        storedMedia.push(newMedia);
      });
    }
    newReview.media = storedMedia;
    let createdQuestion = null;
    if (question && String(question).trim() !== "") {
      createdQuestion = {
        id: "q-" + Math.random().toString(36).substr(2, 9),
        product_id: id,
        user_id: userId,
        userName: user.name,
        userAvatar: user.profile_image || "",
        question: sanitizeHTML(String(question).trim()),
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      dbInstance.getReviewQuestions().push(createdQuestion);
    }
    const allReviewsForProduct = dbInstance.getReviews().filter((r) => r.productId === id);
    const totalStars = allReviewsForProduct.reduce((sum, item) => sum + item.rating, 0);
    const avgRating = totalStars / allReviewsForProduct.length;
    const products = dbInstance.getProducts();
    const product = products.find((p) => p.id === id);
    if (product) {
      const rounded = Number(avgRating.toFixed(1));
      product.sellerRating = rounded;
    }
    dbInstance.persist();
    res.json({
      success: true,
      review: newReview,
      question: createdQuestion,
      averageRating: avgRating
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
function validateBufferSignature(buffer, mimeType) {
  if (buffer.length < 4) return false;
  const hex = buffer.toString("hex", 0, 4).toUpperCase();
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return hex.startsWith("FFD8");
  }
  if (mimeType === "image/png") {
    return hex === "89504E47";
  }
  if (mimeType === "image/webp") {
    return buffer.toString("utf8", 0, 4) === "RIFF" && buffer.toString("utf8", 8, 12) === "WEBP";
  }
  if (mimeType === "application/pdf") {
    return hex === "25504446";
  }
  if (mimeType === "video/mp4") {
    return buffer.toString("utf8", 4, 12).includes("ftyp");
  }
  const textContent = buffer.toString("utf8").toLowerCase();
  const dangerousPatterns = ["<?php", "<script", "<?", "<html", "javascript:", "xml", "onload=", "onerror=", "<svg", "xmlns"];
  const containsHackingPattern = dangerousPatterns.some((pat) => textContent.includes(pat));
  if (containsHackingPattern) {
    return false;
  }
  return true;
}
app.post("/api/upload-media", generalApiLimiter, (req, res) => {
  try {
    const { fileBase64, fileName, fileType } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u062A\u0648\u0641\u064A\u0631 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0645\u0631\u0641\u0648\u0639" });
    }
    if (fileName && fileName.toLowerCase().endsWith(".svg")) {
      return res.status(400).json({ error: "\u0645\u0644\u0641\u0627\u062A SVG \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0631\u0641\u0639\u0647\u0627 \u0644\u0623\u0633\u0628\u0627\u0628 \u0623\u0645\u0646\u064A\u0629." });
    }
    const matches = fileBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    let mimeType = fileType || "";
    let base64Data = fileBase64;
    if (matches && matches.length > 1) {
      mimeType = matches[1];
      base64Data = fileBase64.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, "");
    }
    if (mimeType && mimeType.includes("svg")) {
      return res.status(400).json({ error: "\u0645\u0644\u0641\u0627\u062A SVG \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0631\u0641\u0639\u0647\u0627 \u0644\u0623\u0633\u0628\u0627\u0628 \u0623\u0645\u0646\u064A\u0629." });
    }
    const buffer = Buffer.from(base64Data, "base64");
    const actualSize = buffer.length;
    const allowedImageMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedVideoMimes = ["video/mp4", "video/webm", "video/quicktime", "video/mov"];
    const isImage = allowedImageMimes.includes(mimeType);
    const isVideo = allowedVideoMimes.includes(mimeType);
    if (!isImage && !isVideo) {
      return res.status(400).json({ error: "\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645. \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0635\u0648\u0631 (JPG, JPEG, PNG, WEBP) \u0648\u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A (MP4, WEBM, MOV) \u0641\u0642\u0637." });
    }
    if (!validateBufferSignature(buffer, mimeType)) {
      securityLogger.warn({ event: "MALICIOUS_FILE_UPLOAD_BLOCKED_SIGNATURE", filename: fileName, mimeType, ip: req.ip });
      return res.status(400).json({ error: "\u062A\u0646\u0628\u064A\u0647 \u0623\u0645\u0646\u064A: \u0647\u064A\u062F\u0631 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0644\u0627 \u064A\u0637\u0627\u0628\u0642 \u0646\u0648\u0639 \u0627\u0644\u0627\u0645\u062A\u062F\u0627\u062F \u0627\u0644\u0645\u0635\u0631\u062D \u0628\u0647. \u062A\u0645 \u062D\u0638\u0631 \u0645\u062D\u0627\u0648\u0644\u0629 \u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641." });
    }
    const maxFileSize = 5 * 1024 * 1024;
    if (actualSize > maxFileSize) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062A\u0639\u062F\u0649 \u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 (5 \u0645\u064A\u063A\u0627\u0628\u0627\u064A\u062A)." });
    }
    let extension = "png";
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") extension = "jpg";
    else if (mimeType === "image/webp") extension = "webp";
    else if (mimeType === "video/mp4") extension = "mp4";
    else if (mimeType === "video/webm") extension = "webm";
    else if (mimeType === "video/quicktime" || mimeType === "video/mov") extension = "mov";
    const cleanFilename = `review-media-${import_crypto2.default.randomUUID()}.${extension}`;
    const targetPath = import_path3.default.join(process.cwd(), "data", "uploads", cleanFilename);
    import_fs3.default.writeFileSync(targetPath, buffer);
    res.json({
      success: true,
      file_url: `/uploads/${cleanFilename}`,
      file_type: isImage ? "image" : "video"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/upload-booking-document", generalApiLimiter, (req, res) => {
  try {
    const { fileBase64, fileName, fileType } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u062A\u0648\u0641\u064A\u0631 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0645\u0631\u0641\u0648\u0639" });
    }
    if (fileName && fileName.toLowerCase().endsWith(".svg")) {
      return res.status(400).json({ error: "\u0645\u0644\u0641\u0627\u062A SVG \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0631\u0641\u0639\u0647\u0627 \u0644\u0623\u0633\u0628\u0627\u0628 \u0623\u0645\u0646\u064A\u0629." });
    }
    const matches = fileBase64.match(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-.+]+);base64,/);
    let mimeType = fileType || "";
    let base64Data = fileBase64;
    if (matches && matches.length > 1) {
      mimeType = matches[1];
      base64Data = fileBase64.replace(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-.+]+);base64,/, "");
    }
    if (mimeType && mimeType.includes("svg")) {
      return res.status(400).json({ error: "\u0645\u0644\u0641\u0627\u062A SVG \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0631\u0641\u0639\u0647\u0627 \u0644\u0623\u0633\u0628\u0627\u0628 \u0623\u0645\u0646\u064A\u0629." });
    }
    const buffer = Buffer.from(base64Data, "base64");
    const actualSize = buffer.length;
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedMimes.includes(mimeType)) {
      return res.status(400).json({ error: "\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645. \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0635\u0648\u0631 (JPG, JPEG, PNG, WEBP) \u0648\u0645\u0644\u0641\u0627\u062A PDF \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A Word (DOC, DOCX) \u0641\u0642\u0637." });
    }
    if (!validateBufferSignature(buffer, mimeType)) {
      securityLogger.warn({ event: "MALICIOUS_DOCUMENT_UPLOAD_BLOCKED_SIGNATURE", filename: fileName, mimeType, ip: req.ip });
      return res.status(400).json({ error: "\u062A\u0646\u0628\u064A\u0647 \u0623\u0645\u0646\u064A: \u0647\u064A\u062F\u0631 \u0627\u0644\u0645\u0633\u062A\u0646\u062F \u0627\u0644\u0645\u062F\u062E\u0644 \u0644\u0627 \u064A\u0637\u0627\u0628\u0642 \u0646\u0648\u0639 \u0627\u0644\u0627\u0645\u062A\u062F\u0627\u062F \u0627\u0644\u0645\u0635\u0631\u062D \u0628\u0647. \u062A\u0645 \u062D\u0638\u0631 \u0645\u062D\u0627\u0648\u0644\u0629 \u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641." });
    }
    const maxSize = 5 * 1024 * 1024;
    if (actualSize > maxSize) {
      return res.status(400).json({ error: "\u064A\u062A\u0639\u062F\u0649 \u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 (5 \u0645\u064A\u063A\u0627\u0628\u0627\u064A\u062A)." });
    }
    let extension = "";
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      extension = "jpg";
    } else if (mimeType === "image/png") {
      extension = "png";
    } else if (mimeType === "image/webp") {
      extension = "webp";
    } else if (mimeType === "application/pdf") {
      extension = "pdf";
    } else if (mimeType === "application/msword") {
      extension = "doc";
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      extension = "docx";
    } else {
      return res.status(400).json({ error: "\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D." });
    }
    if (fileName) {
      const lowerName = fileName.toLowerCase();
      const blockedExtensions = [".exe", ".js", ".php", ".sh", ".html", ".htm", ".jsp", ".asp", ".aspx", ".py", ".pl", ".rb", ".cgi", ".bat", ".cmd", ".svg"];
      const hasBlocked = blockedExtensions.some((ext) => lowerName.endsWith(ext));
      if (hasBlocked) {
        return res.status(400).json({ error: "\u0646\u0648\u0639 \u063A\u064A\u0631 \u0635\u0627\u0644\u0650\u062D \u0623\u0648 \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A\u0629 \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0645\u062D\u0638\u0648\u0631\u0629 \u062A\u0645\u0627\u0645\u0627\u064B \u0644\u0623\u0633\u0628\u0627\u0628 \u0623\u0645\u0646\u064A\u0629." });
      }
    }
    const cleanFilename = `booking-doc-${import_crypto2.default.randomUUID()}.${extension}`;
    const targetPath = import_path3.default.join(process.cwd(), "data", "uploads", cleanFilename);
    import_fs3.default.writeFileSync(targetPath, buffer);
    res.json({
      success: true,
      file_url: `/uploads/${cleanFilename}`,
      file_name: fileName || cleanFilename,
      file_size: actualSize
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/questions/:questionId/answers", (req, res) => {
  try {
    const { questionId } = req.params;
    const { sellerId, answer, sellerName, sellerAvatar } = req.body;
    if (!sellerId || !answer) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u062A\u0648\u0641\u064A\u0631 \u0645\u0639\u0631\u0641 \u0627\u0644\u0628\u0627\u0626\u0639 \u0648\u0627\u0644\u062C\u0648\u0627\u0628" });
    }
    const questions = dbInstance.getReviewQuestions();
    const q = questions.find((item) => item.id === questionId);
    if (!q) {
      return res.status(404).json({ error: "\u0627\u0644\u0633\u0624\u0627\u0644 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
    }
    const products = dbInstance.getProducts();
    const product = products.find((p) => p.id === q.product_id);
    if (!product || product.sellerId !== sellerId) {
      return res.status(403).json({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u0627\u0644\u062C\u0648\u0627\u0628 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644\u060C \u0641\u0642\u0637 \u0635\u0627\u062D\u0628 \u0627\u0644\u0633\u0644\u0639\u0629 \u0645\u0646 \u064A\u0645\u0643\u0646\u0647 \u0627\u0644\u0631\u062F" });
    }
    const newAnswer = {
      id: "ans-" + Math.random().toString(36).substr(2, 9),
      question_id: questionId,
      seller_id: sellerId,
      sellerName: sellerName || product.sellerName || "\u0627\u0644\u0628\u0627\u0626\u0639",
      sellerAvatar: sellerAvatar || "",
      answer,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getReviewAnswers().push(newAnswer);
    dbInstance.persist();
    res.json({ success: true, answer: newAnswer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/products/:id/questions", (req, res) => {
  try {
    const { id } = req.params;
    const { userId, question, userName, userAvatar } = req.body;
    if (!userId || !question) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0633\u0624\u0627\u0644 \u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0628\u0627\u0626\u0639" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    const newQuestion = {
      id: "q-" + Math.random().toString(36).substr(2, 9),
      product_id: id,
      user_id: userId,
      userName: user ? user.name : userName || "\u0645\u0634\u062A\u0631\u064A",
      userAvatar: user ? user.profile_image || "" : userAvatar || "",
      question: sanitizeHTML(String(question).trim()),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getReviewQuestions().push(newQuestion);
    dbInstance.persist();
    res.json({ success: true, question: newQuestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/reviews/:reviewId/reply", (req, res) => {
  try {
    const { reviewId } = req.params;
    const { sellerId, text } = req.body;
    if (!sellerId || !text) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0643\u062A\u0627\u0628\u0629 \u062A\u0639\u0644\u064A\u0642 \u0627\u0644\u0631\u062F" });
    }
    const reviews = dbInstance.getReviews();
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) {
      return res.status(404).json({ error: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    const products = dbInstance.getProducts();
    const product = products.find((p) => p.id === review.productId);
    if (!product || product.sellerId !== sellerId) {
      return res.status(403).json({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u0627\u0644\u0631\u062F\u060C \u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u0646\u062A\u062C \u0641\u0642\u0637 \u0645\u0646 \u064A\u062D\u0642 \u0644\u0647 \u0627\u0644\u062A\u0639\u0644\u064A\u0642" });
    }
    review.sellerReply = {
      id: "rep-" + Math.random().toString(36).substr(2, 5),
      sellerId,
      text: sanitizeHTML(text),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.persist();
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/admin/reviews/:reviewId", (req, res) => {
  try {
    const { reviewId } = req.params;
    const { adminId } = req.query;
    const users = dbInstance.getUsers();
    const adminUser = users.find((u) => u.id === adminId);
    if (!adminUser || !["superadmin", "admin", "moderator"].includes(adminUser.role)) {
      return res.status(403).json({ error: "\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D. \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u0641\u0642\u0637." });
    }
    const reviews = dbInstance.getReviews();
    const idx = reviews.findIndex((r) => r.id === reviewId);
    if (idx !== -1) {
      const deletedReview = reviews.splice(idx, 1)[0];
      const mediaList = dbInstance.getReviewMedia();
      const filteredMedia = mediaList.filter((m) => m.review_id !== reviewId);
      dbInstance.setReviewMedia(filteredMedia);
      const allReviewsForProduct = dbInstance.getReviews().filter((r) => r.productId === deletedReview.productId);
      const avgRating = allReviewsForProduct.length > 0 ? allReviewsForProduct.reduce((sum, item) => sum + item.rating, 0) / allReviewsForProduct.length : 5;
      const products = dbInstance.getProducts();
      const product = products.find((p) => p.id === deletedReview.productId);
      if (product) {
        product.sellerRating = Number(avgRating.toFixed(1));
      }
      dbInstance.persist();
      return res.json({ success: true });
    }
    res.status(404).json({ error: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/admin/reviews/:reviewId/media/:mediaId", (req, res) => {
  try {
    const { reviewId, mediaId } = req.params;
    const { adminId } = req.query;
    const users = dbInstance.getUsers();
    const adminUser = users.find((u) => u.id === adminId);
    if (!adminUser || !["superadmin", "admin", "moderator"].includes(adminUser.role)) {
      return res.status(403).json({ error: "\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D. \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u0641\u0642\u0637." });
    }
    const mediaList = dbInstance.getReviewMedia();
    const idx = mediaList.findIndex((m) => m.id === mediaId && m.review_id === reviewId);
    if (idx !== -1) {
      mediaList.splice(idx, 1);
      dbInstance.persist();
      return res.json({ success: true });
    }
    res.status(404).json({ error: "\u0627\u0644\u0648\u0633\u0627\u0626\u0637 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/reviews/:reviewId/hide", (req, res) => {
  try {
    const { reviewId } = req.params;
    const { adminId, hide } = req.body;
    const users = dbInstance.getUsers();
    const adminUser = users.find((u) => u.id === adminId);
    if (!adminUser || !["superadmin", "admin", "moderator"].includes(adminUser.role)) {
      return res.status(403).json({ error: "\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D. \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u0641\u0642\u0637." });
    }
    const reviews = dbInstance.getReviews();
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      review.isHidden = hide ?? true;
      dbInstance.persist();
      return res.json({ success: true, review });
    }
    res.status(404).json({ error: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/wallet/transactions/:userId", (req, res) => {
  const { userId } = req.params;
  const txs = dbInstance.getWalletTransactions().filter((t) => t.userId === userId);
  res.json(txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});
app.post("/api/coupons/apply", (req, res) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0643\u0648\u062F \u0627\u0644\u0643\u0648\u0628\u0648\u0646" });
    }
    const coupons = dbInstance.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      return res.status(404).json({ error: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u062A\u0645 \u062D\u0630\u0641\u0647." });
    }
    if (coupon.status === "inactive") {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u062A\u0648\u0642\u0641 \u062D\u0627\u0644\u064A\u0627\u064B \u0628\u0627\u0644\u0645\u0646\u0635\u0629" });
    }
    if (coupon.status === "used") {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u0633\u0628\u0642\u0627\u064B" });
    }
    if (new Date(coupon.expiryDate).getTime() < (/* @__PURE__ */ new Date()).getTime()) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u0628\u0648\u0646" });
    }
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0642\u062F \u0627\u0633\u062A\u0643\u0645\u0644 \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0627\u062A" });
    }
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/wallet/redeem-code", (req, res) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0643\u0648\u062F \u0627\u0644\u0634\u062D\u0646" });
    }
    const ip = getClientIp(req);
    const rateLimitKey = `${ip}-${userId}`;
    if (!checkRateLimit(rateLimitKey, redeemRateLimits, 5, 1 * 60 * 1e3)) {
      return res.status(429).json({ error: "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0623\u0643\u0648\u0627\u062F. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0644\u0645\u062F\u0629 \u062F\u0642\u064A\u0642\u0629 \u0648\u0627\u062D\u062F\u0629 \u0648\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B \u0644\u0633\u0644\u0627\u0645\u0629 \u062D\u0633\u0627\u0628\u0643." });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
    }
    const codes = dbInstance.getRechargeCodes();
    const codeIndex = codes.findIndex((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (codeIndex !== -1) {
      const rechargeCode = codes[codeIndex];
      if (rechargeCode.status === "used") {
        return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u062F \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647 \u0645\u0633\u0628\u0642\u0627\u064B \u0628\u0627\u0644\u0645\u0646\u0635\u0629" });
      }
      if (new Date(rechargeCode.expiryDate).getTime() < (/* @__PURE__ */ new Date()).getTime()) {
        return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0643\u0648\u062F \u0627\u0644\u0634\u062D\u0646 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" });
      }
      user.points += rechargeCode.points;
      rechargeCode.status = "used";
      rechargeCode.usedBy = user.id;
      rechargeCode.usedAt = (/* @__PURE__ */ new Date()).toISOString();
      dbInstance.getWalletTransactions().push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: "credit",
        amount: 0,
        points: rechargeCode.points,
        description: `\u0634\u062D\u0646 \u0646\u0642\u0627\u0637 \u0639\u0628\u0631 \u0643\u0648\u062F \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629: ${rechargeCode.code}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "completed"
      });
      dbInstance.persist();
      return res.json({
        success: true,
        pointsAdded: rechargeCode.points,
        newPoints: user.points
      });
    }
    const coupons = dbInstance.getCoupons();
    const couponIndex = coupons.findIndex((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (couponIndex !== -1) {
      const coupon = coupons[couponIndex];
      if (coupon.status === "used") {
        return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0642\u0633\u064A\u0645\u0629 \u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0647\u0630\u0647 \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0645\u0633\u0628\u0642\u0627\u064B" });
      }
      if (coupon.status === "inactive") {
        return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0647 \u0627\u0644\u0642\u0633\u064A\u0645\u0629 \u063A\u064A\u0631 \u0645\u0641\u0639\u0651\u0644\u0629 \u062D\u0627\u0644\u064A\u0627\u064B" });
      }
      if (new Date(coupon.expiryDate).getTime() < (/* @__PURE__ */ new Date()).getTime()) {
        return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0647 \u0627\u0644\u0642\u0633\u064A\u0645\u0629" });
      }
      let pointsReward = coupon.value;
      let description = `\u062A\u0641\u0639\u064A\u0644 \u0646\u0642\u0627\u0637 \u0642\u0633\u064A\u0645\u0629 \u0647\u062F\u0627\u064A\u0627: ${coupon.code}`;
      user.points += pointsReward;
      coupon.status = "used";
      coupon.usageCount = (coupon.usageCount || 0) + 1;
      coupon.usedBy = user.id;
      coupon.usedAt = (/* @__PURE__ */ new Date()).toISOString();
      dbInstance.getWalletTransactions().push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: "credit",
        amount: 0,
        points: pointsReward,
        description,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "completed"
      });
      dbInstance.persist();
      return res.json({
        success: true,
        pointsAdded: pointsReward,
        newPoints: user.points
      });
    }
    return res.status(404).json({ error: "\u0643\u0648\u062F \u0627\u0644\u0634\u062D\u0646 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u062A\u0645 \u062D\u0630\u0641\u0647." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/wallet/recharge-payment", (req, res) => {
  try {
    const { userId, packageId, paymentMethod, cardNumber, localCode } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u062A\u0642\u062F\u064A\u0645 \u0643\u0627\u0641\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0628\u0627\u0642\u0629 \u0627\u0644\u0634\u062D\u0646 \u0648\u0642\u0646\u0627\u0629 \u0627\u0644\u062F\u0641\u0639" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
    }
    const settings = dbInstance.getSettings();
    const defaultPackages = [
      { id: "p_starter", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0631\u0648\u0646\u0632\u064A\u0629", points: 60, priceUsd: 5 },
      { id: "p_basic", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0641\u0636\u064A\u0629", points: 230, priceUsd: 10 },
      { id: "p_pro", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 (\u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627)", points: 470, priceUsd: 20 },
      { id: "p_premium", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0644\u0627\u062A\u064A\u0646\u064A\u0629", points: 1200, priceUsd: 50 }
    ];
    const packages = settings.packages || defaultPackages;
    const selectedPack = packages.find((p) => p.id === packageId);
    if (!selectedPack) {
      return res.status(400).json({ error: "\u0628\u0627\u0642\u0629 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0648\u0644\u0627 \u062A\u062A\u0648\u0641\u0631 \u0628\u0627\u0644\u0646\u0638\u0627\u0645." });
    }
    const verifiedPoints = Number(selectedPack.points);
    const verifiedAmount = Number(selectedPack.priceUsd) * 10;
    const invId = "INV-" + Math.floor(1e5 + Math.random() * 9e5);
    const txId = "tx-" + Math.random().toString(36).substr(2, 9);
    let description = "";
    let status = "pending";
    if (paymentMethod === "card") {
      const maskedCard = cardNumber ? `Visa/MC (**** ${cardNumber.slice(-4)})` : "\u0628\u0637\u0627\u0642\u0629 \u0628\u0646\u0643\u064A\u0629";
      description = `\u0637\u0644\u0628 \u0634\u062D\u0646 \u0645\u0639\u0644\u0642 \u0639\u0628\u0631 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0628\u0646\u0643\u064A\u0629: ${maskedCard} (\u0642\u064A\u062F \u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A)`;
      status = "pending";
    } else if (paymentMethod === "local") {
      description = `\u0637\u0644\u0628 \u0634\u062D\u0646 \u0645\u0639\u0644\u0642 \u0648\u0643\u0627\u0644\u0629 \u0643\u0627\u0634 \u0628\u0644\u0648\u0633/\u0648\u0641\u0627\u0643\u0627\u0634 - \u0643\u0648\u062F: ${localCode || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} (\u0642\u064A\u062F \u0627\u0644\u062A\u062F\u0642\u064A\u0642)`;
      status = "pending";
    } else if (paymentMethod === "paypal") {
      description = `\u0637\u0644\u0628 \u0634\u062D\u0646 \u0645\u0639\u0644\u0642 \u0639\u0628\u0631 PayPal - \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u0641\u0639\u0644\u064A \u0645\u0646 \u0627\u0644\u0628\u0648\u0627\u0628\u0629`;
      status = "pending";
    } else {
      return res.status(400).json({ error: "\u0642\u0646\u0627\u0629 \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629 \u0628\u0627\u0644\u0645\u0646\u0635\u0629 \u0644\u062A\u0641\u0627\u062F\u064A \u0627\u0644\u062A\u0644\u0627\u0639\u0628 \u0628\u0627\u0644\u0646\u0642\u0627\u0637 \u064A\u062F\u0648\u064A\u0627\u064B." });
    }
    dbInstance.getWalletTransactions().push({
      id: txId,
      userId: user.id,
      type: "credit",
      amount: verifiedAmount,
      points: verifiedPoints,
      description,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status,
      invoiceId: invId
    });
    dbInstance.persist();
    res.json({
      success: true,
      status,
      pointsAdded: 0,
      newPoints: user.points,
      invoiceId: invId,
      amount: verifiedAmount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/paypal/config", (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID || "sb"
  });
});
app.post("/api/wallet/verify-paypal", paypalVerifyLimiter, async (req, res) => {
  try {
    const { userId, orderId, packageId } = req.body;
    if (!userId || !orderId || !packageId) {
      return res.status(400).json({ error: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
    }
    const settings = dbInstance.getSettings();
    const defaultPackages = [
      { id: "p_starter", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0631\u0648\u0646\u0632\u064A\u0629", points: 60, priceUsd: 5 },
      { id: "p_basic", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0641\u0636\u064A\u0629", points: 230, priceUsd: 10 },
      { id: "p_pro", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 (\u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627)", points: 470, priceUsd: 20 },
      { id: "p_premium", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0644\u0627\u062A\u064A\u0646\u064A\u0629", points: 1200, priceUsd: 50 }
    ];
    const packages = settings.packages || defaultPackages;
    const selectedPack = packages.find((p) => p.id === packageId);
    if (!selectedPack) {
      return res.status(400).json({ error: "\u0628\u0627\u0642\u0629 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0645\u0639\u064A\u0628\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631\u0629 \u0628\u0627\u0644\u0646\u0638\u0627\u0645." });
    }
    const verifiedPoints = Number(selectedPack.points);
    const verifiedAmountUsd = Number(selectedPack.priceUsd);
    const existingTx = dbInstance.getWalletTransactions().find((t) => t.invoiceId === orderId);
    if (existingTx) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0648\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0639\u0627\u0645\u0644\u0629 PayPal \u0647\u0630\u0647 \u0645\u0633\u0628\u0642\u0627\u064B \u0628\u0627\u0644\u0634\u062D\u0646." });
    }
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      console.warn("PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not found in environment variables.");
      return res.status(400).json({ error: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062F\u0641\u0639 PayPal \u0645\u0639\u0637\u0644\u0629 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0639\u062F\u0645 \u0631\u0628\u0637 \u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0627\u0644\u0625\u062F\u0627\u0631\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0646\u0627 \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0641\u064A \u0634\u062D\u0646 \u062D\u0633\u0627\u0628\u0643 \u064A\u062F\u0648\u064A\u0627\u064B." });
    }
    let isRealVerified = false;
    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const isProd = process.env.PAYPAL_MODE === "production";
      const baseUrl = isProd ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          const status = orderData.status;
          const valueStr = orderData.purchase_units?.[0]?.amount?.value;
          const valueNum = Number(valueStr);
          const pCustomId = orderData.purchase_units?.[0]?.custom_id || orderData.purchase_units?.[0]?.custom || "";
          const payeeEmail = orderData.purchase_units?.[0]?.payee?.email_address || "";
          const expectedMerchantEmail = process.env.PAYPAL_PAYEE_EMAIL || "paypal@sou9aljoumla.com";
          if (status === "COMPLETED" && Math.abs(valueNum - verifiedAmountUsd) <= 0.01) {
            if (pCustomId && pCustomId !== userId) {
              console.warn(`[PAYPAL HIJACK GUARD] Attempted hijack. Order custom_id=${pCustomId} doesn't match session user=${userId}`);
              isRealVerified = false;
              securityLogger.warn({
                event: "PAYPAL_HIJACK_ATTEMPT",
                userId,
                pCustomId,
                orderId,
                ip: req.ip
              });
            } else if (payeeEmail && payeeEmail.toLowerCase() !== expectedMerchantEmail.toLowerCase()) {
              console.warn(`[PAYPAL MERCHANT GUARD] Payment sent to unexpected payee: ${payeeEmail}`);
              isRealVerified = false;
              securityLogger.warn({
                event: "PAYPAL_MERCHANT_FRAUD_ATTEMPT",
                userId,
                payeeEmail,
                expectedMerchantEmail,
                orderId,
                ip: req.ip
              });
            } else {
              isRealVerified = true;
            }
          } else {
            console.warn(`PayPal order check mismatch: expected=${verifiedAmountUsd}, got=${valueNum}, status=${status}`);
            paymentsLogger.warn({
              event: "PAYPAL_PAYMENT_MISMATCH",
              userId,
              orderId,
              status,
              gotAmount: valueNum,
              expectedAmount: verifiedAmountUsd,
              ip: req.ip
            });
          }
        }
      }
    } catch (err) {
      console.error("PayPal API server validation failed:", err);
    }
    if (!isRealVerified) {
      return res.status(400).json({ error: "\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0645\u0639\u0627\u0645\u0644\u0629 PayPal \u0645\u0639 \u062E\u0648\u0627\u062F\u0645 \u0628\u0627\u064A\u0628\u0627\u0644 \u0627\u0644\u0631\u0633\u0645\u064A\u0629." });
    }
    user.points += verifiedPoints;
    dbInstance.getWalletTransactions().push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: "credit",
      amount: verifiedAmountUsd * 10,
      // MAD equivalent
      points: verifiedPoints,
      description: `\u0634\u062D\u0646 \u0645\u062D\u0641\u0638\u0629 \u0622\u0644\u064A \u0648\u062A\u0644\u0642\u0627\u0626\u064A \u0645\u0639\u062A\u0645\u062F \u0639\u0628\u0631 \u0628\u0648\u0627\u0628\u0629 \u0628\u0627\u064A\u0628\u0627\u0644 (PayPal) - \u0645\u0639\u0627\u0645\u0644\u0629 \u0631\u0642\u0645 ${orderId}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "completed",
      invoiceId: orderId
    });
    dbInstance.persist();
    res.json({
      success: true,
      pointsAdded: verifiedPoints,
      newPoints: user.points,
      invoiceId: orderId,
      amount: verifiedAmountUsd * 10
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/payment/webhook", webhookLimiter, async (req, res) => {
  try {
    const event = req.body;
    if (!event || event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
      return res.json({ received: true, ignored: true });
    }
    const resource = event.resource;
    const captureId = resource?.id;
    if (!captureId) {
      return res.status(400).json({ error: "Missing capture ID" });
    }
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      console.warn("[WEBHOOK ERROR] PayPal credentials missing, unable to verify incoming capture.");
      return res.status(400).json({ error: "PayPal credentials missing" });
    }
    const transactions = dbInstance.getWalletTransactions();
    const existing = transactions.find((t) => t.invoiceId === captureId);
    if (existing) {
      console.warn(`[WEBHOOK REPLAY BLOCK] Transaction with captureId ${captureId} was already processed.`);
      return res.status(409).json({ error: "Duplicate transaction blocked" });
    }
    let isRealCaptureVerified = false;
    let actualAmountUsd = 0;
    let actualCustomId = "";
    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const isProd = process.env.PAYPAL_MODE === "production";
      const baseUrl = isProd ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        let isSignatureVerified = false;
        try {
          const verifyBody = {
            auth_algo: req.headers["paypal-auth-algo"] || req.headers["PAYPAL-AUTH-ALGO"] || "",
            cert_url: req.headers["paypal-cert-url"] || req.headers["PAYPAL-CERT-URL"] || "",
            transmission_id: req.headers["paypal-transmission-id"] || req.headers["PAYPAL-TRANSMISSION-ID"] || "",
            transmission_sig: req.headers["paypal-transmission-sig"] || req.headers["PAYPAL-TRANSMISSION-SIG"] || "",
            transmission_time: req.headers["paypal-transmission-time"] || req.headers["PAYPAL-TRANSMISSION-TIME"] || "",
            webhook_id: process.env.PAYPAL_WEBHOOK_ID || "sb-default",
            webhook_event: event
          };
          const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(verifyBody)
          });
          if (verifyRes.ok) {
            const verifyResult = await verifyRes.json();
            if (verifyResult.verification_status === "SUCCESS") {
              isSignatureVerified = true;
            }
          }
        } catch (sigErr) {
          console.error("[SIGNATURE LOG EXCEPTION] Webhook verification method skipped.", sigErr);
        }
        if (process.env.PAYPAL_WEBHOOK_ID && !isSignatureVerified) {
          console.warn(`[WEBHOOK SIGNATURE FALSIFIED] Signature mismatch on Capture ID ${captureId}.`);
          securityLogger.warn({
            event: "WEBHOOK_SIGNATURE_FAILED",
            captureId,
            ip: req.ip
          });
          return res.status(401).json({ error: "Falsified signature" });
        }
        const captureRes = await fetch(`${baseUrl}/v2/payments/captures/${captureId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
        if (captureRes.ok) {
          const captureData = await captureRes.json();
          const pStatus = captureData.status;
          const pAmount = captureData.amount?.value;
          const pCustomId = captureData.custom_id || captureData.custom || "";
          const payeeEmail = captureData.payee?.email_address || captureData.seller_receivable_breakdown?.payee?.email_address || "";
          const expectedMerchantEmail = process.env.PAYPAL_PAYEE_EMAIL || "paypal@sou9aljoumla.com";
          if (pStatus === "COMPLETED") {
            if (payeeEmail && payeeEmail.toLowerCase() !== expectedMerchantEmail.toLowerCase()) {
              console.warn(`[PAYPAL Webhook Merchant Guard] Payment sent to unexpected payee matching: ${payeeEmail}`);
              securityLogger.warn({
                event: "WEBHOOK_MERCHANT_FRAUD_ATTEMPT",
                payeeEmail,
                expectedMerchantEmail,
                captureId,
                ip: req.ip
              });
            } else {
              isRealCaptureVerified = true;
              actualAmountUsd = Number(pAmount);
              actualCustomId = pCustomId;
            }
          }
        }
      }
    } catch (err) {
      console.error("[WEBHOOK VERIFY ERR]", err);
    }
    if (!isRealCaptureVerified) {
      console.warn(`[WEBHOOK SPOOF ALERT] Webhook payload specified Capture ID ${captureId} but direct PayPal API check failed.`);
      return res.status(403).json({ error: "Unverified or spoofed payment webhook blocked" });
    }
    const defaultPackages = [
      { id: "p_starter", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0631\u0648\u0646\u0632\u064A\u0629", points: 60, priceUsd: 5 },
      { id: "p_basic", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0641\u0636\u064A\u0629", points: 230, priceUsd: 10 },
      { id: "p_pro", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 (\u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627)", points: 470, priceUsd: 20 },
      { id: "p_premium", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0644\u0627\u062A\u064A\u0646\u064A\u0629", points: 1200, priceUsd: 50 }
    ];
    const settings = dbInstance.getSettings();
    const packages = settings.packages || defaultPackages;
    const closestPack = packages.find((p) => Math.abs(Number(p.priceUsd) - actualAmountUsd) <= 0.01);
    if (!closestPack) {
      console.warn(`[WEBHOOK FRAUD RISK] Capture payment amount of ${actualAmountUsd} USD does not match any official package pricing.`);
      securityLogger.warn({
        event: "WEBHOOK_INVALID_AMOUNT_FRAUD",
        actualAmountUsd,
        captureId,
        ip: req.ip
      });
      return res.status(400).json({ error: "Invalid PayPal recharge amount" });
    }
    if (!actualCustomId) {
      console.warn(`[WEBHOOK ERROR] Capture ${captureId} verified but missing custom_id for user allocation.`);
      return res.status(400).json({ error: "Missing custom_id user mapping" });
    }
    const user = dbInstance.getUsers().find((u) => u.id === actualCustomId);
    if (!user) {
      console.warn(`[WEBHOOK ERROR] User ID ${actualCustomId} not found for capture ${captureId}.`);
      return res.status(404).json({ error: "User not found" });
    }
    user.points += Number(closestPack.points);
    transactions.push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: "credit",
      amount: Number(closestPack.priceUsd) * 10,
      // MAD estimate
      points: Number(closestPack.points),
      description: `\u0634\u062D\u0646 \u0641\u0648\u0631\u064A \u0645\u0639\u0632\u0632 \u0648\u0645\u0648\u062B\u0642 \u0628\u0646\u062C\u0627\u062D \u0639\u0628\u0631 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0640 Webhook \u0627\u0644\u0641\u0648\u0631\u064A\u0629 - \u0645\u0639\u0631\u0641 \u0627\u0644\u062F\u0641\u0639: ${captureId}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "completed",
      invoiceId: captureId
    });
    dbInstance.persist();
    console.log(`[PAYMENT WEBHOOK SUCCESS] Capture verified with PayPal API. Added +${closestPack.points} points to user ${user.id}.`);
    paymentsLogger.info({
      event: "PAYPAL_WEBHOOK_CREDITED",
      userId: user.id,
      captureId,
      amountUsd: actualAmountUsd,
      points: closestPack.points
    });
    res.json({ received: true, verified: true });
  } catch (err) {
    console.error("[WEBHOOK HANDLER ERROR]", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/approve-transaction", (req, res) => {
  try {
    const { transactionId, adminId } = req.body;
    if (!transactionId || !adminId) {
      return res.status(400).json({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0641\u0642\u0637 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0646 \u0623\u0648 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0645\u062E\u0648\u0644\u064A\u0646 \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u062F\u0641\u0639\u0627\u062A" });
    }
    const txs = dbInstance.getWalletTransactions();
    const tx = txs.find((t) => t.id === transactionId);
    if (!tx) {
      return res.status(404).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    if (tx.status === "completed") {
      return res.status(400).json({ error: "\u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u062A\u0645 \u0634\u062D\u0646\u0647\u0627 \u0645\u0633\u0628\u0642\u0627\u064B \u0644\u0644\u0639\u0645\u064A\u0644 \u0648\u0645\u0643\u062A\u0645\u0644\u0629" });
    }
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === tx.userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0639\u0636\u0648 \u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u062D\u0627\u0644\u064A\u0627\u064B" });
    }
    tx.status = "completed";
    user.points += Number(tx.points);
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u0634\u062D\u0646 \u0631\u0635\u064A\u062F - \u0645\u0648\u0627\u0641\u0642\u0629 \u0625\u062F\u0627\u0631\u064A\u0629",
      details: `\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u062F\u064A\u0631 ${admin.name} \u0639\u0644\u0649 \u0645\u0639\u0627\u0645\u0644\u0629 \u0627\u0644\u0634\u062D\u0646 \u0631\u0642\u0645 ${tx.id} \u0648\u0642\u0627\u0645 \u064A\u062F\u0648\u064A\u0627\u064B \u0628\u0625\u0636\u0627\u0641\u0629 +${tx.points} \u0646\u0642\u0637\u0629 \u0644\u0644\u0639\u0636\u0648 ${user.name} \u0628\u0639\u062F \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u062F\u0641\u0639.`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email || "admin@sou9aljoumla.com",
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({
      success: true,
      pointsAdded: tx.points,
      newPoints: user.points,
      status: "completed"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/reject-transaction", (req, res) => {
  try {
    const { transactionId, adminId, reason } = req.body;
    if (!transactionId || !adminId) {
      return res.status(400).json({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0641\u0642\u0637 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0642\u0627\u062F\u0631 \u0639\u0644\u0649 \u0631\u0641\u0636 \u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0627\u0644\u062F\u0641\u0639" });
    }
    const txs = dbInstance.getWalletTransactions();
    const tx = txs.find((t) => t.id === transactionId);
    if (!tx) {
      return res.status(404).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    if (tx.status !== "pending") {
      return res.status(400).json({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0631\u0641\u0636 \u0645\u0639\u0627\u0645\u0644\u0629 \u0645\u0646\u062A\u0647\u064A\u0629 \u0623\u0648 \u0645\u0643\u062A\u0645\u0644\u0629 \u0645\u0633\u0628\u0642\u0627\u064B" });
    }
    tx.status = "failed";
    tx.description += ` (\u062A\u0645 \u0627\u0644\u0625\u0644\u063A\u0627\u0621 \u0648\u0627\u0644\u0631\u0641\u0636 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629: ${reason || "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062F\u0641\u0639\u0629 \u0641\u064A \u062D\u0633\u0627\u0628\u0646\u0627 \u0627\u0644\u0628\u0646\u0643\u064A"})`;
    dbInstance.getAuditLogs().push({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action: "\u0634\u062D\u0646 \u0631\u0635\u064A\u062F - \u0631\u0641\u0636 \u0648\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0639\u0645\u0644\u064A\u0629",
      details: `\u0631\u0641\u0636 \u0627\u0644\u0645\u062F\u064A\u0631 ${admin.name} \u0645\u0639\u0627\u0645\u0644\u0629 \u0627\u0644\u0634\u062D\u0646 \u0631\u0642\u0645 ${tx.id} \u0648\u0642\u0627\u0645 \u0628\u0625\u0644\u063A\u0627\u0626\u0647\u0627 \u0628\u0633\u0628\u0628: ${reason || "\u0639\u062F\u0645 \u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0623\u0648 \u0639\u062F\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062F\u0641\u0639\u0629"}`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email || "admin@sou9aljoumla.com",
      ip: req.ip || "127.0.0.1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({
      success: true,
      status: "failed"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/chats/rooms/:userId", (req, res) => {
  const { userId } = req.params;
  const rooms = dbInstance.getChatRooms().filter((r) => r.buyerId === userId || r.sellerId === userId);
  res.json(rooms);
});
app.get("/api/chats/rooms/:roomId/messages", (req, res) => {
  const { roomId } = req.params;
  const msgs = dbInstance.getMessages().filter((m) => m.roomId === roomId);
  res.json(msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
});
app.post("/api/chats/rooms/initiate", (req, res) => {
  try {
    const { buyerId, sellerId } = req.body;
    if (!buyerId || !sellerId) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0634\u062A\u0631\u064A \u0648\u0627\u0644\u0628\u0627\u0626\u0639 \u0644\u0628\u062F\u0621 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629" });
    }
    const rooms = dbInstance.getChatRooms();
    let room = rooms.find((r) => r.buyerId === buyerId && r.sellerId === sellerId);
    if (!room) {
      const users = dbInstance.getUsers();
      const buyer = users.find((u) => u.id === buyerId);
      const seller = users.find((u) => u.id === sellerId);
      room = {
        id: "room-" + Math.random().toString(36).substr(2, 9),
        buyerId,
        sellerId,
        buyerName: buyer?.name || "\u0645\u0634\u062A\u0631\u064A",
        sellerName: seller?.companyName || seller?.name || "\u0645\u0648\u0631\u062F \u0627\u0644\u062C\u0645\u0644\u0629",
        buyerLogo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        sellerLogo: seller?.companyLogo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
        lastMessage: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643\u060C \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0628\u062E\u0635\u0648\u0635 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062C\u0645\u0644\u0629\u061F",
        lastMessageTime: (/* @__PURE__ */ new Date()).toISOString(),
        unreadCountBuyer: 0,
        unreadCountSeller: 1
      };
      rooms.push(room);
      dbInstance.getMessages().push({
        id: "msg-init",
        roomId: room.id,
        senderId: sellerId,
        text: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643! \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u062A\u0644\u0642\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0643 \u0648\u062A\u062C\u0647\u064A\u0632 \u0643\u0645\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0644\u0629 \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0628\u0645\u062E\u062A\u0644\u0641 \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629.",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "read"
      });
      dbInstance.persist();
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/chats/messages/send", generalApiLimiter, (req, res) => {
  try {
    const { roomId, senderId, text, imageUrl } = req.body;
    if (!roomId || !senderId || !text) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629" });
    }
    const sanitizedText = sanitizeHTML(text);
    const msg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId,
      text: sanitizedText,
      imageUrl: imageUrl || "",
      status: "sent",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getMessages().push(msg);
    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex((r) => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = sanitizedText;
      rooms[rIdx].lastMessageTime = msg.createdAt;
      if (rooms[rIdx].buyerId === senderId) {
        rooms[rIdx].unreadCountSeller += 1;
      } else {
        rooms[rIdx].unreadCountBuyer += 1;
      }
    }
    dbInstance.persist();
    res.json(msg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/reports/create", (req, res) => {
  try {
    const { reporterId, reporterName, targetType, targetId, reason, details } = req.body;
    if (!reporterId || !targetType || !targetId || !reason) {
      return res.status(400).json({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0644\u0627\u063A \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629" });
    }
    const newReport = {
      id: "rep-" + Math.random().toString(36).substr(2, 9),
      reporterId,
      reporterName: reporterName || "\u0639\u0636\u0648 \u0628\u0627\u0644\u0645\u0646\u0635\u0629",
      targetType,
      targetId,
      reason,
      details: details || "",
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    dbInstance.getReports().push(newReport);
    dbInstance.persist();
    res.json({ success: true, report: newReport });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/stats", (req, res) => {
  try {
    const users = dbInstance.getUsers();
    const products = dbInstance.getProducts();
    const txs = dbInstance.getWalletTransactions();
    const codes = dbInstance.getRechargeCodes();
    const comments = dbInstance.getComments();
    const reports = dbInstance.getReports();
    const activeSellers = users.filter((u) => u.role === "seller");
    const buyers = users.filter((u) => u.role === "buyer");
    const admins = users.filter((u) => u.role === "admin" || u.role === "moderator");
    const totalEarnings = txs.filter((t) => t.type === "credit" && t.amount > 0).reduce((sum, item) => sum + item.amount, 0);
    const stats = {
      totalUsers: users.length,
      sellersCount: activeSellers.length,
      buyersCount: buyers.length,
      onlineNow: Math.floor(3 + Math.random() * 8),
      // simulated real-time visitors
      productsCount: products.length,
      featuredCount: products.filter((p) => p.isFeatured).length,
      pinnedCount: products.filter((p) => p.isPinned).length,
      pendingApproval: products.filter((p) => p.status === "draft").length,
      totalCoinsCirculated: users.reduce((sum, u) => sum + u.points, 0),
      totalEarnings,
      couponsCount: dbInstance.getCoupons().length,
      rechargeCodesCount: codes.length,
      commentsCount: comments.length,
      reportsCount: reports.length,
      serverStatus: "\u0645\u0633\u062A\u0642\u0631 \u0648\u0622\u0645\u0646",
      databaseStatus: "\u0645\u062A\u0635\u0644 \u0648\u0645\u062D\u0633\u0651\u0646 (PostgreSQL & JSON Sandbox)",
      cacheStatus: "\u0646\u0634\u0637 (Cloudflare Edge & Memory cache)"
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/transactions", (req, res) => {
  try {
    const { adminId } = req.query;
    const users = dbInstance.getUsers();
    const caller = typeof adminId === "string" ? users.find((u) => u.id === adminId) : null;
    let txs = dbInstance.getWalletTransactions();
    if (!caller || caller.role !== "superadmin") {
      txs = txs.filter((t) => t.userId !== "u-admin");
    }
    const detailedTxs = txs.map((t) => {
      const user = users.find((u) => u.id === t.userId);
      return {
        ...t,
        userName: user ? user.name : "\u0645\u0633\u062A\u0639\u0645\u0644 \u0645\u062C\u0647\u0648\u0644",
        userEmail: user ? user.email : "\u0645\u062C\u0647\u0648\u0644"
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(detailedTxs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/users", (req, res) => {
  const { callerId } = req.query;
  const users = dbInstance.getUsers();
  const caller = typeof callerId === "string" ? users.find((u) => u.id === callerId) : null;
  const isAuthorized = caller && (caller.role === "superadmin" || caller.role === "admin");
  let finalUsers = users;
  if (!caller || caller.role !== "superadmin") {
    finalUsers = users.filter((u) => u.role !== "superadmin" && u.id !== "u-admin");
  }
  const sanitizedUsers = finalUsers.map((u) => {
    if (isAuthorized) {
      return u;
    }
    if (caller && u.id === caller.id) {
      return u;
    }
    return {
      ...u,
      points: 0,
      points_spent: 0
    };
  });
  res.json(sanitizedUsers);
});
app.post("/api/admin/users/action", (req, res) => {
  try {
    const { userId, action, adminId, pointsDelta, role, verificationStatus, badges } = req.body;
    const users = dbInstance.getUsers();
    const user = users.find((u) => u.id === userId);
    const admin = users.find((u) => u.id === adminId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
    }
    if (!admin) {
      return res.status(403).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u0642\u064A\u0627\u0645 \u0628\u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621" });
    }
    const targetIsGM = user.role === "superadmin" || user.id === "u-admin";
    const callerIsGM = admin.role === "superadmin" || admin.id === "u-admin";
    if (targetIsGM && !callerIsGM) {
      return res.status(404).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0628\u0627\u0644\u0645\u0646\u0635\u0629." });
    }
    if (admin.role !== "superadmin" && admin.role !== "admin" && admin.role !== "moderator") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0625\u062F\u0627\u0631\u064A\u0629 \u0643\u0627\u0641\u064A\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621" });
    }
    if (user.role === "superadmin") {
      if (action !== "adjust-points") {
        return res.status(403).json({ error: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 (Super Admin) \u0645\u062D\u0645\u064A \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0628\u0641\u0635\u0644 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0646 \u0627\u0644\u0633\u062D\u0627\u0628\u064A \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0639\u062F\u064A\u0644 \u0631\u062A\u0628\u062A\u0647 \u0623\u0648 \u062A\u0639\u0637\u064A\u0644\u0647 \u0646\u0647\u0627\u0626\u064A\u0627\u064B." });
      }
    }
    if (user.id === admin.id) {
      if (action === "suspend" || action === "change-role" && role !== admin.role) {
        return res.status(400).json({ error: "\u062A\u062D\u0630\u064A\u0631 \u0623\u0645\u0627\u0646: \u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0643 \u0623\u0648 \u0633\u062D\u0628 \u0631\u062A\u0628\u062A\u0643 \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0628\u0646\u0641\u0633\u0643 \u0644\u062A\u0641\u0627\u062F\u064A \u0642\u0641\u0644 \u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A (Self-Lock Prevention)." });
      }
    }
    if (admin.role === "moderator") {
      const allowedActions = ["suspend", "activate"];
      if (!allowedActions.includes(action)) {
        return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0642\u062A\u0635\u0631 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0633\u0627\u0639\u062F (Moderator) \u0639\u0644\u0649 \u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0648\u0642\u0641\u0644 \u0623\u0648 \u062A\u0646\u0634\u064A\u0637 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0641\u0642\u0637." });
      }
      if (user.role === "admin" || user.role === "superadmin" || user.role === "moderator") {
        return res.status(403).json({ error: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0631\u0641\u0648\u0636\u0629: \u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u062A\u0639\u062F\u064A\u0644 \u0623\u0648 \u0642\u0641\u0644 \u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0632\u0645\u064A\u0644\u0629." });
      }
    }
    if (admin.role === "admin") {
      const forbiddenRoles = ["superadmin", "admin", "moderator"];
      if (forbiddenRoles.includes(user.role)) {
        return res.status(403).json({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u0639\u062F\u064A\u0644 \u0623\u0648 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u064A\u0646 \u0627\u0644\u0643\u0628\u0627\u0631 \u0623\u0648 \u0627\u0644\u0645\u0634\u0631\u0641\u064A\u0646." });
      }
      if (action === "change-role" && (role === "admin" || role === "superadmin" || role === "moderator")) {
        return res.status(403).json({ error: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0631\u0641\u0648\u0636\u0629: \u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0646\u0635\u0629 \u0645\u0646\u062D \u0623\u0648 \u062A\u0639\u062F\u064A\u0644 \u0623\u062F\u0648\u0627\u0631 \u0627\u0644\u0631\u0642\u0627\u0628\u0629 \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627." });
      }
    }
    let actName = "";
    if (action === "suspend") {
      user.status = "suspended";
      actName = "\u0625\u064A\u0642\u0627\u0641 \u062D\u0633\u0627\u0628 \u0645\u0633\u062A\u062E\u062F\u0645";
    } else if (action === "activate") {
      user.status = "active";
      actName = "\u062A\u0641\u0639\u064A\u0644 \u062D\u0633\u0627\u0628 \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0642\u0631\u0627\u0631 \u0625\u062F\u0627\u0631\u064A";
    } else if (action === "verify") {
      user.isVerified = true;
      user.verificationStatus = "verified";
      actName = "\u062A\u0648\u062B\u064A\u0642 \u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0627\u0626\u0639 / \u0627\u0644\u0645\u0648\u0631\u062F (Verified)";
    } else if (action === "unverify") {
      user.isVerified = false;
      user.verificationStatus = "pending";
      actName = "\u0625\u0644\u063A\u0627\u0621 \u062A\u0648\u062B\u064A\u0642 \u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0627\u0626\u0639 / \u0627\u0644\u0645\u0648\u0631\u062F (Unverify)";
    } else if (action === "verify-status") {
      const vStatus = verificationStatus || "pending";
      user.verificationStatus = vStatus;
      user.isVerified = vStatus === "verified";
      actName = `\u062A\u0639\u062F\u064A\u0644 \u062D\u0627\u0644\u0629 \u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062D\u0633\u0627\u0628 \u0625\u0644\u0649: ${vStatus}`;
    } else if (action === "save-badges") {
      if (admin.role !== "superadmin" && admin.role !== "admin") {
        return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0643\u0627\u0641\u064A\u0629 \u0644\u062A\u0639\u062F\u064A\u0644 \u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 (\u0641\u0642\u0637 \u0644\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0639\u0627\u0645 \u0648\u0627\u0644\u0645\u062F\u064A\u0631)." });
      }
      const incoming = Array.isArray(badges) ? badges : [];
      const mainBadgesSet = ["Verified Seller", "Top Supplier", "Premium Partner", "Trusted Company", "New Seller"];
      const filtered = incoming.filter((b) => mainBadgesSet.includes(b));
      user.badges = filtered.length > 0 ? [filtered[filtered.length - 1]] : [];
      actName = `\u062A\u0639\u062F\u064A\u0644 \u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0625\u0644\u0649 \u0634\u0627\u0631\u0629 \u0645\u0646\u0641\u0631\u062F\u0629: [${user.badges.join(", ")}]`;
    } else if (action === "adjust-points") {
      const { subAction, pointsAmount, override, reason } = req.body;
      const pointsBefore = user.points || 0;
      let pointsAfter = pointsBefore;
      let delta = 0;
      let displaySubAction = "";
      if (subAction) {
        if (subAction === "add") {
          const num = Number(pointsAmount || 0);
          if (isNaN(num) || num <= 0) {
            return res.status(400).json({ error: "\u0642\u064A\u0645\u0629 \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0635\u0641\u0631." });
          }
          user.points = (user.points || 0) + num;
          pointsAfter = user.points;
          delta = num;
          displaySubAction = "\u0625\u0636\u0627\u0641\u0629 \u0646\u0642\u0627\u0637";
          actName = "\u0625\u0636\u0627\u0641\u0629 \u0646\u0642\u0627\u0637 \u0625\u062F\u0627\u0631\u064A\u0629";
        } else if (subAction === "deduct") {
          const num = Number(pointsAmount || 0);
          if (isNaN(num) || num <= 0) {
            return res.status(400).json({ error: "\u0642\u064A\u0645\u0629 \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u062E\u0635\u0648\u0645\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0635\u0641\u0631." });
          }
          if (pointsBefore < num && !override) {
            return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0631\u0635\u064A\u062F \u0646\u0642\u0627\u0637 \u0627\u0644\u0639\u0636\u0648 \u063A\u064A\u0631 \u0643\u0627\u0641\u064D \u0644\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u062E\u0635\u0645. \u064A\u0631\u062C\u0649 \u062A\u0641\u0639\u064A\u0644 \u062E\u064A\u0627\u0631 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u0631\u0635\u064A\u062F (Override) \u0644\u0644\u0645\u0648\u0627\u0635\u0644\u0629." });
          }
          user.points = (user.points || 0) - num;
          pointsAfter = user.points;
          delta = -num;
          displaySubAction = "\u062E\u0635\u0645 \u0646\u0642\u0627\u0637";
          actName = "\u062E\u0635\u0645 \u0646\u0642\u0627\u0637 \u0625\u062F\u0627\u0631\u064A";
        } else if (subAction === "zero") {
          user.points = 0;
          pointsAfter = 0;
          delta = -pointsBefore;
          displaySubAction = "\u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u0646\u0642\u0627\u0637 \u0628\u0627\u0644\u0643\u0627\u0645\u0644";
          actName = "\u062A\u0635\u0641\u064A\u0631 \u0646\u0642\u0627\u0637 \u0627\u0644\u062D\u0633\u0627\u0628";
        } else {
          return res.status(400).json({ error: "\u0646\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0641\u0631\u0639\u064A\u0629 \u0644\u0644\u0646\u0642\u0627\u0637 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645." });
        }
      } else {
        const legacyDelta = Number(pointsDelta || 0);
        user.points = (user.points || 0) + legacyDelta;
        pointsAfter = user.points;
        delta = legacyDelta;
        displaySubAction = legacyDelta >= 0 ? "\u0625\u0636\u0627\u0641\u0629 \u0646\u0642\u0627\u0637 (\u0642\u062F\u064A\u0645)" : "\u062E\u0635\u0645 \u0646\u0642\u0627\u0637 (\u0642\u062F\u064A\u0645)";
        actName = `\u062A\u0639\u062F\u064A\u0644 \u0631\u0635\u064A\u062F \u0627\u0644\u0646\u0642\u0627\u0637 (\u0627\u0644\u0635\u0627\u0641\u064A: ${legacyDelta > 0 ? "+" : ""}${legacyDelta})`;
      }
      dbInstance.getWalletTransactions().push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: delta >= 0 ? "credit" : "debit",
        amount: 0,
        points: Math.abs(delta),
        description: `\u062A\u0639\u062F\u064A\u0644 \u0631\u0635\u064A\u062F \u064A\u062F\u0648\u064A \u0645\u0628\u0627\u0634\u0631 \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629. \u0625\u062C\u0631\u0627\u0621: ${displaySubAction}${reason ? ` | \u0627\u0644\u0633\u0628\u0628: ${reason}` : ""}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "completed"
      });
      const finalReason = reason ? reason : "(\u0644\u0645 \u064A\u062A\u0645 \u062A\u062D\u062F\u064A\u062F \u0633\u0628\u0628)";
      const logDetails = `\u0625\u062C\u0631\u0627\u0621: [${displaySubAction}] | \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0625\u062F\u0627\u0631\u064A: ${admin.name} | \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641: ${user.name} (${user.email}) | \u0627\u0644\u0631\u0635\u064A\u062F \u0642\u0628\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0629: ${pointsBefore} PT | \u0627\u0644\u0631\u0635\u064A\u062F \u0628\u0639\u062F \u0627\u0644\u0639\u0645\u0644\u064A\u0629: ${pointsAfter} PT | \u0627\u0644\u062A\u063A\u064A\u0631: ${delta > 0 ? "+" : ""}${delta} PT | \u0633\u0628\u0628 \u0627\u0644\u0639\u0645\u0644\u064A\u0629: ${finalReason}`;
      dbInstance.getAuditLogs().push({
        id: "aud-" + Math.random().toString(36).substr(2, 9),
        adminId: admin.id,
        adminEmail: admin.email,
        adminName: admin.name,
        action: actName,
        ip: getClientIp(req),
        details: logDetails,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      dbInstance.persist();
      return res.json({ success: true, user });
    } else if (action === "change-role") {
      user.role = role;
      actName = `\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0631\u062A\u0628\u0629 \u0625\u0644\u0649: ${role}`;
    }
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: actName,
      ip: getClientIp(req),
      details: `\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0628\u0646\u062C\u0627\u062D \u0628\u0648\u0627\u0633\u0637\u0629 ${admin.name} \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${user.name} (${user.email}).`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/products", (req, res) => {
  checkAndCleanExpiredPremiums();
  res.json(dbInstance.getProducts());
});
app.post("/api/admin/products/action", (req, res) => {
  try {
    const { productId, action, adminId } = req.body;
    const products = dbInstance.getProducts();
    const pIdx = products.findIndex((p) => p.id === productId);
    if (pIdx === -1) {
      return res.status(404).json({ error: "\u0627\u0644\u0639\u0646\u0635\u0631 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" });
    }
    const item = products[pIdx];
    const admin = dbInstance.getUsers().find((u) => u.id === adminId);
    if (!admin || admin.role !== "admin" && admin.role !== "superadmin") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0645\u062A\u0627\u062D \u0641\u0642\u0637 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0635\u0629 (Admin / Super Admin)!" });
    }
    let actionLabel = "";
    if (action === "pin") {
      item.isPinned = true;
      actionLabel = "\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0628\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u0644\u0644\u0632\u0648\u0627\u0631";
    } else if (action === "unpin") {
      item.isPinned = false;
      actionLabel = "\u0625\u0644\u063A\u0627\u0621 \u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0625\u0639\u0644\u0627\u0646";
    } else if (action === "feature") {
      item.isFeatured = true;
      item.is_premium = true;
      item.premium_created_at = (/* @__PURE__ */ new Date()).toISOString();
      actionLabel = "\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0625\u0644\u0649 \u0645\u0645\u064A\u0632";
    } else if (action === "unfeature") {
      item.isFeatured = false;
      item.is_premium = false;
      actionLabel = "\u0625\u0644\u063A\u0627\u0621 \u062A\u0645\u064A\u064A\u0632 \u0627\u0644\u0625\u0639\u0644\u0627\u0646";
    } else if (action === "suspend") {
      item.status = "suspended";
      actionLabel = "\u062D\u0638\u0631 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0648\u0625\u062E\u0641\u0627\u0626\u0647 \u0644\u0644\u062C\u0645\u0647\u0648\u0631 \u0644\u0645\u062E\u0627\u0644\u0641\u062A\u0647 \u0627\u0644\u0634\u0631\u0648\u0637";
    } else if (action === "activate") {
      item.status = "active";
      actionLabel = "\u0625\u0639\u0627\u062F\u0629 \u062A\u0641\u0639\u064A\u0644 \u0648\u0646\u0634\u0631 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u0645\u0648\u0642\u0648\u0641";
    } else if (action === "delete") {
      products.splice(pIdx, 1);
      actionLabel = "\u062D\u0630\u0641 \u0643\u0644\u064A \u0648\u0646\u0647\u0627\u0626\u064A \u0644\u0644\u0645\u0646\u062A\u062C \u0645\u0646 \u0627\u0644\u062E\u0648\u0627\u062F\u0645";
    }
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin?.id || "sys",
      adminEmail: admin?.email || "admin@sou9aljoumla.com",
      adminName: admin?.name || "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
      action: actionLabel,
      ip: getClientIp(req),
      details: `\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0642\u0631\u0627\u0631 \u0627\u0644\u0625\u062F\u0627\u0631\u064A \u0644\u062A\u0639\u062F\u064A\u0644 \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0646\u062A\u062C: ${item?.title || productId}.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/moderation/queue", (req, res) => {
  try {
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0631\u0624\u064A\u0629 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u062F\u0642\u064A\u0642." });
    }
    const { role } = sessionUser;
    if (role !== "admin" && role !== "superadmin" && role !== "moderator") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0631\u0624\u064A\u0629 \u0637\u0627\u0628\u0648\u0631 \u0627\u0644\u062A\u062F\u0642\u064A\u0642." });
    }
    const queue = dbInstance.getModerationQueue();
    const products = dbInstance.getProducts();
    const syncedQueue = queue.map((q) => {
      const p = products.find((prod) => prod.id === q.productId);
      if (p) {
        return {
          ...q,
          productTitle: p.title,
          riskScore: p.riskScore !== void 0 ? p.riskScore : q.riskScore,
          riskReasons: p.riskReasons || q.riskReasons || []
        };
      }
      return q;
    });
    res.json({ success: true, queue: syncedQueue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/products/moderate", (req, res) => {
  try {
    const { productId, productIds, status, rejectionReason } = req.body;
    if (!status) {
      return res.status(400).json({ error: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0631 \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0639\u0645\u0644\u064A\u0629" });
    }
    const allowedStatuses = ["approved", "rejected", "escalated", "changes_requested"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0631 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: "\u062C\u0644\u0633\u0629 \u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
    const { role, userId } = sessionUser;
    if (role !== "admin" && role !== "superadmin" && role !== "moderator") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0631\u062A\u0628\u0629 \u0643\u0627\u0641\u064A\u0629 \u0644\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0623\u0648 \u0627\u0644\u0631\u0641\u0636 \u0627\u0644\u0625\u062F\u0627\u0631\u064A \u0639\u0644\u0649 \u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631" });
    }
    const idsToProcess = Array.isArray(productIds) ? productIds : productId ? [productId] : [];
    if (idsToProcess.length === 0) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0639\u0631\u0641\u0627\u062A \u0644\u0644\u0633\u0644\u0639 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0627\u0644\u0628\u062A \u0641\u064A\u0647\u0627" });
    }
    const products = dbInstance.getProducts();
    const users = dbInstance.getUsers();
    const qItems = dbInstance.getModerationQueue();
    const pEvents = dbInstance.getPublishEvents();
    const adminUser = users.find((u) => u.id === userId);
    const actorName = adminUser?.name || "\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0646\u0635\u0629";
    const actorEmail = adminUser?.email || "";
    const processedProducts = [];
    for (const id of idsToProcess) {
      const prod = products.find((p) => p.id === id);
      if (!prod) continue;
      const seller = users.find((u) => u.id === prod.sellerId);
      if (status === "approved" && prod.publisherEventId && pEvents.includes(prod.publisherEventId)) {
        continue;
      }
      if (status === "approved") {
        prod.status = "approved";
        prod.rejectionReason = void 0;
        prod.moderationStatus = void 0;
        if (prod.publisherEventId) {
          pEvents.push(prod.publisherEventId);
        }
        let msgText = `\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0645\u0646\u062A\u062C\u0643 "${prod.title}" \u0648\u0646\u0634\u0631\u0647 \u0628\u0646\u062C\u0627\u062D \u062F\u0627\u062E\u0644 \u0633\u0648\u0642 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A!`;
        pushNotificationQueue(prod.sellerId, msgText, "success");
        auditLogger.info({
          event: "PRODUCT_APPROVED",
          productId: prod.id,
          productTitle: prod.title,
          moderatorId: userId,
          moderatorName: actorName,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          ip: getClientIp(req)
        });
        dbInstance.getAuditLogs().push({
          id: "aud-" + import_crypto2.default.randomUUID(),
          adminId: userId,
          adminEmail: actorEmail,
          adminName: actorName,
          action: "APPROVE_PRODUCT",
          ip: getClientIp(req),
          details: `\u0645\u0648\u0627\u0641\u0642\u0629 \u0648\u0646\u0634\u0631 \u0644\u0644\u0645\u0646\u062A\u062C "${prod.title}" (ID: ${prod.id}) \u0627\u0644\u0645\u0639\u0631\u0648\u0636 \u0645\u0646 \u0642\u0650\u0628\u0644 \u0627\u0644\u0628\u0627\u0626\u0639: ${prod.sellerName}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else if (status === "rejected") {
        prod.status = "rejected";
        prod.rejectionReason = rejectionReason || "\u0645\u062E\u0627\u0644\u0641 \u0644\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u0623\u062D\u0643\u0627\u0645 \u0627\u0644\u0645\u0639\u0645\u0648\u0644 \u0628\u0647\u0627 \u062F\u0627\u062E\u0644 \u0627\u0644\u0633\u0648\u0642.";
        prod.moderationStatus = "blocked";
        let msgText = `\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u0631\u0641\u0636 \u0645\u0646\u062A\u062C\u0643 "${prod.title}" \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0625\u062F\u0627\u0631\u0629. \u0627\u0644\u0633\u0628\u0628: ${prod.rejectionReason}`;
        pushNotificationQueue(prod.sellerId, msgText, "danger");
        auditLogger.info({
          event: "PRODUCT_REJECTED",
          productId: prod.id,
          productTitle: prod.title,
          moderatorId: userId,
          moderatorName: actorName,
          rejectionReason: prod.rejectionReason,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          ip: getClientIp(req)
        });
        dbInstance.getAuditLogs().push({
          id: "aud-" + import_crypto2.default.randomUUID(),
          adminId: userId,
          adminEmail: actorEmail,
          adminName: actorName,
          action: "REJECT_PRODUCT",
          ip: getClientIp(req),
          details: `\u0631\u0641\u0636 \u0646\u0634\u0631 \u0627\u0644\u0645\u0646\u062A\u062C "${prod.title}" (ID: ${prod.id}) \u0628\u0633\u0628\u0628: "${prod.rejectionReason}"`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else if (status === "escalated") {
        prod.status = "escalated";
        prod.moderationStatus = "escalated";
        let msgText = `\u062A\u0645 \u062A\u0635\u0639\u064A\u062F \u0645\u0646\u062A\u062C\u0643 "${prod.title}" \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0625\u0631\u0634\u0627\u062F\u064A\u0629 \u0645\u0639\u0645\u0642\u0629 \u0645\u0646 \u0642\u0628\u0644 \u0643\u0628\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641\u064A\u0646.`;
        pushNotificationQueue(prod.sellerId, msgText, "info");
        dbInstance.getAuditLogs().push({
          id: "aud-" + import_crypto2.default.randomUUID(),
          adminId: userId,
          adminEmail: actorEmail,
          adminName: actorName,
          action: "ESCALATE_PRODUCT",
          ip: getClientIp(req),
          details: `\u062A\u0635\u0639\u064A\u062F \u0627\u0644\u0645\u0646\u062A\u062C "${prod.title}" (ID: ${prod.id}) \u0644\u0645\u0633\u062A\u0648\u0649 \u0625\u062F\u0627\u0631\u0629 \u0639\u0644\u064A\u0627`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else if (status === "changes_requested") {
        prod.status = "changes_requested";
        prod.moderationStatus = "changes_requested";
        prod.rejectionReason = rejectionReason || "\u0645\u0637\u0644\u0648\u0628 \u062A\u0639\u062F\u064A\u0644 \u0628\u0639\u0636 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C (\u0645\u062B\u0644 \u0627\u0644\u0635\u0648\u0631 \u0623\u0648 \u0627\u0644\u0633\u0639\u0631).";
        let msgText = `\u0645\u0637\u0644\u0648\u0628 \u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0639\u0644\u0649 \u0645\u0646\u062A\u062C\u0643 "${prod.title}". \u0627\u0644\u062A\u0648\u062C\u064A\u0647\u0627\u062A: ${prod.rejectionReason}`;
        pushNotificationQueue(prod.sellerId, msgText, "info");
        dbInstance.getAuditLogs().push({
          id: "aud-" + import_crypto2.default.randomUUID(),
          adminId: userId,
          adminEmail: actorEmail,
          adminName: actorName,
          action: "REQUEST_CHANGES_PRODUCT",
          ip: getClientIp(req),
          details: `\u0637\u0644\u0628 \u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062A\u062C "${prod.title}" (ID: ${prod.id})\u060C \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: "${prod.rejectionReason}"`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const qItem = qItems.find((item) => item.productId === id);
      if (qItem) {
        qItem.status = status === "approved" ? "approved" : status === "rejected" ? "blocked" : status;
        qItem.processedAt = (/* @__PURE__ */ new Date()).toISOString();
      }
      processedProducts.push(prod);
    }
    dbInstance.persist();
    res.json({ success: true, count: processedProducts.length, products: processedProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/coupons", (req, res) => {
  res.json(dbInstance.getCoupons());
});
app.post("/api/admin/coupons/create", (req, res) => {
  try {
    const { code, type, value, minPurchase, maxDiscount, expiryDate, usageLimit, adminId } = req.body;
    if (!code || !type || !value || !expiryDate || !usageLimit) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B \u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0646\u0627\u0642\u0635\u0629 \u0644\u0625\u0646\u0634\u0627\u0621 \u0643\u0648\u0628\u0648\u0646" });
    }
    const coupons = dbInstance.getCoupons();
    if (coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase())) {
      return res.status(400).json({ error: "\u0631\u0645\u0632 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0647\u0630\u0627 \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0641\u0639\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629" });
    }
    const newCoupon = {
      id: "cpn-" + Math.random().toString(36).substr(2, 9),
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minPurchase: minPurchase ? Number(minPurchase) : void 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : void 0,
      expiryDate,
      usageLimit: Number(usageLimit),
      usageCount: 0,
      status: "active"
    };
    coupons.push(newCoupon);
    const admin = dbInstance.getUsers().find((u) => u.id === adminId);
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin?.id || "sys",
      adminEmail: admin?.email || "admin@sou9aljoumla.com",
      adminName: admin?.name || "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
      action: "\u0625\u0646\u0634\u0627\u0621 \u0643\u0648\u062F \u0642\u0633\u064A\u0645\u0629 \u062A\u062E\u0641\u064A\u0636 \u062C\u062F\u064A\u062F\u0629",
      ip: getClientIp(req),
      details: `\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0627\u0644\u062C\u062F\u064A\u062F: ${newCoupon.code} \u0628\u0642\u064A\u0645\u0629 \u062E\u0635\u0645 \u0628\u0644\u063A\u062A ${newCoupon.value} (${newCoupon.type}).`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/recharge-codes", (req, res) => {
  res.json(dbInstance.getRechargeCodes());
});
app.post("/api/admin/recharge-codes/generate", (req, res) => {
  try {
    const { points, expiryDate, count, adminId } = req.body;
    if (!points || !expiryDate || !count) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u063A\u064A\u0631 \u0643\u0627\u0641\u064A\u0629 \u0644\u0625\u0646\u0634\u0627\u0621 \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u0634\u062D\u0646 \u0645\u0633\u0628\u0642\u0629 \u0627\u0644\u062F\u0641\u0639" });
    }
    const codes = dbInstance.getRechargeCodes();
    const createdList = [];
    for (let j = 0; j < Number(count); j++) {
      const codeStr = "SOU9-" + Math.floor(1e3 + Math.random() * 9e3) + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      const codeObj = {
        id: "rc-" + Math.random().toString(36).substr(2, 9),
        code: codeStr,
        points: Number(points),
        expiryDate,
        status: "active"
      };
      codes.push(codeObj);
      createdList.push(codeObj);
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId);
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin?.id || "sys",
      adminEmail: admin?.email || "admin@sou9aljoumla.com",
      adminName: admin?.name || "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
      action: "\u062A\u0648\u0644\u064A\u062F \u062D\u0632\u0645\u0629 \u0645\u0646 \u0628\u0637\u0627\u0642\u0627\u062A \u0623\u0643\u0648\u0627\u062F \u0634\u062D\u0646 \u0627\u0644\u0645\u062D\u0641\u0638\u0629",
      ip: getClientIp(req),
      details: `\u062A\u0645 \u062A\u0648\u0644\u064A\u062F \u0639\u062F\u062F ${count} \u0628\u0637\u0627\u0642\u0629 \u0643\u0648\u062F \u0634\u062D\u0646 \u062C\u062F\u064A\u062F\u0629 \u0628\u0642\u064A\u0645\u0629 ${points} \u0646\u0642\u0637\u0629 \u0644\u0643\u0644 \u0628\u0637\u0627\u0642\u0629.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, codes: createdList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/audit-logs", (req, res) => {
  const { adminId } = req.query;
  const users = dbInstance.getUsers();
  const caller = typeof adminId === "string" ? users.find((u) => u.id === adminId) : null;
  let logs = dbInstance.getAuditLogs();
  if (!caller || caller.role !== "superadmin") {
    logs = logs.filter((log) => log.adminId !== "u-admin" && log.adminEmail !== "admin@sou9aljoumla.com");
  }
  res.json(logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});
app.get("/api/admin/reports", (req, res) => {
  const { adminId } = req.query;
  const users = dbInstance.getUsers();
  const caller = typeof adminId === "string" ? users.find((u) => u.id === adminId) : null;
  let reps = dbInstance.getReports();
  if (!caller || caller.role !== "superadmin") {
    reps = reps.filter((r) => r.reporterId !== "u-admin" && r.targetId !== "u-admin");
  }
  res.json(reps);
});
app.post("/api/admin/reports/resolve", (req, res) => {
  try {
    const { reportId, status, adminId } = req.body;
    const reps = dbInstance.getReports();
    const rIdx = reps.findIndex((r) => r.id === reportId);
    if (rIdx !== -1) {
      reps[rIdx].status = status;
      dbInstance.persist();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/settings", (req, res) => {
  try {
    const settings = dbInstance.getSettings();
    res.json({
      publishingCost: settings.publishingCost !== void 0 ? Number(settings.publishingCost) : 20,
      paidPublishingEnabled: settings.paidPublishingEnabled !== void 0 ? !!settings.paidPublishingEnabled : true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/settings", (req, res) => {
  try {
    const { publishingCost, paidPublishingEnabled, adminId } = req.body;
    const settings = dbInstance.getSettings();
    if (publishingCost !== void 0) {
      settings.publishingCost = Number(publishingCost);
    }
    if (paidPublishingEnabled !== void 0) {
      settings.paidPublishingEnabled = !!paidPublishingEnabled;
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId);
    dbInstance.getAuditLogs().push({
      id: "l-" + Math.random().toString(36).substr(2, 9),
      adminId: adminId || "u-admin",
      adminEmail: admin ? admin.email : "admin@sou9aljoumla.com",
      adminName: admin ? admin.name : "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
      action: "\u062A\u0639\u062F\u064A\u0644 \u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0646\u0634\u0631 \u0648\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u062F\u0641\u0639",
      ip: req.ip || "127.0.0.1",
      details: `\u062A\u0645 \u062A\u0639\u062F\u064A\u0644 \u0631\u0633\u0648\u0645 \u0646\u0634\u0631 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0625\u0644\u0649 ${settings.publishingCost} \u0646\u0642\u0637\u0629\u060C \u0648\u062D\u0627\u0644\u0629 \u0627\u0644\u0646\u0634\u0631 \u0627\u0644\u0645\u062F\u0641\u0648\u0639 \u0628\u0627\u0644\u0646\u0642\u0627\u0637: ${settings.paidPublishingEnabled ? "\u0645\u0641\u0639\u0651\u0644" : "\u0645\u0639\u0637\u0651\u0644"}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/coupons/delete", (req, res) => {
  try {
    const { couponId, adminId } = req.body;
    if (!couponId || !adminId) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0645\u062E\u0635\u0635 \u0644\u0644\u0645\u062F\u064A\u0631\u064A\u0646 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0646 \u0627\u0644\u0639\u0627\u0645\u064A\u0646 \u0641\u0642\u0637." });
    }
    const coupons = dbInstance.getCoupons();
    const idx = coupons.findIndex((c) => c.id === couponId);
    if (idx === -1) {
      return res.status(404).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0623\u0648 \u0642\u0633\u064A\u0645\u0629 \u0627\u0644\u062E\u0635\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    const targetCode = coupons[idx].code;
    coupons.splice(idx, 1);
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u062D\u0630\u0641 \u0643\u0648\u0628\u0648\u0646 / \u0642\u0633\u064A\u0645\u0629 \u062E\u0635\u0645",
      ip: req.ip || "127.0.0.1",
      details: `\u062D\u0630\u0641 \u0643\u0648\u0628\u0648\u0646: \u0645\u0639\u0631\u0641 \u0627\u0644\u0643\u0648\u0628\u0648\u0646: ${couponId} | \u0627\u0633\u0645 \u0627\u0644\u0643\u0648\u0628\u0648\u0646: ${targetCode} | \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0630\u064A \u0642\u0627\u0645 \u0628\u0627\u0644\u062D\u0630\u0641: ${admin.name} (${admin.id}) | \u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0627\u0644\u062D\u0630\u0641: ${(/* @__PURE__ */ new Date()).toISOString()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, message: "\u062A\u0645 \u0627\u0644\u062D\u0630\u0641 \u0628\u0646\u062C\u0627\u062D" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/recharge-codes/delete", (req, res) => {
  try {
    const { codeId, adminId } = req.body;
    if (!codeId || !adminId) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0645\u062E\u0635\u0635 \u0644\u0644\u0645\u062F\u064A\u0631\u064A\u0646 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0646 \u0627\u0644\u0639\u0627\u0645\u064A\u0646 \u0641\u0642\u0637." });
    }
    const rechargeCodes = dbInstance.getRechargeCodes();
    const idx = rechargeCodes.findIndex((c) => c.id === codeId);
    if (idx === -1) {
      return res.status(404).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0628\u0637\u0627\u0642\u0629 \u0623\u0648 \u0643\u0648\u062F \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628" });
    }
    const targetCode = rechargeCodes[idx].code;
    const targetPoints = rechargeCodes[idx].points;
    rechargeCodes.splice(idx, 1);
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u062D\u0630\u0641 \u0643\u0648\u062F \u0634\u062D\u0646",
      ip: getClientIp(req),
      details: `\u062D\u0630\u0641 \u0643\u0648\u062F \u0634\u062D\u0646: \u0645\u0639\u0631\u0641 \u0627\u0644\u0643\u0648\u062F: ${codeId} | \u0642\u064A\u0645\u0629 \u0627\u0644\u0643\u0648\u062F (\u0627\u0644\u0646\u0642\u0627\u0637): ${targetPoints} | \u0627\u0633\u0645 \u0627\u0644\u0643\u0648\u062F: ${targetCode} | \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0630\u064A \u0642\u0627\u0645 \u0628\u0627\u0644\u062D\u0630\u0641: ${admin.name} (${admin.id}) | \u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0627\u0644\u062D\u0630\u0641: ${(/* @__PURE__ */ new Date()).toISOString()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0643\u0648\u062F \u0627\u0644\u0634\u062D\u0646 \u0628\u0646\u062C\u0627\u062D" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/roles/change", (req, res) => {
  try {
    const { userId, newRole, adminId, password, otpCode } = req.body;
    if (!userId || !newRole || !adminId) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u063A\u064A\u0631 \u0643\u0627\u0645\u0644\u0629 \u0644\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A" });
    }
    const users = dbInstance.getUsers();
    const admin = users.find((u) => u.id === adminId);
    if (!admin || admin.role !== "superadmin" && admin.role !== "admin") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0645\u062E\u0635\u0635 \u0644\u0644\u0645\u062F\u064A\u0631 \u0648\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0641\u0642\u0637!" });
    }
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u062D\u0627\u0644\u064A\u0627\u064B \u0644\u062A\u0639\u062F\u064A\u0644 \u0631\u062A\u0628\u062A\u0647" });
    }
    const targetIsGM = targetUser.role === "superadmin" || targetUser.id === "u-admin";
    const isGMAdmin = admin.role === "superadmin" || admin.id === "u-admin";
    if (targetIsGM && !isGMAdmin) {
      return res.status(404).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0644\u0645\u0648\u0631\u062F \u0623\u0648 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0628\u0627\u0644\u0645\u0646\u0635\u0629." });
    }
    if (isGMAdmin) {
      if (!password) {
        return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u0625\u0634\u0631\u0627\u0641\u064A\u0629 (Re-authentication)." });
      }
      const passwords = dbInstance.getPasswords();
      if (!comparePassword(admin.id, password, passwords[admin.id])) {
        return res.status(400).json({ error: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u0645\u062F\u062E\u0644\u0629 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0647\u0648\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629." });
      }
      if (!otpCode) {
        return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u0631\u0633\u0627\u0644 \u0648\u0625\u062F\u062E\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 (OTP) \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u064A." });
      }
      const savedOtp = securityOtps.get(adminId);
      if (!savedOtp) {
        return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0628\u0639\u062F \u062A\u0648\u0644\u064A\u062F\u0647 \u0623\u0648\u0644\u0627\u064B." });
      }
      if (Date.now() > savedOtp.expiresAt) {
        return res.status(400).json({ error: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0643\u0648\u062F \u0627\u0644\u0640 OTP\u060C \u064A\u0631\u062C\u0649 \u0637\u0644\u0628 \u0643\u0648\u062F \u062C\u062F\u064A\u062F." });
      }
      if (savedOtp.code !== otpCode.trim()) {
        return res.status(400).json({ error: "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 (OTP) \u0627\u0644\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D." });
      }
      securityOtps.delete(adminId);
    }
    const getRoleRank = (r) => {
      if (r === "superadmin") return 4;
      if (r === "admin") return 3;
      if (r === "moderator") return 2;
      return 1;
    };
    const adminPower = getRoleRank(admin.role);
    const targetPower = getRoleRank(targetUser.role);
    const newRolePower = getRoleRank(newRole);
    if (targetPower >= adminPower && targetUser.id !== admin.id) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u064F\u0645\u0646\u0639 \u062A\u0634\u063A\u064A\u0644\u064A\u0627\u064B \u0623\u0648 \u0646\u0638\u0627\u0645\u064A\u0627\u064B \u062A\u0639\u062F\u064A\u0644 \u0631\u062A\u0628\u0629 \u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u0645\u0644\u0643 \u0646\u0641\u0633 \u0631\u062A\u0628\u062A\u0643 \u0623\u0648 \u0631\u062A\u0628\u0629 \u0623\u0639\u0644\u0649 \u0645\u0646\u0643!" });
    }
    if (newRolePower >= adminPower && targetUser.id !== admin.id) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0644\u062A\u0631\u0641\u064A\u0639 \u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0631\u062A\u0628\u0629 \u062A\u0639\u0627\u062F\u0644 \u0631\u062A\u0628\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0623\u0648 \u062A\u0641\u0648\u0642\u0643!" });
    }
    const oldRole = targetUser.role;
    targetUser.role = newRole;
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u0631 \u0648\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A",
      ip: req.ip || "127.0.0.1",
      details: `\u0642\u0627\u0645 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0628\u062A\u063A\u064A\u064A\u0631 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${targetUser.name} (${targetUser.email}) \u0645\u0646 \u0631\u062A\u0628\u0629 [${oldRole}] \u0625\u0644\u0649 [${newRole}] \u0628\u0646\u062C\u0627\u062D \u062A\u0627\u0645.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, user: targetUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/users/create", (req, res) => {
  try {
    const { name, email, phone, whatsapp, city, password, role, adminId } = req.body;
    if (!name || !email || !phone || !password || !role || !adminId) {
      return res.status(400).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u0631\u062C\u0649 \u0645\u0644\u0621 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 (\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644\u060C \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u060C \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641\u060C \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u060C \u0627\u0644\u062F\u0648\u0631\u060C \u0648\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644)" });
    }
    const users = dbInstance.getUsers();
    const admin = users.find((u) => u.id === adminId);
    if (!admin || admin.role !== "superadmin" && admin.role !== "admin") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0645\u062E\u0635\u0635 \u0644\u0644\u0645\u062F\u064A\u0631 \u0648\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0641\u0642\u0637!" });
    }
    if (admin.role === "admin" && role === "superadmin") {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0644\u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0631\u062A\u0628\u0629 \u0645\u062F\u064A\u0631 \u0639\u0627\u0645 (Super Admin)!" });
    }
    const nameErr = validateFullName(name);
    if (nameErr) return res.status(400).json({ error: nameErr });
    const phoneErr = validatePhoneNumber(phone);
    if (phoneErr) return res.status(400).json({ error: phoneErr });
    const emailErr = validateEmailAddress(email);
    if (emailErr) return res.status(400).json({ error: emailErr });
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u0628\u0642\u0627\u064B" });
    }
    if (users.find((u) => (u.phone || "").trim() === phone.trim())) {
      return res.status(400).json({ error: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u0628\u0642\u0627\u064B" });
    }
    const userId = "u-" + Math.random().toString(36).substr(2, 9);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let referralCode = "";
    for (let i = 0; i < 9; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const companyName = role === "seller" ? `${name} \u0644\u0644\u062C\u0645\u0644\u0629` : void 0;
    const companyLogo = role === "seller" ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200" : void 0;
    const companyBanner = role === "seller" ? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200" : void 0;
    const companyDesc = role === "seller" ? "\u0628\u0627\u0626\u0639 \u062C\u0645\u0644\u0629 \u0648\u0645\u0648\u0631\u062F \u0645\u0648\u062B\u0648\u0642 \u0644\u062A\u0642\u062F\u064A\u0645 \u0623\u062C\u0648\u062F \u0627\u0644\u0633\u0644\u0639 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0628\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631." : void 0;
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      role,
      phone,
      whatsapp: whatsapp || phone,
      city: city || "\u0627\u0644\u0631\u0628\u0627\u0637",
      points: 200,
      referralCode,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isVerified: true,
      status: "active",
      companyName,
      companyLogo,
      companyBanner,
      companyDesc,
      badges: role === "seller" ? ["New Seller"] : []
    };
    users.push(newUser);
    dbInstance.getPasswords()[userId] = hashPassword(password);
    dbInstance.getPasswordChanged()[userId] = true;
    dbInstance.getWalletTransactions().push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId,
      type: "credit",
      amount: 0,
      points: 200,
      description: "\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0644\u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062C\u062F\u064A\u062F (\u062A\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629)",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "completed"
    });
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u062F\u064A\u062F",
      ip: req.ip || "127.0.0.1",
      details: `\u0642\u0627\u0645 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 ${admin.name} \u0628\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u062F\u064A\u062F \u0628\u0627\u0633\u0645 ${name} \u0648\u0628\u0628\u0631\u064A\u062F \u0627\u0644\u0643\u062A\u0631\u0648\u0646\u064A ${email} \u0648\u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u062F\u0648\u0631: [${role}] \u0628\u0646\u062C\u0627\u062D \u062A\u0627\u0645 \u0648\u062A\u0641\u0639\u064A\u0644\u0647 \u0641\u0648\u0631\u0627\u064B.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/packages", (req, res) => {
  try {
    const settings = dbInstance.getSettings();
    const defaultPackages = [
      { id: "p_starter", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0631\u0648\u0646\u0632\u064A\u0629", points: 60, priceUsd: 5 },
      { id: "p_basic", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0641\u0636\u064A\u0629", points: 230, priceUsd: 10 },
      { id: "p_pro", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 (\u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627)", points: 470, priceUsd: 20 },
      { id: "p_premium", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0644\u0627\u062A\u064A\u0646\u064A\u0629", points: 1200, priceUsd: 50 }
    ];
    const packages = settings.packages || defaultPackages;
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/packages", (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0634\u062D\u0646." });
    }
    const settings = dbInstance.getSettings();
    const defaultPackages = [
      { id: "p_starter", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0631\u0648\u0646\u0632\u064A\u0629", points: 60, priceUsd: 5 },
      { id: "p_basic", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0641\u0636\u064A\u0629", points: 230, priceUsd: 10 },
      { id: "p_pro", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 (\u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627)", points: 470, priceUsd: 20 },
      { id: "p_premium", name: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0644\u0627\u062A\u064A\u0646\u064A\u0629", points: 1200, priceUsd: 50 }
    ];
    const packages = settings.packages || defaultPackages;
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/packages", (req, res) => {
  try {
    const { adminId, packages } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u0639\u062F\u064A\u0644 \u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0634\u062D\u0646." });
    }
    if (!packages || !Array.isArray(packages)) {
      return res.status(400).json({ error: "\u062A\u0646\u0633\u064A\u0642 \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" });
    }
    const settings = dbInstance.getSettings();
    settings.packages = packages;
    dbInstance.persist();
    dbInstance.getAuditLogs().push({
      id: "audit-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u062A\u0639\u062F\u064A\u0644 \u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062A\u0628\u062F\u064A\u0644",
      ip: req.ip || "127.0.0.1",
      details: `\u0642\u0627\u0645 \u0627\u0644\u0645\u062F\u064A\u0631 \u0628\u062A\u062D\u062F\u064A\u062B \u0623\u0633\u0639\u0627\u0631 \u0648\u0643\u0645\u064A\u0627\u062A \u0628\u0627\u0642\u0627\u062A \u0634\u062D\u0646 \u0627\u0644\u0646\u0642\u0627\u0637 \u0628\u0627\u0644\u0643\u0627\u0645\u0644. \u0639\u062F\u062F \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629: ${packages.length}.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/payment-settings", (req, res) => {
  try {
    const settings = dbInstance.getSettings();
    res.json({
      paypalEnabled: settings.paypalEnabled !== void 0 ? !!settings.paypalEnabled : true,
      cardEnabled: settings.cardEnabled !== void 0 ? !!settings.cardEnabled : true,
      cashEnabled: settings.cashEnabled !== void 0 ? !!settings.cashEnabled : true,
      cashAgencyName: settings.cashAgencyName || "\u0648\u0643\u0627\u0644\u0627\u062A \u0643\u0627\u0634 \u0628\u0644\u0648\u0633 \u0648\u0648\u0641\u0627\u0643\u0627\u0634 \u0627\u0644\u0645\u063A\u0631\u0628",
      cashContact: settings.cashContact || "+212522778899",
      cashInstructions: settings.cashInstructions || "\u062A\u0641\u0636\u0644 \u0628\u0632\u064A\u0627\u0631\u0629 \u0623\u0642\u0631\u0628 \u0648\u0643\u0627\u0644\u0629 \u0643\u0627\u0634 \u0628\u0644\u0648\u0633 \u0623\u0648 \u0648\u0641\u0627\u0643\u0627\u0634\u060C \u0648\u0642\u0645 \u0628\u062A\u0642\u062F\u064A\u0645 \u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062C\u0639\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u062D\u062C\u0632 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/payment-settings", (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639." });
    }
    const settings = dbInstance.getSettings();
    res.json({
      paypalEnabled: settings.paypalEnabled !== void 0 ? !!settings.paypalEnabled : true,
      paypalClientId: settings.paypalClientId || process.env.PAYPAL_CLIENT_ID || "sb",
      paypalClientSecret: settings.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET || "",
      paypalMode: settings.paypalMode || process.env.PAYPAL_MODE || "sandbox",
      cardEnabled: settings.cardEnabled !== void 0 ? !!settings.cardEnabled : true,
      cardPublicKey: settings.cardPublicKey || "",
      cardSecretKey: settings.cardSecretKey || "",
      cardWebhookSecret: settings.cardWebhookSecret || "",
      cashEnabled: settings.cashEnabled !== void 0 ? !!settings.cashEnabled : true,
      cashAgencyName: settings.cashAgencyName || "\u0648\u0643\u0627\u0644\u0627\u062A \u0643\u0627\u0634 \u0628\u0644\u0648\u0633 \u0648\u0648\u0641\u0627\u0643\u0627\u0634 \u0627\u0644\u0645\u063A\u0631\u0628",
      cashContact: settings.cashContact || "+212522778899",
      cashInstructions: settings.cashInstructions || "\u062A\u0641\u0636\u0644 \u0628\u0632\u064A\u0627\u0631\u0629 \u0623\u0642\u0631\u0628 \u0648\u0643\u0627\u0644\u0629 \u0643\u0627\u0634 \u0628\u0644\u0648\u0633 \u0623\u0648 \u0648\u0641\u0627\u0643\u0627\u0634\u060C \u0648\u0642\u0645 \u0628\u062A\u0642\u062F\u064A\u0645 \u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062C\u0639\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u062D\u062C\u0632 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/payment-settings", (req, res) => {
  try {
    const {
      adminId,
      paypalEnabled,
      paypalClientId,
      paypalClientSecret,
      paypalMode,
      cardEnabled,
      cardPublicKey,
      cardSecretKey,
      cardWebhookSecret,
      cashEnabled,
      cashAgencyName,
      cashContact,
      cashInstructions
    } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639." });
    }
    const settings = dbInstance.getSettings();
    if (paypalEnabled !== void 0) settings.paypalEnabled = !!paypalEnabled;
    if (paypalClientId !== void 0) settings.paypalClientId = paypalClientId;
    if (paypalClientSecret !== void 0) settings.paypalClientSecret = paypalClientSecret;
    if (paypalMode !== void 0) settings.paypalMode = paypalMode;
    if (cardEnabled !== void 0) settings.cardEnabled = !!cardEnabled;
    if (cardPublicKey !== void 0) settings.cardPublicKey = cardPublicKey;
    if (cardSecretKey !== void 0) settings.cardSecretKey = cardSecretKey;
    if (cardWebhookSecret !== void 0) settings.cardWebhookSecret = cardWebhookSecret;
    if (cashEnabled !== void 0) settings.cashEnabled = !!cashEnabled;
    if (cashAgencyName !== void 0) settings.cashAgencyName = cashAgencyName;
    if (cashContact !== void 0) settings.cashContact = cashContact;
    if (cashInstructions !== void 0) settings.cashInstructions = cashInstructions;
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639",
      ip: req.ip || "127.0.0.1",
      details: `\u0642\u0627\u0645 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 ${admin.name} \u0628\u062A\u0639\u062F\u064A\u0644 \u0648\u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639 (\u062A\u0641\u0639\u064A\u0644/\u062A\u0639\u0637\u064A\u0644 \u0623\u0648 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0639\u0631\u0641\u0627\u062A \u0648\u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u0633\u0631\u064A\u0629) \u0628\u0646\u062C\u0627\u062D.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/cloudflare-settings", (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0634\u0631 \u0627\u0644\u0633\u062D\u0627\u0628\u064A (Cloudflare)." });
    }
    const settings = dbInstance.getSettings();
    const rawToken = settings.cfApiToken || "";
    const decryptedToken = decrypt(rawToken);
    res.json({
      cfApiToken: decryptedToken,
      cfAccountId: settings.cfAccountId || "",
      cfZoneId: settings.cfZoneId || "",
      cfDomainName: settings.cfDomainName || ""
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/cloudflare-settings", (req, res) => {
  try {
    const { adminId, cfApiToken, cfAccountId, cfZoneId, cfDomainName } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0634\u0631 \u0627\u0644\u0633\u062D\u0627\u0628\u064A." });
    }
    const settings = dbInstance.getSettings();
    settings.cfApiToken = encrypt(cfApiToken || "");
    settings.cfAccountId = cfAccountId || "";
    settings.cfZoneId = cfZoneId || "";
    settings.cfDomainName = cfDomainName || "";
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u062A\u0639\u062F\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0634\u0631 \u0627\u0644\u0633\u062D\u0627\u0628\u064A (Cloudflare Settings)",
      ip: getClientIp(req),
      details: `\u062A\u0645 \u062A\u0639\u062F\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A Cloudflare: \u0627\u0644\u0646\u0637\u0627\u0642 ${cfDomainName}\u060C \u0645\u0639\u0631\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 ${cfAccountId}\u060C \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 ${cfZoneId} \u0628\u0646\u062C\u0627\u062D \u0645\u0646 \u0637\u0631\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 ${admin.name}.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/cloudflare-test-connection", async (req, res) => {
  try {
    const { adminId, cfApiToken, cfAccountId, cfZoneId, cfDomainName } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u062C\u0631\u0628\u0629 \u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u0631\u0628\u0637." });
    }
    if (!cfApiToken || !cfZoneId) {
      return res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0631\u0645\u0632 API Token \u0648 Zone ID \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629" });
    }
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cfApiToken}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      let cfErrorMsg = "\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0640 Cloudflare.";
      if (data.errors && data.errors.length > 0) {
        cfErrorMsg = `\u062E\u0637\u0623 \u0645\u0646 Cloudflare: ${data.errors[0].message} (\u0643\u0648\u062F: ${data.errors[0].code})`;
      }
      return res.json({ success: false, message: cfErrorMsg });
    }
    const zoneName = data.result?.name;
    const zoneAccountId = data.result?.account?.id;
    if (cfDomainName && zoneName && zoneName.toLowerCase() !== cfDomainName.toLowerCase()) {
      return res.json({
        success: false,
        message: `\u062A\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0646\u062C\u0627\u062D \u0628\u0627\u0644\u0645\u0646\u0637\u0642\u0629\u060C \u0648\u0644\u0643\u0646 \u0627\u0633\u0645 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0633\u062C\u0644 \u0641\u064A Cloudflare \u0648\u0647\u0648 (${zoneName}) \u0644\u0627 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0630\u064A \u0623\u062F\u062E\u0644\u062A\u0647 (${cfDomainName}).`
      });
    }
    if (cfAccountId && zoneAccountId && zoneAccountId !== cfAccountId) {
      return res.json({
        success: false,
        message: `\u062A\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0648\u0644\u0643\u0646 \u0645\u0639\u0631\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0631\u062A\u0628\u0637 \u0628\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0641\u064A Cloudflare \u0648\u0647\u0648 (${zoneAccountId}) \u0644\u0627 \u064A\u0637\u0627\u0628\u0642 \u0645\u0639\u0631\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0630\u064A \u0623\u062F\u062E\u0644\u062A\u0647 (${cfAccountId}).`
      });
    }
    return res.json({
      success: true,
      message: `\u062A\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0640 Cloudflare \u0628\u0646\u062C\u0627\u062D! \u0627\u0644\u0646\u0637\u0627\u0642 (${zoneName}) \u0646\u0634\u0637 \u0648\u0645\u0639\u0631\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0637\u0627\u0628\u0650\u0642.`
    });
  } catch (error) {
    res.json({ success: false, message: `\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0633\u0628\u0628 \u062E\u0637\u0623 \u0628\u0627\u0644\u062E\u0627\u062F\u0645: ${error.message}` });
  }
});
var googleIntegrationCache = null;
app.get("/api/google-integration", (req, res) => {
  try {
    if (googleIntegrationCache) {
      return res.json(googleIntegrationCache);
    }
    const settings = dbInstance.getSettings();
    const googleIntegration = settings.google_integration || {
      verification_code: "",
      ga_id: "",
      gtm_id: "",
      merchant_id: ""
    };
    googleIntegrationCache = googleIntegration;
    res.json(googleIntegrationCache);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/google-integration", (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u062E\u062F\u0645\u0627\u062A Google." });
    }
    const settings = dbInstance.getSettings();
    const googleIntegration = settings.google_integration || {
      verification_code: "",
      ga_id: "",
      gtm_id: "",
      merchant_id: ""
    };
    res.json(googleIntegration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/google-integration", (req, res) => {
  try {
    const { adminId, verification_code, ga_id, gtm_id, merchant_id } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u062E\u062F\u0645\u0627\u062A Google." });
    }
    const settings = dbInstance.getSettings();
    const googleIntegration = {
      verification_code: (verification_code || "").trim(),
      ga_id: (ga_id || "").trim(),
      gtm_id: (gtm_id || "").trim(),
      merchant_id: (merchant_id || "").trim()
    };
    settings.google_integration = googleIntegration;
    googleIntegrationCache = googleIntegration;
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u062A\u0639\u062F\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u062E\u062F\u0645\u0627\u062A Google Integration",
      ip: getClientIp(req),
      details: `\u062A\u0645 \u062A\u0639\u062F\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u062E\u062F\u0645\u0627\u062A Google: \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 (${googleIntegration.verification_code ? "\u0646\u0639\u0645" : "\u0644\u0627"}) | \u0645\u0639\u0631\u0641 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A (${googleIntegration.ga_id || "\u0641\u0627\u0631\u063A"}) | \u0645\u062F\u064A\u0631 \u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u062A\u062A\u0628\u0639 (${googleIntegration.gtm_id || "\u0641\u0627\u0631\u063A"}) | \u0645\u0639\u0631\u0641 Merchant Center (${googleIntegration.merchant_id || "\u0641\u0627\u0631\u063A"}) \u0645\u0646 \u0637\u0631\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 ${admin.name}.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/branding", (req, res) => {
  try {
    const settings = dbInstance.getSettings();
    res.json({
      logoUrl: settings.logoUrl || "",
      faviconUrl: settings.faviconUrl || "",
      logoHasText: !!settings.logoHasText
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/branding", (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0648\u0642\u0639." });
    }
    const settings = dbInstance.getSettings();
    res.json({
      logoUrl: settings.logoUrl || "",
      faviconUrl: settings.faviconUrl || "",
      logoHasText: !!settings.logoHasText
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/branding", (req, res) => {
  try {
    const { adminId, logoUrl, faviconUrl, logoHasText } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062A\u0631\u0648\u064A\u062C." });
    }
    const settings = dbInstance.getSettings();
    settings.logoUrl = logoUrl;
    settings.faviconUrl = faviconUrl;
    settings.logoHasText = !!logoHasText;
    dbInstance.getAuditLogs().push({
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: "\u062A\u0639\u062F\u064A\u0644 \u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0634\u0639\u0627\u0631 \u0648\u0627\u0644\u0640 Favicon",
      ip: getClientIp(req),
      details: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0640 Favicon \u0627\u0644\u062E\u0627\u0635 \u0628\u0627\u0644\u0645\u0646\u0635\u0629 \u0645\u0646 \u0637\u0631\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 ${admin.name}. \u0627\u0644\u0634\u0639\u0627\u0631 \u064A\u062A\u0636\u0645\u0646 \u0627\u0644\u0627\u0633\u0645: ${logoHasText ? "\u0646\u0639\u0645 (\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0646\u0635 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A)" : "\u0644\u0627 (\u062F\u0645\u062C \u0645\u0639 \u0627\u0644\u0646\u0645\u0637 \u0627\u0644\u062D\u0627\u0644\u064A)"}.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    dbInstance.persist();
    res.json({ success: true, logoUrl, faviconUrl, logoHasText: !!logoHasText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/contact/submit", (req, res) => {
  try {
    const { name, email, phone, title, text, userId, attachments } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B \u0644\u062A\u062A\u0645\u0643\u0646 \u0645\u0646 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0626\u0644 \u0623\u0648 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062F\u0639\u0645." });
    }
    const userObj = dbInstance.getUsers().find((u) => u.id === userId);
    if (!userObj) {
      return res.status(401).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0633\u0627\u0628 \u0635\u062D\u064A\u062D \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621." });
    }
    if (!name || !email || !text) {
      return res.status(400).json({ error: "\u0627\u0644\u0627\u0633\u0645\u060C \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u060C \u0648\u0646\u0635 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629." });
    }
    const threads = dbInstance.getContactThreads();
    const cleanEmail = email.trim().toLowerCase();
    let thread = threads.find((t) => t.email.trim().toLowerCase() === cleanEmail && !t.isTrash);
    const newMessage = {
      id: "cm-" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      senderId: userId || void 0,
      senderName: name.trim(),
      senderEmail: cleanEmail,
      text: text.trim(),
      attachments: attachments && Array.isArray(attachments) ? attachments : [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (thread) {
      thread.messages.push(newMessage);
      thread.snippet = text.slice(0, 100);
      thread.status = "unread";
      thread.userStatus = "read";
      thread.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (userId && !thread.userId) thread.userId = userId;
      if (phone) thread.phone = phone.trim();
    } else {
      const threadId = "ct-" + Math.random().toString(36).substr(2, 9);
      thread = {
        id: threadId,
        userId: userId || void 0,
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : void 0,
        title: (title || "\u0631\u0633\u0627\u0644\u0629 \u0627\u062A\u0635\u0627\u0644 \u062C\u062F\u064A\u062F\u0629").trim(),
        snippet: text.slice(0, 100),
        status: "unread",
        userStatus: "read",
        type: "normal",
        isImportant: false,
        isArchived: false,
        isTrash: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [newMessage]
      };
      threads.push(thread);
    }
    dbInstance.persist();
    res.json({ success: true, threadId: thread.id, messageId: newMessage.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/contact/my-threads", (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628." });
    }
    const threads = dbInstance.getContactThreads().filter((t) => t.userId === userId && !t.isTrash);
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/contact/user-reply", (req, res) => {
  try {
    const { userId, threadId, text, attachments } = req.body;
    if (!userId || !threadId || !text) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u060C \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u0627\u0644\u0646\u0635 \u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629." });
    }
    const user = dbInstance.getUsers().find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0628\u0627\u0644\u0645\u0646\u0635\u0629." });
    }
    const threads = dbInstance.getContactThreads();
    const thread = threads.find((t) => t.id === threadId && t.userId === userId);
    if (!thread) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631\u0629." });
    }
    const newMessage = {
      id: "cm-" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      senderId: userId,
      senderName: user.name,
      senderEmail: user.email,
      text: text.trim(),
      attachments: attachments && Array.isArray(attachments) ? attachments : [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    thread.messages.push(newMessage);
    thread.snippet = text.slice(0, 100);
    thread.status = "unread";
    thread.userStatus = "read";
    thread.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    dbInstance.persist();
    res.json({ success: true, thread, message: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/contact/user-mark-read", (req, res) => {
  try {
    const { userId, threadId } = req.body;
    if (!userId || !threadId) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0646\u0627\u0642\u0635\u0629." });
    }
    const threads = dbInstance.getContactThreads();
    const thread = threads.find((t) => t.id === threadId && t.userId === userId);
    if (thread) {
      thread.userStatus = "read";
      thread.userReadAt = (/* @__PURE__ */ new Date()).toISOString();
      dbInstance.persist();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/contact/start-thread", (req, res) => {
  try {
    const { adminId, userIds, title, text, type, attachments } = req.body;
    if (!adminId || !userIds || !Array.isArray(userIds) || userIds.length === 0 || !text || !title) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u062F\u064A\u0631\u060C \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646\u060C \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0646\u0635 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0629." });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0647 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0645\u062F\u0631\u0627\u0621 \u0641\u0642\u0637." });
    }
    const allUsers = dbInstance.getUsers();
    const threads = dbInstance.getContactThreads();
    const createdThreads = [];
    for (const uId of userIds) {
      const recipient = allUsers.find((u) => u.id === uId);
      if (!recipient) continue;
      const cleanEmail = recipient.email.trim().toLowerCase();
      let thread = threads.find((t) => t.email.trim().toLowerCase() === cleanEmail && t.title === title && !t.isTrash);
      const newMessage = {
        id: "cm-" + Math.random().toString(36).substr(2, 9),
        sender: "admin",
        senderId: admin.id,
        senderName: admin.name,
        text: text.trim(),
        attachments: attachments && Array.isArray(attachments) ? attachments : [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (thread) {
        thread.messages.push(newMessage);
        thread.snippet = text.slice(0, 100);
        thread.status = "read";
        thread.userStatus = "unread";
        thread.type = type || "normal";
        thread.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        if (!thread.userId) thread.userId = recipient.id;
      } else {
        const threadId = "ct-" + Math.random().toString(36).substr(2, 9);
        thread = {
          id: threadId,
          userId: recipient.id,
          name: recipient.name,
          email: cleanEmail,
          phone: recipient.phone,
          title: title.trim(),
          snippet: text.slice(0, 100),
          status: "read",
          // read on admin side
          userStatus: "unread",
          // unread on user side
          type: type || "normal",
          isImportant: type === "important" ? true : false,
          isArchived: false,
          isTrash: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          messages: [newMessage]
        };
        threads.push(thread);
      }
      createdThreads.push(thread);
    }
    dbInstance.persist();
    res.json({ success: true, count: createdThreads.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/contact/threads", (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0631\u0633\u0627\u0626\u0644." });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0631\u0633\u0627\u0626\u0644." });
    }
    const threads = dbInstance.getContactThreads();
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/contact/reply", (req, res) => {
  try {
    const { adminId, threadId, text, attachments } = req.body;
    if (!adminId || !threadId || !text) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u064A\u0631\u060C \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629\u060C \u0648\u0627\u0644\u0631\u062F \u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629." });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u062F\u0648\u062F." });
    }
    const threads = dbInstance.getContactThreads();
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629." });
    }
    const newReply = {
      id: "cm-" + Math.random().toString(36).substr(2, 9),
      sender: "admin",
      senderId: admin.id,
      senderName: admin.name,
      text: text.trim(),
      attachments: attachments && Array.isArray(attachments) ? attachments : [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    thread.messages.push(newReply);
    thread.snippet = "\u0627\u0644\u0631\u062F: " + text.slice(0, 100);
    thread.status = "read";
    thread.userStatus = "unread";
    thread.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    thread.adminReadAt = (/* @__PURE__ */ new Date()).toISOString();
    dbInstance.persist();
    res.json({ success: true, thread, reply: newReply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin/contact/thread-action", (req, res) => {
  try {
    const { adminId, threadId, action } = req.body;
    if (!adminId || !threadId || !action) {
      return res.status(400).json({ error: "\u062C\u0645\u064A\u0639 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0637\u0644\u0628 \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u062A\u063A\u064A\u064A\u0631 \u062D\u0627\u0644\u0629 \u0627\u0644\u0631\u0633\u0627\u0644\u0629." });
    }
    const admin = dbInstance.getUsers().find((u) => u.id === adminId && (u.role === "admin" || u.role === "superadmin"));
    if (!admin) {
      return res.status(403).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0644\u0643 \u0628\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644." });
    }
    const threads = dbInstance.getContactThreads();
    const idx = threads.findIndex((t) => t.id === threadId);
    if (idx === -1) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645." });
    }
    const thread = threads[idx];
    if (action === "read") {
      thread.status = "read";
    } else if (action === "unread") {
      thread.status = "unread";
    } else if (action === "important_toggle") {
      thread.isImportant = !thread.isImportant;
    } else if (action === "archive_toggle") {
      thread.isArchived = !thread.isArchived;
    } else if (action === "trash_toggle") {
      thread.isTrash = !thread.isTrash;
    } else if (action === "delete") {
      threads.splice(idx, 1);
    } else {
      return res.status(400).json({ error: "\u0625\u062C\u0631\u0627\u0621 \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645." });
    }
    dbInstance.persist();
    res.json({ success: true, action, thread: action === "delete" ? null : thread });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = import_path3.default.join(distPath, "index.html");
      try {
        const fs4 = require("fs");
        let html = fs4.readFileSync(indexPath, "utf8");
        const settings = dbInstance.getSettings();
        const gi = settings.google_integration || {
          verification_code: "",
          ga_id: "",
          gtm_id: "",
          merchant_id: ""
        };
        let injections = "";
        if (gi.verification_code) {
          injections += `
  <meta name="google-site-verification" content="${gi.verification_code}" />`;
        }
        if (gi.ga_id) {
          injections += `
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${gi.ga_id}"></script>`;
          injections += `
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gi.ga_id}');
  </script>`;
        }
        if (gi.gtm_id) {
          injections += `
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gi.gtm_id}');</script>`;
        }
        if (gi.merchant_id) {
          injections += `
  <meta name="google-merchant-id" content="${gi.merchant_id}" />`;
        }
        if (injections) {
          html = html.replace("</head>", `${injections}
</head>`);
        }
        res.send(html);
      } catch (err) {
        res.sendFile(indexPath);
      }
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sou9AlJoumla backend running seamlessly on port ${PORT}`);
  });
}
startServer();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adminLimiter,
  auditLogger,
  authFlowLocks,
  authorizeOwnership,
  checkProductRisk,
  csrfAndOriginProtection,
  emitProductCreatedEvent,
  enforceAdminSession,
  generalApiLimiter,
  generateDeviceFingerprint,
  lockAuthFlow,
  loginLimiter,
  paymentsLogger,
  paypalVerifyLimiter,
  processNotificationQueue,
  pushNotificationQueue,
  registerLimiter,
  resetPasswordLimiter,
  revokeAllSessions,
  revokedSessions,
  securityLogger,
  sellerSpamTracker,
  sessionStore,
  setSessionCookie,
  unlockAuthFlow,
  webhookLimiter
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
