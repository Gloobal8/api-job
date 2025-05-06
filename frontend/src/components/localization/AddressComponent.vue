<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <span class="text-h5">Mis Direcciones</span>
            <v-spacer></v-spacer>

            <!-- Botón para geocodificar todas las direcciones sin coordenadas -->
            <v-btn
              v-if="addressesWithoutCoordinates.length > 0"
              color="warning"
              class="mr-2"
              prepend-icon="mdi-map-marker-plus"
              :loading="geocodingAll"
              @click="geocodeAllAddresses"
            >
              Obtener Coordenadas
            </v-btn>

            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showAddressForm = true"
            >
              Añadir Dirección
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Mapa de direcciones -->
          <div class="address-map-container">
            <l-map
              v-if="hasAddressWithCoordinates"
              ref="map"
              :zoom="mapZoom"
              :center="mapCenter"
              :use-global-leaflet="false"
              style="height: 300px; width: 100%"
            >
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                layer-type="base"
                name="OpenStreetMap"
              ></l-tile-layer>

              <l-marker
                v-for="(address, index) in addressesWithCoordinates"
                :key="address.id || index"
                :lat-lng="[Number(address.latitude), Number(address.longitude)]"
                @click="
                  selectMarkerAddress(
                    this.addresses.findIndex((a) => a.id === address.id)
                  )
                "
              >
                <l-icon
                  v-if="address.isPrimary"
                  :icon-url="primaryMarkerIcon"
                  :icon-size="[25, 41]"
                  :icon-anchor="[12, 41]"
                ></l-icon>
                <l-tooltip>
                  <div>
                    <strong>{{ address.name }}</strong>
                    <div v-if="address.isPrimary" class="primary-badge">
                      Principal
                    </div>
                    <div>{{ formatAddress(address) }}</div>
                  </div>
                </l-tooltip>
              </l-marker>
            </l-map>

            <!-- Añadir aquí el control para ajustar el mapa -->
            <div v-if="hasAddressWithCoordinates" class="map-controls">
              <v-btn
                icon
                color="primary"
                size="small"
                variant="tonal"
                @click="fitAllMarkers"
                class="fit-markers-btn"
              >
                <v-icon style="font-size: 32px">mdi-fullscreen</v-icon>
                <v-tooltip activator="parent" location="top">
                  Ver todas las direcciones
                </v-tooltip>
              </v-btn>
            </div>

            <div v-else class="map-placeholder">
              <v-icon size="large" color="grey">mdi-map-marker-off</v-icon>
              <div class="text-subtitle-1 mt-2">
                No hay direcciones con coordenadas para mostrar
              </div>
            </div>
          </div>

          <v-card-text v-if="addresses.length > 0" class="pt-0">
            <v-text-field
              v-model="searchQuery"
              label="Buscar direcciones"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="mb-4"
              clearable
            ></v-text-field>
          </v-card-text>

          <v-card-text v-if="addresses.length === 0" class="text-center pa-5">
            <v-icon size="large" color="grey">mdi-map-marker-off</v-icon>
            <div class="text-h6 mt-3">No tienes direcciones guardadas</div>
            <div class="text-subtitle-1 mt-2">
              Añade tu primera dirección para comenzar
            </div>
            <v-btn
              color="primary"
              class="mt-4"
              prepend-icon="mdi-plus"
              @click="showAddressForm = true"
            >
              Añadir Dirección
            </v-btn>
          </v-card-text>

          <div v-else>
            <v-list>
              <v-list-item
                v-for="(address, index) in filteredAddresses"
                :key="address.id || index"
                :class="{
                  'bg-light-blue-lighten-5': address.isPrimary,
                  'selected-address':
                    selectedAddressIndex === getOriginalIndex(index),
                }"
                @click="selectAddress(getOriginalIndex(index))"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="address.isPrimary ? 'primary' : 'grey'"
                    class="mr-3"
                  >
                    <v-icon color="white">{{
                      address.isPrimary ? "mdi-home" : "mdi-map-marker"
                    }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold">
                  {{ address.name }}
                  <v-chip
                    v-if="address.isPrimary"
                    size="small"
                    color="primary"
                    class="ml-2"
                    >Principal</v-chip
                  >
                </v-list-item-title>

                <v-list-item-subtitle class="mt-1">
                  {{ formatAddress(address) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="d-flex">
                    <!-- Botón para geocodificar si no tiene coordenadas -->
                    <v-btn
                      v-if="!hasCoordinates(address)"
                      icon
                      variant="text"
                      color="warning"
                      @click.stop="geocodeAddress(index)"
                      :loading="geocodingIndex === index"
                    >
                      <v-icon>mdi-map-marker-plus</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Obtener coordenadas
                      </v-tooltip>
                    </v-btn>

                    <!-- Botón para mostrar en el mapa si tiene coordenadas -->
                    <v-btn
                      icon
                      variant="text"
                      color="primary"
                      @click.stop="showOnMap(index)"
                      :disabled="!hasCoordinates(address)"
                    >
                      <v-icon>mdi-map-marker</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Mostrar en el mapa
                      </v-tooltip>
                    </v-btn>

                    <!-- Botón para editar -->
                    <v-btn
                      icon
                      variant="text"
                      color="primary"
                      @click.stop="editAddress(index)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Editar
                      </v-tooltip>
                    </v-btn>

                    <!-- Botón para eliminar -->
                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      @click.stop="confirmDeleteAddress(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Eliminar
                      </v-tooltip>
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <!-- Mensaje informativo si hay direcciones sin coordenadas -->
            <v-alert
              v-if="
                addressesWithoutCoordinates.length > 0 && addresses.length > 0
              "
              type="info"
              variant="tonal"
              class="mt-2"
              closable
            >
              <v-alert-title>Información</v-alert-title>
              Tienes {{ addressesWithoutCoordinates.length }}
              {{
                addressesWithoutCoordinates.length === 1
                  ? "dirección"
                  : "direcciones"
              }}
              sin coordenadas. Puedes obtenerlas haciendo clic en el botón
              <v-icon size="small" class="mx-1">mdi-map-marker-plus</v-icon> de
              cada dirección o usar el botón "Obtener Coordenadas" para
              procesarlas todas.
            </v-alert>

            <!-- Mostrar mensaje si no hay resultados de búsqueda -->
            <v-card-text
              v-if="filteredAddresses.length === 0 && addresses.length > 0"
              class="text-center pa-5"
            >
              <v-icon size="large" color="grey">mdi-text-search</v-icon>
              <div class="text-subtitle-1 mt-2">
                No se encontraron direcciones que coincidan con tu búsqueda
              </div>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Formulario de Dirección (Modal) -->
    <v-dialog v-model="showAddressForm" max-width="700">
      <address-form
        :address="currentAddress"
        :is-editing="isEditing"
        @save="saveAddress"
        @cancel="cancelAddressForm"
      />
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar dirección -->
    <v-dialog v-model="showDeleteConfirmation" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Eliminar dirección</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar esta dirección? Esta acción no se
          puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteConfirmation = false"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="deleteAddress"> Eliminar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import AddressForm from "@/components/localization/AddressForm.vue";
import { mapGetters } from "vuex";
import axios from "axios";
import {
  LMap,
  LTileLayer,
  LMarker,
  LTooltip,
  LIcon,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

export default {
  name: "Address",
  components: {
    AddressForm,
    LMap,
    LTileLayer,
    LMarker,
    LTooltip,
    LIcon,
  },
  data() {
    return {
      addresses: [],
      showAddressForm: false,
      isEditing: false,
      currentAddress: null,
      editingIndex: -1,
      showDeleteConfirmation: false,
      addressToDeleteIndex: -1,
      showSnackbar: false,
      snackbarText: "",
      snackbarColor: "success",

      // Datos para el mapa
      mapZoom: 12,
      mapCenter: [40.416775, -3.70379], // Madrid por defecto
      selectedAddressIndex: -1,

      // Íconos personalizados
      primaryMarkerIcon: "/img/markers/primary-marker.png",
      regularMarkerIcon: "/img/markers/regular-marker.png",
      //primaryMarkerIcon:
      //"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      //regularMarkerIcon:
      //"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",

      // Añadir esta línea para el campo de búsqueda
      searchQuery: "",

      geocodingIndex: -1,
      geocodingAll: false,
    };
  },
  computed: {
    ...mapGetters({
      currentUser: "auth/currentUser",
    }),

    // Verificar si hay al menos una dirección con coordenadas
    hasAddressWithCoordinates() {
      return this.addressesWithCoordinates.length > 0;
    },

    // Calcular el centro del mapa basado en las direcciones
    calculatedMapCenter() {
      if (this.addresses.length === 0 || !this.hasAddressWithCoordinates) {
        return [40.416775, -3.70379]; // Madrid por defecto
      }

      // Si hay una dirección seleccionada con coordenadas, centrar en ella
      if (
        this.selectedAddressIndex >= 0 &&
        this.addresses[this.selectedAddressIndex] &&
        this.addresses[this.selectedAddressIndex].latitude &&
        this.addresses[this.selectedAddressIndex].longitude
      ) {
        return [
          this.addresses[this.selectedAddressIndex].latitude,
          this.addresses[this.selectedAddressIndex].longitude,
        ];
      }

      // Si hay una dirección principal con coordenadas, centrar en ella
      const primaryAddress = this.addresses.find(
        (addr) => addr.isPrimary && addr.latitude && addr.longitude
      );
      if (primaryAddress) {
        return [primaryAddress.latitude, primaryAddress.longitude];
      }

      // De lo contrario, encontrar la primera dirección con coordenadas
      const addressWithCoords = this.addresses.find(
        (addr) => addr.latitude && addr.longitude
      );
      if (addressWithCoords) {
        return [addressWithCoords.latitude, addressWithCoords.longitude];
      }

      return [40.416775, -3.70379]; // Madrid por defecto
    },

    // Filtrar direcciones según la búsqueda
    filteredAddresses() {
      if (!this.searchQuery) return this.addresses;

      const query = this.searchQuery.toLowerCase();
      return this.addresses.filter((address) => {
        return (
          address.name.toLowerCase().includes(query) ||
          (address.address && address.address.toLowerCase().includes(query)) ||
          (address.city && address.city.toLowerCase().includes(query)) ||
          (address.province &&
            address.province.toLowerCase().includes(query)) ||
          (address.country && address.country.toLowerCase().includes(query))
        );
      });
    },

    // Direcciones con coordenadas válidas para el mapa
    addressesWithCoordinates() {
      return this.addresses.filter((address) => this.hasCoordinates(address));
    },

    // Direcciones sin coordenadas
    addressesWithoutCoordinates() {
      return this.addresses.filter((address) => !this.hasCoordinates(address));
    },
  },
  watch: {
    // Actualizar el centro del mapa cuando cambia
    calculatedMapCenter: {
      handler(newCenter) {
        this.mapCenter = newCenter;
      },
      immediate: true,
    },
  },
  methods: {
    // En el método loadAddresses
    async loadAddresses() {
      try {
        const response = await axios.get("/auth/addresses");
        let addresses = response.data.addresses || [];

        console.log("Direcciones cargadas (raw):", addresses);

        // Convertir coordenadas de string a número y asegurarse de que sean válidas
        addresses = addresses.map((address) => ({
          ...address,
          latitude: address.latitude ? parseFloat(address.latitude) : null,
          longitude: address.longitude ? parseFloat(address.longitude) : null,
        }));

        // Filtrar direcciones sin coordenadas válidas para depuración
        const addressesWithCoords = addresses.filter(
          (addr) =>
            this.isValidCoordinate(addr.latitude) &&
            this.isValidCoordinate(addr.longitude)
        );

        console.log(
          "Direcciones con coordenadas válidas:",
          addressesWithCoords
        );

        this.addresses = addresses;

        // Actualizar el centro del mapa después de cargar las direcciones
        this.$nextTick(() => {
          console.log(
            "¿Hay direcciones con coordenadas?",
            this.hasAddressWithCoordinates
          );
          console.log("Centro del mapa calculado:", this.calculatedMapCenter);
          this.mapCenter = this.calculatedMapCenter;
          this.$forceUpdate();
        });
      } catch (error) {
        console.error("Error loading addresses:", error);
        this.showSnackbarMessage("Error al cargar las direcciones", "error");
      }
    },

    // Método auxiliar para validar coordenadas
    isValidCoordinate(value) {
      if (value === null || value === undefined) return false;
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num);
    },

    // Verificar si una dirección tiene coordenadas válidas
    hasCoordinates(address) {
      if (!address) return false;
      return (
        this.isValidCoordinate(address.latitude) &&
        this.isValidCoordinate(address.longitude)
      );
    },

    // Añadir este método para depuración
    inspectAddressStructure() {
      if (this.addresses.length === 0) {
        console.log("No hay direcciones para inspeccionar");
        return;
      }

      const sampleAddress = this.addresses[0];
      console.log(
        "Estructura de muestra de dirección:",
        Object.keys(sampleAddress)
      );
      console.log("Valores de muestra:", {
        id: sampleAddress.id,
        name: sampleAddress.name,
        latitude: sampleAddress.latitude,
        longitude: sampleAddress.longitude,
        // Mostrar otros campos relevantes
      });

      // Verificar si las coordenadas están anidadas en otro objeto
      // (a veces ocurre en APIs que devuelven estructuras complejas)
      for (const key in sampleAddress) {
        if (
          typeof sampleAddress[key] === "object" &&
          sampleAddress[key] !== null
        ) {
          console.log(`Objeto anidado en ${key}:`, sampleAddress[key]);
        }
      }
    },

    formatAddress(address) {
      let formattedAddress = "";

      if (address.address) {
        formattedAddress += address.address;
      }

      if (address.postalCode) {
        formattedAddress += formattedAddress
          ? `, ${address.postalCode}`
          : address.postalCode;
      }

      if (address.city) {
        formattedAddress += formattedAddress
          ? `, ${address.city}`
          : address.city;
      }

      if (address.province) {
        formattedAddress += formattedAddress
          ? `, ${address.province}`
          : address.province;
      }

      if (address.country) {
        formattedAddress += formattedAddress
          ? `, ${address.country}`
          : address.country;
      }

      return formattedAddress;
    },

    // Verificar si una dirección tiene coordenadas válidas
    hasCoordinates(address) {
      if (!address) return false;

      // Convertir a número si son strings
      const lat =
        typeof address.latitude === "string"
          ? parseFloat(address.latitude)
          : address.latitude;

      const lng =
        typeof address.longitude === "string"
          ? parseFloat(address.longitude)
          : address.longitude;

      // Verificar que sean números válidos y estén dentro de rangos válidos
      return (
        lat !== null &&
        lng !== null &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    },

    // Seleccionar una dirección de la lista
    selectAddress(index) {
      this.selectedAddressIndex = index;

      // Si la dirección tiene coordenadas, mostrarla en el mapa
      if (this.hasCoordinates(this.addresses[index])) {
        this.showOnMap(index);
      }
    },

    // Seleccionar una dirección al hacer clic en un marcador
    selectMarkerAddress(index) {
      this.selectedAddressIndex = index;
      // Hacer scroll a la dirección seleccionada
      this.$nextTick(() => {
        const element = document.querySelector(".selected-address");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    },

    // Mostrar dirección en el mapa
    showOnMap(index) {
      if (!this.hasCoordinates(this.addresses[index])) return;

      this.selectedAddressIndex = index;
      this.mapCenter = [
        this.addresses[index].latitude,
        this.addresses[index].longitude,
      ];
      this.mapZoom = 15; // Acercar para ver mejor
    },

    editAddress(index) {
      this.isEditing = true;
      this.editingIndex = index;
      this.currentAddress = { ...this.addresses[index] };
      this.showAddressForm = true;
    },

    async saveAddress(addressData) {
      try {
        if (this.isEditing) {
          // Actualizar dirección existente
          const response = await axios.put(
            `/auth/address/${addressData.id}`,
            addressData
          );

          // Si la dirección editada se marca como principal, actualizar las demás
          if (addressData.isPrimary) {
            this.addresses.forEach((addr, idx) => {
              if (idx !== this.editingIndex) {
                addr.isPrimary = false;
              }
            });
          }

          // Actualizar la dirección en el array local
          this.addresses[this.editingIndex] = response.data.address;
          this.showSnackbarMessage(
            "Dirección actualizada con éxito",
            "success"
          );
        } else {
          // Crear nueva dirección
          const response = await axios.post("/auth/address", addressData);

          // Si la nueva dirección se marca como principal, actualizar las demás
          if (addressData.isPrimary) {
            this.addresses.forEach((addr) => {
              addr.isPrimary = false;
            });
          }

          // Añadir la nueva dirección al array local
          this.addresses.push(response.data.address);
          this.showSnackbarMessage("Dirección añadida con éxito", "success");
        }

        // Cerrar el formulario
        this.showAddressForm = false;
        this.resetForm();

        // Actualizar el centro del mapa
        this.$nextTick(() => {
          this.mapCenter = this.calculatedMapCenter;
        });
      } catch (error) {
        console.error("Error saving address:", error);
        this.showSnackbarMessage("Error al guardar la dirección", "error");
      }
    },

    cancelAddressForm() {
      this.showAddressForm = false;
      this.resetForm();
    },

    resetForm() {
      this.currentAddress = null;
      this.isEditing = false;
      this.editingIndex = -1;
    },

    confirmDeleteAddress(index) {
      this.addressToDeleteIndex = index;
      this.showDeleteConfirmation = true;
    },

    async deleteAddress() {
      if (this.addressToDeleteIndex === -1) {
        this.showDeleteConfirmation = false;
        return;
      }

      try {
        const addressId = this.addresses[this.addressToDeleteIndex].id;
        await axios.delete(`/auth/address/${addressId}`);

        // Verificar si la dirección eliminada era la seleccionada
        if (this.selectedAddressIndex === this.addressToDeleteIndex) {
          this.selectedAddressIndex = -1;
        } else if (this.selectedAddressIndex > this.addressToDeleteIndex) {
          // Ajustar el índice si la dirección eliminada estaba antes
          this.selectedAddressIndex--;
        }

        // Eliminar la dirección del array local
        this.addresses.splice(this.addressToDeleteIndex, 1);

        // Si la dirección eliminada era la principal y hay más direcciones,
        // hacer que la primera sea la principal
        const wasMain = this.addresses[this.addressToDeleteIndex]?.isPrimary;
        if (wasMain && this.addresses.length > 0) {
          this.addresses[0].isPrimary = true;
          // Actualizar en el servidor
          await axios.put(`/auth/address/${this.addresses[0].id}`, {
            ...this.addresses[0],
            isPrimary: true,
          });
        }

        this.showSnackbarMessage("Dirección eliminada con éxito", "success");

        // Actualizar el centro del mapa
        this.$nextTick(() => {
          this.mapCenter = this.calculatedMapCenter;
        });
      } catch (error) {
        console.error("Error deleting address:", error);
        this.showSnackbarMessage("Error al eliminar la dirección", "error");
      } finally {
        this.showDeleteConfirmation = false;
        this.addressToDeleteIndex = -1;
      }
    },

    showSnackbarMessage(text, color = "success") {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.showSnackbar = true;
    },

    // Ajustar el mapa para mostrar todos los marcadores
    fitAllMarkers() {
      if (!this.$refs.map || !this.hasAddressWithCoordinates) {
        this.showSnackbarMessage(
          "No hay direcciones con coordenadas para mostrar",
          "warning"
        );
        return;
      }

      try {
        const map = this.$refs.map.leafletObject;
        const L = window.L || require("leaflet");

        // Verificar si tenemos una sola dirección con coordenadas
        if (this.addressesWithCoordinates.length === 1) {
          const addr = this.addressesWithCoordinates[0];
          const lat = parseFloat(addr.latitude);
          const lng = parseFloat(addr.longitude);

          if (!isNaN(lat) && !isNaN(lng)) {
            map.setView([lat, lng], 15);
            this.showSnackbarMessage(
              "Mostrando la única dirección con coordenadas",
              "info"
            );
          } else {
            this.showSnackbarMessage(
              "Las coordenadas de la dirección no son válidas",
              "error"
            );
          }
          return;
        }

        // Crear un grupo de marcadores
        const group = new L.FeatureGroup();
        let validMarkersAdded = 0;

        // Añadir cada marcador al grupo
        this.addressesWithCoordinates.forEach((addr) => {
          const lat = parseFloat(addr.latitude);
          const lng = parseFloat(addr.longitude);

          if (
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
          ) {
            L.marker([lat, lng]).addTo(group);
            validMarkersAdded++;
          }
        });

        // Si no se añadió ningún marcador válido
        if (validMarkersAdded === 0) {
          this.showSnackbarMessage(
            "No se encontraron coordenadas válidas",
            "error"
          );
          return;
        }

        // Si solo se añadió un marcador válido
        if (validMarkersAdded === 1) {
          const bounds = group.getBounds();
          map.setView(bounds.getCenter(), 15);
          this.showSnackbarMessage(
            "Mostrando la única dirección con coordenadas válidas",
            "info"
          );
          return;
        }

        // Ajustar el mapa a los límites del grupo
        map.fitBounds(group.getBounds(), {
          padding: [50, 50],
          maxZoom: 15,
        });

        this.showSnackbarMessage(
          `Mostrando ${validMarkersAdded} direcciones en el mapa`,
          "success"
        );
      } catch (error) {
        console.error("Error al ajustar el mapa:", error);
        this.showSnackbarMessage("Error al ajustar el mapa", "error");
      }
    },

    // Obtener el índice original de una dirección filtrada
    getOriginalIndex(filteredIndex) {
      if (!this.searchQuery) return filteredIndex;

      const address = this.filteredAddresses[filteredIndex];
      return this.addresses.findIndex((addr) => addr.id === address.id);
    },

    // Geocodificar una dirección para obtener sus coordenadas
    async geocodeAddress(index) {
      const address = this.addresses[index];
      if (!address) return;

      // Si ya tiene coordenadas, no hacer nada
      if (this.hasCoordinates(address)) return;

      // Construir una cadena de dirección completa para geocodificar
      let addressString = "";
      if (address.address) addressString += address.address;
      if (address.city)
        addressString += addressString ? `, ${address.city}` : address.city;
      if (address.province)
        addressString += addressString
          ? `, ${address.province}`
          : address.province;
      if (address.postalCode)
        addressString += addressString
          ? `, ${address.postalCode}`
          : address.postalCode;
      if (address.country)
        addressString += addressString
          ? `, ${address.country}`
          : address.country;

      if (!addressString) {
        if (!this.geocodingAll) {
          this.showSnackbarMessage(
            "No hay suficiente información para geocodificar esta dirección",
            "error"
          );
        }
        return Promise.reject(new Error("Información insuficiente"));
      }

      this.geocodingIndex = index;

      try {
        // Usar Nominatim para geocodificar
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            addressString
          )}&limit=1`,
          {
            headers: {
              "Accept-Language": "es",
            },
          }
        );

        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          if (!isNaN(lat) && !isNaN(lng)) {
            // Actualizar la dirección en el servidor
            const updatedAddress = {
              ...address,
              latitude: lat,
              longitude: lng,
            };

            const updateResponse = await axios.put(
              `/auth/address/${address.id}`,
              updatedAddress
            );

            // Actualizar en el array local
            this.addresses[index] = updateResponse.data.address;

            if (!this.geocodingAll) {
              this.showSnackbarMessage(
                "Coordenadas obtenidas con éxito",
                "success"
              );

              // Mostrar en el mapa
              this.$nextTick(() => {
                this.selectAddress(index);
              });
            }

            return Promise.resolve();
          } else {
            if (!this.geocodingAll) {
              this.showSnackbarMessage(
                "No se pudieron obtener coordenadas válidas",
                "error"
              );
            }
            return Promise.reject(new Error("Coordenadas inválidas"));
          }
        } else {
          if (!this.geocodingAll) {
            this.showSnackbarMessage("No se encontró la ubicación", "error");
          }
          return Promise.reject(new Error("Ubicación no encontrada"));
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
        if (!this.geocodingAll) {
          this.showSnackbarMessage(
            "Error al geocodificar la dirección",
            "error"
          );
        }
        return Promise.reject(error);
      } finally {
        this.geocodingIndex = -1;
      }
    },

    // Geocodificar todas las direcciones sin coordenadas
    async geocodeAllAddresses() {
      if (this.addressesWithoutCoordinates.length === 0) return;

      this.geocodingAll = true;
      let successCount = 0;
      let errorCount = 0;

      // Procesar cada dirección secuencialmente para no sobrecargar el servicio
      for (let i = 0; i < this.addressesWithoutCoordinates.length; i++) {
        const address = this.addressesWithoutCoordinates[i];
        const index = this.addresses.findIndex((a) => a.id === address.id);

        if (index === -1) continue;

        try {
          await this.geocodeAddress(index);
          successCount++;
        } catch (error) {
          console.error(`Error geocoding address ${address.name}:`, error);
          errorCount++;
        }

        // Pequeña pausa para no sobrecargar el servicio
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      this.geocodingAll = false;

      if (successCount > 0) {
        this.showSnackbarMessage(
          `Se obtuvieron coordenadas para ${successCount} direcciones. ${
            errorCount > 0 ? `Fallaron ${errorCount}.` : ""
          }`,
          errorCount > 0 ? "warning" : "success"
        );
      } else if (errorCount > 0) {
        this.showSnackbarMessage(
          `No se pudieron obtener coordenadas para ninguna dirección`,
          "error"
        );
      }
    },
  },
  async mounted() {
    await this.loadAddresses();
    this.inspectAddressStructure();
  },
};
</script>

<style scoped>
.address-map-container {
  height: 300px;
  width: 100%;
  position: relative;
}

.map-placeholder {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.selected-address {
  background-color: rgba(0, 0, 0, 0.05);
  border-left: 3px solid #1976d2;
}

.primary-badge {
  display: inline-block;
  background-color: #1976d2;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 2px;
}

/* Estilos responsivos */
@media (max-width: 600px) {
  .address-map-container {
    height: 200px;
  }
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.fit-markers-btn {
  background-color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
