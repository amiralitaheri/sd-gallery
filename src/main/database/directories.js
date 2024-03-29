import { db } from "./index";
import { dirname, sep } from "path";

const insertDirectoryQuery = db.prepare(
  "INSERT INTO directory (name, path, isRoot, rootDirectoryId) VALUES (@name, @path, @isRoot, @rootDirectoryId)",
);
const deleteDirectoryQuery = db.prepare("DELETE FROM directory WHERE id = @id");
const selectAllDirectoryQuery = db.prepare("SELECT * FROM directory");
const getDirectoryByPathQuery = db.prepare(
  "SELECT * FROM directory WHERE path = @path",
);

const getDirectoryByIdQuery = db.prepare(
  "SELECT * FROM directory WHERE id = @id",
);

const getRootDirectoriesQuery = db.prepare(
  "SELECT * FROM directory WHERE isRoot = 1",
);

const updateDirectoryIsHiddenQuery = db.prepare(
  "UPDATE directory SET isHidden = @isHidden WHERE id = @directoryId",
);

export class Directories {
  constructor() {
    // Check if an instance already exists
    if (Directories.instance) {
      return Directories.instance;
    }

    // Save the instance in a static property
    Directories.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  addDirectory({ name, path, rootDirectoryId }) {
    const directory = getDirectoryByPathQuery.get({ path });
    if (!directory?.id) {
      const result = insertDirectoryQuery.run({
        name,
        path,
        isRoot: rootDirectoryId ? 0 : 1,
        rootDirectoryId,
      });
      return result.lastInsertRowid;
    } else {
      return directory.id;
    }
  }

  getDirectoryPathById(id) {
    const directory = getDirectoryByIdQuery.get({ id });
    return directory?.path;
  }

  getRootDirectories() {
    return getRootDirectoriesQuery.all();
  }

  removeDirectory(id) {
    deleteDirectoryQuery.run({ id });
    // Should I delete models, addons , vaes
  }

  setIsHidden({ directoryId, isHidden }) {
    updateDirectoryIsHiddenQuery.run({
      directoryId,
      isHidden: isHidden ? 1 : 0,
    });
  }

  getDirectoriesTree() {
    const rows = selectAllDirectoryQuery.all();
    const directoriesTree = [];

    const insertToTree = (row, treeNode) => {
      const directoryName = dirname(row.path);
      const parent = treeNode.find((directory) =>
        (directoryName + sep).startsWith(directory.path + sep),
      );
      if (parent) {
        parent.children = parent.children || [];
        insertToTree(row, parent.children);
      } else {
        treeNode.push(row);
      }
    };

    for (const row of rows) {
      insertToTree(row, directoriesTree);
    }

    return directoriesTree;
  }
}
