// routes/cronJob.ts
import https from "https";
import { CronJob } from "cron";

const endpointsList: string[] = ["https://omax-data.onrender.com/"];

const makeRequest = (endpoint: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    https
      .get(endpoint, (res) => {
        if (res.statusCode === 200) {
          console.log(`Solicitud exitosa al endpoint: ${endpoint}`);
          resolve(`Solicitud exitosa al endpoint: ${endpoint}`);
        } else {
          reject(
            new Error(
              `Error al reiniciar el servidor en ${endpoint} con código: ${res.statusCode}`
            )
          );
        }
      })
      .on("error", (err) => {
        reject(
          new Error(`Error durante la solicitud a ${endpoint}: ${err.message}`)
        );
      });
  });
};

const job = new CronJob("*/14 * * * *", async () => {
  console.log("Haciendo solicitudes para mantener el servidor activo...");

  try {
    const results = await Promise.all(
      endpointsList.map((endpoint) => makeRequest(endpoint))
    );
    console.log("Solicitud exitosa a todos los endpoints:", results);
  } catch (error) {
    console.error(
      "Ocurrió un error al realizar una o más solicitudes:",
      (error as Error).message
    );
  }
});

// Exporta el cron job para usarlo en otros archivos
export default job;
