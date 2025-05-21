import { logger } from "@captable/logger";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../index";
import { MemberStatusEnum } from "../schema/enums";
import { members } from "../schema/members";
import { users } from "../schema/users";

type MemberStatus = "ACTIVE" | "INACTIVE" | "PENDING";

type UserType = {
  name: string;
  email: string;
  title?: string;
  image?: string;
  isOnboarded?: boolean;
  status?: MemberStatus;
};

const seedTeam = async () => {
  const team: UserType[] = [
    {
      name: faker.person.fullName(),
      email: "ceo@example.com",
      title: "Co-Founder & CEO",
      status: "ACTIVE",
      isOnboarded: true,
    },
    {
      name: faker.person.fullName(),
      email: "cto@example.com",
      title: "Co-Founder & CTO",
      status: "ACTIVE",
      isOnboarded: true,
    },
    {
      name: faker.person.fullName(),
      email: "cfo@example.com",
      title: "CFO",
      status: "PENDING",
      isOnboarded: false,
    },
    {
      name: faker.person.fullName(),
      email: "lawyer@example.com",
      title: "Lawyer at Law Firm LLP",
      status: "PENDING",
    },
    {
      name: faker.person.fullName(),
      email: "accountant@example.com",
      title: "Accountant at XYZ Accounting, Inc.",
      status: "INACTIVE",
    },
  ];

  logger.info(`Seeding ${team.length} team members`);

  // Get all companies
  const companiesResult = await db.query.companies.findMany();

  for (const t of team) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("P@ssw0rd!", salt);
    const { name, email, title, status, isOnboarded } = t;

    // Create user
    const userResult = await db
      .insert(users)
      .values({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
        lastSignedIn: new Date(),
      })
      .returning();

    const user = userResult[0];

    // Create member records for each company
    for (const company of companiesResult) {
      await db.insert(members).values({
        id: uuidv4(),
        title,
        isOnboarded: isOnboarded || false,
        status: (status || "PENDING") as MemberStatus,
        userId: user.id,
        companyId: company.id,
        updatedAt: new Date(),
      });
    }
  }

  logger.info(`Seeded ${team.length} team members`);
  return team;
};

export default seedTeam;
