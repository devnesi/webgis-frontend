'use client'

import { CircleNotch } from '@phosphor-icons/react'
import { setCookie } from 'nookies'
import { useEffect } from 'react'

export default function SignOut() {
  useEffect(() => {
    setCookie(null, 'USER_AUTHENTICATION_TOKEN', '')
    setTimeout(() => {
      localStorage.clear()
      window.location.replace('/')
    }, 3000)
  }, [])
  return (
    <div className="flex flex flex-col justify-center items-center gap-2 w-screen h-screen">
      <CircleNotch size={64} className="animate-spin" />
      <p className="text-center text-white/60">
        Desconectando. <br />
        Você será redirecionado em 3s...
      </p>
    </div>
  )
}
