# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pkg-to-jsr is a zero-config CLI tool that generates `jsr.json` files from existing `package.json` files for publishing packages to JSR (JavaScript Registry).

## Common Commands

### Development

````fish
# Run the CLI locally
bun cli

# Run tests with type checking
bun test

# Run tests in watch mode
bun test --watch

# Type check the codebase
bun typecheck

# Lint and format code
bun lint
bun format

## Linting and Code Quality

The project uses ESLint with strict TypeScript rules for code quality. When you encounter linting errors:

### Check linting issues:
```fish
bun lint
````

### Auto-fix linting issues:

```fish
bun format
```

### Type checking:

```fish
bun typecheck
```

### Common issues and fixes:

- **Unused imports**: Run `bun format` to auto-remove
- **Type errors**: Use proper type assertions with `as` when needed
- **zod-mini syntax**: Use `z.optional()` wrapper function, not `.optional()` method
- **Boolean expressions**: Use explicit comparisons (`value === false`, `value != null`) instead of truthy/falsy checks
- **ESLint MCP**: Use Claude's ESLint MCP to identify and fix complex linting issues

### ESLint Configuration:

The project uses strict TypeScript rules including:

- `ts/no-unsafe-*` rules for type safety
- `ts/strict-boolean-expressions` for explicit boolean comparisons
- `unused-imports/no-unused-imports` for clean imports
- `perfectionist/sort-*` for consistent ordering
- `antfu/top-level-function` for function declarations

# Build the project

bun build

# Generate zod schemas from JSR spec

bun build:gen_zod

````

### Testing

```fish
# Run a specific test file
bun test tests/basic/index.test.ts

# Update test snapshots
bun test -u
````

### Release Process

```fish
# Full release pipeline (typecheck, test, build, version bump)
bun release
```

## Architecture

### Core Components

**src/index.ts** - Main logic for JSR configuration generation:

- `jsrName` resolution: Handles package naming for JSR (checks jsrName field, then name field, then combines author+name)
- Export transformation: Converts package.json exports to JSR format, prioritizing `jsr` field when present
- Include/exclude handling: Merges `files`, `jsrInclude`, and `jsrExclude` arrays into publish configuration

**src/cli.ts** - CLI interface using `cleye` library for argument parsing

**src/jsr.ts** - TypeScript schema definitions for JSR configuration

### Key Implementation Details

1. **Name Resolution Priority**:

   - First checks `jsrName` field in package.json
   - Falls back to `name` field if it's JSR-formatted (@scope/name)
   - Combines `author` + `name` as @author/name
   - Throws error if no valid name can be generated

2. **Export Handling**:

   - String exports are converted to object format with "." key
   - Complex exports with conditions are supported
   - `jsr` field in exports takes priority over other fields
   - Invalid exports are warned about and skipped

3. **Publish Configuration**:
   - `include`: Merges unique entries from `jsrInclude` and positive `files` entries
   - `exclude`: Merges `jsrExclude` and negative `files` entries (prefixed with !)
   - Filters are applied to ensure exclude rules override include rules

### Testing Strategy

Tests use Vitest with snapshot testing. Each test case in `/tests/` contains:

- `package.json` - Input configuration
- `jsr.json` - Expected output (snapshot)
- Test verifies the transformation matches expected output

### Dependencies

- **Runtime**: Bun (JavaScript runtime and build tool)
- **Type Validation**: zod-mini (tree-shakable runtime validation from zod v4)
- **CLI**: cleye (command-line argument parsing)
- **Logging**: consola
- **Testing**: Vitest with doctest support

### Validation Architecture

The project uses zod-mini for runtime type validation:

- **src/jsr-schemas.ts** - Generated zod schemas from JSR configuration spec
- **scripts/gen_zod_schemas.js** - Automatically generates zod schemas from JSR JSON Schema
- Schemas are automatically regenerated during build process
- Tree-shakable validation with smaller bundle size compared to alternatives
