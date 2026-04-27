import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../../api/chat-api.js";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! I am your AI assistant for Promise Tracker SL. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(1, -1).map((msg) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

      const { data } = await sendChatMessage(userMsg, history);
      setMessages([...newMessages, { role: "model", text: data.response }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "model",
          text:
            "Sorry, I am facing connectivity issues right now... (" +
            error.message +
            ")",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 font-sans sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="mb-3 flex w-[calc(100vw-1.5rem)] max-w-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/20 sm:mb-4">
          <div className="z-10 flex w-full items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-md">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-2xl drop-shadow-sm">🤖</span>
              <span className="tracking-wide">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="pb-1 text-2xl font-bold text-blue-100 transition-colors hover:text-white outline-none"
            >
              &times;
            </button>
          </div>

          <div className="flex h-72 w-full flex-col gap-4 overflow-y-auto bg-slate-50 p-4 sm:h-80">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-none bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "rounded-tl-none border border-slate-200 bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-400 shadow-sm">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"></div>
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="relative z-10 flex w-full gap-2 border-t border-slate-100 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 rounded-full bg-slate-100/80 py-2.5 pl-4 pr-4 text-sm text-slate-800 shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:pl-5"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-500 hover:shadow-lg disabled:opacity-50 disabled:shadow-none sm:px-5"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-xl outline-none sm:h-16 sm:w-16"
        >
          <span className="text-3xl drop-shadow-md">🤖</span>
        </button>
      )}
    </div>
  );
}
