import { getDB } from "./index";

export class Models {
  constructor() {
    // Check if an instance already exists
    if (Models.instance) {
      return Models.instance;
    }

    this._insertModelQuery = getDB().prepare(
      "INSERT INTO model (name, hash) VALUES (@name, @hash)",
    );
    this._deleteModelQuery = getDB().prepare(
      "DELETE FROM model WHERE id = @id",
    );

    this._selectAllModelQuery = getDB().prepare("SELECT * FROM model");

    this._selectModelByIdQuery = getDB().prepare(
      "SELECT * FROM model WHERE id=@id",
    );

    this._modelsNameToIdMap = new Map();

    const rows = this._selectAllModelQuery.all();
    for (const row of rows) {
      this._modelsNameToIdMap.set(row.id, row.name);
    }

    // Save the instance in a static property
    Models.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  _insertModel({ name, hash }) {
    const result = this._insertModelQuery.run({ name, hash });
    return result.lastInsertRowid;
  }
  _deleteModel(id) {
    this._deleteModelQuery.run({ id });
  }

  addModel({ name, hash }) {
    if (!this._modelsNameToIdMap.has(name)) {
      const id = this._insertModel({ name, hash });
      this._modelsNameToIdMap.set(name, id);
      return id;
    }
    return this._modelsNameToIdMap.get(name);
  }

  removeModel({ name, hash }) {
    if (this._modelsNameToIdMap.has(name)) {
      this._deleteModel(this._modelsNameToIdMap.get(name));
      this._modelsNameToIdMap.delete(name);
      return true;
    }
    return false;
  }

  getModelId({ name, hash }) {
    return this._modelsNameToIdMap.get(name);
  }

  getAllModels() {
    return this._selectAllModelQuery.all();
  }

  getModelById(id) {
    return this._selectModelByIdQuery.get({ id });
  }

  getModelsArray() {
    return this._modelsNameToIdMap.keys();
  }
}
