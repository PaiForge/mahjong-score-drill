import { cn } from '@/lib/utils'

interface PageTitleProps {
    children: React.ReactNode
    className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
    return (
        <h1 className={cn("text-2xl text-slate-900 text-center mb-8", className)}>
            {children}
        </h1>
    )
}
