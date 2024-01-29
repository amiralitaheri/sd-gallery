import { db } from "./index";

const insertModelQuery = db.prepare(
  "INSERT INTO model (name, hash) VALUES (@name, @hash)",
);
const deleteModelQuery = db.prepare("DELETE FROM model WHERE id = @id");

const selectAllModelQuery = db.prepare("SELECT * FROM model");

const selectModelByIdQuery = db.prepare("SELECT * FROM model WHERE id=@id");

const insetModel = ({ name, hash }) => {
  const result = insertModelQuery.run({ name, hash });
  return result.lastInsertRowid;
};
const deleteModel = (id) => {
  deleteModelQuery.run({ id });
};

export class Models {
  constructor() {
    // Check if an instance already exists
    if (Models.instance) {
      return Models.instance;
    }

    this._modelsNameToIdMap = new Map();

    const rows = selectAllModelQuery.all();
    for (const row of rows) {
      this._modelsNameToIdMap.set(row.id, row.name);
    }

    // Save the instance in a static property
    Models.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  addModel({ name, hash }) {
    if (!this._modelsNameToIdMap.has(name)) {
      const id = insetModel({ name, hash });
      this._modelsNameToIdMap.set(name, id);
      return id;
    }
    return this._modelsNameToIdMap.get(name);
  }

  removeModel({ name, hash }) {
    if (this._modelsNameToIdMap.has(name)) {
      deleteModel(this._modelsNameToIdMap.get(name));
      this._modelsNameToIdMap.delete(name);
      return true;
    }
    return false;
  }

  getModelId({ name, hash }) {
    return this._modelsNameToIdMap.get(name);
  }

  getAllModels() {
    return selectAllModelQuery.all();
  }

  getModelById(id) {
    return selectModelByIdQuery.get({ id });
  }

  getModelsArray() {
    return this._modelsNameToIdMap.keys();
  }
}
