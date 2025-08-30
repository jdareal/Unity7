/**
 * 🔧 PROJECT CONSOLIDATION & INCONSISTENCY FIXER
 * Analyzes all scattered files and fixes inconsistencies
 * Creates single source of truth for the Recursive Learning Engine
 */

const fs = require('fs').promises;
const path = require('path');

class ProjectConsolidationFixer {
  constructor() {
    this.projectRoot = process.cwd();
    this.analysisResults = {
      filesFound: [],
      inconsistencies: [],
      duplicates: [],
      outdated: [],
      validFiles: []
    };
    
    this.correctState = {
      currentCycle: 124, // Based on latest file analysis
      motionClassSystem: {
        baseGroups: 5,
        expansionRule: 'Add 1 group every 5 cycles',
        membersPerGroup: 50,
        totalGroups: this.calculateCorrectGroups(124),
        totalMembers: this.calculateCorrectGroups(124) * 50
      },
      platform: 'Mac',
      deploymentTarget: 'runtcoin.fun',
      autonomousLearning: true
    };
    
    console.log('🔧 PROJECT CONSOLIDATION & INCONSISTENCY FIXER');
    console.log('==============================================');
    console.log(`📊 Target State: Cycle ${this.correctState.currentCycle}`);
    console.log(`🎭 Motion Class: ${this.correctState.motionClassSystem.totalGroups} groups, ${this.correctState.motionClassSystem.totalMembers} members`);
    console.log('🍎 Platform: Mac OS');
  }
  
  calculateCorrectGroups(cycle) {
    const baseGroups = 5;
    const cyclesSinceStart = Math.max(0, cycle - 5);
    const additionalGroups = Math.floor(cyclesSinceStart / 5);
    return baseGroups + additionalGroups;
  }
  
  async analyzeProject() {
    console.log('\n🔍 ANALYZING PROJECT FOR INCONSISTENCIES...');
    
    try {
      // Get all files in project
      const allFiles = await this.getAllFiles(this.projectRoot);
      
      // Analyze each file
      for (const file of allFiles) {
        await this.analyzeFile(file);
      }
      
      // Generate consolidation report
      this.generateConsolidationReport();
      
      return this.analysisResults;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }
  
  async getAllFiles(dir, extensions = ['.js', '.md', '.txt', '.json']) {
    const files = [];
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory() && !this.shouldSkipDirectory(item.name)) {
          const subFiles = await this.getAllFiles(fullPath, extensions);
          files.push(...subFiles);
        } else if (item.isFile() && this.hasValidExtension(item.name, extensions)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
    
    return files;
  }
  
  shouldSkipDirectory(name) {
    const skipDirs = ['node_modules', '.git', '.DS_Store', 'dist', 'build'];
    return skipDirs.includes(name);
  }
  
  hasValidExtension(filename, extensions) {
    return extensions.some(ext => filename.endsWith(ext));
  }
  
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      // Check for Motion Class inconsistencies
      if (content.includes('Motion Class') || content.includes('motionClass')) {
        const memberCounts = this.extractMemberCounts(content);
        if (memberCounts.length > 0) {
          this.analysisResults.filesFound.push({
            file: filename,
            path: filePath,
            memberCounts: memberCounts,
            correctCount: this.correctState.motionClassSystem.totalMembers
          });
        }
      }
      
      // Check for cycle references
      const cycleRefs = this.extractCycleReferences(content);
      if (cycleRefs.length > 0) {
        this.analysisResults.filesFound.push({
          file: filename,
          path: filePath,
          cycleReferences: cycleRefs,
          latestCycle: this.correctState.currentCycle
        });
      }
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }
  
  extractMemberCounts(content) {
    const patterns = [
      /(\d+)\s*(?:brilliant\s*)?minds?/gi,
      /members?:\s*(\d+)/gi,
      /Motion\s*Class.*?(\d+)/gi,
      /totalMembers?:\s*(\d+)/gi
    ];
    
    const counts = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const count = parseInt(match[1]);
        if (count > 0 && count < 10000) {
          counts.push(count);
        }
      }
    }
    
    return [...new Set(counts)];
  }
  
  extractCycleReferences(content) {
    const patterns = [
      /cycle\s*(\d+)/gi,
      /cycles?\s*(\d+)-(\d+)/gi,
      /currentCycle:\s*(\d+)/gi
    ];
    
    const cycles = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[2]) {
          // Range
          cycles.push(parseInt(match[2])); // Use higher number
        } else {
          cycles.push(parseInt(match[1]));
        }
      }
    }
    
    return [...new Set(cycles)].filter(c => c > 0 && c < 1000);
  }
  
  generateConsolidationReport() {
    console.log('\n📋 CONSOLIDATION REPORT');
    console.log('=======================');
    
    // Find inconsistencies
    const memberCountFiles = this.analysisResults.filesFound.filter(f => f.memberCounts);
    const wrongCounts = memberCountFiles.filter(f => 
      !f.memberCounts.includes(this.correctState.motionClassSystem.totalMembers)
    );
    
    if (wrongCounts.length > 0) {
      console.log('\n❌ MOTION CLASS INCONSISTENCIES FOUND:');
      wrongCounts.forEach(f => {
        console.log(`  File: ${f.file}`);
        console.log(`  Found: ${f.memberCounts.join(', ')} members`);
        console.log(`  Should be: ${f.correctCount} members`);
        console.log('');
      });
    }
    
    // Find outdated cycle references
    const cycleFiles = this.analysisResults.filesFound.filter(f => f.cycleReferences);
    const outdatedCycles = cycleFiles.filter(f => 
      Math.max(...f.cycleReferences) < this.correctState.currentCycle - 10
    );
    
    if (outdatedCycles.length > 0) {
      console.log('\n⚠️  OUTDATED CYCLE REFERENCES:');
      outdatedCycles.forEach(f => {
        console.log(`  File: ${f.file}`);
        console.log(`  References: Cycles ${Math.max(...f.cycleReferences)}`);
        console.log(`  Current: Cycle ${f.latestCycle}`);
        console.log('');
      });
    }
    
    console.log('\n✅ CORRECT STATE SUMMARY:');
    console.log(`  Current Cycle: ${this.correctState.currentCycle}`);
    console.log(`  Motion Class Groups: ${this.correctState.motionClassSystem.totalGroups}`);
    console.log(`  Motion Class Members: ${this.correctState.motionClassSystem.totalMembers}`);
    console.log(`  Platform: ${this.correctState.platform}`);
    console.log(`  Deployment: ${this.correctState.deploymentTarget}`);
  }
  
  async fixInconsistencies() {
    console.log('\n🔧 FIXING INCONSISTENCIES...');
    
    // Create master configuration file
    const masterConfig = {
      version: '124.0.0',
      currentCycle: this.correctState.currentCycle,
      motionClass: this.correctState.motionClassSystem,
      deployment: {
        domain: 'runtcoin.fun',
        server: '3.90.51.246',
        platform: 'Ubuntu Lightsail',
        nodeVersion: '18+'
      },
      status: 'READY_FOR_DEPLOYMENT',
      lastUpdated: new Date().toISOString()
    };
    
    // Save master configuration
    const configPath = path.join(this.projectRoot, 'engine-config-master.json');
    await fs.writeFile(configPath, JSON.stringify(masterConfig, null, 2));
    console.log(`✅ Created master configuration: ${configPath}`);
    
    return masterConfig;
  }
}

// Execute consolidation
async function consolidateProject() {
  const consolidator = new ProjectConsolidationFixer();
  
  // Analyze project
  await consolidator.analyzeProject();
  
  // Fix inconsistencies
  const masterConfig = await consolidator.fixInconsistencies();
  
  console.log('\n🎉 CONSOLIDATION COMPLETE!');
  console.log('Next steps:');
  console.log('1. Review the master configuration file');
  console.log('2. Update any files with incorrect member counts');
  console.log('3. Run the autonomous engine with correct configuration');
  
  return masterConfig;
}

// Run if called directly
if (require.main === module) {
  consolidateProject().catch(console.error);
}

module.exports = { ProjectConsolidationFixer, consolidateProject };