import axios from 'axios'

// Same-origin in production (the FastAPI server serves both API and this app),
// and proxied to localhost:8000 by Vite in dev.
const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  // Send the session cookie set by /api/auth/login on every request.
  withCredentials: true,
})

// If the session expires or the user signs out in another tab, every API call
// will start returning 401. Bounce to the login page instead of letting the
// app render an error wall.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.location.replace('/login/')
    }
    return Promise.reject(error)
  }
)

export default client
