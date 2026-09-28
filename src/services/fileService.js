import { base44 } from "@/api/base44Client";

// Evidence is uploaded privately (UploadPrivateFile) — resolve a short-lived
// signed URL whenever a screen needs to display or analyze it.
export async function getSignedUrl(fileUri, expiresIn = 3600) {
  if (!fileUri) return null;
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: expiresIn });
  return signed_url;
}