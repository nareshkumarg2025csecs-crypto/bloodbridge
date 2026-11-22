import React, { useEffect, useState, useRef } from 'react';
import { TopBar } from '../components/TopBar';
import { chatService, ChatMessage, ConversationItem } from '../services/chatService';

export const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('ch-city');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatService.connect().then(() => {
      chatService.getConversations().then((convs) => {
        setConversations(convs);
      });
    });

    const unsubscribe = chatService.onMessage((incomingMsg) => {
      if (incomingMsg.channelId === activeChannelId) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
      // Also update conversations list to refresh preview
      chatService.getConversations().then((convs) => {
        setConversations(convs);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeChannelId]);

  useEffect(() => {
    chatService.getMessages(activeChannelId).then((msgs) => {
      setMessages(msgs);
    });
  }, [activeChannelId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = await chatService.sendMessage(activeChannelId, inputText.trim());
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    chatService.getConversations().then((convs) => {
      setConversations(convs);
    });
  };

  return (
    <div className="w-full flex flex-col gap-4 relative">
      {/* Top Header Row with E2E encrypted lock badge */}
      <div className="flex flex-col gap-1 pb-2">
        <TopBar
          title="Live Chat"
          titleBadge={
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full ml-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Online
            </span>
          }
          subtitle=""
        />
        <div className="flex items-center gap-1.5 text-xs text-text-muted -mt-3 pl-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-text-muted">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>End-to-end encrypted inter-hospital channel</span>
        </div>
      </div>

      {/* Two Panes in One White Rounded Container */}
      <div className="w-full h-[620px] bg-card rounded-card border border-border shadow-soft flex overflow-hidden">
        {/* LEFT PANE (~300px): Conversation List */}
        <div className="w-[300px] border-r border-border flex flex-col bg-white shrink-0">
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {conversations.map((ch) => {
              const isSelected = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full p-4 flex items-start gap-3.5 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#F0F6FF]' : 'hover:bg-background/80'
                  }`}
                >
                  {/* Building Icon Tile */}
                  <div className="w-11 h-11 rounded-full bg-[#EAF2FD] flex items-center justify-center shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1255B5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M2 10h20" />
                      <path d="M12 2 2 7h20z" />
                      <path d="M6 10v8" />
                      <path d="M10 10v8" />
                      <path d="M14 10v8" />
                      <path d="M18 10v8" />
                      <path d="M2 18h20" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-navy truncate">
                        {ch.name}
                      </h4>
                      <span className="text-[11px] text-text-muted ml-1 shrink-0">{ch.time}</span>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-1">
                      {ch.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Message Area */}
        <div className="flex-1 flex flex-col bg-white justify-between min-w-0">
          {/* Scrollable Messages Area */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${
                  msg.isSelf ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Incoming Hospital Avatar on left */}
                {!msg.isSelf && (
                  <div className="w-8 h-8 rounded-full bg-[#EAF2FD] flex items-center justify-center shrink-0 mb-5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1255B5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M2 10h20" />
                      <path d="M12 2 2 7h20z" />
                      <path d="M6 10v8" />
                      <path d="M10 10v8" />
                      <path d="M14 10v8" />
                      <path d="M18 10v8" />
                      <path d="M2 18h20" />
                    </svg>
                  </div>
                )}

                <div className="flex flex-col">
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-5 py-3 shadow-sm text-sm max-w-sm sm:max-w-md ${
                      msg.isSelf
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-[#F0F5FD] text-navy rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>

                  {/* Timestamp below bubble */}
                  <span
                    className={`text-[11px] text-text-muted mt-1 px-1 ${
                      msg.isSelf ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Outgoing Round User Avatar on right */}
                {msg.isSelf && (
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-semibold shrink-0 mb-5">
                    H
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Input Row: Rounded input + Square blue send button with paper plane */}
          <div className="p-4 bg-white border-t border-border">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-12 px-5 rounded-pill bg-[#F5F8FD] border border-border text-sm text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="w-12 h-12 rounded-btn bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-soft transition-all shrink-0 cursor-pointer"
                aria-label="Send message"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 transform rotate-45 -translate-y-0.5"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
