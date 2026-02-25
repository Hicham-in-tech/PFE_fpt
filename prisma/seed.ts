import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pfe.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@pfe.com",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // Create a sample Coordinator
  const coordinatorPassword = await bcrypt.hash("coord123", 12);
  const coordinator = await prisma.user.upsert({
    where: { email: "coordinator@pfe.com" },
    update: {},
    create: {
      name: "Dr. Coordinator",
      email: "coordinator@pfe.com",
      password: coordinatorPassword,
      role: "COORDINATOR",
    },
  });
  console.log(`✅ Coordinator created: ${coordinator.email}`);

  // Create a sample Team Leader
  const leaderPassword = await bcrypt.hash("leader123", 12);
  const leader = await prisma.user.upsert({
    where: { email: "leader@pfe.com" },
    update: {},
    create: {
      name: "Team Leader",
      email: "leader@pfe.com",
      password: leaderPassword,
      role: "TEAM_LEADER",
    },
  });
  console.log(`✅ Team Leader created: ${leader.email}`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Default accounts:");
  console.log("  Admin:       admin@pfe.com / admin123");
  console.log("  Coordinator: coordinator@pfe.com / coord123");
  console.log("  Leader:      leader@pfe.com / leader123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
