// Company model definition

const companyModel = {
  // Required fields
  id: String,
  name: String,
  userId: String, // Owner's user ID
  createdAt: String,
  updatedAt: String,

  // Optional fields
  logo: String,
  coverImage: String,
  description: String,
  website: String,
  email: String,
  phone: String,
  location: String,
  address: String,
  size: String, // 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+
  founded: Number,
  industry: String,
  revenue: Number,
  employeeCount: Number,
  yearlyGrowth: Number,
  marketPosition: String,
  certifications: [String],
  awards: [String],
  branches: [{ name: String, location: String }],
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
  },
  culture: String,
  benefits: [String],
  workEnvironment: String,
  technologies: [String],
  keyProjects: [{ name: String, description: String }],

  // Meta fields
  isVerified: Boolean,
  isFeatured: Boolean,
  views: Number,
  monthlyViews: Number,
  applicationRate: Number,
  responseTime: Number,
  averageRating: Number,

  // Añadir soporte para campos personalizados
  customFields: {},
};

const validateCompany = (company) => {
  // Basic validation
  if (!company.name || !company.userId) {
    return false;
  }

  // Validate numeric fields
  if (company.revenue && typeof company.revenue !== "number") return false;
  if (company.employeeCount && typeof company.employeeCount !== "number")
    return false;
  if (company.yearlyGrowth && typeof company.yearlyGrowth !== "number")
    return false;
  if (company.monthlyViews && typeof company.monthlyViews !== "number")
    return false;
  if (company.applicationRate && typeof company.applicationRate !== "number")
    return false;
  if (company.responseTime && typeof company.responseTime !== "number")
    return false;
  if (
    company.averageRating &&
    (typeof company.averageRating !== "number" ||
      company.averageRating < 0 ||
      company.averageRating > 5)
  )
    return false;

  // Validate array fields
  if (company.certifications && !Array.isArray(company.certifications))
    return false;
  if (company.awards && !Array.isArray(company.awards)) return false;
  if (company.benefits && !Array.isArray(company.benefits)) return false;
  if (company.technologies && !Array.isArray(company.technologies))
    return false;

  // Validar campos personalizados si existen
  if (company.customFields) {
    // Obtener campos personalizados para empresas
    const customFields = CustomField.getFieldsForEntity("company");

    // Validar cada campo
    for (const field of customFields) {
      const value = company.customFields[field.name];
      const validation = CustomField.validateValue(field, value);

      if (!validation.valid) {
        return false; // O podrías acumular errores en un array y devolverlos
      }
    }
  }

  return true;
};

module.exports = {
  companyModel,
  validateCompany,
};
