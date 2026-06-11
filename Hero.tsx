/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shirt, Smartphone, Activity, Sparkles, Watch, 
  UtensilsCrossed, Home, Search, Image as ImageIcon, MapPin, Grid, Play 
} from 'lucide-react';
import { translations } from '../lib/i18n';
import { Category, City, Product } from '../types';

interface HeroProps {
  currentLang: 'ar' | 'fr' | 'en';
  categories: Category[];
  cities: City[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExecuteSearch: () => void;
  openPromoModal: () => void;
  pinnedProducts: Product[];
  onSelectProduct: (productId: string) => void;
}

export default function Hero({
  currentLang,
  categories,
  cities,
  selectedCategory,
  onSelectCategory,
  selectedCity,
  onSelectCity,
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  openPromoModal,
  pinnedProducts = [],
  onSelectProduct
}: HeroProps) {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  // Helper to map category slugs to Lucide icons
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'clothing-accessories': return <Shirt className="w-4 h-4" />;
      case 'consumer-electronics': return <Smartphone className="w-4 h-4" />;
      case 'sports-leisure': return <Activity className="w-4 h-4" />;
      case 'beauty-cosmetics': return <Sparkles className="w-4 h-4" />;
      case 'jewelry-watches': return <Watch className="w-4 h-4" />;
      case 'food-nutrition': return <UtensilsCrossed className="w-4 h-4" />;
      case 'home-kitchen': return <Home className="w-4 h-4" />;
      default: return <Grid className="w-4 h-4" />;
    }
  };

  return (
    <section className="w-full bg-slate-50 pb-8" id="home-hero-section">
      {/* Search & Banner Core Area - Giant Orange Gradient Block */}
      <div className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white py-12 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Center: Search Console */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight select-none leading-relaxed">
                {t.tagline}
              </h1>
              <p className="text-white/90 text-xs md:text-sm max-w-2xl leading-relaxed font-normal">
                {t.subTagline}
              </p>
            </div>

            {/* Giant Wholesaler Search Box Container */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/15 max-w-3xl">
              <div className="bg-white rounded-xl p-1.5 flex flex-col md:flex-row items-center gap-2 text-slate-800">
                
                {/* Text query input */}
                <div className="flex items-center gap-2 w-full px-2 py-1 border-b md:border-b-0 md:border-l border-gray-100">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onExecuteSearch()}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-400 py-1"
                    id="search-input-box"
                  />
                </div>

                {/* City filters box */}
                <div className="flex items-center gap-1 shrink-0 w-full md:w-auto px-2 py-1 md:py-0 border-b md:border-b-0 md:border-l border-gray-100">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <select
                    id="city-filter-select"
                    value={selectedCity}
                    onChange={(e) => onSelectCity(e.target.value)}
                    className="bg-transparent text-xs font-semibold focus:outline-none py-1 cursor-pointer w-full text-slate-700"
                  >
                    <option value="">{t.allCities}</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.slug}>
                        {currentLang === 'ar' ? c.nameAr : c.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary blue submit search button */}
                <button
                  id="search-submit-btn"
                  onClick={onExecuteSearch}
                  className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {t.searchBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Right Area: Premium Shipping Feature Card */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-100 flex items-center justify-between h-56 relative overflow-hidden group">
            {/* Ambient green neon/glowing background layer */}
            <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
            <div className="absolute -right-16 -bottom-16 w-36 h-36 rounded-full bg-green-500/10 blur-2xl pointer-events-none"></div>

            {/* Content wrapper */}
            <div className="w-full h-full flex flex-row-reverse items-center justify-between gap-2 z-10">
              
              {/* Text Info Column */}
              <div className="flex-1 flex flex-col justify-between h-full text-right" dir="rtl">
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500/25 text-emerald-400 py-1 px-3 rounded-full inline-block">
                    {currentLang === 'ar' ? 'ميزة الشحن الآمن' : (currentLang === 'fr' ? 'Expédition Sécurisée' : 'Secure Shipping')}
                  </span>
                  
                  <h3 className="text-sm md:text-base font-black text-white leading-tight select-none flex items-center gap-1 justify-end">
                    <span>🚚 {currentLang === 'ar' ? 'شحن إلى جميع المدن المغربية' : (currentLang === 'fr' ? 'Livraison toutes villes' : 'Shipping to All Cities')}</span>
                  </h3>
                  
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                    {currentLang === 'ar' ? 'تواصل مع الموردين في مختلف أنحاء المملكة بسهولة.' : (currentLang === 'fr' ? 'Connectez-vous avec les fournisseurs partout au Maroc.' : 'Connect with suppliers across the Kingdom easily.')}
                  </p>
                </div>

                <button
                  id="hero-shipping-cta"
                  type="button"
                  onClick={() => {
                    const searchInput = document.getElementById('search-input-box');
                    if (searchInput) {
                      searchInput.focus();
                      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const searchContainer = searchInput.closest('.rounded-2xl');
                      if (searchContainer) {
                        searchContainer.classList.add('ring-4', 'ring-emerald-400');
                        setTimeout(() => {
                          searchContainer.classList.remove('ring-4', 'ring-emerald-400');
                        }, 1500);
                      }
                    }
                  }}
                  className="mt-2.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-slate-950 font-black text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md border border-emerald-400/40"
                >
                  <span>{currentLang === 'ar' ? 'ابدأ البحث الآن' : (currentLang === 'fr' ? 'Rechercher' : 'Start Searching Now')}</span>
                </button>
              </div>

              {/* Graphic Column: Gorgeous 3D Delivery Truck Illustration with Verified Badge */}
              <div className="w-28 sm:w-32 h-full flex items-center justify-center shrink-0">
                <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-3xl hover:scale-105 transition-transform duration-500 cursor-pointer">
                  <defs>
                    <radialGradient id="greenTruckGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="bodyGreenLinear" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="50%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="cabinGreenLinear" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6EE7B7" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="goldSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>

                  {/* Underlight Shadow */}
                  <ellipse cx="80" cy="98" rx="55" ry="6" fill="#020617" opacity="0.7" />

                  {/* Cargo Container Body */}
                  <rect x="25" y="32" width="70" height="48" rx="6" fill="url(#bodyGreenLinear)" />
                  
                  {/* Container vertical panels lines */}
                  <line x1="39" y1="32" x2="39" y2="80" stroke="#047857" strokeWidth="1.5" opacity="0.6" />
                  <line x1="53" y1="32" x2="53" y2="80" stroke="#047857" strokeWidth="1.5" opacity="0.6" />
                  <line x1="67" y1="32" x2="67" y2="80" stroke="#047857" strokeWidth="1.5" opacity="0.6" />
                  <line x1="81" y1="32" x2="81" y2="80" stroke="#047857" strokeWidth="1.5" opacity="0.6" />

                  {/* Certified Logo on side of cargo */}
                  <circle cx="60" cy="56" r="11" fill="rgba(255,255,255,0.15)" />
                  <path d="M 55 56 L 58 59 L 65 52" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  {/* Front Cabin */}
                  <path d="M 95 44 L 122 44 C 126 44, 129 48, 131 52 L 135 62 L 135 78 C 135 79, 134 80, 133 80 L 95 80 Z" fill="url(#cabinGreenLinear)" />
                  
                  {/* Cabin Windshield */}
                  <path d="M 112 47 L 123 47 C 125 47, 127 49, 128 52 L 131 60 L 112 60 Z" fill="#E2F0FD" />
                  <path d="M 118 47 L 126 60 L 128 60 L 121 47 Z" fill="#FFFFFF" opacity="0.4" />

                  {/* Bumper with Chrome highlights */}
                  <rect x="126" y="68" width="10" height="10" rx="2" fill="#E2E8F0" />
                  <rect x="128" y="71" width="8" height="2" fill="#94A3B8" />
                  <rect x="128" y="75" width="8" height="2" fill="#94A3B8" />

                  {/* Front Headlights glow */}
                  <circle cx="132" cy="67" r="3" fill="#FDE047" className="animate-pulse" />
                  <polygon points="134,65 158,60 158,74 134,69" fill="#FDE047" opacity="0.15" />

                  {/* Tire contours & Hubcaps */}
                  <circle cx="45" cy="85" r="13" fill="#1E293B" />
                  <circle cx="80" cy="85" r="13" fill="#1E293B" />
                  <circle cx="115" cy="85" r="13" fill="#1E293B" />

                  <circle cx="45" cy="85" r="5" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
                  <circle cx="80" cy="85" r="5" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
                  <circle cx="115" cy="85" r="5" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />

                  {/* Mudguards */}
                  <path d="M 32 83 A 15 15 0 0 1 58 83" stroke="#334155" strokeWidth="3.5" fill="none" />
                  <path d="M 67 83 A 15 15 0 0 1 93 83" stroke="#334155" strokeWidth="3.5" fill="none" />
                  <path d="M 102 83 A 15 15 0 0 1 128 83" stroke="#334155" strokeWidth="3.5" fill="none" />

                  {/* FLOATING GOLD VERIFIED BADGE WITH SWIFT BOUNCE EFFECT */}
                  <g className="animate-bounce" style={{ pointerEvents: 'none' }}>
                    <circle cx="85" cy="22" r="12" fill="none" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3,3" className="animate-spin" style={{ transformOrigin: '85px 22px', animationDuration: '8s' }} />
                    <circle cx="85" cy="22" r="9" fill="url(#goldSealGrad)" />
                    <path d="M 81 22 L 84 25 L 90 19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                </svg>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Categories & High-fidelity Interactive Bento Row */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Category List left card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col h-[380px]">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3 select-none flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-amber-500" />
            {t.categoriesTitle}
          </h3>
          
          <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {/* "All" Category button */}
            <button
              id="cat-button-all"
              onClick={() => onSelectCategory(null)}
              className={`w-full text-right flex items-center justify-between p-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedCategory === null 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 shrink-0" />
                <span>{t.allCategories}</span>
              </div>
            </button>

            {/* List categories */}
            {categories.map(c => {
              const active = selectedCategory === c.nameFr;
              return (
                <button
                  id={`cat-button-${c.id}`}
                  key={c.id}
                  onClick={() => onSelectCategory(c.nameFr)}
                  className={`w-full text-right flex items-center justify-between p-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    active 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{getCategoryIcon(c.slug)}</span>
                    <span className="truncate">{currentLang === 'ar' ? c.nameAr : c.nameFr}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic admin pinned royal grid show */}
        <div className="lg:col-span-3 rounded-2xl relative border-2 border-amber-500/40 bg-slate-950 p-6 flex flex-col h-[380px] overflow-hidden text-right shadow-2xl shadow-amber-500/5">
          {/* Decorative subtle background gold bokeh */}
          <div className="absolute -left-12 -top-12 w-45 h-45 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute -right-12 -bottom-12 w-45 h-45 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>

          {/* Luxury Header */}
          <div className="flex flex-row-reverse items-center justify-between mb-4 shrink-0 relative z-10">
            <div className="flex items-center gap-2 flex-row-reverse">
              <span className="animate-pulse flex items-center justify-center bg-amber-500/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/30 gap-1 select-none">
                <span>⭐</span> {currentLang === 'ar' ? 'المنتجات المميزة' : 'Recommandé'}
              </span>
              <h2 className="text-sm md:text-base font-black text-amber-100 tracking-tight">
                {t.pinnedTitle}
              </h2>
            </div>
            {pinnedProducts.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400">
                {pinnedProducts.length} {currentLang === 'ar' ? 'منتجات مميزة' : 'produits'}
              </span>
            )}
          </div>

          {/* Core Grid / Content area */}
          <div className="flex-1 min-h-0 relative z-10">
            {pinnedProducts.length === 0 ? (
              /* High elegance placeholder empty state */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner animate-bounce">
                  👑
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs md:text-sm font-black text-amber-200">
                    {t.noPinnedProducts}
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-450 max-w-md leading-relaxed">
                    {currentLang === 'ar' 
                      ? '' 
                      : 'Seuls les administrateurs peuvent épingler des produits dans cette section pour garantir une sécurité et une qualité optimales.'}
                  </p>
                </div>
              </div>
            ) : (
              /* The 3 pinned products */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {pinnedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p.id)}
                    className="group bg-slate-900/85 border border-amber-500/20 hover:border-amber-400 rounded-xl p-2.5 flex flex-col h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 relative overflow-hidden"
                  >
                    {/* Golden luxury background accent on hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                    {/* Image visual wrapper with zoom and golden border */}
                    <div className="relative h-28 rounded-lg overflow-hidden shrink-0 border border-slate-800 group-hover:border-amber-500/30">
                      <img
                        src={(p.images && p.images[0]) || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500'}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Pinned luxury VIP Badge */}
                      <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-amber-300/45">
                        <span>⭐</span> {currentLang === 'ar' ? 'مثبّت' : 'PINNED'}
                      </span>
                      
                      {/* Brand name if available */}
                      {p.brand && (
                        <span className="absolute bottom-1 left-1 bg-slate-950/80 text-amber-400 font-bold text-[8.5px] px-1.5 py-0.5 rounded-md border border-slate-850 truncate max-w-[100px]">
                          {p.brand}
                        </span>
                      )}

                      {/* City local marker */}
                      <span className="absolute bottom-1 right-1 bg-slate-950/80 text-slate-300 font-medium text-[8px] px-1.5 py-0.5 rounded-md border border-slate-800">
                        📍 {p.location}
                      </span>
                    </div>

                    {/* Metadata Content area */}
                    <div className="flex-1 flex flex-col justify-between mt-2 pt-0.5 space-y-1.5 text-right">
                      <div>
                        {/* Elegant Item Title */}
                        <h4 className="text-xs font-black text-amber-100 group-hover:text-amber-400 transition-colors line-clamp-1 leading-normal">
                          {p.title}
                        </h4>
                        
                        {/* Brief specification text */}
                        <p className="text-[9.5px] text-slate-400 font-medium line-clamp-1 leading-relaxed">
                          {p.shortDescription || p.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-0.5">
                        {/* Minimum Order spec */}
                        <div className="flex justify-between items-center bg-slate-955/65 py-0.5 px-2 rounded-md border border-slate-900 text-[8.5px] text-slate-400">
                          <span className="font-extrabold text-amber-300">{p.moq}</span> 
                          <span>{t.moq}</span>
                        </div>

                        {/* Wholesale & unit prices */}
                        <div className="flex flex-row-reverse items-baseline justify-between select-none">
                          <span className="text-[10px] text-slate-400 font-normal">
                            💰
                          </span>
                          <span className="text-xs font-black text-amber-400 tabular-nums">
                            {p.priceMin} - {p.priceMax} <span className="text-[9px] font-black">{currentLang === 'ar' ? 'د.م' : 'MAD'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Advertising booking CTA section - elegantly placed in the empty space below the categories grid and above the product catalog */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="bg-gradient-to-r from-emerald-50/70 to-green-50/40 border border-emerald-500/15 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xs relative overflow-hidden text-right" dir={isRtl ? "rtl" : "ltr"}>
          {/* Decorative ambient glowing circles */}
          <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-green-400/10 blur-2xl pointer-events-none"></div>

          {/* Texts & Info */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 justify-start">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {currentLang === 'ar' ? 'مساحة إعلانية مميزة' : (currentLang === 'fr' ? 'Espace Publicitaire Premium' : 'Premium Advertising Space')}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black text-slate-900 leading-tight">
              {currentLang === 'ar' ? 'هل ترغب في زيادة مبيعاتك والوصول إلى آلاف التجار والزبائن يومياً؟' : (currentLang === 'fr' ? 'Voulez-vous augmenter vos ventes et toucher des milliers de marchands ?' : 'Want to boost your sales and reach thousands of daily merchants?')}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
              {currentLang === 'ar' 
                ? 'احجز مساحتك الإعلانية المميزة الآن على منصة Sou9AlJoumla سوق الجملة المغربي الرائد وضاعف انتشار نشاطك التجاري.' 
                : (currentLang === 'fr' 
                  ? 'Réservez votre espace publicitaire privilégié dès maintenant sur Sou9AlJoumla pour booster votre visibilité.' 
                  : 'Book your featured advertisement space now on Sou9AlJoumla Moroccan Wholesale Marketplace.')}
            </p>
          </div>

          {/* Beautiful Green CTA Button with pulse attention-seeking loop */}
          <button
            onClick={openPromoModal}
            className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-97 text-white font-black text-xs md:text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 border border-emerald-400/40 cursor-pointer flex items-center justify-center gap-2.5 group shrink-0 animate-[pulse_2.2s_infinite] hover:animate-none"
            id="ad-booking-cta-btn"
          >
            <span className="inline-block transition-transform duration-300 group-hover:scale-115">📣</span>
            <span>
              {currentLang === 'ar' ? 'يمكنك حجز مساحتك الإعلانية من هنا' : (currentLang === 'fr' ? 'Réservez votre espace publicitaire ici' : 'You can book your advertising space here')}
            </span>
          </button>
        </div>
      </div>

    </section>
  );
}
