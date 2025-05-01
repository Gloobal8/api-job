<template>
  <v-container class="coupons-view">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Cupones</h1>
      </v-col>
    </v-row>

    <v-row>
      <!-- Lista de cupones -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar cupón"
              single-line
              hide-details
              class="mr-4"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              Nuevo Cupón
            </v-btn>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="coupons"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            :footer-props="{
              'items-per-page-options': [5, 10, 15, 20, -1],
              'items-per-page-text': 'Cupones por página',
            }"
            sort-by="createdAt"
            sort-desc
            class="elevation-1"
          >
            <template v-slot:item.code="{ item }">
              <span class="font-weight-bold">{{ item.code }}</span>
            </template>

            <template v-slot:item.discountType="{ item }">
              <v-chip
                :color="getDiscountTypeColor(item.discountType)"
                small
                label
              >
                {{ getDiscountTypeLabel(item.discountType) }}
              </v-chip>
            </template>

            <template v-slot:item.discountValue="{ item }">
              <span>
                {{ formatDiscountValue(item.discountValue, item.discountType) }}
              </span>
            </template>

            <template v-slot:item.validUntil="{ item }">
              <span :class="isExpired(item.validUntil) ? 'error--text' : ''">
                {{ formatDate(item.validUntil) }}
              </span>
              <v-chip
                v-if="isExpired(item.validUntil)"
                color="error"
                x-small
                class="ml-2"
              >
                Expirado
              </v-chip>
            </template>

            <template v-slot:item.maxUses="{ item }">
              <span> {{ item.usageCount }}/{{ item.maxUses || "∞" }} </span>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item)" small label>
                {{ getStatusLabel(item) }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon small v-on="on" @click="viewCouponDetails(item)">
                    <v-icon small>mdi-eye</v-icon>
                  </v-btn>
                </template>
                <span>Ver detalles</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    small
                    v-on="on"
                    @click="editCoupon(item)"
                    :disabled="isExpired(item.validUntil)"
                  >
                    <v-icon small>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Editar cupón</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    small
                    color="error"
                    v-on="on"
                    @click="confirmDeleteCoupon(item)"
                  >
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Eliminar cupón</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    small
                    :color="item.active ? 'error' : 'success'"
                    v-on="on"
                    @click="toggleCouponStatus(item)"
                    :disabled="isExpired(item.validUntil)"
                  >
                    <v-icon small>{{
                      item.active ? "mdi-close-circle" : "mdi-check-circle"
                    }}</v-icon>
                  </v-btn>
                </template>
                <span>{{ item.active ? "Desactivar" : "Activar" }} cupón</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Estadísticas de cupones -->
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>Estadísticas</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-card outlined class="text-center pa-3">
                  <div class="text-h4 primary--text">
                    {{ activeCoupons.length }}
                  </div>
                  <div class="text-subtitle-2">Cupones Activos</div>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card outlined class="text-center pa-3">
                  <div class="text-h4 error--text">
                    {{ expiredCoupons.length }}
                  </div>
                  <div class="text-subtitle-2">Cupones Expirados</div>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-1 mb-2">Redenciones por cupón</div>
                <v-progress-linear
                  v-for="coupon in topUsedCoupons"
                  :key="coupon.id"
                  :value="
                    (coupon.usageCount /
                      (coupon.maxUses || coupon.usageCount + 5)) *
                    100
                  "
                  height="20"
                  striped
                  class="mb-2"
                >
                  <template v-slot:default>
                    <span class="white--text">
                      {{ coupon.code }}: {{ coupon.usageCount }}
                      {{ coupon.usageCount === 1 ? "uso" : "usos" }}
                    </span>
                  </template>
                </v-progress-linear>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-1 mb-2">Próximos a expirar</div>
                <v-list dense>
                  <v-list-item
                    v-for="coupon in soonToExpireCoupons"
                    :key="coupon.id"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{ coupon.code }}</v-list-item-title>
                      <v-list-item-subtitle
                        >Expira:
                        {{
                          formatDate(coupon.validUntil)
                        }}</v-list-item-subtitle
                      >
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn
                        x-small
                        text
                        color="primary"
                        @click="extendValidity(coupon)"
                      >
                        Extender
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Acciones Rápidas</v-card-title>
          <v-card-text>
            <v-btn
              block
              outlined
              color="primary"
              class="mb-3"
              @click="generateCouponCode"
            >
              <v-icon left>mdi-dice-multiple</v-icon>
              Generar código aleatorio
            </v-btn>

            <v-btn
              block
              outlined
              color="success"
              class="mb-3"
              @click="exportCoupons"
            >
              <v-icon left>mdi-file-excel</v-icon>
              Exportar a Excel
            </v-btn>

            <v-btn
              block
              outlined
              color="error"
              @click="deactivateExpiredCoupons"
            >
              <v-icon left>mdi-clock-end</v-icon>
              Desactivar cupones expirados
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar cupón -->
    <v-dialog v-model="couponDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{
            editMode ? "Editar Cupón" : "Crear Cupón"
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="couponForm" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="couponData.code"
                  label="Código del cupón"
                  :rules="codeRules"
                  required
                  outlined
                  :disabled="editMode"
                  :hint="
                    editMode
                      ? 'El código no se puede modificar'
                      : 'Código único para el cupón'
                  "
                  persistent-hint
                >
                  <template v-slot:append>
                    <v-btn
                      icon
                      small
                      @click="generateCouponCode"
                      v-if="!editMode"
                    >
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="couponData.discountType"
                  :items="discountTypes"
                  label="Tipo de descuento"
                  :rules="[(v) => !!v || 'El tipo de descuento es requerido']"
                  required
                  outlined
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="couponData.discountValue"
                  label="Valor del descuento"
                  type="number"
                  :suffix="couponData.discountType === 'percentage' ? '%' : '€'"
                  :rules="discountValueRules"
                  required
                  outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-menu
                  ref="validFromMenu"
                  v-model="validFromMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedValidFrom"
                      label="Válido desde"
                      readonly
                      outlined
                      v-bind="attrs"
                      v-on="on"
                      :rules="[(v) => !!v || 'La fecha de inicio es requerida']"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="couponData.validFrom"
                    @input="validFromMenu = false"
                    :min="minDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" md="6">
                <v-menu
                  ref="validUntilMenu"
                  v-model="validUntilMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedValidUntil"
                      label="Válido hasta"
                      readonly
                      outlined
                      v-bind="attrs"
                      v-on="on"
                      :rules="[
                        (v) => !!v || 'La fecha de expiración es requerida',
                      ]"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="couponData.validUntil"
                    @input="validUntilMenu = false"
                    :min="couponData.validFrom || minDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="couponData.maxUses"
                  label="Usos máximos"
                  type="number"
                  min="0"
                  hint="Dejar en blanco para usos ilimitados"
                  persistent-hint
                  outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="couponData.minPurchase"
                  label="Compra mínima"
                  type="number"
                  min="0"
                  suffix="€"
                  hint="Importe mínimo para usar el cupón"
                  persistent-hint
                  outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="couponData.applicableTo"
                  :items="applicableToOptions"
                  label="Aplicable a"
                  multiple
                  chips
                  outlined
                  :rules="[
                    (v) => v.length > 0 || 'Selecciona al menos una opción',
                  ]"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="couponData.description"
                  label="Descripción"
                  hint="Descripción interna del cupón"
                  persistent-hint
                  outlined
                  rows="2"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="couponData.active"
                  label="Cupón activo"
                  color="success"
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeCouponDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="saveCoupon"
            :disabled="!formValid"
            :loading="saving"
          >
            {{ editMode ? "Actualizar" : "Crear" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para ver detalles del cupón -->
    <v-dialog v-model="detailsDialog" max-width="700px">
      <v-card v-if="selectedCoupon">
        <v-card-title class="d-flex justify-space-between">
          <span>Detalles del Cupón</span>
          <v-chip :color="getStatusColor(selectedCoupon)" label>
            {{ getStatusLabel(selectedCoupon) }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="text-h4 text-center primary--text">
                {{ selectedCoupon.code }}
              </div>
              <div class="text-subtitle-1 text-center grey--text">
                {{
                  formatDiscountValue(
                    selectedCoupon.discountValue,
                    selectedCoupon.discountType
                  )
                }}
                de descuento
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col cols="12" md="6">
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle
                      >Tipo de descuento</v-list-item-subtitle
                    >
                    <v-list-item-title>{{
                      getDiscountTypeLabel(selectedCoupon.discountType)
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>Válido desde</v-list-item-subtitle>
                    <v-list-item-title>{{
                      formatDate(selectedCoupon.validFrom)
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>Válido hasta</v-list-item-subtitle>
                    <v-list-item-title>{{
                      formatDate(selectedCoupon.validUntil)
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>Usos</v-list-item-subtitle>
                    <v-list-item-title
                      >{{ selectedCoupon.usageCount }} de
                      {{ selectedCoupon.maxUses || "∞" }}</v-list-item-title
                    >
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>Compra mínima</v-list-item-subtitle>
                    <v-list-item-title>{{
                      selectedCoupon.minPurchase
                        ? `${selectedCoupon.minPurchase}€`
                        : "Sin mínimo"
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>Aplicable a</v-list-item-subtitle>
                    <v-list-item-title>
                      <v-chip
                        v-for="item in selectedCoupon.applicableTo"
                        :key="item"
                        x-small
                        class="mr-1"
                      >
                        {{ getApplicableToLabel(item) }}
                      </v-chip>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>Creado el</v-list-item-subtitle>
                    <v-list-item-title>{{
                      formatDate(selectedCoupon.createdAt)
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item v-if="selectedCoupon.updatedAt">
                  <v-list-item-content>
                    <v-list-item-subtitle
                      >Última actualización</v-list-item-subtitle
                    >
                    <v-list-item-title>{{
                      formatDate(selectedCoupon.updatedAt)
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-row v-if="selectedCoupon.description">
            <v-col cols="12">
              <v-card outlined>
                <v-card-text>
                  <div class="text-subtitle-2">Descripción:</div>
                  <div>{{ selectedCoupon.description }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">Historial de uso</div>
              <v-simple-table
                v-if="
                  selectedCoupon.usageHistory &&
                  selectedCoupon.usageHistory.length > 0
                "
              >
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Fecha</th>
                      <th>Pedido</th>
                      <th>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(usage, index) in selectedCoupon.usageHistory"
                      :key="index"
                    >
                      <td>{{ usage.userName }}</td>
                      <td>{{ formatDate(usage.date) }}</td>
                      <td>{{ usage.orderId }}</td>
                      <td>{{ usage.amount }}€</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <div v-else class="text-center pa-4 grey--text">
                Este cupón aún no ha sido utilizado
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            text
            @click="editCoupon(selectedCoupon)"
            :disabled="isExpired(selectedCoupon.validUntil)"
          >
            <v-icon left>mdi-pencil</v-icon>
            Editar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="detailsDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para confirmar eliminación -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Eliminar Cupón</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el cupón
          <strong>{{ selectedCoupon?.code }}</strong
          >?
          <v-alert
            v-if="selectedCoupon?.usageCount > 0"
            type="warning"
            outlined
            dense
            class="mt-3"
          >
            Este cupón ha sido utilizado {{ selectedCoupon.usageCount }}
            {{ selectedCoupon.usageCount === 1 ? "vez" : "veces" }}. Eliminarlo
            podría afectar a informes y estadísticas.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" text @click="deleteCoupon" :loading="deleting">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para extender validez -->
    <v-dialog v-model="extendDialog" max-width="500">
      <v-card>
        <v-card-title>Extender Validez</v-card-title>
        <v-card-text>
          <p>
            Extender la validez del cupón
            <strong>{{ selectedCoupon?.code }}</strong
            >.
          </p>

          <v-menu
            ref="extendDateMenu"
            v-model="extendDateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="formattedExtendDate"
                label="Nueva fecha de expiración"
                readonly
                outlined
                v-bind="attrs"
                v-on="on"
                :rules="[(v) => !!v || 'La fecha es requerida']"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="extendDate"
              @input="extendDateMenu = false"
              :min="minDate"
            ></v-date-picker>
          </v-menu>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="extendDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="extendCouponValidity"
            :loading="extending"
            :disabled="!extendDate"
          >
            Extender
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "CouponsView",
  data() {
    return {
      loading: true,
      saving: false,
      deleting: false,
      extending: false,
      search: "",
      formValid: false,
      couponDialog: false,
      detailsDialog: false,
      deleteDialog: false,
      extendDialog: false,
      editMode: false,
      validFromMenu: false,
      validUntilMenu: false,
      extendDateMenu: false,
      extendDate: null,
      selectedCoupon: null,
      couponData: this.getEmptyCouponData(),
      snackbar: {
        show: false,
        text: "",
        color: "success",
        timeout: 3000,
      },
      headers: [
        { text: "Código", value: "code" },
        { text: "Tipo", value: "discountType", sortable: true },
        { text: "Valor", value: "discountValue", sortable: true },
        { text: "Válido Hasta", value: "validUntil", sortable: true },
        { text: "Usos", value: "maxUses", sortable: true },
        { text: "Estado", value: "status", sortable: true },
        {
          text: "Acciones",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
      discountTypes: [
        { text: "Porcentaje", value: "percentage" },
        { text: "Importe fijo", value: "fixed" },
      ],
      applicableToOptions: [
        { text: "Todos los productos", value: "all_products" },
        { text: "Paquetes premium", value: "premium_packages" },
        { text: "Publicaciones destacadas", value: "featured_listings" },
        { text: "Nuevos usuarios", value: "new_users" },
      ],
      // Datos simulados
      coupons: [
        {
          id: "1",
          code: "WELCOME20",
          discountType: "percentage",
          discountValue: 20,
          validFrom: "2023-01-01",
          validUntil: "2025-12-31",
          maxUses: 100,
          usageCount: 45,
          minPurchase: 0,
          active: true,
          applicableTo: ["all_products", "new_users"],
          description: "Cupón de bienvenida para nuevos usuarios",
          createdAt: "2023-01-01T10:00:00Z",
          updatedAt: "2023-01-01T10:00:00Z",
          usageHistory: [
            {
              userName: "Juan Pérez",
              date: "2023-02-15T14:30:00Z",
              orderId: "ORD-12345",
              amount: 49.99,
            },
            {
              userName: "María García",
              date: "2023-02-20T09:15:00Z",
              orderId: "ORD-12346",
              amount: 99.99,
            },
          ],
        },
        {
          id: "2",
          code: "SUMMER2023",
          discountType: "percentage",
          discountValue: 15,
          validFrom: "2023-06-01",
          validUntil: "2023-08-31",
          maxUses: 50,
          usageCount: 50,
          minPurchase: 30,
          active: false,
          applicableTo: ["all_products"],
          description: "Promoción de verano 2023",
          createdAt: "2023-05-15T10:00:00Z",
          updatedAt: "2023-09-01T09:00:00Z",
          usageHistory: [],
        },
        {
          id: "3",
          code: "PREMIUM50",
          discountType: "fixed",
          discountValue: 50,
          validFrom: "2023-01-01",
          validUntil: "2023-12-31",
          maxUses: null,
          usageCount: 12,
          minPurchase: 100,
          active: true,
          applicableTo: ["premium_packages"],
          description: "Descuento para paquetes premium",
          createdAt: "2023-01-01T10:00:00Z",
          updatedAt: null,
          usageHistory: [],
        },
        {
          id: "4",
          code: "FEATURED25",
          discountType: "percentage",
          discountValue: 25,
          validFrom: "2023-10-01",
          validUntil: "2023-11-30",
          maxUses: 30,
          usageCount: 5,
          minPurchase: 0,
          active: true,
          applicableTo: ["featured_listings"],
          description: "Descuento para publicaciones destacadas",
          createdAt: "2023-09-15T10:00:00Z",
          updatedAt: null,
          usageHistory: [],
        },
        {
          id: "5",
          code: "EXPIRED10",
          discountType: "percentage",
          discountValue: 10,
          validFrom: "2022-01-01",
          validUntil: "2022-12-31",
          maxUses: 200,
          usageCount: 150,
          minPurchase: 0,
          active: true,
          applicableTo: ["all_products"],
          description: "Cupón expirado",
          createdAt: "2022-01-01T10:00:00Z",
          updatedAt: null,
          usageHistory: [],
        },
      ],
      // Reglas de validación
      codeRules: [
        (v) => !!v || "El código es requerido",
        (v) =>
          (v && v.length >= 3) || "El código debe tener al menos 3 caracteres",
        (v) =>
          (v && v.length <= 20) || "El código debe tener máximo 20 caracteres",
        (v) =>
          /^[A-Z0-9_-]+$/.test(v) ||
          "El código solo puede contener letras mayúsculas, números, guiones y guiones bajos",
      ],
      discountValueRules: [
        (v) => !!v || "El valor del descuento es requerido",
        (v) => v > 0 || "El valor debe ser mayor que 0",
        (v) => {
          if (this.couponData.discountType === "percentage") {
            return v <= 100 || "El porcentaje no puede ser mayor a 100%";
          }
          return true;
        },
      ],
    };
  },
  computed: {
    minDate() {
      const today = new Date();
      return today.toISOString().substr(0, 10);
    },
    formattedValidFrom() {
      return this.formatDateForDisplay(this.couponData.validFrom);
    },
    formattedValidUntil() {
      return this.formatDateForDisplay(this.couponData.validUntil);
    },
    formattedExtendDate() {
      return this.formatDateForDisplay(this.extendDate);
    },
    activeCoupons() {
      return this.coupons.filter(
        (coupon) => coupon.active && !this.isExpired(coupon.validUntil)
      );
    },
    expiredCoupons() {
      return this.coupons.filter((coupon) => this.isExpired(coupon.validUntil));
    },
    topUsedCoupons() {
      return [...this.coupons]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5);
    },
    soonToExpireCoupons() {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      return this.coupons
        .filter((coupon) => {
          if (!coupon.active) return false;

          const expiryDate = new Date(coupon.validUntil);
          return expiryDate > today && expiryDate <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.validUntil) - new Date(b.validUntil));
    },
  },
  created() {
    this.loadCoupons();
  },
  methods: {
    loadCoupons() {
      // Simula la carga de cupones desde la API
      setTimeout(() => {
        // En un caso real, aquí harías una llamada a la API
        // const response = await this.$axios.get('/api/coupons');
        // this.coupons = response.data;

        this.loading = false;
      }, 1000);
    },

    getEmptyCouponData() {
      return {
        code: "",
        discountType: "percentage",
        discountValue: 10,
        validFrom: new Date().toISOString().substr(0, 10),
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3))
          .toISOString()
          .substr(0, 10),
        maxUses: null,
        minPurchase: 0,
        active: true,
        applicableTo: ["all_products"],
        description: "",
      };
    },

    openCreateDialog() {
      this.editMode = false;
      this.couponData = this.getEmptyCouponData();
      this.couponDialog = true;
    },

    editCoupon(coupon) {
      this.editMode = true;
      this.selectedCoupon = coupon;
      this.couponData = { ...coupon };
      this.detailsDialog = false; // Cierra el diálogo de detalles si está abierto
      this.couponDialog = true;
    },

    viewCouponDetails(coupon) {
      this.selectedCoupon = coupon;
      this.detailsDialog = true;
    },

    confirmDeleteCoupon(coupon) {
      this.selectedCoupon = coupon;
      this.deleteDialog = true;
    },

    closeCouponDialog() {
      this.couponDialog = false;
      setTimeout(() => {
        this.editMode = false;
        this.couponData = this.getEmptyCouponData();
      }, 300);
    },

    async saveCoupon() {
      if (!this.formValid) return;

      try {
        this.saving = true;

        // Simula el guardado del cupón
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (this.editMode) {
          // Actualizar cupón existente
          const index = this.coupons.findIndex(
            (c) => c.id === this.selectedCoupon.id
          );
          if (index !== -1) {
            const updatedCoupon = {
              ...this.coupons[index],
              ...this.couponData,
              updatedAt: new Date().toISOString(),
            };
            this.coupons.splice(index, 1, updatedCoupon);
          }

          this.showSnackbar("Cupón actualizado correctamente", "success");
        } else {
          // Crear nuevo cupón
          const newCoupon = {
            ...this.couponData,
            id: Math.random().toString(36).substr(2, 9),
            usageCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: null,
            usageHistory: [],
          };

          this.coupons.unshift(newCoupon);
          this.showSnackbar("Cupón creado correctamente", "success");
        }

        this.couponDialog = false;
        setTimeout(() => {
          this.editMode = false;
          this.couponData = this.getEmptyCouponData();
        }, 300);
      } catch (error) {
        console.error("Error saving coupon:", error);
        this.showSnackbar("Error al guardar el cupón", "error");
      } finally {
        this.saving = false;
      }
    },

    async deleteCoupon() {
      if (!this.selectedCoupon) return;

      try {
        this.deleting = true;

        // Simula la eliminación del cupón
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Elimina el cupón del array
        const index = this.coupons.findIndex(
          (c) => c.id === this.selectedCoupon.id
        );
        if (index !== -1) {
          this.coupons.splice(index, 1);
        }

        this.showSnackbar("Cupón eliminado correctamente", "success");
        this.deleteDialog = false;
        this.selectedCoupon = null;
      } catch (error) {
        console.error("Error deleting coupon:", error);
        this.showSnackbar("Error al eliminar el cupón", "error");
      } finally {
        this.deleting = false;
      }
    },

    async toggleCouponStatus(coupon) {
      try {
        // Simula la actualización del estado del cupón
        await new Promise((resolve) => setTimeout(resolve, 500));

        const index = this.coupons.findIndex((c) => c.id === coupon.id);
        if (index !== -1) {
          this.coupons[index].active = !this.coupons[index].active;
          this.coupons[index].updatedAt = new Date().toISOString();
        }

        const status = this.coupons[index].active ? "activado" : "desactivado";
        this.showSnackbar(`Cupón ${status} correctamente`, "success");
      } catch (error) {
        console.error("Error toggling coupon status:", error);
        this.showSnackbar("Error al cambiar el estado del cupón", "error");
      }
    },

    extendValidity(coupon) {
      this.selectedCoupon = coupon;
      this.extendDate = new Date(new Date().setMonth(new Date().getMonth() + 3))
        .toISOString()
        .substr(0, 10);
      this.extendDialog = true;
    },

    async extendCouponValidity() {
      if (!this.selectedCoupon || !this.extendDate) return;

      try {
        this.extending = true;

        // Simula la extensión de la validez
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const index = this.coupons.findIndex(
          (c) => c.id === this.selectedCoupon.id
        );
        if (index !== -1) {
          this.coupons[index].validUntil = this.extendDate;
          this.coupons[index].updatedAt = new Date().toISOString();
        }

        this.showSnackbar(
          "Validez del cupón extendida correctamente",
          "success"
        );
        this.extendDialog = false;
        this.selectedCoupon = null;
        this.extendDate = null;
      } catch (error) {
        console.error("Error extending coupon validity:", error);
        this.showSnackbar("Error al extender la validez del cupón", "error");
      } finally {
        this.extending = false;
      }
    },

    async deactivateExpiredCoupons() {
      try {
        // Simula la desactivación de cupones expirados
        await new Promise((resolve) => setTimeout(resolve, 1000));

        let count = 0;
        this.coupons.forEach((coupon) => {
          if (this.isExpired(coupon.validUntil) && coupon.active) {
            coupon.active = false;
            coupon.updatedAt = new Date().toISOString();
            count++;
          }
        });

        if (count > 0) {
          this.showSnackbar(
            `${count} cupones expirados han sido desactivados`,
            "success"
          );
        } else {
          this.showSnackbar("No hay cupones expirados para desactivar", "info");
        }
      } catch (error) {
        console.error("Error deactivating expired coupons:", error);
        this.showSnackbar("Error al desactivar cupones expirados", "error");
      }
    },

    generateCouponCode() {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      const length = 8;

      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      this.couponData.code = result;
    },

    exportCoupons() {
      // En una implementación real, aquí generarías un archivo Excel
      this.showSnackbar("Exportación de cupones iniciada...", "info");

      setTimeout(() => {
        this.showSnackbar("Cupones exportados correctamente", "success");
      }, 2000);
    },

    isExpired(date) {
      if (!date) return false;

      const expiryDate = new Date(date);
      const today = new Date();

      // Elimina las horas, minutos y segundos para comparar solo las fechas
      expiryDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return expiryDate < today;
    },

    getDiscountTypeLabel(type) {
      const types = {
        percentage: "Porcentaje",
        fixed: "Importe fijo",
      };

      return types[type] || type;
    },

    getDiscountTypeColor(type) {
      const colors = {
        percentage: "primary",
        fixed: "secondary",
      };

      return colors[type] || "grey";
    },

    getStatusLabel(coupon) {
      if (!coupon.active) return "Inactivo";
      if (this.isExpired(coupon.validUntil)) return "Expirado";
      if (coupon.maxUses && coupon.usageCount >= coupon.maxUses)
        return "Agotado";
      return "Activo";
    },

    getStatusColor(coupon) {
      if (!coupon.active) return "grey";
      if (this.isExpired(coupon.validUntil)) return "error";
      if (coupon.maxUses && coupon.usageCount >= coupon.maxUses)
        return "orange";
      return "success";
    },

    getApplicableToLabel(value) {
      const labels = {
        all_products: "Todos",
        premium_packages: "Premium",
        featured_listings: "Destacados",
        new_users: "Nuevos usuarios",
      };

      return labels[value] || value;
    },

    formatDiscountValue(value, type) {
      if (type === "percentage") {
        return `${value}%`;
      } else {
        return `${value}€`;
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-";

      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    formatDateForDisplay(dateString) {
      if (!dateString) return "";

      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    showSnackbar(text, color = "success", timeout = 3000) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.timeout = timeout;
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.coupons-view {
  padding-bottom: 60px;
}
</style>
