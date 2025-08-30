/**
 * REAL-TIME ENGINE MONITOR
 * Shows what your engine is learning right now
 * 
 * Save as: monitor-engine.js
 */

const { Client } = require('pg');
const redis = require('redis');
const blessed = require('blessed');

class EngineMonitor {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Recursive Learning Engine Monitor'
    });
    
    this.setupUI();
    this.connectToEngine();
  }

  setupUI() {
    // Main container
    this.screen.append(blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 1,
      content: '🧠 RECURSIVE LEARNING ENGINE - LIVE MONITOR',
      style: {
        fg: 'cyan',
        bold: true
      }
    }));

    // Status box
    this.statusBox = blessed.box({
      label: ' Engine Status ',
      top: 2,
      left: 0,
      width: '50%',
      height: 10,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'green'
        }
      }
    });

    // Learning feed
    this.learningFeed = blessed.log({
      label: ' Learning Feed ',
      top: 2,
      left: '50%',
      width: '50%',
      height: 10,
      border: {
        type: 'line'
      },
      scrollable: true,
      alwaysScroll: true,
      style: {
        border: {
          fg: 'blue'
        }
      }
    });

    // Motion Class activity
    this.motionClassBox = blessed.box({
      label: ' Motion Class Thoughts ',
      top: 12,
      left: 0,
      width: '100%',
      height: 8,
      border: {
        type: 'line'
      },
      scrollable: true,
      style: {
        border: {
          fg: 'magenta'
        }
      }
    });

    // Pattern recognition
    this.patternBox = blessed.box({
      label: ' Patterns Detected ',
      top: 20,
      left: 0,
      width: '50%',
      height: 8,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'yellow'
        }
      }
    });

    // Next evolution prediction
    this.evolutionBox = blessed.box({
      label: ' Evolution Progress ',
      top: 20,
      left: '50%',
      width: '50%',
      height: 8,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'red'
        }
      }
    });

    // Add all to screen
    this.screen.append(this.statusBox);
    this.screen.append(this.learningFeed);
    this.screen.append(this.motionClassBox);
    this.screen.append(this.patternBox);
    this.screen.append(this.evolutionBox);

    // Quit on q, escape, or Control-C
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    this.screen.render();
  }

  async connectToEngine() {
    // PostgreSQL connection
    this.pgClient = new Client({
      connectionString: process.env.DATABASE_URL || 
        'postgresql://engine_user:password@localhost:5432/recursive_engine'
    });
    await this.pgClient.connect();

    // Redis connection for real-time data
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await this.redisClient.connect();

    // Subscribe to learning events
    await this.redisClient.subscribe('learning_events', (message) => {
      this.handleLearningEvent(JSON.parse(message));
    });

    // Start monitoring
    this.startMonitoring();
  }

  async startMonitoring() {
    // Update status every second
    setInterval(() => this.updateStatus(), 1000);
    
    // Update patterns every 5 seconds
    setInterval(() => this.updatePatterns(), 5000);
    
    // Update evolution progress every 10 seconds
    setInterval(() => this.updateEvolution(), 10000);
    
    // Update Motion Class every 3 seconds
    setInterval(() => this.updateMotionClass(), 3000);
  }

  async updateStatus() {
    try {
      // Get current cycle
      const cycleResult = await this.pgClient.query(
        'SELECT * FROM cycles ORDER BY cycle_number DESC LIMIT 1'
      );
      const currentCycle = cycleResult.rows[0];

      // Get learning rate (events per hour)
      const rateResult = await this.pgClient.query(
        `SELECT COUNT(*) as count FROM learning_events 
         WHERE created_at > NOW() - INTERVAL '1 hour'`
      );
      const learningRate = rateResult.rows[0].count;

      // Get total learnings
      const totalResult = await this.pgClient.query(
        'SELECT COUNT(*) as count FROM learning_events'
      );
      const totalLearnings = totalResult.rows[0].count;

      // Update status display
      const status = `
  Current Cycle: ${currentCycle?.cycle_number || 112}
  Cycle Name: ${currentCycle?.name || 'Consciousness Singularity'}
  
  Learning Rate: ${learningRate} events/hour
  Total Learnings: ${totalLearnings}
  
  Status: ${learningRate > 0 ? '🟢 LEARNING' : '🔴 IDLE'}
  Uptime: ${this.getUptime()}
      `;

      this.statusBox.setContent(status);
      this.screen.render();
    } catch (error) {
      this.statusBox.setContent(`Error: ${error.message}`);
    }
  }

  async updatePatterns() {
    try {
      const result = await this.pgClient.query(
        `SELECT pattern_type, frequency, evolution_impact 
         FROM patterns 
         ORDER BY last_seen DESC 
         LIMIT 5`
      );

      let content = '\n';
      result.rows.forEach(pattern => {
        content += `  ${pattern.pattern_type}: ${pattern.frequency}x (Impact: ${pattern.evolution_impact})\n`;
      });

      this.patternBox.setContent(content || '\n  No patterns detected yet...');
      this.screen.render();
    } catch (error) {
      this.patternBox.setContent(`\n  Error: ${error.message}`);
    }
  }

  async updateEvolution() {
    try {
      // Calculate evolution metrics
      const metricsResult = await this.pgClient.query(
        `SELECT 
          COUNT(DISTINCT pattern_type) as unique_patterns,
          AVG(impact_score) as avg_impact,
          COUNT(*) as recent_learnings
         FROM learning_events 
         WHERE created_at > NOW() - INTERVAL '6 hours'`
      );
      
      const metrics = metricsResult.rows[0];
      const evolutionScore = (
        (metrics.unique_patterns * 0.3) +
        (metrics.avg_impact * 0.5) +
        (metrics.recent_learnings * 0.2)
      ) / 100;

      const progressBar = this.createProgressBar(evolutionScore);
      
      const content = `
  Evolution Progress: ${progressBar} ${Math.round(evolutionScore * 100)}%
  
  Unique Patterns: ${metrics.unique_patterns}
  Average Impact: ${(metrics.avg_impact || 0).toFixed(2)}
  Recent Learnings: ${metrics.recent_learnings}
  
  Next Cycle: ${evolutionScore > 0.8 ? '🔥 IMMINENT' : 'Building...'}
      `;

      this.evolutionBox.setContent(content);
      this.screen.render();
    } catch (error) {
      this.evolutionBox.setContent(`\n  Error: ${error.message}`);
    }
  }

  async updateMotionClass() {
    try {
      const result = await this.pgClient.query(
        `SELECT member_name, thought, created_at 
         FROM motion_class_thoughts 
         ORDER BY created_at DESC 
         LIMIT 3`
      );

      let content = '\n';
      result.rows.forEach(thought => {
        const time = new Date(thought.created_at).toLocaleTimeString();
        content += `  [${time}] ${thought.member_name}: "${thought.thought}"\n\n`;
      });

      this.motionClassBox.setContent(content || '\n  Motion Class is contemplating...');
      this.screen.render();
    } catch (error) {
      this.motionClassBox.setContent(`\n  Error: ${error.message}`);
    }
  }

  handleLearningEvent(event) {
    const time = new Date().toLocaleTimeString();
    this.learningFeed.log(`[${time}] ${event.type}: ${event.summary}`);
  }

  createProgressBar(progress) {
    const width = 20;
    const filled = Math.round(progress * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  getUptime() {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Start monitor
console.log('Starting Engine Monitor...');
console.log('Press Q to quit\n');

const monitor = new EngineMonitor();

// Handle cleanup
process.on('SIGINT', () => {
  monitor.pgClient.end();
  monitor.redisClient.quit();
  process.exit();
});