import { getDB } from "./index";
import { dirname, sep } from "path";

export class Directories {
  constructor() {
    // Check if an instance already exists
    if (Directories.instance) {
      return Directories.instance;
    }

    this._insertDirectoryQuery = getDB().prepare(
      "INSERT INTO directory (name, path, isRoot, rootDirectoryId) VALUES (@name, @path, @isRoot, @rootDirectoryId)",
    );
    this._deleteDirectoryQuery = getDB().prepare(
      "DELETE FROM directory WHERE id = @id",
    );
    this._selectAllDirectoryQuery = getDB().prepare("SELECT * FROM directory");
    this._getDirectoryByPathQuery = getDB().prepare(
      "SELECT * FROM directory WHERE path = @path",
    );

    this._getDirectoryByIdQuery = getDB().prepare(
      "SELECT * FROM directory WHERE id = @id",
    );

    this._getRootDirectoriesQuery = getDB().prepare(
      "SELECT * FROM directory WHERE isRoot = 1",
    );

    this._updateDirectoryIsHiddenQuery = getDB().prepare(
      "UPDATE directory SET isHidden = @isHidden WHERE id = @directoryId",
    );

    // Save the instance in a static property
    Directories.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  addDirectory({ name, path, rootDirectoryId }) {
    const directory = this._getDirectoryByPathQuery.get({ path });
    if (!directory?.id) {
      const result = this._insertDirectoryQuery.run({
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
    const directory = this._getDirectoryByIdQuery.get({ id });
    return directory?.path;
  }

  getRootDirectories() {
    return this._getRootDirectoriesQuery.all();
  }

  removeDirectory(id) {
    this._deleteDirectoryQuery.run({ id });
    // Should I delete models, addons , vaes
  }

  setIsHidden({ directoryId, isHidden }) {
    this._updateDirectoryIsHiddenQuery.run({
      directoryId,
      isHidden: isHidden ? 1 : 0,
    });
  }

  getDirectoriesTree() {
    const rows = this._selectAllDirectoryQuery.all();
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
