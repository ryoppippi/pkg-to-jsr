# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

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
```

### Testing
```fish
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
- **Type Validation**: Typia (runtime type validation with TypeScript)
- **CLI**: cleye (command-line argument parsing)
- **Logging**: consola
- **Testing**: Vitest with doctest support