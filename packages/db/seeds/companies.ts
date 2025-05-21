import { generatePublicId } from "@captable/config";
import { logger } from "@captable/logger";
import { faker } from "@faker-js/faker";
import { sample } from "lodash-es";
import { v4 as uuidv4 } from "uuid";
import { db } from "../index";
import { companies } from "../schema/companies";

type CompanyInputData = {
  id: string;
  name: string;
  publicId: string;
  incorporationType: string;
  incorporationDate: Date;
  incorporationState: string;
  incorporationCountry: string;
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  updatedAt: Date;
};

const seedCompanies = async (count = 4) => {
  const companiesData: CompanyInputData[] = [];

  for (let i = 0; i < count; i++) {
    companiesData.push({
      id: uuidv4(),
      name: faker.company.name(),
      publicId: generatePublicId(),
      incorporationType: sample(["llc", "c-corp", "s-corp"]) || "c-corp",
      incorporationDate: faker.date.past(),
      incorporationState: faker.location.state({ abbreviated: true }),
      incorporationCountry: faker.location.countryCode(),
      streetAddress: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipcode: faker.location.zipCode(),
      country: faker.location.countryCode(),
      updatedAt: new Date(),
    });
  }

  logger.info(`Seeding ${companiesData.length} companies`);

  const result = await db.insert(companies).values(companiesData);

  logger.info(`Seeded ${companiesData.length} companies`);
  return result;
};

export default seedCompanies;
