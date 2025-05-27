# Email Components

This directory contains reusable email components built with React Email and Tailwind CSS.

## Components

### EmailLayout
The main layout wrapper that includes HTML structure, Tailwind wrapper, and centered logo.

```tsx
import { EmailLayout } from "@components";

<EmailLayout 
  preview="Email preview text"
  logoUrl="https://example.com/logo.png"
  logoAlt="Company Logo"
>
  {/* Email content */}
</EmailLayout>
```

**Props:**
- `children`: React.ReactNode - Email content
- `preview?`: string - Preview text for email clients
- `logoUrl?`: string - Logo URL (defaults to Captable logo)
- `logoAlt?`: string - Logo alt text
- `containerClassName?`: string - Custom container classes

### EmailHeading
Styled heading component for email titles.

```tsx
import { EmailHeading } from "@components";

<EmailHeading level="h1">
  Welcome to <strong>Company Name</strong>
</EmailHeading>
```

**Props:**
- `children`: React.ReactNode
- `className?`: string - Custom classes
- `level?`: "h1" | "h2" | "h3" - Heading level

### EmailText
Text component with predefined variants.

```tsx
import { EmailText } from "@components";

<EmailText variant="body">Regular text content</EmailText>
<EmailText variant="small">Small text</EmailText>
<EmailText variant="muted">Muted text</EmailText>
```

**Props:**
- `children`: React.ReactNode
- `className?`: string - Custom classes (overrides variant)
- `variant?`: "body" | "small" | "muted"

### EmailButton
Styled button component with consistent appearance and robust center alignment.

```tsx
import { EmailButton } from "@components";

<EmailButton href="https://example.com">
  Click Here
</EmailButton>
```

**Props:**
- `href`: string - Button link
- `children`: React.ReactNode - Button text
- `className?`: string - Custom button classes
- `sectionClassName?`: string - Custom section wrapper classes

**Note:** Buttons are center-aligned using table-based layout for maximum compatibility across email clients.

### EmailLink
Link component with different style variants.

```tsx
import { EmailLink } from "@components";

<EmailLink href="https://example.com" variant="primary">
  Regular link
</EmailLink>
<EmailLink href="https://example.com" variant="breakable">
  https://very-long-url.com/that/needs/to/break
</EmailLink>
<EmailLink href="https://example.com" variant="muted">
  Footer link
</EmailLink>
```

**Props:**
- `href`: string - Link URL
- `children`: React.ReactNode - Link text
- `className?`: string - Custom classes (overrides variant)
- `variant?`: "primary" | "muted" | "breakable"

### EmailFooter
Footer component with divider and customizable content.

```tsx
import { EmailFooter } from "@components";

// Default footer with company link
<EmailFooter />

// Custom text footer
<EmailFooter 
  customText="Please ignore if you weren't expecting this email."
  showDivider={true}
/>

// Custom link footer
<EmailFooter 
  customLink="https://example.com"
  customLinkText="Visit our website"
/>
```

**Props:**
- `showDivider?`: boolean - Show horizontal divider (default: true)
- `customText?`: string - Custom footer text
- `customLink?`: string - Custom footer link URL
- `customLinkText?`: string - Custom footer link text

## Usage Example

```tsx
import {
  EmailLayout,
  EmailHeading,
  EmailText,
  EmailButton,
  EmailLink,
  EmailFooter,
} from "../components";

export const WelcomeEmail = ({ userName, loginUrl }) => (
  <EmailLayout preview="Welcome to our platform!">
    <EmailHeading>
      Welcome, <strong>{userName}</strong>!
    </EmailHeading>
    
    <EmailText>
      Thank you for joining our platform. Click below to get started.
    </EmailText>

    <EmailButton href={loginUrl}>
      Get Started
    </EmailButton>
    
    <EmailText>
      Or copy this link: <EmailLink href={loginUrl} variant="breakable">
        {loginUrl}
      </EmailLink>
    </EmailText>

    <EmailFooter />
  </EmailLayout>
);
```

## Features

- **Consistent Styling**: All components use consistent Tailwind classes
- **Centered Logo**: EmailLayout automatically includes a centered logo
- **Centered Buttons**: All buttons are center-aligned using table-based layout for email client compatibility
- **Responsive Design**: Components work across different email clients
- **TypeScript Support**: Full type safety with TypeScript interfaces
- **Customizable**: Override default styles with custom classes
- **Accessible**: Proper semantic HTML and alt text support 