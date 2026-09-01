"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  HelpCircle,
  Search,
  Plus,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Flag,
  Sparkles,
  Clock,
  Send,
  X,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  AlertTriangle,
  User,
  Share2,
} from "lucide-react";
import { ProductQuestion, ProductAnswer } from "@/types/reviews";
import {
  getProductQuestions,
  askProductQuestion,
  answerProductQuestion,
  voteQuestionHelpfulness,
  reportInappropriateQuestion,
} from "@/app/actions/product-qa";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDate, cn } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ProductQASectionProps {
  productId: string;
  productTitle: string;
  productImage?: string;
  categoryName?: string;
  initialQuestions?: ProductQuestion[];
  onQuestionCountChange?: (count: number) => void;
}

export function ProductQASection({
  productId,
  productTitle,
  productImage,
  categoryName,
  initialQuestions,
  onQuestionCountChange,
}: ProductQASectionProps) {
  const { t, isSpanish } = useTranslation();
  const { user, displayName, role } = useAuth();
  const isStaffOrAdmin = Boolean(role && role !== "customer");

  const topicFilters = useMemo(() => {
    return isSpanish
      ? [
          { key: "All Topics", label: "Todos los Temas" },
          { key: "Technical Specs", label: "Especificaciones Técnicas" },
          { key: "Compatibility", label: "Compatibilidad" },
          { key: "Shipping & DDP", label: "Envío y DDP" },
          { key: "Power & Battery", label: "Energía y Batería" },
          { key: "Warranty & Parts", label: "Garantía y Repuestos" },
        ]
      : [
          { key: "All Topics", label: "All Topics" },
          { key: "Technical Specs", label: "Technical Specs" },
          { key: "Compatibility", label: "Compatibility" },
          { key: "Shipping & DDP", label: "Shipping & DDP" },
          { key: "Power & Battery", label: "Power & Battery" },
          { key: "Warranty & Parts", label: "Warranty & Parts" },
        ];
  }, [isSpanish]);

  // Data states
  const [questions, setQuestions] = useState<ProductQuestion[]>(initialQuestions || []);
  const [isLoading, setIsLoading] = useState(!initialQuestions || initialQuestions.length === 0);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [filterType, setFilterType] = useState<"all" | "answered" | "staff_answered">("all");
  const [sortBy, setSortBy] = useState<"most_helpful" | "newest" | "most_answered">("most_helpful");

  // Interaction tracking (Optimistic UI)
  const [votedQuestionIds, setVotedQuestionIds] = useState<Record<string, boolean>>({});
  const [votedAnswerIds, setVotedAnswerIds] = useState<Record<string, boolean>>({});
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  // Modals
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [activeQuestionForAnswer, setActiveQuestionForAnswer] = useState<ProductQuestion | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportQuestionId, setReportQuestionId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Spam or Advertising");
  const [reportDetails, setReportDetails] = useState("");

  // Ask Question Form State
  const [formTopic, setFormTopic] = useState("Technical Specs");
  const [formQuestion, setFormQuestion] = useState("");
  const [formAuthorName, setFormAuthorName] = useState("");
  const [formNotifyEmail, setFormNotifyEmail] = useState(true);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [askStatus, setAskStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Answer Form State
  const [answerText, setAnswerText] = useState("");
  const [answerAuthorName, setAnswerAuthorName] = useState("");
  const [isOfficialStaffToggle, setIsOfficialStaffToggle] = useState(isStaffOrAdmin);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerStatus, setAnswerStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const onQuestionCountChangeRef = React.useRef(onQuestionCountChange);
  useEffect(() => {
    onQuestionCountChangeRef.current = onQuestionCountChange;
  }, [onQuestionCountChange]);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    const res = await getProductQuestions(productId, undefined, productTitle, categoryName);
    if (res.success && res.questions) {
      setQuestions(res.questions);
      onQuestionCountChangeRef.current?.(res.questions.length);
    }
    setIsLoading(false);
  }, [productId, productTitle, categoryName]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle Ask Question Submit
  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || formQuestion.trim().length < 5) {
      setAskStatus({ success: false, message: "Please enter a detailed question (at least 5 characters)." });
      return;
    }

    setIsSubmittingQuestion(true);
    const author = formAuthorName.trim() || displayName || (user ? "Verified Customer" : "Customer");

    const res = await askProductQuestion(productId, formQuestion, author, formTopic);
    setIsSubmittingQuestion(false);

    if (res.success && res.question) {
      setAskStatus({ success: true, message: res.message });
      // Optimistic update
      setQuestions((prev) => [res.question!, ...prev]);
      if (onQuestionCountChange) {
        onQuestionCountChange(questions.length + 1);
      }
      showToast("Your question has been posted to our Shenzhen sourcing desk!");
      setTimeout(() => {
        setIsAskModalOpen(false);
        setFormQuestion("");
        setFormAuthorName("");
        setAskStatus(null);
      }, 1200);
    } else {
      setAskStatus({ success: false, message: res.message });
    }
  };

  // Open Answer Modal
  const handleOpenAnswerModal = (question: ProductQuestion) => {
    setActiveQuestionForAnswer(question);
    setAnswerText("");
    setAnswerAuthorName(isStaffOrAdmin ? "Lennox Sourcing Lab • Shenzhen" : displayName || "");
    setIsOfficialStaffToggle(isStaffOrAdmin);
    setAnswerStatus(null);
    setIsAnswerModalOpen(true);
  };

  // Handle Answer Submit
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestionForAnswer || !answerText.trim() || answerText.trim().length < 5) {
      setAnswerStatus({ success: false, message: "Please provide a clear answer (at least 5 characters)." });
      return;
    }

    setIsSubmittingAnswer(true);
    const res = await answerProductQuestion(
      activeQuestionForAnswer.id,
      answerText,
      answerAuthorName.trim() || (isOfficialStaffToggle ? "Lennox Sourcing Lab • Shenzhen" : displayName || "Verified Buyer"),
      isOfficialStaffToggle
    );
    setIsSubmittingAnswer(false);

    if (res.success && res.answer) {
      setAnswerStatus({ success: true, message: res.message });
      // Optimistic answer addition
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === activeQuestionForAnswer.id
            ? { ...q, answers: [...q.answers, res.answer!] }
            : q
        )
      );
      showToast("Thank you! Your answer has been published.");
      setTimeout(() => {
        setIsAnswerModalOpen(false);
        setAnswerText("");
        setAnswerStatus(null);
        setActiveQuestionForAnswer(null);
      }, 1200);
    } else {
      setAnswerStatus({ success: false, message: res.message });
    }
  };

  // Handle Vote Question
  const handleVoteQuestion = async (questionId: string) => {
    if (votedQuestionIds[questionId]) {
      showToast("You have already upvoted this question.");
      return;
    }

    setVotedQuestionIds((prev) => ({ ...prev, [questionId]: true }));
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, helpfulVotes: q.helpfulVotes + 1 } : q))
    );

    await voteQuestionHelpfulness(questionId);
    showToast("Thank you for upvoting!");
  };

  // Handle Vote Answer
  const handleVoteAnswer = (answerId: string) => {
    if (votedAnswerIds[answerId]) {
      showToast("Feedback already recorded.");
      return;
    }
    setVotedAnswerIds((prev) => ({ ...prev, [answerId]: true }));
    showToast("Thank you for marking this answer as helpful!");
  };

  // Handle Report Question
  const handleReportSubmit = async () => {
    if (!reportQuestionId) return;
    await reportInappropriateQuestion(reportQuestionId, reportReason, reportDetails);
    showToast("Report submitted to Lennox Moderation Desk.");
    setIsReportModalOpen(false);
    setReportQuestionId(null);
    setReportDetails("");
  };

  // Filtered & Sorted Questions
  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        // Search query match
        if (searchQuery.trim()) {
          const qText = searchQuery.toLowerCase().trim();
          const matchQuestion = q.question.toLowerCase().includes(qText);
          const matchAuthor = q.authorName.toLowerCase().includes(qText);
          const matchAnswer = q.answers.some(
            (a) =>
              a.answer.toLowerCase().includes(qText) ||
              a.responderName.toLowerCase().includes(qText)
          );
          if (!matchQuestion && !matchAuthor && !matchAnswer) return false;
        }

        // Topic match
        if (selectedTopic !== "All Topics") {
          const topicTag = `[${selectedTopic}]`.toLowerCase();
          const topicKeyword = selectedTopic.toLowerCase();
          const matches =
            q.question.toLowerCase().includes(topicTag) ||
            q.question.toLowerCase().includes(topicKeyword);
          if (!matches) return false;
        }

        // Filter Type
        if (filterType === "answered" && q.answers.length === 0) {
          return false;
        }
        if (
          filterType === "staff_answered" &&
          !q.answers.some((a) => a.isOfficialStaff)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "most_helpful") {
          return b.helpfulVotes - a.helpfulVotes;
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "most_answered") {
          return b.answers.length - a.answers.length;
        }
        return 0;
      });
  }, [questions, searchQuery, selectedTopic, filterType, sortBy]);

  const answeredCount = questions.filter((q) => q.answers.length > 0).length;
  const staffAnsweredCount = questions.filter((q) => q.answers.some((a) => a.isOfficialStaff)).length;

  return (
    <div id="product-qa-section" className="space-y-6 sm:space-y-8 font-montserrat">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00143D] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Header & Stats Banner ── */}
      <div className="bg-gradient-to-br from-slate-900 via-[#00143D] to-[#002366] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSpanish ? "Soporte Técnico Directo de Fábrica Shenzhen" : "Shenzhen Factory Direct Technical Support"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
              {isSpanish ? "Preguntas y Respuestas (Q&A)" : "Questions & Answers (Q&A)"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isSpanish
                ? "¿Tienes dudas técnicas sobre compatibilidad, firmware, control QC o aduanas DDP? Pregunta a nuestro equipo de ingeniería y compradores verificados."
                : "Have technical questions regarding compatibility, firmware, factory QC, or DDP customs? Ask our Shenzhen hardware engineering desk and verified buyers."}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setAskStatus(null);
                setIsAskModalOpen(true);
              }}
              className="bg-[#FF1028] hover:bg-[#D90017] text-white font-heading font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>{t.product.askQuestion}</span>
            </button>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-semibold block">
              {isSpanish ? "Total Preguntas" : "Total Questions"}
            </span>
            <span className="text-lg font-black font-mono text-white">{questions.length}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-semibold block">
              {isSpanish ? "Respondidas por Fábrica" : "Answered by Staff"}
            </span>
            <span className="text-lg font-black font-mono text-[#10B981]">
              {staffAnsweredCount} {isSpanish ? "Verificadas" : "Verified"}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-semibold block">
              {isSpanish ? "Tiempo de Respuesta" : "Response Time"}
            </span>
            <span className="text-lg font-black font-mono text-amber-300">
              {isSpanish ? "6–12 Horas" : "6–12 Hours"}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-semibold block">
              {isSpanish ? "Garantía de Aduanas" : "Customs Guarantee"}
            </span>
            <span className="text-lg font-black font-mono text-blue-300">
              {isSpanish ? "100% Cobertura DDP" : "100% DDP Covered"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Real-Time Search, Topics, and Filter Toolbar ── */}
      <div className="space-y-3 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              isSpanish
                ? "Buscar preguntas por palabra clave (ej. voltaje, DDP, tamaño, garantía)..."
                : "Search answered questions by keyword (e.g. flight time, DDP, voltage, size, warranty)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00143D] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {topicFilters.map((topic) => {
            const isSelected = selectedTopic === topic.key;
            return (
              <button
                key={topic.key}
                onClick={() => setSelectedTopic(topic.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                  isSelected
                    ? "bg-[#00143D] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                )}
              >
                {topic.label}
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              {isSpanish ? "Filtro:" : "Filter:"}
            </span>
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer",
                filterType === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {isSpanish ? `Todas (${questions.length})` : `All (${questions.length})`}
            </button>
            <button
              onClick={() => setFilterType("answered")}
              className={cn(
                "px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer",
                filterType === "answered"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {isSpanish ? `Respondidas (${answeredCount})` : `Answered (${answeredCount})`}
            </button>
            <button
              onClick={() => setFilterType("staff_answered")}
              className={cn(
                "px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer",
                filterType === "staff_answered"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSpanish ? `Respuestas Oficiales (${staffAnsweredCount})` : `Official Staff Answers (${staffAnsweredCount})`}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider hidden sm:inline">
              {isSpanish ? "Ordenar por:" : "Sort by:"}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="most_helpful">{isSpanish ? "Más Útiles" : "Most Helpful"}</option>
              <option value="newest">{isSpanish ? "Más Recientes" : "Most Recent"}</option>
              <option value="most_answered">{isSpanish ? "Más Respondidas" : "Most Answered"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Questions & Answers List ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl border border-slate-200 bg-slate-50 animate-pulse space-y-4">
              <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
              <div className="h-3 w-1/3 bg-slate-200 rounded-md" />
              <div className="h-16 w-full bg-slate-200 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-slate-200 text-[#00143D]">
            <HelpCircle className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-black text-[#00143D]">
              {searchQuery || selectedTopic !== "All Topics"
                ? (isSpanish ? "No se encontraron preguntas coincidentes" : "No matching questions found")
                : (isSpanish ? "¿Tienes una pregunta sobre este producto?" : "Have a question about this product?")}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery || selectedTopic !== "All Topics"
                ? (isSpanish ? "Intenta borrar tu búsqueda o seleccionar 'Todos los Temas' para ver todas las preguntas." : "Try clearing your search query or selecting 'All Topics' to see all answered questions.")
                : (isSpanish ? "Pregunta a nuestro equipo de ingeniería y logística de Shenzhen para aclaraciones sobre compatibilidad, firmware o aduanas DDP." : "Ask our Shenzhen factory engineering and logistics team for fast clarification on compatibility, firmware, or DDP customs.")}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || selectedTopic !== "All Topics" || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTopic("All Topics");
                  setFilterType("all");
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {isSpanish ? "Limpiar Filtros" : "Clear Filters"}
              </button>
            )}
            <button
              onClick={() => {
                setAskStatus(null);
                setIsAskModalOpen(true);
              }}
              className="bg-[#00143D] hover:bg-[#002366] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isSpanish ? "Hacer la Primera Pregunta" : "Ask the First Question"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const hasAnswers = q.answers && q.answers.length > 0;
            const isAnswerExpanded = expandedAnswers[q.id] || false;
            const displayedAnswers = hasAnswers
              ? isAnswerExpanded
                ? q.answers
                : [q.answers[0]]
              : [];

            return (
              <div
                key={q.id}
                className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* Top Row: Question Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Q Badge */}
                    <div className="w-8 h-8 rounded-xl bg-[#00143D] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      Q
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-black text-[#00143D] leading-snug">
                        {q.question}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 font-semibold">
                        <span className="text-slate-700 font-bold">
                          {isSpanish ? `Preguntado por ${q.authorName}` : `Asked by ${q.authorName}`}
                        </span>
                        <span>•</span>
                        <span>{formatDate(q.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Helpful Vote & Report */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVoteQuestion(q.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        votedQuestionIds[q.id]
                          ? "bg-[#00143D] text-white border-[#00143D] shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                      title="Vote as helpful question"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{q.helpfulVotes}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReportQuestionId(q.id);
                        setIsReportModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-[#FF1028] p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Report inappropriate question"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Answers Section */}
                {hasAnswers ? (
                  <div className="space-y-3 pl-0 sm:pl-11">
                    {displayedAnswers.map((ans, aIdx) => (
                      <div
                        key={ans.id || aIdx}
                        className={cn(
                          "p-4 sm:p-5 rounded-2xl border space-y-2.5 transition-all",
                          ans.isOfficialStaff
                            ? "bg-slate-50/90 border-slate-200"
                            : "bg-slate-50/50 border-slate-200/80"
                        )}
                      >
                        {/* Answer Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div
                              className={cn(
                                "w-5 h-5 rounded-md text-white text-[10px] font-black flex items-center justify-center shrink-0",
                                ans.isOfficialStaff ? "bg-[#00143D]" : "bg-emerald-600"
                              )}
                            >
                              A
                            </div>
                            <span className="text-xs font-black text-slate-900">
                              {ans.responderName}
                            </span>
                            {ans.isOfficialStaff && (
                              <span className="bg-[#00143D] text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-2xs">
                                <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                                {isSpanish ? "MESA OFICIAL DE FÁBRICA" : "OFFICIAL FACTORY DESK"}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                            {formatDate(ans.createdAt)}
                          </span>
                        </div>

                        {/* Answer Text */}
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
                          {ans.answer}
                        </p>

                        {/* Answer Footer Action */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                          <span className="text-slate-400 font-medium">
                            {isSpanish ? "¿Fue útil esta respuesta?" : "Was this answer helpful?"}
                          </span>
                          <button
                            onClick={() => handleVoteAnswer(ans.id)}
                            className={cn(
                              "flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-md transition-colors cursor-pointer",
                              votedAnswerIds[ans.id]
                                ? "text-emerald-600 bg-emerald-50"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                            )}
                          >
                            <Check className="w-3 h-3" />
                            <span>
                              {isSpanish
                                ? (votedAnswerIds[ans.id] ? "Marcado Útil" : "Sí, Útil")
                                : (votedAnswerIds[ans.id] ? "Marked Helpful" : "Yes, Helpful")}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Expand/Collapse All Answers if multiple */}
                    {q.answers.length > 1 && (
                      <div className="pt-1 flex items-center justify-between">
                        <button
                          onClick={() =>
                            setExpandedAnswers((prev) => ({
                              ...prev,
                              [q.id]: !isAnswerExpanded,
                            }))
                          }
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          {isAnswerExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>{isSpanish ? "Mostrar menos respuestas" : "Show fewer answers"}</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>{isSpanish ? `Ver las ${q.answers.length} respuestas` : `View all ${q.answers.length} answers`}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleOpenAnswerModal(q)}
                          className="text-xs font-bold text-slate-500 hover:text-[#00143D] flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{isSpanish ? "Agregar otra respuesta" : "Add another answer"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pl-0 sm:pl-11 space-y-2">
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {isSpanish
                          ? "Respuesta pendiente del equipo de ingeniería Lennox. Tiempo estimado: 6–12 horas."
                          : "Pending response from Lennox Factory Engineering. Typical turnaround is within 6–12 hours."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Inline Reply Trigger (if single or zero answers) */}
                {q.answers.length <= 1 && (
                  <div className="pl-0 sm:pl-11 pt-1 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenAnswerModal(q)}
                      className="text-xs font-bold text-slate-500 hover:text-[#00143D] flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isSpanish ? "Responder a esta Pregunta" : "Answer this Question"}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Bottom Support CTA Banner ── */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-[#00143D] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-heading font-black text-xs sm:text-sm text-[#00143D]">
              {isSpanish ? "¿Necesitas personalización B2B o pedidos por mayor de fábrica?" : "Need specialized B2B customization or bulk factory orders?"}
            </h4>
            <p className="text-[11px] text-slate-500">
              {isSpanish
                ? "Personalización OEM directa, actualización de firmware y logística aérea en pallets disponibles."
                : "Direct OEM silkscreen branding, firmware flashing, and airfreight pallet logistics available."}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setFormTopic("Technical Specs");
            setAskStatus(null);
            setIsAskModalOpen(true);
          }}
          className="bg-[#00143D] hover:bg-[#002366] text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
        >
          {isSpanish ? "Enviar Consulta de Fábrica" : "Submit Factory Inquiry"}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: ASK A QUESTION
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        title={isSpanish ? "Preguntar a la Mesa de Fábrica" : "Ask Factory Sourcing Desk"}
      >
        <form onSubmit={handleAskSubmit} className="space-y-4 font-montserrat">
          {/* Header context */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            {productImage && (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 relative shrink-0">
                <Image src={productImage} alt={productTitle} fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                {isSpanish ? "Consulta Directa Para" : "Direct Inquiry For"}
              </span>
              <h5 className="text-xs font-black text-slate-900 truncate">{productTitle}</h5>
            </div>
          </div>

          {/* Status Message */}
          {askStatus && (
            <div
              className={cn(
                "p-3 rounded-xl text-xs font-bold flex items-center gap-2",
                askStatus.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              {askStatus.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{askStatus.message}</span>
            </div>
          )}

          {/* Topic Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {isSpanish ? "Categoría del Tema" : "Topic Category"} <span className="text-[#FF1028]">*</span>
            </label>
            <select
              value={formTopic}
              onChange={(e) => setFormTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#00143D]"
            >
              <option value="Technical Specs">
                {isSpanish ? "Especificaciones Técnicas y Rendimiento" : "Technical Specifications & Performance"}
              </option>
              <option value="Compatibility">
                {isSpanish ? "Compatibilidad y Accesorios" : "Compatibility & Hardware Accessories"}
              </option>
              <option value="Shipping & DDP">
                {isSpanish ? "Envío Aéreo y Aduanas DDP" : "Airfreight Shipping & DDP Customs"}
              </option>
              <option value="Power & Battery">
                {isSpanish ? "Alimentación, Voltaje y Batería" : "Power Supply, Voltage & Battery Life"}
              </option>
              <option value="Warranty & Parts">
                {isSpanish ? "Garantía, Devoluciones y Repuestos" : "Warranty, Returns & Spare Parts"}
              </option>
              <option value="General">
                {isSpanish ? "Consulta General" : "General Inquiry"}
              </option>
            </select>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {isSpanish ? "Tu Pregunta" : "Your Question"} <span className="text-[#FF1028]">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">
                {formQuestion.length} / 500 chars
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={500}
              placeholder={
                isSpanish
                  ? "ej. ¿Esta unidad incluye el adaptador regional de 110V/220V y admite actualización de firmware por USB-C?"
                  : "e.g. Does this unit include the regional 110V/220V adapter, and is firmware upgrading supported via USB-C?"
              }
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00143D]"
            />
          </div>

          {/* Author Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {isSpanish ? "Tu Nombre a Mostrar" : "Your Display Name"}
            </label>
            <input
              type="text"
              placeholder={displayName || (isSpanish ? "Cliente Verificado" : "Verified Customer")}
              value={formAuthorName}
              onChange={(e) => setFormAuthorName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00143D]"
            />
          </div>

          {/* Notification Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={formNotifyEmail}
              onChange={(e) => setFormNotifyEmail(e.target.checked)}
              className="rounded border-slate-300 text-[#00143D] focus:ring-0"
            />
            <span>
              {isSpanish
                ? "Recibir notificación cuando los ingenieros de Shenzhen publiquen una respuesta"
                : "Receive notification when Shenzhen engineers post a verified response"}
            </span>
          </label>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAskModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {isSpanish ? "Cancelar" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuestion}
              className="bg-[#FF1028] hover:bg-[#D90017] text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmittingQuestion && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isSpanish ? "Publicar Pregunta" : "Post Question"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: ANSWER A QUESTION
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        title={isSpanish ? "Enviar Respuesta" : "Submit Answer"}
      >
        <form onSubmit={handleAnswerSubmit} className="space-y-4 font-montserrat">
          {/* Question preview */}
          {activeQuestionForAnswer && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                {isSpanish ? `Pregunta de ${activeQuestionForAnswer.authorName}` : `Question by ${activeQuestionForAnswer.authorName}`}
              </span>
              <p className="text-xs font-bold text-[#00143D] leading-snug">
                {activeQuestionForAnswer.question}
              </p>
            </div>
          )}

          {/* Status Message */}
          {answerStatus && (
            <div
              className={cn(
                "p-3 rounded-xl text-xs font-bold flex items-center gap-2",
                answerStatus.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              {answerStatus.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{answerStatus.message}</span>
            </div>
          )}

          {/* Answer Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {isSpanish ? "Tu Respuesta / Explicación" : "Your Answer / Explanation"} <span className="text-[#FF1028]">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder={
                isSpanish
                  ? "Proporciona una aclaración técnica clara, especificaciones o experiencia real de uso..."
                  : "Provide clear technical clarification, specifications, or real-world usage experience..."
              }
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00143D]"
            />
          </div>

          {/* Responder Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {isSpanish ? "Nombre del Respondedor" : "Responder Name"}
            </label>
            <input
              type="text"
              placeholder={isSpanish ? "ej. Lennox Sourcing Lab • Shenzhen o Comprador Verificado" : "e.g. Lennox Sourcing Lab • Shenzhen or Verified Buyer"}
              value={answerAuthorName}
              onChange={(e) => setAnswerAuthorName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#00143D]"
            />
          </div>

          {/* Staff Toggle (Admin/Staff only) */}
          {isStaffOrAdmin && (
            <label className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isOfficialStaffToggle}
                onChange={(e) => setIsOfficialStaffToggle(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isSpanish ? "Marcar esta respuesta con Insignia Oficial Lennox" : "Mark this response with Official Lennox Staff Badge"}</span>
            </label>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAnswerModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {isSpanish ? "Cancelar" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmittingAnswer}
              className="bg-[#00143D] hover:bg-[#002366] text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmittingAnswer && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isSpanish ? "Publicar Respuesta" : "Publish Answer"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: REPORT INAPPROPRIATE QUESTION
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={isSpanish ? "Reportar Contenido a Moderación Lennox" : "Report Content to Lennox Moderation"}
      >
        <div className="space-y-4 font-montserrat">
          <p className="text-xs text-slate-600">
            {isSpanish
              ? "Nuestro equipo de moderación audita activamente todas las preguntas y respuestas para mantener especificaciones de fábrica precisas y libres de spam."
              : "Our moderation desk actively audits all questions and answers to maintain accurate, spam-free factory specifications."}
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {isSpanish ? "Motivo del Reporte" : "Reason for Report"}
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden"
            >
              <option value="Spam or Advertising">
                {isSpanish ? "Spam, Enlaces Promocionales o Publicidad" : "Spam, Promotional Links or Advertising"}
              </option>
              <option value="Inappropriate Language">
                {isSpanish ? "Acoso, Lenguaje Ofensivo o Insultos" : "Harassment, Profanity or Hate Speech"}
              </option>
              <option value="Misleading Information">
                {isSpanish ? "Información Engañosa o Falsa del Producto" : "Misleading or False Product Information"}
              </option>
              <option value="Off-Topic">
                {isSpanish ? "Contenido Fuera de Tema o Irrelevante" : "Irrelevant or Off-Topic Content"}
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {isSpanish ? "Detalles Adicionales (Opcional)" : "Additional Details (Optional)"}
            </label>
            <textarea
              rows={3}
              placeholder={isSpanish ? "Describe el problema en detalle..." : "Describe the issue in detail..."}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {isSpanish ? "Cancelar" : "Cancel"}
            </button>
            <button
              onClick={handleReportSubmit}
              className="bg-[#FF1028] hover:bg-[#D90017] text-white text-xs font-black px-5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              {isSpanish ? "Enviar Reporte" : "Submit Report"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
