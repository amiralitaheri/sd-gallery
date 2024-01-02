import nsfwWords from "./lists/words-nsfw.json";

export function checkable(words, options) {
  const regexes = words.map((word) => {
    let regexStr = word;
    regexStr = regexStr.replace(/\s+/g, `[^a-zA-Z0-9]*`);
    if (!word.includes("[")) {
      regexStr = regexStr
        .replace(/i/g, "[i|l|1]")
        .replace(/o/g, "[o|0]")
        .replace(/s/g, "[s|z]")
        .replace(/e/g, "[e|3]");
    }
    if (options?.pluralize) regexStr += "[s|z]*";
    regexStr = `([^a-zA-Z0-9]+|^)` + regexStr + `([^a-zA-Z0-9]+|$)`;
    const regex = new RegExp(regexStr, "i");
    return { regex, word };
  });
  function inPrompt(prompt) {
    prompt = prompt.trim();
    for (const { regex, word } of regexes) {
      if (regex.test(prompt)) return word;
    }
    return false;
  }
  return { inPrompt };
}

const words = {
  nsfw: checkable(nsfwWords),
};

export function includesNsfw(prompt) {
  if (!prompt) return false;

  return words.nsfw.inPrompt(prompt);
}
