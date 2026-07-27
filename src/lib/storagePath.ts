import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Given a stored value (either a legacy public URL or a bare storage path),
 * return the object path within the bucket.
 */
export function extractStoragePath(bucket: string, value: string | null | undefined): string | null {
  if (!value) return null;
  const markers = [`/object/public/${bucket}/`, `/object/sign/${bucket}/`, `/object/${bucket}/`];
  for (const m of markers) {
    const i = value.indexOf(m);
    if (i >= 0) {
      const rest = value.substring(i + m.length);
      return rest.split("?")[0];
    }
  }
  // Bare path (may include query token) — strip any query string
  return value.split("?")[0];
}

/**
 * Create a signed URL for a stored value in the given bucket. Works with both
 * bare paths and legacy public URLs saved before the bucket was made private.
 */
export async function getSignedStorageUrl(
  bucket: string,
  value: string | null | undefined,
  expiresIn = 3600
): Promise<string | null> {
  const path = extractStoragePath(bucket, value);
  if (!path) return null;
  console.log("Tentativa de createSignedUrl:", { bucket, path, expiresIn });
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  console.log("Resultado createSignedUrl:", { data, error });
  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * React hook that returns a signed URL for a stored value. Refreshes when the
 * bucket or value changes.
 */
export function useSignedStorageUrl(
  bucket: string,
  value: string | null | undefined,
  expiresIn = 3600
): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    let active = true;
    setUrl(undefined);
    if (!value) return;
    getSignedStorageUrl(bucket, value, expiresIn).then((u) => {
      if (active) setUrl(u ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [bucket, value, expiresIn]);
  return url;
}

/**
 * React hook for arrays of storage values (e.g. otherFilesUrls). Returns
 * signed URLs in the same order as inputs.
 */
export function useSignedStorageUrls(
  bucket: string,
  values: (string | null | undefined)[] | undefined,
  expiresIn = 3600
): string[] {
  const [urls, setUrls] = useState<string[]>([]);
  const key = (values || []).join("|");
  useEffect(() => {
    let active = true;
    if (!values || values.length === 0) {
      setUrls([]);
      return;
    }
    Promise.all(values.map((v) => getSignedStorageUrl(bucket, v, expiresIn))).then((resolved) => {
      if (active) setUrls(resolved.map((u) => u || ""));
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, key, expiresIn]);
  return urls;
}
