import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Paperclip, Bell, ShieldAlert, Sparkles, AlertTriangle, Check, CheckCheck } from 'lucide-react';
import { User, ContactThread } from '../types';

interface CustomerSupportWidgetProps {
  currentUser: User | null;
  currentLang: 'ar' | 'fr' | 'en';
}

export default function CustomerSupportWidget({ currentUser, currentLang }: CustomerSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [threads, setThreads] = useState<ContactThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lastUnreadCount, setLastUnreadCount] = useState(0);

  const prevCountRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRtl = currentLang === 'ar';

  // Poll for user contact threads
  useEffect(() => {
    if (!currentUser) {
      setThreads([]);
      return;
    }

    const fetchMyThreads = async () => {
      try {
        const res = await fetch(`/api/contact/my-threads?userId=${currentUser.id}`);
        if (res.ok) {
          const list: ContactThread[] = await res.json();
          // Sort by updatedAt desc
          const sorted = list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setThreads(sorted);

          // Calculate unread count
          const unreadCount = sorted.filter(t => t.userStatus === 'unread').length;

          // Trigger slide toast to alert on new incoming message!
          if (unreadCount > prevCountRef.current && prevCountRef.current !== undefined) {
            // Find the newly unread thread to show details
            const newUnreadThread = sorted.find(t => t.userStatus === 'unread' && !threads.some(old => old.id === t.id && old.userStatus === 'unread'));
            if (newUnreadThread) {
              setToastMessage(newUnreadThread.title || 'رسالة جديدة من الإدارة');
              setShowToast(true);
              // Auto-dismiss toast after 6 seconds
              setTimeout(() => {
                setShowToast(false);
              }, 6000);

              // Play a subtle notification beep if audio is allowed
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
                osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.4);
              } catch (_) {}
            }
          }
          prevCountRef.current = unreadCount;
          setLastUnreadCount(unreadCount);
        }
      } catch (err) {
        console.error('Error fetching support threads', err);
      }
    };

    fetchMyThreads();
    const interval = setInterval(fetchMyThreads, 3500);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Scroll to messages bottom when showing active thread or messages update
  useEffect(() => {
    if (activeThreadId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeThreadId, threads]);

  if (!currentUser) return null;

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Handle Mark as Read
  const handleOpenThread = async (threadId: string) => {
    setActiveThreadId(threadId);
    try {
      await fetch('/api/contact/user-mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, threadId })
      });
      // Set read status locally to make UI interactive instantly
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, userStatus: 'read' } : t));
    } catch (e) {
      console.error(e);
    }
  };

  // Convert File uploads to base64 payloader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          const attachmentPayload = `filename:${file.name}||data:${base64Url}`;
          setReplyAttachments(prev => [...prev, attachmentPayload]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit reply message
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && replyAttachments.length === 0) return;
    if (!activeThreadId) return;

    try {
      setIsSending(true);
      const res = await fetch('/api/contact/user-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          threadId: activeThreadId,
          text: replyText,
          attachments: replyAttachments
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update thread locally
        setThreads(prev => prev.map(t => t.id === activeThreadId ? data.thread : t));
        setReplyText('');
        setReplyAttachments([]);
      } else {
        alert(isRtl ? 'فشل إرسال الرد، يرجى المحاولة لاحقاً.' : 'Failed to send reply, please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الاتصال بالخادم.');
    } finally {
      setIsSending(false);
    }
  };

  // Unread Support count overall
  const unreadCountCount = threads.filter(t => t.userStatus === 'unread').length;

  return (
    <div className="fixed bottom-5 left-5 z-50 text-right font-sans" dir="rtl">
      {/* Dynamic Toast Alert Pop-Out */}
      {showToast && (
        <div 
          onClick={() => {
            setIsOpen(true);
            const urgentThread = threads.find(t => t.userStatus === 'unread');
            if (urgentThread) handleOpenThread(urgentThread.id);
            setShowToast(false);
          }}
          className="mb-3 ml-3 bg-slate-900 border border-amber-500 rounded-xl p-4 shadow-2xl flex items-center gap-3 max-w-sm cursor-pointer animate-bounce text-white hover:bg-slate-900 transition-all text-xs"
        >
          <div className="p-2 bg-amber-500 text-slate-950 rounded-lg shrink-0">
            <Bell className="w-4 h-4 animate-swing" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-amber-400">إشعار جديد من الإدارة! 📬</p>
            <p className="font-medium text-slate-200 mt-0.5 truncate">{toastMessage}</p>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setShowToast(false); }} 
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Widget Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowToast(false);
        }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all border-2 duration-300 ${
          isOpen 
            ? 'bg-slate-900 border-slate-705 text-white scale-95' 
            : 'bg-amber-500 border-amber-400 text-slate-950 hover:bg-amber-600 active:scale-95'
        }`}
        id="customer-support-widget-btn"
        title="مراسلات الإدارة والرد الفوري"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            {unreadCountCount > 0 && (
              <span className="absolute -top-3.5 -left-3.5 bg-red-650 text-white border border-white text-[10px] font-sans font-black w-6 h-6 rounded-full flex items-center justify-center animate-pulse shadow">
                {unreadCountCount}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Interactive Support & Inbox Drawer Context Panel */}
      {isOpen && (
        <div 
          className="absolute bottom-16 left-0 bg-white border border-gray-200 rounded-2xl shadow-3xl w-80 max-w-[calc(100vw-30px)] h-[460px] flex flex-col overflow-hidden text-right text-slate-800 animate-slide-up"
          id="customer-support-floating-card"
        >
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-850 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-800 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase">
                Sou9 Support
              </span>
            </div>
            <h4 className="text-xs font-black flex items-center gap-1.5">
              <span>💬 مركز المحادثات المباشرة</span>
            </h4>
          </div>

          {/* MAIN VIEWS SWITCHER */}
          {!activeThreadId ? (
            /* VIEW 1: THREADS LIST */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              <div className="p-3 bg-white border-b border-gray-100 text-[11px] text-gray-500 text-center font-bold">
                تظهر هنا جميع الإخطارات الإدارية، العروض والردود على استفساراتك.
              </div>

              {threads.length === 0 ? (
                /* Empty placeholder */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                  <span className="text-3xl mb-1.5">✉️</span>
                  <p className="text-xs font-bold text-slate-700">لا توجد محادثات نشطة حالياً</p>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[180px]">عند مراسلتك من طرف الإدارة ستظهر المحادثات التفصيلية فورياً هنا.</p>
                </div>
              ) : (
                /* Thread list view */
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
                  {threads.map(thread => {
                    const isUnread = thread.userStatus === 'unread';
                    const hasAttachments = thread.messages.some(m => m.attachments && m.attachments.length > 0);

                    return (
                      <div
                        key={thread.id}
                        onClick={() => handleOpenThread(thread.id)}
                        className={`p-3.5 flex flex-col gap-1 cursor-pointer transition-colors ${
                          isUnread ? 'bg-amber-50/50 hover:bg-amber-50 font-extrabold' : 'bg-white hover:bg-slate-100/50'
                        }`}
                      >
                        {/* Title and date row */}
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] text-gray-400 shrink-0 font-mono">
                            {new Date(thread.updatedAt).toLocaleDateString('ar-MA', { month: 'numeric', day: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {isUnread && (
                              <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse" />
                            )}
                            <span className="font-extrabold text-xs text-slate-800 truncate text-right">
                              {thread.title}
                            </span>
                          </div>
                        </div>

                        {/* Snippet message body */}
                        <p className="text-[10.5px] text-gray-400 truncate text-right leading-relaxed pl-4">
                          {thread.snippet}
                        </p>

                        {/* Thread Category Badges footer */}
                        <div className="flex items-center justify-between mt-1 pt-0.5 border-t border-gray-100 text-[9px]">
                          <div className="flex items-center gap-1">
                            {hasAttachments && <span title="مرفقات">📎</span>}
                            {thread.status === 'read' ? (
                              <span className="text-emerald-600 flex items-center gap-0.5 font-bold">
                                <span>تم الرد</span>
                                <CheckCheck className="w-3 h-3 inline" />
                              </span>
                            ) : (
                              <span className="text-amber-600 font-bold">قيد المراجعة</span>
                            )}
                          </div>

                          {/* Categories indicators */}
                          {thread.type && thread.type !== 'normal' ? (
                            <span className={`px-1.5 py-0.5 rounded font-black ${
                              thread.type === 'admin' 
                                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                : thread.type === 'important' 
                                  ? 'bg-rose-100 text-rose-800 border border-rose-250 animate-pulse' 
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-250'
                            }`}>
                              {thread.type === 'admin' ? '🏛️ رسمي' : thread.type === 'important' ? '⚠️ هام' : '🎁 ترويجي'}
                            </span>
                          ) : (
                            <span className="text-gray-400">💬 دعم فني</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* VIEW 2: ACTIVE THREAD CHAT HISTORY */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
              {/* Back Toolbar header */}
              <div className="p-2 bg-slate-100 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {/* Category Pill Tag */}
                  {activeThread?.type && activeThread.type !== 'normal' && (
                    <span className={`px-2 py-0.5 text-[9px] rounded font-black ${
                      activeThread.type === 'admin' 
                        ? 'bg-purple-150 text-purple-850 font-bold' 
                        : activeThread.type === 'important' 
                          ? 'bg-rose-100 text-rose-700 animate-pulse font-bold' 
                          : 'bg-amber-100 text-amber-800 font-bold'
                    }`}>
                      {activeThread.type === 'admin' ? 'إدارية' : activeThread.type === 'important' ? 'مهم ومستعجل' : 'عرض خاص'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveThreadId(null)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-gray-300 font-bold rounded-lg hover:bg-gray-100 text-slate-700 cursor-pointer flex items-center gap-1"
                >
                  <span>رجوع للقائمة</span>
                  <span>←</span>
                </button>
              </div>

              {/* Chat Thread Messages Box */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
                {activeThread?.messages.map((message) => {
                  const isAdmin = message.sender === 'admin';
                  return (
                    <div 
                      key={message.id} 
                      className={`flex flex-col max-w-[85%] ${isAdmin ? 'mr-0 ml-auto' : 'ml-0 mr-auto align-left'}`}
                    >
                      {/* Message bubble */}
                      <div 
                        className={`rounded-2xl p-3 text-xs leading-relaxed ${
                          isAdmin 
                            ? 'bg-slate-900 text-white rounded-tr-none text-right' 
                            : 'bg-amber-500 text-slate-950 rounded-tl-none text-right font-medium'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.text}</p>

                        {/* Render list attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                            <span className="text-[9px] text-slate-300 block font-bold">📎 المرفقات والمستندات:</span>
                            {message.attachments.map((att, aIdx) => {
                              const filename = att.split('||data:')[0].replace('filename:', '');
                              const base64 = att.split('||data:')[1];
                              return (
                                <a 
                                  key={aIdx} 
                                  href={base64} 
                                  download={filename}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-amber-300 hover:underline block truncate font-sans font-bold"
                                >
                                  📄 {filename}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Display author and exact times */}
                      <div className="flex items-center justify-between text-[9px] text-gray-400 mt-1 px-1">
                        <span>⏱️ {new Date(message.createdAt).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[8px] truncate max-w-28 font-semibold">
                          {isAdmin ? `👑 رد الإدارة (${message.senderName})` : '👤 أنا'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Reply Form Panel */}
              <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-gray-200 space-y-2.5 shrink-0">
                {/* Upload attachment row progress bar */}
                {replyAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-1 bg-slate-50 p-2 rounded-lg border text-[10px] font-sans">
                    {replyAttachments.map((att, index) => {
                      const filename = att.split('||data:')[0].replace('filename:', '');
                      return (
                        <div key={index} className="bg-white px-2 py-0.5 rounded border flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 font-extrabold"
                          >
                            ×
                          </button>
                          <span className="truncate max-w-[120px] text-gray-600 font-bold">{filename}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Input text send block */}
                <div className="flex items-center gap-2">
                  {/* File attach button trigger */}
                  <label className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border border-gray-200 cursor-pointer inline-flex items-center justify-center text-slate-800 transition-colors shrink-0">
                    <Paperclip className="w-4 h-4" />
                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Input field */}
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب ردك هنا على رسالة الإدارة..."
                    className="flex-grow bg-slate-50 border border-gray-250 focus:border-amber-500 transition-colors rounded-xl px-3 py-2 text-xs focus:outline-none text-right"
                    disabled={isSending}
                  />

                  {/* Submit trigger button */}
                  <button
                    type="submit"
                    disabled={isSending || (!replyText.trim() && replyAttachments.length === 0)}
                    className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-gray-400 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl cursor-pointer shadow transition-all shrink-0"
                  >
                    <Send className="w-4.5 h-4.5 rotate-180" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
