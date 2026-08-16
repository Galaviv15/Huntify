/**
 * Tech Stack Extractor Service
 * Identifies programming languages, frameworks, databases, and tools from job descriptions
 */

const TECH_DICT = {
  Languages: [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    'C++',
    'Go',
    'Rust',
    'Ruby',
    'PHP',
    'Swift',
    'Kotlin',
    'Scala',
    'R',
    'SQL',
  ],
  Frameworks: [
    'React',
    'Vue',
    'Angular',
    'Next.js',
    'Nuxt',
    'Svelte',
    'Spring',
    'Spring Boot',
    'Django',
    'Flask',
    'FastAPI',
    'Express',
    'NestJS',
    'Rails',
    'Laravel',
    '.NET',
    'ASP.NET',
  ],
  Databases: [
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Cassandra',
    'DynamoDB',
    'Elasticsearch',
    'Firestore',
    'SQLite',
    'Oracle',
    'SQL Server',
    'MariaDB',
  ],
  CloudDevOps: [
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'Terraform',
    'Jenkins',
    'GitLab CI',
    'GitHub Actions',
    'CircleCI',
    'Helm',
    'CloudFormation',
  ],
  Tools: [
    'Git',
    'npm',
    'yarn',
    'pnpm',
    'Maven',
    'Gradle',
    'Webpack',
    'Vite',
    'GraphQL',
    'REST',
    'Microservices',
    'Kafka',
    'RabbitMQ',
    'Linux',
    'macOS',
    'Windows',
  ],
};

/**
 * Extract tech stack from text
 * @param {string} text - Job description or title
 * @returns {Array<string>} - Array of detected technologies
 */
function extractTechStack(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lowerText = text.toLowerCase();
  const foundTech = new Set();

  // Check each technology
  for (const category in TECH_DICT) {
    for (const tech of TECH_DICT[category]) {
      const lowerTech = tech.toLowerCase();

      // Special handling for C# and C++ (no word boundaries for special chars)
      if (lowerTech === 'c#' || lowerTech === 'c++') {
        if (lowerText.includes(lowerTech)) {
          foundTech.add(tech);
        }
      } else {
        // Use word boundary for other technologies
        const regex = new RegExp(`\\b${lowerTech}\\b`, 'g');
        if (regex.test(lowerText)) {
          foundTech.add(tech);
        }
      }
    }
  }

  return Array.from(foundTech).sort();
}

module.exports = { extractTechStack };
