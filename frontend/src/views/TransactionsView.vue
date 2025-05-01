<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title class="headline">
            <v-icon large left color="green darken-2">mdi-currency-usd</v-icon>
            Credit Balance
          </v-card-title>
          
          <v-card-text class="text-center">
            <h1 class="display-2 font-weight-bold">{{ userCredits.balance }}</h1>
            <p class="subtitle-1">Available Credits</p>
            
            <v-btn color="primary" class="mt-4" @click="showPurchaseDialog = true">
              <v-icon left>mdi-plus</v-icon> Purchase Credits
            </v-btn>
          </v-card-text>
        </v-card>
        
        <v-card>
          <v-card-title>
            <v-icon left color="blue darken-2">mdi-chart-timeline-variant</v-icon>
            Credit Usage
          </v-card-title>
          
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Job Applications</v-list-item-title>
                  <v-list-item-subtitle>5 credits per application</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Featured Profile</v-list-item-title>
                  <v-list-item-subtitle>20 credits per week</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Direct Messages</v-list-item-title>
                  <v-list-item-subtitle>2 credits per message</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon left color="indigo">mdi-history</v-icon>
            Transaction History
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
              class="mr-4"
            ></v-text-field>
            <v-btn-toggle v-model="filterType" mandatory>
              <v-btn small value="all">All</v-btn>
              <v-btn small value="credit">Credits</v-btn>
              <v-btn small value="debit">Debits</v-btn>
            </v-btn-toggle>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="filteredTransactions"
            :search="search"
            :items-per-page="10"
            :loading="isLoading"
            sort-by="date"
            sort-desc
          >
            <template v-slot:item.amount="{ item }">
              <span :class="{'green--text': item.type === 'credit', 'red--text': item.type === 'debit'}">
                {{ item.type === 'credit' ? '+' : '-' }}{{ item.amount }}
              </span>
            </template>
            
            <template v-slot:item.date="{ item }">
              {{ formatDate(item.date) }}
            </template>
            
            <template v-slot:item.type="{ item }">
              <v-chip
                :color="item.type === 'credit' ? 'green' : 'red'"
                text-color="white"
                small
              >
                {{ item.type === 'credit' ? 'Credit' : 'Debit' }}
              </v-chip>
            </template>
            
            <template v-slot:no-data>
              <v-alert type="info" class="ma-4">
                No transaction history available.
              </v-alert>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Purchase Credits Dialog -->
    <v-dialog v-model="showPurchaseDialog" max-width="500px">
      <v-card>
        <v-card-title>Purchase Credits</v-card-title>
        
        <v-card-text>
          <v-radio-group v-model="selectedPackage" column>
            <v-radio
              v-for="pkg in creditPackages"
              :key="pkg.id"
              :value="pkg.id"
              :label="`${pkg.credits} credits - $${pkg.price} (${pkg.savings}% savings)`"
            ></v-radio>
          </v-radio-group>
          
          <v-divider class="my-4"></v-divider>
          
          <v-form ref="purchaseForm" v-model="valid">
            <v-text-field
              v-model="paymentInfo.cardNumber"
              label="Card Number"
              :rules="[v => !!v || 'Card number is required']"
              required
              mask="#### #### #### ####"
            ></v-text-field>
            
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="paymentInfo.expiry"
                  label="Expiry Date"
                  :rules="[v => !!v || 'Expiry date is required']"
                  required
                  mask="##/##"
                ></v-text-field>
              </v-col>
              
              <v-col cols="6">
                <v-text-field
                  v-model="paymentInfo.cvv"
                  label="CVV"
                  :rules="[v => !!v || 'CVV is required']"
                  required
                  mask="###"
                  type="password"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-text-field
              v-model="paymentInfo.name"
              label="Name on Card"
              :rules="[v => !!v || 'Name is required']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showPurchaseDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="purchaseCredits" :disabled="!valid">Purchase</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Success Dialog -->
    <v-dialog v-model="showSuccessDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">Purchase Successful</v-card-title>
        <v-card-text>
          <p>Your credit purchase was successful!</p>
          <p>{{ getSelectedPackage.credits }} credits have been added to your account.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="showSuccessDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';

export default {
  name: 'TransactionsView',
  data() {
    return {
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Description', value: 'description' },
        { text: 'Type', value: 'type' },
        { text: 'Amount', value: 'amount' },
        { text: 'Reference', value: 'reference' }
      ],
      search: '',
      filterType: 'all',
      showPurchaseDialog: false,
      showSuccessDialog: false,
      valid: true,
      selectedPackage: 1,
      creditPackages: [
        { id: 1, credits: 50, price: 5, savings: 0 },
        { id: 2, credits: 100, price: 9, savings: 10 },
        { id: 3, credits: 200, price: 16, savings: 20 },
        { id: 4, credits: 500, price: 35, savings: 30 }
      ],
      paymentInfo: {
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: ''
      }
    };
  },
  computed: {
    ...mapGetters(['getUserTransactions', 'getUserCredits', 'currentUser']),
    ...mapState(['isLoading']),
    
    userCredits() {
      return this.getUserCredits;
    },
    
    filteredTransactions() {
      if (this.filterType === 'all') {
        return this.getUserTransactions;
      } else {
        return this.getUserTransactions.filter(t => t.type === this.filterType);
      }
    },
    
    getSelectedPackage() {
      return this.creditPackages.find(pkg => pkg.id === this.selectedPackage);
    }
  },
  methods: {
    ...mapActions(['fetchUserTransactions', 'processTransaction']),
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    
    async purchaseCredits() {
      if (this.$refs.purchaseForm.validate()) {
        try {
          const selectedPkg = this.getSelectedPackage;
          
          // Simulate payment processing
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Process transaction
          await this.processTransaction({
            credits: selectedPkg.credits,
            operation: 'add',
            description: `Purchased ${selectedPkg.credits} credits for $${selectedPkg.price}`
          });
          
          this.showPurchaseDialog = false;
          this.showSuccessDialog = true;
          
          // Reset form
          this.paymentInfo = {
            cardNumber: '',
            expiry: '',
            cvv: '',
            name: ''
          };
        } catch (error) {
          console.error('Error purchasing credits:', error);
          // Show error notification
        }
      }
    }
  },
  created() {
    this.fetchUserTransactions();
  }
};
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}
</style>