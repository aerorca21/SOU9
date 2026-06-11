/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Phone, MessageCircle, Check, CheckCheck, 
  User, MessageSquare, Clock 
} from 'lucide-react';
import { translations } from '../lib/i18n';
import { User as UserType, ChatRoom, Message } from '../types';

interface ChatPanelProps {
  currentUser: UserType | null;
  currentLang: 'ar' | 'fr' | 'en';
  onClose: () => void;
  initialSellerIdId?: string | null;
}

export default function ChatPanel({
  currentUser,
  currentLang,
  onClose,
  initialSellerIdId
}: ChatPanelProps) {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsgText, setNewMsgText] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('عدم الاستلام وشحن البضائع');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimer = useRef<any>(null);

  // Fast prefilled wholesale replies templates
  const chatTemplates = isRtl ? [
    'السلام عليكم، هل هذه السلعة متوفرة حالياً للتسليم الفوري؟',
    'ما هي شروط شحن السلعة خارج الدار البيضاء؟',
    'هل يمكن الحصول على خصم إضافي عند طلب كمية تفوق الـ 100 حبة؟',
    'أريد تحديد موعد لمشاهدة عينات المنتجات بمخزنكم الكريم.'
  ] : [
    'Bonjour, cet article est-il disponible pour livraison immédiate ?',
    'Quelles sont vos conditions d\'expédition en dehors de Casablanca ?',
    'Est-il possible d\'avoir une réduction pour plus de 100 pièces ?',
    'Je voudrais fixer un rdv pour voir des échantillons dans votre dépôt.'
  ];

  // Initiate room search & polls on load
  useEffect(() => {
    if (currentUser) {
      fetchRooms();
    }
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [currentUser]);

  // Handle auto-starting room if directed via Product Details Seller Card
  useEffect(() => {
    if (initialSellerIdId && currentUser) {
      initiateDirectRoom(initialSellerIdId);
    }
  }, [initialSellerIdId, currentUser]);

  // Periodic messages polling (triggers every 3 seconds to keep chat lively and REAL!)
  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      if (pollTimer.current) clearInterval(pollTimer.current);
      pollTimer.current = setInterval(() => {
        fetchMessages(selectedRoom.id);
      }, 3000);
    } else {
      if (pollTimer.current) clearInterval(pollTimer.current);
    }
  }, [selectedRoom]);

  // Auto-scroll messages bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchOrdersForActiveChat = async () => {
    if (!currentUser || !selectedRoom) return;
    try {
      setLoadingOrders(true);
      const res = await fetch(`/api/orders?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.orders || []).filter((o: any) =>
          o.buyerId === selectedRoom.buyerId && o.sellerId === selectedRoom.sellerId
        );
        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(filtered);
        setSelectedOrderIndex(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      fetchOrdersForActiveChat();
    } else {
      setOrders([]);
    }
  }, [selectedRoom, currentUser]);

  const handleOrderApprove = async (orderId: string) => {
    if (!currentUser || !selectedRoom) return;
    try {
      setIsSubmittingAction(true);
      const res = await fetch(`/api/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          roomId: selectedRoom.id
        })
      });
      if (res.ok) {
        fetchOrdersForActiveChat();
        fetchMessages(selectedRoom.id);
        fetchRooms();
      } else {
        const err = await res.json();
        alert(err.error || 'فشلت العملية');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOrderShip = async (orderId: string) => {
    if (!currentUser || !selectedRoom) return;
    try {
      setIsSubmittingAction(true);
      const res = await fetch(`/api/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          roomId: selectedRoom.id
        })
      });
      if (res.ok) {
        fetchOrdersForActiveChat();
        fetchMessages(selectedRoom.id);
        fetchRooms();
      } else {
        const err = await res.json();
        alert(err.error || 'فشلت العملية');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOrderComplete = async (orderId: string) => {
    if (!currentUser || !selectedRoom) return;
    try {
      setIsSubmittingAction(true);
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          roomId: selectedRoom.id
        })
      });
      if (res.ok) {
        fetchOrdersForActiveChat();
        fetchMessages(selectedRoom.id);
        fetchRooms();
      } else {
        const err = await res.json();
        alert(err.error || 'فشلت العملية');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOrderReject = async (orderId: string) => {
    if (!currentUser || !selectedRoom) return;
    if (!confirm('هل أنت متأكد من رغبتك في رفض/إلغاء هذا الطلب؟')) return;
    try {
      setIsSubmittingAction(true);
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          roomId: selectedRoom.id
        })
      });
      if (res.ok) {
        fetchOrdersForActiveChat();
        fetchMessages(selectedRoom.id);
        fetchRooms();
      } else {
        const err = await res.json();
        alert(err.error || 'فشلت عملية الإلغاء');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOrderNoContact = async (orderId: string) => {
    if (!currentUser || !selectedRoom) return;
    if (!confirm('تأكيد تسجيل حالة "عدم رد وتواصل" لنقض الطلب نتيجة عدم استجابة الطرف الآخر؟')) return;
    try {
      setIsSubmittingAction(true);
      const res = await fetch(`/api/orders/${orderId}/no-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          roomId: selectedRoom.id
        })
      });
      if (res.ok) {
        fetchOrdersForActiveChat();
        fetchMessages(selectedRoom.id);
        fetchRooms();
      } else {
        const err = await res.json();
        alert(err.error || 'فشلت العملية');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOrderReport = async (orderId: string) => {
    if (!currentUser || !selectedRoom) return;
    try {
      setIsSubmittingAction(true);
      const res = await fetch(`/api/orders/${orderId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          roomId: selectedRoom.id,
          reason: reportReason,
          details: reportDetails
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'تم تسجيل البلاغ');
        setShowReportForm(false);
        setReportDetails('');
        fetchOrdersForActiveChat();
        fetchMessages(selectedRoom.id);
        fetchRooms();
        if (data.suspended) {
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      } else {
        alert(data.error || 'فشلت العملية');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const fetchRooms = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/chats/rooms/${currentUser.id}`);
      if (res.ok) {
        const list = await res.json();
        setRooms(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initiateDirectRoom = async (sellerId: string) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await fetch('/api/chats/rooms/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: currentUser.id,
          sellerId: sellerId
        })
      });

      if (res.ok) {
        const room = await res.json();
        setSelectedRoom(room);
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chats/rooms/${roomId}/messages`);
      if (res.ok) {
        const list = await res.json();
        setMessages(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || newMsgText;
    if (!textToSend.trim() || !currentUser || !selectedRoom) return;

    try {
      if (!customText) setNewMsgText('');
      
      const res = await fetch('/api/chats/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          senderId: currentUser.id,
          text: textToSend
        })
      });

      if (res.ok) {
        fetchMessages(selectedRoom.id);
        fetchRooms(); // refresh list last messages
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="messenger-panel-root">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[80vh] pointer-events-auto">
        
        {/* Top Header navbar */}
        <div className="bg-slate-50 border-b border-gray-100 p-4 shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm md:text-base font-black text-slate-900">{t.chat}</h2>
          </div>
          <button 
            id="chat-panel-close"
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 text-slate-800 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messenger core double side layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Chat room messages detail view - RHS / LHS */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            {selectedRoom ? (
              <>
                {/* Active contact bar */}
                <div className="bg-white border-b border-gray-100 p-3 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Online Trader</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-800">
                        {currentUser?.id === selectedRoom.buyerId ? selectedRoom.sellerName : selectedRoom.buyerName}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-700 font-bold">
                      {(currentUser?.id === selectedRoom.buyerId ? selectedRoom.sellerName : selectedRoom.buyerName)[0]}
                    </div>
                  </div>
                </div>

                {/* Shared orders sub-panel */}
                {orders.length > 0 && (() => {
                  const activeOrder = orders[selectedOrderIndex];
                  if (!activeOrder) return null;
                  return (
                    <div className="bg-amber-50/50 border-b border-amber-100/70 p-3 shrink-0 text-right font-sans" id="chat-order-card">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={activeOrder.productImage || 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=150'} 
                            alt={activeOrder.productTitle} 
                            className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-850 truncate">{activeOrder.productTitle}</h4>
                            <div className="flex flex-wrap gap-1.5 items-center mt-0.5 text-[10px] text-gray-500 font-bold">
                              <span>مرجع: <span className="font-mono text-slate-600">{activeOrder.id}</span></span>
                              <span>•</span>
                              <span>الكمية: {activeOrder.quantity} قطعة</span>
                              <span>•</span>
                              <span className="text-slate-800 font-black">{activeOrder.totalPrice.toLocaleString()} MAD</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status Pill */}
                          <div className="text-[10px] font-bold px-2 py-1 rounded-md shrink-0">
                            {activeOrder.status === 'pending' && <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded">🟡 قيد المراجعة</span>}
                            {activeOrder.status === 'approved' && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded">📦 مقبول وقيد التحضير</span>}
                            {activeOrder.status === 'shipped' && <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded">🚚 تم الشحن وفي الطريق</span>}
                            {activeOrder.status === 'completed' && <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">✅ تم التسليم واستلام المبلغ</span>}
                            {activeOrder.status === 'cancelled' && <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded">❌ ملغي</span>}
                          </div>

                          {/* Quick Toggles if multiple orders */}
                          {orders.length > 1 && (
                            <select 
                              value={selectedOrderIndex} 
                              onChange={(e) => setSelectedOrderIndex(Number(e.target.value))}
                              className="text-[10px] bg-white border border-gray-200 rounded p-1 font-bold cursor-pointer"
                            >
                              {orders.map((ord, idx) => (
                                <option key={idx} value={idx}>طلب {idx + 1}: {ord.id.substring(0, 8)}</option>
                              ))}
                            </select>
                          )}

                          {/* Seller Controls */}
                          {currentUser?.id === selectedRoom.sellerId && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {activeOrder.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isSubmittingAction}
                                    onClick={() => handleOrderApprove(activeOrder.id)}
                                    className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1 rounded transition cursor-pointer animate-pulse"
                                  >
                                    الموافقة على الطلب 👍
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSubmittingAction}
                                    onClick={() => handleOrderReject(activeOrder.id)}
                                    className="text-[10px] bg-slate-600 hover:bg-slate-700 text-white font-bold px-3 py-1 rounded transition cursor-pointer"
                                  >
                                    رفض الطلب ❌
                                  </button>
                                </>
                              )}
                              {activeOrder.status === 'approved' && (
                                <button
                                  type="button"
                                  disabled={isSubmittingAction}
                                  onClick={() => handleOrderShip(activeOrder.id)}
                                  className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1 rounded transition cursor-pointer"
                                >
                                  تم شحن الطلب
                                </button>
                              )}
                              {activeOrder.status === 'shipped' && (
                                <button
                                  type="button"
                                  disabled={isSubmittingAction}
                                  onClick={() => handleOrderComplete(activeOrder.id)}
                                  className="text-[10px] bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-3 py-1 rounded transition cursor-pointer"
                                >
                                  تم التسليم واستلام المبلغ
                                </button>
                              )}

                              {activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
                                <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                                  <button
                                    type="button"
                                    disabled={isSubmittingAction}
                                    onClick={() => handleOrderNoContact(activeOrder.id)}
                                    className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded transition cursor-pointer font-sans"
                                    title="تسجيل عدم تجاوب المشتري وإلغاء المعاملة تلقائياً"
                                  >
                                    تسجيل عدم الرد 🔇
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReportReason('عدم الاستلام وشحن البضائع');
                                      setShowReportForm(true);
                                    }}
                                    className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1 rounded transition cursor-pointer"
                                  >
                                    الإبلاغ عن عدم الاستلام
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Buyer Controls */}
                          {currentUser?.id === selectedRoom.buyerId && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(activeOrder.status === 'pending' || activeOrder.status === 'approved') && (
                                <button
                                  type="button"
                                  disabled={isSubmittingAction}
                                  onClick={() => handleOrderReject(activeOrder.id)}
                                  className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1 rounded transition cursor-pointer"
                                >
                                  إلغاء الطلب ❌
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={isSubmittingAction}
                                onClick={() => handleOrderNoContact(activeOrder.id)}
                                className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded transition cursor-pointer font-sans"
                                title="تسجيل عدم استجابة المورد وإلغاء المعاملة تلقائياً"
                              >
                                تسجيل عدم الرد 🔇
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReportReason('مشكلة في استلام المنتجات أو الشحن');
                                  setShowReportForm(true);
                                }}
                                className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3 py-1 rounded transition cursor-pointer"
                              >
                                التبليغ عن مشكلة بالطلب ⚠️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Incident / Complaint Inline dialogue */}
                      {showReportForm && (
                        <div className="mt-3 p-3 bg-white border border-rose-100 rounded-lg space-y-2.5 max-w-lg mr-auto">
                          <h5 className="text-[11px] font-black text-rose-700 flex items-center gap-1">
                            <span>🚨</span>
                            <span>إرسال بلاغ رسمي فوري وشكوى لإدارة المنصة</span>
                          </h5>
                          <p className="text-[10px] text-gray-500 leading-normal">
                            سيتم إنشاء شكوى وتضمين كشف كامل لكافة تفاصيل الطلب وبيانات الطرفين والنسخة الكاملة الصادرة والواردة من محادثة الشات، لتتمكن الإدارة من مراجعة التدقيق المالي وضمان الحقوق. {currentUser?.id === selectedRoom.sellerId && <span className="font-bold text-red-650 font-sans block mt-1">(تنبيه: سيتم تقييد حساب التاجر مؤقتاً بصورة تلقائية فور تقديم الشكوى)</span>}
                          </p>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-705">سبب البلاغ:</label>
                            <input 
                              type="text" 
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="w-full text-xs p-2 bg-slate-50 border border-gray-200 rounded focus:ring-1 focus:ring-rose-200 outline-none text-right"
                              placeholder="مثال: الزبون يرفض الاستلام / التاجر لم يرسل الشحنة..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-705">تفاصيل توضيحية إضافية:</label>
                            <textarea 
                              value={reportDetails}
                              onChange={(e) => setReportDetails(e.target.value)}
                              rows={2}
                              className="w-full text-xs p-2 bg-slate-50 border border-gray-200 rounded resize-none focus:ring-1 focus:ring-rose-200 outline-none text-right"
                              placeholder="اكتب ما حدث بدقة ليمثل إفادتك أمام لجنة الإدارة والمراجعة..."
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setShowReportForm(false);
                                setReportDetails('');
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition cursor-pointer"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              disabled={isSubmittingAction || !reportReason.trim()}
                              onClick={() => handleOrderReport(activeOrder.id)}
                              className="px-3 py-1 text-[10px] font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded transition cursor-pointer"
                            >
                              {isSubmittingAction ? 'جاري الإرسال والتقييد...' : 'تقديم الشكوى وتجميد المعاملة 🛑'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Core messages log list */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
                  {messages.map((m) => {
                    const isMe = m.senderId === currentUser?.id;
                    return (
                      <div 
                        key={m.id} 
                        className={`flex flex-col max-w-[75%] ${
                          isMe ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl text-xs md:text-sm leading-normal ${
                          isMe 
                            ? 'bg-amber-500 text-white rounded-br-none text-right' 
                            : 'bg-white text-slate-800 border border-gray-100 rounded-bl-none text-right'
                        }`}>
                          <p className="font-normal">{m.text}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-1 font-mono">
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef}></div>
                </div>

                {/* Fast answers templates slider */}
                <div className="bg-white border-t border-gray-100 p-2 overflow-x-auto shrink-0 flex items-center gap-1.5 custom-scrollbar min-h-[48px]">
                  {chatTemplates.map((tp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(undefined, tp)}
                      className="px-3 py-1.5 bg-slate-50 border border-gray-200 text-[10px] md:text-xs text-slate-700 hover:bg-slate-100 rounded-full font-bold whitespace-nowrap shrink-0 transition-colors pointer-events-auto cursor-pointer"
                    >
                      {tp}
                    </button>
                  ))}
                </div>

                {/* Compose Form */}
                <form 
                  onSubmit={handleSendMessage} 
                  className="bg-white border-t border-gray-100 p-3 shrink-0 flex items-center gap-2.5"
                >
                  <button
                    type="submit"
                    className="p-2.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4 rotate-180" />
                  </button>
                  <input
                    type="text"
                    required
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    placeholder={currentLang === 'ar' ? 'اكتب تفاصيل استفسارك للمورد...' : 'Écrire un message...'}
                    className="w-full text-xs p-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-right"
                  />
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">{currentLang === 'ar' ? 'مرحباً بك في مركز المحادثات المباشرة' : 'Centre de messagerie'}</h4>
                  <p className="text-xs text-gray-400 max-w-xs leading-normal mt-1">
                    {currentLang === 'ar' 
                      ? 'الرجاء تحديد جهة اتصال من القائمة الجانبية للتواصل والاتفاق المباشر حول صفقات الجملة.' 
                      : 'Sélectionnez un contact de la barre latérale pour initier de nouvelles négociations de gros.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar rooms list - LHS / RHS */}
          <div className="w-64 md:w-80 shrink-0 border-r border-gray-150 flex flex-col overflow-hidden bg-white">
            <div className="p-4 bg-slate-50 border-b border-gray-150 text-right font-bold text-xs text-slate-500 uppercase tracking-wider select-none shrink-0">
              {currentLang === 'ar' ? 'المحادثات النشطة' : 'Discussions'}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
              {rooms.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  {currentLang === 'ar' ? 'لا توجد محادثات سابقة.' : 'Aucun fil de discussion.'}
                </div>
              ) : (
                rooms.map((room) => {
                  const targetName = currentUser?.id === room.buyerId ? room.sellerName : room.buyerName;
                  const active = selectedRoom?.id === room.id;
                  
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full text-right p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-xs ${
                        active ? 'bg-amber-500/10' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] text-gray-400 font-mono">
                            {new Date(room.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-extrabold text-slate-800 truncate">{targetName}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate font-normal leading-normal">{room.lastMessage}</p>
                      </div>
                      <div className="w-9 h-9 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                        {targetName[0]}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
