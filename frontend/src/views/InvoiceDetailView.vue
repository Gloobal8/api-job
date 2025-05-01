<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn
          text
          color="primary"
          class="mb-4"
          :to="{ name: 'InvoicesView' }"
        >
          <v-icon left>mdi-arrow-left</v-icon>
          Back to Invoices
        </v-btn>
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

    <template v-else>
      <!-- Invoice Header -->
      <v-row>
        <v-col cols="12">
          <v-card class="invoice-header">
            <v-card-title class="d-flex justify-space-between">
              <div>
                <h1 class="text-h4">Invoice</h1>
                <p class="text-subtitle-1 mb-0">#{{ invoice.invoiceNumber }}</p>
              </div>
              <v-chip
                :color="getStatusColor(invoice.status)"
                class="ml-auto"
              >
                {{ invoice.status }}
              </v-chip>
            </v-card-title>
            
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <h3 class="text-subtitle-1 font-weight-bold">Invoice To:</h3>
                  <p class="mb-1">{{ user.name }}</p>
                  <p class="mb-1">{{ user.email }}</p>
                  <p v-if="user.phone" class="mb-1">{{ user.phone }}</p>
                  <p v-if="user.address" class="mb-1">
                    {{ formatAddress(user.address) }}
                  </p>
                </v-col>
                
                <v-col cols="12" md="6" class="text-md-right">
                  <div class="mb-4">
                    <h3 class="text-subtitle-1 font-weight-bold">Invoice Date:</h3>
                    <p>{{ formatDate(invoice.createdAt) }}</p>
                  </div>
                  
                  <div v-if="invoice.dueDate">
                    <h3 class="text-subtitle-1 font-weight-bold">Due Date:</h3>
                    <p :class="{ 'red--text': isOverdue }">
                      {{ formatDate(invoice.dueDate) }}
                      <span v-if="isOverdue">(Overdue)</span>
                    </p>
                  </div>
                </v-col>
              </v-row>
              
              <v-row v-if="invoice.companyName">
                <v-col cols="12">
                  <v-divider class="my-4"></v-divider>
                  <h3 class="text-subtitle-1 font-weight-bold">From:</h3>
                  <div class="d-flex align-center">
                    <v-avatar v-if="invoice.companyLogo" size="40" class="mr-3">
                      <v-img :src="invoice.companyLogo"></v-img>
                    </v-avatar>
                    <div>
                      <p class="mb-1 font-weight-bold">{{ invoice.companyName }}</p>
                      <p v-if="invoice.companyAddress" class="mb-1">
                        {{ invoice.companyAddress }}
                      </p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Invoice Items -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Invoice Items
            </v-card-title>
            <v-card-text>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Item</th>
                      <th class="text-right">Quantity</th>
                      <th class="text-right">Unit Price</th>
                      <th class="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in invoice.items" :key="index">
                      <td>{{ item.description }}</td>
                      <td class="text-right">{{ item.quantity }}</td>
                      <td class="text-right">${{ item.unitPrice.toFixed(2) }}</td>
                      <td class="text-right">${{ item.totalPrice.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>

              <v-divider class="my-4"></v-divider>
              
              <div class="d-flex justify-end">
                <div class="invoice-totals">
                  <div class="d-flex justify-space-between mb-2">
                    <span class="font-weight-medium">Subtotal:</span>
                    <span>${{ invoice.subtotal.toFixed(2) }}</span>
                  </div>
                  
                  <div v-if="invoice.taxRate > 0" class="d-flex justify-space-between mb-2">
                    <span class="font-weight-medium">Tax ({{ invoice.taxRate }}%):</span>
                    <span>${{ invoice.taxAmount.toFixed(2) }}</span>
                  </div>
                  
                  <div v-if="invoice.discountAmount > 0" class="d-flex justify-space-between mb-2">
                    <span class="font-weight-medium">Discount:</span>
                    <span class="success--text">-${{ invoice.discountAmount.toFixed(2) }}</span>
                  </div>
                  
                  <v-divider class="my-2"></v-divider>
                  
                  <div class="d-flex justify-space-between text-h6">
                    <span class="font-weight-bold">Total:</span>
                    <span class="font-weight-bold">${{ invoice.totalAmount.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Notes -->
      <v-row v-if="invoice.notes" class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Notes
            </v-card-title>
            <v-card-text>
              <p>{{ invoice.notes }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Payment Information -->
      <v-row v-if="payment" class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Payment Information
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-2">
                    <span class="font-weight-medium">Payment Method:</span>
                    <span class="ml-2">{{ formatPaymentMethod(payment.paymentMethod) }}</span>
                  </div>
                  
                  <div class="mb-2">
                    <span class="font-weight-medium">Payment Status:</span>
                    <v-chip
                      :color="getPaymentStatusColor(payment.status)"
                      small
                      class="ml-2"
                    >
                      {{ payment.status }}
                    </v-chip>
                  </div>
                  
                  <div v-if="payment.transactionId" class="mb-2">
                    <span class="font-weight-medium">Transaction ID:</span>
                    <span class="ml-2">{{ payment.transactionId }}</span>
                  </div>
                </v-col>
                
                <v-col cols="12" md="6" class="text-md-right">
                  <div class="mb-2">
                    <span class="font-weight-medium">Payment Date:</span>
                    <span class="ml-2">{{ formatDate(payment.createdAt) }}</span>
                  </div>
                  
                  <div class="mb-2">
                    <span class="font-weight-medium">Amount Paid:</span>
                    <span class="ml-2">${{ payment.amount.toFixed(2) }}</span>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Actions -->
      <v-row class="mt-6">
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            color="primary"
            class="mx-2"
            @click="printInvoice"
          >
            <v-icon left>mdi-printer</v-icon>
            Print
          </v-btn>
          
          <v-btn
            color="secondary"
            class="mx-2"
            @click="downloadInvoice"
          >
            <v-icon left>mdi-download</v-icon>
            Download PDF
          </v-btn>
          
          <v-btn
            v-if="invoice.status === 'issued' || invoice.status === 'overdue'"
            color="success"
            class="mx-2"
            @click="payInvoice"
          >
            <v-icon left>mdi-cash</v-icon>
            Pay Now
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'InvoiceDetailView',
  data() {
    return {
      invoiceId: this.$route.params.id,
      invoice: null,
      payment: null,
      user: null,
      loading: true,
      error: null
    };
  },
  computed: {
    isOverdue() {
      if (!this.invoice || !this.invoice.dueDate) return false;
      
      const dueDate = new Date(this.invoice.dueDate);
      const today = new Date();
      
      return dueDate < today && this.invoice.status !== 'paid';
    }
  },
  async created() {
    await this.fetchInvoiceDetails();
  },
  methods: {
    async fetchInvoiceDetails() {
      try {
        // Fetch invoice details
        const invoiceResponse = await axios.get(`/api/invoices/${this.invoiceId}`);
        this.invoice = invoiceResponse.data.data;
        
        // Fetch user details
        const userResponse = await axios.get(`/api/users/${this.invoice.userId}`);
        this.user = userResponse.data.data;
        
        // Fetch payment details if available
        if (this.invoice.paymentId) {
          try {
            const paymentResponse = await axios.get(`/api/payments/${this.invoice.paymentId}`);
            this.payment = paymentResponse.data.data;
          } catch (paymentError) {
            console.log('Payment details not available');
          }
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load invoice details';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    
    formatAddress(address) {
      if (!address) return '';
      
      const parts = [];
      if (address.line1) parts.push(address.line1);
      if (address.line2) parts.push(address.line2);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.zip) parts.push(address.zip);
      if (address.country) parts.push(address.country);
      
      return parts.join(', ');
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
        'draft': 'grey',
        'issued': 'primary',
        'paid': 'success',
        'overdue': 'error',
        'cancelled': 'grey'
      };
      
      return colors[status] || 'primary';
    },
    
    getPaymentStatusColor(status) {
      const colors = {
        'pending': 'warning',
        'completed': 'success',
        'failed': 'error',
        'refunded': 'info',
        'cancelled': 'grey'
      };
      
      return colors[status] || 'primary';
    },
    
    printInvoice() {
      window.print();
    },
    
    async downloadInvoice() {
      try {
        const response = await axios.get(`/api/invoices/${this.invoiceId}/pdf`);
        
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
    },
    
    payInvoice() {
      // Redirect to checkout page if the invoice is not paid
      if (this.invoice.status === 'issued' || this.invoice.status === 'overdue') {
        this.$router.push({
          name: 'CheckoutView',
          params: { id: this.invoice.packageId },
          query: { invoice: this.invoiceId }
        });
      }
    }
  }
};
</script>

<style scoped>
.invoice-totals {
  width: 300px;
}

@media print {
  .v-btn {
    display: none !important;
  }
}
</style>