import { Worker } from "worker_threads";

export const generateRequestPdf = (payload) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/pdfWorker.js", import.meta.url), {
      workerData: payload,
      type: "module",
    });

    worker.on("message", (message) => {
      if (message?.ok) {
        resolve(message.buffer);
      } else {
        if (message?.error) {
          console.error("PDF worker error:", message.error);
        }
        reject(new Error(message?.error || "Failed to generate PDF"));
      }
    });

    worker.on("error", (error) => {
      console.error("PDF worker crashed:", error);
      reject(error);
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`PDF worker stopped with exit code ${code}`));
      }
    });
  });
