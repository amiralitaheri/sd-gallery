import { samplerMap } from "../constants";
import { createMetadataProcessor } from "./base.metadata";

export function fromJson(str) {
  try {
    return JSON.parse(str, (key, value) => {
      if (typeof value === "string" && /^\d+n$/.test(value))
        return BigInt(value.slice(0, -1));
      return value;
    });
  } catch (e) {
    return null;
  }
}

export function findKeyForValue(m, v) {
  for (const [k, vs] of m) {
    if (vs.includes(v)) return k;
  }
  return undefined;
}

const AIR_KEYS = ["ckpt_airs", "lora_airs", "embedding_airs"];

function cleanBadJson(str) {
  return str.replace(/\[NaN]/g, "[]").replace(/\[Infinity]/g, "[]");
}

export const comfyMetadataProcessor = createMetadataProcessor({
  canParse: (exif) => exif.prompt && exif.workflow,
  parse: (exif) => {
    const prompt = JSON.parse(cleanBadJson(exif.prompt));
    const samplerNodes = [];
    const models = [];
    const upscalers = [];
    const vaes = [];
    const controlNets = [];
    const additionalResources = [];
    for (const node of Object.values(prompt)) {
      for (const [key, value] of Object.entries(node.inputs)) {
        if (Array.isArray(value)) node.inputs[key] = prompt[value[0]];
      }

      if (node.class_type === "KSamplerAdvanced") {
        const simplifiedNode = { ...node.inputs };

        simplifiedNode.steps = getNumberValue(simplifiedNode.steps);
        simplifiedNode.cfg = getNumberValue(simplifiedNode.cfg);

        samplerNodes.push(simplifiedNode);
      }

      if (node.class_type === "KSampler") samplerNodes.push(node.inputs);

      if (node.class_type === "LoraLoader") {
        // Ignore lora nodes with strength 0
        const strength = node.inputs.strength_model;
        if (strength < 0.001 && strength > -0.001) continue;

        additionalResources.push({
          name: node.inputs.lora_name,
          type: "lora",
          strength,
          strengthClip: node.inputs.strength_clip,
        });
      }

      if (node.class_type === "CheckpointLoaderSimple")
        models.push(node.inputs.ckpt_name);

      if (node.class_type === "UpscaleModelLoader")
        upscalers.push(node.inputs.model_name);

      if (node.class_type === "VAELoader") vaes.push(node.inputs.vae_name);

      if (node.class_type === "ControlNetLoader")
        controlNets.push(node.inputs.control_net_name);
    }

    const initialSamplerNode =
      samplerNodes.find(
        (x) => x.latent_image.class_type === "EmptyLatentImage",
      ) ?? samplerNodes[0];

    const workflow = JSON.parse(exif.workflow);
    const versionIds = [];
    const modelIds = [];
    if (workflow?.extra) {
      for (const key of AIR_KEYS) {
        const airs = workflow.extra[key];
        if (!airs) continue;

        for (const air of airs) {
          const [modelId, versionId] = air.split("@");
          if (versionId) versionIds.push(parseInt(versionId));
          else if (modelId) modelIds.push(parseInt(modelId));
        }
      }
    }

    const metadata = {
      prompt: getPromptText(initialSamplerNode.positive),
      negativePrompt: getPromptText(initialSamplerNode.negative),
      cfgScale: initialSamplerNode.cfg,
      steps: initialSamplerNode.steps,
      seed: initialSamplerNode.seed,
      sampler: initialSamplerNode.sampler_name,
      scheduler: initialSamplerNode.scheduler,
      denoise: initialSamplerNode.denoise,
      width: initialSamplerNode.latent_image.inputs.width,
      height: initialSamplerNode.latent_image.inputs.height,
      models,
      upscalers,
      vaes,
      additionalResources,
      controlNets,
      versionIds,
      modelIds,
      // Converting to string to reduce bytes size
      comfy: JSON.stringify({ prompt, workflow }),
    };

    // Handle control net apply
    if (initialSamplerNode.positive.class_type === "ControlNetApply") {
      const conditioningNode = initialSamplerNode.positive.inputs.conditioning;
      metadata.prompt = conditioningNode.inputs.text;
    }

    // Map to automatic1111 terms for compatibility
    a1111Compatability(metadata);

    return metadata;
  },
  encode: (meta) => {
    const comfy =
      typeof meta.comfy === "string" ? fromJson(meta.comfy) : meta.comfy;

    return comfy && comfy.workflow ? JSON.stringify(comfy.workflow) : "";
  },
});

function a1111Compatability(metadata) {
  // Sampler name
  const samplerName = metadata.sampler;
  let a1111sampler;
  if (metadata.scheduler === "karras") {
    a1111sampler = findKeyForValue(samplerMap, samplerName + "_karras");
  }
  if (!a1111sampler) a1111sampler = findKeyForValue(samplerMap, samplerName);
  if (a1111sampler) metadata.sampler = a1111sampler;

  // Model
  const models = metadata.models;
  if (models.length > 0) {
    metadata.Model = models[0].replace(/\.[^/.]+$/, "");
  }
}

function getPromptText(node) {
  if (node.inputs?.text) {
    if (typeof node.inputs.text === "string") return node.inputs.text;
    if (typeof node.inputs.text.class_type !== "undefined")
      return getPromptText(node.inputs.text);
  }
  if (node.inputs?.text_g) {
    if (!node.inputs?.text_l || node.inputs?.text_l === node.inputs?.text_g)
      return node.inputs.text_g;
    return `${node.inputs.text_g}, ${node.inputs.text_l}`;
  }
  return "";
}

function getNumberValue(input) {
  if (typeof input === "number") return input;
  return input.inputs.Value;
}
