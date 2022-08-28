// Generate additional file formats from the source text file

import {readFile, writeFile} from 'node:fs/promises';

const LF = '\n';
const textEncoding = {encoding: 'utf-8'};

// Ensure uniform file names
function getFileName (suffix) {
  return `fortune-cookies${suffix}`;
}

function appendFinalNewline (str) {
  return `${str.trimEnd()}${LF}`;
}

async function writeTextFile (fileNameSuffix, str) {
  return writeFile(
    getFileName(fileNameSuffix),
    appendFinalNewline(str),
    textEncoding,
  );
}

function removeDuplicates (array) {
  const set = new Set();
  const regexpNotAWord = /\W/g;

  return array.filter(str => {
    const simplified = str
      // Ignore letter case
      .toLowerCase()
      // Ignore non-word characters
      .replaceAll(regexpNotAWord, '');

    const keep = !set.has(simplified);
    set.add(simplified);
    return keep;
  });
}

function parseFortunes (str) {
  const fortunes = str.split(LF)
    // Trim surrounding whitespace
    .map(line => line.trim())
    // Remove empty lines
    .filter(Boolean);

  return removeDuplicates(fortunes);
}

const fortunes = parseFortunes(await readFile(getFileName('.txt'), textEncoding));

// Source text file: rewrite to ensure uniform whitespace
await writeTextFile('.txt', fortunes.join(LF));

// Markdown file: Format as list
await writeTextFile('.md', fortunes.map(line => `* ${line}`).join(LF));

// JSON file: with whitespace for readability
const fortunesJson = JSON.stringify(fortunes, null, 2);
await writeTextFile('.json', fortunesJson);

// ESM file: this is for stability until (JSON) import assertsions are stabilized
const esmSource = `export default ${fortunesJson};`;
await writeTextFile('.mjs', esmSource);
