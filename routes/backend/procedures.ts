import express from "express";
import sql from "mssql";

const router = express.Router();
router.post("/informacionporfactura", async (req, res) => {
  try {
    const { ID_Factura } = req.body;
    if (!ID_Factura) {
      return res.status(400).json({ error: "ID_Factura es requerido." });
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

    // Ejecutar el procedimiento almacenado usando sql.query
    const query = `EXEC InformacionPorFactura @ID_Factura = ${ID_Factura}`;
    const result = await pool.query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error ejecutando el procedimiento almacenado: ", err);
    res
      .status(500)
      .json({ error: "Error ejecutando el procedimiento almacenado." });
  }
});

export default router;
