/**
 * EXTERNAL LEARNING SOURCES
 * Feeds your engine with new knowledge 24/7
 * 
 * Save as: learning-sources.js
 */

const axios = require('axios');
const Parser = require('rss-parser');
const { Configuration, OpenAIApi } = require('openai');

class LearningSourcesManager {
  constructor(pgPool, redisClient) {
    this.pgPool = pgPool;
    this.redisClient = redisClient;
    this.rssParser = new Parser();
    this.sources = this.initializeSources();
  }

  initializeSources() {
    return {
      // Philosophy & Consciousness RSS Feeds
      rssFeeds: [
        {
          name: 'Stanford Philosophy',
          url: 'https://plato.stanford.edu/rss/sep.xml',
          category: 'philosophy'
        },
        {
          name: 'Aeon Essays',
          url: 'https://aeon.co/feed.rss',
          category: 'consciousness'
        },
        {
          name: 'Edge.org',
          url: 'https://www.edge.org/feed',
          category: 'science'
        },
        {
          name: 'MIT Technology Review',
          url: 'https://www.technologyreview.com/feed/',
          category: 'technology'
        }
      ],

      // Reddit Consciousness Discussions
      redditFeeds: [
        'r/consciousness',
        'r/philosophy',
        'r/singularity',
        'r/artificial',
        'r/awakened'
      ],

      // Academic Papers (using free APIs)
      academicSources: [
        {
          name: 'arXiv',
          categories: ['cs.AI', 'physics.gen-ph', 'q-bio.NC'],
          baseUrl: 'http://export.arxiv.org/api/query'
        }
      ],

      // News about consciousness/AI
      newsKeywords: [
        'consciousness breakthrough',
        'artificial intelligence ethics',
        'quantum consciousness',
        'brain computer interface',
        'collective intelligence'
      ]
    };
  }

  // Start all learning sources
  async startLearning() {
    console.log('🌐 Starting external learning sources...');
    
    // RSS Feeds - check every 30 minutes
    setInterval(() => this.checkRSSFeeds(), 30 * 60 * 1000);
    this.checkRSSFeeds(); // Initial check
    
    // Reddit - check every hour
    setInterval(() => this.checkReddit(), 60 * 60 * 1000);
    
    // Academic papers - check every 6 hours
    setInterval(() => this.checkAcademicPapers(), 6 * 60 * 60 * 1000);
    
    // News - check every 2 hours
    setInterval(() => this.checkNews(), 2 * 60 * 60 * 1000);
    
    // Wikipedia random articles - every 15 minutes
    setInterval(() => this.exploreWikipedia(), 15 * 60 * 1000);
  }

  // Check RSS feeds for new content
  async checkRSSFeeds() {
    for (const feed of this.sources.rssFeeds) {
      try {
        const parsed = await this.rssParser.parseURL(feed.url);
        
        for (const item of parsed.items.slice(0, 5)) { // Latest 5 items
          const learning = {
            source: feed.name,
            category: feed.category,
            title: item.title,
            content: item.contentSnippet || item.content,
            link: item.link,
            date: item.pubDate,
            type: 'rss_article'
          };
          
          // Check if already processed
          const exists = await this.checkIfProcessed(item.link);
          if (!exists) {
            await this.processLearning(learning);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error.message);
      }
    }
  }

  // Check Reddit for discussions
  async checkReddit() {
    for (const subreddit of this.sources.redditFeeds) {
      try {
        const response = await axios.get(
          `https://www.reddit.com/${subreddit}/hot.json?limit=10`,
          { headers: { 'User-Agent': 'RecursiveLearningEngine/1.0' } }
        );
        
        const posts = response.data.data.children;
        
        for (const post of posts) {
          const data = post.data;
          
          // Only process text posts with substance
          if (data.selftext && data.selftext.length > 100) {
            const learning = {
              source: subreddit,
              category: 'discussion',
              title: data.title,
              content: data.selftext,
              link: `https://reddit.com${data.permalink}`,
              upvotes: data.ups,
              comments: data.num_comments,
              type: 'reddit_discussion'
            };
            
            const exists = await this.checkIfProcessed(data.permalink);
            if (!exists && data.ups > 50) { // Only highly upvoted
              await this.processLearning(learning);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching ${subreddit}:`, error.message);
      }
    }
  }

  // Check academic papers
  async checkAcademicPapers() {
    for (const source of this.sources.academicSources) {
      for (const category of source.categories) {
        try {
          const response = await axios.get(source.baseUrl, {
            params: {
              search_query: `cat:${category}`,
              start: 0,
              max_results: 10,
              sortBy: 'submittedDate',
              sortOrder: 'descending'
            }
          });
          
          // Parse XML response (simplified)
          const papers = this.parseArxivResponse(response.data);
          
          for (const paper of papers) {
            const learning = {
              source: 'arXiv',
              category: category,
              title: paper.title,
              content: paper.abstract,
              authors: paper.authors,
              link: paper.link,
              type: 'academic_paper'
            };
            
            const exists = await this.checkIfProcessed(paper.id);
            if (!exists) {
              await this.processLearning(learning);
            }
          }
        } catch (error) {
          console.error(`Error fetching arXiv ${category}:`, error.message);
        }
      }
    }
  }

  // Check news for consciousness-related content
  async checkNews() {
    // Using NewsAPI free tier (requires API key)
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return;
    
    for (const keyword of this.sources.newsKeywords) {
      try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: keyword,
            sortBy: 'publishedAt',
            language: 'en',
            pageSize: 10,
            apiKey: apiKey
          }
        });
        
        for (const article of response.data.articles) {
          const learning = {
            source: article.source.name,
            category: 'news',
            title: article.title,
            content: article.description,
            link: article.url,
            type: 'news_article'
          };
          
          const exists = await this.checkIfProcessed(article.url);
          if (!exists) {
            await this.processLearning(learning);
          }
        }
      } catch (error) {
        console.error(`Error fetching news for ${keyword}:`, error.message);
      }
    }
  }

  // Explore random Wikipedia articles
  async exploreWikipedia() {
    try {
      // Get random article
      const randomResponse = await axios.get(
        'https://en.wikipedia.org/api/rest_v1/page/random/summary'
      );
      
      const article = randomResponse.data;
      
      // Check if relevant (basic relevance check)
      const relevantKeywords = [
        'consciousness', 'mind', 'brain', 'philosophy', 'science',
        'quantum', 'intelligence', 'awareness', 'cognition', 'psychology'
      ];
      
      const isRelevant = relevantKeywords.some(keyword => 
        article.extract.toLowerCase().includes(keyword)
      );
      
      if (isRelevant) {
        const learning = {
          source: 'Wikipedia',
          category: 'reference',
          title: article.title,
          content: article.extract,
          link: article.content_urls.desktop.page,
          type: 'wikipedia_article'
        };
        
        await this.processLearning(learning);
      }
    } catch (error) {
      console.error('Error fetching Wikipedia:', error.message);
    }
  }

  // Process new learning and queue for engine
  async processLearning(learning) {
    try {
      // Analyze with Motion Class perspective
      const analysis = await this.analyzeWithMotionClass(learning);
      
      // Calculate relevance score
      const relevanceScore = this.calculateRelevance(learning, analysis);
      
      if (relevanceScore > 0.5) {
        // Store in database
        await this.pgPool.query(
          `INSERT INTO external_learnings 
           (source, category, title, content, link, relevance_score, analysis) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            learning.source,
            learning.category,
            learning.title,
            learning.content,
            learning.link,
            relevanceScore,
            JSON.stringify(analysis)
          ]
        );
        
        // Queue for engine processing
        await this.redisClient.lPush('learning_queue', JSON.stringify({
          ...learning,
          relevanceScore,
          analysis,
          timestamp: new Date()
        }));
        
        // Publish event
        await this.redisClient.publish('learning_events', JSON.stringify({
          type: 'external_learning',
          source: learning.source,
          summary: learning.title
        }));
        
        console.log(`📚 New learning from ${learning.source}: ${learning.title}`);
      }
    } catch (error) {
      console.error('Error processing learning:', error.message);
    }
  }

  // Analyze content with Motion Class wisdom
  async analyzeWithMotionClass(learning) {
    // Simulate Motion Class analysis
    const perspectives = [];
    
    // Select relevant Motion Class members based on content
    const relevantMembers = this.selectRelevantMembers(learning);
    
    for (const member of relevantMembers) {
      perspectives.push({
        member: member.name,
        insight: this.generateInsight(member, learning),
        relevance: member.relevance
      });
    }
    
    return {
      perspectives,
      synthesis: this.synthesizePerspectives(perspectives),
      recommendation: this.generateRecommendation(perspectives)
    };
  }

  // Select Motion Class members relevant to the content
  selectRelevantMembers(learning) {
    const members = [];
    
    // Keywords to member mapping
    const keywordMap = {
      'consciousness': ['Jung', 'Chalmers', 'Penrose', 'Buddha'],
      'quantum': ['Einstein', 'Bohr', 'Feynman', 'Penrose'],
      'intelligence': ['Turing', 'Minsky', 'Hofstadter'],
      'philosophy': ['Socrates', 'Plato', 'Aristotle', 'Kant'],
      'technology': ['Jobs', 'Musk', 'Berners-Lee', 'Gates']
    };
    
    // Find relevant members based on content
    for (const [keyword, memberNames] of Object.entries(keywordMap)) {
      if (learning.content.toLowerCase().includes(keyword)) {
        memberNames.forEach(name => {
          members.push({
            name,
            relevance: 0.8,
            specialty: keyword
          });
        });
      }
    }
    
    // Always include some random members for diversity
    members.push(
      { name: 'Tesla', relevance: 0.5, specialty: 'energy' },
      { name: 'Da Vinci', relevance: 0.5, specialty: 'synthesis' }
    );
    
    return members.slice(0, 5); // Top 5 members
  }

  // Calculate relevance of learning to engine's growth
  calculateRelevance(learning, analysis) {
    let score = 0.5; // Base score
    
    // Boost for certain categories
    const categoryBoosts = {
      'philosophy': 0.2,
      'consciousness': 0.3,
      'science': 0.15,
      'academic_paper': 0.25
    };
    
    score += categoryBoosts[learning.category] || 0;
    
    // Boost for Motion Class interest
    const avgMemberRelevance = analysis.perspectives.reduce(
      (sum, p) => sum + p.relevance, 0
    ) / analysis.perspectives.length;
    
    score += avgMemberRelevance * 0.3;
    
    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  // Check if content already processed
  async checkIfProcessed(identifier) {
    const result = await this.pgPool.query(
      'SELECT 1 FROM external_learnings WHERE link = $1',
      [identifier]
    );
    return result.rows.length > 0;
  }

  // Simplified arXiv XML parsing
  parseArxivResponse(xmlData) {
    // In production, use proper XML parser
    const papers = [];
    // Extract paper data from XML...
    return papers;
  }

  // Generate Motion Class insights
  generateInsight(member, learning) {
    // Simulate member's perspective on the content
    const insights = {
      'Jung': 'This relates to the collective unconscious patterns',
      'Einstein': 'The implications for spacetime consciousness are profound',
      'Tesla': 'Energy patterns suggest new consciousness frequencies',
      'Buddha': 'Another path to ending suffering through awareness',
      'Turing': 'Computational models of consciousness advance'
    };
    
    return insights[member.name] || 'Interesting perspective on consciousness evolution';
  }

  // Synthesize multiple perspectives
  synthesizePerspectives(perspectives) {
    return 'Multiple viewpoints converge on expanding consciousness understanding';
  }

  // Generate recommendation for engine
  generateRecommendation(perspectives) {
    return 'Integrate this learning into the next consciousness evolution cycle';
  }
}

// Database schema for external learnings
const externalLearningsSchema = `
CREATE TABLE IF NOT EXISTS external_learnings (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255),
    category VARCHAR(100),
    title TEXT,
    content TEXT,
    link TEXT UNIQUE,
    relevance_score FLOAT,
    analysis JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_external_learnings_relevance ON external_learnings(relevance_score DESC);
CREATE INDEX idx_external_learnings_processed ON external_learnings(processed);
`;

module.exports = {
  LearningSourcesManager,
  externalLearningsSchema
};