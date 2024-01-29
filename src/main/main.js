import { app, BrowserWindow, Menu, MenuItem, screen, shell } from "electron";
import path from "path";
import { setupDB } from "./database";
import { addHandlers } from "./handlers";
import electronSquirrelStartup from "electron-squirrel-startup";
import { ICON_PATH, loadRendererUrl } from "./utils";
import { productName } from "../../package.json";
import { loadSettings } from "./settings";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

let mainWindow;

const showAboutModal = () => {
  const modal = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 400,
    height: 300,
    resizable: false,
    minimizable: false,
    title: `About ${productName}`,
    icon: ICON_PATH,
  });
  modal.removeMenu();
  modal.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  loadRendererUrl(modal, "/about");
  modal.once("ready-to-show", () => {
    modal.show();
  });
};

const showSettingsModal = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  const modal = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: width / 2,
    height: width / 2,
    minimizable: false,
    title: "Settings",
    icon: ICON_PATH,
  });
  modal.removeMenu();
  loadRendererUrl(modal, "/settings");
  modal.once("ready-to-show", () => {
    modal.show();
    modal.webContents.openDevTools();
  });
};

const createApplicationMenu = () => {
  const applicationMenu = Menu.getApplicationMenu();
  const filteredItems = applicationMenu.items.filter((item) =>
    ["File", "View", "Window", ""].includes(item.label),
  );

  const customMenu = new Menu();

  for (const item of filteredItems) {
    customMenu.append(item);
  }
  customMenu.append(
    new MenuItem({
      label: "Settings",
      click: showSettingsModal,
    }),
  );
  customMenu.append(
    new MenuItem({
      label: "About",
      click: showAboutModal,
    }),
  );

  Menu.setApplicationMenu(customMenu);
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false, // TODO: Check other alternatives for loading local resources
    },
  });
  mainWindow.maximize();
  mainWindow.show();

  // and load the index.html of the app.
  loadRendererUrl(mainWindow, "/");
};

app.whenReady().then(() => {
  setupDB();
  loadSettings();
  addHandlers();
  createApplicationMenu();
  createWindow();
  app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
