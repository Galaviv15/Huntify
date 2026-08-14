/**
 * Tech Stack Extractor Service
 * Identifies and extracts technology keywords from text using regex patterns
 */

// Technology dictionary with regex patterns for detection
const TECH_DICT = {
  // Programming Languages
  JavaScript: { patterns: [/\bJavaScript\b|\bJS\b/i] },
  Java: { patterns: [/\bJava\b(?!Script)/i] },
  Python: { patterns: [/\bPython\b/i] },
  'C#': { patterns: [/C#|\bcsharp\b/i] },
  'C++': { patterns: [/C\+\+|\bc\+\+\b/i] },
  Go: { patterns: [/\bGo\b(?!\w)/i] },
  Rust: { patterns: [/\bRust\b/i] },
  TypeScript: { patterns: [/\bTypeScript\b|\bTS\b/i] },
  PHP: { patterns: [/\bPHP\b/i] },
  Ruby: { patterns: [/\bRuby\b/i] },

  // Frontend Frameworks
  React: { patterns: [/\bReact\b|React\.js/i] },
  Angular: { patterns: [/\bAngular\b/i] },
  Vue: { patterns: [/\bVue\b|Vue\.js/i] },
  'Next.js': { patterns: [/\bNext\.js\b|Next\b/i] },

  // Backend Frameworks
  'Spring Boot': { patterns: [/\bSpring Boot\b/i] },
  Spring: { patterns: [/\bSpring\b(?! Boot)/i] },
  'Node.js': { patterns: [/\bNode\.js\b|Node\b/i] },
  Express: { patterns: [/\bExpress\b/i] },
  NestJS: { patterns: [/\bNestJS\b|Nest\b/i] },
  Django: { patterns: [/\bDjango\b/i] },
  FastAPI: { patterns: [/\bFastAPI\b|Fast API/i] },

  // Databases
  MySQL: { patterns: [/\bMySQL\b/i] },
  PostgreSQL: { patterns: [/\bPostgreSQL\b|Postgres\b/i] },
  MongoDB: { patterns: [/\bMongoDB\b|Mongo\b/i] },
  Redis: { patterns: [/\bRedis\b/i] },
  Elasticsearch: { patterns: [/\bElasticsearch\b|Elastic\b/i] },
  DynamoDB: { patterns: [/\bDynamoDB\b/i] },

  // Cloud & DevOps
  AWS: { patterns: [/\bAWS\b|Amazon Web Services/i] },
  GCP: { patterns: [/\bGCP\b|Google Cloud|Google Cloud Platform/i] },
  Azure: { patterns: [/\bAzure\b|Microsoft Azure/i] },
  Docker: { patterns: [/\bDocker\b/i] },
  Kubernetes: { patterns: [/\bKubernetes\b|K8s\b/i] },
  Terraform: { patterns: [/\bTerraform\b/i] },
  'CI/CD': { patterns: [/\bCI\/CD\b|continuous integration|continuous deployment/i] },
};

/**
 * Extract technology stack from text
 * @param {string} text - The text to search (e.g., job description, requirements)
 * @returns {string[]} - Array of unique detected technologies in standard casing
 */
function extractTechStack(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const detected = new Set();

  // Check each technology against the text
  for (const [techName, config] of Object.entries(TECH_DICT)) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        detected.add(techName);
        break; // Stop checking patterns for this tech once found
      }
    }
  }

  // Return sorted array
  return Array.from(detected).sort();
}

module.exports = { extractTechStack };
