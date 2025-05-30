vue
<template>
  <v-card>
    <v-card-title>Permisos</v-card-title>
    <v-data-table
      :headers="permissionHeaders"
      :items="permissionItems"
      class="elevation-1"
    >
      <template v-slot:item.permissions="{ item }">
        <div class="flex">
          <v-checkbox v-model="item.permissions.view" label="View"></v-checkbox>
          <v-checkbox v-model="item.permissions.add" label="Add"></v-checkbox>
          <v-checkbox v-model="item.permissions.edit" label="Edit"></v-checkbox>
          <v-checkbox v-model="item.permissions.delete" label="Delete"></v-checkbox>
          <v-checkbox v-model="item.permissions.all" label="All"></v-checkbox>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      permissionHeaders: [
        { title: 'Rol', key: 'rol' },
        { title: 'Permisos', key: 'permissions' },
      ],
      permissionItems: [
        { rol: 'Admin', permissions: { view: true, add: true, edit: true, delete: true, all: true } },
        { rol: 'User', permissions: { view: true, add: false, edit: false, delete: false, all: false } },
      ],
    };
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>