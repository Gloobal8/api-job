<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <v-card class="pa-6">
          <div class="success-icon mb-6">
            <v-icon color="success" size="64">mdi-check-circle</v-icon>
          </div>
          
          <h1 class="text-h4 mb-4">Payment Successful!</h1>
          
          <p class="text-subtitle-1 mb-6">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
          
          <v-divider class="my-6"></v-divider>
          
          <div v-if="loading" class="text-center py-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          
          <div v-else-if="error" class="text-center py-4">
            <v-alert type="error">
              {{ error }}
            </v-alert>
          </div>
          
          <div v-else>
            <h2 class="text-h5 mb-4">Payment Details</h2>
            
            <v-simple-table>
              <template v-slot:default>
                <tbody>
                  <tr>
                    <td class="font-weight-bold">Payment ID:</td>
                    <td>{{ payment.id }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Amount:</td>
                    <td>${{ payment.amount.toFixed(2) }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Status:</td>
                    <td>
                      <v-chip
                        :color="getStatusColor(payment.status)"
                        small
                      >
                        {{ payment.status }}
                      </v-chip>
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Payment Method:</td>
                    <td>{{ formatPaymentMethod(payment.paymentMethod) }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Date:</td>
                    <td>{{ formatDate(payment.createdAt) }}</td>
                  </tr>
                  <tr v-if="payment.transactionId">
                    <td class="font-weight-bold">Transaction ID:</td>
                    <td>{{ payment.transactionId }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            
            <div v-if="invoice" class="mt-6">
              <h2 class="text-h5 mb-4">Invoice</h2>
              
              <v-simple-table>
                <template v-slot:default>
                  <tbody>
                    <tr>
                      <td class="font-weight-bold">Invoice Number:</td>
                      <td>{{ invoice.invoiceNumber }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Status:</td>
                      <td>
                        <v-chip
                          :color="getInvoiceStatusColor(invoice.status)"
                          small
                        >
                          {{ invoice.status }}
                        </v-chip>
                      </td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Total Amount:</td>
                      <td>${{ invoice.totalAmount.toFixed(2) }}</td>
                    </tr>
                    <tr v-if="invoice.dueDate">
                      <td class="font-weight-bold">Due Date:</td>
                      <td>{{ formatDate(invoice.dueDate) }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              
              <v-btn
                color="primary"
                class="mt-4"
                :to="{ name: 'InvoiceDetailView', params: { id: invoice.id }}"
              >
                View Invoice
              </v-btn>
              
              <v-btn
                color="secondary"
                class="mt-4 ml-2"
                @click="downloadInvoice"
              >
                Download Invoice
              </v-btn>
            </div>
            
            <div class="package-details mt-6">
              <h2 class="text-h5 mb-4">Package Details</h2>
              
              <v-card outlined>
                <v-card-title>
                  {{ packageDetails.name }}
                </v-card-title>
                <v-card-text>
                  <p>{{ packageDetails.description }}</p>
                  
                  <v-list dense>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon color="primary">mdi-calendar</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>Duration: {{ packageDetails.duration }} days</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item v-if="packageDetails.jobLimit">
                      <v-list-item-icon>
                        <v-icon color="primary">mdi-briefcase</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>{{ packageDetails.jobLimit }} Job Postings</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item v-if="packageDetails.featuredJobs">
                      <v-list-item-icon>
                        <v-icon color="primary">mdi-star</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>{{ packageDetails.featuredJobs }} Featured Jobs</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </div>
            
            <div class="text-center mt-8">
              <v-btn
                color="success"
                large
                :to="{ name: 'DashboardView' }"
              >
                Go to Dashboard
              </v-btn>
              
              <v-btn
                color="primary"
                outlined
                large
                class="ml-2"
                :to="{ name: 'InvoicesView' }"
              >
                View All Invoices
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaymentSuccessView',
  data() {
    return {
      paymentId: this.$route.params.id,
      payment: null,
      invoice: null,
      packageDetails: null,
      loading: true,
      error: null
    };
  },
  async created() {
    try {
      // Fetch payment details
      const paymentResponse = await axios.get(`/api/payments/${this.paymentId}`);
      this.payment = paymentResponse.data.data;
      
      // Fetch package details
      const packageResponse = await axios.get(`/api/packages/${this.payment.packageId}`);
      this.packageDetails = packageResponse.data.data;
      
      // Try to fetch invoice if available
      try {
        const invoiceResponse = await axios.get(`/api/invoices/payment/${this.paymentId}`);
        this.invoice = invoiceResponse.data.data;
      } catch (invoiceErr) {
        console.log('Invoice not found or not yet generated');
      }
    } catch (err) {
      this.error = err.response?.data?.message || 'Failed to load payment details';
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    
    formatPaymentMethod(method) {
      const methods = {
        'credit_card': 'Credit Card',
        'paypal': 'PayPal',
        'bank_transfer': 'Bank Transfer',
        'stripe': 'Stripe'
      };
      
      return methods[method] || method;
    },
    
    getStatusColor(status) {
      const colors = {
        'pending': 'warning',
        'completed': 'success',
        'failed': 'error',
        'refunded': 'info',
        'cancelled': 'grey'
      };
      
      return colors[status] || 'primary';
    },
    
    getInvoiceStatusColor(status) {
      const colors = {
        'draft': 'grey',
        'issued': 'primary',
        'paid': 'success',
        'overdue': 'error',
        'cancelled': 'grey'
      };
      
      return colors[status] || 'primary';
    },
    
    async downloadInvoice() {
      if (!this.invoice) return;
      
      try {
        const response = await axios.get(`/api/invoices/${this.invoice.id}/pdf`);
        
        // In a real implementation, this would download a PDF
        // For this example, we'll just show a success message
        
        this.$store.dispatch('showSnackbar', {
          text: 'Invoice download would happen here',
          color: 'info'
        });
      } catch (err) {
        this.$store.dispatch('showSnackbar', {
          text: 'Failed to download invoice',
          color: 'error'
        });
      }
    }
  }
};
</script>

<style scoped>
.success-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.1);
  margin: 0 auto;
}
</style>