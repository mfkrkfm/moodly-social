import { apiClient } from "../../shared/api/apiClient";

<<<<<<< Updated upstream
export async function signin(data) {
  const response = await apiClient.post("/auth/signin", data);
  return response.data;
}

export async function signup(data) {
  const response = await apiClient.post("/auth/signup", data);
  return response.data;
=======
export async function signup(payload) {
  const { data } = await apiClient.post("/auth/signup", payload);
  return data;
}

export async function signin(payload) {
  const { data } = await apiClient.post("/auth/signin", payload);
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get("/users/me");
  return data;
>>>>>>> Stashed changes
}
