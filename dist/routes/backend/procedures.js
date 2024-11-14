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
const express_1 = __importDefault(require("express"));
const mssql_1 = __importDefault(require("mssql"));
const router = express_1.default.Router();
router.post("/facmaq", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Cuerpo de la solicitud:", req.body); // Verifica el contenido de req.body
        if (!req.body || !req.body.ID_Factura) {
            return res.status(400).json({ error: "Número de Factura requerido." });
        }
        // Asegúrate de que ID_Factura sea un número entero
        const ID_Factura = parseInt(req.body.ID_Factura, 10);
        if (isNaN(ID_Factura)) {
            return res
                .status(400)
                .json({ error: "El número factura debe ser un número válido." });
        }
        const pool = yield mssql_1.default.connect({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER || "",
            database: process.env.DB_DATABASE,
            options: {
                encrypt: false, // Cambiar a 'true' si es necesario
                trustServerCertificate: true,
            },
        });
        const result = yield pool
            .request()
            .input("ID_Factura", mssql_1.default.Int, ID_Factura) // Aquí pasamos el valor directamente
            .execute("InformacionPorFactura");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Error:! El número de factura no existe, ACCESO DENEGADO: ", err);
        res
            .status(500)
            .json({ error: "Error ejecutando el procedimiento almacenado." });
    }
}));
exports.default = router;
