import { BrowserWindow, dialog, ipcMain, Menu } from "electron";
import { stat, readdir } from "fs/promises";
import { basename, join } from "path";
import { getMetadata } from "./metadata";
import { Models } from "./database/models";
import { Samplers } from "./database/samplers";
import { Vaes } from "./database/vaes";
import { Directories } from "./database/directories";
import { Addons } from "./database/addons";
import { Images } from "./database/images";
import { includesNsfw } from "./metadata/audit";
import { openFileExplorer } from "./utils";
import { settings, updateSetting } from "./settings";
import log from "electron-log/main";

let writeFilePathsToClipboard;
try {
  writeFilePathsToClipboard = require("electron-clipboard-ex").writeFilePaths;
} catch (er) {}

const isImage = (name) =>
  /\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/gi.test(name);

const handleImportDirectory = async (event) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  const dir = dialog.showOpenDialogSync(win, {
    properties: ["openDirectory"],
  });
  if (!dir) return 0;
  try {
    return await processFilesInDirectory(dir[0]);
  } catch (e) {
    log.error(e);
    throw e;
  }
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
  const directoryId = directories.addDirectory({
    name: basename(path),
    path,
    rootDirectoryId: rootId,
  });
  for (const entity of entities) {
    const entityPath = join(path, entity.name);
    if (entity.isDirectory()) {
      counter += await processFilesInDirectory(
        entityPath,
        rootId || directoryId,
      );
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

      if (stats.size < settings.minFileSize) continue;

      const metadata = await getMetadata(entityPath);
      let sampler, modelId, vaeId;

      if (metadata.sampler) {
        sampler = samplers.addSampler({ name: metadata.sampler });
      }

      if (metadata.Model) {
        modelId = models.addModel({
          name: metadata.Model,
          hash: metadata["Model hash"] || metadata.hashes?.["model"],
        });
      }

      if (metadata.VAE) {
        vaeId = vaes.addVae({
          name: metadata.VAE,
          hash: metadata["VAE hash"] || metadata.hashes?.["vae"],
        });
      }

      let imageId;

      // FIXME: Should this be here? Why the prompt is an object, Should we display it differently in UI?
      if (typeof metadata.prompt === "object") {
        metadata.prompt = JSON.stringify(metadata.prompt);
      }

      try {
        imageId = images.addImage({
          name: entity.name,
          prompt: metadata.prompt,
          negativePrompt: metadata.negativePrompt,
          isHidden: settings.autoHideNsfw && includesNsfw(metadata.prompt),
          fileSize: stats.size,
          fileExtension:
            metadata.FileType?.value || metadata["File Type"]?.value,
          width: Number(metadata["Image Width"]?.value),
          height: Number(metadata["Image Height"]?.value),
          cfgScale: Number(metadata.cfgScale),
          steps: Number(metadata.steps),
          path: entityPath,
          seed: Number(metadata.seed),
          ctimeMs: stats.ctimeMs,
          clipSkip: Number(metadata.clipSkip),
          modelId,
          sampler,
          vaeId,
          rootDirectoryId: rootId || directoryId,
        });
      } catch (e) {
        if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
          continue;
        }
        console.error(e);
        log.error(e, { entity });
      }
      counter++;

      if (metadata.resources) {
        for (const resource of metadata.resources) {
          if (resource.type !== "model") {
            try {
              const addonId = addons.addAddon({
                name: resource.name,
                type: resource.type,
                hash: metadata.hashes?.[`${resource.type}:${resource.name}`],
              });

              images.addAddonRelation({
                imageId,
                addonId,
                value: resource.weight,
              });
            } catch (e) {
              if (e.code !== "SQLITE_CONSTRAINT_PRIMARYKEY") {
                log.error(e, { resource });
              }
            }
          }
        }
      }
    }
  }
  return counter;
};

const handleDeleteDirectory = (event, id) => {
  const directories = new Directories();
  directories.removeDirectory(id);
};

/**
 * @param {number} rootDirectoryId
 * @returns {Promise<{deleted: number, added: number}>}
 */
const syncDirectory = async (rootDirectoryId) => {
  const directories = new Directories();
  const images = new Images();
  let added = 0,
    deleted = 0;
  try {
    deleted = images.removeDeletedImagesFromDirectory(rootDirectoryId);

    added = await processFilesInDirectory(
      directories.getDirectoryPathById(rootDirectoryId),
    );
  } catch (e) {
    log.error(e, { rootDirectoryId });
    throw e;
  }
  return { added, deleted };
};

/**
 * @param event
 * @param {number} [rootDirectoryId]
 * @returns {Promise<{deleted: number, added: number}>}
 */
const handleSyncDirectories = async (event, rootDirectoryId) => {
  if (rootDirectoryId) {
    return syncDirectory(rootDirectoryId);
  }
  let added = 0,
    deleted = 0;

  const rootDirectories = new Directories().getRootDirectories();

  for (const directory of rootDirectories) {
    const result = await syncDirectory(directory.id);
    added += result.added;
    deleted += result.deleted;
  }

  return { added, deleted };
};

/**
 * @param event
 * @param {("model"|"vae"|"seed"|"prompt"|"sampler")} [groupBy]
 * @param {modelId: number, search: string, isHidden: boolean} [filter]
 * @param {{key: ("ctimeMs"|"name"|"fileSize"|"rating"|"cfgScale"|"steps"), direction: ("asc" | "desc")}} [sort]
 * @param {string} [directoryPath]
 * @returns {*}
 */
const handleListFiles = (event, { groupBy, filter, sort, directoryPath }) => {
  // TODO
  const images = new Images();
  return images.getImages({ groupBy, filter, sort, directoryPath });
};

const handleGetImageAddons = (event, imageId) => {
  const images = new Images();
  return images.getImageAddons(imageId);
};

const handleGetModelsList = () => {
  const models = new Models();
  models.getModelsArray();
};

const handleGetModels = () => {
  const models = new Models();
  return models.getAllModels();
};

const handleGetModelById = (event, modelId) => {
  const models = new Models();
  return models.getModelById(modelId);
};

const handleGetVaes = () => {
  const vaes = new Vaes();
  return vaes.getAllVaes();
};

const handleGetDirectories = () => {
  const directories = new Directories();
  return directories.getDirectoriesTree();
};

const handleSetImageRating = (event, { imageId, rating }) => {
  const images = new Images();
  return images.setRating({ imageId, rating });
};

const handleSetImageIsHidden = (event, { imageId, isHidden }) => {
  const images = new Images();
  images.setIsHidden({ imageId, isHidden });
};

const handleSetDirectoryIsHidden = (event, { directoryId, isHidden }) => {
  const directories = new Directories();
  directories.setIsHidden({ directoryId, isHidden });
};

const handleShowDirectoryContextMenu = (event, directory) => {
  const template = [
    directory.isRoot && {
      label: "Remove directory",
      click: () => {
        const directories = new Directories();
        directories.removeDirectory(directory.id);
        event.sender.send("refresh");
      },
    },
    {
      label: directory.isHidden
        ? "Unmark directory as hidden"
        : "Mark directory as hidden",
      click: () => {
        const directories = new Directories();
        directories.setIsHidden({
          directoryId: directory.id,
          isHidden: !directory.isHidden,
        });
        event.sender.send("refresh");
      },
    },
  ];
  const menu = Menu.buildFromTemplate(template.filter(Boolean));
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
};

const handleShowImageContextMenu = (event, image) => {
  const template = [
    {
      label: "Open in explorer",
      click: () => {
        openFileExplorer(image.path);
      },
    },
    writeFilePathsToClipboard && {
      label: "Copy",
      click: () => {
        writeFilePathsToClipboard([image.path]);
      },
    },
  ];
  const menu = Menu.buildFromTemplate(template.filter(Boolean));
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
};

const handleGetSettings = () => settings;
const handleSetSetting = (event, args) => updateSetting(args);

console.log(process.versions);

export const addHandlers = () => {
  ipcMain.handle("listFiles", handleListFiles);
  ipcMain.handle("importDirectory", handleImportDirectory);
  ipcMain.handle("getSettings", handleGetSettings);
  ipcMain.handle("setSetting", handleSetSetting);
  ipcMain.handle("getImageAddons", handleGetImageAddons);
  ipcMain.handle("getModelsList", handleGetModelsList);
  ipcMain.handle("setImageRating", handleSetImageRating);
  ipcMain.handle("setImageIsHidden", handleSetImageIsHidden);
  ipcMain.handle("setDirectoryIsHidden", handleSetDirectoryIsHidden);
  ipcMain.handle("getDirectories", handleGetDirectories);
  ipcMain.handle("getModels", handleGetModels);
  ipcMain.handle("getVaes", handleGetVaes);
  ipcMain.handle("getModelById", handleGetModelById);
  ipcMain.handle("deleteDirectory", handleDeleteDirectory);
  ipcMain.handle("syncDirectories", handleSyncDirectories);
  ipcMain.on("showDirectoryContextMenu", handleShowDirectoryContextMenu);
  ipcMain.on("showImageContextMenu", handleShowImageContextMenu);
};
