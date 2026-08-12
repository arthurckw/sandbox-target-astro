const fs = require('fs');
const path = require('path');

// AP Course campaigns
const campaigns = [
  {
    slug: 'ap-us-history-challenge-gpt',
    title: 'AP US History',
    domain: 'AP US History',
    headline: 'Can AI pass APUSH?',
    subheadline: 'Colonial America to Civil Rights. Presidents to protests. Test if GPT-5.2 actually knows American history.',
    description: 'AP US History students and teachers - evaluate AI claims about American history',
    metaDescription: 'Test GPT-5.2 on AP US History topics. From the Constitution to the Cold War - does AI really understand American history?',
    topics: ['Colonial & Revolutionary Era', 'Civil War & Reconstruction', 'World Wars & 20th Century', 'Civil Rights Movement', 'Constitutional History', 'Economic History'],
    examplePrompt: '"What caused the Great Depression?"',
    exampleResponse: '"The Great Depression was primarily caused by the stock market crash of 1929, combined with bank failures, reduced consumer spending, and poor monetary policy decisions by the Federal Reserve..."',
    communityLinks: [
      { name: 'AP Students', url: 'https://apstudents.collegeboard.org/' },
      { name: 'r/APUSH', url: 'https://reddit.com/r/APUSH' },
      { name: 'Gilder Lehrman', url: 'https://www.gilderlehrman.org/' }
    ]
  },
  {
    slug: 'ap-government-challenge-gpt',
    title: 'AP Government',
    domain: 'AP Government and Politics',
    headline: 'Does AI understand democracy?',
    subheadline: 'Branches of government. Constitutional rights. Political processes. See if GPT-5.2 can explain how America actually works.',
    description: 'AP Government students and teachers - evaluate AI claims about US political systems',
    metaDescription: 'Test GPT-5.2 on AP Government topics. Constitutional law, political parties, civil liberties - how well does AI understand American democracy?',
    topics: ['Constitutional Foundations', 'Civil Liberties & Rights', 'Political Parties & Elections', 'Congress & Legislation', 'Executive Branch', 'Judicial System'],
    examplePrompt: '"How does judicial review work?"',
    exampleResponse: '"Judicial review is the power of the Supreme Court to examine laws and government actions to determine if they comply with the Constitution. Established in Marbury v. Madison (1803)..."',
    communityLinks: [
      { name: 'AP Students', url: 'https://apstudents.collegeboard.org/' },
      { name: 'r/APGovernment', url: 'https://reddit.com/r/APGovernment' },
      { name: 'Congress.gov', url: 'https://www.congress.gov/' }
    ]
  },
  {
    slug: 'ap-english-language-challenge-gpt',
    title: 'AP English Language',
    domain: 'AP English Language and Composition',
    headline: 'Can AI actually write?',
    subheadline: 'Rhetoric. Argumentation. Synthesis. Test if GPT-5.2 understands the art of persuasion and composition.',
    description: 'AP English Language students and teachers - evaluate AI understanding of rhetoric and composition',
    metaDescription: 'Test GPT-5.2 on AP English Language topics. Rhetorical analysis, argumentation, synthesis - can AI master the art of persuasion?',
    topics: ['Rhetorical Analysis', 'Argumentation', 'Synthesis Writing', 'Ethos, Pathos, Logos', 'Literary Devices', 'Essay Structure'],
    examplePrompt: '"What makes an argument persuasive?"',
    exampleResponse: '"A persuasive argument effectively combines ethos (credibility), pathos (emotional appeal), and logos (logical reasoning). Strong arguments also anticipate counterarguments and address them directly..."',
    communityLinks: [
      { name: 'AP Students', url: 'https://apstudents.collegeboard.org/' },
      { name: 'r/APLang', url: 'https://reddit.com/r/APLang' },
      { name: 'Purdue OWL', url: 'https://owl.purdue.edu/' }
    ]
  },
  {
    slug: 'ap-english-literature-challenge-gpt',
    title: 'AP English Literature',
    domain: 'AP English Literature and Composition',
    headline: 'Does AI get literature?',
    subheadline: 'Shakespeare to Toni Morrison. Poetry to prose. See if GPT-5.2 can truly analyze literary works.',
    description: 'AP English Literature students and teachers - evaluate AI literary analysis and interpretation',
    metaDescription: 'Test GPT-5.2 on AP English Literature. From classic novels to poetry analysis - can AI understand the depth of great literature?',
    topics: ['Poetry Analysis', 'Novel Interpretation', 'Drama & Shakespeare', 'Literary Movements', 'Symbolism & Themes', 'Character Analysis'],
    examplePrompt: '"What is the significance of the green light in The Great Gatsby?"',
    exampleResponse: '"The green light at the end of Daisy\'s dock symbolizes Gatsby\'s hopes and dreams, particularly his longing for Daisy. It represents the American Dream and the gap between reality and aspiration..."',
    communityLinks: [
      { name: 'AP Students', url: 'https://apstudents.collegeboard.org/' },
      { name: 'r/APLit', url: 'https://reddit.com/r/APLit' },
      { name: 'LitCharts', url: 'https://www.litcharts.com/' }
    ]
  },
  {
    slug: 'ap-biology-challenge-gpt',
    title: 'AP Biology',
    domain: 'AP Biology',
    headline: 'Can AI explain life itself?',
    subheadline: 'Cells to ecosystems. DNA to evolution. Test if GPT-5.2 actually understands biology at the AP level.',
    description: 'AP Biology students and teachers - evaluate AI claims about biological concepts',
    metaDescription: 'Test GPT-5.2 on AP Biology topics. Cellular processes, genetics, evolution, ecology - how accurate is AI on life sciences?',
    topics: ['Cell Biology', 'Genetics & Heredity', 'Evolution', 'Ecology', 'Human Physiology', 'Molecular Biology'],
    examplePrompt: '"How does natural selection lead to evolution?"',
    exampleResponse: '"Natural selection occurs when individuals with favorable traits are more likely to survive and reproduce, passing those traits to offspring. Over many generations, this leads to evolutionary change in populations..."',
    communityLinks: [
      { name: 'AP Students', url: 'https://apstudents.collegeboard.org/' },
      { name: 'r/APBiology', url: 'https://reddit.com/r/APBiology' },
      { name: 'Khan Academy', url: 'https://www.khanacademy.org/science/ap-biology' }
    ]
  },
  {
    slug: 'ap-calculus-ab-challenge-gpt',
    title: 'AP Calculus AB',
    domain: 'AP Calculus AB',
    headline: 'Can AI do calculus?',
    subheadline: 'Limits. Derivatives. Integrals. See if GPT-5.2 can actually solve and explain AP Calculus problems.',
    description: 'AP Calculus students and teachers - evaluate AI mathematical reasoning and explanations',
    metaDescription: 'Test GPT-5.2 on AP Calculus AB. Limits, derivatives, integrals, applications - can AI handle college-level mathematics?',
    topics: ['Limits & Continuity', 'Derivatives', 'Applications of Derivatives', 'Integrals', 'Applications of Integrals', 'Differential Equations'],
    examplePrompt: '"Explain the relationship between derivatives and integrals"',
    exampleResponse: '"The Fundamental Theorem of Calculus establishes that differentiation and integration are inverse operations. The derivative of an integral of a function returns the original function..."',
    communityLinks: [
      { name: 'AP Students', url: 'https://apstudents.collegeboard.org/' },
      { name: 'r/APCalculus', url: 'https://reddit.com/r/apcalculus' },
      { name: 'Paul\'s Online Math Notes', url: 'https://tutorial.math.lamar.edu/' }
    ]
  }
];

// Read template
const templatePath = path.join(__dirname, '../src/pages/for-reviewers/kpop-challenge-gpt.astro');
const template = fs.readFileSync(templatePath, 'utf-8');

// Generate pages
let created = 0;
let skipped = 0;

for (const campaign of campaigns) {
  const outputPath = path.join(__dirname, `../src/pages/for-reviewers/${campaign.slug}.astro`);

  // Skip if exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipped: ${campaign.slug} (already exists)`);
    skipped++;
    continue;
  }

  let content = template
    // Meta tags
    .replace(/title="K-pop Challenge[^"]*"/g, `title="${campaign.title} Challenge: Does AI Know ${campaign.domain}?"`)
    .replace(/description="[^"]*K-pop[^"]*"/g, `description="${campaign.metaDescription}"`)

    // Hero section
    .replace(/Does it actually KNOW K-pop\?/g, campaign.headline)
    .replace(/BTS to NewJeans\. Album sales to music show wins\.[^<]*/g, campaign.subheadline)

    // Domain references
    .replace(/K-pop/g, campaign.title)
    .replace(/k-pop/g, campaign.domain.toLowerCase())
    .replace(/kpop/g, campaign.slug.replace('-challenge-gpt', ''))

    // Example prompt/response
    .replace(/"Who has the most music show wins\?"/g, campaign.examplePrompt)
    .replace(/"BTS holds the record[^"]*"/g, campaign.exampleResponse)

    // Topics - replace the grid items
    .replace(/Fan Culture &amp; Fandoms/g, campaign.topics[0] || 'Topic 1')
    .replace(/Music Show Rankings/g, campaign.topics[1] || 'Topic 2')
    .replace(/Album Sales &amp; Charts/g, campaign.topics[2] || 'Topic 3')
    .replace(/Group Dynamics &amp; History/g, campaign.topics[3] || 'Topic 4')
    .replace(/Concert &amp; Tour Facts/g, campaign.topics[4] || 'Topic 5')
    .replace(/Industry Knowledge/g, campaign.topics[5] || 'Topic 6')

    // Community links
    .replace(/href="https:\/\/www\.soompi\.com\/"/g, `href="${campaign.communityLinks[0]?.url || '#'}"`)
    .replace(/>Soompi</g, `>${campaign.communityLinks[0]?.name || 'Resource 1'}<`)
    .replace(/href="https:\/\/www\.allkpop\.com\/"/g, `href="${campaign.communityLinks[1]?.url || '#'}"`)
    .replace(/>allkpop</g, `>${campaign.communityLinks[1]?.name || 'Resource 2'}<`)
    .replace(/href="https:\/\/www\.koreaboo\.com\/"/g, `href="${campaign.communityLinks[2]?.url || '#'}"`)
    .replace(/>Koreaboo</g, `>${campaign.communityLinks[2]?.name || 'Resource 3'}<`);

  fs.writeFileSync(outputPath, content);
  console.log(`✅ Created: ${campaign.slug}`);
  created++;
}

console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);
console.log('🔨 Run "npm run build" to generate sitemap');
