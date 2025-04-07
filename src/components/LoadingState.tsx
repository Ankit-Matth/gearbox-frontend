import React from 'react'

const LoadingState: React.FC = () => {
  return (
    <div className="grid place-items-center w-full h-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-[5px] border-gray-300 rounded-full" />
          <div className="absolute inset-0 border-[5px] border-blue-500 border-t-transparent rounded-full animate-spin duration-100" />
        </div>
        <p className="text-lg text-gray-600 font-medium tracking-wide animate-pulse">
          Loading, please wait...
        </p>
      </div>
    </div>
  )
}

export default LoadingState
