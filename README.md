# German-English Translator with OpenAI Integration

This code allows you to input German words or sentences and get their English translations using OpenAI's GPT-3.5 Turbo model. The translated entries are saved to separate markdown files based on whether they're individual words or sentences.

## 🚀 Features:

- 📝 Translation of individual German words with grammatical categories and gender.
- 📜 Translation of German sentences.
- 💾 Saving translations to markdown files.
- ⚙️ Overwriting existing entries if desired.

## 🔧 Pre-requisites:

- Node.js installed on your system.
- An OpenAI API key.
- Installed npm packages: `readline`, `fs`, `path`, and `axios`.

## 📥 Installation:

1. Make sure you have Node.js installed.
2. Clone or download the repository containing the provided code.
3. Navigate to the project directory and run `npm install` to install the required packages.

## 🖥 Usage:

1. Run the script with `node <filename>.js`.
2. If you haven't hard-coded your OpenAI API key in the script, you'll be prompted to enter it.
3. You will then be presented with three choices:
   - `word`: Enter a German word for translation.
   - `sentence`: Enter a German sentence for translation.
   - `exit`: Exit the application.
4. Based on your choice, input the German word or sentence.
5. The translation will be fetched and displayed. You'll have an option to confirm if the translation is correct.
6. If the translation is not correct, you can provide the correct one.
7. The entry will then be saved to a markdown file (`wordlist.md` for words, `sentences.md` for sentences).
8. If an entry already exists in the markdown file, you will be asked if you want to overwrite it.

## 📝 Notes:

- This tool uses the OpenAI API, so internet connectivity is required, and API call costs may apply based on your OpenAI subscription.
- Ensure your API key is kept private and not exposed or committed to any public repositories.
- The translations are stored in markdown files in the same directory as the script. Make regular backups if you plan to add a lot of entries.

## 🛠 Troubleshooting:

1. If you get an "Unexpected format from OpenAI response." error, ensure that the OpenAI API's response format has not changed since the code's last update.
2. If the script fails to write to the markdown files, ensure you have the necessary permissions in the directory.

💬 Enjoy translating and building your German-English word and sentence list!
