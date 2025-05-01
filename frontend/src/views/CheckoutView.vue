<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Checkout</h1>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else>
      <!-- Package Summary -->
      <v-col cols="12" md="8">
        <v-card class="mb-6">
          <v-card-title>
            Package Summary
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h5">{{ packageDetails.name }}</h3>
                <p>{{ packageDetails.description }}</p>
                <p class="text-subtitle-1">
                  Duration: {{ packageDetails.duration }} days
                </p>
                <v-chip
                  v-if="packageDetails.isPopular"
                  color="primary"
                  class="mr-2 mb-2"
                >
                  Popular
                </v-chip>
              </v-col>
              <v-col cols="12" md="6">
                <v-list dense>
                  <v-list-item v-if="packageDetails.jobLimit">
                    <v-list-item-icon>
                      <v-icon color="success">mdi-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ packageDetails.jobLimit }} Job Postings</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item v-if="packageDetails.featuredJobs">
                    <v-list-item-icon>
                      <v-icon color="success">mdi-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ packageDetails.featuredJobs }} Featured Jobs</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item v-if="packageDetails.highlightedJobs">
                    <v-list-item-icon>
                      <v-icon color="success">mdi-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ packageDetails.highlightedJobs }} Highlighted Jobs</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item v-if="packageDetails.cvAccess">
                    <v-list-item-icon>
                      <v-icon color="success">mdi-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>CV Database Access</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item v-for="(feature, i) in packageDetails.features" :key="i">
                    <v-list-item-icon>
                      <v-icon color="success">mdi-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ feature }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Payment Form -->
        <v-card>
          <v-card-title>
            Payment Information
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- Payment Method Selection -->
              <v-radio-group
                v-model="paymentMethod"
                label="Payment Method"
                :rules="[v => !!v || 'Payment method is required']"
                required
              >
                <v-radio
                  v-for="method in paymentMethods"
                  :key="method.value"
                  :label="method.text"
                  :value="method.value"
                ></v-radio>
              </v-radio-group>

              <!-- Credit Card Form (shows only if credit card is selected) -->
              <div v-if="paymentMethod === 'credit_card'" class="mt-4">
                <v-text-field
                  v-model="cardName"
                  label="Name on Card"
                  :rules="[v => !!v || 'Name is required']"
                  required
                  outlined
                ></v-text-field>

                <v-text-field
                  v-model="cardNumber"
                  label="Card Number"
                  :rules="[
                    v => !!v || 'Card number is required',
                    v => /^\d{16}$/.test(v) || 'Card number must be 16 digits'
                  ]"
                  required
                  outlined
                  counter="16"
                ></v-text-field>

                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="expiryDate"
                      label="Expiry Date (MM/YY)"
                      :rules="[
                        v => !!v || 'Expiry date is required',
                        v => /^\d{2}\/\d{2}$/.test(v) || 'Format must be MM/YY'
                      ]"
                      required
                      outlined
                      placeholder="MM/YY"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="cvv"
                      label="CVV"
                      :rules="[
                        v => !!v || 'CVV is required',
                        v => /^\d{3,4}$/.test(v) || 'CVV must be 3-4 digits'
                      ]"
                      required
                      outlined
                      counter="4"
                      type="password"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- PayPal Form (shows only if PayPal is selected) -->
              <div v-if="paymentMethod === 'paypal'" class="mt-4">
                <p>You will be redirected to PayPal to complete your payment.</p>
              </div>

              <!-- Bank Transfer Form (shows only if bank transfer is selected) -->
              <div v-if="paymentMethod === 'bank_transfer'" class="mt-4">
                <v-alert type="info">
                  Please use the following bank details to make your transfer:
                  <br><br>
                  <strong>Bank Name:</strong> Example Bank<br>
                  <strong>Account Name:</strong> Job Board Inc.<br>
                  <strong>Account Number:</strong> 1234567890<br>
                  <strong>Routing Number:</strong> 987654321<br>
                  <strong>Reference:</strong> {{ referenceNumber }}
                  <br><br>
                  Your package will be activated once we confirm your payment.
                </v-alert>
              </div>

              <!-- Coupon Code -->
              <v-row class="mt-4">
                <v-col cols="8">
                  <v-text-field
                    v-model="couponCode"
                    label="Coupon Code"
                    outlined
                    :disabled="couponApplied"
                  ></v-text-field>
                </v-col>
                <v-col cols="4" class="d-flex align-center">
                  <v-btn
                    v-if="!couponApplied"
                    color="primary"
                    @click="applyCoupon"
                    :loading="applyingCoupon"
                    :disabled="!couponCode"
                  >
                    Apply
                  </v-btn>
                  <v-btn
                    v-else
                    text
                    color="error"
                    @click="removeCoupon"
                  >
                    Remove
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Billing Address -->
              <v-checkbox
                v-model="sameAsProfile"
                label="Use profile address for billing"
              ></v-checkbox>

              <div v-if="!sameAsProfile">
                <v-text-field
                  v-model="billingAddress.line1"
                  label="Address Line 1"
                  :rules="[v => !!v || 'Address is required']"
                  required
                  outlined
                ></v-text-field>

                <v-text-field
                  v-model="billingAddress.line2"
                  label="Address Line 2"
                  outlined
                ></v-text-field>

                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="billingAddress.city"
                      label="City"
                      :rules="[v => !!v || 'City is required']"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="billingAddress.state"
                      label="State/Province"
                      :rules="[v => !!v || 'State is required']"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="billingAddress.zip"
                      label="ZIP/Postal Code"
                      :rules="[v => !!v || 'ZIP code is required']"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="billingAddress.country"
                      label="Country"
                      :rules="[v => !!v || 'Country is required']"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- Terms and Conditions -->
              <v-checkbox
                v-model="termsAccepted"
                label="I agree to the terms and conditions"
                :rules="[v => !!v || 'You must agree to continue']"
                required
              ></v-checkbox>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Order Summary -->
      <v-col cols="12" md="4">
        <v-card sticky>
          <v-card-title>
            Order Summary
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Package Price</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  ${{ packageDetails.price.toFixed(2) }}
                </v-list-item-action>
              </v-list-item>

              <v-list-item v-if="couponApplied">
                <v-list-item-content>
                  <v-list-item-title class="success--text">Coupon Discount</v-list-item-title>
                  <v-list-item-subtitle>{{ couponDetails.code }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action class="success--text">
                  -${{ discountAmount.toFixed(2) }}
                </v-list-item-action>
              </v-list-item>

              <v-divider class="my-2"></v-divider>

              <v-list-item class="font-weight-bold">
                <v-list-item-content>
                  <v-list-item-title>Total</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action class="text-h5">
                  ${{ finalAmount.toFixed(2) }}
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <v-btn
              color="primary"
              block
              x-large
              class="mt-6"
              :loading="processing"
              :disabled="!valid || !termsAccepted || processing"
              @click="processPayment"
            >
              Complete Payment
            </v-btn>

            <p class="text-caption text-center mt-2">
              Your payment information is secure and encrypted.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CheckoutView',
  data() {
    return {
      packageId: this.$route.params.id,
      packageDetails: {},
      loading: true,
      error: null,
      valid: false,
      processing: false,
      
      // Payment form
      paymentMethod: 'credit_card',
      paymentMethods: [
        { text: 'Credit Card', value: 'credit_card' },
        { text: 'PayPal', value: 'paypal' },
        { text: 'Bank Transfer', value: 'bank_transfer' }
      ],
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      
      // Coupon
      couponCode: '',
      couponApplied: false,
      couponDetails: null,
      applyingCoupon: false,
      discountAmount: 0,
      
      // Billing
      sameAsProfile: true,
      billingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      
      // Terms
      termsAccepted: false,
      
      // Reference number for bank transfers
      referenceNumber: `REF-${Date.now().toString().substr(-8)}`
    };
  },
  computed: {
    finalAmount() {
      if (!this.packageDetails.price) return 0;
      return this.couponApplied 
        ? this.packageDetails.price - this.discountAmount
        : this.packageDetails.price;
    }
  },
  async created() {
    try {
      // Fetch package details
      const response = await axios.get(`/api/packages/${this.packageId}`);
      this.packageDetails = response.data.data;
      
      // Fetch user profile for billing address
      if (this.sameAsProfile) {
        const userResponse = await axios.get('/api/users/profile');
        const userData = userResponse.data.data;
        
        if (userData.address) {
          this.billingAddress = {
            line1: userData.address.line1 || '',
            line2: userData.address.line2 || '',
            city: userData.address.city || '',
            state: userData.address.state || '',
            zip: userData.address.zip || '',
            country: userData.address.country || ''
          };
        }
      }
    } catch (err) {
      this.error = err.response?.data?.message || 'Failed to load package details';
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async applyCoupon() {
      if (!this.couponCode) return;
      
      this.applyingCoupon = true;
      
      try {
        const response = await axios.get(`/api/coupons/apply/${this.couponCode}`, {
          params: {
            amount: this.packageDetails.price,
            packageId: this.packageId
          }
        });
        
        const result = response.data;
        
        if (result.success) {
          this.couponApplied = true;
          this.couponDetails = result.data.coupon;
          this.discountAmount = result.data.discountAmount;
          
          this.$store.dispatch('showSnackbar', {
            text: `Coupon applied! You saved $${this.discountAmount.toFixed(2)}`,
            color: 'success'
          });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to apply coupon';
        this.$store.dispatch('showSnackbar', {
          text: errorMessage,
          color: 'error'
        });
      } finally {
        this.applyingCoupon = false;
      }
    },
    
    removeCoupon() {
      this.couponApplied = false;
      this.couponDetails = null;
      this.discountAmount = 0;
      this.couponCode = '';
      
      this.$store.dispatch('showSnackbar', {
        text: 'Coupon removed',
        color: 'info'
      });
    },
    
    async processPayment() {
      if (!this.$refs.form.validate()) return;
      
      this.processing = true;
      
      try {
        // Prepare payment data
        const paymentData = {
          userId: this.$store.state.auth.user.id,
          packageId: this.packageId,
          amount: this.finalAmount,
          paymentMethod: this.paymentMethod,
          metadata: {
            couponCode: this.couponApplied ? this.couponCode : null,
            billingAddress: this.sameAsProfile ? null : this.billingAddress
          }
        };
        
        // Add payment method specific data
        if (this.paymentMethod === 'credit_card') {
          // In a real app, you would use a secure payment processor
          // This is just for demonstration
          paymentData.metadata.card = {
            nameOnCard: this.cardName,
            lastFour: this.cardNumber.substr(-4),
            expiryDate: this.expiryDate
          };
        } else if (this.paymentMethod === 'bank_transfer') {
          paymentData.metadata.reference = this.referenceNumber;
        }
        
        // Process the payment
        const response = await axios.post('/api/payments/process', paymentData);
        
        if (response.data.success) {
          // Record coupon usage if applied
          if (this.couponApplied) {
            await axios.post(`/api/coupons/${this.couponCode}/record-usage`);
          }
          
          // Redirect to success page
          this.$router.push({
            name: 'PaymentSuccessView',
            params: { 
              id: response.data.data.id 
            }
          });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Payment processing failed';
        this.$store.dispatch('showSnackbar', {
          text: errorMessage,
          color: 'error'
        });
      } finally {
        this.processing = false;
      }
    }
  }
};
</script>

<style scoped>
/* Add any specific styles here */
</style>