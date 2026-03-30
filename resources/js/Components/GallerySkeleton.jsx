import React from 'react';

const GallerySkeleton = ({ displayMode = 'grid' }) => {
    const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

    if (displayMode === 'grid') {
        return (
            <div className="space-y-6">
                {/* Month skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-3 p-2">
                        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="grid gap-4 ml-4 grid-cols-[repeat(auto-fit,_minmax(120px,_1fr))]">
                        {skeletonItems.map((item) => (
                            <div key={item} className="w-full aspect-[4/3] bg-slate-200 rounded-lg border-2 border-slate-200 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // List mode skeleton
    return (
        <div className="space-y-6">
            {/* Month skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-3 p-2">
                    <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="grid gap-4 ml-4 grid-cols-1">
                    {skeletonItems.map((item) => (
                        <div key={item} className="w-full h-24 bg-slate-200 rounded-lg border-2 border-slate-200 animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GallerySkeleton;
