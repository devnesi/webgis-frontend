'use client'

import { Icon } from '@phosphor-icons/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import clsx from 'clsx'
import { motion, stagger } from 'framer-motion'

export interface IMapControl {
  Icon: Icon
  onClick?: () => void
  label?: string
  active?: boolean
  disabled?: boolean
  stagger?: {
    i: number
    n: number
  }
}

export default function MapControl({ Icon, onClick, label, active, disabled, stagger: staggerOptions }: IMapControl) {
  const staggerChildren = stagger(0.025)
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild disabled={disabled}>
          <motion.div
            transition={{
              duration: 0.05,
              bounce: false,
              delay: staggerOptions ? staggerChildren(staggerOptions.i, staggerOptions.n) : undefined,
            }}
            initial={{
              y: '-50%',
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: '-100%',
              opacity: 0,
            }}
            className={clsx(
              'border-zinc-800 hover:border-accent hover:bg-accent/60 opacity-0 p-2 border rounded-md duration-300 cursor-pointer',
              {
                'bg-accent/90 border-accent text-primary': active,
                'bg-primary': !active,
                '!bg-secondary !text-white/40': disabled,
              }
            )}
            onClick={!disabled ? onClick : undefined}>
            <Icon weight="duotone" size={24} />
          </motion.div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="left"
            className="bg-primary p-2 rounded-md text-center text-xs select-none"
            sideOffset={8}>
            {label || 'Label'}
            <Tooltip.Arrow className="border-primary" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
