import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) window.location.replace('/login/')
    return Promise.reject(error)
  }
)

export default client
