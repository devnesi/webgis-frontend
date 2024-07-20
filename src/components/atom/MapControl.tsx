'use client'

import { Icon } from '@phosphor-icons/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import clsx from 'clsx'

export interface IMapControl {
  Icon: Icon
  onClick?: () => void
  label?: string
  active?: boolean
}

export default function MapControl({ Icon, onClick, label, active }: IMapControl) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            className={clsx(
              'p-2 rounded-md border border-zinc-800 cursor-pointer hover:bg-violet-800 hover:border-violet-900 duration-300',
              {
                'bg-violet-500 border-violet-900': active,
                'bg-zinc-900': !active,
              }
            )}
            onClick={onClick}>
            <Icon weight="duotone" size={16} />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="left"
            className="bg-zinc-900 rounded-md p-2 text-center text-xs select-none"
            sideOffset={8}>
            {label || 'Label'}
            <Tooltip.Arrow className="border-zinc-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
