<template>
  <v-snackbar
    :value="show"
    :color="color"
    :timeout="timeout"
    :multi-line="text.length > 40"
    @input="onSnackbarInput"
    top
  >
    {{ text }}
    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" @click="hideSnackbar"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Snackbar",
  computed: {
    ...mapState("snackbar", ["show", "text", "color", "timeout"]),
  },
  methods: {
    ...mapActions("snackbar", ["hideSnackbar"]),
    onSnackbarInput(value) {
      if (!value) {
        this.hideSnackbar();
      }
    },
  },
};
</script>
