import * as Portal from '@radix-ui/react-portal'

export default function GeometrySettingsModal() {
  return (
    <Portal.Root className="top-0 left-0 z-[9999] absolute flex justify-center items-center bg-primary/60 backdrop-blur-sm w-screen h-screen">
      {/* CONTENT */}
      <div className="bg-secondary shadow-lg p-4 border border-tertiary rounded-md w-4/6 min-h-[200px]"></div>
    </Portal.Root>
  )
}
