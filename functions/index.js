const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { NextRequest } = require("next/server");

// Configurar opções globais
setGlobalOptions({
  maxInstances: 10,
});

// Importar o servidor Next.js
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Quando executado em produção, o servidor Next.js já está compilado
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

exports.nextjsFunc = onRequest(async (req, res) => {
  return handle(req, res);
});
