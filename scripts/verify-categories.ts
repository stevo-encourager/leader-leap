/**
 * Structural checks on the assessment categories.
 *
 *   npm run verify:categories
 *
 * Verifies that every category and skill id is unique, that no skill id
 * collides with a category id (lookups keyed on skill id alone would otherwise
 * be ambiguous), and that every skill carries the expected zeroed ratings.
 * Exits non-zero on failure so it can gate a build if wired up later.
 */
import { allCategories } from '../src/utils/assessmentCategories/index.ts';

const categoryIds: string[] = [];
const skillIds: string[] = [];
const badRatings: string[] = [];
let skillCount = 0;

for (const category of allCategories) {
  categoryIds.push(category.id);
  console.log(`\n${category.title}  [id: ${category.id}]  - ${category.skills.length} skills`);

  for (const skill of category.skills) {
    skillIds.push(skill.id);
    skillCount += 1;
    console.log(`   - ${skill.id.padEnd(26)} ${skill.name}`);

    const { current, desired } = skill.ratings ?? { current: NaN, desired: NaN };
    if (current !== 0 || desired !== 0) {
      badRatings.push(`${category.id}/${skill.id} -> ${JSON.stringify(skill.ratings)}`);
    }
  }
}

const duplicates = (values: string[]): string[] =>
  [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];

const duplicateCategoryIds = duplicates(categoryIds);
const duplicateSkillIds = duplicates(skillIds);
const skillIdMatchingCategoryId = [...new Set(skillIds.filter(id => categoryIds.includes(id)))];

console.log('\n--- checks ---');
console.log(`Categories:                   ${allCategories.length}`);
console.log(`Total skills:                 ${skillCount}`);
console.log(`Duplicate CATEGORY ids:       ${duplicateCategoryIds.length ? duplicateCategoryIds.join(', ') : 'none'}`);
console.log(`Duplicate SKILL ids (global): ${duplicateSkillIds.length ? duplicateSkillIds.join(', ') : 'none'}`);
console.log(`Skill id === any category id: ${skillIdMatchingCategoryId.length ? skillIdMatchingCategoryId.join(', ') : 'none'}`);
console.log(`Skills with non-zero ratings: ${badRatings.length ? badRatings.join(', ') : 'none'}`);

const failed =
  duplicateCategoryIds.length > 0 ||
  duplicateSkillIds.length > 0 ||
  skillIdMatchingCategoryId.length > 0 ||
  badRatings.length > 0;

console.log(failed ? '\nFAIL: see above' : '\nPASS: all ids unique, all ratings zeroed');
if (failed) process.exit(1);
