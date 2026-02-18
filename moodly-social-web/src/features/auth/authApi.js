import { apiClient } from "../../shared/api/apiClient";

export async function signin(data) {
  const response = await apiClient.post("/auth/signin", data);
  return response.data;
}

export async function signup(data) {
  const response = await apiClient.post("/auth/signup", data);
  return response.data;
}
