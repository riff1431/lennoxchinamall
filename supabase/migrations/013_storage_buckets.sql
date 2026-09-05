-- ============================================================
-- Migration: Create Supabase Storage Buckets for Media
-- Buckets: products (admin media), reviews (customer review media)
-- ============================================================

-- 1. Create the "products" bucket for admin-uploaded media assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  104857600, -- 100 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'image/avif', 'image/x-icon', 'image/vnd.microsoft.icon',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska',
    'application/pdf',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create the "reviews" bucket for customer review photos/videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reviews',
  'reviews',
  true,
  104857600, -- 100 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- 3. RLS Policies for "products" bucket (admin-only upload, public read)
-- ============================================================

-- Allow anyone to read/view product media (public storefront)
CREATE POLICY "Public read access for products bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'products');

-- Allow authenticated admin/staff to upload product media
CREATE POLICY "Admin upload to products bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Allow authenticated admin/staff to update/replace product media
CREATE POLICY "Admin update products bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products')
  WITH CHECK (bucket_id = 'products');

-- Allow authenticated admin/staff to delete product media
CREATE POLICY "Admin delete from products bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');

-- ============================================================
-- 4. RLS Policies for "reviews" bucket (authenticated upload, public read)
-- ============================================================

-- Allow anyone to read/view review media (public storefront)
CREATE POLICY "Public read access for reviews bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'reviews');

-- Allow authenticated users to upload review media
CREATE POLICY "Authenticated upload to reviews bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reviews');

-- Allow authenticated users to update their own review media
CREATE POLICY "Authenticated update reviews bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'reviews')
  WITH CHECK (bucket_id = 'reviews');

-- Allow authenticated users to delete their own review media
CREATE POLICY "Authenticated delete from reviews bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'reviews');
