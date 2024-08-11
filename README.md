# pkg-to-jsr 🚀

[![npm version](https://img.shields.io/npm/v/pkg-to-jsr?color=yellow)](https://npmjs.com/package/pkg-to-jsr)
[![npm downloads](https://img.shields.io/npm/dm/pkg-to-jsr?color=yellow)](https://npmjs.com/package/pkg-to-jsr)

pkg-to-jsr is a zero-config generator that creates a `jsr.json` file from your existing `package.json`.

It simplifies the process of preparing your package for publication on [JSR](https://jsr.io).

## ✨ Features

- 🔧 Zero configuration required - just run and go!
- 🪄 Automatically generates `jsr.json` from `package.json`
- 📦 Handles complex `exports` configurations with ease
- 🎯 Supports `include` and `exclude` options for precise publishing control
- 🚀 Streamlines your workflow for JSR publication

## 📥 Installation

You can use pkg-to-jsr without installation using npx:

```bash
npx pkg-to-jsr
```

Alternatively, you can use other package managers:

```bash
# Using Yarn
yarn dlx pkg-to-jsr

# Using pnpm
pnpm dlx pkg-to-jsr

# Using Bun
bunx pkg-to-jsr
```

For global installation:

```bash
npm install -g pkg-to-jsr
```

## 🚀 Usage

Run the following command in your project directory:

```bash
npx pkg-to-jsr
```

This will generate a `jsr.json` file based on your `package.json`.

### Options

- `--root <path>`: Specify the root directory containing the `package.json` file (default: current working directory)

## 📚 Examples

Here are some examples of how pkg-to-jsr transforms your `package.json` into `jsr.json`:

### Basic Example

**package.json**:

```json
{
	"name": "package",
	"jsrName": "@scope/package",
	"version": "1.0.0",
	"exports": "./index.js"
}
```

**Generated jsr.json**:

```json
{
	"name": "@scope/package",
	"version": "1.0.0",
	"exports": {
		".": "./index.js"
	}
}
```

### Complex Exports Example

**package.json**:

```json
{
	"name": "package",
	"author": "ryoppippi",
	"version": "1.0.0",
	"exports": {
		".": {
			"jsr": "./src/index.ts",
			"import": "./dist/index.js",
			"types": "./dist/index.d.ts"
		},
		"./utils": {
			"jsr": "./src/utils.ts",
			"import": "./dist/utils.js",
			"types": "./dist/utils.d.ts"
		}
	},
	"files": [
		"dist",
		"!dist/**/*.test.js"
	],
	"jsrInclude": [
		"src"
	],
	"jsrExclude": [
		"src/**/*.test.ts"
	]
}
```

**Generated jsr.json**:

```json
{
	"name": "@ryoppippi/package",
	"version": "1.0.0",
	"exports": {
		".": "./src/index.ts",
		"./utils": "./src/utils.ts"
	},
	"publish": {
		"include": ["dist", "src"],
		"exclude": ["dist/**/*.test.js", "src/**/*.test.ts"]
	}
}
```

## 🔧 How it works

pkg-to-jsr performs the following steps:

1. 🔍 Locates your `package.json` file
2. 📤 Extracts relevant information such as `name`, `version`, and `exports`
3. ✍️ Generates a `jsr.json` file with the correct structure for JSR

More details on implementation can be found in the [source code](./src).

You can see example projects in the [tests](./tests).

### Name Handling

pkg-to-jsr determines the package name for `jsr.json` using the following logic:

1. 🏷️ If a `jsrName` field exists in `package.json` and is correctly formatted (`@scope/package-name`), it is used.
2. 📦 If `jsrName` is not present, it checks the `name` field in `package.json`. If this is correctly formatted for JSR, it is used.
3. 🔧 If `name` is not in JSR format, it combines the `name` and `author` fields. For example, if `name` is "package" and `author` is "ryoppippi", it generates `@ryoppippi/package`.
4. ❌ If none of the above methods produce a valid name, an error is thrown.

This approach allows maximum flexibility while ensuring compliance with JSR naming conventions.

### Exports handling

The tool intelligently handles various `exports` configurations:

- 🧵 String exports are converted to object format
- 🧩 Complex exports with `jsr`, `import`, and other conditions are handled
- 🏆 If a `jsr` field is specified in the exports, it takes priority over other fields
- ⚠️ Invalid or unsupported exports are warned about and skipped

### Publish configuration

pkg-to-jsr generates the `publish.include` and `publish.exclude` fields in `jsr.json` by merging and filtering information from multiple sources:

1. 📂 `jsrInclude` array in `package.json`: All entries are considered for inclusion
2. 🚫 `jsrExclude` array in `package.json`: All entries are considered for exclusion
3. 📁 `files` array in `package.json`:
   - Files without a leading `!` are considered for inclusion
   - Files with a leading `!` are considered for exclusion (with the `!` removed)

The final `include` and `exclude` lists in `jsr.json` are the result of merging and filtering these sources:

- The `include` list combines unique entries from both `jsrInclude` and the positive entries in `files`, excluding any paths that are in `jsrExclude`
- The `exclude` list combines unique entries from both `jsrExclude` and the negative entries in `files` (with `!` removed), excluding any paths that are in `jsrInclude`

This approach provides fine-grained control over what gets published to JSR while maintaining compatibility with existing `files` configurations and allowing for explicit inclusion and exclusion rules.

Example:

**package.json**:

```json
{
	"files": [
		"dist",
		"src",
		"!dist/**/*.test.js"
	],
	"jsrInclude": [
		"src",
		"types"
	],
	"jsrExclude": [
		"src/**/*.test.ts",
		"dist"
	]
}
```

**Generated jsr.json**:

```json
{
	"publish": {
		"include": ["src", "types"],
		"exclude": ["dist/**/*.test.js", "src/**/*.test.ts"]
	}
}
```

In this example:
- `src` is included because it's in both `files` and `jsrInclude`
- `types` is included because it's in `jsrInclude`
- `dist` is excluded because it's in `jsrExclude`, overriding its presence in `files`
- Test files in both `dist` and `src` are excluded

This merged and filtered configuration ensures that all necessary files are included while respecting explicit inclusion and exclusion rules, providing precise control over the package contents for JSR publication.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](./LICENSE)
