export const BAD_WORDS = [
  "anjing", "babi", "bangsat", "bodoh", "bego", "goblok", "tolol", "monyet", 
  "ngentot", "kontol", "memek", "jembut", "kampret", "keparat", "pantat", "sialan", 
  "tai", "asu", "bajingan", "brengsek", "perek", "pecun", "bencong", "banci", 
  "jablay", "jancuk", "jancok", "pantek", "peler", "pukimak", "kampang"
];

export function filterProfanity(text: string): string {
  let filteredText = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filteredText = filteredText.replace(regex, (match) => '*'.repeat(match.length));
  });
  return filteredText;
}
