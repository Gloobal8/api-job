<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          
          <v-card-text>
            <v-alert
              v-if="error"
              type="error"
              dismissible
              @input="error = null"
            >
              {{ error }}
            </v-alert>
            
            <v-form ref="form" v-model="valid" @submit.prevent="login" class="mt-4">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Password"
                prepend-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :type="showPassword ? 'text' : 'password'"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="d-flex justify-center">
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!valid || loading"
              @click="login"
            >
              Login
            </v-btn>
          </v-card-actions>
          
          <v-card-text class="text-center">
            Don't have an account?
            <v-btn text color="primary" to="/register">
              Register
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      valid: false,
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null,
      emailRules: [
        v => !!v || 'Email is required',
        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters'
      ]
    }
  },
  methods: {
    login() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.error = null;
        
        this.$store.dispatch('login', {
          email: this.email,
          password: this.password
        })
          .then((res) => {
            // Redirect to dashboard or previous page
            if (res.data.status) {
              this.error = null;
              const redirectPath = this.$route.query.redirect || '/dashboard';
              this.$router.push(redirectPath);
            } else {
              this.error = res.data.message
            }
            
            console.log({
              archive: 'LoginView.vue',
              data: res,
            })
          })
          .catch(error => {
            this.error = error.response?.data?.message || 'Login failed. Please try again.';
          })
          .finally(() => {
            this.loading = false;
          });
      }
    }
  }
}
</script>