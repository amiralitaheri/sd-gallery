import { BrowserWindow, dialog, ipcMain } from "electron";
import { stat, readdir } from "fs/promises";
import { basename, dirname, join } from "path";
import { getMetadata } from "./metadata";
import { Models } from "./database/models";
import { Samplers } from "./database/samplers";
import { Vaes } from "./database/vaes";
import { Directories } from "./database/directories";
import { Addons } from "./database/addons";
import { Images } from "./database/images";

const getDateModified = async (path) => {
  const stats = await stat(path);
  console.log(stats);
  return stats.mtimeMs;
};

const processImportDirectory = async (path) => {
  if (checkIfAlreadyImported(path)) {
    return;
  }
  await createRootDirectory();
  await processFilesInDirectory();
};

const handleImportDirectory = async (event) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  const dir = dialog.showOpenDialogSync(win, {
    properties: ["openDirectory"],
  });
  if (!dir) return 0;
  return await processFilesInDirectory(dir[0]);
};

const processFilesInDirectory = async (path) => {
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
  const rootDirectoryId = directories.addDirectory({
    name: basename(path),
    path,
    isRoot: true,
  });
  console.log(`Len = ${entities.length}`);
  for (const entity of entities) {
    const entityPath = join(path, entity.name);
    console.log({ entity, entityPath });

    if (entity.isDirectory()) {
      directories.addDirectory({
        name: entity.name,
        path: entityPath,
        isRoot: false,
      });
    } else if (entity.isFile()) {
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
        width: Number(metadata.Size.split("x")[0]),
        height: Number(metadata.Size.split("x")[1]),
        cfgScale: Number(metadata.cfgScale),
        steps: Number(metadata.steps),
        path: entityPath,
        seed: Number(metadata.seed),
        ctimeMs: stats.ctimeMs,
        modelId,
        sampler,
        vaeId,
        rootDirectoryId,
      });

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
};

/**
 * @param {("model"|"vae"|"seed"|"prompt"|"sampler")} [groupBy]
 * @param {modelId: number, search: string, isNsfw: boolean} [filter]
 * @param {{key: ("ctimeMs"|"name"|"fileSize"|"rating"|"cfgScale"|"steps"), direction: ("asc" | "des")}} [sort]
 * @param {number} [directoryId]
 * @returns {*}
 */
const handleListFiles = ({ groupBy, filter, sort, directoryId }) => {
  // TODO
  const images = new Images();
  return images.getImages();
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

const handleSetImageRating = ({ imageId, rating }) => {
  const images = new Images();
  images.setRating({ imageId, rating });
};

const handleSetImageNsfw = ({ imageId, isNsfw }) => {
  const images = new Images();
  images.setIsNsfw({ imageId, isNsfw });
};

console.log(process.versions);

export const addHandlers = () => {
  ipcMain.handle("listFiles", handleListFiles);
  ipcMain.handle("importDirectory", handleImportDirectory);
  ipcMain.handle("getImageAddons", handleGetImageAddons);
  ipcMain.handle("getModelsList", handleGetModelsList);
  ipcMain.handle("setImageRating", handleSetImageRating);
  ipcMain.handle("setImageNsfw", handleSetImageNsfw);
};
