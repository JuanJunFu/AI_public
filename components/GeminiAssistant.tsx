import React, { useState } from 'react';
import { askGemini } from '../services/geminiService';
import { Loader2, MessageCircle, X, Send } from 'lucide-react';

export const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const answer = await askGemini(input);
      setResponse(answer);
    } catch (e) {
      setResponse("抱歉，小幫手累了，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <MessageCircle size={28} />
          <span className="font-medium text-lg hidden md:inline">問問 AI 老師</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold text-xl">AI 小幫手</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 rounded-full p-1">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto bg-gray-50 min-h-[200px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                <Loader2 className="animate-spin" size={32} />
                <p>AI 正在思考中...</p>
              </div>
            ) : response ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-800 text-lg leading-relaxed">{response}</p>
              </div>
            ) : (
                <div className="text-center text-gray-400 mt-8">
                    <p>您可以問我：</p>
                    <ul className="text-sm mt-2 space-y-2">
                        <li>「什麼是 AI？」</li>
                        <li>「詐騙電話怎麼防？」</li>
                        <li>「課程要帶什麼？」</li>
                    </ul>
                </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="輸入您的問題..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              />
              <button
                onClick={handleAsk}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white p-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};