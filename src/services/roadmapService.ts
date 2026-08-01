import type { SupabaseClient } from "@supabase/supabase-js";
import { recruitmentRoadmapReleases, type RoadmapRelease } from "@/types/roadmap";

type ToastLike = {
  error: (message: string) => void;
  success?: (message: string) => void;
};

const isDevEnvironment = import.meta.env.DEV;

export async function fetchRoadmapConfig(
  supabaseClient?: SupabaseClient | null,
  toast?: ToastLike
): Promise<RoadmapRelease[]> {
  if (!supabaseClient) {
    return Object.values(recruitmentRoadmapReleases);
  }

  try {
    const { data, error } = await supabaseClient
      .from("recruitment_roadmap")
      .select("*")
      .order("version", { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return Object.values(recruitmentRoadmapReleases);
    }

    return data as RoadmapRelease[];
  } catch (error) {
    if (isDevEnvironment) {
      console.debug("[roadmapService] Falha ao carregar roadmap", error);
    }

    toast?.error?.("Não foi possível carregar o roadmap de recrutamento.");
    return Object.values(recruitmentRoadmapReleases);
  }
}