import type { ShareContactType } from "@/schema/contacts";
import { db, members, users, stakeholders, eq } from "@captable/db";
import { createTRPCRouter, withAuth } from "@/trpc/api/trpc";

export const commonRouter = createTRPCRouter({
  getContacts: withAuth.query(async ({ ctx }) => {
    const { session } = ctx;
    const user = session.user;
    const companyId = user.companyId;
    const contacts = [] as ShareContactType[];

    const membersData = await db
      .select({
        id: members.id,
        userEmail: users.email,
        userName: users.name,
        userImage: users.image,
      })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(eq(members.companyId, companyId));

    const stakeholdersData = await db
      .select({
        id: stakeholders.id,
        email: stakeholders.email,
        name: stakeholders.name,
        institutionName: stakeholders.institutionName,
      })
      .from(stakeholders)
      .where(eq(stakeholders.companyId, companyId));

    (membersData || []).map((member) => {
      if (member.userEmail && member.userName) {
        contacts.push({
          id: member.id,
          image: member.userImage || "",
          email: member.userEmail,
          value: member.userEmail,
          name: member.userName,
          type: "member",
        });
      }
    });
    
    (stakeholdersData || []).map((stakeholder) => {
      if (stakeholder.email && stakeholder.name) {
        contacts.push({
          id: stakeholder.id,
          email: stakeholder.email,
          value: stakeholder.email,
          name: stakeholder.name,
          institutionName: stakeholder.institutionName || "",
          type: "stakeholder",
        });
      }
    });

    return contacts;
  }),
});
