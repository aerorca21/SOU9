/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  User, Product, WalletTransaction, ChatRoom, Message, 
  Review, Comment, Coupon, RechargeCode, City, AuditLog, Report, Category, ContactThread, ProfileStat,
  ReviewMedia, ReviewQuestion, ReviewAnswer, Order, ModerationQueueItem, NotificationQueueItem, OtpVerification
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> hashedPassword/rawPassword
  passwordChanged: Record<string, boolean>; // userId -> forced change status
  products: Product[];
  walletTransactions: WalletTransaction[];
  chatRooms: ChatRoom[];
  messages: Message[];
  reviews: Review[];
  comments: Comment[];
  coupons: Coupon[];
  rechargeCodes: RechargeCode[];
  cities: City[];
  categories: Category[];
  auditLogs: AuditLog[];
  reports: Report[];
  settings: Record<string, any>;
  contactThreads: ContactThread[];
  profileStats: ProfileStat[];
  reviewMedia: ReviewMedia[];
  reviewQuestions: ReviewQuestion[];
  reviewAnswers: ReviewAnswer[];
  orders: Order[];
  moderationQueue?: ModerationQueueItem[];
  notificationQueue?: NotificationQueueItem[];
  publishEvents?: string[];
  otpVerifications?: OtpVerification[];
}

// Initial Cities of Morocco
const SEED_CITIES: City[] = [
  { id: 'c1', nameAr: 'الدار البيضاء', nameFr: 'Casablanca', slug: 'casablanca', region: 'Casablanca-Settat', latitude: 33.5731, longitude: -7.5898 },
  { id: 'c2', nameAr: 'الرباط', nameFr: 'Rabat', slug: 'rabat', region: 'Rabat-Salé-Kénitra', latitude: 34.0209, longitude: -6.8416 },
  { id: 'c3', nameAr: 'مراكش', nameFr: 'Marrakech', slug: 'marrakech', region: 'Marrakech-Safi', latitude: 31.6295, longitude: -7.9811 },
  { id: 'c4', nameAr: 'فاس', nameFr: 'Fès', slug: 'fes', region: 'Fès-Meknès', latitude: 34.0181, longitude: -5.0078 },
  { id: 'c5', nameAr: 'طنجة', nameFr: 'Tanger', slug: 'tanger', region: 'Tanger-Tetouan-Al Hoceima', latitude: 35.7595, longitude: -5.8340 },
  { id: 'c6', nameAr: 'أكادير', nameFr: 'Agadir', slug: 'agadir', region: 'Souss-Massa', latitude: 30.4278, longitude: -9.5981 },
  { id: 'c7', nameAr: 'وجدة', nameFr: 'Oujda', slug: 'oujda', region: 'Oriental', latitude: 34.6867, longitude: -1.9114 },
  { id: 'c8', nameAr: 'القنيطرة', nameFr: 'Kénitra', slug: 'kenitra', region: 'Rabat-Salé-Kénitra', latitude: 34.2541, longitude: -6.5890 },
  { id: 'c9', nameAr: 'تطوان', nameFr: 'Tétouan', slug: 'tetouan', region: 'Tanger-Tetouan-Al Hoceima', latitude: 35.5889, longitude: -5.3626 },
  { id: 'c10', nameAr: 'تمارة', nameFr: 'Témara', slug: 'temara', region: 'Rabat-Salé-Kénitra', latitude: 33.9267, longitude: -6.9121 },
  { id: 'c11', nameAr: 'آسفي', nameFr: 'Safi', slug: 'safi', region: 'Marrakech-Safi', latitude: 32.2994, longitude: -9.2372 },
  { id: 'c12', nameAr: 'المحمدية', nameFr: 'Mohammédia', slug: 'mohammedia', region: 'Casablanca-Settat', latitude: 33.6835, longitude: -7.3849 },
  { id: 'c13', nameAr: 'الجديدة', nameFr: 'El Jadida', slug: 'el-jadida', region: 'Casablanca-Settat', latitude: 33.2323, longitude: -8.5034 },
  { id: 'c14', nameAr: 'بني ملال', nameFr: 'Beni Mellal', slug: 'beni-mellal', region: 'Béni Mellal-Khénifra', latitude: 32.3373, longitude: -6.3498 },
  { id: 'c15', nameAr: 'الناظور', nameFr: 'Nador', slug: 'nador', region: 'Oriental', latitude: 35.1681, longitude: -2.9335 },
  { id: 'c16', nameAr: 'تازة', nameFr: 'Taza', slug: 'taza', region: 'Fès-Meknès', latitude: 34.2189, longitude: -4.0100 },
  { id: 'c17', nameAr: 'العيون', nameFr: 'Laâyoune', slug: 'laayoune', region: 'Laâyoune-Sakia El Hamra', latitude: 27.1253, longitude: -13.1625 }
];

// Initial Categories in Arabic and French
const SEED_CATEGORIES: Category[] = [
  { id: 'cat1', nameAr: 'الملابس والإكسسوارات', nameFr: 'Vêtements & Accessoires', slug: 'clothing-accessories', icon: 'Shirt', subcategories: ['Men Clothing', 'Women Clothing', 'Shoes', 'Bags & Accessories', 'Wholesale Fabrics'], sortOrder: 10 },
  { id: 'cat2', nameAr: 'الإلكترونيات الاستهلاكية', nameFr: 'Électronique grand public', slug: 'consumer-electronics', icon: 'Smartphone', subcategories: ['Smartphones & Tablets', 'PCs & Laptops', 'Cameras', 'Smart Wearables', 'Cables & Power'], sortOrder: 20 },
  { id: 'cat3', nameAr: 'الرياضة والترفيه', nameFr: 'Sports & Loisirs', slug: 'sports-leisure', icon: 'Activity', subcategories: ['Fitness Equipment', 'Outdoor Gear', 'Team Sports', 'Water Sports', 'Bicycles'], sortOrder: 30 },
  { id: 'cat4', nameAr: 'منتجات التجميل والعناية', nameFr: 'Produits de beauté', slug: 'beauty-cosmetics', icon: 'Sparkles', subcategories: ['Skincare', 'Makeup', 'Fragrances', 'Haircare', 'Salon Supplies'], sortOrder: 40 },
  { id: 'cat5', nameAr: 'المجوهرات، النظارات والساعات', nameFr: 'Bijoux, Lunettes & Montres', slug: 'jewelry-watches', icon: 'Watch', subcategories: ['Fine Jewelry', 'Fashion Watches', 'Sunglasses', 'Optical Frames', 'Cases & Cleaners'], sortOrder: 50 },
  { id: 'cat6', nameAr: 'المواد الغذائية والتغذية', nameFr: 'Alimentation & Nutrition', slug: 'food-nutrition', icon: 'UtensilsCrossed', subcategories: ['Spices & Herbs', 'Dry Fruits', 'Oils & Fats', 'Canned Goods', 'Tea & Coffee'], sortOrder: 60 },
  { id: 'cat7', nameAr: 'المنزل والمطبخ', nameFr: 'Maison & Cuisine', slug: 'home-kitchen', icon: 'Home', subcategories: ['Appliances', 'Cookware', 'Home Decoration', 'Bedding & Linens', 'Storage & Organization'], sortOrder: 70 }
];

const DEFAULT_PASSWORDS: Record<string, string> = {
  'u-admin': '@@Admindegogh-/147147@@',
  'u-seller1': 'seller123',
  'u-buyer1': 'buyer123'
};

const DEFAULT_USERS: User[] = [
  {
    id: 'u-admin',
    email: 'admin@sou9aljoumla.com',
    name: 'المدير العام (Super Admin)',
    role: 'superadmin',
    phone: '+212676543210',
    whatsapp: '+212676543210',
    city: 'Rabat',
    points: 10000,
    referralCode: 'ADMIN7147',
    createdAt: '2026-01-10T00:00:00Z',
    isVerified: true,
    status: 'active',
    profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    sales_count: 521,
    rating: 5.0
  },
  {
    id: 'u-seller1',
    email: 'maroc.wholesale@gmail.com',
    name: 'المغربية لتجارة الجملة (Maroc Wholesale)',
    role: 'seller',
    phone: '+212611223344',
    whatsapp: '+212611223344',
    companyName: 'مؤسسة المغربية للجملة',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
    companyBanner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
    companyDesc: 'المورد الأول لمنتجات الأزياء، الإكسسوارات الفاخرة، والعطور العربية الأصلية في الدار البيضاء والمملكة المغربية.',
    city: 'Casablanca',
    points: 850,
    referralCode: 'MAROC2026',
    createdAt: '2026-02-01T12:00:00Z',
    isVerified: true,
    status: 'active',
    profile_image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
    sales_count: 142,
    rating: 4.8
  },
  {
    id: 'u-buyer1',
    email: 'mohammed.boutique@yahoo.com',
    name: 'محمد للبقالة والأزياء (Mohamed Boutique)',
    role: 'buyer',
    phone: '+212655667788',
    whatsapp: '+212655667788',
    city: 'Marrakech',
    points: 200,
    referralCode: 'BOUTIQ123',
    createdAt: '2026-03-15T08:30:00Z',
    isVerified: false,
    status: 'active',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    sales_count: 12,
    rating: 4.5
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'عطر عربي أصيل فاخر بالجملة - كولونيا العود والمسك',
    titleFr: 'Parfum Arabe Original de Gros Essence de Parfum Oud & Musk',
    description: 'تمتع بأرقى المكونات العطرية الشرقية الفاخرة. عبوة مخصصة للباعة والمحلات الراغبة في جودة متميزة للمستهلك المغربي الحصري. ثبات يدوم لأكثر من 48 ساعة.',
    descriptionFr: 'Profitez des meilleurs ingrédients de parfum oriental haut de gamme. Bouteille conçue pour les détaillants recherchant une qualité supérieure pour le consommateur marocain. Tenue de plus de 48 heures.',
    shortDescription: 'عطر عربي أصيل فواح للبيع بالجملة ثبات مذهل',
    shortDescriptionFr: 'Parfum arabe original de gros, tenue incroyable',
    category: 'Produits de beauté',
    subcategory: 'Fragrances',
    brand: 'Al-Haramain',
    condition: 'new',
    priceMin: 47.92,
    priceMax: 59.90,
    unitPrice: 59.90,
    bulkPrice: 47.92,
    currency: 'MAD',
    moq: 2,
    maxOrder: 1000,
    stock: 500,
    sku: 'PERF-OUD-01',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['عطور', 'عود', 'جملة', 'تجميل'],
    location: 'Casablanca',
    sellerId: 'u-seller1',
    createdAt: '2026-05-10T14:22:00Z',
    views: 683,
    status: 'active',
    isFeatured: true,
    isPinned: false,
    slug: 'parfum-arabe-original-oud-musk',
    sellerName: 'المغربية لتجارة الجملة',
    sellerVerified: true,
    sellerCity: 'Casablanca',
    sellerRating: 4.8
  },
  {
    id: 'p2',
    title: 'نظارات شمسية ذكية فوتوكرومية بأطواق حديدية متينة',
    titleFr: 'Lunettes de Soleil Photochromiques Carrées Sans Monture',
    description: 'نظارات عملية مضادة للأشعة الفوق بنفسجية وممتازة للتوصيل والسفر. مقاومة للخدش بأذرع مرنة تناسب جميع أحجام الوجه.',
    descriptionFr: 'Lunettes pratiques anti-UV, parfaites pour la livraison et le voyage. Résistantes aux rayures avec branches flexibles adaptées à tous.',
    shortDescription: 'نظارات شمسية متطورة فوتوكرومية للبيع بالجملة',
    shortDescriptionFr: 'Lunettes de soleil photochromiques pour vente en gros',
    category: 'Bijoux, Lunettes & Montres',
    subcategory: 'Sunglasses',
    brand: 'photo-lens',
    condition: 'new',
    priceMin: 13.48,
    priceMax: 18.00,
    unitPrice: 18.00,
    bulkPrice: 13.48,
    currency: 'MAD',
    moq: 2,
    maxOrder: 5000,
    stock: 1200,
    sku: 'SHAD-PHOTO-02',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['نظارات', 'شمسية', 'الموضة', 'اكسسوارات'],
    location: 'Casablanca',
    sellerId: 'u-seller1',
    createdAt: '2026-05-12T10:15:22Z',
    views: 427,
    status: 'active',
    isFeatured: true,
    isPinned: false,
    slug: 'lunettes-soleil-photochromiques',
    sellerName: 'المغربية لتجارة الجملة',
    sellerVerified: true,
    sellerCity: 'Casablanca',
    sellerRating: 4.8
  },
  {
    id: 'p3',
    title: 'مجموعة ألعاب الدومينو والماهجونج الصينية التقليدية الفاخرة',
    titleFr: '2026 Jeu de tuiles de Mahjong américain en acrylique de haute qualité',
    description: 'أحجار ماهجونج أكريليك صلبة ثقيلة ومحفورة بنقوش واضحة، مع حقيبة سفر كلاسيكية مدمجة. هدية رائعة وممتازة للمقاهي والنوادي.',
    descriptionFr: 'Tuiles de mahjong acryliques lourdes et gravées avec sac de voyage classique intégré. Excellent pour cafés et clubs.',
    shortDescription: 'لعبة ماهجونج الفاخرة عالية الجودة تجارة جملة',
    shortDescriptionFr: 'Mahjong de luxe acrylique haute qualité gros',
    category: 'Sports & Loisirs',
    subcategory: 'Team Sports',
    brand: 'ImperialGamer',
    condition: 'new',
    priceMin: 269.51,
    priceMax: 970.24,
    unitPrice: 970.24,
    bulkPrice: 269.51,
    currency: 'MAD',
    moq: 1,
    maxOrder: 100,
    stock: 80,
    sku: 'BOARD-MAHJ-03',
    images: [
      'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['العاب', 'تسلية', 'ماهجونج', 'جملة'],
    location: 'Tangier',
    sellerId: 'u-seller1',
    createdAt: '2026-05-20T17:40:02Z',
    views: 91,
    status: 'active',
    isFeatured: true,
    isPinned: false,
    slug: 'jeu-de-mahjong-acrylique-luxe',
    sellerName: 'المغربية لتجارة الجملة',
    sellerVerified: true,
    sellerCity: 'Casablanca',
    sellerRating: 4.8
  },
  {
    id: 'p4',
    title: 'حاسوب محمول للأعمال بمعالجات قوية وناقل تخزين سريع جداً',
    titleFr: 'PC Ordinateur Portable Professionnel Rapide Intel Core',
    description: 'أجهزة حواسيب محمولة مستوردة درجة أولى للشركات والموزعين والمقاهي الإنترنت والمشاريع الناشئة المغربية.',
    descriptionFr: 'Ordinateurs portables d’affaires reconditionnés d’importation classe A pour les entreprises et revendeurs marocains.',
    shortDescription: 'كمبيوتر محمول للأشغال جودة ممتازة وسعر مثالي للجملة',
    shortDescriptionFr: 'PC portable pro idéale en gros',
    category: 'Électronique grand public',
    subcategory: 'PCs & Laptops',
    brand: 'ThinkNotebook',
    condition: 'refurbished',
    priceMin: 2500.00,
    priceMax: 3800.00,
    unitPrice: 3800.00,
    bulkPrice: 2500.00,
    currency: 'MAD',
    moq: 5,
    maxOrder: 500,
    stock: 250,
    sku: 'LAP-THINK-04',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['حاسوب', 'الكترونيات', 'مكتب', 'جملة'],
    location: 'Rabat',
    sellerId: 'u-seller1',
    createdAt: '2026-05-25T11:20:00Z',
    views: 1104,
    status: 'active',
    isFeatured: true,
    isPinned: false,
    slug: 'pc-ordinateur-portable-professionnel',
    sellerName: 'المغربية لتجارة الجملة',
    sellerVerified: true,
    sellerCity: 'Casablanca',
    sellerRating: 4.8
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'c-welcome',
    code: 'WELCOME2026',
    type: 'points',
    value: 100,
    expiryDate: '2026-12-31T23:59:59Z',
    usageLimit: 1000,
    usageCount: 15,
    status: 'active'
  },
  {
    id: 'c-mad50',
    code: 'MAD50OFF',
    type: 'fixed',
    value: 50,
    minPurchase: 200,
    expiryDate: '2026-09-30T23:59:59Z',
    usageLimit: 500,
    usageCount: 8,
    status: 'active'
  }
];

const DEFAULT_RECHARGE_CODES: RechargeCode[] = [
  { id: 'rc1', code: 'SOU9-7147-CODE1', points: 300, expiryDate: '2026-12-31T23:59:59Z', status: 'active' },
  { id: 'rc2', code: 'SOU9-2026-BONUS', points: 500, expiryDate: '2026-12-31T23:59:59Z', status: 'active' },
  { id: 'rc3', code: 'SOU9-VIP-9999', points: 1200, expiryDate: '2026-12-31T23:59:59Z', status: 'active' }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'l1',
    adminId: 'u-admin',
    adminEmail: 'admin@sou9aljoumla.com',
    adminName: 'المدير العام',
    action: 'تأسيس المنصة',
    ip: '197.230.14.78',
    details: 'تهيئة قواعد البيانات وإدخال المدن المغربية والمدير التلقائي وحسابات التجار الشركاء.',
    createdAt: '2026-06-10T00:00:00Z'
  }
];

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: 'cm1',
    productId: 'p1',
    userId: 'u-buyer1',
    userName: 'محمد للبقالة والأزياء',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    text: 'هل تتوفر عطور أخرى مثل برائحة الياسمين والورد البلدي المغربي؟ نريد طلب كمية كبيرة لتجربتها أولاً في المراكش.',
    replies: [
      {
        id: 'cmr1',
        userId: 'u-seller1',
        userName: 'مؤسسة المغربية للجملة',
        userAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
        text: 'أهلاً بك أخي الكريم، نعم لدينا تشكيلة واسعة برائحة الياسمين والورد المغربي الأصيل، تواصل معنا عبر واتساب لمشاركة الكتالوج الكامل والاتفاق على التوصيل للجملة.',
        createdAt: '2026-05-11T16:00:00Z'
      }
    ],
    createdAt: '2026-05-11T09:12:00Z'
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    userId: 'u-buyer1',
    userName: 'محمد للبقالة والأزياء',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'جودة متميزة وتوصيل سريع وتغليف محكم للزجاجات. العطور نفدت من متجرنا في غضون أسبوع واحد. سنواصل الشراء مئة بالمئة!',
    createdAt: '2026-05-15T12:00:00Z'
  }
];

const DEFAULT_REPORTS: Report[] = [];

const DEFAULT_CONTACT_THREADS: ContactThread[] = [
  {
    id: 'ct-1',
    userId: 'u-seller1',
    name: 'المغربية لتجارة الجملة (Maroc Wholesale)',
    email: 'maroc.wholesale@gmail.com',
    phone: '+212611223344',
    title: 'استفسار بخصوص توثيق الحساب بالمنصة وشراكة VIP',
    snippet: 'السلام عليكم إدارة سوق الجملة، أرسلنا لكم وثائق الشركة ونرغب في الحصول على شارة شريك موثق رسمي لتأكيد عروض الجملة.',
    status: 'unread',
    isImportant: true,
    isArchived: false,
    isTrash: false,
    createdAt: '2026-06-10T10:14:00Z',
    updatedAt: '2026-06-10T10:14:00Z',
    messages: [
      {
        id: 'cm-1-1',
        sender: 'user',
        senderName: 'المغربية لتجارة الجملة',
        senderEmail: 'maroc.wholesale@gmail.com',
        text: 'السلام عليكم إدارة سوق الجملة، أرسلنا لكم وثائق الشركة ونرغب في الحصول على شارة شريك موثق رسمي لتأكيد عروض الجملة للمحلات التجارية والتمتع بالحقوق الإعلانية الموسعة.',
        createdAt: '2026-06-10T10:14:00Z'
      }
    ]
  },
  {
    id: 'ct-2',
    userId: 'u-buyer1',
    name: 'محمد للبقالة والأزياء',
    email: 'mohammed.boutique@yahoo.com',
    phone: '+212655667788',
    title: 'مشكلة في كود الشحن واستبدال نقاط المكافآت',
    snippet: 'تم حل إشكال شحن نقاط الكود وحصلت على رصيد 500 نقطة بنجاح، شكراً لكم.',
    status: 'read',
    isImportant: false,
    isArchived: false,
    isTrash: false,
    createdAt: '2026-06-09T15:30:00Z',
    updatedAt: '2026-06-09T16:15:00Z',
    messages: [
      {
        id: 'cm-2-1',
        sender: 'user',
        senderName: 'محمد للبقالة والأزياء',
        senderEmail: 'mohammed.boutique@yahoo.com',
        text: 'مرحباً، لدي صعوبة في تفعيل كود الشحن الترحيبي الخاص بالنقاط، عند الإدخال يظهر أن الكود مستعمل.',
        createdAt: '2026-06-09T15:30:00Z'
      },
      {
        id: 'cm-2-2',
        sender: 'admin',
        senderName: 'الدعم الفني للمنصة',
        text: 'أهلاً بك يا فندم، قمنا بالتحقق يدويًا وتحديث حالة حسابك وإضافة 500 نقطة مباشرة إلى محفظتكم. يرجى مراجعة الرصيد واستمتاع بتجربة الشراء.',
        createdAt: '2026-06-09T16:00:00Z'
      },
      {
        id: 'cm-2-3',
        sender: 'user',
        senderName: 'محمد للبقالة والأزياء',
        senderEmail: 'mohammed.boutique@yahoo.com',
        text: 'تم حل إشكال شحن نقاط الكود وحصلت على رصيد 500 نقطة بنجاح، شكراً لكم على سرعة الاستجابة والدعم الراقي.',
        createdAt: '2026-06-09T16:15:00Z'
      }
    ]
  }
];

const DEFAULT_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'wt1',
    userId: 'u-seller1',
    type: 'credit',
    amount: 1000,
    points: 850,
    description: 'شحن رصيد باقة الـ Pro المتميزة للمعلنين',
    status: 'completed',
    createdAt: '2026-02-01T12:05:00Z'
  }
];

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  siteName: 'Sou9AlJoumla',
  siteNameAr: 'سوق الجملة',
  siteDescription: 'سوق الجملة المغربي الأول لربط تجار الجملة بالمشترين والمحلات بجميع مدن المملكة.',
  primaryColor: '#ff6600',
  secondaryColor: '#1d2731',
  contactEmail: 'support@sou9aljoumla.com',
  contactPhone: '+212522778899',
  address: 'شارع الزرقطوني، عمارة الأمل، الدار البيضاء، المغرب',
  currency: 'MAD'
};

export class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        // Ensure structure is correct
        const loadedData: DatabaseSchema = {
          users: (parsed.users || []).map((u: any) => {
            const created_at = u.created_at || u.createdAt || new Date().toISOString();
            const roleIsAdmin = u.role === 'superadmin' || u.role === 'admin' || u.role === 'owner';
            const isAdmin = typeof u.isAdmin === 'boolean' ? u.isAdmin : roleIsAdmin;
            const passChangedRec = parsed.passwordChanged || {};
            
            const passwordVersion = typeof u.passwordVersion === 'number' 
              ? u.passwordVersion 
              : ((u.firstLoginDone === true || passChangedRec[u.id] === true || (u.id !== 'u-admin' && roleIsAdmin)) ? 1 : 0);
            
            const passwordChangedManually = typeof u.passwordChangedManually === 'boolean'
              ? u.passwordChangedManually
              : (passwordVersion > 0 || passChangedRec[u.id] === true);

            const firstLoginDone = typeof u.firstLoginDone === 'boolean' 
              ? u.firstLoginDone 
              : (passwordVersion > 0);

            let mustChangePassword = (isAdmin && passwordVersion === 0);
            if (isAdmin && passwordChangedManually) {
              mustChangePassword = false;
            }

            return {
              ...u,
              created_at,
              createdAt: u.createdAt || created_at,
              verificationStatus: u.verificationStatus || (u.isVerified ? 'verified' : 'pending'),
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
          categories: (parsed.categories || []).map((c: any, idx: number) => ({
            ...c,
            sortOrder: typeof c.sortOrder === 'number' ? c.sortOrder : (idx + 1) * 10
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

        // Initialize/Sync profile stats if missing for any user
        let statsUpdated = false;
        loadedData.users.forEach((user: any) => {
          const statsExist = loadedData.profileStats.some((ps) => ps.user_id === user.id);
          if (!statsExist) {
            let viewsCount = 0;
            let salesCount = 0;
            if (user.id === 'u-seller1') {
              viewsCount = 97;
              salesCount = 142;
            } else if (user.id === 'u-admin') {
              salesCount = 521;
            } else if (user.role === 'seller') {
              salesCount = user.sales_count || 0;
              viewsCount = 0;
            }
            loadedData.profileStats.push({
              user_id: user.id,
              views_count: viewsCount,
              sales_count: salesCount,
              updated_at: new Date().toISOString()
            });
            statsUpdated = true;
          }
        });

        let updated = false;
        const uAdmin = loadedData.users.find((u: any) => u.id === 'u-admin');
        if (uAdmin && uAdmin.role !== 'superadmin') {
          uAdmin.role = 'superadmin';
          updated = true;
        }
        // Force save if we just migrated badges / verificationStatus / profileStats
        if (statsUpdated || loadedData.users.some((u: any) => !u.badges || !u.verificationStatus)) {
          updated = true;
        }
        if (updated) {
          try {
            this.save(loadedData);
          } catch(e) {}
        }
        return loadedData;
      }
    } catch (e) {
      console.error('Error loading database, resetting to default seed data:', e);
    }

    // Default Seed Data
    const initialDb: DatabaseSchema = {
      users: DEFAULT_USERS.map((u: any) => {
        const created_at = u.created_at || u.createdAt || new Date().toISOString();
        const roleIsAdmin = u.role === 'superadmin' || u.role === 'admin' || u.role === 'owner';
        const isAdmin = roleIsAdmin;
        const passwordVersion = u.id === 'u-admin' ? 0 : 1;
        const passwordChangedManually = u.id !== 'u-admin';
        const firstLoginDone = u.id !== 'u-admin'; // Only the main seed admin u-admin requires initial password reset
        let mustChangePassword = isAdmin && (passwordVersion === 0);
        if (isAdmin && passwordChangedManually) {
          mustChangePassword = false;
        }
        return {
          ...u,
          created_at,
          createdAt: u.createdAt || created_at,
          verificationStatus: u.verificationStatus || (u.isVerified ? 'verified' : 'pending'),
          badges: u.badges || [],
          isAdmin,
          firstLoginDone,
          passwordVersion,
          passwordChangedManually,
          mustChangePassword
        };
      }),
      passwords: DEFAULT_PASSWORDS,
      passwordChanged: { 'u-admin': false, 'u-seller1': true, 'u-buyer1': true },
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

    initialDb.profileStats = initialDb.users.map((user: any) => {
      let viewsCount = 0;
      let salesCount = 0;
      if (user.id === 'u-seller1') {
        viewsCount = 97;
        salesCount = 142;
      } else if (user.id === 'u-admin') {
        salesCount = 521;
      } else if (user.role === 'seller') {
        salesCount = user.sales_count || 0;
        viewsCount = 0;
      }
      return {
        user_id: user.id,
        views_count: viewsCount,
        sales_count: salesCount,
        updated_at: new Date().toISOString()
      };
    });

    this.save(initialDb);
    return initialDb;
  }

  public save(customData?: DatabaseSchema): void {
    try {
      const dbToSave = customData || this.data;

      // Sanitize auditLogs by redacting any phone numbers, emails, tokens, OTP codes, and names
      if (dbToSave.auditLogs) {
        const sanitizeSensitiveText = (text: string): string => {
          if (!text) return text;
          let sanitized = text;

          // 1. Redact Emails
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          sanitized = sanitized.replace(emailRegex, '[REDACTED_EMAIL]');

          // 2. Redact Phone numbers (+2126..., 06..., +212 6..., etc.)
          const phoneRegex = /(?:\+212|212|0)[ \-_]?[567]\d{8}\b|(?:\+?\d{1,3}[ \-_]?)?\(?\d{3}\)?[\s\-_]?\d{3}[\s\-_]?\d{4}\b/g;
          sanitized = sanitized.replace(phoneRegex, '[REDACTED_PHONE]');

          // 3. Redact 6-digit verification codes/OTPs
          const otpRegex = /\b\d{6}\b/g;
          sanitized = sanitized.replace(otpRegex, '[REDACTED_OTP]');

          // 4. Redact tokens / keys in format secret=value
          const tokenRegex = /\b(token|password|pass|secret|key|otp)=["']?[a-zA-Z0-9_\-=@/]+["']?/gi;
          sanitized = sanitized.replace(tokenRegex, (m) => m.split('=')[0] + '=[REDACTED]');

          return sanitized;
        };

        dbToSave.auditLogs = dbToSave.auditLogs.map((log: any) => ({
          ...log,
          adminEmail: log.adminEmail ? '[REDACTED_EMAIL]' : log.adminEmail,
          adminName: log.adminName ? '[REDACTED_NAME]' : log.adminName,
          action: log.action ? sanitizeSensitiveText(log.action) : log.action,
          details: log.details ? sanitizeSensitiveText(log.details) : log.details
        }));
      }

      // To strictly match database requirements for the table key "profile_stats":
      const payload = {
        ...dbToSave,
        profile_stats: dbToSave.profileStats,
        review_media: dbToSave.reviewMedia,
        review_questions: dbToSave.reviewQuestions,
        review_answers: dbToSave.reviewAnswers
      };
      // delete camelCase during write to ensure strict schema compliance in JSON,
      // while preserving other properties
      delete (payload as any).profileStats;
      delete (payload as any).reviewMedia;
      delete (payload as any).reviewQuestions;
      delete (payload as any).reviewAnswers;
      const TEMP_DB_FILE = DB_FILE + '.tmp';
      fs.writeFileSync(TEMP_DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
      fs.renameSync(TEMP_DB_FILE, DB_FILE);

      // Web/Database Auto-backup implementation to prevent corruption (Database Security)
      try {
        fs.copyFileSync(DB_FILE, path.join(DATA_DIR, 'db_backup.json'));
      } catch (backupError) {
        console.error('Error creating database backup:', backupError);
      }
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }


  // General low-level table getters
  public getUsers() { return this.data.users; }
  public getPasswords() { return this.data.passwords; }
  public getPasswordChanged() { return this.data.passwordChanged; }
  public getProducts() { return this.data.products; }
  public getWalletTransactions() { return this.data.walletTransactions; }
  public getChatRooms() { return this.data.chatRooms; }
  public getMessages() { return this.data.messages; }
  public getReviews() { return this.data.reviews; }
  public getComments() { return this.data.comments; }
  public getCoupons() { return this.data.coupons; }
  public getRechargeCodes() { return this.data.rechargeCodes; }
  public getCities() { return this.data.cities; }
  public getCategories() { return this.data.categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)); }
  public getAuditLogs() { return this.data.auditLogs; }
  public getReports() { return this.data.reports; }
  public getSettings() { return this.data.settings; }
  public getContactThreads() { return this.data.contactThreads; }
  public getProfileStats() { return this.data.profileStats; }
  public getReviewMedia() { if (!this.data.reviewMedia) this.data.reviewMedia = []; return this.data.reviewMedia; }
  public getReviewQuestions() { if (!this.data.reviewQuestions) this.data.reviewQuestions = []; return this.data.reviewQuestions; }
  public getReviewAnswers() { if (!this.data.reviewAnswers) this.data.reviewAnswers = []; return this.data.reviewAnswers; }
  public getOrders() { if (!this.data.orders) this.data.orders = []; return this.data.orders; }
  public getModerationQueue() { if (!this.data.moderationQueue) this.data.moderationQueue = []; return this.data.moderationQueue; }
  public getNotificationQueue() { if (!this.data.notificationQueue) this.data.notificationQueue = []; return this.data.notificationQueue; }
  public getPublishEvents() { if (!this.data.publishEvents) this.data.publishEvents = []; return this.data.publishEvents; }
  public getOtpVerifications() { if (!this.data.otpVerifications) this.data.otpVerifications = []; return this.data.otpVerifications; }

  public setReviewMedia(media: ReviewMedia[]) { this.data.reviewMedia = media; }
  public setReviewQuestions(questions: ReviewQuestion[]) { this.data.reviewQuestions = questions; }
  public setReviewAnswers(answers: ReviewAnswer[]) { this.data.reviewAnswers = answers; }

  // Flush table state changes directly
  public persist() {
    this.save();
  }
}

export const dbInstance = new JsonDatabase();
