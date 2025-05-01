// Job Application Component 

<template>
  <div>
    <div v-if="submitStatus.success" class="success-message">
      Application submitted successfully!
    </div>
    <div v-if="submitStatus.error" class="error-message">
      {{ submitStatus.error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'JobApplication',
  data() {
    return {
      submitStatus: {
        success: false,
        error: null
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        await this.submitApplication();
        this.submitStatus.success = true;
        this.submitStatus.error = null;
      } catch (error) {
        this.submitStatus.success = false;
        this.submitStatus.error = 'Failed to submit application. Please try again.';
      }
    }
  }
}
</script>

<script>
export default {
  name: 'JobApplication',
  methods: {
    async submitApplication() {
      try {
        const formData = new FormData();
        formData.append('resume', this.resumeFile);
        formData.append('name', this.formData.name);
        formData.append('email', this.formData.email);
        formData.append('phone', this.formData.phone);

        const response = await fetch('/api/job-applications', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Submission failed');
        
        return await response.json();
      } catch (error) {
        throw error;
      }
    }
  }
}
</script>

<template>
  <form @submit.prevent="submitApplication" class="job-application-form">
    <div class="form-group">
      <label for="resume">Upload Resume</label>
      <input 
        type="file" 
        id="resume" 
        @change="handleFileUpload" 
        accept=".pdf,.doc,.docx"
        required
      >
    </div>
  </form>
</template>

<script>
export default {
  name: 'JobApplication',
  data() {
    return {
      resumeFile: null
    }
  },
  methods: {
    handleFileUpload(event) {
      this.resumeFile = event.target.files[0];
    }
  }
}
</script>
