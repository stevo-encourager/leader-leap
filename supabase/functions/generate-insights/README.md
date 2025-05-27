
# Generate Insights Function

This function generates AI-powered leadership insights using OpenAI's GPT-4o model.

## Architecture

The function is organized into modular utilities for better maintainability:

### File Structure
```
supabase/functions/generate-insights/
├── index.ts                 # Main handler
├── README.md               # This file
└── utils/
    ├── validation.ts       # Environment and data validation
    ├── formatting.ts       # Response cleaning and text formatting
    ├── promptBuilder.ts    # Assessment data processing and prompt construction
    ├── openaiClient.ts     # OpenAI API interaction
    └── database.ts         # Supabase database operations
```

### Module Responsibilities

- **validation.ts**: Validates environment variables and insight structure
- **formatting.ts**: Cleans OpenAI responses and formats summaries into paragraphs
- **promptBuilder.ts**: Processes assessment data and builds the AI prompt
- **openaiClient.ts**: Handles OpenAI API calls with proper error handling
- **database.ts**: Manages existing insight checks and saving new insights

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

## Environment Variables Required
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Usage
This function is called automatically when users complete assessments. It generates insights once per assessment and stores them permanently to avoid regeneration costs.
