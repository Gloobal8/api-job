<template>
  <v-card outlined>
    <v-card-title>
      {{ isEditing ? "Editar testimonio" : "Dejar un testimonio" }}
    </v-card-title>

    <v-card-text>
      <v-form ref="form" v-model="valid">
        <div class="d-flex flex-column align-center mb-4">
          <div class="text-subtitle-1 mb-2">Tu valoración</div>
          <v-rating
            v-model="testimonialForm.rating"
            color="amber"
            hover
            size="36"
            class="mb-2"
          ></v-rating>
        </div>

        <v-textarea
          v-model="testimonialForm.content"
          label="Tu testimonio"
          :rules="contentRules"
          required
          outlined
          counter="500"
          rows="4"
          hint="Comparte tu experiencia con la plataforma"
          persistent-hint
        ></v-textarea>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="testimonialForm.position"
              label="Tu puesto de trabajo"
              outlined
              hint="Opcional"
              persistent-hint
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="testimonialForm.company"
              label="Tu empresa"
              outlined
              hint="Opcional"
              persistent-hint
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('cancel')"> Cancelar </v-btn>
      <v-btn
        color="primary"
        :disabled="!valid || testimonialForm.rating === 0 || submitting"
        :loading="submitting"
        @click="submitTestimonial"
      >
        {{ isEditing ? "Actualizar" : "Enviar" }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "TestimonialForm",
  props: {
    testimonial: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      valid: false,
      submitting: false,
      testimonialForm: {
        content: "",
        rating: 5,
        position: "",
        company: "",
      },
      contentRules: [
        (v) => !!v || "El testimonio es obligatorio",
        (v) =>
          (v && v.length >= 20) ||
          "El testimonio debe tener al menos 20 caracteres",
        (v) =>
          (v && v.length <= 500) ||
          "El testimonio debe tener máximo 500 caracteres",
      ],
    };
  },
  computed: {
    isEditing() {
      return !!this.testimonial;
    },
  },
  created() {
    if (this.isEditing) {
      this.testimonialForm = {
        content: this.testimonial.content,
        rating: this.testimonial.rating,
        position: this.testimonial.position || "",
        company: this.testimonial.company || "",
      };
    }
  },
  methods: {
    ...mapActions({
      createTestimonial: "testimonials/createTestimonial",
      updateTestimonial: "testimonials/updateTestimonial",
    }),
    async submitTestimonial() {
      if (this.$refs.form.validate() && this.testimonialForm.rating > 0) {
        try {
          this.submitting = true;

          if (this.isEditing) {
            await this.updateTestimonial({
              id: this.testimonial.id,
              testimonialData: this.testimonialForm,
            });
            this.$emit("success", "Testimonio actualizado correctamente");
          } else {
            await this.createTestimonial(this.testimonialForm);
            this.$emit(
              "success",
              "Testimonio enviado correctamente. Será revisado antes de aparecer públicamente."
            );
          }
        } catch (error) {
          console.error("Error submitting testimonial:", error);
          this.$emit(
            "error",
            error.response?.data?.message || "Error al guardar el testimonio"
          );
        } finally {
          this.submitting = false;
        }
      }
    },
  },
};
</script>
