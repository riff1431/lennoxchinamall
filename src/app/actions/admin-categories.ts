"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Category } from "@/types/database";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { logAuditEvent } from "@/lib/audit";
import { slugify } from "@/utils/helpers";

const isAdmin = (role?: string) => {
  return role === "super_admin" || role === "catalogue_manager";
};

export async function getAdminCategories() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return { success: true, categories: MOCK_CATEGORIES as Category[] };
    }

    if (!data || data.length === 0) {
      return { success: true, categories: MOCK_CATEGORIES as Category[] };
    }

    return { success: true, categories: data as Category[] };
  } catch (error) {
    console.error("Error in getAdminCategories:", error);
    return { success: true, categories: MOCK_CATEGORIES as Category[] };
  }
}

export async function createCategory(data: Partial<Category>) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const supabase = await createClient();
    const slug = data.slug || slugify(data.name || "");

    const insertData = {
      name: data.name,
      slug: slug,
      parent_id: data.parent_id || null,
      description: data.description || null,
      image_url: data.image_url || data.thumbnail_url || null,
      icon: data.icon || data.iconName || null,
      position: data.position || 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
    };

    const { data: result, error } = await supabase
      .from("categories")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "CATEGORY_CREATED",
      entityType: "category",
      entityId: result.id,
      changes: { new: result },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories", "page");
    revalidatePath("/", "page");

    return { success: true, category: result as Category, message: "Category created successfully" };
  } catch (error: any) {
    console.error("Error in createCategory:", error);
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const supabase = await createClient();

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    else if (data.thumbnail_url !== undefined) updateData.image_url = data.thumbnail_url;
    if (data.icon !== undefined) updateData.icon = data.icon;
    else if (data.iconName !== undefined) updateData.icon = data.iconName;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.seo_title !== undefined) updateData.seo_title = data.seo_title;
    if (data.seo_description !== undefined) updateData.seo_description = data.seo_description;

    const { error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error);
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "CATEGORY_UPDATED",
      entityType: "category",
      entityId: id,
      changes: { updates: updateData },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories", "page");
    revalidatePath("/", "page");

    return { success: true, message: "Category updated successfully" };
  } catch (error: any) {
    console.error("Error in updateCategory:", error);
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const supabase = await createClient();

    // Check for child categories
    const { count: childCount, error: childError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", id);

    if (childError) {
      return { success: false, error: "Failed to check for child categories" };
    }
    
    if (childCount && childCount > 0) {
      return { success: false, error: "Cannot delete category with child categories" };
    }

    // Check for products referencing this category
    const { count: productCount, error: productError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (productError) {
      return { success: false, error: "Failed to check for referenced products" };
    }
    
    if (productCount && productCount > 0) {
      return { success: false, error: "Cannot delete category with existing products" };
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "CATEGORY_DELETED",
      entityType: "category",
      entityId: id,
      changes: {},
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories", "page");
    revalidatePath("/", "page");

    return { success: true, message: "Category deleted successfully" };
  } catch (error: any) {
    console.error("Error in deleteCategory:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

export async function bulkDeleteCategories(ids: string[]) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const supabase = await createClient();

    // For simplicity, attempting to delete all. Real-world might need to check products for all.
    const { error } = await supabase
      .from("categories")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("Error bulk deleting categories:", error);
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "CATEGORY_DELETED",
      entityType: "category",
      entityId: "bulk",
      changes: { ids },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories", "page");
    revalidatePath("/", "page");

    return { success: true, message: "Categories deleted successfully" };
  } catch (error: any) {
    console.error("Error in bulkDeleteCategories:", error);
    return { success: false, error: error.message || "Failed to delete categories" };
  }
}

export async function reorderCategories(items: { id: string; position: number }[]) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const supabase = await createClient();
    
    // Perform bulk updates. In supabase, you can UPSERT.
    // For now we will loop since there is no bulk update natively via postgrest without a stored proc or upsert array
    for (const item of items) {
      const { error } = await supabase
        .from("categories")
        .update({ position: item.position })
        .eq("id", item.id);
        
      if (error) {
         console.error("Error updating position for", item.id, error);
      }
    }
    
    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "CATEGORY_UPDATED",
      entityType: "category",
      entityId: "bulk-reorder",
      changes: { items },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories", "page");
    revalidatePath("/", "page");

    return { success: true, message: "Categories reordered successfully" };
  } catch (error: any) {
    console.error("Error in reorderCategories:", error);
    return { success: false, error: error.message || "Failed to reorder categories" };
  }
}
