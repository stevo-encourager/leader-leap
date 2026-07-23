import { isBookResource, findNonBookResourceFor } from './promptBuilder.ts';

export const validateEnvironmentVariables = () => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration not complete');
  }
  return { openAIApiKey, supabaseUrl, supabaseServiceKey };
};

export const validateInsightsStructure = (insights: any): void => {
  if (!insights.summary || !insights.priority_areas || !insights.key_strengths) {
    throw new Error('Invalid JSON structure - missing required fields: summary, priority_areas, or key_strengths');
  }
  
  if (!Array.isArray(insights.priority_areas) || !Array.isArray(insights.key_strengths)) {
    throw new Error('Invalid JSON structure - priority_areas and key_strengths must be arrays');
  }

  if (insights.priority_areas.length !== 3) {
    throw new Error('Invalid JSON structure - priority_areas must have exactly 3 items');
  }

  if (insights.key_strengths.length < 2) {
    throw new Error('Invalid JSON structure - key_strengths must have at least 2 items');
  }

  // Validate priority areas structure with updated resources validation
  for (const area of insights.priority_areas) {
    if (!area.competency || !area.insights || !Array.isArray(area.insights)) {
      throw new Error('Invalid priority area structure - must have competency and insights array');
    }
    
    // Check that insights array has at least 2 items and at most 5 items
    if (area.insights.length < 2 || area.insights.length > 5) {
      throw new Error('Invalid priority area structure - insights array must have 2-5 items');
    }
    
    for (const insight of area.insights) {
      if (typeof insight !== 'string') {
        throw new Error('Invalid priority area structure - insights array must contain only strings');
      }
      
      // Check if insight looks like a resource title (very short, no actionable content)
      if (insight.length < 20) {
        throw new Error('Invalid priority area structure - insights must be actionable advice, not resource titles');
      }
    }
    
    if (typeof area.gap !== 'number') {
      throw new Error('Invalid priority area structure - gap must be a number');
    }

    // Handle both old 'resource' field and new 'resources' field for backward compatibility
    if (!area.resources && area.resource) {
      area.resources = [area.resource];
    }
    
    // Resources field is optional now, but if present must be an array
    if (area.resources && !Array.isArray(area.resources)) {
      throw new Error('Invalid priority area structure - resources must be an array');
    }
  }

  // Validate key strengths structure with updated resources validation  
  for (const strength of insights.key_strengths) {
    if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
      throw new Error('Invalid key strength structure - must have competency, example, and leverage_advice array');
    }
    
    // Check that leverage_advice array has at least 2 items and at most 5 items
    if (strength.leverage_advice.length < 2 || strength.leverage_advice.length > 5) {
      throw new Error('Invalid key strength structure - leverage_advice array must have 2-5 items');
    }
    
    for (const advice of strength.leverage_advice) {
      if (typeof advice !== 'string') {
        throw new Error('Invalid key strength structure - leverage_advice array must contain only strings');
      }
      
      // Check if advice looks actionable (not too short)
      if (advice.length < 15) {
        throw new Error('Invalid key strength structure - leverage advice must be actionable, not just titles');
      }
    }

    // Resources field is optional, but if present must be an array
    if (strength.resources && !Array.isArray(strength.resources)) {
      throw new Error('Invalid key strength structure - resources must be an array');
    }
  }
};

// --- BOOK COUNT ENFORCEMENT -------------------------------------------------
// The prompt demands exactly one book per competency section, but even
// full-size models violate it (e.g. "Getting To Yes" AND "Crucial
// Conversations" in the same section). Rather than rejecting the whole
// response, repair it: keep the first book and swap surplus books for
// validated non-book resources. Sections with zero books are left alone - the
// prompt already handles that case.

/** Shapes the model may emit. Fields are optional because output is untrusted. */
interface InsightResource {
  type?: string;
  title?: string;
  name?: string;
  [key: string]: unknown;
}

type ResourceEntry = string | InsightResource;

interface InsightSection {
  competency?: string;
  resources?: ResourceEntry[];
  insights?: string[];
  leverage_advice?: string[];
}

interface ParsedInsights {
  priority_areas?: InsightSection[];
  key_strengths?: InsightSection[];
}

/** Resources arrive as plain strings or as objects carrying a title/name. */
const resourceNameOf = (resource: ResourceEntry): string => {
  if (typeof resource === 'string') return resource;
  if (resource && typeof resource === 'object') {
    return String(resource.title ?? resource.name ?? '');
  }
  return '';
};

/**
 * Rebuild a resource in its original shape with a new name. Replacements are
 * always non-book resources, so any `type: 'book'` metadata is corrected too -
 * otherwise a framework would keep being labelled (and rendered) as a book.
 */
const withResourceName = (original: ResourceEntry, name: string): ResourceEntry => {
  if (typeof original === 'string') return name;
  if (original && typeof original === 'object') {
    const updated: InsightResource = { ...original };
    if (updated.type === 'book') {
      updated.type = 'framework';
    }
    if ('title' in updated) {
      updated.title = name;
    } else {
      updated.name = name;
    }
    return updated;
  }
  return name;
};

const enforceBookLimitForSection = (
  section: InsightSection,
  competency: string,
  narrative: string[] | undefined,
  label: string
): number => {
  const resources = section?.resources;
  if (!Array.isArray(resources) || resources.length === 0) return 0;

  const bookPositions = resources
    .map((resource: ResourceEntry, index: number) => ({ index, name: resourceNameOf(resource) }))
    .filter(entry => entry.name && isBookResource(entry.name));

  if (bookPositions.length < 2) return 0;

  const contextText = Array.isArray(narrative) ? narrative.join(' ') : '';
  let corrections = 0;

  // Keep the first book; replace every subsequent one.
  for (const surplus of bookPositions.slice(1)) {
    const currentNames = resources.map(resourceNameOf).filter(Boolean);
    const replacement = findNonBookResourceFor(competency, contextText, currentNames);

    if (!replacement) {
      console.log(
        `Book limit: ${label} "${competency}" has surplus book "${surplus.name}" but no replacement resource was available - leaving as is`
      );
      continue;
    }

    console.log(
      `Book limit: ${label} "${competency}" had ${bookPositions.length} books - replacing "${surplus.name}" with "${replacement}"`
    );
    resources[surplus.index] = withResourceName(resources[surplus.index], replacement);
    corrections += 1;
  }

  return corrections;
};

/**
 * Enforce the one-book-per-section rule across the parsed insights, mutating
 * `insights` in place. Logs every correction so the function logs show how
 * often the model gets this wrong.
 */
export const enforceBookLimits = (insights: unknown): void => {
  if (!insights || typeof insights !== 'object') return;

  const parsed = insights as ParsedInsights;
  let corrections = 0;

  if (Array.isArray(parsed.priority_areas)) {
    for (const area of parsed.priority_areas) {
      corrections += enforceBookLimitForSection(
        area,
        String(area?.competency ?? 'unknown'),
        area?.insights,
        'priority area'
      );
    }
  }

  if (Array.isArray(parsed.key_strengths)) {
    for (const strength of parsed.key_strengths) {
      corrections += enforceBookLimitForSection(
        strength,
        String(strength?.competency ?? 'unknown'),
        strength?.leverage_advice,
        'key strength'
      );
    }
  }

  if (corrections > 0) {
    console.log(`Book limit: applied ${corrections} correction(s) to model output`);
  }
};
