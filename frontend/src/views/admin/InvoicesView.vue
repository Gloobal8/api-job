<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">My Invoices</h1>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Filter by Status"
          outlined
          dense
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-menu
          ref="dateMenu"
          v-model="dateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateRangeText"
              label="Date Range"
              readonly
              outlined
              dense
              clearable
              append-icon="mdi-calendar"
              v-bind="attrs"
              v-on="on"
              @click:clear="clearDateRange"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="dateRange"
            range
            @change="dateMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Search Invoices"
          outlined
          dense
          append-icon="mdi-magnify"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Invoices List -->
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

    <v-row v-else-if="filteredInvoices.length === 0">
      <v-col cols="12" class="text-center">
        <v-alert type="info">
          No invoices found.
        </v-alert>
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="filteredInvoices"
            :items-per-page="10"
            :footer-props="{
              'items-per-page-options': [5, 10, 15, 20],
            }"
            class="elevation-1"
          >
            <!-- Invoice Number -->
            <template v-slot:item.invoiceNumber="{ item }">
              <router-link
                :to="{ name: 'InvoiceDetailView', params: { id: item.id }}"
                class="text-decoration-none"
              >
                {{ item.invoiceNumber }}
              </router-link>
            </template>

            <!-- Date -->
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <!-- Due Date -->
            <template v-slot:item.dueDate="{ item }">
              {{ item.dueDate ? formatDate(item.dueDate) : 'N/A' }}
            </template>

            <!-- Total Amount -->
            <template v-slot:item.totalAmount="{ item }">
              ${{ item.totalAmount.toFixed(2) }}
            </template>

            <!-- Status -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                small
              >
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Actions -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                small
                :to="{ name: 'InvoiceDetailView', params: { id: item.id }}"
                title="View Invoice"
              >
                <v-icon small>mdi-eye</v-icon>
              </v-btn>

              <v-btn
                icon
                small
                @click="downloadInvoice(item.id)"
                title="Download Invoice"
              >
                <v-icon small>mdi-download</v-icon>
              </v-btn>

              <v-btn
                icon
                small
                @click="emailInvoice(item)"
                title="Email Invoice"
              >
                <v-icon small>mdi-email</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <!-- Summary Stats -->
      <v-row class="mt-6">
        <v-col cols="12" sm="6" md="3">
          <v-card outlined>
            <v-card-text class="text-center">
              <div class="text-overline">Total Invoices</div>
              <div class="text-h4">{{ invoices.length }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card outlined>
            <v-card-text class="text-center">
              <div class="text-overline">Paid Invoices</div>
              <div class="text-h4">{{ paidInvoicesCount }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card outlined>
            <v-card-text class="text-center">
              <div class="text-overline">Pending Amount</div>
              <div class="text-h4">${{ pendingAmount.toFixed(2) }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card outlined>
            <v-card-text class="text-center">
              <div class="text-overline">Total Amount</div>
              <div class="text-h4">${{ totalAmount.toFixed(2) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Email Dialog -->
    <v-dialog v-model="emailDialog" max-width="500px">
      <v-card>
        <v-card-title>
          Send Invoice by Email
        </v-card-title>
        <v-card-text>
          <v-form ref="emailForm" v-model="emailFormValid">
            <v-text-field
              v-model="emailAddress"
              label="Email Address"
              :rules="emailRules"
              required
              outlined
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeEmailDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!emailFormValid"
            :loading="sendingEmail"
            @click="sendEmail"
          >
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'InvoicesView',
  data() {
    return {
      invoices: [],
      loading: true,
      error: null,
      
      // Filters
      search: '',
      statusFilter: null,
      dateRange: [],
      dateMenu: false,
      
      // Email dialog
      emailDialog: false,
      emailFormValid: false,
      emailAddress: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ],
      selectedInvoice: null,
      sendingEmail: false,
      
      // Table headers
      headers: [
        { text: 'Invoice Number', value: 'invoiceNumber' },
        { text: 'Date', value: 'createdAt' },
        { text: 'Due Date', value: 'dueDate' },
        { text: 'Total Amount', value: 'totalAmount' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      
      // Status options
      statusOptions: [
        { text: 'Draft', value: 'draft' },
        { text: 'Issued', value: 'issued' },
        { text: 'Paid', value: 'paid' },
        { text: 'Overdue', value: 'overdue' },
        { text: 'Cancelled', value: 'cancelled' }
      ]
    };
  },
  computed: {
    dateRangeText() {
      if (!this.dateRange || this.dateRange.length === 0) return '';
      if (this.dateRange.length === 1) return this.dateRange[0];
      
      return `${this.dateRange[0]} to ${this.dateRange[1]}`;
    },
    
    filteredInvoices() {
      let filtered = [...this.invoices];
      
      // Apply search filter
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        filtered = filtered.filter(invoice => 
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          (invoice.notes && invoice.notes.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply status filter
      if (this.statusFilter) {
        filtered = filtered.filter(invoice => invoice.status === this.statusFilter);
      }
      
      // Apply date range filter
      if (this.dateRange && this.dateRange.length === 2) {
        const startDate = new Date(this.dateRange[0]);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(this.dateRange[1]);
        endDate.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(invoice => {
          const invoiceDate = new Date(invoice.createdAt);
          return invoiceDate >= startDate && invoiceDate <= endDate;
        });
      }
      
      return filtered;
    },
    
    paidInvoicesCount() {
      return this.invoices.filter(invoice => invoice.status === 'paid').length;
    },
    
    pendingAmount() {
      return this.invoices
        .filter(invoice => invoice.status !== 'paid' && invoice.status !== 'cancelled')
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    },
    
    totalAmount() {
      return this.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    }
  },
  async created() {
    await this.fetchInvoices();
  },
  methods: {
    async fetchInvoices() {
      try {
        const userId = this.$store.state.auth.user.id;
        const response = await axios.get(`/api/invoices/user/${userId}`);
        this.invoices = response.data.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load invoices';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
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
    
    clearDateRange() {
      this.dateRange = [];
    },
    
    async downloadInvoice(invoiceId) {
      try {
        const response = await axios.get(`/api/invoices/${invoiceId}/pdf`);
        
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
    
    emailInvoice(invoice) {
      this.selectedInvoice = invoice;
      this.emailAddress = this.$store.state.auth.user.email || '';
      this.emailDialog = true;
    },
    
    closeEmailDialog() {
      this.emailDialog = false;
      this.selectedInvoice = null;
      this.emailAddress = '';
      this.$refs.emailForm?.reset();
    },
    
    async sendEmail() {
      if (!this.$refs.emailForm.validate()) return;
      
      this.sendingEmail = true;
      
      try {
        await axios.post(`/api/invoices/${this.selectedInvoice.id}/email`, {
          email: this.emailAddress
        });
        
        this.$store.dispatch('showSnackbar', {
          text: `Invoice ${this.selectedInvoice.invoiceNumber} sent to ${this.emailAddress}`,
          color: 'success'
        });
        
        this.closeEmailDialog();
      } catch (err) {
        this.$store.dispatch('showSnackbar', {
          text: err.response?.data?.message || 'Failed to send invoice',
          color: 'error'
        });
      } finally {
        this.sendingEmail = false;
      }
    }
  }
};
</script>

<style scoped>
/* Add any specific styles here */
</style>