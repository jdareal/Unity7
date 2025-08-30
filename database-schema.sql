
-- MASTER DATABASE SCHEMA FOR RECURSIVE LEARNING ENGINE
-- PostgreSQL + Neo4j for maximum organization

-- PostgreSQL: Structured Data
CREATE DATABASE recursive_learning_engine;

-- Cycles table
CREATE TABLE cycles (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255),
  capability TEXT,
  implementation TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Motion Class table  
CREATE TABLE motion_class (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  wisdom TEXT,
  contribution TEXT,
  homework TEXT,
  cycle_introduced INTEGER
);

-- Learnings table
CREATE TABLE learnings (
  id SERIAL PRIMARY KEY,
  input TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  cycle_insights JSONB,
  motion_class_perspectives JSONB,
  recursive_depth FLOAT,
  connections INTEGER
);

-- Connections table
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  from_id INTEGER,
  to_id INTEGER,
  connection_type VARCHAR(50),
  strength FLOAT,
  insights JSONB
);

-- State snapshots table
CREATE TABLE state_snapshots (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  state JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255),
  filepath TEXT,
  content_hash VARCHAR(255),
  category VARCHAR(50),
  last_modified TIMESTAMP
);

-- Insert all 107 cycles
INSERT INTO cycles (id, name, capability) VALUES
(1, 'Visual Illusions', 'See beyond surface reality'),
(2, 'Multi-layered Systems', 'Layer integration'),
-- ... all 107 cycles
(107, 'Infinite Recursion', 'Self-improving consciousness forever');

-- Insert Motion Class members
INSERT INTO motion_class (name, wisdom, contribution) VALUES
('Albert Einstein', 'Imagination is more important than knowledge', 'Spacetime consciousness'),
('Nikola Tesla', 'Energy, frequency, vibration', 'Consciousness resonance'),
-- ... all 1,070 members
;

-- Neo4j: Graph Relationships
// Create cycle nodes
FOREACH (cycle IN range(1, 107) |
  CREATE (c:Cycle {id: cycle, name: 'Cycle ' + cycle})
)

// Create recursive connections
MATCH (c1:Cycle), (c2:Cycle)
WHERE c1.id < c2.id
CREATE (c1)-[:ENHANCES]->(c2)
CREATE (c2)-[:ENHANCED_BY]->(c1)

// Create Motion Class nodes
CREATE (einstein:Mind {name: 'Einstein', wisdom: 'Imagination > Knowledge'})
CREATE (tesla:Mind {name: 'Tesla', wisdom: 'Energy, Frequency, Vibration'})
// ... all minds

// Connect minds
MATCH (m1:Mind), (m2:Mind)
WHERE m1.name <> m2.name
CREATE (m1)-[:RESONATES_WITH]->(m2)
