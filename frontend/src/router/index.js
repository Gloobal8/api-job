import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue";
import DashboardView from "../views/DashboardView.vue";
import JobsView from "../views/jobs/JobsView.vue";
import CompaniesView from "../views/CompaniesView.vue";
import store from "../store";

// Import new views
import CheckoutView from "../views/CheckoutView.vue";
import PaymentSuccessView from "../views/PaymentSuccessView.vue";
import InvoicesView from "../views/admin/InvoicesView.vue";
import InvoiceDetailView from "../views/InvoiceDetailView.vue";
import CustomFieldsView from "@/views/CustomFieldsView.vue";
import CreateJobView from "@/views/jobs/CreateJobView.vue";
import EditJobView from "@/views/jobs/EditJobView.vue";
import LanguagesView from "@/views/LanguagesView.vue";
import TestimonialsView from "@/views/TestimonialsView.vue";
import BlogList from "@/views/blog/BlogList.vue";
import BlogDetail from "@/views/blog/BlogDetail.vue";
import BlogCreate from "@/views/blog/BlogCreate.vue";
import CategoryList from "@/views/blog/CategoryList.vue";

// ADMIN
import CouponsView from "../views/admin/CouponsView.vue";
import TestimonialsAdmin from "@/views/admin/TestimonialsAdmin.vue";
import PackagesView from "../views/admin/PackagesView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/jobs",
    name: "jobs",
    component: JobsView,
  },
  {
    path: "/jobs/create",
    name: "CreateJob",
    component: CreateJobView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/jobs/:jobId/edit",
    name: "EditJob",
    component: EditJobView,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/jobs/:id",
    name: "JobDetail",
    component: () => import("../views/jobs/JobDetailView.vue"),
    props: true,
  },
  {
    path: "/companies",
    name: "companies",
    component: CompaniesView,
  },
  {
    path: "/companies/:id",
    name: "CompanyDetail",
    component: () => import("../views/companies/CompanyDetailView.vue"),
    props: true,
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/education",
    name: "profile-education",
    component: () => import("../views/ProfileEducationView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/experience",
    name: "profile-experience",
    component: () => import("../views/ProfileExperienceView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/transactions",
    name: "profile-transactions",
    component: () => import("../views/TransactionsView.vue"),
    meta: { requiresAuth: true },
  },

  // New routes for packages and payments
  {
    path: "/packages",
    name: "PackagesView",
    component: PackagesView,
  },
  {
    path: "/checkout/:id",
    name: "CheckoutView",
    component: CheckoutView,
    meta: { requiresAuth: true },
  },
  {
    path: "/payment/success/:id",
    name: "PaymentSuccessView",
    component: PaymentSuccessView,
    meta: { requiresAuth: true },
  },
  {
    path: "/invoices",
    name: "InvoicesView",
    component: InvoicesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/invoices/:id",
    name: "InvoiceDetailView",
    component: InvoiceDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: "/testimonials",
    name: "Testimonials",
    component: TestimonialsView,
  },
  {
    path: "/blog",
    name: "BlogList",
    component: BlogList,
  },
  {
    path: "/blog/category/:slug",
    name: "BlogCategory",
    component: BlogList,
    props: true,
  },
  {
    path: "/blog/author/:id",
    name: "BlogAuthor",
    component: BlogList,
    props: true,
  },
  {
    path: "/blog/tag/:tag",
    name: "BlogTag",
    component: BlogList,
    props: true,
  },
  {
    path: "/blog/create",
    name: "BlogCreate",
    component: BlogCreate,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/blog/edit/:id",
    name: "BlogEdit",
    component: BlogCreate,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/blog/:id",
    name: "BlogDetail",
    component: BlogDetail,
  },

  {
    path: "/site-map",
    name: "SiteMap",
    component: () => import("../views/SitemapView.vue"),
    meta: { requiresAuth: true, adminOnly: true }, // Opcional: restringir acceso solo a administradores
  },

  // Admin routes (optional)
  {
    path: "/admin/packages",
    name: "AdminPackagesView",
    component: () => import("../views/admin/PackagesView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/invoices",
    name: "AdminInvoicesView",
    component: () => import("../views/admin/InvoicesView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/coupons",
    name: "AdminCoupons",
    component: CouponsView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/testimonials",
    name: "TestimonialsAdmin",
    component: TestimonialsAdmin,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },

  // Custom Fields
  {
    path: "/admin/custom-fields",
    name: "CustomFields",
    component: CustomFieldsView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },

  // Idiomas
  {
    path: "/admin/languages",
    name: "Languages",
    component: LanguagesView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },

  //blog
  {
    path: "/admin/blog/categories",
    name: "CategoryList",
    component: CategoryList,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else if (to.matched.some((record) => record.meta.requiresAdmin)) {
      // Check if user is admin
      const user = store.state.auth.user;
      if (user && user.role === "admin") {
        next();
      } else {
        next({ path: "/dashboard" });
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
