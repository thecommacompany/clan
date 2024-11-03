import { defineStore } from "pinia";
import type { User } from "~/composables/useUserDatabase";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    filteredUsers: [] as User[], // To hold filtered users based on search
    fetchedUsers: [] as User[],
  }),
  actions: {
    setUsers(users: User[]) {
      this.users = users;
      this.filteredUsers = users; // Initialize filtered users with all users
    },
    setFetchedUsers(user: User) {
      this.fetchedUsers.push(user);
    },
    filterUsers(searchTerm: string) {
      if (searchTerm) {
        let searchResult = this.users.filter((user) =>
          user.Name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        this.filteredUsers = searchResult;
      } else {
        this.filteredUsers = this.users; // Reset to all users if search term is empty
      }
    },
  },
  getters: {
    getUsers: (state) => state.users,
    getFilteredUsers: (state) => state.filteredUsers, // Getter for filtered users
    getFetchedUsers: (state) => state.fetchedUsers,
  },
});
