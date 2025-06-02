# Development Scripts

This directory contains development utilities for the Captable application.

## Jobs Script (`jobs.ts`)

Process jobs from the queue system.

### Usage

```bash
# Process all pending jobs once
bun run jobs

# Process jobs continuously (watch mode)
bun run jobs:dev

# Show queue statistics
bun run jobs stats

# Clean up old completed jobs
bun run jobs cleanup
```

### Watch Mode

The watch mode (`--watch` flag) continuously monitors the job queue and processes jobs as they appear. This is useful during development when you want jobs to be processed automatically.

- Checks for new jobs every 5 seconds when idle
- Processes jobs immediately when found
- Gracefully handles shutdown with Ctrl+C

## Test Jobs Script (`test-jobs.ts`)

Queue sample jobs for testing purposes.

### Usage

```bash
# Queue all test email jobs
bun run test-jobs

# Queue specific job types
bun run test-jobs password-reset
bun run test-jobs member-invite
bun run test-jobs auth-verification

# Just show queue statistics
bun run test-jobs stats
```

## Running Jobs with Development Server

To run jobs automatically alongside your development server:

```bash
# Run everything including job processing
bun dx
```

This will start:
- Next.js development server
- Database studio
- Email development server
- Job processor in watch mode

## Job Types Available

- `email.password-reset` - Password reset emails
- `email.member-invite` - Member invitation emails  
- `email.auth-verify` - Account verification emails
- `email.share-update` - Share update notifications
- `email.share-data-room` - Data room sharing emails
- `email.esign` - E-signature request emails
- `email.esign-confirmation` - E-signature confirmation emails
- `generate.esign-pdf` - PDF generation for e-signatures 