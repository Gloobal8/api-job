const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "db.json"));
const db = low(adapter);

// Set default data structure
db.defaults({
  users: [],
  addresses: [],
  companies: [],
  jobs: [],
  jobCategories: [],
  jobTypes: [],
  jobSkills: [],
  jobShifts: [],
  jobExperiences: [],
  careerLevels: [],
  functionalAreas: [],
  degreeTypes: [],
  degreeLevels: [],
  languageLevels: [],
  applications: [],
  packages: [],
  transactions: [],
  invoices: [],
}).write();

module.exports = db;
