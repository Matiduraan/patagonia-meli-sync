import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { CronJob } from "cron";

const app = express();
dotenv.config();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    // res.json(finalProducts);
  } catch (error) {
    console.error("Error fetching product prices:", error);
    res.send("Hello World!");
  }
});

// const job = new CronJob(
//   "*/5 * * * * *", // cronTime
//   function () {
//     console.log("You will see this message every second");
//   }, // onTick
//   null, // onComplete
//   true, // start
//   "America/Los_Angeles" // timeZone
// );

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${PORT}`);
});
