import { execSync } from "child_process";

const dbUrl = process.env.DATABASE_URL || "";

if (dbUrl.startsWith("mysql://")) {
  console.log("🌸 [Hostinger Deployment] Detected MySQL Database.");
  console.log("🌸 Running automatic database migration (prisma db push)...");

  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("✅ Database tables successfully created/updated in MySQL.");
  } catch (err) {
    console.warn("⚠️ Notice during prisma db push:", err.message || err);
  }

  try {
    console.log("🌸 Populating initial Korean skincare catalog & admin user...");
    execSync("node prisma/seed.mjs", { stdio: "inherit" });
    console.log("✅ Catalog and admin user seed complete.");
  } catch (err) {
    console.warn("⚠️ Notice during db:seed:", err.message || err);
  }
} else {
  console.log("ℹ️ Skipping auto-push: DATABASE_URL is not MySQL protocol.");
}

console.log("🌸 Generating Prisma Client...");
execSync("npx prisma generate", { stdio: "inherit" });

console.log("🌸 Starting Next.js Production Build (Single Worker Mode for Hostinger)...");
execSync("npx next build", {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PRIVATE_MAX_WORKERS: "1",
    UV_THREADPOOL_SIZE: "4",
  },
});
