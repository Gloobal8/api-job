<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">
            <v-icon large left color="primary">mdi-school</v-icon>
            Education
          </v-card-title>
          
          <v-card-text>
            <v-btn color="primary" @click="showAddForm = true" class="mb-4">
              <v-icon left>mdi-plus</v-icon> Add Education
            </v-btn>
            
            <v-data-table
              :headers="headers"
              :items="education"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.actions="{ item }">
                <v-icon small class="mr-2" @click="editEducation(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small @click="confirmDelete(item)">
                  mdi-delete
                </v-icon>
              </template>
              
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.startDate) }} - {{ item.currentlyStudying ? 'Present' : formatDate(item.endDate) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Education Form Dialog -->
    <v-dialog v-model="showAddForm" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editMode ? 'Edit Education' : 'Add Education' }}</span>
        </v-card-title>
        
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="formData.institution"
              label="Institution/School"
              :rules="[v => !!v || 'Institution is required']"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="formData.degree"
              label="Degree"
              :rules="[v => !!v || 'Degree is required']"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="formData.fieldOfStudy"
              label="Field of Study"
              :rules="[v => !!v || 'Field of study is required']"
              required
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
                  :disabled="formData.currentlyStudying"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formData.endDate"
                      label="End Date"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :disabled="formData.currentlyStudying"
                      :rules="[v => (!!v || formData.currentlyStudying) || 'End date is required']"
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
              v-model="formData.currentlyStudying"
              label="I am currently studying here"
            ></v-checkbox>
            
            <v-textarea
              v-model="formData.description"
              label="Description"
              rows="3"
            ></v-textarea>
            
            <!-- Certifications Section -->
            <v-subheader>Certifications</v-subheader>
            <v-btn small color="primary" class="mb-2" @click="addCertification">
              <v-icon small left>mdi-plus</v-icon> Add Certification
            </v-btn>
            
            <v-card outlined class="mb-4" v-for="(cert, index) in formData.certifications" :key="'cert-'+index">
              <v-card-text>
                <v-row dense>
                  <v-col cols="10">
                    <v-text-field
                      v-model="cert.name"
                      label="Certification Name"
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-btn icon color="error" @click="removeCertification(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-text-field
                  v-model="cert.issuer"
                  label="Issuing Organization"
                  dense
                ></v-text-field>
                <v-row>
                  <v-col cols="6">
                    <v-menu
                      v-model="certDateMenus[index]"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="cert.date"
                          label="Issue Date"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          dense
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="cert.date"
                        @input="certDateMenus[index] = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="6">
                    <v-menu
                      v-model="certExpiryMenus[index]"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="cert.expiryDate"
                          label="Expiry Date (optional)"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          dense
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="cert.expiryDate"
                        @input="certExpiryMenus[index] = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- Courses Section -->
            <v-subheader>Courses</v-subheader>
            <v-btn small color="primary" class="mb-2" @click="addCourse">
              <v-icon small left>mdi-plus</v-icon> Add Course
            </v-btn>
            
            <v-card outlined class="mb-4" v-for="(course, index) in formData.courses" :key="'course-'+index">
              <v-card-text>
                <v-row dense>
                  <v-col cols="10">
                    <v-text-field
                      v-model="course.name"
                      label="Course Name"
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-btn icon color="error" @click="removeCourse(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-text-field
                  v-model="course.provider"
                  label="Course Provider"
                  dense
                ></v-text-field>
                <v-menu
                  v-model="courseCompletionMenus[index]"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="course.completionDate"
                      label="Completion Date"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      dense
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="course.completionDate"
                    @input="courseCompletionMenus[index] = false"
                  ></v-date-picker>
                </v-menu>
              </v-card-text>
            </v-card>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showAddForm = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveEducation" :disabled="!valid">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this education record?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="red darken-1" text @click="deleteEducation">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'ProfileEducationView',
  data() {
    return {
      headers: [
        { text: 'Institution', value: 'institution' },
        { text: 'Degree', value: 'degree' },
        { text: 'Field of Study', value: 'fieldOfStudy' },
        { text: 'Date', value: 'date' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      showAddForm: false,
      showDeleteDialog: false,
      editMode: false,
      valid: true,
      formData: {
        id: null,
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        currentlyStudying: false,
        description: '',
        certifications: [],
        courses: []
      },
      selectedItem: null,
      startDateMenu: false,
      endDateMenu: false,
      certDateMenus: [],
      certExpiryMenus: [],
      courseCompletionMenus: []
    };
  },
  computed: {
    ...mapGetters(['currentUser', 'getUserEducation']),
    education() {
      return this.getUserEducation;
    }
  },
  methods: {
    ...mapActions(['fetchUserEducation', 'updateUserEducation']),
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    
    editEducation(item) {
      this.editMode = true;
      this.selectedItem = item;
      this.formData = { ...item };
      
      // Initialize menu arrays
      this.certDateMenus = Array(this.formData.certifications?.length || 0).fill(false);
      this.certExpiryMenus = Array(this.formData.certifications?.length || 0).fill(false);
      this.courseCompletionMenus = Array(this.formData.courses?.length || 0).fill(false);
      
      this.showAddForm = true;
    },
    
    confirmDelete(item) {
      this.selectedItem = item;
      this.showDeleteDialog = true;
    },
    
    resetForm() {
      this.formData = {
        id: null,
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        currentlyStudying: false,
        description: '',
        certifications: [],
        courses: []
      };
      this.editMode = false;
      this.selectedItem = null;
      this.$refs.form.resetValidation();
    },
    
    async saveEducation() {
      if (this.$refs.form.validate()) {
        try {
          // Prepare education data
          const educationData = { ...this.formData };
          
          // Get current education list
          let updatedEducation = [...this.education];
          
          if (this.editMode) {
            // Update existing record
            const index = updatedEducation.findIndex(e => e.id === this.selectedItem.id);
            if (index !== -1) {
              updatedEducation[index] = educationData;
            }
          } else {
            // Add new record with generated ID
            educationData.id = Date.now().toString();
            updatedEducation.push(educationData);
          }
          
          // Save to store/API
          await this.updateUserEducation(updatedEducation);
          
          this.showAddForm = false;
          this.resetForm();
        } catch (error) {
          console.error('Error saving education:', error);
          // Show error notification
        }
      }
    },
    
    async deleteEducation() {
      try {
        // Filter out the selected item
        const updatedEducation = this.education.filter(e => e.id !== this.selectedItem.id);
        
        // Save to store/API
        await this.updateUserEducation(updatedEducation);
        
        this.showDeleteDialog = false;
        this.selectedItem = null;
      } catch (error) {
        console.error('Error deleting education:', error);
        // Show error notification
      }
    },
    
    addCertification() {
      if (!this.formData.certifications) {
        this.formData.certifications = [];
      }
      
      this.formData.certifications.push({
        name: '',
        issuer: '',
        date: '',
        expiryDate: ''
      });
      
      this.certDateMenus.push(false);
      this.certExpiryMenus.push(false);
    },
    
    removeCertification(index) {
      this.formData.certifications.splice(index, 1);
      this.certDateMenus.splice(index, 1);
      this.certExpiryMenus.splice(index, 1);
    },
    
    addCourse() {
      if (!this.formData.courses) {
        this.formData.courses = [];
      }
      
      this.formData.courses.push({
        name: '',
        provider: '',
        completionDate: ''
      });
      
      this.courseCompletionMenus.push(false);
    },
    
    removeCourse(index) {
      this.formData.courses.splice(index, 1);
      this.courseCompletionMenus.splice(index, 1);
    }
  },
  created() {
    this.fetchUserEducation();
  }
};
</script>