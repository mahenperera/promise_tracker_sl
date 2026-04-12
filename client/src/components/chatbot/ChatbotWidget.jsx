import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../../api/chat-api.js';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your AI assistant for Promise Tracker SL. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');

        const newMessages = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Gemini history must ALWAYS start with a 'user' role!
            // Our local state starts with a 'model' greeting, so we skip the first item.
            const history = newMessages.slice(1, -1).map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            const { data } = await sendChatMessage(userMsg, history);
            setMessages([...newMessages, { role: 'model', text: data.response }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'model', text: "Sorry, I am facing connectivity issues right now... (" + error.message + ")" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl shadow-blue-900/20 border border-slate-200 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full p-4 flex justify-between items-center text-white shadow-md z-10">
                        <div className="font-bold flex items-center gap-2">
                            <span className="text-2xl drop-shadow-sm">🤖</span>
                            <span className="tracking-wide">AI Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white font-bold text-2xl transition-colors outline-none pb-1">
                            &times;
                        </button>
                    </div>

                    {/* Chat Window */}
                    <div className="h-80 w-full overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-2.5 text-sm max-w-[85%] rounded-2xl leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-3.5 text-sm rounded-2xl bg-white border border-slate-200 text-slate-400 rounded-tl-none shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Block */}
                    <form onSubmit={handleSend} className="w-full p-3 bg-white border-t border-slate-100 flex gap-2 relative z-10">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-slate-100/80 text-sm text-slate-800 rounded-full pl-5 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all shadow-inner"
                        />
                        <button type="submit" disabled={!input.trim() || loading} className="bg-blue-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-md hover:bg-blue-500 hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all">
                            Send
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex justify-center items-center shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-105 transition-all outline-none"
                >
                    <span className="text-3xl drop-shadow-md">🤖</span>
                </button>
            )}
        </div>
    );
}
