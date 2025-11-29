import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import useNotification from "@/composables/useNotification";

const { push } = useNotification();

// Axios para el microservicio de usuarios
function createUserAxios() {
  const api = axios.create({
    baseURL: import.meta.env.VITE_USER_API || "http://localhost:8080",
  });

  // Interceptor JWT (Django exige prefix JWT)
  api.interceptors.request.use((config) => {
    const auth = useAuthStore();
    if (auth.token) {
      config.headers.Authorization = `JWT ${auth.token}`;
    }
    return config;
  });

  return api;
}

const api = createUserAxios();

/* ---------------------------------------------------------------
   OBTENER PERFIL
---------------------------------------------------------------- */
export async function getUserProfile(id) {
  const query = `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        email
        name
        phone
        address
        role
      }
    }
  `;

  const { data } = await api.post("/graphql", {
    query,
    variables: { id }
  });

  //console.log("📤 Enviando query:", query);
  //console.log("📦 Variables enviadas:", { id });
  //console.log("📥 Respuesta GraphQL RAW:", data);

  if (data.errors) {
    console.warn("❌ Error en GraphQL:", data.errors);
    push({
      type: "error",
      message: data.errors[0].message,
    })
    throw new Error(data.errors[0].message);
  }

  return data.data.user;
}

/* ---------------------------------------------------------------
   ACTUALIZAR PERFIL
---------------------------------------------------------------- */
export async function updateUserProfile(id, input) {
  const cleanInput = {
    email: input.email,
    name: input.name,
    phone: input.phone,
    address: input.address,
    ...(input.password ? { password: input.password } : {})
  };

  const mutation = `
    mutation UpdateUser($id: ID!, $input: UserInput!) {
      updateUser(id: $id, input: $input) {
        user {
          id
          email
          name
          phone
          address
          role
        }
      }
    }
  `;

  const { data } = await api.post("/graphql", {
    query: mutation,
    variables: { id, input: cleanInput }
  });

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.data.updateUser.user;
}
