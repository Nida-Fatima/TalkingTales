import { Story, Language, Situation, DialogueLine, Character, Word } from '../types';
import { generateCustomStory, checkOpenRouterConfig, StoryGenerationRequest } from '../lib/openrouter';

const germanStoryData: Record<string, { characters: Character[], lines: string[] }> = {
  restaurant: {
    characters: [
      { name: 'Anna', role: 'Customer', avatar: '👩' },
      { name: 'Klaus', role: 'Waiter', avatar: '👨‍🍳' }
    ],
    lines: [
      'Guten Abend! Haben Sie einen Tisch für zwei Personen?',
      'Guten Abend! Ja, natürlich. Folgen Sie mir bitte.',
      'Vielen Dank. Könnten wir die Speisekarte bekommen?',
      'Selbstverständlich. Hier ist die Karte. Möchten Sie etwas trinken?',
      'Ja, ich hätte gerne ein Glas Rotwein, bitte.',
      'Ausgezeichnete Wahl. Und haben Sie schon gewählt?',
      'Ich nehme das Schnitzel mit Kartoffelsalat.',
      'Sehr gut. Das Schnitzel ist heute besonders frisch.',
      'Wie lange dauert es ungefähr?',
      'Etwa zwanzig Minuten. Ist das in Ordnung?',
      'Ja, das ist perfekt. Vielen Dank.',
      'Gern geschehen. Ich bringe Ihnen gleich den Wein.',
      'Könnten Sie mir auch etwas Brot bringen?',
      'Natürlich, ich bringe Ihnen frisches Brot.',
      'Sie sind sehr freundlich. Danke schön.',
      'Das ist unser Service. Genießen Sie Ihr Essen.',
      'Das werde ich sicher. Alles sieht köstlich aus.',
      'Freut mich zu hören. Rufen Sie mich, wenn Sie etwas brauchen.',
      'Machen wir. Könnten wir später die Rechnung haben?',
      'Selbstverständlich. Ich bringe sie Ihnen zum Dessert.'
    ]
  },
  airport: {
    characters: [
      { name: 'Maria', role: 'Passenger', avatar: '👩‍💼' },
      { name: 'Hans', role: 'Check-in Agent', avatar: '👨‍💼' }
    ],
    lines: [
      'Guten Morgen! Ich möchte einchecken.',
      'Guten Morgen! Haben Sie Ihren Reisepass und Ihr Ticket?',
      'Ja, hier sind sie. Mein Flug geht nach München.',
      'Danke. Haben Sie Gepäck zum Aufgeben?',
      'Ja, ich habe einen Koffer.',
      'Perfekt. Stellen Sie ihn bitte auf die Waage.',
      'Ist das Gewicht in Ordnung?',
      'Ja, das passt. Möchten Sie einen Fensterplatz?',
      'Das wäre toll, wenn möglich.',
      'Kein Problem. Hier ist Ihre Bordkarte.',
      'Wann beginnt das Boarding?',
      'Das Boarding beginnt um 10:30 Uhr.',
      'Wo ist das Gate?',
      'Gate B12. Folgen Sie den Schildern.',
      'Wie lange dauert der Flug?',
      'Etwa eine Stunde und fünfzehn Minuten.',
      'Gibt es Verspätungen?',
      'Nein, der Flug ist pünktlich.',
      'Vielen Dank für Ihre Hilfe.',
      'Gern geschehen. Haben Sie einen guten Flug!'
    ]
  },
  'job-interview': {
    characters: [
      { name: 'Sarah', role: 'Applicant', avatar: '👩‍💼' },
      { name: 'Herr Weber', role: 'Interviewer', avatar: '👨‍💼' }
    ],
    lines: [
      'Guten Tag, Frau Schmidt. Schön, Sie kennenzulernen.',
      'Guten Tag, Herr Weber. Freut mich auch.',
      'Bitte nehmen Sie Platz. Möchten Sie etwas trinken?',
      'Ein Glas Wasser wäre schön, danke.',
      'Erzählen Sie mir etwas über sich.',
      'Ich bin Informatikerin und arbeite seit fünf Jahren in der Branche.',
      'Das ist beeindruckend. Warum möchten Sie bei uns arbeiten?',
      'Ihr Unternehmen hat einen sehr guten Ruf.',
      'Was sind Ihre Stärken?',
      'Ich bin sehr organisiert und arbeite gerne im Team.',
      'Haben Sie Erfahrung mit unserem System?',
      'Ja, ich habe drei Jahre damit gearbeitet.',
      'Welche Ziele haben Sie für die Zukunft?',
      'Ich möchte meine Fähigkeiten weiterentwickeln.',
      'Haben Sie noch Fragen an mich?',
      'Wann kann ich mit einer Antwort rechnen?',
      'Wir melden uns bis Ende der Woche.',
      'Das ist perfekt. Vielen Dank.',
      'Danke für Ihr Interesse. Auf Wiedersehen.',
      'Auf Wiedersehen und einen schönen Tag!'
    ]
  },
  shopping: {
    characters: [
      { name: 'Lisa', role: 'Customer', avatar: '👩' },
      { name: 'Petra', role: 'Sales Assistant', avatar: '👩‍💼' }
    ],
    lines: [
      'Entschuldigung, können Sie mir helfen?',
      'Natürlich! Was suchen Sie denn?',
      'Ich brauche ein Kleid für eine Hochzeit.',
      'Welche Größe haben Sie?',
      'Größe 38, bitte.',
      'Welche Farbe bevorzugen Sie?',
      'Etwas in Blau oder Grün wäre schön.',
      'Hier haben wir ein schönes blaues Kleid.',
      'Das gefällt mir. Kann ich es anprobieren?',
      'Selbstverständlich. Die Umkleidekabine ist dort drüben.',
      'Wie steht es mir?',
      'Es sieht wunderbar aus! Die Farbe passt perfekt.',
      'Was kostet das Kleid?',
      'Es kostet 89 Euro.',
      'Das ist ein fairer Preis. Ich nehme es.',
      'Möchten Sie auch passende Schuhe dazu?',
      'Ja, das wäre toll. Welche haben Sie?',
      'Diese schwarzen Pumps würden gut passen.',
      'Perfekt. Ich nehme beides.',
      'Wunderbar! Das macht zusammen 139 Euro.'
    ]
  },
  hotel: {
    characters: [
      { name: 'Thomas', role: 'Guest', avatar: '👨' },
      { name: 'Frau Müller', role: 'Receptionist', avatar: '👩‍💼' }
    ],
    lines: [
      'Guten Abend! Ich habe eine Reservierung.',
      'Guten Abend! Wie ist Ihr Name, bitte?',
      'Thomas Schmidt. Ich habe für drei Nächte gebucht.',
      'Einen Moment, bitte. Ja, hier ist Ihre Reservierung.',
      'Ist das Zimmer bereit?',
      'Ja, Zimmer 205. Hier ist Ihr Schlüssel.',
      'Gibt es WLAN im Zimmer?',
      'Ja, das WLAN ist kostenlos. Das Passwort steht im Zimmer.',
      'Wann gibt es Frühstück?',
      'Das Frühstück wird von 7 bis 10 Uhr serviert.',
      'Wo ist der Frühstücksraum?',
      'Im Erdgeschoss, gleich neben der Rezeption.',
      'Haben Sie einen Parkplatz?',
      'Ja, der Parkplatz ist hinter dem Hotel.',
      'Ist er kostenlos?',
      'Ja, für unsere Gäste ist er kostenlos.',
      'Gibt es einen Safe im Zimmer?',
      'Ja, jedes Zimmer hat einen elektronischen Safe.',
      'Vielen Dank für die Informationen.',
      'Gern geschehen. Ich wünsche Ihnen einen angenehmen Aufenthalt!'
    ]
  },
  doctor: {
    characters: [
      { name: 'Herr Klein', role: 'Patient', avatar: '👨' },
      { name: 'Dr. Wagner', role: 'Doctor', avatar: '👨‍⚕️' }
    ],
    lines: [
      'Guten Tag, Herr Klein. Was kann ich für Sie tun?',
      'Guten Tag, Doktor. Mir geht es nicht gut.',
      'Was für Beschwerden haben Sie?',
      'Ich habe Kopfschmerzen und fühle mich müde.',
      'Seit wann haben Sie diese Symptome?',
      'Seit etwa drei Tagen.',
      'Haben Sie Fieber?',
      'Ja, gestern Abend hatte ich 38,5 Grad.',
      'Nehmen Sie regelmäßig Medikamente?',
      'Nein, normalerweise nehme ich keine Medikamente.',
      'Ich werde Sie kurz untersuchen.',
      'In Ordnung, Doktor.',
      'Ihr Hals ist etwas rot. Es könnte eine Erkältung sein.',
      'Was soll ich dagegen tun?',
      'Trinken Sie viel Wasser und ruhen Sie sich aus.',
      'Soll ich Medikamente nehmen?',
      'Ich verschreibe Ihnen etwas gegen die Schmerzen.',
      'Wann soll ich wiederkommen?',
      'Wenn es nicht besser wird, kommen Sie in drei Tagen wieder.',
      'Vielen Dank, Doktor. Auf Wiedersehen!'
    ]
  },
  directions: {
    characters: [
      { name: 'Tourist', role: 'Tourist', avatar: '🧳' },
      { name: 'Einheimischer', role: 'Local', avatar: '👨' }
    ],
    lines: [
      'Entschuldigung, können Sie mir helfen?',
      'Ja, gerne. Was suchen Sie denn?',
      'Ich suche das Rathaus.',
      'Das Rathaus ist nicht weit von hier.',
      'Wie komme ich dorthin?',
      'Gehen Sie diese Straße geradeaus.',
      'Wie weit ist es zu Fuß?',
      'Etwa zehn Minuten.',
      'Muss ich irgendwo abbiegen?',
      'Ja, an der zweiten Ampel biegen Sie links ab.',
      'Gibt es Schilder?',
      'Ja, folgen Sie den braunen Schildern.',
      'Ist das Rathaus heute geöffnet?',
      'Ja, es ist bis 17 Uhr geöffnet.',
      'Gibt es in der Nähe ein Café?',
      'Ja, gleich neben dem Rathaus ist ein schönes Café.',
      'Wie heißt es?',
      'Café Central. Es hat sehr guten Kuchen.',
      'Vielen Dank für Ihre Hilfe!',
      'Gern geschehen. Viel Spaß beim Besichtigen!'
    ]
  },
  bank: {
    characters: [
      { name: 'Kunde', role: 'Customer', avatar: '👨‍💼' },
      { name: 'Bankangestellte', role: 'Bank Employee', avatar: '👩‍💼' }
    ],
    lines: [
      'Guten Tag! Ich möchte ein Konto eröffnen.',
      'Guten Tag! Welche Art von Konto möchten Sie?',
      'Ein Girokonto, bitte.',
      'Haben Sie Ihren Ausweis dabei?',
      'Ja, hier ist mein Personalausweis.',
      'Danke. Sind Sie berufstätig?',
      'Ja, ich arbeite als Ingenieur.',
      'Wie hoch ist Ihr monatliches Einkommen?',
      'Etwa 3500 Euro netto.',
      'Möchten Sie eine Kreditkarte dazu?',
      'Ja, das wäre praktisch.',
      'Die Kreditkarte kostet 30 Euro im Jahr.',
      'Das ist in Ordnung.',
      'Brauchen Sie auch Online-Banking?',
      'Ja, unbedingt.',
      'Perfekt. Hier sind die Unterlagen zum Unterschreiben.',
      'Wann bekomme ich meine Karte?',
      'In etwa einer Woche per Post.',
      'Vielen Dank für Ihre Hilfe.',
      'Gern geschehen. Willkommen bei unserer Bank!'
    ]
  }
};

// German word translations with emojis
const germanTranslations: Record<string, { translation: string, emoji: string }> = {
  'Guten': { translation: 'Good', emoji: '✨' },
  'Abend': { translation: 'evening', emoji: '🌆' },
  'Morgen': { translation: 'morning', emoji: '🌅' },
  'Tag': { translation: 'day', emoji: '☀️' },
  'Haben': { translation: 'have', emoji: '🤝' },
  'Sie': { translation: 'you (formal)', emoji: '👤' },
  'einen': { translation: 'a/an (masc.)', emoji: '1️⃣' },
  'eine': { translation: 'a/an (fem.)', emoji: '1️⃣' },
  'ein': { translation: 'a/an (neut.)', emoji: '1️⃣' },
  'Tisch': { translation: 'table', emoji: '🪑' },
  'für': { translation: 'for', emoji: '👥' },
  'zwei': { translation: 'two', emoji: '2️⃣' },
  'drei': { translation: 'three', emoji: '3️⃣' },
  'Personen': { translation: 'people', emoji: '👫' },
  'Ja': { translation: 'Yes', emoji: '✅' },
  'Nein': { translation: 'No', emoji: '❌' },
  'natürlich': { translation: 'naturally/of course', emoji: '🌿' },
  'Folgen': { translation: 'Follow', emoji: '👣' },
  'mir': { translation: 'me', emoji: '👨' },
  'bitte': { translation: 'please', emoji: '🙏' },
  'Vielen': { translation: 'Many', emoji: '💯' },
  'Dank': { translation: 'thanks', emoji: '🙏' },
  'Danke': { translation: 'Thank you', emoji: '🙏' },
  'Könnten': { translation: 'Could', emoji: '❓' },
  'wir': { translation: 'we', emoji: '👥' },
  'die': { translation: 'the (fem./plural)', emoji: '📋' },
  'der': { translation: 'the (masc.)', emoji: '📋' },
  'das': { translation: 'the (neut.)', emoji: '📋' },
  'Speisekarte': { translation: 'menu', emoji: '📋' },
  'bekommen': { translation: 'get/receive', emoji: '📥' },
  'Selbstverständlich': { translation: 'Of course', emoji: '✅' },
  'Hier': { translation: 'Here', emoji: '👉' },
  'ist': { translation: 'is', emoji: '📍' },
  'sind': { translation: 'are', emoji: '👥' },
  'Karte': { translation: 'menu/card', emoji: '📋' },
  'Möchten': { translation: 'Would like', emoji: '💭' },
  'etwas': { translation: 'something', emoji: '🤔' },
  'trinken': { translation: 'drink', emoji: '🥤' },
  'ich': { translation: 'I', emoji: '👤' },
  'hätte': { translation: 'would have', emoji: '💭' },
  'gerne': { translation: 'gladly/would like', emoji: '😊' },
  'Glas': { translation: 'glass', emoji: '🍷' },
  'Rotwein': { translation: 'red wine', emoji: '🍷' },
  'Wein': { translation: 'wine', emoji: '🍷' },
  'Wasser': { translation: 'water', emoji: '💧' },
  'Ausgezeichnete': { translation: 'Excellent', emoji: '⭐' },
  'Wahl': { translation: 'choice', emoji: '✨' },
  'Und': { translation: 'And', emoji: '➕' },
  'haben': { translation: 'have', emoji: '🤝' },
  'schon': { translation: 'already', emoji: '⏰' },
  'gewählt': { translation: 'chosen', emoji: '✅' },
  'nehme': { translation: 'take', emoji: '👆' },
  'Schnitzel': { translation: 'schnitzel', emoji: '🥩' },
  'mit': { translation: 'with', emoji: '➕' },
  'Kartoffelsalat': { translation: 'potato salad', emoji: '🥔' },
  'Sehr': { translation: 'Very', emoji: '💯' },
  'gut': { translation: 'good', emoji: '👍' },
  'heute': { translation: 'today', emoji: '📅' },
  'besonders': { translation: 'especially', emoji: '⭐' },
  'frisch': { translation: 'fresh', emoji: '🌿' },
  'Wie': { translation: 'How', emoji: '❓' },
  'Was': { translation: 'What', emoji: '❓' },
  'Wo': { translation: 'Where', emoji: '📍' },
  'Wann': { translation: 'When', emoji: '⏰' },
  'lange': { translation: 'long', emoji: '⏱️' },
  'dauert': { translation: 'takes/lasts', emoji: '⏰' },
  'es': { translation: 'it', emoji: '👉' },
  'ungefähr': { translation: 'approximately', emoji: '≈' },
  'Etwa': { translation: 'About', emoji: '≈' },
  'zwanzig': { translation: 'twenty', emoji: '2️⃣0️⃣' },
  'Minuten': { translation: 'minutes', emoji: '⏰' },
  'Ist': { translation: 'Is', emoji: '❓' },
  'in': { translation: 'in', emoji: '📍' },
  'Ordnung': { translation: 'order/OK', emoji: '✅' },
  'perfekt': { translation: 'perfect', emoji: '💯' },
  'Gern': { translation: 'Gladly', emoji: '😊' },
  'geschehen': { translation: 'happened/done', emoji: '✨' },
  'bringe': { translation: 'bring', emoji: '🚶‍♂️' },
  'Ihnen': { translation: 'you (formal, dative)', emoji: '👤' },
  'gleich': { translation: 'right away', emoji: '⚡' },
  'den': { translation: 'the (masc. acc.)', emoji: '👉' },
  'auch': { translation: 'also', emoji: '➕' },
  'Brot': { translation: 'bread', emoji: '🍞' },
  'bringen': { translation: 'bring', emoji: '🚶‍♂️' },
  'Natürlich': { translation: 'Naturally', emoji: '🌿' },
  'frisches': { translation: 'fresh', emoji: '🌿' },
  'sehr': { translation: 'very', emoji: '💯' },
  'freundlich': { translation: 'friendly', emoji: '😊' },
  'schön': { translation: 'nice/beautiful', emoji: '✨' },
  'unser': { translation: 'our', emoji: '👥' },
  'Service': { translation: 'service', emoji: '🤝' },
  'Genießen': { translation: 'Enjoy', emoji: '😋' },
  'Ihr': { translation: 'Your', emoji: '👤' },
  'Essen': { translation: 'food/meal', emoji: '🍽️' },
  'werde': { translation: 'will', emoji: '➡️' },
  'sicher': { translation: 'surely/safe', emoji: '✅' },
  'Alles': { translation: 'Everything', emoji: '💯' },
  'sieht': { translation: 'looks', emoji: '👀' },
  'köstlich': { translation: 'delicious', emoji: '😋' },
  'aus': { translation: 'out/like', emoji: '👀' },
  'Freut': { translation: 'Pleased', emoji: '😊' },
  'mich': { translation: 'me', emoji: '👤' },
  'zu': { translation: 'to', emoji: '➡️' },
  'hören': { translation: 'hear', emoji: '👂' },
  'Rufen': { translation: 'Call', emoji: '📞' },
  'wenn': { translation: 'when/if', emoji: '⏰' },
  'brauchen': { translation: 'need', emoji: '🤲' },
  'Machen': { translation: 'Do/Make', emoji: '✅' },
  'später': { translation: 'later', emoji: '⏰' },
  'Rechnung': { translation: 'bill', emoji: '🧾' },
  'zum': { translation: 'to the', emoji: '➡️' },
  'Dessert': { translation: 'dessert', emoji: '🍰' },
  'möchte': { translation: 'would like', emoji: '💭' },
  'einchecken': { translation: 'check in', emoji: '✈️' },
  'Reisepass': { translation: 'passport', emoji: '📘' },
  'Ticket': { translation: 'ticket', emoji: '🎫' },
  'Flug': { translation: 'flight', emoji: '✈️' },
  'geht': { translation: 'goes', emoji: '➡️' },
  'nach': { translation: 'to/after', emoji: '➡️' },
  'München': { translation: 'Munich', emoji: '🏙️' },
  'Gepäck': { translation: 'luggage', emoji: '🧳' },
  'Aufgeben': { translation: 'check in', emoji: '📦' },
  'Koffer': { translation: 'suitcase', emoji: '🧳' },
  'Stellen': { translation: 'Put/Place', emoji: '📍' },
  'auf': { translation: 'on', emoji: '⬆️' },
  'Waage': { translation: 'scale', emoji: '⚖️' },
  'Gewicht': { translation: 'weight', emoji: '⚖️' },
  'passt': { translation: 'fits', emoji: '✅' },
  'Fensterplatz': { translation: 'window seat', emoji: '🪟' },
  'wäre': { translation: 'would be', emoji: '💭' },
  'toll': { translation: 'great', emoji: '🎉' },
  'möglich': { translation: 'possible', emoji: '✅' },
  'Kein': { translation: 'No', emoji: '❌' },
  'Problem': { translation: 'problem', emoji: '❌' },
  'Bordkarte': { translation: 'boarding pass', emoji: '🎫' },
  'beginnt': { translation: 'begins', emoji: '▶️' },
  'Boarding': { translation: 'boarding', emoji: '✈️' },
  'um': { translation: 'at/around', emoji: '🕐' },
  'Uhr': { translation: 'o\'clock', emoji: '🕐' },
  'Gate': { translation: 'gate', emoji: '🚪' },
  'Schildern': { translation: 'signs', emoji: '🪧' },
  'Stunde': { translation: 'hour', emoji: '⏰' },
  'fünfzehn': { translation: 'fifteen', emoji: '1️⃣5️⃣' },
  'Verspätungen': { translation: 'delays', emoji: '⏰' },
  'pünktlich': { translation: 'on time', emoji: '⏰' },
  'Hilfe': { translation: 'help', emoji: '🤝' },
  'guten': { translation: 'good', emoji: '👍' },
  'Wiedersehen': { translation: 'goodbye', emoji: '👋' }
};

// Generate a UUID v4
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function createWords(sentence: string): Word[] {
  const words = sentence.split(/[\s.,!?;:]+/).filter(word => word.length > 0);
  return words.map(word => {
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    const translation = germanTranslations[cleanWord] || { translation: cleanWord, emoji: '❓' };
    return {
      text: word,
      translation: translation.translation,
      emoji: translation.emoji
    };
  });
}

function createWordsFromAI(germanSentence: string, englishTranslation: string): Word[] {
  const germanWords = germanSentence.split(/[\s.,!?;:]+/).filter(word => word.length > 0);
  const englishWords = englishTranslation.split(/[\s.,!?;:]+/).filter(word => word.length > 0);
  
  return germanWords.map((word, index) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    
    // First check our predefined translations
    const predefinedTranslation = germanTranslations[cleanWord];
    if (predefinedTranslation) {
      return {
        text: word,
        translation: predefinedTranslation.translation,
        emoji: predefinedTranslation.emoji
      };
    }
    
    // For AI-generated content, try to map words by position
    // This is a simple approach - more sophisticated NLP could improve this
    let englishEquivalent = englishWords[index] || cleanWord;
    
    // If the word is very short or common, try to find a better match
    if (cleanWord.length <= 2) {
      const commonMappings: Record<string, string> = {
        'ich': 'I',
        'du': 'you',
        'er': 'he',
        'sie': 'she',
        'es': 'it',
        'wir': 'we',
        'ihr': 'you',
        'Sie': 'you',
        'ist': 'is',
        'bin': 'am',
        'hat': 'has',
        'und': 'and',
        'der': 'the',
        'die': 'the',
        'das': 'the',
        'ein': 'a',
        'zu': 'to',
        'in': 'in',
        'mit': 'with',
        'auf': 'on',
        'für': 'for',
        'von': 'from',
        'bei': 'at',
        'nach': 'after',
        'über': 'over',
        'unter': 'under',
        'vor': 'before'
      };
      
      if (commonMappings[cleanWord]) {
        englishEquivalent = commonMappings[cleanWord];
      }
    }
    
    // Generate a simple emoji based on word characteristics
    const emoji = generateEmojiForWord(cleanWord);
    
    return {
      text: word,
      translation: englishEquivalent,
      emoji
    };
  });
}

function generateEmojiForWord(word: string): string {
  const lowerWord = word.toLowerCase();
  
  // Common word categories with emojis
  const emojiMappings: Record<string, string> = {
    // Greetings
    'hallo': '👋', 'guten': '✨', 'morgen': '🌅', 'abend': '🌆', 'tag': '☀️',
    // Food
    'essen': '🍽️', 'trinken': '🥤', 'brot': '🍞', 'wasser': '💧', 'kaffee': '☕',
    // People
    'mann': '👨', 'frau': '👩', 'kind': '👶', 'leute': '👥', 'person': '👤',
    // Places
    'haus': '🏠', 'stadt': '🏙️', 'land': '🌍', 'straße': '🛣️', 'platz': '📍',
    // Time
    'zeit': '⏰', 'heute': '📅', 'morgen': '🌅', 'gestern': '📆', 'woche': '📅',
    // Actions
    'gehen': '🚶', 'kommen': '➡️', 'sehen': '👀', 'hören': '👂', 'sprechen': '🗣️',
    // Emotions
    'gut': '👍', 'schlecht': '👎', 'schön': '✨', 'toll': '🎉', 'freude': '😊',
    // Numbers
    'eins': '1️⃣', 'zwei': '2️⃣', 'drei': '3️⃣', 'vier': '4️⃣', 'fünf': '5️⃣'
  };
  
  // Check for direct matches
  if (emojiMappings[lowerWord]) {
    return emojiMappings[lowerWord];
  }
  
  // Check for partial matches
  for (const [key, emoji] of Object.entries(emojiMappings)) {
    if (lowerWord.includes(key) || key.includes(lowerWord)) {
      return emoji;
    }
  }
  
  // Default emojis based on word characteristics
  if (lowerWord.endsWith('en')) return '🔄'; // Often verbs
  if (lowerWord.endsWith('er')) return '👨'; // Often masculine nouns
  if (lowerWord.endsWith('e')) return '📝'; // Often feminine nouns
  if (lowerWord.length <= 3) return '🔤'; // Short words
  
  return '❓'; // Default fallback
}

export async function generateStory(
  language: Language, 
  situation: Situation,
  options?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    length?: 'short' | 'medium' | 'long';
    useAI?: boolean;
  }
): Promise<Story> {
  const { difficulty = 'intermediate', length = 'medium', useAI = true } = options || {};
  
  // Check if this is a custom situation and AI is available
  const isCustomSituation = situation.id.startsWith('custom-');
  const shouldUseAI = useAI && isCustomSituation && checkOpenRouterConfig();
  
  if (shouldUseAI) {
    try {
      const request: StoryGenerationRequest = {
        situation: situation.title,
        language: language.code,
        difficulty,
        length
      };
      
      const generatedDialogue = await generateCustomStory(request);
      
      // Convert AI response to our dialogue format
      const dialogue: DialogueLine[] = generatedDialogue.lines.map((line, index) => {
        const character = line.speaker === 'character1' 
          ? generatedDialogue.character1 
          : generatedDialogue.character2;
          
        return {
          id: `line-${index}`,
          character: {
            name: character.name,
            role: character.role,
            avatar: character.avatar
          },
          text: line.text,
          translation: line.translation,
          words: createWordsFromAI(line.text, line.translation)
        };
      });
      
      return {
        id: generateUUID(),
        title: `${situation.title} - AI Generated`,
        language,
        situation,
        dialogue,
        createdAt: new Date(),
        isSaved: false
      };
    } catch (error) {
      console.error('Failed to generate AI story, falling back to template:', error);
      // Fall back to template-based generation
    }
  }
  
  // For now, we only support German, but the structure allows for easy expansion
  // This is the fallback for predefined situations or when AI fails
  const data = germanStoryData[situation.id] || germanStoryData.restaurant;
  
  const dialogue: DialogueLine[] = data.lines.map((line, index) => ({
    id: `line-${index}`,
    character: data.characters[index % 2],
    text: line,
    translation: line, // For German learning, we keep the German text
    words: createWords(line)
  }));

  return {
    id: generateUUID(),
    title: isCustomSituation ? `${situation.title} - Custom` : `${situation.title} auf Deutsch`,
    language,
    situation,
    dialogue,
    createdAt: new Date(),
    isSaved: false
  };
}