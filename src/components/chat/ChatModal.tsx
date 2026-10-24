/**
 * FarmConnect Realtime Chat Modal
 * Enables instant communication between:
 * - Consumer ↔ Farmer
 * - Consumer ↔ Delivery Partner
 * - Farmer ↔ Delivery Partner
 */

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface ChatMessage {
  id: string;
  senderRole: 'consumer' | 'farmer' | 'delivery';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  myRole: 'consumer' | 'farmer' | 'delivery';
  myName: string;
  otherPartyName: string;
  otherPartyRole: 'farmer' | 'consumer' | 'delivery';
  otherPartyPhone?: string;
  initialMessages?: ChatMessage[];
  onSendMessage?: (msg: ChatMessage) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  myRole,
  myName,
  otherPartyName,
  otherPartyRole,
  otherPartyPhone = '+91 98480 12345',
  initialMessages = [],
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) return initialMessages;
    return [
      {
        id: 'msg-1',
        senderRole: otherPartyRole,
        senderName: otherPartyName,
        text: `Hello ${myName}! Regarding Order #${orderNumber}, please let me know if you have special instructions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: myRole,
      senderName: myName,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (onSendMessage) onSendMessage(newMsg);
    setInput('');

    // Simulated reply after 1.5 seconds if user is sending message
    setTimeout(() => {
      let replyText = 'Got it! Thanks for updating. Will handle this right away.';
      if (myRole === 'consumer' && otherPartyRole === 'farmer') {
        replyText = 'Harvesting & packing fresh items for your order right now!';
      } else if (otherPartyRole === 'delivery') {
        replyText = 'On my way with live GPS tracking active. See you soon!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-auto-${Date.now()}`,
          senderRole: otherPartyRole,
          senderName: otherPartyName,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'farmer') return <Badge variant="emerald" size="sm">Farmer</Badge>;
    if (role === 'delivery') return <Badge variant="amber" size="sm">Driver</Badge>;
    return <Badge variant="blue" size="sm">Consumer</Badge>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-lg w-full overflow-hidden border border-slate-200 dark:border-emerald-800 shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm shadow">
              {otherPartyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm">{otherPartyName}</h4>
                {getRoleBadge(otherPartyRole)}
              </div>
              <p className="text-[11px] text-emerald-300">
                Order #{orderNumber} • Live Chat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${otherPartyPhone}`}
              className="p-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs flex items-center gap-1 font-bold transition-all"
            >
              <Icon name="phone" size={16} /> Call
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950">
          {messages.map((m) => {
            const isMe = m.senderRole === myRole;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 px-1 mb-0.5">
                  {m.senderName} • {m.timestamp}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                    isMe
                      ? 'bg-[#2E7D32] text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button type="submit" variant="primary" size="md" leftIcon="send">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
