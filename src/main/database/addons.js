import { db } from "./index";

const insertAddonQuery = db.prepare(
  "INSERT INTO addon (name, hash, type) VALUES (@name, @hash, @type)",
);
const deleteAddonQuery = db.prepare("DELETE FROM addon where id = @id");

const selectAllAddonQuery = db.prepare("SELECT * From addon");

export class Addons {
  constructor() {
    // Check if an instance already exists
    if (Addons.instance) {
      return Addons.instance;
    }

    this._addonsNameToIdMap = new Map();

    const rows = selectAllAddonQuery.all();
    for (const row of rows) {
      this._addonsNameToIdMap.set(row.id, row.name);
    }

    // Save the instance in a static property
    Addons.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  addAddon({ name, hash, type }) {
    if (!this._addonsNameToIdMap.has(name)) {
      const result = insertAddonQuery.run({ name, hash, type });
      const id = result.lastInsertRowid;
      this._addonsNameToIdMap.set(name, id);
      return id;
    }
    return this._addonsNameToIdMap.get(name);
  }

  removeAddon({ name }) {
    if (this._addonsNameToIdMap.has(name)) {
      deleteAddonQuery.run({ id: this._addonsNameToIdMap.get(name) });
      this._addonsNameToIdMap.delete(name);
      return true;
    }
    return false;
  }

  getAddonId({ name }) {
    return this._addonsNameToIdMap.get(name);
  }

  getAddonsArray() {
    return this._addonsNameToIdMap.keys();
  }
}
