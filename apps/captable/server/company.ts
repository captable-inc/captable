import { db } from "@captable/db";
import { eq } from "@captable/db/utils";
import { members, companies } from "@captable/db/schema";

export const getCompanyList = async (userId: string) => {
  const data = await db
    .select({
      id: members.id,
      company: {
        id: companies.id,
        publicId: companies.publicId,
        name: companies.name,
      },
    })
    .from(members)
    .innerJoin(companies, eq(members.companyId, companies.id))
    .where(eq(members.userId, userId));

  return data;
};

export type TGetCompanyList = Awaited<ReturnType<typeof getCompanyList>>;
