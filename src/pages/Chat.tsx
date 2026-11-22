import React, { useEffect, useState, useRef } from 'react';
import { TopBar } from '../components/TopBar';
import { chatService, ChatMessage, ConversationItem } from '../services/chatService';
import { authService } from '../services/authService';

export const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const session = authService.getSession();
  const currentHospitalName = session?.institution?.name 
    ? session.institution.name.replace(/\s*\[SYNTHETIC\]/gi, '')
    : (session?.name || 'My Hospital');

  // Initialize conversations on mount or account switch
  useEffect(() => {
    let isMounted = true;
    chatService.connect().then(() => {
      chatService.getConversations().then((convs) => {
        if (!isMounted) return;
        setConversations(convs);
        if (convs.length > 0 && !activeChannelId) {
          setActiveChannelId(convs[0].id);
        }
      });
    });

    const unsubscribe = chatService.onMessage((incomingMsg) => {
      if (incomingMsg.channelId === activeChannelId) {
        setMessages((prev) => {
          // Strict deduplication check: avoid appending if message with same ID already exists
          if (prev.some((m) => m.id === incomingMsg.id)) {
            return prev;
          }
          return [...prev, incomingMsg];
        });
      }
      // Also update conversations list to refresh preview and timestamp
      chatService.getConversations().then((convs) => {
        if (isMounted) setConversations(convs);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeChannelId, session?.email]);

  // Load message history when active channel changes
  useEffect(() => {
    if (!activeChannelId) return;
    setLoading(true);
    chatService.getMessages(activeChannelId).then((msgs) => {
      setMessages(msgs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeChannelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChannelId) return;

    const trimmed = inputText.trim();
    setInputText('');

    try {
      const userMsg = await chatService.sendMessage(activeChannelId, trimmed);
      setMessages((prev) => {
        if (prev.some((m) => m.id === userMsg.id)) return prev;
        return [...prev, userMsg];
      });

      chatService.getConversations().then((convs) => {
        setConversations(convs);
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeChannelId);

  return (
    <div className="w-full flex flex-col gap-4 relative">
      {/* Top Header Row */}
      <div className="flex flex-col gap-1 pb-2">
        <TopBar
          title="Hospital Coordination Chat"
          titleBadge={
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full ml-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Secure Hospital Network
            </span>
          }
          subtitle={`Logged in as ${session?.name || 'Authorized Officer'} (${currentHospitalName})`}
        />
        <div className="flex items-center gap-1.5 text-xs text-text-muted -mt-3 pl-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-600">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-text-muted">Direct inter-hospital communication protected by TLS transport and role-based authentication</span>
        </div>
      </div>

      {/* Two Panes in One White Rounded Container */}
      <div className="w-full h-[620px] bg-card rounded-card border border-border shadow-soft flex overflow-hidden">
        {/* LEFT PANE (~320px): Hospital Conversations List */}
        <div className="w-[320px] border-r border-border flex flex-col bg-white shrink-0">
          <div className="p-3.5 border-b border-border bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs font-bold text-navy uppercase tracking-wider">Hospitals & Blood Banks</span>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>

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
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-white font-bold' : 'bg-[#EAF2FD] text-[#1255B5] font-bold'
                  }`}>
                    {ch.avatarLetter || ch.name.charAt(0) || 'H'}
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
          {/* Active Conversation Header */}
          <div className="p-4 border-b border-border bg-slate-50/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                {activeConversation?.avatarLetter || 'H'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy leading-tight">
                  {activeConversation?.name || 'Select a hospital'}
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Hospital
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-text-muted font-medium block">Channel</span>
              <span className="text-[11px] font-mono text-navy font-semibold">{activeChannelId}</span>
            </div>
          </div>

          {/* Scrollable Messages Area */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            {loading && (
              <div className="text-center py-4 text-xs text-text-muted">Loading messages...</div>
            )}

            {!loading && messages.length === 0 && (
              <div className="text-center py-16 text-text-muted space-y-2">
                <p className="text-sm font-semibold text-navy">No messages yet with {activeConversation?.name}</p>
                <p className="text-xs">Send a direct message below to coordinate blood inventory, emergency units, or transfers.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${
                  msg.isSelf ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Incoming Hospital Avatar on left */}
                {!msg.isSelf && (
                  <div className="w-8 h-8 rounded-full bg-[#EAF2FD] text-[#1255B5] flex items-center justify-center text-xs font-bold shrink-0 mb-5">
                    {msg.senderName ? msg.senderName.charAt(0) : 'H'}
                  </div>
                )}

                <div className="flex flex-col">
                  {/* Sender Name above incoming bubble */}
                  {!msg.isSelf && (
                    <span className="text-[11px] font-medium text-text-muted mb-1 pl-1">
                      {msg.senderName}
                    </span>
                  )}

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-5 py-3 shadow-sm text-sm max-w-sm sm:max-w-md ${
                      msg.isSelf
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-[#F0F5FD] text-navy rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Timestamp below bubble */}
                  <span
                    className={`text-[11px] text-text-muted mt-1 px-1 flex items-center gap-1 ${
                      msg.isSelf ? 'justify-end text-right' : 'justify-start text-left'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.isSelf && (
                      <span className="text-emerald-600 font-semibold text-[10px]">✓ Sent</span>
                    )}
                  </span>
                </div>

                {/* Outgoing Round User Avatar on right */}
                {msg.isSelf && (
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-semibold shrink-0 mb-5">
                    {currentHospitalName.charAt(0) || 'H'}
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
                placeholder={`Type a message to ${activeConversation?.name || 'hospital'}...`}
                className="flex-1 h-12 px-5 rounded-pill bg-[#F5F8FD] border border-border text-sm text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-12 h-12 rounded-btn bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-soft transition-all shrink-0 cursor-pointer"
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
