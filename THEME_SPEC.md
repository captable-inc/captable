# White-Label + Dark Theme Spec

## Part 1: White-Label Branding

### 1A. Constants — `src/lib/constants.ts`
Replace Captable branding with Launch Legends:
```ts
export const constants = {
  title: "Launch Legends",
  url: "https://investors.launchlegends.io",
  description: "Investor portal powered by Launch Legends.",
  // Remove twitter, github, discord, ocf — not relevant
};
```

### 1B. Sidebar logo — `src/components/dashboard/sidebar/index.tsx`
- Replace `<CaptableLogo className="h-7 w-auto" />` with the company logo from the database
- The `SideBar` component receives `companies` and `publicId`. We need the company logo.
- Update `src/server/company.ts` `getCompanyList` to include `logo` in the select:
  ```ts
  select: { id: true, company: { select: { id: true, publicId: true, name: true, logo: true } } }
  ```
- In the sidebar, find the current company from `companies` using `publicId`, then show `<img>` of `company.logo` with fallback to a simple text logo or icon
- Remove the `CaptableLogo` import

### 1C. Auth pages — `src/components/onboarding/auth-form-header.tsx`
Change from:
```
"Signup to Captable, Inc." / "Login to Captable, Inc."
```
To:
```
"Create your account" / "Welcome back"
```
Remove `CaptableLogo` — replace with a simple styled text mark or keep it clean with just the heading.

Also update these files that use CaptableLogo:
- `src/components/onboarding/forgot-password/index.tsx`
- `src/components/onboarding/reset-password/index.tsx`  
- `src/components/onboarding/set-password/index.tsx`

### 1D. Share page layout — `src/components/share/page-layout.tsx`
Remove the "Powered by Captable, Inc." footer entirely (lines 35-47).

### 1E. Email templates
Update all three email templates to remove Captable references:
- `src/emails/MemberInviteEmail.tsx` — Replace "Captable, Inc." with `constants.title`, remove "Powered by" footer link
- `src/emails/ShareDataRoomEmail.tsx` — Replace "Powered by" footer, use `constants.title`
- `src/emails/ShareUpdateEmail.tsx` — Same treatment

In each email, change the footer from "Powered by Captable, Inc." to just the company name from the email context.

## Part 2: Dark Theme (Linear/Vercel/Arc inspired)

### Design Direction
- Dark zinc/neutral palette (not pure black — use zinc-900/950 for depth)
- Subtle borders with low opacity (zinc-800)
- Clean typography with good contrast
- Smooth transitions on hover states (150ms ease)
- Teal/emerald accent color for active states and CTAs (matches existing teal in share page)

### 2A. Global CSS — `src/styles/globals.css`
Make the DARK theme the DEFAULT by changing `:root` CSS variables:
```css
:root {
  --background: 240 6% 6%;          /* zinc-950 */
  --foreground: 0 0% 95%;           /* near white */
  
  --card: 240 5% 9%;                /* slightly lighter than bg */
  --card-foreground: 0 0% 95%;
  
  --popover: 240 5% 12%;
  --popover-foreground: 0 0% 95%;
  
  --primary: 0 0% 95%;              /* white text as primary */
  --primary-foreground: 240 6% 6%;  /* dark bg */
  
  --secondary: 240 4% 16%;
  --secondary-foreground: 0 0% 90%;
  
  --muted: 240 4% 16%;
  --muted-foreground: 240 5% 55%;
  
  --accent: 166 72% 44%;            /* teal-500 accent */
  --accent-foreground: 0 0% 98%;
  
  --destructive: 0 62.8% 50%;
  --destructive-foreground: 0 0% 98%;
  
  --border: 240 4% 16%;
  --input: 240 4% 18%;
  --ring: 166 72% 44%;              /* teal ring */
  
  --radius: 0.5rem;
}
```
Remove the `.dark` class section — we're making dark the default.

### 2B. Dashboard layout — `src/app/(authenticated)/(dashboard)/[publicId]/layout.tsx`
Change:
- `bg-gray-50` → use dark background (remove hardcoded gray-50 — let CSS vars handle it)
- sidebar `lg:border-r` → use `border-border` color (will be dark)

### 2C. Sidebar — `src/components/dashboard/sidebar/index.tsx`
Update all hardcoded gray-* classes:
- `text-gray-400` → `text-muted-foreground`
- `text-gray-700` → `text-foreground/70`
- `hover:bg-gray-50` → `hover:bg-secondary`
- `bg-gray-50` → `bg-secondary`
- `font-semibold text-primary` stays for active state
- "Company" section label: `text-gray-400` → `text-muted-foreground`

### 2D. Navbar — `src/components/dashboard/navbar/index.tsx`
- `bg-gray-50` → remove (use bg-background)
- Border stays

### 2E. Data room explorer — `src/components/documents/data-room/explorer.tsx`
- `border-gray-200` → `border-border`
- `bg-white` → `bg-card`
- `text-gray-900` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-600` → `text-muted-foreground`

### 2F. Dataroom folders — `src/app/.../data-rooms/components/dataroom-folders.tsx`
Same pattern: replace gray-* with semantic tokens.

### 2G. Documents table — `src/app/.../documents/components/table.tsx`
Same pattern.

### 2H. Login/signup pages
- The auth pages use a gradient background from `from-indigo-50 via-white to-cyan-100`
- Change to a dark gradient: `from-zinc-950 via-zinc-900 to-zinc-950`
- Card styling: dark card with subtle border
- Button: teal accent instead of black

### 2I. File preview — `src/components/file/preview.tsx`
Already a client component. No gray-* hardcoded classes.

### 2J. Share page layout — `src/components/share/page-layout.tsx`
- `from-indigo-50 via-white to-cyan-100` → dark gradient
- Card styling → dark

### 2K. Company switcher — `src/components/dashboard/sidebar/company-switcher.tsx`
- `bg-transparent` → stays
- Text styling should inherit from parent

## Part 3: Polish

### Transitions
Add to globals.css:
```css
@layer base {
  * {
    @apply border-border transition-colors duration-150;
  }
}
```

### Nav links — `src/components/dashboard/sidebar/nav-link.tsx`
- Add transition-all for smooth hover
- Replace hardcoded colors with semantic tokens

## Files to modify (complete list):
1. `src/lib/constants.ts`
2. `src/server/company.ts`
3. `src/components/common/logo.tsx` — can be deleted or repurposed
4. `src/components/dashboard/sidebar/index.tsx`
5. `src/components/dashboard/sidebar/company-switcher.tsx`
6. `src/components/dashboard/sidebar/nav-link.tsx`
7. `src/components/dashboard/navbar/index.tsx`
8. `src/components/onboarding/auth-form-header.tsx`
9. `src/components/onboarding/forgot-password/index.tsx`
10. `src/components/onboarding/reset-password/index.tsx`
11. `src/components/onboarding/set-password/index.tsx`
12. `src/components/share/page-layout.tsx`
13. `src/components/file/preview.tsx` (if needed)
14. `src/components/documents/data-room/explorer.tsx`
15. `src/emails/MemberInviteEmail.tsx`
16. `src/emails/ShareDataRoomEmail.tsx`
17. `src/emails/ShareUpdateEmail.tsx`
18. `src/styles/globals.css`
19. `src/app/(authenticated)/(dashboard)/[publicId]/layout.tsx`
20. `src/app/.../documents/components/table.tsx`
21. `src/app/.../data-rooms/components/dataroom-folders.tsx`
22. `src/app/.../data-rooms/components/data-room-files.tsx`
