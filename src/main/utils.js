import { join, dirname } from "path";
import * as child_process from "child_process";

export const openFileExplorer = (filePath) => {
  let command = "";
  switch (process.platform) {
    case "darwin":
      command = "open -R " + filePath;
      break;
    case "win32":
      if (process.env.SystemRoot) {
        command = join(process.env.SystemRoot, "explorer.exe");
      } else {
        command = "explorer.exe";
      }
      command += " /select," + filePath;
      break;
    default:
      const directoryPath = dirname(filePath);
      command = "xdg-open " + directoryPath;
  }
  child_process.exec(command);
};

export const loadRendererUrl = (window, url) => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#${url}`);
  } else {
    window.loadURL(
      join(
        "file://",
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html#${url}`,
      ),
    );
  }
};

export const ICON_PATH = join(
  __dirname,
  `/../renderer/${MAIN_WINDOW_VITE_NAME}/public/icons/icon`,
);
