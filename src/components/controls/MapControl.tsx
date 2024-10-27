'use client'

import React, { forwardRef } from 'react'
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
  text?: string
  className?: string
  side?: 'left' | 'right'
  stagger?: {
    i: number
    n: number
  }
  shortcut?: string
}

const MapControl = forwardRef<HTMLDivElement, IMapControl>(
  (
    { Icon, onClick, label, active, disabled, stagger: staggerOptions, className, text, shortcut, side = 'left' },
    ref
  ) => {
    const staggerChildren = stagger(0.025)
    return (
      <Tooltip.Provider delayDuration={300}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild disabled={disabled} className="whitespace-nowrap pointer-events-auto">
            <motion.div
              ref={ref}
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
                'flex items-center gap-2 border-zinc-800 hover:border-accent hover:bg-accent/60 p-2 border rounded-md w-min min-w-[32px] min-h-[32px] duration-300 cursor-pointer',
                {
                  'bg-accent/90 border-accent text-primary': active,
                  'bg-primary': !active,
                  '!bg-secondary !text-white/40': disabled,
                },
                className
              )}
              onClick={!disabled ? onClick : undefined}>
              <Icon weight="duotone" size={24} />
              {text && <span>{text}</span>}
            </motion.div>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side={side}
              className="flex items-center gap-2 bg-primary p-2 rounded-md text-center text-xs select-none"
              sideOffset={8}>
              {label || 'Label'}
              {shortcut && (
                <div className="items-center bg-neutral-800 p-1 rounded-sm min-w-6 max-w-12 h-6 text-center text-neutral-400 text-xs">
                  {shortcut}
                </div>
              )}
              <Tooltip.Arrow className="border-primary" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    )
  }
)
MapControl.displayName = 'MapControl'

export default MapControl
