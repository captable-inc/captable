# @captable/utils

A collection of shared utilities for the Captable monorepo, designed for optimal treeshaking.

## Features

- 🌳 **Treeshakable**: Import only what you need
- 📦 **Multiple entry points**: Granular imports for better bundle optimization
- 🔧 **TypeScript**: Full type safety
- 🚀 **Zero dependencies**: Lightweight and fast

## Installation

This package is part of the Captable monorepo and uses workspace dependencies.

## Usage

### Treeshakable Imports (Recommended)

For optimal bundle size, import specific utilities directly:

```typescript
// Import only constants (most treeshakable)
import { META } from "@captable/utils/constants";
```

### Convenience Imports

For convenience, you can also import from the main entry point:

```typescript
// Import from main entry (still treeshakable with modern bundlers)
import { META } from "@captable/utils";
```

## Available Utilities

### Constants

- `META`: Company metadata including URLs, social links, and OCF information

## Adding New Utilities

When adding new utilities:

1. Create a new file in `lib/` directory
2. Add the export path to `package.json` exports field
3. Re-export from `index.ts` for convenience
4. Update this README

Example:

```json
// package.json
"exports": {
  "./new-utility": {
    "import": "./dist/lib/new-utility.js",
    "require": "./dist/lib/new-utility.js",
    "types": "./dist/lib/new-utility.d.ts"
  }
}
```

## Building

```bash
bun run build
``` 