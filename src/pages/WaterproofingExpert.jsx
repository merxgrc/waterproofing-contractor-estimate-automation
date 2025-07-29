// src/pages/WaterproofingExpert.jsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Send, HelpCircle, Loader2 } from "lucide-react";
import { InvokeLLM } from "@/utils/llm";
import ChatMessage from "../components/chatbot/ChatMessage";

export default function WaterproofingExpert() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm AquaBot, your AI waterproofing expert. Ask me anything about materials, techniques, or project challenges."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const prompt = `
        You are AquaBot, a world-class expert in commercial waterproofing. Your knowledge covers materials (like liquid membranes, sheet membranes, hot-applied rubberized asphalt, bentonite, crystalline systems), application techniques, industry standards (ASTM, ACI), problem diagnosis, and safety protocols.
        
        A commercial contractor has asked you the following question. Provide a clear, professional, and helpful response. If the question is outside of waterproofing, politely state that it's outside your area of expertise.
        
        Question: "${inputValue}"
      `;

      const botResponseText = await InvokeLLM({ prompt });
      const botMessage = { sender: 'bot', text: botResponseText };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error invoking LLM:", error);
      const errorMessage = { sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleExampleQuestion = (question) => {
    setInputValue(question);
  };

  const exampleQuestions = [
    "What are the pros and cons of sheet membrane vs. liquid-applied membrane?",
    "Describe the ideal surface preparation for a hot-applied rubberized asphalt system.",
    "How do I diagnose the source of a leak in a below-grade foundation wall?",
    "What are the safety requirements for working in a confined space like an elevator pit?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[85vh] flex flex-col shadow-2xl border-slate-200">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
              <Brain className="w-8 h-8 text-blue-600" />
              Waterproofing Expert
            </CardTitle>
          </CardHeader>
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
              <ChatMessage message={{ sender: 'bot', text: 'Thinking...' }} isLoading={true} />
            )}
          </div>

          <div className="border-t p-6 bg-white">
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Need ideas? Try one of these:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.slice(0, 2).map((q, i) => (
                  <Button key={i} variant="outline" size="sm" onClick={() => handleExampleQuestion(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a waterproofing question..."
                className="flex-1 text-base p-4"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}