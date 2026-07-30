import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({
  path: "./migration/.env.migration",
});

async function main() {
  console.log("=================================");
  console.log(" TESTE DE AUTENTICAÇÃO SUPABASE");
  console.log("=================================\n");

  const supabase = createClient(
    process.env.OLD_SUPABASE_URL,
    process.env.OLD_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  console.log("Restaurando sessão...\n");

  const { data, error } = await supabase.auth.setSession({
    access_token: process.env.OLD_ACCESS_TOKEN,
    refresh_token: process.env.OLD_REFRESH_TOKEN,
  });

  if (error) {
    console.error(error);
    return;
  }

  console.log("Sessão restaurada.\n");

  console.log("Usuário:");

  console.log(data.user);

  console.log("\nLendo candidates...\n");

  const result = await supabase
    .from("candidates")
    .select("cpf,resume_url,other_files_urls")
    .limit(5);

  if (result.error) {
    console.error(result.error);
    return;
  }

  console.table(result.data);
}

main();