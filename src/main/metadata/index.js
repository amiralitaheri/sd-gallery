import ExifReader from "exifreader";
import { automaticMetadataProcessor } from "./automatic.metadata";
import { comfyMetadataProcessor } from "./comfy.metadata";

const parsers = {
  automatic: automaticMetadataProcessor,
  comfy: comfyMetadataProcessor,
};

export async function getMetadata(file) {
  try {
    const tags = await ExifReader.load(file, { includeUnknown: true });
    delete tags["MakerNote"];
    const exif = Object.entries(tags).reduce((acc, [key, value]) => {
      acc[key] = value.value;
      return acc;
    }, {});

    if (exif.UserComment) {
      // this is a hack to not have to rework our downstream code
      exif.userComment = Int32Array.from(exif.UserComment);
    }

    let metadata = {};
    try {
      const { parse } =
        Object.values(parsers).find((x) => x.canParse(exif)) ?? {};
      if (parse) metadata = parse(exif);
    } catch (e) {
      console.error("Error parsing metadata", e);
    }
    return metadata;
  } catch (e) {
    return {};
  }
}

export function encodeMetadata(meta, type = "automatic") {
  return parsers[type]?.encode(meta);
}

export const parsePromptMetadata = (generationDetails) => {
  return automaticMetadataProcessor.parse({ generationDetails });
};
