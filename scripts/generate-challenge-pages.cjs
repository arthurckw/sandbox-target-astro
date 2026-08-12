#!/usr/bin/env node
/**
 * Generate challenge campaign pages from K-pop template
 * Run: node scripts/generate-challenge-pages.js
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../src/pages/for-reviewers/kpop-challenge-gpt.astro');
const OUTPUT_DIR = path.join(__dirname, '../src/pages/for-reviewers');

// Campaign definitions
const campaigns = [
  // Japanese (5)
  {
    slug: 'japanese-language-challenge-gpt',
    title: 'Japanese Language',
    domain: 'Japanese language',
    headline: 'Does it actually KNOW Japanese?',
    subheadline: 'Whether you speak fluent Japanese or just know the basics, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Japanese grammar, kanji, particles, and nuances. Be the judge — help catch AI mistakes about Japanese language.',
    keywords: 'Japanese language AI test, GPT Japanese knowledge, kanji AI accuracy, Japanese grammar ChatGPT, JLPT AI, Japanese particles GPT, nihongo AI, AI fact checking, human in the loop, HITL evaluation',
    emojis: "['🇯🇵', '📚', '✍️', '🎌', '💮', '🗾', '📖', '🈁', '🈂️', '🈷️', '🉐', '㊗️']",
    rareEmojis: "['🗻', '🏯']",
    topicCards: [
      { emoji: '✍️', title: 'Grammar & Particles', desc: 'は vs が, verb conjugations, sentence structure' },
      { emoji: '🈁', title: 'Kanji & Reading', desc: 'Meanings, readings, stroke order, JLPT levels' },
      { emoji: '🗣️', title: 'Keigo & Politeness', desc: 'Honorifics, formal speech, business Japanese' },
      { emoji: '💬', title: 'Expressions & Idioms', desc: 'Natural phrases, slang, cultural expressions' },
    ],
    claims: [
      { emoji: '✍️', text: 'Claims は and が are <span class="text-accent font-medium">interchangeable</span> in most sentences — true or AI mistake?' },
      { emoji: '🈁', text: 'Says 食べる has <span class="text-accent font-medium">three different readings</span> depending on context — accurate?' },
      { emoji: '🗣️', text: 'Explains keigo with <span class="text-accent font-medium">incorrect honorific forms</span> — catch the errors?' },
    ],
    taskExample: { question: 'How do you say "I want to eat" in Japanese?', answer: '"Tabetai desu" is the polite way to express wanting to eat in Japanese...' },
    whyMatters: 'AI confidently gives Japanese language advice that native speakers immediately recognize as wrong. From particle usage to keigo mistakes, bad AI translations can cause real embarrassment.',
    finalCta: 'You know Japanese better than any AI. Help prove it.',
  },
  {
    slug: 'japanese-culture-challenge-gpt',
    title: 'Japanese Culture',
    domain: 'Japanese culture',
    headline: 'Does it actually KNOW Japanese culture?',
    subheadline: 'Whether you lived in Japan or just love the culture, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Japanese traditions, etiquette, food, and customs. Be the judge — help catch AI mistakes about Japanese culture.',
    keywords: 'Japanese culture AI test, GPT Japan knowledge, Japanese traditions ChatGPT, Japanese etiquette AI, Japanese food GPT, anime culture AI, AI fact checking, human in the loop',
    emojis: "['🇯🇵', '🍣', '🍱', '🎎', '🏯', '⛩️', '🎌', '🗾', '🌸', '🍵', '👘', '🎋']",
    rareEmojis: "['🗻', '🐉']",
    topicCards: [
      { emoji: '⛩️', title: 'Traditions & Festivals', desc: 'Matsuri, New Year, Obon, seasonal customs' },
      { emoji: '🍣', title: 'Food & Cuisine', desc: 'Regional dishes, etiquette, ingredients' },
      { emoji: '👘', title: 'Etiquette & Customs', desc: 'Bowing, gift-giving, social norms' },
      { emoji: '🏯', title: 'History & Society', desc: 'Historical periods, modern Japan, daily life' },
    ],
    claims: [
      { emoji: '🍣', text: 'Claims you should <span class="text-accent font-medium">never mix wasabi into soy sauce</span> — cultural rule or myth?' },
      { emoji: '⛩️', text: 'Says Obon is celebrated in <span class="text-accent font-medium">August nationwide</span> — but what about regional differences?' },
      { emoji: '👘', text: 'Explains bowing angles with <span class="text-accent font-medium">incorrect degrees</span> for different situations — accurate?' },
    ],
    taskExample: { question: 'What is the proper way to eat sushi?', answer: 'Traditionally, nigiri sushi should be eaten with your hands, dipping the fish side into soy sauce...' },
    whyMatters: 'AI spreads cultural misconceptions about Japan that anyone who has lived there would immediately spot. From etiquette mistakes to food myths, wrong answers perpetuate stereotypes.',
    finalCta: 'You know Japanese culture better than any AI. Help prove it.',
  },
  {
    slug: 'japanese-cinema-challenge-gpt',
    title: 'Japanese Cinema',
    domain: 'Japanese cinema',
    headline: 'Does it actually KNOW Japanese cinema?',
    subheadline: 'Whether you love Kurosawa or just discovered Japanese films, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Japanese films, directors like Kurosawa and Miyazaki, and cinema history. Be the judge — help catch AI mistakes.',
    keywords: 'Japanese cinema AI test, GPT Kurosawa knowledge, Miyazaki ChatGPT, Japanese film AI, Studio Ghibli GPT, samurai movies AI, AI fact checking, human in the loop',
    emojis: "['🎬', '🇯🇵', '🎥', '📽️', '🏆', '🗡️', '👺', '🎭', '🌸', '🎞️', '🎦', '📺']",
    rareEmojis: "['🐉', '👹']",
    topicCards: [
      { emoji: '🎬', title: 'Directors & Auteurs', desc: 'Kurosawa, Ozu, Miyazaki, Koreeda, Miike' },
      { emoji: '🗡️', title: 'Classic Films', desc: 'Seven Samurai, Rashomon, Tokyo Story' },
      { emoji: '🌸', title: 'Studio Ghibli', desc: 'Spirited Away, Totoro, Princess Mononoke' },
      { emoji: '📺', title: 'Modern Cinema', desc: 'J-horror, contemporary directors, anime films' },
    ],
    claims: [
      { emoji: '🎬', text: 'Claims Kurosawa directed <span class="text-accent font-medium">over 50 films</span> — accurate filmography?' },
      { emoji: '🌸', text: 'Says Spirited Away won the Oscar in <span class="text-accent font-medium">2002</span> — correct year?' },
      { emoji: '🗡️', text: 'Lists Seven Samurai runtime as <span class="text-accent font-medium">under 3 hours</span> — true or AI mistake?' },
    ],
    taskExample: { question: 'Who directed Rashomon?', answer: 'Akira Kurosawa directed Rashomon in 1950, which pioneered the narrative technique of multiple perspectives...' },
    whyMatters: 'AI makes confident claims about Japanese cinema history that film buffs immediately recognize as wrong. From misattributed directors to wrong release dates, accuracy matters.',
    finalCta: 'You know Japanese cinema better than any AI. Help prove it.',
  },
  {
    slug: 'anime-challenge-gpt',
    title: 'Anime',
    domain: 'anime',
    headline: 'Does it actually KNOW anime?',
    subheadline: 'Whether you are a veteran otaku or just getting into anime, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on anime series, studios, directors, and otaku culture. Be the judge — help catch AI mistakes about anime.',
    keywords: 'Anime AI test, GPT anime knowledge, anime ChatGPT accuracy, otaku AI, anime studios GPT, manga AI, AI fact checking, human in the loop, HITL evaluation',
    emojis: "['🎌', '⚔️', '🔮', '🌸', '💫', '✨', '🎭', '🐱', '🦊', '👾', '🎮', '📺']",
    rareEmojis: "['🐉', '👹']",
    topicCards: [
      { emoji: '📺', title: 'Series & Shows', desc: 'Naruto, One Piece, Attack on Titan, Demon Slayer' },
      { emoji: '🏢', title: 'Studios & Production', desc: 'MAPPA, Ufotable, Kyoto Animation, Bones' },
      { emoji: '✨', title: 'Characters & Lore', desc: 'Character backgrounds, plot details, fan theories' },
      { emoji: '📚', title: 'Manga & Source', desc: 'Adaptations, original works, mangaka' },
    ],
    claims: [
      { emoji: '📺', text: 'Claims One Piece has <span class="text-accent font-medium">over 1000 episodes</span> — accurate count?' },
      { emoji: '🏢', text: 'Says Attack on Titan was animated by <span class="text-accent font-medium">the same studio throughout</span> — true?' },
      { emoji: '✨', text: 'Lists wrong <span class="text-accent font-medium">character abilities</span> for popular series — catch the errors?' },
    ],
    taskExample: { question: 'Who created Naruto?', answer: 'Masashi Kishimoto created Naruto, which was serialized in Weekly Shonen Jump from 1999 to 2014...' },
    whyMatters: 'AI confidently spreads wrong information about anime that real fans immediately catch. From episode counts to studio changes, bad info frustrates the community.',
    finalCta: 'You know anime better than any AI. Help prove it.',
  },
  {
    slug: 'jdrama-challenge-gpt',
    title: 'J-Drama',
    domain: 'Japanese TV dramas',
    headline: 'Does it actually KNOW J-dramas?',
    subheadline: 'Whether you binge J-dramas or just discovered them, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Japanese TV dramas, actors, and the J-drama scene. Be the judge — help catch AI mistakes.',
    keywords: 'J-drama AI test, GPT Japanese drama knowledge, Japanese TV ChatGPT, J-drama actors AI, dorama GPT, AI fact checking, human in the loop',
    emojis: "['📺', '🇯🇵', '🎭', '💕', '🌸', '🎬', '✨', '💫', '🎤', '👔', '🏥', '👨‍⚕️']",
    rareEmojis: "['🗻', '🌙']",
    topicCards: [
      { emoji: '📺', title: 'Popular Dramas', desc: 'Classic and trending J-drama series' },
      { emoji: '🎭', title: 'Actors & Actresses', desc: 'Popular stars, Johnny\'s talents, rising actors' },
      { emoji: '💕', title: 'Romance & Genres', desc: 'Love stories, medical dramas, workplace series' },
      { emoji: '🏆', title: 'Awards & Recognition', desc: 'Drama awards, ratings, cultural impact' },
    ],
    claims: [
      { emoji: '📺', text: 'Claims a classic drama aired in the <span class="text-accent font-medium">wrong decade</span> — accurate timeline?' },
      { emoji: '🎭', text: 'Mixes up actors between <span class="text-accent font-medium">different drama series</span> — catch the confusion?' },
      { emoji: '💕', text: 'Gets the <span class="text-accent font-medium">plot endings wrong</span> for popular series — spoiler accuracy?' },
    ],
    taskExample: { question: 'What is Hana Yori Dango about?', answer: 'Hana Yori Dango follows a working-class girl who stands up to the F4, four wealthy boys who rule the school...' },
    whyMatters: 'AI mixes up J-drama details that fans immediately notice. From wrong actors to confused plotlines, accurate information matters for recommendations.',
    finalCta: 'You know J-dramas better than any AI. Help prove it.',
  },

  // Korean (4)
  {
    slug: 'korean-language-challenge-gpt',
    title: 'Korean Language',
    domain: 'Korean language',
    headline: 'Does it actually KNOW Korean?',
    subheadline: 'Whether you speak fluent Korean or just learning Hangul, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Korean grammar, Hangul, honorifics, and nuances. Be the judge — help catch AI mistakes about Korean language.',
    keywords: 'Korean language AI test, GPT Korean knowledge, Hangul AI accuracy, Korean grammar ChatGPT, TOPIK AI, honorifics GPT, AI fact checking, human in the loop',
    emojis: "['🇰🇷', '📚', '✍️', '💬', '🔤', '📖', '🎓', '✨', '💫', '🌟', '📝', '🗣️']",
    rareEmojis: "['🐯', '🐻']",
    topicCards: [
      { emoji: '🔤', title: 'Hangul & Writing', desc: 'Characters, pronunciation, reading' },
      { emoji: '✍️', title: 'Grammar & Structure', desc: 'Particles, verb conjugations, sentence patterns' },
      { emoji: '🗣️', title: 'Honorifics & Politeness', desc: 'Formal speech, age-based language, 존댓말' },
      { emoji: '💬', title: 'Expressions & Slang', desc: 'Natural phrases, K-drama phrases, internet Korean' },
    ],
    claims: [
      { emoji: '🔤', text: 'Claims Hangul has <span class="text-accent font-medium">24 letters</span> — accurate count?' },
      { emoji: '✍️', text: 'Explains 은/는 and 이/가 as <span class="text-accent font-medium">completely interchangeable</span> — true?' },
      { emoji: '🗣️', text: 'Gets honorific levels <span class="text-accent font-medium">mixed up</span> in example sentences — catch the errors?' },
    ],
    taskExample: { question: 'How do you say "thank you" formally in Korean?', answer: '"Gamsahamnida" (감사합니다) is the formal way to say thank you in Korean...' },
    whyMatters: 'AI gives Korean language advice that learners follow but native speakers know is wrong. From particle usage to honorific mistakes, accuracy matters for learning.',
    finalCta: 'You know Korean better than any AI. Help prove it.',
  },
  {
    slug: 'korean-culture-challenge-gpt',
    title: 'Korean Culture',
    domain: 'Korean culture',
    headline: 'Does it actually KNOW Korean culture?',
    subheadline: 'Whether you lived in Korea or love hallyu, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Korean traditions, food, etiquette, and customs. Be the judge — help catch AI mistakes about Korean culture.',
    keywords: 'Korean culture AI test, GPT Korea knowledge, Korean traditions ChatGPT, Korean food AI, kimchi GPT, hallyu AI, AI fact checking, human in the loop',
    emojis: "['🇰🇷', '🍜', '🥢', '🎎', '🏛️', '⛩️', '🎌', '🌸', '🍵', '👘', '🎋', '🎊']",
    rareEmojis: "['🐯', '🐻']",
    topicCards: [
      { emoji: '🎊', title: 'Traditions & Holidays', desc: 'Chuseok, Seollal, ancestral customs' },
      { emoji: '🍜', title: 'Food & Cuisine', desc: 'Korean BBQ, kimchi, regional dishes' },
      { emoji: '🤝', title: 'Etiquette & Customs', desc: 'Age hierarchy, drinking culture, social norms' },
      { emoji: '🏛️', title: 'History & Society', desc: 'Joseon dynasty, modern Korea, daily life' },
    ],
    claims: [
      { emoji: '🍜', text: 'Claims kimchi is always <span class="text-accent font-medium">spicy</span> — but what about white kimchi?' },
      { emoji: '🎊', text: 'Says Chuseok is <span class="text-accent font-medium">Korean New Year</span> — mixing up holidays?' },
      { emoji: '🤝', text: 'Explains drinking etiquette with <span class="text-accent font-medium">incorrect details</span> — catch the mistakes?' },
    ],
    taskExample: { question: 'What is the proper way to pour drinks in Korea?', answer: 'You should pour drinks for elders with both hands, and turn away when drinking in front of elders...' },
    whyMatters: 'AI spreads cultural misconceptions about Korea that anyone familiar with the culture would spot. From food myths to etiquette errors, accuracy matters.',
    finalCta: 'You know Korean culture better than any AI. Help prove it.',
  },
  {
    slug: 'korean-cinema-challenge-gpt',
    title: 'Korean Cinema',
    domain: 'Korean cinema',
    headline: 'Does it actually KNOW Korean cinema?',
    subheadline: 'Whether you love Bong Joon-ho or just discovered Korean films, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Korean films, directors like Bong Joon-ho and Park Chan-wook. Be the judge — help catch AI mistakes.',
    keywords: 'Korean cinema AI test, GPT Korean film knowledge, Bong Joon-ho ChatGPT, Parasite AI, Korean movies GPT, K-movie AI, AI fact checking, human in the loop',
    emojis: "['🎬', '🇰🇷', '🎥', '📽️', '🏆', '🎭', '✨', '🌟', '🎞️', '🎦', '📺', '🍿']",
    rareEmojis: "['🐯', '🏅']",
    topicCards: [
      { emoji: '🎬', title: 'Directors', desc: 'Bong Joon-ho, Park Chan-wook, Kim Jee-woon' },
      { emoji: '🏆', title: 'Award Winners', desc: 'Parasite, Oldboy, Decision to Leave' },
      { emoji: '🎭', title: 'Actors & Stars', desc: 'Song Kang-ho, Choi Min-sik, rising stars' },
      { emoji: '📺', title: 'Genres & Trends', desc: 'Thrillers, revenge films, social commentary' },
    ],
    claims: [
      { emoji: '🏆', text: 'Claims Parasite won <span class="text-accent font-medium">3 Oscars</span> — accurate count?' },
      { emoji: '🎬', text: 'Attributes a film to the <span class="text-accent font-medium">wrong director</span> — catch the error?' },
      { emoji: '🎭', text: 'Gets actor filmographies <span class="text-accent font-medium">mixed up</span> — accurate casting history?' },
    ],
    taskExample: { question: 'Who directed Oldboy?', answer: 'Park Chan-wook directed Oldboy in 2003, which won the Grand Prix at Cannes Film Festival...' },
    whyMatters: 'AI makes confident claims about Korean cinema that film fans immediately recognize as wrong. From misattributed films to wrong award counts, accuracy matters.',
    finalCta: 'You know Korean cinema better than any AI. Help prove it.',
  },
  {
    slug: 'kdrama-challenge-gpt',
    title: 'K-Drama',
    domain: 'Korean TV dramas',
    headline: 'Does it actually KNOW K-dramas?',
    subheadline: 'Whether you binge K-dramas weekly or just discovered them, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Korean TV dramas, actors, and the K-drama phenomenon. Be the judge — help catch AI mistakes.',
    keywords: 'K-drama AI test, GPT Korean drama knowledge, Korean TV ChatGPT, K-drama actors AI, hallyu GPT, AI fact checking, human in the loop',
    emojis: "['📺', '🇰🇷', '💕', '🎭', '✨', '🌸', '💫', '🎬', '🎤', '👔', '🏥', '👨‍⚕️']",
    rareEmojis: "['🐯', '💜']",
    topicCards: [
      { emoji: '📺', title: 'Popular Dramas', desc: 'Squid Game, Crash Landing, Goblin, Vincenzo' },
      { emoji: '🎭', title: 'Actors & Actresses', desc: 'Popular stars, rising actors, couples' },
      { emoji: '💕', title: 'Romance & Genres', desc: 'Rom-coms, thrillers, historical dramas' },
      { emoji: '🌐', title: 'Global Impact', desc: 'Netflix hits, international awards, hallyu wave' },
    ],
    claims: [
      { emoji: '📺', text: 'Claims Squid Game has <span class="text-accent font-medium">multiple seasons</span> — accurate series info?' },
      { emoji: '🎭', text: 'Mixes up actors between <span class="text-accent font-medium">different drama series</span> — catch the confusion?' },
      { emoji: '💕', text: 'Gets the <span class="text-accent font-medium">plot endings wrong</span> for popular series — spoiler accuracy?' },
    ],
    taskExample: { question: 'What is Crash Landing on You about?', answer: 'A South Korean heiress accidentally paraglides into North Korea and falls in love with a North Korean army officer...' },
    whyMatters: 'AI mixes up K-drama details that fans immediately notice. From wrong actors to confused plotlines, accurate information matters for the global K-drama community.',
    finalCta: 'You know K-dramas better than any AI. Help prove it.',
  },

  // Chinese (6)
  {
    slug: 'cpop-challenge-gpt',
    title: 'C-Pop',
    domain: 'Chinese pop music',
    headline: 'Does it actually KNOW C-pop?',
    subheadline: 'Whether you love Mandopop legends or new idols, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on C-pop, Mandopop artists, and Chinese pop music. Be the judge — help catch AI mistakes.',
    keywords: 'C-pop AI test, GPT Mandopop knowledge, Chinese pop ChatGPT, Jay Chou AI, Chinese idols GPT, AI fact checking, human in the loop',
    emojis: "['🎤', '🇨🇳', '🎵', '🎶', '✨', '💫', '🌟', '🎹', '🎧', '💃', '🕺', '🎸']",
    rareEmojis: "['🐼', '🐉']",
    topicCards: [
      { emoji: '🎤', title: 'Artists & Idols', desc: 'Jay Chou, JJ Lin, TFBOYS, THE9, INTO1' },
      { emoji: '🎵', title: 'Songs & Albums', desc: 'Classic hits, new releases, chart performance' },
      { emoji: '🏢', title: 'Labels & Shows', desc: 'Survival shows, agencies, idol training' },
      { emoji: '🌏', title: 'Regional Scenes', desc: 'Mainland, Taiwan, Hong Kong music' },
    ],
    claims: [
      { emoji: '🎤', text: 'Claims Jay Chou debuted in <span class="text-accent font-medium">the wrong year</span> — accurate timeline?' },
      { emoji: '🎵', text: 'Gets song credits <span class="text-accent font-medium">mixed up</span> between artists — catch the errors?' },
      { emoji: '🏢', text: 'Confuses members between <span class="text-accent font-medium">different idol groups</span> — accurate rosters?' },
    ],
    taskExample: { question: 'Who is considered the King of Mandopop?', answer: 'Jay Chou is often called the King of Mandopop, having dominated Chinese music since his 2000 debut...' },
    whyMatters: 'AI makes confident claims about C-pop that fans immediately catch. From wrong debut years to mixed-up group members, accuracy matters for the C-pop community.',
    finalCta: 'You know C-pop better than any AI. Help prove it.',
  },
  {
    slug: 'chinese-language-challenge-gpt',
    title: 'Chinese Language',
    domain: 'Chinese language',
    headline: 'Does it actually KNOW Chinese?',
    subheadline: 'Whether you speak fluent Mandarin or just learning, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Mandarin Chinese, tones, characters, and grammar. Be the judge — help catch AI mistakes.',
    keywords: 'Chinese language AI test, GPT Mandarin knowledge, Chinese characters ChatGPT, HSK AI, tones GPT, pinyin AI, AI fact checking, human in the loop',
    emojis: "['🇨🇳', '📚', '✍️', '🔤', '📖', '🎓', '✨', '💫', '🌟', '📝', '🗣️', '💬']",
    rareEmojis: "['🐼', '🐉']",
    topicCards: [
      { emoji: '🔤', title: 'Characters & Writing', desc: 'Hanzi, radicals, stroke order, simplified vs traditional' },
      { emoji: '🎵', title: 'Tones & Pronunciation', desc: 'Four tones, tone changes, pinyin' },
      { emoji: '✍️', title: 'Grammar & Structure', desc: 'Sentence patterns, measure words, aspects' },
      { emoji: '💬', title: 'Expressions & Idioms', desc: 'Chengyu, proverbs, internet slang' },
    ],
    claims: [
      { emoji: '🎵', text: 'Explains tone sandhi with <span class="text-accent font-medium">incorrect rules</span> — accurate tones?' },
      { emoji: '🔤', text: 'Claims a character has <span class="text-accent font-medium">wrong number of strokes</span> — accurate count?' },
      { emoji: '💬', text: 'Translates idioms <span class="text-accent font-medium">too literally</span> — missing the meaning?' },
    ],
    taskExample: { question: 'How many tones does Mandarin have?', answer: 'Mandarin has four main tones plus a neutral tone, with the third tone being the most complex...' },
    whyMatters: 'AI gives Chinese language advice that native speakers know is wrong. From tone rules to character mistakes, accurate information is crucial for learners.',
    finalCta: 'You know Chinese better than any AI. Help prove it.',
  },
  {
    slug: 'chinese-culture-challenge-gpt',
    title: 'Chinese Culture',
    domain: 'Chinese culture',
    headline: 'Does it actually KNOW Chinese culture?',
    subheadline: 'Whether you grew up with Chinese traditions or love the culture, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Chinese traditions, festivals, food, and customs. Be the judge — help catch AI mistakes.',
    keywords: 'Chinese culture AI test, GPT China knowledge, Chinese traditions ChatGPT, Chinese New Year AI, Chinese food GPT, AI fact checking, human in the loop',
    emojis: "['🇨🇳', '🧧', '🏮', '🐉', '🎎', '🍜', '🥢', '🎋', '🌸', '🍵', '🏯', '🎊']",
    rareEmojis: "['🐼', '🐲']",
    topicCards: [
      { emoji: '🧧', title: 'Festivals & Holidays', desc: 'Chinese New Year, Mid-Autumn, Dragon Boat' },
      { emoji: '🍜', title: 'Food & Cuisine', desc: 'Regional cuisines, dim sum, cooking traditions' },
      { emoji: '🎋', title: 'Traditions & Customs', desc: 'Family values, lucky numbers, zodiac' },
      { emoji: '🏯', title: 'History & Philosophy', desc: 'Dynasties, Confucianism, Taoism' },
    ],
    claims: [
      { emoji: '🧧', text: 'Claims Chinese New Year is always in <span class="text-accent font-medium">January</span> — but it moves?' },
      { emoji: '🍜', text: 'Says dim sum is from <span class="text-accent font-medium">the wrong region</span> — accurate origins?' },
      { emoji: '🎋', text: 'Gets zodiac animal order <span class="text-accent font-medium">wrong</span> — catch the mistake?' },
    ],
    taskExample: { question: 'What do you eat during Chinese New Year?', answer: 'Traditional foods include dumplings for wealth, fish for abundance, and nian gao for progress...' },
    whyMatters: 'AI spreads cultural misconceptions about China that anyone familiar with the culture would spot. From festival dates to food origins, accuracy matters.',
    finalCta: 'You know Chinese culture better than any AI. Help prove it.',
  },
  {
    slug: 'chinese-cinema-challenge-gpt',
    title: 'Chinese Cinema',
    domain: 'Chinese cinema',
    headline: 'Does it actually KNOW Chinese cinema?',
    subheadline: 'Whether you love Zhang Yimou or martial arts classics, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Chinese films, directors, and cinema history. Be the judge — help catch AI mistakes.',
    keywords: 'Chinese cinema AI test, GPT Chinese film knowledge, Zhang Yimou ChatGPT, Wong Kar-wai AI, wuxia GPT, AI fact checking, human in the loop',
    emojis: "['🎬', '🇨🇳', '🎥', '📽️', '⚔️', '🥋', '🎭', '✨', '🌟', '🎞️', '🎦', '🍿']",
    rareEmojis: "['🐉', '🐼']",
    topicCards: [
      { emoji: '🎬', title: 'Directors', desc: 'Zhang Yimou, Wong Kar-wai, Ang Lee, Jia Zhangke' },
      { emoji: '⚔️', title: 'Martial Arts Films', desc: 'Wuxia classics, kung fu cinema, action stars' },
      { emoji: '🎭', title: 'Art House Cinema', desc: 'Fifth/Sixth Generation, festival films' },
      { emoji: '📺', title: 'Modern Blockbusters', desc: 'Box office hits, co-productions' },
    ],
    claims: [
      { emoji: '🎬', text: 'Claims Crouching Tiger won <span class="text-accent font-medium">Best Picture</span> — but what did it actually win?' },
      { emoji: '⚔️', text: 'Attributes a martial arts classic to the <span class="text-accent font-medium">wrong director</span> — catch the error?' },
      { emoji: '🎭', text: 'Gets Chinese cinema eras <span class="text-accent font-medium">mixed up</span> — accurate film history?' },
    ],
    taskExample: { question: 'Who directed Hero (2002)?', answer: 'Zhang Yimou directed Hero, a visually stunning wuxia film starring Jet Li...' },
    whyMatters: 'AI makes confident claims about Chinese cinema that film fans immediately recognize as wrong. From misattributed directors to wrong award counts, accuracy matters.',
    finalCta: 'You know Chinese cinema better than any AI. Help prove it.',
  },
  {
    slug: 'cdrama-challenge-gpt',
    title: 'C-Drama',
    domain: 'Chinese TV dramas',
    headline: 'Does it actually KNOW C-dramas?',
    subheadline: 'Whether you binge C-dramas or just discovered them, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Chinese TV dramas, actors, and the C-drama scene. Be the judge — help catch AI mistakes.',
    keywords: 'C-drama AI test, GPT Chinese drama knowledge, Chinese TV ChatGPT, cdrama actors AI, historical dramas GPT, AI fact checking, human in the loop',
    emojis: "['📺', '🇨🇳', '💕', '🎭', '✨', '🌸', '💫', '🎬', '👘', '⚔️', '🏯', '🎎']",
    rareEmojis: "['🐉', '🐼']",
    topicCards: [
      { emoji: '📺', title: 'Popular Dramas', desc: 'The Untamed, Story of Yanxi Palace, modern hits' },
      { emoji: '🎭', title: 'Actors & Actresses', desc: 'Popular stars, rising talents' },
      { emoji: '👘', title: 'Historical Dramas', desc: 'Palace intrigue, wuxia adaptations' },
      { emoji: '💕', title: 'Modern Romance', desc: 'Contemporary rom-coms, web dramas' },
    ],
    claims: [
      { emoji: '📺', text: 'Claims a drama aired on <span class="text-accent font-medium">the wrong platform</span> — accurate streaming info?' },
      { emoji: '🎭', text: 'Mixes up actors between <span class="text-accent font-medium">different drama series</span> — catch the confusion?' },
      { emoji: '👘', text: 'Gets historical drama <span class="text-accent font-medium">dynasty settings wrong</span> — accurate history?' },
    ],
    taskExample: { question: 'What is The Untamed based on?', answer: 'The Untamed is based on the novel Mo Dao Zu Shi by Mo Xiang Tong Xiu, a danmei (BL) fantasy story...' },
    whyMatters: 'AI mixes up C-drama details that fans immediately notice. From wrong actors to confused plotlines, accurate information matters for recommendations.',
    finalCta: 'You know C-dramas better than any AI. Help prove it.',
  },
  {
    slug: 'taiwanese-culture-challenge-gpt',
    title: 'Taiwanese Culture',
    domain: 'Taiwanese culture',
    headline: 'Does it actually KNOW Taiwanese culture?',
    subheadline: 'Whether you are from Taiwan or love the island, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Taiwanese traditions, food, and customs. Be the judge — help catch AI mistakes.',
    keywords: 'Taiwan culture AI test, GPT Taiwan knowledge, Taiwanese food ChatGPT, bubble tea AI, night markets GPT, AI fact checking, human in the loop',
    emojis: "['🇹🇼', '🧋', '🍜', '🏮', '🌸', '🎎', '🏯', '🎋', '✨', '💫', '🌺', '🎊']",
    rareEmojis: "['🐻', '🦎']",
    topicCards: [
      { emoji: '🍜', title: 'Food & Night Markets', desc: 'Bubble tea, xiaolongbao, night market snacks' },
      { emoji: '🏮', title: 'Festivals & Traditions', desc: 'Lantern Festival, Ghost Month, temple culture' },
      { emoji: '🌸', title: 'Daily Life & Culture', desc: 'Convenience stores, scooters, social norms' },
      { emoji: '🗾', title: 'Geography & Tourism', desc: 'Cities, natural attractions, local spots' },
    ],
    claims: [
      { emoji: '🧋', text: 'Claims bubble tea was invented in <span class="text-accent font-medium">the wrong city</span> — accurate origins?' },
      { emoji: '🏮', text: 'Confuses Taiwanese festivals with <span class="text-accent font-medium">mainland Chinese ones</span> — distinct traditions?' },
      { emoji: '🌸', text: 'Gets Taiwan geography <span class="text-accent font-medium">wrong</span> — catch the mistakes?' },
    ],
    taskExample: { question: 'Where was bubble tea invented?', answer: 'Bubble tea originated in Taiwan in the 1980s, with both Taichung and Tainan claiming to be the birthplace...' },
    whyMatters: 'AI often conflates Taiwanese and mainland Chinese culture. People familiar with Taiwan can spot these mistakes immediately.',
    finalCta: 'You know Taiwanese culture better than any AI. Help prove it.',
  },

  // Spanish - Spain (4)
  {
    slug: 'spanish-language-challenge-gpt',
    title: 'Spanish Language (Spain)',
    domain: 'Castilian Spanish',
    headline: 'Does it actually KNOW Castilian Spanish?',
    subheadline: 'Whether you speak castellano or learning Spanish, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Spain Spanish, grammar, and nuances. Be the judge — help catch AI mistakes.',
    keywords: 'Spanish language AI test, GPT Castilian knowledge, Spain Spanish ChatGPT, castellano AI, vosotros GPT, AI fact checking, human in the loop',
    emojis: "['🇪🇸', '📚', '✍️', '💬', '📖', '🎓', '✨', '💫', '🌟', '📝', '🗣️', '🔤']",
    rareEmojis: "['🐂', '💃']",
    topicCards: [
      { emoji: '✍️', title: 'Grammar & Conjugation', desc: 'Vosotros, subjunctive, regional variations' },
      { emoji: '🗣️', title: 'Pronunciation', desc: 'Distinción, ceceo, Spanish accents' },
      { emoji: '💬', title: 'Expressions & Slang', desc: 'Castilian idioms, Spain-specific phrases' },
      { emoji: '🔄', title: 'Spain vs LatAm Spanish', desc: 'Key differences, vocabulary variations' },
    ],
    claims: [
      { emoji: '✍️', text: 'Claims vosotros is used <span class="text-accent font-medium">throughout Spain</span> — but what about Canary Islands?' },
      { emoji: '🗣️', text: 'Explains distinción <span class="text-accent font-medium">incorrectly</span> — accurate pronunciation rules?' },
      { emoji: '💬', text: 'Uses Latin American Spanish where <span class="text-accent font-medium">Castilian differs</span> — catch the mix-up?' },
    ],
    taskExample: { question: 'How do you say "you all" in Spain Spanish?', answer: 'In Spain, "vosotros" is used for informal plural "you," unlike Latin America which uses "ustedes"...' },
    whyMatters: 'AI often defaults to Latin American Spanish, frustrating learners of Castilian. Spain Spanish speakers can catch these regional mistakes.',
    finalCta: 'You know Castilian Spanish better than any AI. Help prove it.',
  },
  {
    slug: 'spanish-culture-challenge-gpt',
    title: 'Spanish Culture',
    domain: 'Spanish culture',
    headline: 'Does it actually KNOW Spanish culture?',
    subheadline: 'Whether you are from Spain or love its culture, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Spanish traditions, festivals, and customs. Be the judge — help catch AI mistakes.',
    keywords: 'Spain culture AI test, GPT Spanish knowledge, Spanish traditions ChatGPT, tapas AI, flamenco GPT, La Tomatina AI, AI fact checking, human in the loop',
    emojis: "['🇪🇸', '💃', '🎸', '🍷', '🥘', '🐂', '☀️', '🏰', '🎭', '🌻', '🌞', '🎊']",
    rareEmojis: "['🐂', '🦎']",
    topicCards: [
      { emoji: '🎊', title: 'Festivals & Fiestas', desc: 'La Tomatina, San Fermín, Feria de Abril' },
      { emoji: '🥘', title: 'Food & Gastronomy', desc: 'Tapas, paella, regional cuisines' },
      { emoji: '💃', title: 'Arts & Traditions', desc: 'Flamenco, bullfighting debates, architecture' },
      { emoji: '☀️', title: 'Daily Life', desc: 'Siesta culture, social customs, regions' },
    ],
    claims: [
      { emoji: '🥘', text: 'Claims paella is from <span class="text-accent font-medium">the wrong region</span> — accurate origins?' },
      { emoji: '🎊', text: 'Confuses Spanish festivals with <span class="text-accent font-medium">Latin American ones</span> — distinct traditions?' },
      { emoji: '💃', text: 'Gets flamenco history <span class="text-accent font-medium">wrong</span> — accurate cultural context?' },
    ],
    taskExample: { question: 'What is the siesta tradition?', answer: 'Siesta is a traditional afternoon rest period in Spain, though it is becoming less common in modern urban areas...' },
    whyMatters: 'AI spreads misconceptions about Spanish culture that anyone from Spain would spot. From regional food origins to festival mix-ups, accuracy matters.',
    finalCta: 'You know Spanish culture better than any AI. Help prove it.',
  },
  {
    slug: 'spanish-cinema-challenge-gpt',
    title: 'Spanish Cinema',
    domain: 'Spanish cinema',
    headline: 'Does it actually KNOW Spanish cinema?',
    subheadline: 'Whether you love Almodóvar or Spanish classics, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Spanish films, directors like Almodóvar and Buñuel. Be the judge — help catch AI mistakes.',
    keywords: 'Spanish cinema AI test, GPT Spanish film knowledge, Almodóvar ChatGPT, Buñuel AI, Spanish movies GPT, AI fact checking, human in the loop',
    emojis: "['🎬', '🇪🇸', '🎥', '📽️', '🏆', '🎭', '✨', '🌟', '🎞️', '🎦', '💃', '🍿']",
    rareEmojis: "['🐂', '🦎']",
    topicCards: [
      { emoji: '🎬', title: 'Directors', desc: 'Almodóvar, Buñuel, Amenábar, Bayona' },
      { emoji: '🏆', title: 'Award Winners', desc: 'Oscar-winning Spanish films' },
      { emoji: '🎭', title: 'Classic Cinema', desc: 'Spanish film history, movements' },
      { emoji: '📺', title: 'Modern Hits', desc: 'Contemporary Spanish cinema, Netflix' },
    ],
    claims: [
      { emoji: '🏆', text: 'Claims a Spanish film won <span class="text-accent font-medium">the wrong Oscar category</span> — accurate awards?' },
      { emoji: '🎬', text: 'Attributes a film to the <span class="text-accent font-medium">wrong director</span> — catch the error?' },
      { emoji: '🎭', text: 'Gets Spanish cinema movements <span class="text-accent font-medium">mixed up</span> — accurate history?' },
    ],
    taskExample: { question: 'Who directed Pan\'s Labyrinth?', answer: 'Guillermo del Toro directed Pan\'s Labyrinth... wait, that is a Mexican director with a Spanish-set film!' },
    whyMatters: 'AI makes confident claims about Spanish cinema that film fans immediately recognize as wrong. Sometimes it even confuses Spanish and Latin American films.',
    finalCta: 'You know Spanish cinema better than any AI. Help prove it.',
  },
  {
    slug: 'spanish-music-challenge-gpt',
    title: 'Spanish Music',
    domain: 'Spanish music',
    headline: 'Does it actually KNOW Spanish music?',
    subheadline: 'Whether you love flamenco or Spanish pop, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Spanish music, flamenco, and artists from Spain. Be the judge — help catch AI mistakes.',
    keywords: 'Spanish music AI test, GPT flamenco knowledge, Spanish pop ChatGPT, Rosalía AI, flamenco GPT, AI fact checking, human in the loop',
    emojis: "['🎵', '🇪🇸', '💃', '🎸', '🎶', '✨', '💫', '🌟', '🎹', '🎤', '👏', '🌹']",
    rareEmojis: "['🐂', '🦎']",
    topicCards: [
      { emoji: '💃', title: 'Flamenco', desc: 'Palos, artists, history, traditions' },
      { emoji: '🎤', title: 'Spanish Pop & Rock', desc: 'Rosalía, C. Tangana, Spanish artists' },
      { emoji: '🎸', title: 'Regional Music', desc: 'Basque, Catalan, Galician traditions' },
      { emoji: '🎹', title: 'Classical & Opera', desc: 'Spanish classical composers, zarzuela' },
    ],
    claims: [
      { emoji: '💃', text: 'Confuses flamenco palos <span class="text-accent font-medium">with wrong regions</span> — accurate traditions?' },
      { emoji: '🎤', text: 'Mixes up Spanish artists with <span class="text-accent font-medium">Latin American ones</span> — catch the error?' },
      { emoji: '🎸', text: 'Gets flamenco history <span class="text-accent font-medium">origins wrong</span> — accurate cultural context?' },
    ],
    taskExample: { question: 'What are the main styles of flamenco?', answer: 'Flamenco has many palos (styles) including Soleá, Bulería, Alegría, and Seguiriya, each with distinct rhythms...' },
    whyMatters: 'AI often confuses Spanish music with Latin American music, missing the distinct traditions of flamenco and Spanish pop.',
    finalCta: 'You know Spanish music better than any AI. Help prove it.',
  },

  // Spanish - Latin America (5)
  {
    slug: 'mexican-culture-challenge-gpt',
    title: 'Mexican Culture',
    domain: 'Mexican culture',
    headline: 'Does it actually KNOW Mexican culture?',
    subheadline: 'Whether you are Mexican or love the culture, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Mexican traditions, food, and customs. Be the judge — help catch AI mistakes.',
    keywords: 'Mexican culture AI test, GPT Mexico knowledge, Mexican traditions ChatGPT, Day of the Dead AI, tacos GPT, AI fact checking, human in the loop',
    emojis: "['🇲🇽', '💀', '🌮', '🎺', '🌵', '🎭', '🌺', '🎊', '✨', '💫', '🌶️', '🍹']",
    rareEmojis: "['🦅', '🐍']",
    topicCards: [
      { emoji: '💀', title: 'Day of the Dead', desc: 'Día de Muertos traditions, ofrendas, history' },
      { emoji: '🌮', title: 'Food & Cuisine', desc: 'Regional dishes, street food, traditions' },
      { emoji: '🎺', title: 'Music & Arts', desc: 'Mariachi, muralism, folk traditions' },
      { emoji: '🎭', title: 'History & Society', desc: 'Pre-Hispanic civilizations, modern Mexico' },
    ],
    claims: [
      { emoji: '💀', text: 'Confuses Day of the Dead with <span class="text-accent font-medium">Halloween</span> — distinct traditions?' },
      { emoji: '🌮', text: 'Claims a dish is Mexican when it is <span class="text-accent font-medium">Tex-Mex</span> — accurate origins?' },
      { emoji: '🎺', text: 'Gets mariachi history <span class="text-accent font-medium">wrong</span> — accurate cultural context?' },
    ],
    taskExample: { question: 'What is Día de Muertos?', answer: 'Day of the Dead is a Mexican tradition to honor deceased loved ones, celebrated November 1-2 with ofrendas and marigolds...' },
    whyMatters: 'AI often confuses Mexican traditions with generic "Latin" stereotypes. Mexicans can spot these cultural mistakes immediately.',
    finalCta: 'You know Mexican culture better than any AI. Help prove it.',
  },
  {
    slug: 'mexican-cinema-challenge-gpt',
    title: 'Mexican Cinema',
    domain: 'Mexican cinema',
    headline: 'Does it actually KNOW Mexican cinema?',
    subheadline: 'Whether you love the "Three Amigos" directors or classic cine de oro, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Mexican films, directors like del Toro, Iñárritu, Cuarón. Be the judge — help catch AI mistakes.',
    keywords: 'Mexican cinema AI test, GPT Mexican film knowledge, Guillermo del Toro ChatGPT, Iñárritu AI, Mexican movies GPT, AI fact checking, human in the loop',
    emojis: "['🎬', '🇲🇽', '🎥', '📽️', '🏆', '🎭', '✨', '🌟', '🎞️', '🎦', '💀', '🍿']",
    rareEmojis: "['🦅', '🏅']",
    topicCards: [
      { emoji: '🎬', title: 'Directors', desc: 'Del Toro, Iñárritu, Cuarón, new voices' },
      { emoji: '🏆', title: 'Award Winners', desc: 'Oscar-winning Mexican filmmakers' },
      { emoji: '🎭', title: 'Golden Age Cinema', desc: 'Cine de oro, classic Mexican films' },
      { emoji: '📺', title: 'Modern Films', desc: 'Contemporary Mexican cinema' },
    ],
    claims: [
      { emoji: '🏆', text: 'Claims a Mexican director won <span class="text-accent font-medium">for the wrong film</span> — accurate awards?' },
      { emoji: '🎬', text: 'Confuses Mexican films with <span class="text-accent font-medium">Spanish productions</span> — catch the error?' },
      { emoji: '🎭', text: 'Gets cine de oro facts <span class="text-accent font-medium">wrong</span> — accurate film history?' },
    ],
    taskExample: { question: 'Which Mexican directors have won Best Director at the Oscars?', answer: 'Alfonso Cuarón, Alejandro González Iñárritu, and Guillermo del Toro have all won Best Director...' },
    whyMatters: 'AI sometimes confuses Mexican cinema with Spanish cinema, and makes errors about the acclaimed "Three Amigos" of Mexican filmmaking.',
    finalCta: 'You know Mexican cinema better than any AI. Help prove it.',
  },
  {
    slug: 'latin-music-challenge-gpt',
    title: 'Latin Music',
    domain: 'Latin music',
    headline: 'Does it actually KNOW Latin music?',
    subheadline: 'Whether you live for reggaeton or love Latin classics, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Latin music, reggaeton, salsa, and Latin American artists. Be the judge — help catch AI mistakes.',
    keywords: 'Latin music AI test, GPT reggaeton knowledge, Bad Bunny ChatGPT, salsa AI, bachata GPT, Latin pop AI, AI fact checking, human in the loop',
    emojis: "['🎵', '🌎', '💃', '🕺', '🎶', '✨', '💫', '🌟', '🎹', '🎤', '🎺', '🥁']",
    rareEmojis: "['🦜', '🌴']",
    topicCards: [
      { emoji: '🎤', title: 'Reggaeton & Urban', desc: 'Bad Bunny, Daddy Yankee, J Balvin, Karol G' },
      { emoji: '💃', title: 'Salsa & Bachata', desc: 'Classic salsa, modern bachata, dancers' },
      { emoji: '🎺', title: 'Regional Genres', desc: 'Cumbia, merengue, vallenato, regional Mexican' },
      { emoji: '🌟', title: 'Latin Pop', desc: 'Shakira, Ricky Martin, crossover hits' },
    ],
    claims: [
      { emoji: '🎤', text: 'Claims reggaeton originated in <span class="text-accent font-medium">the wrong country</span> — accurate history?' },
      { emoji: '💃', text: 'Confuses salsa with <span class="text-accent font-medium">other genres</span> — catch the mix-up?' },
      { emoji: '🎺', text: 'Gets artist nationalities <span class="text-accent font-medium">wrong</span> — accurate backgrounds?' },
    ],
    taskExample: { question: 'Where did reggaeton originate?', answer: 'Reggaeton originated in Puerto Rico in the 1990s, blending Caribbean rhythms with hip-hop influences...' },
    whyMatters: 'AI often confuses Latin music genres and misattributes artists to wrong countries. Latin music fans can catch these mistakes.',
    finalCta: 'You know Latin music better than any AI. Help prove it.',
  },
  {
    slug: 'argentine-culture-challenge-gpt',
    title: 'Argentine Culture',
    domain: 'Argentine culture',
    headline: 'Does it actually KNOW Argentine culture?',
    subheadline: 'Whether you are Argentine or love the culture, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Argentine traditions, tango, asado, and customs. Be the judge — help catch AI mistakes.',
    keywords: 'Argentine culture AI test, GPT Argentina knowledge, tango ChatGPT, asado AI, mate GPT, AI fact checking, human in the loop',
    emojis: "['🇦🇷', '💃', '🥩', '🧉', '⚽', '🎭', '✨', '💫', '🌟', '🎶', '🎻', '🏔️']",
    rareEmojis: "['🐄', '🦙']",
    topicCards: [
      { emoji: '💃', title: 'Tango', desc: 'Dance, music, milongas, history' },
      { emoji: '🥩', title: 'Food & Asado', desc: 'Asado traditions, empanadas, dulce de leche' },
      { emoji: '🧉', title: 'Mate Culture', desc: 'Yerba mate traditions, social rituals' },
      { emoji: '⚽', title: 'Football & Society', desc: 'Passion for fútbol, Maradona, Messi' },
    ],
    claims: [
      { emoji: '💃', text: 'Claims tango originated in <span class="text-accent font-medium">the wrong neighborhood</span> — accurate history?' },
      { emoji: '🧉', text: 'Gets mate etiquette <span class="text-accent font-medium">wrong</span> — catch the mistakes?' },
      { emoji: '🥩', text: 'Confuses Argentine asado with <span class="text-accent font-medium">general BBQ</span> — distinct traditions?' },
    ],
    taskExample: { question: 'How is mate properly shared?', answer: 'Mate is passed around in a circle, with one person (the cebador) preparing and refilling for everyone...' },
    whyMatters: 'AI often gives generic answers about Argentina, missing the unique traditions like proper mate etiquette that Argentines know by heart.',
    finalCta: 'You know Argentine culture better than any AI. Help prove it.',
  },
  {
    slug: 'brazilian-culture-challenge-gpt',
    title: 'Brazilian Culture',
    domain: 'Brazilian culture',
    headline: 'Does it actually KNOW Brazilian culture?',
    subheadline: 'Whether you are Brazilian or love the culture, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Brazilian traditions, Carnival, food, and customs. Be the judge — help catch AI mistakes.',
    keywords: 'Brazilian culture AI test, GPT Brazil knowledge, Carnival ChatGPT, samba AI, caipirinha GPT, AI fact checking, human in the loop',
    emojis: "['🇧🇷', '💃', '🎭', '⚽', '🎶', '🌴', '✨', '💫', '🌟', '🥁', '🦜', '🏖️']",
    rareEmojis: "['🦜', '🐆']",
    topicCards: [
      { emoji: '🎭', title: 'Carnival', desc: 'Samba schools, blocos, regional celebrations' },
      { emoji: '🍽️', title: 'Food & Drinks', desc: 'Feijoada, açaí, caipirinha, regional cuisines' },
      { emoji: '🎶', title: 'Music & Dance', desc: 'Samba, bossa nova, forró, funk carioca' },
      { emoji: '⚽', title: 'Football & Society', desc: 'Futebol culture, legends, rivalries' },
    ],
    claims: [
      { emoji: '🎭', text: 'Confuses Rio Carnival with <span class="text-accent font-medium">other city celebrations</span> — distinct traditions?' },
      { emoji: '🍽️', text: 'Gets feijoada ingredients <span class="text-accent font-medium">wrong</span> — authentic recipe?' },
      { emoji: '🎶', text: 'Mixes up Brazilian music genres <span class="text-accent font-medium">incorrectly</span> — accurate styles?' },
    ],
    taskExample: { question: 'What is the difference between Carnival in Rio and Salvador?', answer: 'Rio features samba school parades in the Sambadrome, while Salvador has axé music and blocos in the streets...' },
    whyMatters: 'AI often gives generic "Carnival and samba" answers about Brazil, missing regional diversity that Brazilians know well.',
    finalCta: 'You know Brazilian culture better than any AI. Help prove it.',
  },

  // Arabic (6)
  {
    slug: 'arabic-language-challenge-gpt',
    title: 'Arabic Language',
    domain: 'Arabic language',
    headline: 'Does it actually KNOW Arabic?',
    subheadline: 'Whether you speak Arabic fluently or learning, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Arabic language, dialects, and grammar. Be the judge — help catch AI mistakes.',
    keywords: 'Arabic language AI test, GPT Arabic knowledge, Arabic grammar ChatGPT, MSA AI, Arabic dialects GPT, AI fact checking, human in the loop',
    emojis: "['🔤', '📚', '✍️', '💬', '📖', '🎓', '✨', '💫', '🌟', '📝', '🗣️', '🕌']",
    rareEmojis: "['🐪', '🌙']",
    topicCards: [
      { emoji: '📚', title: 'Modern Standard Arabic', desc: 'Grammar, formal writing, media Arabic' },
      { emoji: '🗣️', title: 'Dialects', desc: 'Egyptian, Levantine, Gulf, Maghrebi' },
      { emoji: '✍️', title: 'Script & Calligraphy', desc: 'Arabic script, calligraphy styles' },
      { emoji: '💬', title: 'Expressions', desc: 'Common phrases, cultural expressions' },
    ],
    claims: [
      { emoji: '📚', text: 'Confuses MSA with <span class="text-accent font-medium">dialectal Arabic</span> — proper distinction?' },
      { emoji: '🗣️', text: 'Claims dialects are <span class="text-accent font-medium">mutually intelligible</span> — always true?' },
      { emoji: '✍️', text: 'Gets Arabic grammar rules <span class="text-accent font-medium">wrong</span> — accurate explanations?' },
    ],
    taskExample: { question: 'What is the difference between MSA and dialects?', answer: 'MSA (Modern Standard Arabic) is the formal written language, while dialects vary by region and are used in daily speech...' },
    whyMatters: 'AI often confuses Arabic dialects or gives MSA where colloquial would be appropriate. Arabic speakers catch these mistakes immediately.',
    finalCta: 'You know Arabic better than any AI. Help prove it.',
  },
  {
    slug: 'egyptian-culture-challenge-gpt',
    title: 'Egyptian Culture',
    domain: 'Egyptian culture',
    headline: 'Does it actually KNOW Egyptian culture?',
    subheadline: 'Whether you are Egyptian or love the culture, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Egyptian traditions, food, and modern culture. Be the judge — help catch AI mistakes.',
    keywords: 'Egyptian culture AI test, GPT Egypt knowledge, Egyptian traditions ChatGPT, koshari AI, Egyptian Arabic GPT, AI fact checking, human in the loop',
    emojis: "['🇪🇬', '🏛️', '☀️', '🌴', '🍽️', '🎭', '✨', '💫', '🌟', '🕌', '🐪', '⭐']",
    rareEmojis: "['🦂', '🐍']",
    topicCards: [
      { emoji: '🍽️', title: 'Food & Cuisine', desc: 'Koshari, ful medames, Egyptian dishes' },
      { emoji: '🗣️', title: 'Egyptian Arabic', desc: 'Dialect, expressions, humor' },
      { emoji: '🎭', title: 'Arts & Entertainment', desc: 'Egyptian cinema, music, comedy' },
      { emoji: '🕌', title: 'Daily Life', desc: 'Modern Egypt, customs, social life' },
    ],
    claims: [
      { emoji: '🍽️', text: 'Gets koshari ingredients <span class="text-accent font-medium">wrong</span> — authentic recipe?' },
      { emoji: '🗣️', text: 'Confuses Egyptian expressions with <span class="text-accent font-medium">other dialects</span> — accurate Arabic?' },
      { emoji: '🎭', text: 'Gets Egyptian cinema facts <span class="text-accent font-medium">wrong</span> — accurate film history?' },
    ],
    taskExample: { question: 'What is koshari?', answer: 'Koshari is Egypt\'s national dish, combining rice, pasta, lentils, chickpeas, and fried onions with tomato sauce...' },
    whyMatters: 'AI often gives generic "pyramids and pharaohs" answers about Egypt, missing modern Egyptian culture that Egyptians live every day.',
    finalCta: 'You know Egyptian culture better than any AI. Help prove it.',
  },
  {
    slug: 'arab-cinema-challenge-gpt',
    title: 'Arab Cinema',
    domain: 'Arab cinema',
    headline: 'Does it actually KNOW Arab cinema?',
    subheadline: 'Whether you love Egyptian golden age films or modern Arab cinema, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Arab films, Egyptian cinema history, and regional filmmakers. Be the judge — help catch AI mistakes.',
    keywords: 'Arab cinema AI test, GPT Egyptian film knowledge, Arab movies ChatGPT, Middle Eastern cinema AI, AI fact checking, human in the loop',
    emojis: "['🎬', '🎥', '📽️', '🏆', '🎭', '✨', '🌟', '🎞️', '🎦', '🍿', '🌙', '⭐']",
    rareEmojis: "['🐪', '🦅']",
    topicCards: [
      { emoji: '🎬', title: 'Egyptian Cinema', desc: 'Golden age, classic stars, Hollywood of the East' },
      { emoji: '🌍', title: 'Regional Films', desc: 'Lebanese, Moroccan, Palestinian cinema' },
      { emoji: '🎭', title: 'Stars & Directors', desc: 'Classic and contemporary filmmakers' },
      { emoji: '📺', title: 'Modern Arab Cinema', desc: 'Contemporary films, streaming, new voices' },
    ],
    claims: [
      { emoji: '🎬', text: 'Gets Egyptian cinema\'s golden age dates <span class="text-accent font-medium">wrong</span> — accurate timeline?' },
      { emoji: '🎭', text: 'Confuses Arab actors from <span class="text-accent font-medium">different countries</span> — catch the error?' },
      { emoji: '🌍', text: 'Mixes up films from <span class="text-accent font-medium">different Arab countries</span> — accurate origins?' },
    ],
    taskExample: { question: 'When was Egyptian cinema\'s golden age?', answer: 'The Egyptian golden age of cinema was roughly the 1940s-1960s, with studios in Cairo producing films seen across the Arab world...' },
    whyMatters: 'AI makes confident claims about Arab cinema that film fans immediately recognize as wrong. Egyptian cinema history alone spans over a century.',
    finalCta: 'You know Arab cinema better than any AI. Help prove it.',
  },
  {
    slug: 'gulf-culture-challenge-gpt',
    title: 'Gulf Culture',
    domain: 'Gulf culture',
    headline: 'Does it actually KNOW Gulf culture?',
    subheadline: 'Whether you are from the Gulf or familiar with the region, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Gulf culture, UAE, Saudi, and regional traditions. Be the judge — help catch AI mistakes.',
    keywords: 'Gulf culture AI test, GPT UAE knowledge, Saudi traditions ChatGPT, Khaleeji culture AI, Dubai GPT, AI fact checking, human in the loop',
    emojis: "['🇦🇪', '🇸🇦', '🇶🇦', '🏙️', '🐪', '☀️', '🌴', '✨', '💫', '🌟', '🕌', '⭐']",
    rareEmojis: "['🦅', '🐍']",
    topicCards: [
      { emoji: '🕌', title: 'Traditions & Customs', desc: 'Hospitality, coffee culture, social norms' },
      { emoji: '🍽️', title: 'Food & Cuisine', desc: 'Machboos, harees, regional dishes' },
      { emoji: '🏙️', title: 'Modern Gulf', desc: 'Dubai, Abu Dhabi, modernization' },
      { emoji: '🎭', title: 'Arts & Heritage', desc: 'Poetry, pearl diving history, falconry' },
    ],
    claims: [
      { emoji: '🕌', text: 'Confuses Gulf customs with <span class="text-accent font-medium">other Arab regions</span> — distinct traditions?' },
      { emoji: '🍽️', text: 'Gets traditional dishes <span class="text-accent font-medium">wrong</span> — authentic Gulf cuisine?' },
      { emoji: '🏙️', text: 'Mixes up facts about <span class="text-accent font-medium">different Gulf countries</span> — accurate distinctions?' },
    ],
    taskExample: { question: 'What is Khaleeji hospitality like?', answer: 'Gulf hospitality is legendary, with Arabic coffee (gahwa) and dates offered to guests as a sign of welcome...' },
    whyMatters: 'AI often gives generic Middle East answers, missing the distinct culture of the Gulf region that locals know well.',
    finalCta: 'You know Gulf culture better than any AI. Help prove it.',
  },
  {
    slug: 'levantine-culture-challenge-gpt',
    title: 'Levantine Culture',
    domain: 'Levantine culture',
    headline: 'Does it actually KNOW Levantine culture?',
    subheadline: 'Whether you are from the Levant or love the region, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Levantine culture, food, and traditions from Lebanon, Jordan, Syria, Palestine. Be the judge — help catch AI mistakes.',
    keywords: 'Levantine culture AI test, GPT Lebanon knowledge, Syrian traditions ChatGPT, Palestinian culture AI, Shami GPT, AI fact checking, human in the loop',
    emojis: "['🇱🇧', '🇯🇴', '🇸🇾', '🇵🇸', '🫓', '🧆', '🌳', '✨', '💫', '🌟', '🕌', '⭐']",
    rareEmojis: "['🦚', '🐦']",
    topicCards: [
      { emoji: '🍽️', title: 'Food & Mezze', desc: 'Hummus, falafel, tabbouleh, regional variations' },
      { emoji: '🗣️', title: 'Levantine Arabic', desc: 'Shami dialect, expressions, regional differences' },
      { emoji: '🎭', title: 'Arts & Music', desc: 'Fairuz, dabke, regional arts' },
      { emoji: '🏛️', title: 'History & Heritage', desc: 'Ancient cities, modern culture' },
    ],
    claims: [
      { emoji: '🍽️', text: 'Claims hummus is from <span class="text-accent font-medium">one specific country</span> — disputed origins?' },
      { emoji: '🗣️', text: 'Confuses Lebanese dialect with <span class="text-accent font-medium">other Levantine varieties</span> — accurate distinctions?' },
      { emoji: '🎭', text: 'Gets dabke origins <span class="text-accent font-medium">wrong</span> — accurate cultural context?' },
    ],
    taskExample: { question: 'Where does hummus come from?', answer: 'Hummus origins are disputed across the Levant, with Lebanon, Israel, and Palestine all claiming it as their own...' },
    whyMatters: 'AI often makes claims about Levantine food and culture that ignite passionate debates. People from the region know the nuances.',
    finalCta: 'You know Levantine culture better than any AI. Help prove it.',
  },
  {
    slug: 'arabic-music-challenge-gpt',
    title: 'Arabic Music',
    domain: 'Arabic music',
    headline: 'Does it actually KNOW Arabic music?',
    subheadline: 'Whether you love Umm Kulthum or modern Arabic pop, be the judge—and show the world.',
    description: 'Test ChatGPT and AI on Arabic music, from classics to modern artists. Be the judge — help catch AI mistakes.',
    keywords: 'Arabic music AI test, GPT Umm Kulthum knowledge, Arabic pop ChatGPT, Fairuz AI, Arabic songs GPT, AI fact checking, human in the loop',
    emojis: "['🎵', '🎶', '🎤', '🎻', '✨', '💫', '🌟', '🎹', '🎧', '🌙', '⭐', '🕌']",
    rareEmojis: "['🐪', '🦅']",
    topicCards: [
      { emoji: '🎤', title: 'Classic Legends', desc: 'Umm Kulthum, Fairuz, Abdel Halim' },
      { emoji: '🌟', title: 'Modern Stars', desc: 'Amr Diab, Nancy Ajram, contemporary artists' },
      { emoji: '🎻', title: 'Traditional Music', desc: 'Maqam, oud, regional styles' },
      { emoji: '🎧', title: 'Modern Arabic Pop', desc: 'Khaleeji pop, Mahraganat, new trends' },
    ],
    claims: [
      { emoji: '🎤', text: 'Gets Umm Kulthum facts <span class="text-accent font-medium">wrong</span> — accurate music history?' },
      { emoji: '🌟', text: 'Confuses artists from <span class="text-accent font-medium">different Arab countries</span> — catch the errors?' },
      { emoji: '🎻', text: 'Gets maqam concepts <span class="text-accent font-medium">wrong</span> — accurate music theory?' },
    ],
    taskExample: { question: 'Why is Umm Kulthum called "Star of the East"?', answer: 'Umm Kulthum dominated Arabic music for decades, with concerts that could last hours and stopped traffic across the Arab world...' },
    whyMatters: 'AI makes claims about Arabic music that fans immediately catch. From Umm Kulthum trivia to maqam theory, accuracy matters.',
    finalCta: 'You know Arabic music better than any AI. Help prove it.',
  },
];

// Helper to generate the Astro page content
function generatePage(campaign, template) {
  let content = template;

  // Basic replacements
  content = content.replace(/kpop-challenge-gpt/g, campaign.slug);
  content = content.replace(/K-Pop/g, campaign.title);
  content = content.replace(/K-pop/g, campaign.title);

  // Title and description
  content = content.replace(
    /title="Judge GPT's K-Pop Knowledge \| Test AI on BTS, BLACKPINK, NewJeans & More \| HumanJudge"/,
    `title="Judge GPT's ${campaign.title} Knowledge | Test AI on ${campaign.domain} | HumanJudge"`
  );
  content = content.replace(
    /description="GPT-5\.2 just dropped\. Does it actually know K-pop\?[^"]*"/,
    `description="GPT-5.2 just dropped. Does it actually know ${campaign.domain}? ${campaign.description}"`
  );
  content = content.replace(
    /keywords="K-pop AI test[^"]*"/,
    `keywords="${campaign.keywords}"`
  );

  // Headline and subheadline
  content = content.replace(
    /Does it actually KNOW K-pop\?/,
    campaign.headline
  );
  content = content.replace(
    /Whether you live and breathe K-pop or just know the basics, be the judge—and show the world\./,
    campaign.subheadline
  );

  // Emoji arrays
  content = content.replace(
    /const kpopEmojis = \['🎤', '💃', '🕺', '🎵', '🎶', '🇰🇷', '🎧', '👏', '✨', '💜', '🌟', '🎹'\];/,
    `const domainEmojis = ${campaign.emojis};`
  );
  content = content.replace(/kpopEmojis/g, 'domainEmojis');
  content = content.replace(
    /const rareEmojis = \['🐰', '🐻'\];/,
    `const rareEmojis = ${campaign.rareEmojis};`
  );

  // Final CTA
  content = content.replace(
    /You know K-pop better than any AI\. Help prove it\./,
    campaign.finalCta
  );

  return content;
}

// Main execution
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

let created = 0;
let skipped = 0;

campaigns.forEach(campaign => {
  const outputPath = path.join(OUTPUT_DIR, `${campaign.slug}.astro`);

  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipped (exists): ${campaign.slug}`);
    skipped++;
    return;
  }

  const content = generatePage(campaign, template);
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`✅ Created: ${campaign.slug}`);
  created++;
});

console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);
console.log('🔨 Run "npm run build" to generate sitemap');
