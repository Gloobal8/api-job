<template>
  <div class="order-detail-view">
    <!-- Cabecera con navegación y acciones -->
    <div class="d-flex align-center mb-4">
      <v-btn icon variant="text" :to="{ name: 'OrdersView' }" class="mr-2">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div class="d-flex flex-column">
        <div class="text-caption text-uppercase">Orders</div>
        <div class="d-flex align-center">
          <div class="text-h5 font-weight-medium">#5 KHWLILZLL</div>
          <div class="ml-3 text-caption">from John DOE</div>
          <div class="ml-3 price-tag">€27.30</div>
          <div class="ml-3 text-caption">09/08/2023 at 07:07:31</div>
        </div>
      </div>
      <v-spacer></v-spacer>
      <v-btn outlined class="mr-2">
        <v-icon left size="small">mdi-rocket-launch-outline</v-icon>
        Boost sales
      </v-btn>
      <v-btn outlined> Help </v-btn>
    </div>

    <!-- Estado del pedido y acciones -->
    <div class="d-flex align-center mb-4">
      <v-select
        v-model="orderStatus"
        :items="statusOptions"
        label="Awaiting bank wire payment"
        variant="outlined"
        density="comfortable"
        class="status-select mr-2"
        hide-details
      ></v-select>
      <v-btn variant="text" class="update-status-btn mr-2">
        Update status
      </v-btn>
      <v-btn prepend-icon="mdi-printer-outline"> Print order </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon variant="text" class="mr-1">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn icon variant="text">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- Contenido principal -->
    <div class="order-content">
      <v-row>
        <!-- Columna izquierda: Información del cliente -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="d-flex align-center">
              <div>Customer</div>
              <v-spacer></v-spacer>
              <v-btn variant="text" size="small" class="text-caption">
                View full details
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar color="primary" size="32" class="mr-3">
                  <v-icon color="white">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">Mr. John DOE</div>
                  <div class="text-caption">#2</div>
                </div>
              </div>
              <div class="text-caption mb-2 text-uppercase font-weight-medium">
                Customer
              </div>

              <div class="detail-section mb-4">
                <div class="d-flex justify-space-between mb-2">
                  <div class="text-caption">Email:</div>
                  <div class="text-caption">pub@prestashop.com</div>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <div class="text-caption">Validated orders placed:</div>
                  <div class="text-chip">3</div>
                </div>
                <div class="d-flex justify-space-between">
                  <div class="text-caption">Account registered:</div>
                  <div class="text-caption">09/08/2023 07:07:23</div>
                </div>
              </div>

              <div class="address-section mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-caption text-uppercase font-weight-medium">
                    Shipping address
                  </div>
                  <v-btn icon size="x-small" variant="text">
                    <v-icon size="small">mdi-pencil</v-icon>
                  </v-btn>
                </div>
                <div class="text-caption address-details">
                  John DOE<br />
                  My Company<br />
                  16, Main Street 2nd floor<br />
                  Miami, Florida 33133<br />
                  United States<br />
                  0102030405
                </div>
              </div>

              <div class="address-section">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-caption text-uppercase font-weight-medium">
                    Invoice address
                  </div>
                  <v-btn icon size="x-small" variant="text">
                    <v-icon size="small">mdi-pencil</v-icon>
                  </v-btn>
                </div>
                <div class="text-caption address-details">
                  John DOE<br />
                  My Company<br />
                  16, Main Street 2nd floor<br />
                  Miami, Florida 33133<br />
                  United States<br />
                  0102030405
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>
              <div>Private note</div>
            </v-card-title>
            <v-card-text>
              <v-textarea
                placeholder="Add a note on this order. It will only be visible to you."
                variant="outlined"
                rows="4"
                hide-details
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Columna derecha: Productos, envío, mensajes, etc. -->
        <v-col cols="12" md="8">
          <v-card class="mb-4">
            <v-card-title>Products (1)</v-card-title>
            <v-card-text class="pa-0">
              <v-table class="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th class="text-right">Base price</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Available</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="d-flex">
                        <v-img
                          src="https://via.placeholder.com/50"
                          width="50"
                          height="50"
                          class="mr-3 product-image"
                        ></v-img>
                        <div>
                          <div>Brown bear cushion Color : Black</div>
                          <div class="text-caption">
                            Reference number: demo_16
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-right">€18.90</td>
                    <td class="text-right">1</td>
                    <td class="text-right">300</td>
                    <td class="text-right">€18.90</td>
                    <td class="text-center">
                      <v-btn icon size="small" variant="text">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon size="small" variant="text">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="text-right font-weight-medium">
                      Items per page:
                    </td>
                    <td colspan="2">
                      <div class="d-flex justify-end">
                        <v-text-field
                          model-value="8"
                          type="number"
                          variant="outlined"
                          density="compact"
                          hide-details
                          style="width: 60px"
                          class="mr-2"
                        ></v-text-field>
                        <v-btn-group>
                          <v-btn size="small" variant="text">
                            <v-icon>mdi-chevron-left</v-icon>
                          </v-btn>
                          <v-btn size="small" variant="text">
                            <v-icon>mdi-chevron-right</v-icon>
                          </v-btn>
                        </v-btn-group>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </v-table>

              <div class="d-flex pa-4 justify-space-between align-center">
                <div>
                  <v-btn prepend-icon="mdi-plus" color="primary" class="mr-2">
                    Add a product
                  </v-btn>
                  <v-btn prepend-icon="mdi-tag-outline" variant="text">
                    Add a discount
                  </v-btn>
                </div>
                <div class="totals-section">
                  <div class="d-flex justify-space-between mb-1">
                    <div class="text-subtitle-2">Products:</div>
                    <div class="text-subtitle-2">€18.90</div>
                  </div>
                  <div class="d-flex justify-space-between mb-1">
                    <div class="text-subtitle-2">Shipping:</div>
                    <div class="text-subtitle-2">€8.40</div>
                  </div>
                  <div class="d-flex justify-space-between total-row">
                    <div class="text-subtitle-1 font-weight-bold">Total</div>
                    <div class="text-subtitle-1 font-weight-bold">€27.30</div>
                  </div>
                  <div class="d-flex justify-end text-caption text-grey">
                    Tax included. Merchandise returns are disabled
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-tabs v-model="activeTab" bg-color="background">
            <v-tab value="status">
              <v-icon left size="small">mdi-information-outline</v-icon>
              Status (1)
            </v-tab>
            <v-tab value="documents">
              <v-icon left size="small">mdi-file-document-outline</v-icon>
              Documents (0)
            </v-tab>
            <v-tab value="carriers">
              <v-icon left size="small">mdi-truck-outline</v-icon>
              Carriers (1)
            </v-tab>
          </v-tabs>

          <v-card class="mt-2">
            <v-window v-model="activeTab">
              <v-window-item value="status">
                <v-list>
                  <v-list-item>
                    <div
                      class="d-flex justify-space-between align-center w-100"
                    >
                      <div class="d-flex align-center">
                        <v-chip color="primary" class="mr-3"
                          >Awaiting bank wire payment</v-chip
                        >
                        <div class="text-caption">09/08/2023 07:07:31</div>
                      </div>
                      <v-btn variant="text"> Resend email </v-btn>
                    </div>
                  </v-list-item>
                </v-list>
              </v-window-item>

              <v-window-item value="documents">
                <v-list>
                  <v-list-item>
                    <div class="text-center py-4">No documents available</div>
                  </v-list-item>
                </v-list>
              </v-window-item>

              <v-window-item value="carriers">
                <v-list>
                  <v-list-item>
                    <div
                      class="d-flex justify-space-between align-center w-100"
                    >
                      <div>Carrier: My carrier</div>
                      <div>Tracking number: -</div>
                    </div>
                  </v-list-item>
                </v-list>
              </v-window-item>
            </v-window>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>Payment (0)</v-card-title>
            <v-card-text>
              <v-table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Payment method</th>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Invoice</th>
                    <th>Employee</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="7" class="text-center py-4">
                      No payment records found
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div class="d-flex justify-end pa-4">
                <v-btn variant="flat" color="primary"> Add </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>Messages (0)</v-card-title>
            <v-card-text>
              <div class="mb-4">
                <div class="text-caption mb-2">Choose your order message</div>
                <v-select
                  label="Select a message"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                ></v-select>
              </div>

              <div class="d-flex mb-2 align-center">
                <div class="text-caption mr-3">
                  Configure predefined messages
                </div>
                <v-icon size="small">mdi-arrow-right</v-icon>
              </div>

              <div class="d-flex align-center mb-3">
                <v-checkbox
                  label="Display to customer?"
                  hide-details
                ></v-checkbox>
              </div>

              <div class="mb-3">
                <div class="text-caption mb-1">Message</div>
                <v-textarea
                  rows="4"
                  variant="outlined"
                  hide-details
                ></v-textarea>
              </div>

              <div class="d-flex justify-end">
                <v-btn color="primary" variant="flat"> Send message </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "OrderDetailView",

  setup() {
    const orderStatus = ref("awaiting_payment");
    const activeTab = ref("status");

    const statusOptions = [
      { title: "Awaiting bank wire payment", value: "awaiting_payment" },
      { title: "Payment accepted", value: "payment_accepted" },
      { title: "Processing in progress", value: "processing" },
      { title: "Shipped", value: "shipped" },
      { title: "Delivered", value: "delivered" },
      { title: "Canceled", value: "canceled" },
      { title: "Refunded", value: "refunded" },
    ];

    // Aquí se cargarían los datos del pedido desde una API
    const loadOrderDetails = () => {
      // Simulación de carga de datos
      console.log("Cargando detalles del pedido...");
    };

    return {
      orderStatus,
      statusOptions,
      activeTab,
      loadOrderDetails,
    };
  },
});
</script>

<style>
.order-detail-view {
  padding: 24px;
}

.price-tag {
  background-color: rgba(0, 0, 0, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.status-select {
  max-width: 300px;
}

.update-status-btn {
  text-transform: none;
}

.text-chip {
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.address-details {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}

.product-image {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.products-table th,
.products-table td {
  padding: 12px 16px;
}

.total-row {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 8px;
  margin-top: 8px;
}

.totals-section {
  min-width: 300px;
}
</style>
