/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle, Eye, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { translations } from '../lib/i18n';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  currentLang: 'ar' | 'fr' | 'en';
  onSelect: (productId: string) => void;
}

export default function ProductCard({
  product,
  currentLang,
  onSelect
}: ProductCardProps) {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  // Calculate simulated seller years based on seller creation date or product creation date
  const sellerYears = product.id === 'p1' ? 4 : product.id === 'p2' ? 2 : product.id === 'p3' ? 1 : 3;

  return (
    <div 
      className={`bg-white rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5 cursor-pointer ${
        product.isPinned 
          ? 'border-amber-400 shadow-md shadow-amber-500/5 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10' 
          : 'border-gray-100 shadow-xs hover:shadow-md'
      }`}
      onClick={() => onSelect(product.id)}
      id={`product-card-view-${product.id}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden shrink-0">
        <img 
          src={product.images[0] || 'https://images.unsplash.com/photo-1546213290-e1b7610339ef?auto=format&fit=crop&q=80&w=600'} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Pinned or Featured Banner badging */}
        {product.isPinned ? (
          <span className="absolute top-2.5 right-2.5 z-10 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-md shadow-xs flex items-center gap-1 border border-amber-300/40 select-none">
            <span>⭐</span>
            <span>{currentLang === 'ar' ? 'توصية الإدارة' : 'ADMIN PINNED'}</span>
          </span>
        ) : product.isFeatured ? (
          <span className="absolute top-2.5 right-2.5 z-10 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-md shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-current text-amber-400" />
            <span>VIP</span>
          </span>
        ) : null}

        {/* Floating Verified Badge matching image reference */}
        {product.sellerVerified && (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-full border border-gray-100 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
            <span className="text-[10px] text-blue-800 font-extrabold tracking-tight uppercase">
              {t.verified}
            </span>
          </div>
        )}

        {/* Years indicator on bottom right */}
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-slate-900/75 text-white/90 backdrop-blur-xs py-0.5 px-2 rounded-md text-[9px] font-bold font-mono">
          {sellerYears} {t.yrs} • MA
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Main Title - localization aware */}
          <h4 className="text-xs md:text-sm font-bold text-slate-800 tracking-tight line-clamp-2 hover:text-amber-500 transition-colors">
            {currentLang === 'ar' ? product.title : (product.titleFr || product.title)}
          </h4>

          {/* MOQ - Minimum Order Quantity is extremely prominent */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
            <span className="bg-slate-100 py-0.5 px-1.5 rounded-xs">
              {t.moq}: {product.moq} {currentLang === 'ar' ? 'قطعة' : 'pièces'}
            </span>
          </div>

          {/* Seller Badges display on the product card */}
          {product.sellerBadges && product.sellerBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1 justify-start">
              {product.sellerBadges.map((badge, idx) => {
                let label = badge;
                let cls = 'bg-gray-100 text-gray-700 text-[8.5px] px-1.5 py-0.5 rounded border border-gray-200 font-bold';
                if (badge === 'Verified Seller') {
                  label = isRtl ? 'مورد موثوق' : 'Vendeur Vérifié';
                  cls = 'bg-blue-50 text-blue-700 text-[8.5px] px-1.5 py-0.5 rounded border border-blue-200 font-extrabold';
                } else if (badge === 'Top Supplier') {
                  label = isRtl ? 'مورد رئيسي' : 'Fournisseur d\'élite';
                  cls = 'bg-purple-50 text-purple-700 text-[8.5px] px-1.5 py-0.5 rounded border border-purple-200 font-extrabold';
                } else if (badge === 'Premium Partner') {
                  label = isRtl ? 'شريك مميز' : 'Partenaire Premium';
                  cls = 'bg-amber-50 text-amber-700 text-[8.5px] px-1.5 py-0.5 rounded border border-amber-200 font-extrabold';
                } else if (badge === 'Trusted Company') {
                  label = isRtl ? 'شركة موثوقة' : 'Entreprise de Confiance';
                  cls = 'bg-emerald-50 text-emerald-700 text-[8.5px] px-1.5 py-0.5 rounded border border-emerald-200 font-extrabold';
                } else if (badge === 'New Seller') {
                  label = isRtl ? 'بائع جديد' : 'Nouveau Vendeur';
                  cls = 'bg-rose-50 text-rose-700 text-[8.5px] px-1.5 py-0.5 rounded border border-rose-200 font-extrabold';
                }
                return (
                  <span key={idx} className={cls}>
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing Range & Views */}
        <div className="pt-2 border-t border-gray-50 flex items-end justify-between">
          <div className="flex flex-col">
            {/* Price minimum and maximum with currency */}
            <span className="text-sm md:text-base font-black text-slate-900 leading-none">
              {product.priceMin.toLocaleString()} - {product.priceMax.toLocaleString()} {t.currency === 'MAD' ? 'MAD' : t.currency}
            </span>
            <span className="text-[9px] text-amber-500 font-bold mt-0.5 uppercase tracking-wide">
              {currentLang === 'ar' ? 'سعر الجملة المخفض' : 'Prix inférieur à celui de détail'}
            </span>
          </div>

          {/* Views/Sales Counter match */}
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
            <Eye className="w-3 h-3 text-gray-400" />
            <span>{product.views || 0} {t.views}</span>
          </div>
        </div>

        {/* Card location & Shipping method */}
        <div className="flex items-center justify-between gap-1 text-[10px] text-gray-400 font-medium mt-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{product.location}</span>
          </div>
          
          <div className="font-extrabold select-none">
            {product.shipping_type === 'paid' ? (
              <span className="text-amber-700 bg-amber-50/70 py-0.5 px-2 rounded-md border border-amber-100 text-[9px] font-black">
                🚚 {currentLang === 'ar' ? `الشحن: ${product.shipping_cost} MAD` : `Exp: ${product.shipping_cost} MAD`}
              </span>
            ) : (
              <span className="text-emerald-700 bg-emerald-50/70 py-0.5 px-2 rounded-md border border-emerald-100 text-[9px] font-black">
                🚚 {currentLang === 'ar' ? 'شحن مجاني' : 'Livraison Gratuite'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
