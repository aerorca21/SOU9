/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Coins, Gift, CreditCard, Share2, Copy, Check, 
  ArrowUpRight, ArrowDownRight, Tag, Printer, Receipt, ShieldCheck,
  PlusCircle, Building, Smartphone, Wallet
} from 'lucide-react';
import { translations } from '../lib/i18n';
import { User, WalletTransaction } from '../types';

interface WalletPanelProps {
  currentUser: User | null;
  currentLang: 'ar' | 'fr' | 'en';
  onClose: () => void;
  onRefreshUser: (updatedUser: User) => void;
  openProductCreateModal?: () => void;
}

export default function WalletPanel({
  currentUser,
  currentLang,
  onClose,
  onRefreshUser,
  openProductCreateModal
}: WalletPanelProps) {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [rechargeCode, setRechargeCode] = useState('');
  
  // States of interactions
  const [copied, setCopied] = useState(false);
  const [rechargeError, setRechargeError] = useState('');
  const [rechargeSuccess, setRechargeSuccess] = useState('');

  // Payment states
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'local'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [paying, setPaying] = useState(false);
  const [paidInvoice, setPaidInvoice] = useState<any>(null);
  const [paymentConfig, setPaymentConfig] = useState<any>({
    paypalEnabled: true,
    cardEnabled: true,
    cashEnabled: true,
    cashAgencyName: 'وكالات كاش بلوس ووفاكاش المغرب',
    cashContact: '+212522778899',
    cashInstructions: 'تفضل بزيارة أقرب وكالة كاش بلوس أو وفاكاش، وقم بتقديم رقم المرجعي المباشر للحجز الخاص بك.'
  });

  const [rechargePackages, setRechargePackages] = useState<any[]>([
    { id: 'p_starter', name: 'الباقة البرونزية', points: 60, priceUsd: 5 },
    { id: 'p_basic', name: 'الباقة الفضية', points: 230, priceUsd: 10 },
    { id: 'p_pro', name: 'الباقة الذهبية (الموصى بها)', points: 470, priceUsd: 20 },
    { id: 'p_premium', name: 'الباقة البلاتينية', points: 1200, priceUsd: 50 }
  ]);

  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser]);

  useEffect(() => {
    fetch('/api/payment-settings')
      .then(res => res.json())
      .then(data => {
        setPaymentConfig(data);
        // Default select to the first enabled payment channel
        if (!data.cardEnabled) {
          if (data.paypalEnabled) setPaymentMethod('paypal');
          else if (data.cashEnabled) setPaymentMethod('local');
        }
      })
      .catch(err => console.error('Error fetching public payment configuration:', err));

    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRechargePackages(data);
        }
      })
      .catch(err => console.error('Error fetching packages config:', err));
  }, []);

  const fetchTransactions = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/wallet/transactions/${currentUser.id}`);
      if (res.ok) {
        const list = await res.json();
        setTransactions(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyReferral = () => {
    if (!currentUser) return;
    const copyText = `مرحباً بك في سوق الجملة المغربي Sou9AlJoumla!\nكود الإحالة الخاص بي: ${currentUser.referralCode}\nرابط التسجيل: https://sou9aljoumla.com/register?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeCode.trim() || !currentUser) return;

    try {
      setRechargeError('');
      setRechargeSuccess('');
      setLoading(true);

      const res = await fetch('/api/wallet/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: rechargeCode.toUpperCase(),
          userId: currentUser.id
        })
      });

      const body = await res.json();
      if (res.ok) {
        setRechargeSuccess(isRtl ? `مبروك! تم تفعيل البطاقة بنجاح وإضافة +${body.pointsAdded} نقطة لرصيدك.` : `Voucher activated! +${body.pointsAdded} points added to your wallet.`);
        setRechargeCode('');
        
        const updatedUser = { ...currentUser, points: body.newPoints };
        onRefreshUser(updatedUser);
        fetchTransactions();
      } else {
        setRechargeError(body.error || 'فشل شحن كود الدفع.');
      }
    } catch (e) {
      console.error(e);
      setRechargeError(isRtl ? 'حدث خطأ بالاتصال بالخادم.' : 'Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  // PayPal SDK Loader and Smart Buttons Renderer
  useEffect(() => {
    if (paymentMethod === 'paypal' && selectedPack && currentUser) {
      let isMounted = true;
      let paypalButtonsInstance: any = null;

      const loadPayPalSDKAndRender = async () => {
        try {
          const configRes = await fetch('/api/paypal/config');
          let clientId = 'sb';
          if (configRes.ok) {
            const configData = await configRes.json();
            clientId = configData.clientId || 'sb';
          }

          const scriptId = 'paypal-sdk-script';
          let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;

          if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = scriptId;
            scriptElement.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
            scriptElement.async = true;
            document.body.appendChild(scriptElement);
          } else {
            if (scriptElement.src && !scriptElement.src.includes(`client-id=${clientId}`)) {
              document.body.removeChild(scriptElement);
              scriptElement = document.createElement('script');
              scriptElement.id = scriptId;
              scriptElement.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
              scriptElement.async = true;
              document.body.appendChild(scriptElement);
            }
          }

          const renderButtons = () => {
            if (!isMounted) return;
            const containerId = `paypal-button-container-${selectedPack.id}`;
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            if ((window as any).paypal) {
              try {
                paypalButtonsInstance = (window as any).paypal.Buttons({
                  style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'checkout',
                    tagline: false
                  },
                  createOrder: (data: any, actions: any) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: selectedPack.priceUsd.toString(),
                          currency_code: 'USD'
                        },
                        description: `Sou9AlJoumla Points Pack: ${selectedPack.name} (+${selectedPack.points} PT)`,
                        custom_id: currentUser.id
                      }]
                    });
                  },
                  onApprove: (data: any, actions: any) => {
                    return actions.order.capture().then(async (details: any) => {
                      try {
                        setPaying(true);
                        const res = await fetch('/api/wallet/verify-paypal', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: currentUser.id,
                            orderId: details.id,
                            packageId: selectedPack.id,
                            points: selectedPack.points,
                            amount: selectedPack.priceUsd * 10
                          })
                        });

                        if (res.ok) {
                          const verifyData = await res.json();
                          setPaidInvoice({
                            invoiceId: verifyData.invoiceId,
                            packName: selectedPack.name,
                            points: selectedPack.points,
                            priceUsd: selectedPack.priceUsd,
                            method: 'حساب بايبال (PayPal) الفوري المعتمد',
                            date: new Date().toLocaleDateString()
                          });

                          const updated = { ...currentUser, points: verifyData.newPoints };
                          onRefreshUser(updated);
                          fetchTransactions();
                          setSelectedPack(null);
                        } else {
                          const errData = await res.json();
                          alert(isRtl ? 'فشل التحقق من دفعة بايبال: ' + (errData.error || 'يرجى المحاولة لاحقاً.') : 'PayPal Verification failed.');
                        }
                      } catch (err) {
                        console.error('PayPal post-approval verifier connection error:', err);
                        alert(isRtl ? 'حدث خطأ بالاتصال بخوادم تأكيد الدفع الفورية.' : 'Connection error during verification.');
                      } finally {
                        setPaying(false);
                      }
                    });
                  },
                  onError: (err: any) => {
                    console.error('PayPal Web SDK runtime error:', err);
                    alert(isRtl ? 'حدث خطأ أثناء إجراء الدفع عبر بايبال. يرجى تكرار المحاولة.' : 'Error during PayPal checkout process.');
                  }
                });

                if (paypalButtonsInstance) {
                  paypalButtonsInstance.render(`#${containerId}`);
                }
              } catch (btnErr) {
                console.error('Error instantiating PayPal buttons:', btnErr);
              }
            }
          };

          if ((window as any).paypal) {
            renderButtons();
          } else {
            scriptElement.addEventListener('load', renderButtons);
          }

        } catch (err) {
          console.error('Error starting PayPal SDK load:', err);
        }
      };

      const timeoutId = setTimeout(loadPayPalSDKAndRender, 300);

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        if (paypalButtonsInstance && paypalButtonsInstance.close) {
          try { paypalButtonsInstance.close(); } catch (e) {}
        }
      };
    }
  }, [paymentMethod, selectedPack]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPack) {
      alert(isRtl ? 'الرجاء اختيار باقة الرصيد المناسبة للمواصلة' : 'Veuillez choisir un pack');
      return;
    }

    try {
      setPaying(true);
      setPaidInvoice(null);
      
      // Simulated processing overhead
      await new Promise(r => setTimeout(r, 1200));

      const res = await fetch('/api/wallet/recharge-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          packageId: selectedPack.id,
          amount: selectedPack.priceUsd * 10, // Approximate MAD Conversion
          points: selectedPack.points,
          paymentMethod,
          cardNumber,
          localCode
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        let displayMethod = 'بطاقة بنكية آمنة (قيد المراجعة)';
        if (paymentMethod === 'local') {
          displayMethod = `وكالة الدفع المحلي (قيد المراجعة - إيصال ${localCode || ''})`;
        }

        if (data.status === 'pending') {
          alert('تم تسجيل طلب شحن الرصيد يدوياً بنجاح! يرجى الانتظار لحين مراجعة وتأكيد الدفع من قبل الإدارة لإضافة النقاط إلى رصيدك الرسمى.');
          
          setPaidInvoice({
            invoiceId: data.invoiceId,
            packName: selectedPack.name,
            points: selectedPack.points,
            priceUsd: selectedPack.priceUsd,
            method: `${displayMethod} - معلق بانتظار التدقيق الإداري`,
            date: new Date().toLocaleDateString()
          });
        } else {
          setPaidInvoice({
            invoiceId: data.invoiceId,
            packName: selectedPack.name,
            points: selectedPack.points,
            priceUsd: selectedPack.priceUsd,
            method: displayMethod,
            date: new Date().toLocaleDateString()
          });
          const updated = { ...currentUser, points: data.newPoints };
          onRefreshUser(updated);
        }

        fetchTransactions();

        // Safe reset
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setPaypalEmail('');
        setLocalCode('');
        setSelectedPack(null);
      } else {
        alert('حدث خطأ أثناء معالجة عملية الشحن. يرجى المحاولة لاحقاً.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  // Live "رصيدي" stats calculations
  const pointsUsed = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, tx) => sum + (tx.points || 0), 0);

  const pointsEarned = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, tx) => sum + (tx.points || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="wallet-panel-root">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8 pointer-events-auto">
        
        {/* Header bar */}
        <div className="bg-slate-50 border-b border-gray-100 p-4 shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm md:text-base font-black text-slate-900">سجل الرصيد وتدبير الحساب والشحن المالي</h2>
          </div>
          <button 
            id="wallet-panel-close"
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 text-slate-800 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Core content */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh] space-y-8 flex-1 custom-scrollbar">
          
          {/* Bento Grid: Balance, Account Actions & Referrals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* 1. Account & Publish Action Panel */}
            <div className="bg-amber-500 text-white p-6 rounded-2xl border border-amber-600 flex flex-col justify-between text-right relative overflow-hidden shadow-md">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-2">
                <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold inline-block uppercase select-none">
                  حساب نشط - {currentUser?.role === 'superadmin' ? 'مدير عام (Super Admin)' : currentUser?.role === 'admin' ? 'مدير' : currentUser?.role === 'moderator' ? 'مشرف' : 'عضو مسجل'}
                </span>
                <h3 className="text-base font-black truncate">{currentUser?.name}</h3>
                <p className="text-[11px] text-amber-50/90 leading-relaxed">
                  يمكنك من هنا نشر عروض البيع والمنتجات جملةً بأسواق المغرب وتحديث ميزات إعلانك.
                </p>
              </div>

              {openProductCreateModal && currentUser?.status !== 'suspended' && (
                <button
                  id="wallet-panel-publish"
                  onClick={() => {
                    onClose();
                    openProductCreateModal();
                  }}
                  className="mt-5 w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-97"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>إضافة منتج أو نشر عرض جديد</span>
                </button>
              )}
            </div>

            {/* 2. Balance Badge Layout */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col justify-between text-right relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-1">
                <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">محفظة نقاط البيع</span>
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-3xl md:text-4xl font-mono font-black text-amber-500 tracking-tight">
                    {currentUser?.points || 0}
                  </span>
                  <span className="text-xs font-bold text-gray-300">نقطة</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  قنوات النشر مفعلة
                </span>
                <span className="text-gray-400 font-mono">{currentUser?.email}</span>
              </div>
            </div>

            {/* 3. Referrals Codes Area */}
            <div className="bg-slate-50 border border-gray-200/60 rounded-2xl p-6 text-right flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 justify-end text-slate-800">
                  <h3 className="text-xs font-bold uppercase select-none">{t.referralShareTitle}</h3>
                  <Gift className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {t.referralShareBody}
                </p>
              </div>

              <div className="mt-4 bg-white border border-gray-150 p-2 rounded-xl flex items-center justify-between gap-3">
                <button
                  id="referral-copy-btn"
                  onClick={handleCopyReferral}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ' : t.copyBtn}</span>
                </button>
                <span className="text-sm font-black font-mono text-slate-800 px-3 tracking-wider select-all">
                  {currentUser?.referralCode}
                </span>
              </div>
            </div>

          </div>

          {/* Section: رصيدي (Detailed Points Statistics Cabinet) */}
          <div className="bg-slate-50 border border-gray-200/65 rounded-2xl p-6 space-y-4 text-right" id="my-balance-dashboard">
            <div className="flex items-center gap-2 justify-end">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">رصيدي ونشاطات المحفظة</h3>
              <Coins className="w-4.5 h-4.5 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-xs">
                <span className="text-[10px] text-gray-405 font-bold uppercase block">الرصيد الفعلي الحالي</span>
                <span className="text-2xl font-mono font-black text-amber-500 mt-1 block">
                  {currentUser?.points || 0} <span className="text-xs font-normal text-slate-600">نقطة</span>
                </span>
              </div>
              <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                <span className="text-[10px] text-red-500/80 font-bold uppercase block">النقاط المستخدمة (المصروفة)</span>
                <span className="text-2xl font-mono font-black text-red-600 mt-1 block">
                  {pointsUsed} <span className="text-xs font-normal text-slate-600">نقطة</span>
                </span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                <span className="text-[10px] text-emerald-500/80 font-bold uppercase block">النقاط المكتسبة (المسترجعة والمشحونة)</span>
                <span className="text-2xl font-mono font-black text-emerald-600 mt-1 block">
                  {pointsEarned} <span className="text-xs font-normal text-slate-600">نقطة</span>
                </span>
              </div>
            </div>
          </div>

          {/* Recharge Prepaid Codes Voucher Form */}
          <div className="border border-gray-105 bg-slate-50 rounded-2xl p-5 md:p-6 text-right space-y-4">
            <div className="flex items-center gap-1.5 justify-end text-slate-800">
              <h3 className="text-xs font-extrabold uppercase tracking-widest">{t.rechargeCodesTitle}</h3>
              <Tag className="w-4.5 h-4.5 text-amber-500" />
            </div>

            <form onSubmit={handleRedeemCode} className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              >
                {loading ? 'جاري التحقق...' : t.rechargeBtn}
              </button>
              <input
                type="text"
                value={rechargeCode}
                onChange={(e) => setRechargeCode(e.target.value)}
                placeholder={t.rechargeCodePlaceholder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </form>

            {rechargeError && <p className="text-xs text-red-600 font-bold">{rechargeError}</p>}
            {rechargeSuccess && <p className="text-xs text-emerald-600 font-bold">{rechargeSuccess}</p>}
          </div>

          {/* Interactive Secure Recharge Packages & Forms */}
          <div className="space-y-6 text-right" id="recharge-section">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              شحن الرصيد المباشر والبطاقة والتحويل
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {rechargePackages.map((pack) => (
                <div 
                  key={pack.id}
                  onClick={() => setSelectedPack(pack)}
                  className={`border rounded-xl p-5 text-center flex flex-col justify-between h-44 cursor-pointer transition-all ${
                    selectedPack?.id === pack.id 
                      ? 'border-amber-500 scale-102 ring-2 ring-amber-100 shadow-md bg-amber-50/20' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-xs bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">{pack.name}</span>
                    <div className="text-xl font-black text-amber-600 font-mono">+{pack.points} PT</div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-center gap-1">
                    <span className="text-sm font-black text-slate-800 font-mono">${pack.priceUsd} USD</span>
                    <span className="text-[10px] text-gray-400 font-bold">({pack.priceUsd * 10} MAD)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Payment Gateway Form with multi-channels tabs */}
            {selectedPack && (
              <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-5 md:p-6 text-right space-y-5 max-w-lg ml-auto">
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-black text-amber-600">القيمة: {selectedPack.priceUsd * 10} درهم ({selectedPack.priceUsd} USD)</span>
                  <h4 className="text-xs font-extrabold text-slate-850 uppercase select-none flex items-center gap-1">
                    <span>اختر وسيلة شحن الرصيد الفوري</span>
                    <CreditCard className="w-4 h-4 text-amber-500" />
                  </h4>
                </div>

                {/* Sub-tabs for المغرب local payment types */}
                <div className="flex border-b border-gray-200/50 gap-2 overflow-x-auto pb-1">
                  {paymentConfig.cashEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('local')}
                      className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 rounded-t-md whitespace-nowrap cursor-pointer ${
                        paymentMethod === 'local' ? 'border-amber-500 text-amber-600 bg-amber-100/10' : 'border-transparent text-gray-400 hover:text-slate-600'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 inline mr-1" />
                      {paymentConfig.cashAgencyName || 'دفع كاش بالوكالة'}
                    </button>
                  )}
                  {paymentConfig.paypalEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 rounded-t-md whitespace-nowrap cursor-pointer ${
                        paymentMethod === 'paypal' ? 'border-amber-500 text-amber-600 bg-amber-100/10' : 'border-transparent text-gray-400 hover:text-slate-600'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5 inline mr-1" />
                      بايبال (PayPal)
                    </button>
                  )}
                  {paymentConfig.cardEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 rounded-t-md whitespace-nowrap cursor-pointer ${
                        paymentMethod === 'card' ? 'border-amber-500 text-amber-600 bg-amber-100/10' : 'border-transparent text-gray-400 hover:text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                      البطاقة البنكية
                    </button>
                  )}
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4 text-right">
                  
                  {/* Card Section */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 animation-fade-in">
                      <p className="text-[11px] text-gray-400">عبر بوابة الدفع الآمنة، تشحن رصيدك نقداً في الحين:</p>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4000 1234 5678 9010 (Visa / Mastercard)"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-250 font-mono"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-250 font-mono text-center"
                        />
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          maxLength={4}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-250 font-mono text-center"
                        />
                      </div>
                    </div>
                  )}

                  {/* PayPal Section */}
                  {paymentMethod === 'paypal' && (
                    <div className="space-y-3.5 animation-fade-in">
                      <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-4 text-xs space-y-2 leading-relaxed text-right">
                        <p className="font-extrabold text-amber-800">حساب بايبال (PayPal) الرسمي للمنصة:</p>
                        <ul className="space-y-1 font-mono text-[10.5px] text-slate-700">
                          <li>• البريد الإلكتروني: <span className="font-bold text-slate-900">paypal@sou9aljoumla.com</span></li>
                          <li>• اسم المستفيد: <span className="font-bold text-slate-900">Sou9AlJoumla S.A.R.L</span></li>
                          <li>• القيمة المطلوبة للتحويل: <span className="font-bold text-amber-700">${selectedPack?.priceUsd} USD</span></li>
                        </ul>
                        <p className="text-[10px] text-gray-500 font-bold">
                          * يرجى إرسال المبلغ عبر بايبال، ثم كتابة بريدك الإلكتروني المستخدم في الإرسال أو رقم المعاملة بالأسفل للتأكيد الفوري وتفعيل النقاط تلقائياً فوراً لدعم حسابك.
                        </p>
                      </div>

                      <div className="space-y-1.5 text-right">
                        <label className="block text-[11px] font-bold text-slate-700">بريدك الإلكتروني في بايبال أو رقم المعاملة:</label>
                        <input
                          type="text"
                          required
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          placeholder="مثال: user@example.com أو رقم المعاملة"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs focus:outline-none text-right"
                        />
                      </div>
                    </div>
                  )}

                  {/* Local Section */}
                  {paymentMethod === 'local' && (
                    <div className="space-y-3.5 animation-fade-in text-right">
                      <div className="bg-slate-100 rounded-xl p-4 text-xs space-y-2 leading-relaxed">
                        <p className="font-extrabold text-slate-800">
                          الشحن عبر: {paymentConfig.cashAgencyName || 'وكالات كاش بلوس ووفاكاش المغرب'}
                        </p>
                        <p className="text-gray-700 font-bold">
                          بيانات وتواصل الوكالة: {paymentConfig.cashContact || '+212522778899'}
                        </p>
                        <p className="text-gray-500 font-medium">
                          {paymentConfig.cashInstructions || 'تفضل بزيارة أقرب وكالة، وقم بتقديم رقم المرجعي المباشر للحجز الخاص بك:'}
                        </p>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-center font-mono font-black text-emerald-600 tracking-wider select-all select-none">
                          SOU9-CASH-{currentUser?.id || '99'}-{selectedPack.points}PT
                        </div>
                        <p className="text-[10px] text-gray-500">
                          * بعد تسديد كاش {selectedPack.priceUsd * 105 / 10} MAD بالوكالة، قم بكتابة كود التوصيل المستلم في المربع بالأسفل للشحن التلقائي السلس!
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-700">كود الإيصال المرجعي للوكالة (Transaction Code):</label>
                        <input
                          type="text"
                          required
                          value={localCode}
                          onChange={(e) => setLocalCode(e.target.value)}
                          placeholder="مثال: CP-8921-X9"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200 font-mono text-center ring-inset"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {paying ? 'جاري التحقق والمصادقة الآمنة...' : 'متابعة وتأكيد الدفع وشحن النقاط فوراً'}
                  </button>

                </form>

              </div>
            )}

            {/* Invoice receipts pop up */}
            {paidInvoice && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-right space-y-4 max-w-md ml-auto" id="simulated-payment-receipt">
                <div className="flex items-center gap-1.5 justify-end text-emerald-800">
                  <h4 className="text-xs font-extrabold">تم تفعيل الدورة والشحن بنجاح</h4>
                  <Receipt className="w-5 h-5" />
                </div>

                <div className="bg-white rounded-lg p-4 border border-emerald-100 text-xs text-slate-800 space-y-2.5 font-mono">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-extrabold text-slate-900">{paidInvoice.invoiceId}</span>
                    <span className="text-gray-400">رقم الفاتورة:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{paidInvoice.packName}</span>
                    <span className="text-gray-400">باقة الإعلان:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-extrabold text-emerald-600">+{paidInvoice.points} PT</span>
                    <span className="text-gray-400">النقاط المشحونة:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{paidInvoice.priceUsd * 10} MAD (${paidInvoice.priceUsd} USD)</span>
                    <span className="text-gray-400">المبلغ المدفوع:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{paidInvoice.method}</span>
                    <span className="text-gray-400">قناة الدفع:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{paidInvoice.date}</span>
                    <span className="text-gray-400">تاريخ المعاملة:</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>فاتورة ضريبية رسمية - سوق الجملة المغربي</title>
                            <style>
                              body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; padding: 40px; color: #1e293b; line-height: 1.6; }
                              .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
                              h1 { color: #10b981; font-size: 24px; margin: 0 0 5px 0; }
                              .header { display: flex; justify-content: space-between; border-b: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
                              .details { margin-bottom: 30px; }
                              .details p { margin: 6px 0; font-size: 14px; }
                              .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                              .table th { background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; text-align: right; }
                              .table td { padding: 12px; border: 1px solid #e2e8f0; }
                              .total { text-align: left; font-size: 18px; font-weight: bold; color: #10b981; margin-top: 20px; }
                              .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 40px; }
                              .print-btn { padding: 10px 24px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; margin: 20px 0; }
                              @media print {
                                .print-btn { display: none !important; }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="invoice-box">
                              <div class="header">
                                <div>
                                  <h1>سوق الجملة المغربي</h1>
                                  <p style="margin: 0; color: #64748b; font-size: 13px;">شركة Sou9AlJoumla S.A.R.L - الدار البيضاء</p>
                                </div>
                                <div style="text-align: left; direction: ltr;">
                                  <h2 style="color: #64748b; margin: 0 0 5px 0; font-size: 18px;">Tax Invoice / فاتورة ضريبية</h2>
                                  <p style="margin: 0; font-size: 13px;">الرقم المرجعي: <strong>${paidInvoice.invoiceId}</strong></p>
                                  <p style="margin: 0; font-size: 13px;">التاريخ: ${paidInvoice.date}</p>
                                </div>
                              </div>
                              <div class="details">
                                <p><strong>الجهة المستفيدة:</strong> ${currentUser ? currentUser.name : 'عميل سوق الجملة'}</p>
                                <p><strong>البريد الإلكتروني للعميل:</strong> ${currentUser ? currentUser.email : ''}</p>
                                <p><strong>حالة المعاملة المالية:</strong> مكتملة ومعتمدة آلياً (Completed)</p>
                              </div>
                              <table class="table">
                                <thead>
                                  <tr>
                                    <th>الشاحن والوصف</th>
                                    <th>النقاط المكتسبة</th>
                                    <th>قناة الدفع المستخدمة</th>
                                    <th>المبلغ الإجمالي بالدرهم</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>شحن رصيد إعلانات ترويجي بالمنصة - ${paidInvoice.packName}</td>
                                    <td>+${paidInvoice.points} PT</td>
                                    <td>${paidInvoice.method}</td>
                                    <td>${paidInvoice.priceUsd * 10} MAD (${paidInvoice.priceUsd} USD)</td>
                                  </tr>
                                </tbody>
                              </table>
                              <div class="total" style="text-align: left;">
                                المبلغ الإجمالي المدفوع: ${paidInvoice.priceUsd * 10} MAD
                              </div>
                              <div style="text-align: center;">
                                <button class="print-btn" onclick="window.print()">🖨️ طباعة الفاتورة والاحتفاظ بنسخة PDF</button>
                              </div>
                              <div class="footer">
                                شكراً لتعاملكم مع سوق الجملة المغربي. تم توليد هذه الفاتورة الحسابية آلياً ويسري مفعولها كإثبات دفع ضريبي رسمي.
                              </div>
                            </div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                  className="w-full py-1.5 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>تحميل الفاتورة الضريبية الرسمية (PDF)</span>
                </button>
              </div>
            )}

          </div>

          {/* Historical points operations list */}
          <div className="space-y-4 text-right">
            <div className="border-b border-gray-150 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center justify-end gap-2">
                <span>سجل العمليات والعمليات المالية</span>
                <Receipt className="w-4.5 h-4.5 text-amber-500" />
              </h3>
            </div>

            {transactions.length === 0 ? (
              <p className="text-xs text-gray-400 pt-2">سجل معاملات محفظتك خالٍ حالياً.</p>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto shadow-xs custom-scrollbar">
                <table className="w-full text-xs text-right divide-y divide-gray-100 min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-500 select-none font-bold">
                    <tr>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">عدد النقاط</th>
                      <th className="p-3">نوع العملية والتفاصيل</th>
                      <th className="p-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-slate-700">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            tx.status === 'completed' || tx.status === 'success' || !tx.status ? 'bg-emerald-100 text-emerald-800' : 
                            tx.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.status || 'مكتملة'}
                          </span>
                        </td>
                        <td className="p-3 font-bold font-mono">
                          <span className={tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}>
                            {tx.type === 'credit' ? '+' : '-'}{tx.points} PT
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {tx.description}
                        </td>
                        <td className="p-3 text-gray-400 font-mono text-[10px]">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
