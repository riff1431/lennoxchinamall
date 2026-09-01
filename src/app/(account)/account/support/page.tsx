"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Plus,
  Clock,
  CheckCircle2,
  Send,
  Headphones,
  ShieldCheck,
  X,
  HelpCircle,
  ChevronDown,
  Coins,
  Plane,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function SupportTicketsPage() {
  const { isSpanish } = useTranslation();

  const FAQS = isSpanish
    ? [
        {
          q: "¿Qué tan rápida es la entrega de Carga Aérea directa de China a mi puerta?",
          a: "Todos los pedidos se despachan directamente desde nuestros centros de Shenzhen o Ningbo a través de servicio aéreo internacional rastreado (YunExpress, DHL, 4PX, FedEx). El tiempo estándar de tránsito es de 7 a 12 días hábiles con seguimiento puerta a puerta.",
        },
        {
          q: "¿Cómo protege mi compra la liquidación con Binance Pay USDT?",
          a: "Las liquidaciones de Binance Pay se mantienen en depósito de garantía hasta que la inspección de calidad de fábrica se aprueba. En el raro caso de daños durante el transporte o falta de inventario, se acredita un reembolso directo del 100% en USDT a tu billetera cripto en 24 horas.",
        },
        {
          q: "¿Están incluidos los aranceles de importación e impuestos aduaneros en el precio?",
          a: "¡Sí! Todos los precios listados en Lennox ChinaMall incluyen despacho DDP (Entregado con Derechos Pagados) para países admitidos. No recibirás cobros aduaneros sorpresa a la entrega.",
        },
        {
          q: "¿Cómo reclamo la garantía de 30 días o devuelvo un artículo defectuoso?",
          a: "Visita la sección de Devoluciones y Reclamos en tu cuenta, ingresa tu número de pedido y adjunta fotos o videos del defecto. Nuestro equipo de ingeniería en Shenzhen revisa los reclamos en 1 día hábil.",
        },
      ]
    : [
        {
          q: "How fast is direct China Air Cargo delivery to my doorstep?",
          a: "All orders are dispatched directly from our Shenzhen or Ningbo hubs via tracked international air express (YunExpress, DHL, 4PX, FedEx). Standard transit time is 7-12 business days with full door-to-door tracking.",
        },
        {
          q: "How does Binance Pay USDT settlement protect my purchase?",
          a: "Binance Pay settlements are held in single-vendor escrow until factory QC inspection passes. In the rare event of transit damage or inventory stockout, a direct 100% USDT refund is credited directly to your crypto wallet within 24 hours.",
        },
        {
          q: "Are import duties and customs taxes included in the price?",
          a: "Yes! All prices listed on Lennox ChinaMall include DDP (Delivered Duty Paid) clearance for supported countries. You will not receive surprise customs bills upon delivery.",
        },
        {
          q: "How do I claim the 30-day warranty or return a defective item?",
          a: "Visit the Returns & Claims section in your account, enter your order number, and attach photos or videos of the defect. Our Shenzhen engineering team reviews claims within 1 business day.",
        },
      ];

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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
        { sender: "Alex Harrison", body: newMsg, time: isSpanish ? "Ahora mismo" : "Just now" },
      ],
    };

    setTickets([newTicket, ...tickets]);
    setActiveTicketId(newTicket.id);
    setNewSubject("");
    setNewMsg("");
    setShowCreate(false);
    setToastMsg(
      isSpanish
        ? `¡Ticket de Soporte #${newTicket.id} creado! Un ingeniero de abastecimiento ha sido asignado.`
        : `Support Ticket #${newTicket.id} created! A sourcing engineer is assigned.`
    );
    setTimeout(() => setToastMsg(null), 4000);
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
              { sender: "Alex Harrison", body: replyText, time: isSpanish ? "Ahora mismo" : "Just now" },
            ],
          };
        }
        return t;
      })
    );
    setReplyText("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] flex items-center gap-2 font-heading">
            <Headphones className="w-6 h-6 text-[#FF1028]" />
            <span>{isSpanish ? "Mesa de Ayuda y Soporte 24/7" : "24/7 Sourcing Support Desk"}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isSpanish
              ? "Comunicación directa con ingenieros de compras de Lennox y coordinadores de logística de carga aérea en Shenzhen."
              : "Direct communication with Lennox procurement engineers and air cargo logistics coordinators in Shenzhen."}
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2.5 rounded-xl text-xs font-black font-heading transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isSpanish ? "Abrir Nuevo Ticket" : "Open New Ticket"}</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl text-xs font-black shadow-md flex items-center justify-between animate-in fade-in">
          <span>✓ {toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm cursor-pointer">×</button>
        </div>
      )}

      {/* Sourcing SLA Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading text-xs font-black text-slate-900 block">
              {isSpanish ? "Respuesta en < 1 Hora" : "< 1 Hour Response"}
            </span>
            <span className="text-[11px] text-slate-500">
              {isSpanish ? "Mesa 24/7 en Hub Shenzhen" : "24/7 Shenzhen Hub Desk"}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#10B981] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading text-xs font-black text-slate-900 block">
              {isSpanish ? "Garantía Directa en USDT" : "Direct USDT Escrow"}
            </span>
            <span className="text-[11px] text-slate-500">
              {isSpanish ? "Protección de Reembolso Inmediato" : "Instant Refund Protection"}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading text-xs font-black text-slate-900 block">
              {isSpanish ? "Soporte de Calidad de Fábrica" : "Factory QA Support"}
            </span>
            <span className="text-[11px] text-slate-500">
              {isSpanish ? "Ingenieros de Hardware Disponibles" : "Hardware Engineers on Call"}
            </span>
          </div>
        </div>
      </div>

      {/* New Ticket Drawer/Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-black text-[#00143D] uppercase font-heading">
              {isSpanish ? "Crear Ticket de Soporte" : "Create Support Ticket"}
            </span>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {isSpanish ? "Asunto de la Consulta *" : "Inquiry Subject *"}
            </label>
            <input
              type="text"
              required
              placeholder={isSpanish ? "ej., Pregunta sobre reemplazo de batería de Dron 4K..." : "e.g., Question regarding 4K Drone Battery Replacement..."}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {isSpanish ? "Categoría" : "Category"}
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:border-[#00143D]"
            >
              <option value="Shipping & Tracking">
                {isSpanish ? "Envíos y Rastreo de Carga Aérea" : "Shipping & Air Cargo Tracking"}
              </option>
              <option value="Product Hardware Specs">
                {isSpanish ? "Especificaciones de Hardware de Producto" : "Product Hardware & Specs"}
              </option>
              <option value="Binance Pay USDT Settlement">
                {isSpanish ? "Liquidaciones Binance Pay USDT" : "Binance Pay USDT Settlement"}
              </option>
              <option value="Returns & Warranty">
                {isSpanish ? "Devoluciones y Garantía de 30 Días" : "Returns & 30-Day Warranty"}
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {isSpanish ? "Mensaje Detallado *" : "Detailed Message *"}
            </label>
            <textarea
              rows={4}
              required
              placeholder={isSpanish ? "Proporciona el número de pedido o preguntas sobre el hardware..." : "Provide order number or hardware questions..."}
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl text-xs font-black font-heading transition-colors cursor-pointer"
            >
              {isSpanish ? "Enviar Ticket" : "Submit Ticket"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold font-heading cursor-pointer"
            >
              {isSpanish ? "Cancelar" : "Cancel"}
            </button>
          </div>
        </form>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        <h3 className="font-heading text-sm font-black text-slate-900 uppercase tracking-wider">
          {isSpanish ? `Conversaciones de Soporte Activas (${tickets.length})` : `Active Support Conversations (${tickets.length})`}
        </h3>

        {tickets.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
              <div className="space-y-0.5">
                <span className="font-black text-[#00143D] text-sm block font-heading">
                  {t.subject}
                </span>
                <span className="text-slate-400 font-semibold">
                  {isSpanish ? `Categoría: ${t.category} • Creado el ${formatDate(t.createdAt)}` : `Category: ${t.category} • Created ${formatDate(t.createdAt)}`}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase self-start sm:self-auto font-heading ${
                  t.status === "resolved"
                    ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {isSpanish ? (t.status === "resolved" ? "RESUELTO" : "ABIERTO") : t.status}
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
                    <span className="font-heading">{m.sender}</span>
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
                placeholder={isSpanish ? "Escribe una respuesta de seguimiento..." : "Type a follow-up reply..."}
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
                className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2 rounded-xl text-xs font-black font-heading transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSpanish ? "Responder" : "Reply"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h3 className="font-heading text-sm font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#FF1028]" />
          <span>{isSpanish ? "Preguntas Frecuentes de Abastecimiento y Entregas" : "Frequently Asked Sourcing & Delivery Questions"}</span>
        </h3>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:text-[#00143D] transition-colors cursor-pointer"
              >
                <span className="font-heading">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    expandedFaq === idx ? "rotate-180 text-[#FF1028]" : ""
                  }`}
                />
              </button>

              {expandedFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
