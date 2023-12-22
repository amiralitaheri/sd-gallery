import { db } from "./index";

const insertDirectoryQuery = db.prepare(
  "INSERT INTO directory (name, path, isRoot) VALUES (@name, @path, @isRoot)",
);
const deleteDirectoryQuery = db.prepare("DELETE FROM directory where id = @id");

const insertDirectory = ({ name, path, isRoot }) => {
  const result = insertDirectoryQuery.run({ name, path, isRoot });
  return result.lastInsertRowid;
};
const deleteDirectory = (id) => {
  deleteDirectoryQuery.run({ id });
  //   TODO: Delete subdirectories
};

export class Directories {
  constructor() {
    // Check if an instance already exists
    if (Directories.instance) {
      return Directories.instance;
    }

    this._modelsNameToIdMap = new Map();

    // Save the instance in a static property
    Directories.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  addDirectory({ name, path, isRoot }) {
    if (!this._modelsNameToIdMap.has(path)) {
      const id = insertDirectory({ name, path, isRoot: isRoot ? 1 : 0 });
      this._modelsNameToIdMap.set(name, id);
      return id;
    }
    return this._modelsNameToIdMap.has(path);
  }

  removeDirectory({ name, hash }) {
    if (this._modelsNameToIdMap.has(name)) {
      deleteModel(this._modelsNameToIdMap.get(name));
      return true;
    }
    return false;
  }

  getDirectoriesTree({ name, hash }) {
    // TODO
  }
}
