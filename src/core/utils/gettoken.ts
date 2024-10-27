import { parseCookies } from 'nookies'

const getUserToken = () => {
  const cookies = parseCookies()

  return cookies.USER_AUTHENTICATION_TOKEN
}

export default getUserToken
