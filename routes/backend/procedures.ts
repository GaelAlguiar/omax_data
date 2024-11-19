import express from "express";
import sql from "mssql";

const router = express.Router();
let availableInvoices = new Set(); // Utilizamos un conjunto para almacenar las facturas válidas temporalmente

// Ruta POST para obtener datos
router.post("/facmaq", async (req, res) => {
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
        .json({ error: "El número de factura debe ser un número válido." });
    }

    const pool = await sql.connect({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER || "",
      database: process.env.DB_DATABASE,
      options: {
        encrypt: false, // Cambiar a 'true' si es necesario
        trustServerCertificate: true,
      },
    });

    const result = await pool
      .request()
      .input("ID_Factura", sql.Int, ID_Factura)
      .execute("InformacionPorFactura");

    // Verifica si hay resultados y solo responde si existen
    if (result.recordset && result.recordset.length > 0) {
      // Agrega la factura al conjunto de facturas disponibles
      availableInvoices.add(ID_Factura);
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
    if (isNaN(ID_Factura)) {
      return res
        .status(400)
        .json({ error: "El número de factura debe ser un número válido." });
    }

    // Verifica si la factura está disponible para acceder
    if (!availableInvoices.has(ID_Factura)) {
      return res.status(403).json({
        error:
          "Acceso no autorizado. Debes realizar una solicitud válida primero.",
      });
    }

    const pool = await sql.connect({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER || "",
      database: process.env.DB_DATABASE,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    });

    const result = await pool
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
router.post("/login", async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res
        .status(400)
        .json({ error: "Usuario y contraseña requeridos." });
    }

    const pool = await sql.connect({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER || "",
      database: process.env.DB_DATABASE,
      options: {
        encrypt: false, // Cambiar si es necesario
        trustServerCertificate: true,
      },
    });

    const result = await pool
      .request()
      .input("Usuario", sql.NVarChar, usuario)
      .input("Contrasena", sql.NVarChar, contrasena)
      .execute("sp_ValidarUsuario");

    console.log("Resultado de la consulta:", result.recordset);

    if (result.recordset && result.recordset.length > 0) {
      // Enviar toda la información obtenida si hay registros
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
