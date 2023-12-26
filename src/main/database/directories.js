import { db } from "./index";

const insertDirectoryQuery = db.prepare(
  "INSERT INTO directory (name, path, isRoot) VALUES (@name, @path, @isRoot)",
);
const deleteDirectoryQuery = db.prepare("DELETE FROM directory where id = @id");
const selectAllDirectoryQuery = db.prepare("SELECT * FROM directory");

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

  addDirectory({ name, path, isRoot }) {
    if (true) {
      // TODO: Check if already imported
      const result = insertDirectoryQuery.run({
        name,
        path,
        isRoot: isRoot ? 1 : 0,
      });
      return result.lastInsertRowid;
    } else {
      throw new Error("This directory is already imported.");
    }
  }

  removeDirectory({ id, path }) {
    // TODO
    "DELETE from directory where path like '@path%'";
    "DELETE from images where rootDirectoryId=@id";
    // Should I delete models, addons , etc?
  }

  getDirectoriesTree() {
    const rows = selectAllDirectoryQuery.all();
    const directoriesTree = [];

    const insertToTree = (row, treeNode) => {
      const parent = treeNode.find((directory) =>
        row.path.startsWith(directory.path),
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
