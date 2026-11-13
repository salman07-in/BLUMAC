import { execSync } from "child_process";

const dbUrl = process.env.DATABASE_URL || "";
const schemaArg = dbUrl.startsWith("file:") ? "--schema=prisma/schema.sqlite.prisma" : "";
console.log(`🌸 Generating Prisma Client (${schemaArg || "default mysql"})...`);
try {
  execSync(`npx prisma generate ${schemaArg}`.trim(), { stdio: "inherit" });
} catch (err) {
  console.warn("Notice during postinstall prisma generate:", err.message);
}
