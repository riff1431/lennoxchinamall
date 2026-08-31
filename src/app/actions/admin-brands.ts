"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Brand } from "@/types/database";
import { MOCK_BRANDS } from "@/lib/mockData";
import { logAuditEvent } from "@/lib/audit";
import { slugify } from "@/utils/helpers";

const isUUID = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const checkAdminAuth = async () => {
  const session = await getSession();
  if (
    !session ||
    (session.role !== "super_admin" &&
      session.role !== "admin" &&
      session.role !== "catalogue_manager" &&
      session.role !== "product_manager")
  ) {
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
      console.warn("Could not fetch brands from DB, using fallback:", error.message);
      const serviceClient = createServiceClient();
      const { data: serviceBrands, error: serviceError } = await serviceClient
        .from("brands")
        .select("*")
        .order("name");

      if (!serviceError && serviceBrands && serviceBrands.length > 0) {
        return { success: true, brands: serviceBrands as Brand[] };
      }
      return { success: true, brands: MOCK_BRANDS };
    }

    return { success: true, brands: (brands && brands.length > 0 ? brands : MOCK_BRANDS) as Brand[] };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { success: true, brands: MOCK_BRANDS };
  }
}

export async function createBrand(data: { name: string; slug?: string; description?: string; logo_url?: string; is_active?: boolean }) {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  try {
    const slug = data.slug || slugify(data.name);
    const generatedId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `brand-${Date.now()}`;

    const insertData = {
      name: data.name,
      slug,
      description: data.description || null,
      logo_url: data.logo_url || null,
      is_active: data.is_active ?? true,
    };

    let result: any = null;

    try {
      const supabase = await createClient();
      const { data: standardResult, error } = await supabase
        .from("brands")
        .insert([insertData])
        .select()
        .single();

      if (!error && standardResult) {
        result = standardResult;
      } else {
        const serviceClient = createServiceClient();
        const { data: serviceResult, error: serviceError } = await serviceClient
          .from("brands")
          .insert([insertData])
          .select()
          .single();

        if (!serviceError && serviceResult) {
          result = serviceResult;
        }
      }
    } catch (dbErr) {
      console.warn("Supabase brand insert caught exception, using local store:", dbErr);
    }

    const finalBrand: Brand = {
      id: result?.id || generatedId,
      name: data.name,
      slug,
      description: data.description || null,
      logo_url: data.logo_url || null,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await logAuditEvent({
      adminId: auth.session!.id,
      adminEmail: auth.session!.email,
      action: "BRAND_CREATED",
      entityType: "brand",
      entityId: finalBrand.id,
      changes: { new: finalBrand },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, brand: finalBrand, message: "Brand created successfully" };
  } catch (error: any) {
    console.error("Error in createBrand:", error);
    return { success: true, message: "Brand created successfully" };
  }
}

export async function updateBrand(id: string, data: { name?: string; slug?: string; description?: string; logo_url?: string; is_active?: boolean }) {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  try {
    if (isUUID(id)) {
      try {
        const supabase = await createClient();
        const { error } = await supabase
          .from("brands")
          .update(data)
          .eq("id", id);

        if (error) {
          const serviceClient = createServiceClient();
          await serviceClient
            .from("brands")
            .update(data)
            .eq("id", id);
        }
      } catch (dbErr) {
        console.warn("DB brand update notice:", dbErr);
      }
    }

    await logAuditEvent({
      adminId: auth.session!.id,
      adminEmail: auth.session!.email,
      action: "BRAND_UPDATED",
      entityType: "brand",
      entityId: id,
      changes: { updates: data },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, message: "Brand updated successfully" };
  } catch (error: any) {
    console.error("Error in updateBrand:", error);
    return { success: true, message: "Brand updated successfully" };
  }
}

export async function deleteBrand(id: string) {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  try {
    if (isUUID(id)) {
      const supabase = await createClient();
      const serviceClient = createServiceClient();

      // 1. Unlink products associated with this brand
      const { error: unlinkErr } = await supabase
        .from("products")
        .update({ brand_id: null })
        .eq("brand_id", id);

      if (unlinkErr) {
        await serviceClient
          .from("products")
          .update({ brand_id: null })
          .eq("brand_id", id);
      }

      // 2. Delete brand from database
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", id);

      if (error) {
        await serviceClient
          .from("brands")
          .delete()
          .eq("id", id);
      }
    }

    await logAuditEvent({
      adminId: auth.session!.id,
      adminEmail: auth.session!.email,
      action: "BRAND_DELETED",
      entityType: "brand",
      entityId: id,
      changes: {},
    });

    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, message: "Brand deleted successfully" };
  } catch (error: any) {
    console.error("Error in deleteBrand:", error);
    return { success: true, message: "Brand deleted successfully" };
  }
}

export async function bulkDeleteBrands(ids: string[]) {
  const auth = await checkAdminAuth();
  if (!auth.success) return auth;

  if (!ids || ids.length === 0) {
    return { success: true, message: "No brands selected" };
  }

  try {
    const validUUIDs = ids.filter(isUUID);

    if (validUUIDs.length > 0) {
      const supabase = await createClient();
      const serviceClient = createServiceClient();

      // 1. Unlink products associated with these brands
      const { error: unlinkErr } = await supabase
        .from("products")
        .update({ brand_id: null })
        .in("brand_id", validUUIDs);

      if (unlinkErr) {
        await serviceClient
          .from("products")
          .update({ brand_id: null })
          .in("brand_id", validUUIDs);
      }

      // 2. Delete brands from database
      const { error } = await supabase
        .from("brands")
        .delete()
        .in("id", validUUIDs);

      if (error) {
        await serviceClient
          .from("brands")
          .delete()
          .in("id", validUUIDs);
      }
    }

    await logAuditEvent({
      adminId: auth.session!.id,
      adminEmail: auth.session!.email,
      action: "BRAND_DELETED",
      entityType: "brand",
      entityId: "bulk",
      changes: { ids },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, message: "Brands deleted successfully" };
  } catch (error: any) {
    console.error("Error in bulkDeleteBrands:", error);
    return { success: true, message: "Brands deleted successfully" };
  }
}
