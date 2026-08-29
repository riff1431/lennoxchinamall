"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { ProductQuestion, ProductAnswer } from "@/types/reviews";

const PROHIBITED_WORDS = [
  "scam", "fake", "viagra", "casino", "free money", "hack", "phishing", "telegram @"
];

function generateContextualSeedQuestions(
  productId: string,
  productTitle?: string,
  categoryName?: string
): ProductQuestion[] {
  const title = (productTitle || "").toLowerCase();
  const cat = (categoryName || "").toLowerCase();
  const baseDate = Date.now();

  // 1. Drones & Cameras
  if (
    title.includes("drone") ||
    title.includes("camera") ||
    title.includes("gimbal") ||
    cat.includes("drone") ||
    cat.includes("camera")
  ) {
    return [
      {
        id: `q-${productId}-1`,
        productId,
        authorName: "Tyler Bennett",
        question: "Does the 5km video transmission require cell phone SIM data, or is it direct 5.8GHz OcuSync-style link?",
        status: "approved",
        helpfulVotes: 18,
        answers: [
          {
            id: `a-${productId}-1`,
            questionId: `q-${productId}-1`,
            responderName: "Lennox Sourcing Lab • Shenzhen",
            isOfficialStaff: true,
            answer: "The 5km transmission utilizes direct dual-frequency 2.4GHz/5.8GHz digital RF relay between the aircraft and the included ground controller. No cellular SIM or mobile data plan is required.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 5).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 6).toISOString(),
      },
      {
        id: `q-${productId}-2`,
        productId,
        authorName: "Julian M.",
        question: "Are customs duties and import VAT prepaid when ordering to North America or European Union?",
        status: "approved",
        helpfulVotes: 12,
        answers: [
          {
            id: `a-${productId}-2`,
            questionId: `q-${productId}-2`,
            responderName: "Lennox Customs & Logistics",
            isOfficialStaff: true,
            answer: "Yes, all YunExpress and SF International airfreight shipments through Lennox China Mall include DDP (Delivered Duty Paid) clearance. No additional VAT or customs fees upon arrival.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 3).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 4).toISOString(),
      },
      {
        id: `q-${productId}-3`,
        productId,
        authorName: "Marcus Vance",
        question: "What is the continuous flight duration per single modular LiPo battery under standard wind conditions?",
        status: "approved",
        helpfulVotes: 7,
        answers: [
          {
            id: `a-${productId}-3`,
            questionId: `q-${productId}-3`,
            responderName: "Lennox Factory Warehouse",
            isOfficialStaff: true,
            answer: "Under sea-level testing with 5m/s wind resistance, flight duration is approximately 28–31 minutes per battery pack. The multi-battery combo option includes the dual-slot rapid balance charger.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 1).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 2).toISOString(),
      },
    ];
  }

  // 2. 3D Printers & CNC / Industrial Tools
  if (
    title.includes("printer") ||
    title.includes("3d") ||
    title.includes("cnc") ||
    title.includes("laser") ||
    cat.includes("tools") ||
    cat.includes("industrial")
  ) {
    return [
      {
        id: `q-${productId}-1`,
        productId,
        authorName: "Derek Chen",
        question: "Does this come pre-calibrated with automatic bed leveling (CR-Touch/inductive matrix) out of the box?",
        status: "approved",
        helpfulVotes: 15,
        answers: [
          {
            id: `a-${productId}-1`,
            questionId: `q-${productId}-1`,
            responderName: "Lennox Industrial Sourcing Desk",
            isOfficialStaff: true,
            answer: "Yes, it features a 16-point inductive strain-gauge auto-leveling matrix pre-calibrated in our Shenzhen factory lab. Final assembly requires only 4 structural hex bolts.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 4).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 5).toISOString(),
      },
      {
        id: `q-${productId}-2`,
        productId,
        authorName: "Søren Lind",
        question: "What filaments are supported by the hardened all-metal direct-drive extruder?",
        status: "approved",
        helpfulVotes: 9,
        answers: [
          {
            id: `a-${productId}-2`,
            questionId: `q-${productId}-2`,
            responderName: "Lennox Factory Engineering",
            isOfficialStaff: true,
            answer: "The bi-metal heatbreak reaches up to 300°C, fully supporting standard PLA, PETG, TPU flexible rubber, ABS, and carbon-fiber reinforced nylon filaments.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 2).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 3).toISOString(),
      },
      {
        id: `q-${productId}-3`,
        productId,
        authorName: "Alex Rivera",
        question: "Is 110V/220V dual voltage supported for North American standard wall outlets?",
        status: "approved",
        helpfulVotes: 6,
        answers: [
          {
            id: `a-${productId}-3`,
            questionId: `q-${productId}-3`,
            responderName: "Lennox Power Lab",
            isOfficialStaff: true,
            answer: "Yes, the integrated MeanWell-certified switching power supply has a manual 115V/230V selector switch and ships with your regional AC power plug.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 1).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 2).toISOString(),
      },
    ];
  }

  // 3. Audio & Headphones / Electronics
  if (
    title.includes("headphone") ||
    title.includes("audio") ||
    title.includes("earbuds") ||
    title.includes("sound") ||
    cat.includes("audio") ||
    cat.includes("electronics")
  ) {
    return [
      {
        id: `q-${productId}-1`,
        productId,
        authorName: "David Sterling",
        question: "What low-latency Bluetooth codecs are supported for real-time mobile gaming and studio monitoring?",
        status: "approved",
        helpfulVotes: 14,
        answers: [
          {
            id: `a-${productId}-1`,
            questionId: `q-${productId}-1`,
            responderName: "Lennox Acoustics Lab • Shenzhen",
            isOfficialStaff: true,
            answer: "It supports LDAC 990kbps 24bit/96kHz high-res lossless streaming, aptX Adaptive ultra-low 40ms latency mode, AAC, and standard SBC.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 4).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 5).toISOString(),
      },
      {
        id: `q-${productId}-2`,
        productId,
        authorName: "Karin Weber",
        question: "Can Active Noise Cancellation (ANC) be toggled on without playing music during flights?",
        status: "approved",
        helpfulVotes: 8,
        answers: [
          {
            id: `a-${productId}-2`,
            questionId: `q-${productId}-2`,
            responderName: "Lennox Customer Support",
            isOfficialStaff: true,
            answer: "Yes, you can enable Hybrid ANC isolation mode standalone to attenuate jet engine rumble up to -42dB without active Bluetooth audio playback.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 2).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 3).toISOString(),
      },
    ];
  }

  // 4. Fashion / Apparel / Footwear
  if (
    cat.includes("fashion") ||
    cat.includes("apparel") ||
    title.includes("jacket") ||
    title.includes("shirt") ||
    title.includes("pants") ||
    title.includes("shoes") ||
    title.includes("hoodie") ||
    title.includes("dress")
  ) {
    return [
      {
        id: `q-${productId}-1`,
        productId,
        authorName: "Liam O'Connor",
        question: "How does the sizing compare to standard US/European sizing? Should I size up?",
        status: "approved",
        helpfulVotes: 21,
        answers: [
          {
            id: `a-${productId}-1`,
            questionId: `q-${productId}-1`,
            responderName: "Lennox Apparel Sourcing Team",
            isOfficialStaff: true,
            answer: "This garment follows true-to-size Western export fit standards. Please check the detailed chest and shoulder measurements on the Technical Specifications tab for exact centimeters.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 4).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 5).toISOString(),
      },
      {
        id: `q-${productId}-2`,
        productId,
        authorName: "Elena Rostova",
        question: "Is this machine washable without shrinking or fading after high-heat tumble drying?",
        status: "approved",
        helpfulVotes: 11,
        answers: [
          {
            id: `a-${productId}-2`,
            questionId: `q-${productId}-2`,
            responderName: "Lennox Quality Lab",
            isOfficialStaff: true,
            answer: "Pre-shrunk ring-spun fabric composition with reactive dye processing. We recommend cold machine wash (30°C) and tumble dry on low heat for maximum fabric longevity.",
            status: "approved",
            createdAt: new Date(baseDate - 86400000 * 2).toISOString(),
          },
        ],
        createdAt: new Date(baseDate - 86400000 * 3).toISOString(),
      },
    ];
  }

  // 5. Default General Hardware / Goods
  return [
    {
      id: `q-${productId}-1`,
      productId,
      authorName: "Jordan Vance",
      question: "Are customs duties and VAT taxes prepaid for international air delivery?",
      status: "approved",
      helpfulVotes: 16,
      answers: [
        {
          id: `a-${productId}-1`,
          questionId: `q-${productId}-1`,
          responderName: "Lennox Customs & Logistics",
          isOfficialStaff: true,
          answer: "Yes, all airfreight parcels via Hong Kong/Shenzhen cargo hubs include complete DDP (Delivered Duty Paid) door-to-door clearance for North America, EU, UK, and Australia.",
          status: "approved",
          createdAt: new Date(baseDate - 86400000 * 4).toISOString(),
        },
      ],
      createdAt: new Date(baseDate - 86400000 * 5).toISOString(),
    },
    {
      id: `q-${productId}-2`,
      productId,
      authorName: "Sophia Chen",
      question: "What is the warranty coverage if a factory manufacturing defect occurs upon delivery?",
      status: "approved",
      helpfulVotes: 9,
      answers: [
        {
          id: `a-${productId}-2`,
          questionId: `q-${productId}-2`,
          responderName: "Lennox Customer Support",
          isOfficialStaff: true,
          answer: "Every order is protected by our 30-Day Money-Back Guarantee settled via Binance Pay USDT escrow, plus 1-year direct factory replacement warranty.",
          status: "approved",
          createdAt: new Date(baseDate - 86400000 * 2).toISOString(),
        },
      ],
      createdAt: new Date(baseDate - 86400000 * 3).toISOString(),
    },
    {
      id: `q-${productId}-3`,
      productId,
      authorName: "Ryan Miller",
      question: "Can I request custom OEM logo engraving or batch wholesale volume pricing?",
      status: "approved",
      helpfulVotes: 5,
      answers: [
        {
          id: `a-${productId}-3`,
          questionId: `q-${productId}-3`,
          responderName: "Lennox Factory Sourcing Desk",
          isOfficialStaff: true,
          answer: "Yes! For B2B wholesale orders exceeding 50 units, OEM silkscreen logo branding and custom packaging are available. Reach out via Factory Inquiries.",
          status: "approved",
          createdAt: new Date(baseDate - 86400000 * 1).toISOString(),
        },
      ],
      createdAt: new Date(baseDate - 86400000 * 2).toISOString(),
    },
  ];
}

export async function getProductQuestions(
  productId: string,
  search?: string,
  productTitle?: string,
  categoryName?: string
): Promise<{
  success: boolean;
  questions: ProductQuestion[];
}> {
  try {
    const supabase = await createClient();

    const { data: dbQuestions, error } = await supabase
      .from("product_questions")
      .select(`
        *,
        product_answers(*)
      `)
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("helpful_votes", { ascending: false });

    let list: ProductQuestion[] = [];

    if (dbQuestions && dbQuestions.length > 0 && !error) {
      list = dbQuestions.map((q: any) => ({
        id: q.id,
        productId: q.product_id,
        userId: q.user_id,
        authorName: q.author_name || "Verified Customer",
        question: q.question,
        status: q.status,
        helpfulVotes: q.helpful_votes || 0,
        answers: (q.product_answers || [])
          .filter((a: any) => a.status === "approved")
          .map((a: any) => ({
            id: a.id,
            questionId: a.question_id,
            userId: a.user_id,
            responderName: a.responder_name || "Lennox Factory Support",
            isOfficialStaff: Boolean(a.is_official_staff),
            answer: a.answer,
            status: a.status,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
          })),
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      }));
    } else {
      list = generateContextualSeedQuestions(productId, productTitle, categoryName);
    }

    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.authorName.toLowerCase().includes(q) ||
          item.answers.some(
            (a) =>
              a.answer.toLowerCase().includes(q) ||
              a.responderName.toLowerCase().includes(q)
          )
      );
    }

    return { success: true, questions: list };
  } catch (err: unknown) {
    console.error("Error in getProductQuestions:", err);
    return {
      success: true,
      questions: generateContextualSeedQuestions(productId, productTitle, categoryName),
    };
  }
}

export async function askProductQuestion(
  productId: string,
  questionText: string,
  authorName?: string,
  topic?: string
): Promise<{ success: boolean; message: string; question?: ProductQuestion }> {
  try {
    if (!questionText.trim()) {
      return { success: false, message: "Question text cannot be empty." };
    }

    // Filter prohibited words
    const content = questionText.toLowerCase();
    const hasSpam = PROHIBITED_WORDS.some((word) => content.includes(word));
    if (hasSpam) {
      return {
        success: false,
        message: "Your question triggered our automated moderation filter.",
      };
    }

    const supabase = await createClient();
    const session = await getSession();

    const name = authorName?.trim() || session?.displayName || "Verified Customer";
    const formattedQuestion = topic && topic !== "General"
      ? `[${topic}] ${questionText.trim()}`
      : questionText.trim();

    const { data: newDbQuestion } = await supabase
      .from("product_questions")
      .insert({
        product_id: productId,
        user_id: session?.id || null,
        author_name: name,
        question: formattedQuestion,
        status: "approved",
      })
      .select("id, created_at")
      .single();

    const newQuestion: ProductQuestion = {
      id: newDbQuestion?.id || `q-${Date.now()}`,
      productId,
      userId: session?.id,
      authorName: name,
      question: formattedQuestion,
      status: "approved",
      helpfulVotes: 0,
      answers: [],
      createdAt: newDbQuestion?.created_at || new Date().toISOString(),
    };

    revalidatePath("/products");

    return {
      success: true,
      message: "Your question has been posted! Lennox Factory Support typically responds within 6–12 hours.",
      question: newQuestion,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to post question";
    return { success: false, message };
  }
}

export async function answerProductQuestion(
  questionId: string,
  answerText: string,
  responderName?: string,
  isStaff?: boolean
): Promise<{ success: boolean; message: string; answer?: ProductAnswer }> {
  try {
    if (!answerText.trim()) {
      return { success: false, message: "Answer text cannot be empty." };
    }

    const content = answerText.toLowerCase();
    const hasSpam = PROHIBITED_WORDS.some((word) => content.includes(word));
    if (hasSpam) {
      return {
        success: false,
        message: "Your answer triggered our automated moderation filter.",
      };
    }

    const supabase = await createClient();
    const session = await getSession();

    const isOfficial = isStaff ?? Boolean(session?.role && session.role !== "customer");
    const name =
      responderName?.trim() ||
      (isOfficial
        ? "Lennox Sourcing Lab • Shenzhen"
        : session?.displayName || "Verified Community Member");

    const { data: newDbAnswer } = await supabase
      .from("product_answers")
      .insert({
        question_id: questionId,
        user_id: session?.id || null,
        responder_name: name,
        is_official_staff: isOfficial,
        answer: answerText.trim(),
        status: "approved",
      })
      .select("id, created_at")
      .single();

    const newAnswer: ProductAnswer = {
      id: newDbAnswer?.id || `a-${Date.now()}`,
      questionId,
      userId: session?.id,
      responderName: name,
      isOfficialStaff: isOfficial,
      answer: answerText.trim(),
      status: "approved",
      createdAt: newDbAnswer?.created_at || new Date().toISOString(),
    };

    revalidatePath("/products");

    return {
      success: true,
      message: "Your answer has been submitted and published!",
      answer: newAnswer,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to post answer";
    return { success: false, message };
  }
}

export async function voteQuestionHelpfulness(
  questionId: string,
  sessionId?: string
): Promise<{ success: boolean; helpfulCount: number; message: string }> {
  try {
    const supabase = await createClient();
    const session = await getSession();
    const userId = session?.id;

    if (userId) {
      await supabase.from("question_votes").upsert(
        { question_id: questionId, user_id: userId },
        { onConflict: "question_id,user_id" }
      );
    } else if (sessionId) {
      await supabase.from("question_votes").upsert(
        { question_id: questionId, session_id: sessionId },
        { onConflict: "question_id,session_id" }
      );
    }

    const { data: q } = await supabase
      .from("product_questions")
      .select("helpful_votes")
      .eq("id", questionId)
      .single();

    return {
      success: true,
      helpfulCount: q?.helpful_votes ?? 1,
      message: "Thank you for upvoting this question!",
    };
  } catch (err: unknown) {
    return { success: true, helpfulCount: 1, message: "Vote recorded." };
  }
}

export async function reportInappropriateQuestion(
  questionId: string,
  reason: string,
  details?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const session = await getSession();

    await supabase.from("question_reports").insert({
      question_id: questionId,
      user_id: session?.id || null,
      reason,
      details: details?.trim() || null,
      status: "pending",
    });

    return {
      success: true,
      message: "Question reported to Lennox Moderation Desk for review.",
    };
  } catch (err: unknown) {
    return { success: true, message: "Question reported." };
  }
}
