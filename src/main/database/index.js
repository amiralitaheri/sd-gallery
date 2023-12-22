import Database from "better-sqlite3";
import { join } from "path";

export const db = new Database(join(__dirname, "/database_v1.db"));
db.transaction(() => {
  db.exec(`
        CREATE TABLE IF NOT EXISTS model (
            id INTEGER PRIMARY KEY,
            name TEXT,
            hash TEXT,
            civitId TEXT
        );
        
        CREATE TABLE IF NOT EXISTS directory (
            id INTEGER PRIMARY KEY,
            name TEXT,
            path TEXT,
            isRoot INTEGER
        );
    
        CREATE TABLE IF NOT EXISTS sampler (
            name TEXT UNIQUE
        );
        
        CREATE TABLE IF NOT EXISTS vae (
            id INTEGER PRIMARY KEY,
            name TEXT,
            hash TEXT,
            civitId TEXT
        );
    
        CREATE TABLE IF NOT EXISTS addon (
            id INTEGER PRIMARY KEY,
            name TEXT,
            hash TEXT,
            type TEXT,
            civitId TEXT
        );
    
        CREATE TABLE IF NOT EXISTS image (
            id INTEGER PRIMARY KEY,
            name TEXT,
            prompt TEXT,
            negativePrompt TEXT,
            rating INTEGER,
            isNsfw INTEGER,
            fileSize INTEGER,
            fileExtension TEXT,
            width INTEGER,
            height INTEGER,
            cfgScale REAL,
            steps INTEGER,
            path TEXT,
            seed INTEGER,
            ctimeMs REAL,
        
        
            rootDirectoryId INTEGER,
            modelId INTEGER,
            sampler TEXT,
            vaeId INTEGER,
            FOREIGN KEY (rootDirectoryId) REFERENCES directory(id),
            FOREIGN KEY (modelId) REFERENCES model(id),
            FOREIGN KEY (sampler) REFERENCES sampler(name)
            FOREIGN KEY (vaeId) REFERENCES vae(id)
        );
    
        CREATE TABLE IF NOT EXISTS image_addon (
            imageId INTEGER,
            addonId INTEGER,
            value REAL,
            PRIMARY KEY (imageId, addonId),
            FOREIGN KEY (imageId) REFERENCES image(id),
            FOREIGN KEY (addonId) REFERENCES addon(id)
        );
        `);
})();

export const setupDB = () => {};
