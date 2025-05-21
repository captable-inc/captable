import { logger } from "@captable/logger";
import inquirer from "inquirer";
import type { QuestionCollection } from "inquirer";
import { db } from "../index";
import { companies } from "../schema/companies";
import { members } from "../schema/members";
import { users } from "../schema/users";
import seedCompanies from "./companies";
import seedTeam from "./team";

// Prevent running in production
if (process.env.NODE_ENV === "production") {
  logger.error("❌ You cannot run this command on production");
  process.exit(0);
}

export const seed = async () => {
  const inquiry = await inquirer.prompt({
    type: "confirm",
    name: "answer",
    message: "Are you sure you want to NUKE 🚀 and re-seed the database?",
  } as QuestionCollection);

  const answer = inquiry.answer as boolean;

  if (answer) {
    await nuke();

    logger.info("Seeding database");
    return db.transaction(async (tx) => {
      await seedCompanies();
      await seedTeam();
    });
  }

  throw new Error("Seeding aborted");
};

const nuke = async () => {
  logger.info("🚀 Nuking database records");
  return db.transaction(async (tx) => {
    // Delete all records in reverse order of dependencies
    await db.delete(members);
    await db.delete(users);
    await db.delete(companies);
    // Add other tables that need to be cleared
  });
};

// Execute the seed function
seed()
  .then(async () => {
    logger.info("✅ Database seeding completed");
    logger.info(`💌 We have created four admin accounts for you. Please login with one of these emails:
      ceo@example.com
      cto@example.com
      cfo@example.com
      lawyer@example.com`);
  })
  .catch(async (error: Error) => {
    logger.error(`❌ ${error.message}`);
  });
