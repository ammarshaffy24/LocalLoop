import { QuizQuestion, QuizResult } from '../types';

export const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "You're offered the lead role in a play. What's your first thought?",
    image: "🎭",
    options: [
      { text: "Finally, the spotlight I deserve!", archetype: "villain" },
      { text: "I hope I can make the audience cry tears of joy", archetype: "romantic" },
      { text: "Time to bring some comic relief to the world", archetype: "comedian" },
      { text: "I must embody the character's deepest truth", archetype: "method" },
      { text: "Can I improvise my own lines?", archetype: "rebel" },
      { text: "I'll silently steal every scene", archetype: "mime" }
    ]
  },
  {
    id: 2,
    question: "Your ideal stage costume would be...",
    image: "👗",
    options: [
      { text: "A dramatic cape that billows in the wind", archetype: "villain" },
      { text: "Flowing robes in soft, romantic colors", archetype: "romantic" },
      { text: "Anything with polka dots and oversized shoes", archetype: "comedian" },
      { text: "Whatever the character would authentically wear", archetype: "method" },
      { text: "Something I designed myself that breaks all the rules", archetype: "rebel" },
      { text: "Elegant stripes and pristine white gloves", archetype: "mime" }
    ]
  },
  {
    id: 3,
    question: "How do you handle stage fright?",
    image: "😰",
    options: [
      { text: "Channel it into intimidating presence", archetype: "villain" },
      { text: "Think of it as butterflies of love", archetype: "romantic" },
      { text: "Turn it into nervous energy for comedy", archetype: "comedian" },
      { text: "Become the character completely", archetype: "method" },
      { text: "Throw out the script and wing it", archetype: "rebel" },
      { text: "Express it through interpretive movement", archetype: "mime" }
    ]
  },
  {
    id: 4,
    question: "Your perfect dramatic monologue would be about...",
    image: "📜",
    options: [
      { text: "The sweet taste of revenge", archetype: "villain" },
      { text: "Love that transcends all obstacles", archetype: "romantic" },
      { text: "The absurdity of everyday life", archetype: "comedian" },
      { text: "Raw human pain and resilience", archetype: "method" },
      { text: "Why society's rules are meaningless", archetype: "rebel" },
      { text: "The beauty of wordless communication", archetype: "mime" }
    ]
  },
  {
    id: 5,
    question: "What's your signature dramatic exit?",
    image: "🚪",
    options: [
      { text: "A sinister laugh echoing as I disappear", archetype: "villain" },
      { text: "A single tear and a wistful backward glance", archetype: "romantic" },
      { text: "Tripping over my own feet, but making it look intentional", archetype: "comedian" },
      { text: "Completely embodying the character's emotional state", archetype: "method" },
      { text: "Flipping over a table and storming out", archetype: "rebel" },
      { text: "Gracefully dissolving into the shadows", archetype: "mime" }
    ]
  },
  {
    id: 6,
    question: "Your ideal audience reaction would be...",
    image: "👏",
    options: [
      { text: "Gasps of shock and delicious fear", archetype: "villain" },
      { text: "Sighs of romantic longing", archetype: "romantic" },
      { text: "Uncontrollable laughter and applause", archetype: "comedian" },
      { text: "Stunned silence followed by emotional catharsis", archetype: "method" },
      { text: "Confused whispers and heated debates", archetype: "rebel" },
      { text: "Mesmerized silence and wonder", archetype: "mime" }
    ]
  }
];

const archetypes: { [key: string]: QuizResult } = {
  villain: {
    archetype: "The Magnificent Villain",
    title: "The Overdramatic Villain",
    description: "You live for the gasps, the shock, the delicious terror in the audience's eyes. Every entrance is grand, every line delivered with sinister precision. You don't just play the villain—you ARE the villain, and you love every magnificently evil moment of it.",
    quote: "If you're going to be bad, be spectacularly bad.",
    costume: "A flowing black cape, dramatic makeup, and perhaps a monocle for that extra touch of sophisticated menace.",
    color: "from-red-900 to-black",
    icon: "skull"
  },
  romantic: {
    archetype: "The Lovelorn Poet",
    title: "The Hopeless Romantic",
    description: "Your heart beats in iambic pentameter, and every gesture is a love letter to the universe. You believe in true love, grand gestures, and the power of a perfectly timed sigh. The stage is your canvas for painting the beauty of human connection.",
    quote: "Love is the only script worth following.",
    costume: "Flowing fabrics in soft pastels, flower crowns, and always a locket containing a pressed rose.",
    color: "from-pink-600 to-purple-600",
    icon: "heart"
  },
  comedian: {
    archetype: "The Comic Relief",
    title: "The Delightful Disaster",
    description: "You turn life's awkward moments into art, finding humor in the chaos and bringing joy to even the darkest scenes. Your timing is impeccable, your pratfalls are legendary, and your ability to make people laugh is your greatest superpower.",
    quote: "Life's too short not to laugh at the absurdity of it all.",
    costume: "Mismatched patterns, oversized bow ties, and shoes that are definitely too big—but that's the point!",
    color: "from-yellow-500 to-orange-500",
    icon: "zap"
  },
  method: {
    archetype: "The Method Master",
    title: "The Intense Artist",
    description: "You don't act—you become. Every role is a journey into the human psyche, every performance a raw exploration of truth. You've been known to stay in character for weeks because authentic art demands authentic commitment.",
    quote: "The only way to truly understand a character is to live their truth.",
    costume: "Whatever the character would wear, researched down to the last historically accurate button.",
    color: "from-gray-700 to-slate-800",
    icon: "paintbrush"
  },
  rebel: {
    archetype: "The Rule Breaker",
    title: "The Theatrical Anarchist",
    description: "Scripts are merely suggestions, traditions are meant to be shattered, and the fourth wall is your personal enemy. You bring chaos and creativity in equal measure, turning every performance into an unpredictable adventure.",
    quote: "Why follow the script when you can rewrite the rules?",
    costume: "A mix of genres and eras that shouldn't work together but somehow create theatrical magic.",
    color: "from-emerald-600 to-teal-600",
    icon: "crown"
  },
  mime: {
    archetype: "The Silent Storyteller",
    title: "The Mysterious Mime",
    description: "You speak volumes without saying a word, painting emotions in the air with graceful gestures. Your invisible box is a metaphor for the boundaries others can't see, and your silence is more powerful than any monologue.",
    quote: "Sometimes the most profound truths are spoken in silence.",
    costume: "Classic black and white stripes, pristine white gloves, and face paint that would make Marceau proud.",
    color: "from-slate-600 to-slate-800",
    icon: "users"
  }
};

export const getResult = (answers: string[]): QuizResult => {
  // Count occurrences of each archetype
  const counts: { [key: string]: number } = {};
  answers.forEach(answer => {
    counts[answer] = (counts[answer] || 0) + 1;
  });

  // Find the most frequent archetype
  const mostFrequent = Object.keys(counts).reduce((a, b) => 
    counts[a] > counts[b] ? a : b
  );

  return archetypes[mostFrequent] || archetypes.method;
};