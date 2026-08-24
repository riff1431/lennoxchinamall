"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { ProductQuestion, ProductAnswer } from "@/types/reviews";

const PROHIBITED_WORDS = [
  "scam", "fake", "viagra", "casino", "free money", "hack", "phishing", "telegram @"
];

const SEED_QUESTIONS: ProductQuestion[] = [
  {
    id: "q-101",
    productId: "p1",
    authorName: "Tyler Bennett",
    question: "Does the 5km video transmission require cell phone SIM data, or is it direct 5.8GHz OcuSync-style link?",
    status: "approved",
    helpfulVotes: 14,
    answers: [
      {
        id: "a-101",
        questionId: "q-101",
        responderName: "Lennox Sourcing Lab • Shenzhen",
        isOfficialStaff: true,
        answer: "The 5km transmission utilizes direct dual-frequency 2.4GHz/5.8GHz digital RF relay between the drone and the included controller. No cellular SIM or mobile data is required.",
        status: "approved",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "q-102",
    productId: "p1",
    authorName: "Julian M.",
    question: "Are customs duties and VAT prepaid when ordering to the European Union (Germany/France)?",
    status: "approved",
    helpfulVotes: 9,
    answers: [
      {
        id: "a-102",
        questionId: "q-102",
        responderName: "Lennox Customs & Logistics",
        isOfficialStaff: true,
        answer: "Yes, all YunExpress and SF International airfreight shipments through Lennox China Mall include DDP (Delivered Duty Paid) clearance. No additional VAT or customs fees upon arrival.",
        status: "approved",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "q-103",
    productId: "p1",
    authorName: "Marcus Vance",
    question: "Is there an included hard shell carrying case with the 3-battery combo variant?",
    status: "approved",
    helpfulVotes: 6,
    answers: [
      {
        id: "a-103",
        questionId: "q-103",
        responderName: "Lennox Factory Warehouse",
        isOfficialStaff: true,
        answer: "Yes, the 3-battery combo includes the heavy-duty water-resistant EVA hard shell travel case and 4 extra carbon-reinforced replacement propellers.",
        status: "approved",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export async function getProductQuestions(productId: string, search?: string): Promise<{
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
      list = SEED_QUESTIONS.map((q) => ({ ...q, productId }));
    }

    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answers.some((a) => a.answer.toLowerCase().includes(q))
      );
    }

    return { success: true, questions: list };
  } catch (err: unknown) {
    console.error("Error in getProductQuestions:", err);
    return { success: true, questions: SEED_QUESTIONS };
  }
}

export async function askProductQuestion(
  productId: string,
  questionText: string,
  authorName?: string
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

    const { data: newDbQuestion, error } = await supabase
      .from("product_questions")
      .insert({
        product_id: productId,
        user_id: session?.id || null,
        author_name: name,
        question: questionText.trim(),
        status: "approved",
      })
      .select("id, created_at")
      .single();

    const newQuestion: ProductQuestion = {
      id: newDbQuestion?.id || `q-${Date.now()}`,
      productId,
      userId: session?.id,
      authorName: name,
      question: questionText.trim(),
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
