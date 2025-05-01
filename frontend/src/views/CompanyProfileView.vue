<template>
  <div class="company-profile-view">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
    
    <v-container v-else-if="!company">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-alert type="error">
            Company not found or failed to load.
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
    
    <v-container v-else>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-6">Edit Company Profile</h1>
          
          <v-form ref="form" v-model="valid" @submit.prevent="saveProfile">
            <!-- Basic Information -->
            <v-card class="mb-6">
              <v-card-title>Basic Information</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.name"
                      label="Company Name"
                      required
                      :rules="[v => !!v || 'Company name is required']"
                      outlined
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="profile.industry"
                      :items="industries"
                      label="Industry"
                      outlined
                    ></v-select>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.website"
                      label="Website"
                      outlined
                      :rules="websiteRules"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.email"
                      label="Email"
                      outlined
                      :rules="emailRules"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.phone"
                      label="Phone"
                      outlined
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="profile.size"
                      :items="companySizes"
                      label="Company Size"
                      outlined
                    ></v-select>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.founded"
                      label="Founded Year"
                      type="number"
                      outlined
                      :rules="[
                        v => !v || (v >= 1800 && v <= new Date().getFullYear()) || 'Invalid year'
                      ]"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.location"
                      label="Location"
                      outlined
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-textarea
                      v-model="profile.description"
                      label="Company Description"
                      outlined
                      rows="4"
                      counter="1000"
                      :rules="[
                        v => !v || v.length <= 1000 || 'Description must be less than 1000 characters'
                      ]"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- Company Culture -->
            <v-card class="mb-6">
              <v-card-title>Company Culture</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="profile.culture"
                      label="Company Culture"
                      outlined
                      rows="4"
                      counter="500"
                      :rules="[
                        v => !v || v.length <= 500 || 'Culture description must be less than 500 characters'
                      ]"
                    ></v-textarea>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-textarea
                      v-model="profile.workEnvironment"
                      label="Work Environment"
                      outlined
                      rows="3"
                      counter="300"
                      :rules="[
                        v => !v || v.length <= 300 || 'Work environment must be less than 300 characters'
                      ]"
                    ></v-textarea>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-combobox
                      v-model="profile.benefits"
                      label="Benefits"
                      multiple
                      chips
                      outlined
                      hint="Enter benefits and press Enter"
                      persistent-hint
                    ></v-combobox>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-combobox
                      v-model="profile.technologies"
                      label="Technologies"
                      multiple
                      chips
                      outlined
                      hint="Enter technologies used at your company and press Enter"
                      persistent-hint
                    ></v-combobox>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- Social Links -->
            <v-card class="mb-6">
              <v-card-title>Social Media Links</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.socialLinks.facebook"
                      label="Facebook"
                      outlined
                      prepend-icon="mdi-facebook"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.socialLinks.twitter"
                      label="Twitter"
                      outlined
                      prepend-icon="mdi-twitter"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.socialLinks.linkedin"
                      label="LinkedIn"
                      outlined
                      prepend-icon="mdi-linkedin"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.socialLinks.instagram"
                      label="Instagram"
                      outlined
                      prepend-icon="mdi-instagram"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- Company Media -->
            <v-card class="mb-6">
              <v-card-title>Company Media</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <h3 class="subtitle-1 font-weight-bold mb-2">Company Logo</h3>
                    <div class="d-flex align-center mb-4">
                      <v-avatar size="80" class="mr-4">
                        <v-img :src="profile.logo || 'https://via.placeholder.com/80'"></v-img>
                      </v-avatar>
                      
                      <v-file-input
                        v-model="logoFile"
                        label="Upload Logo"
                        accept="image/*"
                        outlined
                        dense
                        show-size
                        prepend-icon="mdi-camera"
                      ></v-file-input>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <h3 class="subtitle-1 font-weight-bold mb-2">Cover Image</h3>
                    <div class="mb-4">
                      <v-img
                        :src="profile.coverImage || 'https://via.placeholder.com/600x200'"
                        height="150"
                        class="mb-2"
                      ></v-img>
                      
                      <v-file-input
                        v-model="coverFile"
                        label="Upload Cover Image"
                        accept="image/*"
                        outlined
                        dense
                        show-size
                        prepend-icon="mdi-camera"
                      ></v-file-input>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- Key Projects -->
            <v-card class="mb-6">
              <v-card-title>
                Key Projects
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  small
                  @click="addProject"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Add Project
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-row v-if="profile.keyProjects && profile.keyProjects.length > 0">
                  <v-col cols="12" v-for="(project, index) in profile.keyProjects" :key="index">
                    <v-card outlined>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="5">
                            <v-text-field
                              v-model="project.name"
                              label="Project Name"
                              outlined
                              dense
                            ></v-text-field>
                          </v-col>
                          
                          <v-col cols="12" md="6">
                            <v-textarea
                              v-model="project.description"
                              label="Project Description"
                              outlined
                              dense
                              rows="2"
                            ></v-textarea>
                          </v-col>
                          
                          <v-col cols="12" md="1" class="d-flex align-center justify-center">
                            <v-btn
                              icon
                              color="error"
                              @click="removeProject(index)"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                
                <v-row v-else>
                  <v-col cols="12" class="text-center">
                    <p>No key projects added yet.</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- Submit Button -->
            <div class="d-flex justify-end mb-6">
              <v-btn
                color="primary"
                large
                type="submit"
                :loading="saving"
                :disabled="!valid || saving"
              >
                Save Profile
              </v-btn>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CompanyProfileView',
  
  data() {
    return {
      company: null,
      profile: {
        name: '',
        industry: '',
        website: '',
        email: '',
        phone: '',
        size: '',
        founded: null,
        location: '',
        description: '',
        culture: '',
        workEnvironment: '',
        benefits: [],
        technologies: [],
        socialLinks: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        },
        logo: '',
        coverImage: '',
        keyProjects: []
      },
      logoFile: null,
      coverFile: null,
      loading: true,
      saving: false,
      valid: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      
      // Form validation rules
      emailRules: [
        v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
      ],
      websiteRules: [
        v => !v || /^(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(v) || 'Website must be valid'
      ],
      
      // Form options
      industries: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Manufacturing',
        'Retail',
        'Hospitality',
        'Construction',
        'Transportation',
        'Media',
        'Other'
      ],
      companySizes: [
        '1-10',
        '11-50',
        '51-200',
        '201-500',
        '501-1000',
        '1000+'
      ]
    };
  },
  
  computed: {
    ...mapGetters(['currentUser']),
    
    companyId() {
      return this.$route.params.id;
    },
    
    isOwner() {
      return this.currentUser && 
             this.company && 
             this.company.userId === this.currentUser.id;
    }
  },
  
  created() {
    this.fetchCompanyDetails();
  },
  
  methods: {
    async fetchCompanyDetails() {
      this.loading = true;
      
      try {
        const response = await this.$axios.get(`/companies/${this.companyId}`);
        this.company = response.data;
        
        // Initialize profile with company data
        this.profile = {
          name: this.company.name || '',
          industry: this.company.industry || '',
          website: this.company.website || '',
          email: this.company.email || '',
          phone: this.company.phone || '',
          size: this.company.size || '',
          founded: this.company.founded || null,
          location: this.company.location || '',
          description: this.company.description || '',
          culture: this.company.culture || '',
          workEnvironment: this.company.workEnvironment || '',
          benefits: this.company.benefits || [],
          technologies: this.company.technologies || [],
          socialLinks: this.company.socialLinks || {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
          },
          logo: this.company.logo || '',
          coverImage: this.company.coverImage || '',
          keyProjects: this.company.keyProjects || []
        };
      } catch (error) {
        console.error('Error fetching company details:', error);
        this.$store.commit('SET_ERROR', 'Failed to fetch company details');
      } finally {
        this.loading = false;
      }
    },
    
    addProject() {
      if (!this.profile.keyProjects) {
        this.profile.keyProjects = [];
      }
      
      this.profile.keyProjects.push({
        name: '',
        description: ''
      });
    },
    
    removeProject(index) {
      this.profile.keyProjects.splice(index, 1);
    },
    
    async saveProfile() {
      if (!this.$refs.form.validate()) return;
      
      this.saving = true;
      
      try {
        // Handle file uploads if present
        if (this.logoFile) {
          const logoFormData = new FormData();
          logoFormData.append('file', this.logoFile);
          
          const logoResponse = await this.$axios.post('/uploads', logoFormData);
          this.profile.logo = logoResponse.data.url;
        }
        
        if (this.coverFile) {
          const coverFormData = new FormData();
          coverFormData.append('file', this.coverFile);
          
          const coverResponse = await this.$axios.post('/uploads', coverFormData);
          this.profile.coverImage = coverResponse.data.url;
        }
        
        // Update company profile
        const response = await this.$axios.put(`/companies/${this.companyId}/profile`, this.profile);
        
        // Show success message
        this.snackbar = {
          show: true,
          text: 'Company profile updated successfully!',
          color: 'success'
        };
        
        // Update company data
        this.company = response.data;
      } catch (error) {
        console.error('Error updating company profile:', error);
        this.$store.commit('SET_ERROR', 'Failed to update company profile');
        
        this.snackbar = {
          show: true,
          text: 'Failed to update company profile.',
          color: 'error'
        };
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>