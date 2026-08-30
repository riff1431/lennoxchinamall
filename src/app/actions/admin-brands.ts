"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Brand } from "@/types/database";
import { MOCK_BRANDS } from "@/lib/mockData";
import { logAuditEvent } from "@/lib/audit";
import { slugify } from "@/utils/helpers";

const checkAdminAuth = async () => {
  const session = await getSession();
  if (!session || (session.role !== "super_admin" && session.role !== "catalogue_manager")) {
    return { success: false, error: "Unauthorized" };
  }
  return { success: true, session };
};

export async function getAdminBrands() {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  try {
    const supabase = await createClient();
    const { data: brands, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching brands:", error);
      return { success: true, brands: MOCK_BRANDS }; // Fallback
    }

    return { success: true, brands: brands as Brand[] };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { success: true, brands: MOCK_BRANDS }; // Fallback
  }
}

export async function createBrand(data: { name: string; slug?: string; description?: string; logo_url?: string; is_active?: boolean }) {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  try {
    const supabase = await createClient();
    const slug = data.slug || slugify(data.name);

    const { data: brand, error } = await supabase
      .from("brands")
      .insert([{
        name: data.name,
        slug,
        description: data.description,
        logo_url: data.logo_url,
        is_active: data.is_active ?? true,
      }])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: auth.session!.id,
      adminEmail: auth.session!.email,
      action: "BRAND_CREATED",
      entityType: "brand",
      entityId: brand.id,
      changes: { new: brand },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, brand, message: "Brand created successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create brand" };
  }
}

export async function updateBrand(id: string, data: { name?: string; slug?: string; description?: string; logo_url?: string; is_active?: boolean }) {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  try {
    const supabase = await createClient();
    
    // Get old data for audit
    const { data: oldData } = await supabase.from("brands").select("*").eq("id", id).single();

    const { error } = await supabase
      .from("brands")
      .update(data)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: auth.session!.id,
      adminEmail: auth.session!.email,
      action: "BRAND_UPDATED",
      entityType: "brand",
      entityId: id,
      changes: { old: oldData, new: data },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, message: "Brand updated successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update brand" };
  }
}

export async function deleteBrand(id: string) {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  try {
    const supabase = await createClient();
    
    // Check for products
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", id);

    if (countError) {
      return { success: false, error: countError.message };
    }
    
    if (count && count > 0) {
      return { success: false, error: "Cannot delete brand. Reassign or delete products first." };
    }

    // Get old data for audit
    const { data: oldData } = await supabase.from("brands").select("*").eq("id", id).single();

    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: auth.session!.id,
      adminEmail: auth.session!.email,
      action: "BRAND_DELETED",
      entityType: "brand",
      entityId: id,
      changes: { old: oldData },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, message: "Brand deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete brand" };
  }
}

export async function bulkDeleteBrands(ids: string[]) {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  try {
    const supabase = await createClient();

    // Check for products in any of the brands
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .in("brand_id", ids);
      
    if (countError) {
      return { success: false, error: countError.message };
    }

    if (count && count > 0) {
       return { success: false, error: "Cannot delete brands. Reassign or delete products first." };
    }

    const { error } = await supabase
      .from("brands")
      .delete()
      .in("id", ids);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: auth.session!.id,
      adminEmail: auth.session!.email,
      action: "BRAND_DELETED", // Bulk delete audit logic is a bit coarse here
      entityType: "brand",
      entityId: "bulk",
      changes: { ids },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, message: "Brands deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete brands" };
  }
}
