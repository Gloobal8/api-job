import axios from 'axios';

const state = {
  admins: [],
  roles: [],
};

const getters = {
  getAllAdmins: (state) => state.admins,
  getAllRoles: (state) => state.roles,
};

const actions = {
  // Admin actions
  async getAllAdmins({ commit }) {
    const response = await axios.get('/api/admins'); // Replace with your API endpoint
    commit('SET_ADMINS', response.data);
    return response.data; // Return data to the caller
  },
  async addAdmin({ dispatch }, adminData) {
    await axios.post('/api/admins', adminData); // Replace with your API endpoint
    return dispatch('getAllAdmins'); // Refresh the list after adding
  },
  async editAdminAction({ dispatch }, adminData) {
    await axios.put(`/api/admins/${adminData.id}`, adminData); // Replace with your API endpoint
    return dispatch('getAllAdmins'); // Refresh the list after editing
  },
  async deleteAdmin({ dispatch }, adminData) {
    await axios.delete(`/api/admins/${adminData.id}`); // Replace with your API endpoint
    return dispatch('getAllAdmins'); // Refresh the list after deleting
  },

  // Role actions
  async getAllRoles({ commit }) {
    const response = await axios.get('/api/rols'); // Replace with your API endpoint
    commit('SET_ROLES', response.data);
    return response.data; // Return data to the caller
  },
  async addRole({ dispatch }, roleData) {

    console.log({
        type: 'test',
        archive: 'modules/admin.js',
        data: roleData
    })

    const response = await axios.post('/rols/create', roleData); // Replace with your API endpoint
    console.log({
        tyep: 'response',
        response
    })
    // return dispatch('getAllRoles'); // Refresh the list after adding
  },
  async editRoleAction({ dispatch }, roleData) {
    await axios.put(`/api/rols/${roleData.id}`, roleData); // Replace with your API endpoint
    return dispatch('getAllRoles'); // Refresh the list after editing
  },
  async deleteRole({ dispatch }, roleData) {
    await axios.delete(`/api/rols/${roleData.id}`); // Replace with your API endpoint
    return dispatch('getAllRoles'); // Refresh the list after deleting
  },
};

const mutations = {
  SET_ADMINS(state, admins) {
    state.admins = admins;
  },
  SET_ROLES(state, roles) {
    state.roles = roles;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};