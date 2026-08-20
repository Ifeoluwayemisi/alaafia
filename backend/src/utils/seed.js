/**
 * Database Seed Script
 * Populates database with simulated facilities for MVP testing
 */

require("dotenv").config();
const { sequelize, Facility } = require("../models");
const facilitySeeds = require("./facilitySeeds");

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log("✅ Database synchronized");

    // Seed facilities
    await Facility.bulkCreate(facilitySeeds);
    console.log(`✅ Seeded ${facilitySeeds.length} facilities`);

    console.log("🌱 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
