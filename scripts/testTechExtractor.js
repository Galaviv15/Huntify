const { extractTechStack } = require('../services/techStackExtractor');

/**
 * Test cases for Tech Stack Extractor
 */
const testCases = [
  {
    description: 'Senior Java & Spring Boot engineer with MySQL, Redis and AWS experience',
    input: 'Seeking a Senior Java & Spring Boot engineer with MySQL, Redis and AWS experience',
    expected: ['AWS', 'Java', 'MySQL', 'Redis', 'Spring Boot'],
  },
  {
    description: 'Full-stack JavaScript/TypeScript, React, Node.js and PostgreSQL',
    input: 'We are looking for a Full-stack developer with JavaScript/TypeScript, React, Node.js and PostgreSQL expertise.',
    expected: ['JavaScript', 'Node.js', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    description: 'Python Django FastAPI with DynamoDB and AWS',
    input: 'Backend engineer needed: Python, Django, FastAPI, DynamoDB, AWS, Docker, Kubernetes',
    expected: ['AWS', 'Django', 'Docker', 'DynamoDB', 'FastAPI', 'Kubernetes', 'Python'],
  },
  {
    description: 'DevOps Kubernetes Docker Terraform CI/CD',
    input: 'DevOps engineer: expertise in Kubernetes, Docker, Terraform, CI/CD, AWS and GCP',
    expected: ['AWS', 'Docker', 'GCP', 'Kubernetes', 'Terraform', 'CI/CD'],
  },
  {
    description: 'Java should not match JavaScript',
    input: 'JavaScript expert needed, not Java developer',
    expected: ['Java', 'JavaScript'],
  },
  {
    description: 'Go language not confused with regular text',
    input: 'Go language experience required. Please go ahead and apply.',
    expected: ['Go'],
  },
  {
    description: 'C# and C++',
    input: 'C# and C++ developer with .NET experience',
    expected: ['C#', 'C++'],
  },
  {
    description: 'Empty string',
    input: '',
    expected: [],
  },
  {
    description: 'No tech keywords',
    input: 'We are hiring for a general position with no specific technical requirements.',
    expected: [],
  },
];

/**
 * Run all test cases
 */
function runTests() {
  console.log('\n🧪 Tech Stack Extractor Tests\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = extractTechStack(testCase.input);

    // Check if results match (order-independent)
    const match =
      JSON.stringify(result.sort()) ===
      JSON.stringify(testCase.expected.sort());

    const status = match ? '✅ PASS' : '❌ FAIL';

    console.log(`\nTest ${index + 1}: ${status}`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Input: "${testCase.input}"`);
    console.log(`Expected: [${testCase.expected.join(', ')}]`);
    console.log(`Got:      [${result.join(', ')}]`);

    if (!match) {
      console.log(`⚠️  Mismatch detected!`);
      failed++;
    } else {
      passed++;
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total:  ${testCases.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

// Run tests
runTests();
