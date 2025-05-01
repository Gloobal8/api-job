<template>
  <v-card flat class="testimonial-slider">
    <v-card-title class="d-flex justify-center">
      <h2 class="text-h4 font-weight-bold">{{ title }}</h2>
    </v-card-title>

    <v-card-subtitle class="text-center pb-0">
      {{ subtitle }}
    </v-card-subtitle>

    <v-card-text>
      <v-skeleton-loader
        v-if="loading"
        type="card, card, card"
        class="mx-auto"
      ></v-skeleton-loader>

      <div v-else>
        <v-slide-group v-model="selectedItem" show-arrows center-active>
          <v-slide-group-item
            v-for="testimonial in testimonials"
            :key="testimonial.id"
          >
            <v-card
              class="ma-4 testimonial-card"
              width="320"
              height="280"
              outlined
            >
              <v-card-text>
                <div class="d-flex flex-column align-center">
                  <v-avatar size="80" class="mb-3">
                    <v-img
                      v-if="testimonial.userAvatar"
                      :src="testimonial.userAvatar"
                      alt="Avatar"
                    ></v-img>
                    <v-icon v-else size="40" color="primary"
                      >mdi-account-circle</v-icon
                    >
                  </v-avatar>

                  <div class="text-h6 font-weight-bold">
                    {{ testimonial.userName }}
                  </div>

                  <div
                    v-if="testimonial.position || testimonial.company"
                    class="text-subtitle-2 text-center grey--text mb-3"
                  >
                    {{ testimonial.position }}
                    <template
                      v-if="testimonial.position && testimonial.company"
                    >
                      en
                    </template>
                    {{ testimonial.company }}
                  </div>

                  <v-rating
                    :value="testimonial.rating"
                    color="amber"
                    dense
                    half-increments
                    readonly
                    size="18"
                  ></v-rating>
                </div>

                <div class="mt-3 testimonial-content text-center">
                  <v-icon color="grey lighten-1" class="quote-icon"
                    >mdi-format-quote-open</v-icon
                  >
                  <p class="text-body-1">
                    {{ truncateText(testimonial.content, 150) }}
                  </p>
                  <v-icon color="grey lighten-1" class="quote-icon"
                    >mdi-format-quote-close</v-icon
                  >
                </div>
              </v-card-text>
            </v-card>
          </v-slide-group-item>
        </v-slide-group>

        <div v-if="testimonials.length === 0" class="text-center py-6">
          <v-icon size="64" color="grey lighten-1"
            >mdi-emoticon-sad-outline</v-icon
          >
          <p class="text-h6 grey--text text--darken-1 mt-2">
            No hay testimonios disponibles
          </p>
        </div>
      </div>
    </v-card-text>

    <v-card-actions
      v-if="showActionButton && actionButtonLink"
      class="justify-center pb-6"
    >
      <v-btn :to="actionButtonLink" color="primary" outlined rounded>
        {{ actionButtonText }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "TestimonialSlider",
  props: {
    title: {
      type: String,
      default: "Lo que dicen nuestros usuarios",
    },
    subtitle: {
      type: String,
      default: "Descubre por qué nuestros usuarios confían en nosotros",
    },
    featuredOnly: {
      type: Boolean,
      default: true,
    },
    limit: {
      type: Number,
      default: 10,
    },
    showActionButton: {
      type: Boolean,
      default: true,
    },
    actionButtonText: {
      type: String,
      default: "Ver todos los testimonios",
    },
    actionButtonLink: {
      type: String,
      default: "/testimonials",
    },
  },
  data() {
    return {
      selectedItem: 0,
    };
  },
  computed: {
    ...mapState({
      allTestimonials: (state) => state.testimonials.testimonials,
      featuredTestimonials: (state) => state.testimonials.featuredTestimonials,
      loading: (state) => state.testimonials.loading,
    }),
    testimonials() {
      const source = this.featuredOnly
        ? this.featuredTestimonials
        : this.allTestimonials;
      return source.slice(0, this.limit);
    },
  },
  created() {
    if (this.featuredOnly) {
      this.fetchFeaturedTestimonials();
    } else {
      this.fetchTestimonials({ approved: true });
    }
  },
  methods: {
    ...mapActions({
      fetchTestimonials: "testimonials/fetchTestimonials",
      fetchFeaturedTestimonials: "testimonials/fetchFeaturedTestimonials",
    }),
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + "...";
    },
  },
};
</script>

<style scoped>
.testimonial-card {
  transition: transform 0.3s;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.testimonial-content {
  position: relative;
  padding: 0 10px;
}

.quote-icon {
  opacity: 0.3;
  font-size: 18px;
}
</style>