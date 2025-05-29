# @captable/db

A tree-shakable database package for Captable, built with [Drizzle ORM](https://orm.drizzle.team/) and PostgreSQL.

## 🌟 Features

- **Tree-shakable exports**: Import only what you need
- **Type-safe**: Full TypeScript support with inferred types
- **Comprehensive**: Complete database schema and utilities
- **Drizzle ORM**: Built on the modern, performant Drizzle ORM
- **PostgreSQL**: Optimized for PostgreSQL databases
- **Auto-exports**: New tables are automatically available - no manual configuration needed

## 📦 Installation

```bash
bun install @captable/db
```

## 🚀 Quick Start

### Single Import Interface

```typescript
import { 
  db, 
  eq, 
  users, 
  companies, 
  UserSchema,
  whereClause,
  paginationClause 
} from "@captable/db";

// Query users
const allUsers = await db.select().from(users);

// Query with conditions
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, "john@example.com"))
  .limit(1);

// Using utility functions
const paginatedUsers = await db
  .select()
  .from(users)
  .where(eq(users.email, "john@example.com"))
  .limit(10)
  .offset(0);
```

## 📋 Available Exports

### Database Instance & Types

- `db` - The main database instance
- `DB` - Database type
- `DBTransaction` - Transaction type
- `drizzleConfig` - Drizzle configuration

### Schema Tables (Auto-exported)

**All database tables are automatically available** - no manual configuration needed! 

When you add a new table to any schema file, it's immediately available for import:

```typescript
import { 
  users,
  companies, 
  members,
  stakeholders,
  accounts,
  sessions,
  passkeys,
  verificationTokens,
  bankAccounts,
  audits,
  shareClasses,
  equityPlans,
  buckets,
  documents,
  dataRooms,
  templates,
  shares,
  options,
  investments,
  safes,
  convertibleNotes,
  updates,
  billingProducts,
  billingPrices,
  billingSubscriptions,
  billingCustomers,
  accessTokens,
  // ... any new tables you add
} from "@captable/db";
```

### Schema Types (Auto-exported)

**All Zod schemas and TypeScript types are automatically available**:

```typescript
import { 
  UserSchema,
  CompanySchema,
  BillingProductSchema,
  // ... any new schemas you add
} from "@captable/db";

// Validate user data
const validatedUser = UserSchema.parse(userData);

// Infer types
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```

### Enums (Auto-exported)

**All database enums are automatically available**:

```typescript
import {
  MemberStatusEnum,
  RolesEnum,
  StakeholderTypeEnum,
  ShareLegendsEnum,
  OptionTypeEnum,
  SafeTypeEnum,
  UpdateStatusEnum,
  // ... any new enums you add
} from "@captable/db";
```

### Drizzle ORM Operators (Auto-exported)

Common query operators re-exported for convenience:

```typescript
import {
  eq,      // Equal
  ne,      // Not equal
  gt,      // Greater than
  gte,     // Greater than or equal
  lt,      // Less than
  lte,     // Less than or equal
  isNull,  // Is NULL
  isNotNull, // Is NOT NULL
  and,     // AND condition
  or,      // OR condition
  not,     // NOT condition
  like,    // LIKE (case-sensitive)
  ilike,   // ILIKE (case-insensitive)
  between, // BETWEEN
  inArray, // IN array
  notInArray, // NOT IN array
  desc,    // Descending order
  asc,     // Ascending order
  sql,     // Raw SQL
  count    // Count function
} from "@captable/db";
```

### Utility Functions (Auto-exported)

Custom helper functions for common operations:

```typescript
import {
  whereClause,
  orderByClause,
  paginationClause
} from "@captable/db";

// Build complex where clauses
const whereCondition = whereClause(
  eq(users.active, true),
  like(users.email, "%@company.com")
);

// Order by with direction
const orderBy = orderByClause(users.createdAt, "desc");

// Pagination
const pagination = paginationClause(2, 20); // page 2, 20 items per page
```

## 🌳 Tree Shaking

This package is fully tree-shakable using modern wildcard exports. You can import only what you need:

```typescript
// Import only specific tables and operators
import { db, users, companies, eq, and } from "@captable/db";

// Import utilities separately if needed
import { paginationClause } from "@captable/db";

// Import specific schemas
import { UserSchema } from "@captable/db";
```

The `package.json` includes:
- `"sideEffects": false` for optimal tree-shaking
- Proper `exports` field for module resolution
- TypeScript support with type definitions

**Note**: Modern bundlers (Webpack 5+, Vite, Rollup) handle wildcard exports (`export *`) efficiently and only include the modules you actually import.

## 📚 Usage Examples

### Basic Queries

```typescript
import { db, users, eq } from "@captable/db";

// Select all users
const allUsers = await db.select().from(users);

// Select specific user
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, "user-id"))
  .limit(1);

// Select with multiple conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(and(
    eq(users.active, true),
    isNotNull(users.emailVerified)
  ));
```

### Joins

```typescript
import { db, users, companies, members, eq } from "@captable/db";

const usersWithCompanies = await db
  .select({
    user: users,
    company: companies
  })
  .from(users)
  .innerJoin(members, eq(users.id, members.userId))
  .innerJoin(companies, eq(members.companyId, companies.id));
```

### Transactions

```typescript
import { db, users, companies } from "@captable/db";

await db.transaction(async (tx) => {
  // Insert company
  const [company] = await tx
    .insert(companies)
    .values({ name: "New Company" })
    .returning();

  // Insert user
  await tx
    .insert(users)
    .values({ 
      name: "John Doe",
      email: "john@newcompany.com"
    });
});
```

### Using Utilities

```typescript
import { 
  db, 
  users, 
  eq, 
  whereClause, 
  orderByClause, 
  paginationClause 
} from "@captable/db";

const { limit, offset } = paginationClause(1, 10);
const { where } = whereClause(eq(users.active, true));
const { orderBy } = orderByClause(users.createdAt, "desc");

const paginatedUsers = await db
  .select()
  .from(users)
  .where(where)
  .orderBy(orderBy)
  .limit(limit)
  .offset(offset);
```

## 🛠 Development

### Scripts

```bash
# Lint code
bun run lint

# Format code
bun run format

# Generate migrations
bun run generate

# Run migrations
bun run migrate

# Combined migration workflow
bun run db:migrate

# Open Drizzle Studio
bun run db:studio

# Seed database
bun run db:seed
```

### Better Auth Schema Generation

To generate the authentication schema from better-auth configuration:

```bash
# Generate auth schema from better-auth config
pnpx @better-auth/cli@latest generate --config=../auth/index.ts --output=schema/auth.ts
```

This command:
- Reads the better-auth configuration from `../auth/index.ts`
- Generates the corresponding Drizzle schema
- Outputs the schema to `schema/auth.ts`
- Automatically includes all necessary tables for authentication (users, sessions, accounts, etc.)

After running this command, make sure to:
1. Review the generated `schema/auth.ts` file
2. Update `schema/index.ts` to export the new auth tables if needed
3. Run `bun run generate` to create any necessary migrations
4. Run `bun run migrate` to apply the migrations

### Project Structure

```
packages/db/
├── schema/           # Database schema definitions
│   ├── index.ts     # Schema exports
│   ├── enums.ts     # Database enums
│   ├── users.ts     # Users table
│   ├── companies.ts # Companies table
│   └── ...          # Other schema files
├── migrations/       # Database migrations
├── seeds/           # Database seed files
├── utils.ts         # Utility functions
├── config.ts        # Drizzle configuration
├── index.ts         # Main export file
└── package.json     # Package configuration
```

## 🔧 Configuration

The database connection is configured via environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

## 📄 License

This package is part of the Captable project and follows the same license terms.

## 🤝 Contributing

1. Make changes to schema files in `schema/` directory
2. Update exports in `schema/index.ts` if adding new schema files
3. Run `bun run generate` to create migrations
4. Test your changes

**Note**: Individual tables, types, and enums are automatically exported from the main package - no manual export management needed in the main `index.ts` file!

## 🔗 Related

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Captable Main Repository](https://github.com/octolane/captable)
