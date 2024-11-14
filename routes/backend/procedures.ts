import express from "express";
import sql from "mssql";

const router = express.Router();
router.post("/informacionporfactura", async (req, res) => {
  try {
    if (!req.body || !req.body.ID_Factura) {
      return res.status(400).json({ error: "ID_Factura es requerido." });
    }

    const { ID_Factura } = req.body;

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

    res.json(result.recordset);
  } catch (err) {
    console.error("Error ejecutando el procedimiento almacenado: ", err);
    res
      .status(500)
      .json({ error: "Error ejecutando el procedimiento almacenado." });
  }
});

export default router;
