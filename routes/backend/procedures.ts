import express from "express";
import sql from "mssql";

const router = express.Router();
let availableInvoices = new Set(); // Conjunto para almacenar facturas válidas temporalmente

// Conexión a la base de datos
const pool = sql.connect({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

// Ruta POST para obtener datos
router.post("/facmaq", async (req, res) => {
  try {
    console.log("Cuerpo de la solicitud:", req.body); // Depuración del cuerpo de la solicitud

    // Validar que el cuerpo de la solicitud sea un objeto JSON válido
    if (!req.body || typeof req.body !== "object") {
      return res
        .status(400)
        .json({ error: "El cuerpo debe ser un JSON válido." });
    }

    // Validar que se proporcione `ID_Factura`
    const { ID_Factura } = req.body;
    if (!ID_Factura) {
      return res.status(400).json({ error: "ID_Factura es obligatorio." });
    }

    // Validar que `ID_Factura` sea un número entero
    const factura = parseInt(ID_Factura, 10);
    if (isNaN(factura)) {
      return res
        .status(400)
        .json({ error: "ID_Factura debe ser un número válido." });
    }

    // Llamar al procedimiento almacenado
    const result = await (await pool)
      .request()
      .input("ID_Factura", sql.Int, factura)
      .execute("InformacionPorFactura");

    // Verificar resultados
    if (result.recordset && result.recordset.length > 0) {
      availableInvoices.add(factura); // Agregar la factura al conjunto de facturas válidas
      return res.json(result.recordset);
    } else {
      return res.status(404).json({
        error: "No se encontraron resultados para la factura proporcionada.",
      });
    }
  } catch (err) {
    console.error("Error ejecutando el procedimiento almacenado: ", err);
    res
      .status(500)
      .json({ error: "Error ejecutando el procedimiento almacenado." });
  }
});

// Ruta GET para acceder a la información si el POST fue exitoso
router.get("/facmaq/:ID_Factura", async (req, res) => {
  try {
    const ID_Factura = parseInt(req.params.ID_Factura, 10);

    // Validar que `ID_Factura` sea un número entero
    if (isNaN(ID_Factura)) {
      return res
        .status(400)
        .json({ error: "ID_Factura debe ser un número válido." });
    }

    // Verificar si la factura está disponible
    if (!availableInvoices.has(ID_Factura)) {
      return res.status(403).json({
        error:
          "Acceso no autorizado. Debes realizar una solicitud válida primero.",
      });
    }

    // Llamar al procedimiento almacenado
    const result = await (await pool)
      .request()
      .input("ID_Factura", sql.Int, ID_Factura)
      .execute("InformacionPorFactura");

    res.json(result.recordset);
  } catch (err) {
    console.error("Error ejecutando el procedimiento almacenado: ", err);
    res
      .status(500)
      .json({ error: "Error ejecutando el procedimiento almacenado." });
  }
});

// Ruta POST para login
router.post("/login", async (req, res) => {
  try {
    console.log("Cuerpo de la solicitud:", req.body); // Depuración del cuerpo de la solicitud

    // Validar que el cuerpo de la solicitud sea un objeto JSON válido
    if (!req.body || typeof req.body !== "object") {
      return res
        .status(400)
        .json({ error: "El cuerpo debe ser un JSON válido." });
    }

    // Validar que se proporcionen `usuario` y `contrasena`
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
      return res
        .status(400)
        .json({ error: "Usuario y contraseña son obligatorios." });
    }

    // Llamar al procedimiento almacenado
    const result = await (await pool)
      .request()
      .input("Usuario", sql.NVarChar, usuario)
      .input("Contrasena", sql.NVarChar, contrasena)
      .execute("sp_ValidarUsuario");

    console.log("Resultado de la consulta:", result.recordset);

    if (result.recordset && result.recordset.length > 0) {
      return res.json({
        message: "Usuario autenticado correctamente.",
        data: result.recordset[0],
      });
    } else {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos." });
    }
  } catch (err) {
    console.error("Error ejecutando el procedimiento almacenado: ", err);
    res.status(500).json({ error: "Error al consultar el usuario." });
  }
});

export default router;
