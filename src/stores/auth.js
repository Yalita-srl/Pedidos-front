// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation tokenAuth($email: String!, $password: String!) {
              tokenAuth(email: $email, password: $password) {
                token
                user {
                  id
                  email
                  name
                  role
                }
              }
            }
          `,
          variables: {
            email,
            password,
          },
        }),
      })
      //console.log("🔑 Token recibido del backend:", authToken);

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      const { token: authToken, user: userData } = result.data.tokenAuth
      
      token.value = authToken
      user.value = userData

      if (router) {
        router.push('/')
      }
      
    } catch (error) {
      console.error('Error de autenticación:', error)
      throw error
    }
  }

  async function register({ email, password, name, phone, address, role = "user" }) {
  try {
    const response = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation RegisterUser($input: UserInput!) {
            registerUser(input: $input) {
              user {
                id
                email
                name
                role
              }
            }
          }
        `,
        variables: {
          input: {
            email,
            password,
            name,
            phone,
            address,
            role, 
          },
        },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0].message)
    }

    // usuario creado correctamente
    return result.data.registerUser.user

  } catch (error) {
    console.error("❌ Error en registro:", error)
    throw error
  }
}
  function logout() {
    token.value = null
    user.value = null
    if (router) {
      router.push('/login')
    }
  }

  return { token, user, isAuthenticated, login, logout,register }
}, {
  persist: true,
})
