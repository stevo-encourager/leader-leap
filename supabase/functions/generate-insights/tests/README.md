
# Testing Guide for Generate Insights Function

## Test Structure Recommendations

```
supabase/functions/generate-insights/tests/
├── README.md                    # This guide
├── fixtures/
│   ├── mockAssessmentData.ts    # Sample assessment data
│   ├── mockOpenAIResponses.ts   # Sample AI responses
│   └── mockEnvironment.ts       # Environment setup
├── unit/
│   ├── validation.test.ts       # Unit tests for validation
│   ├── formatting.test.ts       # Unit tests for formatting
│   ├── promptBuilder.test.ts    # Unit tests for prompt building
│   ├── openaiClient.test.ts     # Unit tests for OpenAI client
│   └── database.test.ts         # Unit tests for database operations
├── integration/
│   └── handler.test.ts          # Full function integration tests
└── utils/
    └── testHelpers.ts           # Shared testing utilities
```

## Sample Test Data

### Mock Assessment Data
```typescript
// fixtures/mockAssessmentData.ts
export const sampleCategories = [
  {
    title: "Emotional Intelligence",
    skills: [
      { name: "Self-awareness", ratings: { current: 3, desired: 5 } },
      { name: "Empathy", ratings: { current: 4, desired: 5 } }
    ]
  },
  {
    title: "Communication",
    skills: [
      { name: "Active Listening", ratings: { current: 2, desired: 4 } },
      { name: "Public Speaking", ratings: { current: 3, desired: 5 } }
    ]
  }
];

export const sampleDemographics = {
  role: "Senior Manager",
  yearsOfExperience: "10-15",
  industry: "Technology"
};
```

### Mock OpenAI Responses
```typescript
// fixtures/mockOpenAIResponses.ts
export const validAIResponse = {
  summary: "Your assessment reveals strong competencies in emotional intelligence and team building. However, there are opportunities to develop your strategic thinking and communication skills further.",
  priority_areas: [
    {
      competency: "Strategic Thinking",
      gap: 2.1,
      insights: [
        "Practice the 'OODA Loop' (Observe-Orient-Decide-Act) framework when making strategic decisions, which can improve decision speed by 25% according to military leadership research.",
        "Implement 'pre-mortem' analysis before major initiatives: imagine the project has failed and work backwards to identify potential failure points, reducing project risk by up to 30%.",
        "Use the 'Jobs to be Done' framework when analyzing market opportunities - focus on what customers are 'hiring' your product to accomplish rather than demographic segmentation."
      ],
      resource: "Good to Great by Jim Collins"
    }
  ],
  key_strengths: [
    {
      competency: "Emotional Intelligence",
      example: "Your high emotional intelligence likely manifests in your ability to read team dynamics and adjust your communication style accordingly.",
      leverage_advice: [
        "Become a 'Chief Emotional Officer' for your team by creating regular emotional check-ins and teaching emotional regulation techniques to team members.",
        "Use your emotional intelligence to build psychological safety by openly acknowledging mistakes and modeling vulnerability, which increases team performance by 67% according to Google's Project Aristotle.",
        "Leverage your empathy to become a 'cultural translator' between different departments or stakeholder groups, helping bridge communication gaps."
      ]
    }
  ]
};

export const invalidAIResponse = `{
  "summary": "Invalid response missing required fields"
}`;

export const malformedAIResponse = `{
  "summary": "Valid summary",
  "priority_areas": [
    {
      "competency": "Test",
      "insights": [
        {"nested": "object instead of string"}  // Invalid - should be string
      ]
    }
  ]
}`;
```

## Test Implementation Examples

### Unit Test Example
```typescript
// unit/validation.test.ts
import { describe, it, expect, beforeEach } from 'your-test-framework';
import { validateInsightsStructure } from '../utils/validation.ts';
import { validAIResponse, invalidAIResponse } from '../fixtures/mockOpenAIResponses.ts';

describe('validateInsightsStructure', () => {
  it('should pass validation for correctly structured insights', () => {
    expect(() => validateInsightsStructure(validAIResponse)).not.toThrow();
  });

  it('should throw error for missing required fields', () => {
    expect(() => validateInsightsStructure(invalidAIResponse))
      .toThrow('Invalid JSON structure - missing required fields');
  });

  it('should validate priority areas have exactly 3 insights', () => {
    const invalidInsights = {
      ...validAIResponse,
      priority_areas: [{
        competency: "Test",
        gap: 1.0,
        insights: ["Only one insight"], // Should be 3
        resource: "Test Resource"
      }]
    };
    
    expect(() => validateInsightsStructure(invalidInsights))
      .toThrow('insights array with 3 strings');
  });
});
```

### Integration Test Example
```typescript
// integration/handler.test.ts
import { describe, it, expect, beforeEach, jest } from 'your-test-framework';
import { sampleCategories, sampleDemographics } from '../fixtures/mockAssessmentData.ts';

describe('Generate Insights Handler', () => {
  beforeEach(() => {
    // Setup environment variables
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.SUPABASE_URL = 'test-url';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  it('should return existing insights when available', async () => {
    // Mock database response with existing insights
    const mockExistingInsights = JSON.stringify(validAIResponse);
    
    // Your test implementation here
    // Assert that the function returns cached insights without calling OpenAI
  });

  it('should generate new insights when none exist', async () => {
    // Mock database to return null for existing insights
    // Mock OpenAI API to return valid response
    
    // Your test implementation here
    // Assert that new insights are generated and saved
  });

  it('should handle OpenAI API errors gracefully', async () => {
    // Mock OpenAI API to return error
    
    // Your test implementation here
    // Assert that appropriate error response is returned
  });
});
```

## Testing Best Practices

1. **Mock External Dependencies**: Always mock OpenAI API and Supabase calls
2. **Test Edge Cases**: Invalid JSON, network errors, malformed responses
3. **Validate Error Handling**: Ensure proper error messages are returned
4. **Test Caching Logic**: Verify existing insights are never regenerated
5. **Performance Testing**: Test with large assessment datasets

## Running Tests

```bash
# If using Deno (recommended for edge functions)
deno test --allow-env --allow-net tests/

# If using Node.js
npm test
```

