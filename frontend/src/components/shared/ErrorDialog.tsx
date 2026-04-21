interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

export default function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return (
    <div className='fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-80 bg-[#C0C0C0] shadow-w95Container'>
      <div className='bg-[#870909] text-white px-2 py-1 flex items-center justify-between'>
        <span>Error</span>
        <button
          onClick={onClose}
          className='w-4 h-4 bg-[#C0C0C0] text-black text-xs leading-none shadow-w95Button flex items-center justify-center'
        >
          ✕
        </button>
      </div>
      <div className='p-3 flex gap-3 items-start'>
        <span className='text-lg leading-none'>⚠</span>
        <p className='text-sm text-black'>{message}</p>
      </div>
      <div className='px-3 pb-3 flex justify-end'>
        <button onClick={onClose} className='w-16 h-7 bg-[#C0C0C0] text-black text-sm shadow-w95Button'>
          OK
        </button>
      </div>
    </div>
  );
}
