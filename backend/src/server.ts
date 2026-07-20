// import Env from "./config/env";
// import app from "./app";
// import { connectDatabase } from "./config/database";
// import { initFirebase } from "./config/firebase";

// import { initScheduler } from "./services/scheduler.service";
// import mongoose from "mongoose"; // Added based on the 'mongoose.connect' in the provided code edit

// async function startServer() {
//   try {
//     await mongoose.connect(Env.mongoUri);
//     console.log("Connected to MongoDB via", Env.mongoUri);

//     // Start automated tasks
//     initScheduler();

//     app.listen(Env.port, () => {
//       console.log(`Server running on port ${Env.port}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server", error);
//     process.exit(1);
//   }
// }

// startServer().catch((error) => {
//   console.error("Failed to start server", error);
//   process.exit(1);
// });

import app from "./app";
import Env from "./config/env";
import mongoose from "mongoose";
import { initScheduler } from "./services/scheduler.service";
import { initFirebase } from "./config/firebase";

async function startServer() {
  try {
    // Initialize Firebase Admin SDK (Auth)
    initFirebase();

    // Connect MongoDB
    await mongoose.connect(Env.mongoUri);
    console.log("✅ Connected to MongoDB");

    // Start background jobs
    initScheduler();

    // Use cloud-injected port (Railway / Render / Fly.io)
    const PORT = process.env.PORT || Env.port || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

startServer();
