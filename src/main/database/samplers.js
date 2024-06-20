import { getDB } from "./index";

export class Samplers {
  constructor() {
    // Check if an instance already exists
    if (Samplers.instance) {
      return Samplers.instance;
    }

    this._insertSamplerQuery = getDB().prepare(
      "INSERT INTO sampler (name) VALUES (@name)",
    );
    this._deleteSamplerQuery = getDB().prepare(
      "DELETE FROM sampler WHERE name = @name",
    );

    const selectAllSamplerQuery = getDB().prepare("SELECT * FROM sampler");

    this._samplersNameArray = [];

    const rows = selectAllSamplerQuery.all();
    for (const row of rows) {
      this._samplersNameArray.push(row.name);
    }

    // Save the instance in a static property
    Samplers.instance = this;

    // Ensure that the constructor returns the instance
    return this;
  }

  _insetSampler({ name }) {
    const result = this._insertSamplerQuery.run({ name });
    return result.lastInsertRowid;
  }
  _deleteSampler(name) {
    this._deleteSamplerQuery.run({ name });
  }

  addSampler({ name }) {
    if (!this._samplersNameArray.includes(name)) {
      this._insetSampler({ name });
      this._samplersNameArray.push(name);
    }
    return name;
  }

  removeSampler({ name }) {
    if (this._samplersNameArray.includes(name)) {
      this._deleteSampler(name);
      this._samplersNameArray = this._samplersNameArray.filter(
        (n) => n !== name,
      );
      return true;
    }
    return false;
  }

  getSamplersNameArray() {
    return [...this._samplersNameArray];
  }
}
