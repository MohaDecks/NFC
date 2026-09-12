import { env } from "./config/env";
import { connectDb } from "./config/db";
import { createApp } from "./app";
import { migrateLegacyProfiles, seedRolesAndAdmin } from "./services/seed";
import { ensureUploadsDir } from "./services/storage";

async function start() {
  await connectDb();
  await seedRolesAndAdmin();
  await migrateLegacyProfiles();
  await ensureUploadsDir();
  const app = await createApp();
  app.listen(env.PORT, () => {
    console.log(`Mubarek Technology Solution admin running on ${env.APP_URL}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
