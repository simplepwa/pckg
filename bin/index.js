#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const prompts = require("prompts");
const chalk = require("chalk");
const sharp = require("sharp");

const iconSizes = [
  { name: "favicon-16x16.ico", size: 16 },
  { name: "favicon-32x32.ico", size: 32 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-16x16.png", size: 16 },
  { name: "icon-48x48.png", size: 48 },
  { name: "icon-72x72.png", size: 72 },
  { name: "icon-96x96.png", size: 96 },
  { name: "icon-128x128.png", size: 128 },
  { name: "icon-144x144.png", size: 144 },
  { name: "icon-152x152.png", size: 152 },
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-384x384.png", size: 384 },
  { name: "icon-512x512.png", size: 512 },
  { name: "apple-touch-icon-57x57.png", size: 57 },
  { name: "apple-touch-icon-60x60.png", size: 60 },
  { name: "apple-touch-icon-72x72.png", size: 72 },
  { name: "apple-touch-icon-76x76.png", size: 76 },
  { name: "apple-touch-icon-114x114.png", size: 114 },
  { name: "apple-touch-icon-120x120.png", size: 120 },
  { name: "apple-touch-icon-144x144.png", size: 144 },
  { name: "apple-touch-icon-152x152.png", size: 152 },
  { name: "apple-touch-icon-180x180.png", size: 180 },
  { name: "maskable_icon-192x192.png", size: 192 },
  { name: "maskable_icon-512x512.png", size: 512 },
  { name: "og-image.png", size: { width: 1200, height: 630 } },
  { name: "twitter-card.png", size: { width: 1024, height: 512 } },
  {
    name: "iPhone-X-XR-11-Pro-1125x2436.png",
    size: { width: 1125, height: 2436 },
  },
  { name: "iPhone-XR-11-828x1792.png", size: { width: 828, height: 1792 } },
  {
    name: "iPhone-XS-Max-11-Pro-Max-1242x2688.png",
    size: { width: 1242, height: 2688 },
  },
  {
    name: "iPhone-6-6S-7-8-SE-750x1334.png",
    size: { width: 750, height: 1334 },
  },
  {
    name: "iPad-Mini-Air-Pro-9.7-inch-1536x2048.png",
    size: { width: 1536, height: 2048 },
  },
  {
    name: "iPad-Pro-11-inch-1668x2388.png",
    size: { width: 1668, height: 2388 },
  },
  {
    name: "iPad-Pro-12.9-inch-2048x2732.png",
    size: { width: 2048, height: 2732 },
  },
];

async function generateAssets(logoPath, outputPath) {
  console.log(chalk.blue("\nGenerating PWA assets..."));

  try {
    // Ensure output directory exists
    fs.mkdirSync(outputPath, { recursive: true });

    // Read the source image
    const sourceImage = sharp(logoPath);
    const metadata = await sourceImage.metadata();

    // Check if image is large enough
    if (metadata.width < 512 || metadata.height < 512) {
      throw new Error("Source image should be at least 512x512 pixels");
    }

    // Generate all icon sizes
    for (const icon of iconSizes) {
      const outputFile = path.join(outputPath, icon.name);

      if (typeof icon.size === "number") {
        // Square icons
        await sourceImage
          .resize(icon.size, icon.size, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toFile(outputFile);
      } else {
        // Rectangle icons (splash screens, social media)
        await sourceImage
          .resize(icon.size.width, icon.size.height, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toFile(outputFile);
      }

      console.log(chalk.green(`✓ Generated ${icon.name}`));
    }

    return true;
  } catch (error) {
    console.error(chalk.red(`Error generating assets: ${error.message}`));
    return false;
  }
}

async function detectPackageManager() {
  if (fs.existsSync("yarn.lock")) return "yarn";
  if (fs.existsSync("pnpm-lock.yaml")) return "pnpm";
  if (fs.existsSync("package-lock.json")) return "npm";

  const response = await prompts({
    type: "select",
    name: "packageManager",
    message: "Which package manager are you using?",
    choices: [
      { title: "npm", value: "npm" },
      { title: "yarn", value: "yarn" },
      { title: "pnpm", value: "pnpm" },
    ],
    initial: 0,
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        });
      }
    },
  });

  return response?.packageManager || "npm";
}

async function getManifestInfo() {
  try {
    const questions = [
      {
        type: "text",
        name: "name",
        message: "What is your app name?",
        initial: "My Next.js App",
      },
      {
        type: "text",
        name: "shortName",
        message: "What is your app short name? (Used on home screen)",
        initial: "Next App",
      },
      {
        type: "text",
        name: "description",
        message: "Enter a description for your app:",
        initial: "A Next.js PWA Application",
      },
      {
        type: "text",
        name: "themeColor",
        message: "Enter theme color (hex code):",
        initial: "#000000",
        validate: (value) =>
          /^#[0-9A-Fa-f]{6}$/.test(value)
            ? true
            : "Please enter a valid hex color code (e.g., #000000)",
      },
      {
        type: "text",
        name: "backgroundColor",
        message: "Enter background color (hex code):",
        initial: "#ffffff",
        validate: (value) =>
          /^#[0-9A-Fa-f]{6}$/.test(value)
            ? true
            : "Please enter a valid hex color code (e.g., #ffffff)",
      },
    ];

    const onCancel = () => {
      console.log(chalk.yellow("\nSetup cancelled."));
      process.exit(0);
    };

    const response = await prompts(questions, { onCancel });

    // Check if we have all required values
    const requiredFields = [
      "name",
      "shortName",
      "description",
      "themeColor",
      "backgroundColor",
    ];
    const missingFields = requiredFields.filter((field) => !response[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    return response;
  } catch (error) {
    console.error(
      chalk.red(`\nError getting manifest information: ${error.message}`)
    );
    process.exit(1);
  }
}

async function main() {
  try {
    console.log(chalk.blue("Welcome to Next.js PWA Setup CLI!"));

    // Check if it's a Next.js project
    if (!fs.existsSync("package.json")) {
      throw new Error(
        "package.json not found. Make sure you're in a Next.js project root."
      );
    }

    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    if (!packageJson.dependencies?.next && !packageJson.devDependencies?.next) {
      throw new Error("This doesn't appear to be a Next.js project.");
    }

    // Project structure check
    const structureResponse = await prompts({
      type: "select",
      name: "structure",
      message: "Which project structure are you using?",
      choices: [
        { title: "Standard app directory", value: "standard" },
        { title: "src directory with app router", value: "src" },
      ],
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      },
    });

    // Assets location check
    const assetsResponse = await prompts({
      type: "select",
      name: "assetsLocation",
      message: "Where would you like to store PWA assets?",
      choices: [
        { title: "public/assets", value: "public/assets" },
        { title: "public/images", value: "public/images" },
        { title: "Custom location", value: "custom" },
      ],
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      },
    });

    if (!assetsResponse.assetsLocation) {
      throw new Error("Assets location not selected.");
    }

    let assetsPath = assetsResponse.assetsLocation;
    if (assetsResponse.assetsLocation === "custom") {
      const customPath = await prompts({
        type: "text",
        name: "path",
        message: "Enter the custom assets path (relative to public directory):",
        initial: "pwa-assets",
        onState: (state) => {
          if (state.aborted) {
            process.nextTick(() => {
              process.exit(0);
            });
          }
        },
      });
      assetsPath = `public/${customPath.path}`;
    }

    // Ask about asset generation preference
    const generateNowResponse = await prompts({
      type: "select",
      name: "generateNow",
      message: "Would you like to generate PWA assets now?",
      choices: [
        {
          title: "Yes, I have a logo ready to use",
          value: "yes",
          description: "Generate all required PWA assets from your logo",
        },
        {
          title: "No, I'll generate assets later",
          value: "no",
          description: "You can use our web tool for generating it",
        },
      ],
    });

    let success = false;
    if (generateNowResponse.generateNow === "yes") {
      console.log(chalk.blue("\nLogo path hints:"));
      console.log("- For logo in current directory: ./logo.png");
      console.log("- For logo in public folder: ./public/logo.png");
      console.log("- For logo in other folder: ../path/to/logo.png");

      const logoResponse = await prompts({
        type: "text",
        name: "path",
        message: "Enter the path to your logo (at least 512x512px):",
        validate: (value) =>
          fs.existsSync(value)
            ? true
            : "File does not exist. Please enter a valid path",
      });

      if (!logoResponse.path) {
        throw new Error("Logo path is required for asset generation");
      }

      // Generate assets
      success = await generateAssets(logoResponse.path, assetsPath);
      if (!success) {
        throw new Error("Failed to generate assets");
      }
    } else {
      console.log(
        chalk.yellow("\nℹ️  You can generate PWA assets using our web tool:")
      );
      console.log("🔗 https://simplepwa.xyz/");
      console.log(
        chalk.yellow(`\nOnce generated, place the assets in: ${assetsPath}`)
      );

      // Create the assets directory even if not generating now
      fs.mkdirSync(assetsPath, { recursive: true });
    }

    // Get manifest information
    const manifestInfo = await getManifestInfo();

    // Install next-pwa
    const packageManager = await detectPackageManager();
    console.log(chalk.blue(`\nDetected package manager: ${packageManager}`));

    console.log(chalk.blue("\nInstalling next-pwa..."));
    const installCommand = {
      npm: "npm install",
      yarn: "yarn add",
      pnpm: "pnpm add",
    }[packageManager];

    execSync(`${installCommand} next-pwa`, { stdio: "inherit" });

    // Create manifest.json
    console.log(chalk.blue("\nCreating manifest.json..."));
    const manifestContent = {
      name: manifestInfo.name,
      short_name: manifestInfo.shortName,
      description: manifestInfo.description,
      theme_color: manifestInfo.themeColor,
      background_color: manifestInfo.backgroundColor,
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/?source=pwa",
      icons: [
        {
          src: `/${path.relative("public", assetsPath)}/favicon-16x16.ico`,
          sizes: "16x16",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/favicon-32x32.ico`,
          sizes: "32x32",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/favicon-32x32.png`,
          sizes: "32x32",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/favicon-16x16.png`,
          sizes: "16x16",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-48x48.png`,
          sizes: "48x48",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-72x72.png`,
          sizes: "72x72",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-96x96.png`,
          sizes: "96x96",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-128x128.png`,
          sizes: "128x128",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-144x144.png`,
          sizes: "144x144",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-152x152.png`,
          sizes: "152x152",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-192x192.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-384x384.png`,
          sizes: "384x384",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/icon-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-57x57.png`,
          sizes: "57x57",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-60x60.png`,
          sizes: "60x60",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-72x72.png`,
          sizes: "72x72",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-76x76.png`,
          sizes: "76x76",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-114x114.png`,
          sizes: "114x114",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-120x120.png`,
          sizes: "120x120",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-144x144.png`,
          sizes: "144x144",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-152x152.png`,
          sizes: "152x152",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/apple-touch-icon-180x180.png`,
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/maskable_icon-192x192.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/maskable_icon-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: `/${path.relative("public", assetsPath)}/og-image.png`,
          sizes: "1200x630",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative("public", assetsPath)}/twitter-card.png`,
          sizes: "1200x600",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/iPhone-X-XR-11-Pro-1125x2436.png`,
          sizes: "1125x2436",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/iPhone-XR-11-828x1792.png`,
          sizes: "828x1792",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/iPhone-XS-Max-11-Pro-Max-1242x2688.png`,
          sizes: "1242x2688",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/iPhone-6-6S-7-8-SE-750x1334.png`,
          sizes: "750x1334",
          type: "image/png",
          purpose: "any",
        },
        // iPad Splash Screens
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/iPad-Mini-Air-Pro-9.7-inch-1536x2048.png`,
          sizes: "1536x2048",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/iPad-Pro-11-inch-1668x2388.png`,
          sizes: "1668x2388",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/${path.relative(
            "public",
            assetsPath
          )}/iPad-Pro-12.9-inch-2048x2732.png`,
          sizes: "2048x2732",
          type: "image/png",
          purpose: "any",
        },
      ],
    };

    fs.writeFileSync(
      "public/manifest.json",
      JSON.stringify(manifestContent, null, 2)
    );

    // Update or create next.config.js
    console.log(chalk.blue("\nUpdating Next.js configuration..."));
    const pwaConfigContent = `const withPWA = require('next-pwa')({
        dest: 'public',
        register: true,
        skipWaiting: true,
      })
      
      module.exports = withPWA({
        reactStrictMode: true,
      })`;

    // Check for existing config files
    const hasJsConfig = fs.existsSync("next.config.js");
    const hasTsConfig = fs.existsSync("next.config.ts");
    const hasMjsConfig = fs.existsSync("next.config.mjs");

    // Determine which file to update or create
    let updatedConfigFile = "next.config.js";
    if (hasTsConfig) {
      updatedConfigFile = "next.config.ts";
      fs.writeFileSync("next.config.ts", pwaConfigContent);
    } else if (hasMjsConfig) {
      updatedConfigFile = "next.config.mjs";
      fs.writeFileSync("next.config.mjs", pwaConfigContent);
    } else {
      fs.writeFileSync("next.config.js", pwaConfigContent);
    }

    // Create README with instructions
    console.log(chalk.blue("\nCreating PWA_SETUP.md with instructions..."));

    // Determine metadata file path based on project structure
    const isSrcStructure = structureResponse.structure === "src";
    const metadataPath = isSrcStructure
      ? "src/app/layout.tsx"
      : "app/layout.tsx";

    // Update README content based on generation choice
    const assetInstructions =
      generateNowResponse.generateNow === "yes"
        ? `All required PWA assets have been generated and placed in the ${assetsPath} directory.`
        : `Generate all required PWA assets using our web tool:
     1. Visit: https://simplepwa.xyz/
     2. Upload your logo (at least 512x512px)
     3. Download the generated assets
     4. Extract and place all files in the ${assetsPath} directory`;

    // Update README content
    const readmeContent = `# PWA Setup Instructions

Your Next.js app has been configured as a Progressive Web App (PWA). Here's what you need to know:

1. Assets
   All required PWA assets have been generated and placed in the ${assetsPath} directory, including:
   - Favicons (16x16, 32x32)
   - Standard icons (48x48 to 512x512)
   - Apple Touch Icons (57x57 to 180x180)
   - Maskable icons (192x192, 512x512)
   - Social media images (og-image, twitter-card)
   - Device-specific splash screens (iPhone and iPad variants)

   To regenerate assets, you can run this CLI tool again with a different logo.

2. Configuration Files
   - manifest.json has been created in the public directory
   - ${updatedConfigFile} has been updated with PWA configuration

3. Testing
   - PWA is disabled in development by default
   - To test PWA features, build and start the production server:
     \`\`\`bash
     ${packageManager === "npm" ? "npm run" : packageManager} build
     ${packageManager === "npm" ? "npm run" : packageManager} start
     \`\`\`

4. Metadata Setup
   Add the following metadata to your ${metadataPath} file:

   For App Router (inside the metadata object):
   \`\`\`tsx
   import { Metadata } from 'next'
   
   export const metadata: Metadata = {
     manifest: '/manifest.json',
     themeColor: '${manifestInfo.themeColor}',
     viewport: {
       width: 'device-width',
       initialScale: 1
     },
     icons: {
       apple: '/${path.relative(
         "public",
         assetsPath
       )}/apple-touch-icon-180x180.png'
     },
     appleWebApp: {
       capable: true,
       statusBarStyle: 'default',
       title: '${manifestInfo.shortName}',
     },
     formatDetection: {
       telephone: false,
     },
     openGraph: {
       images: ['/${path.relative("public", assetsPath)}/og-image.png'],
     },
     twitter: {
       card: 'summary_large_image',
       images: ['/${path.relative("public", assetsPath)}/twitter-card.png'],
     },
   }
   \`\`\`

   Or if you prefer to use meta tags directly in your layout:
   \`\`\`tsx
   <head>
     <meta name="viewport" content="width=device-width, initial-scale=1" />
     <meta name="theme-color" content="${manifestInfo.themeColor}" />
     <link rel="manifest" href="/manifest.json" />
     <link rel="apple-touch-icon" href="/${path.relative(
       "public",
       assetsPath
     )}/apple-touch-icon-180x180.png" />
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta name="apple-mobile-web-app-status-bar-style" content="default" />
     <meta name="apple-mobile-web-app-title" content="${
       manifestInfo.shortName
     }" />
     <meta name="format-detection" content="telephone=no" />
     <meta property="og:image" content="/${path.relative(
       "public",
       assetsPath
     )}/og-image.png" />
     <meta name="twitter:card" content="summary_large_image" />
     <meta name="twitter:image" content="/${path.relative(
       "public",
       assetsPath
     )}/twitter-card.png" />
   </head>
   \`\`\`

`;

    fs.writeFileSync("PWA_SETUP.md", readmeContent);

    console.log(chalk.green("\nPWA setup complete! 🎉"));
    console.log(chalk.yellow("\nNext steps:"));
    if (generateNowResponse.generateNow === "no") {
      console.log("1. Generate and add PWA assets using our web tool");
      console.log(`2. Place the generated assets in ${assetsPath}`);
      console.log(
        "3. Add the required meta tags to your app (see PWA_SETUP.md)"
      );
    } else {
      console.log("1. Check PWA_SETUP.md for detailed instructions");
      console.log("2. Add the required meta tags to your app");
    }
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red(`\nUnexpected error: ${error.message}`));
  process.exit(1);
});
