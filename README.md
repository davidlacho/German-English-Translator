# German-English Translator & Flashcards with OpenAI Integration

This tool offers a comprehensive method to learn and understand the German language by utilizing OpenAI's GPT-3.5 Turbo model. It not only translates German sentences and words to English but also allows you to add individual words from sentences to your vocabulary flashcards.

## 🚀 Features:

- 📝 **Translation of individual German words** with grammatical categories and gender.
- 📜 **Translation of German sentences**.
- 🧐 **Automatic detection of individual words** within sentences not already in the wordlist.
- 👩‍🏫 **Prompt to add undetected words** from sentences to the wordlist.
- 💾 **Saving translations to markdown files**.
- ⚙️ **Overwriting existing entries** if desired.
- 🃏 **Interactive flashcards** to test your knowledge.

## 🔧 Pre-requisites:

- Node.js installed on your system.
- An OpenAI API key.
- Installed npm packages: `readline`, `fs`, `path`, and `axios`.

## 📥 Installation:

1. Ensure Node.js is installed.
2. Clone or download the repository with the provided code.
3. Navigate to the project directory and run `npm install` for the necessary packages.

## 🖥 Usage:

### For Translations:

1. Execute the script with `node translation.js`.
2. If the OpenAI API key isn't hardcoded into the script, you'll be prompted to input it.
3. Follow the on-screen instructions to obtain translations. If a word from a sentence isn't in the wordlist, you'll get a chance to add it.

### For Flashcards:

1. Launch the script using `node flashcard.js`.
2. Random German or English words or sentences from the markdown files will be displayed.
3. Recite the translation out loud and hit any key to see the actual answer.
4. Continue with more flashcards or type "quit" to terminate.

## 📝 Notes:

- The tool is dependent on the OpenAI API; hence, internet connectivity is a must. Depending on your OpenAI plan, you might be charged for API calls.
- Safeguard your API key by keeping it confidential and avoiding any public repository exposure.
- Translations are saved as markdown files in the script's directory. Regular backups are advised for substantial entries.

## 🛠 Troubleshooting:

- On receiving an "Unexpected format from OpenAI response." error, verify if there have been any recent changes to the OpenAI API's response format.
- If there are issues writing to markdown files, ensure you possess the requisite directory permissions.

💬 **Dive into the world of German-English translations, enrich your word and sentence list, and evaluate your progress with flashcards!**
