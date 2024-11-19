"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/cronJob.ts
const https_1 = __importDefault(require("https"));
const cron_1 = require("cron");
const endpointsList = [
    "https://omax-data.onrender.com/",
    "https://omax-data.onrender.com/facmaq",
];
const makeRequest = (endpoint) => {
    return new Promise((resolve, reject) => {
        https_1.default
            .get(endpoint, (res) => {
            if (res.statusCode === 200) {
                console.log(`Solicitud exitosa al endpoint: ${endpoint}`);
                resolve(`Solicitud exitosa al endpoint: ${endpoint}`);
            }
            else {
                reject(new Error(`Error al reiniciar el servidor en ${endpoint} con código: ${res.statusCode}`));
            }
        })
            .on("error", (err) => {
            reject(new Error(`Error durante la solicitud a ${endpoint}: ${err.message}`));
        });
    });
};
const job = new cron_1.CronJob("*/14 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Haciendo solicitudes para mantener el servidor activo...");
    try {
        const results = yield Promise.all(endpointsList.map((endpoint) => makeRequest(endpoint)));
        console.log("Solicitud exitosa a todos los endpoints:", results);
    }
    catch (error) {
        console.error("Ocurrió un error al realizar una o más solicitudes:", error.message);
    }
}));
// Exporta el cron job para usarlo en otros archivos
exports.default = job;
