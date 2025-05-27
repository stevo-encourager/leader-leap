
# Generate Insights Function

This function generates AI-powered leadership insights using OpenAI's GPT-4o model.

## Technical Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   HTTP Request  │───▶│  Main Handler    │───▶│  Environment    │
│   (index.ts)    │    │    (index.ts)    │    │  Validation     │
└─────────────────┘    └──────────────────┘    │ (validation.ts) │
                                │               └─────────────────┘
                                ▼                        │
                       ┌──────────────────┐              ▼
                       │  Check Existing  │    ┌─────────────────┐
                       │    Insights      │───▶│   Database      │
                       │  (database.ts)   │    │  Operations     │
                       └──────────────────┘    │ (database.ts)   │
                                │               └─────────────────┘
                                ▼                        │
                       ┌──────────────────┐              │
                       │  Build Assessment│              │
                       │  Data & Prompt   │              │
                       │(promptBuilder.ts)│              │
                       └──────────────────┘              │
                                │                        │
                                ▼                        │
                       ┌──────────────────┐              │
                       │   Call OpenAI    │              │
                       │(openaiClient.ts) │              │
                       └──────────────────┘              │
                                │                        │
                                ▼                        │
                       ┌──────────────────┐              │
                       │  Clean & Format  │              │
                       │  Response        │              │
                       │ (formatting.ts)  │              │
                       └──────────────────┘              │
                                │                        │
                                ▼                        │
                       ┌──────────────────┐              │
                       │   Validate       │              │
                       │   Structure      │              │
                       │ (validation.ts)  │              │
                       └──────────────────┘              │
                                │                        │
                                ▼                        │
                       ┌──────────────────┐              │
                       │  Save Insights   │◀─────────────┘
                       │  (database.ts)   │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Return Response │
                       │   (index.ts)     │
                       └──────────────────┘
```

## Architecture

The function is organized into modular utilities for better maintainability:

### File Structure
```
supabase/functions/generate-insights/
├── index.ts                 # Main handler and orchestration
├── README.md               # This documentation
└── utils/
    ├── validation.ts       # Environment and data validation
    ├── formatting.ts       # Response cleaning and text formatting
    ├── promptBuilder.ts    # Assessment data processing and prompt construction
    ├── openaiClient.ts     # OpenAI API interaction
    └── database.ts         # Supabase database operations
```

### Module Responsibilities

#### **validation.ts**
- **Purpose**: Validates environment variables and AI response structure
- **Key Functions**:
  - `validateEnvironmentVariables()`: Ensures required env vars are present
  - `validateInsightsStructure()`: Validates JSON structure from OpenAI
- **Dependencies**: None
- **Used by**: Main handler for input validation and response verification

#### **formatting.ts** 
- **Purpose**: Cleans OpenAI responses and formats summaries into readable paragraphs
- **Key Functions**:
  - `cleanJsonResponse()`: Removes markdown formatting from JSON responses
  - `formatSummaryIntoParagraphs()`: Splits summaries using transition phrases
- **Dependencies**: None
- **Used by**: Main handler after OpenAI response received

#### **promptBuilder.ts**
- **Purpose**: Processes assessment data and constructs the AI prompt
- **Key Functions**:
  - `buildAssessmentData()`: Aggregates and calculates assessment metrics
  - `buildPrompt()`: Creates the detailed prompt for OpenAI
- **Dependencies**: None
- **Used by**: Main handler before calling OpenAI

#### **openaiClient.ts**
- **Purpose**: Handles OpenAI API calls with proper error handling
- **Key Functions**:
  - `callOpenAI()`: Makes authenticated requests to OpenAI API
- **Dependencies**: None
- **Used by**: Main handler for AI insight generation

#### **database.ts**
- **Purpose**: Manages existing insight checks and saving new insights
- **Key Functions**:
  - `checkExistingInsights()`: Prevents duplicate insight generation
  - `saveInsights()`: Persists insights to database
- **Dependencies**: Supabase client
- **Used by**: Main handler for persistence operations

## Function Call Flow

1. **Request Validation** → `validateEnvironmentVariables()`
2. **Check Cache** → `checkExistingInsights()` (returns early if found)
3. **Data Processing** → `buildAssessmentData()` → `buildPrompt()`
4. **AI Generation** → `callOpenAI()`
5. **Response Processing** → `cleanJsonResponse()` → `validateInsightsStructure()`
6. **Summary Formatting** → `formatSummaryIntoParagraphs()`
7. **Persistence** → `saveInsights()`
8. **Response** → Return formatted insights

## Example Usage

### Invoking the Main Handler

```typescript
// POST request to the function endpoint
const response = await fetch('/functions/v1/generate-insights', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    categories: assessmentCategories,
    demographics: userDemographics,
    averageGap: 2.3,
    assessmentId: 'uuid-here'
  })
});

const { insights } = await response.json();
```

### Response Format

```json
{
  "insights": "{\"summary\":\"...\",\"priority_areas\":[...],\"key_strengths\":[...]}"
}
```

## Best Practices

### Adding New Features
1. **Single Responsibility**: Each utility module should handle one specific concern
2. **Error Handling**: Always include proper error handling with descriptive messages
3. **Logging**: Add console.log statements for debugging and monitoring
4. **Validation**: Validate all inputs and outputs thoroughly

### Prompt Engineering Guidelines
1. **Be Specific**: Use detailed examples of good vs bad insights
2. **Set Constraints**: Clearly define output format and requirements
3. **Provide Context**: Include relevant assessment data and user demographics
4. **Quality Control**: Emphasize actionable, research-backed insights over generic advice

### Maintaining the LLM Integration
1. **Temperature Control**: Keep temperature low (0.1) for consistency
2. **Token Limits**: Monitor max_tokens to balance cost and completeness
3. **Model Updates**: When upgrading models, test thoroughly with existing prompts
4. **Response Validation**: Always validate the structure of AI responses

### Performance Considerations
1. **Caching**: Never regenerate insights if they already exist in the database
2. **Error Recovery**: Provide meaningful error messages for different failure types
3. **Resource Management**: Use appropriate timeouts and error handling for external API calls

## Testing Strategy

### Recommended Test Coverage

#### **Unit Tests** (Recommended locations)
```typescript
// tests/validation.test.ts
describe('validateEnvironmentVariables', () => {
  it('should throw error when OPENAI_API_KEY is missing');
  it('should return valid config when all vars present');
});

describe('validateInsightsStructure', () => {
  it('should pass valid insights structure');
  it('should fail when missing required fields');
  it('should validate array structures correctly');
});

// tests/formatting.test.ts  
describe('cleanJsonResponse', () => {
  it('should remove markdown formatting');
  it('should handle malformed responses');
});

describe('formatSummaryIntoParagraphs', () => {
  it('should split on transition phrases');
  it('should handle single paragraph summaries');
});

// tests/promptBuilder.test.ts
describe('buildAssessmentData', () => {
  it('should calculate category metrics correctly');
  it('should handle missing skill data gracefully');
});

describe('buildPrompt', () => {
  it('should include all required sections');
  it('should format categories correctly');
});
```

#### **Integration Tests**
```typescript
// tests/integration.test.ts
describe('generate-insights function', () => {
  it('should return cached insights when they exist');
  it('should generate new insights for new assessments');
  it('should handle OpenAI API errors gracefully');
  it('should save insights to database correctly');
});
```

#### **Mock Data Setup**
```typescript
// tests/fixtures/mockData.ts
export const mockCategories = [
  {
    title: "Emotional Intelligence",
    skills: [
      { ratings: { current: 3, desired: 5 } }
    ]
  }
];

export const mockDemographics = {
  role: "Manager",
  yearsOfExperience: "5-10",
  industry: "Technology"
};
```

## Environment Variables Required
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Special Considerations & Gotchas

### 🚨 **Critical Gotchas**

1. **Never Regenerate Existing Insights**
   - Always check `checkExistingInsights()` first
   - This prevents unnecessary API costs and maintains consistency
   - Insights are considered immutable once generated

2. **JSON Structure Validation is Critical**
   - OpenAI sometimes returns malformed JSON despite instructions
   - Always validate structure before saving to database
   - The `insights` array must contain ONLY strings, never objects

3. **Temperature Settings Matter**
   - Keep temperature at 0.1 for consistent, professional responses
   - Higher temperatures can lead to unpredictable or inappropriate content

4. **Token Management**
   - Current max_tokens: 3000 - sufficient for detailed insights
   - Monitor token usage if adding more complexity to prompts
   - Truncated responses will result in invalid JSON

### 🔧 **Development Considerations**

1. **Prompt Engineering Iterations**
   - Test prompt changes with multiple assessment types
   - Save examples of good/bad outputs for future reference
   - Document any changes to system prompts in git commits

2. **Error Handling Strategy**
   - Distinguish between OpenAI API errors and validation errors
   - Provide user-friendly error messages without exposing internals
   - Log detailed errors for debugging while returning generic messages to users

3. **Database Schema Dependencies**
   - Function expects `assessment_results` table with `ai_insights` text field
   - Changes to assessment data structure may require prompt updates
   - Always test with real assessment data, not just mock data

4. **Performance Monitoring**
   - OpenAI API calls can take 10-30 seconds
   - Monitor function timeout limits (default: 5 minutes)
   - Consider adding progress indicators for long-running requests

### 📝 **Maintenance Guidelines**

1. **When Adding New Insight Categories**
   - Update both the prompt and validation logic
   - Test with various assessment scenarios
   - Update documentation and examples

2. **When Updating OpenAI Models**
   - Test extensively with existing prompts
   - May need to adjust temperature/parameters
   - Update model name in `openaiClient.ts`

3. **When Modifying Assessment Data Structure**
   - Update `buildAssessmentData()` in `promptBuilder.ts`
   - Ensure backward compatibility with existing assessments
   - Update validation logic if needed

## Usage
This function is called automatically when users complete assessments. It generates insights once per assessment and stores them permanently to avoid regeneration costs.

## Monitoring & Debugging

### Function Logs
- Check Supabase Function logs for detailed execution traces
- Look for OpenAI API response validation errors
- Monitor for timeout issues on large assessments

### Common Debug Scenarios
1. **Invalid JSON from OpenAI**: Check `cleanJsonResponse()` processing
2. **Missing Insights**: Verify `checkExistingInsights()` logic
3. **API Failures**: Review OpenAI API key and rate limits
4. **Validation Errors**: Check assessment data structure

