// import cron from "node-cron";
// import { generateDailyReport } from "./controllers/DailyController.js";

// // Schedule the cron job
// // Runs every day at 11:59 PM
// cron.schedule("59 23 * * *", async () => {
//   console.log("Running daily report cron job...");
//   try {
//     await generateDailyReport(
//       {}, 
//       { status: () => ({ json: () => {} }) } // fake res object for controller
//     );
//     console.log("Daily report updated successfully!");
//   } catch (err) {
//     console.error("Error updating daily report:", err);
//   }
// });
