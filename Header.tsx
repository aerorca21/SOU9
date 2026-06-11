/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Globe, ShieldAlert, Newspaper, LogIn, LogOut, Coins, 
  MessageSquare, PlusCircle, LayoutDashboard, Menu, X, ChevronDown, User as UserIcon 
} from 'lucide-react';
import { translations } from '../lib/i18n';
import { User } from '../types';

interface HeaderProps {
  currentLang: 'ar' | 'fr' | 'en';
  setLang: (lang: 'ar' | 'fr' | 'en') => void;
  currentUser: User | null;
  logoUrl?: string;
  logoHasText?: boolean;
  onLogout: () => void;
  openLoginModal: () => void;
  openWalletModal: () => void;
  openChatModal: () => void;
  openProductCreateModal: () => void;
  openAdminModal: () => void;
  openBlogModal: () => void;
  openTermsModal: () => void;
  openProfileModal: () => void;
}

export default function Header({
  currentLang,
  setLang,
  currentUser,
  logoUrl,
  logoHasText,
  onLogout,
  openLoginModal,
  openWalletModal,
  openChatModal,
  openProductCreateModal,
  openAdminModal,
  openBlogModal,
  openTermsModal,
  openProfileModal
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs" id="main-app-header">
      {/* Top micro Header Ribbon */}
      <div className="w-full bg-slate-900 text-gray-300 text-xs py-2.5 px-4 md:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Terms & blog guides direct shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              id="header-btn-terms"
              onClick={openTermsModal} 
              className="hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              {t.terms}
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <button 
              id="header-btn-blog"
              onClick={openBlogModal} 
              className="hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Newspaper className="w-3.5 h-3.5 text-emerald-500" />
              {t.blog}
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-gray-400 font-mono text-[10px] hidden md:inline">
              Support: support@sou9aljoumla.com
            </span>
          </div>

          {/* i18n Swapper element */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <div className="relative group">
                <button className="flex items-center gap-1 cursor-pointer font-medium hover:text-white px-2 py-0.5 rounded-sm bg-slate-800">
                  <span>{currentLang === 'ar' ? 'العربية 🇲🇦' : currentLang === 'fr' ? 'Français 🇫🇷' : 'English 🇬🇧'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-1 bg-slate-800 border border-slate-700 rounded-sm shadow-xl hidden group-hover:block z-50 text-slate-200 min-w-32`}>
                  <button onClick={() => setLang('ar')} className="w-full text-right px-3 py-2 text-xs hover:bg-amber-600 hover:text-white transition-colors block">العربية 🇲🇦</button>
                  <button onClick={() => setLang('fr')} className="w-full text-right px-3 py-2 text-xs hover:bg-amber-600 hover:text-white transition-colors block">Français 🇫🇷</button>
                  <button onClick={() => setLang('en')} className="w-full text-right px-3 py-2 text-xs hover:bg-amber-600 hover:text-white transition-colors block">English 🇬🇧</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Branding Control Panel Header */}
      <div className="w-full py-4 px-4 md:px-8 max-w-7xl mx-auto flex justify-between items-center">
        {/* Branding & Logo */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center focus:outline-none pointer-events-auto cursor-pointer"
            id="header-brand-logo"
          >
            <div className="w-[220px] sm:w-[320px] h-[44px] sm:h-[60px] flex items-center justify-center overflow-hidden">
              <img 
                src={logoUrl || 'https://b.top4top.io/p_381340dgr1.png'} 
                alt={t.siteName} 
                className="w-[220px] sm:w-[320px] h-auto max-w-none max-h-none object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* If user is Admin, Super Admin, or Moderator role */}
              {((currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'moderator')) && (
                <button
                  id="nav-btn-admin"
                  onClick={openAdminModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs border border-purple-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t.adminDashboard}
                </button>
              )}

              {/* In App Chat messenger bubble */}
              <button
                id="nav-btn-chats"
                onClick={openChatModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs border border-blue-200 relative"
              >
                <MessageSquare className="w-4 h-4" />
                {t.chat}
              </button>

              {/* Profile button */}
              <button
                id="nav-btn-profile"
                onClick={openProfileModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-all cursor-pointer border border-gray-200"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                <span>{currentUser.name}</span>
              </button>

              {/* Points Wallet Readout */}
              <button
                id="nav-btn-wallet"
                onClick={openWalletModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs border border-emerald-200"
              >
                <Coins className="w-4.5 h-4.5 text-emerald-600" />
                <span>{currentUser.name.split(' ')[0]} ({currentUser.points} {t.points})</span>
              </button>

              {/* Anyone not suspended can submit items */}
              {currentUser.status !== 'suspended' && (
                <button
                  id="nav-btn-create"
                  onClick={openProductCreateModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 text-xs font-black rounded-lg transition-all cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>إضافة منتج أو نشر عرض</span>
                </button>
              )}

              {/* Logout button */}
              <button
                id="nav-btn-logout"
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-gray-50 text-xs rounded-lg transition-colors cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <button
              id="nav-btn-login"
              onClick={() => openLoginModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {t.loginSeller}
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-3">
          {currentUser && (
            <span onClick={openWalletModal} className="text-xs bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 py-1.5 px-2.5 rounded-lg font-bold text-emerald-700 flex items-center gap-1 cursor-pointer">
              <Coins className="w-3.5 h-3.5" />
              {currentUser.points}
            </span>
          )}
          <button 
            id="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-1.5 bg-gray-50 text-slate-800 rounded-md hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-slate-50 border-t border-gray-100 p-4 flex flex-col gap-3 shadow-inner" id="mobile-navigation-drawer">
          {currentUser ? (
            <div className="flex flex-col gap-2">
              <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-slate-700 font-bold">
                  {currentUser.name[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                  <span className="text-[10px] text-gray-400 capitalize">{['superadmin', 'admin'].includes(currentUser.role) ? t.adminDashboard : currentUser.role}</span>
                </div>
              </div>

              <button
                id="mob-nav-profile"
                onClick={() => { openProfileModal(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <UserIcon className="w-4.5 h-4.5 text-slate-500" />
                <span>ملفي الشخصي والإحصائيات</span>
              </button>

              {(currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                <button
                  id="mob-nav-admin"
                  onClick={() => { openAdminModal(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full p-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                  {t.adminDashboard}
                </button>
              )}

              <button
                id="mob-nav-chat"
                onClick={() => { openChatModal(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full p-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4.5 h-4.5" />
                {t.chat}
              </button>

              <button
                id="mob-nav-wallet"
                onClick={() => { openWalletModal(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Coins className="w-4.5 h-4.5" />
                {t.wallet} ({currentUser.points} PT)
              </button>

              {currentUser.status !== 'suspended' && (
                <button
                  id="mob-nav-create"
                  onClick={() => { openProductCreateModal(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full p-2.5 bg-amber-500 text-white hover:bg-amber-600 font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>إضافة منتج أو نشر عرض</span>
                </button>
              )}

              <button
                id="mob-nav-logout"
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full p-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                {t.logout}
              </button>
            </div>
          ) : (
            <button
              id="mob-nav-login"
              onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full p-3 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <LogIn className="w-4.5 h-4.5" />
              {t.loginSeller}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
