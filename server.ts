import express from "express";
import sql from "mssql";
import dotenv from "dotenv";
import * as Modules from "./routes/config";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

sql.connect(dbConfig, (err) => {
  if (err) {
    console.log("Database connection error: ", err);
    return;
  }
  console.log("Connected to SQL Server");
});

// Usa las rutas definidas en los archivos separados
app.use(Modules.sp);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
