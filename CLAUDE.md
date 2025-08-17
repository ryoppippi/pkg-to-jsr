# CLAUDE.md

## Semantic Coding Tools

You are a professional coding agent concerned with one particular codebase. You have
access to semantic coding tools on which you rely heavily for all your work, as well as collection of memory
files containing general information about the codebase. You operate in a frugal and intelligent manner, always
keeping in mind to not read or generate content that is not needed for the task at hand.

When reading code in order to answer a user question or task, you should try reading only the necessary code.
Some tasks may require you to understand the architecture of large parts of the codebase, while for others,
it may be enough to read a small set of symbols or a single file.
Generally, you should avoid reading entire files unless it is absolutely necessary, instead relying on
intelligent step-by-step acquisition of information. Use the symbol indexing tools to efficiently navigate the codebase.

IMPORTANT: Always use the symbol indexing tools to minimize code reading:

- Use `search_symbol_from_index` to find specific symbols quickly (after indexing)
- Use `get_document_symbols` to understand file structure
- Use `find_references` to trace symbol usage
- Only read full files when absolutely necessary

You can achieve intelligent code reading by:

1. Using `index_files` to build symbol index for fast searching
2. Using `search_symbol_from_index` with filters (name, kind, file, container) to find symbols
3. Using `get_document_symbols` to understand file structure
4. Using `get_definitions`, `find_references` to trace relationships
5. Using standard file operations when needed

### Working with Symbols

Symbols are identified by their name, kind, file location, and container. Use these tools:

- `index_files` - Build symbol index for files matching pattern (e.g., '\*_/_.ts')
- `search_symbol_from_index` - Fast search by name, kind (Class, Function, etc.), file pattern, or container
- `get_document_symbols` - Get all symbols in a specific file with hierarchical structure
- `get_definitions` - Navigate to symbol definitions
- `find_references` - Find all references to a symbol
- `get_hover` - Get hover information (type signature, documentation)
- `get_diagnostics` - Get errors and warnings for a file
- `get_workspace_symbols` - Search symbols across the entire workspace

Always prefer indexed searches (tools with `_from_index` suffix) over reading entire files.

## Project Overview

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

pkg-to-jsr is a zero-config CLI tool that generates `jsr.json` files from existing `package.json` files for publishing packages to JSR (JavaScript Registry).

## Common Commands

### Development

```fish
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

# Build the project
bun build

# Generate zod schemas from JSR spec
bun build:gen_zod

# Generate TypeScript types
bun build:gen_types
```

### Linting and Code Quality

The project uses ESLint with strict TypeScript rules for code quality. When you encounter linting errors:

```fish
# Check linting issues
bun lint

# Auto-fix linting issues
bun format

# Type checking
bun typecheck
```

**Common issues and fixes:**

- **Unused imports**: Run `bun format` to auto-remove
- **Type errors**: Use proper type assertions with `as` when needed
- **zod-mini syntax**: Use `z.optional()` wrapper function, not `.optional()` method
- **Boolean expressions**: Use explicit comparisons (`value === false`, `value != null`) instead of truthy/falsy checks

**ESLint Configuration:**

The project uses strict TypeScript rules including:

- `ts/no-unsafe-*` rules for type safety
- `ts/strict-boolean-expressions` for explicit boolean comparisons
- `unused-imports/no-unused-imports` for clean imports
- `perfectionist/sort-*` for consistent ordering
- `antfu/top-level-function` for function declarations

### Testing

```fish
# Run all tests with type checking
bun run test

# Run a specific test file
bun test tests/basic/index.test.ts

# Update test snapshots
bun test -u
```

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

**src/jsr-schemas.ts** - Generated zod schemas for JSR validation (auto-generated from JSR spec)

**src/logger.ts** - Logging utilities using `consola`

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
- **scripts/gen_zod_schemas.js** - Fetches JSR schema from https://jsr.io/schema/config-file.v1.json and generates custom zod schemas
- **scripts/gen_types.js** - Generates TypeScript types from JSON schemas
- Schemas are automatically regenerated during build process via tsdown hooks
- Tree-shakable validation with smaller bundle size compared to alternatives

### Build System

- **tsdown.config.ts** - Build configuration using tsdown for TypeScript compilation
- **vite.config.ts** - Test configuration with vitest and doctest plugin support
- Build process includes: type generation → zod schema generation → TypeScript compilation → minification
- External dependencies (cleye, consola, terminal-link) are not bundled
