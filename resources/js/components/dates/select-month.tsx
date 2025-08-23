import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

interface SelectMonthProps {
    selectedMonth: Date;
    onMonthSelect: (month: Date) => void;
    trigger?: React.ReactNode;
}

export function SelectMonth({ selectedMonth = new Date(), onMonthSelect, trigger }: SelectMonthProps) {
    const [currentYear, setCurrentYear] = useState(selectedMonth.getFullYear());

    const handleYearChange = (direction: 'prev' | 'next') => {
        setCurrentYear((prev) => (direction === 'prev' ? prev - 1 : prev + 1));
    };

    const handleMonthSelect = (monthIndex: number) => {
        onMonthSelect(new Date(currentYear, monthIndex, 1));
    };

    const handleStepMonth = (direction: 'prev' | 'next') => {
        const delta = direction === 'prev' ? -1 : 1;
        const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + delta, 1);
        onMonthSelect(newDate);
    };

    useEffect(() => {
        setCurrentYear(selectedMonth.getFullYear());
    }, [selectedMonth]);

    return (
        <Popover>
            <div className="gap-0.1 flex items-center">
                <Button variant="outline" className="rounded-none rounded-l-2xl" onClick={() => handleStepMonth('prev')}>
                    <Icon iconNode={ChevronLeft} />
                </Button>
                <PopoverTrigger asChild>
                    {trigger ? (
                        trigger
                    ) : (
                        <Button className="w-32 rounded-none" variant="outline">
                            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Button>
                    )}
                </PopoverTrigger>
                <Button variant="outline" className="rounded-none rounded-r-2xl" onClick={() => handleStepMonth('next')}>
                    <Icon iconNode={ChevronRight} />
                </Button>
            </div>
            <PopoverContent className="mr-4 w-80 p-0" align="start">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-4">
                        <span className="font-medium text-popover-foreground">Date</span>
                        <Button
                            variant="ghost"
                            className="text-sm text-muted-foreground"
                            disabled={selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear()}
                            onClick={() => handleMonthSelect(new Date().getMonth())}
                        >
                            THIS MONTH
                        </Button>
                    </div>
                    <PopoverPrimitive.Close asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-popover-foreground">
                            <Icon iconNode={X} className="h-4 w-4" />
                        </Button>
                    </PopoverPrimitive.Close>
                </div>

                {/* Year Navigation */}
                <div className="flex items-center justify-between border-b p-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-popover-foreground"
                        onClick={() => handleYearChange('prev')}
                    >
                        <Icon iconNode={ChevronLeft} className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium text-popover-foreground">{currentYear}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-popover-foreground"
                        onClick={() => handleYearChange('next')}
                    >
                        <Icon iconNode={ChevronRight} className="h-4 w-4" />
                    </Button>
                </div>

                {/* Month Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                        {MONTHS.map((month, index) => (
                            <Button
                                key={month}
                                variant="ghost"
                                className={cn(
                                    'h-12 font-medium text-muted-foreground',
                                    selectedMonth.getMonth() === index &&
                                        selectedMonth.getFullYear() === currentYear &&
                                        '!bg-primary text-primary-foreground',
                                )}
                                onClick={() => handleMonthSelect(index)}
                            >
                                {month}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
