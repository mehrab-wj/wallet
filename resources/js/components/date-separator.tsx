interface DateSeparatorProps {
    date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
    const formatDate = (dateString: string) => {
        const transactionDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time parts for accurate comparison
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        transactionDate.setHours(0, 0, 0, 0);

        if (transactionDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (transactionDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            return transactionDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: transactionDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
            });
        }
    };

    return (
        <div className="flex items-center gap-3 py-2">
            <h3 className="text-sm font-medium text-muted-foreground">
                {formatDate(date)}
            </h3>
            <div className="flex-1 border-t border-border"></div>
        </div>
    );
}
