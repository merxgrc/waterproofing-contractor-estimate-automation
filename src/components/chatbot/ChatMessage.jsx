// src/components/chatbot/ChatMessage.jsx
import React from 'react';
import { Droplets, User, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message, isLoading }) {
  const { sender, text } = message;
  const isBot = sender === 'bot';

  return (
    <div className={`flex items-start gap-3 ${isBot ? '' : 'justify-end'}`}>
      {isBot && (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-6 h-6 text-blue-600" />
        </div>
      )}
      
      <div className={`max-w-xl p-4 rounded-2xl ${
        isBot 
          ? 'bg-slate-100 rounded-tl-none' 
          : 'bg-blue-600 text-white rounded-br-none'
      }`}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{text}</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({...props}) => <ul className="list-disc list-inside space-y-1" {...props} />,
                ol: ({...props}) => <ol className="list-decimal list-inside space-y-1" {...props} />,
                strong: ({...props}) => <strong className="font-bold" {...props} />,
                h1: ({...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                h2: ({...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                h3: ({...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isBot && (
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-orange-600" />
        </div>
      )}
    </div>
  );
}