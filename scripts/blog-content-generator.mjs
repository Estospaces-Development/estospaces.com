import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SITE_URL = 'https://estospaces.com';
const DEFAULT_AUTHOR = {
  name: 'Estospaces Editorial Team',
  role: 'UK property research and platform operations',
  url: 'https://estospaces.com/about',
};

const SOURCE_LIBRARY = {
  rentersRights: {
    title: 'Renters Rights Act implementation roadmap',
    url: 'https://www.gov.uk/government/publications/renters-rights-act-2025-implementation-roadmap',
    publisher: 'GOV.UK',
  },
  tenantFees: {
    title: 'Tenant Fees Act 2019 guidance for tenants',
    url: 'https://www.gov.uk/guidance/tenant-fees-act-2019-guidance-for-tenants',
    publisher: 'GOV.UK',
  },
  deposits: {
    title: 'Tenancy deposit protection',
    url: 'https://www.gov.uk/tenancy-deposit-protection',
    publisher: 'GOV.UK',
  },
  rightToRent: {
    title: 'Checking your tenants right to rent',
    url: 'https://www.gov.uk/check-tenant-right-to-rent-documents',
    publisher: 'GOV.UK',
  },
  safety: {
    title: 'Private renting: your landlords safety responsibilities',
    url: 'https://www.gov.uk/private-renting/your-landlords-safety-responsibilities',
    publisher: 'GOV.UK',
  },
  sdlt: {
    title: 'Stamp Duty Land Tax residential property rates',
    url: 'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
    publisher: 'GOV.UK',
  },
  cgt: {
    title: 'Report and pay your Capital Gains Tax',
    url: 'https://www.gov.uk/report-and-pay-your-capital-gains-tax/if-you-sold-a-property-in-the-uk-on-or-after-6-april-2020',
    publisher: 'GOV.UK',
  },
  hpi: {
    title: 'UK House Price Index monthly price statistics',
    url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/ukhousepriceindexmonthlypricestatistics',
    publisher: 'Office for National Statistics',
  },
  bankRate: {
    title: 'Bank Rate and monetary policy',
    url: 'https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate',
    publisher: 'Bank of England',
  },
  rics: {
    title: 'RICS home surveys',
    url: 'https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/building-surveying-standards/home-surveys',
    publisher: 'RICS',
  },
  googleHelpful: {
    title: 'Creating helpful, reliable, people-first content',
    url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
    publisher: 'Google Search Central',
  },
};

const FLAGSHIP_TOPICS = [
  ['Renters Rights Act: what changes from 1 May 2026 for renters in England', 'Renters Rights', 'Renters', 'informational', 'renters rights act 1 May 2026 England', ['rentersRights', 'tenantFees'], 'tenant rights action pack'],
  ['Section 21 ending 1 May 2026: landlord and letting agent checklist for England', 'Renters Rights', 'Letting agents', 'commercial', 'section 21 ending 1 May 2026 checklist', ['rentersRights'], 'letting agency compliance kit'],
  ['Tenant Fees Act in England: what renters, landlords and agents can charge in 2026', 'Compliance', 'Renters and agents', 'informational', 'tenant fees act England allowed fees 2026', ['tenantFees', 'deposits'], 'tenant fees checklist'],
  ['Right to Rent checks: a step-by-step workflow for letting agencies in England', 'Compliance', 'Letting agents', 'commercial', 'right to rent checks workflow letting agents', ['rightToRent'], 'right to rent SOP template'],
  ['Tenancy deposit protection: how to check your deposit and what to do next', 'Renting', 'Renters', 'informational', 'check tenancy deposit is protected', ['deposits'], 'deposit evidence checklist'],
  ['Get your deposit back: end-of-tenancy evidence pack and dispute steps', 'Renting', 'Renters', 'informational', 'get tenancy deposit back evidence pack', ['deposits'], 'end of tenancy evidence pack'],
  ['Landlord safety responsibilities: gas, electrical, smoke and carbon monoxide checklist', 'Compliance', 'Renters and landlords', 'informational', 'landlord safety responsibilities checklist England', ['safety'], 'safety inspection checklist'],
  ['Electrical safety certificates in England: what agents and landlords need before marketing', 'Compliance', 'Landlords and agents', 'commercial', 'electrical safety certificate letting agents England', ['safety'], 'EICR compliance tracker'],
  ['Stamp Duty calculator guide 2026: first-time buyer, home mover and additional property examples', 'Buying', 'Buyers', 'commercial', 'stamp duty calculator 2026 England examples', ['sdlt'], 'SDLT worksheet'],
  ['Higher-rate SDLT: when it applies and when buyers can claim a refund', 'Investing', 'Investors', 'commercial', 'higher rate SDLT refund additional property', ['sdlt'], 'SDLT refund checklist'],
  ['CGT property sale 60-day rule: a checklist for UK residential property sellers', 'Selling', 'Sellers and investors', 'transactional', 'CGT property sale 60 day rule UK', ['cgt'], 'CGT deadline tracker'],
  ['Assured periodic tenancies from 1 May 2026: what changes operationally for agents', 'Renters Rights', 'Letting agents', 'commercial', 'assured periodic tenancies 1 May 2026 agents', ['rentersRights'], 'periodic tenancy SOP'],
  ['Damp and mould in rentals: reporting process and evidence checklist for tenants', 'Renting', 'Renters', 'informational', 'damp and mould rental evidence checklist', ['safety', 'rentersRights'], 'repair report template'],
  ['Local SEO for estate agents: Google Business Profile, service pages and review engine', 'Agents', 'Estate agents', 'commercial', 'local SEO for estate agents 2026', ['googleHelpful'], 'agency SEO checklist'],
  ['Best property portals for estate agents: lead quality scorecard and spreadsheet', 'Agents', 'Estate agents', 'commercial', 'property portal lead quality scorecard', ['googleHelpful'], 'lead quality scorecard'],
  ['RICS survey Level 2 vs Level 3: what UK buyers actually need', 'Buying', 'Buyers', 'informational', 'RICS Level 2 vs Level 3 survey', ['rics'], 'survey decision matrix'],
  ['Conveyancing timeline: how long it takes and how to prevent fall-through', 'Buying', 'Buyers and agents', 'informational', 'how long does conveyancing take 2026', ['rics'], 'fall-through prevention checklist'],
  ['Leasehold flat buying checklist: service charges, ground rent and major works', 'Buying', 'Buyers', 'commercial', 'leasehold flat buying checklist service charges', ['rics'], 'leasehold viewing checklist'],
  ['Rent affordability calculator: what you can rent on your salary and postcode', 'Renting', 'Renters', 'transactional', 'rent affordability calculator salary postcode', ['hpi'], 'rent affordability worksheet'],
  ['London vs Manchester vs Birmingham rent affordability using UK HPI signals', 'Market Data', 'Renters and investors', 'informational', 'London Manchester Birmingham rent affordability comparison', ['hpi', 'bankRate'], 'rental affordability index'],
];

const COMPLIANCE_TOPICS = [
  ['Rent in advance rules in England: what landlords can ask for from May 2026', 'rent in advance rules England 2026', 'Renters and landlords', ['rentersRights', 'tenantFees']],
  ['Rental bidding ban in England: how agents should write compliant listings', 'rental bidding ban England letting agents', 'Letting agents', ['rentersRights']],
  ['Pet requests under the Renters Rights Act: fair process for landlords and tenants', 'pet requests renters rights act England', 'Renters and landlords', ['rentersRights']],
  ['Discrimination rules for renters with children or benefits: what agents must change', 'rental discrimination children benefits England', 'Letting agents', ['rentersRights']],
  ['PRS landlord database: what landlords should prepare before registration', 'PRS landlord database England preparation checklist', 'Landlords', ['rentersRights']],
  ['Private rented sector ombudsman: what landlords and tenants should expect', 'private rented sector ombudsman England', 'Landlords and renters', ['rentersRights']],
  ['Client money protection for property agents: a plain-English compliance checklist', 'client money protection property agents England', 'Letting agents', ['tenantFees']],
  ['HMO licensing checklist: safety, amenities and local authority checks', 'HMO licensing checklist England landlords', 'Landlords', ['safety']],
  ['Gas safety certificate checklist for landlords and letting agents', 'gas safety certificate landlord checklist', 'Landlords and agents', ['safety']],
  ['Smoke and carbon monoxide alarm rules: landlord checklist for England', 'smoke carbon monoxide alarm rules landlord England', 'Landlords', ['safety']],
  ['Move-in compliance pack: documents every renter should receive before keys', 'move in compliance documents tenant England', 'Renters', ['deposits', 'safety', 'rightToRent']],
  ['End-of-tenancy notice checklist after the Renters Rights Act reforms', 'end of tenancy notice checklist renters rights act', 'Landlords and agents', ['rentersRights']],
  ['Rent review notices in England: annual process and evidence checklist', 'rent review notice annual process England', 'Landlords and agents', ['rentersRights']],
  ['How to document repairs quickly: tenant and landlord communication workflow', 'rental repair documentation workflow tenant landlord', 'Renters and landlords', ['safety']],
  ['Awaabs Law in private rentals: what damp and mould timelines mean for agents', 'Awaabs Law private rentals damp mould agents', 'Letting agents', ['rentersRights', 'safety']],
];

const BUYER_TOPICS = [
  ['First-time buyer checklist 2026: deposit, mortgage, viewing and offer steps', 'first time buyer checklist 2026 UK', 'First-time buyers', ['sdlt', 'bankRate']],
  ['Agreement in Principle: how buyers should use it before viewing homes', 'agreement in principle before house viewing', 'Buyers', ['bankRate']],
  ['Fixed vs tracker mortgage in 2026: what buyers should compare', 'fixed vs tracker mortgage 2026 UK', 'Buyers', ['bankRate']],
  ['Viewing checklist for virtual property tours: what to inspect before visiting', 'virtual property tour viewing checklist', 'Buyers and renters', ['rics']],
  ['Flood risk checks before buying a UK home: maps, insurance and questions', 'flood risk checks before buying house UK', 'Buyers', ['rics']],
  ['EPC rating when buying a home: costs, upgrades and negotiation questions', 'EPC rating buying house checklist', 'Buyers', ['safety']],
  ['New-build snagging checklist: what to inspect before completion', 'new build snagging checklist UK', 'Buyers', ['rics']],
  ['Shared ownership pros and cons: a practical decision checklist for buyers', 'shared ownership pros and cons checklist', 'First-time buyers', ['sdlt']],
  ['Buying a period home: survey, maintenance and energy questions', 'buying a period home survey checklist', 'Buyers', ['rics']],
  ['Buying a home with a garden office: remote work viewing checklist', 'home office garden office property viewing checklist', 'Buyers', ['rics']],
  ['Council tax bands and service charges: hidden costs buyers should compare', 'council tax service charge buying checklist', 'Buyers', ['sdlt']],
  ['Chain-free buying: how to reduce delay without overpaying', 'chain free buying how to reduce delays', 'Buyers', ['rics']],
  ['Gazumping in England and Wales: practical ways buyers can reduce risk', 'gazumping England Wales reduce risk', 'Buyers', ['rics']],
  ['School catchment property search: how families should compare locations', 'school catchment property search UK', 'Families', ['hpi']],
  ['Accessible homes checklist: step-free access, layouts and local transport', 'accessible homes viewing checklist UK', 'Buyers and renters', ['rentersRights']],
];

const RENTER_TOPICS = [
  ['Rental viewing checklist: 30 questions to ask before applying', 'rental viewing checklist questions UK', 'Renters', ['tenantFees', 'safety']],
  ['Holding deposit rules: when renters get it back and when they do not', 'holding deposit rules one week rent England', 'Renters', ['tenantFees']],
  ['How to compare furnished vs unfurnished rentals in the UK', 'furnished vs unfurnished rental comparison UK', 'Renters', ['tenantFees']],
  ['Student rental checklist: guarantors, HMOs and bills before signing', 'student rental checklist guarantor HMO bills', 'Students', ['safety', 'deposits']],
  ['House share checklist: licences, bills, deposits and room inspections', 'house share checklist HMO deposit bills UK', 'Renters', ['safety', 'deposits']],
  ['Pet-friendly rental search: how to prepare a stronger application', 'pet friendly rental application UK', 'Renters', ['rentersRights']],
  ['Rental scams checklist: how to spot fake listings before sending money', 'rental scams checklist fake listings UK', 'Renters', ['tenantFees']],
  ['Rent-to-buy vs renting: how to compare costs and flexibility', 'rent to buy vs renting UK comparison', 'Renters', ['hpi']],
  ['Social housing vs private renting: timelines, rights and trade-offs', 'social housing vs private renting UK', 'Renters', ['rentersRights']],
  ['How to build a renter document pack before applying for a home', 'renter document pack before applying', 'Renters', ['rightToRent']],
];

const INVESTOR_TOPICS = [
  ['Buy-to-let yield calculator: net yield after voids, fees and repairs', 'buy to let yield calculator net yield UK', 'Investors', ['sdlt', 'hpi']],
  ['Limited company buy-to-let: what investors should compare before choosing', 'limited company buy to let comparison UK', 'Investors', ['sdlt', 'cgt']],
  ['MEES and EPC planning: how landlords should budget for upgrades', 'MEES EPC landlord upgrade budget UK', 'Landlords and investors', ['safety']],
  ['HMO vs single let: yield, compliance and management trade-offs', 'HMO vs single let yield compliance UK', 'Investors', ['safety']],
  ['Purpose-built student accommodation: investor checklist for UK cities', 'PBSA investment checklist UK cities', 'Investors', ['hpi']],
  ['Build-to-rent investment outlook: what stable rental income means in 2026', 'build to rent investment outlook UK 2026', 'Investors', ['hpi', 'bankRate']],
  ['Short-term lets vs long-term lets: income, regulation and void risk', 'short term lets vs long term lets UK regulation', 'Investors', ['hpi']],
  ['Regeneration hotspots: how investors should validate growth claims', 'regeneration hotspots property investment checklist UK', 'Investors', ['hpi']],
  ['Portfolio stress test: interest rates, voids and repair reserve checklist', 'buy to let portfolio stress test UK', 'Investors', ['bankRate']],
  ['Landlord exit strategy: sell, refinance or hold in a slower market', 'landlord exit strategy sell refinance hold UK', 'Landlords', ['cgt', 'bankRate']],
  ['Green rental upgrades: which improvements help tenants and yields', 'green rental upgrades EPC yields UK', 'Landlords and investors', ['safety']],
  ['Investor due diligence pack: documents to review before exchange', 'property investor due diligence checklist UK', 'Investors', ['sdlt', 'cgt']],
];

const AGENT_TOPICS = [
  ['Estate agent lead generation in 2026: pages, reviews and follow-up scripts', 'estate agent lead generation 2026 UK', 'Estate agents', ['googleHelpful']],
  ['Letting agency compliance dashboard: what to track weekly', 'letting agency compliance dashboard checklist', 'Letting agents', ['rentersRights']],
  ['Virtual tours for estate agents: how to turn remote views into qualified leads', 'virtual tours estate agents qualified leads', 'Estate agents', ['googleHelpful']],
  ['Property listing quality score: how agents can reduce wasted enquiries', 'property listing quality score estate agents', 'Estate agents', ['googleHelpful']],
  ['Lead response time in property: why the first 10 minutes matter operationally', 'property lead response time 10 minutes agents', 'Estate agents', ['googleHelpful']],
  ['Agency review engine: how to ask for reviews without breaching trust', 'estate agent review engine Google Business Profile', 'Estate agents', ['googleHelpful']],
  ['Listing descriptions that convert: structure for UK sales and lettings', 'property listing description template UK agents', 'Estate agents', ['googleHelpful']],
  ['Agent CRM checklist: pipeline stages for viewings, offers and compliance', 'estate agent CRM pipeline checklist', 'Estate agents', ['googleHelpful']],
  ['Data-led valuations: how agents should explain evidence to sellers', 'data led property valuations estate agents', 'Estate agents', ['hpi']],
  ['Reducing fall-throughs: agent workflow from offer accepted to completion', 'reduce property fall throughs estate agents', 'Estate agents', ['rics']],
  ['B2B property portal comparison: what agencies should measure before paying', 'property portal comparison agencies lead quality', 'Estate agents', ['googleHelpful']],
  ['Co-broking and partner referrals: a transparent workflow for property teams', 'co broking partner referral workflow estate agents', 'Estate agents', ['googleHelpful']],
];

const SELLER_TOPICS = [
  ['Estate agent fees in the UK: what sellers should compare before instructing', 'estate agent fees UK sellers compare', 'Sellers', ['hpi']],
  ['How to choose an estate agent: valuation evidence, marketing and contract terms', 'how to choose estate agent UK checklist', 'Sellers', ['hpi']],
  ['Sell my house fast without panic pricing: preparation checklist for sellers', 'sell my house fast preparation checklist UK', 'Sellers', ['hpi']],
  ['Best time to list a property: seasonality, pricing and local demand signals', 'best time to list property UK', 'Sellers', ['hpi']],
  ['Property valuation checklist: what affects asking price beyond square footage', 'property valuation checklist asking price UK', 'Sellers', ['hpi']],
  ['Preparing a home for virtual tours: lighting, rooms and documents', 'prepare home for virtual tour selling', 'Sellers', ['googleHelpful']],
  ['Seller disclosure checklist: documents buyers and solicitors will ask for', 'seller disclosure documents checklist UK', 'Sellers', ['rics']],
  ['Price reduction strategy: when to adjust asking price and how to message it', 'property price reduction strategy sellers UK', 'Sellers', ['hpi']],
  ['Selling a leasehold flat: management pack, service charge and timeline', 'selling leasehold flat management pack timeline', 'Sellers', ['rics']],
  ['Selling a buy-to-let property: tenant, tax and notice considerations', 'selling buy to let property tenant tax notice', 'Landlords and sellers', ['cgt', 'rentersRights']],
];

const LOCAL_CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Bristol', 'Edinburgh', 'Liverpool', 'Sheffield', 'Nottingham', 'Cardiff', 'Belfast'];

const LOCAL_TOPICS = LOCAL_CITIES.flatMap((city) => ([
  [`Best areas to rent in ${city} in 2026 by budget, commute and lifestyle`, `best areas to rent in ${city} 2026`, 'Renters', ['hpi']],
  [`Where to buy in ${city}: schools, transport and long-term value checklist`, `where to buy in ${city} schools transport value`, 'Buyers', ['hpi']],
]));

const TOOL_TOPICS = [
  ['Rental affordability index: how to compare rent burden across UK cities', 'rental affordability index UK cities', 'Renters and analysts', ['hpi']],
  ['Stamp duty shock map: where SDLT changes buyer budgets most', 'stamp duty shock map SDLT buyer budget', 'Buyers', ['sdlt']],
  ['Deposit dispute letter template: when to use it and what evidence to attach', 'deposit dispute letter template UK', 'Renters', ['deposits']],
  ['Letting agency SOP template: weekly compliance checks before 1 May 2026', 'letting agency SOP template compliance 2026', 'Letting agents', ['rentersRights']],
  ['Property viewing scorecard: compare two homes without relying on memory', 'property viewing scorecard compare homes', 'Buyers and renters', ['rics']],
  ['Agent lead-quality rubric: scoring enquiries before booking viewings', 'agent lead quality rubric property enquiries', 'Estate agents', ['googleHelpful']],
  ['Move-in budget calculator: rent, deposit, bills and first-month cash needs', 'move in budget calculator rent deposit bills', 'Renters', ['tenantFees']],
  ['Buy-to-let deal analysis sheet: yield, tax, repairs and exit assumptions', 'buy to let deal analysis sheet UK', 'Investors', ['sdlt', 'cgt']],
  ['UK property market data sources: HPI, Bank Rate, RICS and local signals', 'UK property market data sources HPI Bank Rate RICS', 'Buyers and investors', ['hpi', 'bankRate', 'rics']],
  ['AI property search prompts: how to brief Estospaces for better shortlists', 'AI property search prompts better shortlists', 'Buyers and renters', ['googleHelpful']],
];

export async function buildBlogPostDrafts({ sourcePath = 'docs/blog-posts-to-do' } = {}) {
  const source = await readCanonicalSource(sourcePath);
  const blueprints = buildBlueprints(source.text);
  const posts = blueprints.slice(0, 100).map((topic, index) => buildPost(topic, index, blueprints));
  return posts.map((post, index) => ({
    ...post,
    relatedPostSlugs: buildRelatedSlugs(post, posts, index),
  })).map((post, index, allPosts) => {
    const enhanced = {
      ...post,
      internalLinks: buildInternalLinks(post, allPosts, index),
      externalLinks: buildExternalLinks(post),
    };
    return {
      ...enhanced,
      schemaJsonLd: buildSchema(enhanced),
    };
  });
}

export async function readCanonicalSource(sourcePath) {
  const absolutePath = resolve(process.cwd(), sourcePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());
  if (files.length === 0) {
    throw new Error(`No blog topic source files found at ${absolutePath}`);
  }

  const chunks = [];
  for (const file of files) {
    const filePath = resolve(absolutePath, file.name);
    if (file.name.toLowerCase().endsWith('.pdf')) {
      chunks.push(await extractPdfText(filePath, file.name));
    } else {
      chunks.push(await readFile(filePath, 'utf8'));
    }
  }

  return {
    path: absolutePath,
    files: files.map((file) => file.name),
    text: chunks.join('\n\n'),
  };
}

async function extractPdfText(filePath, fileName) {
  try {
    const { PDFParse } = await import('pdf-parse');
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return `Source document: ${fileName}\n${result.text}`;
  } catch (error) {
    return `Source document: ${fileName}\nPDF text extraction failed: ${error.message}`;
  }
}

function buildBlueprints(sourceText) {
  const sourceLower = sourceText.toLowerCase();
  const topics = [
    ...FLAGSHIP_TOPICS.map(toBlueprint),
    ...COMPLIANCE_TOPICS.map((topic) => toBlueprint(['From 2026: ' + topic[0], 'Compliance', topic[2], 'commercial', topic[1], topic[3], 'compliance checklist'])),
    ...BUYER_TOPICS.map((topic) => toBlueprint([topic[0], 'Buying', topic[2], 'informational', topic[1], topic[3], 'buyer checklist'])),
    ...RENTER_TOPICS.map((topic) => toBlueprint([topic[0], 'Renting', topic[2], 'informational', topic[1], topic[3], 'renter checklist'])),
    ...INVESTOR_TOPICS.map((topic) => toBlueprint([topic[0], 'Investing', topic[2], 'commercial', topic[1], topic[3], 'investor worksheet'])),
    ...AGENT_TOPICS.map((topic) => toBlueprint([topic[0], 'Agents', topic[2], 'commercial', topic[1], topic[3], 'agency template'])),
    ...SELLER_TOPICS.map((topic) => toBlueprint([topic[0], 'Selling', topic[2], 'commercial', topic[1], topic[3], 'seller checklist'])),
    ...LOCAL_TOPICS.map((topic) => toBlueprint([topic[0], 'Local Guides', topic[2], 'informational', topic[1], topic[3], 'local shortlist'])),
    ...TOOL_TOPICS.map((topic) => toBlueprint([topic[0], 'Tools and Templates', topic[2], 'transactional', topic[1], topic[3], 'downloadable tool'])),
  ];

  const filtered = topics.filter((topic) => {
    if (topic.sourceTags.includes('rentersRights') && !sourceLower.includes('renters')) return true;
    return true;
  });

  return dedupeBySlug(filtered);
}

function toBlueprint([title, category, audience, intentType, targetKeyword, sourceTags, asset]) {
  return {
    title,
    category,
    audience,
    intentType,
    targetKeyword,
    sourceTags,
    asset,
    slug: slugify(title),
  };
}

function buildPost(topic, index) {
  const slug = topic.slug;
  const publishedAt = new Date(Date.UTC(2026, 0, 10 + index, 8, 0, 0)).toISOString();
  const updatedAt = new Date(Date.UTC(2026, 4, 1, 12, 0, 0)).toISOString();
  const secondaryKeywords = buildSecondaryKeywords(topic);
  const sources = selectSources(topic.sourceTags);
  const keyTakeaways = buildTakeaways(topic);
  const definitions = buildDefinitions(topic);
  const steps = buildSteps(topic);
  const decisionTable = buildDecisionTable(topic);
  const checklist = buildChecklist(topic);
  const mistakes = buildMistakes(topic);
  const exampleWorkflow = buildExampleWorkflow(topic);
  const verification = buildVerificationList(topic);
  const answer = buildAnswer(topic);
  const faq = buildFaq(topic);
  const summary = buildSummary(topic);
  const content = {
    summary,
    answerBlock: answer,
    sections: [
      { heading: 'Direct Answer', body: [answer, buildEvidenceNote(topic)] },
      { heading: 'Key Takeaways', bullets: keyTakeaways },
      { heading: 'Important Terms', definitions },
      { heading: 'Decision Framework', body: [buildDecisionFramework(topic)] },
      { heading: 'What to Verify Before You Act', bullets: verification },
      { heading: 'Step-by-Step Plan', steps },
      { heading: 'Common Mistakes to Avoid', bullets: mistakes },
      { heading: 'Example Workflow', body: exampleWorkflow },
      { heading: decisionTable.heading, table: { headers: decisionTable.headers, rows: decisionTable.rows } },
      { heading: 'Practical Checklist', bullets: checklist },
      { heading: 'Put This Into Practice', body: [buildPracticeGuidance(topic)] },
      { heading: 'Source Notes', body: sources.map((source) => `${source.publisher}: ${source.title}`) },
    ],
  };

  const metaDescription = makeMetaDescription(topic);
  const heroFileName = `${slug}-hero-photo-v8.webp`;

  return {
    id: `blog-${String(index + 1).padStart(3, '0')}`,
    slug,
    title: topic.title,
    metaTitle: makeMetaTitle(topic),
    metaDescription,
    excerpt: metaDescription,
    category: topic.category,
    tags: buildTags(topic),
    targetKeyword: topic.targetKeyword,
    secondaryKeywords,
    searchIntent: `${topic.intentType}:${topic.targetKeyword}`,
    audience: topic.audience,
    author: DEFAULT_AUTHOR,
    status: 'published',
    publishedAt,
    updatedAt,
    readingTime: estimateReadingTime(content, faq),
    heroImage: {
      url: `/blog-images/${heroFileName}`,
      alt: `Editorial UK property image for ${topic.title}`,
      width: 1600,
      height: 900,
      gcpPath: `blogs/${slug}/${heroFileName}`,
      prompt: buildImagePrompt(topic),
    },
    content,
    faq,
    sources,
    internalLinks: [],
    externalLinks: [],
    schemaJsonLd: {},
    relatedPostSlugs: [],
    canonicalUrl: `${SITE_URL}/blogs/${slug}`,
    imageConcept: buildImagePrompt(topic),
    primaryCta: buildCta(topic),
    sourceDocumentSignals: topic.sourceTags,
  };
}

function buildTopicFocus(topic) {
  const city = cityFromTitle(topic.title);
  const title = topic.title.toLowerCase();
  const defaults = {
    Selling: {
      directAnswer: 'the next sale decision should be tied to buyer evidence, document readiness and a clear reason for the chosen route.',
      primaryAction: 'Put the price logic, agent plan, paperwork and feedback loop into one launch file before making the move public.',
      takeaway: 'A strong sale decision is easier to defend when price, preparation and paperwork are handled before buyer pressure starts.',
      evidence: 'The strongest evidence is a dated mix of comparable sales, marketing plan, viewing feedback and missing-document notes.',
      checklistStart: 'Define the selling decision you need to make and the evidence that would change it.',
      framework: 'Use the buyer-friction test: if a buyer, lender or solicitor will ask for proof later, prepare it now or explain the gap in the marketing plan.',
      mistake: 'Changing the plan because of pressure rather than because demand, feedback or comparable evidence changed.',
      example: [
        'Example: a seller compares two agent proposals by valuation evidence, likely buyer pool, marketing plan, contract terms and weekly feedback rhythm.',
        'The seller chooses the proposal with clearer proof and a better follow-up process, not simply the highest suggested asking price.',
      ],
      practice: 'Keep valuation notes, fee terms, document status and viewing feedback in one place so the sale can be adjusted calmly when new evidence arrives.',
      meta: 'Practical seller guide with evidence checks, contract points, common risks, checklist and next steps.',
    },
    Agents: {
      directAnswer: 'agency work improves when the team measures quality of progress, not only the number of leads, listings or tasks.',
      primaryAction: 'Define the owner, response standard, evidence needed and client update before the workflow starts.',
      takeaway: 'The best agency process makes every enquiry, viewing, document and follow-up visible enough for the next person to act.',
      evidence: 'Useful evidence includes response times, lead source, qualification notes, viewing outcomes, document status and client updates.',
      checklistStart: 'Define the client outcome, workflow owner and next action before measuring the channel or campaign.',
      framework: 'Use a revenue-quality workflow: source, response time, qualification, viewing quality, compliance status and follow-up.',
      mistake: 'Celebrating enquiry volume without measuring lead quality, response speed and whether the client outcome moved forward.',
      example: [
        'Example: an agency reviews a week of enquiries by source, response time, qualification status and viewing outcome.',
        'The team then improves the channel that creates serious conversations, not only the channel with the most form fills.',
      ],
      practice: 'Make the next action visible in the CRM or workspace: owner, deadline, evidence and client update. The tool matters less than whether the team can see what changed today.',
      meta: 'Operational estate agency guide with workflow checks, lead-quality signals, client update standards and next steps.',
    },
    Buying: {
      directAnswer: 'a good buying decision separates the home you like from the risks that could change price, timing or whether to proceed.',
      primaryAction: 'Score finance fit, survey risk, legal complexity, running costs, location and resale before the offer becomes emotional.',
      takeaway: 'A good property decision balances desire with survey risk, finance fit, running costs and legal complexity.',
      evidence: 'The strongest evidence is a consistent viewing note, mortgage position, survey question list and legal-risk log.',
      checklistStart: 'Define the offer decision, including the maximum risk or delay you can accept.',
      framework: 'Use a red-amber-green matrix for price, survey risk, finance, legal complexity, location and resale value.',
      mistake: 'Treating an accepted offer as secure before survey, mortgage, legal and chain risks are visible.',
      example: [
        'Example: a buyer compares two homes with the same scorecard: price, survey risk, mortgage fit, commute, running costs and resale value.',
        'The cheaper home may still lose if repair, leasehold or location risks would cost more than the headline saving.',
      ],
      practice: 'Save the shortlist, viewing notes, photos and questions before the second viewing so the offer decision is calmer and easier to explain.',
      meta: 'Buyer guide with decision checks, risk signals, evidence pack, practical examples and next steps.',
    },
    Renting: {
      directAnswer: 'a rental is only a good fit when the home, money route, terms and evidence all work together.',
      primaryAction: 'Check rent, deposit route, fees, condition, commute, safety evidence and application requirements before sending money or documents.',
      takeaway: 'A good rental decision checks the home, the money route, the terms and the evidence before an application is submitted.',
      evidence: 'Useful evidence includes the listing, agent identity, fee wording, deposit route, safety notes, photos and written promises.',
      checklistStart: 'Define the rental fit you need: monthly cost, move-in date, commute, condition and application readiness.',
      framework: 'Use affordability, condition, rights and speed as the four decision filters.',
      mistake: 'Sending money before the listing, agent, fees and deposit route have been checked.',
      example: [
        'Example: a renter saves the listing, checks the agent, confirms the holding deposit terms and records condition questions before applying.',
        'That small evidence pack makes a fast application safer and gives a record if the terms change later.',
      ],
      practice: 'Keep the listing, fees, deposit terms, documents and messages together so you can move quickly without losing track of what was promised.',
      meta: 'Rental guide with affordability checks, application evidence, tenant-risk warnings and next steps.',
    },
    Compliance: {
      directAnswer: 'a compliance task is not complete until the current source, proof, owner and review date are visible.',
      primaryAction: 'Turn the requirement into a dated file with the official source, required document, responsible person and blocker status.',
      takeaway: 'Compliance quality comes from a visible evidence trail, not from assuming a document was requested.',
      evidence: 'The strongest evidence is the official source, the actual certificate or notice, the received date and the person who reviewed it.',
      checklistStart: 'Define the file outcome: the required proof, the owner and the review date.',
      framework: 'Use a weekly compliance board with four columns: required, requested, received and reviewed.',
      mistake: 'Assuming a document exists because it was requested, rather than confirming it has been received and reviewed.',
      example: [
        'Example: a letting team creates a dated folder for each property with required certificates, notices, checks and move-in documents.',
        'Before marketing or signing, one person reviews the folder and records missing items so the next action is visible.',
      ],
      practice: 'Use the habit source, proof, owner, review date. If one of those is missing, the file is not ready.',
      meta: 'Compliance guide with source checks, document workflow, file-risk warnings and next steps.',
    },
    'Renters Rights': {
      directAnswer: 'rights are easier to use when the facts are saved before the disagreement becomes emotional.',
      primaryAction: 'Save the notice, date, message, photo or document, then check the implementation guidance before asking for a specific action.',
      takeaway: 'Rights are easier to use when dates, notices, photos and messages are saved before any dispute starts.',
      evidence: 'The strongest evidence is a dated record: notice, tenancy document, photos, messages and the official rule being relied on.',
      checklistStart: 'Define the practical outcome you need, such as a repair, explanation, document, correction or written reply.',
      framework: 'Use a three-part framework: rule, proof and action. Confirm the rule, collect proof, then ask for the specific next step.',
      mistake: 'Acting on a new rule without checking implementation timing and the exact scope.',
      example: [
        'Example: a renter receives a notice, saves the message, checks the implementation guidance, records dates and asks for clarification in writing.',
        'If the answer is unclear, the evidence pack is ready for an adviser instead of relying on memory.',
      ],
      practice: 'Save the facts first, then ask for the specific repair, document, correction or explanation you need.',
      meta: 'Renter rights guide with evidence steps, official-source checks, practical wording and next actions.',
    },
    Investing: {
      directAnswer: 'an investment only deserves attention after the downside case has survived realistic costs and delays.',
      primaryAction: 'Model rent, voids, repairs, finance, tax, compliance and exit before treating the headline yield as real.',
      takeaway: 'Investment quality depends on the downside case, not the best-case yield.',
      evidence: 'Useful evidence includes conservative rent comparables, finance assumptions, repair reserve, compliance cost and exit route.',
      checklistStart: 'Define the downside case the deal must survive before looking at the optimistic return.',
      framework: 'Use downside-first underwriting with voids, repair reserve, finance stress, compliance budget and slower exit.',
      mistake: 'Using gross yield as the decision number before voids, repairs, finance and tax are modelled.',
      example: [
        'Example: an investor tests a deal with one month of void, a repair reserve, a higher interest-rate scenario and the likely exit tax position.',
        'If the deal still works, it deserves deeper due diligence; if not, the weak purchase has been avoided early.',
      ],
      practice: 'Keep the base case and downside case side by side. A deal that survives realistic stress deserves more attention than one that only works in a best-case spreadsheet.',
      meta: 'Investor guide with yield checks, downside modelling, due-diligence evidence and next steps.',
    },
    'Market Data': {
      directAnswer: 'market data helps only when reliable official trend evidence is compared with live listing and enquiry signals.',
      primaryAction: 'Use official data for direction, current listings for timing and local evidence for the actual decision.',
      takeaway: 'Market data is useful when it is paired with current listing evidence and local demand signals.',
      evidence: 'Useful evidence includes official data date, live listing sample, price-change pattern and recent viewing or enquiry feedback.',
      checklistStart: 'Define the market question, then separate official trend data from live listing evidence.',
      framework: 'Use official data for direction and live listings for timing; neither source is enough alone.',
      mistake: 'Treating one average figure as proof of what a current buyer, renter or investor will do.',
      example: [
        'Example: a buyer compares ONS direction with live listing reductions and recent viewing competition before changing a search budget.',
        'The decision uses the pattern across sources, not a single headline number.',
      ],
      practice: 'Compare the official source with live listings and your own viewing or enquiry evidence. The best signal is usually the pattern across all three.',
      meta: 'Property market data guide with source checks, signal interpretation, practical examples and next steps.',
    },
    'Tools and Templates': {
      directAnswer: 'a tool is useful only when it captures assumptions, evidence and the next review date.',
      primaryAction: 'Use the template as a living record, not a one-off download.',
      takeaway: 'A template is most useful when it captures assumptions, evidence and the next decision date.',
      evidence: 'The strongest evidence is a completed decision log with dated inputs, links, assumptions and review triggers.',
      checklistStart: 'Define the decision the template must support and the date the inputs should be reviewed.',
      framework: 'Use the tool as a living record: save the inputs, date each update and keep a reason log.',
      mistake: 'Using the template once and not updating the inputs when the facts change.',
      example: [
        'Example: a buyer or renter fills the template before viewings, then updates the same file after each shortlist change.',
        'The final choice is easier to explain because the assumptions and trade-offs are visible.',
      ],
      practice: 'Add dates, links and reasons so the document stays useful after the first decision.',
      meta: 'Property template guide with decision fields, evidence checks, examples and next steps.',
    },
  };

  let focus = { ...(defaults[topic.category] || defaults.Buying) };

  if (city) {
    focus = {
      ...focus,
      directAnswer: `a ${city} shortlist should be built from live homes, commute reality, budget and local fit rather than reputation alone.`,
      primaryAction: `Compare ${city} areas with the same criteria: monthly cost, door-to-door commute, street feel, available property quality and viewing availability.`,
      takeaway: `A ${city} shortlist should be built from live homes, commute reality and local fit, not reputation alone.`,
      evidence: `Use live ${city} listings, commute checks, viewing notes and current property condition as the decision evidence.`,
      checklistStart: `Write the exact ${city} areas you are considering, plus the maximum monthly cost and commute limit.`,
      framework: `Use a ${city} shortlist matrix with commute, maximum monthly cost, property condition, transport resilience, school or lifestyle needs and viewing availability.`,
      mistake: `Choosing a ${city} area from reputation alone instead of testing commute, budget and current listing quality.`,
      example: [
        `Example: a renter comparing ${city} areas sets a maximum monthly rent, a 45-minute commute cap and two lifestyle requirements before opening listings.`,
        `They save three areas, record why each one fits or fails, check live property condition through photos or tours, then contact only agents with listings that meet the written criteria.`,
      ],
      practice: `Save the ${city} areas you reject as well as the areas you like. Rejection notes make the next search sharper and prevent repeating the same viewing mistakes.`,
      meta: `${city} property guide with area shortlist criteria, commute checks, budget trade-offs and next steps.`,
    };
  }

  const apply = (needles, patch) => {
    if (needles.some((needle) => title.includes(needle))) {
      focus = { ...focus, ...patch };
    }
  };

  apply(['choose an estate agent'], {
    directAnswer: 'choosing an estate agent is a scoring exercise, not a popularity contest.',
    primaryAction: 'Compare valuation evidence, marketing reach, fee structure, tie-in period, viewing process and follow-up cadence before instructing.',
    takeaway: 'The right agent is the one whose evidence, contract terms and operating rhythm match the sale you actually need.',
    evidence: 'Ask each agent for comparable evidence, marketing examples, viewing plan, review cadence, fee terms and contract exit wording.',
    checklistStart: 'Shortlist agents only after you have the valuation method, marketing plan, fee terms and tie-in period in writing.',
    framework: 'Score each agent across evidence quality, marketing plan, communication rhythm, contract risk and likely buyer reach.',
    mistake: 'Choosing the highest valuation without checking the comparable evidence and contract terms behind it.',
    example: [
      'Example: a seller compares three agents on the same sheet: valuation evidence, portal and buyer strategy, fee, tie-in period, review plan and contract notice.',
      'The winning agent is not automatically the cheapest or highest valuation; it is the one with the clearest route to qualified buyers and accountable follow-up.',
    ],
    practice: 'Before instructing, ask the preferred agent to summarise the first 14 days of marketing, the review point and what evidence would trigger a price or messaging change.',
    meta: 'Estate agent selection guide with valuation evidence, fee terms, marketing checks, contract risks and seller checklist.',
  });

  apply(['estate agent fees'], {
    directAnswer: 'estate agent fees should be compared alongside service, contract risk and the evidence behind the proposed asking price.',
    primaryAction: 'Check commission, VAT, tie-in period, withdrawal fees, sole-agency wording and what marketing activity is included.',
    takeaway: 'A lower fee can cost more if the contract is restrictive or the agent does not have a clear plan to reach qualified buyers.',
    evidence: 'Keep the fee quote, VAT treatment, contract terms, marketing inclusions and valuation evidence side by side.',
    checklistStart: 'Write the full cost of each agent proposal, including VAT and any withdrawal or marketing fees.',
    framework: 'Compare fee, service scope, tie-in period, exit terms, valuation proof and weekly reporting before instructing.',
    mistake: 'Comparing headline percentage only and missing VAT, tie-in, sole-agency or withdrawal terms.',
    example: [
      'Example: one agent quotes a lower percentage but has a long tie-in and weak reporting, while another costs more but offers clearer evidence and review points.',
      'The seller compares total cost, risk and service before deciding whether the saving is real.',
    ],
    practice: 'Ask for a plain-English contract summary before signing: fee, VAT, tie-in, termination, marketing inclusions and what happens if you find the buyer yourself.',
    meta: 'Estate agent fee guide with contract terms, VAT checks, service comparison and seller decision checklist.',
  });

  apply(['sell my house fast'], {
    directAnswer: 'a fast sale needs preparation and pricing discipline, not panic pricing.',
    primaryAction: 'Prepare documents, fix visible defects, set a defensible asking price and define the evidence that would trigger a change.',
    takeaway: 'Speed improves when the home is ready, the price is explainable and buyer questions have answers before launch.',
    evidence: 'Use comparable sales, condition notes, document readiness and early viewing feedback to judge whether the plan is working.',
    checklistStart: 'Prepare the sale file before launch: price evidence, documents, room readiness and feedback review date.',
    framework: 'Use a speed-with-control plan: ready the file, launch with a defensible price, review feedback quickly and adjust only with evidence.',
    mistake: 'Dropping price before fixing presentation, missing documents or poor buyer follow-up.',
    example: [
      'Example: a seller needs a quick sale, so the agent prepares documents, photography, launch price evidence and a seven-day feedback review before the listing goes live.',
      'The first adjustment is based on enquiry quality and viewing feedback, not fear.',
    ],
    practice: 'Use a short review cycle: what enquiries came in, what buyers asked, what objections repeated and what action follows.',
    meta: 'Fast house sale guide with preparation checklist, pricing discipline, buyer feedback and next steps.',
  });

  apply(['best time to list'], {
    directAnswer: 'the best listing time is when demand signals, presentation readiness and price evidence align.',
    primaryAction: 'Check recent comparables, local listing competition, seasonal timing, document readiness and the first-review date before launch.',
    takeaway: 'Timing matters, but a prepared listing with strong evidence beats a seasonal guess.',
    evidence: 'Use comparable sales, competing listings, enquiry quality, viewing availability and document readiness.',
    checklistStart: 'Record the launch window, competing supply, price evidence and the first feedback review date.',
    framework: 'Use a launch-readiness test: market signal, property readiness, document readiness, pricing evidence and review cadence.',
    mistake: 'Waiting for a perfect season while presentation, paperwork or pricing evidence remains weak.',
    example: [
      'Example: a seller compares two launch windows by local stock, recent price reductions, school-holiday timing, document status and photography readiness.',
      'The chosen date is the one where the listing can launch strongly and be reviewed quickly.',
    ],
    practice: 'Set the first review date before launch so timing decisions do not drift into hope.',
    meta: 'Best time to list guide with seasonality, demand signals, price evidence and seller launch checklist.',
  });

  apply(['property valuation', 'data-led valuations'], {
    directAnswer: 'a valuation is stronger when it explains the evidence, not just the final number.',
    primaryAction: 'Compare recent evidence, condition adjustments, buyer demand, competing listings and the confidence range behind the recommendation.',
    takeaway: 'A useful valuation shows what would change the number and how quickly the market will test it.',
    evidence: 'Keep comparable sales, listing competition, condition notes, viewing feedback and price-change triggers in the file.',
    checklistStart: 'Ask what evidence supports the valuation and what evidence would change it.',
    framework: 'Use a valuation evidence stack: sold comparables, active competition, condition adjustment, demand signal and review trigger.',
    mistake: 'Treating a valuation as precise when it is really a range with assumptions.',
    example: [
      'Example: an agent explains a valuation with three sold comparables, two active competitors, condition differences and a two-week feedback trigger.',
      'The seller understands both the asking price and the evidence that would justify changing it.',
    ],
    practice: 'Write the valuation as a range with assumptions. That makes later price conversations calmer and more credible.',
    meta: 'Property valuation guide with comparable evidence, pricing range, demand signals and seller checklist.',
  });

  apply(['virtual tours'], {
    directAnswer: 'a virtual tour works when each room has a clear purpose and buyers can trust what they are seeing.',
    primaryAction: 'Prepare light, layout, clutter, route, repair notes and document answers before photography or 3D capture.',
    takeaway: 'Virtual tours convert better when the home is visually clear and the follow-up evidence is ready.',
    evidence: 'Use room-by-room notes, repair fixes, EPC, leasehold or warranty documents and the agent viewing script.',
    checklistStart: 'Walk the route a buyer will see online and remove anything that creates confusion or avoidable questions.',
    framework: 'Use the screen-first test: if a buyer cannot understand the room, light, storage or condition online, fix it before capture.',
    mistake: 'Treating a virtual tour as a camera task when the real work is room preparation and buyer confidence.',
    example: [
      'Example: a seller prepares the entrance, living space, kitchen, bedrooms and documents before the virtual-tour appointment.',
      'The agent can then answer buyer questions from the same evidence shown in the tour.',
    ],
    practice: 'Create a room note for every space: purpose, best angle, repair issue, document answer and likely buyer question.',
    meta: 'Virtual tour preparation guide with room checklist, lighting, document readiness and seller next steps.',
  });

  apply(['seller disclosure'], {
    directAnswer: 'seller disclosure is about reducing delay by knowing which documents buyers and solicitors will ask for.',
    primaryAction: 'Prepare title, leasehold, works, warranties, permissions, disputes and service-charge notes before offer pressure starts.',
    takeaway: 'A disclosure file reduces surprises after offer and helps the agent answer buyer questions consistently.',
    evidence: 'Keep the management pack status, EPC, warranties, permissions, notices, disputes and service-charge evidence together.',
    checklistStart: 'List the documents a buyer or solicitor is likely to request, then mark received, requested or missing.',
    framework: 'Use a disclosure tracker: document, owner, requested date, received date, gap and buyer-facing explanation.',
    mistake: 'Waiting until after offer to discover missing leasehold, works or warranty evidence.',
    example: [
      'Example: a seller creates a disclosure tracker before launch and identifies a missing permission document early.',
      'The agent can explain the status honestly rather than losing momentum after an offer.',
    ],
    practice: 'Keep a short explanation for every missing item: what is missing, who has been asked and when it will be reviewed.',
    meta: 'Seller disclosure guide with document checklist, solicitor questions, evidence tracker and next steps.',
  });

  apply(['price reduction'], {
    directAnswer: 'a price reduction should be a message based on evidence, not a silent admission that the first price failed.',
    primaryAction: 'Review enquiry quality, viewing feedback, competing listings and time-on-market before changing price or wording.',
    takeaway: 'A good reduction explains the new opportunity and is backed by buyer feedback and comparable evidence.',
    evidence: 'Use viewing notes, portal performance, competing listings, comparable evidence and agent feedback themes.',
    checklistStart: 'Record the exact evidence for a price change: low enquiry quality, repeated objection, competition or timing issue.',
    framework: 'Use a feedback-led reduction: diagnose the blocker, set the new price, update the message and review buyer response quickly.',
    mistake: 'Reducing price without changing the listing story, photos, buyer targeting or follow-up plan.',
    example: [
      'Example: viewings are happening but buyers keep citing a competing home with better condition at a similar price.',
      'The agent adjusts the asking price and rewrites the message around value, readiness and viewing urgency.',
    ],
    practice: 'Pair every price change with a message change and a review date, otherwise you only change the number.',
    meta: 'Property price reduction guide with feedback signals, pricing evidence, messaging checklist and seller next steps.',
  });

  apply(['leasehold flat'], {
    directAnswer: 'leasehold decisions depend on service charges, ground rent, management information and major-works risk.',
    primaryAction: 'Collect lease terms, management pack status, service-charge accounts, ground rent, building safety notes and likely timeline blockers.',
    takeaway: 'Leasehold risk is manageable when the information is requested early and explained clearly.',
    evidence: 'Use the lease, management pack, service-charge history, ground-rent terms, planned works and solicitor questions.',
    checklistStart: 'Request leasehold information early and track every missing management-pack item.',
    framework: 'Use a leasehold file check: lease terms, costs, works, restrictions, management quality and timeline risk.',
    mistake: 'Treating a leasehold flat like a freehold sale or purchase until late-stage paperwork slows everything down.',
    example: [
      'Example: a seller orders the management pack before listing and flags a planned works question before offer.',
      'The buyer receives clearer information and the solicitor has fewer late surprises.',
    ],
    practice: 'Keep the leasehold file separate from the general sale file so service-charge and management questions are easy to find.',
    meta: 'Leasehold flat guide with management pack, service charge, ground rent, major works and timeline checks.',
  });

  apply(['renters rights act', 'section 21', 'periodic tenancies', 'rent in advance', 'rental bidding', 'pet requests', 'discrimination', 'prs landlord database', 'ombudsman', 'rent review notices', 'end-of-tenancy notice'], {
    directAnswer: 'Renters Rights Act decisions should start with the implementation stage and the exact notice, rent request or tenancy action being questioned.',
    primaryAction: 'Match the issue to the current GOV.UK guidance, save the dates and ask for the next step in writing.',
    takeaway: 'The reform detail matters: the right answer depends on timing, document wording and the type of tenancy action.',
    evidence: 'Use the notice or request, tenancy agreement, date sequence, official implementation guidance and written replies.',
    checklistStart: 'Save the notice, request or message and write the date it was received before responding.',
    framework: 'Use a timing-and-scope check: reform stage, tenancy type, document wording, requested action and written response.',
    mistake: 'Assuming every reform applies immediately or in the same way to every tenancy action.',
    example: [
      'Example: a renter receives a tenancy-related notice, saves the wording, checks the reform implementation date and asks the agent for clarification in writing.',
      'The dated record makes the next advice conversation faster and more accurate.',
    ],
    practice: 'Keep the discussion narrow: quote the document, state the date and ask for the specific correction, explanation or next action.',
    meta: 'Renters Rights Act guide with implementation timing, notice checks, evidence pack and practical next steps.',
  });

  apply(['tenant fees', 'holding deposit'], {
    directAnswer: 'fees and holding deposits should be checked before money moves, because wording and timing decide what is allowed.',
    primaryAction: 'Save the fee request, amount, date, listing, agent identity and the reason given for any deduction.',
    takeaway: 'A fee question is safest when the amount, timing, legal basis and refund condition are all written down.',
    evidence: 'Use the listing, payment request, receipt, tenancy status, messages and GOV.UK tenant-fee guidance.',
    checklistStart: 'Write the requested amount, who requested it, what it is for and whether the refund terms are clear.',
    framework: 'Use a fee check: amount, purpose, timing, permitted basis, refund condition and written confirmation.',
    mistake: 'Paying a fee or deposit without saving the terms and refund condition first.',
    example: [
      'Example: a renter is asked for a holding deposit and saves the listing, payment request and refund wording before paying.',
      'If the application changes, the renter has a clear record of what was agreed.',
    ],
    practice: 'Before paying, ask for the fee purpose and refund condition in writing. A legitimate process should be able to explain both plainly.',
    meta: 'Tenant fee and holding deposit guide with allowed-fee checks, refund evidence and renter next steps.',
  });

  apply(['deposit'], {
    directAnswer: 'deposit decisions are evidence decisions: protection details, inventory, condition photos and message dates matter most.',
    primaryAction: 'Save the protection certificate, prescribed information, inventory, check-in photos, check-out notes and dispute messages.',
    takeaway: 'Deposit outcomes improve when condition evidence is dated and organised before a disagreement starts.',
    evidence: 'Use deposit protection details, inventory, dated photos, cleaning or repair receipts and landlord or agent messages.',
    checklistStart: 'Check where the deposit is protected and save the certificate or scheme details.',
    framework: 'Use a deposit evidence pack: protection, inventory, photos, messages, deductions and response deadline.',
    mistake: 'Waiting until move-out to gather evidence that should have been saved at move-in.',
    example: [
      'Example: a renter saves check-in photos, the inventory and deposit scheme details in one folder.',
      'When deductions are proposed, the response can point to dated evidence instead of memory.',
    ],
    practice: 'Label photos by room and date. Small organisation at move-in can make a dispute much easier later.',
    meta: 'Tenancy deposit guide with protection checks, evidence pack, dispute steps and renter checklist.',
  });

  apply(['right to rent'], {
    directAnswer: 'Right to Rent is a workflow with identity evidence, timing and audit trail, not a casual document request.',
    primaryAction: 'Use the correct check route, record the date, store evidence securely and schedule follow-up checks when needed.',
    takeaway: 'Right to Rent quality depends on using the current process and keeping a clean audit trail.',
    evidence: 'Use official check guidance, identity evidence, check date, checker name and follow-up trigger.',
    checklistStart: 'Confirm which Right to Rent check route applies before requesting or storing documents.',
    framework: 'Use a check log: route, document or share code, date, checker, outcome and repeat-check date.',
    mistake: 'Collecting documents without confirming the correct check route or retention requirement.',
    example: [
      'Example: a letting agency records the check route, date, checker and repeat-check trigger before move-in.',
      'The file can be audited later without relying on inbox memory.',
    ],
    practice: 'Keep the check log separate from casual tenant correspondence so audit evidence is easy to locate.',
    meta: 'Right to Rent guide with check route, audit trail, document handling and letting agency workflow.',
  });

  apply(['damp', 'mould', 'repairs', 'awaabs'], {
    directAnswer: 'repair and damp issues need a dated evidence trail that shows what happened, what was reported and what changed.',
    primaryAction: 'Record photos, dates, affected rooms, health or safety concern, landlord response and follow-up request in writing.',
    takeaway: 'Repair outcomes improve when the issue is described clearly and followed up against dates, not emotion.',
    evidence: 'Use dated photos, videos, messages, repair visits, recurrence notes and relevant safety guidance.',
    checklistStart: 'Start a dated repair log with photos, room names, messages and every response.',
    framework: 'Use a repair trail: issue, date reported, evidence, requested action, response, visit and unresolved risk.',
    mistake: 'Reporting a serious condition issue informally and then having no record of dates or promises.',
    example: [
      'Example: a renter photographs damp in the bedroom, sends a written repair request and records every response or missed visit.',
      'The evidence trail makes escalation clearer if the problem is not resolved.',
    ],
    practice: 'Keep messages factual: what is affected, when it was noticed, what action is requested and when you will review the response.',
    meta: 'Damp, mould and repair guide with evidence log, reporting workflow, safety checks and next steps.',
  });

  apply(['stamp duty', 'sdlt'], {
    directAnswer: 'stamp duty planning should use the actual buyer position and property use, not a rough percentage guess.',
    primaryAction: 'Check buyer status, additional-property rules, purchase price, timing and refund conditions before setting the budget.',
    takeaway: 'The SDLT answer can change when buyer status, additional-property ownership or timing changes.',
    evidence: 'Use purchase price, buyer status, ownership position, completion timing and the current GOV.UK SDLT rates.',
    checklistStart: 'Write the buyer status, purchase price and whether any other property is owned before using a calculator.',
    framework: 'Use an SDLT check: buyer status, property price, additional-property status, relief, timing and refund route.',
    mistake: 'Budgeting from a generic calculator without checking additional-property or refund rules.',
    example: [
      'Example: a buyer models the purchase twice: once as a main residence and once with additional-property assumptions.',
      'The difference changes the cash needed at completion and whether a refund route matters.',
    ],
    practice: 'Keep the calculation date and assumptions with the budget so a broker, solicitor or adviser can review them quickly.',
    meta: 'Stamp Duty guide with SDLT assumptions, buyer examples, refund checks and budget next steps.',
  });

  apply(['survey', 'snagging', 'flood risk', 'epc rating', 'period home', 'garden office', 'accessible homes'], {
    directAnswer: 'property-condition decisions should turn viewing impressions into specific checks before offer, renegotiation or completion.',
    primaryAction: 'Record the visible issue, the specialist check needed, likely cost range and whether it changes price or appetite.',
    takeaway: 'Condition risk is manageable when each concern becomes a check, cost allowance or reason to walk away.',
    evidence: 'Use viewing notes, photos, survey advice, specialist quotes, EPC or flood-risk records and solicitor questions.',
    checklistStart: 'List every condition or access issue that could change price, timing, insurance or daily use.',
    framework: 'Use a condition-risk log: issue, evidence, specialist check, likely cost, urgency and decision impact.',
    mistake: 'Treating a viewing impression as enough proof for a repair, access or survey decision.',
    example: [
      'Example: a buyer notices damp staining and logs the room, photo, survey question and renegotiation trigger before making a final offer.',
      'The issue becomes manageable because the next check is clear.',
    ],
    practice: 'Ask one clear question for every concern: what evidence would let me proceed, renegotiate or walk away?',
    meta: 'Property condition guide with viewing checks, survey questions, risk log and buyer next steps.',
  });

  apply(['mortgage', 'agreement in principle', 'affordability calculator'], {
    directAnswer: 'finance fit should be checked before viewing momentum turns into an offer you cannot comfortably support.',
    primaryAction: 'Compare deposit, monthly cost, stress scenario, fees, bills and lender assumptions before committing.',
    takeaway: 'A home is affordable only if it still works after realistic monthly costs and a less comfortable rate scenario.',
    evidence: 'Use agreement-in-principle details, deposit proof, rate assumption, fees, bills estimate and income stability.',
    checklistStart: 'Write the maximum monthly cost and cash needed before viewing homes at the top of the budget.',
    framework: 'Use a finance-fit check: deposit, borrowing, monthly payment, stress rate, fees, bills and contingency.',
    mistake: 'Treating the top borrowing amount as the same thing as a comfortable purchase budget.',
    example: [
      'Example: a buyer has an agreement in principle but models the payment again with service charge, bills and a higher-rate scenario.',
      'The adjusted budget changes which homes are worth viewing.',
    ],
    practice: 'Keep a simple affordability note beside the shortlist so every viewing is judged against the real monthly number.',
    meta: 'Property affordability guide with mortgage checks, budget stress test, buyer examples and next steps.',
  });

  apply(['lead generation', 'local seo', 'portal', 'review engine', 'listing descriptions', 'crm', 'lead-quality', 'co-broking', 'virtual tours for estate agents', 'response time', 'fall-throughs'], {
    directAnswer: 'agency growth work should be judged by qualified progress, not by activity that looks busy.',
    primaryAction: 'Track the source, response quality, qualification, next action, client update and outcome for each lead or file.',
    takeaway: 'A useful agency system shows where revenue-quality work is created and where momentum is lost.',
    evidence: 'Use source tags, response times, lead qualification, viewing conversion, document status and client feedback.',
    checklistStart: 'Define the workflow stage and the next useful action before optimising the channel or script.',
    framework: 'Use a quality funnel: source, first response, qualification, viewing, evidence, offer or instruction, follow-up.',
    mistake: 'Optimising for traffic, forms or messages without checking whether they create serious appointments or client outcomes.',
    example: [
      'Example: an agency compares two lead sources by booked viewings, qualified budgets, response time and seller update quality.',
      'The team invests in the source that creates progress, not the source with the largest raw count.',
    ],
    practice: 'Review the workflow weekly and remove the bottleneck that slows the next action: response, qualification, documents or client update.',
    meta: 'Estate agency growth guide with lead-quality workflow, response standards, conversion checks and next steps.',
  });

  apply(['yield', 'limited company', 'mees', 'hmo', 'student accommodation', 'build-to-rent', 'short-term lets', 'regeneration', 'portfolio stress', 'exit strategy', 'green rental', 'due diligence'], {
    directAnswer: 'investment quality depends on realistic operating assumptions, compliance cost and exit flexibility.',
    primaryAction: 'Stress-test rent, voids, repairs, finance, tax, management, regulation and exit before comparing headline returns.',
    takeaway: 'The best investment shortlist survives a downside test before the optimistic upside is considered.',
    evidence: 'Use conservative rent evidence, full cost assumptions, compliance requirements, tax notes and an exit scenario.',
    checklistStart: 'Write the downside case first: lower rent, void period, repair cost, finance pressure and slower exit.',
    framework: 'Use an investment score: net income, compliance cost, management load, finance stress, tenant demand and exit route.',
    mistake: 'Buying the story before checking whether the numbers survive realistic ownership costs.',
    example: [
      'Example: an investor compares two properties after adding voids, repairs, management, finance stress and exit tax assumptions.',
      'The lower headline yield may be the stronger deal if the risk and management load are lower.',
    ],
    practice: 'Keep one page for the investment case and one page for the failure case. The gap between them is the real decision.',
    meta: 'Property investment guide with downside modelling, compliance checks, yield evidence and next steps.',
  });

  apply(['calculator', 'template', 'scorecard', 'rubric', 'prompts', 'market data sources', 'shock map', 'analysis sheet'], {
    directAnswer: 'a tool improves decisions only when the inputs are specific, dated and reviewed against real evidence.',
    primaryAction: 'Fill in assumptions, evidence links, comparison options, decision owner and review date before using the output.',
    takeaway: 'The value is not the template itself; it is the discipline of recording assumptions and updating them.',
    evidence: 'Use dated assumptions, source links, comparable options, calculation notes and the final decision reason.',
    checklistStart: 'Name the decision, the input source and the date when the tool should be refreshed.',
    framework: 'Use a tool-quality check: decision, data source, assumption, comparison option, result and review trigger.',
    mistake: 'Letting a spreadsheet or prompt produce a confident answer from weak or outdated inputs.',
    example: [
      'Example: a renter fills a budget calculator with rent, deposit, bills, travel and moving costs, then updates it after finding a real listing.',
      'The tool becomes a live decision record instead of a generic estimate.',
    ],
    practice: 'Add a short note beside every calculated result: what assumption matters most and when it should be checked again.',
    meta: 'Property tool guide with input checks, decision log, examples, templates and next steps.',
  });

  return focus;
}

function buildAnswer(topic) {
  const reader = topic.audience.toLowerCase();
  const focus = buildTopicFocus(topic);
  return `For ${reader}, the practical answer is this: ${focus.directAnswer} ${focus.primaryAction} Use the guide below to check the evidence, avoid the common failure point and leave with a next action you can explain clearly.`;
}

function buildTakeaways(topic) {
  const focus = buildTopicFocus(topic);
  const city = cityFromTitle(topic.title);
  const categoryTakeaway = {
    Selling: 'A stronger sale starts with evidence, clear terms and a written reason for the route chosen.',
    Agents: 'The best agency process is visible: every enquiry, viewing, document and follow-up should have an owner and next action.',
    Buying: 'A good property decision balances desire with survey risk, finance fit, running costs and legal complexity.',
    Renting: 'A good rental decision checks the home, the money route, the terms and the evidence before an application is submitted.',
    Compliance: 'A compliance task is only complete when the current source, document, owner and review date are visible.',
    'Renters Rights': 'Rights are easier to use when dates, notices, photos and messages are saved before any dispute starts.',
    Investing: 'Investment quality depends on the downside case, not the best-case yield.',
    'Market Data': 'Market data is useful when it is paired with current listing evidence and local demand signals.',
    'Local Guides': city ? `A ${city} shortlist should be built from live homes, commute reality and local fit, not reputation alone.` : 'A location shortlist should be built from live homes, commute reality and local fit, not reputation alone.',
    'Tools and Templates': 'A template is most useful when it captures assumptions, evidence and the next decision date.',
  };
  return [
    focus.takeaway,
    categoryTakeaway[topic.category] || categoryTakeaway.Buying,
    `Use the ${topic.asset} to record the source, decision, owner and review date in one place.`,
    `Evidence to keep: ${lowerFirst(focus.evidence)}`,
  ];
}

function buildDefinitions(topic) {
  const definitions = {
    Selling: [
      { term: 'Buyer friction', definition: 'Anything that makes a serious buyer hesitate, ask for more proof, delay an offer or reduce confidence after viewing.' },
      { term: 'Launch pack', definition: 'The photos, room preparation, documents, price evidence and answers prepared before a property is marketed.' },
    ],
    Agents: [
      { term: 'Lead quality', definition: 'A measure of whether an enquiry is likely to become a serious viewing, offer, instruction or managed follow-up.' },
      { term: 'Workflow owner', definition: 'The person responsible for the next action, deadline and evidence in an agency process.' },
    ],
    Buying: [
      { term: 'Decision matrix', definition: 'A simple scorecard that compares homes using the same criteria instead of relying on memory after viewings.' },
      { term: 'Material risk', definition: 'A survey, finance, legal or running-cost issue large enough to change the offer, timing or decision to proceed.' },
    ],
    Renting: [
      { term: 'Application pack', definition: 'The documents, references and written answers a renter prepares before applying for a home.' },
      { term: 'Upfront cost', definition: 'The rent, deposit, holding deposit, bills and moving costs needed before or near move-in.' },
    ],
    Compliance: [
      { term: 'Evidence trail', definition: 'The dated source, document, message or certificate proving that a required step was completed.' },
      { term: 'Review date', definition: 'The date a document or rule should be checked again before marketing, renewal, move-in or completion.' },
    ],
    'Renters Rights': [
      { term: 'Written record', definition: 'A saved message, notice, photo or document that proves what happened and when.' },
      { term: 'Implementation date', definition: 'The date a new rule starts to apply in practice, which can differ by reform stage.' },
    ],
    Investing: [
      { term: 'Downside case', definition: 'A conservative model that includes voids, repairs, finance cost, tax and slower exit assumptions.' },
      { term: 'Net yield', definition: 'Income after realistic ownership costs, not the headline rent divided by purchase price.' },
    ],
    'Market Data': [
      { term: 'Lagging data', definition: 'Official data that is reliable but published after market behaviour has already moved.' },
      { term: 'Live signal', definition: 'Current listing, viewing, price-change or enquiry evidence that helps interpret official data.' },
    ],
    'Local Guides': [
      { term: 'Shortlist area', definition: 'A location that fits budget, commute, lifestyle and current property quality well enough to justify viewings.' },
      { term: 'Commute tolerance', definition: 'The journey length and reliability a household can realistically accept several times a week.' },
    ],
    'Tools and Templates': [
      { term: 'Decision log', definition: 'A dated note explaining the assumptions, evidence and reason behind each choice.' },
      { term: 'Refresh point', definition: 'The date when the inputs should be checked again because prices, rules or availability may have changed.' },
    ],
  };
  return [
    ...(definitions[topic.category] || definitions.Buying),
    { term: topic.asset, definition: `A practical output for ${topic.audience.toLowerCase()} to record evidence, compare options and decide the next action.` },
  ];
}

function buildSteps(topic) {
  const focus = buildTopicFocus(topic);
  return uniqueSentences([
    focus.checklistStart,
    focus.primaryAction,
    `Turn the evidence into a record: ${lowerFirst(focus.evidence)}`,
    focus.framework,
    `Fill in the ${topic.asset} with dates, assumptions, links and unanswered questions.`,
    `Before committing, write down the main risk: ${lowerFirst(focus.mistake)}`,
    'Decide the next action, owner and review date before moving to the next stage.',
  ]).slice(0, 6);
}

function buildDecisionTable(topic) {
  const city = cityFromTitle(topic.title);
  const tables = {
    Selling: {
      heading: 'Seller Decision Table',
      headers: ['Area to prepare', 'What good looks like', 'Why it matters'],
      rows: [
        ['Rooms', 'Clean, bright, uncluttered, with a clear purpose for every space', 'Buyers understand the home faster and ask fewer basic questions.'],
        ['Documents', 'EPC, leasehold pack, warranties, permissions and service-charge notes gathered early', 'Missing paperwork often creates delay after an offer.'],
        ['Price evidence', 'Recent comparable sales, condition notes and feedback plan ready before launch', 'The asking price is easier to defend and adjust calmly.'],
        ['Viewing story', 'A simple explanation of strengths, compromises and likely buyer questions', 'The agent can present the home consistently online and in person.'],
      ],
    },
    Agents: {
      heading: 'Agency Workflow Table',
      headers: ['Workflow point', 'What to track', 'Useful standard'],
      rows: [
        ['Source', 'Portal, referral, organic search, repeat client or campaign', 'Know which channels create serious work, not just volume.'],
        ['Speed', 'Time from enquiry to useful reply', 'Fast replies matter only when they include the right next step.'],
        ['Qualification', 'Budget, readiness, property fit, documents and motivation', 'Weak qualification creates wasted viewings and poor client updates.'],
        ['Follow-up', 'Owner, deadline and message history', 'No lead or file should rely on memory.'],
      ],
    },
    Buying: {
      heading: 'Buyer Risk Table',
      headers: ['Risk area', 'What to check', 'Decision signal'],
      rows: [
        ['Finance', 'Mortgage fit, deposit, monthly cost and rate sensitivity', 'The home should still work after realistic costs.'],
        ['Survey', 'Condition, age, damp, roof, structure and repair allowance', 'Survey risk can change offer price or appetite.'],
        ['Legal', 'Leasehold, title, chain, permissions and management information', 'Legal complexity can affect timing and resale.'],
        ['Location', 'Commute, schools, transport, noise, amenities and future plans', 'A good home in the wrong setting is still a weak fit.'],
      ],
    },
    Renting: {
      heading: 'Rental Decision Table',
      headers: ['Decision area', 'What to check', 'Why it matters'],
      rows: [
        ['Affordability', 'Rent, deposit, bills, commute and first-month cash', 'A rental should work after moving costs, not only on monthly rent.'],
        ['Condition', 'Damp, heating, appliances, storage, safety alarms and repairs', 'Photos can hide issues that affect daily living.'],
        ['Terms', 'Holding deposit, tenancy length, pets, guests, bills and notice points', 'Unclear terms can become expensive later.'],
        ['Application', 'Documents, references, right-to-rent checks and move-in date', 'Prepared renters move faster without sending money blindly.'],
      ],
    },
    Compliance: {
      heading: 'Compliance File Table',
      headers: ['File item', 'What to prove', 'Review trigger'],
      rows: [
        ['Source', 'Current official guidance or professional standard saved with a date', 'Rules and guidance can change.'],
        ['Document', 'Certificate, notice, check, message or signed record stored in the file', 'A requested item is not the same as a received item.'],
        ['Owner', 'Named person responsible for follow-up', 'Shared responsibility often means no responsibility.'],
        ['Blocker', 'Whether marketing, move-in, renewal or completion depends on this item', 'Blocked steps need earlier attention.'],
      ],
    },
    'Renters Rights': {
      heading: 'Renter Evidence Table',
      headers: ['Evidence', 'What to save', 'How it helps'],
      rows: [
        ['Dates', 'Notice dates, message dates, visit dates and repair dates', 'Dates make the sequence clear.'],
        ['Documents', 'Tenancy agreement, deposit details, certificates and notices', 'Documents show what was promised or required.'],
        ['Condition', 'Photos, videos and written repair notes', 'Condition evidence is stronger when captured early.'],
        ['Messages', 'Emails, app messages, letters and call summaries', 'Written records reduce confusion in disputes.'],
      ],
    },
    Investing: {
      heading: 'Investment Stress Table',
      headers: ['Assumption', 'Conservative input', 'Question to answer'],
      rows: [
        ['Rent', 'Use achievable rent after comparable evidence, not the highest advert', 'Would demand still exist at this rent?'],
        ['Voids', 'Include at least one empty period or slower reletting scenario', 'Does cash flow survive downtime?'],
        ['Repairs', 'Set an annual reserve and one larger surprise cost', 'Is maintenance being underpriced?'],
        ['Exit', 'Model a slower sale, refinance or hold period', 'Can you leave the deal without panic?'],
      ],
    },
    'Market Data': {
      heading: 'Market Signal Table',
      headers: ['Signal', 'What it tells you', 'What it does not prove'],
      rows: [
        ['Official data', 'Direction, trend and historical context', 'The exact price a current buyer or renter will accept.'],
        ['Live listings', 'Current asking behaviour and supply', 'Completed transaction values.'],
        ['Viewing feedback', 'Real demand and objections', 'Whole-market movement on its own.'],
        ['Price changes', 'Seller or landlord confidence', 'Whether the final deal will complete.'],
      ],
    },
    'Local Guides': {
      heading: `${city || 'Area'} Shortlist Table`,
      headers: ['Shortlist factor', 'What to compare', 'Red flag'],
      rows: [
        ['Budget', 'Monthly cost, deposit, bills and travel', 'The area works only before real costs are added.'],
        ['Commute', 'Door-to-door time, reliability and late-night options', 'The route is fine once but painful every week.'],
        ['Property quality', 'Space, light, condition, storage and noise', 'The area is attractive but the available homes are weak.'],
        ['Lifestyle fit', 'Schools, parks, shops, safety perception and social needs', 'The home solves one need while creating another.'],
      ],
    },
    'Tools and Templates': {
      heading: 'Template Use Table',
      headers: ['Template field', 'What to enter', 'Quality check'],
      rows: [
        ['Goal', 'The exact decision and deadline', 'A stranger could understand what the tool is for.'],
        ['Evidence', 'Links, documents, notes, photos or calculations', 'Every major claim has a source.'],
        ['Options', 'At least two comparable choices', 'The same criteria are used for each option.'],
        ['Decision log', 'Reason, owner and next review date', 'The choice can be revisited without guessing.'],
      ],
    },
  };
  return tables[topic.category] || tables.Buying;
}

function buildChecklist(topic) {
  const city = cityFromTitle(topic.title);
  const focus = buildTopicFocus(topic);
  const firstByCategory = {
    Selling: 'Define what the home must prove online before a serious buyer books or attends a viewing.',
    Agents: 'Define the client outcome, workflow owner and next action before measuring the channel or campaign.',
    Buying: 'Define the offer decision you are trying to make, including the maximum risk or delay you can accept.',
    Renting: 'Define the rental fit you need: monthly cost, move-in date, commute, condition and application readiness.',
    Compliance: 'Define the file outcome: the required proof, the owner and the review date.',
    'Renters Rights': 'Define the practical outcome you need, such as a repair, explanation, document, correction or written reply.',
    Investing: 'Define the downside case the deal must survive before looking at the optimistic return.',
    'Market Data': 'Define the market question you are answering, then separate official trend data from live listing evidence.',
    'Tools and Templates': 'Define the decision the template must support and the date the inputs should be reviewed.',
  };
  const first = city
    ? `Write the exact ${city} areas you are considering, plus the maximum monthly cost and commute limit.`
    : focus.checklistStart || firstByCategory[topic.category] || firstByCategory.Buying;
  return uniqueSentences([
    first,
    `Evidence folder: ${lowerFirst(focus.evidence)}`,
    `Record the decision in the ${topic.asset} with a source link, owner and review date.`,
    `Compare the preferred option against one realistic alternative before committing to the ${topic.asset}.`,
    `Write down the trade-off behind the ${topic.asset}: cost, speed, risk, flexibility, condition or certainty.`,
    `Set a review date if ${topic.category.toLowerCase()} facts depend on new listings, replies, documents, rates or official guidance.`,
  ]).slice(0, 6);
}

function buildPracticeGuidance(topic) {
  const focus = buildTopicFocus(topic);
  const guidance = {
    Selling: 'If you are preparing to sell, keep the room notes, document list, price evidence and viewing feedback in one place. A tidy record makes it easier for an agent to answer serious buyers quickly and adjust the plan without panic.',
    Agents: 'If you run the workflow inside a CRM or workspace, make the next action visible: owner, deadline, evidence and client update. The tool matters less than whether the team can see what changed today.',
    Buying: 'When comparing homes, save the shortlist, viewing notes, photos and questions before the second viewing. The aim is to make the offer decision calmer and easier to explain.',
    Renting: 'Before applying, keep the listing, fees, deposit terms, documents and messages together. That makes it easier to move quickly without losing track of what was promised.',
    Compliance: 'For compliance work, the practical habit is simple: source, proof, owner, review date. If one of those is missing, the file is not ready.',
    'Renters Rights': 'For rights questions, the strongest next step is usually a clear written record. Save the facts first, then ask for the specific repair, document, correction or explanation you need.',
    Investing: 'For investment decisions, keep the base case and downside case side by side. A deal that survives realistic stress deserves more attention than one that only works in a best-case spreadsheet.',
    'Market Data': 'For market-data decisions, compare the official source with live listings and your own viewing or enquiry evidence. The best signal is usually the pattern across all three.',
    'Local Guides': 'For local searches, save the areas you reject as well as the areas you like. Rejection notes make the next search sharper and prevent repeating the same viewing mistakes.',
    'Tools and Templates': 'For templates, the value comes from keeping them current. Add dates, links and reasons so the document stays useful after the first decision.',
  };
  const baseGuidance = focus.practice || guidance[topic.category] || guidance.Buying;
  return `${baseGuidance} Estospaces can support this by keeping shortlists, evidence, messages and next actions connected, so the decision stays practical instead of turning into scattered notes.`;
}

function buildSummary(topic) {
  const city = cityFromTitle(topic.title);
  const focus = buildTopicFocus(topic);
  if (city) {
    return `${topic.title} helps ${topic.audience.toLowerCase()} compare real options in ${city}: budget, commute, property quality, local fit and current evidence. It gives a direct answer, a decision table, practical steps, common mistakes, FAQs and useful next reads.`;
  }
  return `${topic.title} helps ${topic.audience.toLowerCase()} make a better property decision with evidence rather than guesswork. It explains ${focus.directAnswer} It also includes practical checks, source notes, common mistakes, examples, FAQs and next reads.`;
}

function buildEvidenceNote(topic) {
  const focus = buildTopicFocus(topic);
  const sourceNames = [...new Set(selectSources(topic.sourceTags).map((source) => source.publisher))].join(', ');
  return `Source check: use this as a working brief, then verify the key claim against ${sourceNames || 'the linked primary source'}. For this topic, ${lowerFirst(focus.evidence)}`;
}

function buildDecisionFramework(topic) {
  const city = cityFromTitle(topic.title);
  const focus = buildTopicFocus(topic);
  const frameworks = {
    'Renters Rights': 'Use a three-part framework: rule, proof and action. First confirm the rule from GOV.UK, then collect proof such as notices, emails, photos or certificates, then decide whether the next action is a message, complaint, application, renewal or professional advice.',
    Compliance: 'Use a weekly compliance board with four columns: required, requested, received and reviewed. A file is not ready until the certificate, notice or document has both a source and a date.',
    Renting: 'Use affordability, condition, rights and speed as the four decision filters. A cheaper rental is not a better rental if the commute, safety evidence or application terms create avoidable risk.',
    Buying: 'Use a red-amber-green matrix for price, survey risk, finance, legal complexity, location and resale value. Anything red needs a renegotiation, specialist check or written reason to proceed.',
    Selling: 'Use the buyer-friction test: if a likely buyer, lender or solicitor will ask for a document later, prepare it before launch or explain the gap in the marketing plan.',
    Agents: 'Use a revenue-quality workflow: source, response time, qualification, viewing quality, compliance status and follow-up. Optimising only for enquiry volume usually creates wasted work.',
    Investing: 'Use downside-first underwriting. Stress-test the deal with a void period, repair reserve, higher finance cost, compliance budget and slower exit before treating the yield as real.',
    'Market Data': 'Use official data for direction and live listings for timing. Neither source is enough alone: official data lags, while current listings can overstate seller or landlord confidence.',
    'Local Guides': city ? `Use a ${city} shortlist matrix with commute, maximum monthly cost, property condition, transport resilience, school or lifestyle needs and viewing availability.` : 'Use a location shortlist matrix with commute, maximum monthly cost, property condition, transport resilience and viewing availability.',
    'Tools and Templates': 'Use the tool as a living record. Save the inputs, date each update and keep a reason log so the final decision can be reviewed later.',
  };
  return focus.framework || frameworks[topic.category] || frameworks.Buying;
}

function buildVerificationList(topic) {
  const city = cityFromTitle(topic.title);
  const focus = buildTopicFocus(topic);
  const items = [
    `Evidence to confirm before acting: ${lowerFirst(focus.evidence)}`,
    `The latest date and wording on the source used for ${topic.title.toLowerCase()}.`,
    `The exact document, calculation, viewing note or message needed for this ${topic.category.toLowerCase()} decision.`,
    `The person responsible for the next action on the ${topic.asset} and the date it should be checked again.`,
  ];
  if (city) {
    items.push(`Current ${city} listing quality, transport practicality and viewing availability, not only city-wide averages.`);
  } else {
    items.push(`A second source or qualified adviser if ${topic.title.toLowerCase()} affects tax, legal rights, mortgage borrowing, safety or a binding contract.`);
  }
  return uniqueSentences(items).slice(0, 5);
}

function buildMistakes(topic) {
  const city = cityFromTitle(topic.title);
  const focus = buildTopicFocus(topic);
  const shared = [
    `Relying on one average figure when ${topic.title.toLowerCase()} depends on condition, timing, documents or local evidence.`,
    `Skipping the official source because a summary about ${topic.category.toLowerCase()} sounds confident.`,
    `Making the next move on ${topic.title.toLowerCase()} without saving evidence, screenshots, notes or calculations.`,
  ];
  const specific = {
    'Local Guides': city ? `Choosing a ${city} area from reputation alone instead of testing commute, budget and current listing quality.` : 'Choosing an area from reputation alone instead of testing commute, budget and current listing quality.',
    Renting: 'Sending money before the listing, agent, fees and deposit route have been checked.',
    Buying: 'Treating an accepted offer as secure before survey, mortgage, legal and chain risks are visible.',
    Selling: 'Changing price without a written reason linked to demand, feedback and comparable evidence.',
    Agents: 'Celebrating enquiry volume without measuring lead quality and response speed.',
    Investing: 'Using gross yield as the decision number before voids, repairs, finance and tax are modelled.',
    Compliance: 'Assuming a document exists because it was requested, rather than confirming it has been received and reviewed.',
    'Renters Rights': 'Acting on a new rule without checking implementation timing and the exact scope.',
    'Tools and Templates': 'Using the template once and not updating the inputs when the facts change.',
  };
  return uniqueSentences([focus.mistake || specific[topic.category] || shared[0], specific[topic.category], ...shared]).slice(0, 4);
}

function buildExampleWorkflow(topic) {
  const city = cityFromTitle(topic.title);
  const focus = buildTopicFocus(topic);
  if (focus.example?.length) return focus.example;
  if (city) {
    return [
      `Example: a renter comparing ${city} areas sets a maximum monthly rent, a 45-minute commute cap and two lifestyle requirements before opening listings.`,
      `They save three areas, record why each one fits or fails, check live property condition through photos or tours, then contact only agents with listings that meet the written criteria.`,
    ];
  }

  const examples = {
    Compliance: [
      'Example: a letting team creates a dated folder for each property with required certificates, notices, right-to-rent checks and move-in documents.',
      'Before marketing or signing, one person reviews the folder and records missing items so the next action is visible.',
    ],
    'Renters Rights': [
      'Example: a renter receives a notice, saves the message, checks the implementation roadmap, records dates and asks the landlord or agent for clarification in writing.',
      'If the answer is unclear, the renter can take the evidence pack to an advice service rather than relying on memory.',
    ],
    Buying: [
      'Example: a buyer scores two homes using the same six checks: price, survey risk, mortgage fit, commute, running costs and resale value.',
      'The higher-priced home may still win if the lower-priced home carries survey or leasehold risks that are expensive to solve.',
    ],
    Selling: [
      'Example: a seller gathers EPC, leasehold, warranties, permissions and comparable evidence before photos are taken.',
      'That preparation gives the agent stronger answers for buyers and can reduce avoidable delay after offer.',
    ],
    Agents: [
      'Example: an agency tags every lead by source, response time, qualification status and viewing outcome.',
      'After two weeks, it can see which channel produces serious viewing requests instead of only counting form fills.',
    ],
    Investing: [
      'Example: an investor tests a deal with one month of void, a repair reserve, a higher interest-rate scenario and the likely exit tax position.',
      'If the deal still works, it deserves deeper due diligence; if not, the investor has avoided a weak purchase.',
    ],
  };
  return examples[topic.category] || examples.Buying;
}

function buildFaq(topic) {
  const focus = buildTopicFocus(topic);
  return [
    {
      question: 'What should I do first?',
      answer: focus.checklistStart,
    },
    {
      question: 'What evidence matters most?',
      answer: `The key evidence is this: ${lowerFirst(focus.evidence)}`,
    },
    {
      question: 'When should I get professional advice?',
      answer: `Use qualified legal, tax, mortgage, survey, safety or tenancy advice when this ${topic.category.toLowerCase()} decision affects money at risk, legal rights, safety, borrowing, tax or a binding contract.`,
    },
    {
      question: 'How should I turn this guide into action?',
      answer: `${focus.practice} Start with a dated ${topic.asset}, then record the next owner, open question and review date.`,
    },
  ];
}

function selectSources(sourceTags) {
  return [...new Set(sourceTags)].map((tag) => SOURCE_LIBRARY[tag]).filter(Boolean);
}

function buildInternalLinks(post, posts, index) {
  const related = post.relatedPostSlugs
    .map((slug) => posts.find((candidate) => candidate.slug === slug))
    .filter(Boolean);
  const sameAudience = posts.filter((candidate) => (
    candidate.slug !== post.slug &&
    candidate.audience === post.audience &&
    !related.some((item) => item.slug === candidate.slug)
  ));
  const categoryHub = {
    title: `${post.category} guides`,
    href: `/blogs?category=${encodeURIComponent(post.category)}`,
    reason: `Browse the full ${post.category.toLowerCase()} topic cluster.`,
  };
  const tagHub = post.tags[0] ? {
    title: `${post.tags[0]} resources`,
    href: `/blogs?tag=${encodeURIComponent(post.tags[0])}`,
    reason: `See related articles tagged ${post.tags[0]}.`,
  } : null;
  const nextReads = [...related, ...sameAudience, posts[(index + 1) % posts.length]]
    .filter(Boolean)
    .map((candidate) => ({
      title: candidate.title,
      href: `/blogs/${candidate.slug}`,
      reason: candidate.category === post.category
        ? `Related ${candidate.category.toLowerCase()} guide.`
        : `Useful next read for ${post.audience.toLowerCase()}.`,
    }));

  return [categoryHub, tagHub, ...nextReads]
    .filter(Boolean)
    .filter(uniqueByHref)
    .slice(0, 6);
}

function buildExternalLinks(post) {
  const extraTagsByCategory = {
    'Renters Rights': ['tenantFees', 'deposits', 'safety'],
    Compliance: ['rightToRent', 'safety'],
    Renting: ['tenantFees', 'deposits', 'safety'],
    Buying: ['rics', 'sdlt', 'hpi'],
    Selling: ['rics', 'hpi', 'cgt'],
    Agents: ['googleHelpful'],
    Investing: ['hpi', 'bankRate', 'sdlt', 'cgt'],
    'Market Data': ['hpi', 'bankRate', 'rics'],
    'Local Guides': ['hpi', 'rics'],
    'Tools and Templates': ['googleHelpful', 'hpi'],
  };
  const sources = [
    ...post.sources,
    ...selectSources(extraTagsByCategory[post.category] || []),
    ...selectSources(['googleHelpful', 'hpi', 'rics']),
  ]
    .filter(uniqueByUrl)
    .slice(0, 4);
  return sources.map((source) => ({
    title: source.title,
    url: source.url,
    publisher: source.publisher,
    reason: `${source.publisher} is used to verify factual claims in this guide.`,
  }));
}

function buildSecondaryKeywords(topic) {
  const parts = topic.targetKeyword.split(' ').filter((word) => word.length > 3);
  return [
    `${topic.category.toLowerCase()} checklist`,
    `${topic.audience.toLowerCase()} guide`,
    `${parts.slice(0, 3).join(' ')} template`,
    `${parts.slice(-3).join(' ')} examples`,
  ].map((keyword) => keyword.replace(/\s+/g, ' ').trim());
}

function buildTags(topic) {
  return [...new Set([
    topic.category,
    topic.audience,
    topic.intentType,
    ...topic.sourceTags.map((tag) => tag.replace(/([A-Z])/g, ' $1').trim()),
  ])];
}

function makeMetaTitle(topic) {
  const city = cityFromTitle(topic.title);
  const ensureTitleLength = (value) => {
    const base = value.length < 20 ? `${value} Guide` : value;
    return base.length < 35 ? `${base} | UK Property Guide` : base;
  };
  if (city && topic.title.startsWith(`Best areas to rent in ${city}`)) {
    return ensureTitleLength(`Best Areas to Rent in ${city} 2026`);
  }
  if (city && topic.title.startsWith(`Where to buy in ${city}`)) {
    return ensureTitleLength(`Where to Buy in ${city}: Schools and Transport`);
  }
  const compact = topic.title
    .replace(/^From 2026:\s*/, '')
    .replace(/\bwhat\b/gi, 'What')
    .replace(/\bchecklist\b/gi, 'Checklist')
    .replace(/\bguide\b/gi, 'Guide');
  if (compact.includes(':')) {
    return compactTitle(ensureTitleLength(compact.split(':')[0]), 58);
  }
  return compactTitle(ensureTitleLength(compact), 58);
}

function makeMetaDescription(topic) {
  const focus = buildTopicFocus(topic);
  return compactSentence(`${compactTitle(topic.title, 72)}. ${focus.meta}`, 156);
}

function buildImagePrompt(topic) {
  const city = cityFromTitle(topic.title);
  const scene = city
    ? `recognisable ${city} neighbourhood research mood with homes, route planning and viewing notes`
    : `${topic.category.toLowerCase()} property workflow with homes, documents, data and practical decision signals`;
  return `Editorial hero photo for "${topic.title}": ${scene}, modern UK property style, warm natural light, Estospaces orange accent, no logos, no watermark, no readable text baked into image.`;
}

function buildCta(topic) {
  return {
    label: `Use the ${topic.asset}`,
    href: '/#join-waitlist',
    description: `Turn this ${topic.category.toLowerCase()} guide into a practical Estospaces workflow.`,
  };
}

function estimateReadingTime(content, faq) {
  const words = estimateReadingWords(content, faq);
  return Math.max(4, Math.ceil(words / 180));
}

function estimateReadingWords(content, faq) {
  return JSON.stringify({ content, faq }).split(/\s+/).filter(Boolean).length;
}

function buildRelatedSlugs(post, posts, index) {
  const sameCategory = posts
    .filter((candidate) => candidate.slug !== post.slug && candidate.category === post.category)
    .map((candidate) => candidate.slug);
  const sameAudience = posts
    .filter((candidate) => candidate.slug !== post.slug && candidate.audience === post.audience)
    .map((candidate) => candidate.slug);
  const next = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(index + 1, index + 4)
    .map((candidate) => candidate.slug);
  return [...new Set([...sameCategory, ...sameAudience, ...next])].slice(0, 4);
}

function buildSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    url: post.canonicalUrl,
    headline: post.title,
    description: post.metaDescription,
    image: {
      '@type': 'ImageObject',
      url: post.heroImage.url,
      width: post.heroImage.width,
      height: post.heroImage.height,
    },
    author: {
      '@type': 'Organization',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Estospaces',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/logo-icon.png`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: post.canonicalUrl,
    isPartOf: {
      '@type': 'Blog',
      name: 'Estospaces Blog',
      url: `${SITE_URL}/blogs`,
    },
    articleSection: post.category,
    inLanguage: 'en-GB',
    isAccessibleForFree: true,
    wordCount: estimateReadingWords(post.content, post.faq),
    citation: (post.externalLinks || []).map((link) => link.url),
    keywords: [post.targetKeyword, ...post.secondaryKeywords, ...post.tags],
    about: [
      post.category,
      post.audience,
      post.targetKeyword,
    ],
    mentions: [
      ...post.internalLinks.map((link) => link.title),
      ...post.externalLinks.map((link) => link.publisher),
    ].filter(Boolean).map((name) => ({ '@type': 'Thing', name })),
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function cityFromTitle(title) {
  return LOCAL_CITIES.find((city) => title.includes(city)) || '';
}

function compactTitle(value, maxLength) {
  if (value.length <= maxLength) return value;
  const words = value.split(/\s+/);
  let output = '';
  for (const word of words) {
    const next = output ? `${output} ${word}` : word;
    if (next.length > maxLength) break;
    output = next;
  }
  return output || value.slice(0, maxLength).trim();
}

function compactSentence(value, maxLength) {
  const limit = value.length <= maxLength && /[.!?]$/.test(value) ? maxLength : maxLength - 1;
  const compact = compactTitle(value, limit)
    .replace(/\b(?:and|or|with|for|to|of|in|and\/or)$/i, '')
    .replace(/[,:;-]+$/g, '')
    .trim();
  return /[.!?]$/.test(compact) ? compact : `${compact}.`;
}

function lowerFirst(value) {
  if (!value) return value;
  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function dedupeBySlug(topics) {
  const seen = new Set();
  return topics.filter((topic) => {
    if (seen.has(topic.slug)) return false;
    seen.add(topic.slug);
    return true;
  });
}

function uniqueSentences(items) {
  const seen = new Set();
  return items
    .filter(Boolean)
    .filter((item) => {
      const key = String(item).toLowerCase().replace(/\s+/g, ' ').trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function uniqueByHref(link, index, links) {
  return links.findIndex((candidate) => candidate.href === link.href) === index;
}

function uniqueByUrl(source, index, sources) {
  return sources.findIndex((candidate) => candidate.url === source.url) === index;
}
