import { BrowserWindow, dialog, ipcMain } from "electron";
import { stat, readdir } from "fs/promises";
import { basename, join } from "path";
import { getMetadata } from "./metadata";
import { Models } from "./database/models";
import { Samplers } from "./database/samplers";
import { Vaes } from "./database/vaes";
import { Directories } from "./database/directories";
import { Addons } from "./database/addons";
import { Images } from "./database/images";
const isImage = (name) =>
  /\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/gi.test(name);

const handleImportDirectory = async (event) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  const dir = dialog.showOpenDialogSync(win, {
    properties: ["openDirectory"],
  });
  if (!dir) return 0;
  return await processFilesInDirectory(dir[0]);
};

const processFilesInDirectory = async (path, rootId = null) => {
  let counter = 0;
  const models = new Models();
  const samplers = new Samplers();
  const vaes = new Vaes();
  const directories = new Directories();
  const addons = new Addons();
  const images = new Images();

  const entities = await readdir(path, {
    withFileTypes: true,
    recursive: false, // TODO: Upgrade node js or use another method for recursive
  });
  console.log(`Len = ${entities.length}`);
  const rootDirectoryId = directories.addDirectory({
    name: basename(path),
    path,
    isRoot: !rootId,
  });
  for (const entity of entities) {
    const entityPath = join(path, entity.name);
    console.log({ entity, entityPath });

    if (entity.isDirectory()) {
      counter += processFilesInDirectory(entityPath, rootId || rootDirectoryId);
      // directories.addDirectory({
      //   name: entity.name,
      //   path: entityPath,
      //   isRoot: false,
      // });
    } else if (entity.isFile()) {
      if (!isImage(entity.name)) {
        continue;
      }
      const stats = await stat(entityPath);
      console.log(stats);

      const metadata = await getMetadata(entityPath);
      console.log(metadata);

      let sampler, modelId, vaeId;

      if (metadata.sampler) {
        sampler = samplers.addSampler({ name: metadata.sampler });
      }

      if (metadata.Model) {
        modelId = models.addModel({
          name: metadata.Model,
          hash: metadata["Model hash"],
        });
      }

      if (metadata.VAE) {
        vaeId = vaes.addVae({ name: metadata.VAE, hash: metadata["VAE hash"] });
      }

      const imageId = images.addImage({
        name: entity.name,
        prompt: metadata.prompt,
        negativePrompt: metadata.negativePrompt,
        isNsfw: false, // TODO
        fileSize: stats.size,
        fileExtension: entity.name.split(".").at(-1).toLowerCase(),
        width: Number(metadata["Image Width"].value),
        height: Number(metadata["Image Height"].value),
        cfgScale: Number(metadata.cfgScale),
        steps: Number(metadata.steps),
        path: entityPath,
        seed: Number(metadata.seed),
        ctimeMs: stats.ctimeMs,
        modelId,
        sampler,
        vaeId,
        rootDirectoryId: rootId || rootDirectoryId,
      });
      counter++;

      if (metadata.resources) {
        for (const resource of metadata.resources) {
          if (resource.type !== "model") {
            const addonId = addons.addAddon({
              name: resource.name,
              type: resource.type,
            });

            images.addAddonRelation({
              imageId,
              addonId,
              value: resource.weight,
            });
          }
        }
      }
    }
  }
  return counter;
};

/**
 * @param {("model"|"vae"|"seed"|"prompt"|"sampler")} [groupBy]
 * @param {modelId: number, search: string, isNsfw: boolean} [filter]
 * @param {{key: ("ctimeMs"|"name"|"fileSize"|"rating"|"cfgScale"|"steps"), direction: ("asc" | "desc")}} [sort]
 * @param {string} [directoryPath]
 * @returns {*}
 */
const handleListFiles = ({ groupBy, filter, sort, directoryPath }) => {
  // TODO
  const images = new Images();
  return images.getImages({ groupBy, filter, sort, directoryPath });
};

const handleGetImageAddons = (imageId) => {
  const images = new Images();
  return images.getImageAddons(imageId);
};

const handleGetModelsList = () => {
  const models = new Models();
  models.getModelsArray();
};

// TODO: Do we need these or should we send a array of objects to frontend including both id, name and maybe hash
const handleGetModelName = (modelId) => {
  //TODO
};

const handleGetModelId = (modelName) => {
  //TODO
};

const handleGetVaeName = (vaeId) => {
  //TODO
};

const handleGetVaeId = (vaeName) => {
  //TODO
};

const handleGetDirectories = () => {
  const directories = new Directories();
  return directories.getDirectoriesTree();
};

const handleSetImageRating = ({ imageId, rating }) => {
  const images = new Images();
  return images.setRating({ imageId, rating });
};

const handleSetImageNsfw = ({ imageId, isNsfw }) => {
  const images = new Images();
  images.setIsNsfw({ imageId, isNsfw });
};

console.log(process.versions);

export const addHandlers = () => {
  ipcMain.handle("listFiles", (event, args) => handleListFiles(args));
  ipcMain.handle("importDirectory", handleImportDirectory);
  ipcMain.handle("getImageAddons", handleGetImageAddons);
  ipcMain.handle("getModelsList", handleGetModelsList);
  ipcMain.handle("setImageRating", (event, args) => handleSetImageRating(args));
  ipcMain.handle("setImageNsfw", (event, args) => handleSetImageNsfw(args));
  ipcMain.handle("getDirectories", handleGetDirectories);
};
