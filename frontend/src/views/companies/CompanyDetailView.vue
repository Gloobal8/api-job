<template>
  <div class="company-detail">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4"></v-breadcrumbs>

          <v-card v-if="loading" class="pa-4 text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="mt-4">Loading company details...</p>
          </v-card>

          <template v-else-if="company">
            <!-- Company Header -->
            <v-card class="mb-6">
              <v-img
                :src="formatUrl(company.coverImage, false)"
                height="250"
                cover
                class="company-cover"
              ></v-img>

              <v-card-title class="company-header">
                <v-avatar size="120" class="company-logo">
                  <v-img
                    :src="formatUrl(company.logo, true)"
                    :alt="company.name"
                  ></v-img>
                </v-avatar>
                <div class="company-info">
                  <h1 class="text-h3 font-weight-bold mb-1">
                    {{ company.name }}
                  </h1>
                  <div class="d-flex align-center flex-wrap">
                    <v-chip
                      v-if="company.industry"
                      color="primary"
                      class="mr-2 mb-2"
                    >
                      {{ company.industry }}
                    </v-chip>
                    <v-chip v-if="company.size" class="mr-2 mb-2">
                      {{ company.size }} employees
                    </v-chip>
                    <v-chip v-if="company.founded" class="mr-2 mb-2">
                      Founded {{ company.founded }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-2">
                    <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                    <span class="text-body-1">{{ company.location }}</span>
                  </div>
                </div>
                <v-spacer></v-spacer>
                <div class="company-actions">
                  <v-btn
                    v-if="company.website"
                    color="primary"
                    variant="outlined"
                    :href="company.website"
                    target="_blank"
                    class="mr-2"
                  >
                    <v-icon class="mr-1">mdi-web</v-icon>
                    Website
                  </v-btn>
                  <v-btn
                    v-if="isOwner"
                    color="primary"
                    :to="`/companies/${company.id}/edit`"
                  >
                    <v-icon class="mr-1">mdi-pencil</v-icon>
                    Edit
                  </v-btn>
                </div>
              </v-card-title>
            </v-card>

            <v-row>
              <!-- Company Details -->
              <v-col cols="12" md="8">
                <v-card class="mb-6">
                  <v-card-title>About {{ company.name }}</v-card-title>
                  <v-card-text>
                    <div v-html="company.description"></div>
                  </v-card-text>
                </v-card>

                <!-- Company Jobs -->
                <v-card>
                  <v-card-title
                    class="d-flex justify-space-between align-center"
                  >
                    <span>Open Positions</span>
                    <v-chip color="primary"
                      >{{ companyJobs.length }} jobs</v-chip
                    >
                  </v-card-title>
                  <v-card-text>
                    <v-list v-if="companyJobs.length > 0">
                      <v-list-item
                        v-for="job in companyJobs"
                        :key="job.id"
                        :to="`/jobs/${job.id}`"
                        class="job-item mb-2"
                      >
                        <template v-slot:prepend>
                          <v-avatar color="primary" class="mr-3">
                            <span class="text-h6 white--text">{{
                              job.title.charAt(0)
                            }}</span>
                          </v-avatar>
                        </template>

                        <v-list-item-title class="text-h6 font-weight-bold">
                          {{ job.title }}
                        </v-list-item-title>

                        <v-list-item-subtitle>
                          <div class="d-flex align-center mt-1">
                            <v-icon size="small" class="mr-1"
                              >mdi-map-marker</v-icon
                            >
                            <span class="mr-4">{{ job.location }}</span>

                            <v-icon size="small" class="mr-1"
                              >mdi-briefcase-outline</v-icon
                            >
                            <span class="mr-4">{{ job.type }}</span>

                            <v-icon size="small" class="mr-1"
                              >mdi-currency-usd</v-icon
                            >
                            <span>{{ job.salary || "Negotiable" }}</span>
                          </div>
                        </v-list-item-subtitle>

                        <template v-slot:append>
                          <v-chip
                            v-if="job.featured"
                            color="amber"
                            size="small"
                            class="mr-2"
                          >
                            Featured
                          </v-chip>
                          <v-btn
                            color="primary"
                            variant="text"
                            :to="`/jobs/${job.id}`"
                          >
                            View
                          </v-btn>
                        </template>
                      </v-list-item>
                    </v-list>
                    <v-alert v-else type="info">
                      No open positions available at the moment.
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Company Sidebar -->
              <v-col cols="12" md="4">
                <v-card variant="elevated" class="company-details-card mb-6">
                  <v-card-title class="pb-0">Company Information</v-card-title>
                  <v-card-text>
                    <v-list density="compact" style="background: none">
                      <v-list-item v-if="company.industry">
                        <template v-slot:prepend>
                          <v-icon color="primary">mdi-domain</v-icon>
                        </template>
                        <v-list-item-title>Industry</v-list-item-title>
                        <v-list-item-subtitle>{{
                          company.industry
                        }}</v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="company.size">
                        <template v-slot:prepend>
                          <v-icon color="primary">mdi-account-group</v-icon>
                        </template>
                        <v-list-item-title>Company Size</v-list-item-title>
                        <v-list-item-subtitle
                          >{{ company.size }} employees</v-list-item-subtitle
                        >
                      </v-list-item>

                      <v-list-item v-if="company.founded">
                        <template v-slot:prepend>
                          <v-icon color="primary">mdi-calendar</v-icon>
                        </template>
                        <v-list-item-title>Founded</v-list-item-title>
                        <v-list-item-subtitle>{{
                          company.founded
                        }}</v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="company.location">
                        <template v-slot:prepend>
                          <v-icon color="primary">mdi-map-marker</v-icon>
                        </template>
                        <v-list-item-title>Location</v-list-item-title>
                        <v-list-item-subtitle>{{
                          company.location
                        }}</v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="company.website">
                        <template v-slot:prepend>
                          <v-icon color="primary">mdi-web</v-icon>
                        </template>
                        <v-list-item-title>Website</v-list-item-title>
                        <v-list-item-subtitle>
                          <a :href="company.website" target="_blank">{{
                            formatUrl(company.website)
                          }}</a>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="company.email">
                        <template v-slot:prepend>
                          <v-icon color="primary">mdi-email</v-icon>
                        </template>
                        <v-list-item-title>Email</v-list-item-title>
                        <v-list-item-subtitle>
                          <a :href="`mailto:${company.email}`">{{
                            company.email
                          }}</a>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="company.phone">
                        <template v-slot:prepend>
                          <v-icon color="primary">mdi-phone</v-icon>
                        </template>
                        <v-list-item-title>Phone</v-list-item-title>
                        <v-list-item-subtitle>
                          <a :href="`tel:${company.phone}`">{{
                            company.phone
                          }}</a>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <v-card
                  variant="elevated"
                  v-if="company.socialMedia && hasSocialMedia"
                  class="social-media-card mb-6"
                >
                  <v-card-title class="pb-0">Social Media</v-card-title>
                  <v-card-text>
                    <div class="d-flex flex-wrap">
                      <v-btn
                        v-if="company.socialMedia.linkedin"
                        icon
                        color="blue-darken-3"
                        :href="company.socialMedia.linkedin"
                        target="_blank"
                        class="mr-2 mb-2"
                      >
                        <v-icon>mdi-linkedin</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="company.socialMedia.twitter"
                        icon
                        color="light-blue"
                        :href="company.socialMedia.twitter"
                        target="_blank"
                        class="mr-2 mb-2"
                      >
                        <v-icon>mdi-twitter</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="company.socialMedia.facebook"
                        icon
                        color="blue-darken-4"
                        :href="company.socialMedia.facebook"
                        target="_blank"
                        class="mr-2 mb-2"
                      >
                        <v-icon>mdi-facebook</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="company.socialMedia.instagram"
                        icon
                        color="deep-orange"
                        :href="company.socialMedia.instagram"
                        target="_blank"
                        class="mr-2 mb-2"
                      >
                        <v-icon>mdi-instagram</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="company.socialMedia.github"
                        icon
                        color="grey-darken-3"
                        :href="company.socialMedia.github"
                        target="_blank"
                        class="mr-2 mb-2"
                      >
                        <v-icon>mdi-github</v-icon>
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

                <v-card
                  variant="elevated"
                  v-if="similarCompanies.length > 0"
                  class="similar-companies-card mb-6"
                >
                  <v-card-title class="pb-0">Similar Companies</v-card-title>
                  <v-card-text>
                    <v-list density="compact" style="background: none">
                      <v-list-item
                        v-for="similarCompany in similarCompanies"
                        :key="similarCompany.id"
                        :to="`/companies/${similarCompany.id}`"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="40">
                            <v-img
                              :src="
                                formatUrl(similarCompany.logo, true) ||
                                'https://via.placeholder.com/40'
                              "
                              :alt="similarCompany.name"
                            ></v-img>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{
                          similarCompany.name
                        }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ similarCompany.jobCount }} open positions
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <v-alert v-else type="error" class="mb-6">
            Company not found or has been removed.
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "CompanyDetailView",
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      company: null,
      companyJobs: [],
      similarCompanies: [],
      loading: true,
      error: null,
      breadcrumbs: [
        { title: "Home", to: "/" },
        { title: "Companies", to: "/companies" },
        { title: "Company Details", disabled: true },
      ],
    };
  },
  computed: {
    isOwner() {
      return (
        this.$store.getters.isAuthenticated &&
        this.company &&
        this.company.userId === this.$store.state.auth.user?.id
      );
    },
    hasSocialMedia() {
      if (!this.company || !this.company.socialMedia) return false;
      const { linkedin, twitter, facebook, instagram, github } =
        this.company.socialMedia;
      return linkedin || twitter || facebook || instagram || github;
    },
  },
  created() {
    this.fetchCompanyDetails();
  },
  methods: {
    async fetchCompanyDetails() {
      this.loading = true;
      this.error = null;

      try {
        // Intentar obtener datos de la API
        // const response = await this.$axios.get(`/companies/${this.id}`);
        // this.company = response.data;

        // Simulación de llamada a la API con setTimeout
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos de ejemplo (en una aplicación real, esto vendría de la API)
        this.company = {
          id: this.id,
          name: "Tech Solutions Inc.",
          logo: null, // Usará formatUrl para generar una imagen aleatoria
          coverImage: null, // Usará formatUrl para generar una imagen aleatoria
          industry: "Information Technology",
          size: "50-200",
          founded: "2010",
          location: "New York, USA",
          website: "https://techsolutions.example.com",
          email: "info@techsolutions.example.com",
          phone: "+1 (555) 123-4567",
          description: `<p>Tech Solutions Inc. is a leading technology company specializing in web and mobile application development, cloud solutions, and digital transformation. We help businesses of all sizes leverage technology to improve efficiency, enhance customer experiences, and drive growth.</p>
          <p>Our team of experienced developers, designers, and consultants work closely with clients to understand their unique challenges and develop tailored solutions that meet their specific needs. We pride ourselves on delivering high-quality, scalable, and maintainable software that helps our clients achieve their business goals.</p>
          <div class="mb-6">
          <h3 class="text-h6 mb-3">Our Services</h3>
          <ul class="ul">
            <li>Custom Web Application Development</li>
            <li>Mobile App Development (iOS and Android)</li>
            <li>Cloud Migration and Infrastructure</li>
            <li>UI/UX Design</li>
            <li>Digital Transformation Consulting</li>
            <li>Maintenance and Support</li>
          </ul>
          </div>
          <div class="mb-6">
          <h3 class="text-h6 mb-3">Our Approach</h3>
          <p>We follow an agile development methodology, which allows us to deliver value incrementally, adapt to changing requirements, and maintain transparency throughout the development process. Our collaborative approach ensures that clients are involved at every stage, from initial concept to final delivery.</p>
          <p>At Tech Solutions Inc., we are committed to staying at the forefront of technology trends and best practices, enabling us to provide innovative solutions that give our clients a competitive edge in their respective industries.</p>
          </div>`,
          socialMedia: {
            linkedin: "https://linkedin.com/company/techsolutions",
            twitter: "https://twitter.com/techsolutions",
            facebook: "https://facebook.com/techsolutions",
            instagram: "https://instagram.com/techsolutions",
            github: "https://github.com/techsolutions",
          },
        };

        // Get company jobs
        this.companyJobs = [
          {
            id: 1,
            title: "Senior Frontend Developer",
            location: "New York, USA",
            type: "Full-time",
            salary: "$80,000 - $120,000",
            featured: true,
          },
          {
            id: 2,
            title: "Backend Engineer",
            location: "Remote",
            type: "Full-time",
            salary: "$90,000 - $130,000",
          },
          {
            id: 3,
            title: "DevOps Engineer",
            location: "New York, USA",
            type: "Full-time",
            salary: "$85,000 - $115,000",
          },
          {
            id: 4,
            title: "UI/UX Designer",
            location: "New York, USA",
            type: "Full-time",
            salary: "$70,000 - $100,000",
          },
        ];

        // Get similar companies
        this.similarCompanies = [
          {
            id: 2,
            name: "InnovateSoft",
            logo: null,
            jobCount: 8,
          },
          {
            id: 3,
            name: "DesignHub",
            logo: null,
            jobCount: 5,
          },
          {
            id: 4,
            name: "DataCorp",
            logo: null,
            jobCount: 12,
          },
        ];

        // Update breadcrumbs with company name
        if (this.company) {
          this.breadcrumbs[2].title = this.company.name;
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
        this.error = "Failed to load company details. Please try again later.";
      } finally {
        this.loading = false;
      }
    },

    formatUrl(path, isLogo = false) {
      if (!path) {
        // Generar IDs consistentes basados en el ID de la empresa
        const companyId = parseInt(this.id);
        const baseId = companyId * 100; // Asegurar diferentes IDs para cada empresa

        if (isLogo) {
          // Para logos, usar imágenes de personas o avatares
          return `https://randomuser.me/api/portraits/${
            companyId % 2 ? "men" : "women"
          }/${baseId % 99 || 1}.jpg`;
        } else {
          // Para imágenes de portada, usar imágenes de negocios/oficinas
          // Usar colecciones específicas de Unsplash para imágenes de negocios
          const coverImages = [
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
            "https://images.unsplash.com/photo-1497215842964-222b430dc094",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
            "https://images.unsplash.com/photo-1556761175-b413da4baf72",
            "https://images.unsplash.com/photo-1462826303086-329426d1aef5",
            "https://images.unsplash.com/photo-1564069114553-7215e1ff1890",
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
            "https://images.unsplash.com/photo-1577412647305-991150c7d163",
          ];

          // Usar el ID de la empresa para seleccionar una imagen consistente
          const imageIndex = companyId % coverImages.length;
          return `${coverImages[imageIndex]}?auto=format&fit=crop&w=1500&q=80`;
        }
      }

      if (path.startsWith("http") || path.startsWith("https")) {
        return path;
      }

      // Asumiendo que tienes una URL base para tus recursos
      const baseUrl = "http://localhost:5000"; // Ajusta según tu configuración
      return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    },
  },
};
</script>

<style scoped>
.company-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 16px;
}

.company-logo {
  margin-right: 24px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.company-info {
  flex: 1;
  min-width: 200px;
}

.company-actions {
  margin-top: 16px;
}

.company-cover {
  position: relative;
}

.company-details-card,
.social-media-card,
.similar-companies-card {
  transition: box-shadow 0.2s;
  background: whitesmoke;
}

.company-details-card:hover,
.social-media-card:hover,
.similar-companies-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

.job-item {
  border-radius: 8px;
  transition: background-color 0.2s;
  margin-bottom: 8px;
}

.job-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

@media (max-width: 600px) {
  .company-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .company-logo {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .company-actions {
    margin-top: 16px;
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
