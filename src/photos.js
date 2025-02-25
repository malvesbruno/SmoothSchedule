const { google } = require("googleapis");
const fs = require("fs");

// Carregue as credenciais do arquivo JSON
const credentials = JSON.parse(fs.readFileSync("./credentials.json"));

// Configure o cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

// Escopos necessários para acessar o Google Photos
const scopes = ["https://www.googleapis.com/auth/photoslibrary"];

// Gerar URL de autenticação
const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
});


// Função para obter o token de acesso após o usuário autenticar
async function getAccessToken(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error("Erro ao obter token de acesso:", error);
    throw error;
  }
}

// Inicialize a API do Google Photos
const photosLibrary = google.photoslibrary({ version: "v1", auth: oauth2Client });

// Função para obter o token de upload
async function getUploadToken(filePath) {
  const fileData = fs.readFileSync(filePath);
  const response = await photosLibrary.mediaItems.upload({
    requestBody: {
      data: fileData.toString("base64"),
    },
  });
  return response.data.uploadToken;
}

// Função para enviar a imagem para o Google Photos
async function uploadImage(filePath) {
  try {
    const uploadToken = await getUploadToken(filePath);

    const fileMetadata = {
      newMediaItems: [
        {
          description: "Descrição da imagem",
          simpleMediaItem: {
            fileName: "example.jpg",
            uploadToken: uploadToken,
          },
        },
      ],
    };

    const response = await photosLibrary.mediaItems.batchCreate({
      resource: fileMetadata,
    });

  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    throw error;
  }
}

// Exemplo de uso
(async () => {
  const code = "SEU_CODIGO_DE_AUTORIZACAO"; // Substitua pelo código recebido após autenticação
  await getAccessToken(code);

  const filePath = "./example.jpg"; // Substitua pelo caminho da imagem
  await uploadImage(filePath);
})();