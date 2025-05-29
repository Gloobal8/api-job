<template>
  <div class="orders-view">
    <!-- Sección Header -->
    <v-card elevation="0" class="orders-header">
      <v-card-text class="d-flex" style="justify-content: space-between">
        <div class="d-flex flex-column align-start">
          <div class="text-caption text-uppercase mb-1">Orders</div>
          <div class="text-h4 font-weight-bold">Orders</div>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="primary"
            size="large"
            class="mx-2"
            prepend-icon="mdi-plus"
            @click="createOrder"
          >
            Add new order
          </v-btn>
          <v-btn
            color="secondary"
            size="large"
            class="mx-2"
            prepend-icon="mdi-puzzle"
            @click="exportOrders"
          >
            Boost sales
          </v-btn>
          <v-btn variant="tonal" size="large" class="mx-2"> Help </v-btn>
        </div>
      </v-card-text>
    </v-card>
    <div class="orders-main">
      <!-- Tarjetas de Analítica -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text class="d-flex flex-start">
              <v-icon size="65" color="primary">mdi-chart-box-outline</v-icon>
              <div
                class="d-flex flex-column flex-grow-1"
                style="margin: 0.5rem 0.3rem 0"
              >
                <div
                  class="d-flex flex-wrap align-center justify-space-between gap-2"
                >
                  <div class="d-flex flex-column">
                    <div
                      class="text-caption text-uppercase text-primary"
                      style="font-size: 0.9rem !important; font-weight: 600"
                    >
                      Conversion Rate
                    </div>
                    <div class="text-h5 font-weight-bold">
                      {{ conversionRate }}%
                    </div>
                  </div>
                  <div class="chart-container">
                    <Line
                      :data="getChartData(conversionTrend, '#4CAF50')"
                      :options="chartOptions"
                    />
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text class="d-flex flex-start">
              <v-icon size="65" color="primary">mdi-cart-off</v-icon>
              <div
                class="d-flex flex-column flex-grow-1"
                style="margin: 0.5rem 0.3rem 0"
              >
                <div
                  class="d-flex flex-wrap align-center justify-space-between gap-2"
                >
                  <div class="d-flex flex-column">
                    <div
                      class="text-caption text-uppercase text-primary"
                      style="font-size: 0.9rem !important; font-weight: 600"
                    >
                      Abandoned Carts
                    </div>
                    <div class="text-h5 font-weight-bold">
                      {{ abandonedCarts }}
                    </div>
                  </div>
                  <div class="chart-container">
                    <Line
                      :data="getChartData(abandonedTrend, '#FF5252')"
                      :options="chartOptions"
                    />
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text class="d-flex flex-start">
              <v-icon size="65" color="primary">mdi-wallet-outline</v-icon>
              <div
                class="d-flex flex-column flex-grow-1"
                style="margin: 0.5rem 0.3rem 0"
              >
                <div
                  class="d-flex flex-wrap align-center justify-space-between gap-2"
                >
                  <div class="d-flex flex-column">
                    <div
                      class="text-caption text-uppercase text-primary"
                      style="font-size: 0.9rem !important; font-weight: 600"
                    >
                      Average Order Value
                    </div>
                    <div class="text-h5 font-weight-bold">
                      ${{ averageOrderValue }}
                    </div>
                  </div>
                  <div class="chart-container">
                    <Line
                      :data="getChartData(avgOrderTrend, '#1976D2')"
                      :options="chartOptions"
                    />
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text class="d-flex flex-start">
              <v-icon size="65" color="primary">mdi-account-box-outline</v-icon>
              <div
                class="d-flex flex-column flex-grow-1"
                style="margin: 0.5rem 0.3rem 0"
              >
                <div
                  class="d-flex flex-wrap align-center justify-space-between gap-2"
                >
                  <div class="d-flex flex-column">
                    <div
                      class="text-caption text-uppercase text-primary"
                      style="font-size: 0.9rem !important; font-weight: 600"
                    >
                      Net Profit per Visit
                    </div>
                    <div class="text-h5 font-weight-bold">
                      ${{ netProfitPerVisit }}
                    </div>
                  </div>
                  <div class="chart-container">
                    <Line
                      :data="getChartData(profitTrend, '#00BCD4')"
                      :options="chartOptions"
                    />
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <!-- Tabla de Órdenes -->
      <v-card>
        <v-card-text>
          <v-data-table
            v-model="selected"
            :headers="headers.filter((h) => h.visible)"
            :items="orders"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            show-select
            class="elevation-0"
            @update:modelValue="handleSelectionChange"
          >
            <template v-slot:top>
              <v-toolbar flat color="white">
                <v-toolbar-title class="text-h5 font-weight-bold">
                  Orders ({{ orders.length }})
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-menu
                  v-model="menuColumns"
                  :close-on-content-click="false"
                  :persistent="false"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props">
                      <v-icon color="primary">mdi-eye-outline</v-icon>
                    </v-btn>
                  </template>
                  <v-card class="column-selector">
                    <v-list>
                      <v-list-item>
                        <v-list-item-title>
                          <v-checkbox
                            v-model="selectAllColumns"
                            :indeterminate="indeterminateColumns"
                            label="All"
                            hide-details
                            density="compact"
                            @click.stop="toggleSelectAllColumns"
                          ></v-checkbox>
                        </v-list-item-title>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item
                        v-for="header in headers"
                        :key="header.value"
                      >
                        <v-list-item-title>
                          <v-checkbox
                            v-model="header.visible"
                            :label="header.title"
                            hide-details
                            density="compact"
                            :disabled="header.locked"
                            @click.stop
                          ></v-checkbox>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
                <v-menu v-model="menuSettings" :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props" class="ml-2">
                      <v-icon size="24" color="primary">mdi-cog-outline</v-icon>
                    </v-btn>
                  </template>
                  <v-card class="settings-menu">
                    <v-list>
                      <v-list-item @click.stop="exportData">
                        <v-list-item-title>
                          <v-icon size="20" class="mr-2">mdi-export</v-icon>
                          Export
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click.stop="importData">
                        <v-list-item-title>
                          <v-icon size="20" class="mr-2">mdi-import</v-icon>
                          Import
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click.stop="refreshList">
                        <v-list-item-title>
                          <v-icon size="20" class="mr-2">mdi-refresh</v-icon>
                          Refresh list
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
              </v-toolbar>
            </template>

            <template v-slot:headers="{ columns }">
              <tr>
                <th class="ps-3"></th>
                <th
                  v-for="column in columns.slice(1)"
                  :key="column.key"
                  @click="toggleSort(column.key)"
                  style="cursor: pointer"
                >
                  <div style="display: inline-block">
                    {{ column.title }}
                    <v-icon
                      size="small"
                      style="margin-left: 4px; vertical-align: text-bottom"
                      :color="sortBy === column.key ? 'primary' : ''"
                    >
                      {{ getSortIcon(column.key) }}
                    </v-icon>
                  </div>
                </th>
              </tr>
              <tr>
                <th class="ps-3" style="background-color: whitesmoke">
                  <v-checkbox
                    v-model="selectAll"
                    :indeterminate="indeterminate"
                    @click="toggleSelectAll(orders)"
                    hide-details
                    density="compact"
                  ></v-checkbox>
                </th>
                <th
                  v-for="column in columns.slice(1)"
                  :key="column.key"
                  style="background-color: whitesmoke"
                  :class="{ 'position-relative': column.key === 'delivery' }"
                >
                  <template v-if="column.key === 'new'">
                    <v-select
                      v-model="filters[column.key]"
                      :items="newClientOptions"
                      item-title="title"
                      item-value="value"
                      label="New Client"
                      density="compact"
                      variant="outlined"
                      hide-details
                      class="mt-1"
                      elevation="1"
                      bg-color="white"
                      style="font-size: 0.75rem"
                      @update:model-value="handleFilterChange"
                    ></v-select>
                  </template>
                  <template v-else-if="column.key === 'status'">
                    <v-select
                      v-model="filters[column.key]"
                      :items="statusOptions"
                      item-title="title"
                      item-value="value"
                      label="Status"
                      density="compact"
                      variant="outlined"
                      hide-details
                      class="mt-1"
                      elevation="1"
                      bg-color="white"
                      style="font-size: 0.75rem"
                      @update:model-value="handleFilterChange"
                    ></v-select>
                  </template>
                  <template v-else-if="column.key === 'payment'">
                    <v-select
                      v-model="filters[column.key]"
                      :items="paymentOptions"
                      label="Payment"
                      density="compact"
                      variant="outlined"
                      hide-details
                      class="mt-1"
                      elevation="1"
                      bg-color="white"
                      style="font-size: 0.75rem"
                      @update:model-value="handleFilterChange"
                    ></v-select>
                  </template>
                  <template v-else-if="column.key === 'date'">
                    <div class="d-flex flex-column" style="gap: 10px">
                      <v-menu
                        v-model="dateMenu1"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset="10"
                      >
                        <template v-slot:activator="{ props }">
                          <v-text-field
                            v-model="dateFrom"
                            label="Date from"
                            readonly
                            v-bind="props"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="mt-2"
                            elevation="1"
                            bg-color="white"
                            style="font-size: 0.75rem"
                            append-inner-icon="mdi-calendar"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="dateFrom"
                          @update:model-value="dateMenu1 = false"
                          @change="handleFilterChange"
                        ></v-date-picker>
                      </v-menu>

                      <v-menu
                        v-model="dateMenu2"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset="10"
                      >
                        <template v-slot:activator="{ props }">
                          <v-text-field
                            v-model="dateTo"
                            label="Date to"
                            readonly
                            v-bind="props"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="mb-2"
                            elevation="1"
                            bg-color="white"
                            style="font-size: 0.75rem"
                            append-inner-icon="mdi-calendar"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="dateTo"
                          @update:model-value="dateMenu2 = false"
                          @change="handleFilterChange"
                        ></v-date-picker>
                      </v-menu>
                    </div>
                  </template>
                  <template v-else-if="column.key === 'delivery'">
                    <div class="position-relative">
                      <v-select
                        ref="deliverySelect"
                        v-model="filters.delivery"
                        :items="[
                          { title: 'All', value: 'all' },
                          { title: 'Spain', value: 'Spain' },
                          { title: 'France', value: 'France' },
                          { title: 'Germany', value: 'Germany' },
                          { title: 'Italy', value: 'Italy' },
                          { title: 'Portugal', value: 'Portugal' },
                          { title: 'Netherlands', value: 'Netherlands' },
                          { title: 'Belgium', value: 'Belgium' },
                          { title: 'Sweden', value: 'Sweden' },
                          { title: 'Denmark', value: 'Denmark' },
                          { title: 'Austria', value: 'Austria' },
                          { title: 'Ireland', value: 'Ireland' },
                          { title: 'Poland', value: 'Poland' },
                          { title: 'Norway', value: 'Norway' },
                          { title: 'Finland', value: 'Finland' },
                          { title: 'Greece', value: 'Greece' },
                          { title: 'Czech Republic', value: 'Czech Republic' },
                          { title: 'Hungary', value: 'Hungary' },
                          { title: 'Romania', value: 'Romania' },
                          { title: 'Croatia', value: 'Croatia' },
                          { title: 'Slovakia', value: 'Slovakia' },
                        ]"
                        label="Delivery"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="mt-1"
                        elevation="1"
                        bg-color="white"
                        style="font-size: 0.75rem"
                        multiple
                        chips
                        closable-chips
                        item-title="title"
                        item-value="value"
                        :menu-props="{
                          maxHeight: '300',
                          closeOnContentClick: true,
                        }"
                        @update:model-value="handleDeliveryChange"
                      >
                        <template #selection="{ index }">
                          <v-chip
                            v-if="index === 0"
                            size="small"
                            class="mr-1"
                            closable
                            @click:close="clearDeliveryFilter"
                          >
                            <span v-if="isAllDeliverySelected">
                              All - {{ deliveryCountryCount }} items selected
                            </span>
                            <span
                              v-else-if="
                                filters.delivery && filters.delivery.length > 1
                              "
                            >
                              {{ filters.delivery.length }} items selected
                            </span>
                            <span
                              v-else-if="
                                filters.delivery &&
                                filters.delivery.length === 1
                              "
                            >
                              {{ getDeliveryTitle(filters.delivery[0]) }}
                            </span>
                          </v-chip>
                        </template>
                      </v-select>
                      <div
                        class="text-caption text-primary d-flex align-center position-absolute"
                        style="
                          cursor: pointer;
                          font-size: 0.65rem !important;
                          bottom: -20px;
                          left: 0;
                        "
                        @click="showAllDeliveryChips = !showAllDeliveryChips"
                      >
                        <v-icon size="small" class="mr-1">
                          {{
                            showAllDeliveryChips
                              ? "mdi-chevron-up"
                              : "mdi-chevron-down"
                          }}
                        </v-icon>
                        {{ showAllDeliveryChips ? "Show less" : "Show more" }}
                      </div>
                    </div>
                  </template>
                  <v-text-field
                    v-else-if="column.key === 'id'"
                    v-model="filters[column.key]"
                    :label="column.title"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mt-1"
                    clearable
                    elevation="1"
                    bg-color="white"
                    style="font-size: 0.75rem"
                    prefix="ORD-"
                    type="number"
                    @update:model-value="handleFilterChange"
                  ></v-text-field>
                  <v-text-field
                    v-else-if="column.key === 'reference'"
                    v-model="filters[column.key]"
                    :label="column.title"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mt-1"
                    clearable
                    elevation="1"
                    bg-color="white"
                    style="font-size: 0.75rem"
                    prefix="REF-"
                    @input="
                      $event.target.value = $event.target.value.toUpperCase()
                    "
                    @update:model-value="handleFilterChange"
                  ></v-text-field>
                  <v-text-field
                    v-else-if="column.key !== 'actions'"
                    v-model="filters[column.key]"
                    :label="column.title"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mt-1"
                    clearable
                    elevation="1"
                    bg-color="white"
                    style="font-size: 0.75rem"
                    @update:model-value="handleFilterChange"
                  ></v-text-field>
                  <v-btn
                    v-else
                    color="primary"
                    variant="flat"
                    density="compact"
                    class="mt-1"
                    prepend-icon="mdi-magnify"
                    height="40"
                    style="width: fit-content"
                    @click="applyTableFilters"
                  >
                    Search
                  </v-btn>
                </th>
              </tr>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td class="ps-3">
                  <v-checkbox
                    :model-value="selected"
                    :value="item"
                    hide-details
                    density="compact"
                    @update:model-value="handleSelectionChange"
                  ></v-checkbox>
                </td>
                <td
                  v-for="header in headers.filter(
                    (h) => h.visible && h.value !== 'data-table-select'
                  )"
                  :key="header.value"
                >
                  <!-- Order ID con dropdown -->
                  <template v-if="header.value === 'id'">
                    <div
                      class="d-flex align-center cursor-pointer"
                      @click="toggleExpand(item)"
                    >
                      <span>{{ item.id }}</span>
                      <v-icon size="small" class="ms-2">
                        {{
                          expandedItems.includes(item.id)
                            ? "mdi-chevron-up"
                            : "mdi-chevron-down"
                        }}
                      </v-icon>
                    </div>
                  </template>

                  <template v-else-if="header.value === 'status'">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      size="default"
                      class="text-caption"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>

                  <template v-else-if="header.value === 'new'">
                    {{ item.new ? "Yes" : "No" }}
                  </template>

                  <template v-else-if="header.value === 'total'">
                    €{{ Number(item.total).toFixed(2) }}
                  </template>

                  <template v-else-if="header.value === 'date'">
                    {{ formatDateTime(item.date) }}
                  </template>

                  <template v-else-if="header.value === 'actions'">
                    <div class="d-flex actions-wrapper">
                      <v-menu
                        :close-on-content-click="false"
                        location="top"
                        :position-strategy="'fixed'"
                        open-on-hover
                        transition="scale-transition"
                        offset="10"
                        min-width="auto"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            density="comfortable"
                            variant="text"
                            size="small"
                            class="action-button"
                            @click="viewInvoice(item)"
                          >
                            <v-icon size="22">mdi-invoice-text-outline</v-icon>
                          </v-btn>
                        </template>
                        <v-card
                          class="tooltip-card"
                          variant="text"
                          elevation="0"
                        >
                          <v-card-text class="pa-2 text-caption">
                            Ver factura
                          </v-card-text>
                        </v-card>
                      </v-menu>

                      <v-menu
                        :close-on-content-click="false"
                        location="top"
                        :position-strategy="'fixed'"
                        open-on-hover
                        transition="scale-transition"
                        offset="10"
                        min-width="auto"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            density="comfortable"
                            variant="text"
                            size="small"
                            class="action-button"
                            @click="trackShipment(item)"
                          >
                            <v-icon size="22">mdi-truck</v-icon>
                          </v-btn>
                        </template>
                        <v-card
                          class="tooltip-card"
                          variant="text"
                          elevation="0"
                        >
                          <v-card-text class="pa-2 text-caption">
                            Ver albarán
                          </v-card-text>
                        </v-card>
                      </v-menu>

                      <v-menu
                        :close-on-content-click="false"
                        location="top"
                        :position-strategy="'fixed'"
                        open-on-hover
                        transition="scale-transition"
                        offset="10"
                        min-width="auto"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            density="comfortable"
                            variant="text"
                            size="small"
                            class="action-button"
                            @click="viewDetails(item)"
                          >
                            <v-icon size="22">mdi-magnify-plus-outline</v-icon>
                          </v-btn>
                        </template>
                        <v-card
                          class="tooltip-card"
                          variant="text"
                          elevation="0"
                        >
                          <v-card-text class="pa-2 text-caption">
                            Ver detalles
                          </v-card-text>
                        </v-card>
                      </v-menu>
                    </div>
                  </template>

                  <template v-else>
                    {{ item[header.value] }}
                  </template>
                </td>
              </tr>
              <tr v-if="expandedItems.includes(item.id)">
                <td colspan="100%" class="pa-0">
                  <div class="expanded-details pa-4 d-flex">
                    <div class="carrier-info mr-5">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2"
                          >mdi-truck-delivery</v-icon
                        >
                        <span class="font-weight-bold">Carrier:</span>
                        <span class="ml-2">My carrier</span>
                      </div>
                      <div class="details ml-8 text-caption">
                        <div class="mb-1">
                          <span class="font-weight-medium"
                            >Tracking number:</span
                          >
                          -
                        </div>
                        <div>
                          <span class="font-weight-medium"
                            >Shipping details:</span
                          >
                        </div>
                        <div class="ml-2">
                          John DOE<br />
                          My Company<br />
                          16, Main Street 2nd floor<br />
                          Miami, Florida 33133<br />
                          United States<br />
                          0102030405
                        </div>
                      </div>
                    </div>

                    <div class="invoice-info mr-5">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2"
                          >mdi-email-outline</v-icon
                        >
                        <span class="font-weight-bold">Email:</span>
                        <span class="ml-2">pub@prestashop.com</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2"
                          >mdi-file-document-outline</v-icon
                        >
                        <span class="font-weight-bold">Invoice details:</span>
                      </div>
                      <div class="details ml-8 text-caption">
                        <div>
                          John DOE<br />
                          My Company<br />
                          16, Main Street 2nd floor<br />
                          Miami, Florida 33133<br />
                          United States<br />
                          0102030405
                        </div>
                      </div>
                    </div>

                    <div class="products-info mr-5">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2"
                          >mdi-package-variant-closed</v-icon
                        >
                        <span class="font-weight-bold">Products (1):</span>
                      </div>
                      <div class="details ml-8">
                        <div class="d-flex align-start">
                          <v-checkbox
                            :model-value="true"
                            disabled
                            hide-details
                            density="compact"
                            class="mt-0 pt-0"
                          ></v-checkbox>
                          <div class="product-details ml-2">
                            <div class="text-caption">
                              Brown bear cushion Color : Black
                            </div>
                            <div
                              class="d-flex justify-space-between mt-2 text-caption"
                            >
                              <div>
                                Reference:
                                <span class="font-weight-medium">{{
                                  item.reference
                                }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="reference-info mr-5">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2"
                          >mdi-tag-outline</v-icon
                        >
                        <span class="font-weight-bold">Reference:</span>
                      </div>
                      <div class="details ml-8 text-caption">
                        <div>{{ item.reference }}</div>
                      </div>
                    </div>

                    <div class="quantity-total-info">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2"
                          >mdi-calculator-variant-outline</v-icon
                        >
                        <span class="font-weight-bold">Quantity & Total:</span>
                      </div>
                      <div class="details ml-8 text-caption">
                        <div class="mb-1">
                          <span class="font-weight-medium">Quantity:</span> 1
                        </div>
                        <div>
                          <span class="font-weight-medium">Total:</span> €{{
                            Number(item.total).toFixed(2)
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex justify-end px-4 pb-4">
                    <v-btn
                      color="primary"
                      variant="flat"
                      density="comfortable"
                      class="order-details-btn"
                      @click="navigateToOrderDetail(item)"
                    >
                      Order details
                      <v-icon class="ms-2" size="small"
                        >mdi-arrow-right-thin</v-icon
                      >
                    </v-btn>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>

          <!-- Sección de Show more/Show less para los filtros de delivery -->
          <div v-if="hasDeliveryFilters" class="filters-expand-container mt-2">
            <div
              class="text-caption text-primary d-flex align-center show-more-less-btn"
              @click="showAllDeliveryChips = !showAllDeliveryChips"
            >
              <v-icon size="small" class="mr-1">
                {{
                  showAllDeliveryChips ? "mdi-chevron-up" : "mdi-chevron-down"
                }}
              </v-icon>
              {{ showAllDeliveryChips ? "Show less" : "Show more" }}
            </div>

            <v-expand-transition>
              <div
                v-if="showAllDeliveryChips"
                class="d-flex flex-wrap py-2 px-3 delivery-chips-container"
                style="gap: 4px"
              >
                <template v-if="isAllDeliverySelected">
                  <v-chip
                    v-for="country in deliveryCountries"
                    :key="country.value"
                    size="x-small"
                    class="mr-1"
                    color="primary"
                    variant="outlined"
                  >
                    {{ country.title }}
                  </v-chip>
                </template>
                <template v-else>
                  <v-chip
                    v-for="value in filters.delivery"
                    :key="value"
                    size="x-small"
                    class="mr-1"
                    color="primary"
                    variant="outlined"
                    closable
                    @click:close="removeDeliveryFilter(value)"
                  >
                    {{ getDeliveryTitle(value) }}
                  </v-chip>
                </template>
              </div>
            </v-expand-transition>
          </div>

          <!-- Footer Buttons -->
          <div class="d-flex mt-4">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn variant="outlined" v-bind="props" class="mr-2">
                  Selection
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="handleSelectCurrentPage">
                  <v-list-item-title>Select current page</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleSelectAllPages">
                  <v-list-item-title>Select all pages</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="handleDeselectCurrentPage"
                  :disabled="!hasSelectedItems"
                >
                  <v-list-item-title>Deselect current page</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="handleDeselectAllPages"
                  :disabled="!hasSelectedItems"
                >
                  <v-list-item-title>Deselect all pages</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn variant="outlined" v-bind="props"> Actions </v-btn>
              </template>
              <v-list>
                <v-list-item @click="showStatusModal = true">
                  <v-list-item-title>Change order status</v-list-item-title>
                </v-list-item>
                <v-list-item @click="downloadInvoices">
                  <v-list-item-title>Download Invoice/s</v-list-item-title>
                </v-list-item>
                <v-list-item @click="printInvoices">
                  <v-list-item-title>Print Invoice/s</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <!-- Status Change Modal -->
          <v-dialog v-model="showStatusModal" max-width="500px">
            <v-card>
              <v-card-title class="text-h5 pa-4">
                Choose an order status
              </v-card-title>
              <v-card-text>
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  label="Status"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                ></v-select>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  variant="text"
                  @click="showStatusModal = false"
                >
                  Close
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  @click="updateOrderStatus"
                >
                  Update status
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- Snackbar para notificaciones -->
          <v-snackbar
            v-model="actionSnackbar.visible"
            :color="actionSnackbar.color"
            :timeout="actionSnackbar.timeout"
          >
            {{ actionSnackbar.text }}
          </v-snackbar>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { VDataTable } from "vuetify/components";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useOrderDelivery } from "./composables/useOrderDelivery";
import { useOrderFilters } from "./composables/useOrderFilters";
import { useOrderSort } from "./composables/useOrderSort";
import { useOrderSelection } from "./composables/useOrderSelection";
import { useOrderActions } from "./composables/useOrderActions";
import { useOrderStatus } from "./composables/useOrderStatus";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default defineComponent({
  name: "OrdersView",
  components: {
    VDataTable,
    Line,
  },
  setup() {
    // Data
    const orders = ref([
      {
        id: "ORD-001",
        reference: "REF123456",
        new: true,
        delivery: "Spain",
        customer: "Juan García",
        total: 299.99,
        payment: "Credit Card",
        status: "Authorized. To be captured by merchant",
        date: "2024-04-27",
      },
      {
        id: "ORD-002",
        reference: "REF789012",
        new: false,
        delivery: "France",
        customer: "Marie Dubois",
        total: 149.99,
        payment: "Bank transfer",
        status: "Awaiting bank transfer payment",
        date: "2024-04-26",
      },
      {
        id: "ORD-003",
        reference: "REF345678",
        new: true,
        delivery: "Germany",
        customer: "Hans Schmidt",
        total: 499.99,
        payment: "Cash On Delivery",
        status: "Awaiting Cash On Delivery validation",
        date: "2024-04-27",
      },
      {
        id: "ORD-004",
        reference: "REF901234",
        new: false,
        delivery: "Italy",
        customer: "Marco Rossi",
        total: 199.99,
        payment: "Payment by check",
        status: "Awaiting check payment",
        date: "2024-04-25",
      },
      {
        id: "ORD-005",
        reference: "REF567890",
        new: true,
        delivery: "Portugal",
        customer: "João Silva",
        total: 399.99,
        payment: "PayPal",
        status: "Canceled",
        date: "2024-04-27",
      },
      {
        id: "ORD-006",
        reference: "REF234567",
        new: false,
        delivery: "Netherlands",
        customer: "Jan de Vries",
        total: 249.99,
        payment: "Credit Card",
        status: "Delivered",
        date: "2024-04-26",
      },
      {
        id: "ORD-007",
        reference: "REF890123",
        new: true,
        delivery: "Belgium",
        customer: "Emma Peeters",
        total: 349.99,
        payment: "Bank Transfer",
        status: "On backorder (not paid)",
        date: "2024-04-27",
      },
      {
        id: "ORD-008",
        reference: "REF456789",
        new: false,
        delivery: "Sweden",
        customer: "Erik Larsson",
        total: 599.99,
        payment: "Credit Card",
        status: "On backorder (paid)",
        date: "2024-04-25",
      },
      {
        id: "ORD-009",
        reference: "REF012345",
        new: true,
        delivery: "Denmark",
        customer: "Anders Nielsen",
        total: 449.99,
        payment: "PayPal",
        status: "Partial refund",
        date: "2024-04-27",
      },
      {
        id: "ORD-010",
        reference: "REF678901",
        new: false,
        delivery: "Austria",
        customer: "Thomas Weber",
        total: 299.99,
        payment: "Credit Card",
        status: "Payment accepted",
        date: "2024-04-26",
      },
      {
        id: "ORD-011",
        reference: "REF112233",
        new: true,
        delivery: "Ireland",
        customer: "Sean O'Connor",
        total: 449.99,
        payment: "Credit Card",
        status: "Payment error",
        date: "2024-04-27",
      },
      {
        id: "ORD-012",
        reference: "REF445566",
        new: false,
        delivery: "Poland",
        customer: "Anna Kowalski",
        total: 299.99,
        payment: "PayPal",
        status: "Processing in progress",
        date: "2024-04-26",
      },
      {
        id: "ORD-013",
        reference: "REF778899",
        new: true,
        delivery: "Norway",
        customer: "Erik Hansen",
        total: 649.99,
        payment: "Bank Transfer",
        status: "Refunded",
        date: "2024-04-27",
      },
      {
        id: "ORD-014",
        reference: "REF001122",
        new: false,
        delivery: "Finland",
        customer: "Matti Virtanen",
        total: 399.99,
        payment: "Credit Card",
        status: "Remote payment accepted",
        date: "2024-04-25",
      },
      {
        id: "ORD-015",
        reference: "REF334455",
        new: true,
        delivery: "Greece",
        customer: "Nikos Papadopoulos",
        total: 549.99,
        payment: "PayPal",
        status: "Shipped",
        date: "2024-04-27",
      },
      {
        id: "ORD-016",
        reference: "REF667788",
        new: false,
        delivery: "Czech Republic",
        customer: "Jan Novak",
        total: 199.99,
        payment: "Bank Transfer",
        status: "Waiting capture",
        date: "2024-04-26",
      },
      {
        id: "ORD-017",
        reference: "REF990011",
        new: true,
        delivery: "Hungary",
        customer: "István Nagy",
        total: 449.99,
        payment: "Credit Card",
        status: "Waiting for Credit Card Payment",
        date: "2024-04-27",
      },
      {
        id: "ORD-018",
        reference: "REF223344",
        new: false,
        delivery: "Romania",
        customer: "Ion Popescu",
        total: 299.99,
        payment: "PayPal",
        status: "Waiting for Local Payment Method",
        date: "2024-04-25",
      },
      {
        id: "ORD-019",
        reference: "REF556677",
        new: true,
        delivery: "Croatia",
        customer: "Ana Horvat",
        total: 599.99,
        payment: "PayPal",
        status: "Waiting for PayPal payment",
        date: "2024-04-27",
      },
      {
        id: "ORD-020",
        reference: "REF889900",
        new: false,
        delivery: "Slovakia",
        customer: "Martin Kovac",
        total: 349.99,
        payment: "Crypto",
        status: "Waiting for crypto",
        date: "2024-04-26",
      },
    ]);

    // Búsqueda global
    const search = ref("");

    // Menú de configuración
    const menuSettings = ref(false);

    // Analytics data
    const analytics = ref({
      conversionRate: 15.8,
      abandonedCarts: 23,
      averageOrderValue: 149.99,
      netProfitPerVisit: 4.85,
      conversionTrend: [15, 13, 18, 16, 15, 17, 16],
      abandonedTrend: [25, 23, 21, 24, 22, 23, 23],
      avgOrderTrend: [140, 145, 150, 148, 155, 153, 150],
      profitTrend: [4.2, 4.5, 4.8, 4.7, 5.0, 4.9, 4.85],
    });

    // Date menus
    const dateMenu1 = ref(false);
    const dateMenu2 = ref(false);

    // Composables
    const delivery = useOrderDelivery();
    const {
      filters,
      dateFrom,
      dateTo,
      loading,
      newClientOptions,
      statusOptions,
      paymentOptions,
      applyFilters: applyOrderFilters,
    } = useOrderFilters();

    const { sortBy, sortOrder, getSortIcon, toggleSort, applySort } =
      useOrderSort();

    const {
      selected,
      selectAll,
      indeterminate,
      hasSelectedItems,
      toggleSelectAll,
      selectCurrentPage,
      selectAllPages,
      deselectCurrentPage,
      deselectAllPages,
      updateSelectionState,
    } = useOrderSelection();

    // Array para controlar qué filas están expandidas
    const expandedItems = ref([]);

    // Función para expandir/colapsar una fila
    const toggleExpand = (item) => {
      const index = expandedItems.value.indexOf(item.id);
      if (index === -1) {
        expandedItems.value.push(item.id);
      } else {
        expandedItems.value.splice(index, 1);
      }
    };

    const {
      loading: actionLoading,
      actionInProgress,
      snackbarVisible,
      snackbarText,
      snackbarColor,
      snackbarTimeout,
      exportOrders,
      importOrders,
      refreshList,
      updateOrderStatus,
    } = useOrderActions();

    const { getStatusColor } = useOrderStatus();

    // Headers configuration
    const headers = ref([
      { title: "Order ID", value: "id", visible: true, locked: true },
      { title: "Reference", value: "reference", visible: true },
      { title: "New client", value: "new", visible: true },
      { title: "Delivery", value: "delivery", visible: true },
      { title: "Customer", value: "customer", visible: true },
      { title: "Total", value: "total", visible: true },
      { title: "Payment", value: "payment", visible: true },
      { title: "Status", value: "status", visible: true },
      { title: "Date", value: "date", visible: true },
      {
        title: "Actions",
        value: "actions",
        sortable: false,
        visible: true,
        locked: true,
      },
    ]);

    // Column visibility
    const menuColumns = ref(false);
    const selectAllColumns = ref(false);
    const indeterminateColumns = ref(false);

    const updateSelectAllState = () => {
      const selectableHeaders = headers.value.filter((h) => !h.locked);
      const visibleCount = selectableHeaders.filter((h) => h.visible).length;
      selectAllColumns.value = visibleCount === selectableHeaders.length;
      indeterminateColumns.value =
        visibleCount > 0 && visibleCount < selectableHeaders.length;
    };

    const toggleSelectAllColumns = () => {
      const newValue = !(selectAllColumns.value || indeterminateColumns.value);
      headers.value.forEach((header) => {
        if (!header.locked) {
          header.visible = newValue;
        }
      });
      updateSelectAllState();
    };

    // Status modal
    const showStatusModal = ref(false);
    const selectedStatus = ref(null);

    // Referencia para almacenar las órdenes originales
    const originalOrders = ref([]);

    // Methods
    const handleFilterChange = () => {
      // Solo actualizamos el valor del filtro pero no aplicamos el filtrado
      if (!filters.value.id) {
        // Si el filtro de ID está vacío o undefined, restauramos las órdenes originales
        orders.value = [...originalOrders.value];
      }
    };

    const applyTableFilters = () => {
      const filteredOrders = originalOrders.value.filter((order) => {
        let matches = true;

        // Filtrar por ID
        if (filters.value.id) {
          matches = order.id
            .toLowerCase()
            .includes("ord-" + filters.value.id.toLowerCase());
        }

        // Filtrar por otros campos...
        Object.keys(filters.value).forEach((key) => {
          if (filters.value[key] !== null && filters.value[key] !== undefined) {
            if (key === "new") {
              // Convertimos el valor del filtro a booleano para comparar correctamente
              const filterValue = filters.value[key] === true;
              matches = matches && order[key] === filterValue;
            } else if (key === "status") {
              matches = matches && order[key] === filters.value[key];
            } else if (
              key === "delivery" &&
              Array.isArray(filters.value[key])
            ) {
              // Si el primer valor es 'all', incluye todos los países
              if (filters.value[key].includes("all")) {
                // No filtramos, todos los países están incluidos
                return;
              } else if (filters.value[key].length > 0) {
                matches = matches && filters.value[key].includes(order[key]);
              }
            } else if (filters.value[key]) {
              matches =
                matches &&
                String(order[key])
                  .toLowerCase()
                  .includes(String(filters.value[key]).toLowerCase());
            }
          }
        });

        // Filtrar por rango de fechas
        if (dateFrom.value || dateTo.value) {
          const orderDate = new Date(order.date);
          if (dateFrom.value && new Date(dateFrom.value) > orderDate) {
            matches = false;
          }
          if (dateTo.value && new Date(dateTo.value) < orderDate) {
            matches = false;
          }
        }

        return matches;
      });

      orders.value = filteredOrders;
    };

    const handleSort = (columnKey) => {
      orders.value = toggleSort(columnKey, orders.value);
    };

    const handleStatusUpdate = async () => {
      await updateOrderStatus(selected.value, selectedStatus.value);
      showStatusModal.value = false;
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Funciones para manejar la selección
    const handleSelectCurrentPage = () => {
      const currentItems = orders.value.slice(0, 10); // Asumiendo items-per-page=10
      selectCurrentPage(currentItems);
      updateSelectionState(orders.value);
    };

    const handleSelectAllPages = () => {
      selectAllPages(orders.value);
      updateSelectionState(orders.value);
    };

    const handleDeselectCurrentPage = () => {
      const currentItems = orders.value.slice(0, 10); // Asumiendo items-per-page=10
      deselectCurrentPage(currentItems);
      updateSelectionState(orders.value);
    };

    const handleDeselectAllPages = () => {
      deselectAllPages();
      updateSelectionState(orders.value);
    };

    // Función para manejar cambios en la selección
    const handleSelectionChange = (newSelection) => {
      selected.value = newSelection;
      updateSelectionState(orders.value);
    };

    // Funciones
    const createOrder = () => {
      console.log("Crear nueva orden");
      // Aquí irá la lógica para crear una nueva orden
    };

    // Watchers and lifecycle hooks
    onMounted(() => {
      console.log("[OrdersView] Componente montado");
      // Inicializamos originalOrders después de que el componente esté montado
      originalOrders.value = [...orders.value];
    });

    // Snackbar
    const actionSnackbar = computed(() => ({
      visible: snackbarVisible.value,
      text: snackbarText.value,
      color: snackbarColor.value,
      timeout: snackbarTimeout.value,
    }));

    // Estado para mostrar todos los chips de delivery
    const showAllDeliveryChips = ref(false);

    // Comprueba si está seleccionado "All" en el filtro de delivery
    const isAllDeliverySelected = computed(() => {
      return filters.value.delivery && filters.value.delivery.includes("all");
    });

    // Comprueba si hay filtros de delivery aplicados
    const hasDeliveryFilters = computed(() => {
      return filters.value.delivery && filters.value.delivery.length > 0;
    });

    // Lista de todos los países disponibles para delivery
    const deliveryCountries = computed(() => {
      return delivery.deliveryOptions.filter(
        (option) => option.parent === "Europe"
      );
    });

    // Número de países de Europa (para el chip cuando se selecciona 'All')
    const deliveryCountryCount = computed(() => {
      return deliveryCountries.value.length;
    });

    // Obtiene el título legible de un valor de delivery
    const getDeliveryTitle = (value) => {
      if (value === "all") return "All";
      return value;
    };

    // Método para limpiar todos los filtros de delivery
    const clearDeliveryFilter = () => {
      filters.value.delivery = [];
      handleFilterChange();
    };

    // Método para eliminar un valor específico del filtro de delivery
    const removeDeliveryFilter = (value) => {
      if (filters.value.delivery) {
        filters.value.delivery = filters.value.delivery.filter(
          (v) => v !== value
        );
        handleFilterChange();
      }
    };

    // Método para manejar cambios en el filtro de delivery
    const handleDeliveryChange = () => {
      if (!filters.value.delivery) {
        filters.value.delivery = [];
        return;
      }

      // Si se acaba de seleccionar 'all', establecer una bandera
      const containsAll = filters.value.delivery.includes("all");

      // Si se selecciona 'all', se seleccionan todos los países (internamente)
      if (containsAll) {
        // Solo conservamos 'all' en el filtro visible
        filters.value.delivery = ["all"];

        // Internamente estamos seleccionando todos los países para el filtrado
        // pero solo mostramos 'all' en la UI para mantenerla limpia
      } else if (filters.value.delivery.length > 0) {
        // Si se seleccionaron países específicos, se asegura que 'all' no esté en la selección
        filters.value.delivery = filters.value.delivery.filter(
          (v) => v !== "all"
        );
      }

      handleFilterChange();
    };

    watch(
      () => actionSnackbar.value.visible,
      (newValue) => {
        if (!newValue) {
          snackbarVisible.value = false;
        }
      }
    );

    // Watcher para actualizar el estado de selección
    watch(
      () => selected.value,
      () => {
        updateSelectionState(orders.value);
      },
      { deep: true }
    );

    // Configuración de los gráficos
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
          },
        },
        y: {
          display: false,
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2,
        },
        point: {
          radius: 0,
        },
      },
    };

    const getChartData = (values, color) => ({
      labels: ["", "", "", "", "", "", ""],
      datasets: [
        {
          data: values,
          borderColor: color,
          backgroundColor: color,
          fill: false,
          borderWidth: 2,
        },
      ],
    });

    // Función para navegar a la vista de detalles del pedido
    const navigateToOrderDetail = (item) => {
      console.log(`Navegando a detalles del pedido ${item.id}`);
      // Aquí iría la navegación real usando vue-router
      // router.push(`/platforms/gloobal-buy/orders/${item.id}`);
    };

    return {
      // Data
      orders,
      analytics,
      headers,
      menuColumns,
      showStatusModal,
      selectedStatus,
      dateMenu1,
      dateMenu2,
      search,
      menuSettings,

      // Analytics computed
      conversionRate: computed(() => analytics.value.conversionRate),
      abandonedCarts: computed(() => analytics.value.abandonedCarts),
      averageOrderValue: computed(() => analytics.value.averageOrderValue),
      netProfitPerVisit: computed(() => analytics.value.netProfitPerVisit),
      conversionTrend: computed(() => analytics.value.conversionTrend),
      abandonedTrend: computed(() => analytics.value.abandonedTrend),
      avgOrderTrend: computed(() => analytics.value.avgOrderTrend),
      profitTrend: computed(() => analytics.value.profitTrend),

      // Composables
      delivery,
      filters,
      dateFrom,
      dateTo,
      loading,
      newClientOptions,
      statusOptions,
      paymentOptions,
      selected,
      selectAll,
      indeterminate,
      hasSelectedItems,
      sortBy,
      sortOrder,
      actionLoading,
      actionInProgress,

      // Methods
      handleFilterChange,
      applyTableFilters,
      handleSort,
      handleStatusUpdate,
      formatDateTime,
      getSortIcon,
      toggleSelectAll,
      selectCurrentPage,
      selectAllPages,
      deselectCurrentPage,
      deselectAllPages,
      exportOrders,
      importOrders,
      refreshList,
      toggleSelectAllColumns,
      updateSelectAllState,
      getStatusColor,

      // Column visibility
      selectAllColumns,
      indeterminateColumns,

      // Snackbar
      actionSnackbar,

      // Funciones
      createOrder,

      // Selection handlers
      handleSelectCurrentPage,
      handleSelectAllPages,
      handleDeselectCurrentPage,
      handleDeselectAllPages,
      handleSelectionChange,

      // Chart configuration
      chartOptions,
      getChartData,

      // Estado para mostrar todos los chips de delivery
      showAllDeliveryChips,

      // Comprueba si está seleccionado "All" en el filtro de delivery
      isAllDeliverySelected,

      // Comprueba si hay filtros de delivery aplicados
      hasDeliveryFilters,

      // Lista de todos los países disponibles para delivery
      deliveryCountries,

      // Número de países de Europa (para el chip cuando se selecciona 'All')
      deliveryCountryCount,

      // Obtiene el título legible de un valor de delivery
      getDeliveryTitle,

      // Método para limpiar todos los filtros de delivery
      clearDeliveryFilter,

      // Método para eliminar un valor específico del filtro de delivery
      removeDeliveryFilter,

      // Método para manejar cambios en el filtro de delivery
      handleDeliveryChange,

      // Array para controlar qué filas están expandidas
      expandedItems,

      // Función para expandir/colapsar una fila
      toggleExpand,

      // Función para navegar a la vista de detalles del pedido
      navigateToOrderDetail,
    };
  },
});
</script>
<style>
.orders-view {
  padding: 0;
}
.orders-header {
  background: white;
}
.orders-main {
  padding: 24px;
}
.header-filter {
  margin: 8px 0;
}

/* Estilos para los botones de acción */
.actions-wrapper {
  min-width: 180px;
  gap: 16px !important;
  position: relative;
  justify-content: start !important;
}

.action-button {
  width: 36px !important;
  height: 36px !important;
  margin: 0 4px !important;
}

/* Estilos para el toolbar */
:deep(.v-toolbar) {
  background-color: white !important;
}

/* Ajuste del gap entre date pickers */
:deep(.gap-3) {
  gap: 10px !important;
}

/* Estilos para el tooltip personalizado */
.tooltip-card {
  background-color: rgba(97, 97, 97, 0.9) !important;
  color: white !important;
  min-width: unset !important;
  max-width: max-content !important;
  margin: 0 auto !important;
}

.tooltip-card .v-card-text {
  padding: 4px 8px !important;
  color: white !important;
  font-size: 12px !important;
  white-space: nowrap !important;
  text-align: center !important;
}

/* Estilos para el contenedor de chips expandibles */
.v-expand-transition {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

/* Estilos para los chips pequeños en el área expandible */
.v-chip--size-x-small {
  height: 20px !important;
  min-width: unset !important;
  font-size: 10px !important;
  padding: 0 8px !important;
}

/* Estilos para el contenedor de chips de delivery */
.delivery-chips-container {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* Botón de Show more/less */
.show-more-less-btn {
  position: relative;
  cursor: pointer;
  font-size: 0.75rem !important;
  text-align: center;
  width: 100%;
  justify-content: center;
  padding: 8px 0;
  background-color: rgba(0, 0, 0, 0.02);
}

/* Eliminamos el margen adicional para el position-relative */
th .position-relative {
  margin-bottom: 0;
}

:deep(.v-overlay) {
  display: flex !important;
  justify-content: center !important;
}

:deep(.v-overlay__content) {
  width: auto !important;
  display: flex !important;
  justify-content: center !important;
  margin: 0 !important;
}

.mdi-dots-vertical::before {
  content: "\F01D4";
  visibility: visible !important;
  display: inline-block !important;
}

.column-selector {
  min-width: 200px;
}

.column-selector .v-list-item {
  min-height: 35px;
}

.column-selector .v-list-item__title {
  font-size: 0.875rem;
}

.settings-menu {
  min-width: 180px;
}

.settings-menu .v-list-item {
  min-height: 40px;
  cursor: pointer;
}

.settings-menu .v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.settings-menu .v-list-item__title {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

/* Estilos para los gráficos */
.chart-container {
  height: 40px;
  width: 120px;
  min-width: 120px;
  margin: 0;
}

@media (max-width: 600px) {
  .chart-container {
    width: 100%;
    margin-top: 8px;
  }
}

canvas {
  height: 40px !important;
}

.gap-2 {
  gap: 8px;
}

/* Contenedor para el área expandible fuera de la tabla */
.filters-expand-container {
  position: relative;
  margin-top: -1px; /* Conecta visualmente con la tabla */
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* Botón de Show more/less */
.show-more-less-btn {
  position: relative;
  cursor: pointer;
  font-size: 0.75rem !important;
  text-align: center;
  width: 100%;
  justify-content: center;
  padding: 8px 0;
  background-color: rgba(0, 0, 0, 0.02);
}

/* Estilos para el contenedor de chips de delivery */
.delivery-chips-container {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* Eliminamos el margen adicional para el position-relative */
th .position-relative {
  margin-bottom: 0;
}

/* Estilos para el dropdown de Order ID */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  color: var(--v-theme-primary);
}

/* Estilos para la sección expandida */
.expanded-details {
  background-color: #f8f9fa;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .expanded-details {
    flex-direction: column;
  }

  .carrier-info,
  .invoice-info,
  .products-info {
    margin-right: 0;
    margin-bottom: 24px;
    width: 100%;
  }
}

.font-weight-medium {
  font-weight: 500;
}

.details {
  color: rgba(0, 0, 0, 0.7);
}

.product-details {
  width: 100%;
}

/* Estilos para el botón de detalles del pedido */
.order-details-btn {
  height: 40px;
  min-width: 150px;
}

/* Estilo para el botón cuando está en hover */
.order-details-btn:hover .v-icon {
  transform: translateX(3px);
  transition: transform 0.3s ease;
}

.v-icon.ms-2 {
  transition: transform 0.3s ease;
}
</style>
