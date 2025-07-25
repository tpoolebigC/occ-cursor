#!/usr/bin/env node

/**
 * Migration Script: Update Import Paths to Feature Structure
 * 
 * This script helps migrate from the old directory structure to the new
 * feature-based organization. It updates import paths in TypeScript/JavaScript files.
 */

const fs = require('fs');
const path = require('path');

// Import path mappings from old to new structure
const importMappings = {
  // B2B imports
  '~/b2b/use-b2b-auth': '~/features/b2b/hooks/use-b2b-auth',
  '~/b2b/use-b2b-sdk': '~/features/b2b/hooks/use-b2b-sdk',
  '~/b2b/use-b2b-cart': '~/features/b2b/hooks/use-b2b-cart',
  '~/b2b/use-b2b-quote-enabled': '~/features/b2b/hooks/use-b2b-quote-enabled',
  '~/b2b/use-b2b-shopping-list-enabled': '~/features/b2b/hooks/use-b2b-shopping-list-enabled',
  '~/b2b/use-product-details': '~/features/b2b/hooks/use-product-details',
  '~/b2b/types': '~/features/b2b/types',
  '~/b2b/client': '~/features/b2b/services/client',
  '~/b2b/server-login': '~/features/b2b/services/auth',

  // Algolia imports
  '~/lib/algolia/client': '~/features/algolia/services/client',
  '~/lib/algolia/faceted-search': '~/features/algolia/services/faceted-search',
  '~/lib/algolia/debug-index': '~/features/algolia/services/debug-index',
  '~/lib/algolia/transformer': '~/features/algolia/services/transformer',

  // Makeswift imports
  '~/lib/makeswift/client': '~/features/makeswift/services/client',
  '~/lib/makeswift/runtime': '~/features/makeswift/utils/runtime',
  '~/lib/makeswift/provider': '~/features/makeswift/providers/provider',
  '~/lib/makeswift/component': '~/features/makeswift/components/component',
  '~/lib/makeswift/components': '~/features/makeswift/components',
  '~/lib/makeswift/utils': '~/features/makeswift/utils',
  '~/lib/makeswift/controls': '~/features/makeswift/controls',
};

// File patterns to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to exclude
const excludeDirs = ['node_modules', '.next', '.turbo', 'dist', 'build'];

/**
 * Recursively find all files with specified extensions
 */
function findFiles(dir, extensions, excludeDirs) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          files.push(...findFiles(fullPath, extensions, excludeDirs));
        }
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Update imports in a single file
 */
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Update import statements
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      const importRegex = new RegExp(
        `(import\\s+.*?\\s+from\\s+['"])${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`,
        'g'
      );
      
      if (importRegex.test(content)) {
        content = content.replace(importRegex, `$1${newPath}$2`);
        hasChanges = true;
        console.log(`  Updated import: ${oldPath} -> ${newPath}`);
      }
    }

    // Update require statements
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      const requireRegex = new RegExp(
        `(require\\s*\\(\\s*['"])${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"]\\s*\\))`,
        'g'
      );
      
      if (requireRegex.test(content)) {
        content = content.replace(requireRegex, `$1${newPath}$2`);
        hasChanges = true;
        console.log(`  Updated require: ${oldPath} -> ${newPath}`);
      }
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
function migrateFiles() {
  console.log('🚀 Starting migration to feature-based structure...\n');

  const currentDir = process.cwd();
  const files = findFiles(currentDir, fileExtensions, excludeDirs);
  
  let totalFiles = 0;
  let updatedFiles = 0;

  for (const file of files) {
    totalFiles++;
    const relativePath = path.relative(currentDir, file);
    console.log(`Processing: ${relativePath}`);
    
    if (updateImportsInFile(file)) {
      updatedFiles++;
    }
  }

  console.log(`\n✅ Migration completed!`);
  console.log(`📊 Files processed: ${totalFiles}`);
  console.log(`📝 Files updated: ${updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log(`\n⚠️  Please review the changes and test your application.`);
    console.log(`📚 Check the features/README.md for the new structure.`);
  } else {
    console.log(`\n✨ No files needed updating.`);
  }
}

// Run migration if script is executed directly
if (require.main === module) {
  migrateFiles();
}

module.exports = { migrateFiles, importMappings }; 