import express from "express";
import sql from "mssql";

const router = express.Router();
router.get("/facmaq/:ID_Factura", async (req, res) => {
  try {
    const ID_Factura = parseInt(req.params.ID_Factura, 10);
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

export default router;
