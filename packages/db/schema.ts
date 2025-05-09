import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const UserSchema = createSelectSchema(users);

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: varchar("userId", { length: 128 }).notNull(),
  activeOrganizationId: varchar("activeOrganizationId", { length: 128 }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: varchar("ipAddress", { length: 255 }),
  userAgent: varchar("userAgent", { length: 255 }),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const SessionSchema = createSelectSchema(sessions);

export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  providerId: varchar("providerId", { length: 255 }).notNull(),
  userId: varchar("userId", { length: 128 }).notNull(),
  accessToken: varchar("accessToken", { length: 2048 }),
  refreshToken: varchar("refreshToken", { length: 1024 }),
  idToken: varchar("idToken", { length: 2048 }),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: varchar("scope", { length: 255 }),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const AccountSchema = createSelectSchema(accounts);

export const verifications = pgTable("verifications", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const VerificationSchema = createSelectSchema(verifications);

export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logo: varchar("logo", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const OrganizationSchema = createSelectSchema(organizations);

export const organizationRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  invitations: many(invitations),
}));

export const members = pgTable("members", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  organizationId: varchar("organizationId", { length: 128 }).notNull(),
  userId: varchar("userId", { length: 128 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const MemberSchema = createSelectSchema(members);

export const memberRelations = relations(members, ({ one }) => ({
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
}));

export const invitations = pgTable("invitations", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  inviterId: varchar("inviterId", { length: 128 }).notNull(),
  organizationId: varchar("organizationId", { length: 128 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const InvitationSchema = createSelectSchema(invitations);

export const invitationRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
  }),
}));
