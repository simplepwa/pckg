#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const prompts = require('prompts');
const chalk = require('chalk');

async function detectPackageManager() {
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('package-lock.json')) return 'npm';

  const response = await prompts({
    type: 'select',
    name: 'packageManager',
    message: 'Which package manager are you using?',
    choices: [
      { title: 'npm', value: 'npm' },
      { title: 'yarn', value: 'yarn' },
      { title: 'pnpm', value: 'pnpm' },
    ],
    initial: 0,
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        });
      }
    }
  });

  return response?.packageManager || 'npm';
}

async function getManifestInfo() {
  try {
    const questions = [
      {
        type: 'text',
        name: 'name',
        message: 'What is your app name?',
        initial: 'My Next.js App'
      },
      {
        type: 'text',
        name: 'shortName',
        message: 'What is your app short name? (Used on home screen)',
        initial: 'Next App'
      },
      {
        type: 'text',
        name: 'description',
        message: 'Enter a description for your app:',
        initial: 'A Next.js PWA Application'
      },
      {
        type: 'text',
        name: 'themeColor',
        message: 'Enter theme color (hex code):',
        initial: '#000000',
        validate: value => /^#[0-9A-Fa-f]{6}$/.test(value) ? true : 'Please enter a valid hex color code (e.g., #000000)'
      },
      {
        type: 'text',
        name: 'backgroundColor',
        message: 'Enter background color (hex code):',
        initial: '#ffffff',
        validate: value => /^#[0-9A-Fa-f]{6}$/.test(value) ? true : 'Please enter a valid hex color code (e.g., #ffffff)'
      }
    ];

    const onCancel = () => {
      console.log(chalk.yellow('\nSetup cancelled.'));
      process.exit(0);
    };

    const response = await prompts(questions, { onCancel });

    // Check if we have all required values
    const requiredFields = ['name', 'shortName', 'description', 'themeColor', 'backgroundColor'];
    const missingFields = requiredFields.filter(field => !response[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return response;
  } catch (error) {
    console.error(chalk.red(`\nError getting manifest information: ${error.message}`));
    process.exit(1);
  }
}

async function main() {
  try {
    console.log(chalk.blue('Welcome to Next.js PWA Setup CLI!'));

    // Check if it's a Next.js project
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json not found. Make sure you\'re in a Next.js project root.');
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.dependencies?.next && !packageJson.devDependencies?.next) {
      throw new Error('This doesn\'t appear to be a Next.js project.');
    }

    // Project structure check
    const structureResponse = await prompts({
      type: 'select',
      name: 'structure',
      message: 'Which project structure are you using?',
      choices: [
        { title: 'Standard app directory', value: 'standard' },
        { title: 'src directory with app router', value: 'src' },
      ],
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      }
    });

    // Assets location check
    const assetsResponse = await prompts({
      type: 'select',
      name: 'assetsLocation',
      message: 'Where would you like to store PWA assets?',
      choices: [
        { title: 'public/assets', value: 'public/assets' },
        { title: 'public/images', value: 'public/images' },
        { title: 'Custom location', value: 'custom' }
      ],
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      }
    });

    if (!assetsResponse.assetsLocation) {
      throw new Error('Assets location not selected.');
    }

    let assetsPath = assetsResponse.assetsLocation;
    if (assetsResponse.assetsLocation === 'custom') {
      const customPath = await prompts({
        type: 'text',
        name: 'path',
        message: 'Enter the custom assets path (relative to public directory):',
        initial: 'pwa-assets',
        onState: (state) => {
          if (state.aborted) {
            process.nextTick(() => {
              process.exit(0);
            });
          }
        }
      });
      assetsPath = `public/${customPath.path}`;
    }

    // Ensure assets directory exists
    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
    }

    // Get manifest information
    const manifestInfo = await getManifestInfo();

    // Install next-pwa
    const packageManager = await detectPackageManager();
    console.log(chalk.blue(`\nDetected package manager: ${packageManager}`));

    console.log(chalk.blue('\nInstalling next-pwa...'));
    const installCommand = {
      npm: 'npm install',
      yarn: 'yarn add',
      pnpm: 'pnpm add'
    }[packageManager];

    execSync(`${installCommand} next-pwa`, { stdio: 'inherit' });

    // Create manifest.json
    console.log(chalk.blue('\nCreating manifest.json...'));
    const manifestContent = {
      name: manifestInfo.name,
      short_name: manifestInfo.shortName,
      description: manifestInfo.description,
      theme_color: manifestInfo.themeColor,
      background_color: manifestInfo.backgroundColor,
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/?source=pwa',
      icons: [
        {
          src: `/${path.relative('public', assetsPath)}/icon-192.png`,
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: `/${path.relative('public', assetsPath)}/icon-512.png`,
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: `/${path.relative('public', assetsPath)}/icon-maskable-192.png`,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: `/${path.relative('public', assetsPath)}/icon-maskable-512.png`,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    };

    fs.writeFileSync('public/manifest.json', JSON.stringify(manifestContent, null, 2));

    // Update or create next.config.js
    console.log(chalk.blue('\nUpdating Next.js configuration...'));
    const pwaConfigContent = `const withPWA = require('next-pwa')({
        dest: 'public',
        register: true,
        skipWaiting: true,
      })
      
      module.exports = withPWA({
        reactStrictMode: true,
      })`;

    // Check for existing config files
    const hasJsConfig = fs.existsSync('next.config.js');
    const hasTsConfig = fs.existsSync('next.config.ts');
    const hasMjsConfig = fs.existsSync('next.config.mjs');

    // Determine which file to update or create
    let updatedConfigFile = 'next.config.js';
    if (hasTsConfig) {
      updatedConfigFile = 'next.config.ts';
      fs.writeFileSync('next.config.ts', pwaConfigContent);
    } else if (hasMjsConfig) {
      updatedConfigFile = 'next.config.mjs';
      fs.writeFileSync('next.config.mjs', pwaConfigContent);
    } else {
      fs.writeFileSync('next.config.js', pwaConfigContent);
    }


    // Create README with instructions
    console.log(chalk.blue('\nCreating PWA_SETUP.md with instructions...'));

        // Determine metadata file path based on project structure
        const isSrcStructure = structureResponse.structure === 'src';
        const metadataPath = isSrcStructure ? 'src/app/layout.tsx' : 'app/layout.tsx';

 const readmeContent = `# PWA Setup Instructions

Your Next.js app has been configured as a Progressive Web App (PWA). Here's what you need to know:

1. Required Assets
   Place the following icons in your ${assetsPath} directory:
   - icon-192.png (192x192)
   - icon-512.png (512x512)
   - icon-maskable-192.png (192x192)
   - icon-maskable-512.png (512x512)

2. Configuration Files
   - manifest.json has been created in the public directory
   - ${updatedConfigFile} has been updated with PWA configuration

3. Additional Setup
   - PWA is disabled in development by default
   - To test PWA features, build and start the production server:
     \`\`\`bash
     ${packageManager === 'npm' ? 'npm run' : packageManager} build
     ${packageManager === 'npm' ? 'npm run' : packageManager} start
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
       apple: '${manifestContent.icons[0].src}'
     }
   }
   \`\`\`

   Or if you prefer to use meta tags directly in your layout:
   \`\`\`tsx
   <head>
     <meta name="viewport" content="width=device-width, initial-scale=1" />
     <meta name="theme-color" content="${manifestInfo.themeColor}" />
     <link rel="manifest" href="/manifest.json" />
     <link rel="apple-touch-icon" href="${manifestContent.icons[0].src}" />
   </head>
   \`\`\`

Note: For App Router (app directory), it's recommended to use the metadata object approach as it's the Next.js 13+ preferred method.

For more information about PWA features and configuration, visit:
https://github.com/shadowwalker/next-pwa
`;

    fs.writeFileSync('PWA_SETUP.md', readmeContent);

    console.log(chalk.green('\nPWA setup complete! 🎉'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log('1. Add the required icons to your assets directory');
    console.log('2. Check PWA_SETUP.md for detailed instructions');
    console.log('3. Add the required meta tags to your app');

  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red(`\nUnexpected error: ${error.message}`));
  process.exit(1);
});