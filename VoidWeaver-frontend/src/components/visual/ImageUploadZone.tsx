import { FC, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { fileToBase64 } from '@/lib/utils'

const ImageUploadZone: FC = () => {
    const { sourceImage, setSourceImage } = useVoidWeaverStore()

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            const base64 = await fileToBase64(file)
            setSourceImage(base64)
        }
    }, [setSourceImage])

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const base64 = await fileToBase64(file)
            setSourceImage(base64)
        }
    }, [setSourceImage])

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }, [])

    if (sourceImage) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="relative w-full h-full max-h-[600px] rounded-lg overflow-hidden border border-zinc-800">
                    <img
                        src={`data:image/png;base64,${sourceImage}`}
                        alt="Source"
                        className="w-full h-full object-contain"
                    />
                    <button
                        onClick={() => setSourceImage(null)}
                        className="absolute top-4 right-4 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md text-xs border border-zinc-700 transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
            />
            <label
                htmlFor="file-upload"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="w-full h-full max-h-[600px] border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-4 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors group cursor-pointer"
            >
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all">
                    <Upload className="w-6 h-6 text-zinc-500 group-hover:text-cyan-400" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-zinc-300">Drop Source Image Here</p>
                    <p className="text-xs text-zinc-600 mt-1">Supports PNG, JPG, WEBP</p>
                </div>
            </label>
        </div>
    )
}

export default ImageUploadZone
