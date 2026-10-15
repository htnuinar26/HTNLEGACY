import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET;

function getStorage() {
  if (!supabaseUrl || !supabaseKey || !bucket) {
    throw new Error("Supabase Storage environment belum lengkap.");
  }
  return { client: createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } }), bucket };
}

export async function uploadStorageObject(path: string, body: Buffer, contentType: string) {
  const { client, bucket } = getStorage();
  const { error } = await client.storage.from(bucket).upload(path, body, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function createStorageSignedUrl(path: string, expiresIn = 3600) {
  if (!path || path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) return path;
  const { client, bucket } = getStorage();
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeStorageObjects(paths: string[]) {
  if (paths.length === 0) return;
  const { client, bucket } = getStorage();
  const { error } = await client.storage.from(bucket).remove(paths);
  if (error) throw error;
}

export async function downloadStorageObject(path: string) {
  const { client, bucket } = getStorage();
  const { data, error } = await client.storage.from(bucket).download(path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

export async function listStorageObjects(prefix: string) {
  const { client, bucket } = getStorage();
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw error;
  return data;
}
