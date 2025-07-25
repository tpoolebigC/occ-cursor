#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need label property fixes
const filesToFix = [
  'features/makeswift/components/site-theme/components/footer.ts',
  'features/makeswift/components/site-theme/components/accordion.ts',
  'features/makeswift/components/site-theme/components/carousel.ts',
  'features/makeswift/components/site-theme/components/logo.ts',
  'features/makeswift/components/site-theme/components/section.ts',
  'features/makeswift/components/site-theme/components/product-card.ts',
  'features/makeswift/components/site-theme/components/slide-show.ts',
  'features/makeswift/components/site-theme/components/header/banner.ts',
  'features/makeswift/components/site-theme/components/header/nav.ts',
  'features/makeswift/components/site-theme/components/header/index.ts',
  'features/makeswift/components/site-theme/components/price-label.ts',
  'features/makeswift/components/site-theme/register.ts',
  'features/makeswift/components/product-detail/register.ts',
  'features/makeswift/components/section/section.makeswift.ts',
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix Shape({ label: '...', type: { patterns
  content = content.replace(
    /Shape\(\{\s*\n\s*label:\s*['"`][^'"`]*['"`],\s*\n\s*type:\s*\{/g,
    'Shape({\n  type: {'
  );

  // Fix Shape({ label: '...', type: { patterns (single line)
  content = content.replace(
    /Shape\(\{\s*label:\s*['"`][^'"`]*['"`],\s*type:\s*\{/g,
    'Shape({\n  type: {'
  );

  // Fix colorGroup function patterns
  content = content.replace(
    /Shape\(\{\s*\n\s*label,\s*\n\s*type:\s*\{/g,
    'Shape({\n    type: {'
  );

  // Fix colorGroup function patterns (single line)
  content = content.replace(
    /Shape\(\{\s*label,\s*type:\s*\{/g,
    'Shape({\n    type: {'
  );

  // Fix register.ts patterns
  content = content.replace(
    /label:\s*['"`][^'"`]*['"`],\s*\n\s*type:\s*\{/g,
    'type: {'
  );

  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    modified = true;
  } else {
    console.log(`No changes needed: ${filePath}`);
  }

  return modified;
}

console.log('Fixing Makeswift component label properties...\n');

let totalFixed = 0;
filesToFix.forEach(file => {
  if (fixFile(file)) {
    totalFixed++;
  }
});

console.log(`\nFixed ${totalFixed} files.`); 