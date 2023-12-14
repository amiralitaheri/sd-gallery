import { createMetadataProcessor } from "./base.metadata";
import { unescape } from "lodash";

const hashesRegex = /, Hashes:\s*({[^}]+})/;
const civitaiResources = /, Civitai resources:\s*(\[[^\]]+])/;
const badExtensionKeys = [
  "Resources: ",
  "Hashed prompt: ",
  "Hashed Negative prompt: ",
];
const stripKeys = ["Template: ", "Negative Template: "];
const automaticExtraNetsRegex = /<(lora|hypernet):([a-zA-Z0-9_.]+):([0-9.]+)>/g;
const automaticNameHash = /([a-zA-Z0-9_.]+)\(([a-zA-Z0-9]+)\)/;
const automaticSDKeyMap = new Map([
  ["Seed", "seed"],
  ["CFG scale", "cfgScale"],
  ["Sampler", "sampler"],
  ["Steps", "steps"],
  ["Clip skip", "clipSkip"],
]);
const getSDKey = (key) => automaticSDKeyMap.get(key.trim()) ?? key.trim();
const automaticSDEncodeMap = new Map(
  Array.from(automaticSDKeyMap, (a) => a.reverse()),
);
const excludedKeys = [
  "hashes",
  "civitaiResources",
  "scheduler",
  "vaes",
  "additionalResources",
  "comfy",
  "upscalers",
  "models",
  "controlNets",
  "denoise",
];
// #endregion

function getStringWithUTF8(numbers) {
  let str = "";
  let i = 0;
  while (numbers[i] !== void 0) {
    const unicode = numbers[i++] || 0;
    str += String.fromCharCode(unicode);
  }
  return str;
}

function getStringWithUTF16(numbers) {
  let str = "";
  let i = 0;
  while (numbers[i] !== void 0) {
    const uint8_1 = numbers[i++] || 0;
    const uint8_2 = numbers[i++] || 0;
    const unicode = (uint8_1 << 8) | uint8_2;
    str += String.fromCharCode(unicode);
  }
  return str;
}

export const automaticMetadataProcessor = createMetadataProcessor({
  canParse(exif) {
    let generationDetails = null;
    if (exif?.parameters) {
      generationDetails = exif.parameters;
    } else if (exif?.userComment) {
      const uint8Array = exif.userComment.slice(0, 8);
      const uint16Array = exif.userComment.slice(8);
      const encoding = getStringWithUTF8(uint8Array);
      const content = getStringWithUTF16(uint16Array);
      if (encoding !== "UNICODE\x00") {
        console.warn(`encoding [${encoding}] is not support`);
      }
      generationDetails = content;
      // let str = "";
      // for (let i = 22; i < exif.userComment.length; i += 2) {
      //   str += String.fromCharCode(
      //     (exif.userComment[i] << 8) | exif.userComment[i + 1],
      //   );
      // }
      // generationDetails = str;
    }

    if (generationDetails) {
      generationDetails = generationDetails
        .replace("UNICODE", "")
        .replace(/�/g, "");
      generationDetails = unescape(generationDetails);
      exif.generationDetails = generationDetails;
      return generationDetails.includes("Steps: ");
    }
    return false;
  },
  parse(exif) {
    const metadata = {};
    const generationDetails = exif.generationDetails;
    if (!generationDetails) return metadata;
    const metaLines = generationDetails.split("\n").filter((line) => {
      // filter out empty lines and any lines that start with a key we want to strip
      return (
        line.trim() !== "" && !stripKeys.some((key) => line.startsWith(key))
      );
    });

    let detailsLine = metaLines.find((line) => line.startsWith("Steps: "));
    // Strip it from the meta lines
    if (detailsLine) metaLines.splice(metaLines.indexOf(detailsLine), 1);
    // Remove meta keys I wish I hadn't made... :(
    for (const key of badExtensionKeys) {
      if (!detailsLine?.includes(key)) continue;
      detailsLine = detailsLine.split(key)[0];
    }

    // Extract Hashes
    const hashes = detailsLine?.match(hashesRegex)?.[1];
    if (hashes && detailsLine) {
      metadata.hashes = JSON.parse(hashes);
      detailsLine = detailsLine.replace(hashesRegex, "");
    }

    // Extract Civitai Resources
    const civitaiResourcesMatch = detailsLine?.match(civitaiResources)?.[1];
    if (civitaiResourcesMatch && detailsLine) {
      metadata.civitaiResources = JSON.parse(civitaiResourcesMatch);
      detailsLine = detailsLine.replace(civitaiResources, "");
    }

    // Extract fine details
    let currentKey = "";
    const parts = detailsLine?.split(":") ?? [];
    for (const part of parts) {
      const priorValueEnd = part.lastIndexOf(",");
      if (metadata[currentKey]) continue;
      if (parts[parts.length - 1] === part) {
        metadata[currentKey] = part.trim().replace(",", "");
      } else if (priorValueEnd !== -1) {
        metadata[currentKey] = part.slice(0, priorValueEnd).trim();
        currentKey = getSDKey(part.slice(priorValueEnd + 1));
      } else currentKey = getSDKey(part);
    }

    // Extract prompts
    const [prompt, ...negativePrompt] = metaLines
      .join("\n")
      .split("Negative prompt:")
      .map((x) => x.trim());
    metadata.prompt = prompt;
    metadata.negativePrompt = negativePrompt.join(" ").trim();

    // Extract resources
    const extranets = [...prompt.matchAll(automaticExtraNetsRegex)];
    const resources = extranets.map(([, type, name, weight]) => ({
      type,
      name,
      weight: parseFloat(weight),
    }));

    if (metadata["Model"] && metadata["Model hash"]) {
      if (!metadata.hashes) metadata.hashes = {};
      if (!metadata.hashes["model"])
        metadata.hashes["model"] = metadata["Model hash"];

      resources.push({
        type: "model",
        name: metadata["Model"],
        hash: metadata["Model hash"],
      });
    }

    if (metadata["Hypernet"] && metadata["Hypernet strength"])
      resources.push({
        type: "hypernet",
        name: metadata["Hypernet"],
        weight: parseFloat(metadata["Hypernet strength"]),
      });

    if (metadata["AddNet Enabled"] === "True") {
      let i = 1;
      while (true) {
        const fullname = metadata[`AddNet Model ${i}`];
        if (!fullname) break;
        const [, name, hash] = fullname.match(automaticNameHash) ?? [];

        resources.push({
          type: metadata[`AddNet Module ${i}`].toLowerCase(),
          name,
          hash,
          weight: parseFloat(metadata[`AddNet Weight ${i}`]),
        });
        i++;
      }
    }

    metadata.resources = resources;

    return metadata;
  },
  encode({ prompt, negativePrompt, resources, steps, ...other }) {
    const lines = [prompt];
    if (negativePrompt) lines.push(`Negative prompt: ${negativePrompt}`);
    const fineDetails = [];
    if (steps) fineDetails.push(`Steps: ${steps}`);
    for (const [k, v] of Object.entries(other)) {
      const key = automaticSDEncodeMap.get(k) ?? k;
      if (excludedKeys.includes(key)) continue;
      fineDetails.push(`${key}: ${v}`);
    }
    if (fineDetails.length > 0) lines.push(fineDetails.join(", "));

    return lines.join("\n");
  },
});
