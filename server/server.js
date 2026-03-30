import dotenv from "dotenv";
dotenv.config();
import cluster from "cluster";
import os from "os";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary process is running with PID: ${process.pid}`);
  console.log(`Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`
    );
    cluster.fork();
  });
} else {
  connectDB()
    .then(() => {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Worker ${process.pid} is listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Worker DB connection failed:", err);
      process.exit(1);
    });
}