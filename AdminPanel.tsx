/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Users, ShoppingBag, FileText, Activity, ShieldCheck, 
  Trash2, Award, Ban, UserCheck, Search, Coins, PlusCircle, Plus, 
  Key, Calendar, Receipt, MessageCircle, AlertTriangle, Play,
  Smartphone, Wallet, CreditCard,
  Shirt, Watch, Sparkles, UtensilsCrossed, Home, Grid, Folder,
  GripVertical, RotateCcw, ArrowUp, ArrowDown, Save
} from 'lucide-react';
import { translations } from '../lib/i18n';
import { User, Product, Coupon, RechargeCode, AuditLog, Report } from '../types';

interface AdminPanelProps {
  currentUser: User | null;
  currentLang: 'ar' | 'fr' | 'en';
  onClose: () => void;
}

export default function AdminPanel({
  currentUser,
  currentLang,
  onClose
}: AdminPanelProps) {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'products' | 'moderation' | 'coupons' | 'recharge' | 'logs' | 'settings' | 'roles' | 'payments' | 'cloudflare' | 'google' | 'verification' | 'badges' | 'branding' | 'messages' | 'package-prices' | 'categories-order'>('stats');
  
  // Package Prices state
  const [packages, setPackages] = useState<any[]>([]);
  const [savingPackages, setSavingPackages] = useState(false);
  const [packageError, setPackageError] = useState('');
  const [packageSuccess, setPackageSuccess] = useState('');
  
  // Google Services Integration state
  const [googleConfig, setGoogleConfig] = useState({
    verification_code: '',
    ga_id: '',
    gtm_id: '',
    merchant_id: '',
  });
  const [savingGoogle, setSavingGoogle] = useState(false);

  // Cloudflare Deployment configuration state
  const [cfConfig, setCfConfig] = useState({
    cfApiToken: '',
    cfAccountId: '',
    cfZoneId: '',
    cfDomainName: '',
  });

  const [testingCf, setTestingCf] = useState(false);
  const [savingCf, setSavingCf] = useState(false);
  const [cfTestResult, setCfTestResult] = useState<{ success: boolean; message: string; tested: boolean } | null>(null);

  // Payments Gate integration config state
  const [paymentConfig, setPaymentConfig] = useState({
    paypalEnabled: true,
    paypalClientId: '',
    paypalClientSecret: '',
    paypalMode: 'sandbox',
    cardEnabled: true,
    cardPublicKey: '',
    cardSecretKey: '',
    cardWebhookSecret: '',
    cashEnabled: true,
    cashAgencyName: '',
    cashContact: '',
    cashInstructions: ''
  });

  // Branding config states
  const [brandingLogo, setBrandingLogo] = useState('');
  const [brandingFavicon, setBrandingFavicon] = useState('');
  const [logoHasText, setLogoHasText] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState(false);
  const [brandingError, setBrandingError] = useState('');

  // Message center states (Gmail style)
  const [contactThreads, setContactThreads] = useState<any[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeMailFolder, setActiveMailFolder] = useState<'inbox' | 'unread' | 'read' | 'important' | 'attachments' | 'archive' | 'trash'>('inbox');
  const [mailSearchQuery, setMailSearchQuery] = useState('');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyAttachments, setAdminReplyAttachments] = useState<string[]>([]);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Start direct/mass new messages states
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeText, setComposeText] = useState('');
  const [composeType, setComposeType] = useState<'normal' | 'admin' | 'important' | 'promo'>('normal');
  const [composeSelectedUserIds, setComposeSelectedUserIds] = useState<string[]>([]);
  const [composeUserSearch, setComposeUserSearch] = useState('');
  const [composeAttachments, setComposeAttachments] = useState<string[]>([]);
  const [isSendingCompose, setIsSendingCompose] = useState(false);
  
  // Lists
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<User[]>([]);
  const [panelCategories, setPanelCategories] = useState<any[]>([]);
  const [savingCategoryOrder, setSavingCategoryOrder] = useState(false);
  const [categoriesMessage, setCategoriesMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [deleteTargetCoupon, setDeleteTargetCoupon] = useState<Coupon | null>(null);
  const [rechargeCodes, setRechargeCodes] = useState<RechargeCode[]>([]);
  const [deleteTargetRechargeCode, setDeleteTargetRechargeCode] = useState<RechargeCode | null>(null);
  const [adminTransactions, setAdminTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // Product Moderation states
  const [modStatusFilter, setModStatusFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected' | 'escalated' | 'changes_requested'>('pending_review');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [modSearchQuery, setModSearchQuery] = useState('');
  const [modSellerQuery, setModSellerQuery] = useState('');
  const [selectedModProduct, setSelectedModProduct] = useState<Product | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [modMessage, setModMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Platform admin settings overrides
  const [publishingCost, setPublishingCost] = useState(20);
  const [paidPublishingEnabled, setPaidPublishingEnabled] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Search & Filters inputs
  const [userQuery, setUserQuery] = useState('');
  
  // User creation states inside admin panel
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleChangePending, setRoleChangePending] = useState<{ userId: string; newRole: string } | null>(null);
  const [roleChangePassword, setRoleChangePassword] = useState('');
  const [roleChangeOtp, setRoleChangeOtp] = useState('');
  const [roleChangeOtpSent, setRoleChangeOtpSent] = useState(false);
  const [roleChangeOtpSending, setRoleChangeOtpSending] = useState(false);
  const [roleChangeOtpSimulated, setRoleChangeOtpSimulated] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    city: 'الرباط',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState('');

  const [productQuery, setProductQuery] = useState('');

  // Point weight modifiers
  const [pointAdjustMap, setPointAdjustMap] = useState<Record<string, string>>({});

  // Points advanced management states
  const [pointsManageUser, setPointsManageUser] = useState<User | null>(null);
  const [pointsManageAmount, setPointsManageAmount] = useState('');
  const [pointsManageReason, setPointsManageReason] = useState('');
  const [pointsManageOverride, setPointsManageOverride] = useState(false);
  const [pointsManageSubmitting, setPointsManageSubmitting] = useState(false);

  // Coupon generators form
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'points' as 'percentage' | 'fixed' | 'points',
    value: 50,
    usageLimit: 100,
    expiryDate: '2026-12-31T23:59:00'
  });

  // Bulk Recharge Generator form
  const [rechargeForm, setRechargeForm] = useState({
    points: 300,
    count: 5,
    expiryDate: '2026-12-31T23:59:00'
  });

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      // Stats API
      const rStats = await fetch('/api/admin/stats');
      if (rStats.ok) {
        const data = await rStats.json();
        setStats(data);
      }

      // Users API
      const rUsers = await fetch(`/api/admin/users?callerId=${currentUser?.id || ''}`);
      if (rUsers.ok) setUsers(await rUsers.json());

      // Products API
      const rProducts = await fetch('/api/admin/products');
      if (rProducts.ok) setProducts(await rProducts.json());

      // Coupons API
      const rCoupons = await fetch('/api/admin/coupons');
      if (rCoupons.ok) setCoupons(await rCoupons.json());

      // Recharge codes API
      const rCodes = await fetch('/api/admin/recharge-codes');
      if (rCodes.ok) setRechargeCodes(await rCodes.json());

      // Wallet transactions API
      const rTxs = await fetch(`/api/admin/transactions?adminId=${currentUser?.id || ''}`);
      if (rTxs.ok) setAdminTransactions(await rTxs.json());
 
      // Audit logs API
      const rLogs = await fetch(`/api/admin/audit-logs?adminId=${currentUser?.id || ''}`);
      if (rLogs.ok) setAuditLogs(await rLogs.json());
 
      // Reports API
      const rReports = await fetch(`/api/admin/reports?adminId=${currentUser?.id || ''}`);
      if (rReports.ok) setReports(await rReports.json());

      // Settings API
      try {
        const rSettings = await fetch('/api/admin/settings');
        if (rSettings.ok) {
          const settingsData = await rSettings.json();
          setPublishingCost(settingsData.publishingCost);
          setPaidPublishingEnabled(settingsData.paidPublishingEnabled);
        }
      } catch (err) {
        console.error("Error loading publishing settings in AdminPanel", err);
      }

      // Fetch secured Payment settings
      try {
        const rPayments = await fetch(`/api/admin/payment-settings?adminId=${currentUser.id}`);
        if (rPayments.ok) {
          setPaymentConfig(await rPayments.json());
        }
      } catch (err) {
        console.error("Error loading payment settings in AdminPanel", err);
      }

      // Fetch secured Cloudflare settings
      try {
        const rCf = await fetch(`/api/admin/cloudflare-settings?adminId=${currentUser.id}`);
        if (rCf.ok) {
          setCfConfig(await rCf.json());
        }
      } catch (err) {
        console.error("Error loading cloudflare settings in AdminPanel", err);
      }

      // Fetch secured Google integration settings
      try {
        const rGoogle = await fetch(`/api/admin/google-integration?adminId=${currentUser?.id}`);
        if (rGoogle.ok) {
          setGoogleConfig(await rGoogle.json());
        }
      } catch (err) {
        console.error("Error loading google integration settings in AdminPanel", err);
      }

      // Fetch secured Branding settings
      try {
        const rBranding = await fetch(`/api/admin/branding?adminId=${currentUser?.id}`);
        if (rBranding.ok) {
          const brandingData = await rBranding.json();
          setBrandingLogo(brandingData.logoUrl || '');
          setBrandingFavicon(brandingData.faviconUrl || '');
          setLogoHasText(!!brandingData.logoHasText);
        }
      } catch (err) {
         console.error("Error loading branding settings in AdminPanel", err);
      }

      // Fetch secured Contact Threads settings
      try {
        if (currentUser) {
          const rContact = await fetch(`/api/admin/contact/threads?adminId=${currentUser.id}`);
          if (rContact.ok) {
            setContactThreads(await rContact.json());
          }
        }
      } catch (err) {
        console.error("Error loading contact threads in AdminPanel", err);
      }

      // Fetch dynamic packages
      try {
        if (currentUser) {
          const rPkgs = await fetch(`/api/admin/packages?adminId=${currentUser.id}`);
          if (rPkgs.ok) {
            setPackages(await rPkgs.json());
          }
        }
      } catch (err) {
        console.error("Error loading point packages in AdminPanel", err);
      }

      // Fetch categories
      try {
        const rCat = await fetch('/api/categories');
        if (rCat.ok) {
          setPanelCategories(await rCat.json());
        }
      } catch (err) {
        console.error("Error loading categories in AdminPanel", err);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // Package Prices settings modifiers
  const handleSavePackages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setSavingPackages(true);
      setPackageSuccess('');
      setPackageError('');

      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          packages: packages
        })
      });

      const body = await res.json();
      if (res.ok) {
        setPackageSuccess(isRtl ? 'تم تحديث أسعار وكميات باقات شحن النقاط فورياً وبنجاح!' : 'Package prices updated successfully!');
        setPackages(body.packages);
        // Dispatch custom event to trigger other parts if active in the UI
        window.dispatchEvent(new Event('packages-updated'));
      } else {
        setPackageError(body.error || 'فشل تحديث باقات النقاط.');
      }
    } catch (err: any) {
      console.error(err);
      setPackageError(isRtl ? 'حدث خطأ بالاتصال بالخادم.' : 'Server connection error.');
    } finally {
      setSavingPackages(false);
    }
  };

  const handleAddPackage = () => {
    const newId = 'p_custom_' + Math.floor(1000 + Math.random() * 9000);
    setPackages([
      ...packages,
      {
        id: newId,
        name: isRtl ? 'باقة جديدة' : 'New Package',
        points: 100,
        priceUsd: 10
      }
    ]);
  };

  const handleUpdatePackageField = (index: number, field: string, value: any) => {
    const updated = [...packages];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setPackages(updated);
  };

  const handleDeletePackage = (index: number) => {
    if (packages.length <= 1) {
      setPackageError(isRtl ? 'يجب أن تترك باقة واحدة على الأقل في النظام.' : 'You must keep at least one package.');
      return;
    }
    const updated = [...packages];
    updated.splice(index, 1);
    setPackages(updated);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setSavingSettings(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publishingCost: Number(publishingCost),
          paidPublishingEnabled: !!paidPublishingEnabled,
          adminId: currentUser.id
        })
      });
      if (res.ok) {
        alert('تم حفظ وتعديل إعدادات النشر ومصاريف الدفع بنجاح وتسجيل العملية بسجلات الخصم!');
        fetchAdminData();
      } else {
        alert('فشل حفظ إعدادات النظام.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setSavingGoogle(true);
      const res = await fetch('/api/admin/google-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          ...googleConfig
        })
      });
      if (res.ok) {
        alert(isRtl ? 'تم حفظ وتعميم إعدادات Google وتحديثها بنجاح واستهدافها مباشرة!' : 'Google properties updated and synchronized successfully!');
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Internal Server Error.');
    } finally {
      setSavingGoogle(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setSavingBranding(true);
      setBrandingSuccess(false);
      setBrandingError('');
      const res = await fetch('/api/admin/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          logoUrl: brandingLogo,
          faviconUrl: brandingFavicon,
          logoHasText
        })
      });
      if (res.ok) {
        setBrandingSuccess(true);
        alert(isRtl ? 'تم تحديث وحفظ هوية الموقع والشعار والـ Favicon بنجاح!' : 'Branding and Favicon updated successfully!');
        fetchAdminData();
      } else {
        const data = await res.json();
        setBrandingError(data.error || 'Failed to save.');
        alert(data.error || 'خطأ في الحفظ');
      }
    } catch (err) {
      console.error(err);
      setBrandingError('Internal Server Error');
      alert('Internal Server Error.');
    } finally {
      setSavingBranding(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (type === 'logo') {
      const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
      if (!allowed.some(ext => fileName.endsWith(ext))) {
        alert(isRtl ? 'عذراً، صيغة غير مدعومة للشعار. المسموح به: PNG, SVG, JPG, WEBP' : 'Unsupported logo format. Allowed: PNG, SVG, JPG, WEBP');
        return;
      }
    } else {
      const allowed = ['.ico', '.png'];
      if (!allowed.some(ext => fileName.endsWith(ext))) {
        alert(isRtl ? 'عذراً، صيغة غير مدعومة للأيقونة المصغرة. المسموح به: ICO, PNG' : 'Unsupported favicon format. Allowed: ICO, PNG');
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        if (type === 'logo') {
          setBrandingLogo(event.target.result as string);
        } else {
          setBrandingFavicon(event.target.result as string);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleThreadAction = async (threadId: string, action: 'read' | 'unread' | 'important_toggle' | 'archive_toggle' | 'trash_toggle' | 'delete') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/contact/thread-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          threadId,
          action
        })
      });
      if (res.ok) {
        const result = await res.json();
        setContactThreads(prev => {
          if (action === 'delete') {
            return prev.filter(t => t.id !== threadId);
          }
          return prev.map(t => t.id === threadId ? result.thread : t);
        });
        if (selectedThreadId === threadId && (action === 'delete' || action === 'trash_toggle' || action === 'archive_toggle')) {
          setSelectedThreadId(null);
        }
      } else {
        alert('حدث خطأ أثناء تحديث حالة الرسالة.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent, threadId: string) => {
    e.preventDefault();
    if (!currentUser || !adminReplyText.trim()) return;

    try {
      setIsSendingReply(true);
      const res = await fetch('/api/admin/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          threadId,
          text: adminReplyText,
          attachments: adminReplyAttachments
        })
      });

      if (res.ok) {
        const data = await res.json();
        setContactThreads(prev => prev.map(t => t.id === threadId ? data.thread : t));
        setAdminReplyText('');
        setAdminReplyAttachments([]);
        alert(isRtl ? 'تم إرسال الرد ومشاركته بنجاح!' : 'Reply submitted successfully!');
      } else {
        const errData = await res.json();
        alert(errData.error || 'خطأ في عملية الرد.');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الإرسال.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleReplyAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          const attachmentPayload = `filename:${file.name}||data:${base64Url}`;
          setAdminReplyAttachments(prev => [...prev, attachmentPayload]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleComposeAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          const attachmentPayload = `filename:${file.name}||data:${base64Url}`;
          setComposeAttachments(prev => [...prev, attachmentPayload]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (composeSelectedUserIds.length === 0) {
      alert(isRtl ? 'يرجى تحديد مستخدم واحد على الأقل لإرسال الرسالة.' : 'Please select at least one recipient.');
      return;
    }
    if (!composeTitle.trim() || !composeText.trim()) {
      alert(isRtl ? 'العنوان والمحتوى حقول مطلوبة.' : 'Title and content are required.');
      return;
    }

    try {
      setIsSendingCompose(true);
      const res = await fetch('/api/admin/contact/start-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          userIds: composeSelectedUserIds,
          title: composeTitle,
          text: composeText,
          type: composeType,
          attachments: composeAttachments
        })
      });

      if (res.ok) {
        alert(isRtl ? 'تم إرسال الرسالة بنجاح وإنشاء المحادثة!' : 'Message sent successfully and thread created!');
        // Refresh contact threads
        const rContact = await fetch(`/api/admin/contact/threads?adminId=${currentUser.id}`);
        if (rContact.ok) {
          setContactThreads(await rContact.json());
        }

        // Reset fields
        setComposeTitle('');
        setComposeText('');
        setComposeSelectedUserIds([]);
        setComposeAttachments([]);
        setComposeType('normal');
        setComposeUserSearch('');
        setIsComposeOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || 'خطأ أثناء إرسال الرسالة.');
      }
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء إجراء الطلب.');
    } finally {
      setIsSendingCompose(false);
    }
  };

  const handleSaveCf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setSavingCf(true);
      const res = await fetch('/api/admin/cloudflare-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          ...cfConfig
        })
      });
      if (res.ok) {
        alert(isRtl ? 'تم حفظ وتعميم إعدادات Cloudflare وتحديثها بنجاح!' : 'Cloudflare settings saved and deployed successfully!');
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save Cloudflare settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Internal Server Error.');
    } finally {
      setSavingCf(false);
    }
  };

  const handleTestCf = async () => {
    if (!currentUser) return;
    if (!cfConfig.cfApiToken || !cfConfig.cfZoneId) {
      alert(isRtl ? 'الرجاء ملء حقل رمز API Token ومعرف المنطقة Zone ID كحد أدنى لاختبار الاتصال!' : 'Please enter API Token and Zone ID to test connection!');
      return;
    }
    try {
      setTestingCf(true);
      setCfTestResult(null);
      const res = await fetch('/api/admin/cloudflare-test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          ...cfConfig
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCfTestResult({
          success: !!data.success,
          message: data.message || (data.success ? 'Connected successfully!' : 'Connection failed.'),
          tested: true
        });
      } else {
        setCfTestResult({
          success: false,
          message: 'فشل الاتصال بسبب خطأ غير متوقع بالشبكة.',
          tested: true
        });
      }
    } catch (err: any) {
      console.error(err);
      setCfTestResult({
        success: false,
        message: `Error: ${err.message}`,
        tested: true
      });
    } finally {
      setTestingCf(false);
    }
  };

  const handleUserAction = async (targetUserId: string, actionName: string, additionalParams: any = {}) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          action: actionName,
          adminId: currentUser.id,
          ...additionalParams
        })
      });

      if (res.ok) {
        alert(t.admin_actionSuccess);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePointsSubmit = async (subAction: 'add' | 'deduct' | 'zero') => {
    if (!currentUser || !pointsManageUser) return;
    
    // Validations:
    if (subAction !== 'zero') {
      const num = Number(pointsManageAmount || 0);
      if (isNaN(num) || num <= 0) {
        alert(isRtl ? 'الرجاء إدخال رقم صحيح أكبر من الصفر لقيمة النقاط.' : 'Please enter a valid points number greater than zero.');
        return;
      }
    } else {
      const b = window.confirm(isRtl ? `هل أنت متأكد تماماً من تصفير رصيد نقاط العضو "${pointsManageUser.name}" بالكامل وجعله = 0؟` : `Are you sure you want to completely zero out points for "${pointsManageUser.name}" to 0?`);
      if (!b) return;
    }

    setPointsManageSubmitting(true);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pointsManageUser.id,
          action: 'adjust-points',
          adminId: currentUser.id,
          subAction,
          pointsAmount: subAction !== 'zero' ? Number(pointsManageAmount) : 0,
          override: pointsManageOverride,
          reason: pointsManageReason.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(isRtl ? 'تم تنفيذ العملية بنجاح وتوثيق الحركة المالية بسجل التدقيق الأمني!' : 'Points adjusted and logged in operational audit log successfully.');
        setPointsManageAmount('');
        setPointsManageReason('');
        setPointsManageOverride(false);
        setPointsManageUser(null);
        fetchAdminData(); // Refresh immediate state
      } else {
        alert(data.error || 'خطأ في معالجة العملية');
      }
    } catch (err: any) {
      console.error(err);
      alert(isRtl ? 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.' : 'Unexpected network error.');
    } finally {
      setPointsManageSubmitting(false);
    }
  };

  const handleProductAction = async (prodId: string, actionName: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/products/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prodId,
          action: actionName,
          adminId: currentUser.id
        })
      });

      if (res.ok) {
        alert(t.admin_actionSuccess);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleModerateProduct = async (prodId: string | null, decision: 'approved' | 'rejected' | 'escalated' | 'changes_requested', reason?: string, bulkIds?: string[]) => {
    if (!currentUser) return;
    setModerationLoading(true);
    setModMessage(null);
    try {
      const res = await fetch('/api/admin/products/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prodId,
          productIds: bulkIds,
          status: decision,
          rejectionReason: reason || '',
          adminId: currentUser.id
        })
      });

      const body = await res.json();
      if (res.ok) {
        let msg = 'تم تطبيق القرار بنجاح.';
        if (decision === 'approved') msg = 'تهانينا! تم قبول ونشر السلع المحددة بنجاح للجمهور.';
        else if (decision === 'rejected') msg = 'تم رفض السلع المحددة بنجاح مع تسجيل السبب ونظام التنبيهات.';
        else if (decision === 'escalated') msg = 'تم تصعيد السلع المحددة لكبار المراجعين والأمان القضائي للبت فيها.';
        else if (decision === 'changes_requested') msg = 'تم إرسال طلب للمراجعة والتعديلات للتاجر لإعادة النشر.';

        setModMessage({
          type: 'success',
          text: isRtl ? msg : 'Product moderation applied successfully.'
        });
        setSelectedModProduct(null);
        setShowRejectDialog(false);
        setRejectionReasonInput('');
        setSelectedProductIds([]);
        fetchAdminData();
      } else {
        setModMessage({
          type: 'error',
          text: body.error || (isRtl ? 'فشلت عملية المراجعة للمنتج.' : 'Failed to apply moderation.')
        });
      }
    } catch (e: any) {
      console.error(e);
      setModMessage({
        type: 'error',
        text: isRtl ? 'حدث خطأ في الشبكة، يرجى المحاولة لاحقاً.' : 'Network error.'
      });
    } finally {
      setModerationLoading(false);
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    const couponToDel = coupons.find(c => c.id === couponId);
    if (couponToDel) {
      setDeleteTargetCoupon(couponToDel);
    }
  };

  const confirmDeleteCoupon = async (couponId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/coupons/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId, adminId: currentUser.id })
      });
      if (res.ok) {
        // Remove from list immediately (instantly disappears from UI without page reload)
        setCoupons(prev => prev.filter(c => c.id !== couponId));
        setDeleteTargetCoupon(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete coupon.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRechargeCode = (codeId: string) => {
    const codeToDel = rechargeCodes.find(c => c.id === codeId);
    if (codeToDel) {
      setDeleteTargetRechargeCode(codeToDel);
    }
  };

  const confirmDeleteRechargeCode = async (codeId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/recharge-codes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeId, adminId: currentUser.id })
      });
      if (res.ok) {
        // Remove from list immediately (instantly disappears from UI without page reload)
        setRechargeCodes(prev => prev.filter(c => c.id !== codeId));
        setDeleteTargetRechargeCode(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete recharge code.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendRoleChangeOtp = async () => {
    if (!currentUser) return;
    setRoleChangeOtpSending(true);
    try {
      const res = await fetch('/api/auth/send-security-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        setRoleChangeOtpSent(true);
        setRoleChangeOtpSimulated(data.otpCodeSimulated || '');
        alert(isRtl ? `تم إرسال كود التحقيق بنجاح إلى هاتفك المحمي 06******46 ${data.otpCodeSimulated ? '(الرمز للتجربة: ' + data.otpCodeSimulated + ')' : ''}` : `Code sent successfully to 06******46.`);
      } else {
        alert(data.error || 'Failed to send OTP');
      }
    } catch (e) {
      console.error(e);
      alert('Error sending security OTP.');
    } finally {
      setRoleChangeOtpSending(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string, bypassModal = false) => {
    if (!currentUser) return;
    
    const isGM = currentUser.role === 'superadmin' || currentUser.id === 'u-admin';
    if (isGM && !bypassModal) {
      setRoleChangePending({ userId, newRole });
      setRoleChangePassword('');
      setRoleChangeOtp('');
      setRoleChangeOtpSent(false);
      setRoleChangeOtpSimulated('');
      return;
    }

    try {
      const payload: any = { userId, newRole, adminId: currentUser.id };
      if (isGM) {
        payload.password = roleChangePassword;
        payload.otpCode = roleChangeOtp;
      }

      const res = await fetch('/api/admin/roles/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(isRtl ? 'تم تحديث دور وصلاحيات العضو مع تسجيل الإجراء بسجل التدقيق الأمني.' : 'User permissions role shifted successfully!');
        setRoleChangePending(null);
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to change user role.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError(isRtl ? 'كلمتا المرور غير متابقتين!' : 'Passwords do not match!');
      return;
    }
    setCreateError('');
    setCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email,
          phone: createForm.phone,
          whatsapp: createForm.whatsapp || createForm.phone,
          city: createForm.city,
          password: createForm.password,
          role: createForm.role,
          adminId: currentUser.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(isRtl ? 'تم إنشاء الحساب وتفعيله بنجاح وسجل العملية بالأرشيف!' : 'User account created and activated successfully!');
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          whatsapp: '',
          city: 'الرباط',
          password: '',
          confirmPassword: '',
          role: 'buyer'
        });
        fetchAdminData();
      } else {
        setCreateError(data.error || 'Failed to create user account.');
      }
    } catch (err: any) {
      console.error(err);
      setCreateError(err.message || 'An error occurred.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          ...paymentConfig
        })
      });
      if (res.ok) {
        alert(isRtl ? 'تم تفعيل وحفظ إعدادات الربط المالي وبوابات الدفع بالمنصة.' : 'Merchant billing configurations deployed successfully.');
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save configuration.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !couponForm.code) return;

    try {
      const res = await fetch('/api/admin/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...couponForm,
          adminId: currentUser.id
        })
      });

      if (res.ok) {
        alert(isRtl ? 'تم صياغة وإطلاق قسيمة الخصم بنجاح!' : 'Voucher coupon deployed successfully!');
        setCouponForm({
          code: '',
          type: 'points',
          value: 50,
          usageLimit: 100,
          expiryDate: '2026-12-31T23:59:00'
        });
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch('/api/admin/recharge-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rechargeForm,
          adminId: currentUser.id
        })
      });

      if (res.ok) {
        alert(isRtl ? 'تم صياغة وطباعة دفعة بطاقات الشحن بنجاح!' : 'Gift card batch generated successfully!');
        setRechargeForm({
          points: 300,
          count: 5,
          expiryDate: '2026-12-31T23:59:00'
        });
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveTransaction = async (txId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/approve-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, adminId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        alert(isRtl ? 'تم تأكيد الدفعة بنجاح وتعبئة رصيد العضو بالنقاط والترويج الفوري!' : 'Payment approved and points added successfully!');
        fetchAdminData();
      } else {
        alert(data.error || 'فشلت معالجة تأكيد الدفعة.');
      }
    } catch (err) {
      console.error(err);
      alert(isRtl ? 'مشكلة بالاتصال بالخادم.' : 'Connection failure.');
    }
  };

  const handleRejectTransaction = async (txId: string) => {
    if (!currentUser) return;
    const reason = prompt(isRtl ? 'رجاء إدخال سبب رفض المعاملة لإعلام العضو كاش:' : 'Enter rejection reason:');
    if (reason === null) return;
    try {
      const res = await fetch('/api/admin/reject-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, adminId: currentUser.id, reason: reason || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        alert(isRtl ? 'تم رفض وإلغاء المعاملة وتوثيق السبب رسمياً بنجاح!' : 'Transaction rejected.');
        fetchAdminData();
      } else {
        alert(data.error || 'فشلت معالجة رفض الطلب.');
      }
    } catch (err) {
      console.error(err);
      alert(isRtl ? 'حدث خطأ بالاتصال بالخادم.' : 'Connection failure.');
    }
  };

  // Searching elements helpers
  const filteredUsersList = users.filter(u => 
    u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.phone.includes(userQuery) ||
    u.city.toLowerCase().includes(userQuery.toLowerCase())
  );

  const filteredProductsList = products.filter(p => 
    p.title.toLowerCase().includes(productQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(productQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(productQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="admin-panel-root">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[85vh] pointer-events-auto">
        
        {/* Header toolbar */}
        <div className="bg-slate-900 border-b border-slate-800 text-white p-4 shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm md:text-base font-black uppercase tracking-wider">{t.adminDashboard}</h2>
          </div>
          <button 
            id="admin-panel-close"
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        {/* Administration internal Navigation Tabs */}
        <div className="bg-slate-800 text-slate-300 text-xs flex overflow-x-auto border-b border-slate-700 font-semibold uppercase tracking-wider shrink-0 custom-scrollbar">
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'stats' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
          >
            {isRtl ? 'إحصاءات النظام' : 'Tableau de bord'}
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'users' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
          >
            {isRtl ? 'الأعضاء والتحقق' : 'Utilisateurs'}
          </button>
          <button 
            onClick={() => setActiveTab('products')} 
            className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'products' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
          >
            {isRtl ? 'المنتجات والتمييز' : 'Produits'}
          </button>
          <button 
            onClick={() => setActiveTab('moderation')} 
            className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-1 ${activeTab === 'moderation' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
          >
            🔍 {isRtl ? 'مراجعة المنتجات' : 'Product Moderation'}
          </button>
          <button 
            onClick={() => setActiveTab('coupons')} 
            className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'coupons' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
          >
            {isRtl ? 'الكوبونات وقسائم الهدايا' : 'Coupons'}
          </button>
          <button 
            onClick={() => setActiveTab('recharge')} 
            className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'recharge' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
          >
            {isRtl ? 'بطاقات الشحن للجملة' : 'Vouchers'}
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'logs' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
          >
            {isRtl ? 'سجل العمليات الإدارية' : 'Audit logs'}
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'settings' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
          >
            {isRtl ? 'إعدادات النشر ومراجعة الخصم' : 'Publishing Cost & Audit'}
          </button>
          
          {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || currentUser?.role === 'moderator') && (
            <>
              <button 
                onClick={() => setActiveTab('roles')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'roles' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                {isRtl ? '🛡️ الأدوار والصلاحيات' : 'Roles & Permissions'}
              </button>
              <button 
                onClick={() => setActiveTab('categories-order')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-1.5 ${activeTab === 'categories-order' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                <span>📂 {isRtl ? 'ترتيب الأقسام' : 'Order Categories'}</span>
              </button>
            </>
          )}

          {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
            <>
              <button 
                onClick={() => setActiveTab('verification')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'verification' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                {isRtl ? '✔ مركز التوثيق' : 'Verification Center'}
              </button>
              <button 
                onClick={() => setActiveTab('badges')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'badges' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                {isRtl ? '🏷️ إدارة الشارات' : 'Badges'}
              </button>
              <button 
                onClick={() => setActiveTab('payments')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'payments' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                {isRtl ? 'بوابات الربط المالي (Payments)' : 'Payment Integrations'}
              </button>
              <button 
                onClick={() => setActiveTab('package-prices')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'package-prices' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                {isRtl ? '💎 إدارة أسعار الباقات' : '💎 Package Prices'}
              </button>
              <button 
                onClick={() => setActiveTab('cloudflare')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'cloudflare' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                {isRtl ? 'إعدادات النشر (Cloudflare)' : 'Deployment Settings'}
              </button>
              <button 
                onClick={() => setActiveTab('google')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'google' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                {isRtl ? 'بوابة جوجل (Google Integration)' : 'Google Integration'}
              </button>
              <button 
                onClick={() => setActiveTab('branding')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 ${activeTab === 'branding' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                {isRtl ? '🎨 إعدادات الشعار والهوية البصرية' : '🎨 Branding Settings'}
              </button>
              <button 
                onClick={() => setActiveTab('messages')} 
                className={`px-5 py-3.5 hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-2 ${activeTab === 'messages' ? 'bg-slate-900 text-amber-500 font-bold border-b-2 border-amber-500' : ''}`}
              >
                <span>📬 {isRtl ? 'صندوق الرسائل' : 'Message Center'}</span>
                {contactThreads.filter(t => t.status === 'unread' && !t.isTrash && !t.isArchived).length > 0 && (
                  <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                    {contactThreads.filter(t => t.status === 'unread' && !t.isTrash && !t.isArchived).length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Scrollable panel area list */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50 custom-scrollbar text-right">
          
          {/* Tab 1: Stats Grid Layout */}
          {activeTab === 'stats' && (
            <div className="space-y-8" id="admin-stats-tab">
              
              {/* Widgets Summary bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{t.admin_totalUsers}</span>
                  <div className="text-xl md:text-2xl font-black text-slate-800 mt-1">{stats.totalUsers}</div>
                  <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 justify-end mt-1.5">
                    +{stats.sellersCount} sellers • +{stats.buyersCount} buyers
                  </span>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{t.admin_published}</span>
                  <div className="text-xl md:text-2xl font-black text-slate-800 mt-1">{stats.productsCount}</div>
                  <span className="text-[10px] text-amber-600 font-bold inline-block mt-1">
                    {stats.featuredCount} featured VIP ads
                  </span>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{t.admin_points}</span>
                  <div className="text-xl md:text-2xl font-black text-amber-600 mt-1">{stats.totalCoinsCirculated?.toLocaleString()}</div>
                  <span className="text-[9px] text-gray-400 block mt-1">Réseau Sou9AlJoumla Points</span>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{t.admin_earnings}</span>
                  <div className="text-xl md:text-2xl font-black text-emerald-600 mt-1">{stats.totalEarnings?.toLocaleString()} MAD</div>
                  <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1 justify-end mt-1">
                    Verified Checkout volume
                  </span>
                </div>
              </div>

              {/* Server Diagnostics diagnostics indicators */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5 justify-end">
                  <span>تشخيص استقرار البنية التحتية والشبكة</span>
                  <Activity className="w-4.5 h-4.5" />
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="bg-slate-850 p-4 rounded-lg border border-slate-800">
                    <span className="text-gray-500 text-[10px] block">Web Server Status:</span>
                    <span className="font-bold text-slate-200">{stats.serverStatus}</span>
                  </div>
                  <div className="bg-slate-850 p-4 rounded-lg border border-slate-800">
                    <span className="text-gray-500 text-[10px] block">Database Status:</span>
                    <span className="font-bold text-slate-200">{stats.databaseStatus}</span>
                  </div>
                  <div className="bg-slate-850 p-4 rounded-lg border border-slate-800">
                    <span className="text-gray-500 text-[10px] block">Cloud Cache status:</span>
                    <span className="font-bold text-slate-200">{stats.cacheStatus}</span>
                  </div>
                </div>
              </div>

              {/* Reports Resolution queue alerts */}
              {reports.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-1.5 justify-end text-red-800">
                    <h4 className="text-xs font-extrabold">بلاغات المخالفات النشطة قيد الانتظار</h4>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>

                  <div className="space-y-2 text-xs">
                    {reports.map((r) => (
                      <div key={r.id} className="bg-white border border-red-100 p-3.5 rounded-lg flex justify-between items-center text-slate-800">
                        <div className="flex gap-2.5">
                          <button
                            onClick={async () => {
                              await fetch(`/api/admin/reports/resolve`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reportId: r.id, status: 'resolved' })
                              });
                              fetchAdminData();
                            }}
                            className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 py-1 px-2 rounded font-bold"
                          >
                            موافقة / إغلاق
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">مقدم البلاغ: {r.reporterName}</span> — <span className="text-gray-500">نوع البلاغ: {r.targetType}</span>
                          <p className="text-[11px] text-gray-400 mt-1">السبب: {r.reason} ({r.details})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Users Management table directory */}
          {activeTab === 'users' && (
            <div className="space-y-4" id="admin-users-tab">
              <div className="flex items-center gap-2.5 md:max-w-md ml-auto bg-white border border-gray-200 px-3 py-2 rounded-xl">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="ابحث عن التجار بالاسم، البريد أو الهاتف..." 
                  className="w-full bg-transparent text-xs text-right focus:outline-none"
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-xs custom-scrollbar">
                <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 select-none font-bold">
                    <tr>
                      <th className="p-3.5">{t.admin_actioncol}</th>
                      <th className="p-3.5">الرصيد والنقاط</th>
                      <th className="p-3.5">المدينة والاتصال</th>
                      <th className="p-3.5">الدور والحالة</th>
                      <th className="p-3.5">الاسم والبريد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/50">
                        
                        {/* Operations cell */}
                        <td className="p-3.5 flex items-center gap-1.5">
                          {/* Point modification trigger button */}
                          {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin') ? (
                            <button
                              onClick={() => {
                                setPointsManageUser(usr);
                                setPointsManageAmount('');
                                setPointsManageReason('');
                                setPointsManageOverride(false);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[10px] font-extrabold rounded-lg shadow-xs hover:shadow-sm transition-all shrink-0 cursor-pointer"
                              title={isRtl ? "إدارة كاملة للرصيد والمحفظة" : "Manage points cabinet"}
                            >
                              <Coins className="w-3.5 h-3.5 text-white" />
                              <span>{isRtl ? "إدارة الرصيد" : "Points Control"}</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[10px] font-mono select-none">PT {usr.points}</span>
                          )}

                          {/* Verify supplier trigger */}
                          {usr.role === 'seller' && !usr.isVerified && (
                            <button
                              onClick={() => handleUserAction(usr.id, 'verify')}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title={t.admin_verify}
                            >
                              <Award className="w-4 h-4" />
                            </button>
                          )}

                          {/* Suspend or activate members */}
                          {usr.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(usr.id, 'suspend')}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title={t.admin_suspend}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(usr.id, 'activate')}
                              className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                              title={t.admin_activate}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </td>

                        <td className="p-3.5 font-bold font-mono">
                          <span className="text-amber-500">{usr.points} PT</span>
                        </td>

                        <td className="p-3.5">
                          <span>{usr.city} ({usr.phone})</span>
                        </td>

                        <td className="p-3.5 space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            usr.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            usr.role === 'seller' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {usr.role}
                          </span>
                          <span className={`block text-[9px] font-bold ${usr.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {usr.status}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 flex items-center gap-1 justify-end">
                            {usr.isVerified && <Award className="w-3.5 h-3.5 text-blue-500" />}
                            <span>{usr.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono block">{usr.email}</span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Products Moderator Table */}
          {activeTab === 'products' && (
            <div className="space-y-4" id="admin-products-tab">
              <div className="flex items-center gap-2.5 md:max-w-md ml-auto bg-white border border-gray-200 px-3 py-2 rounded-xl">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="ابحث عن الإعلانات باسم المنتج أو الـ SKU..." 
                  className="w-full bg-transparent text-xs text-right focus:outline-none"
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-xs custom-scrollbar">
                <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 select-none font-bold">
                    <tr>
                      <th className="p-3.5">{t.admin_actioncol}</th>
                      <th className="p-3.5">سعر الجملة</th>
                      <th className="p-3.5">المدينة والتصنيف</th>
                      <th className="p-3.5">التمييز التثبيت</th>
                      <th className="p-3.5">عنوان السلعة والمورد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProductsList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        
                        {/* Moderate Buttons */}
                        <td className="p-3.5 flex items-center gap-1.5">
                          {p.isPinned ? (
                            <button onClick={() => handleProductAction(p.id, 'unpin')} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[9px] font-black">إلغاء التثبيت</button>
                          ) : (
                            <button onClick={() => handleProductAction(p.id, 'pin')} className="px-2 py-1 bg-amber-500 text-white rounded text-[9px] font-black">تثبيت بالرئيسية</button>
                          )}
                          
                          {p.isFeatured ? (
                            <button onClick={() => handleProductAction(p.id, 'unfeature')} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[9px] font-black">تنقيص لـ عادي</button>
                          ) : (
                            <button onClick={() => handleProductAction(p.id, 'feature')} className="px-2 py-1 bg-blue-600 text-white rounded text-[9px] font-black">ترقية لـ VIP</button>
                          )}

                          <button onClick={() => handleProductAction(p.id, 'delete')} className="p-1 text-red-500 hover:bg-red-50 rounded" title="حذف كلي">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                        <td className="p-3.5 font-bold font-mono">
                          <span>{p.priceMin} - {p.priceMax} MAD</span>
                        </td>

                        <td className="p-3.5">
                          <span>{p.location}</span>
                          <span className="block text-[10px] text-gray-400">{p.category}</span>
                        </td>

                        <td className="p-3.5 space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${p.isPinned ? 'bg-amber-500' : 'bg-slate-300'}`}>Pinned {p.isPinned ? 'Yes': 'No'}</span>
                          <span className={`block text-[10px] font-bold ${p.isFeatured ? 'text-blue-500' : 'text-gray-400'}`}>Featured {p.isFeatured ? 'Yes' : 'No'}</span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 line-clamp-1">{p.title}</div>
                          <span className="text-[10px] text-gray-400 font-mono block">SKU: {p.sku} • المورد: {p.sellerName}</span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Coupons Form & Lists */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="admin-coupons-tab">
              
              {/* Creator form */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs h-fit space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-2">{t.admin_couponsTable}</h3>
                
                <form onSubmit={handleCreateCouponSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">كود قسيمة الخصم (كبير)</label>
                    <input 
                      type="text" 
                      required
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      placeholder="SOU9DEAL20"
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">نوع الميزة للخصم</label>
                    <select
                      value={couponForm.type}
                      onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="points">نقاط مجانية تضاف للمحفظة (points)</option>
                      <option value="fixed">مبلغ ثابت مخفض درهم (fixed)</option>
                      <option value="percentage">نسبة مئوية مخصومة من السعر % (percentage)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">قيمة الخصم أو النقاط</label>
                    <input 
                      type="number"
                      required
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-center font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">{t.admin_couponLimit}</label>
                    <input 
                      type="number"
                      required
                      value={couponForm.usageLimit}
                      onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-center font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t.admin_createCouponBtn}
                  </button>
                </form>
              </div>

              {/* List table */}
              <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 font-bold text-xs text-slate-700 select-none flex justify-between items-center flex-row-reverse">
                  <span>قسائم التخفيض النشطة بالخادم</span>
                  <span className="text-[10px] text-gray-400">إجمالي: {coupons.length} كوبون</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[500px]">
                    <thead className="bg-slate-50 text-slate-400 font-bold">
                      <tr>
                        <th className="p-3">الإجراءات</th>
                        <th className="p-3">حالة الاستخدام والتاريخ</th>
                        <th className="p-3">{t.admin_couponLimit}</th>
                        <th className="p-3">{t.admin_couponVal}</th>
                        <th className="p-3">النوع</th>
                        <th className="p-3">{t.admin_couponCode}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
                      {coupons.map((c) => (
                        <tr key={c.id}>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer flex items-center justify-center gap-0.5"
                              title="حذف الكوبون نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline text-red-600" />
                              <span>حذف الكوبون</span>
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            {c.used ? (
                              <div className="text-right">
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded-full text-[9px] block w-fit ml-auto">
                                  تم استخدامه
                                </span>
                                {c.usedBy && <span className="block text-[9px] text-gray-400 mt-0.5">بواسطة: {c.usedBy}</span>}
                                {c.usedAt && <span className="block text-[8px] text-gray-400">{new Date(c.usedAt).toLocaleString()}</span>}
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[9px] block w-fit ml-auto">
                                صالح للاستخدام
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-700">{c.usageCount} / {c.usageLimit}</td>
                          <td className="p-3 font-bold text-amber-500">{c.value} {c.type === 'points' ? 'points' : 'MAD'}</td>
                          <td className="p-3 capitalize text-slate-600">{c.type}</td>
                          <td className="p-3 font-mono font-black text-slate-900 tracking-wider text-right">{c.code}</td>
                        </tr>
                      ))}
                      {coupons.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400 font-extrabold">لا توجد كوبونات مسجلة حالياً بالمنصة.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Tab 5: Recharge Prepaid codes Generators */}
          {activeTab === 'recharge' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="admin-recharge-tab">
              
              {/* Generators form */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs h-fit space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">{t.admin_rechargeCodesTable}</h3>
                
                <form onSubmit={handleGenerateRechargeSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">{t.admin_generatePoints}</label>
                    <input 
                      type="number" 
                      required
                      value={rechargeForm.points}
                      onChange={(e) => setRechargeForm({ ...rechargeForm, points: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-center font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">{t.admin_generateCount}</label>
                    <input 
                      type="number" 
                      required
                      value={rechargeForm.count}
                      onChange={(e) => setRechargeForm({ ...rechargeForm, count: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-center font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t.admin_generateCodes}
                  </button>
                </form>
              </div>

              {/* Codes list */}
              <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 font-bold text-xs text-slate-700 select-none flex justify-between items-center flex-row-reverse">
                  <span>قائمة بطاقات الشحن المصدرة</span>
                  <span className="text-[10px] text-gray-400">إجمالي: {rechargeCodes.length} كود شحن</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[500px]">
                    <thead className="bg-slate-50 text-slate-400 font-bold">
                      <tr>
                        <th className="p-3">الإجراءات</th>
                        <th className="p-3">حالة الاستخدام والتاريخ</th>
                        <th className="p-3">النقاط</th>
                        <th className="p-3">تاريخ انتهاء الصلاحية</th>
                        <th className="p-3">كود الشحن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
                      {rechargeCodes.slice(-25).map((code) => (
                        <tr key={code.id} className="hover:bg-slate-50">
                          {/* Delete code Button */}
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteRechargeCode(code.id)}
                              className="p-1 text-red-650 hover:bg-red-50 rounded cursor-pointer text-red-600 font-bold flex items-center justify-end gap-0.5 ml-auto"
                              title="حذف كود الشحن"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline mr-1 text-red-600" />
                              <span>حذف</span>
                            </button>
                          </td>
                          {/* Usage detailed tracking */}
                          <td className="p-3 text-right">
                            {code.used || code.status === 'used' ? (
                              <div className="text-right">
                                <span className="px-2 py-0.5 bg-red-105 text-red-700 font-bold rounded-full text-[9px] block w-fit ml-auto">
                                  مستعمل (Used)
                                </span>
                                {code.usedBy && <span className="block text-[9px] text-gray-400 mt-0.5">شاحن الكود: {code.usedBy}</span>}
                                {code.usedAt && <span className="block text-[8px] text-gray-400">{new Date(code.usedAt).toLocaleString()}</span>}
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[9px] block w-fit ml-auto">
                                {code.status === 'active' ? 'نشط / جاهز للشحن' : code.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-emerald-600">+{code.points} PT</td>
                          <td className="p-3 text-[10px] text-gray-400">{new Date(code.expiryDate).toLocaleDateString()}</td>
                          <td className="p-3 font-mono font-black text-slate-900 tracking-wider bg-slate-50/50 text-right">{code.code}</td>
                        </tr>
                      ))}
                      {rechargeCodes.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 font-extrabold">لا توجد بطاقات شحن جملة مصدرة بعد.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Wallet Transactions approval system */}
              <div className="md:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-6">
                <div className="p-4 bg-slate-900 text-white font-bold text-xs select-none flex justify-between items-center">
                  <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">Secure Payment Verification Desk</span>
                  <span>طلبات شحن الرصيد والتحويلات المالية من الأعضاء (بطاقة بنكية / تحويل كاش / بايبال)</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[750px] font-sans">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3 text-right">الإجراء وصلاحية الدفعة</th>
                        <th className="p-3 text-right">حالة العملية</th>
                        <th className="p-3 text-right">تفاصيل وقناة الدفع</th>
                        <th className="p-3 text-right">المبلغ والعملة</th>
                        <th className="p-3 text-right">النقاط المطلوبة</th>
                        <th className="p-3 text-right">العضو المسجل</th>
                        <th className="p-3 text-right">التاريخ والوقت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {adminTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400 font-medium font-sans animate-fade-in">
                            لا توجد أي معاملات شحن أو تحويلات مالية معلقة حالياً
                          </td>
                        </tr>
                      ) : (
                        adminTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Actions column */}
                            <td className="p-3">
                              {tx.status === 'pending' ? (
                                <div className="flex gap-1.5 justify-start">
                                  <button
                                    onClick={() => handleApproveTransaction(tx.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded transition-all cursor-pointer shadow-xs active:scale-95"
                                  >
                                    تأكيد الدفع والموافقة
                                  </button>
                                  <button
                                    onClick={() => handleRejectTransaction(tx.id)}
                                    className="px-2.5 py-1 bg-red-650 hover:bg-red-500 text-white font-bold text-[10px] rounded transition-all cursor-pointer shadow-xs active:scale-95"
                                  >
                                    رفض وإلغاء
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-medium">العملية منتهية</span>
                              )}
                            </td>
                            {/* Status */}
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                tx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                tx.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                                {tx.status === 'completed' ? 'مقبول ومكتمل' :
                                 tx.status === 'failed' ? 'ملغى ومرفوض' : 'معلق وبانتظار التدقيق'}
                              </span>
                            </td>
                            {/* Description / proof */}
                            <td className="p-3 text-slate-700 max-w-[220px]" title={tx.description}>
                              <span className="font-medium text-slate-800 text-[11px] block leading-normal">{tx.description}</span>
                              {tx.invoiceId && <span className="text-[10px] font-mono text-gray-400 block mt-0.5">معرف المعاملة: {tx.invoiceId}</span>}
                            </td>
                            {/* Cost */}
                            <td className="p-3 font-mono font-bold text-slate-900">
                              {tx.amount ? `${tx.amount} MAD` : '0'}
                            </td>
                            {/* Points */}
                            <td className="p-3">
                              <span className="font-bold text-amber-650 font-mono">+{tx.points} PT</span>
                            </td>
                            {/* User details */}
                            <td className="p-3 font-medium text-slate-800">
                              <div>{tx.userName}</div>
                              <div className="text-[10px] font-mono text-gray-400">{tx.userEmail}</div>
                            </td>
                            {/* Date */}
                            <td className="p-3 font-mono text-gray-400 text-[10px]">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Audits Stream logs */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-gray-250 rounded-xl overflow-hidden shadow-xs" id="admin-logs-tab">
              <div className="p-4 bg-slate-50 font-bold text-xs text-slate-700 select-none flex items-center justify-between">
                <div className="text-[10px] text-gray-400 font-mono">Real-time Security logs system active</div>
                <span>سجلات التدقيق لعمليات النظام (Audit Logs)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[600px]">
                  <thead className="bg-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3.5">البيانات والتفاصيل الإجرائية</th>
                      <th className="p-3.5">عنوان IP</th>
                      <th className="p-3.5">نوع العملية</th>
                      <th className="p-3.5">المسؤول الإداري</th>
                      <th className="p-3.5">التوقيت والتاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono text-[11px] text-slate-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3.5 text-right font-sans text-slate-800 max-w-sm">{log.details}</td>
                        <td className="p-3.5 text-gray-500">{log.ip}</td>
                        <td className="p-3.5 font-bold text-slate-900">{log.action}</td>
                        <td className="p-3.5 text-slate-800">{log.adminName} ({log.adminEmail})</td>
                        <td className="p-3.5 text-gray-400 text-[10px]">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Product Moderation */}
          {activeTab === 'moderation' && (() => {
            const tempFiltered = products.filter(p => {
              if (modStatusFilter !== 'all') {
                if (modStatusFilter === 'approved') {
                  return p.status === 'approved' || p.status === 'active';
                } else if (modStatusFilter === 'pending_review') {
                  return !p.status || p.status === 'pending_review';
                } else if (modStatusFilter === 'rejected') {
                  return p.status === 'rejected';
                } else {
                  return p.status === modStatusFilter;
                }
              }
              return true;
            });

            const filteredModerationProductsList = tempFiltered.filter(p => {
              if (modSearchQuery && !p.title.toLowerCase().includes(modSearchQuery.toLowerCase())) {
                return false;
              }
              if (modSellerQuery && !(p.sellerName || '').toLowerCase().includes(modSellerQuery.toLowerCase())) {
                return false;
              }
              return true;
            }).sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)); // Priority Queue: Sort by highest risk score first

            const handleBulkAction = (actionType: 'approved' | 'rejected' | 'escalated' | 'changes_requested') => {
              if (selectedProductIds.length === 0) return;
              if (actionType === 'rejected' || actionType === 'changes_requested') {
                const cause = prompt(isRtl ? 'يرجى كتابة سبب القرار الجماعي لإبلاغ البائعين به:' : 'Please enter reason for bulk action:');
                if (cause === null) return; // cancel
                handleModerateProduct(null, actionType, cause, selectedProductIds);
              } else {
                if (confirm(isRtl ? `هل أنت متأكد من تطبيق القرار الجماعي (${actionType === 'approved' ? 'موافقة ونشر' : 'تصعيد'}) على ${selectedProductIds.length} سلعة؟` : `Apply bulk decision to ${selectedProductIds.length} items?`)) {
                  handleModerateProduct(null, actionType, undefined, selectedProductIds);
                }
              }
            };

            return (
              <div className="space-y-6 animate-fade-in" id="admin-moderation-tab">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    onClick={() => setModStatusFilter('pending_review')} 
                    className={`cursor-pointer rounded-2xl p-5 border text-right transition-all hover:scale-[1.01] ${modStatusFilter === 'pending_review' ? 'border-amber-400 bg-amber-50/55 ring-1 ring-amber-400' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="p-1 px-2.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold">🔎 مراجع إنساني</span>
                      <span className="text-[9px] text-gray-400 font-mono font-medium">Pending Review</span>
                    </div>
                    <h4 className="text-gray-500 text-[11px] font-bold font-sans">بانتظار المراجعة البشرية</h4>
                    <div className="text-2xl font-black text-amber-600 mt-1">
                      {products.filter(p => !p.status || p.status === 'pending_review').length}
                    </div>
                  </div>

                  <div 
                    onClick={() => setModStatusFilter('approved')} 
                    className={`cursor-pointer rounded-2xl p-5 border text-right transition-all hover:scale-[1.01] ${modStatusFilter === 'approved' ? 'border-emerald-400 bg-emerald-50/55 ring-1 ring-emerald-400' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="p-1 px-2.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold font-sans">✔ مقبول نشط</span>
                      <span className="text-[9px] text-gray-400 font-mono font-medium">Active</span>
                    </div>
                    <h4 className="text-gray-500 text-[11px] font-bold font-sans">المنتجات النشطة والمنشورة</h4>
                    <div className="text-2xl font-black text-emerald-600 mt-1">
                      {products.filter(p => p.status === 'approved' || p.status === 'active').length}
                    </div>
                  </div>

                  <div 
                    onClick={() => setModStatusFilter('escalated')} 
                    className={`cursor-pointer rounded-2xl p-5 border text-right transition-all hover:scale-[1.01] ${modStatusFilter === 'escalated' ? 'border-indigo-400 bg-indigo-50/55 ring-1 ring-indigo-400' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="p-1 px-2.5 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold font-sans">⚠️ مصعد للإدارة</span>
                      <span className="text-[9px] text-gray-400 font-mono font-medium">Escalated</span>
                    </div>
                    <h4 className="text-gray-500 text-[11px] font-bold font-sans">منتجات مصعدة للدراسة العليا</h4>
                    <div className="text-2xl font-black text-indigo-600 mt-1">
                      {products.filter(p => p.status === 'escalated').length}
                    </div>
                  </div>

                  <div 
                    onClick={() => setModStatusFilter('changes_requested')} 
                    className={`cursor-pointer rounded-2xl p-5 border text-right transition-all hover:scale-[1.01] ${modStatusFilter === 'changes_requested' ? 'border-purple-400 bg-purple-50/55 ring-1 ring-purple-400' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="p-1 px-2.5 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-bold font-sans">📝 تعديل مطلوب</span>
                      <span className="text-[9px] text-gray-400 font-mono font-medium">Revision</span>
                    </div>
                    <h4 className="text-gray-500 text-[11px] font-bold font-sans">بانتظار تعديل البائع</h4>
                    <div className="text-2xl font-black text-purple-600 mt-1">
                      {products.filter(p => p.status === 'changes_requested').length}
                    </div>
                  </div>
                </div>

                {/* Status and Search filter Form */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm text-right space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2.5 py-1 rounded">Advanced Amazon-Like Risk Mitigation Pipeline</span>
                    <h3 className="text-sm font-black text-amber-500">منظومة فلترة وتحصيل الأمان الوقائي والبت الفوري</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status selection */}
                    <div className="space-y-1.5 flex flex-col justify-start">
                      <label className="text-xs font-bold text-slate-300">تصفية حسب الحالة</label>
                      <select
                        value={modStatusFilter}
                        onChange={(e) => setModStatusFilter(e.target.value as any)}
                        className="w-full bg-slate-800 text-right text-xs rounded-xl px-3 py-2.5 text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      >
                        <option value="all">كل المنتجات</option>
                        <option value="pending_review">قيد الانتظار لموافقة الإدارة</option>
                        <option value="approved">تمت الموافقة ونشط</option>
                        <option value="rejected">مرفوض ومحظور</option>
                        <option value="escalated">مصعد لمستوى مشرف عام</option>
                        <option value="changes_requested">في انتظار إجراء مراجعة بائع</option>
                      </select>
                    </div>

                    {/* Search product query */}
                    <div className="space-y-1.5 flex flex-col justify-start">
                      <label className="text-xs font-bold text-slate-300">البحث باسم المنتج</label>
                      <input
                        type="text"
                        value={modSearchQuery}
                        onChange={(e) => setModSearchQuery(e.target.value)}
                        placeholder="اكتب اسم المنتج للتصفية..."
                        className="w-full bg-slate-800 text-right text-xs rounded-xl px-3 py-2.5 text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-500"
                      />
                    </div>

                    {/* Search seller query */}
                    <div className="space-y-1.5 flex flex-col justify-start">
                      <label className="text-xs font-bold text-slate-300">البحث باسم البائع</label>
                      <input
                        type="text"
                        value={modSellerQuery}
                        onChange={(e) => setModSellerQuery(e.target.value)}
                        placeholder="اكتب اسم صاحب الإعلان..."
                        className="w-full bg-slate-800 text-right text-xs rounded-xl px-3 py-2.5 text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Message Alerts */}
                {modMessage && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-right flex justify-between items-center ${modMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250 animate-fade-in' : 'bg-rose-50 text-rose-800 border border-rose-250 animate-fade-in'}`}>
                    <button onClick={() => setModMessage(null)} className="text-[10px] underline hover:no-underline">إغلاق</button>
                    <span>{modMessage.text}</span>
                  </div>
                )}

                {/* Bulk Actions Persistent Panel */}
                {selectedProductIds.length > 0 && (
                  <div className="bg-amber-50/90 border border-amber-300 backdrop-blur-md text-amber-950 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 animate-fade-in text-right">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-xs font-black block">إجراءات التحكم الجماعية الموحدة (إدارة خطية)</span>
                        <p className="text-[10px] text-amber-850">لقد حددت <strong>{selectedProductIds.length}</strong> منتج لتطبيق القرار الموحد مع تأمين الارتداد الفوري.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleBulkAction('approved')}
                        disabled={moderationLoading}
                        className="p-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        ✔ موافقة جماعية
                      </button>
                      <button
                        onClick={() => handleBulkAction('changes_requested')}
                        disabled={moderationLoading}
                        className="p-2 px-3.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        📝 طلب تعديلات للجميع
                      </button>
                      <button
                        onClick={() => handleBulkAction('escalated')}
                        disabled={moderationLoading}
                        className="p-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        ⚠️ تصعيد جماعي وإشعار
                      </button>
                      <button
                        onClick={() => handleBulkAction('rejected')}
                        disabled={moderationLoading}
                        className="p-2 px-3.5 bg-rose-650 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        🗙 رفض وحظر جماعي
                      </button>
                    </div>
                  </div>
                )}

                {/* Products mod list block */}
                <div className="bg-white border border-gray-250 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 font-bold text-xs text-slate-700 select-none text-right flex justify-between items-center border-b">
                    <div className="text-[10px] text-gray-400 font-mono">Showing {filteredModerationProductsList.length} matching entries sorted by highest risk score</div>
                    <span>طابور فحص مخاطر السلع والبت الأمني والتحكيم المباشر</span>
                  </div>

                  {filteredModerationProductsList.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-bold text-sm">
                      لا توجد عروض تفي بمواصفات البحث أو الفلترة المحددة مسبقاً.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[850px]">
                        <thead className="bg-slate-100/80 text-slate-500 font-extrabold">
                          <tr>
                            <th className="p-3 text-center w-12">
                              <input 
                                type="checkbox" 
                                checked={selectedProductIds.length === filteredModerationProductsList.length && filteredModerationProductsList.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds(filteredModerationProductsList.map(item => item.id));
                                  } else {
                                    setSelectedProductIds([]);
                                  }
                                }}
                                className="rounded text-amber-500 outline-none scale-110 cursor-pointer accent-amber-500"
                              />
                            </th>
                            <th className="p-3.5">المنتج ومعاينة الأمان</th>
                            <th className="p-3.5 text-center">أولوية ومؤشر الخطر (أوتوماتيكي)</th>
                            <th className="p-3.5">التاجر / العارض</th>
                            <th className="p-3.5">التصنيف</th>
                            <th className="p-3.5">السعر بالدرهم</th>
                            <th className="p-3.5">توقيت النشر</th>
                            <th className="p-3.5">قرار المشرفين</th>
                            <th className="p-3.5 text-center">الإجراءات والتحكم</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-slate-700">
                          {filteredModerationProductsList.map((p) => {
                            const risk = p.riskScore || 0;
                            let riskBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                            let riskBadgeLabel = 'آمن تلقائياً (منخفض الخطر)';
                            if (risk >= 70) {
                              riskBadgeColor = 'bg-rose-50 text-rose-800 border-rose-250 font-black animate-pulse';
                              riskBadgeLabel = 'احتيال عالي الخطر (محجوب تلقائياً)';
                            } else if (risk >= 30) {
                              riskBadgeColor = 'bg-amber-50 text-amber-850 border-amber-300 font-bold';
                              riskBadgeLabel = 'متوسط الخطورة (مطلوب تدقيق)';
                            }

                            return (
                              <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                {/* Checkbox cell */}
                                <td className="p-3 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={selectedProductIds.includes(p.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedProductIds([...selectedProductIds, p.id]);
                                      } else {
                                        setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                      }
                                    }}
                                    className="rounded text-amber-500 outline-none scale-110 cursor-pointer accent-amber-500"
                                  />
                                </td>

                                {/* Product Info */}
                                <td className="p-3">
                                  <div className="flex items-center gap-3 justify-end text-right">
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-slate-900 line-clamp-1">{p.title}</span>
                                      <span className="text-[9px] text-gray-400 font-mono select-all">ID: {p.id}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-250 shrink-0">
                                      <img 
                                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600'} 
                                        alt={p.title} 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* Risk assessment indicators */}
                                <td className="p-3 text-center">
                                  <div className="inline-flex flex-col items-center gap-0.5">
                                    <span style={{ direction: 'rtl' }} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1 ${riskBadgeColor}`}>
                                      <Activity className="w-3.5 h-3.5 shrink-0" />
                                      <span>{riskBadgeLabel} ({risk}%)</span>
                                    </span>
                                    {p.riskReasons && p.riskReasons.length > 0 && (
                                      <span className="text-[9px] text-rose-600 font-sans font-medium line-clamp-1 max-w-[200px]" title={p.riskReasons.join(' | ')}>
                                        السبب: {p.riskReasons[0]}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Seller */}
                                <td className="p-3">
                                  <div className="font-bold text-slate-950 flex items-center gap-1 justify-end">
                                    {p.sellerVerified && <span className="p-0.5 bg-emerald-500 text-white rounded-md text-[8px] font-extrabold font-mono" title="بائع معتمد">VIP</span>}
                                    <span>{p.sellerName || 'تاجر مسجل'}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">UID: {p.sellerId}</div>
                                </td>

                                {/* Category */}
                                <td className="p-3">
                                  <span className="bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded text-[10px]">{p.category}</span>
                                  <div className="text-[9px] text-gray-500 mt-0.5">{p.subcategory}</div>
                                </td>

                                {/* Price */}
                                <td className="p-3 font-bold font-mono text-slate-900">
                                  <span className="text-amber-600 block">{p.priceMin} - {p.priceMax}</span>
                                  <span className="text-[9px] text-gray-400 font-sans">MAD ({p.moq} حبة أدنى)</span>
                                </td>

                                {/* Created at */}
                                <td className="p-3 font-mono text-gray-500 text-[10px]">
                                  {new Date(p.createdAt).toLocaleString()}
                                </td>

                                {/* Status */}
                                <td className="p-3">
                                  {(!p.status || p.status === 'pending_review') && (
                                    <span className="inline-flex px-2 py-0.5 font-bold rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                                      🔎 في انتظار المراجعة
                                    </span>
                                  )}
                                  {(p.status === 'approved' || p.status === 'active') && (
                                    <span className="inline-flex px-2 py-0.5 font-bold rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      ✔ تمت الموافقة منشورة
                                    </span>
                                  )}
                                  {p.status === 'rejected' && (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex px-2 py-0.5 font-bold rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                                        ❌ مرفوض ومحجوب
                                      </span>
                                      {p.rejectionReason && (
                                        <p className="text-[9px] text-rose-600 font-sans max-w-[150px] line-clamp-1" title={p.rejectionReason}>
                                          {p.rejectionReason}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {p.status === 'escalated' && (
                                    <span className="inline-flex px-2 py-0.5 font-bold rounded-full text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      ⚠️ مصعد لإدارة التدقيق
                                    </span>
                                  )}
                                  {p.status === 'changes_requested' && (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex px-2 py-0.5 font-bold rounded-full text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                                        📝 بانتظار تعديلات البائع
                                      </span>
                                      {p.rejectionReason && (
                                        <p className="text-[9px] text-purple-600 font-sans max-w-[150px] line-clamp-1" title={p.rejectionReason}>
                                          الملاحظة: {p.rejectionReason}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="p-3 text-center">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => setSelectedModProduct(p)}
                                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-amber-500 rounded-xl font-extrabold text-[10px] transition-all cursor-pointer shadow-xs"
                                    >
                                      👁️ تفاصيل ومراجعة القرار
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Modern Details Dialog */}
                {selectedModProduct && (() => {
                  const pRisk = selectedModProduct.riskScore || 0;
                  let cardRiskColor = 'border-emerald-200 bg-emerald-50/20';
                  if (pRisk >= 70) cardRiskColor = 'border-rose-350 bg-rose-50/20';
                  else if (pRisk >= 30) cardRiskColor = 'border-amber-300 bg-amber-50/20';

                  return (
                    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right border border-slate-200">
                        {/* Dialog Header */}
                        <div className="bg-slate-950 text-white p-4 px-6 flex justify-between items-center text-right shrink-0 border-b border-slate-800">
                          <button 
                            onClick={() => { setSelectedModProduct(null); setShowRejectDialog(false); }}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <h3 className="font-black text-sm text-slate-100 font-sans flex items-center gap-1.5">
                            <ShieldCheck className="w-5 h-5 text-amber-500" />
                            <span>مراجعة تفاصيل السلعة المحددة وإتمام البت</span>
                          </h3>
                        </div>

                        {/* Dialog Content */}
                        <div className="p-6 overflow-y-auto space-y-6">
                          
                          {/* Risk warning component */}
                          <div className={`p-4 rounded-2xl border ${cardRiskColor} space-y-2`}>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-500 font-mono font-medium">Automatic Pipeline Scan</span>
                              <strong className="text-xs text-slate-900 font-sans flex items-center gap-1">
                                <Activity className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                                <span>تقرير لذكاء الوقائي (نقاط الخطورة: {pRisk}%)</span>
                              </strong>
                            </div>
                            {selectedModProduct.riskReasons && selectedModProduct.riskReasons.length > 0 ? (
                              <div className="text-[11px] text-rose-700 space-y-1">
                                <span className="font-extrabold block">العوامل والمخاطر التي تم رصدها آلياً:</span>
                                <ul className="list-disc list-inside space-y-0.5 text-right">
                                  {selectedModProduct.riskReasons.map((reason, rIdx) => (
                                    <li key={rIdx}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p className="text-[11px] text-emerald-800 font-bold">لم يتم رصد أي عوامل خطورة تلقائية على هذا الإعلان التجاري. آمن كلياً.</p>
                            )}
                          </div>

                          {/* Product Overview details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                              <img 
                                src={selectedModProduct.images?.[0] || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600'} 
                                alt={selectedModProduct.title} 
                                className="w-full aspect-square rounded-2xl object-cover border border-gray-250 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              <div className="grid grid-cols-4 gap-1.5 mt-2">
                                {selectedModProduct.images?.slice(1, 4).map((img, idx) => (
                                  <img 
                                    key={idx} 
                                    src={img} 
                                    alt="" 
                                    className="w-full aspect-square object-cover rounded-lg border shadow-xs" 
                                    referrerPolicy="no-referrer"
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="md:col-span-2 space-y-3">
                              <h2 className="text-sm font-black text-slate-950">{selectedModProduct.title}</h2>
                              <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3 border-gray-100">
                                <div>
                                  <span className="text-gray-400 block text-[10px]">التاجر العارض:</span>
                                  <strong className="text-slate-800">{selectedModProduct.sellerName || 'التاجر'}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-400 block font-mono text-[10px]">SKU:</span>
                                  <strong className="text-slate-800 font-mono text-[10px]">{selectedModProduct.sku}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px]">التصنيف:</span>
                                  <strong className="text-slate-800">{selectedModProduct.category} - {selectedModProduct.subcategory}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px]">السعر المدخل للعلن:</span>
                                  <strong className="text-amber-500 font-extrabold">{selectedModProduct.priceMin} - {selectedModProduct.priceMax} MAD</strong>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px]">الحد الأدنى للطلب:</span>
                                  <strong className="text-slate-800">{selectedModProduct.moq} حبة</strong>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px]">المخزون المتوفر:</span>
                                  <strong className="text-slate-800">{selectedModProduct.stock} حبة</strong>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px]">الموقع:</span>
                                  <strong className="text-slate-800">{selectedModProduct.location}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px]">الحالة:</span>
                                  <strong className="text-slate-800">{selectedModProduct.condition === 'new' ? 'جديد بالكرتون' : 'مستعمل'}</strong>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description info */}
                          <div className="space-y-1.5 border-t border-gray-100 pt-4">
                            <h4 className="text-xs font-black text-slate-850">شرح بائع ومواصفات المنتج:</h4>
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border leading-relaxed whitespace-pre-wrap">{selectedModProduct.description}</p>
                          </div>

                          {/* Video and PDF links */}
                          {(selectedModProduct.videoUrl || selectedModProduct.pdfUrl) && (
                            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                              {selectedModProduct.videoUrl && (
                                <a 
                                  href={selectedModProduct.videoUrl} 
                                  target="_blank" 
                                  className="text-[10px] font-black text-amber-600 inline-flex items-center gap-1 justify-end hover:underline"
                                >
                                  🔗 معاينة الفيديو التعريفي
                                </a>
                              )}
                              {selectedModProduct.pdfUrl && (
                                <a 
                                  href={selectedModProduct.pdfUrl} 
                                  target="_blank" 
                                  className="text-[10px] font-black text-amber-600 inline-flex items-center gap-1 justify-end hover:underline"
                                >
                                  📄 تنزيل الكتالوج الفني PDF
                                </a>
                              )}
                            </div>
                          )}

                          {/* Verification Controls inside detailed check */}
                          <div className="border-t border-gray-205 pt-5 space-y-4">
                            <span className="block text-xs font-black text-slate-900 mb-2">إصدار القرار الإداري للمشرف (التحكيم الفردي):</span>
                            
                            <div className="flex gap-2 flex-wrap justify-start">
                              <button
                                type="button"
                                disabled={moderationLoading}
                                onClick={() => handleModerateProduct(selectedModProduct.id, 'approved')}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              >
                                ✔ موافقة ونشر العرض
                              </button>
                              
                              <button
                                type="button"
                                disabled={moderationLoading}
                                onClick={() => {
                                  setShowRejectDialog(true);
                                  setRejectionReasonInput('');
                                }}
                                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              >
                                🗙 حظر ورفض قطعي
                              </button>

                              <button
                                type="button"
                                disabled={moderationLoading}
                                onClick={() => {
                                  const explanation = prompt(isRtl ? 'اكتب ملاحظات التعديلات التي تود توجيهها للتاجر لتعديلها:' : 'Describe modifications needed:');
                                  if (explanation) {
                                    handleModerateProduct(selectedModProduct.id, 'changes_requested', explanation);
                                  }
                                }}
                                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              >
                                📝 طلب تعديل ومراجعة
                              </button>

                              <button
                                type="button"
                                disabled={moderationLoading}
                                onClick={() => {
                                  if (confirm(isRtl ? 'هل تريد بالتأكيد تصعيد هذا العرض لمشرف منصة أعلى للفصل فيه؟' : 'Escalate this listing to senior administration?')) {
                                    handleModerateProduct(selectedModProduct.id, 'escalated');
                                  }
                                }}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              >
                                ⚠️ تصعيد لرقابة عليا
                              </button>
                            </div>

                            {/* Prompt-style Reject Dialog */}
                            {showRejectDialog && (
                              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-3 animate-fade-in text-right">
                                <span className="block text-xs font-black text-rose-800">بيان وصياغة سبب الرفض لوقاية السوق:</span>
                                <textarea
                                  required
                                  value={rejectionReasonInput}
                                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                                  placeholder="مخالف لشروط النشر المعمول بها..."
                                  rows={2}
                                  className="w-full bg-white border border-rose-250 rounded-xl p-2.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans shadow-inner"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    disabled={moderationLoading || !rejectionReasonInput.trim()}
                                    onClick={() => handleModerateProduct(selectedModProduct.id, 'rejected', rejectionReasonInput)}
                                    className="px-4 py-2 bg-rose-650 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-[10px] rounded-xl cursor-pointer"
                                  >
                                    إرسال قرار المنظومة وحظر السلعة
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowRejectDialog(false)}
                                    className="px-4 py-2 bg-gray-200 text-slate-800 hover:bg-gray-300 text-[10px] font-bold rounded-xl cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          {/* Tab 7: Settings and Points Deductions Auditing */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in" id="admin-settings-tab">
              
              {/* Settings controller card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-xs">
                <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">Dynamic global parameters</span>
                  <h3 className="text-sm font-black text-slate-800">إعدادات النشر ومصاريف الدفع بالمنصة</h3>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Publishing cost points field */}
                    <div className="space-y-1.5 text-right">
                      <label className="block text-xs font-bold text-slate-700">تكلفة نشر الإعلان (بالنقاط):</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={publishingCost}
                        onChange={(e) => setPublishingCost(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="20"
                      />
                      <p className="text-[10px] text-gray-400 leading-normal">
                        الافتراضي هو 20 نقطة. يُخصم هذا العدد من رصيد العضو فور نشر عرض أو منتج جديد.
                      </p>
                    </div>

                    {/* Paid publishing toggle field */}
                    <div className="space-y-2 text-right">
                      <label className="block text-xs font-bold text-slate-700 font-black">سياسة خصم نقاط النشر:</label>
                      <div className="flex items-center gap-3 justify-end h-9">
                        <span className="text-xs font-bold text-slate-650">
                          {paidPublishingEnabled ? 'مفعّل (خصم نقاط النشر تلقائياً)' : 'معطّل (النشر مجاني للجميع)'}
                        </span>
                        <input
                          type="checkbox"
                          checked={paidPublishingEnabled}
                          onChange={(e) => setPaidPublishingEnabled(e.target.checked)}
                          className="w-5 h-5 rounded text-amber-500 focus:ring-amber-200 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        عند التعطيل، تصبح تكلفة النشر مجانية للجميع ويستطيعون النشر دون الحاجة لرصيد من النقاط.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex gap-2 justify-start">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      {savingSettings ? 'جاري الحفظ والتدقيق...' : 'حفظ وتفعيل التعديلات الإدارية'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Deductions Auditing system ledger */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-gray-100 font-bold text-xs text-slate-700 select-none flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">Deductions Audit ledger</span>
                  <span>مراجعة جميع عمليات خصم النقاط والمصاريف</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[600px]">
                    <thead className="bg-slate-100 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3.5">الحالة</th>
                        <th className="p-3.5">التوقيت والتاريخ</th>
                        <th className="p-3.5">التفاصيل الكاملة لعملية الخصم</th>
                        <th className="p-3.5">المسؤول الإداري / العضو المعني</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-slate-705 font-medium">
                      {auditLogs
                        .filter(log => log.action.includes('خصم') || log.action.includes('نشر') || log.details.includes('خصم') || log.details.includes('نقاط'))
                        .map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                تم التنفيذ
                              </span>
                            </td>
                            <td className="p-3.5 text-gray-400 font-mono text-[10px]">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="p-3.5 text-right font-sans text-slate-800 max-w-sm">{log.details}</td>
                            <td className="p-3.5 font-bold text-slate-900">{log.adminName}</td>
                          </tr>
                        ))}
                      {auditLogs.filter(log => log.action.includes('خصم') || log.action.includes('نشر') || log.details.includes('خصم') || log.details.includes('نقاط')).length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 text-xs font-bold">
                            لا توجد عمليات خصم نقاط مسجلة حديثاً في سجل التدقيق المالي.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'categories-order' && (
            <div className="space-y-6 animate-fade-in" id="admin-categories-order-tab">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs text-right">
                <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-amber-500 inline" />
                    <span>نظام إدارة وترتيب الأقسام الرئيسية</span>
                  </h3>
                  <span className="text-[10px] text-amber-600 bg-amber-50 font-bold px-3 py-1 rounded-full uppercase select-none font-sans">
                    {currentUser?.role === 'superadmin' ? 'لوحة المدير العام (Super Admin)' : 
                     currentUser?.role === 'admin' ? 'لوحة مدير المنصة (Admin)' : 'لوحة المشرف المساعد (Moderator)'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  يمكنك إعادة ترتيب الأقسام الرئيسية بالضغط على أزرار التوجيه (الأعلى/الأسفل) أو بسحب وإفلات العناصر في القائمة أدناه، ثم الضغط على زر حفظ الترتيب لتطبيق التغيير مباشرة على الواجهة لجميع زوار المنصة.
                </p>

                {categoriesMessage && (
                  <div className={`p-3 rounded-lg text-xs font-bold mb-4 ${
                    categoriesMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {categoriesMessage.text}
                  </div>
                )}

                {/* Drag and Drop list container */}
                <div className="space-y-3 max-w-2xl mx-auto">
                  {panelCategories.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">جاري تحميل الأقسام...</div>
                  ) : (
                    panelCategories.map((cat, index) => {
                      const getCatIconLocal = (slug: string) => {
                        switch (slug) {
                          case 'clothing-accessories': return <Shirt className="w-5 h-5 text-slate-600" />;
                          case 'consumer-electronics': return <Smartphone className="w-5 h-5 text-slate-600" />;
                          case 'sports-leisure': return <Activity className="w-5 h-5 text-slate-600" />;
                          case 'beauty-cosmetics': return <Sparkles className="w-5 h-5 text-slate-600" />;
                          case 'jewelry-watches': return <Watch className="w-5 h-5 text-slate-600" />;
                          case 'food-nutrition': return <UtensilsCrossed className="w-5 h-5 text-slate-600" />;
                          case 'home-kitchen': return <Home className="w-5 h-5 text-slate-600" />;
                          default: return <Grid className="w-5 h-5 text-slate-600" />;
                        }
                      };

                      return (
                        <div
                          key={cat.id}
                          draggable={currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || currentUser?.role === 'moderator'}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', index.toString());
                            e.currentTarget.classList.add('opacity-50', 'border-amber-500');
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.classList.remove('opacity-50', 'border-amber-500');
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('bg-slate-100');
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('bg-slate-100');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('bg-slate-100');
                            const sourceIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                            if (isNaN(sourceIdx) || sourceIdx === index) return;
                            
                            const updated = [...panelCategories];
                            const [draggedItem] = updated.splice(sourceIdx, 1);
                            updated.splice(index, 0, draggedItem);
                            setPanelCategories(updated);
                          }}
                          className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-xs transition duration-150 cursor-move select-none"
                        >
                          {/* Left Controls & Actions */}
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || currentUser?.role === 'moderator') && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => {
                                    if (index === 0) return;
                                    const updated = [...panelCategories];
                                    const temp = updated[index];
                                    updated[index] = updated[index - 1];
                                    updated[index - 1] = temp;
                                    setPanelCategories(updated);
                                  }}
                                  className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs hover:bg-slate-100 transition-all ${
                                    index === 0 ? 'opacity-35 cursor-not-allowed text-slate-300' : 'text-slate-700 cursor-pointer'
                                  }`}
                                  title="تحريك لأعلى"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === panelCategories.length - 1}
                                  onClick={() => {
                                    if (index === panelCategories.length - 1) return;
                                    const updated = [...panelCategories];
                                    const temp = updated[index];
                                    updated[index] = updated[index + 1];
                                    updated[index + 1] = temp;
                                    setPanelCategories(updated);
                                  }}
                                  className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs hover:bg-slate-100 transition-all ${
                                    index === panelCategories.length - 1 ? 'opacity-35 cursor-not-allowed text-slate-300' : 'text-slate-700 cursor-pointer'
                                  }`}
                                  title="تحريك لأسفل"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Right Details Container */}
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing shrink-0" />
                            
                            <div className="w-9 h-9 bg-slate-100 border border-slate-150 rounded-xl flex items-center justify-center shrink-0">
                              {getCatIconLocal(cat.slug)}
                            </div>

                            <div className="text-right">
                              <span className="block text-xs font-black text-slate-800">{cat.nameAr}</span>
                              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide">{cat.nameFr}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Action controls below panel */}
                {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || currentUser?.role === 'moderator') && panelCategories.length > 0 && (
                  <div className="flex items-center gap-3 justify-center mt-8 border-t border-slate-150 pt-5">
                    <button
                      type="button"
                      disabled={savingCategoryOrder}
                      onClick={async () => {
                        try {
                          setSavingCategoryOrder(true);
                          setCategoriesMessage(null);
                          
                          const orderedIds = panelCategories.map(c => c.id);
                          const res = await fetch('/api/categories/reorder', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              adminId: currentUser?.id,
                              orderedIds
                            })
                          });

                          if (res.ok) {
                            const data = await res.json();
                            setPanelCategories(data.categories);
                            setCategoriesMessage({
                              type: 'success',
                              text: 'تم حفظ ترتيب الأقسام الجديد وتعميمه بنجاح! سيظهر التغيير فوراً لجميع المستخدمين.'
                            });
                            window.dispatchEvent(new CustomEvent('categories-reordered', { detail: data.categories }));
                          } else {
                            const err = await res.json();
                            setCategoriesMessage({
                              type: 'error',
                              text: err.error || 'خطأ أثناء حفظ الترتيب الجديد.'
                            });
                          }
                        } catch (e: any) {
                          setCategoriesMessage({
                            type: 'error',
                            text: 'حدث خطأ غير متوقع في الشبكة.'
                          });
                        } finally {
                          setSavingCategoryOrder(false);
                        }
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingCategoryOrder ? 'جاري حفظ الترتيب...' : 'حفظ الترتيب الجديد'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={savingCategoryOrder}
                      onClick={async () => {
                        if (!confirm('هل أنت متأكد من رغبتك في إعادة ضبط الأقسام إلى الترتيب الافتراضي للمنصة؟')) return;
                        try {
                          setSavingCategoryOrder(true);
                          setCategoriesMessage(null);
                          
                          const res = await fetch('/api/categories/reset', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              adminId: currentUser?.id
                            })
                          });

                          if (res.ok) {
                            const data = await res.json();
                            setPanelCategories(data.categories);
                            setCategoriesMessage({
                              type: 'success',
                              text: 'تمت إعادة تعيين ترتيب الأقسام إلى الوضع الافتراضي للسيستم بنجاح.'
                            });
                            window.dispatchEvent(new CustomEvent('categories-reordered', { detail: data.categories }));
                          } else {
                            const err = await res.json();
                            setCategoriesMessage({
                              type: 'error',
                              text: err.error || 'خطأ أثناء إعادة تعيين الترتيب.'
                            });
                          }
                        } catch (e: any) {
                          setCategoriesMessage({
                            type: 'error',
                            text: 'حدث خطأ غير متوقع.'
                          });
                        } finally {
                          setSavingCategoryOrder(false);
                        }
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs rounded-xl border border-slate-250 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>إعادة الترتيب الافتراضي</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6 animate-fade-in" id="admin-roles-tab">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs text-right">
                <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-600 inline" />
                    <span>منصة تعديل الصلاحيات والأدوار للمستخدمين</span>
                  </h3>
                  <span className="text-[10px] text-purple-600 bg-purple-50 font-bold px-3 py-1 rounded-full font-mono uppercase select-none font-sans">
                    {currentUser?.role === 'superadmin' ? 'لوحة المدير العام (Super Admin)' : 
                     currentUser?.role === 'admin' ? 'لوحة مدير المنصة (Admin)' : 'لوحة المشرف المساعد (Moderator) - عرض فقط'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  {currentUser?.role === 'superadmin' ? 'بصفتك مديراً عاماً (Super Admin)، تملك كامل الصلاحيات لتعديل أدوار جميع الحسابات وإضافة أو سحب امتيازات المسؤولين الآخرين.' :
                   currentUser?.role === 'admin' ? 'بصفتك مديراً للمنصة (Admin)، يمكنك تعديل أدوار الأعضاء العاديين وترفيعهم لتبادل الرتب الأساسية. لا يمكنك تعديل رتب الإدارة العليا الموازية أو الأرفع منك.' : 
                   'بصفتك مشرفاً مساعداً (Moderator)، يمكنك مراجعة وتصفح هرمية الرتب والصلاحيات فقط، ويُحظر قانون المعاملات تعديل أي أدوار أو حسابات من هذه اللوحة.'}
                </p>

                {/* User Search & Add Actions Row */}
                <div className="flex flex-col md:flex-row-reverse md:items-center justify-between gap-4 mb-6">
                  {/* User Search Input */}
                  <div className="w-full max-w-md">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">البحث السريع عن العضو:</label>
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="ابحث بواسطة الاسم، البريد الإلكتروني أو رقم الهاتف..."
                      className="w-full bg-slate-50 border border-gray-250 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 text-right focus:outline-none focus:ring-purple-500/30"
                    />
                  </div>

                  {/* Add New User Button (Super admin & Admin only) */}
                  {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
                    <div className="self-end">
                      <button
                        type="button"
                        onClick={() => {
                          setCreateForm({
                            name: '',
                            email: '',
                            phone: '',
                            whatsapp: '',
                            city: 'الرباط',
                            password: '',
                            confirmPassword: '',
                            role: 'buyer'
                          });
                          setCreateError('');
                          setShowCreateModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm hover:shadow-md cursor-pointer duration-150"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مستخدم جديد</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Users Role Hierarchy Grid Card Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[700px]">
                    <thead className="bg-slate-100 text-slate-500 font-bold font-sans">
                      <tr>
                        <th className="p-3.5">تحديث الدور / الصلاحية فوراً</th>
                        <th className="p-3.5">الصلاحية الحالية</th>
                        <th className="p-3.5">رقم الهاتف والمدينة</th>
                        <th className="p-3.5">البريد الإلكتروني</th>
                        <th className="p-3.5">الاسم الكامل للعضو</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-medium">
                      {filteredUsersList.map((userObj) => (
                        <tr key={userObj.id} className="hover:bg-slate-50 transition-colors">
                          {/* Role Changer Trigger */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 justify-start">
                              <select
                                value={userObj.role}
                                disabled={currentUser?.role === 'moderator' || userObj.role === 'superadmin'}
                                onChange={(e) => handleChangeUserRole(userObj.id, e.target.value)}
                                className={`bg-white border border-gray-250 py-1 px-2.5 rounded-lg text-xs leading-normal font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                  (currentUser?.role === 'moderator' || userObj.role === 'superadmin') ? 'cursor-not-allowed bg-gray-100 opacity-60' : 'cursor-pointer'
                                }`}
                              >
                                <option value="buyer">مشتري جملة (Buyer)</option>
                                <option value="seller">بائع جملة (Seller)</option>
                                <option value="moderator">مشرف (Moderator)</option>
                                <option value="admin">مدير (Admin)</option>
                                <option value="superadmin">مدير عام (Super Admin)</option>
                              </select>
                              <span className="text-[10px] text-purple-600 font-semibold px-2 py-1 bg-purple-50 rounded-md">تعديل رتبة</span>
                            </div>
                          </td>
                          {/* Current Role badge */}
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold ${
                              userObj.role === 'superadmin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                              userObj.role === 'admin' ? 'bg-red-100 text-red-700 border border-red-200' :
                              userObj.role === 'moderator' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              userObj.role === 'seller' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {userObj.role === 'superadmin' ? 'مدير عام' : 
                               userObj.role === 'admin' ? 'مدير منصة' : 
                               userObj.role === 'moderator' ? 'مشرف مساعد' : 
                               userObj.role === 'seller' ? 'بائع جملة مميز' : 'مشتري مسجل'}
                            </span>
                          </td>
                          {/* Info */}
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-800 font-mono text-[10px]">{userObj.phone}</div>
                            <div className="text-[10px] text-gray-400 font-bold">{userObj.city || 'الدار البيضاء'}</div>
                          </td>
                          {/* Email */}
                          <td className="p-3.5 font-mono text-[11px] text-slate-650">
                            {userObj.email}
                          </td>
                          {/* Name & Status */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2 justify-end">
                              <div>
                                <span className="font-extrabold text-slate-800">{userObj.name}</span>
                                <span className="text-[9px] text-gray-400 block font-mono">ID: {userObj.id}</span>
                              </div>
                              {userObj.status === 'suspended' && (
                                <span className="text-[8px] bg-red-550 text-white font-bold px-1.5 py-0.5 rounded-sm">موقوف</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsersList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 text-xs font-bold leading-normal">
                            عذراً، لم نجد أي تطابق لمعايير البحث المطلوبة.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Points Management Modal Popup */}
          {pointsManageUser && (currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="points-management-modal">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden text-right animate-scale-in">
                {/* Header Banner */}
                <div className="bg-gradient-to-l from-amber-600 to-amber-500 p-5 text-white flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-100" />
                    <h3 className="font-extrabold text-xs">
                      {isRtl ? `إدارة رصيد نقاط العضو: ${pointsManageUser.name}` : `Manage points: ${pointsManageUser.name}`}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPointsManageUser(null)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Current Points Stats */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block font-medium">
                        {isRtl ? 'البريد الإلكتروني' : 'User Email'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 block truncate max-w-[180px]">
                        {pointsManageUser.email}
                      </span>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-xs text-slate-500 block font-medium">
                        {isRtl ? 'الرصيد الحالي' : 'Current Balance'}
                      </span>
                      <span className="text-lg font-black text-amber-500 animate-pulse">
                        {pointsManageUser.points || 0} PT
                      </span>
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isRtl ? 'عدد النقاط المطلوب معالجتها *' : 'Points Amount *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder={isRtl ? "مثال: 100" : "e.g. 100"}
                      value={pointsManageAmount}
                      onChange={(e) => setPointsManageAmount(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none text-right font-mono"
                    />
                  </div>

                  {/* Reason Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isRtl ? 'سبب الإجراء الضريبي/الإداري (اختياري يوثق بالأرشيف)' : 'Action Reason (Optional - will be logged)'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={isRtl ? "مثال: مكافأة لنشر عروض متميزة أو تسوية رصيد شحن يدوي" : "e.g. Bonus for outstanding supplier behavior..."}
                      value={pointsManageReason}
                      onChange={(e) => setPointsManageReason(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none text-right"
                    />
                  </div>

                  {/* Override balance toggle (Only for Deduct action) */}
                  <div className="flex items-center justify-between bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                    <div className="text-right pr-2">
                      <label className="text-xs font-extrabold text-amber-900 block cursor-pointer">
                        {isRtl ? 'تجاوز رصيد المستخدم بالسالب (Override)' : 'Allow Negative Balance (Override)'}
                      </label>
                      <span className="text-[10px] text-amber-700 block leading-normal">
                        {isRtl ? 'يسمح بخصم النقاط حتى لو كان الرصيد غير كافٍ (قد يصبح بالسالب للمخالفات).' : 'Forces debit even if user point balance is insufficient.'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pointsManageOverride}
                      onChange={(e) => setPointsManageOverride(e.target.checked)}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer shrink-0"
                    />
                  </div>

                  {/* Actions Grid */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Add Button */}
                      <button
                        type="button"
                        disabled={pointsManageSubmitting}
                        onClick={() => handlePointsSubmit('add')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isRtl ? 'إضافة نقاط (+)' : 'Add Points (+)'}</span>
                      </button>

                      {/* Deduct Button */}
                      <button
                        type="button"
                        disabled={pointsManageSubmitting}
                        onClick={() => handlePointsSubmit('deduct')}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{isRtl ? 'خصم نقاط (-)' : 'Deduct Points (-)'}</span>
                      </button>
                    </div>

                    {/* Zero Out Button */}
                    <button
                      type="button"
                      disabled={pointsManageSubmitting}
                      onClick={() => handlePointsSubmit('zero')}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>{isRtl ? 'تصفير رصيد العضو بالكامل (0 PT)' : 'Completely Reset Balance (0 PT)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create New User Modal Popup */}
          {showCreateModal && (currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" id="create-user-modal">
              <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden text-right animate-scale-in">
                {/* Header Banner */}
                <div className="bg-gradient-to-l from-purple-700 to-indigo-600 p-5 text-white flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-100" />
                    <h3 className="font-extrabold text-sm">{isRtl ? 'إضافة وتشييد حساب مستخدم جديد' : 'Create & Provision New User Account'}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                  {createError && (
                    <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-xs font-semibold text-red-650 flex items-center gap-2 leading-relaxed">
                      <span>⚠️</span>
                      <span>{createError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{isRtl ? 'الاسم الكامل للعضو *' : 'Full Name *'}</label>
                      <input
                        type="text"
                        required
                        placeholder={isRtl ? 'محمد البقالي' : 'e.g. Mohamed Elbakkali'}
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-right"
                      />
                    </div>

                    {/* Email address */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{isRtl ? 'البريد الإلكتروني للعضو *' : 'Email Address *'}</label>
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-left font-mono"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{isRtl ? 'رقم الهاتف (الوطني/الدولي) *' : 'Phone Number *'}</label>
                      <input
                        type="text"
                        required
                        placeholder="+212600000000"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-left font-mono"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{isRtl ? 'رقم الواتساب (اختياري)' : 'WhatsApp (Optional)'}</label>
                      <input
                        type="text"
                        placeholder="+212600000000"
                        value={createForm.whatsapp}
                        onChange={(e) => setCreateForm({ ...createForm, whatsapp: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-left font-mono"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{isRtl ? 'المدينة والمنطقة بالمغرب *' : 'City & Location *'}</label>
                      <input
                        type="text"
                        required
                        placeholder={isRtl ? 'الدار البيضاء' : 'e.g. Casablanca'}
                        value={createForm.city}
                        onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-right"
                      />
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{isRtl ? 'تعيين دور وصلاحيات الحساب' : 'Assign System Role'}</label>
                      <select
                        value={createForm.role}
                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-right font-bold cursor-pointer"
                      >
                        <option value="buyer">{isRtl ? 'مشتري جملة (Buyer)' : 'Buyer Store'}</option>
                        <option value="seller">{isRtl ? 'بائع جملة مميز (Seller)' : 'Seller Supplier'}</option>
                        <option value="moderator">{isRtl ? 'مشرف مساعد (Moderator)' : 'Platform Moderator'}</option>
                        <option value="admin">{isRtl ? 'مدير منصة (Admin)' : 'Platform Admin'}</option>
                        {currentUser?.role === 'superadmin' && (
                          <option value="superadmin">{isRtl ? 'مدير عام (Super Admin)' : 'Super Admin'}</option>
                        )}
                      </select>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{isRtl ? 'كلمة المرور *' : 'Password *'}</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-left font-mono"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{isRtl ? 'تأكيد كلمة المرور *' : 'Confirm Password *'}</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={createForm.confirmPassword}
                        onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-left font-mono"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-550 leading-normal mt-2">
                    {isRtl ? 'تنبيه أمان: بمجرد الحفظ والإنشاء، سيتم تنشيط الحساب فوراً بصورة تلقائية (is_active = true) ومنحه رصيد مبدئي ترحيبي قدره 200 نقطة. لن يحتاج المستخدم لتفعيل البريد لإتمام صلاحية الدخول.' : 
                     'Security note: Once created, the account is activated instantly (is_active = true) with 200 welcome points. No email confirmation required.'}
                  </p>

                  {/* Actions buttons */}
                  <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition overflow-hidden cursor-pointer"
                    >
                      {isRtl ? 'إلغاء وتراجع' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="px-5 py-2 text-xs font-black bg-purple-650 hover:bg-purple-750 text-white rounded-lg transition flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {creatingUser ? (
                        <span>{isRtl ? 'جاري الإنشاء والتشييد...' : 'Creating...'}</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4.5 h-4.5" />
                          <span>{isRtl ? 'إنشاء حساب جديد وتفعيله' : 'Provision Account'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tab 9: Payment Gate Integrations Manager (Admin \& Super Admin ONLY) */}
          {activeTab === 'payments' && (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
            <div className="space-y-6 animate-fade-in" id="admin-payments-tab">
              <form onSubmit={handleSavePaymentConfig} className="space-y-6">
                
                {/* 1. Cash Agency Configuration Group */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-xs text-right">
                  <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-600 inline" />
                      <span>إعدادات الدفع كاش بالوكالات (كاش بلوس والوفاكاش)</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-650 select-none">
                        {paymentConfig.cashEnabled ? 'مفعّل بالبوابة' : 'معطّل بالبوابة'}
                      </span>
                      <input
                        type="checkbox"
                        checked={paymentConfig.cashEnabled}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cashEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">عنوان ووكالة الدفع:</label>
                      <input
                        type="text"
                        required={paymentConfig.cashEnabled}
                        value={paymentConfig.cashAgencyName || ''}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cashAgencyName: e.target.value })}
                        placeholder="مثال: وكالات كاش بلوس ووفاكاش المغرب"
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">بيانات الاتصال والاستفسار للعملاء:</label>
                      <input
                        type="text"
                        required={paymentConfig.cashEnabled}
                        value={paymentConfig.cashContact || ''}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cashContact: e.target.value })}
                        placeholder="مثال: +212522778899"
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">تعليمات الدفع المخصصة للعميل المغربي:</label>
                      <textarea
                        rows={3}
                        required={paymentConfig.cashEnabled}
                        value={paymentConfig.cashInstructions || ''}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cashInstructions: e.target.value })}
                        placeholder="اكتب الإرشادات التفصيلية هنا..."
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PayPal Configuration Group */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-xs text-right">
                  <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-600 inline" />
                      <span>اتصال وبوابة بايبال (PayPal Merchant SDK)</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-650 select-none">
                        {paymentConfig.paypalEnabled ? 'مفعّل بالبوابة' : 'معطّل بالبوابة'}
                      </span>
                      <input
                        type="checkbox"
                        checked={paymentConfig.paypalEnabled}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, paypalEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-705">PayPal Client ID:</label>
                      <input
                        type="text"
                        required={paymentConfig.paypalEnabled}
                        value={paymentConfig.paypalClientId || ''}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, paypalClientId: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Client ID string"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-705">PayPal Client Secret:</label>
                      <input
                        type="password"
                        required={paymentConfig.paypalEnabled}
                        value={paymentConfig.paypalClientSecret || ''}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, paypalClientSecret: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Secure secret token"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-705">بيئة التشغيل (PayPal Engine Mode):</label>
                      <select
                        value={paymentConfig.paypalMode || 'sandbox'}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, paypalMode: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none font-bold"
                      >
                        <option value="sandbox">Sandbox (فحص واختبار)</option>
                        <option value="live">Live (مباشر تداول حقيقي)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Bank Credit Card Configuration Group (Stripe/Card payment gateway) */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-xs text-right">
                  <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600 inline" />
                      <span>بوابة معالجة البطاقات البنكية الدولية والمحلية</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-650 select-none">
                        {paymentConfig.cardEnabled ? 'مفعّل بالبوابة' : 'معطّل بالبوابة'}
                      </span>
                      <input
                        type="checkbox"
                        checked={paymentConfig.cardEnabled}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cardEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-705">Gateway Public API Key:</label>
                      <input
                        type="text"
                        required={paymentConfig.cardEnabled}
                        value={paymentConfig.cardPublicKey || ''}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cardPublicKey: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="pk_test_..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-750">Gateway Secret Key Keys:</label>
                      <input
                        type="password"
                        required={paymentConfig.cardEnabled}
                        value={paymentConfig.cardSecretKey || ''}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cardSecretKey: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="sk_test_..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-750">Webhooks Endpoint Secret:</label>
                      <input
                        type="text"
                        value={paymentConfig.cardWebhookSecret || ''}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cardWebhookSecret: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                        placeholder="whsec_..."
                      />
                    </div>
                  </div>
                </div>

                {/* Submit action panel */}
                <div className="bg-slate-100 p-4 rounded-xl flex gap-3 justify-start shrink-0">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-3 bg-slate-900 border border-slate-950 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 disabled:bg-slate-400 cursor-pointer shadow-lg active:scale-97 transition-all flex items-center justify-center gap-1"
                  >
                    {savingSettings ? 'جاري الحفظ والتدقيق...' : 'حفظ إعدادات بوابات الدفع بالبوابة'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Tab: Cloudflare Settings */}
          {activeTab === 'cloudflare' && (
            <div className="space-y-6 overflow-y-auto p-6 max-h-[calc(85vh-110px)] custom-scrollbar" id="admin-cloudflare-tab">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs font-semibold text-right leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>إعدادات الاتصال السحابي وبوابة الحماية Cloudflare. تعديل هذه الحقول حساس جداً ويتحكم في إمكانية حوكمة النطاقات والنشر الديناميكي لتطبيقات المنصة سحابياً بالكامل. يرجى الحذر وتأكيد صحة المفاتيح قبل النشر.</span>
              </div>

              <form onSubmit={handleSaveCf} className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-xs text-right">
                  <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-indigo-650 inline" />
                      <span>بيانات الوصول السحابية لبوابة Cloudflare</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-705">Cloudflare API Token:</label>
                      <input
                        type="password"
                        required
                        value={cfConfig.cfApiToken || ''}
                        onChange={(e) => setCfConfig({ ...cfConfig, cfApiToken: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:border-indigo-505"
                        placeholder="أدخل رمز الوصول السري الخاص بالنطاق أو الحساب"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-705">Cloudflare Account ID:</label>
                      <input
                        type="text"
                        required
                        value={cfConfig.cfAccountId || ''}
                        onChange={(e) => setCfConfig({ ...cfConfig, cfAccountId: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:border-indigo-55"
                        placeholder="مثال: e281f623910cda..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-705">Cloudflare Zone ID:</label>
                      <input
                        type="text"
                        required
                        value={cfConfig.cfZoneId || ''}
                        onChange={(e) => setCfConfig({ ...cfConfig, cfZoneId: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:border-indigo-55"
                        placeholder="مثال: da17a522bc01df..."
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-705">Domain Name:</label>
                      <input
                        type="text"
                        required
                        value={cfConfig.cfDomainName || ''}
                        onChange={(e) => setCfConfig({ ...cfConfig, cfDomainName: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505"
                        placeholder="مثال: sou9aljoumla.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Connection Test Panel */}
                {cfTestResult && (
                  <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border transition-all text-right ${
                    cfTestResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <div className="flex items-start gap-2.5 flex-row-reverse">
                      <span className="text-base">{cfTestResult.success ? '✓' : '⚠️'}</span>
                      <div>
                        <h4 className="font-bold mb-1">{cfTestResult.success ? 'نجح اختبار الاتصال بنجاح!' : 'فشل اختبار الاتصال بـ Cloudflare'}</h4>
                        <p>{cfTestResult.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions footer */}
                <div className="bg-slate-100 p-4 rounded-xl flex flex-wrap gap-3 justify-start shrink-0">
                  <button
                    type="submit"
                    disabled={savingCf}
                    className="px-6 py-3 bg-slate-900 border border-slate-950 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 disabled:bg-slate-400 cursor-pointer shadow-lg active:scale-97 transition-all"
                  >
                    {savingCf ? 'جاري حفظ الإعدادات...' : 'حفظ إعدادات النشر سحابياً'}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestCf}
                    disabled={testingCf}
                    className="px-5 py-3 bg-white border border-gray-300 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-50 disabled:bg-gray-100 cursor-pointer shadow-sm active:scale-97 transition-all"
                  >
                    {testingCf ? 'جاري اختبار الاتصال سحابياً...' : 'اختبار الاتصال بـ Cloudflare'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Google Integration */}
          {activeTab === 'google' && (
            <div className="space-y-6 overflow-y-auto p-6 max-h-[calc(85vh-110px)] custom-scrollbar" id="admin-google-tab">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl p-4 text-xs font-semibold text-right leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>إعدادات وتكامل بوابات وخدمات Google. يمكنك تفعيل وربط Google Analytics وقوالب التتبع والتحقق من ملكية موقعك (Google Site Verification) بدون تعديل الكود يدوياً. التحديثات تفعّل مباشرة.</span>
              </div>

              <form onSubmit={handleSaveGoogle} className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm text-right animate-fade-in">
                  <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                       <Smartphone className="w-5 h-5 text-indigo-655 inline" />
                      <span>بيانات منصات وخدمات Google المربوطة سحابياً</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-705">Google Site Verification Code:</label>
                      <input
                        type="text"
                        value={googleConfig.verification_code || ''}
                        onChange={(e) => setGoogleConfig({ ...googleConfig, verification_code: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505"
                        placeholder="أدخل كود التحقق من ملكية الموقع (مثال: google-site-verification=abc123xyz...)"
                      />
                      <span className="block text-[10px] text-slate-400">كود التحقق من ملكية الموقع لـ Google Search Console.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-705">Google Analytics Measurement ID (GA4):</label>
                      <input
                        type="text"
                        value={googleConfig.ga_id || ''}
                        onChange={(e) => setGoogleConfig({ ...googleConfig, ga_id: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505"
                        placeholder="مثال: G-XXXXXXXXXX"
                      />
                      <span className="block text-[10px] text-slate-400">المعرف الخاص بإحصائيات تحليلات الزوار Google Analytics (يبدأ بـ G-).</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-705">Google Tag Manager ID (GTM):</label>
                      <input
                        type="text"
                        value={googleConfig.gtm_id || ''}
                        onChange={(e) => setGoogleConfig({ ...googleConfig, gtm_id: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505"
                        placeholder="مثال: GTM-XXXXXXX"
                      />
                      <span className="block text-[10px] text-slate-400">مدير العلامات وأكواد التتبع Google Tag Manager (اختياري).</span>
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-705">Google Merchant Center ID (GMC):</label>
                      <input
                        type="text"
                        value={googleConfig.merchant_id || ''}
                        onChange={(e) => setGoogleConfig({ ...googleConfig, merchant_id: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505"
                        placeholder="أدخل معرف حساب Google Merchant Center (اختياري)"
                      />
                      <span className="block text-[10px] text-slate-400">معرف منصة التجار لعرض المنتجات بقوقل شوبينج.</span>
                    </div>
                  </div>
                </div>

                {/* Form Actions footer */}
                <div className="bg-slate-100 p-4 rounded-xl flex flex-wrap gap-3 justify-start shrink-0">
                  <button
                    type="submit"
                    disabled={savingGoogle}
                    className="px-6 py-3 bg-slate-900 border border-slate-950 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 disabled:bg-slate-400 cursor-pointer shadow-lg active:scale-97 transition-all"
                  >
                    {savingGoogle ? 'جاري الحفظ والتحديث...' : 'حفظ وتفعيل إعدادات Google Integration'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Branding & Identity Settings */}
          {activeTab === 'branding' && (
            <div className="space-y-6 overflow-y-auto p-6 max-h-[calc(85vh-110px)] custom-scrollbar text-right text-slate-800" id="admin-branding-tab">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs font-semibold text-right leading-relaxed flex items-center gap-3">
                <span className="text-lg">🎨</span>
                <span>إعدادات الشعار والهوية البصرية لموقع سوق الجملة المغربي. يمكنك تغيير هوية الموقع كاملة (الشعار الرئيسي وأيقونة الموقع Favicon بالكامل). سيتم تحديث وتعميم التغييرات في جميع صفحات ومقاطع الواجهة تلقائياً في الحال.</span>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm text-right animate-fade-in space-y-8">
                  {/* Section 1: Logo */}
                  <div className="space-y-4">
                    <div className="border-b border-gray-150 pb-3 flex items-center justify-between flex-row-reverse">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                        <span>1. رفع الشعار الرئيسي للموقع (Official Main Logo)</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Upload Input */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">اختيار ملف الشعار:</label>
                        <input
                          type="file"
                          accept=".png,.svg,.jpg,.jpeg,.webp"
                          onChange={(e) => handleFileChange(e, 'logo')}
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-slate-800"
                        />
                        <span className="block text-[10px] text-gray-400">
                          يدعم رفع الصور بصيغة PNG, SVG, JPG, WEBP.
                        </span>

                        <div className="pt-2">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={logoHasText}
                              onChange={(e) => setLogoHasText(e.target.checked)}
                              className="w-4 h-4 text-amber-500 border-gray-350 rounded-sm focus:ring-amber-500"
                            />
                            <span className="text-xs font-bold text-slate-705">الشعار المرفوع يحتوي على الاسم والأيقونة معاً (إخفاء الاسم النصي الافتراضي بجانب الشعار)</span>
                          </label>
                          <p className="text-[10px] text-gray-400 mt-1">
                            قم بتفعيل هذا الخيار في حال كان شعارك المرفوع يحتوي على اسم الموقع بصورة متكاملة لتفادي تكرار الاسم في الهيدر. في حال كان شعارك صورة/أيقونة فقط، اتركه غير مفعّل ليظهر الشعار المرفوع ومجاورًا له الاسم النصي الافتراضي للموقع.
                          </p>
                        </div>
                      </div>

                      {/* Preview Box */}
                      <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center min-h-36">
                        <span className="text-[10px] text-slate-400 font-bold mb-3">معاينة الشعار الفورية (Preview)</span>
                        {brandingLogo ? (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <div className="p-4 bg-white border border-gray-150 rounded-lg shadow-xs flex items-center justify-center max-w-full">
                              <img src={brandingLogo} alt="Logo Preview" className="h-16 sm:h-20 md:h-24 w-auto object-contain animate-pulse-once" referrerPolicy="no-referrer" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setBrandingLogo('')}
                              className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                            >
                              إزالة ومعاودة الاستخدام الافتراضي
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-gray-350 text-2xl">🖼️</span>
                            <p className="text-gray-400 text-xs mt-1">لا يوجد شعار مخصص مرفوع حالياً</p>
                            <p className="text-[10px] text-gray-400 italic font-mono mt-0.5">سوق الجملة الافتراضي: S9 sou9aljoumla</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Favicon */}
                  <div className="space-y-4">
                    <div className="border-b border-gray-150 pb-3 flex items-center justify-between flex-row-reverse">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                        <span>2. رفع أيقونة تبويب المتصفح (Favicon Icon)</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Upload Input */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-707">اختيار ملف Favicon:</label>
                        <input
                          type="file"
                          accept=".png,.ico"
                          onChange={(e) => handleFileChange(e, 'favicon')}
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-slate-800"
                        />
                        <span className="block text-[10px] text-gray-400">
                          يدعم رفع الأيقونات بصيغة ICO, PNG.
                        </span>
                      </div>

                      {/* Preview Box */}
                      <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center min-h-36">
                        <span className="text-[10px] text-slate-400 font-bold mb-3">معاينة الأيقونة الفورية (Favicon Preview)</span>
                        {brandingFavicon ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-xs flex items-center justify-center">
                              <img src={brandingFavicon} alt="Favicon Preview" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setBrandingFavicon('')}
                              className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                            >
                              إزالة ومعاودة الاستخدام الافتراضي
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-gray-350 text-2xl font-black">⭐</span>
                            <p className="text-gray-400 text-xs mt-1">لم يتم تخصيص Favicon</p>
                            <p className="text-[10px] text-gray-400 italic font-mono mt-0.5">يتم عرض الأيقونة التلقائية للمتصفح</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Toolbar Button */}
                <div className="bg-slate-100 p-4 rounded-xl flex flex-wrap gap-3 justify-start shrink-0">
                  <button
                    type="submit"
                    disabled={savingBranding}
                    className="px-6 py-3 bg-slate-900 border border-slate-950 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 disabled:bg-slate-400 cursor-pointer shadow-lg active:scale-97 transition-all"
                  >
                    {savingBranding ? 'جاري حفظ وتعميم الهوية البصرية...' : 'حفظ وتفعيل الشعار والهوية البصرية'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Account Verification Center */}
          {activeTab === 'verification' && (
            <div className="space-y-6 overflow-y-auto p-6 max-h-[calc(85vh-110px)] custom-scrollbar text-right" id="admin-verification-tab">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs text-right animate-fade-in">
                <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 inline" />
                    <span>مركز توثيق الحسابات والشركات (Verification Center)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-3 py-1 rounded-full font-mono uppercase select-none font-sans">
                    {currentUser?.role === 'superadmin' || currentUser?.role === 'admin' ? 'إدارة التوثيق النشطة' : 'عرض فقط'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  يسمح لك مركز التوثيق بالتحقق من هوية ومصداقية شركات وموردي الجملة على المنصة.
                  عند توثيق الحساب، تظهر شارة التحقق الفضي تلقائياً في الملف الشخصي للمورد وفي كافة بطاقات منتجاته لتعزيز الثقة وجذب المشترين.
                </p>

                {/* Verification List table */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[700px]">
                    <thead className="bg-slate-100 text-slate-500 font-bold font-sans">
                      <tr>
                        <th className="p-3.5 text-right">التحكم في حالة التوثيق</th>
                        <th className="p-3.5 text-right">حالة التوثيق</th>
                        <th className="p-3.5 text-right">شارة التحقق الكلية</th>
                        <th className="p-3.5 text-right">الدور التجاري</th>
                        <th className="p-3.5 text-right">المستندات والشركة والبريد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-medium">
                      {filteredUsersList.filter(u => u.role === 'seller' || u.role === 'buyer').map((userObj) => (
                        <tr key={userObj.id} className="hover:bg-slate-50 transition-colors">
                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center gap-1.5 justify-start">
                              <button
                                onClick={async () => {
                                  if (!currentUser) return;
                                  try {
                                    const res = await fetch('/api/admin/users/action', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        userId: userObj.id,
                                        action: 'verify-status',
                                        verificationStatus: 'verified',
                                        adminId: currentUser.id
                                      })
                                    });
                                    if (res.ok) {
                                      alert('تم توثيق الحساب بنجاح وتفعيل الشارة الفضية للمورد.');
                                      fetchAdminData();
                                    } else {
                                      const err = await res.json();
                                      alert(err.error || 'فشلت عملية التوثيق.');
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                disabled={userObj.verificationStatus === 'verified' || currentUser?.role === 'moderator'}
                                className="px-2.5 py-1 bg-emerald-650 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-extrabold text-[10px] rounded cursor-pointer transition-colors"
                              >
                                توثيق (Verify)
                              </button>
                              
                              <button
                                onClick={async () => {
                                  if (!currentUser) return;
                                  try {
                                    const res = await fetch('/api/admin/users/action', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        userId: userObj.id,
                                        action: 'verify-status',
                                        verificationStatus: 'rejected',
                                        adminId: currentUser.id
                                      })
                                    });
                                    if (res.ok) {
                                      alert('تم رفض طلب التوثيق بنجاح.');
                                      fetchAdminData();
                                    } else {
                                      const err = await res.json();
                                      alert(err.error || 'فشل تغيير حالة التوثيق.');
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                disabled={userObj.verificationStatus === 'rejected' || currentUser?.role === 'moderator'}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-extrabold text-[10px] rounded cursor-pointer transition-colors"
                              >
                                رفض (Reject)
                              </button>

                              <button
                                onClick={async () => {
                                  if (!currentUser) return;
                                  try {
                                    const res = await fetch('/api/admin/users/action', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        userId: userObj.id,
                                        action: 'verify-status',
                                        verificationStatus: 'pending',
                                        adminId: currentUser.id
                                      })
                                    });
                                    if (res.ok) {
                                      alert('تمت إزالة توثيق الحساب وإعادته لانتظار المراجعة.');
                                      fetchAdminData();
                                    } else {
                                      const err = await res.json();
                                      alert(err.error || 'فشلت عملية الإزالة.');
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                disabled={userObj.verificationStatus === 'pending' || currentUser?.role === 'moderator'}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-350 disabled:bg-gray-100 disabled:text-gray-400 text-slate-802 font-bold text-[10px] rounded cursor-pointer transition-colors"
                              >
                                إلغاء التوثيق (Unverify)
                              </button>
                            </div>
                          </td>

                          {/* Status column */}
                          <td className="p-3.5 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              userObj.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              userObj.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {userObj.verificationStatus === 'verified' ? 'موثق (Verified)' :
                               userObj.verificationStatus === 'rejected' ? 'مرفوض (Rejected)' :
                               'قيد الانتظار (Pending)'}
                            </span>
                          </td>

                          {/* IsVerified bool status */}
                          <td className="p-3.5 text-right font-bold font-sans">
                            {userObj.isVerified ? (
                              <span className="text-emerald-600 flex items-center gap-1 justify-end">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>موثق نشط</span>
                              </span>
                            ) : (
                              <span className="text-gray-450">غير موثق</span>
                            )}
                          </td>

                          {/* Role */}
                          <td className="p-3.5 text-right font-bold">
                            <span className="text-slate-800 shrink-0 capitalize">{userObj.role}</span>
                          </td>

                          {/* Details */}
                          <td className="p-3.5 text-right">
                            <div className="font-extrabold text-slate-800 flex items-center justify-end gap-1.5">
                              <span>{userObj.name}</span>
                              {userObj.companyName && <span className="text-gray-400 font-bold text-[10px]">({userObj.companyName})</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{userObj.email} • {userObj.city}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Badges Management */}
          {activeTab === 'badges' && (
            <div className="space-y-6 overflow-y-auto p-6 max-h-[calc(85vh-110px)] custom-scrollbar text-right" id="admin-badges-tab">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs text-right animate-fade-in">
                <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500 inline" />
                    <span>إدارة شارات التميز للموردين والشركات (Badges Management)</span>
                  </h3>
                  <span className="text-[10px] text-amber-500 bg-amber-50 font-bold px-3 py-1 rounded-full font-mono uppercase select-none font-sans">
                     شارات وحوافز الموردين
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  يمكنك منح أو سحب شارات متعددة للحسابات التجارية والشركات لتمييز الموردين المتفوقين أو الجدد.
                  الشارات الممنوحة تظهر فوراً في تفاصيل منتجاتهم وفي قائمة العرض لزيادة التفاعل والتسويق الاحترافي.
                </p>

                {/* Badges Assign Grid Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-xs text-right divide-y divide-gray-200 min-w-[750px]">
                    <thead className="bg-slate-100 text-slate-500 font-bold font-sans">
                      <tr>
                        <th className="p-3.5 text-right">سجل التعديل والحفظ</th>
                        <th className="p-3.5 text-right">تحديد شارات التميز المتعددة</th>
                        <th className="p-3.5 text-right">الشارات النشطة حالياً للمورد</th>
                        <th className="p-3.5 text-right">الشركة أو العضو</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-medium">
                      {filteredUsersList.filter(u => u.role === 'seller' || u.role === 'buyer').map((userObj) => {
                        const availableBadges = ['Verified Seller', 'Top Supplier', 'Premium Partner', 'Trusted Company', 'New Seller'];
                        
                        return (
                          <tr key={userObj.id} className="hover:bg-slate-50 transition-colors">
                            {/* Save Button for specific user */}
                            <td className="p-3.5 text-right">
                              <button
                                onClick={async () => {
                                  if (!currentUser) return;
                                  // Gather the current checked badges for this specific user row
                                  const checkboxes = document.querySelectorAll(`input[name="badges-${userObj.id}"]:checked`);
                                  const selectedBadges = Array.from(checkboxes).map((cb: any) => cb.value);
                                  
                                  try {
                                    const res = await fetch('/api/admin/users/action', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        userId: userObj.id,
                                        action: 'save-badges',
                                        badges: selectedBadges,
                                        adminId: currentUser.id
                                      })
                                    });
                                    if (res.ok) {
                                      alert('تم تحديث شارات التميز بنجاح وتفعيلها للمستخدم.');
                                      fetchAdminData();
                                    } else {
                                      const err = await res.json();
                                      alert(err.error || 'فشل حفظ الشارات.');
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                disabled={currentUser?.role === 'moderator'}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-100 disabled:text-gray-400 text-white text-[10px] font-extrabold rounded-lg cursor-pointer transition-colors"
                              >
                                حفظ الشارات
                              </button>
                            </td>

                            {/* Checkboxes selection */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center gap-4 justify-start flex-wrap">
                                {availableBadges.map((badgeName) => {
                                  const isChecked = (userObj.badges || []).includes(badgeName);
                                  let labelAr = badgeName;
                                  if (badgeName === 'Verified Seller') labelAr = 'بائع موثق';
                                  if (badgeName === 'Top Supplier') labelAr = 'مورد رئيسي';
                                  if (badgeName === 'Premium Partner') labelAr = 'شريك مميز';
                                  if (badgeName === 'Trusted Company') labelAr = 'شركة موثوقة';
                                  if (badgeName === 'New Seller') labelAr = 'بائع جديد';

                                  return (
                                    <label key={badgeName} className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-705 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        disabled={currentUser?.role === 'moderator'}
                                        name={`badges-${userObj.id}`}
                                        value={badgeName}
                                        defaultChecked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            const checkboxes = document.querySelectorAll(`input[name="badges-${userObj.id}"]`);
                                            checkboxes.forEach((cb: any) => {
                                              if (cb !== e.target) {
                                                cb.checked = false;
                                              }
                                            });
                                          }
                                        }}
                                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                                      />
                                      <span>{labelAr}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Active badges visual column */}
                            <td className="p-3.5 text-right">
                              <div className="flex flex-wrap gap-1 justify-end max-w-sm">
                                {(userObj.badges || []).map((b, idx) => {
                                  let lbl = b;
                                  let clr = 'bg-gray-100 text-gray-700 border border-gray-200';
                                  if (b === 'Verified Seller') { lbl = 'بائع موثق'; clr = 'bg-blue-50 text-blue-700 border border-blue-200 font-extrabold'; }
                                  if (b === 'Top Supplier') { lbl = 'مورد رئيسي'; clr = 'bg-purple-50 text-purple-700 border border-purple-200 font-extrabold'; }
                                  if (b === 'Premium Partner') { lbl = 'شريك مميز'; clr = 'bg-amber-50 text-amber-700 border border-amber-200 font-extrabold'; }
                                  if (b === 'Trusted Company') { lbl = 'شركة موثوقة'; clr = 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold'; }
                                  if (b === 'New Seller') { lbl = 'بائع جديد'; clr = 'bg-rose-50 text-rose-700 border border-rose-200 font-extrabold'; }
                                  return (
                                    <span key={idx} className={`px-2 py-0.5 rounded text-[8.5px] capitalize font-medium ${clr}`}>
                                      {lbl}
                                    </span>
                                  );
                                })}
                                {(!userObj.badges || userObj.badges.length === 0) && (
                                  <span className="text-gray-400 text-[10px]">لا توجد شارات نشطة</span>
                                )}
                              </div>
                            </td>

                            {/* User details */}
                            <td className="p-3.5 text-right">
                              <div className="font-extrabold text-slate-800 flex items-center justify-end gap-1.5">
                                <span>{userObj.name}</span>
                                {userObj.companyName && <span className="text-gray-400 font-bold text-[10px]">({userObj.companyName})</span>}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{userObj.role} • {userObj.email}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Message Center / Inbox (Gmail/Outlook style) */}
          {activeTab === 'messages' && (
            <div className="w-full flex h-[calc(85vh-110px)] bg-white rounded-xl border border-gray-200 overflow-hidden text-right text-slate-800 animate-fade-in" id="admin-message-center-tab">
              {/* Left sidebar block - folder picker */}
              <div className="w-56 bg-slate-50 border-l border-gray-200 flex flex-col justify-between p-4 flex-shrink-0 text-slate-700">
                <div className="space-y-6">
                  {/* Title of messaging center */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 justify-end">
                      <span>📬 مركز الرسائل المباشرة</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">الربط المباشر مع صفحة اتصل بنا</p>
                  </div>

                  {/* Create New Conversation Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsComposeOpen(true);
                        setSelectedThreadId(null);
                      }}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-650 active:bg-amber-700 text-slate-950 text-xs font-black rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                    >
                      <span className="text-sm">✍️</span>
                      <span>إنشاء محادثة جديدة</span>
                    </button>
                  </div>

                  {/* Mail folders list */}
                  <nav className="flex flex-col gap-1">
                    {[
                      { id: 'inbox', label: 'الوارد (Inbox)', icon: '📥', count: contactThreads.filter(t => !t.isTrash && !t.isArchived).length },
                      { id: 'unread', label: 'غير المقروءة', icon: '✉️', count: contactThreads.filter(t => t.status === 'unread' && !t.isTrash && !t.isArchived).length },
                      { id: 'read', label: 'المقروءة', icon: '📖', count: contactThreads.filter(t => t.status === 'read' && !t.isTrash && !t.isArchived).length },
                      { id: 'important', label: 'الرسائل الهامة', icon: '★', count: contactThreads.filter(t => t.isImportant && !t.isTrash && !t.isArchived).length },
                      { id: 'attachments', label: 'المرفقات', icon: '📎', count: contactThreads.filter(t => !t.isTrash && !t.isArchived && t.messages.some((m: any) => m.attachments && m.attachments.length > 0)).length },
                      { id: 'archive', label: 'الأرشيف', icon: '📂', count: contactThreads.filter(t => t.isArchived && !t.isTrash).length },
                      { id: 'trash', label: 'المهملات', icon: '🗑️', count: contactThreads.filter(t => t.isTrash).length },
                    ].map(folder => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => {
                          setActiveMailFolder(folder.id as any);
                          setSelectedThreadId(null);
                          setIsComposeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeMailFolder === folder.id 
                            ? 'bg-slate-950 text-amber-500 shadow-sm font-extrabold' 
                            : 'hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{folder.icon}</span>
                          <span>{folder.label}</span>
                        </span>
                        {folder.count > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans ${
                            activeMailFolder === folder.id ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {folder.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Info and guidelines branding footer */}
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-250 text-[10px] text-gray-500 leading-relaxed space-y-1 text-right">
                  <div className="font-extrabold text-slate-800">💡 دليل الرد الآمن:</div>
                  <p>تتم مزامنة الرسائل مباشرة مع هوية الزوار. عند الرد يحصل العضو مسجل البريد على ردود الإدارة الموثقة.</p>
                </div>
              </div>

              {/* Feed lists + Message Viewer Split Panel */}
              <div className="flex-1 flex flex-col md:flex-row divide-x divide-x-reverse divide-gray-200">
                {/* List portion */}
                <div className={`flex-1 flex flex-col ${selectedThreadId ? 'hidden md:flex' : 'flex'} min-w-[320px] max-w-md bg-slate-50`}>
                  {/* List Search Bar Header */}
                  <div className="p-3 bg-white border-b border-gray-250 flex flex-col gap-2 shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        value={mailSearchQuery}
                        onChange={(e) => setMailSearchQuery(e.target.value)}
                        placeholder="ابحث بالاسم، البريد، الهاتف أو المحتوى..."
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs text-right focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <span className="absolute right-2.5 top-2.5 text-gray-400">🔍</span>
                      {mailSearchQuery && (
                        <button 
                          type="button"
                          onClick={() => setMailSearchQuery('')} 
                          className="absolute left-2.5 top-2 text-xs font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mail Thread Lists */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-150">
                    {(() => {
                      // Apply filters based on current tab selection
                      let filtered = contactThreads;

                      if (activeMailFolder === 'inbox') {
                        filtered = filtered.filter(t => !t.isTrash && !t.isArchived);
                      } else if (activeMailFolder === 'unread') {
                        filtered = filtered.filter(t => t.status === 'unread' && !t.isTrash && !t.isArchived);
                      } else if (activeMailFolder === 'read') {
                        filtered = filtered.filter(t => t.status === 'read' && !t.isTrash && !t.isArchived);
                      } else if (activeMailFolder === 'important') {
                        filtered = filtered.filter(t => t.isImportant && !t.isTrash && !t.isArchived);
                      } else if (activeMailFolder === 'attachments') {
                        filtered = filtered.filter(t => !t.isTrash && !t.isArchived && t.messages.some((m: any) => m.attachments && m.attachments.length > 0));
                      } else if (activeMailFolder === 'archive') {
                        filtered = filtered.filter(t => t.isArchived && !t.isTrash);
                      } else if (activeMailFolder === 'trash') {
                        filtered = filtered.filter(t => t.isTrash);
                      }

                      // Apply search keyword filter
                      if (mailSearchQuery.trim()) {
                        const q = mailSearchQuery.toLowerCase();
                        filtered = filtered.filter(t => 
                          (t.name || '').toLowerCase().includes(q) ||
                          (t.email || '').toLowerCase().includes(q) ||
                          (t.phone || '').toLowerCase().includes(q) ||
                          (t.title || '').toLowerCase().includes(q) ||
                          (t.snippet || '').toLowerCase().includes(q) ||
                          t.messages.some((m: any) => (m.text || '').toLowerCase().includes(q))
                        );
                      }

                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 text-center text-gray-400 text-xs">
                            <span className="text-3xl block mb-2">📁</span>
                            <span>لا توجد رسائل في هذا المجلد توافق البحث.</span>
                          </div>
                        );
                      }

                      return filtered.map(thread => {
                        const hasAttachments = thread.messages.some((m: any) => m.attachments && m.attachments.length > 0);
                        return (
                          <div
                            key={thread.id}
                            onClick={() => {
                              setSelectedThreadId(thread.id);
                              if (thread.status === 'unread') {
                                handleThreadAction(thread.id, 'read');
                              }
                            }}
                            className={`p-3.5 flex flex-col gap-1.5 cursor-pointer relative transition-all border-r-4 ${
                              selectedThreadId === thread.id 
                                ? 'bg-amber-50/70 border-r-amber-500' 
                                : thread.status === 'unread' 
                                  ? 'bg-white border-r-slate-800 font-extrabold' 
                                  : 'bg-white/40 border-r-transparent hover:bg-slate-100/50'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              {/* Left side actions and time */}
                              <div className="flex flex-col items-end gap-1 flex-shrink-0 text-[10px] text-gray-400 font-mono font-semibold">
                                <span>{new Date(thread.updatedAt).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-[9px]">{new Date(thread.updatedAt).toLocaleDateString('ar-MA', { month: 'numeric', day: 'numeric' })}</span>
                              </div>

                              {/* Right side Sender Name */}
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                {thread.status === 'unread' && (
                                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 animate-pulse" title="غير مقروءة" />
                                )}
                                <span className={`truncate text-xs ${thread.status === 'unread' ? 'font-black text-slate-950' : 'font-medium text-slate-750'}`}>
                                  {thread.name}
                                </span>
                              </div>
                            </div>

                            {/* Subject and Snippet */}
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 justify-end flex-wrap">
                                {thread.type && thread.type !== 'normal' && (
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black leading-none ${
                                    thread.type === 'admin' 
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                      : thread.type === 'important' 
                                        ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' 
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}>
                                    {thread.type === 'admin' ? '🏛️ إداري' : thread.type === 'important' ? '⚠️ مهم' : '🎁 ترويجي'}
                                  </span>
                                )}
                                <h4 className={`text-xs truncate ${thread.status === 'unread' ? 'font-black text-slate-900' : 'text-slate-750'}`}>
                                  {thread.title}
                                </h4>
                              </div>
                              <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                                {thread.snippet}
                              </p>
                            </div>

                            {/* Icons checklist block */}
                            <div className="flex items-center justify-between mt-1 text-[11px]">
                              {/* Left folder action control quick triggers */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleThreadAction(thread.id, 'important_toggle');
                                  }}
                                  className={`text-slate-400 hover:text-amber-500 text-xs cursor-pointer ${thread.isImportant ? 'text-amber-500 scale-110 font-bold' : ''}`}
                                  title="تحديد كرسالة مهمة"
                                >
                                  {thread.isImportant ? '★' : '☆'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleThreadAction(thread.id, 'archive_toggle');
                                  }}
                                  className="text-slate-400 hover:text-slate-800 text-xs cursor-pointer"
                                  title={thread.isArchived ? 'نقل لصندوق الوارد' : 'أرشفة الرسالة'}
                                >
                                  📦
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleThreadAction(thread.id, 'trash_toggle');
                                  }}
                                  className="text-slate-400 hover:text-red-500 text-xs cursor-pointer"
                                  title={thread.isTrash ? 'استعادة الرسالة' : 'نقل لسلة المهملات'}
                                >
                                  🗑️
                                </button>
                              </div>

                              {/* Right attachment indicators */}
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                {hasAttachments && (
                                  <span className="flex items-center gap-0.5 text-slate-500 font-sans tracking-tight">
                                    <span>📎</span>
                                    <span>{thread.messages.reduce((acc: number, m: any) => acc + (m.attachments ? m.attachments.length : 0), 0)}</span>
                                  </span>
                                )}
                                {thread.userId && (
                                  <span className="bg-slate-200 text-slate-700 px-1 rounded-sm text-[9px] font-sans">
                                    عضو
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Message Viewer panel detail */}
                <div className={`flex-1 flex flex-col bg-white overflow-hidden ${selectedThreadId || isComposeOpen ? 'flex' : 'hidden md:flex'}`}>
                  {isComposeOpen ? (
                    <div className="flex-1 flex flex-col overflow-hidden text-right animate-fade-in" id="compose-thread-panel">
                      {/* Composer Header */}
                      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsComposeOpen(false)}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-500 font-extrabold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            ✕ إغلاق النافذة
                          </button>
                        </div>
                        <h3 className="text-sm font-black flex items-center gap-2">
                          <span>📝 بدء محادثة جديدة / إرسال جماعي</span>
                        </h3>
                      </div>

                      {/* Composer Form Area */}
                      <form onSubmit={handleSendCompose} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-50/50">
                        {/* 1. Recipient Selection block */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                          <label className="block text-xs font-black text-slate-800">
                            👥 تحديد المستخدمين المستهدفين (يمكنك اختيار واحد أو أكثر لإرسال جماعي):
                          </label>

                          {/* Quick selection categories helpers */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px] justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const allSellers = users.filter(u => u.role === 'seller').map(u => u.id);
                                setComposeSelectedUserIds(allSellers);
                              }}
                              className="px-2 py-1 bg-amber-100 text-amber-850 border border-amber-300 rounded hover:bg-amber-200 text-[10px] font-bold cursor-pointer"
                            >
                              📢 إضافة جميع البائعين ({users.filter(u => u.role === 'seller').length})
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const allBuyers = users.filter(u => u.role === 'buyer').map(u => u.id);
                                setComposeSelectedUserIds(allBuyers);
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-850 border border-blue-300 rounded hover:bg-blue-200 text-[10px] font-bold cursor-pointer"
                            >
                              📢 إضافة جميع المشترين ({users.filter(u => u.role === 'buyer').length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setComposeSelectedUserIds([])}
                              className="px-2 py-1 bg-gray-100 text-gray-800 border border-gray-305 rounded hover:bg-gray-200 text-[10px] font-bold cursor-pointer"
                            >
                              🗑️ تفريغ التحديد
                            </button>
                          </div>

                          {/* Live Search bar for registered Users */}
                          <div className="relative">
                            <input
                              type="text"
                              value={composeUserSearch}
                              onChange={(e) => setComposeUserSearch(e.target.value)}
                              placeholder="ابحث عن العضو بالاسم الكامل، البريد، الهاتف..."
                              className="w-full bg-slate-100 border border-gray-250 rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all text-right"
                            />
                            <span className="absolute right-2.5 top-2.5 text-gray-400">🔍</span>
                          </div>

                          {/* Live Search results list */}
                          {composeUserSearch.trim() && (
                            <div className="border border-gray-250 rounded-lg max-h-40 overflow-y-auto bg-white custom-scrollbar divide-y divide-gray-100">
                              {(() => {
                                const match = composeUserSearch.trim().toLowerCase();
                                const filtered = users.filter(u => 
                                  (u.name || '').toLowerCase().includes(match) ||
                                  (u.email || '').toLowerCase().includes(match) ||
                                  (u.phone || '').toLowerCase().includes(match) ||
                                  (u.id || '').toLowerCase().includes(match)
                                );

                                if (filtered.length === 0) {
                                  return <p className="p-3 text-center text-xs text-gray-400">لا توجد نتائج مطابقة لبحثك</p>;
                                }

                                return filtered.map(u => {
                                  const isSelected = composeSelectedUserIds.includes(u.id);
                                  return (
                                    <div
                                      key={u.id}
                                      onClick={() => {
                                        if (isSelected) {
                                          setComposeSelectedUserIds(prev => prev.filter(id => id !== u.id));
                                        } else {
                                          setComposeSelectedUserIds(prev => [...prev, u.id]);
                                        }
                                      }}
                                      className="p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                      {/* Left side selection check */}
                                      <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold font-sans text-[10px] ${
                                        isSelected ? 'bg-amber-400 border-amber-600 text-slate-950' : 'border-gray-300'
                                      }`}>
                                        {isSelected && '✓'}
                                      </span>

                                      {/* Right user metadata descriptor */}
                                      <div className="text-right">
                                        <p className="font-extrabold text-slate-950">{u.name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">
                                          {u.email} {u.phone ? `• ${u.phone}` : ''} • ({u.role === 'seller' ? 'بائع' : 'مشتري'})
                                        </p>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          )}

                          {/* Currently selected users pill review feed */}
                          <div>
                            <span className="block text-[11px] font-bold text-gray-400 mb-1.5">
                              المستلمون المختارون حالياً ({composeSelectedUserIds.length}):
                            </span>
                            {composeSelectedUserIds.length === 0 ? (
                              <p className="text-[11px] text-rose-500 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
                                ⚠️ لم يتم اختيار أي مستخدم بعد. استخدم خانة البحث أعلاه لاختيار وجهة الإرسال.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-gray-150 rounded-lg custom-scrollbar">
                                {composeSelectedUserIds.map(uId => {
                                  const uObj = users.find(u => u.id === uId);
                                  return (
                                    <div key={uId} className="bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                                      <span>{uObj ? uObj.name : uId}</span>
                                      <button
                                        type="button"
                                        onClick={() => setComposeSelectedUserIds(prev => prev.filter(id => id !== uId))}
                                        className="text-amber-700 hover:text-red-650 font-black text-xs cursor-pointer"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 2. Message Category and Title */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category Dropdown */}
                            <div className="space-y-1.5 text-right font-sans">
                              <label className="block text-xs font-black text-slate-800">📌 نوع وتصنيف الرسالة:</label>
                              <select
                                value={composeType}
                                onChange={(e) => setComposeType(e.target.value as any)}
                                className="w-full bg-slate-50 border border-gray-250 rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                              >
                                <option value="normal">💬 رسالة عادية (Normal)</option>
                                <option value="admin">🏛️ رسالة إدارية رسمية (Administrative)</option>
                                <option value="important">⚠️ إشعار هام ذو أولوية (Important)</option>
                                <option value="promo">🎁 عرض ترويجي ترويجي (Promotion)</option>
                              </select>
                            </div>

                            {/* Title Field */}
                            <div className="space-y-1.5 text-right">
                              <label className="block text-xs font-black text-slate-800">عنوان الموضوع (Subject):</label>
                              <input
                                type="text"
                                value={composeTitle}
                                onChange={(e) => setComposeTitle(e.target.value)}
                                placeholder="مثال: تحديث أمني، أو كود خصم ترويجي جديد..."
                                className="w-full bg-slate-50 border border-gray-250 rounded-lg p-2.5 text-xs text-right focus:outline-none focus:border-amber-500"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Text Body Content */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1.5 text-right">
                          <label className="block text-xs font-black text-slate-800">✍️ نص الرسالة التفصيلي:</label>
                          <textarea
                            value={composeText}
                            onChange={(e) => setComposeText(e.target.value)}
                            placeholder="اكتب المحتوى الكامل لرسالتك هنا بالتفصيل للعملاء..."
                            rows={6}
                            className="w-full bg-slate-50 border border-gray-250 rounded-lg p-3 text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>

                        {/* 4. Attachments Loader Block */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-black text-slate-850">📎 إرفاق ملفات أو مستندات بالرسالة:</label>
                            <label className="bg-slate-100 hover:bg-slate-200 transition-all border border-gray-300 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer inline-flex items-center gap-1">
                              <span>📁 تصفح الملفات</span>
                              <input
                                type="file"
                                multiple
                                accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                                onChange={handleComposeAttachmentChange}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Upload list preview */}
                          {composeAttachments.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-slate-50 border rounded-lg">
                              {composeAttachments.map((att, index) => {
                                const filename = att.split('||data:')[0].replace('filename:', '');
                                return (
                                  <div key={index} className="bg-white p-2 text-xs rounded border border-gray-200 flex items-center justify-between font-sans">
                                    <button
                                      type="button"
                                      onClick={() => setComposeAttachments(prev => prev.filter((_, i) => i !== index))}
                                      className="text-red-500 font-extrabold hover:text-red-700 text-sm px-1 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                    <span className="truncate text-slate-705 max-w-full block" title={filename}>{filename}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </form>

                      {/* Footer Actions Box */}
                      <div className="p-4 bg-slate-50 border-t border-gray-200 flex items-center justify-between shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(isRtl ? 'هل تريد إلغاء المسودة الحالية؟' : 'Discard draft?')) {
                              setIsComposeOpen(false);
                            }
                          }}
                          className="px-4 py-2 bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          إلغاء وتجاهل المسودة
                        </button>

                        <button
                          type="submit"
                          onClick={handleSendCompose}
                          disabled={isSendingCompose || composeSelectedUserIds.length === 0 || !composeTitle.trim() || !composeText.trim()}
                          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs rounded-lg cursor-pointer shadow-md disabled:bg-slate-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                          <span>{isSendingCompose ? 'جاري الإرسال الجماعي فورا...' : `🚀 إرسال الرسالة إلى ${composeSelectedUserIds.length} مستخدم`}</span>
                        </button>
                      </div>
                    </div>
                  ) : (() => {
                    const activeThread = contactThreads.find(t => t.id === selectedThreadId);

                    if (!activeThread) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-slate-50/10">
                          <span className="text-4xl mb-3">💬</span>
                          <span className="text-sm font-bold">يرجى تحديد رسالة من القائمة لعرض كامل تفاصيل المحادثة</span>
                          <p className="text-[10px] max-w-xs text-gray-400 mt-1">تتيح لك واجهة مركز الرسائل مراجعة بيانات الزائر، وقراءة سجل المحادثة كامل ومتابعة التطورات بسهولة.</p>
                        </div>
                      );
                    }

                    const senderProfile = users.find(u => u.id === activeThread.userId || u.email.trim().toLowerCase() === activeThread.email.trim().toLowerCase());

                    return (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Header action toolbars of selected mail */}
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                          <div className="flex items-center gap-2">
                            {/* Back arrow for mobile screens */}
                            <button
                              type="button"
                              onClick={() => setSelectedThreadId(null)}
                              className="md:hidden px-2.5 py-1 text-slate-800 hover:bg-slate-200 rounded font-bold text-xs cursor-pointer"
                            >
                              ← رجوع
                            </button>

                            <button
                              type="button"
                              onClick={() => handleThreadAction(activeThread.id, 'important_toggle')}
                              className={`px-3 py-1 text-xs border rounded-lg flex items-center gap-1 leading-none cursor-pointer ${activeThread.isImportant ? 'bg-amber-100 border-amber-300 text-amber-700 font-extrabold' : 'bg-white border-gray-200 hover:bg-gray-100'}`}
                            >
                              <span>★</span>
                              <span>{activeThread.isImportant ? 'رسالة مهمة' : 'تمييز كمهم'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleThreadAction(activeThread.id, 'archive_toggle')}
                              className="px-3 py-1 text-xs bg-white border border-gray-200 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                              {activeThread.isArchived ? '📂 استرجاع للعلبة' : '📦 أرشفة'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleThreadAction(activeThread.id, 'trash_toggle')}
                              className="px-3 py-1 text-xs bg-white border border-gray-200 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                            >
                              {activeThread.isTrash ? '♻️ استعادة' : '🗑️ نقل للقمامة'}
                            </button>

                            {activeThread.isTrash && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من حذف هذه المحادثة نهائياً من قاعدة البيانات بلا رجعة؟')) {
                                    handleThreadAction(activeThread.id, 'delete');
                                  }
                                }}
                                className="px-3 py-1 text-xs bg-red-600 border border-red-700 text-white hover:bg-red-700 rounded-lg font-bold cursor-pointer"
                              >
                                💥 حذف نهائي ومستمر
                              </button>
                            )}
                          </div>

                          <div className="text-[10px] text-gray-400 font-bold font-mono">
                            ID: {activeThread.id}
                          </div>
                        </div>

                        {/* Sender info display drawer panel summary */}
                        <div className="px-5 py-4 bg-slate-50/50 border-b border-gray-150 text-xs text-right grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="font-extrabold text-slate-900">{activeThread.name}</span>
                              <span className="bg-slate-200 text-slate-705 text-[10px] px-2 py-0.5 rounded-full font-bold">المرسل الرئيسي</span>
                            </div>
                            <p className="text-gray-400 font-mono select-all">البريد: {activeThread.email}</p>
                            {activeThread.phone && (
                              <p className="text-gray-400 font-mono select-all">الهاتف: {activeThread.phone}</p>
                            )}
                          </div>

                          <div className="space-y-1 md:text-left text-right flex flex-col md:items-end justify-center">
                            {senderProfile ? (
                              <div className="bg-emerald-50 border border-emerald-150 p-2 rounded-lg text-emerald-800 inline-block text-[11px] leading-snug">
                                <span className="font-black">👤 حساب تجاري مسجل:</span>
                                <div className="mt-0.5 text-[10px] text-emerald-700">
                                  الدور: {senderProfile.role === 'seller' ? 'بائع جملة' : senderProfile.role === 'buyer' ? 'تاجر تجزئة' : senderProfile.role} • رصيد: {senderProfile.walletBalance} MAD
                                </div>
                              </div>
                            ) : (
                              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg text-yellow-800 text-[11px] inline-block">
                                <span className="font-bold">🌐 زائر غير مسجل بالمنصة</span>
                                <p className="text-[9px] text-yellow-700 mt-0.5">تم إرسال الاستفسار ببيانات مستقلة عن الحسابات</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Chronological Chat Message display */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/30">
                          {activeThread.messages.map((message: any, idx: number) => {
                            const isAdmin = message.sender === 'admin';
                            return (
                              <div
                                key={message.id || idx}
                                className={`flex flex-col max-w-[85%] ${isAdmin ? 'mr-auto items-start text-left' : 'ml-auto items-end text-right'}`}
                              >
                                {/* Header */}
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mb-1 px-1">
                                  {isAdmin ? (
                                    <>
                                      <span className="text-amber-600">👑 رد الإدارة ({message.senderName})</span>
                                      <span>⏱️ {new Date(message.createdAt).toLocaleString('ar-MA')}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>⏱️ {new Date(message.createdAt).toLocaleString('ar-MA')}</span>
                                      <span className="text-slate-800">👤 {message.senderName || activeThread.name}</span>
                                    </>
                                  )}
                                </div>

                                {/* Body Panel */}
                                <div className={`p-4 rounded-2xl shadow-sm leading-relaxed text-xs ${
                                  isAdmin 
                                    ? 'bg-slate-900 text-white rounded-tl-none text-right' 
                                    : 'bg-white border border-gray-200 text-slate-800 rounded-tr-none'
                                }`}>
                                  <p className="whitespace-pre-wrap">{message.text}</p>

                                  {/* Render attachments */}
                                  {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-slate-200/20 space-y-2">
                                      <span className="block text-[10px] text-amber-500 font-extrabold flex items-center gap-1">
                                        <span>📎 المستندات والمرفقات المرفقة ({message.attachments.length}):</span>
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                                        {message.attachments.map((att: string, aIdx: number) => {
                                          let filename = `Attachment_file_${aIdx + 1}`;
                                          let base64Url = att;
                                          if (att.startsWith('filename:')) {
                                            const parts = att.split('||data:');
                                            filename = parts[0].replace('filename:', '');
                                            base64Url = parts[1] || parts[0];
                                          }

                                          const lowerName = filename.toLowerCase();
                                          const isImg = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp') || lowerName.endsWith('.gif') || base64Url.startsWith('data:image/');

                                          return (
                                            <div key={aIdx} className="bg-slate-800/10 p-2 rounded-lg border border-slate-700/20 flex flex-col gap-2 items-center text-center">
                                              {isImg ? (
                                                <div className="relative max-h-24 overflow-hidden rounded">
                                                  <img src={base64Url} alt={filename} className="max-h-24 w-auto object-contain" referrerPolicy="no-referrer" />
                                                </div>
                                              ) : (
                                                <span className="text-2xl mt-1">📄</span>
                                              )}

                                              <div className="w-full flex flex-col gap-0.5 overflow-hidden">
                                                <span className="font-sans text-[10px] text-slate-700 truncate px-1 max-w-full" title={filename}>{filename}</span>
                                                <a
                                                  href={base64Url}
                                                  download={filename}
                                                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-[9px] py-1 px-2 rounded-md transition-colors inline-block mt-1 font-sans cursor-pointer text-center"
                                                >
                                                  📥 تحميل واستعراض
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Admin Inline Reply Box Panel */}
                        <div className="p-4 bg-slate-50 border-t border-gray-200 shrink-0">
                          <form onSubmit={(e) => handleSendAdminReply(e, activeThread.id)} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                <span>✍️ إرسال الرد الرسمي لإيميل المرسل:</span>
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                سيصل الورد ويتم توثيقه في علبة محادثات كود الزائر
                              </span>
                            </div>

                            <textarea
                              value={adminReplyText}
                              onChange={(e) => setAdminReplyText(e.target.value)}
                              placeholder={`اكتب رد الإدارة الرسمي الموثق هنا للزائر...`}
                              rows={3}
                              className="w-full bg-white border border-gray-250 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-right"
                              required
                            />

                            {/* Attachments List inside Compose */}
                            {adminReplyAttachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-150 rounded-lg">
                                <span className="text-[9px] text-gray-400 w-full mb-1">المرفقات المدرجة بالرسالة ({adminReplyAttachments.length}):</span>
                                {adminReplyAttachments.map((att, index) => {
                                  const filename = att.split('||data:')[0].replace('filename:', '');
                                  return (
                                    <div key={index} className="bg-slate-100 px-2 py-1 rounded-md text-[10px] font-sans flex items-center gap-1 border border-gray-200">
                                      <span className="max-w-28 truncate">{filename}</span>
                                      <button
                                        type="button"
                                        onClick={() => setAdminReplyAttachments(prev => prev.filter((_, i) => i !== index))}
                                        className="text-red-500 font-bold hover:text-red-700 text-xs px-0.5 cursor-pointer"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Footer Submit tools */}
                            <div className="flex items-center justify-between">
                              {/* Submit button */}
                              <button
                                type="submit"
                                disabled={isSendingReply || !adminReplyText.trim()}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 disabled:bg-slate-350 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
                              >
                                <span>🚀 {isSendingReply ? 'جاري إرسال وتعبئة الرد المباشر...' : 'إرسال الرد الرسمي'}</span>
                              </button>

                              {/* Upload picker */}
                              <div className="relative flex items-center gap-2">
                                <label className="bg-slate-200 hover:bg-slate-300 transition-all border border-gray-300 text-slate-802 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-1.5 select-none">
                                  <span>📎 إرفاق ملف/مستند</span>
                                  <input
                                    type="file"
                                    multiple
                                    accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                                    onChange={handleReplyAttachmentChange}
                                    className="hidden"
                                  />
                                </label>
                                <span className="hidden sm:block text-[9px] text-gray-400">
                                  دعم صور، PDF، ملفات أوفيس وملفات ZIP المغلفة.
                                </span>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Package Prices Management (Admin & Super Admin ONLY) */}
          {activeTab === 'package-prices' && (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
            <div className="space-y-6 animate-fade-in text-right animate-fade-in" id="admin-package-prices-tab" dir="rtl">
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-xs text-right">
                <div className="border-b border-gray-150 pb-3 mb-5 flex items-center justify-between flex-row-reverse text-right">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500 inline" />
                    <span>إدارة أسعار باقات النقاط ومستويات الشحن البنكي</span>
                  </h3>
                  <p className="text-xs text-gray-400 font-bold hidden sm:block">
                    قم بتعديل أو إضافة باقات شحن وتعديل المبالغ المطلوبة بالدولار والدرهم المغربي.
                  </p>
                </div>

                {packageError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold mb-4 text-right">
                    ⚠️ {packageError}
                  </div>
                )}
                {packageSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-xs font-bold mb-4 text-right">
                    ✅ {packageSuccess}
                  </div>
                )}

                <form onSubmit={handleSavePackages} className="space-y-6 text-right">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {packages.map((pkg, idx) => (
                      <div key={pkg.id || idx} className="bg-slate-50 border border-gray-200 rounded-xl p-4 md:p-5 relative space-y-4 hover:shadow-xs transition-shadow text-right">
                        <button
                          type="button"
                          onClick={() => handleDeletePackage(idx)}
                          className="absolute top-3 left-3 p-1.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="حذف هذه الباقة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-1 text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">معرف الباقة البرمجي</span>
                          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200/50 px-1.5 py-0.5 rounded inline-block">{pkg.id}</span>
                        </div>

                        <div className="space-y-1.5 text-right">
                          <label className="block text-xs font-bold text-slate-700">اسم الباقة (بالعربية):</label>
                          <input
                            type="text"
                            required
                            value={pkg.name || ''}
                            onChange={(e) => handleUpdatePackageField(idx, 'name', e.target.value)}
                            placeholder="مثال: الباقة البرونزية"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 text-right">
                          <div className="space-y-1.5 text-right">
                            <label className="block text-xs font-bold text-slate-700 text-right">عدد النقاط (PT):</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={pkg.points || 0}
                              onChange={(e) => handleUpdatePackageField(idx, 'points', Number(e.target.value))}
                              className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none text-center"
                            />
                          </div>

                          <div className="space-y-1.5 text-right">
                            <label className="block text-xs font-bold text-slate-700 text-right">السعر ($ USD):</label>
                            <input
                              type="number"
                              required
                              min="0.01"
                              step="0.01"
                              value={pkg.priceUsd || 0}
                              onChange={(e) => handleUpdatePackageField(idx, 'priceUsd', Number(e.target.value))}
                              className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none text-center"
                            />
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-bold bg-white border border-gray-100 p-2 rounded-md text-center">
                          السعر بالدرهم  التقديري: <span className="text-slate-800 font-mono">{(pkg.priceUsd * 10).toFixed(0)} MAD</span>
                        </p>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddPackage}
                      className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-6 flex flex-col items-center justify-center min-h-[220px] cursor-pointer hover:bg-amber-50/10 transition-all text-slate-400 hover:text-amber-500 group"
                    >
                      <PlusCircle className="w-10 h-10 mb-2.5 text-slate-300 group-hover:text-amber-500 transition-colors animate-pulse" />
                      <span className="text-xs font-extrabold text-slate-500 group-hover:text-amber-600 transition-colors">إضافة باقة نقاط جديدة</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-150 gap-3 flex-row-reverse text-right">
                    <button
                      type="submit"
                      disabled={savingPackages}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2 select-none"
                    >
                      {savingPackages ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري الحفظ والتعميم...</span>
                        </>
                      ) : (
                        <span>💾 حفظ التغييرات وتعميم الأسعار</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteTargetCoupon && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in text-right">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-gray-100 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-800 border-b border-gray-200 pb-2">
              هل أنت متأكد من حذف هذا الكوبون؟
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              سيتم حذف الكوبون <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-bold">{deleteTargetCoupon.code}</span> (بقيمة {deleteTargetCoupon.value} {deleteTargetCoupon.type === 'points' ? 'points' : 'MAD'}) بشكل نهائي من قاعدة البيانات. لن يتمكن أي مستخدم أو زائر من استخدامه مجدداً.
            </p>
            <div className="flex gap-2.5 justify-start flex-row-reverse pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetCoupon(null)}
                className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteCoupon(deleteTargetCoupon.id)}
                className="px-4 py-2 bg-red-600 border border-red-700 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 inline text-white" />
                <span>نعم، حذف الكوبون</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Code Confirmation Modal */}
      {deleteTargetRechargeCode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in text-right">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-gray-100 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-800 border-b border-gray-200 pb-2">
              هل أنت متأكد من حذف كود الشحن؟
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              سيتم حذف كود الشحن <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-bold">{deleteTargetRechargeCode.code}</span> (بقيمة {deleteTargetRechargeCode.points} نقطة) بشكل نهائي من قاعدة البيانات. لن يتمكن أي مستخدم أو زائر من استخدامه مجدداً.
            </p>
            <div className="flex gap-2.5 justify-start flex-row-reverse pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetRechargeCode(null)}
                className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteRechargeCode(deleteTargetRechargeCode.id)}
                className="px-4 py-2 bg-red-600 border border-red-700 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 inline text-white" />
                <span>نعم، حذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GM Role Change Multi-Factor Security Verification Modal */}
      {roleChangePending && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in text-right">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-gray-100 shadow-2xl space-y-4.5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-red-600 flex items-center justify-end gap-1.5 font-sans">
                ⚠️ تأكيد حماية الصلاحيات العليا (المدير العام)
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              لتعديل رتبة أو صلاحيات الأعضاء بالمنصة، يتطلب نظامنا الأمني تأكيد هوية مزدوج (Re-authentication & OTP verification).
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">كلمة المرور الإدارية الحالية لتأكيد الهوية *</label>
                <input
                  type="password"
                  value={roleChangePassword}
                  onChange={(e) => setRoleChangePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-right placeholder-gray-300"
                  required
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-gray-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-slate-500 block">
                    الهاتف الآمن: <span className="font-mono text-slate-800 text-xs tracking-wider">06******46</span>
                  </span>
                  <button
                    type="button"
                    onClick={sendRoleChangeOtp}
                    disabled={roleChangeOtpSending}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-black text-[9px] rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {roleChangeOtpSending ? 'جاري الإرسال...' : (roleChangeOtpSent ? 'إعادة إرسال الرمز' : 'أرسل الرمز (OTP)')}
                  </button>
                </div>

                {roleChangeOtpSimulated && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] p-2.5 rounded-lg font-bold text-center">
                    تم توليد الرمز للمحاكاة: <span className="font-mono font-black text-xs text-emerald-600 tracking-widest">{roleChangeOtpSimulated}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-800 block">رمز التحقق الثنائي (OTP) المستلم *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={roleChangeOtp}
                    onChange={(e) => setRoleChangeOtp(e.target.value)}
                    placeholder="أدخل الرمز المكون من 6 أرقام"
                    className="w-full text-center font-mono font-black text-xs tracking-widest p-2.5 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none placeholder-gray-300 bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 justify-start flex-row-reverse pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRoleChangePending(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                إلغاء الإجراء
              </button>
              <button
                type="button"
                onClick={() => handleChangeUserRole(roleChangePending.userId, roleChangePending.newRole, true)}
                disabled={!roleChangePassword || !roleChangeOtp}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
              >
                تأكيد وتغيير الصلاحيات
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
