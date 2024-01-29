import { db } from "./index";

const insertSamplerQuery = db.prepare(
  "INSERT INTO sampler (name) VALUES (@name)",
);
const deleteSamplerQuery = db.prepare("DELETE FROM sampler WHERE name = @name");

const selectAllSamplerQuery = db.prepare("SELECT * FROM sampler");

const insetSampler = ({ name }) => {
  const result = insertSamplerQuery.run({ name });
  return result.lastInsertRowid;
};
const deleteSampler = (name) => {
  deleteSamplerQuery.run({ name });
};

export class Samplers {
  constructor() {
    // Check if an instance already exists
    if (Samplers.instance) {
      return Samplers.instance;
    }

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

  addSampler({ name }) {
    if (!this._samplersNameArray.includes(name)) {
      insetSampler({ name });
      this._samplersNameArray.push(name);
    }
    return name;
  }

  removeSampler({ name }) {
    if (this._samplersNameArray.includes(name)) {
      deleteSampler(name);
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
