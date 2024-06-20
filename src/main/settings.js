import { join } from "path";
import { app } from "electron";
import { productName } from "../../package.json";
import { readFileSync, writeFileSync, existsSync } from "fs";

let settings = {
  autoHideNsfw: true,
  minFileSize: 2048,
};

const settingsFilePath = join(
  app.getPath("appData"),
  productName,
  "/settings.json",
);

const loadSettings = () => {
  if (existsSync(settingsFilePath)) {
    const rawSettings = readFileSync(settingsFilePath).toString();
    settings = { ...settings, ...JSON.parse(rawSettings || "{}") };
  }
};

const saveSettings = () => {
  writeFileSync(settingsFilePath, JSON.stringify(settings));
};

const updateSetting = ({ key, value }) => {
  settings[key] = value;
  saveSettings();
};

export { settings, loadSettings, updateSetting };
