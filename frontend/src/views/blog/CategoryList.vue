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
              <v-btn
                icon
                size="small"
                color="primary"
                @click="editCategory(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
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
                variant="outlined"
                density="comfortable"
              ></v-text-field>

              <v-text-field
                v-model="category.slug"
                label="URL Slug"
                hint="Leave blank to generate from name"
                persistent-hint
                variant="outlined"
                density="comfortable"
              ></v-text-field>

              <v-textarea
                v-model="category.description"
                label="Description"
                variant="outlined"
                rows="3"
              ></v-textarea>

              <v-select
                v-model="category.parentId"
                :items="parentOptions"
                label="Parent Category"
                variant="outlined"
                density="comfortable"
                clearable
              ></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="resetForm"> Cancel </v-btn>
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
          <v-btn variant="text" @click="deleteDialog = false"> Cancel </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="deleteCategory"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Setup
const store = useStore();
const form = ref(null);
const valid = ref(false);
const editMode = ref(false);
const saving = ref(false);
const deleting = ref(false);
const deleteDialog = ref(false);
const categoryToDelete = ref(null);

// Estado local
const category = ref(getEmptyCategory());

// Headers para la tabla
const headers = [
  { title: "Name", key: "name" },
  { title: "Slug", key: "slug" },
  { title: "Posts", key: "postCount", sortable: false },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    align: "center",
  },
];

// Reglas de validación
const nameRules = [
  (v) => !!v || "Name is required",
  (v) => (v && v.length <= 50) || "Name must be less than 50 characters",
];

// Propiedades computadas
const categories = computed(() => store.state.blog.categories || []);
const posts = computed(() => store.state.blog.posts || []);
const loading = computed(() => store.state.blog.loading);

const parentOptions = computed(() => {
  // Filtrar la categoría actual para evitar referencias circulares
  return categories.value
    .filter((cat) => !editMode.value || cat.id !== category.value.id)
    .map((cat) => ({
      title: cat.name,
      value: cat.id,
    }));
});

// Métodos
function getEmptyCategory() {
  return {
    name: "",
    slug: "",
    description: "",
    parentId: null,
  };
}

function getPostCount(categoryId) {
  return posts.value.filter((post) => post.categoryId === categoryId).length;
}

function editCategory(cat) {
  editMode.value = true;
  category.value = { ...cat };
}

function confirmDelete(cat) {
  if (getPostCount(cat.id) > 0) {
    store.dispatch("snackbar/showSnackbar", {
      text: "Cannot delete a category that has posts",
      color: "error",
    });
    return;
  }

  categoryToDelete.value = cat;
  deleteDialog.value = true;
}

async function saveCategory() {
  if (!form.value.validate()) return;

  try {
    saving.value = true;

    if (editMode.value) {
      await store.dispatch("blog/updateCategory", {
        id: category.value.id,
        categoryData: category.value,
      });
      store.dispatch("snackbar/showSnackbar", {
        text: "Category updated successfully",
        color: "success",
      });
    } else {
      await store.dispatch("blog/createCategory", category.value);
      store.dispatch("snackbar/showSnackbar", {
        text: "Category created successfully",
        color: "success",
      });
    }

    resetForm();
  } catch (error) {
    console.error("Error saving category:", error);
    store.dispatch("snackbar/showSnackbar", {
      text: error.response?.data?.message || "Error saving category",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

async function deleteCategory() {
  try {
    deleting.value = true;
    await store.dispatch("blog/deleteCategory", categoryToDelete.value.id);
    store.dispatch("snackbar/showSnackbar", {
      text: "Category deleted successfully",
      color: "success",
    });
    deleteDialog.value = false;
    categoryToDelete.value = null;
  } catch (error) {
    console.error("Error deleting category:", error);
    store.dispatch("snackbar/showSnackbar", {
      text: error.response?.data?.message || "Error deleting category",
      color: "error",
    });
  } finally {
    deleting.value = false;
  }
}

function resetForm() {
  editMode.value = false;
  category.value = getEmptyCategory();
  if (form.value) {
    form.value.resetValidation();
  }
}

// Ciclo de vida
onMounted(async () => {
  await store.dispatch("blog/fetchCategories");
  await store.dispatch("blog/fetchPosts", { limit: 1000 }); // Obtener todos los posts para contar
});
</script>
