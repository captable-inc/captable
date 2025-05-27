# @captable/email

A tree-shakable email template package for Captable, Inc. Built with React Email components and shared UI components.

## Features

- 🌳 **Tree-shakable**: Import only what you need
- 📧 **Pre-built templates**: Ready-to-use email templates for common use cases
- 🎨 **Tailwind CSS**: Styled with Tailwind CSS for consistent design
- 📱 **Responsive**: Mobile-friendly email templates
- 🔧 **TypeScript**: Full TypeScript support with exported types
- 🧩 **Shared Components**: Reusable email components for consistent styling
- 🎯 **Centered Logo**: All emails include a horizontally centered logo
- 🔘 **Centered Buttons**: All buttons are center-aligned by default

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

### Shared Email Components

The package also exports reusable email components for building custom templates:

```typescript
import { 
  Layout,
  Button,
  Heading,
  Text,
  Link,
  Footer,
  type LayoutProps,
  type ButtonProps,
  type HeadingProps,
  type TextProps,
  type LinkProps,
  type FooterProps
} from "@captable/email";

// Example custom template
const CustomEmail = ({ userName, actionUrl }) => (
  <Layout preview="Welcome to our platform!">
    <Heading>Welcome, {userName}!</Heading>
    <Text>Thank you for joining our platform.</Text>
    <Button href={actionUrl}>Get Started</Button>
    <Footer />
  </Layout>
);
```

#### Component Features

- **Layout** - Main wrapper with HTML structure, Tailwind wrapper, and centered logo
- **Button** - Styled action buttons with consistent appearance and center alignment
- **Heading** - Styled headings with level support (h1, h2, h3)
- **Text** - Text component with variants (body, small, muted)
- **Link** - Link component with variants (primary, muted, breakable)
- **Footer** - Footer with divider and customizable content

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
├── components/          # Shared email components
│   ├── index.ts        # Component exports
│   ├── layout.tsx      # Main email layout with logo
│   ├── button.tsx      # Styled button component
│   ├── heading.tsx     # Heading component
│   ├── text.tsx        # Text component with variants
│   ├── link.tsx        # Link component with variants
│   ├── footer.tsx      # Footer component
│   └── README.md       # Component documentation
├── templates/           # Email template components
│   ├── index.ts        # Template exports
│   ├── account-verification-email.tsx
│   ├── esign-confirmation-email.tsx
│   ├── esign-email.tsx
│   ├── magic-link-email.tsx
│   ├── member-invite-email.tsx
│   ├── password-reset-email.tsx
│   ├── share-data-room-email.tsx
│   └── share-update-email.tsx
├── dist/               # Built package output
├── index.ts            # Main package exports
├── package.json        # Package configuration
└── tsconfig.json       # TypeScript configuration
```

## Tree Shaking

This package is designed to be tree-shakable. You can import only the components you need:

```typescript
// ✅ Good - only imports what you need
import { MagicLinkEmail, Layout, Button, render } from "@captable/email";

// ❌ Avoid - imports everything
import * as EmailPackage from "@captable/email";
```

## TypeScript Support

All email templates and components come with full TypeScript support. Import the types you need:

```typescript
import type { 
  // Template types
  MagicLinkEmailProps,
  AccountVerificationEmailProps,
  PasswordResetEmailProps,
  EsignEmailProps,
  EsignConfirmationEmailProps,
  MemberInviteEmailProps,
  ShareDataRoomEmailProps,
  ShareUpdateEmailProps,
  // Component types
  LayoutProps,
  ButtonProps,
  HeadingProps,
  TextProps,
  LinkProps,
  FooterProps
} from "@captable/email";
```

## Package Exports

The package provides multiple export paths:

```typescript
// Main exports (all templates, components, and utilities)
import { MagicLinkEmail, Layout, Button, render } from "@captable/email";

// Direct template imports
import { MagicLinkEmail } from "@captable/email/templates";

// Direct component imports
import { Layout, Button } from "@captable/email/components";
```

## Contributing

### Adding New Email Templates

When adding new email templates:

1. Create the template in `templates/` directory using kebab-case naming (e.g., `new-template-email.tsx`)
2. Use the shared components from `@/components` for consistency
3. Export the component and its props interface in the template file
4. Add exports to `templates/index.ts`
5. Update this README with the new template (optional)
6. Rebuild the package with `npm run build`

### Adding New Components

When adding new shared components:

1. Create the component in `components/` directory using lowercase naming (e.g., `new-component.tsx`)
2. Handle React Email import conflicts by aliasing (e.g., `Button as ReactEmailButton`)
3. Export simple component names (e.g., `Button`, not `EmailButton`)
4. Add exports to `components/index.ts`
5. Update the component documentation in `components/README.md`

## File Naming Conventions

- **Templates**: Use kebab-case (e.g., `magic-link-email.tsx`)
- **Components**: Use lowercase (e.g., `button.tsx`, `layout.tsx`)
- **Exports**: Use PascalCase for components (e.g., `MagicLinkEmail`, `Button`)

## Scripts

- `npm run dev` - Start development server with template preview
- `npm run build` - Build the TypeScript package
- `npm run build:email` - Build email templates for preview
- `npm run export` - Export emails as static HTML files

## License

This package is part of the Captable project and follows the same license terms.
