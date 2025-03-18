/**
 * Fix Dependency Versions Script
 * 
 * This script ensures that all packages use workspace:* for internal dependencies
 * and consistent versions for external dependencies across the workspace.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all package.json files in the workspace
function findPackageJsonFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      if (fs.existsSync(path.join(filePath, 'package.json'))) {
        results.push(path.join(filePath, 'package.json'));
      }
      results.push(...findPackageJsonFiles(filePath));
    }
  }
  
  return results;
}

// Main function
function fixDependencies() {
  console.log('Finding package.json files...');
  const packageJsonFiles = findPackageJsonFiles('.');
  console.log(`Found ${packageJsonFiles.length} package.json files`);
  
  // Collect all package names and their paths
  const packageNames = new Map();
  packageJsonFiles.forEach(filePath => {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    packageNames.set(packageJson.name, path.dirname(filePath));
  });
  
  // Fix internal dependencies
  packageJsonFiles.forEach(filePath => {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;
    
    // Check normal dependencies
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach(dep => {
        if (packageNames.has(dep) && packageJson.dependencies[dep] !== 'workspace:*') {
          console.log(`Fixing ${dep} in ${packageJson.name} (dependencies)`);
          packageJson.dependencies[dep] = 'workspace:*';
          changed = true;
        }
      });
    }
    
    // Check dev dependencies
    if (packageJson.devDependencies) {
      Object.keys(packageJson.devDependencies).forEach(dep => {
        if (packageNames.has(dep) && packageJson.devDependencies[dep] !== 'workspace:*') {
          console.log(`Fixing ${dep} in ${packageJson.name} (devDependencies)`);
          packageJson.devDependencies[dep] = 'workspace:*';
          changed = true;
        }
      });
    }
    
    // Write changes if needed
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated ${filePath}`);
    }
  });
  
  console.log('All internal dependencies fixed to use workspace:*');
  console.log('Run "bun install" to update the lockfile');
}

// Execute the function
fixDependencies();
