/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, User as UserIcon, Camera, Key, Award, BarChart3, 
  MapPin, Phone, MessageCircle, ShoppingBag, Eye, Star, 
  Coins, Sparkles, ShieldCheck, Check, Edit2, LogIn, ExternalLink
} from 'lucide-react';
import { User, Product } from '../types';

function getAvatarForUser(userId: string, customAvatar?: string): string {
  if (customAvatar && customAvatar.trim() !== '' && !customAvatar.includes('/placeholder') && !customAvatar.includes('placeholder_')) {
    return customAvatar;
  }
  const avatars = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Man
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Woman
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Man 2
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Woman 2
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Man 3
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'  // Woman 3
  ];
  
  let hash = 0;
  for (let i = 0; i < (userId || '').length; i++) {
    hash += (userId || '').charCodeAt(i);
  }
  return avatars[hash % avatars.length];
}

interface ProfileModalProps {
  userId: string; // The ID of the profile to display
  currentUser: User | null; // The logged-in user
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  allProducts: Product[];
  onOpenProductDetail: (product: Product) => void;
  openLoginModal: () => void;
}

export default function ProfileModal({
  userId,
  currentUser,
  onClose,
  onUpdateUser,
  allProducts,
  onOpenProductDetail,
  openLoginModal
}: ProfileModalProps) {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security' | 'orders'>('profile');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Orders state and fetcher coordinates
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchUserOrders = async () => {
    if (!currentUser) return;
    try {
      setLoadingOrders(true);
      const res = await fetch(`/api/orders?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchUserOrders();
    }
  }, [activeTab]);

  // Edit settings form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');

  // Password reset form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // References and cities list
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser !== null && currentUser.id === userId;
  const canSeePoints = isOwnProfile || (currentUser !== null && (currentUser.role === 'superadmin' || currentUser.role === 'admin'));

  // Let's load the targeted user stats from the backend
  const fetchProfileUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?callerId=${currentUser?.id || ''}`);
      if (res.ok) {
        const users: User[] = await res.json();
        const found = users.find(u => u.id === userId);
        if (found) {
          setProfileUser(found);
          // Initialize settings form fields
          setName(found.name || '');
          setPhone(found.phone || '');
          setWhatsapp(found.whatsapp || '');
          setCity(found.city || '');
          setCompanyName(found.companyName || '');
          setCompanyDesc(found.companyDesc || '');
          setProfileImage(found.profile_image || found.companyLogo || '');
          setBannerImage(found.banner_image || found.companyBanner || '');
        } else {
          setErrorMessage('المستخدم المطلوب غير متوفر بالمنصة');
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('حدث خطأ أثناء تحميل بيانات الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  const fetchLocalProducts = async () => {
    try {
      const viewerId = currentUser?.id || '';
      const res = await fetch(`/api/products?sellerId=${userId}&viewerId=${viewerId}`);
      if (res.ok) {
        const data = await res.json();
        setLocalProducts(data);
      } else {
        setLocalProducts(allProducts.filter(p => p.sellerId === userId && (p.status === 'active' || p.status === 'approved')));
      }
    } catch (e) {
      console.error(e);
      setLocalProducts(allProducts.filter(p => p.sellerId === userId && (p.status === 'active' || p.status === 'approved')));
    }
  };

  useEffect(() => {
    fetchProfileUser();
    fetchLocalProducts();
  }, [userId, currentUser, allProducts]);

  // Filter products owned by this targeted user (dynamic state)
  const userProducts = localProducts;

  // Convert uploaded image file to lightweight Base64 string for persistent caching/saving
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('عذراً، حجم الصورة يجب أن يكون أقل من 2 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === 'avatar') {
        setProfileImage(base64);
        setSuccessMessage('تم تحميل صورة البروفايل المعينة، لحفظ التغييرات اضغط على زر حفظ التغييرات أدناه');
      } else {
        setBannerImage(base64);
        setSuccessMessage('تم تحميل صورة البانر المعينة، لحفظ التغييرات اضغط على زر حفظ التغييرات أدناه');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit profile settings change
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name,
          phone,
          whatsapp,
          city,
          companyName,
          companyDesc,
          profile_image: profileImage,
          banner_image: bannerImage,
          password: oldPassword,
          otpCode: otpCode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'حدث خطأ غير متوقع أثناء تحديث الملف الشخصي');
      } else {
        setSuccessMessage('تم تحديث وحفظ بيانات ملفك الشخصي بنجاح!');
        onUpdateUser(data.user);
        setProfileUser(data.user);
        setOldPassword('');
        setOtpCode('');
        setOtpSent(false);
        setActiveTab('profile');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // Send Security OTP specifically for General Manager
  const sendSecurityOtp = async () => {
    if (!currentUser) return;
    setErrorMessage('');
    setSuccessMessage('');
    setSendingOtp(true);
    try {
      const response = await fetch('/api/auth/send-security-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'خطأ أثناء إرسال رمز التحقق');
      } else {
        setOtpSent(true);
        setSimulatedOtp(data.otpCodeSimulated || '');
        setSuccessMessage(`تم توليد وإرسال رمز التحقق الإضافي بنجاح إلى الرقم المحمي 06******46 (الرمز للتجربة والمحاكاة: ${data.otpCodeSimulated})`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل الاتصال بالخادم لإرسال الرمز');
    } finally {
      setSendingOtp(false);
    }
  };

  // Submit security password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMessage('');
    setSuccessMessage('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('يرجى ملء جميع حقول كلمات المرور');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('تأكيد كلمة المرور الجديدة غير متطابق');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف أو أكثر');
      return;
    }

    const isGM = currentUser.role === 'superadmin' || currentUser.id === 'u-admin';
    if (isGM && !otpCode) {
      setErrorMessage('يرجى طلب وإدخال رمز التحقق الثنائي (OTP)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          oldPassword,
          newPassword,
          otpCode: isGM ? otpCode : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'خطأ أثناء تحديث كلمة المرور');
      } else {
        setSuccessMessage('تم تحديث كلمة المرور بنجاح! كلمة المرور الجديدة فعالة الآن.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setOtpSent(false);
        setActiveTab('profile');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل الاتصال بالخادم لمزامنة الأمان');
    } finally {
      setLoading(false);
    }
  };

  if (!profileUser) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 left-4 p-1.5 bg-slate-100 rounded-full hover:bg-slate-200 cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
          <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm font-bold text-slate-700">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  // Determine displayed images
  const currentAvatarUrl = profileImage || getAvatarForUser(profileUser.id, profileUser.profile_image || profileUser.companyLogo || '');
  const currentBannerUrl = bannerImage || profileUser.banner_image || profileUser.companyBanner || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200';

  // Badges renderer
  const renderBadges = (badgesList?: string[]) => {
    const list = [...(badgesList || profileUser?.badges || [])];
    if (list.length === 0 && profileUser?.isVerified) {
       list.push('Verified Seller'); // auto fallback if isVerified flag set
    }

    const badgeMeta: Record<string, { label: string, color: string, icon: any }> = {
      'Verified Seller': { label: 'مورد موثوق', color: 'bg-blue-50 text-blue-700 border-blue-250 font-extrabold', icon: ShieldCheck },
      'Top Supplier': { label: 'مورد رئيسي', color: 'bg-purple-150 text-purple-750 border-purple-300 font-extrabold', icon: Award },
      'Premium Partner': { label: 'شريك مميز', color: 'bg-amber-100 text-amber-805 border-amber-300 font-extrabold', icon: Sparkles },
      'Trusted Company': { label: 'شركة موثوقة', color: 'bg-emerald-50 text-emerald-700 border-emerald-250 font-extrabold', icon: ShieldCheck },
      'New Seller': { label: 'بائع جديد', color: 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold', icon: Award },
      
      // Safety backups for older schema data
      verified: { label: 'مورد موثوق', color: 'bg-blue-50 text-blue-700 border-blue-200 font-extrabold', icon: ShieldCheck },
      premium: { label: 'عضو VIP', color: 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold', icon: Sparkles },
      expert: { label: 'تاجر بلاتيني', color: 'bg-purple-50 text-purple-700 border-purple-200 font-extrabold', icon: Award },
    };

    return list.map((b) => {
      const meta = badgeMeta[b] || { label: b, color: 'bg-gray-50 text-gray-750 border-gray-250 font-extrabold', icon: Award };
      const IconComp = meta.icon;
      return (
        <span key={b} className={`inline-flex items-center gap-1.5 px-3 py-1 border text-[11px] font-extrabold rounded-full ${meta.color}`}>
          <IconComp className="w-3.5 h-3.5" />
          {meta.label}
        </span>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-4 max-h-[92vh] md:max-h-[88vh]" id="profile-container-div">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-sm md:text-base">
              {isOwnProfile ? 'الملف الشخصي وإعدادات الحساب' : `الملف الشخصي للتاجر: ${profileUser.name}`}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors cursor-pointer text-gray-300 hover:text-white"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Container Body */}
        <div className="flex-1 overflow-y-auto p-0">
          
          {/* Banner Block */}
          <div className="relative h-36 md:h-48 bg-slate-100">
            <img 
              src={currentBannerUrl} 
              alt="banner" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isOwnProfile && activeTab === 'settings' && (
              <button 
                onClick={() => bannerInputRef.current?.click()}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 text-xs font-semibold rounded-lg flex items-center gap-1 shadow-md transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>تغيير غلاف البانر</span>
              </button>
            )}
            <input 
              type="file" 
              ref={bannerInputRef} 
              onChange={(e) => handleImageUpload(e, 'banner')} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Avatar block overlapping the banner bottom */}
            <div className={`absolute -bottom-10 ${document.dir === 'rtl' || true ? 'right-6 md:right-8' : 'left-6 md:left-8'} z-10`}>
              <div className="relative group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-md flex items-center justify-center">
                  {currentAvatarUrl ? (
                    <img 
                      src={currentAvatarUrl} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-3xl font-black text-slate-400 capitalize">{profileUser.name[0]}</span>
                  )}
                </div>
                {isOwnProfile && activeTab === 'settings' && (
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 group-hover:bg-black/60 text-white rounded-full flex flex-col items-center justify-center transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <span className="text-[9px] font-bold">تحديث</span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  onChange={(e) => handleImageUpload(e, 'avatar')} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          {/* User Meta Summary Bar */}
          <div className="pt-12 px-6 pb-4 md:px-8 bg-slate-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-right">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-lg md:text-xl font-black text-slate-900 select-none">
                  {profileUser.name}
                </h1>
                {/* Badges */}
                <div className="flex gap-1">
                  {renderBadges()}
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {profileUser.companyName || 'حساب تاجر فردي'} • عضو منصة منذ {new Date(profileUser.createdAt).toLocaleDateString('ar-MA')}
              </p>
            </div>

            {/* Private Navigation Tabs if own profile */}
            {isOwnProfile ? (
              <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs text-xs font-bold shrink-0 self-stretch md:self-auto">
                <button 
                  onClick={() => { setActiveTab('profile'); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`flex-1 md:flex-initial px-4 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'profile' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>الملف العام والمنتجات</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`flex-1 md:flex-initial px-4 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-r border-gray-200 ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <Edit2 className="w-4 h-4" />
                  <span>تعديل الإعدادات</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('security'); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`flex-1 md:flex-initial px-4 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-r border-gray-200 ${activeTab === 'security' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <Key className="w-4 h-4" />
                  <span>حماية الحساب</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('orders'); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`flex-1 md:flex-initial px-4 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-r border-gray-200 ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <span>📦</span>
                  <span>طلبات الشراء والبيع</span>
                </button>
              </div>
            ) : (
              <div className="text-xs bg-amber-500 text-white px-3.5 py-1.5 rounded-lg font-bold">
                حساب معروض
              </div>
            )}
          </div>

          {/* Feedback messaging */}
          {errorMessage && (
            <div className="m-4 md:mx-8 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full shrink-0"></span>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="m-4 md:mx-8 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-600 rounded-full shrink-0"></span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Tab Core Views */}
          <div className="p-4 md:p-8">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Stats and Info Column */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Detailed Stat Widgets */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs space-y-3">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">مؤشرات الأداء والمعاملات</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Stat Sales */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-500">حجم المبيعات</span>
                          <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-base font-extrabold text-slate-900 mt-1">
                          {profileUser.sales_count !== undefined ? profileUser.sales_count : (profileUser.role === 'seller' ? 142 : 0)} عملية
                        </p>
                      </div>

                      {/* Stat Rating */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-500">تقييم العملاء</span>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </div>
                        <p className="text-base font-extrabold text-slate-900 mt-1">
                          {profileUser.rating !== undefined ? profileUser.rating : (profileUser.role === 'seller' ? 4.8 : 0)} / 5.0
                        </p>
                      </div>

                      {canSeePoints && profileUser && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-between col-span-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400">رصيد النقاط الفعال</span>
                            <Coins className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                          </div>
                          <div className="flex items-baseline justify-between mt-1">
                            <p className="text-lg font-black text-slate-900">
                              {profileUser.points} نقطة
                            </p>
                            <span className="text-[10px] text-slate-400">
                              مصروف: {profileUser.points_spent !== undefined ? profileUser.points_spent : (profileUser.role === 'seller' ? 350 : 0)} PT
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Merchant Bio Description Card */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs space-y-3">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">عن التاجر وموقع النشاط</span>
                    
                    <div className="space-y-4">
                      <div className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                        {profileUser.companyDesc || profileUser.companyName || 'بائع مسجل ومرد وموزع جملة موثوق في سوق الجملة sou9aljoumla.'}
                      </div>

                      <div className="divide-y divide-gray-100 text-xs font-semibold space-y-2.5">
                        <div className="flex items-center gap-2 pt-2.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>المنطقة: {profileUser.city} • المغرب 🇲🇦</span>
                        </div>
                        <div className="flex items-center gap-2 pt-2.5">
                          <Phone className="w-4 h-4 text-emerald-500" />
                          <span>المهاتفة: {profileUser.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-2.5">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>واتساب الاستعلام: {profileUser.whatsapp}</span>
                        </div>
                      </div>

                      {/* Call to action message direct */}
                      {!isOwnProfile && (
                        <div className="flex gap-2">
                          <a 
                            href={`https://wa.me/${profileUser.whatsapp.replace('+', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>مراسلة مجانية</span>
                          </a>
                          <a 
                            href={`tel:${profileUser.phone}`}
                            className="flex-1 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-1"
                          >
                            <Phone className="w-4 h-4" />
                            <span>اتصال هاتفي</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Side: Active products published by user */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                      <ShoppingBag className="w-4.5 h-4.5 text-amber-500" />
                      <span>عروض ومنتجات التاجر الفعالة ({userProducts.length})</span>
                    </h3>
                  </div>

                  {userProducts.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500 font-bold text-sm">
                      <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      لا توجد عروض أو منتجات منشورة حالياً لهذا المستخدم
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userProducts.map((p) => (
                        <div 
                          key={p.id} 
                          onClick={() => { onOpenProductDetail(p); onClose(); }}
                          className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col group"
                        >
                          <div className="h-32 bg-slate-100 relative overflow-hidden">
                            <img 
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600'} 
                              alt={p.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            {/* Premium tag if isFeatured */}
                            {(p.isFeatured || p.is_premium) && (
                              <span className="absolute top-2 right-2 bg-amber-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                <Sparkles className="w-2.5 h-2.5" />
                                VIP مميز
                              </span>
                            )}
                          </div>
                          
                          <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between text-right">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                                {p.title}
                              </h4>
                              <p className="text-[10px] text-gray-500 line-clamp-2">
                                {p.shortDescription || p.description}
                              </p>
                              
                              {/* Status Badges for Seller Dashboard */}
                              {isOwnProfile && (
                                <div className="pt-1.5 flex flex-col gap-1">
                                  {p.status === 'pending_review' && (
                                    <span className="inline-flex items-center justify-center w-fit px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                      ● قيد المراجعة
                                    </span>
                                  )}
                                  {(p.status === 'approved' || p.status === 'active') && (
                                    <span className="inline-flex items-center justify-center w-fit px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      ✔ تمت الموافقة
                                    </span>
                                  )}
                                  {p.status === 'rejected' && (
                                    <div className="space-y-1">
                                      <span className="inline-flex items-center justify-center w-fit px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                        🗙 مرفوض
                                      </span>
                                      {p.rejectionReason && (
                                        <p className="text-[9px] bg-rose-50/50 text-rose-600 p-1 rounded border border-rose-100 whitespace-pre-wrap leading-tight">
                                          <strong className="block font-bold">السبب:</strong>
                                          {p.rejectionReason}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-1">
                              <span className="text-amber-500 font-extrabold text-xs">
                                {p.priceMin} - {p.priceMax} {p.currency}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-sm">
                                أقل طلب: {p.moq} {p.currency === 'MAD' ? 'قطع' : 'pcs'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'settings' && isOwnProfile && (
              <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl mx-auto bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 pb-3 border-b border-gray-100">
                  <Edit2 className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-900">تعديل الإعدادات الأساسية لحسابك</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field (protected) */}
                  <div className="space-y-1.5 text-right md:col-span-2">
                    <label className="text-xs font-black text-slate-800 block">
                      الاسم الكامل / اسم العرض بالمنصة
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right bg-white"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                    <p className="text-[10px] text-gray-400 font-medium">
                      * يرجى العلم أنه لتفادي الاحتيال، يسمح بتغيير اسمك مرة واحدة في الـ 60 يوم فقط بالمنصة.
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-800 block">رقم الهاتف</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-right bg-white"
                      placeholder="مثل: +212611223344"
                      required
                    />
                  </div>

                  {/* Whatsapp */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-800 block">رقم الواتساب الفعال للطلبات</label>
                    <input 
                      type="tel" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-right bg-white"
                      placeholder="مثل: +212611223344"
                      required
                    />
                  </div>

                  {/* City dropdown */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-800 block">المدينة الرئيسية للنشاط</label>
                    <select 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl bg-white focus:border-amber-500 focus:outline-none"
                      required
                    >
                      <option value="">اختر المدينة</option>
                      <option value="Casablanca">الدار البيضاء (Casablanca)</option>
                      <option value="Rabat">الرباط (Rabat)</option>
                      <option value="Marrakech">مراكش (Marrakech)</option>
                      <option value="Fès">فاس (Fès)</option>
                      <option value="Tanger">طنجة (Tanger)</option>
                      <option value="Agadir">أكادير (Agadir)</option>
                      <option value="Oujda">وجدة (Oujda)</option>
                      <option value="Kénitra">القنيطرة (Kénitra)</option>
                      <option value="Tétouan">تطوان (Tétouan)</option>
                      <option value="Nador">الناظور (Nador)</option>
                    </select>
                  </div>

                  {/* Company Name (only relevant if role is seller) */}
                  {currentUser.role === 'seller' && (
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-black text-slate-800 block">اسم المؤسسة أو مكتب الجملة</label>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-right bg-white"
                        placeholder="مثل: مؤسسة الشمال للجملة"
                      />
                    </div>
                  )}

                  {/* Short Bio */}
                  <div className="space-y-1.5 text-right md:col-span-2">
                    <label className="text-xs font-black text-slate-800 block">نبذة تعريفية سريعة عن خدماتك المعروضة</label>
                    <textarea 
                      value={companyDesc}
                      onChange={(e) => setCompanyDesc(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-right bg-white min-h-[80px]"
                      placeholder="مثال: مورد لملابس الأزياء من المصلحة الأولى للتوزيع السريع في جميع المدن بالمغرب..."
                    />
                  </div>

                  {/* General Manager Identity Verification */}
                  {(currentUser.role === 'superadmin' || currentUser.id === 'u-admin') && (
                    <div className="md:col-span-2 bg-slate-50 p-4.5 rounded-2xl border border-dashed border-gray-200 space-y-3.5 text-right mt-3">
                      <h4 className="text-xs font-black text-red-600">📋 تأكيد التحقق الثنائي الآمن لإعدادات المدير العام</h4>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-800 block">كلمة المرور الإدارية الحالية للتأكيد *</label>
                        <input 
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="أدخل كلمة المرور الحالية"
                          className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-right bg-white"
                          required
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          الهاتف المرتبط بإشعارات الـ OTP: <span className="font-mono text-slate-800 text-xs tracking-wider font-extrabold">06******46</span>
                        </span>
                        <button
                          type="button"
                          onClick={sendSecurityOtp}
                          disabled={sendingOtp}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-xl cursor-pointer disabled:opacity-50"
                        >
                          {sendingOtp ? 'جاري الإرسال...' : (otpSent ? 'إعادة إرسال رمز الـ OTP' : 'أرسل الرمز الثنائي (OTP)')}
                        </button>
                      </div>

                      {simulatedOtp && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] p-2 rounded-lg font-bold text-center">
                          رمز التحقق للمحاكاة: <span className="font-mono font-black text-xs text-emerald-600 tracking-widest">{simulatedOtp}</span>
                        </div>
                      )}
                      
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-800 block">
                          رمز الـ OTP المكون من 6 أرقام *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="أدخل الكود المستلم"
                          className="w-full text-center font-mono font-black text-sm tracking-widest p-3 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none placeholder-gray-300 bg-white"
                          required
                        />
                      </div>
                    </div>
                  )}

                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab('profile'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="px-5 py-2.5 bg-gray-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
                  >
                    إلغاء وإغلاق
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2.5 bg-amber-500 text-white font-extrabold text-xs rounded-xl hover:bg-amber-600 text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات بالكامل'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && isOwnProfile && (
              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md mx-auto bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 pb-3 border-b border-gray-100">
                  <Key className="w-4.5 h-4.5 text-red-500" />
                  <h3 className="text-sm font-black text-slate-900">تحديث أمان الحساب وكلمة المرور</h3>
                </div>

                <div className="space-y-4">
                  {/* Current pass input */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-800 block">كلمة المرور الحالية</label>
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-right placeholder-gray-300"
                      placeholder="••••••••••••"
                      required
                    />
                  </div>

                  {/* New pass input */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-800 block">كلمة المرور الجديدة</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-right placeholder-gray-300"
                      placeholder="أدخل 6 أحرف على الأقل"
                      required
                    />
                  </div>

                  {/* Confirm pass input */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-800 block">تأكيد كلمة المرور الجديدة</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-right placeholder-gray-300"
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      required
                    />
                  </div>

                  {(currentUser.role === 'superadmin' || currentUser.id === 'u-admin') && (
                    <div className="bg-slate-50 p-4.5 rounded-2xl border border-dashed border-gray-200 space-y-3.5 text-right">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-slate-500 block">
                          الهاتف المرتبط بالحساب: <span className="font-mono text-slate-800 text-xs tracking-wider">06******46</span>
                        </span>
                        <button
                          type="button"
                          onClick={sendSecurityOtp}
                          disabled={sendingOtp}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-xl cursor-pointer disabled:opacity-50"
                        >
                          {sendingOtp ? 'جاري الإرسال...' : (otpSent ? 'إعادة إرسال الرمز (OTP)' : 'أرسل رمز التحقق (OTP) للهاتف')}
                        </button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-red-600 block flex items-center justify-end gap-1 font-sans">
                          رمز التحقق الإضافي (OTP) المطلوب لحماية المدير العام *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="أدخل رمز الـ 6 أرقام المستلم"
                          className="w-full text-center font-mono font-black text-sm tracking-widest p-3 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none placeholder-gray-300"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab('profile'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="px-5 py-2.5 bg-gray-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2.5 bg-red-600 text-white font-extrabold text-xs rounded-xl hover:bg-red-700 text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {loading ? 'جاري التحديث...' : 'تغيير كلمة المرور فوراً'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'orders' && isOwnProfile && (
              <div className="space-y-6 max-w-4xl mx-auto bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>📦</span>
                    <span>سجل الفواتير وطلبات الشحن والتسليم</span>
                  </h3>
                  <button 
                    type="button"
                    onClick={fetchUserOrders}
                    className="text-xs text-amber-600 hover:underline font-bold"
                  >
                    تحديث السجل ⟳
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-12 text-xs text-gray-500 animate-pulse font-bold text-slate-500">
                    جاري تحميل كشوفات الفواتير الآمنة...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-semibold text-xs border border-dashed border-gray-150 rounded-xl space-y-1.5 p-4">
                    <div className="text-2xl">📦</div>
                    <div className="text-slate-800 font-bold">لا توجد طلبات شراء مسجلة بحسابك حالياً.</div>
                    <p className="text-[10px] text-gray-400 font-normal">عند شرائك لمنتج جملة، ستظهر كشوف فواتير الشحن والتفاصيل هنا فوراً.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div key={ord.id} className="border border-gray-150 rounded-xl p-4 text-right space-y-3 bg-slate-50/50 hover:bg-slate-50 transition">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 text-xs text-gray-500 font-semibold">
                          <span className="font-mono text-slate-800 font-black bg-slate-200 px-2 py-0.5 rounded text-[10px]">مرجع الطلب: {ord.id}</span>
                          <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleString('ar-MA')}</span>
                        </div>

                        <div className="flex gap-3 text-right items-center">
                          <img 
                            src={ord.productImage || ''} 
                            alt={ord.productTitle} 
                            className="w-12 h-12 object-cover rounded-md border border-gray-150 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <h4 className="text-xs font-black text-slate-900 truncate">{ord.productTitle}</h4>
                            <p className="text-[10px] text-gray-400 font-bold">الكمية: {ord.quantity} قطعة • السعر الفردي: {ord.unitPrice} MAD</p>
                            <p className="text-[10px] text-amber-700 font-black">
                              طريقة الشحن: {ord.shippingType === 'paid' ? `مدفوع والرسوم ${ord.shippingCost} MAD` : 'مجاني ✅'}
                            </p>
                          </div>
                        </div>

                        {/* Order Address & Recipient Info */}
                        <div className="bg-white border border-gray-150 rounded-lg p-3 space-y-1 text-[11px] text-slate-650 leading-relaxed font-semibold">
                          <div>
                            <span className="text-slate-400">المستلم: </span>
                            <span className="text-slate-800 font-extrabold">{ord.buyerName} ({ord.buyerPhone})</span>
                          </div>
                          <div>
                            <span className="text-slate-400">عنوان الشحن: </span>
                            <span className="text-slate-800 font-extrabold">{ord.shippingAddress}</span>
                          </div>
                        </div>

                        {/* Pricing details and total price */}
                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 text-xs font-black">
                          <span className="font-mono text-amber-800 text-sm">
                            {ord.totalPrice.toLocaleString()} MAD
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            <span>المجموع الإجمالي شامل التوصيل:</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
