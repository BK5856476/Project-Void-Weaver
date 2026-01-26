import { useEffect, useRef } from 'react'

interface MatrixRainProps {
    title?: string
    subtitle?: string
}

const MatrixRain = ({
    title = "ANALYZING REALITY",
    subtitle = "DECODING VISUAL MATRIX..."
}: MatrixRainProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas dimensions
        const resize = () => {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // Matrix settings
        const fontSize = 14
        const columns = Math.ceil(canvas.width / fontSize)
        const drops: number[] = new Array(columns).fill(1)

        // Cyberpunk characters (Katakana + Latin + Numbers)
        const chars = '0123456789ABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺ'

        const draw = () => {
            // Semi-transparent black fade for trailing effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.fillStyle = '#0F0' // Green
            ctx.font = `${fontSize}px monospace`

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const text = chars[Math.floor(Math.random() * chars.length)]

                // Color variation: mostly cyan, some white/green
                const colorDetails = Math.random()
                if (colorDetails > 0.98) {
                    ctx.fillStyle = '#FFF' // White tip
                } else if (colorDetails > 0.9) {
                    ctx.fillStyle = '#22d3ee' // Cyan (Tailwind cyan-400)
                } else {
                    ctx.fillStyle = '#0891b2' // Darker cyan/green
                }

                ctx.fillText(text, i * fontSize, drops[i] * fontSize)

                // Reset drop to top randomly
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0
                }

                drops[i]++
            }
        }

        const interval = setInterval(draw, 33) // ~30 FPS

        return () => {
            clearInterval(interval)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center overflow-hidden backdrop-blur-sm">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
            <div className="relative z-10 flex flex-col items-center gap-4 animate-pulse">
                <div
                    className="text-cyan-400 font-mono text-xl tracking-[0.2em] font-bold"
                    style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.8), 0 0 20px rgba(34, 211, 238, 0.4)' }}
                >
                    {title}
                </div>
                <div className="text-cyan-600/70 font-mono text-xs tracking-widest">
                    {subtitle}
                </div>
            </div>
        </div>
    )
}

export default MatrixRain
