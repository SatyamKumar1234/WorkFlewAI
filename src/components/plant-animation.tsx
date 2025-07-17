
import React from 'react';
import { cn } from '@/lib/utils';

interface PlantAnimationProps {
  growthPercentage: number;
}

const Pixel = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <div
    className={cn("absolute w-1 h-1 bg-current", className)}
    style={style}
  />
);

export default function PlantAnimation({ growthPercentage }: PlantAnimationProps) {
  const p = growthPercentage / 100;

  // Timings for different growth stages
  const stemGrowth = Math.min(1, p / 0.8);
  const leaf1Growth = p > 0.25 ? Math.min(1, (p - 0.25) / 0.1) : 0;
  const leaf2Growth = p > 0.40 ? Math.min(1, (p - 0.40) / 0.1) : 0;
  const leaf3Growth = p > 0.60 ? Math.min(1, (p - 0.60) / 0.1) : 0;
  const flowerGrowth = p >= 1 ? 1 : 0;
  
  const root1Growth = p > 0.05 ? Math.min(1, (p - 0.05) / 0.2) : 0;
  const root2Growth = p > 0.15 ? Math.min(1, (p - 0.15) / 0.2) : 0;
  const root3Growth = p > 0.20 ? Math.min(1, (p - 0.20) / 0.2) : 0;
  const root4Growth = p > 0.22 ? Math.min(1, (p - 0.22) / 0.2) : 0;

  const stemHeight = stemGrowth * 60; // Max height of 60px

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-48 flex items-end justify-center">
        <div className="relative w-40 h-40">
            {/* Soil */}
            <div className="absolute bottom-10 left-0 w-full h-10">
                <div className="absolute inset-0 bg-yellow-900/40 dark:bg-stone-800" style={{ clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0% 100%)'}}></div>
                <div className="absolute inset-0 bg-yellow-900/60 dark:bg-stone-900" style={{ clipPath: 'polygon(0 80%, 100% 40%, 100% 100%, 0% 100%)'}}></div>
                <Pixel className="!w-2 !h-2 text-yellow-950/50 dark:text-stone-700" style={{ bottom: '2.2rem', left: '10%' }} />
                <Pixel className="!w-2 !h-2 text-yellow-950/50 dark:text-stone-700" style={{ bottom: '1.5rem', left: '15%' }} />
                <Pixel className="!w-2 !h-2 text-yellow-950/50 dark:text-stone-700" style={{ bottom: '2rem', left: '80%' }} />
                <Pixel className="!w-2 !h-2 text-yellow-950/50 dark:text-stone-700" style={{ bottom: '1.2rem', left: '75%' }} />
            </div>

            {/* This is the SINGLE, UNMOVING ORIGIN POINT for both the plant and the roots.
                It is positioned precisely at the soil line.
                bottom-[2.5rem] is 40px, which is the height of the soil container. */}
            <div className="absolute bottom-[2.5rem] left-1/2 -translate-x-1/2 w-px h-px">
                
                {/* --- Plant grows UP from here --- */}
                <div className="absolute bottom-0 left-0 w-px h-px">
                     {/* Stem */}
                     <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 bg-green-700 dark:bg-green-400 transition-all duration-500 ease-out"
                        style={{ height: `${stemHeight}px` }}
                    />

                    {/* Leaves */}
                    <div className="text-green-700 dark:text-green-400" style={{ opacity: leaf1Growth, transition: 'opacity 0.5s' }}>
                        <Pixel className="!w-2 !h-2" style={{ bottom: `${stemHeight * 0.3}px`, left: '0.25rem' }} />
                        <Pixel className="!w-2 !h-2" style={{ bottom: `${stemHeight * 0.3 + 4}px`, left: '0.5rem' }} />
                        <Pixel className="!w-2 !h-2" style={{ bottom: `${stemHeight * 0.3 + 8}px`, left: '0.75rem' }} />
                    </div>
                    <div className="text-green-700 dark:text-green-400" style={{ opacity: leaf2Growth, transition: 'opacity 0.5s' }}>
                        <Pixel className="!w-2 !h-2" style={{ bottom: `${stemHeight * 0.5}px`, right: '0.25rem' }} />
                        <Pixel className="!w-2 !h-2" style={{ bottom: `${stemHeight * 0.5 + 4}px`, right: '0.5rem' }} />
                    </div>
                     <div className="text-green-700 dark:text-green-400" style={{ opacity: leaf3Growth, transition: 'opacity 0.5s' }}>
                        <Pixel className="!w-2 !h-2" style={{ bottom: `${stemHeight * 0.75}px`, left: '0.25rem' }} />
                        <Pixel className="!w-2 !h-2" style={{ bottom: `${stemHeight * 0.75 + 4}px`, left: '0.5rem' }} />
                    </div>

                    {/* Flower */}
                    <div className="transition-opacity duration-500" style={{ opacity: flowerGrowth }}>
                        <Pixel className="!w-2 !h-2 !bg-red-400" style={{ bottom: `${stemHeight}px`, left: '-0.25rem' }} />
                        <Pixel className="!w-2 !h-2 !bg-pink-300" style={{ bottom: `${stemHeight}px`, left: '0.25rem' }} />
                        <Pixel className="!w-2 !h-2 !bg-pink-300" style={{ bottom: `${stemHeight + 4}px`, left: '-0.25rem' }} />
                        <Pixel className="!w-2 !h-2 !bg-yellow-300" style={{ bottom: `${stemHeight + 4}px`, left: '0.25rem' }} />
                    </div>
                </div>

                {/* --- Roots grow DOWN from here --- */}
                <div className="absolute top-0 left-0 w-px h-px">
                    <div className="text-amber-950/80 dark:text-amber-900/80">
                        {/* Root 1 */}
                        <div style={{ transform: `scaleY(${root1Growth})`, transformOrigin: 'top', transition: 'transform 0.5s' }}>
                            <Pixel className="!w-2 !h-2" style={{ top: '0.25rem', left: '-0.125rem' }} />
                            <Pixel className="!w-2 !h-2" style={{ top: '0.75rem', left: '-0.125rem' }} />
                            <Pixel className="!w-2 !h-2" style={{ top: '1rem', left: '-0.375rem' }} />
                            <Pixel className="!w-2 !h-2" style={{ top: '1.25rem', left: '-0.375rem' }} />
                        </div>
                        {/* Root 2 */}
                        <div style={{ transform: `scaleY(${root2Growth})`, transformOrigin: 'top', transition: 'transform 0.5s' }}>
                            <Pixel className="!w-2 !h-2" style={{ top: '0.25rem', left: '0.125rem' }} />
                            <Pixel className="!w-2 !h-2" style={{ top: '0.75rem', left: '0.375rem' }} />
                            <Pixel className="!w-2 !h-2" style={{ top: '1rem', left: '0.375rem' }} />
                        </div>
                        {/* Root 3 */}
                        <div style={{ transform: `scaleY(${root3Growth})`, transformOrigin: 'top', transition: 'transform 0.5s' }}>
                            <Pixel className="!w-2 !h-2" style={{ top: '1.5rem', left: '-0.625rem' }} />
                            <Pixel className="!w-2 !h-2" style={{ top: '1.75rem', left: '-0.875rem' }} />
                        </div>
                        {/* Root 4 */}
                        <div style={{ transform: `scaleY(${root4Growth})`, transformOrigin: 'top', transition: 'transform 0.5s' }}>
                            <Pixel className="!w-2 !h-2" style={{ top: '1.25rem', left: '0.625rem' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
