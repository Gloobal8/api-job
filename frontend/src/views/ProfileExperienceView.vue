<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">
            <v-icon large left color="primary">mdi-briefcase</v-icon>
            Work Experience
          </v-card-title>
          
          <v-card-text>
            <v-btn color="primary" @click="showAddForm = true" class="mb-4">
              <v-icon left>mdi-plus</v-icon> Add Experience
            </v-btn>
            
            <v-data-table
              :headers="headers"
              :items="experience"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.actions="{ item }">
                <v-icon small class="mr-2" @click="editExperience(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small @click="confirmDelete(item)">
                  mdi-delete
                </v-icon>
              </template>
              
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.startDate) }} - {{ item.currentlyWorking ? 'Present' : formatDate(item.endDate) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Experience Form Dialog -->
    <v-dialog v-model="showAddForm" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editMode ? 'Edit Experience' : 'Add Experience' }}</span>
        </v-card-title>
        
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="formData.company"
              label="Company"
              :rules="[v => !!v || 'Company is required']"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="formData.position"
              label="Position"
              :rules="[v => !!v || 'Position is required']"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="formData.location"
              label="Location"
            ></v-text-field>
            
            <v-row>
              <v-col cols="6">
                <v-menu
                  v-model="startDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formData.startDate"
                      label="Start Date"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[v => !!v || 'Start date is required']"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formData.startDate"
                    @input="startDateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              
              <v-col cols="6">
                <v-menu
                  v-model="endDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  :disabled="formData.currentlyWorking"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formData.endDate"
                      label="End Date"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :disabled="formData.currentlyWorking"
                      :rules="[v => (!!v || formData.currentlyWorking) || 'End date is required']"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formData.endDate"
                    @input="endDateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            
            <v-checkbox
              v-model="formData.currentlyWorking"
              label="I am currently working here"
            ></v-checkbox>
            
            <v-textarea
              v-model="formData.description"
              label="Description"
              rows="3"
            ></v-textarea>
            
            <!-- Achievements Section -->
            <v-subheader>Achievements</v-subheader>
            <v-row>
              <v-col cols="10">
                <v-text-field
                  v-model="newAchievement"
                  label="Add Achievement"
                  @keyup.enter="addAchievement"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-btn color="primary" @click="addAchievement" :disabled="!newAchievement">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            
            <v-chip-group column>
              <v-chip
                v-for="(achievement, index) in formData.achievements"
                :key="index"
                close
                @click:close="removeAchievement(index)"
              >
                {{ achievement }}
              </v-chip>
            </v-chip-group>
            
            <!-- Technologies Section -->
            <v-subheader class="mt-4">Technologies Used</v-subheader>
            <v-row>
              <v-col cols="10">
                <v-text-field
                  v-model="newTechnology"
                  label="Add Technology"
                  @keyup.enter="addTechnology"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-btn color="primary" @click="addTechnology" :disabled="!newTechnology">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            
            <v-chip-group column>
              <v-chip
                v-for="(tech, index) in formData.technologies"
                :key="index"
                close
                color="primary"
                text-color="white"
                @click:close="removeTechnology(index)"
              >
                {{ tech }}
              </v-chip>
            </v-chip-group>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showAddForm = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveExperience" :disabled="!valid">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this experience record?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="red darken-1" text @click="deleteExperience">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'ProfileExperienceView',
  data() {
    return {
      headers: [
        { text: 'Company', value: 'company' },
        { text: 'Position', value: 'position' },
        { text: 'Location', value: 'location' },
        { text: 'Date', value: 'date' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      showAddForm: false,
      showDeleteDialog: false,
      editMode: false,
      valid: true,
      formData: {
        id: null,
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
        achievements: [],
        technologies: []
      },
      selectedItem: null,
      startDateMenu: false,
      endDateMenu: false,
      newAchievement: '',
      newTechnology: ''
    };
  },
  computed: {
    ...mapGetters(['currentUser', 'getUserExperience']),
    experience() {
      return this.getUserExperience;
    }
  },
  methods: {
    ...mapActions(['fetchUserExperience', 'updateUserExperience']),
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    
    editExperience(item) {
      this.editMode = true;
      this.selectedItem = item;
      this.formData = { ...item };
      
      // Initialize arrays if not present
      if (!this.formData.achievements) this.formData.achievements = [];
      if (!this.formData.technologies) this.formData.technologies = [];
      
      this.showAddForm = true;
    },
    
    confirmDelete(item) {
      this.selectedItem = item;
      this.showDeleteDialog = true;
    },
    
    resetForm() {
      this.formData = {
        id: null,
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
        achievements: [],
        technologies: []
      };
      this.editMode = false;
      this.selectedItem = null;
      this.newAchievement = '';
      this.newTechnology = '';
      this.$refs.form.resetValidation();
    },
    
    async saveExperience() {
      if (this.$refs.form.validate()) {
        try {
          // Prepare experience data
          const experienceData = { ...this.formData };
          
          // Get current experience list
          let updatedExperience = [...this.experience];
          
          if (this.editMode) {
            // Update existing record
            const index = updatedExperience.findIndex(e => e.id === this.selectedItem.id);
            if (index !== -1) {
              updatedExperience[index] = experienceData;
            }
          } else {
            // Add new record with generated ID
            experienceData.id = Date.now().toString();
            updatedExperience.push(experienceData);
          }
          
          // Save to store/API
          await this.updateUserExperience(updatedExperience);
          
          this.showAddForm = false;
          this.resetForm();
        } catch (error) {
          console.error('Error saving experience:', error);
          // Show error notification
        }
      }
    },
    
    async deleteExperience() {
      try {
        // Filter out the selected item
        const updatedExperience = this.experience.filter(e => e.id !== this.selectedItem.id);
        
        // Save to store/API
        await this.updateUserExperience(updatedExperience);
        
        this.showDeleteDialog = false;
        this.selectedItem = null;
      } catch (error) {
        console.error('Error deleting experience:', error);
        // Show error notification
      }
    },
    
    addAchievement() {
      if (this.newAchievement.trim()) {
        if (!this.formData.achievements) {
          this.formData.achievements = [];
        }
        this.formData.achievements.push(this.newAchievement.trim());
        this.newAchievement = '';
      }
    },
    
    removeAchievement(index) {
      this.formData.achievements.splice(index, 1);
    },
    
    addTechnology() {
      if (this.newTechnology.trim()) {
        if (!this.formData.technologies) {
          this.formData.technologies = [];
        }
        this.formData.technologies.push(this.newTechnology.trim());
        this.newTechnology = '';
      }
    },
    
    removeTechnology(index) {
      this.formData.technologies.splice(index, 1);
    }
  },
  created() {
    this.fetchUserExperience();
  }
};
</script>