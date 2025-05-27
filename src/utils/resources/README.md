
# Resource Mapping System

This folder contains the organized resource mappings for the Leadership Assessment Tool.

## Structure

```
src/utils/resources/
├── index.ts          # Main export file that combines all resources
├── books.ts          # Book recommendations
├── frameworks.ts     # Leadership frameworks and models
├── courses.ts        # Training courses and programs
├── tools.ts          # Assessment tools and instruments
└── README.md         # This file
```

## Adding New Resources

### 1. Choose the Correct File
- **Books**: Add to `books.ts` for published books and written materials
- **Frameworks**: Add to `frameworks.ts` for leadership models, methodologies, and frameworks
- **Courses**: Add to `courses.ts` for training programs, workshops, and educational courses
- **Tools**: Add to `tools.ts` for assessment instruments, software tools, and diagnostic tools

### 2. Resource Entry Format
```typescript
'resource key': {
  title: 'Display Title for the Resource',
  url: 'https://reputable-public-url.com',
  type: 'book' | 'article' | 'course' | 'framework' | 'tool'
}
```

### 3. Best Practices for Resource Keys
- Use lowercase only
- Remove apostrophes and quotes
- Replace spaces with single spaces
- Keep keys descriptive but concise
- Add aliases for common variations

### 4. Example: Adding a New Framework
```typescript
// In frameworks.ts
'new leadership model': {
  title: 'New Leadership Model by Author',
  url: 'https://official-source.com/model',
  type: 'framework'
},
'new model': {
  title: 'New Leadership Model by Author',
  url: 'https://official-source.com/model', 
  type: 'framework'
},
'leadership model new': {
  title: 'New Leadership Model by Author',
  url: 'https://official-source.com/model',
  type: 'framework'
}
```

## URL Guidelines
- Always use official sources when available
- Prefer educational institutions, publishers, or official organization websites
- Avoid affiliate links or sales pages
- Ensure URLs are publicly accessible (no paywalls for basic information)
- Test URLs before adding them

## Maintenance
- Regularly check that URLs are still active
- Update URLs if official sources change
- Add new aliases as they become commonly used
- Group related resources together within each file for easier navigation
