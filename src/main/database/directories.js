import { db } from "./index";
import { dirname } from "path";

const insertDirectoryQuery = db.prepare(
  "INSERT INTO directory (name, path, isRoot, rootDirectoryId) VALUES (@name, @path, @isRoot, @rootDirectoryId)",
);
const deleteDirectoryQuery = db.prepare("DELETE FROM directory where id = @id");
const selectAllDirectoryQuery = db.prepare("SELECT * FROM directory");
const getDirectoryIdByPath = db.prepare(
  "SELECT id FROM directory WHERE path = @path",
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
    const directory = getDirectoryIdByPath.get({ path });
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

  removeDirectory(id) {
    deleteDirectoryQuery.run({ id });
    // Should I delete models, addons , vaes
  }

  getDirectoriesTree() {
    const rows = selectAllDirectoryQuery.all();
    const directoriesTree = [];

    const insertToTree = (row, treeNode) => {
      const directoryName = dirname(row.path);
      const parent = treeNode.find(
        (directory) => directoryName === directory.path,
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
