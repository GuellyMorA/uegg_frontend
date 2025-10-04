import { defineStore } from 'pinia'

export const useNavbarStore = defineStore('navbar', {
    state: () => ({
      path: '',
      name: '',
    }),
    getters: {
      getPath: (state) => state.path,
      getName: (state) => state.name,
    },
    actions: {
      setPath(path: string) {
        this.path = path;
      },
      setName(name: string) {
        this.name = name;
      },
    },
  });