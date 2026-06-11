/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shirt, Smartphone, Activity, Sparkles, Watch, UtensilsCrossed, 
  Home as HomeIcon, Search, MapPin, Grid, ShieldAlert, CheckCircle, 
  Eye, Truck, AlertTriangle, Key, LogIn, Mail, Lock, User as UserIcon, 
  Phone, Globe, MessageSquare, X, Coins, Upload, Image as ImageIcon,
  FileText, Loader2
} from 'lucide-react';

import { translations } from './lib/i18n';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import WalletPanel from './components/WalletPanel';
import ChatPanel from './components/ChatPanel';
import AdminPanel from './components/AdminPanel';
import ProfileModal from './components/ProfileModal';
import CustomerSupportWidget from './components/CustomerSupportWidget';
import { User, Product, Category, City } from './types';
import MandatoryTermsModal from './components/MandatoryTermsModal';

export default function App() {
  // Locale State (Arabic default)
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar');
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Core authenticated details
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Dynamic system catalogs
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [pinnedProducts, setPinnedProducts] = useState<Product[]>([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [logoHasText, setLogoHasText] = useState(false);

  // Filtering coordinate variables
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals coordinates
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showProductCreateModal, setShowProductCreateModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [bookingFiles, setBookingFiles] = useState<{ name: string; size: number; url: string; isUploading?: boolean }[]>([]);
  const [bookingUploadError, setBookingUploadError] = useState('');
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);
  const [targetDetailProductId, setTargetDetailProductId] = useState<string | null>(null);
  const [initialSellerIdId, setInitialSellerIdId] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  
  // Publishing flow confirmation variables
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [requiredPointsPending, setRequiredPointsPending] = useState(20);
  const [insufficientPointsError, setInsufficientPointsError] = useState(false);

  // Forced password update blockade for Administrator
  const [forcePasswordUser, setForcePasswordUser] = useState<any>(null);
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Authentication Fields (Combined Login / Signup layout)
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authWhatsapp, setAuthWhatsapp] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authRole, setAuthRole] = useState<'seller' | 'buyer'>('buyer');
  const [authReferredBy, setAuthReferredBy] = useState('');
  const [authError, setAuthError] = useState('');

  // OTP Verification flow states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSimulatedText, setOtpSimulatedText] = useState<string | null>(null);
  const [otpError, setOtpError] = useState('');
  const [otpResendSuccess, setOtpResendSuccess] = useState<string | null>(null);

  // Forgot Password flow states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Code, 3: Reset Passwords
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotSimulatedText, setForgotSimulatedText] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Creation of wholesale listing fields
  const [pForm, setPForm] = useState({
    title: '',
    titleFr: '',
    description: '',
    descriptionFr: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    brand: '',
    condition: 'new',
    priceMin: '',
    priceMax: '',
    moq: '10',
    stock: '100',
    tags: '',
    location: '',
    images: '',
    isFeatured: false,
    shipping_type: 'free' as 'free' | 'paid',
    shipping_cost: '0'
  });
  const [createProductError, setCreateProductError] = useState('');

  // Contacts form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // New Contact Us form state
  const [showContactUsModal, setShowContactUsModal] = useState(false);
  const [contactUsName, setContactUsName] = useState('');
  const [contactUsEmail, setContactUsEmail] = useState('');
  const [contactUsPhone, setContactUsPhone] = useState('');
  const [contactUsMsg, setContactUsMsg] = useState('');
  const [contactUsSuccess, setContactUsSuccess] = useState(false);

  // Clean URL routing and history navigation handler
  useEffect(() => {
    // 1. Load corresponding product details on direct clean URL entry
    const m = window.location.pathname.match(/^\/product\/([^/]+)/);
    if (m && m[1]) {
      const slugVal = m[1];
      fetch(`/api/products/${slugVal}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.product) {
            setTargetDetailProductId(data.product.id);
          }
        })
        .catch(err => console.error("initial clean route fetch error:", err));
    }

    // 2. Navigation trigger (back/forward history clicks sync)
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/product\/([^/]+)/);
      if (match && match[1]) {
        const slugVal = match[1];
        fetch(`/api/products/${slugVal}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.product) {
              setTargetDetailProductId(data.product.id);
            }
          })
          .catch(e => console.error(e));
      } else {
        setTargetDetailProductId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keep browser URL address bar in sync with the active product detail view
  useEffect(() => {
    if (targetDetailProductId) {
      fetch(`/api/products/${targetDetailProductId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.product && data.product.slug) {
            const newPath = `/product/${data.product.slug}`;
            if (window.location.pathname !== newPath) {
              window.history.pushState(null, '', newPath);
            }
          }
        })
        .catch(err => console.error(err));
    } else {
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/product/')) {
        // preserve other active static routes if any
      } else if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [targetDetailProductId]);

  // Load catalogs and query parameters on start
  useEffect(() => {
    // Automatically capture referral from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setAuthReferredBy(refCode);
      setIsSignUp(true);
      setShowLoginModal(true);
    }

    // Load active session from local storage
    const storedUser = localStorage.getItem('s9_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    fetchCatalogs();
    fetchBranding();

    const handleCategoriesReordered = (e: any) => {
      if (e.detail) {
        setCategories(e.detail);
      } else {
        fetchCatalogs();
      }
    };
    window.addEventListener('categories-reordered', handleCategoriesReordered);
    return () => {
      window.removeEventListener('categories-reordered', handleCategoriesReordered);
    };
  }, []);

  // Check if mandatory privacy policy modal needs to be shown
  useEffect(() => {
    if (currentUser) {
      const isStaff = ['superadmin', 'admin', 'moderator'].includes(currentUser.role);
      const isAccepted = localStorage.getItem(`s9_privacy_accepted_${currentUser.id}`) === 'true';
      if (!isStaff && !isAccepted) {
        setShowMandatoryModal(true);
      } else {
        setShowMandatoryModal(false);
      }
    } else {
      setShowMandatoryModal(false);
    }
  }, [currentUser]);

  const handleAcceptMandatoryTerms = () => {
    if (currentUser) {
      localStorage.setItem(`s9_privacy_accepted_${currentUser.id}`, 'true');
      setShowMandatoryModal(false);
    }
  };

  // Fetch Google Services Integration Configuration on Mount (Supports Live Verification/Tracking)
  useEffect(() => {
    const fetchAndLoadGoogle = async () => {
      try {
        const res = await fetch('/api/google-integration');
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;

        // 1. Google Site Verification
        if (data.verification_code) {
          let verificationMeta = document.querySelector('meta[name="google-site-verification"]');
          if (!verificationMeta) {
            verificationMeta = document.createElement('meta');
            verificationMeta.setAttribute('name', 'google-site-verification');
            document.head.appendChild(verificationMeta);
          }
          verificationMeta.setAttribute('content', data.verification_code);
        }

        // 2. Google Analytics (gtag.js)
        if (data.ga_id) {
          const existingGtagScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${data.ga_id}"]`);
          if (!existingGtagScript) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${data.ga_id}`;
            document.head.appendChild(script);

            const initScript = document.createElement('script');
            initScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${data.ga_id}');
            `;
            document.head.appendChild(initScript);
          }
        }

        // 3. Google Tag Manager
        if (data.gtm_id) {
          const existingGtmScript = document.querySelector(`script[src*="gtm.js?id=${data.gtm_id}"]`);
          if (!existingGtmScript) {
            const script = document.createElement('script');
            script.innerHTML = `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${data.gtm_id}');
            `;
            document.head.appendChild(script);
          }
        }

        // 4. Google Merchant Center ID Meta Tag
        if (data.merchant_id) {
          let gmcMeta = document.querySelector('meta[name="google-merchant-id"]');
          if (!gmcMeta) {
            gmcMeta = document.createElement('meta');
            gmcMeta.setAttribute('name', 'google-merchant-id');
            document.head.appendChild(gmcMeta);
          }
          gmcMeta.setAttribute('content', data.merchant_id);
        }

      } catch (err) {
        console.error('Error fetching Google services integration configuration:', err);
      }
    };

    fetchAndLoadGoogle();
  }, []);

  // Fetch products automatically upon category/city filters changes
  useEffect(() => {
    fetchFilteredProducts();
    fetchPinnedProducts();
  }, [selectedCategory, selectedCity]);

  const fetchCatalogs = async () => {
    try {
      const resCities = await fetch('/api/cities');
      if (resCities.ok) setCities(await resCities.json());

      const resCategories = await fetch('/api/categories');
      if (resCategories.ok) {
        const catData = await resCategories.json();
        setCategories(catData);
        // Pre-fill categories in create form
        if (catData.length > 0) {
          setPForm(f => ({ ...f, category: catData[0].nameFr, subcategory: catData[0].subcategories[0] }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBranding = async () => {
    try {
      const res = await fetch('/api/branding');
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.logoUrl || '');
        setLogoHasText(!!data.logoHasText);
        if (data.faviconUrl) {
          setFaviconUrl(data.faviconUrl);
          updateFavicon(data.faviconUrl);
        } else {
          setFaviconUrl('');
          // Revert back to standard favicon if custom is empty
          const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
          if (link) {
            link.href = '/favicon.ico';
          }
        }
      }
    } catch (e) {
      console.error('Error loading branding:', e);
    }
  };

  const updateFavicon = (url: string) => {
    if (!url) return;
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = url + '?cb=' + Date.now();
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = url + '?cb=' + Date.now();
      document.head.appendChild(newLink);
    }
  };

  const fetchPinnedProducts = async () => {
    try {
      const res = await fetch('/api/products?sortBy=newest');
      if (res.ok) {
        const data = await res.json();
        const pinned = data.filter((p: Product) => p.isPinned).slice(0, 3);
        setPinnedProducts(pinned);
      }
    } catch (err) {
      console.error('Error loading pinned products: ', err);
    }
  };

  const fetchFilteredProducts = async () => {
    try {
      let url = `/api/products?sortBy=newest`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedCity) url += `&city=${encodeURIComponent(selectedCity)}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      if (res.ok) {
        setProductsList(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = () => {
    fetchFilteredProducts();
  };

  const handleLogout = () => {
    localStorage.removeItem('s9_user');
    setCurrentUser(null);
    setShowAdminModal(false);
    setShowWalletModal(false);
    setShowChatModal(false);
    setInitialSellerIdId(null);
  };

  const validateFullNameFront = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'الاسم الكامل مطلوب';
    }
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) {
      return 'الاسم غير صالح. يرجى إدخال اسم حقيقي مكون من كلمتين على الأقل (الاسم الثاني واللقب)';
    }
    if (/^\d+$/.test(trimmed.replace(/\s+/g, ''))) {
      return 'الاسم غير صالح. الاسم لا يمكن أن يتكون من أرقام فقط';
    }
    const nameRegex = /^[a-zA-Z\u0600-\u06FFàâæçéèêëîïôœùûüÿÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ\s]+$/;
    if (!nameRegex.test(trimmed)) {
      return 'الاسم غير صالح. غير مسموح باستخدام الأرقام أو الرموز الخاصة';
    }
    const spamWords = ['test', 'testing', 'admin', 'user', 'qwerty', 'asdasd', 'juhjdijed', 'abc123', '123456'];
    const hasSpam = words.some(w => {
      const lw = w.toLowerCase();
      return spamWords.includes(lw) || lw.length < 2;
    });
    if (hasSpam) {
      return 'الاسم غير صالح. يحتوي على كلمات عشوائية أو تجريبية غير مقبولة';
    }
    if (/([a-zA-Z\u0600-\u06FF])\1\1\1/i.test(trimmed)) {
      return 'الاسم غير صالح. الاسم يحتوي على أحرف مكررة عشوائية غير منطقية';
    }
    return null;
  };

  const validatePhoneFront = (phone: string): string | null => {
    const trimmed = (phone || '').trim();
    if (!trimmed) {
      return 'رقم الهاتف للتواصل مطلوب';
    }
    if (!/^06\d{8}$/.test(trimmed)) {
      return 'رقم الهاتف غير صالح. يجب أن يبدأ بـ 06 ويتكون من 10 أرقام فقط دون مسافات أو رموز';
    }
    return null;
  };

  const validateEmailFront = (email: string): string | null => {
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed) {
      return 'البريد الإلكتروني للشركة مطلوب';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'البريد الإلكتروني غير صالح. صيغة البريد مدخلة بشكل غير صحيح';
    }
    const domain = trimmed.split('@')[1];
    if (!domain) return 'البريد الإلكتروني غير صالح';
    const disposableKeywords = [
      'mailinator', 'tempmail', 'guerrillamail', '10minutemail', 
      'yopmail', 'throwaway', 'disposable', 'temp-mail', 'trashmail',
      'getairmail', 'sharklasers', 'guerrillamailblock', 'pokemail', 
      'dispostable', 'fakeinbox', 'generator'
    ];
    const isDisposable = disposableKeywords.some(keyword => domain.includes(keyword));
    if (isDisposable) {
      return 'البريد الإلكتروني مؤقت وغير مسموح به بالمنصة لتفادي الحسابات الوهمية';
    }
    return null;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (isSignUp) {
        // Frontend Checks
        const nameErr = validateFullNameFront(authName);
        if (nameErr) {
          setAuthError(nameErr);
          return;
        }
        const phoneErr = validatePhoneFront(authPhone);
        if (phoneErr) {
          setAuthError(phoneErr);
          return;
        }
        const emailErr = validateEmailFront(authEmail);
        if (emailErr) {
          setAuthError(emailErr);
          return;
        }

        // Sign-up logic
        const r = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
            name: authName,
            role: authRole,
            phone: authPhone,
            whatsapp: authWhatsapp,
            city: authCity || 'Casablanca',
            referredBy: authReferredBy
          })
        });

        const data = await r.json();
        if (r.ok) {
          if (data.pendingVerification) {
            setOtpEmail(authEmail);
            setOtpSimulatedText(data.otpCodeSimulated);
            setShowOtpModal(true);
            setShowLoginModal(false);
            // Clear passwords states
            setAuthPassword('');
          } else {
            alert(isRtl ? 'تم تسجيل حسابك بنجاح!' : 'Inscription réussie !');
            setIsSignUp(false);
          }
        } else {
          setAuthError(data.error || 'حدث خطأ أثناء التسجيل');
        }
      } else {
        // Login logic
        const r = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });

        const data = await r.json();
        if (r.ok) {
          if (data.requirePasswordChange) {
            // Force change password screen
            setForcePasswordUser(data);
            setShowLoginModal(false);
          } else {
            setCurrentUser(data.user);
            localStorage.setItem('s9_user', JSON.stringify(data.user));
            setShowLoginModal(false);
            // Clear inputs
            setAuthEmail('');
            setAuthPassword('');
          }
        } else {
          // If login fails due to pending verification or force password change challenge
          if (data.pendingVerification) {
            setOtpEmail(authEmail);
            setOtpSimulatedText(data.otpCodeSimulated);
            setShowOtpModal(true);
            setShowLoginModal(false);
            setAuthPassword('');
          } else if (data.forcePasswordChange || data.requirePasswordChange) {
            setForcePasswordUser(data);
            setShowLoginModal(false);
            setAuthPassword('');
          } else {
            setAuthError(data.error || 'فشل تسجيل الدخول للشركة');
          }
        }
      }
    } catch (err) {
      setAuthError('خطأ تقني، عذراً تعذر الاتصال بالخادم الآن.');
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpResendSuccess(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, code: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('s9_user', JSON.stringify(data.user));
        setShowOtpModal(false);
        setOtpCode('');
        setOtpSimulatedText(null);
        alert(isRtl ? 'تم تفعيل حسابك التجاري بنجاح! مرحباً بك في سوق الجملة المغربي.' : 'Compte vérifié avec succès !');
      } else {
        setOtpError(data.error || 'رمز التحقق غير صحيح');
      }
    } catch {
      setOtpError('خطأ فني في التحقق من الرمز.');
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    setOtpResendSuccess(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpResendSuccess('تم إرسال رمز تفعيل جديد بنجاح إلى البريد الإلكتروني!');
        setOtpSimulatedText(data.otpCodeSimulated);
      } else {
        setOtpError(data.error || 'فشل إرسال الرمز الجديد حالياً');
      }
    } catch {
      setOtpError('خطأ تقني في استعادة الرمز.');
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSimulatedText(data.otpCodeSimulated);
        setForgotStep(2);
      } else {
        setForgotError(data.error || 'البريد الإلكتروني للشركة غير مسجل بالمنصة');
      }
    } catch {
      setForgotError('خطأ تقني، تعذر تهيئة طلب تحديث كلمة المرور.');
    }
  };

  const handleForgotCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    try {
      const res = await fetch('/api/auth/verify-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep(3);
      } else {
        setForgotError(data.error || 'رمز التحقق غير صحيح');
      }
    } catch {
      setForgotError('خطأ تقني، تعذر فحص رمز الاستعادة.');
    }
  };

  const handleForgotResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (forgotNewPassword.length < 6) {
      setForgotError('كلمة المرور يجب أن لا تقل عن 6 أحرف');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotOtp,
          newPassword: forgotNewPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(isRtl ? 'تم تغيير وربط كلمة المرور بحسابك بنجاح! سجل دخولك الآن ببياناتك الجديدة.' : 'Mot de passe réinitialisé !');
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotSimulatedText(null);
        setShowLoginModal(true);
      } else {
        setForgotError(data.error || 'فشل تحديث كلمة المرور');
      }
    } catch {
      setForgotError('خطأ تقني، تعذر معالجة تغيير كلمة المرور.');
    }
  };

  const handleForcePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) return;

    try {
      const res = await fetch('/api/auth/force-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: forcePasswordUser.userId,
          newPassword: newAdminPassword
        })
      });

      const body = await res.json();
      if (res.ok) {
        alert(isRtl 
          ? 'تم تحديث كلمة المرور الإدارية بنجاح! تم تفعيل حسابك وسيتم توجيهك الآن تلقائياً إلى لوحة التحكم الإدارية.' 
          : 'Password changed successfully! You will now be redirected to the Control Panel.');
        
        setForcePasswordUser(null);
        setNewAdminPassword('');
        
        // Auto-login: set session and localStorage
        setCurrentUser(body.user);
        localStorage.setItem('s9_user', JSON.stringify(body.user));
        
        // Open control panel directly and clean inputs
        setShowAdminModal(true);
        setShowLoginModal(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        alert(body.error || (isRtl ? 'عذراً، فشل تحديث كلمة المرور الإدارية.' : 'Failed to update administrative password.'));
      }
    } catch (err) {
      console.error(err);
      alert(isRtl ? 'خطأ تقني، تعذر الاتصال بالخادم لتحديث كلمة المرور.' : 'Technical error, could not connect to server.');
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateProductError('');
    if (!currentUser) return;

    if (currentUser.status === 'suspended') {
      setCreateProductError('عذراً، هذا الحساب موقوف أو محظور ولا يمكنه النشر حالياً.');
      return;
    }

    if (!pForm.moq || Number(pForm.moq) < 10) {
      setCreateProductError('يجب أن يكون الحد الأدنى للطلب (MOQ) 10 حبات أو أكثر ولا يمكن النشر بأقل من ذلك.');
      return;
    }

    if (pForm.shipping_type === 'paid') {
      const parsedCost = Number(pForm.shipping_cost);
      if (!pForm.shipping_cost || isNaN(parsedCost) || parsedCost < 0) {
        setCreateProductError('بما أنك اخترت الشحن المدفوع، يرجى إدخال سعر شحن صحيح أكبر من أو يساوي 0.');
        return;
      }
    }

    const imagesArr = pForm.images.split('\n').map(v => v.trim()).filter(Boolean);
    if (imagesArr.length === 0) {
      setCreateProductError(isRtl ? 'يرجى رفع صورة واحدة على الأقل للمنتج.' : 'Please upload at least one image.');
      return;
    }

    try {
      // Fetch dynamic active publishing cost from server settings
      let dynamicCost = 20;
      let isPaidEnabled = true;

      try {
        const settingsRes = await fetch('/api/admin/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          dynamicCost = Number(settingsData.publishingCost);
          isPaidEnabled = !!settingsData.paidPublishingEnabled;
        }
      } catch (err) {
        console.error("Error loading publishing settings, fallback to defaults", err);
      }

      // Compute total required points
      let computedPoints = 0;
      if (isPaidEnabled) {
        computedPoints = pForm.isFeatured ? 60 : dynamicCost;
        if (imagesArr.length > 4) {
          computedPoints += (imagesArr.length - 4) * 5;
        }
      }

      setRequiredPointsPending(computedPoints);

      if (computedPoints > 0 && currentUser.points < computedPoints) {
        setInsufficientPointsError(true);
      } else {
        setInsufficientPointsError(false);
      }

      setShowPublishConfirm(true);
    } catch (e) {
      setCreateProductError('حدث عطل في الاتصال، يرجى المحاولة ثانية.');
    }
  };

  const handleProductFilesSelected = (files: File[]) => {
    const currentImages = pForm.images.split('\n').map(v => v.trim()).filter(Boolean);
    const availableSlots = 9 - currentImages.length;
    if (availableSlots <= 0) {
      alert(isRtl ? 'لقد وصلت للحد الأقصى المسموح به (9 صور)' : 'You reached the maximum limit of 9 images');
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64Str = reader.result;
          setPForm(prev => {
            const imgs = prev.images.split('\n').map(v => v.trim()).filter(Boolean);
            if (imgs.length >= 9) return prev;
            return {
              ...prev,
              images: [...imgs, base64Str].join('\n')
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProductRemoveImage = (indexToRemove: number) => {
    setPForm(prev => {
      const imgs = prev.images.split('\n').map(v => v.trim()).filter(Boolean);
      const filtered = imgs.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: filtered.join('\n')
      };
    });
  };

  const executePublishProduct = async () => {
    setShowPublishConfirm(false);
    if (!currentUser) return;

    try {
      // Parse list images lines
      const imagesArr = pForm.images.split('\n').map(v => v.trim()).filter(Boolean);
      const tagsArr = pForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: currentUser.id,
          title: pForm.title,
          titleFr: pForm.titleFr,
          description: pForm.description,
          descriptionFr: pForm.descriptionFr,
          shortDescription: pForm.shortDescription,
          category: pForm.category,
          subcategory: pForm.subcategory,
          brand: pForm.brand,
          condition: pForm.condition,
          priceMin: Number(pForm.priceMin),
          priceMax: Number(pForm.priceMax),
          moq: Number(pForm.moq),
          stock: Number(pForm.stock),
          location: pForm.location || currentUser.city,
          images: imagesArr,
          tags: tagsArr,
          isFeatured: pForm.isFeatured,
          shipping_type: pForm.shipping_type || 'free',
          shipping_cost: pForm.shipping_type === 'paid' ? Number(pForm.shipping_cost) : 0
        })
      });

      const body = await res.json();
      if (res.ok) {
        alert(isRtl ? 'تهانينا! تم شحن إعلانك ونشره بنجاح بالمنطقة التجارية.' : 'Produit publié avec succès !');
        setPForm({
          title: '',
          titleFr: '',
          description: '',
          descriptionFr: '',
          shortDescription: '',
          category: categories[0]?.nameFr || '',
          subcategory: categories[0]?.subcategories[0] || '',
          brand: '',
          condition: 'new',
          priceMin: '',
          priceMax: '',
          moq: '10',
          stock: '100',
          tags: '',
          location: '',
          images: '',
          isFeatured: false,
          shipping_type: 'free',
          shipping_cost: '0'
        });
        
        // Refresh supplier points
        const updatedUser = { ...currentUser, points: body.currentPoints };
        setCurrentUser(updatedUser);
        localStorage.setItem('s9_user', JSON.stringify(updatedUser));
        
        setShowProductCreateModal(false);
        fetchFilteredProducts();
      } else {
        setCreateProductError(body.error || 'خطأ في معالجة المنتج');
      }
    } catch (e) {
      setCreateProductError('تعذر رفع وتصنيف الإعلان لفرط مشاكل بالاتصال.');
    }
  };

  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingContactUs, setIsSubmittingContactUs] = useState(false);

  const handleBookingFilesSelected = async (files: File[]) => {
    setBookingUploadError('');
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];
    
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedExtensions.includes(ext)) {
        setBookingUploadError(isRtl ? 'نوع الملف غير مدعوم. المسموح به صور (JPG, PNG, WEBP) وملفات PDF ومستندات Word (DOC, DOCX) فقط.' : 'Unsupported file type. Allowed: JPG, PNG, WEBP, PDF, DOC, DOCX.');
        continue;
      }
      
      // 10MB limit (10 * 1024 * 1024)
      if (file.size > 10 * 1024 * 1024) {
        setBookingUploadError(isRtl ? 'حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميغابايت).' : 'File size exceeds the 10MB limit.');
        continue;
      }

      const tempFile = {
        name: file.name,
        size: file.size,
        url: '',
        isUploading: true
      };
      
      setBookingFiles(prev => [...prev, tempFile]);

      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          try {
            const res = await fetch('/api/upload-booking-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileBase64: reader.result,
                fileName: file.name,
                fileType: file.type
              })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              setBookingFiles(prev => prev.map(f => f.name === file.name && f.isUploading ? { ...f, url: data.file_url, isUploading: false } : f));
            } else {
              setBookingFiles(prev => prev.filter(f => !(f.name === file.name && f.isUploading)));
              setBookingUploadError(data.error || (isRtl ? 'فشل رفع الملف.' : 'Failed to upload file.'));
            }
          } catch (err) {
            setBookingFiles(prev => prev.filter(f => !(f.name === file.name && f.isUploading)));
            setBookingUploadError(isRtl ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBookingFile = (indexToRemove: number) => {
    setBookingFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthError(isRtl ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من حجز مساحة إعلانية.' : 'Sorry, you must log in first to book advertising spaces.');
      setShowPromoModal(false);
      setShowLoginModal(true);
      return;
    }
    if (!contactName || !contactEmail || !contactMsg) {
      alert(isRtl ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    try {
      setIsSubmittingContact(true);
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          title: 'طلب حجز عرض ترويجي',
          text: contactMsg,
          userId: currentUser?.id,
          attachments: bookingFiles.filter(f => !f.isUploading).map(f => f.url)
        })
      });
      if (res.ok) {
        setContactSuccess(true);
        setTimeout(() => {
          setContactSuccess(false);
          setContactName('');
          setContactEmail('');
          setContactPhone('');
          setContactMsg('');
          setBookingFiles([]);
          setBookingUploadError('');
          setShowPromoModal(false);
        }, 2500);
      } else {
        alert(isRtl ? 'حدث خطأ أثناء الإرسال. الرجاء المحاولة مجدداً.' : 'Could not send. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(isRtl ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleContactUsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthError(isRtl ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من إرسال رسالة الدعم.' : 'Sorry, you must log in first to contact support.');
      setShowContactUsModal(false);
      setShowLoginModal(true);
      return;
    }
    if (!contactUsName || !contactUsEmail || !contactUsMsg) {
      alert(isRtl ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    try {
      setIsSubmittingContactUs(true);
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactUsName,
          email: contactUsEmail,
          phone: contactUsPhone,
          title: 'اتصل بنا - استفسار عام',
          text: contactUsMsg,
          userId: currentUser?.id
        })
      });
      if (res.ok) {
        setContactUsSuccess(true);
        setTimeout(() => {
          setContactUsSuccess(false);
          setContactUsName('');
          setContactUsEmail('');
          setContactUsPhone('');
          setContactUsMsg('');
          setShowContactUsModal(false);
        }, 2200);
      } else {
        alert(isRtl ? 'حدث خطأ أثناء الإرسال. الرجاء المحاولة مجدداً.' : 'Could not send. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(isRtl ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
    } finally {
      setIsSubmittingContactUs(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col font-sans" 
      dir={isRtl ? 'rtl' : 'ltr'}
      id="root-viewport-element"
    >
      {/* 1. Header component */}
      <Header 
        currentLang={lang}
        setLang={setLang}
        currentUser={currentUser}
        logoUrl={logoUrl}
        logoHasText={logoHasText}
        onLogout={handleLogout}
        openLoginModal={(msg?: any) => { setAuthError(typeof msg === 'string' ? msg : ''); setShowLoginModal(true); }}
        openWalletModal={() => {
          if (!currentUser) {
            setAuthError(isRtl ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من شحن المحفظة ونقاط النشر.' : 'Sorry, you must log in first to access your wallet.');
            setShowLoginModal(true);
            return;
          }
          setShowWalletModal(true);
        }}
        openChatModal={() => {
          if (!currentUser) {
            setAuthError(isRtl ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من استخدام المحادثة الفورية.' : 'Sorry, you must log in first to use the live chat.');
            setShowLoginModal(true);
            return;
          }
          setInitialSellerIdId(null);
          setShowChatModal(true);
        }}
        openProductCreateModal={() => {
          if (!currentUser) {
            setAuthError(isRtl ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من نشر وإضافة المنتجات الجديدة.' : 'Sorry, you must log in first to list products.');
            setShowLoginModal(true);
            return;
          }
          setShowProductCreateModal(true);
        }}
        openAdminModal={() => setShowAdminModal(true)}
        openBlogModal={() => setShowBlogModal(true)}
        openTermsModal={() => setShowTermsModal(true)}
        openProfileModal={() => { if (currentUser) { setProfileUserId(currentUser.id); } else { setAuthError(isRtl ? 'عذراً، يجب تسجيل الدخول أولاً لتصفح ملفك الشخصي.' : 'Please log in to view your profile.'); setShowLoginModal(true); } }}
      />

      {/* 2. Hero search & categories component */}
      <Hero 
        currentLang={lang}
        categories={categories}
        cities={cities}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExecuteSearch={handleSearchSubmit}
        openPromoModal={() => {
          if (!currentUser) {
            setAuthError(isRtl ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من حجز مساحة إعلانية.' : 'Sorry, you must log in first to book advertising spaces.');
            setShowLoginModal(true);
            return;
          }
          setShowPromoModal(true);
        }}
        pinnedProducts={pinnedProducts}
        onSelectProduct={setTargetDetailProductId}
      />

      {/* 3. Catalog Products Stage Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-150 pb-4 mb-6 gap-3">
          <div className="text-right flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
              {selectedCategory ? `${t.recommendedTitle} - ${selectedCategory}` : t.recommendedTitle}
            </h2>
            <div className="text-[11px] md:text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-normal mt-1 whitespace-normal break-words max-w-4xl">
              <motion.div
                layout
                transition={{ duration: 0.2 }}
                className="overflow-visible"
              >
                <span>
                  {isDisclaimerExpanded 
                    ? t.disclaimerText 
                    : `${t.disclaimerText.slice(0, 80)}...`
                  }
                </span>
                <button
                  type="button"
                  onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
                  className="text-amber-600 hover:text-amber-700 font-bold ml-1.5 mr-1.5 focus:outline-none transition-colors cursor-pointer inline-flex items-center gap-0.5 underline decoration-dotted"
                  id="disclaimer-toggle-btn"
                >
                  {isDisclaimerExpanded 
                    ? (lang === 'ar' ? 'عرض أقل' : (lang === 'fr' ? 'Réduire' : 'Show less'))
                    : (lang === 'ar' ? 'قراءة المزيد' : (lang === 'fr' ? 'Lire plus' : 'Read more'))
                  }
                </button>
              </motion.div>
            </div>
          </div>

          {/* Filtering states indicators */}
          {(selectedCategory || selectedCity || searchQuery) && (
            <button
              onClick={() => { setSelectedCategory(null); setSelectedCity(''); setSearchQuery(''); }}
              className="text-xs bg-slate-200 hover:bg-slate-300 py-1.5 px-3.5 rounded-lg text-slate-700 font-bold transition-all cursor-pointer"
            >
              {isRtl ? 'إعادة تهيئة كل الفلاتر ↺' : 'Rafraîchir les filtres ↺'}
            </button>
          )}
        </div>

        {/* List items grids */}
        {productsList.length === 0 ? (
          <div className="bg-white rounded-xl py-16 px-4 border border-gray-100 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto border border-gray-100">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-400 leading-normal">{t.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="products-catalog-grid">
            {productsList.map((prod) => {
              const CardComponent = ProductCard as any;
              return (
                <CardComponent 
                  key={prod.id}
                  product={prod}
                  currentLang={lang}
                  onSelect={(id: string) => setTargetDetailProductId(id)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Footer copyright & Links according to Uploaded Layout */}
      <footer className="bg-[#0b0f19] text-gray-400 text-xs py-12 px-4 md:px-8 border-t border-slate-800/80" id="app-footer-layout">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10" dir="rtl">
            
            {/* Left section: Legal links */}
            <div className="flex flex-col items-start text-right space-y-4 min-w-[200px]">
              <h4 className="text-white font-extrabold text-sm border-b-2 border-amber-500 pb-1.5 inline-block">
                روابط الدعم القانونية
              </h4>
              <nav className="flex flex-col space-y-3.5">
                <button
                  type="button"
                  onClick={() => setShowContactUsModal(true)}
                  className="flex items-center gap-2.5 text-gray-300 hover:text-amber-500 transition-colors cursor-pointer text-xs font-bold text-right"
                  id="footer-contact-us-btn"
                >
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span>اتصل بنا</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="flex items-center gap-2.5 text-gray-300 hover:text-amber-500 transition-colors cursor-pointer text-xs font-bold text-right"
                  id="footer-terms-btn"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>شروط وإخلاء المسؤولية</span>
                </button>
              </nav>
            </div>

            {/* Right section: About Platform */}
            <div className="flex-1 text-right space-y-3 max-w-4xl">
              <h3 className="text-white font-black text-sm md:text-base tracking-wide">
                سوق الجملة المغربي – Sou9 Al Joumla
              </h3>
              <p className="text-[11px] md:text-[12px] leading-relaxed text-gray-405 font-normal">
                منصة رقمية متخصصة في ربط المستوردين وتجار الجملة والمشترين المهنيين في مختلف مدن المملكة المغربية. تتيح المنصة للتجار نشر عروضهم والتواصل المباشر فيما بينهم، بينما تتم جميع عمليات التفاوض والاتفاق وإتمام البيع والشراء خارج المنصة وبشكل مباشر بين الأطراف. لا تشارك المنصة في عمليات البيع أو الشراء، ولا تستلم أي مدفوعات خاصة بالمنتجات أو الخدمات المعروضة، وتقتصر خدماتها على توفير أدوات النشر والتواصل والترويج داخل المنصة. ويتحمل كل مستخدم المسؤولية الكاملة عن المعلومات والمنتجات والمعاملات التي يقوم بها.
              </p>
            </div>

          </div>

          {/* Bottom Divider and Centered Copyright */}
          <div className="border-t border-slate-800/80 pt-6">
            <p className="text-center text-[11px] text-gray-500 font-medium tracking-wide">
              © 2026 Sou9 Al Joumla. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>

      {/* 4. MODALS & SLIDE-SHEETS PANEL ASSEMBLIES */}
      
      {/* 4.1 Login / Register Auth Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 md:p-8 space-y-6 relative border border-gray-100">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg md:text-xl font-black text-slate-900">
                {isSignUp ? t.register : t.loginSeller}
              </h3>
              <p className="text-xs text-gray-400">بوابة تجار ومشتري سوق جملة المغرب</p>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-bold text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">الاسم الكامل أو اسم شركتك التجارية</label>
                    <input 
                      type="text" 
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="شركة التجارة الذكية"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">رقم الهاتف للتواصل</label>
                    <input 
                      type="text" 
                      required
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="+212 600-000000"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">رابط واتساب المفعل للتجار</label>
                    <input 
                      type="text" 
                      required
                      value={authWhatsapp}
                      onChange={(e) => setAuthWhatsapp(e.target.value)}
                      placeholder="+212600000000"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-right col-span-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">المدينة</label>
                      <select
                        value={authCity}
                        onChange={(e) => setAuthCity(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-right focus:outline-none"
                      >
                        <option value="Casablanca">الدار البيضاء</option>
                        <option value="Rabat">الرباط</option>
                        <option value="Marrakech">مراكش</option>
                        <option value="Tanger">طنجة</option>
                        <option value="Fes">فاس</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-right col-span-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">نوع العضوية بالمنصة</label>
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value as any)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-right focus:outline-none font-bold"
                      >
                        <option value="buyer">مشتري ومحل تجزئة (Buyer)</option>
                        <option value="seller">مورد وصاحب جملة (Seller)</option>
                      </select>
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">هل لديك كود إحالة؟ (للحصول على مكافأة ترحيب)</label>
                    <input 
                      type="text" 
                      value={authReferredBy}
                      onChange={(e) => setAuthReferredBy(e.target.value)}
                      placeholder="ADMIN7147"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none font-mono"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1 text-right">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">البريد الإلكتروني للشركة</label>
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">كلمة المرور المشفرة</label>
                <input 
                  type="password" 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {!isSignUp && (
                <div className="text-left py-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowForgotModal(true);
                      setForgotStep(1);
                      setForgotEmail(authEmail);
                    }}
                    className="text-[11px] text-gray-500 hover:text-amber-600 hover:underline font-bold focus:outline-none cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
              >
                {isSignUp ? t.register : t.login}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center text-xs">
              <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-amber-600 hover:underline font-extrabold cursor-pointer"
              >
                {isSignUp ? 'لديك حساب بالفعل؟ سجل دخولك' : 'لا تملك حساب؟ انضم لعائلة تجار الجملة الآن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.1.2 OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 md:p-8 space-y-6 relative border border-gray-100 text-right">
            <button 
              onClick={() => {
                setShowOtpModal(false);
                setOtpCode('');
                setOtpSimulatedText(null);
              }} 
              className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer animate-pulse"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg md:text-xl font-black text-slate-900">تفعيل الحساب التجاري</h3>
              <p className="text-xs text-gray-400">يرجى إدخال رمز التحقق OTP المرسل لبريدك الإلكتروني</p>
              <p className="text-xs font-bold text-amber-600">{otpEmail}</p>
            </div>

            {/* Simulated Email Notification widget */}
            {otpSimulatedText && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 text-right text-xs text-amber-900 animate-pulse">
                <p className="font-extrabold">📨 [محاكاة صندوق البريد الإلكتروني للشركة]:</p>
                <p>تم إرسال رمز التحقق OTP المكون من 6 أرقام لتفعيل الحساب بنجاح:</p>
                <p className="font-mono text-base font-black tracking-widest text-center mt-1 text-slate-900 bg-white/80 py-1.5 rounded-lg border border-amber-300 select-all cursor-pointer">
                  {otpSimulatedText}
                </p>
                <p className="text-[10px] text-gray-500 text-center">(يمكنك نسخ الرمز أعلاه مباشرة لتجربة فورية دقيقة)</p>
              </div>
            )}

            {otpError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-bold text-xs flex items-center gap-1.5 justify-end">
                <span>{otpError}</span>
                <AlertTriangle className="w-4 h-4 ml-1.5 inline-block" />
              </div>
            )}

            {otpResendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-750 font-bold text-xs text-center">
                {otpResendSuccess}
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">رمز التحقق OTP (6 أرقام)</label>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-center font-mono text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
                <p className="text-[10px] text-gray-400">الرمز صالح لمدة 15 دقيقة</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
              >
                تفعيل الحساب والبدء
              </button>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center text-xs space-y-2">
              <p className="text-gray-400 text-[11px]">ألم تستلم الرمز بعد؟</p>
              <button 
                onClick={handleResendOtp} 
                className="text-amber-600 hover:underline font-extrabold cursor-pointer text-xs"
              >
                أرسل رمزاً جديداً مجدداً (إرسال OTP ثانٍ)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.1.3 Forgot Password / Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 md:p-8 space-y-6 relative border border-gray-100 text-right">
            <button 
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
                setForgotSimulatedText(null);
                setForgotError('');
              }} 
              className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg md:text-xl font-black text-slate-900">استعادة كلمة المرور</h3>
              <p className="text-xs text-gray-400">
                {forgotStep === 1 && 'الخطوة الأولى: أدخل بريدك الإلكتروني'}
                {forgotStep === 2 && 'الخطوة الثانية: أدخل رمز استعادة كلمة المرور'}
                {forgotStep === 3 && 'الخطوة الثالثة: تعيين كلمة المرور الجديدة'}
              </p>
            </div>

            {/* Simulated Email widget for Recovery OTP */}
            {forgotStep === 2 && forgotSimulatedText && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 text-right text-xs text-amber-900 animate-pulse">
                <p className="font-extrabold">📨 [محاكاة صندوق البريد الإلكتروني]:</p>
                <p>رمز استعادة كلمة المرور المؤقت صالح لمدة 15 دقيقة:</p>
                <p className="font-mono text-base font-black tracking-widest text-center mt-1 text-slate-900 bg-white/80 py-1.5 rounded-lg border border-amber-300 select-all cursor-pointer">
                  {forgotSimulatedText}
                </p>
                <p className="text-[10px] text-gray-500 text-center">(يمكنك نسخ رمز الاستعادة أعلاه مباشرة للمتابعة)</p>
              </div>
            )}

            {forgotError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-bold text-xs flex items-center gap-1.5 justify-end">
                <span>{forgotError}</span>
                <AlertTriangle className="w-4 h-4 ml-1.5 inline-block" />
              </div>
            )}

            {/* Step 1: Input Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">البريد الإلكتروني للشركة</label>
                  <input 
                    type="email" 
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                >
                  إرسال الرمز لاستعادة المعطيات
                </button>
              </form>
            )}

            {/* Step 2: Input Verification Code */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotCodeSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">رمز الاستعادة (6 أرقام)</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-center font-mono text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                >
                  التحقق من رمز الاستعادة
                </button>
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-amber-600 hover:underline text-xs"
                  >
                    رجوع للحقل السابق
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Change Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotResetSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">كلمة المرور الجديدة</label>
                  <input 
                    type="password" 
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">تأكيد كلمة المرور الجديدة</label>
                  <input 
                    type="password" 
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                >
                  تحديث وحفظ كلمة المرور بحسابك
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-gray-100 text-center text-xs">
              <button 
                onClick={() => {
                  setShowForgotModal(false);
                  setShowLoginModal(true);
                }} 
                className="text-gray-550 hover:underline"
              >
                الرجوع لتسجيل الدخول المباشر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.2 Forced Password Update Blockade for Admin on first load */}
      {forcePasswordUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 md:p-8 space-y-6 text-center border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mx-auto">
              <Lock className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base md:text-lg font-black text-slate-900">إجراء أمني إلزامي للمدير</h3>
              <p className="text-xs text-gray-450 leading-relaxed">
                عذراً، بما أنك تسجل دخولك بـ الحساب التلقائي للمرة الأولى كأدمن رئيسي للمنصة، يرجى تعيين كود مرور جديدة وخاصة فوراً لمواصلة تفعيل لوحة الإجراءات.
              </p>
            </div>

            <form onSubmit={handleForcePasswordSubmit} className="space-y-4">
              <input
                type="password"
                required
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="أدخل كلمة مرور جديدة قوية..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-center focus:outline-none focus:ring-2 focus:ring-amber-200 font-mono tracking-widest"
              />

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all uppercase"
              >
                صياغة وتحديث كود المرور
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4.3 Wallet, top-up and prepaid code redeeming panel */}
      {showWalletModal && (
        <WalletPanel 
          currentUser={currentUser}
          currentLang={lang}
          onClose={() => setShowWalletModal(false)}
          onRefreshUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            localStorage.setItem('s9_user', JSON.stringify(updatedUser));
          }}
          openProductCreateModal={() => setShowProductCreateModal(true)}
        />
      )}

      {/* 4.4 In App Live Chat slide drawer */}
      {showChatModal && (
        <ChatPanel 
          currentUser={currentUser}
          currentLang={lang}
          onClose={() => { setShowChatModal(false); setInitialSellerIdId(null); }}
          initialSellerIdId={initialSellerIdId}
        />
      )}

      {/* 4.5 Detailed Slider Slide-Sheet for Wholesale Product details */}
      {targetDetailProductId && (
        <ProductDetails 
          productId={targetDetailProductId}
          currentLang={lang}
          currentUser={currentUser}
          onClose={() => setTargetDetailProductId(null)}
          onStartChat={(sellerId) => {
            setInitialSellerIdId(sellerId);
            setTargetDetailProductId(null);
            setShowChatModal(true);
          }}
          openLoginModal={() => { setTargetDetailProductId(null); setShowLoginModal(true); }}
          onOpenSellerProfile={(userId) => { setProfileUserId(userId); }}
        />
      )}

      {/* 4.6 Product Creation Submission Modal */}
      {showProductCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 space-y-6 relative border border-gray-100 my-8">
            <button onClick={() => setShowProductCreateModal(false)} className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="text-right space-y-1">
              <h3 className="text-lg md:text-xl font-black text-slate-900">{t.createProduct}</h3>
              <p className="text-xs text-gray-400">يرجى تغذية كافة بيانات السلعة لجذب محلات ومشتري الجملة</p>
            </div>

            {createProductError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-bold text-xs">
                {createProductError}
              </div>
            )}

            <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-right overflow-y-auto max-h-[60vh] px-1 custom-scrollbar">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.productTitle}</label>
                  <input 
                    type="text" required
                    value={pForm.title}
                    onChange={(e) => setPForm({ ...pForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    placeholder="ملابس قطنية شتوية ترقية أولى"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">Titre (Français)</label>
                  <input 
                    type="text" required
                    value={pForm.titleFr}
                    onChange={(e) => setPForm({ ...pForm, titleFr: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    placeholder="Vêtements en coton hiver de gros"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.category}</label>
                  <select
                    value={pForm.category}
                    onChange={(e) => {
                      const selectedC = categories.find(cat => cat.nameFr === e.target.value);
                      setPForm({ 
                        ...pForm, 
                        category: e.target.value, 
                        subcategory: selectedC?.subcategories[0] || '' 
                      });
                    }}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.nameFr}>{lang === 'ar' ? c.nameAr : c.nameFr}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.subcategory}</label>
                  <select
                    value={pForm.subcategory}
                    onChange={(e) => setPForm({ ...pForm, subcategory: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none font-bold text-slate-700"
                  >
                    {categories.find(c => c.nameFr === pForm.category)?.subcategories.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.priceMin}</label>
                  <input 
                    type="number" required
                    value={pForm.priceMin}
                    onChange={(e) => setPForm({ ...pForm, priceMin: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-center"
                    placeholder="47"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.priceMax}</label>
                  <input 
                    type="number" required
                    value={pForm.priceMax}
                    onChange={(e) => setPForm({ ...pForm, priceMax: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-center"
                    placeholder="59"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.moqLabel}</label>
                  <input 
                    type="number" required
                    min="10"
                    placeholder="10"
                    value={pForm.moq}
                    onChange={(e) => setPForm({ ...pForm, moq: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.stockLabel}</label>
                  <input 
                    type="number" required
                    value={pForm.stock}
                    onChange={(e) => setPForm({ ...pForm, stock: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.condition}</label>
                  <select
                    value={pForm.condition}
                    onChange={(e) => setPForm({ ...pForm, condition: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="new">{t.new}</option>
                    <option value="refurbished">{t.refurbished}</option>
                  </select>
                </div>
              </div>

              {/* Shipping Method Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-dashed border-gray-150 p-3 bg-slate-50/50 rounded-xl">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">طريقة الشحن (Mode d'expédition)</label>
                  <select
                    value={pForm.shipping_type}
                    onChange={(e) => {
                      const selectedVal = e.target.value as 'free' | 'paid';
                      setPForm({ 
                        ...pForm, 
                        shipping_type: selectedVal, 
                        shipping_cost: selectedVal === 'free' ? '0' : '' 
                      });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none font-bold"
                  >
                    <option value="free">شحن مجاني (Gratuit)</option>
                    <option value="paid">شحن مدفوع (Payant)</option>
                  </select>
                </div>

                {pForm.shipping_type === 'paid' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[10px] font-bold text-slate-500 block">سعر الشحن (Frais d'expédition) (MAD)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      required
                      placeholder="مثال: 50"
                      value={pForm.shipping_cost}
                      onChange={(e) => setPForm({ ...pForm, shipping_cost: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-center font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 block">{t.description}</label>
                <textarea 
                  required
                  value={pForm.description}
                  onChange={(e) => setPForm({ ...pForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-3 text-xs focus:outline-none h-24"
                  placeholder="اكتب تفاصيل ومقاسات ومواصفات بضائع الجملة هنا..."
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 block">{t.imagesLabel}</label>
                  <span className="text-[10px] font-bold text-amber-500">
                    {pForm.images.split('\n').filter(Boolean).length} / 9
                  </span>
                </div>
                
                {/* Drag and Drop Region */}
                <div 
                  onClick={() => document.getElementById('product-image-file-input')?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      handleProductFilesSelected(Array.from(e.dataTransfer.files));
                    }
                  }}
                  className="border border-dashed border-gray-300 hover:border-amber-400 rounded-lg p-4 bg-slate-50 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2 group"
                >
                  <input 
                    id="product-image-file-input"
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files) {
                        handleProductFilesSelected(Array.from(e.target.files));
                      }
                    }}
                  />
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">
                      {isRtl ? 'اسحب الصور هنا أو اضغط للاختيار' : 'Drag images here or click to select'}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      {isRtl ? 'يدعم PNG, JPG, WEBP • حد أقصى 9 صور' : 'Supports PNG, JPG, WEBP • Max 9 images'}
                    </p>
                  </div>
                </div>

                {/* Thumbnail Previews */}
                {pForm.images.split('\n').filter(Boolean).length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2 pt-1 border-t border-slate-100">
                    {pForm.images.split('\n').filter(Boolean).map((img, index) => {
                      const isFree = index < 4;
                      return (
                        <div key={index} className="relative group rounded-lg border border-slate-200 overflow-hidden bg-slate-50 aspect-square flex items-center justify-center">
                          <img 
                            src={img} 
                            alt={`preview-${index}`} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Point Status Badge */}
                          <span className={`absolute top-0.5 right-0.5 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm text-white ${
                            isFree ? 'bg-emerald-500' : 'bg-amber-500 text-slate-905'
                          }`}>
                            {isFree ? (isRtl ? 'مجاناً' : 'Free') : `+5 ${isRtl ? 'نقاط' : 'pts'}`}
                          </span>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductRemoveImage(index);
                            }}
                            className="absolute bottom-1 left-1 p-1 bg-red-600 hover:bg-red-500 text-white rounded-md shadow-sm cursor-pointer transition-colors"
                            title={isRtl ? 'إزالة' : 'Remove'}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 block">{t.tagsLabel}</label>
                <input 
                  type="text"
                  value={pForm.tags}
                  onChange={(e) => setPForm({ ...pForm, tags: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  placeholder="ملابس, جملة, شتاء, قطن"
                />
              </div>

              <div className="bg-slate-100 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <input 
                    type="checkbox"
                    checked={pForm.isFeatured}
                    onChange={(e) => setPForm({ ...pForm, isFeatured: e.target.checked })}
                    className="w-4.5 h-4.5 rounded text-amber-500 focus:ring-amber-200 cursor-pointer"
                    id="checkbox-featured-upgrade"
                  />
                  <label htmlFor="checkbox-featured-upgrade" className="text-xs font-black text-slate-800 cursor-pointer">
                    {t.isFeaturedLabel}
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  سعر نشر الإعلان بالجملة: الإعلان العادي بخصم 20 نقطة، بينما الإعلان المميز (VIP Featured) بخصم 60 نقطة. صور إضافية فوق الـ 4 تكلف 5 نقاط للصورة.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
              >
                {t.publishBtn}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 4.6.1 Publishing Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4" id="confirm-publish-modal-root">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-right space-y-5 border border-amber-200">
            <div className="flex items-center gap-2.5 justify-end text-amber-650">
              <h4 className="text-sm md:text-base font-black">
                {insufficientPointsError ? 'رصيد نقاط غير كافٍ للنشر' : 'تأكيد خصم نقاط الإعلان'}
              </h4>
              <Coins className="w-5 h-5 text-amber-500 animate-bounce" />
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              {insufficientPointsError ? (
                <>
                  <p className="font-bold text-red-600">
                    رصيدك الحالي غير كافٍ للنشر. تحتاج إلى {requiredPointsPending} نقطة على الأقل لإتمام نشر هذا العرض.
                  </p>
                  <p className="text-[10px] text-gray-400">
                    رصيدك الحالي: <span className="font-bold text-slate-800">{currentUser?.points || 0} نقطة</span>.
                  </p>
                </>
              ) : (
                <p className="font-bold text-slate-800">
                  سيتم خصم {requiredPointsPending} نقطة من رصيدك مقابل نشر هذا الإعلان. هل ترغب بالمتابعة؟
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-start pt-2">
              <button
                type="button"
                onClick={() => setShowPublishConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg cursor-pointer transition-colors"
              >
                إلغاء
              </button>

              {insufficientPointsError ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowPublishConfirm(false);
                    setShowProductCreateModal(false);
                    setShowWalletModal(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  شحن الرصيد الآن
                </button>
              ) : (
                <button
                  type="button"
                  onClick={executePublishProduct}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  تأكيد النشر
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4.7 Super Admin Console Panels modal */}
      {showAdminModal && (
        <AdminPanel 
          currentUser={currentUser}
          currentLang={lang}
          onClose={() => {
            setShowAdminModal(false);
            fetchFilteredProducts();
            fetchPinnedProducts();
            fetchBranding();
          }}
        />
      )}

      {/* 4.8 Corporate Business Blog Guidance Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 space-y-5 relative border border-gray-100 text-right">
            <button onClick={() => setShowBlogModal(false)} className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-emerald-600 font-extrabold tracking-widest bg-emerald-50 py-1 px-2.5 rounded-md inline-block uppercase">Guide Book</span>
              <h3 className="text-lg md:text-xl font-black text-slate-900">{t.blog}</h3>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed font-normal overflow-y-auto max-h-[60vh] pr-1.5 custom-scrollbar">
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800">1. شروط البيع بالجملة ونجاح شراكات التوريد</h4>
                <p>لتكون مورد ناجح بالمنصة، يرجى التجاوب الفوري مع العملاء عبر واتساب والاتصال الهاتفي، مع الحفاظ على أقل كمية ممكنة للطلب (MOQ) لتشجيع أصحاب المشاريع الصغيرة في مقتبل وتأسيس محلاتهم التجارية بمختلف عمالات المغرب.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800">2. أهمية شارة المورد المعتمد Verified Supplier</h4>
                <p>البائعين الحاصلين على التحقق الفضي المعتمد ترتفع مبيعاتهم بمقدار 5 أضعاف مقارنة بغيرهم. تمنح الإدارة هذه الشارة بعد التحقق الفعلي من سجلات سجل المحل التجاري وسجل الضمان الاجتماعي.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800">3. نصائح للمشترين وشركاء التجزئة</h4>
                <p>ننصحكم دائماً بتأكيد موعد لمشاهدة عينات المنتجات قبل شحن الحصص الكبرى، للتأكد من موافقتها لمقاييس السوق والزبائن المغاربة الأوفياء.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.9 Disclaimer Modals */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 space-y-4 relative border border-gray-100 text-right flex flex-col max-h-[90vh]">
            <button onClick={() => setShowTermsModal(false)} className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 shrink-0">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base md:text-lg font-black text-slate-900">سياسة المنصة وإخلاء المسؤولية</h3>
              <p className="text-xs text-gray-400 font-bold">سوق الجملة - شروط وأحكام واستخدام المنصة</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-slate-700 leading-relaxed font-normal custom-scrollbar text-justify pl-2" dir="rtl">
              <div className="space-y-1 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                <h4 className="font-extrabold text-slate-900 border-b border-amber-200 pb-1 mb-1">إخلاء المسؤولية</h4>
                <p>منصة سوق الجملة هي منصة رقمية متخصصة في ربط المستوردين والموردين وتجار الجملة والمشترين المهنيين داخل المملكة المغربية. تقتصر خدمات المنصة على توفير أدوات النشر والتواصل والترويج للعروض التجارية بين المستخدمين.</p>
                <p>لا تشارك المنصة في عمليات البيع أو الشراء أو التفاوض بين الأطراف، ولا تمثل أي طرف في المعاملات التجارية، كما أنها لا تستلم أو تعالج أي مدفوعات أو تحويلات مالية تتعلق بالمنتجات أو الخدمات المعروضة.</p>
                <p>تتم جميع المفاوضات والاتفاقات وعمليات البيع والشراء بشكل مباشر وخارج المنصة بين المستخدمين، ويتحمل كل طرف المسؤولية الكاملة عن التحقق من صحة المعلومات والمنتجات والخدمات والالتزامات القانونية والتجارية المرتبطة بأي معاملة.</p>
              </div>

              <div className="space-y-1 p-1">
                <h4 className="font-extrabold text-slate-900 border-b border-gray-100 pb-1 mb-1">مسؤولية المستخدمين</h4>
                <p>يتحمل كل مستخدم المسؤولية الكاملة عن المحتوى والمعلومات والبيانات والعروض التجارية التي يقوم بنشرها داخل المنصة.</p>
                <p>ويتعهد المستخدم بأن تكون جميع المعلومات المقدمة صحيحة ودقيقة ومحدثة، وألا تتضمن أي بيانات مضللة أو غير قانونية أو تنتهك حقوق الغير.</p>
                <p>تحتفظ المنصة بحق حذف أو تعديل أو إيقاف أي محتوى أو حساب يخالف القوانين المعمول بها أو شروط الاستخدام دون إشعار مسبق.</p>
              </div>

              <div className="space-y-1 p-1">
                <h4 className="font-extrabold text-slate-900 border-b border-gray-100 pb-1 mb-1">الخصوصية وحماية البيانات</h4>
                <p>تلتزم المنصة بحماية البيانات الشخصية للمستخدمين واستخدامها فقط للأغراض المتعلقة بإدارة الحسابات وتحسين الخدمات وتسهيل التواصل بين الأطراف.</p>
                <p>لا تقوم المنصة ببيع البيانات الشخصية أو مشاركتها مع أطراف خارجية لأغراض تجارية دون موافقة المستخدم أو ما لم يكن ذلك مطلوباً بموجب القانون.</p>
                <p>قد يتم استخدام بعض المعلومات المنشورة داخل العروض التجارية بشكل ظاهر للمستخدمين الآخرين بهدف تسهيل التواصل وإتمام العلاقات التجارية.</p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-gray-200">
                <h4 className="font-extrabold text-slate-900 border-b border-gray-200 pb-1 mb-1">حدود مسؤولية المنصة</h4>
                <p>لا تضمن المنصة صحة أو جودة أو توفر المنتجات والخدمات أو المعلومات المنشورة من قبل المستخدمين.</p>
                <p className="font-semibold text-slate-900 mt-1">كما لا تتحمل أي مسؤولية عن:</p>
                <ul className="list-disc list-inside space-y-0.5 mt-0.5 pr-1 text-[11px]">
                  <li>أي خسائر مالية أو تجارية ناتجة عن التعامل بين المستخدمين.</li>
                  <li>جودة المنتجات أو مطابقتها للمواصفات.</li>
                  <li>عمليات الاحتيال أو النزاعات التجارية بين الأطراف.</li>
                  <li>أي اتفاقات أو عقود يتم إبرامها خارج المنصة.</li>
                </ul>
                <p className="font-medium text-[11px] text-slate-650 mt-1">وتبقى المسؤولية الكاملة عن أي معاملة أو اتفاق بين الأطراف المتعاملة مباشرة.</p>
              </div>

              <div className="space-y-1 p-1">
                <h4 className="font-extrabold text-slate-900 border-b border-gray-100 pb-1 mb-1">قبول الشروط</h4>
                <p>تحتفظ إدارة منصة Sou9AlJoumla بحقها الكامل في تعديل أو تحديث أو تغيير أسعار الباقات والخدمات الإعلانية أو أي رسوم أخرى مرتبطة باستخدام المنصة في أي وقت، ويصبح ذلك ساري المفعول فور نشره، ويُعتبر استمرار الاستخدام موافقة ضمنية على التعديلات.</p>
                <p>باستخدام المنصة وإنشاء حساب أو نشر أي محتوى أو التواصل مع المستخدمين الآخرين، يقر المستخدم بأنه قرأ هذه الشروط وفهمها ويوافق عليها بالكامل.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowTermsModal(false)} 
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer shrink-0"
            >
              مفهوم وموافق
            </button>
          </div>
        </div>
      )}

      {/* 4.10 Promo booking contact modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 md:p-8 space-y-5 relative border border-gray-100 text-right">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-amber-600 bg-amber-50 py-1 px-2.5 rounded-md font-bold inline-block">AD Booking</span>
              <h3 className="text-base md:text-lg font-black text-slate-900">{t.promoBtn}</h3>
              <p className="text-xs text-gray-400">يرجى تعبئة طلب حجز المساحة الإعلانية ليتصل بك منسق المبيعات لدينا</p>
            </div>

            {contactSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center text-xs font-black">
                ✓ تم تسجيل مواصفات طلبكم وحفظه بنجاح! سيتواصل معكم أحد مندوبي الموقع في غضون 24 ساعة. شكرًا لثقتكم.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-right">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">اسم الشركة أو المعلن</label>
                  <input 
                    type="text" required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="مجموعة المغربية للاستيراد"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">البريد الإلكتروني</label>
                  <input 
                    type="email" required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                    placeholder="email@company.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">رقم الهاتف أو الواتساب</label>
                  <input 
                    type="text" required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                    placeholder="+212 600-000000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">تفاصيل المساحة وتصنيف الباقة المرغوبة</label>
                  <textarea 
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none h-20"
                    placeholder="أرغب في حجز البانر الرئيسي بالصفحة الأولى لثلاثة أشهر..."
                  />
                </div>

                {/* File Upload Component */}
                <div className="space-y-1 text-right">
                  <label className="text-[10px] text-gray-400 block font-bold">
                    إرفاق ملفات أو مستندات (اختياري)
                  </label>
                  
                  {/* Drag & Drop zone */}
                  <div 
                    onClick={() => document.getElementById('promo-booking-file-input')?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) {
                        handleBookingFilesSelected(Array.from(e.dataTransfer.files));
                      }
                    }}
                    className="border border-dashed border-gray-205 hover:border-amber-500 rounded-xl p-4 bg-slate-50 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-1.5 group"
                  >
                    <input 
                      id="promo-booking-file-input"
                      type="file" 
                      multiple 
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files) {
                          handleBookingFilesSelected(Array.from(e.target.files));
                        }
                      }}
                    />
                    <Upload className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                    <div>
                      <p className="text-[10px] font-black text-slate-700">
                        {isRtl ? 'اسحب المستندات هنا أو اضغط للاختيار' : 'Drag documents here or click to select'}
                      </p>
                      <p className="text-[8px] text-gray-400 mt-0.5">
                        {isRtl 
                          ? 'الصور (PNG, JPG, WEBP) • ملفات PDF • مستندات Word (DOC, DOCX) • حد أقصى 10MB' 
                          : 'Images (PNG, JPG, WEBP) • PDF files • Word documents (DOC, DOCX) • Max 10MB'}
                      </p>
                    </div>
                  </div>

                  {/* Error feedback */}
                  {bookingUploadError && (
                    <p className="text-[9px] text-red-500 font-bold mt-1 text-right">{bookingUploadError}</p>
                  )}

                  {/* Attached files list */}
                  {bookingFiles.length > 0 && (
                    <div className="space-y-1.5 mt-2 bg-slate-50/50 p-2.5 rounded-xl border border-gray-150">
                      {bookingFiles.map((file, idx) => {
                        const isImage = /\.(jpg|jpeg|png|webp)/i.test(file.name) || file.url.toLowerCase().match(/\.(jpg|jpeg|png|webp)/i);
                        const sizeFormatted = file.size > 1024 * 1024 
                          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                          : `${(file.size / 1024).toFixed(0)} KB`;

                        return (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-gray-100 shadow-2xs">
                            <div className="flex items-center space-x-2 space-x-reverse min-w-0 pr-1">
                              {file.isUploading ? (
                                <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                              ) : isImage ? (
                                <div className="w-8 h-8 rounded border border-gray-100 overflow-hidden shrink-0">
                                  <img src={file.url} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                              
                              <div className="text-right min-w-0">
                                <p className="text-[10px] font-black text-slate-800 truncate max-w-[150px]" title={file.name}>{file.name}</p>
                                <p className="text-[8px] text-gray-400 font-mono">{sizeFormatted}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveBookingFile(idx)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContact || bookingFiles.some(f => f.isUploading)}
                  className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-black rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingContact ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : (isRtl ? 'إرسال حجز المساحة الإعلانية' : 'Submit AD space booking')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4.11 Custom Contact Us Modal */}
      {showContactUsModal && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 md:p-8 space-y-5 relative border border-gray-100 text-right" dir="rtl">
            <button 
              onClick={() => setShowContactUsModal(false)} 
              className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-705 rounded-lg cursor-pointer"
              id="close-contact-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-amber-600 bg-amber-50 py-1 px-2.5 rounded-md font-bold inline-block">Contact Center</span>
              <h3 className="text-base md:text-lg font-black text-slate-900">اتصل بنا</h3>
              <p className="text-xs text-gray-400">يسعدنا تلقي استفساراتكم ومقترحاتكم للتواصل المباشر مع إدارة المنصة</p>
            </div>

            {contactUsSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center text-xs font-black">
                ✓ تم إرسال رسالتكم بنجاح! سيتواصل معكم الدعم الفني للمنصة في أقرب وقت ممكن. شكراً لكم.
              </div>
            ) : (
              <form onSubmit={handleContactUsSubmit} className="space-y-3.5 text-right">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-405 block font-bold text-right">الاسم الكامل / اسم الشركة</label>
                  <input 
                    type="text" required
                    value={contactUsName}
                    onChange={(e) => setContactUsName(e.target.value)}
                    placeholder="امحمد الحداوي للتجارة"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-405 block font-bold text-right">البريد الإلكتروني للاتصال</label>
                  <input 
                    type="email" required
                    value={contactUsEmail}
                    onChange={(e) => setContactUsEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                    placeholder="name@company.ma"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-405 block font-bold text-right">رقم الهاتف أو الواتساب</label>
                  <input 
                    type="text" required
                    value={contactUsPhone}
                    onChange={(e) => setContactUsPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none text-right font-mono"
                    placeholder="+212 600-000000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-405 block font-bold text-right">محتوى الرسالة والاستفسار</label>
                  <textarea 
                    required
                    value={contactUsMsg}
                    onChange={(e) => setContactUsMsg(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none h-24 text-right"
                    placeholder="أرغب في الاستفسار عن كيفية تفعيل حساب مورد معتمد..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  إرسال الرسالة الآن
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4.12 Custom User Profile Modal */}
      {profileUserId && (
        <ProfileModal 
          userId={profileUserId}
          currentUser={currentUser}
          onClose={() => setProfileUserId(null)}
          onUpdateUser={(updatedUser) => { setCurrentUser(updatedUser); }}
          allProducts={productsList}
          onOpenProductDetail={(prod) => setTargetDetailProductId(prod.id)}
          openLoginModal={() => { setProfileUserId(null); setShowLoginModal(true); }}
        />
      )}

      {/* 4.13 Customer Interactive Live Floating Chat Overlay */}
      <CustomerSupportWidget 
        currentUser={currentUser}
        currentLang={lang}
      />

      {/* 4.14 Mandatory Privacy Policy & Disclaimer overlay */}
      {showMandatoryModal && currentUser && (
        <MandatoryTermsModal 
          currentUser={currentUser} 
          onAccept={handleAcceptMandatoryTerms} 
        />
      )}

    </div>
  );
}
