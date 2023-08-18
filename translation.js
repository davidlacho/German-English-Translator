const readline = require('readline');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let openaiAPIKey = 'YOUR_OPENAI_API_KEY';

function extractWords(sentence) {
  return sentence
    .split(/\s+/)
    .map((word) => word.replace(/[.,?!;()]/g, ''))
    .filter(Boolean);
}

function getArticleByGender(gender) {
  switch (gender.toLowerCase()) {
    case 'masculine':
      return 'der';
    case 'feminine':
      return 'die';
    case 'neutral':
      return 'das';
    default:
      return '';
  }
}

async function addOrUpdateEntry(germanEntry, choice, finalTranslation) {
  const isSentenceChoice = choice === 'sentence';
  const targetPath = path.join(
    __dirname,
    isSentenceChoice ? 'sentences.md' : 'wordlist.md'
  );

  const currentEntries = fs.readFileSync(targetPath, 'utf8').split('\n');
  const fullEntry = `- ${germanEntry}: ${finalTranslation.translation}`;
  if (currentEntries.includes(fullEntry)) {
    const overwrite = await askQuestion(
      `The ${choice} ${germanEntry} already exists. Do you want to overwrite it? (yes/no): `
    );
    if (overwrite.toLowerCase() !== 'yes') {
      console.log('Skipping...');
      return;
    }
    const oldEntryIndex = currentEntries.findIndex((e) =>
      e.startsWith(`- ${germanEntry}`)
    );
    if (oldEntryIndex !== -1) {
      currentEntries.splice(oldEntryIndex, 1);
    }
  }

  let entry;
  if (choice === 'sentence') {
    entry = `- ${germanEntry}: ${finalTranslation.translation.replace(
      /["]/g,
      ''
    )}`;
  } else {
    if (finalTranslation.gender) {
      germanEntry =
        getArticleByGender(finalTranslation.gender) + ' ' + germanEntry;
      entry = `- ${germanEntry}: ${finalTranslation.translation} (${finalTranslation.category}, ${finalTranslation.gender})`;
    } else {
      entry = `- ${germanEntry}: ${finalTranslation.translation} (${finalTranslation.category})`;
    }
  }

  currentEntries.push(entry);
  fs.writeFileSync(targetPath, [...new Set(currentEntries)].sort().join('\n'));
  console.log(`${choice} added successfully!`);
}

async function checkAndAddMissingWords(germanSentence) {
  const words = extractWords(germanSentence);
  const targetPath = path.join(__dirname, 'wordlist.md');
  const currentEntries = fs.readFileSync(targetPath, 'utf8').split('\n');

  // Create a map of existing entries to check against
  const existingEntriesMap = currentEntries.reduce((acc, entryLine) => {
    const match = entryLine.match(/-\s+(.*?):/);
    if (match && match[1]) {
      const wordWithoutArticle = match[1]
        .replace(/^(der|die|das)\s/, '')
        .trim();
      acc[wordWithoutArticle.toLowerCase()] = true; // Handling words without articles
      acc[match[1].trim().toLowerCase()] = true; // Handling words with articles
    }
    return acc;
  }, {});

  for (const word of words) {
    const wordWithoutArticle = word.replace(/^(der|die|das)\s/, '').trim();
    if (!existingEntriesMap[wordWithoutArticle.toLowerCase()]) {
      const shouldAdd = await askQuestion(
        `The word "${word}" is missing from the wordlist. Do you want to add it? (yes/no): `
      );

      if (shouldAdd.toLowerCase() === 'yes') {
        const englishTranslation = await fetchTranslation(word, false);

        if (!englishTranslation) {
          console.error('Failed to fetch translation for word:', word);
          continue;
        }

        const isCorrect = await askQuestion(
          'Is the above translation correct? (yes/no): '
        );

        let finalTranslation = englishTranslation;
        if (isCorrect.toLowerCase() !== 'yes') {
          finalTranslation.translation = await askQuestion(
            'Enter the correct English translation: '
          );
        }

        let entry;
        if (
          finalTranslation.category.toLowerCase() === 'noun' &&
          finalTranslation.gender
        ) {
          switch (finalTranslation.gender.toLowerCase()) {
            case 'masculine':
              entry = `- der ${word}: ${finalTranslation.translation} (${finalTranslation.category}, ${finalTranslation.gender})`;
              break;
            case 'feminine':
              entry = `- die ${word}: ${finalTranslation.translation} (${finalTranslation.category}, ${finalTranslation.gender})`;
              break;
            case 'neutral':
              entry = `- das ${word}: ${finalTranslation.translation} (${finalTranslation.category}, ${finalTranslation.gender})`;
              break;
            default:
              entry = `- ${word}: ${finalTranslation.translation} (${finalTranslation.category}`;
          }
        } else {
          entry = `- ${word}: ${finalTranslation.translation} (${finalTranslation.category})`;
        }

        if (!existingEntriesMap[word.toLowerCase()]) {
          currentEntries.push(entry);
          const uniqueSortedEntries = [...new Set(currentEntries)].sort();
          fs.writeFileSync(targetPath, uniqueSortedEntries.join('\n'));
          console.log(`Word "${word}" added successfully!`);
        }
      }
    }
  }
}

async function fetchTranslation(text, isSentence = false) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: isSentence
              ? `Translate the following German ${
                  isSentence ? 'sentence' : 'text'
                } to English: "${text}".`
              : `Translate the following German text to English: "${text}" and provide its grammatical category. Format the response as "Translation: word (category)". If it's a noun, give result as "Translation: word (category, gender)". Give no other words in the response`,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiAPIKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content
      .replace(/["]/g, '')
      .trim();

    console.log(`Suggested Translation for ${text}:`, content); // Log the response

    if (isSentence) {
      return {
        translation: content,
      };
    } else {
      const match = content.match(
        /Translation: ([\w\s]+) \(([\w\s]+)(?:, ([\w\s]+))?\)/
      );

      if (!match) {
        throw new Error('Unexpected format from OpenAI response.');
      }

      return {
        translation: match[1],
        category: match[2],
        gender: match[3] || null, // capture gender if present
      };
    }
  } catch (error) {
    console.error('Error fetching translation:', error);
  }
}

async function mainLoop() {
  while (true) {
    const choice = await askQuestion(
      'Do you want to add a word, a sentence, or exit? (Enter "word", "sentence", or "exit"): '
    );

    if (choice === 'exit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    const germanEntry = await askQuestion(`Enter the German ${choice}: `);
    const englishTranslation = await fetchTranslation(
      germanEntry,
      choice === 'sentence'
    );

    if (!englishTranslation) {
      console.error('Failed to fetch translation.');
      continue;
    }

    const isCorrect = await askQuestion(
      'Is the above translation correct? (yes/no): '
    );

    const finalTranslation =
      isCorrect.toLowerCase() !== 'yes'
        ? {
            ...englishTranslation,
            translation: await askQuestion(
              'Enter the correct English translation: '
            ),
          }
        : englishTranslation;

    await addOrUpdateEntry(germanEntry, choice, finalTranslation);

    if (choice === 'sentence') {
      await checkAndAddMissingWords(germanEntry);
    }
  }
}

async function askForAPIKey() {
  return await askQuestion('Please enter your OpenAI API key: ');
}

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  if (!openaiAPIKey || openaiAPIKey === 'YOUR_OPENAI_API_KEY') {
    openaiAPIKey = await askForAPIKey();
  }
  mainLoop();
}

main();
