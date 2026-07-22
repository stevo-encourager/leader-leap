/**
 * Regenerates example-ai-prompt.txt in the project root.
 *
 * The output is a full render of the prompt sent to OpenAI by the
 * generate-insights edge function, using the live assessment categories and
 * deterministic dummy ratings. Run this whenever the categories or the prompt
 * change, so the committed example never drifts from the real thing:
 *
 *   npm run generate:example-prompt
 *
 * Ratings are derived from the skill index rather than randomised, so repeated
 * runs on unchanged inputs produce a byte-identical file.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { allCategories } from '../src/utils/assessmentCategories/index.ts';
import { buildAssessmentData, buildPrompt } from '../supabase/functions/generate-insights/utils/promptBuilder.ts';

const OUTPUT_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'example-ai-prompt.txt');

const DEMOGRAPHICS = {
  role: 'Managing Director',
  yearsOfExperience: '8-15',
  industry: 'Technology',
};

let skillIndex = 0;
const categories = allCategories.map(category => ({
  ...category,
  skills: category.skills.map(skill => {
    skillIndex += 1;
    const current = 4 + (skillIndex % 4); // 4..7
    const desired = Math.min(10, current + 1 + (skillIndex % 3)); // +1..+3
    return { ...skill, ratings: { current, desired } };
  }),
}));

const gaps = categories.flatMap(category =>
  category.skills.map(skill => skill.ratings.desired - skill.ratings.current)
);
const averageGap = gaps.reduce((total, gap) => total + gap, 0) / gaps.length;

const assessmentSummary = buildAssessmentData(categories, averageGap, DEMOGRAPHICS);
const prompt = buildPrompt(assessmentSummary);

writeFileSync(OUTPUT_FILE, prompt, 'utf8');

const skillCount = categories.reduce((total, category) => total + category.skills.length, 0);
console.log(`Wrote ${OUTPUT_FILE}`);
console.log(`  ${categories.length} categories, ${skillCount} skills, ${prompt.split('\n').length} lines`);
