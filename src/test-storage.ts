import { supabase } from "./integrations/supabase/client";

async function testDocuments() {
  const { data, error } = await supabase.storage
    .from("documents")
    .list("", {
      limit: 10,
    });

  console.log("DOCUMENTS:", data);
  console.log("ERROR:", error);
}

testDocuments();