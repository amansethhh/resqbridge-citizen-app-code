import { base44 } from "@/api/base44Client";

// AI abstraction: the UI only ever calls analyzeEvidenceImage(). Today it
// calls our analyzeEvidence backend function (which uses InvokeLLM); this can
// be repointed at a dedicated AI backend later without changing any screen.
export async function analyzeEvidenceImage({ imageUrl, description, emergencyType }) {
  try {
    const res = await base44.functions.invoke("analyzeEvidence", { imageUrl, description, emergencyType });
    if (res.data?.status === "success") {
      return { status: "success", ...res.data.analysis };
    }
    return { status: "error" };
  } catch (err) {
    return { status: "error" };
  }
}