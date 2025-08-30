/**
 * CLEANUP AND CONSOLIDATION SCRIPT
 * Identifies outdated files and helps consolidate the project
 * 
 * Save as: cleanup-consolidate.js
 */

const fs = require('fs');
const path = require('path');

class ProjectCleanup {
  constructor() {
    this.outdatedFiles = [];
    this.duplicates = [];
    this.coreFiles = new Set([
      'real-engine-implementation.js',
      'motion-class-full-integration.js',
      'rle-database-org.js',
      'rle-cycles-108-112.js',
      'motion-class-integration-script.js',
      'complete-continuation-prompt-updated.md',
      'master-status-current.md'
    ]);
  }

  // Scan for outdated references
  async scanForOutdated() {
    console.log("🔍 Scanning for outdated references...\n");
    
    const files = await this.getAllFiles('.');
    
    for (const file of files) {
      if (file.includes('node_modules') || file.includes('.git')) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const issues = [];
        
        // Check for outdated references
        if (content.includes('5 members') && !file.includes('patch') && !file.includes('integration')) {
          issues.push('Contains "5 members" reference');
        }
        if (content.includes('5/1070')) {
          issues.push('Contains "5/1070" reference');
        }
        if (content.includes('need to expand to 1,070')) {
          issues.push('Says Motion Class needs expansion');
        }
        if (content.includes('Currently simplified')) {
          issues.push('Says implementation is simplified');
        }
        
        if (issues.length > 0) {
          this.outdatedFiles.push({
            file: path.basename(file),
            path: file,
            issues: issues
          });
        }
      } catch (err) {
        // Skip binary files
      }
    }
  }

  // Find duplicate files
  async findDuplicates() {
    console.log("\n🔍 Looking for duplicate files...\n");
    
    const files = await this.getAllFiles('.');
    const fileGroups = {};
    
    for (const file of files) {
      if (file.includes('node_modules') || file.includes('.git')) continue;
      
      const basename = path.basename(file);
      const nameWithoutExt = basename.replace(/\.[^/.]+$/, "");
      
      // Group files by similar names
      if (!fileGroups[nameWithoutExt]) {
        fileGroups[nameWithoutExt] = [];
      }
      fileGroups[nameWithoutExt].push(file);
    }
    
    // Find groups with multiple files
    for (const [name, files] of Object.entries(fileGroups)) {
      if (files.length > 1) {
        this.duplicates.push({
          name: name,
          files: files
        });
      }
    }
  }

  // Get all files recursively
  async getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      
      try {
        if (fs.statSync(filePath).isDirectory()) {
          arrayOfFiles = await this.getAllFiles(filePath, arrayOfFiles);
        } else {
          arrayOfFiles.push(filePath);
        }
      } catch (err) {
        // Skip inaccessible files
      }
    }
    
    return arrayOfFiles;
  }

  // Generate cleanup report
  generateReport() {
    console.log("\n📊 CLEANUP REPORT");
    console.log("================\n");
    
    // Outdated files
    if (this.outdatedFiles.length > 0) {
      console.log("❌ FILES WITH OUTDATED REFERENCES:");
      this.outdatedFiles.forEach(item => {
        console.log(`\n  📄 ${item.file}`);
        item.issues.forEach(issue => {
          console.log(`     - ${issue}`);
        });
      });
      
      console.log("\n💡 RECOMMENDATION: Update these files or replace with:");
      console.log("   - complete-continuation-prompt-updated.md");
      console.log("   - master-status-current.md");
    } else {
      console.log("✅ No files with outdated references found!");
    }
    
    // Duplicate files
    if (this.duplicates.length > 0) {
      console.log("\n\n🔄 POTENTIAL DUPLICATE FILES:");
      this.duplicates.forEach(group => {
        console.log(`\n  📁 ${group.name}:`);
        group.files.forEach(file => {
          console.log(`     - ${file}`);
        });
      });
      
      console.log("\n💡 RECOMMENDATION: Review these for consolidation");
    }
    
    // Core files check
    console.log("\n\n✅ CORE FILES TO KEEP:");
    this.coreFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`  ✓ ${file}`);
      } else {
        console.log(`  ✗ ${file} (MISSING - needs to be created/saved)`);
      }
    });
  }

  // Create organized structure
  async createOrganizedStructure() {
    console.log("\n\n🏗️  RECOMMENDED PROJECT STRUCTURE:");
    console.log("=====================================\n");
    
    const structure = `
recursive-learning-engine/
├── core/
│   ├── real-engine-implementation.js
│   ├── motion-class-full-integration.js
│   └── rle-cycles-108-112.js
├── database/
│   └── rle-database-org.js
├── tools/
│   ├── motion-class-integration-script.js
│   └── cleanup-consolidate.js
├── docs/
│   ├── complete-continuation-prompt-updated.md
│   ├── master-status-current.md
│   └── README.md
└── archive/
    └── (old/outdated files moved here)
`;
    
    console.log(structure);
    
    console.log("\n📋 TO ORGANIZE:");
    console.log("1. Create the folder structure above");
    console.log("2. Move files to appropriate folders");
    console.log("3. Archive outdated files");
    console.log("4. Update imports/requires in code files");
  }

  // Main execution
  async run() {
    console.log("🧹 RECURSIVE LEARNING ENGINE - CLEANUP & CONSOLIDATION");
    console.log("=====================================================\n");
    
    await this.scanForOutdated();
    await this.findDuplicates();
    this.generateReport();
    await this.createOrganizedStructure();
    
    console.log("\n\n✨ CLEANUP ANALYSIS COMPLETE!");
    console.log("\n📌 NEXT STEPS:");
    console.log("1. Review the report above");
    console.log("2. Run: node motion-class-integration-script.js");
    console.log("3. Save the new consolidated files from the chat");
    console.log("4. Organize into the recommended structure");
    console.log("5. Commit to GitHub with clean structure");
  }
}

// Utility to move files
async function moveToArchive(filename) {
  const archiveDir = './archive';
  
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const newPath = path.join(archiveDir, `${timestamp}-${filename}`);
  
  fs.renameSync(filename, newPath);
  console.log(`📦 Archived: ${filename} → ${newPath}`);
}

// Export
module.exports = {
  ProjectCleanup,
  moveToArchive
};

// Run if called directly
if (require.main === module) {
  const cleanup = new ProjectCleanup();
  cleanup.run();
}