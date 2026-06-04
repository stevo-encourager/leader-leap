#!/usr/bin/env node
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Test data - Use real examples from your database
const TEST_CASES = [
  {
    name: "Tech Manager - Balanced Gaps",
    data: {
      role: "Engineering Manager",
      industry: "Technology",
      yearsExperience: "4-7 years",
      assessmentData: {
        "Strategic Thinking & Visioning": { current: 3, desired: 7, gap: 4 },
        "Emotional Intelligence": { current: 4, desired: 7, gap: 3 },
        "Team Building & Collaboration": { current: 5, desired: 8, gap: 3 },
        "Influencing & Communication": { current: 6, desired: 8, gap: 2 },
        "Change Management": { current: 3, desired: 7, gap: 4 },
        "Decision Making": { current: 5, desired: 7, gap: 2 },
        "Time & Priority Management": { current: 4, desired: 7, gap: 3 },
        "Delegation & Empowerment": { current: 3, desired: 6, gap: 3 },
        "Negotiation & Conflict Resolution": { current: 4, desired: 6, gap: 2 },
        "Self-Leadership & Personal Development": { current: 6, desired: 8, gap: 2 }
      }
    }
  },
  {
    name: "Senior Executive - People Skills Gap",
    data: {
      role: "VP of Operations",
      industry: "Finance",
      yearsExperience: "10+ years",
      assessmentData: {
        "Strategic Thinking & Visioning": { current: 7, desired: 9, gap: 2 },
        "Emotional Intelligence": { current: 4, desired: 8, gap: 4 },
        "Team Building & Collaboration": { current: 5, desired: 9, gap: 4 },
        "Influencing & Communication": { current: 5, desired: 8, gap: 3 },
        "Change Management": { current: 6, desired: 8, gap: 2 },
        "Decision Making": { current: 8, desired: 9, gap: 1 },
        "Time & Priority Management": { current: 7, desired: 8, gap: 1 },
        "Delegation & Empowerment": { current: 4, desired: 8, gap: 4 },
        "Negotiation & Conflict Resolution": { current: 6, desired: 8, gap: 2 },
        "Self-Leadership & Personal Development": { current: 7, desired: 9, gap: 2 }
      }
    }
  }
];

// Model configurations to test
const MODEL_CONFIGS = [
  {
    name: "GPT-4o - Low Temperature",
    model: "gpt-4o",
    temperature: 0.1,
    provider: "openai"
  },
  {
    name: "GPT-4o - Medium Temperature",
    model: "gpt-4o",
    temperature: 0.7,
    provider: "openai"
  },
  {
    name: "GPT-4o - High Temperature",
    model: "gpt-4o",
    temperature: 0.9,
    provider: "openai"
  },
  {
    name: "GPT-4 Turbo",
    model: "gpt-4-turbo-preview",
    temperature: 0.7,
    provider: "openai"
  }
];

// Prompt variations to test
const PROMPT_VARIATIONS = [
  {
    name: "Original Prompt",
    modifier: ""
  },
  {
    name: "With Pattern Analysis",
    modifier: `
BEFORE GENERATING YOUR RESPONSE, ANALYZE:
1. What story do these gaps tell together?
2. What underlying capability connects multiple gaps?
3. Which gaps are most critical for their role RIGHT NOW?
4. Which competencies, if developed together, would create exponential improvement?

Your summary MUST demonstrate this analysis by identifying interconnections between competencies.
`
  },
  {
    name: "With Examples",
    modifier: `
GOOD INSIGHT EXAMPLE: "Your gaps in both delegation (3.0) and team building (2.8) suggest an opportunity to develop a more empowering leadership style. By learning to trust your team with greater autonomy through structured delegation frameworks like RACI matrices, you'll simultaneously build stronger team cohesion."

BAD INSIGHT EXAMPLE: "You should work on delegation. This is important for leaders. Consider delegating more tasks."

Ensure your insights match the quality and specificity of the GOOD example.
`
  },
  {
    name: "Two-Step Process",
    modifier: `
STEP 1 - ANALYSIS (Internal - not in output):
- Identify the core leadership challenge
- Find patterns across gaps
- Determine root causes
- Consider role-specific impact

STEP 2 - INSIGHTS:
Based on your analysis, provide insights that address patterns, not just individual gaps.
`
  }
];

async function testOpenAI(prompt: string, config: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert leadership coach. Respond with JSON only.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: 3000
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function testClaude(prompt: string, config: any) {
  // Add Claude API testing if you have access
  console.log("Claude testing not implemented - add API key to test");
  return null;
}

async function runTest(testCase: any, modelConfig: any, promptVariation: any) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${testCase.name}`);
  console.log(`Model: ${modelConfig.name}`);
  console.log(`Prompt: ${promptVariation.name}`);
  console.log(`${'='.repeat(80)}\n`);

  // Build the prompt (simplified version of your actual prompt)
  const prompt = `
${promptVariation.modifier}

Analyze this leadership assessment and provide insights:

Role: ${testCase.data.role}
Industry: ${testCase.data.industry}
Experience: ${testCase.data.yearsExperience}

Competency Gaps:
${Object.entries(testCase.data.assessmentData)
  .map(([key, value]: [string, any]) => `- ${key}: Gap of ${value.gap} (Current: ${value.current}, Desired: ${value.desired})`)
  .join('\n')}

Provide a JSON response with:
1. A summary paragraph that identifies patterns and connections
2. Three priority areas with specific, actionable insights
3. Key strengths to leverage

Focus on pattern recognition and avoid generic advice.
`;

  try {
    const startTime = Date.now();
    let response;
    
    if (modelConfig.provider === 'openai') {
      response = await testOpenAI(prompt, modelConfig);
    } else if (modelConfig.provider === 'claude') {
      response = await testClaude(prompt, modelConfig);
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("Response received in", duration, "seconds");
    
    // Parse and validate response
    try {
      const parsed = JSON.parse(response);
      console.log("\n✅ Valid JSON response");
      
      // Quality checks
      const summary = parsed.summary || '';
      const qualityMetrics = {
        summaryLength: summary.length,
        mentionsPatterns: summary.includes('pattern') || summary.includes('together') || summary.includes('combination'),
        mentionsSpecificGaps: (summary.match(/delegation|team building|strategic|emotional/gi) || []).length,
        usesTransitions: summary.includes('However') || summary.includes('Additionally') || summary.includes('At the same time'),
        genericPhrases: (summary.match(/important for leaders|you should|consider working on/gi) || []).length
      };

      console.log("\nQuality Metrics:");
      console.log(`- Summary length: ${qualityMetrics.summaryLength} chars`);
      console.log(`- Mentions patterns: ${qualityMetrics.mentionsPatterns ? '✅' : '❌'}`);
      console.log(`- Specific gap references: ${qualityMetrics.mentionsSpecificGaps}`);
      console.log(`- Uses transitions: ${qualityMetrics.usesTransitions ? '✅' : '❌'}`);
      console.log(`- Generic phrases: ${qualityMetrics.genericPhrases} (lower is better)`);
      
      // Save result for comparison
      const resultPath = path.join(__dirname, 'test-results', 
        `${testCase.name}_${modelConfig.name}_${promptVariation.name}.json`.replace(/\s+/g, '_'));
      
      fs.mkdirSync(path.dirname(resultPath), { recursive: true });
      fs.writeFileSync(resultPath, JSON.stringify({
        testCase: testCase.name,
        model: modelConfig.name,
        prompt: promptVariation.name,
        duration,
        qualityMetrics,
        response: parsed
      }, null, 2));
      
      console.log(`\n💾 Saved to: ${resultPath}`);
      
      // Show sample of summary
      console.log("\nSummary Preview:");
      console.log(summary.substring(0, 200) + "...");
      
    } catch (parseError) {
      console.log("❌ Invalid JSON response:", parseError);
      console.log("Raw response:", response?.substring(0, 500));
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

async function runAllTests() {
  console.log("🧪 Starting Leadership Insights Testing Suite");
  console.log(`Testing ${TEST_CASES.length} cases × ${MODEL_CONFIGS.length} models × ${PROMPT_VARIATIONS.length} prompts`);
  console.log(`Total tests: ${TEST_CASES.length * MODEL_CONFIGS.length * PROMPT_VARIATIONS.length}\n`);

  for (const testCase of TEST_CASES) {
    for (const modelConfig of MODEL_CONFIGS) {
      for (const promptVariation of PROMPT_VARIATIONS) {
        await runTest(testCase, modelConfig, promptVariation);
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log("\n✅ All tests complete!");
  console.log("Check the test-results directory for detailed outputs");
}

// Run specific test or all tests
const args = process.argv.slice(2);
if (args[0] === '--quick') {
  // Quick test with one case
  runTest(TEST_CASES[0], MODEL_CONFIGS[1], PROMPT_VARIATIONS[1]);
} else {
  runAllTests();
}