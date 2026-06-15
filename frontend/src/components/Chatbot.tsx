"use client";

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý ảo của CMC Travel. Tôi có thể giúp gì cho bạn?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    'Làm thế nào để đặt tour?',
    'Chính sách hoàn tiền như thế nào?',
    'Tour nào phù hợp cho gia đình?',
    'Có mã giảm giá nào không?',
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      let botResponse = '';

      if (inputText.toLowerCase().includes('đặt tour') || inputText.toLowerCase().includes('book')) {
        botResponse = 'Để đặt tour, bạn có thể: 1) Tìm kiếm tour mong muốn, 2) Nhấn "Đặt ngay", 3) Điền thông tin và thanh toán. Bạn có cần hướng dẫn chi tiết hơn không?';
      } else if (inputText.toLowerCase().includes('hoàn tiền') || inputText.toLowerCase().includes('refund')) {
        botResponse = 'Chúng tôi có chính sách hoàn tiền linh hoạt: Hoàn 100% nếu hủy trước 7 ngày, 50% nếu hủy trước 3 ngày. Bạn có câu hỏi gì khác không?';
      } else if (inputText.toLowerCase().includes('mã giảm giá') || inputText.toLowerCase().includes('discount')) {
        botResponse = 'Hiện tại chúng tôi có các mã giảm giá: SUMMER2026 (15%), WELCOME10 (10%), VIP20 (20%). Bạn có thể áp dụng khi thanh toán!';
      } else if (inputText.toLowerCase().includes('gia đình') || inputText.toLowerCase().includes('family')) {
        botResponse = 'Các tour phù hợp cho gia đình: Du ngoạn Vịnh Hạ Long, Thiên đường Phú Quốc, Biển xanh Đà Nẵng, Phố cổ Hội An. Tất cả đều có hoạt động cho trẻ em!';
      } else {
        botResponse = 'Cảm ơn bạn đã liên hệ! Tôi có thể giúp bạn với: đặt tour, thông tin giá, chính sách hoàn tiền, mã giảm giá. Bạn cần thông tin gì?';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
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
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-lg">CMC Travel Support</h3>
                <p className="text-xs text-white/80">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded">
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {messages.length <= 1 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Câu hỏi thường gặp:</p>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left text-sm p-2 bg-white border rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="size-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Send className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
