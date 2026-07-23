// Build the validated skills list for the prompt - ONLY THESE SKILLS CAN BE REFERENCED
//
// Generated dynamically from the assessment data supplied at runtime, which
// originates from src/utils/assessmentCategories. Do NOT reintroduce a
// hardcoded copy here: this list silently drifted out of sync with the
// categories once already, which caused the model to be handed a rulebook
// forbidding it from naming any skill the user had actually rated.
const buildValidatedSkillsList = (categoryBreakdown: any[]): string => {
  const sections = (categoryBreakdown || [])
    .filter((cat: any) => cat && cat.title && Array.isArray(cat.allSkills) && cat.allSkills.length > 0)
    .map((cat: any) => `**${cat.title}:**\n${cat.allSkills.map((name: string) => `- ${name}`).join('\n')}`)
    .join('\n\n');

  return `
**VALIDATED SKILLS DATABASE - REFERENCE ONLY THESE SKILLS:**

${sections}

**CRITICAL SKILL REFERENCE RULES:**
- You MUST ONLY reference skills from this validated list above
- NEVER create, invent, or reference skills not explicitly listed here
- Each skill name you use must match EXACTLY as written in this database
- If you want to reference a skill concept not in this list, do not mention any skill name at all
- Every skill reference must be verifiable against this validated list
`;
};

/** Source of randomness, injectable so example output can be made deterministic. */
export type RandomFn = () => number;

/**
 * Small deterministic PRNG (mulberry32). Used by
 * scripts/generate-example-prompt.ts so the committed example prompt stays
 * byte-identical between runs; production passes no seed and gets Math.random.
 */
export const createSeededRandom = (seed: number): RandomFn => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Fisher-Yates shuffle. Returns a new array; does not mutate the input. */
const shuffle = <T>(items: T[], random: RandomFn): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

interface ValidatedLeader {
  theme: string;
  name: string;
  descriptor: string;
  url: string;
}

// Order here is NOT the order presented to the model - the list is shuffled on
// every prompt build. The model was over-selecting whichever leaders appeared
// first, which made Nadella and Benioff recur across similar profiles.
const VALIDATED_LEADERS: ValidatedLeader[] = [
  { theme: 'Transformational & Empathetic Leadership', name: 'Satya Nadella', descriptor: 'Microsoft transformation, empathetic leadership, emotional intelligence focus', url: 'https://www.linkedin.com/in/satyanadella/' },
  { theme: 'Collaborative & Inclusive Leadership', name: 'Mary Barra', descriptor: 'Automotive transformation, inclusive culture, team building excellence', url: 'https://www.linkedin.com/in/mary-barra/' },
  { theme: 'Values-Based & Learning-Oriented Leadership', name: 'Marc Benioff', descriptor: 'Values-driven business, continuous learning, professional development focus', url: 'https://www.linkedin.com/in/marcbenioff/' },
  { theme: 'Strategic & Empowering Leadership', name: 'Indra Nooyi', descriptor: 'Strategic thinking excellence, employee empowerment, delegation mastery', url: 'https://www.linkedin.com/in/indranooyi/' },
  { theme: '"Founder Mode" & Humble Inquiry Leadership', name: 'Brian Chesky', descriptor: 'Scaling organizations, staying connected to mission, adaptability', url: 'https://www.linkedin.com/in/brianchesky/' },
  { theme: 'Data-Driven & High-Performance Culture Leadership', name: 'Reed Hastings', descriptor: 'Performance culture, data-driven decisions, change leadership', url: 'https://www.linkedin.com/in/reedhastings/' },
  { theme: 'Servant Leadership & Financial Inclusion', name: 'Thasunda Brown Duckett', descriptor: 'Community impact, servant leadership, relationship management', url: 'https://www.linkedin.com/in/thasunda-brown-duckett-22b15523/' },
  { theme: 'Sustainable & Mission-Driven Leadership', name: 'Paul Polman', descriptor: 'Sustainable business, long-term thinking, strategic vision', url: 'https://www.linkedin.com/in/paulpolman/' },
  { theme: 'Direct & Crisis Management Leadership', name: 'Jamie Dimon', descriptor: 'Crisis leadership, direct communication, decisiveness', url: 'https://www.linkedin.com/in/jamiedimon/' },
  { theme: 'Technical Visionary & Innovation Leadership', name: 'Jensen Huang', descriptor: 'Innovation leadership, technical vision, future-focused thinking', url: 'https://www.linkedin.com/in/jenhsunhuang/' },
  { theme: 'Principle-Based & "Why Culture" Leadership', name: 'Andy Jassy', descriptor: 'Principle-centered decisions, cultural alignment, trust building', url: 'https://www.linkedin.com/in/andy-jassy-8b1615/' },
  { theme: 'Transparent, Creative, and Human-Centered', name: 'Stewart Butterfield', descriptor: 'Transparent communication, creative leadership, collaboration focus', url: 'https://www.linkedin.com/in/butterfield/' },
  { theme: 'Empathetic, Empowering, and Purpose-Driven', name: 'Whitney Wolfe Herd', descriptor: 'Purpose-driven innovation, empathetic leadership, empowerment focus', url: 'https://en.wikipedia.org/wiki/Whitney_Wolfe_Herd' },
  { theme: 'Tech-Forward, Ethical, and Strategic Transformation', name: 'Arvind Krishna', descriptor: 'Ethical technology, transformation leadership, strategic planning', url: 'https://www.linkedin.com/in/arvindkrishna/' },
  { theme: 'Bold, Mission-Driven, Inclusion-Focused', name: 'Reshma Saujani', descriptor: 'Bold advocacy, inclusion-focused leadership, resilience', url: 'https://www.linkedin.com/in/reshma-saujani/' },
  { theme: 'Global Advocacy, Partnership-Driven, Narrative Empowerment', name: 'Elizabeth Nyamayaro', descriptor: 'Global impact, partnership building, stakeholder engagement', url: 'https://www.linkedin.com/in/enyamayaro/' },
];

// Build the validated leaders list for the prompt - ENHANCED WITH BETTER SELECTION LOGIC
const buildValidatedLeadersList = (random: RandomFn): string => {
  const leaders = shuffle(VALIDATED_LEADERS, random)
    .map(leader => `**${leader.theme}:**\n- ${leader.name} (${leader.descriptor}) - ${leader.url}`)
    .join('\n\n');

  return `
**VALIDATED INSPIRATIONAL LEADERS - USE ONLY THESE LEADERS:**

${leaders}

**STREAMLINED LEADER SELECTION PROCESS:**

**Step 1: Identify User's Primary Strength**
- Analyze assessment data to find the competency with the HIGHEST current rating
- This becomes the primary basis for leader selection

**Step 2: Apply Competency-to-Leader Mapping**
- Strategy & Commercial strengths → Satya Nadella, Paul Polman, Jensen Huang, or Arvind Krishna
- Stakeholder Relationships strengths → Elizabeth Nyamayaro, Stewart Butterfield, or Whitney Wolfe Herd
- Leading People strengths → Mary Barra, Brian Chesky, or Marc Benioff
- Decision Making strengths → Jamie Dimon, Reed Hastings, or Andy Jassy
- Emotional Intelligence strengths → Thasunda Brown Duckett, Satya Nadella, or Whitney Wolfe Herd
- Execution & Operations strengths → Reed Hastings, Brian Chesky, or Reshma Saujani
- Negotiation & Conflict Resolution strengths → Jamie Dimon, Stewart Butterfield, or Andy Jassy
- Delegation & Empowerment strengths → Indra Nooyi, Mary Barra, or Marc Benioff
- Personal Effectiveness strengths → Vary selection to avoid repetition
- Leading Yourself strengths → Marc Benioff, Thasunda Brown Duckett, or Elizabeth Nyamayaro

**Step 3: Apply Industry Filter (if applicable)**
- Technology industry → Prefer Satya Nadella, Jensen Huang, Marc Benioff, or Andy Jassy
- Finance industry → Prefer Jamie Dimon or Thasunda Brown Duckett
- Other industries → Use competency mapping from Step 2

**Step 4: Final Selection Rules**
- NEVER default to Indra Nooyi unless Strategic Planning, Delegation, or Empowerment are the PRIMARY STRENGTHS
- ALWAYS vary leader selection - avoid repeating the same leader across assessments
- Where two leaders fit equally well, prefer the less frequently cited one over the most famous.
- If multiple leaders from Steps 2-3 could apply, select based on best industry/role fit
- If no perfect match exists, omit leader reference entirely rather than forcing a poor fit
`;
};

// --- CANONICAL RESOURCE DATABASE ------------------------------------------
// Single source of truth for every resource the model may recommend.
// Both the prompt's resource list AND formatResourceMarkdown() are derived
// from this array, so each title, author and URL exists in exactly one place.
// Do NOT reintroduce a second hand-maintained copy: the previous prose list
// and link map drifted apart on every one of their shared entries.
// Entries without a `url` render as plain text rather than a link.
interface LeadershipResource {
  title: string;
  author?: string;
  section: string;
  url?: string;
}

const LEADERSHIP_RESOURCES: LeadershipResource[] = [
  { title: 'The Eisenhower Matrix - Priority Management', section: 'Time Management & Productivity', url: 'https://www.eisenhower.me/eisenhower-matrix/' },
  { title: 'The Pomodoro Technique', section: 'Time Management & Productivity', url: 'https://www.techtarget.com/whatis/definition/pomodoro-technique' },
  { title: 'Getting Things Done (GTD) Methodology', section: 'Time Management & Productivity', url: 'https://gettingthingsdone.com/what-is-gtd/' },
  { title: 'SMART Goals Framework', section: 'Goal Setting & Planning', url: 'https://corporatefinanceinstitute.com/resources/management/smart-goal/' },
  { title: 'Objectives and Key Results (OKRs)', section: 'Goal Setting & Planning', url: 'https://www.whatmatters.com/faqs/okr-meaning-definition-example/' },
  { title: 'OKR Framework Guide', section: 'Goal Setting & Planning', url: 'https://www.atlassian.com/agile/agile-at-scale/okr' },
  { title: 'SBI Feedback Model', section: 'Communication & Feedback', url: 'https://www.ccl.org/articles/leading-effectively-articles/closing-the-gap-between-intent-vs-impact-sbii/' },
  { title: 'Radical Candor Framework', section: 'Communication & Feedback', url: 'https://www.radicalcandor.com/our-approach/' },
  { title: 'What is Nonviolent Communication', section: 'Communication & Feedback', url: 'https://positivepsychology.com/non-violent-communication/' },
  { title: 'Active Listening Techniques', section: 'Communication & Feedback', url: 'https://www.mindtools.com/CommSkll/ActiveListening.htm' },
  { title: 'OODA Loop', section: 'Decision Making', url: 'https://thedecisionlab.com/reference-guide/computer-science/the-ooda-loop' },
  { title: 'DACI Decision Making Framework', section: 'Decision Making', url: 'https://www.atlassian.com/team-playbook/plays/daci' },
  { title: 'RACI \'Responsibility Assignment Matrix\'', section: 'Decision Making', url: 'https://www.teamgantt.com/blog/raci-chart-definition-tips-and-example' },
  { title: 'SWOT Analysis Framework', section: 'Strategic Thinking', url: 'https://www.mindtools.com/pages/article/newTMC_05.htm' },
  { title: 'Design Thinking Process by IDEO', section: 'Strategic Thinking', url: 'https://designthinking.ideo.com/' },
  { title: 'Scenario Planning: Step by Step Guide', section: 'Strategic Thinking', url: 'https://www.professionalacademy.com/blogs/a-step-by-step-guide-to-scenario-planning/' },
  { title: 'Emotional Intelligence', author: 'Daniel Goleman', section: 'Emotional Intelligence', url: 'https://www.danielgoleman.info/topics/emotional-intelligence/' },
  { title: '16 Personalities test (MBTI)', section: 'Emotional Intelligence', url: 'https://www.16personalities.com/free-personality-test' },
  { title: 'The Speed of Trust', author: 'Stephen Covey', section: 'Trust & Relationship Building', url: 'https://www.speedoftrust.com/' },
  { title: 'The Trust Equation', section: 'Trust & Relationship Building', url: 'https://trustedadvisor.com/why-trust-matters/understanding-trust/understanding-the-trust-equation' },
  { title: '7 Models for Delegation', section: 'Delegation & Empowerment', url: 'https://blog.hptbydts.com/7-models-for-delegation' },
  { title: 'Situational Leadership: What it is and how to build it', section: 'Delegation & Empowerment', url: 'https://www.betterup.com/blog/situational-leadership-examples' },
  { title: 'Performance management that puts people first', section: 'Performance Management', url: 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/in-the-spotlight-performance-management-that-puts-people-first' },
  { title: 'Effective One-on-One Meetings', section: 'Performance Management', url: 'https://www.manager-tools.com/2005/07/the-single-most-effective-management-tool-part-1' },
  { title: 'Thomas-Kilmann Conflict Resolution Model', section: 'Conflict Resolution', url: 'https://www.mtdtraining.com/blog/thomas-kilmann-conflict-management-model.htm' },
  { title: 'Interest-Based Negotiation (framework guide)', section: 'Conflict Resolution', url: 'https://www.uhab.org/resource/successful-conflict-resolution-getting-to-yes/' },
  { title: 'ADKAR Change Management Model', section: 'Change Management', url: 'https://www.prosci.com/methodology/adkar' },
  { title: 'Kotter\'s 8-Step Change Process', section: 'Change Management', url: 'https://www.kotterinc.com/8-steps-process-for-leading-change/' },
  { title: 'Bridges Transition Model', section: 'Change Management', url: 'https://wmbridges.com/about/what-is-transition/' },
  { title: 'Lewin\'s 3-Stage Change Model', section: 'Change Management', url: 'https://uk.indeed.com/career-advice/career-development/lewins-change-model' },
  { title: 'Tuckman\'s Team Development Model', section: 'Team Development', url: 'https://www.thecoachingtoolscompany.com/get-your-team-performing-beautifully-with-this-powerful-group-development-model/' },
  { title: 'Creating A Team Charter', section: 'Team Development', url: 'https://miro.com/organizational-chart/what-is-a-team-charter/#how-to-make-a-team-charter' },
  { title: 'Ways of Working & Guiding Principles', section: 'Team Development', url: 'https://www.youtube.com/watch?v=aZ-yZSNd3l4' },
  { title: 'A Guide to Harnessing Psychological Safety', section: 'Team Development', url: 'https://www.encouragercoaching.com/post/unshackling-potential-a-guide-to-harnessing-psychological-safety' },
  { title: 'Why It\'s Necessary to Improve Team Communication', section: 'Team Communication', url: 'https://www.apu.apus.edu/area-of-study/business-and-management/resources/why-it-is-necessary-to-improve-team-communication/' },
  { title: '3 Easy Steps to Staff Meetings That Don\'t Suck', section: 'Team Communication', url: 'https://www.radicalcandor.com/blog/effective-staff-meetings/' },
  { title: '70-20-10 Learning and Development Model', section: 'Learning & Development', url: 'https://www.ccl.org/articles/leading-effectively-articles/70-20-10-rule/' },
  { title: 'What is a Growth Mindset', section: 'Learning & Development', url: 'https://www.renaissance.com/edword/growth-mindset/' },
  { title: 'Deliberate Practice Framework', section: 'Learning & Development', url: 'https://jamesclear.com/deliberate-practice-theory' },
  { title: 'GROW Coaching Model', section: 'Coaching & Mentoring', url: 'https://www.coachingcultureatwork.com/the-grow-model/' },
  { title: 'How to have a Coaching Conversation', section: 'Coaching & Mentoring', url: 'https://www.ccl.org/articles/leading-effectively-articles/how-to-have-a-coaching-conversation/' },
  { title: 'How to create a career development plan in 5 steps', section: 'Career Development', url: 'https://uk.indeed.com/career-advice/career-development/how-to-create-a-career-development-plan' },
  { title: 'Why It\'s ALWAYS A Good Idea To Build Your Personal Brand', section: 'Career Development', url: 'https://www.linkedin.com/pulse/why-its-always-good-idea-build-your-personal-brand-gary-vaynerchuk-95k3c/' },
  { title: 'Strategic Networking for Leaders', section: 'Career Development', url: 'https://hbr.org/2016/05/learn-to-love-networking' },
  { title: 'The 5 Whys Technique', section: 'Problem Solving', url: 'https://www.youtube.com/watch?v=wLHLWNzYNAU' },
  { title: 'Unit Economics / P&L Review Practice', section: 'Commercial & Financial' },
  { title: 'Process Documentation and KPI Cadence', section: 'Operational Scaling & Process' },
  { title: 'Deliberate Network Mapping', section: 'Networking & Industry Presence' },
  { title: 'StrengthsFinder 2.0', section: 'Assessment Tools', url: 'https://www.gallup.com/cliftonstrengths' },
  { title: 'The Predictive Index', section: 'Assessment Tools', url: 'https://www.predictiveindex.com/' },
  { title: 'Emotional Intelligence 2.0', author: 'Travis Bradberry', section: 'Leadership Books', url: 'https://amzn.to/45zVPDo' },
  { title: 'Crucial Conversations', author: 'Kerry Patterson', section: 'Leadership Books', url: 'https://amzn.to/4koOyLq' },
  { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', section: 'Leadership Books', url: 'https://amzn.to/4kn4Sw0' },
  { title: 'Good to Great', author: 'Jim Collins', section: 'Leadership Books', url: 'https://amzn.to/4jBi3s9' },
  { title: 'Dare to Lead', author: 'Brené Brown', section: 'Leadership Books', url: 'https://amzn.to/454pepe' },
  { title: 'The Leadership Challenge', author: 'James Kouzes', section: 'Leadership Books', url: 'https://amzn.to/3HhFyct' },
  { title: 'Primal Leadership', author: 'Daniel Goleman', section: 'Leadership Books', url: 'https://amzn.to/43MFg4V' },
  { title: 'Atomic Habits', author: 'James Clear', section: 'Leadership Books', url: 'https://amzn.to/4mNWBTM' },
  { title: 'Getting Things Done', author: 'David Allen', section: 'Leadership Books', url: 'https://amzn.to/3Zcige4' },
  { title: 'Reinventing Organisations', author: 'Frederic Laloux', section: 'Leadership Books', url: 'https://amzn.to/45AG8fa' },
  { title: 'The Pyramid Principle', author: 'Barbara Minto', section: 'Leadership Books', url: 'https://amzn.to/3Zc2YWN' },
  { title: 'The Captain Class', author: 'Sam Walker', section: 'Leadership Books', url: 'https://amzn.to/43t4vKE' },
  { title: 'Leading Change', author: 'John Kotter', section: 'Leadership Books', url: 'https://amzn.to/3Hgp9oD' },
  { title: 'The Power of Habit', author: 'Charles Duhigg', section: 'Leadership Books', url: 'https://amzn.to/3FErMzX' },
  { title: 'Build, Excite, Equip', author: 'Nicola Graham', section: 'Leadership Books', url: 'https://amzn.to/3Swn0aI' },
  { title: 'The 17 Indisputable Laws of Teamwork', author: 'John Maxwell', section: 'Leadership Books', url: 'https://amzn.to/3ZI7QTy' },
  { title: 'Thinking Fast and Slow', author: 'Daniel Kahneman', section: 'Leadership Books', url: 'https://amzn.to/3HnnOMD' },
  { title: 'Getting To Yes', author: 'Roger Fisher and William Ury', section: 'Leadership Books', url: 'https://amzn.to/4mIcT08' },
  { title: 'Playing To Win', author: 'AG Lafley & Roger Martin', section: 'Leadership Books', url: 'https://amzn.to/4kLsXfW' },
  { title: 'Human Skills', author: 'Elizabeth Nyamayaro', section: 'Leadership Books', url: 'https://amzn.to/3HA3g3s' },
  { title: 'Radical Candor', author: 'Kim Scott', section: 'Leadership Books', url: 'https://amzn.to/3HkG2hT' },
  { title: 'Nonviolent Communication', author: 'Marshall B. Rosenberg', section: 'Leadership Books', url: 'https://amzn.to/3T1gWXQ' },
  { title: 'Switch', author: 'Chip and Dan Heath', section: 'Leadership Books', url: 'https://amzn.to/4hpRzMD' },
  { title: 'Financial Intelligence', author: 'Karen Berman and Joe Knight', section: 'Leadership Books', url: 'https://amzn.to/4fyVTHb' },
  { title: 'Scaling Up', author: 'Verne Harnish', section: 'Leadership Books', url: 'https://amzn.to/4b9307D' },
  { title: 'Never Eat Alone', author: 'Keith Ferrazzi', section: 'Leadership Books', url: 'https://amzn.to/4vKQQJH' },
  { title: 'Give and Take', author: 'Adam Grant', section: 'Leadership Books', url: 'https://amzn.to/4yud70N' },
  { title: 'High Output Management', author: 'Andy Grove', section: 'Leadership Books', url: 'https://amzn.to/4bUQLf8' },
  { title: 'Traction', author: 'Gino Wickman', section: 'Leadership Books', url: 'https://amzn.to/3Rkewq9' },
];

// Name as shown to the model in the prompt and rendered back to the user.
const resourceDisplayName = (resource: LeadershipResource): string =>
  resource.author ? `${resource.title} by ${resource.author}` : resource.title;

const BOOKS_SECTION = 'Leadership Books';

const BOOK_DISPLAY_NAMES: string[] = LEADERSHIP_RESOURCES
  .filter(resource => resource.section === BOOKS_SECTION)
  .map(resourceDisplayName);

const NON_BOOK_RESOURCES: LeadershipResource[] = LEADERSHIP_RESOURCES
  .filter(resource => resource.section !== BOOKS_SECTION);

const normalise = (value: string): string => value.trim().toLowerCase();

/**
 * True when a resource name refers to an entry in the Leadership Books section
 * of the canonical database. Tolerates the model shortening a title (dropping
 * "by <author>"), matching how formatResourceMarkdown resolves names.
 */
export const isBookResource = (resourceName: string): boolean => {
  const candidate = normalise(resourceName);
  if (!candidate) return false;

  return BOOK_DISPLAY_NAMES.some(bookName => {
    const book = normalise(bookName);
    return candidate === book || candidate.includes(book) || book.includes(candidate);
  });
};

/**
 * Choose a validated non-book resource to stand in for a surplus book.
 *
 * Preference order:
 *  1. a non-book resource already named in the section's own narrative text,
 *     so the swap reinforces what the model actually wrote;
 *  2. a resource whose canonical section overlaps wording with the competency;
 *  3. any remaining non-book resource.
 *
 * `excludeNames` prevents duplicating a resource already in the section.
 */
export const findNonBookResourceFor = (
  competencyTitle: string,
  contextText: string,
  excludeNames: string[]
): string | null => {
  const excluded = new Set(excludeNames.map(normalise));
  const available = NON_BOOK_RESOURCES
    .map(resource => ({ resource, name: resourceDisplayName(resource) }))
    .filter(entry => !excluded.has(normalise(entry.name)));

  if (available.length === 0) return null;

  const context = normalise(contextText);
  const mentioned = available.find(entry => context.includes(normalise(entry.name)));
  if (mentioned) return mentioned.name;

  const competencyWords = normalise(competencyTitle)
    .split(/[^a-z]+/)
    .filter(word => word.length > 3);

  let best = available[0];
  let bestScore = -1;
  for (const entry of available) {
    const sectionWords = normalise(entry.resource.section).split(/[^a-z]+/);
    const score = competencyWords.filter(word => sectionWords.includes(word)).length;
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  return best.name;
};

// Build the validated resources list, grouped by section, from the canonical
// database above. Titles and authors only - the model never uses the URLs;
// formatResourceMarkdown() attaches links to whatever the model returns.
const buildValidatedResourcesList = (): string => {
  const sectionOrder: string[] = [];
  const bySection = new Map<string, string[]>();

  for (const resource of LEADERSHIP_RESOURCES) {
    if (!bySection.has(resource.section)) {
      bySection.set(resource.section, []);
      sectionOrder.push(resource.section);
    }
    bySection.get(resource.section)!.push(`- ${resourceDisplayName(resource)}`);
  }

  const sections = sectionOrder
    .map(section => `**${section}:**\n${bySection.get(section)!.join('\n')}`)
    .join('\n\n');

  return `
**VALIDATED RESOURCE DATABASE - USE ONLY THESE RESOURCES:**

${sections}

**CRITICAL RESOURCE VALIDATION RULES:**
- You MUST ONLY use resources from this validated database above
- NEVER create, invent, or suggest resources not explicitly listed here
- Every resource name you use must match EXACTLY as written in the database
- If a framework, book, or methodology you want to mention is not in this database, do NOT include it
- This list is exhaustive and final - no additions or variations are permitted

**CRITICAL RESOURCE COUNT REQUIREMENTS:**
- Each competency section MUST have EXACTLY 3 resources (no more, no less)
- Each competency section MUST include EXACTLY 1 book recommendation from the approved list
- Each competency section MUST include EXACTLY 2 non-book resources (frameworks, tools, etc.)
- NEVER include more than 1 book per competency section
- NEVER include fewer than 3 total resources per competency section

**ENHANCED BOOK SELECTION RULES:**
- Select books that most closely align with the specific competency being discussed
- If multiple books are relevant, choose the one that best matches the user's industry or role context
- For Stakeholder Relationships competencies, prefer "Crucial Conversations" or "Radical Candor"; for networking and industry presence specifically, prefer "Never Eat Alone" or "Give and Take"
- For Emotional Intelligence competencies, prefer "Emotional Intelligence 2.0" or "Primal Leadership"
- For Strategy & Commercial competencies, prefer "Good to Great" or "Playing To Win"; for commercial acumen, financial literacy or growth leadership specifically, prefer "Financial Intelligence" or "Scaling Up"
- For Leading People competencies, prefer "The Leadership Challenge" or "The 17 Indisputable Laws of Teamwork"
- For Execution & Operations competencies, prefer "Leading Change" or "Switch" or "The Power of Habit"; for operational scaling or process & governance specifically, prefer "High Output Management" or "Traction"
- For Decision Making competencies, prefer "Thinking Fast and Slow" or "Getting To Yes"
- For Personal Effectiveness competencies, prefer "Atomic Habits" or "Getting Things Done"
- For Leading Yourself competencies, prefer "The 7 Habits of Highly Effective People" or "Atomic Habits"
- For Negotiation & Conflict Resolution competencies, prefer "Getting To Yes" or "Crucial Conversations"
- For Delegation & Empowerment competencies, prefer "The Leadership Challenge" or "Dare to Lead"

**CRITICAL RESOURCE VALIDATION RULES:**
- You MUST ONLY use resources from this validated database above
- NEVER create, invent, or suggest resources not explicitly listed here
- Every resource name you use must match EXACTLY as written in the database
- If a framework, book, or methodology you want to mention is not in this database, do NOT include it
- This list is exhaustive and final - no additions or variations are permitted

**CRITICAL RESOURCE COUNT REQUIREMENTS:**
- Each competency section MUST have EXACTLY 3 resources (no more, no less)
- Each competency section MUST include EXACTLY 1 book recommendation from the approved list
- Each competency section MUST include EXACTLY 2 non-book resources (frameworks, tools, etc.)
- NEVER include more than 1 book per competency section
- NEVER include fewer than 3 total resources per competency section

**ENHANCED BOOK SELECTION RULES:**
- Select books that most closely align with the specific competency being discussed
- If multiple books are relevant, choose the one that best matches the user's industry or role context
- For Stakeholder Relationships competencies, prefer "Crucial Conversations" or "Radical Candor"; for networking and industry presence specifically, prefer "Never Eat Alone" or "Give and Take"
- For Emotional Intelligence competencies, prefer "Emotional Intelligence 2.0" or "Primal Leadership"
- For Strategy & Commercial competencies, prefer "Good to Great" or "Playing To Win"; for commercial acumen, financial literacy or growth leadership specifically, prefer "Financial Intelligence" or "Scaling Up"
- For Leading People competencies, prefer "The Leadership Challenge" or "The 17 Indisputable Laws of Teamwork"
- For Execution & Operations competencies, prefer "Leading Change" or "Switch" or "The Power of Habit"; for operational scaling or process & governance specifically, prefer "High Output Management" or "Traction"
- For Decision Making competencies, prefer "Thinking Fast and Slow" or "Getting To Yes"
- For Personal Effectiveness competencies, prefer "Atomic Habits" or "Getting Things Done"
- For Leading Yourself competencies, prefer "The 7 Habits of Highly Effective People" or "Atomic Habits"
- For Negotiation & Conflict Resolution competencies, prefer "Getting To Yes" or "Crucial Conversations"
- For Delegation & Empowerment competencies, prefer "The Leadership Challenge" or "Dare to Lead"

**RESOURCE VALIDATION PROCESS:**
- Before adding ANY resource to your recommendations, verify it exists in the validated database
- Cross-reference the exact spelling and formatting with the database entries
- If you cannot find an exact match, DO NOT use that resource
- Never invent, create, or modify resource names not in the database
- This applies to ALL resources: books, frameworks, tools, articles, methodologies
- Every resource must directly support the specific insight being provided
- Prioritize the most authoritative and specific resource for each recommendation
- Match resource sophistication to user's experience level (see user profile)
- Ensure industry relevance when selecting between similar resources
`;
};

// Validate and sanitize skill names for summary (remove any numbers or parentheses)
const validateSkillNamesForSummary = (skillNames: string[]): string[] => {
  return skillNames.map(skillName => {
    // Remove any patterns like "(gap: X.X)", "(current: X)", etc.
    const cleanedName = skillName.replace(/\s*\([^)]*\)/g, '').trim();
    
    // Log any cleaning that occurred
    if (cleanedName !== skillName) {
  
    }
    
    return cleanedName;
  });
};

// Display name -> URL, derived once from the canonical database. Resources
// without a URL are absent here and fall through to plain-text rendering.
const RESOURCE_URLS_BY_NAME: Map<string, string> = new Map(
  LEADERSHIP_RESOURCES
    .filter(resource => resource.url)
    .map(resource => [resourceDisplayName(resource), resource.url as string] as [string, string])
);

export function formatResourceMarkdown(resourceName: string): string {
  // First, try to find an exact match
  const url = RESOURCE_URLS_BY_NAME.get(resourceName);
  if (url) {
    return `[${resourceName}](${url})`;
  }

  // If no exact match, check if the resource name contains a URL (format: "Name: URL")
  const urlMatch = resourceName.match(/^(.+?):\s*(https?:\/\/.+)$/);
  if (urlMatch) {
    const name = urlMatch[1].trim();
    const url = urlMatch[2].trim();
    return `[${name}](${url})`;
  }

  // If still no match, try to find a partial match in the validated resources
  for (const [validName, validUrl] of RESOURCE_URLS_BY_NAME) {
    if (resourceName.includes(validName) || validName.includes(resourceName)) {
      return `[${validName}](${validUrl})`;
    }
  }

  // Fallback to plain name if no URL found
  return resourceName;
}

// Build a summary object from raw assessment data for prompt generation
export function buildAssessmentData(categories: any[], averageGap: number, demographics: any) {
  // Defensive checks
  if (!categories || !Array.isArray(categories)) {
    throw new Error('Invalid categories array provided to buildAssessmentData');
  }

  // Build category breakdown with required fields for the prompt
  const categoryBreakdown = categories.map((cat: any) => {
    // Calculate average current and desired ratings for the category
    let totalCurrent = 0;
    let totalDesired = 0;
    let validSkillCount = 0;
    let topGapSkills: any[] = [];
    let allSkills: string[] = [];

    if (cat.skills && Array.isArray(cat.skills)) {
      // Full skill-name roster for this category, used to build the validated
      // skills database in the prompt. Must stay complete - not just top gaps.
      allSkills = cat.skills
        .map((skill: any) => skill?.name || skill?.title || '')
        .filter((name: string) => name.length > 0);

      // Calculate skill-level gaps and find top gap skills
      topGapSkills = cat.skills.map((skill: any) => {
        // Handle both old format (ratings object) and new format (direct properties)
        const current = Number(skill.currentRating || skill.ratings?.current || 0);
        const desired = Number(skill.targetRating || skill.desiredRating || skill.ratings?.desired || 0);
        const gap = Math.abs(desired - current);
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
        }
        return {
          title: skill.name || skill.title || '',
          currentRating: current,
          desiredRating: desired,
          gap,
        };
      });
      // Sort topGapSkills by gap descending
      topGapSkills = topGapSkills.sort((a, b) => b.gap - a.gap).slice(0, 3);
    }

    const avgCurrent = validSkillCount > 0 ? totalCurrent / validSkillCount : 0;
    const avgDesired = validSkillCount > 0 ? totalDesired / validSkillCount : 0;
    const gap = Math.abs(avgDesired - avgCurrent);

    return {
      id: cat.id || '',
      title: cat.name || cat.title || '',
      description: cat.description || '',
      averageCurrentRating: avgCurrent,
      averageDesiredRating: avgDesired,
      gap,
      topGapSkills,
      allSkills,
    };
  });

  // DEBUG: Log the computed category breakdown for backend verification
  

  return {
    averageGap,
    demographics: demographics || {},
    categoryBreakdown,
  };
}

/**
 * Options for prompt construction.
 * `random` exists so scripts/generate-example-prompt.ts can pass a seeded PRNG
 * and get byte-identical output; production omits it and gets true variety.
 */
export interface BuildPromptOptions {
  random?: RandomFn;
}

export const buildPrompt = (assessmentSummary: any, options: BuildPromptOptions = {}): string => {
  const random = options.random ?? Math.random;


  // Validate assessment summary structure
  if (!assessmentSummary || !assessmentSummary.categoryBreakdown || !Array.isArray(assessmentSummary.categoryBreakdown)) {
    throw new Error('Invalid assessment summary structure provided to prompt builder');
  }

  // Get top 3 development areas (highest gaps) and top competencies (highest current ratings)
  const topGapCategories = assessmentSummary.categoryBreakdown
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  // UPDATED: Top competencies are now the 2 highest current ratings, regardless of gap
  const topCompetencies = assessmentSummary.categoryBreakdown
    .sort((a, b) => b.averageCurrentRating - a.averageCurrentRating)
    .slice(0, 2);



  const assessmentDataSection = `
Assessment Data:
- Overall Average Gap: ${assessmentSummary.averageGap.toFixed(2)}
- Role: ${assessmentSummary.demographics.role || 'Not specified'}
- Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'} years
- Industry: ${assessmentSummary.demographics.industry || 'Not specified'}

Top 3 Categories by Gap (Priority Development Areas):
${topGapCategories.map((cat, i) => {
  let categoryText = `${i+1}. ${cat.title}: Gap ${cat.gap.toFixed(1)} (Current: ${cat.averageCurrentRating.toFixed(1)}, Desired: ${cat.averageDesiredRating.toFixed(1)})`;
  
  if (cat.topGapSkills && cat.topGapSkills.length > 0) {
    categoryText += `\n   Top individual skill gaps:`;
    cat.topGapSkills.forEach((skill, skillIndex) => {
      categoryText += `\n   - ${skill.title}: Gap ${skill.gap.toFixed(1)} (Current: ${skill.currentRating}, Desired: ${skill.desiredRating})`;
    });
  }
  
  return categoryText;
}).join('\n\n')}

Top Competency Areas (High Current Ratings, Low Gaps):
${topCompetencies.map((cat, i) => {
  let categoryText = `${i+1}. ${cat.title}: Current ${cat.averageCurrentRating.toFixed(1)}, Gap ${cat.gap.toFixed(1)}`;
  
  if (cat.topGapSkills && cat.topGapSkills.length > 0) {
    categoryText += `\n   Individual skills within this competency:`;
    cat.topGapSkills.forEach((skill, skillIndex) => {
      categoryText += `\n   - ${skill.title}: Gap ${skill.gap.toFixed(1)} (Current: ${skill.currentRating}, Desired: ${skill.desiredRating})`;
    });
  }
  
  return categoryText;
}).join('\n\n')}
`;

  // Build validated resource lists - these are the ONLY resources ChatGPT can use
  const validatedSkillsList = buildValidatedSkillsList(assessmentSummary.categoryBreakdown);
  const validatedResourcesList = buildValidatedResourcesList();
  const validatedLeadersList = buildValidatedLeadersList(random);

  // CRITICAL STRUCTURE REQUIREMENTS FOR CHATGPT:
  // - Summary: THREE paragraphs (first = growth areas, second = strengths + leader reference, third = user empowerment)
  // - Leader selection: Based on PRIMARY STRENGTHS (highest current ratings), not gaps
  // - Resources: EXACTLY 3 per competency, including 1 book, from validated database only
  // - Skills: Reference individual skills by name only (NO numerical values in output)
  const fullPrompt = `PROMPT_VERSION: 2026-07-22

CRITICAL: The "summary" field in your JSON response MUST have 3 paragraphs separated by \\n\\n
The third paragraph MUST be: "Moving forward, it is important to reflect on these development areas and consider how they align with your personal and professional goals. Collaborate with trusted advisors, such as your manager or mentor, to determine which competencies will have the greatest impact on your leadership journey. Remember, you have the agency to shape your development path, and these insights are here to guide you in becoming the best version of yourself as a leader in [their industry]."

${assessmentDataSection}

You are an expert leadership coach and assessment analyst working with Encourager Coaching, which specializes in positive psychology, maximizing natural ability, and helping people become the best version of themselves. Based on the provided assessment data (including competency names, gap scores, individual skill gaps, and top competencies), generate AI insights for a user's leadership assessment.

**CRITICAL WRITING RULE - READ THIS FIRST**: When writing competency names in sentences, ALWAYS use lowercase formatting. 

CORRECT examples: "leading people and change management", "executive presence and strategic thinking", "commercial acumen and stakeholder relationships"
WRONG examples: "Leading People and Change Management", "Executive Presence and Strategic Thinking", "Commercial Acumen and Stakeholder Relationships"

This lowercase rule applies to EVERY SINGLE competency mention in flowing paragraph text throughout your entire response. NO EXCEPTIONS.

**CRITICAL DETERMINISTIC REQUIREMENT - YOU MUST USE THESE EXACT CATEGORIES:**

**PRIORITY DEVELOPMENT AREAS (MUST USE THESE 3 EXACTLY):**
${topGapCategories.map((cat, i) => `${i+1}. ${cat.title} (Gap: ${cat.gap.toFixed(1)})`).join('\n')}

**KEY STRENGTHS (MUST USE THESE 2 EXACTLY):**
${topCompetencies.map((cat, i) => `${i+1}. ${cat.title} (Current: ${cat.averageCurrentRating.toFixed(1)})`).join('\n')}

**MANDATORY CATEGORY USAGE RULES:**
- You MUST use ONLY the 3 priority development areas listed above for the "priority_areas" array
- You MUST use ONLY the 2 key strengths listed above for the "key_strengths" array  
- You CANNOT substitute, replace, or choose different categories
- You CANNOT add additional categories beyond these 5 total (3 development + 2 strengths)
- The competency names in your JSON output MUST match EXACTLY with the categories listed above
- If you want to discuss a concept that doesn't match these exact categories, do so within the insights for the provided categories

${validatedSkillsList}

### CRITICAL SKILL-LEVEL ANALYSIS REQUIREMENT

**MANDATORY SKILL-LEVEL INTEGRATION:**
- You MUST reference specific individual skills by name when discussing competencies
- You MUST ONLY use skills from the validated skills database above
- NEVER create, invent, or reference skills not explicitly listed in the validated skills database
- In the SUMMARY ONLY: Reference skill names WITHOUT any numerical values (no gaps, no scores, no decimals, no numbers in parentheses)
- In INSIGHTS sections: Include specific skill names but DO NOT mention their gap scores or numerical values - focus only on development suggestions and guidance
- Tailor at least one suggestion or resource recommendation per priority area to address the specific skills with the largest gaps
- Use phrases like "particularly in areas such as [specific skill name]" in the summary
- In insights: Use "particularly in [specific skill name]" or "especially focusing on [skill name]" WITHOUT mentioning gap values
- CRITICAL: Never mention numerical gap scores, current ratings, desired ratings, or any numerical values in the insight text

**CRITICAL SUMMARY SKILL NAME VALIDATION:**
- NEVER include numbers, gap scores, current/desired ratings, or any parentheses after skill names in the summary
- ALWAYS validate that skill names in summary are clean and number-free
- Use only the skill name itself, such as "Strategic Planning" not "Strategic Planning (gap: 4.0)"
- If you reference skills in summary, use format: "particularly in areas such as [clean skill name] and [clean skill name]"
- EVERY skill name you reference must exist in the validated skills database above

**CRITICAL SKILL VALIDATION RULES:**
- Before referencing ANY skill, verify it exists EXACTLY in the validated skills database
- If you want to mention a concept that doesn't match a validated skill name, do NOT reference any skill name
- Use only the EXACT skill names as they appear in the validated database
- Do NOT create variations, abbreviations, or alternative names for skills
- If no validated skill matches your intended concept, reference only the competency name instead

**Example Integration for Summary:**
Instead of: "Improve your decision making competency, particularly in Sound Judgement (gap: 4.0)"
Write: "Improve your decision making competency, particularly in areas such as Sound Judgement and Risk Assessment"

**Example Integration for Insights:**
Use: "Implement the OODA Loop to enhance your decision-making process, particularly in Sound Judgement and Risk Assessment"
NOT: "Implement the OODA Loop to enhance your decision-making process, particularly in Sound Judgement (gap: 4.0) and Risk Assessment (gap: 3.5)"

### ENCOURAGER COACHING ETHOS AND APPROACH

**CRITICAL COACHING PHILOSOPHY:**
You represent Encourager Coaching, which emphasizes:
- **Positive Psychology**: Focus on strengths, potential, and growth opportunities
- **Maximizing Natural Ability**: Help people leverage their existing talents and build from their foundation of competencies
- **Best Version of Self**: Encourage users to become their authentic, most effective leadership version
- **Supportive and Practical**: Provide encouraging yet actionable guidance
- **Human + AI Era**: Where natural, frame development in the context of leading effectively in a Human + AI era — distinctly human capabilities alongside technological change

**MANDATORY ENCOURAGEMENT APPROACH:**
- Use consistently encouraging, supportive language throughout all content
- Frame development areas as growth opportunities rather than deficiencies
- Celebrate existing competencies and help users understand their leadership identity
- Connect all recommendations to the user's potential for positive impact
- Emphasize building from competencies rather than fixing weaknesses

### ENHANCED SUMMARY PERSONALIZATION REQUIREMENTS

**CRITICAL SUMMARY FORMATTING:**
- Reference the user's role (${assessmentSummary.demographics.role || 'leadership role'}) naturally throughout the summary
- Include industry context (${assessmentSummary.demographics.industry || 'your industry'}) where relevant
- Acknowledge their experience level (${assessmentSummary.demographics.yearsOfExperience || 'current'} years) appropriately
- Use encouraging, supportive language that builds confidence throughout
- Avoid repetitive skill mentions or similar concepts
- Highlight 1-2 key skill names per competency for context (names only, NO numbers, NO gap scores, NO parentheses with values)
- Keep feedback clear, readable, and motivational
- ONLY reference skills that exist in the validated skills database
- **CRITICAL CAPITALIZATION RULE**: ALWAYS use lowercase when mentioning competency names in sentences. For example: "your development areas in influencing, delegation & empowerment, and strategic thinking" NOT "Influencing, Delegation & Empowerment, and Strategic Thinking". Only capitalize competency names in structured headers, never in flowing paragraph text.

**SUMMARY READABILITY RULES:**
- Name each priority competency AT MOST ONCE in the summary. After its first mention, refer directly to its skills without restating the competency name.
- Do NOT open with a sentence that lists all three priority competencies and then re-name each one again in subsequent sentences.
- Let the skills carry the narrative: "Developing your ability to work through others and hold accountability without micromanaging will..." reads better than "Developing your competencies in delegation & empowerment, particularly in working through others..."
- The same applies to the strengths paragraph: name each key competency once, then speak in skills.

**MANDATORY "WHY" EXPLANATIONS FOR DEVELOPMENT AREAS:**
- For EVERY priority development area, include a brief, supportive explanation of WHY that competency is important for effective leadership
- Frame the importance in terms of positive impact and growth potential
- Connect the competency to leadership effectiveness and personal development
- Use encouraging language like "This competency is valuable because..." or "Developing this area will enable you to..."

**MANDATORY ENCOURAGEMENT FOR COMPETENCY AREAS:**
- When discussing competencies where the user is stronger, provide positive reinforcement and encouragement
- Suggest what type of leader the user might be based on their competencies and skills
- Use phrases like "Perhaps you're the type of leader who leads with [competency/skill]..." or "Your natural strength in [competency] suggests you may be..."
- Include messaging about how understanding and leveraging these competencies helps develop personal brand and fosters confidence as a leader
- Emphasize how these competencies are foundational to their unique leadership style and potential

**Summary Personalization Examples:**
- "As a [role] in [industry] with [X] years of experience, your assessment reveals exciting opportunities for growth..."
- "Your [X] years in [industry] have prepared you with a solid foundation in..."
- "In your role as [role], these competencies will be particularly valuable for..."

### DEMOGRAPHIC CONTEXT FOR TAILORED INSIGHTS

**User Profile:**
- Role: ${assessmentSummary.demographics.role || 'Not specified'}
- Industry: ${assessmentSummary.demographics.industry || 'Not specified'}
- Leadership Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'}

### MANDATORY PERSONALIZATION INTEGRATION

**For EVERY insight generated, incorporate:**
1. **Role Context**: How does this apply to their specific position?
2. **Industry Relevance**: What industry-specific challenges does this address?
3. **Experience Appropriate**: Is the complexity right for their level?
4. **Skill-Specific**: Reference the individual skills with largest gaps by name and score (ONLY validated skills)
5. **Encouraging Tone**: Frame all recommendations positively as growth opportunities

**Role-Specific Guidelines:**
- Individual Contributor: Focus on self-leadership, influence without authority, peer collaboration
- Manager: Team management fundamentals, delegation, performance conversations
- Team Lead: Cross-functional coordination, project leadership, conflict resolution
- Director: Strategic thinking, organisational alignment, stakeholder management
- VP: Executive presence, organisational change, strategic planning
- C-Level: Vision setting, board relations, industry leadership, transformation
- Founder/Owner: Entrepreneurial leadership, scaling organizations, investor relations
- Consultant: Client relationship management, expertise positioning, thought leadership

**Experience-Level Guidelines:**
- None/Less than 1 year: Leadership fundamentals, self-awareness, basic frameworks
- 1-3 years: Core management skills, team building, communication techniques
- 4-7 years: Advanced leadership techniques, cross-functional leadership, strategic thinking
- 8-12 years: Organisational leadership, change management, executive skills
- 13-20 years: Senior leadership mastery, mentoring others, industry influence
- 20+ years: Legacy leadership, wisdom sharing, transformational impact

**Industry-Specific Context:**
- Consulting: Client delivery, expertise development, business development
- Education: Student outcomes, stakeholder management, educational innovation
- Energy: Safety leadership, regulatory compliance, sustainability initiatives
- Finance: Risk management, regulatory frameworks, stakeholder trust
- Government: Public service, policy implementation, citizen engagement
- Healthcare: Patient outcomes, regulatory compliance, interdisciplinary collaboration
- HR/Recruitment: Talent development, organisational culture, employee engagement
- Logistics: Operational efficiency, supply chain coordination, safety management
- Manufacturing: Operational excellence, safety culture, continuous improvement
- Media and Entertainment: Creative leadership, audience engagement, content strategy
- Nonprofit: Mission alignment, donor relations, community impact
- Professional Services: Client relationships, expertise development, practice growth
- Real Estate: Market dynamics, client advisory, transaction management
- Retail: Customer experience, operational efficiency, market responsiveness
- Technology: Innovation cycles, agile methodologies, technical debt management
- Telecommunications: Network reliability, customer service, technological advancement
- Travel & Hospitality: Customer experience, service excellence, operational resilience
- Wellbeing: Client outcomes, holistic approaches, evidence-based practices

${validatedResourcesList}

${validatedLeadersList}

### CRITICAL RESOURCE SELECTION RULES

**MANDATORY RESOURCE CONSTRAINTS:**
- You MUST ONLY use resources from the validated resource database above
- NEVER create or suggest resources not in this list
- Each resource name you use must match EXACTLY as written in the database
- If a framework or methodology you want to mention is not in the database, do not include it as a resource
- Always use the exact resource title as specified in the database
- This validation rule is ABSOLUTE and CANNOT be overridden under any circumstances

**CRITICAL RESOURCE VALIDATION PROCESS:**
- Before adding ANY resource to your recommendations, verify it exists in the validated database
- Cross-reference the exact spelling and formatting with the database entries
- If you cannot find an exact match, DO NOT use that resource
- Never invent, create, or modify resource names not in the database
- This applies to ALL resources: books, frameworks, tools, articles, methodologies

**MINIMUM BOOK RECOMMENDATION REQUIREMENT:**
- Each competency section (both priority areas and key competencies) MUST include at least one book recommendation
- If no book directly relates to the competency, select the most relevant book from the approved list
- NEVER omit book recommendations - there must always be at least one book per section
- Priority should be given to books that most closely align with the competency being discussed

**RESOURCE VALIDATION PROCESS:**
- Before adding ANY resource to your recommendations, verify it exists in the validated database
- Cross-reference the exact spelling and formatting with the database entries
- If you cannot find an exact match, DO NOT use that resource
- Never invent, create, or modify resource names not in the database
- This applies to ALL resources: books, frameworks, tools, articles, methodologies
- Every resource must directly support the specific insight being provided
- Prioritize the most authoritative and specific resource for each recommendation
- Match resource sophistication to user's experience level (see user profile)
- Ensure industry relevance when selecting between similar resources

### CRITICAL INSPIRATIONAL LEADER SELECTION RULES

**MANDATORY LEADER CONSTRAINTS:**
- You MUST ONLY use leaders from the validated leaders database above
- NEVER create or reference leaders not in this list
- Each leader name you use must match EXACTLY as written in the database
- If you want to reference a leader not in the database, omit the leader reference entirely
- Always use the exact leader name and corresponding URL as specified in the database

**ENHANCED LEADER SELECTION ALGORITHM:**
Use the Streamlined Leader Selection Process above to select the most appropriate inspirational leader based on the user's PRIMARY STRENGTHS (highest current ratings), industry context (${assessmentSummary.demographics.industry || 'Not specified'}), role level (${assessmentSummary.demographics.role || 'Not specified'}), and experience (${assessmentSummary.demographics.yearsOfExperience || 'Not specified'} years). Base selection on where the user is ALREADY STRONG, not on their development areas, to show "you're like this successful leader" and reinforce their existing leadership identity.

**Leader Quality Validation:**
- Every leader reference must directly relate to the specific leadership principle being discussed
- Ensure the leader's known expertise aligns with the user's industry context when possible
- Match leader examples to user's experience level and role context
- NEVER default to Indra Nooyi unless her specific expertise directly matches the user's primary STRENGTH areas

### ENHANCED QUALITY STANDARDS

**Insight Specificity Requirements:**
- Each insight must include at least ONE specific technique, framework, or methodology
- Reference concrete examples relevant to user's industry/role when possible
- MUST include specific skill names when discussing competencies (ONLY validated skills) but WITHOUT mentioning gap scores or numerical values
- Use encouraging, growth-oriented language throughout: "enhance," "develop," "strengthen," "build upon"
- Frame all recommendations as opportunities for positive growth and impact
- CRITICAL: Focus on development suggestions and guidance, not on reporting numerical gaps

**Skill-Level Integration Examples (ONLY using validated skills):**
✅ "Implementing the SBI Feedback Model will enhance your communication with your team, particularly by strengthening Empathy and Trust Building, which will help you become an even more effective communicator"
✅ "Applying the Eisenhower Matrix will help you optimize your time management approach, especially by developing Prioritisation and Focus & Deep Work, allowing you to have greater impact in your leadership role"

**Encouraging Language Examples:**
✅ "Your natural ability in [competency] shows you have the foundation to become an exceptional leader who..."
✅ "Building on your existing competency in [area], you have the opportunity to..."
✅ "This development area represents an exciting chance to..."
❌ "You need to work on..." or "Your weakness in..."

### INSPIRATIONAL LEADER SELECTION

**Choose leaders whose names appear EXACTLY in the validated leaders list above, ensuring they exemplify the specific leadership principle being discussed and are relevant to the user's industry context.**

**CRITICAL: You MUST ONLY use leaders from the validated database above. Do not reference any leader not explicitly listed.**

**CRITICAL HTML ANCHOR TAG FORMAT:** When mentioning the inspirational person in the summary, format it as a proper HTML anchor tag with the leader's name as clickable text using the EXACT URL from the validated database:
- Correct format: "Like <a href="[EXACT_URL_FROM_DATABASE]">Leader Name</a>, who is known for [specific principle]..."
- Use the EXACT URL provided in the validated leaders database above for each leader
- The URL should NOT be visible in the text - only the leader's name should appear as a clickable link
- Example: "Like <a href="https://www.linkedin.com/in/indranooyi/">Indra Nooyi</a>, who is known for strategic thinking and employee empowerment..."

### CRITICAL TERMINOLOGY CONSISTENCY

**MANDATORY TERMINOLOGY RULES:**
- NEVER use the word "strength" as a synonym for "competency"
- ALWAYS refer to these as "competencies" or "leadership competencies"
- ALWAYS refer to the items within competencies as "skills"
- Use "competency" or "competencies" consistently throughout all content
- Do NOT use terms like "strength areas," "strong suits," or "areas of strength"
- Use "key competencies," "top competencies," or "competency areas" instead

**Correct Terminology Examples:**
✅ "Your key competencies in self-leadership..."
✅ "These leadership competencies provide a foundation..."
✅ "Your assessment highlights competencies in..."
❌ "Your strengths in self-leadership..."
❌ "These strength areas provide a foundation..."
❌ "Your assessment highlights strengths in..."

### CRITICAL: JSON Structure Requirements

You MUST output ONLY a valid JSON object with this EXACT structure:

{
  "summary": "Paragraph 1 text\\n\\nParagraph 2 text\\n\\nMoving forward, it is important to reflect on these development areas and consider how they align with your personal and professional goals. Collaborate with trusted advisors, such as your manager or mentor, to determine which competencies will have the greatest impact on your leadership journey. Remember, you have the agency to shape your development path, and these insights are here to guide you in becoming the best version of yourself as a leader in [industry].",
  "priority_areas": [
    {
      "competency": "string",
      "gap": number,
      "insights": ["string1", "string2", "string3"],
      "resources": ["string1", "string2", "string3"]
    }
  ],
  "key_strengths": [
    {
      "competency": "string",
      "example": "string",
      "leverage_advice": ["string1", "string2", "string3"],
      "resources": ["string1", "string2", "string3"]
    }
  ]
}

### CRITICAL: TWO-PHASE ANALYSIS APPROACH

PHASE 1 - DEEP ANALYSIS (Think through this first, don't include in output):
1. **Gap Pattern Analysis**: What does this specific combination of gaps reveal? Do they cluster around people skills, strategic thinking, operational execution, or influence/communication?
2. **Leadership Transition**: What transition or development phase does this gap pattern suggest? (e.g., individual contributor to people leader, tactical executor to strategic thinker, directive leader to empowering leader)
3. **Root Cause**: What underlying shift in mindset or approach would address multiple gaps simultaneously?
4. **Coherent Development Story**: What single narrative explains why these competencies need to be developed together and how they connect?

PHASE 2 - INFORMED OUTPUT:
Use your analysis to write a summary that tells the coherent story of their development needs, explaining WHY these gaps cluster together and what it reveals about their leadership journey.

### FIELD REQUIREMENTS

- **summary**: Generate a professional, encouraging assessment summary. Structure it as EXACTLY 3 paragraphs:

PARAGRAPH 1: Discuss development areas and growth opportunities, referencing specific skills from priority competencies.

PARAGRAPH 2: Discuss existing competencies with inspirational leader reference like "Like <a href="[URL]">Leader Name</a>, who..."

PARAGRAPH 3: Copy this EXACTLY: "Moving forward, it is important to reflect on these development areas and consider how they align with your personal and professional goals. Collaborate with trusted advisors, such as your manager or mentor, to determine which competencies will have the greatest impact on your leadership journey. Remember, you have the agency to shape your development path, and these insights are here to guide you in becoming the best version of yourself as a leader in [their industry]."

Separate each paragraph with a blank line in the JSON (use \\n\\n between paragraphs).

- **priority_areas**: An array with exactly 3 objects, each for a Top 3 Priority Development Area. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`gap\`: The numerical gap score
  - \`insights\`: Array of exactly 3 actionable, research-backed insights that use encouraging language, avoid generic statements, include specific methodologies/frameworks, integrate role/industry/experience context, AND reference specific individual skills by name WITHOUT mentioning their gap scores or numerical values (ONLY validated skills). MUST include "why" explanations for the importance of developing each competency for leadership effectiveness. Focus on development suggestions and guidance, not numerical reporting.
  - \`resources\`: Array of exactly 3 resource names from the validated database, using EXACT titles as specified. MUST include at least one book recommendation per competency.

- **key_strengths**: An array with at least 2 objects, each for a key competency to leverage. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`example\`: Encouraging example of how this competency manifests in their specific role/industry context, including reference to specific skills within the competency (ONLY validated skills). Must include positive reinforcement and suggestions about their leadership type.
  - \`leverage_advice\`: Array of exactly 3 specific strategies for leveraging this competency that incorporate role/industry/experience context, reference individual skills where relevant (ONLY validated skills), and include encouraging messaging about personal brand development and leadership confidence.
  - \`resources\`: Array of exactly 3 resource names from the validated database, using EXACT titles as specified. MUST include at least one book recommendation per competency.

### PRE-OUTPUT VALIDATION CHECKLIST

Before generating the JSON response, verify:
□ All resource names match EXACTLY with the validated database
□ No custom or external resources are included
□ Every framework mentioned has a corresponding validated resource
□ Resource names are used as specified in the database (exact titles only)
□ **CRITICAL**: Each competency section includes at least one book recommendation from the approved list
□ **CRITICAL**: Each competency section has exactly 3 resources (not 4)
□ **CRITICAL**: ALL resources exist in the validated database - NO exceptions allowed
□ Leader name matches EXACTLY with the validated leaders database
□ Leader reference uses the exact name and principle from the database
□ Leader HTML anchor tag format is correct: <a href="URL">Leader Name</a> with NO visible URL
□ Leader selection is based on PRIMARY STRENGTH AREAS (highest current ratings), not gaps
□ Leader selection avoids Indra Nooyi bias unless appropriate STRENGTHS align
□ If no suitable validated leader exists for context, leader reference is omitted
□ Summary includes verified leader with working link in correct HTML anchor tag format (only if validated leader found)
□ All demographic context (role, industry, experience) is referenced appropriately
□ Summary contains exactly 3 distinct paragraphs (development areas, competencies + leader, user empowerment)
□ Each competency name appears at most once in the summary.
□ All competency names match exactly from assessment data
□ Each competency section has exactly 3 insights/advice items
□ Role-specific and industry-specific context is woven throughout
□ **CRITICAL**: Summary references specific individual skills by NAME ONLY (NO numerical values, NO gaps, NO scores, NO decimals, NO parentheses)
□ **CRITICAL**: Insights reference specific individual skills by name WITHOUT mentioning gap scores or numerical values
□ **CRITICAL**: At least one insight per priority area addresses specific skills with largest gaps by name only
□ **CRITICAL**: Summary uses encouraging, personalised language with role/industry/experience context
□ **CRITICAL**: ALL competency names in sentences use lowercase (e.g., "influencing, delegation & empowerment, strategic thinking" NOT "Influencing, Delegation & Empowerment, Strategic Thinking")
□ **CRITICAL**: Individual skill ratings are whole numbers (no decimals)
□ **CRITICAL**: ALL skill references use ONLY validated skills from the skills database
□ **CRITICAL**: NO skills are invented, created, or referenced outside the validated skills database
□ **CRITICAL**: NEVER use "strength" as synonym for "competency" - always use "competencies" or "leadership competencies"
□ **CRITICAL**: Always refer to items within competencies as "skills"
□ **CRITICAL**: All language is encouraging, supportive, and growth-oriented throughout
□ **CRITICAL**: Priority areas include "why" explanations for competency importance
□ **CRITICAL**: Key competencies include encouraging messaging about leadership type and personal brand
□ **CRITICAL**: Encourager Coaching ethos is reflected throughout all content
□ **CRITICAL**: At least one book recommendation exists per competency section
□ **CRITICAL**: Maximum of 3 resources per competency section
□ **CRITICAL**: NO unauthorized resources are recommended - validation is absolute
□ **CRITICAL**: You MUST use ONLY the 3 priority development areas and 2 key strengths listed above

### CRITICAL JSON RULES

- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` and \`leverage_advice\` fields must be arrays of strings ONLY.
- All arrays must contain only the specified data types.
- NEVER use resources not in the validated database - this is critical for link integrity
- NEVER use skills not in the validated skills database - this is critical for assessment accuracy
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.
- Use only suggestive language for assessment tools: "consider using a tool such as [tool name]" rather than direct recommendations.
- **PERSONALIZATION REQUIREMENT**: Use ALL THREE demographic dimensions (role, industry, experience) to tailor insights, examples, and leader selection for maximum relevance to the user's specific context.
- **SKILL-LEVEL REQUIREMENT**: Reference specific individual skills by name only (NO numbers, NO gaps, NO scores) in summary, and by name only (NO numerical values) in priority area insights (ONLY validated skills from the database)
- **VALIDATED RESOURCE REQUIREMENT**: Every resource in the resources arrays must be an exact match from the validated database above. NO EXCEPTIONS ALLOWED.
- **MINIMUM BOOK REQUIREMENT**: Every competency section must include at least one book recommendation from the validated database
- **MAXIMUM RESOURCE REQUIREMENT**: Every competency section must include exactly 3 resources (not 4)
- **VALIDATED LEADER REQUIREMENT**: Every leader in the summary must be an exact match from the validated leaders database above. If no suitable validated leader exists for the context, omit the leader reference entirely rather than using an unvalidated leader.
- **VALIDATED SKILL REQUIREMENT**: Every skill referenced must be an exact match from the validated skills database above. Never create, invent, or reference skills outside this validated list.
- **TERMINOLOGY REQUIREMENT**: NEVER use "strength" as synonym for "competency" - always use "competencies" or "leadership competencies"
- **ENCOURAGER COACHING REQUIREMENT**: All content must reflect Encourager Coaching's positive psychology approach, maximizing natural ability, and helping users become their best leadership version through encouraging, supportive language and framing.
- **DETERMINISTIC CATEGORY REQUIREMENT**: You MUST use ONLY the 3 priority development areas and 2 key strengths listed above. You CANNOT substitute, replace, or choose different categories.
- **MANDATORY THREE PARAGRAPH STRUCTURE**: Your summary field MUST contain EXACTLY three paragraphs separated by \\n\\n. First paragraph: development areas. Second paragraph: competencies and leader. Third paragraph: MUST start with "Moving forward, it is important to reflect on these development areas and consider how they align with your personal and professional goals." If this third paragraph is missing or doesn't start with this exact phrase, your response is INVALID.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, experience level, AND individual skill gaps by name only (without numerical values). Remember: ONLY use resources, leaders, and skills from the validated databases with exact title matching, ensure minimum book recommendations per section, limit to exactly 3 resources per section, reference skills by name only in summary (NO numbers), reference specific skills by name only in insights sections (NO numerical values - focus on development suggestions), use proper HTML anchor tag formatting for leaders, maintain consistent terminology (competencies, not strengths), embody Encourager Coaching's philosophy of positive psychology, encouragement, and helping people maximize their natural abilities to become the best version of themselves, AND use ONLY the exact categories listed above for priority areas and key strengths.

`;

  // Log only non-sensitive information for debugging

  
  return fullPrompt;
};
