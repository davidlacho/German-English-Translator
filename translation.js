const readline = require('readline');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let openaiAPIKey = 'YOUR_OPENAI_API_KEY'; // initialize with your key if you have one

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

    const content = response.data.choices[0].message.content.trim();

    console.log('OpenAI Response:', content); // Log the response

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

    const germanEntry = await askQuestion('Enter the German ' + choice + ': ');

    const englishTranslation = await fetchTranslation(
      germanEntry,
      choice === 'sentence'
    );

    if (!englishTranslation) {
      console.error('Failed to fetch translation.');
      continue;
    }

    console.log(`Suggested Translation: ${englishTranslation.translation}`);
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
    if (choice === 'sentence') {
      entry = `- ${germanEntry}: ${finalTranslation.translation}`;
    } else {
      entry = `- ${germanEntry}: ${finalTranslation.translation} (${finalTranslation.category}`;
      if (finalTranslation.gender) {
        entry += `, ${finalTranslation.gender}`;
      }
      entry += `)`;
    }

    let targetPath;
    let currentEntries;
    let entriesSet;
    if (choice === 'sentence') {
      targetPath = path.join(__dirname, 'sentences.md');
      currentEntries = fs.readFileSync(targetPath, 'utf8').split('\n');
      entriesSet = new Set(currentEntries.map((e) => e.split(':')[0].trim()));
    } else {
      targetPath = path.join(__dirname, 'wordlist.md');
      currentEntries = fs.readFileSync(targetPath, 'utf8').split('\n');
      entriesSet = new Set(currentEntries.map((e) => e.split(':')[0].trim()));
    }

    let shouldAddEntry = true;

    if (entriesSet.has(germanEntry)) {
      const overwrite = await askQuestion(
        `The ${choice} ${germanEntry} already exists. Do you want to overwrite it? (yes/no): `
      );
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('Skipping...');
        shouldAddEntry = false;
      } else {
        const oldEntryIndex = currentEntries.findIndex((e) =>
          e.startsWith(`- ${germanEntry}`)
        );
        if (oldEntryIndex !== -1) {
          currentEntries.splice(oldEntryIndex, 1);
        }
      }
    }

    if (shouldAddEntry) {
      currentEntries.push(entry);
      const uniqueSortedEntries = [...new Set(currentEntries)].sort();
      fs.writeFileSync(targetPath, uniqueSortedEntries.join('\n'));
      console.log(choice + ' added successfully!');
    }
  }
}

async function askForAPIKey() {
  const apiKey = await askQuestion('Please enter your OpenAI API key: ');
  return apiKey;
}

function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  if (!openaiAPIKey || openaiAPIKey === 'YOUR_OPENAI_API_KEY') {
    openaiAPIKey = await askForAPIKey();
  }
  mainLoop();
}

main();
