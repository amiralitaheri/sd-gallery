import { join, dirname } from "path";
import * as child_process from "child_process";

export const SUPPORTS_COPY_FILE_TO_CLIPBOARD = ["darwin", "win32"].includes(
  process.platform,
);

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
