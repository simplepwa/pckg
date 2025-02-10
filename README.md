# Simple PWA

A powerful CLI tool to seamlessly set up Progressive Web App (PWA) functionality in your Next.js project, with built-in asset generation capabilities.

## Features

- 🚀 One-command PWA setup for Next.js projects
- 🎨 Built-in PWA asset generation from your logo
- 🌐 Optional web-based asset generator at [simplepwa.xyz](https://simplepwa.xyz/#asset)
- 🔧 Automatic package manager detection (npm, yarn, pnpm)
- 📱 Support for both standard and src directory structures
- ⚙️ Configurable asset locations
- 📝 Auto-generated setup documentation
- 🖼️ Comprehensive icon set generation
- 📱 iOS and Android splash screen generation
- 🔗 Social media image generation (OG and Twitter cards)

## Quick Start

```bash
npm i -g @simplepwa/nextjs-pwa-setup
```

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
   - Choose asset generation method
   - Configure PWA details (name, colors, etc.)

## Asset Generation Options

### Option 1: Built-in Generation
- Choose "Yes, I have a logo ready to use" during setup
- Provide the path to your logo (minimum 512x512px)
- Assets are automatically generated and placed in your chosen directory

### Option 2: Web Generator
- Choose "No, I'll generate assets later" during setup
- Visit [simplepwa.xyz/asset](https://simplepwa.xyz/#asset)
- Generate and download assets
- Place them in your specified assets directory

## Generated Assets

The tool generates a comprehensive set of assets:
- Favicons (16x16, 32x32)
- Standard icons (48x48 to 512x512)
- Apple Touch Icons (57x57 to 180x180)
- Maskable icons (192x192, 512x512)
- Social media images
  - Open Graph image (1200x630)
  - Twitter Card (1024x512)
- iOS Splash Screens
  - iPhone X/XR/11 Pro (1125x2436)
  - iPhone XR/11 (828x1792)
  - iPhone XS Max/11 Pro Max (1242x2688)
  - iPhone 6/6S/7/8/SE (750x1334)
- iPad Splash Screens
  - iPad Mini/Air/Pro 9.7" (1536x2048)
  - iPad Pro 11" (1668x2388)
  - iPad Pro 12.9" (2048x2732)

## What It Does

- Installs required dependencies (next-pwa)
- Creates a comprehensive manifest.json
- Updates Next.js configuration
- Generates all required PWA assets (if chosen)
- Sets up proper meta tags and configurations
- Generates detailed setup instructions

## Configuration Options

- Project Structure:
  - Standard app directory
  - src directory with app router

- Assets Location:
  - public/assets
  - public/images
  - Custom location

- Asset Generation:
  - Immediate generation from logo
  - Deferred generation using web tool

- Customizable PWA Details:
  - App name
  - Short name
  - Description
  - Theme color
  - Background color

## License

MIT © [Sabir Khan]

## Links

- Website: [simplepwa.xyz](https://simplepwa.xyz)
- Issues: [GitHub Issues](https://github.com/simplepwa/pckg/issues)