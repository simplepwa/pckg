# Simple PWA

A CLI tool to seamlessly set up Progressive Web App (PWA) functionality in your Next.js project.

## Features

- 🚀 One-command PWA setup for Next.js projects
- 🎨 Interactive CLI with customization options
- 🔧 Automatic package manager detection (npm, yarn, pnpm)
- 📱 Support for both standard and src directory structures
- ⚙️ Configurable asset locations
- 📝 Auto-generated setup documentation

## Quick Start

```bash
npm i -g simple-pwa
```

## Prerequisites

1. Generate your PWA assets at [simplepwa.xyz](https://www.simplepwa.xyz/#asset)
2. Download and keep the generated assets ready

## Usage

1. Navigate to your Next.js project:
   ```bash
   cd your-nextjs-project
   ```

2. Run the setup command:
   ```bash
   simple-pwa
   ```

3. Follow the interactive prompts to:
   - Choose your project structure
   - Select assets location
   - Configure PWA details (name, colors, etc.)

4. Place your generated assets (from simplepwa.xyz) in the specified assets directory

## What It Does

- Installs required dependencies (next-pwa)
- Creates manifest.json
- Updates Next.js configuration
- Generates detailed setup instructions
- Sets up proper meta tags and configurations

## Configuration Options

- Project Structure:
  - Standard app directory
  - src directory with app router

- Assets Location:
  - public/assets
  - public/images
  - Custom location

- Customizable PWA Details:
  - App name
  - Short name
  - Description
  - Theme color
  - Background color

## Asset Generation

Visit [simplepwa.xyz/asset](https://simplepwa.xyz/#asset) to generate:
- icon-192.png (192x192)
- icon-512.png (512x512)
- icon-maskable-192.png (192x192)
- icon-maskable-512.png (512x512)

## License

MIT © [Sabir Khan]

## Links

- Website: [simplepwa.xyz](https://simplepwa.xyz)
- Issues: [GitHub Issues](https://github.com/simplepwa/pckg/issues)