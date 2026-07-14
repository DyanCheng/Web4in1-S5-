"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Message {
  message_id: string;
  session_id: string;
  sender_type: 'customer' | 'employee';
  sender_id?: string;
  content: string;
  created_at: string;
}

export default function Chatbot() {
  const pathname = usePathname();
  
  if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/admin') || pathname.includes('/employee')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Form đăng ký thông tin
  const [isRegistering, setIsRegistering] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Khởi tạo session từ localStorage
  useEffect(() => {
    let channel: any = null;
    const savedSession = localStorage.getItem('chat_session_id');
    if (savedSession) {
      setSessionId(savedSession);
      setIsRegistering(false);
      loadMessages(savedSession);
      channel = subscribeToMessages(savedSession);
    }
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadMessages = async (sid: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sid)
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = (sid: string) => {
    const channel = supabase
      .channel(`chat_${sid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sid}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Tránh duplicate nếu tự gửi
            if (prev.find((m) => m.message_id === newMessage.message_id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return channel;
  };

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) return;

    // Tạo session mới
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        status: 'waiting'
      })
      .select('session_id')
      .single();

    if (!error && data) {
      const sid = data.session_id;
      setSessionId(sid);
      localStorage.setItem('chat_session_id', sid);
      setIsRegistering(false);
      
      // Gửi tin nhắn chào mừng tự động từ hệ thống
      const welcomeMsg = {
        session_id: sid,
        sender_type: 'employee',
        content: `Chào ${customerName}, bạn đang quan tâm đến địa điểm du lịch nào?`
      };
      
      await supabase.from('chat_messages').insert(welcomeMsg);
      
      loadMessages(sid);
      subscribeToMessages(sid);
    } else {
      console.error("Error creating session", error);
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || !sessionId) return;
    
    const tempMessage: Message = {
      message_id: crypto.randomUUID(),
      session_id: sessionId,
      sender_type: 'customer',
      content: textToSend,
      created_at: new Date().toISOString()
    };

    // Hiển thị trước trên UI
    setMessages((prev) => [...prev, tempMessage]);
    if (!overrideText) {
      setInputText('');
    }

    // Gửi lên DB
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        message_id: tempMessage.message_id,
        session_id: sessionId,
        sender_type: 'customer',
        content: tempMessage.content
      });
      
    if (error) {
      console.error("Lỗi gửi tin nhắn", error);
    } else {
      // Cập nhật trạng thái session sang active nếu đang waiting
      await supabase
        .from('chat_sessions')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 size-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center group"
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <>
            <MessageCircle className="size-6" />
            <span className="absolute -top-1 -right-1 size-3 bg-green-400 rounded-full animate-pulse"></span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Hỗ trợ trực tuyến</h3>
                <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
              <X className="size-5" />
            </button>
          </div>

          {isRegistering ? (
            <div className="flex-1 p-6 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="size-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="size-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Bắt đầu trò chuyện</h4>
                <p className="text-sm text-slate-500 mt-2">Vui lòng nhập thông tin để chúng tôi có thể hỗ trợ bạn tốt nhất.</p>
              </div>
              
              <form onSubmit={startChat} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email hoặc Số điện thoại</label>
                  <input
                    type="text"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                    placeholder="Để chúng tôi liên hệ khi cần"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-2"
                >
                  Bắt đầu Chat
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((message) => (
                  <div key={message.message_id} className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        message.sender_type === 'customer'
                          ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                          : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-[10px] mt-1.5 ${message.sender_type === 'customer' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {new Date(message.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies (Gợi ý) */}
              {!messages.some(m => m.sender_type === 'customer') && messages.length > 0 && (
                <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-wrap gap-2">
                  <p className="w-full text-xs text-slate-500 mb-1">Gợi ý câu hỏi:</p>
                  {["Tour trọn gói", "Tour khuyến mãi", "Tư vấn tour HOT", "Gặp nhân viên hỗ trợ"].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="size-10 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
