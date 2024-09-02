'use client'

import { Icon } from '@phosphor-icons/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import clsx from 'clsx'

export interface IMapControl {
  Icon: Icon
  onClick?: () => void
  label?: string
  active?: boolean
  disabled?: boolean
}

export default function MapControl({ Icon, onClick, label, active, disabled }: IMapControl) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild disabled={disabled}>
          <div
            className={clsx(
              'border-zinc-800 hover:border-accent hover:bg-accent/60 p-2 border rounded-md duration-300 cursor-pointer',
              {
                'bg-accent/80 border-accent text-primary': active,
                'bg-primary': !active,
                '!bg-secondary !text-white/40': disabled,
              }
            )}
            onClick={!disabled ? onClick : undefined}>
            <Icon weight="duotone" size={24} />
          </div>
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
