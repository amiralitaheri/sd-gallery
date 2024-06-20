import { getDB } from "./index";
import * as fs from "fs";
import { sep } from "path";

export class Images {
  constructor() {
    // Check if an instance already exists
    if (Images.instance) {
      return Images.instance;
    }

    this._insertImageQuery = getDB().prepare(
      `INSERT INTO image (name,
                        prompt,
                        negativePrompt,
                        isHidden,
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
     VALUES (@name,
             @prompt,
             @negativePrompt,
             @isHidden,
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

    this._deleteImageQuery = getDB().prepare(
      "DELETE FROM image WHERE id = @id",
    );

    this._insertAddonRelationQuery = getDB().prepare(
      "INSERT INTO image_addon (imageId, addonId, value) VALUES (@imageId, @addonId, @value)",
    );

    this._getImageAddonsQuery = getDB().prepare(
      `SELECT name, type, value, hash
     FROM image_addon
              LEFT JOIN addon ON addonId = addon.id
     WHERE imageId = @imageId;`,
    );

    this._getImageById = getDB().prepare("SELECT * FROM image WHERE id=@id");

    this._getImagesByRootDirectoryIdQuery = getDB().prepare(
      "SELECT id, path FROM image WHERE rootDirectoryId = @rootDirectoryId",
    );

    this._updateImageRatingQuery = getDB().prepare(
      "UPDATE image SET rating = @rating WHERE id = @imageId",
    );

    this._updateImageIsHiddenQuery = getDB().prepare(
      "UPDATE image SET isHidden = @isHidden WHERE id = @imageId",
    );

    // Save the instance in a static property
    Images.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  addImage({
    name,
    prompt,
    negativePrompt,
    isHidden,
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
    const result = this._insertImageQuery.run({
      name,
      prompt,
      negativePrompt,
      isHidden: isHidden ? 1 : 0,
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
    this._deleteImageQuery.run({ id });
  }

  getImages({ filter, sort, directoryPath }) {
    const selectAllImageQuery = getDB().prepare(
      `SELECT *
             FROM image
             WHERE (modelId = @modelId OR @modelId IS NULL)
               AND (isHidden = @isHidden OR @isHidden IS NULL)
               AND (prompt LIKE @promptLike OR @promptLike IS NULL)
               AND (path LIKE @directoryPathLike OR @directoryPathLike IS NULL)
             ORDER BY ${sort?.key || "id"} ${sort?.direction || "ASC"};`,
    );
    return selectAllImageQuery.all({
      modelId: filter?.modelId,
      isHidden:
        filter?.isHidden === false ? 0 : filter?.isHidden === true ? 1 : null,
      promptLike: filter?.search && `%${filter.search}%`,
      directoryPathLike: directoryPath && `${directoryPath}${sep}%`,
      sortKey: sort?.key || "id",
    });
  }

  getImageAddons(imageId) {
    return this._getImageAddonsQuery.all({ imageId });
  }

  addAddonRelation({ imageId, addonId, value }) {
    this._insertAddonRelationQuery.run({ imageId, addonId, value });
  }

  setRating({ imageId, rating }) {
    this._updateImageRatingQuery.run({ imageId, rating });
    return this._getImageById.get({ id: imageId });
  }

  setIsHidden({ imageId, isHidden }) {
    this._updateImageIsHiddenQuery.run({ imageId, isHidden: isHidden ? 1 : 0 });
  }

  removeDeletedImagesFromDirectory(rootDirectoryId) {
    const images = this._getImagesByRootDirectoryIdQuery.all({
      rootDirectoryId,
    });
    let counter = 0;
    for (const image of images) {
      if (!fs.existsSync(image.path)) {
        this._deleteImageQuery.run({ id: image.id });
        counter++;
      }
    }
    return counter;
  }
}
