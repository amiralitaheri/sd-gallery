import { db } from "./index";

const insertVaeQuery = db.prepare(
  "INSERT INTO vae (name, hash) VALUES (@name, @hash)",
);
const deleteVaeQuery = db.prepare("DELETE FROM vae where id = @id");

const selectAllVaeQuery = db.prepare("SELECT * From vae");

export class Vaes {
  constructor() {
    // Check if an instance already exists
    if (Vaes.instance) {
      return Vaes.instance;
    }

    this._vaesNameToIdMap = new Map();

    const rows = selectAllVaeQuery.all();
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
      const result = insertVaeQuery.run({ name, hash });
      const id = result.lastInsertRowid;
      this._vaesNameToIdMap.set(name, id);
      return id;
    }
    return this._vaesNameToIdMap.get(name);
  }

  removeVae({ name, hash }) {
    if (this._vaesNameToIdMap.has(name)) {
      deleteVaeQuery.run({ id: this._vaesNameToIdMap.get(name) });
      this._vaesNameToIdMap.delete(name);
      return true;
    }
    return false;
  }

  getAllVaes() {
    console.log("WTF", selectAllVaeQuery.all());
    return selectAllVaeQuery.all();
  }

  getVaeId({ name, hash }) {
    return this._vaesNameToIdMap.get(name);
  }

  getVaesArray() {
    return this._vaesNameToIdMap.keys();
  }
}
