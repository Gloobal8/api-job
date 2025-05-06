<template>
  <v-container class="category-list">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Categories</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="categories"
            :loading="loading"
            :items-per-page="10"
            class="elevation-1"
          >
            <template v-slot:item.postCount="{ item }">
              {{ getPostCount(item.id) }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn small icon color="primary" @click="editCategory(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                small
                icon
                color="error"
                @click="confirmDelete(item)"
                :disabled="getPostCount(item.id) > 0"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            {{ editMode ? "Edit Category" : "Add Category" }}
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="category.name"
                label="Category Name"
                :rules="nameRules"
                required
                outlined
              ></v-text-field>

              <v-text-field
                v-model="category.slug"
                label="URL Slug"
                hint="Leave blank to generate from name"
                persistent-hint
                outlined
              ></v-text-field>

              <v-textarea
                v-model="category.description"
                label="Description"
                outlined
                rows="3"
              ></v-textarea>

              <v-select
                v-model="category.parentId"
                :items="parentOptions"
                label="Parent Category"
                outlined
                clearable
              ></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="resetForm"> Cancel </v-btn>
            <v-btn
              color="primary"
              :disabled="!valid"
              :loading="saving"
              @click="saveCategory"
            >
              {{ editMode ? "Update" : "Add" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Delete Category</v-card-title>
        <v-card-text>
          Are you sure you want to delete the category "{{
            categoryToDelete?.name
          }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false"> Cancel </v-btn>
          <v-btn color="error" text @click="deleteCategory" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "CategoryList",
  data() {
    return {
      valid: false,
      editMode: false,
      saving: false,
      deleting: false,
      deleteDialog: false,
      categoryToDelete: null,
      category: this.getEmptyCategory(),
      headers: [
        { title: "Name", value: "name" },
        { title: "Slug", value: "slug" },
        { title: "Posts", value: "postCount", sortable: false },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
      nameRules: [
        (v) => !!v || "Name is required",
        (v) => (v && v.length <= 50) || "Name must be less than 50 characters",
      ],
    };
  },
  computed: {
    ...mapState({
      categories: (state) => state.blog.categories,
      posts: (state) => state.blog.posts,
      loading: (state) => state.blog.loading,
    }),
    parentOptions() {
      // Filter out the current category being edited to prevent circular references
      return this.categories
        .filter((cat) => !this.editMode || cat.id !== this.category.id)
        .map((cat) => ({
          text: cat.name,
          value: cat.id,
        }));
    },
  },
  created() {
    this.fetchCategories();
    this.fetchPosts({ limit: 1000 }); // Get all posts for counting
  },
  methods: {
    ...mapActions({
      fetchCategories: "blog/fetchCategories",
      fetchPosts: "blog/fetchPosts",
      createCategory: "blog/createCategory",
      updateCategory: "blog/updateCategory",
      deleteCategoryAction: "blog/deleteCategory",
    }),
    getEmptyCategory() {
      return {
        name: "",
        slug: "",
        description: "",
        parentId: null,
      };
    },
    getPostCount(categoryId) {
      return this.posts.filter((post) => post.categoryId === categoryId).length;
    },
    editCategory(category) {
      this.editMode = true;
      this.category = { ...category };
    },
    confirmDelete(category) {
      if (this.getPostCount(category.id) > 0) {
        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Cannot delete a category that has posts",
          color: "error",
        });
        return;
      }

      this.categoryToDelete = category;
      this.deleteDialog = true;
    },
    async saveCategory() {
      if (!this.$refs.form.validate()) return;

      try {
        this.saving = true;

        if (this.editMode) {
          await this.updateCategory({
            id: this.category.id,
            categoryData: this.category,
          });
          this.$store.dispatch("snackbar/showSnackbar", {
            text: "Category updated successfully",
            color: "success",
          });
        } else {
          await this.createCategory(this.category);
          this.$store.dispatch("snackbar/showSnackbar", {
            text: "Category created successfully",
            color: "success",
          });
        }

        this.resetForm();
      } catch (error) {
        console.error("Error saving category:", error);
        this.$store.dispatch("snackbar/showSnackbar", {
          text: error.response?.data?.message || "Error saving category",
          color: "error",
        });
      } finally {
        this.saving = false;
      }
    },
    async deleteCategory() {
      try {
        this.deleting = true;
        await this.deleteCategoryAction(this.categoryToDelete.id);
        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Category deleted successfully",
          color: "success",
        });
        this.deleteDialog = false;
        this.categoryToDelete = null;
      } catch (error) {
        console.error("Error deleting category:", error);
        this.$store.dispatch("snackbar/showSnackbar", {
          text: error.response?.data?.message || "Error deleting category",
          color: "error",
        });
      } finally {
        this.deleting = false;
      }
    },
    resetForm() {
      this.editMode = false;
      this.category = this.getEmptyCategory();
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },
  },
};
</script>
