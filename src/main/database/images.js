import { db } from "./index";

const insertImageQuery = db.prepare(
  `INSERT INTO image (
    name,
    prompt,
    negativePrompt,
    isNsfw,
    fileSize,
    fileExtension,
    width,
    height,
    cfgScale,
    steps,
    path,
    seed,
    ctimeMs,
    rootDirectoryId,
    modelId,
    vaeId,
    sampler) 
    VALUES (
    @name,
    @prompt,
    @negativePrompt,
    @isNsfw,
    @fileSize,
    @fileExtension,
    @width,
    @height,
    @cfgScale,
    @steps,
    @path,
    @seed,
    @ctimeMs,
    @rootDirectoryId,
    @modelId,
    @vaeId,
    @sampler)`,
);

const deleteImageQuery = db.prepare("DELETE FROM image where id = @id");

const insertAddonRelationQuery = db.prepare(
  "INSERT INTO image_addon (imageId, addonId, value) VALUES (@imageId, @addonId, @value)",
);

const getImageAddonsQuery = db.prepare(
  "SELECT name, type, value FROM image_addon JOIN addon where imageId = @imageId",
);

const selectAllImageQuery = db.prepare("SELECT * From image");

const updateImageRatingQuery = db.prepare(
  "UPDATE image set rating = @rating where id = @imageId",
);

const updateImageIsNsfwQuery = db.prepare(
  "UPDATE image set isNsfw = @isNsfw where id = @imageId",
);

export class Images {
  constructor() {
    // Check if an instance already exists
    if (Images.instance) {
      return Images.instance;
    }

    // Save the instance in a static property
    Images.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  addImage({
    name,
    prompt,
    negativePrompt,
    isNsfw,
    fileSize,
    fileExtension,
    width,
    height,
    cfgScale,
    steps,
    path,
    seed,
    ctimeMs,
    rootDirectoryId,
    modelId,
    sampler,
    vaeId,
  }) {
    console.log("Image data", {
      name,
      prompt,
      negativePrompt,
      isNsfw,
      fileSize,
      fileExtension,
      width,
      height,
      cfgScale,
      steps,
      path,
      seed,
      ctimeMs,
      rootDirectoryId,
      modelId,
      sampler,
      vaeId,
    });
    const result = insertImageQuery.run({
      name,
      prompt,
      negativePrompt,
      isNsfw: isNsfw ? 1 : 0,
      fileSize,
      fileExtension,
      width,
      height,
      cfgScale,
      steps,
      path,
      seed,
      ctimeMs,
      rootDirectoryId,
      modelId,
      sampler,
      vaeId,
    });
    return result.lastInsertRowid;
  }

  removeImage(id) {
    deleteImageQuery.run({ id });
  }
  getImages() {
    return selectAllImageQuery.all();
  }

  getImageAddons(imageId) {
    getImageAddonsQuery.all({ imageId });
  }

  addAddonRelation({ imageId, addonId, value }) {
    insertAddonRelationQuery.run({ imageId, addonId, value });
  }

  setRating({ imageId, rating }) {
    updateImageRatingQuery.run({ imageId, rating });
  }

  setIsNsfw({ imageId, isNsfw }) {
    updateImageIsNsfwQuery.run({ imageId, isNsfw: isNsfw ? 1 : 0 });
  }
}
