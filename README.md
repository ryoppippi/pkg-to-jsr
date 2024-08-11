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
		"include": ["dist"],
		"exclude": ["dist/**/*.test.js"]
	}
}
```

## 🔧 How it works

pkg-to-jsr performs the following steps:

1. 🔍 Locates your `package.json` file
2. 📤 Extracts relevant information such as `name`, `version`, and `exports`
3. ✍️ Generates a `jsr.json` file with the correct structure for JSR

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
- 🧩 Complex exports with `jsr`, `import`, and other conditions are simplified for JSR (`jsr` is a special field. It is used to specify the main entry point for the package on JSR)
- ⚠️ Invalid or unsupported exports are warned about and skipped

### Publish configuration

If your `package.json` includes a `files` array, pkg-to-jsr will use it to generate the `publish.include` and `publish.exclude` fields in `jsr.json`:

- 📂 Files without a leading `!` are added to `include`
- 🚫 Files with a leading `!` are added to `exclude` (with the `!` removed)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](./LICENSE)
