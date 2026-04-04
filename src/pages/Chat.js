import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { connectSocket, sendMessage, disconnectSocket } from "../services/chatService";
import API from "../services/api";
import { getRole } from "../utils/auth";

function Avatar({ name = "?", online, size = "md" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const dim = size === "lg" ? "w-11 h-11 text-sm" : "w-10 h-10 text-xs";
  return (
    <div className="relative flex-shrink-0">
      <div className={`${dim} rounded-full bg-gradient-to-br from-[#C9963A] to-[#7A5010] flex items-center justify-center font-bold text-[#0B1829] select-none`}>
        {initials}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0E1F30] ${online ? "bg-emerald-400" : "bg-[#2E3E52]"}`} />
      )}
    </div>
  );
}

function Bubble({ msg, isNew }) {
  return (
    <div className={`flex ${msg.self ? "justify-end" : "justify-start"} mb-3 ${isNew ? "animate-slide-up" : ""}`}>
      <div className="max-w-[72%]">
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
          msg.self
            ? "bg-gradient-to-br from-[#C9963A] to-[#9A7020] text-[#0B1829] font-medium rounded-br-sm"
            : "bg-[#152840] border border-[#1E2E42] text-[#F0ECE4] rounded-bl-sm"
        }`}>
          {msg.text}
        </div>
        <p className={`text-[10px] mt-1 text-[#3E4E5E] ${msg.self ? "text-right" : "text-left"}`}>
          {msg.time}
        </p>
      </div>
    </div>
  );
}

// ✅ REMOVED: TypingDots — typing state remove kar diya isliye yeh bhi hata diya

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-[#112033] border border-[#1E2E42] flex items-center justify-center mb-3 text-2xl">💬</div>
      <p className="text-[#4A5A6A] text-sm">{text}</p>
    </div>
  );
}

function Chat() {
  const role     = getRole();
  const location = useLocation();

  const [contacts, setContacts]               = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError]     = useState(null);
  const [history, setHistory]                 = useState({});
  const [historyLoading, setHistoryLoading]   = useState(false);
  const [activeContact, setActiveContact]     = useState(null);
  const [input, setInput]                     = useState("");
  const [search, setSearch]                   = useState("");
  // ✅ REMOVED: const [typing, setTyping] = useState(false); — unused tha
  const [newMsgIds, setNewMsgIds]             = useState(new Set());
  const [mobileSidebar, setMobileSidebar]     = useState(true);
  const [unread, setUnread]                   = useState({});

  const bottomRef        = useRef(null);
  const inputRef         = useRef(null);
  const activeContactRef = useRef(null);
  const contactsRef      = useRef([]);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  const msgs        = activeContact ? (history[activeContact.id] || []) : [];
  const filtered    = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) Portál` : "Portál";
    localStorage.setItem("unreadCount", String(totalUnread));
    return () => {
      document.title = "Portál";
      localStorage.setItem("unreadCount", "0");
    };
  }, [totalUnread]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── 1. Fetch contacts ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchContacts = async () => {
      setContactsLoading(true);
      setContactsError(null);
      try {
        const res = await API.get("/chat/contacts");
        setContacts(res.data);
      } catch (err) {
        console.error("Failed to load contacts:", err);
        setContactsError("Could not load contacts. Please try again.");
      } finally {
        setContactsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // ── 2. Auto-open contact from navigate() state ──────────────────────────
  useEffect(() => {
    const contactToOpen = location.state?.openContact;
    if (!contactToOpen || contactsLoading) return;
    const found = contacts.find((c) => String(c.id) === String(contactToOpen.id));
    openContact(found || contactToOpen);
  }, [contactsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Load message history ─────────────────────────────────────────────
  const loadHistory = useCallback(async (contact) => {
    if (history[contact.id]) return;
    setHistoryLoading(true);
    try {
      const res = await API.get(`/chat/history/${contact.id}`);
      const mapped = res.data.map((m) => ({
        id:   m.id,
        text: m.text || m.content,
        self: String(m.senderId) !== String(contact.id),
        time: new Date(m.createdAt || m.timestamp).toLocaleTimeString([], {
          hour: "2-digit", minute: "2-digit",
        }),
      }));
      setHistory((prev) => ({ ...prev, [contact.id]: mapped }));
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistory((prev) => ({ ...prev, [contact.id]: [] }));
    } finally {
      setHistoryLoading(false);
    }
  }, [history]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 4. WebSocket ────────────────────────────────────────────────────────
  useEffect(() => {
    connectSocket((msg) => {
      const contactId = msg.senderId;
      const newMsg = {
        id:   Date.now(),
        text: msg.text || msg.content,
        self: false,
        time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
          hour: "2-digit", minute: "2-digit",
        }),
      };

      setHistory((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), newMsg],
      }));
      setNewMsgIds((prev) => new Set([...prev, newMsg.id]));

      const isCurrentChat =
        activeContactRef.current &&
        String(activeContactRef.current.id) === String(contactId);

      if (!isCurrentChat) {
        setUnread((prev) => ({
          ...prev,
          [contactId]: (prev[contactId] || 0) + 1,
        }));

        const senderName =
          contactsRef.current.find((c) => String(c.id) === String(contactId))?.name || "Someone";

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`💬 ${senderName}`, {
            body: msg.text || msg.content || "New message",
            icon: "/favicon.ico",
            tag:  `chat-${contactId}`,
          });
        }
      }
    });

    return () => disconnectSocket();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 5. Auto-scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  // ── 6. Send message ─────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !activeContact) return;

    const newMsg = {
      id:   Date.now(),
      text,
      self: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setHistory((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg],
    }));
    setNewMsgIds((prev) => new Set([...prev, newMsg.id]));
    sendMessage({ receiverId: activeContact.id, text });
    setInput("");
    inputRef.current?.focus();
  }, [input, activeContact]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── 7. Open a conversation ──────────────────────────────────────────────
  const openContact = async (contact) => {
    setActiveContact(contact);
    setMobileSidebar(false);
    setUnread((prev) => ({ ...prev, [contact.id]: 0 }));
    await loadHistory(contact);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        .chat-font { font-family: 'DM Sans', sans-serif; }
        .serif     { font-family: 'Playfair Display', serif; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.15; transform: scale(0.75); }
          40%            { opacity: 1;   transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,150,58,0.3); }
          50%       { box-shadow: 0 0 0 6px rgba(201,150,58,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-slide-up { animation: slideUp 0.25s ease forwards; }
        .animate-fade-in  { animation: fadeIn 0.3s ease; }
        .typing-dot       { animation: blink 1.4s infinite ease-in-out; display: inline-block; }
        .pulse-glow       { animation: pulseGlow 2.2s infinite; }
        .badge-pop        { animation: badgePop 0.3s ease forwards; }
        .skeleton {
          background: linear-gradient(90deg, #112033 25%, #1a2e44 50%, #112033 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 10px;
        }
        ::-webkit-scrollbar       { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2E42; border-radius: 2px; }
        .contact-btn { transition: all 0.15s ease; }
        .contact-btn:hover .arrow-icon { opacity: 1; transform: translateX(0); }
        .arrow-icon { opacity: 0; transform: translateX(-4px); transition: all 0.2s; }
        .input-area:focus { box-shadow: 0 0 0 2px rgba(201,150,58,0.2); outline: none; }
        .glass-bar { background: rgba(14,31,48,0.88); backdrop-filter: blur(16px); }
      `}</style>

      <div className="chat-font min-h-screen bg-[#0B1829] pt-16 flex flex-col">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#C9963A]/4 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#1E88E5]/4 rounded-full blur-3xl" />
        </div>

        <div className="relative flex-1 flex items-start justify-center px-4 py-4 md:py-6">
          <div
            className="w-full max-w-5xl flex rounded-2xl overflow-hidden border border-[#1E2E42] shadow-2xl"
            style={{ height: "calc(100vh - 88px)", minHeight: 520 }}
          >
            {/* ══ SIDEBAR ══ */}
            <div className={`flex-shrink-0 w-full md:w-80 bg-[#0E1F30] border-r border-[#1A2B3C] flex flex-col
              ${activeContact && !mobileSidebar ? "hidden md:flex" : "flex"}`}
            >
              <div className="px-5 pt-5 pb-4 border-b border-[#1A2B3C]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="serif text-xl text-[#F0ECE4]">Messages</h1>
                    {totalUnread > 0 && (
                      <span className="badge-pop bg-[#C9963A] text-[#0B1829] text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {totalUnread}
                      </span>
                    )}
                  </div>
                  {contacts.some((c) => c.online) && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
                      <span className="text-xs text-[#4A5A6A]">
                        {contacts.filter((c) => c.online).length} online
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[#3A4A5A] text-xs mb-4">
                  {role === "EMPLOYER" ? "Your applicants" : "Jobs you applied to"}
                </p>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A5A6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="w-full bg-[#0B1829] border border-[#1E2E42] focus:border-[#C9963A]/40 rounded-xl pl-8 pr-4 py-2.5 text-sm text-[#F0ECE4] placeholder-[#3A4A5A] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-1">
                {contactsLoading && (
                  <div className="px-4 py-3 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-3 w-3/4" />
                          <div className="skeleton h-2.5 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {contactsError && !contactsLoading && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-red-400 text-sm mb-3">{contactsError}</p>
                    <button onClick={() => window.location.reload()} className="text-[#C9963A] text-xs hover:underline">Retry</button>
                  </div>
                )}

                {!contactsLoading && !contactsError && contacts.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <div className="text-3xl mb-3">🕊️</div>
                    <p className="text-[#4A5A6A] text-sm">
                      {role === "EMPLOYER"
                        ? "No applicants yet. Post a job to start receiving applications."
                        : "Apply to jobs to connect with employers."}
                    </p>
                  </div>
                )}

                {!contactsLoading && filtered.map((c) => {
                  const isActive  = activeContact?.id === c.id;
                  const unreadCnt = unread[c.id] || 0;
                  return (
                    <button
                      key={c.id}
                      onClick={() => openContact(c)}
                      className={`contact-btn w-full flex items-center gap-3 px-4 py-3.5 text-left border-l-2
                        ${isActive ? "bg-[#C9963A]/10 border-[#C9963A]" : "border-transparent hover:bg-[#152840]"}`}
                    >
                      <Avatar name={c.name} online={c.online} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-medium text-sm truncate ${
                            isActive ? "text-[#F0ECE4]" : unreadCnt > 0 ? "text-white" : "text-[#B8B2A8]"
                          }`}>
                            {c.name}
                          </p>
                          {unreadCnt > 0 && !isActive ? (
                            <span className="badge-pop flex-shrink-0 bg-[#C9963A] text-[#0B1829] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {unreadCnt}
                            </span>
                          ) : c.online ? (
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ) : null}
                        </div>
                        <p className={`text-xs truncate ${
                          unreadCnt > 0 && !isActive ? "text-[#C9963A]/70" : "text-[#4A5A6A]"
                        }`}>
                          {c.email}
                        </p>
                      </div>
                      <svg className="arrow-icon w-3 h-3 text-[#C9963A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              {!contactsLoading && contacts.length > 0 && (
                <div className="px-5 py-3 border-t border-[#1A2B3C]">
                  <p className="text-[#3A4A5A] text-xs">
                    {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>

            {/* ══ CHAT PANE ══ */}
            <div className={`flex-1 flex flex-col bg-[#0B1829] min-w-0
              ${mobileSidebar && !activeContact ? "hidden md:flex" : "flex"}`}
            >
              {activeContact ? (
                <>
                  <div className="glass-bar px-5 py-3.5 border-b border-[#1A2B3C] flex items-center justify-between flex-shrink-0 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setMobileSidebar(true); setActiveContact(null); }}
                        className="md:hidden w-8 h-8 rounded-lg hover:bg-[#1E2E42] flex items-center justify-center text-[#7A8899] mr-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <Avatar name={activeContact.name} online={activeContact.online} size="lg" />
                      <div>
                        <h2 className="font-semibold text-[#F0ECE4] text-[15px] leading-tight">{activeContact.name}</h2>
                        <p className="text-xs text-[#4A5A6A] leading-tight mt-0.5">
                          {activeContact.online
                            ? <span className="text-emerald-400">● Active now</span>
                            : "● Offline"}
                          <span className="mx-1.5 text-[#2A3A4A]">·</span>
                          {activeContact.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-5">
                    {historyLoading && (
                      <div className="space-y-4 px-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                            <div className={`skeleton h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-64"}`} />
                          </div>
                        ))}
                      </div>
                    )}
                    {!historyLoading && msgs.length === 0 && (
                      <EmptyState text={`Start your conversation with ${activeContact.name}`} />
                    )}
                    {!historyLoading && msgs.map((msg) => (
                      <Bubble key={msg.id} msg={msg} isNew={newMsgIds.has(msg.id)} />
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  <div className="glass-bar px-4 py-3.5 border-t border-[#1A2B3C] flex-shrink-0">
                    <div className="flex items-end gap-2.5">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder={`Message ${activeContact.name}…`}
                        rows={1}
                        className="input-area flex-1 bg-[#112033] border border-[#1E2E42] focus:border-[#C9963A]/40 rounded-2xl px-4 py-2.5 text-sm text-[#F0ECE4] placeholder-[#3A4A5A] resize-none leading-relaxed transition-colors"
                        style={{ maxHeight: 112, overflowY: "auto" }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = Math.min(e.target.scrollHeight, 112) + "px";
                        }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 transition-all
                          ${input.trim()
                            ? "bg-[#C9963A] hover:bg-[#E8B55A] text-[#0B1829] shadow-lg shadow-[#C9963A]/25 hover:scale-105"
                            : "bg-[#1E2E42] text-[#3A4A5A] cursor-not-allowed"
                          }`}
                      >
                        <svg className="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[9px] text-[#2A3A4A] text-center mt-2 tracking-wide">
                      ENTER to send · SHIFT+ENTER for new line
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8 animate-fade-in">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-[#112033] border border-[#1E2E42] flex items-center justify-center">
                      <svg className="w-9 h-9 text-[#C9963A]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C9963A] rounded-full flex items-center justify-center text-[#0B1829] text-xs font-bold">✦</div>
                  </div>
                  <h2 className="serif text-2xl text-[#F0ECE4] mb-2">Your Messages</h2>
                  <p className="text-[#4A5A6A] text-sm leading-relaxed max-w-xs">
                    {contactsLoading
                      ? "Loading your conversations…"
                      : contacts.length === 0
                      ? role === "EMPLOYER"
                        ? "No applicants yet. Post a job to start receiving messages."
                        : "Apply to jobs to start chatting with employers."
                      : "Select a conversation from the left to begin."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;