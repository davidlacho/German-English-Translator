const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function cleanEntryPart(part) {
  const trimmed = part.trim();
  if (trimmed.startsWith('- ')) {
    return trimmed.substring(2);
  }
  return trimmed;
}

async function flashCard() {
  const choice = Math.random() > 0.5 ? 'sentence' : 'word';
  const targetPath =
    choice === 'sentence'
      ? path.join(__dirname, 'sentences.md')
      : path.join(__dirname, 'wordlist.md');

  const currentEntries = fs
    .readFileSync(targetPath, 'utf8')
    .split('\n')
    .filter((line) => line.trim());
  if (currentEntries.length === 0) {
    console.log(`No entries found in ${choice} list.`);
    return;
  }

  const randomEntry =
    currentEntries[Math.floor(Math.random() * currentEntries.length)];
  const [german, english] = randomEntry.split(':').map(cleanEntryPart);

  // Randomly decide to display English or German
  const promptLanguage = Math.random() > 0.5 ? 'english' : 'german';
  const promptText = promptLanguage === 'english' ? english : german;
  const answerText = promptLanguage === 'english' ? german : english;

  console.log(`Flashcard for ${choice.toUpperCase()}: ${promptText}`);
  await askQuestion(
    'Say the translation out loud. Press any key when ready for the answer...\n'
  );
  console.log(`Answer: ${answerText}`);
}

function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function flashCardLoop() {
  console.log(`
  __________________________________________
 |                                          |
 |        /  ~~~ GERMAN FLASHCARDS ~~~      |
 |   ,--./,-.                               |
 |  / #      \\    ~ Learn German ! ~        |
 | |          |                             |
 | \\         /'                             |
 |  \`._,.__,´                               |
 |                                          |
 |__________________________________________|
 `);
  console.log('*******');

  while (true) {
    await flashCard();
    console.log('*******\n');
    const continueResponse = await askQuestion(
      'type "quit" to quit, or hit enter to continue: \n'
    );
    if (continueResponse.toLowerCase() == 'quit') {
      console.log('Goodbye!');
      rl.close();
      break;
    }
    console.log('*******');
  }
}

flashCardLoop();
