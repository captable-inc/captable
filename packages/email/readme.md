# @captable/email

A tree-shakable email template package for Captable, Inc. Built with React Email components.

## Features

- 🌳 **Tree-shakable**: Import only what you need
- 📧 **Pre-built templates**: Ready-to-use email templates for common use cases
- 🎨 **Tailwind CSS**: Styled with Tailwind CSS for consistent design
- 📱 **Responsive**: Mobile-friendly email templates
- 🔧 **TypeScript**: Full TypeScript support with exported types

## Installation

This package is part of the Captable monorepo and is intended for internal use.

```bash
# In your package.json dependencies
"@captable/email": "workspace:*"
```

## Usage

### Basic Import

```typescript
import { MagicLinkEmail, render } from "@captable/email";
import { META } from "@captable/utils/constants";
```

### Email Templates

All email templates follow the same pattern. Import the template you need along with its props type:

```typescript
import { 
  MagicLinkEmail, 
  AccountVerificationEmail,
  PasswordResetEmail,
  MemberInviteEmail,
  ShareUpdateEmail,
  ShareDataRoomEmail,
  EsignEmail,
  EsignConfirmationEmail,
  render,
  type MagicLinkEmailProps,
  type AccountVerificationEmailProps
} from "@captable/email";

// Example usage
const props: MagicLinkEmailProps = {
  magicLink: "https://captable.inc/auth/callback?token=..."
};

const html = await render(MagicLinkEmail(props));
```

### Available Templates

The package includes the following email templates:

- **AccountVerificationEmail** - Email verification for new accounts
- **EsignConfirmationEmail** - Confirmation email after document signing
- **EsignEmail** - Email with document signing request
- **MagicLinkEmail** - Magic link authentication email
- **MemberInviteEmail** - Team member invitation email
- **PasswordResetEmail** - Password reset email
- **ShareDataRoomEmail** - Data room sharing notification
- **ShareUpdateEmail** - Company update sharing notification

### Render Functions

The package re-exports the commonly used render functions from `@react-email/components`:

```typescript
import { render } from "@captable/email";

// Synchronous rendering
const html = render(MagicLinkEmail({ magicLink: "..." }));

// Asynchronous rendering (recommended)
const html = await render(MagicLinkEmail({ magicLink: "..." }));
```

## Development

### Preview Emails

Start the development server to preview emails:

```bash
cd packages/email
npm run dev
```

This will start the React Email preview server on port 3001 and watch for changes in the `templates/` directory.

### Build Package

Build the TypeScript package:

```bash
cd packages/email
npm run build
```

### Build Email Templates

Build static email templates for preview:

```bash
cd packages/email
npm run build:email
```

### Export Emails

Export emails as static HTML files:

```bash
cd packages/email
npm run export
```

## Package Structure

```
packages/email/
├── templates/           # Email template components
│   ├── index.ts        # Template exports
│   ├── AccountVerificationEmail.tsx
│   ├── EsignConfirmationEmail.tsx
│   ├── EsignEmail.tsx
│   ├── MagicLinkEmail.tsx
│   ├── MemberInviteEmail.tsx
│   ├── PasswordResetEmail.tsx
│   ├── ShareDataRoomEmail.tsx
│   └── ShareUpdateEmail.tsx
├── lib/                # Shared utilities and constants
├── dist/               # Built package output
├── index.ts            # Main package exports
├── package.json        # Package configuration
└── tsconfig.json       # TypeScript configuration
```

## Tree Shaking

This package is designed to be tree-shakable. You can import only the components you need:

```typescript
// ✅ Good - only imports what you need
import { MagicLinkEmail, render } from "@captable/email";

// ❌ Avoid - imports everything
import * as EmailPackage from "@captable/email";
```

## TypeScript Support

All email templates come with full TypeScript support. Import the types you need:

```typescript
import type { 
  MagicLinkEmailProps,
  AccountVerificationEmailProps,
  PasswordResetEmailProps,
  EsignEmailProps,
  EsignConfirmationEmailProps,
  MemberInviteEmailProps,
  ShareDataRoomEmailProps,
  ShareUpdateEmailProps
} from "@captable/email";
```

## Package Exports

The package provides multiple export paths:

```typescript
// Main exports (all templates and utilities)
import { MagicLinkEmail, render } from "@captable/email";

// Direct template imports
import { MagicLinkEmail } from "@captable/email/templates";
```

## Contributing

When adding new email templates:

1. Create the template in `templates/` directory
2. Export the component and its props interface in the template file
3. Add exports to `templates/index.ts`
4. Update this README with the new template (optional)
5. Rebuild the package with `npm run build`

**Note**: The main `index.ts` uses `export * from "./templates"` so you don't need to manually add each template export there.

## Scripts

- `npm run dev` - Start development server with template preview
- `npm run build` - Build the TypeScript package
- `npm run build:email` - Build email templates for preview
- `npm run export` - Export emails as static HTML files

## License

This package is part of the Captable project and follows the same license terms.
