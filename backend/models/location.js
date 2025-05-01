// Location model definition (Country, State, City)

const locationModel = {
  // Required fields
  id: String,
  name: String,
  type: String, // country, state, city
  createdAt: String,
  updatedAt: String,
  
  // Hierarchy fields
  countryId: String, // For state and city
  stateId: String, // For city
  
  // Optional fields
  code: String, // Country or state code
  latitude: Number,
  longitude: Number,
  flag: String, // For countries
  
  // Meta fields
  isActive: Boolean,
  order: Number,
  jobCount: Number // Number of jobs in this location
};

const validateLocation = (location) => {
  // Basic validation
  if (!location.name || !location.type) {
    return false;
  }
  
  // Check parent references
  if (location.type === 'state' && !location.countryId) {
    return false;
  }
  
  if (location.type === 'city' && (!location.countryId || !location.stateId)) {
    return false;
  }
  
  return true;
};

module.exports = {
  locationModel,
  validateLocation
};