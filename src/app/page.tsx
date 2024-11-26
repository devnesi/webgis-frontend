'use client'

import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { CircleNotch } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiAdapter = useMemo(() => new ApiAdapter(), [])
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (apiAdapter.hasToken) {
      router.push('/editor')
    }
  }, [router])

  return (
    <div className="flex flex-col sm:justify-center items-center bg-primary pt-16 sm:pt-0 min-h-screen text-white">
      <a href="#">
        <div className="flex items-center gap-2 mx-auto font-semibold text-2xl text-foreground tracking-tighter">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5"
              />
            </svg>
          </div>
          Map Sync
        </div>
      </a>
      <div className="relative mt-12 sm:mt-10 w-full max-w-lg">
        {loading && (
          <div className="top-0 left-0 z-[99] absolute flex justify-center items-center bg-black/60 backdrop-blur-sm w-full h-full">
            <CircleNotch className="animate-spin" />
          </div>
        )}
        <div className="relative bg-gradient-to-r from-transparent via-accent to-transparent -mb-px w-full h-px"></div>
        <div className="border-white/20 bg-secondary shadow-[20px_0_20px_20px] shadow-slate-500/10 sm:shadow-sm lg:shadow-none dark:shadow-white/20 mx-5 border sm:border-t-white/20 dark:border-t-white/20 border-r-white/20 border-b-white/20 dark:border-b-white/20 border-l-white/20 rounded-md">
          <div className="flex flex-col p-6">
            <h3 className="font-semibold text-xl leading-6 tracking-tighter">Login</h3>
            <p className="mt-1.5 font-medium text-sm text-white/50">Bem vindo, digite suas credenciais para começar.</p>
            {error && (
              <div className="bg-red-400/10 mt-4 p-2 border border-red-400 rounded w-full text-red-400 text-xs">
                Erro ao fazer login.
              </div>
            )}
          </div>
          <div className="p-6 pt-0">
            <form
              ref={formRef}
              onSubmit={(e) => {
                if (!formRef.current) return

                e.preventDefault()
                const data = new FormData(formRef.current)
                const username = data.get('username')?.toString()
                const password = data.get('password')?.toString()
                if (!username || !password) {
                  return setError('Preencha os campos corretamente.')
                }
                setLoading(true)

                apiAdapter
                  .login(username, password)
                  .then((d) => {
                    setError(null)
                    router.push('/editor')
                    setLoading(false)
                  })
                  .catch((e) => {
                    setLoading(false)
                    setError(`${e}`)
                  })
              }}>
              <div>
                <div className="relative border-white/20 focus-within:border-accent px-3 pt-2.5 pb-1.5 border rounded-md focus-within:ring focus-within:ring-accent/30 duration-200 group">
                  <div className="flex justify-between">
                    <label className="group-focus-within:text-white font-medium text-gray-400 text-muted-foreground text-xs">
                      Usuário
                    </label>
                  </div>
                  <input
                    type="text"
                    name="username"
                    className="block border-0 border-white/10 file:border-0 bg-transparent file:bg-accent file:my-1 file:px-4 file:py-2 p-0 file:rounded-full focus:ring-0 w-full file:font-medium text-sm placeholder:text-white/90 focus:outline-none sm:leading-7"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="relative border-white/20 focus-within:border-accent px-3 pt-2.5 pb-1.5 border rounded-md focus-within:ring focus-within:ring-accent/30 duration-200 group">
                  <div className="flex justify-between">
                    <label className="group-focus-within:text-white font-medium text-gray-400 text-muted-foreground text-xs">
                      Senha
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="password"
                      name="password"
                      className="block border-0 border-white/10 bg-transparent file:my-1 p-0 focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-muted-foreground/90 focus:outline-none sm:leading-7"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-x-2 mt-4">
                <a
                  className="inline-flex justify-center items-center hover:bg-accent disabled:opacity-50 px-4 py-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 font-medium text-sm transition-all focus-visible:outline-none duration-200 disabled:pointer-events-none"
                  href="/register">
                  Registro
                </a>
                <button
                  className="inline-flex justify-center items-center bg-white hover:bg-black disabled:opacity-50 px-4 py-2 rounded-md h-10 font-semibold text-black text-sm hover:text-white transition duration-300 focus-visible:outline-none disabled:pointer-events-none"
                  type="submit">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
