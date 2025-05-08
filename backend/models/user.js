// User model definition for candidate/employer profiles
const dbClient = require("../config/db");
const userModel = {
  // Required fields
  id: String,
  email: String,
  password: String, // Hashed password
  role: String, // admin, employer, candidate
  createdAt: String,
  updatedAt: String,

  // Common profile fields
  firstName: String,
  lastName: String,
  avatar: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,

  // Candidate specific fields
  resume: String, // Path to resume file
  skills: [String],
  jobTitle: String,
  experience: String,
  education: [
    {
      degree: String,
      institution: String,
      fieldOfStudy: String,
      startDate: String,
      endDate: String,
      description: String,
      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
          expiryDate: String,
        },
      ],
      courses: [
        {
          name: String,
          provider: String,
          completionDate: String,
        },
      ],
    },
  ],
  workHistory: [
    {
      position: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      currentlyWorking: Boolean,
      description: String,
      achievements: [String],
      technologies: [String],
    },
  ],

  // Employer specific fields
  companyId: String, // If the user is associated with a company

  // Meta fields
  isVerified: Boolean,
  isActive: Boolean,
  lastLogin: String,
  bio: String,
  profileCompletionPercentage: Number,
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    github: String,
    website: String,
  },

  // Credits system
  credits: {
    balance: Number,
    history: [
      {
        amount: Number,
        type: String, // credit or debit
        description: String,
        date: String,
      },
    ],
  },

  // Añadir soporte para campos personalizados
  customFields: {},
};

const validateUser = (user) => {
  // Basic validation
  if (!user.email || !user.password || !user.role) {
    return false;
  }

  // Credits validation
  if (
    user.credits &&
    (typeof user.credits.balance !== "number" ||
      !Array.isArray(user.credits.history))
  ) {
    return false;
  }

  // Education validation
  if (user.education && !Array.isArray(user.education)) {
    return false;
  }

  // Work history validation
  if (user.workHistory && !Array.isArray(user.workHistory)) {
    return false;
  }

  // Validar campos personalizados si existen
  if (user.customFields) {
    // Obtener campos personalizados para usuarios
    const customFields = CustomField.getFieldsForEntity("user");

    // Validar cada campo
    for (const field of customFields) {
      const value = user.customFields[field.name];
      const validation = CustomField.validateValue(field, value);

      if (!validation.valid) {
        return false; // O podrías acumular errores en un array y devolverlos
      }
    }
  }

  return true;
};


class User {
  static async getByEmail(email) {
    try {
      const usersCollection = dbClient.db.collection('users');
      const existingUser = await usersCollection.findOne({ email });

      if (!existingUser) {
        return {
            status: false,
            message: 'User not found!'
        };
      }

      const result = await usersCollection.updateOne(
        { email },
        { $set: { isAuthenticated: true } }
      );
      console.log({
        type: 'result',
        data: result
      })

    if (result.modifiedCount === 1) {
        // Optionally, fetch the updated user to return it
        const updatedUser = await usersCollection.findOne({ email });
        return {
            status: true,
            message: 'Verification Successfully!',
            updatedUser
        };
      } else {
          return {
              status: false,
              message: 'User could not be updated!'
          };
      }

    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error; // Rethrow the error for further handling
    }
  }
  static async getAllUsers() {
    try {
        const usersCollection = dbClient.db.collection('users');
        const users = await usersCollection.find({}).toArray();
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}
}

module.exports = {
  userModel,
  validateUser,
  User
};
