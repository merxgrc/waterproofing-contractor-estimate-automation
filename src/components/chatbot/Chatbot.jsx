import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import { fetchOpenAIChat } from './api';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you with your project today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { sender: 'user', text: input }]);
    setLoading(true);
    setError('');
    try {
      const chatMessages = [
        ...messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text })),
        { role: 'user', content: input }
      ];
      const res = await fetchOpenAIChat(chatMessages);
      const botText = res.choices?.[0]?.message?.content || 'Sorry, I could not understand.';
      setMessages(msgs => [...msgs, { sender: 'bot', text: botText }]);
    } catch (err) {
      setError('Error contacting OpenAI.');
    }
    setLoading(false);
    setInput('');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} isLoading={loading && idx === messages.length - 1 && msg.sender === 'user'} />
        ))}
        {error && <div className="text-red-600">{error}</div>}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
} 