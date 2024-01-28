const { homepage, description } = require("./package.json");

const makerOptions = {
  categories: ["Graphics"],
  genericName: "Image Organization",
  homepage,
  icon: "./src/public/icons/icon.png",
  productDescription: description,
};

module.exports = {
  packagerConfig: {
    ignore: (path) => {
      if (!path) {
        return false;
      }
      if (path.startsWith("/.vite")) {
        return false;
      }
      if (path === "/package.json") {
        return false;
      }

      if (path.startsWith("/node_modules/.bin")) {
        return true;
      }
      if (path.startsWith("/node_modules")) {
        return false;
      }
      return true;
    },
    icon: "./src/public/icons/icon",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        iconUrl: `https://github.com/amiralitaheri/sd-gallery/master/src/public/icons/win/icon.ico`,
        setupIcon: "./src/public/icons/icon.ico",
      },
    },
    {
      name: "@electron-forge/maker-zip",
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          ...makerOptions,
          section: "graphics",
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: makerOptions,
      },
    },
    // {
    //   name: "@electron-forge/maker-flatpak",
    //   config: {},
    // },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: "src/main/main.js",
            config: "vite.main.config.mjs",
          },
          {
            entry: "src/preload.js",
            config: "vite.preload.config.mjs",
          },
        ],
        renderer: [
          {
            name: "main_window",
            config: "vite.renderer.config.mjs",
          },
        ],
      },
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "amiralitaheri",
          name: "sd-gallery",
        },
        draft: true,
      },
    },
  ],
};
