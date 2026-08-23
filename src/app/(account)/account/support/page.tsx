"use client";

import React, { useState } from "react";
import { MessageCircle, Plus, Clock, CheckCircle2, Send, Headphones, ShieldCheck, X } from "lucide-react";
import { formatDate } from "@/utils/helpers";

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([
    {
      id: "tick-1",
      subject: "Inquiry on YunExpress air tracking scan for Order #LCM-20260823-7492",
      category: "Shipping & Tracking",
      status: "resolved",
      priority: "medium",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      messages: [
        {
          sender: "Alex Harrison",
          body: "Hello, when is the package expected to arrive in San Francisco?",
          time: "2 days ago",
        },
        {
          sender: "Lennox Sourcing Specialist (Shenzhen Hub)",
          body: "Hi Alex! Your package passed factory QC inspection, cleared Hong Kong customs, and is scheduled for doorstep delivery in 4 business days.",
          time: "1 day ago",
        },
      ],
    },
  ]);

  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("Shipping & Tracking");
  const [newMsg, setNewMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [activeTicketId, setActiveTicketId] = useState<string | null>("tick-1");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMsg.trim()) return;

    const newTicket = {
      id: `tick-${Date.now()}`,
      subject: newSubject,
      category: newCategory,
      status: "open",
      priority: "medium",
      createdAt: new Date().toISOString(),
      messages: [
        { sender: "Alex Harrison", body: newMsg, time: "Just now" },
      ],
    };

    setTickets([newTicket, ...tickets]);
    setActiveTicketId(newTicket.id);
    setNewSubject("");
    setNewMsg("");
    setShowCreate(false);
  };

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            messages: [
              ...t.messages,
              { sender: "Alex Harrison", body: replyText, time: "Just now" },
            ],
          };
        }
        return t;
      })
    );
    setReplyText("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] flex items-center gap-2">
            <Headphones className="w-6 h-6 text-[#FF1028]" />
            <span>24/7 Sourcing Support Desk</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Direct communication with Lennox procurement engineers and air cargo logistics coordinators.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Ticket</span>
        </button>
      </div>

      {/* New Ticket Drawer/Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-black text-[#00143D] uppercase">Create Support Ticket</span>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Inquiry Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g., Question regarding 4K Drone Battery Replacement..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:border-[#00143D]"
            >
              <option value="Shipping & Tracking">Shipping & Air Cargo Tracking</option>
              <option value="Product Hardware Specs">Product Hardware & Specs</option>
              <option value="Binance Pay USDT Settlement">Binance Pay USDT Settlement</option>
              <option value="Returns & Warranty">Returns & 30-Day Warranty</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Detailed Message *</label>
            <textarea
              rows={4}
              required
              placeholder="Provide order number or hardware questions..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl text-xs font-black transition-colors"
            >
              Submit Ticket
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tickets Accordion List */}
      <div className="space-y-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
              <div className="space-y-0.5">
                <span className="font-black text-[#00143D] text-sm block">
                  {t.subject}
                </span>
                <span className="text-slate-400 font-semibold">
                  Category: {t.category} • Created {formatDate(t.createdAt)}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase self-start sm:self-auto ${
                  t.status === "resolved"
                    ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {t.status}
              </span>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl">
              {t.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl text-xs space-y-1 ${
                    m.sender === "Alex Harrison"
                      ? "bg-white border border-slate-200 text-slate-800"
                      : "bg-[#00143D] text-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>{m.sender}</span>
                    <span
                      className={
                        m.sender === "Alex Harrison"
                          ? "text-slate-400"
                          : "text-slate-300"
                      }
                    >
                      {m.time}
                    </span>
                  </div>
                  <p className="leading-relaxed">{m.body}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Box */}
            <div className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Type a follow-up reply..."
                value={activeTicketId === t.id ? replyText : ""}
                onChange={(e) => {
                  setActiveTicketId(t.id);
                  setReplyText(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleReply(t.id);
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
              />
              <button
                type="button"
                onClick={() => handleReply(t.id)}
                className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
