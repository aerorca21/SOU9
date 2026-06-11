/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  X, Phone, MessageCircle, Coins, Truck, Star, 
  User, Calendar, Heart, ShieldCheck, CornerDownLeft, MessageSquare, Eye,
  Trash, EyeOff, Paperclip, Upload, Play, CheckCircle, HelpCircle
} from 'lucide-react';
import { translations } from '../lib/i18n';
import { Product, Review, Comment, User as UserType } from '../types';

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

interface ProductDetailsProps {
  productId: string;
  currentLang: 'ar' | 'fr' | 'en';
  currentUser: UserType | null;
  onClose: () => void;
  onStartChat: (sellerId: string) => void;
  openLoginModal: (msg?: string) => void;
  onOpenSellerProfile?: (userId: string) => void;
}

export default function ProductDetails({
  productId,
  currentLang,
  currentUser,
  onClose,
  onStartChat,
  openLoginModal,
  onOpenSellerProfile
}: ProductDetailsProps) {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Local interaction states
  const [activeImage, setActiveImage] = useState('');
  const [orderQty, setOrderQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Record real clicks/leads and increment view & sales count
  const recordContactAction = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/record-contact`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (seller) {
            setSeller((prev: any) => prev ? { ...prev, sales_count: data.sales_count } : prev);
          }
          if (product) {
            setProduct((prev: any) => prev ? { ...prev, views: data.views } : prev);
          }
        }
      }
    } catch (e) {
      console.error('Error recording contact lead:', e);
    }
  };

  // New review state coordinates
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<{ file_url: string; file_type: 'image' | 'video' }[]>([]);
  const [optionalQuestion, setOptionalQuestion] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // QA and replies coordinates
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [sellerReplyText, setSellerReplyText] = useState('');
  const [activeAnswerQuestionId, setActiveAnswerQuestionId] = useState<string | null>(null);
  const [sellerAnswerText, setSellerAnswerText] = useState('');
  const [directQuestionText, setDirectQuestionText] = useState('');
  const [directQuestionError, setDirectQuestionError] = useState('');

  // New comment form
  const [newCommentText, setNewCommentText] = useState('');

  // Checkout process state coordinates
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutQty, setCheckoutQty] = useState(1);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [latestOrderId, setLatestOrderId] = useState('');
  const [submittingCheckoutOrder, setSubmittingCheckoutOrder] = useState(false);

  useEffect(() => {
    setCheckoutQty(orderQty);
  }, [orderQty]);

  const handleShowCheckoutModal = () => {
    if (!currentUser) {
      openLoginModal(currentLang === 'ar' ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من تقديم طلبات الشراء وحز المنتجات.' : 'Sorry, you must log in first to submit orders.');
      return;
    }
    setCheckoutName(currentUser.name || '');
    setCheckoutPhone(currentUser.phone || '');
    setCheckoutSuccess(false);
    setCheckoutError('');
    setShowCheckoutModal(true);
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setSubmittingCheckoutOrder(true);

    if (!product) return;
    if (Number(checkoutQty) < product.moq) {
      setCheckoutError(`الكمية المدخلة غير صحيحة، الحد الأدنى للطلب هو ${product.moq} قطع.`);
      setSubmittingCheckoutOrder(false);
      return;
    }

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          buyerId: currentUser.id,
          buyerName: checkoutName,
          buyerPhone: checkoutPhone,
          shippingAddress: checkoutAddress,
          quantity: Number(checkoutQty)
        })
      });

      const body = await res.json();
      if (res.ok) {
        setCheckoutSuccess(true);
        setLatestOrderId(body.order.id);
        recordContactAction(); // Increment seller lead metrics on actual order placement
      } else {
        setCheckoutError(body.error || 'فشل تقديم طلب الشراء، يرجى التحقق من المدخلات.');
      }
    } catch (err) {
      setCheckoutError('عطل في الشبكة والاتصال، يرجى المحاولة لاحقاً.');
    } finally {
      setSubmittingCheckoutOrder(false);
    }
  };

  // Fetch updated product states
  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    if (product) {
      const originalTitle = document.title;
      const productTitle = currentLang === 'ar' ? product.title : (product.titleFr || product.title);
      document.title = `${productTitle} | Sou9AlJoumla`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [product, currentLang]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
        setSeller(data.seller);
        setReviews(data.reviews || []);
        setComments(data.comments || []);
        setQuestions(data.questions || []);
        if (data.product?.images?.length > 0) {
          setActiveImage(data.product.images[0]);
        }
        if (data.product) {
          setOrderQty(data.product.moq);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Client-side and server-side combined media upload system
  const handleMediaUpload = async (files: FileList) => {
    setUploadError('');
    setIsUploading(true);
    
    const currentImgsCount = uploadedMedia.filter(m => m.file_type === 'image').length;
    const currentVidsCount = uploadedMedia.filter(m => m.file_type === 'video').length;

    let totalNewImgs = 0;
    let totalNewVids = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isVid = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'].includes(file.type) || file.name.endsWith('.mov');

      if (!isImg && !isVid) {
        setUploadError(currentLang === 'ar' ? 'نوع الملف غير مدعوم. يدعم صور وفيديوهات فقط' : 'Type de fichier non supporté. Supporte les images et vidéos uniquement');
        continue;
      }

      if (isImg) {
        if (currentImgsCount + totalNewImgs >= 10) {
          setUploadError(currentLang === 'ar' ? 'الحد الأقصى هو 10 صور' : 'Limite de 10 images atteinte');
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(currentLang === 'ar' ? 'حجم الصورة يتعدى الكود الأقصى 10 ميغابايت' : 'Une image dépasse 10 Mo');
          continue;
        }
        totalNewImgs++;
      }

      if (isVid) {
        if (currentVidsCount + totalNewVids >= 2) {
          setUploadError(currentLang === 'ar' ? 'الحد الأقصى هو مقطعي فيديو' : 'Limite de 2 vidéos atteinte');
          continue;
        }
        if (file.size > 100 * 1024 * 1024) {
          setUploadError(currentLang === 'ar' ? 'حجم الفيديو يتعدى الكود الأقصى 100 ميغابايت' : 'Une vidéo dépasse 100 Mo');
          continue;
        }
        totalNewVids++;
      }

      try {
        const fileUrl = await uploadFileAsBase64(file);
        setUploadedMedia(prev => [...prev, { file_url: fileUrl, file_type: isImg ? 'image' : 'video' }]);
      } catch (err: any) {
        setUploadError(err.message || 'Error uploading file');
      }
    }
    setIsUploading(false);
  };

  const uploadFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload-media', {
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
            resolve(data.file_url);
          } else {
            reject(new Error(data.error || 'Upload failed'));
          }
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMediaUpload(e.dataTransfer.files);
    }
  };

  const handleAddSellerReply = async (reviewId: string) => {
    if (!sellerReplyText.trim()) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: currentUser?.id,
          text: sellerReplyText
        })
      });
      if (res.ok) {
        setSellerReplyText('');
        setActiveReplyReviewId(null);
        fetchProductDetails();
      } else {
        const d = await res.json();
        alert(d.error || 'Error replying to review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSellerAnswer = async (questionId: string) => {
    if (!sellerAnswerText.trim()) return;
    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: currentUser?.id,
          answer: sellerAnswerText,
          sellerName: currentUser?.name,
          sellerAvatar: currentUser?.profile_image
        })
      });
      if (res.ok) {
        setSellerAnswerText('');
        setActiveAnswerQuestionId(null);
        fetchProductDetails();
      } else {
        const d = await res.json();
        alert(d.error || 'Error answering question');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitDirectQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openLoginModal(currentLang === 'ar' ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من إرسال الأسئلة والاستفسارات للبائع.' : 'Sorry, you must log in first to ask questions.');
      return;
    }
    if (!directQuestionText.trim()) return;

    try {
      setDirectQuestionError('');
      const res = await fetch(`/api/products/${productId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          question: directQuestionText.trim()
        })
      });
      if (res.ok) {
        setDirectQuestionText('');
        fetchProductDetails();
      } else {
        const d = await res.json();
        setDirectQuestionError(d.error || 'Error submitting question');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteReview = async (reviewId: string) => {
    if (!window.confirm(currentLang === 'ar' ? 'هل تريد حذف هذا التقييم نهائياً؟' : 'Voulez-vous supprimer ce retour définitivement ?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}?adminId=${currentUser?.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProductDetails();
      } else {
        const d = await res.json();
        alert(d.error || 'Error deleting review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteReviewMedia = async (reviewId: string, mediaId: string) => {
    if (!window.confirm(currentLang === 'ar' ? 'هل تريد حذف هذا الملف المرفق؟' : 'Voulez-vous supprimer cette pièce jointe ?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/media/${mediaId}?adminId=${currentUser?.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProductDetails();
      } else {
        const d = await res.json();
        alert(d.error || 'Error deleting media');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminToggleHideReview = async (reviewId: string, isCurrentlyHidden: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/hide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser?.id,
          hide: !isCurrentlyHidden
        })
      });
      if (res.ok) {
        fetchProductDetails();
      } else {
        const d = await res.json();
        alert(d.error || 'Error updating review state');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openLoginModal(currentLang === 'ar' ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من كتابة تعليقات أو ردود على هذا المنتج.' : 'Sorry, you must log in first to add comments.');
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/products/${productId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          text: newCommentText
        })
      });
      if (res.ok) {
        setNewCommentText('');
        fetchProductDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openLoginModal(currentLang === 'ar' ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من إضافة تقييم أو مراجعة للمنتج.' : 'Sorry, you must log in first to submit reviews.');
      return;
    }
    if (!newReviewText.trim()) {
      setReviewError(currentLang === 'ar' ? 'الرجاء كتابة تعليق التقييم' : 'Veuillez écrire un commentaire');
      return;
    }

    try {
      setReviewError('');
      setSubmittingReview(true);
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          rating: newRating,
          title: reviewTitle,
          comment: newReviewText,
          media: uploadedMedia,
          question: optionalQuestion
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNewReviewText('');
        setReviewTitle('');
        setOptionalQuestion('');
        setUploadedMedia([]);
        setNewRating(5);
        fetchProductDetails();
      } else {
        setReviewError(data.error || 'Review submission failed');
      }
    } catch (err) {
      console.error(err);
      setReviewError('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-gray-500">جاري تحميل تفاصيل صفقة الجملة المحددة...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Render variables
  const priceMin = product.priceMin;
  const priceMax = product.priceMax;

  const shippingType = product.shipping_type || 'free';
  const shippingCost = shippingType === 'paid' ? (product.shipping_cost || 0) : 0;

  const productTitle = currentLang === 'ar' ? product.title : (product.titleFr || product.title);
  const productDesc = currentLang === 'ar' ? product.description : (product.descriptionFr || product.description);
  const siteUrl = window.location.origin;
  const canonicalUrl = `${siteUrl}/product/${product.slug || product.id}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="product-detail-modal-root">
      
      <Helmet>
        <title>{productTitle} | Sou9AlJoumla</title>
        <meta name="description" content={productDesc} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={`${productTitle} | Sou9AlJoumla`} />
        <meta property="og:description" content={productDesc} />
        <meta property="og:image" content={activeImage || (product.images && product.images[0]) || ''} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${productTitle} | Sou9AlJoumla`} />
        <meta name="twitter:description" content={productDesc} />
        <meta name="twitter:image" content={activeImage || (product.images && product.images[0]) || ''} />
      </Helmet>

      {/* JSON-LD Schema Markup for Search Engine Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": productTitle,
          "image": product.images || [],
          "description": productDesc,
          "sku": product.sku || product.id,
          "mpn": product.id,
          "brand": {
            "@type": "Brand",
            "name": product.brand || "Sou9AlJoumla"
          },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "MAD",
            "lowPrice": product.priceMin,
            "highPrice": product.priceMax,
            "offerCount": product.stock || 10,
            "availability": "https://schema.org/InStock",
            "url": canonicalUrl
          }
        })}
      </script>

      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-8 pointer-events-auto">
        
        {/* Header Modal */}
        <div className="bg-slate-50 border-b border-gray-100 p-4 shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider bg-amber-500/10 text-amber-600 py-1 px-2.5 rounded-md">
              Wholesale ID: {product.sku || product.id}
            </span>
            {product.isFeatured && (
              <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-md">
                VIP AD
              </span>
            )}
          </div>
          <button 
            id="detail-modal-close"
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 text-slate-800 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Panel Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh] space-y-8 flex-1 custom-scrollbar">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Gallery Left / RHS */}
            <div className="md:col-span-5 space-y-3">
              <div className="aspect-square bg-slate-50 border border-gray-100 rounded-xl overflow-hidden relative">
                <img 
                  src={activeImage} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-lg border overflow-hidden transition-all ${
                        activeImage === img ? 'border-amber-500 scale-102 ring-2 ring-amber-100' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Information specifications */}
            <div className="md:col-span-7 space-y-5">
              <div className="space-y-1.5 text-right">
                <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-snug">
                  {currentLang === 'ar' ? product.title : (product.titleFr || product.title)}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-semibold mt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                    <span className="text-slate-800 font-bold">{product.sellerRating || '5.0'}</span>
                  </span>
                  <span>|</span>
                  <span>{product.category} ({product.subcategory})</span>
                  <span>|</span>
                  <span>Location: {product.location}</span>
                </div>
              </div>

              {/* Wholesale Pricing Display panel */}
              <div className="bg-slate-50 border border-gray-100 rounded-xl p-5 text-right space-y-2">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">{currentLang === 'ar' ? 'نطاق السعــر للجملة' : 'Prix de gros'}</div>
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {priceMin.toLocaleString()} - {priceMax.toLocaleString()}
                  </span>
                  <span className="text-base font-black text-slate-600">MAD</span>
                </div>
                <div className="text-[11px] text-amber-600 font-bold bg-amber-50 py-1.5 px-3 rounded-lg inline-block">
                  {t.moq}: {product.moq} {currentLang === 'ar' ? 'قطعة (أقل طلب)' : 'pièces minimales'}
                </div>
              </div>

              {/* Business Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-right">
                  <span className="text-[10px] text-emerald-700 font-extrabold block">{currentLang === 'ar' ? 'سعر الحبة للطلب البسيط' : 'Prix Unitaire'}</span>
                  <span className="text-sm font-black text-emerald-800">{product.unitPrice} MAD</span>
                </div>
                <div className="bg-slate-50 border border-gray-100 rounded-lg p-3 text-right">
                  <span className="text-[10px] text-gray-500 font-extrabold block">{currentLang === 'ar' ? 'سعر الحبة للطلب الأقصى' : 'Prix de Gros Max'}</span>
                  <span className="text-sm font-black text-slate-800">{product.bulkPrice} MAD</span>
                </div>
              </div>

              {/* Quantity Reservation Selector / COD stamp */}
              <div className="border-t border-b border-gray-100 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500">{currentLang === 'ar' ? 'الكمية المطلوبة:' : 'Quantité:'}</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button 
                      onClick={() => setOrderQty(q => Math.max(product.moq, q - 1))}
                      className="px-3 py-1 bg-slate-50 text-slate-700 hover:bg-slate-100 font-black"
                    >-</button>
                    <span className="px-5 py-1 text-sm font-extrabold text-slate-800">{orderQty}</span>
                    <button 
                      onClick={() => setOrderQty(q => Math.min(product.stock, q + 1))}
                      className="px-3 py-1 bg-slate-50 text-slate-700 hover:bg-slate-100 font-black"
                    >+</button>
                  </div>
                </div>

                {/* Cash On Delivery Green Tag */}
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 py-1.5 px-3 rounded-full border border-emerald-100 text-xs font-bold">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>{t.codBadge}</span>
                </div>
              </div>

              {/* Checkout / Order Summary Calculator Widget */}
              <div className="bg-amber-50/45 border border-amber-200 rounded-xl p-4 text-right space-y-3">
                <div className="text-slate-800 text-xs font-bold border-b border-amber-200/50 pb-1.5 flex justify-between items-center whitespace-nowrap">
                  <span className="text-slate-500 font-bold bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                    {shippingType === 'paid' ? `🚚 ${currentLang === 'ar' ? 'الشحن مدفوع' : 'Expédition Payante'}` : `🚚 ${currentLang === 'ar' ? 'شحن مجاني' : 'Expédition Gratuite'}`}
                  </span>
                  <span className="font-extrabold select-none">📊 {currentLang === 'ar' ? 'ملخص الفاتورة وتفاصيل الشحن' : 'Détails de facturation'}</span>
                </div>
                
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-slate-900 font-black">{orderQty} x {(product.unitPrice || product.priceMax || 0).toLocaleString()} MAD</span>
                    <span>{currentLang === 'ar' ? 'سعر الحبة للطلب:' : 'Prix unitaire:'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-slate-900 font-extrabold">{(orderQty * (product.unitPrice || product.priceMax || 0)).toLocaleString()} MAD</span>
                    <span>{currentLang === 'ar' ? 'مجموع السلعة (Subtotal):' : 'Sous-total:'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    {shippingType === 'paid' ? (
                      <span className="font-mono text-amber-700 font-black">+{shippingCost.toLocaleString()} MAD</span>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        {currentLang === 'ar' ? 'مجاني ✅' : 'Gratuit ✅'}
                      </span>
                    )}
                    <span>{currentLang === 'ar' ? 'مصاريف الشحن والتوصيل:' : 'Frais d\'expédition:'}</span>
                  </div>
                  
                  <div className="border-t border-dashed border-amber-200 pt-2 flex justify-between items-center text-sm font-black">
                    <span className="font-mono text-amber-800 text-base md:text-lg">
                      {(orderQty * (product.unitPrice || product.priceMax || 0) + shippingCost).toLocaleString()} MAD
                    </span>
                    <span>{currentLang === 'ar' ? 'المجموع النهائي شامل الشحن (Total):' : 'Total Général:'}</span>
                  </div>
                </div>

                {/* Checkout CTA Button */}
                <button
                  id="checkout-trigger-btn"
                  onClick={handleShowCheckoutModal}
                  className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>🛒</span>
                  <span>{currentLang === 'ar' ? 'حجز وتأكيد الطلب الآن (Checkout)' : 'Passer à la Caisse'}</span>
                </button>
              </div>

              {/* Product Descriptions */}
              <div className="text-right space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                  {currentLang === 'ar' ? 'وصف السلعة ومواصفاتها الفنية' : 'Description de l\'article'}
                </h3>
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/50 p-4 rounded-xl border border-gray-50">
                  {currentLang === 'ar' ? product.description : (product.descriptionFr || product.description)}
                </p>
              </div>

            </div>
          </div>

          {/* Supplier Info Section Card */}
          {seller && (
            <div className="bg-slate-900 text-white rounded-xl p-6 md:p-8 border border-slate-800 text-right grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="space-y-1">
                  <div className="flex flex-col md:flex-row items-end md:items-center gap-2.5 justify-end">
                    {seller.badges && seller.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 md:gap-1.5 justify-end order-2 md:order-1">
                        {seller.badges.map((badge, idx) => {
                          let label = badge;
                          let cls = 'bg-slate-800 text-slate-350 text-[9px] px-2 py-0.5 rounded border border-slate-700 font-bold';
                          if (badge === 'Verified Seller') {
                            label = currentLang === 'ar' ? 'مورد موثوق' : 'Vendeur Vérifié';
                            cls = 'bg-blue-500/20 text-blue-400 text-[9px] px-2 py-0.5 rounded border border-blue-500/30 font-extrabold';
                          } else if (badge === 'Top Supplier') {
                            label = currentLang === 'ar' ? 'مورد رئيسي' : 'Fournisseur d\'élite';
                            cls = 'bg-purple-500/20 text-purple-400 text-[9px] px-2 py-0.5 rounded border border-purple-500/30 font-extrabold';
                          } else if (badge === 'Premium Partner') {
                            label = currentLang === 'ar' ? 'شريك مميز' : 'Partenaire Premium';
                            cls = 'bg-amber-500/20 text-amber-400 text-[9px] px-2 py-0.5 rounded border border-amber-500/30 font-extrabold';
                          } else if (badge === 'Trusted Company') {
                            label = currentLang === 'ar' ? 'شركة موثوقة' : 'Entreprise de Confiance';
                            cls = 'bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-emerald-500/30 font-extrabold';
                          } else if (badge === 'New Seller') {
                            label = currentLang === 'ar' ? 'بائع جديد' : 'Nouveau Vendeur';
                            cls = 'bg-rose-500/20 text-rose-400 text-[9px] px-2 py-0.5 rounded border border-rose-500/30 font-extrabold';
                          }
                          return (
                            <span key={idx} className={cls}>
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 justify-end order-1 md:order-2">
                       {seller.isVerified && (
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-black uppercase py-0.5 px-2 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          <span>منصة موثقة</span>
                        </span>
                      )}
                      <h3 className="text-base md:text-lg font-black text-amber-500">{seller.companyName || seller.name}</h3>
                      <img 
                        src={getAvatarForUser(seller.id, seller.profile_image || seller.companyLogo)} 
                        alt="seller personal avatar"
                        className="w-10 h-10 rounded-full border-2 border-amber-500 bg-slate-800 object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-normal">
                    {seller.companyDesc || 'بائع جملة مغربي يسعي لتقديم أفضل البضائع مع الدفع عند الاستلام.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs text-slate-400 font-semibold font-mono border-t border-slate-800/60 pt-2">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{currentLang === 'ar' ? 'عدد المبيعات:' : 'Ventes réelles:'}</span>
                    <span className="font-extrabold text-white">{seller.sales_count !== undefined ? seller.sales_count : 142} {currentLang === 'ar' ? 'عملية' : 'ventes'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-sky-450">
                    <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{currentLang === 'ar' ? 'مشاهدات الصفحة:' : 'Vues réelles:'}</span>
                    <span className="font-extrabold text-white">{product ? product.views : 0} {currentLang === 'ar' ? 'مشاهدة' : 'vues'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {currentLang === 'ar' ? 'انضم للمنصة:' : 'Membre depuis:'} {new Date(seller.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{seller.city}</span>
                </div>
              </div>

              {/* Direct interactive contact actions */}
              <div className="md:col-span-4 flex flex-col gap-2.5 w-full">
                
                {/* View Supplier Profile Button */}
                <button
                  onClick={() => {
                    recordContactAction();
                    if (onOpenSellerProfile) onOpenSellerProfile(seller.id);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Eye className="w-4 h-4 text-white" />
                  <span>عرض الملف الشخصي والإحصائيات</span>
                </button>

                {/* Regular Call Selector */}
                <button 
                  id="link-phone-supplier"
                  onClick={() => {
                    if (!currentUser) {
                      openLoginModal(currentLang === 'ar' ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من الكشف عن هاتف التواصل والاتصال بالموردين.' : 'Sorry, you must log in first to call suppliers.');
                      return;
                    }
                    recordContactAction();
                    window.location.href = `tel:${seller.phone}`;
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-500 hover:text-amber-400 text-xs font-bold rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{t.phoneTrigger} ({seller.phone})</span>
                </button>

                {/* Direct WhatsApp API Redirect Trigger */}
                <button 
                  id="link-whatsapp-supplier"
                  onClick={() => {
                    if (!currentUser) {
                      openLoginModal(currentLang === 'ar' ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من التواصل المباشر مع البائع عبر واتساب.' : 'Sorry, you must log in first to contact suppliers on WhatsApp.');
                      return;
                    }
                    recordContactAction();
                    window.open(`https://wa.me/${seller.whatsapp?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                      `مرحباً ${seller.companyName || seller.name}، أنا مهتم بطلب كمية جملة (${orderQty}) من منتجكم: ${product.title} المنشور على منصة Sou9AlJoumla. يرجى إفادتي بخصوص توفر السلعة وشروط التوصيل وشحن الجملة.`
                    )}`, '_blank', 'noreferrer');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4.5 h-4.5 shrink-0 fill-current" />
                  <span>{t.whatsappTrigger}</span>
                </button>

                {/* In App live chat */}
                {currentUser?.id !== seller.id && (
                  <button
                    id="btn-chat-supplier"
                    onClick={() => {
                      if (!currentUser) {
                        openLoginModal(currentLang === 'ar' ? 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من استخدام المحادثة الفورية مع المورد.' : 'Sorry, you must log in first to use the live chat.');
                        return;
                      }
                      recordContactAction();
                      onStartChat(seller.id);
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-900" />
                    <span>{currentLang === 'ar' ? 'بدء محادثة فورية بالمنصة' : 'Discuter sur la plateforme'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Q&A Comments Area */}
          <div className="border-t border-gray-100 pt-8 space-y-6">
            <h3 className="text-sm md:text-base font-extrabold text-slate-900 text-right border-r-4 border-amber-500 pr-2.5 py-0.5">
              {t.comments} ({comments.length})
            </h3>

            {/* List comment items */}
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400 text-right">{currentLang === 'ar' ? 'لا توجد استفسارات حول هذه السلعة حالياً. كن أول من يسأل المورد!' : 'Aucune question pour le moment.'}</p>
            ) : (
              <div className="space-y-4 text-right">
                {comments.map((c) => (
                  <div key={c.id} className="bg-slate-50/50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">{new Date(c.createdAt).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-700">{c.userName}</span>
                        <img 
                          src={getAvatarForUser(c.userId, c.userAvatar)} 
                          alt={c.userName}
                          className="w-7 h-7 rounded-full object-cover border border-amber-200 bg-amber-50 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 font-normal leading-relaxed">{c.text}</p>
                    
                    {/* Replies */}
                    {c.replies && c.replies.map((reply) => (
                      <div key={reply.id} className="bg-slate-100/50 rounded-lg p-3 border-r-2 border-slate-300 mr-4 flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-400 font-mono">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <CornerDownLeft className="w-3.5 h-3.5 text-gray-400" />
                            <span>{reply.userName}</span>
                            <img 
                              src={getAvatarForUser(reply.userId, reply.userAvatar)} 
                              alt={reply.userName}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200 bg-slate-50 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Write a comment form */}
            <form onSubmit={handleAddComment} className="space-y-3 text-right">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={t.commentPlaceholder}
                className="w-full text-xs p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-200 placeholder-gray-400 h-24 bg-white"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-lg cursor-pointer"
              >
                {t.addComment}
              </button>
            </form>
          </div>

          {/* Q&A Section */}
          <div className="border-t border-gray-100 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-extrabold text-slate-900 text-right border-r-4 border-amber-500 pr-2.5 py-0.5 flex items-center gap-1.5 justify-end w-full">
                <span>{currentLang === 'ar' ? `الأسئلة والأجوبة حول السلعة` : `Questions & Réponses`} ({questions.length})</span>
                <HelpCircle className="w-4 h-4 text-amber-500" />
              </h3>
            </div>

            {questions.length === 0 ? (
              <p className="text-xs text-gray-400 text-right">
                {currentLang === 'ar' ? 'لم يقم أحد بطرح أسئلة حول هذا المنتج حتى الآن. اسأل المورد مباشرة بالأسفل!' : 'Aucune question n\'a été posée sur ce produit.'}
              </p>
            ) : (
              <div className="space-y-4 text-right">
                {questions.map((q) => (
                  <div key={q.id} className="bg-amber-50/20 rounded-xl p-4 border border-amber-100/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-400 font-mono">{new Date(q.created_at || q.createdAt).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-700">{q.userName}</span>
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                          {q.userName ? q.userName[0] : 'U'}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-slate-800 font-bold flex items-center gap-1.5 justify-end">
                      <span>{q.question}</span>
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-black shrink-0">س</span>
                    </p>

                    {/* Answers */}
                    {q.answers && q.answers.map((ans: any) => (
                      <div key={ans.id} className="bg-white rounded-lg p-3 border-r-2 border-emerald-400 mr-4 flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-400 font-mono">{new Date(ans.created_at || ans.createdAt).toLocaleDateString()}</span>
                          <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                            <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded font-black">جواب المورد المعتمد</span>
                            <span>{ans.sellerName}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{ans.answer}</p>
                      </div>
                    ))}

                    {/* Provide answer if seller viewing */}
                    {currentUser && product && product.sellerId === currentUser.id && (
                      <div className="mr-4 pt-1 space-y-2">
                        {activeAnswerQuestionId === q.id ? (
                          <div className="flex gap-2 items-center justify-end">
                            <button 
                              onClick={() => handleAddSellerAnswer(q.id)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg cursor-pointer shrink-0"
                            >
                              إرسال الجواب
                            </button>
                            <input 
                              type="text"
                              value={sellerAnswerText}
                              onChange={(e) => setSellerAnswerText(e.target.value)}
                              placeholder="اكتبي جوابك المفصل كبائع للصفقة..."
                              className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:outline-none bg-white text-right"
                            />
                            <button 
                              onClick={() => setActiveAnswerQuestionId(null)}
                              className="text-[10px] text-gray-400 hover:text-red-500 font-medium"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setActiveAnswerQuestionId(q.id);
                              setSellerAnswerText('');
                            }}
                            className="px-3 py-1 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            الرد بجواب البائع المعتمد
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ask a question directly outside review form */}
            <form onSubmit={handleSubmitDirectQuestion} className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 text-right space-y-3">
              <div className="flex items-center gap-1 justify-end text-right">
                <span className="text-xs font-extrabold text-slate-700">{currentLang === 'ar' ? 'طرح سؤال مباشر للمورد حول السلعة' : 'Poser une question au fournisseur'}</span>
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
                >
                  {currentLang === 'ar' ? 'إرسال السؤال' : 'Poser'}
                </button>
                <input 
                  type="text"
                  value={directQuestionText}
                  onChange={(e) => setDirectQuestionText(e.target.value)}
                  placeholder={currentLang === 'ar' ? 'مثل: هل السعر شامل عينات الشحن أم للاستلام فقط؟' : 'Ex : Est-ce que le prix inclut la livraison ?'}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-200 bg-white text-right"
                />
              </div>
              {directQuestionError && <p className="text-[10px] text-red-500 font-bold text-right">{directQuestionError}</p>}
            </form>
          </div>

          {/* Reviews Star Area */}
          <div className="border-t border-gray-100 pt-8 space-y-6">
            <h3 className="text-sm md:text-base font-extrabold text-slate-900 text-right border-r-4 border-amber-500 pr-2.5 py-0.5">
              {t.reviews} ({reviews.length})
            </h3>

            {/* List Reviews */}
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-400 text-right">{currentLang === 'ar' ? 'لا توجد مراجعات أو تقييمات مكتوبة لهذه الصفقة بعد.' : 'Aucun retour d\'expérience d\'acheteur certifié.'}</p>
            ) : (
              <div className="space-y-4 text-right">
                {reviews.map((r) => {
                  const isAdmin = currentUser && ['superadmin', 'admin', 'moderator'].includes(currentUser.role);
                  return (
                    <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3.5 h-3.5 ${
                                idx < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                              <span>{r.userName}</span>
                              {r.userId === 'u-buyer1' && <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded">مشتري موثق</span>}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">{new Date(r.createdAt || r.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="w-8 h-8 bg-emerald-100 rounded-full text-emerald-800 text-xs font-bold flex items-center justify-center">
                            {r.userName ? r.userName[0] : 'U'}
                          </div>
                        </div>
                      </div>

                      {/* Review Title if present */}
                      {r.title && (
                        <h5 className="text-xs font-extrabold text-slate-800 my-0.5">{r.title}</h5>
                      )}

                      {/* Censorship mask */}
                      {r.isHidden ? (
                        <div className="bg-red-50 text-red-700 text-[11px] p-2.5 rounded-lg font-bold border border-red-100 leading-relaxed">
                          ⚠️ تم حجب وإخفاء محتوى هذه المراجعة بواسطة إدارة المنصة لمخالفتها شروط النشر العام
                        </div>
                      ) : (
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">{r.comment}</p>
                      )}

                      {/* Display attached media rows */}
                      {r.media && r.media.length > 0 && !r.isHidden && (
                        <div className="flex flex-wrap gap-2 mt-2 justify-end">
                          {r.media.map((med: any) => (
                            <div key={med.id} className="relative group w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-gray-100 bg-slate-950">
                              {med.file_type === 'image' ? (
                                <img 
                                  src={med.file_url} 
                                  alt="Review attachment" 
                                  className="w-full h-full object-cover cursor-pointer hover:scale-110 transition duration-200"
                                  onClick={() => window.open(med.file_url)}
                                />
                              ) : (
                                <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={() => window.open(med.file_url)}>
                                  <Play className="w-5 h-5 text-white/90 fill-white z-10" />
                                  <video src={med.file_url} className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" />
                                </div>
                              )}

                              {/* Admin deletion option for a single attachment */}
                              {isAdmin && (
                                <button 
                                  onClick={() => handleAdminDeleteReviewMedia(r.id, med.id)}
                                  className="absolute top-1 left-1 bg-red-600 font-extrabold text-white p-1 rounded-full hover:bg-red-750 transition cursor-pointer z-10 shadow-md"
                                  title="حذف هذا المرفق"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display seller response if exists */}
                      {r.sellerReply && (
                        <div className="bg-slate-50 rounded-xl p-3 border-r-4 border-amber-500 mt-2 mr-6 text-right space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-amber-800 font-extrabold">
                            <span>{new Date(r.sellerReply.createdAt || r.sellerReply.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5 justify-end">
                              <span>رد البائع المعتمد بالمنصة</span>
                              <CornerDownLeft className="w-3 h-3 text-amber-600" />
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed">{r.sellerReply.text}</p>
                        </div>
                      )}

                      {/* Provide inline response if seller views */}
                      {currentUser && product && product.sellerId === currentUser.id && !r.sellerReply && (
                        <div className="mt-2 text-right">
                          {activeReplyReviewId === r.id ? (
                            <div className="flex gap-2 items-center mt-1">
                              <button 
                                onClick={() => handleAddSellerReply(r.id)}
                                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer shrink-0"
                              >
                                نشر الرد
                              </button>
                              <input 
                                type="text"
                                value={sellerReplyText}
                                onChange={(e) => setSellerReplyText(e.target.value)}
                                placeholder="اكتب ردك المباشر كبائع لهذه الصفقة الجملة..."
                                className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:outline-none bg-white text-right"
                              />
                              <button 
                                onClick={() => setActiveReplyReviewId(null)}
                                className="text-xs text-gray-400 hover:text-red-500 font-medium"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setActiveReplyReviewId(r.id);
                                setSellerReplyText('');
                              }}
                              className="text-[10px] text-amber-600 hover:underline font-bold"
                            >
                              أضف رد البائع الرسمي على هذا التقييم ↩
                            </button>
                          )}
                        </div>
                      )}

                      {/* Admin panel logic */}
                      {isAdmin && (
                        <div className="flex gap-3 mt-3 border-t border-dashed border-gray-100 pt-2.5 items-center justify-start text-[10px] text-slate-400 font-bold">
                          <span className="text-slate-500">لوحة تحكّم المنسق:</span>
                          <button 
                            onClick={() => handleAdminDeleteReview(r.id)}
                            className="text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash className="w-3 h-3" />
                            <span>حذف التقييم بالكامل</span>
                          </button>
                          <button 
                            onClick={() => handleAdminToggleHideReview(r.id, r.isHidden || false)}
                            className="text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>{r.isHidden ? 'إلغاء حجب المراجعة' : 'حجب مراجعة غير لائقة'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Write a review form */}
            <form onSubmit={handleAddReview} className="bg-slate-50 border border-gray-100 rounded-xl p-5 text-right space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-wide">{t.addReview}</h4>
              
              <div className="flex items-center gap-1.5 justify-end">
                {[5, 4, 3, 2, 1].map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setNewRating(st)}
                    className="cursor-pointer focus:outline-none"
                  >
                    <Star 
                      className={`w-5 h-5 ${
                        st <= newRating ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-gray-200'
                      }`} 
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-slate-500 mr-2">{t.rating}:</span>
              </div>

              {/* Review Title */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-600 text-right">عنوان مراجعتك (اختياري)</label>
                <input 
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="مثال: سلعة ممتازة، أو التوصيل في الموعد"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none bg-white text-right"
                />
              </div>

              {/* Comment Content */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-600 text-right">تعليق التقييم والملاحظات</label>
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder={t.reviewPlaceholder}
                  className="w-full text-xs p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-200 placeholder-gray-400 h-24 bg-white"
                />
              </div>

              {/* Photos & Videos Interactive Upload Zone */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-600 text-right">إرفاق صور أو فيديوهات للمنتج (صور حتى 10مب، فيديوهات حتى 100مب)</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('review-media-input')?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1 bg-white ${
                    dragActive ? 'border-amber-500 bg-amber-50/20' : 'border-gray-200 hover:border-amber-400'
                  }`}
                >
                  <input 
                    type="file"
                    multiple
                    id="review-media-input"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                  />
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-600">
                    {currentLang === 'ar' ? 'اسحب وأفلت الملفات هنا أو اضغط للتصفح من جهازك' : 'Glissez-déposez ici ou cliquez pour parcourir'}
                  </span>
                  <span className="text-[9px] text-gray-400">JPG, PNG, WEBP (بحد أقصى 10 صور) | MP4, WEBM, MOV (بحد أقصى فيديوهين)</span>
                </div>

                {/* Attached media preview */}
                {uploadedMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-end">
                    {uploadedMedia.map((m, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                        {m.file_type === 'image' ? (
                          <img src={m.file_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-950">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        )}
                        <button 
                          type="button"
                          onClick={() => setUploadedMedia(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -left-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 z-10 font-bold text-[8px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadError && <p className="text-[10px] text-red-500 font-bold text-right">{uploadError}</p>}
                {isUploading && <p className="text-[10px] text-amber-600 font-bold text-right animate-pulse">{currentLang === 'ar' ? 'جاري رفع الملفات ومعالجتها...' : 'Téléchargement...'}</p>}
              </div>

              {/* Optional Q&A Submission with Review */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-600 text-right">ألديك سؤال محدد للمورد لتضمينه بالصفحة؟ (اختياري)</label>
                <input 
                  type="text"
                  value={optionalQuestion}
                  onChange={(e) => setOptionalQuestion(e.target.value)}
                  placeholder="مثال: هل توفرون خصومات خاصة في حالة الكميات الكبيرة جداً؟"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none bg-white text-right"
                />
              </div>

              {reviewError && <p className="text-xs text-red-500 font-bold text-right">{reviewError}</p>}

              <button
                type="submit"
                disabled={submittingReview || isUploading}
                className="px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-slate-300 font-black text-xs rounded-lg cursor-pointer"
              >
                {submittingReview ? (currentLang === 'ar' ? 'جاري إرسال تقييمك...' : 'Envoi...') : t.add}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Checkout and Order Summary popup modal */}
      {showCheckoutModal && product && (
        <div className="fixed inset-0 z-55 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 space-y-6 relative border border-gray-150 text-right">
            <button 
              type="button"
              onClick={() => setShowCheckoutModal(false)} 
              className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-right space-y-1 pb-3 border-b border-gray-100">
              <h3 className="text-lg md:text-xl font-black text-slate-900">🛒 {currentLang === 'ar' ? 'تأكيد وحجز طلب الشراء' : 'Détails de passation de commande'}</h3>
              <p className="text-xs text-gray-500">يرجى مراجعة ملخص الفواتير وتغذية العنوان للتوصيل المباشر</p>
            </div>

            {checkoutSuccess ? (
              <div className="space-y-5 py-4 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">{currentLang === 'ar' ? 'تهانينا! تم تسجيل طلب الجملة بنجاح' : 'Commande Enregistrée avec Succès'}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold">
                    {currentLang === 'ar' ? 'تم قفل وضبط سعر السلعة ومصاريف الشحن بنجاح في سجلات الفواتير الآمنة.' : 'Le coût d\'expédition et le prix du produit ont été consolidés dans les registres.'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-gray-150 text-right space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-mono text-slate-900 font-extrabold">{latestOrderId}</span>
                    <span>رقم مرجع الطلب (Order ID):</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-mono text-slate-900 font-black">{checkoutQty} قطعة</span>
                    <span>الكمية المحجوزة:</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-mono text-emerald-800 font-black">
                      {(checkoutQty * (product.unitPrice || product.priceMax || 0) + (product.shipping_type === 'paid' ? (product.shipping_cost || 0) : 0)).toLocaleString()} MAD
                    </span>
                    <span>المجموع الإجمالي المؤكد:</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-amber-755 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-extrabold">قيد المراجعة</span>
                    <span>حالة الطلب الحالية:</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
                >
                  {currentLang === 'ar' ? 'العودة لصفحة المنتج' : 'Fermer'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
                {checkoutError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs font-bold text-right col-span-2">
                    {checkoutError}
                  </div>
                )}

                {/* Product Preview Row */}
                <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-gray-100 text-right">
                  <img 
                    src={product.images[0] || ''} 
                    alt={product.title} 
                    className="w-16 h-16 object-cover rounded-lg border border-gray-150 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold">{currentLang === 'ar' ? `المورد: ${product.sellerName || 'مورد الجملة المعتمد'}` : `Vendeur: ${product.sellerName}`}</p>
                    <p className="text-[10px] text-amber-600 font-black">{currentLang === 'ar' ? `الحد الأدنى للطلب (MOQ): ${product.moq} حبة` : `MOQ: ${product.moq} pièces`}</p>
                  </div>
                </div>

                {/* Order Summary & Pricing Cards */}
                <div className="bg-amber-50/45 border border-amber-200 rounded-xl p-4 text-right space-y-2.5">
                  <div className="text-slate-800 text-xs font-black pb-1.5 border-b border-amber-150 flex justify-between items-center">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                      {product.shipping_type === 'paid' ? `🚚 الشحن مدفوع (${product.shipping_cost} MAD)` : '🚚 شحن مجاني (Gratuit)'}
                    </span>
                    <span>🧾 ملخص الفاتورة المؤقتة</span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700 font-semibold">
                    {/* Quantity field inside checkout */}
                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center border border-gray-200 rounded overflow-hidden bg-white shrink-0 font-mono">
                        <button 
                          type="button"
                          onClick={() => setCheckoutQty(q => Math.max(product.moq, q - 1))}
                          className="px-2 py-0.5 bg-slate-50 text-slate-700 hover:bg-slate-100 font-black cursor-pointer"
                        >-</button>
                        <span className="px-3 py-0.5 text-xs font-black text-slate-800">{checkoutQty}</span>
                        <button 
                          type="button"
                          onClick={() => setCheckoutQty(q => Math.min(product.stock, q + 1))}
                          className="px-2 py-0.5 bg-slate-50 text-slate-700 hover:bg-slate-100 font-black cursor-pointer"
                        >+</button>
                      </div>
                      <span>الكمية المطلوبة (عقود الجملة):</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-mono text-slate-900 font-extrabold">{checkoutQty} x {(product.unitPrice || product.priceMax || 0).toLocaleString()} MAD</span>
                      <span>سعر الحبة للطلب:</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-mono text-slate-900 font-extrabold">{(checkoutQty * (product.unitPrice || product.priceMax || 0)).toLocaleString()} MAD</span>
                      <span>مجموع السلعة (Subtotal):</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-mono text-slate-900 font-extrabold">
                        {product.shipping_type === 'paid' ? `+${(product.shipping_cost || 0).toLocaleString()} MAD` : '0 MAD'}
                      </span>
                      <span>رسوم طريقة الشحن المحدد:</span>
                    </div>

                    <div className="border-t border-dashed border-amber-250 pt-2 flex justify-between items-center text-sm font-black">
                      <span className="font-mono text-amber-800 text-base">
                        {(checkoutQty * (product.unitPrice || product.priceMax || 0) + (product.shipping_type === 'paid' ? (product.shipping_cost || 0) : 0)).toLocaleString()} MAD
                      </span>
                      <span>المبلغ النهائي المستحق للطلب:</span>
                    </div>
                  </div>
                </div>

                {/* Direct shipping details fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">اسم المستلم للطلب *</label>
                      <input 
                        type="text" required
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="الاسم الكامل للمستلم"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">رقم هاتف التواصل والواتساب *</label>
                      <input 
                        type="text" required
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        placeholder="مثل: +212600000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-bold text-slate-600 block">عنوان الشحن والتسليم الكامل بالمغرب *</label>
                    <textarea 
                      required
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 h-16 text-right"
                      placeholder="شارع الحسن الثاني، عمارة 5، شقة 10، الدار البيضاء"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 font-bold text-xs rounded-lg transition"
                  >
                    {currentLang === 'ar' ? 'إلغاء الطلب' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCheckoutOrder}
                    className="px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 font-black text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    {submittingCheckoutOrder ? (
                      <span className="animate-pulse">{currentLang === 'ar' ? 'جاري تسجيل طلبك...' : 'Finalisation...'}</span>
                    ) : (
                      <>
                        <span>📦</span>
                        <span>{currentLang === 'ar' ? 'تأكيد وحجز الطلب بفاتورة الشحن' : 'Confirmer Commande'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
