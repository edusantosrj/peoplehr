/**
 * ============================================================
 * PEOPLE RH
 * MIGRAÇÃO DO STORAGE DOCUMENTS
 * ============================================================
 *
 * PARTE 1A - BASE DO MIGRADOR
 *
 * Objetivo:
 * - Preparar ambiente
 * - Validar autenticação
 * - Criar estrutura para próximas etapas
 *
 * Não realiza nenhuma migração nesta etapa.
 *
 * ============================================================
 */


import dotenv from "dotenv";

dotenv.config({
  path: "./migration/.env.migration"
});


import { createClient } from "@supabase/supabase-js";

import path from "path";



/* ============================================================
   CONFIGURAÇÕES
============================================================ */


const CONFIG = {

  dryRun: process.argv.includes("--dry-run"),

  bucket: "documents",

  old: {

    url: process.env.OLD_SUPABASE_URL,

    key: process.env.OLD_SUPABASE_PUBLISHABLE_KEY

  },


  new: {

    url: process.env.NEW_SUPABASE_URL,

    key: process.env.NEW_SERVICE_ROLE_KEY

  }

};




/* ============================================================
   VALIDAÇÃO DE AMBIENTE
============================================================ */


function validateEnvironment() {


  const required = [

    "OLD_SUPABASE_URL",

    "OLD_SUPABASE_PUBLISHABLE_KEY",

    "OLD_ACCESS_TOKEN",

    "OLD_REFRESH_TOKEN",

    "NEW_SUPABASE_URL",

    "NEW_SERVICE_ROLE_KEY"

  ];


  const missing = required.filter(

    item => !process.env[item]

  );


  if (missing.length) {


    console.error("");

    console.error(
      "ERRO: Variáveis ausentes no .env.migration"
    );


    missing.forEach(item => {

      console.error(`- ${item}`);

    });


    console.error("");

    process.exit(1);

  }


}




/* ============================================================
   CLIENTES SUPABASE
============================================================ */


const oldSupabase = createClient(

  CONFIG.old.url,

  CONFIG.old.key,

  {

    auth: {

      persistSession: true

    }

  }

);



const newSupabase = createClient(

  CONFIG.new.url,

  CONFIG.new.key,

  {

    auth: {

      persistSession: false

    }

  }

);





/* ============================================================
   ESTATÍSTICAS DA MIGRAÇÃO
============================================================ */


const stats = {

  candidates: 0,

  filesFound: 0,

  filesMigrated: 0,

  filesSkipped: 0,

  errors: 0

};





/* ============================================================
   FUNÇÕES AUXILIARES
============================================================ */


function separator() {


  console.log("");

  console.log(
    "============================================================"
  );

  console.log("");

}




function log(message) {


  const now = new Date()

    .toLocaleTimeString("pt-BR");


  console.log(

    `[${now}] ${message}`

  );

}



/* ============================================================
   AUTENTICAÇÃO PROJETO ANTIGO
============================================================ */


async function restoreOldSession() {


  log(
    "Restaurando sessão do projeto antigo..."
  );



  const {

    OLD_ACCESS_TOKEN,

    OLD_REFRESH_TOKEN


  } = process.env;



  const {

    data,

    error


  } = await oldSupabase.auth.setSession({


    access_token: OLD_ACCESS_TOKEN,


    refresh_token: OLD_REFRESH_TOKEN


  });



  if (error) {

    throw error;

  }



  if (!data.session) {


    throw new Error(

      "Não foi possível restaurar a sessão antiga."

    );

  }



  log(

    "Sessão restaurada com sucesso."

  );



  console.log("");

  console.log("Usuário:");

  console.log(data.session.user);

  console.log("");

}


/* ============================================================
   INICIALIZAÇÃO
============================================================ */


/* ============================================================
   PARTE 1D
   FLUXO DE VALIDAÇÃO COMPLETO

   Objetivo:
   - Executar validações de origem e destino
   - Confirmar ambiente antes da migração real

   NÃO realiza upload.
   NÃO altera arquivos.
   NÃO altera banco.
============================================================ */


/* ============================================================
   PARTE 1B
   LEITURA DO BUCKET DOCUMENTS
============================================================ */

async function scanDocuments() {

  separator();

  log(
    "Iniciando leitura dos documentos dos candidatos..."
  );


  const { data: candidates, error } =
    await oldSupabase
      .from("candidates")
      .select(
        `
          cpf,
          resume_url,
          other_files_urls
        `
      );


  if (error) {

    throw error;

  }


  if (!candidates || candidates.length === 0) {

    log(
      "Nenhum candidato encontrado."
    );

    return;

  }


  stats.candidates = candidates.length;


  const documents = [];


  for (const candidate of candidates) {


    if (candidate.resume_url) {

      documents.push({

        cpf: candidate.cpf,

        type: "resume",

        url: candidate.resume_url

      });

    }


    if (Array.isArray(candidate.other_files_urls)) {


      candidate.other_files_urls.forEach(file => {


        documents.push({

          cpf: candidate.cpf,

          type: "other",

          url: file

        });


      });


    }


  }


  stats.filesFound = documents.length;


  console.log("");

  console.log(
    "RESUMO DOS DOCUMENTOS ENCONTRADOS:"
  );

  console.log("");


  console.table(

    documents.map(doc => ({

      cpf: doc.cpf,

      type: doc.type,

      file:
        doc.url.split("/").pop()

    }))

  );


  console.log("");

  log(
    `Candidatos analisados: ${stats.candidates}`
  );


  log(
    `Arquivos encontrados: ${stats.filesFound}`
  );


}



/* ============================================================
   PARTE 1C
   VALIDAÇÃO STORAGE NOVO
============================================================ */

async function validateNewStorage() {


  separator();


  log(
    "Validando Storage do projeto novo..."
  );


  const { data: buckets, error } =

    await newSupabase
      .storage
      .listBuckets();



  if (error) {

    throw error;

  }


  const bucket = buckets.find(

    item =>
      item.name === CONFIG.bucket

  );


  if (!bucket) {


    throw new Error(

      `Bucket '${CONFIG.bucket}' não encontrado no projeto novo.`

    );


  }


  log(
    `Bucket encontrado: ${bucket.name}`
  );


}



/* ============================================================
   MAIN
============================================================ */


async function main() {


  separator();


  console.log(

    "PEOPLE RH - MIGRAÇÃO DO BUCKET DOCUMENTS"

  );


  separator();



  console.log(

    `MODO: ${CONFIG.dryRun ? "DRY RUN" : "MIGRAÇÃO REAL"}`

  );



  separator();



  validateEnvironment();



  await restoreOldSession();


  await scanDocuments();


  await validateNewStorage();


  await prepareMigrationPlan();


  await validateMigrationPlan();



  separator();


  log(

    "Inicialização concluída."

  );


}


/* ============================================================
   PARTE 1D
   PLANO DE MIGRAÇÃO

   Objetivo:
   - Preparar mapa dos arquivos para migração
   - Definir origem e destino
   - Validar possíveis conflitos
   - Gerar resumo da migração

   NÃO realiza upload.
   NÃO altera dados.
   NÃO atualiza banco.
============================================================ */


let migrationPlan = [];



async function prepareMigrationPlan() {


  separator();


  log(
    "Preparando plano de migração..."
  );



  const { data: candidates, error } =

    await oldSupabase
      .from("candidates")
      .select(
        `
          cpf,
          resume_url,
          other_files_urls
        `
      );



  if (error) {

    throw error;

  }



  if (!candidates || candidates.length === 0) {


    log(
      "Nenhum candidato encontrado para gerar plano."
    );


    return;


  }



  const plan = [];



  for (const candidate of candidates) {



    if (candidate.resume_url) {


      const fileName =

        path.basename(
          candidate.resume_url
        );


      plan.push({

        cpf: candidate.cpf,

        type: "resume",

        source:
          candidate.resume_url,

        destination:
          `${candidate.cpf}/resume/${fileName}`

      });


    }




    if (

      Array.isArray(
        candidate.other_files_urls
      )

    ) {



      candidate.other_files_urls.forEach(file => {



        const fileName =

          path.basename(file);



        plan.push({


          cpf: candidate.cpf,


          type: "other",


          source:
            file,


          destination:
            `${candidate.cpf}/other/${fileName}`



        });


      });



    }



  }



  migrationPlan = plan;



  console.log("");

  console.log(
    "PLANO DE MIGRAÇÃO GERADO:"
  );

  console.log("");



  console.table(

    migrationPlan.map(item => ({


      cpf:
        item.cpf,


      tipo:
        item.type,


      origem:
        path.basename(item.source),


      destino:
        item.destination


    }))

  );



  console.log("");



  log(
    `Arquivos planejados: ${migrationPlan.length}`
  );



  const resumes =

    migrationPlan.filter(

      item =>
        item.type === "resume"

    ).length;



  const others =

    migrationPlan.filter(

      item =>
        item.type === "other"

    ).length;



  log(
    `Currículos: ${resumes}`
  );


  log(
    `Outros documentos: ${others}`
  );



  separator();



  log(
    "Plano de migração concluído."
  );



}


/* ============================================================
   1E - VALIDAÇÃO DE INTEGRIDADE DO PLANO
============================================================ */


async function validateMigrationPlan() {

  separator();


  log(
    "Validando integridade do plano de migração..."
  );


  if (!migrationPlan || migrationPlan.length === 0) {

    throw new Error(
      "Plano de migração vazio."
    );

  }



  let errors = [];

  let warnings = [];



  const destinationPaths = new Set();



  const cpfList = [
    ...new Set(
      migrationPlan.map(item => item.cpf)
    )
  ];



  /*
    1 - Validar estrutura dos itens
  */

  migrationPlan.forEach((item, index) => {


    if (!item.cpf) {

      errors.push(
        `Item ${index}: CPF ausente`
      );

    }


    if (!item.type && !item.tipo) {

      errors.push(
        `Item ${index}: tipo de arquivo ausente`
      );

    }


    if (!item.source && !item.file && !item.origem) {

      errors.push(
        `Item ${index}: arquivo de origem ausente`
      );

    }


    const destination =
      item.destination ||
      item.destino;



    if (destination) {

      if (destinationPaths.has(destination)) {

        errors.push(
          `Destino duplicado: ${destination}`
        );

      }


      destinationPaths.add(destination);

    }


  });



  /*
    2 - Validar candidatos no banco novo
  */


  log(
    `Validando ${cpfList.length} candidatos no banco novo...`
  );



  const {
    data: candidates,
    error
  } = await newSupabase

    .from("candidates")

    .select(
      "cpf"
    )

    .in(
      "cpf",
      cpfList
    );



  if (error) {

    throw error;

  }



  const existingCpfs = new Set(

    (candidates || [])

      .map(
        c => c.cpf
      )

  );



  cpfList.forEach(cpf => {


    if (!existingCpfs.has(cpf)) {

      warnings.push(
        `CPF não encontrado no banco novo: ${cpf}`
      );

    }


  });



  separator();



  console.log(
    "RESULTADO DA VALIDAÇÃO:"
  );



  console.log("");



  console.log(
    `Arquivos analisados: ${migrationPlan.length}`
  );


  console.log(
    `CPFs analisados: ${cpfList.length}`
  );


  console.log(
    `Destinos únicos: ${destinationPaths.size}`
  );


  console.log(
    `Erros encontrados: ${errors.length}`
  );


  console.log(
    `Alertas encontrados: ${warnings.length}`
  );



  if (warnings.length > 0) {

    console.log("");

    console.log(
      "ALERTAS:"
    );


    warnings.forEach(
      w => console.log(
        "⚠️",
        w
      )
    );

  }



  if (errors.length > 0) {

    console.log("");

    console.log(
      "ERROS:"
    );


    errors.forEach(
      e => console.log(
        "❌",
        e
      )
    );


    throw new Error(
      "Plano de migração possui inconsistências."
    );

  }



  separator();


  log(
    "Validação de integridade concluída com sucesso."
  );


}


/* ============================================================
   EXECUÇÃO
============================================================ */


main()

.catch(error => {


  console.error("");

  console.error(

    "ERRO FATAL:"

  );


  console.error(error);


  process.exit(1);


});