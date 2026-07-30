import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function TestStorage() {
  useEffect(() => {
    async function testDocuments() {
      const { data, error } = await supabase.storage
        .from("documents")
        .list("", {
          limit: 10,
        });

      console.log("DOCUMENTS LIST:", data);
      console.log("DOCUMENTS ERROR:", error);
    }

    testDocuments();
  }, []);

  return null;
}