const fs = require("fs");
const CustomField = require("./CustomField");

class Job {
  constructor(
    title,
    description,
    company,
    location,
    salary,
    requirements,
    customFields = {}
  ) {
    this.validateJobData(title, description, company, location);
    this.title = title;
    this.description = description;
    this.company = company;
    this.location = location;
    this.salary = salary;
    this.requirements = requirements;
    this.datePosted = new Date();
    this.id = Date.now().toString();
    this.customFields = customFields;
  }

  validateJobData(title, description, company, location) {
    if (!title || typeof title !== "string") throw new Error("Invalid title");
    if (!description || typeof description !== "string")
      throw new Error("Invalid description");
    if (!company || typeof company !== "string")
      throw new Error("Invalid company");
    if (!location || typeof location !== "string")
      throw new Error("Invalid location");
  }

  static loadJobs() {
    try {
      const data = fs.readFileSync("jobs.json", "utf8");
      const jobs = JSON.parse(data);
      return jobs.map((job) => Object.assign(new Job(), job));
    } catch (error) {
      if (error.code === "ENOENT") {
        console.error("Jobs file not found, creating empty jobs list");
        return [];
      }
      console.error("Error loading jobs:", error.message);
      throw new Error("Failed to load jobs data");
    }
  }

  static saveJobs(jobs) {
    fs.writeFileSync("jobs.json", JSON.stringify(jobs, null, 2));
  }

  static validateJobObject(data) {
    const errors = [];

    // Validaciones básicas
    if (!data.title || typeof data.title !== "string")
      errors.push("Invalid title");
    if (!data.description || typeof data.description !== "string")
      errors.push("Invalid description");
    if (!data.company || typeof data.company !== "string")
      errors.push("Invalid company");
    if (!data.location || typeof data.location !== "string")
      errors.push("Invalid location");

    // Validar campos personalizados si existen
    if (data.customFields) {
      // Obtener campos personalizados para trabajos
      const customFields = CustomField.getFieldsForEntity("job");

      // Validar cada campo
      customFields.forEach((field) => {
        const value = data.customFields[field.name];
        const validation = CustomField.validateValue(field, value);

        if (!validation.valid) {
          errors.push(validation.message);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static createJob(jobData) {
    // Validar todos los datos incluyendo campos personalizados
    const validation = this.validateJobObject(jobData);
    if (!validation.valid) {
      throw new Error(`Invalid job data: ${validation.errors.join(", ")}`);
    }

    const jobs = this.loadJobs();
    const newJob = new Job(
      jobData.title,
      jobData.description,
      jobData.company,
      jobData.location,
      jobData.salary,
      jobData.requirements,
      jobData.customFields
    );
    jobs.push(newJob);
    this.saveJobs(jobs);
    return newJob;
  }
  static getJobById(id) {
    const jobs = this.loadJobs();
    return jobs.find((job) => job.id === id);
  }
  static getAllJobs() {
    return this.loadJobs();
  }

  static getFeaturedJobs() {
    const jobs = this.loadJobs();
    return jobs.filter((job) => job.isFeatured === true);
  }

  static isJobExpired(job) {
    const expirationDays = 30;
    const now = new Date();
    const postedDate = new Date(job.datePosted);
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > expirationDays;
  }
  static updateJob(id, updatedData) {
    const jobs = this.loadJobs();
    const index = jobs.findIndex((job) => job.id === id);
    if (index === -1) return null;

    jobs[index] = { ...jobs[index], ...updatedData };
    this.saveJobs(jobs);
    return jobs[index];
  }
  static deleteJob(id) {
    const jobs = this.loadJobs();
    const index = jobs.findIndex((job) => job.id === id);
    if (index === -1) return false;

    jobs.splice(index, 1);
    this.saveJobs(jobs);
    return true;
  }
  static searchJobs(criteria) {
    const jobs = this.loadJobs();
    return jobs.filter((job) => {
      return (
        (!criteria.title ||
          job.title.toLowerCase().includes(criteria.title.toLowerCase())) &&
        (!criteria.company ||
          job.company.toLowerCase().includes(criteria.company.toLowerCase())) &&
        (!criteria.location ||
          job.location.toLowerCase().includes(criteria.location.toLowerCase()))
      );
    });
  }

  static getJobsByCategory(category) {
    const jobs = this.loadJobs();
    return jobs.filter(
      (job) =>
        job.category && job.category.toLowerCase() === category.toLowerCase()
    );
  }
}
