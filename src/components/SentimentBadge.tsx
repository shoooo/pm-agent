
import React from 'react';
import { clsx } from 'clsx';
import { Smile, Frown, Meh } from 'lucide-react';

interface Props {
    score: number;
}

export const SentimentBadge: React.FC<Props> = ({ score }) => {
    let color = 'bg-gray-100 text-gray-700';
    let Icon = Meh;
    let label = 'Neutral';

    if (score >= 70) {
        color = 'bg-green-100 text-green-700';
        Icon = Smile;
        label = 'Positive';
    } else if (score <= 40) {
        color = 'bg-red-100 text-red-700';
        Icon = Frown;
        label = 'Negative';
    }

    return (
        <div className={clsx("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", color)}>
            <Icon size={14} />
            <span>{label} ({score})</span>
        </div>
    );
};
