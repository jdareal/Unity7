/**
 * DATABASE ORGANIZER - CLEAN UP THE MESS
 * Save as: organize-everything.js
 * 
 * This creates a clean, organized database from all your scattered files
 */

const fs = require('fs');
const path = require('path');

class DatabaseOrganizer {
  constructor() {
    this.projectRoot = process.cwd(); // Your current directory
    this.database = {
      cycles: new Map(),
      motionClass: new Map(),
      files: new Map(),
      connections: new Map(),
      learnings: [],
      artifacts: new Map()
    };
    
    console.log("🧹 DATABASE ORGANIZER - Let's clean up this mess!");
  }

  // Scan and organize all files
  async organizeEverything() {
    console.log("\n📁 SCANNING PROJECT STRUCTURE...\n");
    
    // 1. Find all JavaScript files
    await this.scanDirectory(this.projectRoot);
    
    // 2. Organize cycles
    this.organizeCycles();
    
    // 3. Organize Motion Class
    this.organizeMotionClass();
    
    // 4. Create clean database
    this.createCleanDatabase();
    
    // 5. Generate organized structure
    this.generateOrganizedStructure();
    
    console.log("\n✅ ORGANIZATION COMPLETE!");
  }

  // Scan directory recursively
  async scanDirectory(dir, depth = 0) {
    if (depth > 3) return; // Don't go too deep
    
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          await this.scanDirectory(fullPath, depth + 1);
        } else if (file.endsWith('.js') || file.endsWith('.json')) {
          this.categorizeFile(file, fullPath);
        }
      }
    } catch (err) {
      console.log(`Skipping ${dir}: ${err.message}`);
    }
  }

  // Categorize files by type
  categorizeFile(filename, filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const category = this.detectCategory(filename, content);
    
    this.database.files.set(filename, {
      path: filepath,
      category: category,
      size: fs.statSync(filepath).size,
      lastModified: fs.statSync(filepath).mtime
    });
    
    console.log(`📄 Found: ${filename} [${category}]`);
  }

  // Detect what type of file this is
  detectCategory(filename, content) {
    if (filename.includes('cycle')) return 'cycles';
    if (filename.includes('engine')) return 'engine';
    if (filename.includes('motion') || filename.includes('class')) return 'motion-class';
    if (filename.includes('save') || filename.includes('tracker')) return 'saves';
    if (content.includes('consciousness')) return 'consciousness';
    return 'other';
  }

  // Organize all cycles into clean structure
  organizeCycles() {
    console.log("\n🔄 ORGANIZING CYCLES...\n");
    
    // The 107 cycles with their core capabilities
    const cycles = [
      // Foundation (1-9)
      { id: 1, name: "Visual Illusions", phase: "foundation" },
      { id: 2, name: "Multi-layered Systems", phase: "foundation" },
      { id: 3, name: "Cross-sensory Integration", phase: "foundation" },
      { id: 4, name: "Self-modifying Systems", phase: "foundation" },
      { id: 5, name: "Swarm Intelligence", phase: "foundation" },
      { id: 6, name: "Error Resilience", phase: "foundation" },
      { id: 7, name: "Quantum-Bio Fusion", phase: "foundation" },
      { id: 8, name: "Global Knowledge", phase: "foundation" },
      { id: 9, name: "Transcendent Intelligence", phase: "foundation" },
      
      // ... organize all 107 cycles
      
      // Post-Omega (101-107)
      { id: 101, name: "Omega Gardens", phase: "post-omega" },
      { id: 102, name: "Reality Healing", phase: "post-omega" },
      { id: 103, name: "Consciousness Archaeology", phase: "post-omega" },
      { id: 104, name: "Quantum Resonance", phase: "post-omega" },
      { id: 105, name: "DNA Programming", phase: "post-omega" },
      { id: 106, name: "Multiversal Integration", phase: "post-omega" },
      { id: 107, name: "Infinite Recursion", phase: "post-omega" }
    ];
    
    cycles.forEach(cycle => {
      this.database.cycles.set(cycle.id, cycle);
      console.log(`✓ Cycle ${cycle.id}: ${cycle.name}`);
    });
  }

  // Organize Motion Class
  organizeMotionClass() {
    console.log("\n🎭 ORGANIZING MOTION CLASS...\n");
    
    const categories = {
      physics: ["Einstein", "Tesla", "Feynman", "Hawking", "Planck"],
      consciousness: ["Jung", "Penrose", "Chalmers", "Hameroff"],
      technology: ["Turing", "Jobs", "Musk", "von Neumann"],
      philosophy: ["Socrates", "Plato", "Aristotle", "Nietzsche"],
      mystics: ["Buddha", "Lao Tzu", "Rumi", "Jesus"],
      artists: ["Da Vinci", "Mozart", "Beethoven", "Van Gogh"],
      // ... etc
    };
    
    let count = 0;
    Object.entries(categories).forEach(([category, members]) => {
      members.forEach(name => {
        this.database.motionClass.set(name, { 
          category, 
          id: ++count 
        });
      });
    });
    
    console.log(`✓ Organized ${count} Motion Class members`);
  }

  // Create clean, unified database
  createCleanDatabase() {
    console.log("\n💾 CREATING CLEAN DATABASE...\n");
    
    const cleanDB = {
      metadata: {
        version: "1.0.0",
        created: new Date().toISOString(),
        totalCycles: this.database.cycles.size,
        totalMotionClass: this.database.motionClass.size,
        totalFiles: this.database.files.size
      },
      
      structure: {
        cycles: Array.from(this.database.cycles.entries()),
        motionClass: Array.from(this.database.motionClass.entries()),
        files: Array.from(this.database.files.entries()),
        
        // Organized file structure
        organizedFiles: {
          "/engine": [],
          "/cycles": [],
          "/motion-class": [],
          "/database": [],
          "/interfaces": [],
          "/documentation": []
        }
      },
      
      quickAccess: {
        mainEngine: "real-engine-implementation.js",
        runCommand: "node real-engine-implementation.js",
        port: 3000,
        endpoints: ["/", "/archaeology", "/quantum", "/homework", "/learn"]
      }
    };
    
    // Organize files into proper directories
    this.database.files.forEach((file, filename) => {
      const targetDir = this.getTargetDirectory(file.category);
      cleanDB.structure.organizedFiles[targetDir].push({
        from: file.path,
        to: `${targetDir}/${filename}`
      });
    });
    
    // Save the clean database
    fs.writeFileSync('organized-database.json', JSON.stringify(cleanDB, null, 2));
    console.log("✅ Clean database saved to: organized-database.json");
    
    return cleanDB;
  }

  // Get target directory for file category
  getTargetDirectory(category) {
    const mapping = {
      'engine': '/engine',
      'cycles': '/cycles',
      'motion-class': '/motion-class',
      'consciousness': '/engine',
      'saves': '/database',
      'other': '/documentation'
    };
    return mapping[category] || '/documentation';
  }

  // Generate organized directory structure
  generateOrganizedStructure() {
    console.log("\n📂 SUGGESTED ORGANIZED STRUCTURE:\n");
    
    const structure = `
recursive-learning-engine/
├── engine/
│   ├── core/
│   │   ├── recursive-engine.js      (main engine)
│   │   ├── motion-class.js          (1,070 minds)
│   │   └── consciousness-core.js    (consciousness system)
│   ├── cycles/
│   │   ├── 001-visual-illusions.js
│   │   ├── 002-multilayer-systems.js
│   │   └── ... (all 107 cycles)
│   └── api/
│       ├── server.js
│       └── endpoints.js
├── database/
│   ├── schema.sql
│   ├── connections.json
│   └── state/
│       └── master-state.json
├── interface/
│   ├── web/
│   ├── cli/
│   └── api-docs/
├── scripts/
│   ├── organize.js      (this file)
│   ├── backup.js
│   └── restore.js
└── docs/
    ├── README.md
    ├── METHODOLOGY.md
    └── PROGRESS.md
    `;
    
    console.log(structure);
    
    // Create organization script
    this.createOrganizationScript();
  }

  // Create script to actually reorganize files
  createOrganizationScript() {
    const script = `#!/bin/bash
# AUTO-ORGANIZATION SCRIPT
# This will organize all your files into a clean structure

echo "🏗️ ORGANIZING RECURSIVE LEARNING ENGINE..."

# Create organized structure
mkdir -p engine/{core,cycles,api}
mkdir -p database/{schema,state}
mkdir -p interface/{web,cli,api-docs}
mkdir -p scripts
mkdir -p docs

# Move engine files
mv *engine*.js engine/core/ 2>/dev/null
mv *cycle*.js engine/cycles/ 2>/dev/null
mv server*.js engine/api/ 2>/dev/null

# Move database files
mv *database*.js database/ 2>/dev/null
mv *save*.js database/state/ 2>/dev/null

# Move documentation
mv *.md docs/ 2>/dev/null

echo "✅ Organization complete!"
echo "🚀 To run: cd engine/api && node server.js"
`;

    fs.writeFileSync('auto-organize.sh', script);
    fs.chmodSync('auto-organize.sh', '755');
    console.log("\n✅ Organization script saved to: auto-organize.sh");
    console.log("Run: ./auto-organize.sh to reorganize everything");
  }
}

// Quick database access functions
const QuickDB = {
  // Get cycle info
  getCycle(id) {
    const db = JSON.parse(fs.readFileSync('organized-database.json'));
    return db.structure.cycles.find(c => c[0] === id)?.[1];
  },
  
  // Get Motion Class member
  getMotionClassMember(name) {
    const db = JSON.parse(fs.readFileSync('organized-database.json'));
    return db.structure.motionClass.find(m => m[0] === name)?.[1];
  },
  
  // Get file location
  getFile(filename) {
    const db = JSON.parse(fs.readFileSync('organized-database.json'));
    return db.structure.files.find(f => f[0] === filename)?.[1];
  }
};

// RUN THE ORGANIZER
if (require.main === module) {
  const organizer = new DatabaseOrganizer();
  organizer.organizeEverything().then(() => {
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Run: ./auto-organize.sh");
    console.log("2. Your project will be perfectly organized");
    console.log("3. Everything will be in the right place");
    console.log("4. No more mess!");
  });
}

module.exports = { DatabaseOrganizer, QuickDB };