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
   4 - ATUALIZAÇÃO DAS URLs DOS CANDIDATOS
============================================================ */


async function fileExistsInNewStorage(filePath) {


  const folder =

    path.dirname(
      filePath
    );


  const fileName =

    path.basename(
      filePath
    );



  const {

    data,

    error

  } = await newSupabase

    .storage

    .from(
      CONFIG.bucket
    )

    .list(

      folder,

      {

        search:
          fileName

      }

    );



  if (error) {

    return false;

  }



  return (

    data &&

    data.some(

      file =>

        file.name === fileName

    )

  );


}




function buildNewStorageUrl(filePath) {


  const {

    data

  } = newSupabase

    .storage

    .from(

      CONFIG.bucket

    )

    .getPublicUrl(

      filePath

    );



  return data.publicUrl;


}





async function updateCandidateUrls() {


  separator();



  log(

    "Iniciando atualização das URLs dos candidatos..."

  );



  const {

    data: candidates,

    error

  } = await newSupabase

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



  if (

    !candidates ||

    candidates.length === 0

  ) {


    log(

      "Nenhum candidato encontrado."

    );


    return;


  }




  let updatedResume = 0;


  let updatedOthers = 0;


  let ignored = 0;


  let errors = [];




  for (

    const candidate of candidates

  ) {



    try {



      let resumeUrl =

        candidate.resume_url;



      let otherFiles =

        Array.isArray(

          candidate.other_files_urls

        )

          ?

          candidate.other_files_urls

          :

          [];




      let candidateChanged = false;



      /*
        ======================================================
        CURRÍCULO
        ======================================================
      */



      if (

        candidate.resume_url

      ) {



        const fileName =

          path.basename(

            candidate.resume_url

          );



        const newPath =

          `${candidate.cpf}/resume/${fileName}`;



        const exists =

          await fileExistsInNewStorage(

            newPath

          );



        if (exists) {


          resumeUrl =

            buildNewStorageUrl(

              newPath

            );


          candidateChanged = true;


          updatedResume++;


        }

        else {


          ignored++;


        }


      }





      /*
        ======================================================
        OUTROS DOCUMENTOS
        ======================================================
      */



      if (

        otherFiles.length > 0

      ) {



        const migratedOthers = [];



        for (

          const file of otherFiles

        ) {



          const fileName =

            path.basename(

              file

            );



          const newPath =

            `${candidate.cpf}/other/${fileName}`;



          const exists =

            await fileExistsInNewStorage(

              newPath

            );



          if (exists) {


            migratedOthers.push(

              buildNewStorageUrl(

                newPath

              )

            );


          }

          else {


            ignored++;


          }


        }



        if (

          migratedOthers.length > 0

        ) {


          otherFiles = migratedOthers;


          candidateChanged = true;


          updatedOthers +=

            migratedOthers.length;


        }



      }





      /*
        ======================================================
        UPDATE BANCO
        ======================================================
      */



      if (

        candidateChanged

      ) {



        if (

          CONFIG.dryRun

        ) {


          log(

            `[DRY-RUN] Atualizaria CPF ${candidate.cpf}`

          );


        }

        else {



          const {

            error:updateError

          } = await newSupabase

            .from("candidates")

            .update({

              resume_url:

                resumeUrl,


              other_files_urls:

                otherFiles

            })

            .eq(

              "cpf",

              candidate.cpf

            );



          if (updateError) {


            throw updateError;


          }



          log(

            `Atualizado CPF ${candidate.cpf}`

          );


        }


      }



    }

    catch(error) {



      errors.push({

        cpf:

          candidate.cpf,

        error:

          error.message

      });


    }



  }




  separator();



  console.log(

    "RESULTADO DA ATUALIZAÇÃO DAS URLs"

  );



  console.log("");



  console.log(

    `Candidatos analisados: ${candidates.length}`

  );



  console.log(

    `Currículos atualizados: ${updatedResume}`

  );



  console.log(

    `Outros documentos atualizados: ${updatedOthers}`

  );



  console.log(

    `Arquivos ignorados: ${ignored}`

  );



  console.log(

    `Erros: ${errors.length}`

  );




  if (

    errors.length > 0

  ) {



    console.log("");

    console.log(

      "ERROS:"

    );



    errors.forEach(item => {


      console.log(

        "❌",

        item.cpf,

        item.error

      );


    });


  }




  separator();


  log(

    "Processo de atualização de URLs finalizado."

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

  await auditNewProductionEnvironment();



  const mode =

    process.argv[2];



  /*
    ==========================================================
    EXECUÇÃO ISOLADA - ATUALIZAÇÃO DAS URLs
    Uso:

    node migrate-documents.js --urls
    ==========================================================
  */


  if (mode === "--urls") {


    log(

      "Modo atualização de URLs ativado."

    );



    await updateCandidateUrls();



    separator();



    log(

      "Atualização de URLs concluída."

    );



    return;


  }


    /*
    ==========================================================
    EXECUÇÃO ISOLADA - AUDITORIA DA MIGRAÇÃO

    Uso:

    node migrate-documents.js --audit
    ==========================================================
  */


  if (mode === "--audit") {


    log(

      "Modo auditoria ativado."

    );


    await validateMigrationIntegrity();



    separator();



    log(

      "Auditoria concluída."

    );



    return;


  }


  /*
    ==========================================================
    FLUXO COMPLETO DE MIGRAÇÃO

    1 - Preparação
    2 - Validação
    3 - Migração Storage
    4 - Validação pós-upload
    ==========================================================
  */



  await restoreOldSession();



  await scanDocuments();



  await validateNewStorage();



  await prepareMigrationPlan();



  await validateMigrationPlan();



  await migrateFiles();



  await validateMigratedFiles();




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
   ETAPA 2 - MIGRAÇÃO DOS ARQUIVOS
============================================================ */

function extractStoragePath(url) {


  if (!url) {

    throw new Error(
      "Caminho do arquivo não informado."
    );

  }



  /*
    Caso seja URL completa Supabase
  */


  if (
    url.includes("/storage/v1/object/")
  ) {


    const marker =
      "/storage/v1/object/";



    const index =
      url.indexOf(marker);



    let pathPart =

      url.substring(
        index + marker.length
      );



    return pathPart

      .replace(
        /^public\//,
        ""
      )

      .replace(
        /^sign\//,
        ""
      );

  }



  /*
    Caso venha como caminho relativo

    Exemplos:

    documents/cpf/arquivo.pdf

    cpf/arquivo.pdf
  */


  if (
    url.startsWith(
      `${CONFIG.bucket}/`
    )
  ) {


    return url.replace(

      `${CONFIG.bucket}/`,

      ""

    );


  }



  return url;


}



async function downloadFileFromOldStorage(item) {


  const source =
    item.source;



  const filePath =
    extractStoragePath(
      source
    );



  log(
    `Download origem: ${filePath}`
  );



  if (CONFIG.dryRun) {


    return {

      dryRun: true

    };


  }




  const {

    data,

    error

  } = await oldSupabase

    .storage

    .from(
      CONFIG.bucket
    )

    .download(
      filePath
    );



  if (error) {

    throw error;

  }



  return data;


}





async function uploadFileToNewStorage(

  item,

  file

) {



  const destination =

    item.destination;



  if (!destination) {


    throw new Error(

      `Destino não encontrado para CPF ${item.cpf}`

    );


  }



  log(
    `Upload destino: ${destination}`
  );



  if (CONFIG.dryRun) {


    return;


  }





  const {

    error

  } = await newSupabase

    .storage

    .from(

      CONFIG.bucket

    )

    .upload(

      destination,

      file,

      {

        upsert: true

      }

    );



  if (error) {

    throw error;

  }



}





async function migrateFiles() {


  separator();


  log(
    "Iniciando migração dos arquivos..."
  );



  let success = 0;


  let failed = [];



  for (

    const [index, item]

    of migrationPlan.entries()

  ) {


    try {



      console.log("");



      log(

        `[${index + 1}/${migrationPlan.length}] ${item.type} - CPF ${item.cpf}`

      );



      const file =

        await downloadFileFromOldStorage(

          item

        );



      await uploadFileToNewStorage(

        item,

        file

      );



      success++;



      log(

        `Arquivo processado: ${item.destination}`

      );



    }

    catch(error) {



      failed.push({

        item,

        error:

          error.message

      });



      console.error(

        "❌ Falha:",

        item.destination,

        error.message

      );


    }



  }




  separator();



  console.log(

    "RESULTADO DA MIGRAÇÃO DOS ARQUIVOS"

  );



  console.log("");



  console.log(

    `Arquivos planejados: ${migrationPlan.length}`

  );



  console.log(

    `Processados com sucesso: ${success}`

  );



  console.log(

    `Falhas: ${failed.length}`

  );




  if (failed.length > 0) {



    console.log("");

    console.log(

      "ARQUIVOS COM FALHA:"

    );



    failed.forEach(item => {


      console.log(

        "❌",

        item.item.destination,

        "-",

        item.error

      );


    });



    throw new Error(

      "Migração de arquivos concluída com falhas."

    );


  }




  separator();


  log(

    "Migração dos arquivos concluída com sucesso."

  );


}

 /* ============================================================
   ETAPA 3 - VALIDAÇÃO PÓS-UPLOAD DOS ARQUIVOS
============================================================ */


async function validateMigratedFiles() {


  separator();


  log(
    "Iniciando validação dos arquivos migrados..."
  );



  let found = 0;

  let missing = [];



  for (

    const [index, item]

    of migrationPlan.entries()

  ) {


    try {



      log(

        `[${index + 1}/${migrationPlan.length}] Validando ${item.destination}`

      );



      const {

        data,

        error

      } = await newSupabase

        .storage

        .from(

          CONFIG.bucket

        )

        .list(

          path.dirname(
            item.destination
          ),

          {

            search:

              path.basename(
                item.destination
              )

          }

        );



      if (error) {

        throw error;

      }



      const exists =

        data &&

        data.some(

          file =>

            file.name ===

            path.basename(
              item.destination
            )

        );



      if (exists) {


        found++;


      }

      else {


        missing.push(item);


      }



    }

    catch(error) {


      missing.push({

        ...item,

        validationError:

          error.message

      });


    }


  }




  separator();



  console.log(

    "RESULTADO DA VALIDAÇÃO DOS ARQUIVOS"

  );



  console.log("");



  console.log(

    `Arquivos esperados: ${migrationPlan.length}`

  );



  console.log(

    `Arquivos encontrados: ${found}`

  );



  console.log(

    `Arquivos ausentes: ${missing.length}`

  );




  if (missing.length > 0) {



    console.log("");

    console.log(

      "ARQUIVOS NÃO ENCONTRADOS:"

    );



    missing.forEach(item => {


      console.log(

        "⚠️",

        item.destination,

        item.validationError
          ?
          `- ${item.validationError}`
          :
          ""

      );


    });



  }




  separator();



  if (missing.length === 0) {


    log(

      "Validação concluída: todos os arquivos encontrados."

    );


  }

  else {


    log(

      "Validação concluída com arquivos pendentes."

    );


  }



}


/* ============================================================
  ETAPA 5 - AUDITORIA DO AMBIENTE MIGRADO
============================================================ */


async function validateMigrationIntegrity() {


  separator();


  log(

    "Iniciando auditoria do ambiente migrado..."

  );



  const {

    data: candidates,

    error

  } = await newSupabase

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



  if (

    !candidates ||

    candidates.length === 0

  ) {


    log(

      "Nenhum candidato encontrado."

    );


    return;


  }





  let totalResumes = 0;

  let totalOthers = 0;

  let validUrls = 0;

  let oldUrls = 0;

  let missingFiles = 0;

  let invalidUrls = 0;


  const problems = [];





  for (

    const candidate of candidates

  ) {



    if (

      candidate.resume_url

    ) {



      totalResumes++;



      const result =

        await auditFileUrl(

          candidate.cpf,

          candidate.resume_url

        );



      if (

        result === "new"

      ) {


        validUrls++;


      }


      if (

        result === "old"

      ) {


        oldUrls++;


        problems.push({

          cpf:

            candidate.cpf,

          arquivo:

            candidate.resume_url,

          problema:

            "URL antiga"

        });


      }


      if (

        result === "missing"

      ) {


        missingFiles++;


        problems.push({

          cpf:

            candidate.cpf,

          arquivo:

            candidate.resume_url,

          problema:

            "Arquivo inexistente no Storage novo"

        });


      }


      if (

        result === "invalid"

      ) {


        invalidUrls++;


        problems.push({

          cpf:

            candidate.cpf,

          arquivo:

            candidate.resume_url,

          problema:

            "URL inválida"

        });


      }


    }






    if (

      Array.isArray(

        candidate.other_files_urls

      )

    ) {



      for (

        const file of candidate.other_files_urls

      ) {



        totalOthers++;



        const result =

          await auditFileUrl(

            candidate.cpf,

            file

          );



        if (

          result === "new"

        ) {


          validUrls++;


        }



        if (

          result === "old"

        ) {


          oldUrls++;


          problems.push({

            cpf:

              candidate.cpf,

            arquivo:

              file,

            problema:

              "Documento extra com URL antiga"

          });


        }



        if (

          result === "missing"

        ) {


          missingFiles++;


          problems.push({

            cpf:

              candidate.cpf,

            arquivo:

              file,

            problema:

              "Documento extra inexistente"

          });


        }



        if (

          result === "invalid"

        ) {


          invalidUrls++;


          problems.push({

            cpf:

              candidate.cpf,

            arquivo:

              file,

            problema:

              "URL inválida"

          });


        }


      }


    }



  }





  separator();



  console.log(

    "RESULTADO DA AUDITORIA"

  );


  console.log("");



  console.log(

    `Candidatos analisados: ${candidates.length}`

  );


  console.log(

    `Currículos encontrados: ${totalResumes}`

  );


  console.log(

    `Documentos extras encontrados: ${totalOthers}`

  );


  console.log(

    `URLs válidas no novo Storage: ${validUrls}`

  );


  console.log(

    `URLs antigas: ${oldUrls}`

  );


  console.log(

    `Arquivos inexistentes: ${missingFiles}`

  );


  console.log(

    `URLs inválidas: ${invalidUrls}`

  );


  console.log(

    `Problemas encontrados: ${problems.length}`

  );





  if (

    problems.length > 0

  ) {



    console.log("");

    console.log(

      "PROBLEMAS:"

    );



    problems.forEach(item => {


      console.log(

        "❌",

        item.cpf,

        "-",

        item.problema

      );


      console.log(

        "   ",

        item.arquivo

      );


    });


  }



  separator();


}





async function auditFileUrl(

  cpf,

  url

) {



  if (!url) {


    return "invalid";


  }




  if (

    url.includes(

      CONFIG.old.url

    )

  ) {


    return "old";


  }





  if (

    !url.includes(

      CONFIG.new.url

    )

  ) {


    return "invalid";


  }





  const filePath =

    extractStoragePath(

      url

    );



  if (!filePath) {


    return "invalid";


  }




  const exists =

    await fileExistsInNewStorage(

      filePath

    );



  if (!exists) {


    return "missing";


  }




  return "new";


}


/* ============================================================
   ETAPA 5.1
   AUDITORIA DO NOVO AMBIENTE DE PRODUÇÃO

   Objetivo:
   - Validar novo Supabase
   - Validar tabela candidates
   - Validar bucket documents
   - Validar estrutura Storage

   NÃO cria candidatos.
   NÃO envia arquivos.
   NÃO altera dados.
============================================================ */


async function auditNewProductionEnvironment() {


  separator();


  log(
    "Iniciando auditoria do novo ambiente de produção..."
  );


  const problems = [];



  /*
  ============================================================
  VALIDAR TABELA CANDIDATES
  ============================================================
  */


  const {

    data: candidates,

    error: candidatesError

  } = await newSupabase

    .from("candidates")

    .select(
      `
      id,
      cpf,
      full_name,
      resume_url,
      selfie_url,
      other_files_urls
      `
    )

    .limit(1);



  if (candidatesError) {


    problems.push(

      "Tabela candidates inacessível: "
      +
      candidatesError.message

    );


  }
  else {


    log(
      "Tabela candidates OK."
    );


  }



  /*
  ============================================================
  VALIDAR BUCKET DOCUMENTS
  ============================================================
  */


  const {

    data: buckets,

    error: bucketError

  } = await newSupabase

    .storage

    .listBuckets();



  if (bucketError) {


    problems.push(

      "Erro ao consultar buckets: "
      +
      bucketError.message

    );


  }
  else {


    const documentsBucket =

      buckets.find(

        bucket =>
          bucket.name === CONFIG.bucket

      );



    if (!documentsBucket) {


      problems.push(

        "Bucket documents não encontrado."

      );


    }
    else {


      log(
        "Bucket documents OK."
      );


    }


  }



  /*
  ============================================================
  VALIDAR CONFIGURAÇÕES
  ============================================================
  */


  if (!CONFIG.new.url) {


    problems.push(

      "NEW_SUPABASE_URL não configurada."

    );


  }



  if (!CONFIG.new.key) {


    problems.push(

      "NEW_SERVICE_ROLE_KEY não configurada."

    );


  }



  /*
  ============================================================
  RESULTADO
  ============================================================
  */


  separator();


  console.log(

    "RESULTADO DA AUDITORIA DO NOVO AMBIENTE"

  );


  console.log("");



  console.log(

    `Problemas encontrados: ${problems.length}`

  );



  if (problems.length > 0) {


    console.log("");

    console.log(
      "PROBLEMAS:"
    );



    problems.forEach(

      problem =>

        console.log(
          "❌",
          problem
        )

    );



    throw new Error(

      "Auditoria do novo ambiente falhou."

    );


  }



  separator();



  log(

    "Novo ambiente pronto para produção."

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