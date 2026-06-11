/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'superadmin' | 'admin' | 'moderator' | 'seller' | 'buyer' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  whatsapp: string;
  companyName?: string;
  companyLogo?: string;
  companyBanner?: string;
  companyDesc?: string;
  city: string;
  points: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  created_at?: string; // dynamic server-side timestamp field
  isVerified: boolean;
  status: 'active' | 'suspended' | 'pending_verification';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  isAdmin?: boolean;
  mustChangePassword?: boolean;
  firstLoginDone?: boolean;
  passwordVersion?: number;
  passwordChangedManually?: boolean;
  badges?: string[];
  profile_image?: string;
  banner_image?: string;
  last_name_change_at?: string;
  sales_count?: number;
  rating?: number;
  points_spent?: number;
  passwordResetTimestamps?: string[];
  passwordResetCount?: number;
  notifications?: AppNotification[];
}

export interface AppNotification {
  id: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  type?: 'info' | 'success' | 'danger';
}

export interface ProfileStat {
  user_id: string;
  views_count: number;
  sales_count: number;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  titleFr?: string;
  description: string;
  descriptionFr?: string;
  shortDescription: string;
  shortDescriptionFr?: string;
  category: string;
  subcategory: string;
  brand: string;
  condition: string;
  priceMin: number;
  priceMax: number;
  unitPrice: number;
  bulkPrice: number;
  currency: string;
  moq: number; // Minimum Order Quantity
  maxOrder: number;
  stock: number;
  sku: string;
  images: string[];
  videoUrl?: string;
  pdfUrl?: string;
  tags: string[];
  location: string;
  sellerId: string;
  createdAt: string;
  views: number;
  status: 'active' | 'draft' | 'suspended' | 'pending_review' | 'approved' | 'rejected' | 'changes_requested' | 'escalated';
  rejectionReason?: string;
  riskScore?: number;
  riskReasons?: string[];
  moderationStatus?: 'queued' | 'processing' | 'blocked' | 'human_review' | 'escalated' | 'changes_requested';
  publisherEventId?: string;
  isFeatured: boolean;
  is_premium?: boolean;
  premium_created_at?: string;
  isPinned: boolean;
  slug: string;
  sellerName?: string;
  sellerVerified?: boolean;
  sellerCity?: string;
  sellerRating?: number;
  sellerBadges?: string[];
  shipping_type?: 'free' | 'paid';
  shipping_cost?: number;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number; // in MAD (for real payments) or points adjustment
  points: number; // point count modified
  description: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
  invoiceId?: string;
}

export interface ChatRoom {
  id: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  buyerLogo?: string;
  sellerLogo?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountBuyer: number;
  unreadCountSeller: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  fileUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  product_id?: string;
  userId: string;
  user_id?: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  createdAt: string;
  created_at?: string;
  isHidden?: boolean;
  media?: ReviewMedia[];
  sellerReply?: ReviewReply;
}

export interface ReviewReply {
  id: string;
  sellerId: string;
  text: string;
  createdAt: string;
}

export interface ReviewMedia {
  id: string;
  review_id: string;
  file_url: string;
  file_type: 'image' | 'video';
}

export interface ReviewQuestion {
  id: string;
  product_id: string;
  user_id: string;
  userName?: string;
  userAvatar?: string;
  question: string;
  created_at: string;
  answers?: ReviewAnswer[];
}

export interface ReviewAnswer {
  id: string;
  question_id: string;
  seller_id: string;
  sellerName?: string;
  sellerAvatar?: string;
  answer: string;
  created_at: string;
}

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  images?: string[];
  replies?: CommentReply[];
  createdAt: string;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'points';
  value: number; // e.g. 10 for percentage, 50 for fixed MAD, 100 for points
  minPurchase?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'inactive' | 'used';
}

export interface RechargeCode {
  id: string;
  code: string;
  points: number;
  expiryDate: string;
  status: 'active' | 'used';
  usedBy?: string;
  usedAt?: string;
}

export interface City {
  id: string;
  nameAr: string;
  nameFr: string;
  slug: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  ip: string;
  details: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'product' | 'comment' | 'seller' | 'message';
  targetId: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameFr: string;
  slug: string;
  icon: string;
  subcategories: string[];
  sortOrder?: number;
}

export interface ContactMessageItem {
  id: string;
  sender: 'user' | 'admin';
  senderId?: string;
  senderName: string;
  senderEmail?: string;
  text: string;
  attachments?: string[]; // base64 or relative file strings
  createdAt: string;
}

export interface ContactThread {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  snippet: string;
  status: 'read' | 'unread';
  userStatus?: 'read' | 'unread'; // Read/unread status on the user's end
  type?: 'normal' | 'admin' | 'important' | 'promo'; // Message categories
  isImportant?: boolean;
  isArchived?: boolean;
  isTrash?: boolean;
  createdAt: string;
  updatedAt: string;
  userReadAt?: string; // When the user read last message
  adminReadAt?: string; // When the admin read last message
  messages: ContactMessageItem[];
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: string;
  quantity: number;
  unitPrice: number;
  shippingType: 'free' | 'paid';
  shippingCost: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'shipped' | 'completed' | 'cancelled';
  couponCode?: string;
  discountApplied?: number;
  noContact?: boolean;
  createdAt: string;
}

export interface ModerationQueueItem {
  id: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  sellerName: string;
  riskScore: number;
  riskReasons: string[];
  status: 'queued' | 'processing' | 'blocked' | 'human_review' | 'escalated' | 'changes_requested' | 'approved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  processedAt?: string;
}

export interface NotificationQueueItem {
  id: string;
  userId: string;
  text: string;
  type: 'info' | 'success' | 'danger';
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: string;
  sentAt?: string;
}

export interface OtpVerification {
  id: string;
  userId: string;
  otp: string;
  otpHash: string; // Anti-tamper Hash code or unique indicator trace
  context: string; // The strictly restricted transaction purpose (e.g. 'REGISTER', 'RESET_PASSWORD')
  deviceId?: string; // Optional track of browser/device fingerprint
  attempts: number; // Counter tracking cumulative invalid entries
  ip: string; // Requester IP location
  expiresAt: number;
  createdAt: number;
  used: boolean;
}


