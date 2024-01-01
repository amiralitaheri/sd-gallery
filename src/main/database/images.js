import { db } from "./index";
import * as fs from "fs";

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
    clipSkip,
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
    @clipSkip,
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
  "SELECT name, type, value, hash\n" +
    "FROM image_addon\n" +
    "         LEFT JOIN addon ON addonId = addon.id\n" +
    "WHERE imageId = @imageId;",
);

const getImageById = db.prepare("SELECT * FROM image WHERE id=@id");

const getImagesByRootDirectoryIdQuery = db.prepare(
  "SELECT id, path FROM image WHERE rootDirectoryId = @rootDirectoryId",
);

const selectAllImageQueryAsc = db.prepare(
  "SELECT * From image " +
    "WHERE (modelId=@modelId OR @modelId IS NULL) AND" +
    " (isNsfw=@isNsfw OR @isNsfw IS NULL) AND" +
    " (prompt like @promptLike OR @promptLike IS NULL) AND" +
    " (path like @directoryPathLike OR @directoryPathLike IS NULL)" +
    " ORDER BY @sortKey ASC;",
);

const selectAllImageQueryDesc = db.prepare(
  "SELECT * From image " +
    "WHERE modelId=@modelId OR @modelId IS NULL AND" +
    " (isNsfw=@isNsfw OR @isNsfw IS NULL) AND" +
    " (prompt like @promptLike OR @promptLike IS NULL) AND" +
    " (path like @directoryPathLike OR @directoryPathLike IS NULL)" +
    " ORDER BY @sortKey DESC;",
);

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
    clipSkip,
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
      clipSkip,
    });
    return result.lastInsertRowid;
  }

  removeImage(id) {
    deleteImageQuery.run({ id });
  }

  getImages({ filter, sort, directoryPath }) {
    if (sort?.direction === "desc") {
      return selectAllImageQueryDesc.all({
        modelId: filter?.modelId,
        isNsfw:
          filter?.isNsfw === false ? 0 : filter?.isNsfw === true ? 1 : null,
        promptLike: filter?.search && `%${filter.search}%`,
        directoryPathLike: directoryPath && directoryPath + "\\%",
        sortKey: sort?.key || "id",
      });
    }
    return selectAllImageQueryAsc.all({
      modelId: filter?.modelId,
      isNsfw: filter?.isNsfw === false ? 0 : filter?.isNsfw === true ? 1 : null,
      promptLike: filter?.search && `%${filter.search}%`,
      directoryPathLike: directoryPath && directoryPath + "\\%",
      sortKey: sort?.key || "id",
    });
  }

  getImageAddons(imageId) {
    return getImageAddonsQuery.all({ imageId });
  }

  addAddonRelation({ imageId, addonId, value }) {
    insertAddonRelationQuery.run({ imageId, addonId, value });
  }

  setRating({ imageId, rating }) {
    updateImageRatingQuery.run({ imageId, rating });
    return getImageById.get({ id: imageId });
  }

  setIsNsfw({ imageId, isNsfw }) {
    updateImageIsNsfwQuery.run({ imageId, isNsfw: isNsfw ? 1 : 0 });
  }

  removeDeletedImagesFromDirectory(rootDirectoryId) {
    const images = getImagesByRootDirectoryIdQuery.all({ rootDirectoryId });
    let counter = 0;
    for (const image of images) {
      if (!fs.existsSync(image.path)) {
        deleteImageQuery.run({ id: image.id });
        counter++;
      }
    }
    return counter;
  }
}
