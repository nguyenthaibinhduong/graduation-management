// stores/auth.js
import { defineStore } from "pinia";
import axios from "axios";
import api from "@/api/api";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      try {
        const apiAuth = axios.create({
           headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
        })
        const response = await apiAuth.post("http://localhost:3034/api/v1/auth/login", {email, password});
        this.token = response.data.access_token;
        this.user = response.data.user;
        localStorage.setItem("token", this.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
   async refreshAccessToken() {
       const response = await axios.post(
          "http://localhost:3034/api/v1/auth/refresh-token",
          {},
          { withCredentials: true }
        );

        if (response.data.access_token) {
          this.token = response.data.access_token;
          localStorage.setItem("token", this.token);
          return this.token;
        }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      router.push("/login");
    },
    async fetchUser() {
      if (this.token) {
        try {
          const response = await api.get("auth/me");
          this.user = response.data;
        } catch (error) {
          console.error("Failed to fetch user:", error);
          this.logout();
        }
      }
    },
  },
});
