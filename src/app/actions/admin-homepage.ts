"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";
import { HomepageSection, DEFAULT_HOMEPAGE_SECTIONS } from "@/types/homepage";

// ─── Fetch Admin Sections ───────────────────────────────────────────────────

export async function getAdminHomepageSections(): Promise<{
  success: boolean;
  sections: HomepageSection[];
  error?: string;
}> {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "catalogue_manager", "product_manager"].includes(session.role)) {
    return { success: false, sections: DEFAULT_HOMEPAGE_SECTIONS, error: "Unauthorized." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("position", { ascending: true });

    if (error || !data || data.length === 0) {
      return { success: true, sections: DEFAULT_HOMEPAGE_SECTIONS };
    }

    return { success: true, sections: data as HomepageSection[] };
  } catch (err: any) {
    return { success: true, sections: DEFAULT_HOMEPAGE_SECTIONS };
  }
}

// ─── Create Section ─────────────────────────────────────────────────────────

export async function createHomepageSection(payload: Partial<HomepageSection>) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "catalogue_manager", "product_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const supabase = await createClient();

    // Get max position
    const { data: maxPosData } = await supabase
      .from("homepage_sections")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition = (maxPosData?.[0]?.position || 0) + 1;

    const { data, error } = await supabase
      .from("homepage_sections")
      .insert({
        name: payload.name,
        subtitle: payload.subtitle || null,
        type: payload.type || "featured_products",
        layout: payload.layout || "grid",
        position: nextPosition,
        is_active: payload.is_active ?? true,
        status: payload.status || "published",
        visibility: payload.visibility || "all",
        start_date: payload.start_date || null,
        end_date: payload.end_date || null,
        config: payload.config || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      entityId: data.id,
      changes: { action: "HOMEPAGE_SECTION_CREATED", name: payload.name, type: payload.type },
    });

    revalidatePath("/admin/homepage-sections");
    revalidatePath("/", "page");
    return { success: true, message: `Homepage section "${payload.name}" created!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create section" };
  }
}

// ─── Update Section ─────────────────────────────────────────────────────────

export async function updateHomepageSection(id: string, payload: Partial<HomepageSection>) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "catalogue_manager", "product_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("homepage_sections")
      .update({
        name: payload.name,
        subtitle: payload.subtitle,
        type: payload.type,
        layout: payload.layout,
        is_active: payload.is_active,
        status: payload.status,
        visibility: payload.visibility,
        start_date: payload.start_date,
        end_date: payload.end_date,
        config: payload.config,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      entityId: id,
      changes: { action: "HOMEPAGE_SECTION_UPDATED", name: payload.name },
    });

    revalidatePath("/admin/homepage-sections");
    revalidatePath("/", "page");
    return { success: true, message: `Section "${payload.name}" updated successfully!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update section" };
  }
}

// ─── Delete Section ─────────────────────────────────────────────────────────

export async function deleteHomepageSection(id: string) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return { success: false, error: "Only Super Admins can remove homepage sections." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("homepage_sections").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/homepage-sections");
    revalidatePath("/", "page");
    return { success: true, message: "Homepage section deleted." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete section" };
  }
}

// ─── Reorder Sections ───────────────────────────────────────────────────────

export async function reorderHomepageSections(reorderedIds: string[]) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "catalogue_manager", "product_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const supabase = await createClient();

    const updates = reorderedIds.map((id, index) =>
      supabase
        .from("homepage_sections")
        .update({ position: index + 1, updated_at: new Date().toISOString() })
        .eq("id", id)
    );

    await Promise.all(updates);

    revalidatePath("/admin/homepage-sections");
    revalidatePath("/", "page");
    return { success: true, message: "Homepage layout sequence saved!" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save reordering" };
  }
}

// ─── Toggle Section Active Status ───────────────────────────────────────────

export async function toggleSectionStatus(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "catalogue_manager", "product_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("homepage_sections")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/homepage-sections");
    revalidatePath("/", "page");
    return { success: true, message: `Section ${isActive ? "published" : "hidden"} on storefront!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed status toggle" };
  }
}

// ─── Storefront Public Sections Fetcher ─────────────────────────────────────

export async function getStorefrontHomepageData(): Promise<HomepageSection[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("is_active", true)
      .eq("status", "published")
      .order("position", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_HOMEPAGE_SECTIONS;
    }

    const now = new Date();
    const activeSections = data.filter((sec: any) => {
      if (sec.start_date && new Date(sec.start_date) > now) return false;
      if (sec.end_date && new Date(sec.end_date) < now) return false;
      return true;
    });

    return (activeSections.length > 0 ? activeSections : DEFAULT_HOMEPAGE_SECTIONS) as HomepageSection[];
  } catch {
    return DEFAULT_HOMEPAGE_SECTIONS;
  }
}
