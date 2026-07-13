"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Send, User, MessageCircle, Clock, CheckCircle } from 'lucide-react';

interface ChatSession {
  session_id: string;
  customer_name: string;
  customer_email: string;
  status: 'waiting' | 'active' | 'closed';
  updated_at: string;
}

interface ChatMessage {
  message_id: string;
  session_id: string;
  sender_type: 'customer' | 'employee';
  content: string;
  created_at: string;
}

export default function LiveChatAdmin() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load danh sách session ban đầu và subscribe
  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (!error && data) {
        setSessions(data as ChatSession[]);
      }
    };
    
    fetchSessions();

    const channel = supabase
      .channel('public:chat_sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_sessions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions((prev) => [payload.new as ChatSession, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSessions((prev) => 
              prev.map(s => s.session_id === payload.new.session_id ? payload.new as ChatSession : s)
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load messages khi chọn một session
  useEffect(() => {
    if (!selectedSession) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSession.session_id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as ChatMessage[]);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_${selectedSession.session_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${selectedSession.session_id}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.find(m => m.message_id === newMsg.message_id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession?.session_id]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedSession) return;

    const tempMessage: ChatMessage = {
      message_id: crypto.randomUUID(),
      session_id: selectedSession.session_id,
      sender_type: 'employee',
      content: inputText,
      created_at: new Date().toISOString()
    };

    // UI update
    setMessages(prev => [...prev, tempMessage]);
    setInputText('');

    // DB update
    await supabase.from('chat_messages').insert({
      message_id: tempMessage.message_id,
      session_id: tempMessage.session_id,
      sender_type: tempMessage.sender_type,
      content: tempMessage.content
    });

    // Update session
    await supabase.from('chat_sessions').update({ 
      updated_at: new Date().toISOString() 
    }).eq('session_id', tempMessage.session_id);
  };

  const closeSession = async () => {
    if (!selectedSession) return;
    await supabase.from('chat_sessions').update({ status: 'closed' }).eq('session_id', selectedSession.session_id);
    setSelectedSession({ ...selectedSession, status: 'closed' });
  };

  const filteredSessions = sessions.filter(s => 
    s.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-80px)] flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
      {/* Sidebar: Danh sách phiên chat */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Danh sách Chat</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.map((session) => (
            <div 
              key={session.session_id}
              onClick={() => setSelectedSession(session)}
              className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-blue-50/50 transition-colors ${selectedSession?.session_id === session.session_id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 text-sm">{session.customer_name}</h4>
                <span className="text-xs text-slate-500">
                  {new Date(session.updated_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2 truncate">{session.customer_email}</p>
              <div className="flex items-center gap-1.5">
                {session.status === 'waiting' && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full"><Clock className="size-3"/> Đang chờ</span>}
                {session.status === 'active' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full"><MessageCircle className="size-3"/> Đang chat</span>}
                {session.status === 'closed' && <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full"><CheckCircle className="size-3"/> Đã đóng</span>}
              </div>
            </div>
          ))}
          {filteredSessions.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              Không tìm thấy phiên chat nào.
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Khung chat */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                  {selectedSession.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{selectedSession.customer_name}</h3>
                  <p className="text-xs text-slate-500">{selectedSession.customer_email}</p>
                </div>
              </div>
              {selectedSession.status !== 'closed' && (
                <button 
                  onClick={closeSession}
                  className="px-4 py-1.5 bg-slate-100 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Kết thúc chat
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div key={msg.message_id} className={`flex ${msg.sender_type === 'employee' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex items-end gap-2 max-w-[70%]">
                    {msg.sender_type === 'customer' && (
                      <div className="size-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                        <User className="size-4 text-slate-500" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl ${msg.sender_type === 'employee' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.sender_type === 'employee' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={selectedSession.status === 'closed'}
                  placeholder={selectedSession.status === 'closed' ? "Phiên chat đã kết thúc" : "Nhập tin nhắn phản hồi..."}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || selectedSession.status === 'closed'}
                  className="size-11 shrink-0 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                  <Send className="size-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageCircle className="size-16 mb-4 opacity-20" />
            <p>Chọn một phiên chat để bắt đầu hỗ trợ</p>
          </div>
        )}
      </div>
    </div>
  );
}
