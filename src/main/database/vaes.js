import { getDB } from "./index";

export class Vaes {
  constructor() {
    // Check if an instance already exists
    if (Vaes.instance) {
      return Vaes.instance;
    }

    this._insertVaeQuery = getDB().prepare(
      "INSERT INTO vae (name, hash) VALUES (@name, @hash)",
    );
    this._deleteVaeQuery = getDB().prepare("DELETE FROM vae WHERE id = @id");

    this._selectAllVaeQuery = getDB().prepare("SELECT * FROM vae");

    this._vaesNameToIdMap = new Map();

    const rows = this._selectAllVaeQuery.all();
    for (const row of rows) {
      this._vaesNameToIdMap.set(row.id, row.name);
    }

    // Save the instance in a static property
    Vaes.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  addVae({ name, hash }) {
    if (!this._vaesNameToIdMap.has(name)) {
      const result = this._insertVaeQuery.run({ name, hash });
      const id = result.lastInsertRowid;
      this._vaesNameToIdMap.set(name, id);
      return id;
    }
    return this._vaesNameToIdMap.get(name);
  }

  removeVae({ name, hash }) {
    if (this._vaesNameToIdMap.has(name)) {
      this._deleteVaeQuery.run({ id: this._vaesNameToIdMap.get(name) });
      this._vaesNameToIdMap.delete(name);
      return true;
    }
    return false;
  }

  getAllVaes() {
    return this._selectAllVaeQuery.all();
  }

  getVaeId({ name, hash }) {
    return this._vaesNameToIdMap.get(name);
  }

  getVaesArray() {
    return this._vaesNameToIdMap.keys();
  }
}
