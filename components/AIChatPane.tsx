
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, CheckCircle2, AlertCircle, Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatPaneProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  lastActionStatus?: 'processing' | 'success' | 'error';
}

const AIChatPane: React.FC<AIChatPaneProps> = ({ messages, onSendMessage, isProcessing, lastActionStatus }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r dark:border-slate-800 w-80 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-2">
        <div className="p-1.5 bg-blue-600 rounded-lg">
          <Sparkles size={16} className="text-white" />
        </div>
        <h2 className="font-bold text-gray-700 dark:text-gray-200 text-sm">AI 排课助手</h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-50">
            <Bot size={48} className="text-blue-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              我是你的智能排课助手。<br/>你可以说：“帮我把XXX班明天的课往后推1小时”，或者“为YYY班排一周的课”。
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none border dark:border-slate-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Action Status (AI Studio Style) */}
      {(isProcessing || lastActionStatus) && (
        <div className="px-4 pb-2">
          <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
            lastActionStatus === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-lg'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${lastActionStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                {lastActionStatus === 'success' ? '排课已完成' : 'AI 智能排课中...'}
              </span>
            </div>
            {lastActionStatus === 'success' ? (
              <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
            ) : (
              <Loader2 size={16} className="text-blue-600 animate-ai-spin" />
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="relative flex items-center gap-2">
          <textarea
            rows={1}
            className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white resize-none pr-10"
            placeholder="输入指令..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPane;
