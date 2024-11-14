import express from "express";
import sql from "mssql";

const router = express.Router();
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
      return res.json(result.recordset);
    } else {
      return res
        .status(404)
        .json({
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

export default router;
