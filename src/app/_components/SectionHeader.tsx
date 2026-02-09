import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
    return (
        <h2 className={cn("text-lg font-semibold text-green-800 mb-4 border-l-[6px] border-green-600 bg-green-50 pl-3 py-2 rounded-r-md", className)}>
            {children}
        </h2>
    );
}
