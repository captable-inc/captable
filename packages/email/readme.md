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
import { MagicLinkEmail, render, renderAsync } from "@captable/email";
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
  renderAsync,
  type MagicLinkEmailProps,
  type AccountVerificationEmailProps
} from "@captable/email";

// Example usage
const props: MagicLinkEmailProps = {
  magicLink: "https://captable.inc/auth/callback?token=..."
};

const html = await renderAsync(MagicLinkEmail(props));
```

### Render Functions

The package re-exports the commonly used render functions from `@react-email/components`:

```typescript
import { render, renderAsync } from "@captable/email";

// Synchronous rendering
const html = render(MagicLinkEmail({ magicLink: "..." }));

// Asynchronous rendering (recommended)
const html = await renderAsync(MagicLinkEmail({ magicLink: "..." }));
```

### Constants

Access shared constants used across email templates:

```typescript
import { META } from "@captable/email";

console.log(META.title); // "Captable, Inc."
console.log(META.url);   // "https://captable.inc"
```

## Development

### Preview Emails

Start the development server to preview emails:

```bash
cd packages/email
npm run dev
```

### Build Package

Build the TypeScript package:

```bash
cd packages/email
npm run build:tsc
```

### Build Email Templates

Build static email templates for preview:

```bash
cd packages/email
npm run build
```

### Export Emails

Export emails as static HTML files:

```bash
cd packages/email
npm run export
```

## Tree Shaking

This package is designed to be tree-shakable. You can import only the components you need:

```typescript
// ✅ Good - only imports what you need
import { MagicLinkEmail, renderAsync } from "@captable/email";

// ❌ Avoid - imports everything
import * as EmailPackage from "@captable/email";
```

## TypeScript Support

All email templates come with full TypeScript support. Import the types you need:

```typescript
import type { 
  MagicLinkEmailProps,
  AccountVerificationEmailProps,
  PasswordResetEmailProps 
} from "@captable/email";
```

## Contributing

When adding new email templates:

1. Create the template in `emails/` directory
2. Export the component and its props interface
3. Add exports to `index.ts`
4. Rebuild the package with `npm run build:tsc`

## License

This package is part of the Captable project and follows the same license terms.
