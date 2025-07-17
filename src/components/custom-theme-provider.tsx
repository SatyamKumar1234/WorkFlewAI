
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Helper function to convert hex to HSL string
function hexToHsl(hex: string): string {
    if (!hex || hex.length !== 7) return '0 0% 0%';
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}

// Helper to determine if a color is light or dark
function isColorLight(hex: string): boolean {
    if (!hex || hex.length !== 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // HSP equation from http://alienryderflex.com/hsp.html
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5;
}

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const [style, setStyle] = useState('');

    const generateAndApplyTheme = useCallback(() => {
        try {
            const activeTheme = localStorage.getItem('app-theme');
            const customColorsString = localStorage.getItem('custom-colors');

            if (activeTheme !== 'custom' || !customColorsString) {
                document.documentElement.removeAttribute('style');
                setStyle('');
                // Ensure correct data-theme is set for presets
                if (activeTheme !== 'custom') {
                    document.documentElement.setAttribute('data-theme', activeTheme || 'default');
                }
                return;
            }
            
            // Remove data-theme attribute if custom is active
            document.documentElement.removeAttribute('data-theme');

            const customColors = JSON.parse(customColorsString);

            const { light, dark } = customColors;
            
            const lightPrimaryForeground = isColorLight(light.primary) ? '0 0% 5%' : '0 0% 98%';
            const lightAccentForeground = isColorLight(light.accent) ? '0 0% 5%' : '0 0% 98%';
            const darkPrimaryForeground = isColorLight(dark.primary) ? '0 0% 5%' : '0 0% 98%';
            const darkAccentForeground = isColorLight(dark.accent) ? '0 0% 5%' : '0 0% 98%';

            const newStyle = `
                :root {
                    --background: ${hexToHsl(light.background)};
                    --foreground: ${isColorLight(light.background) ? '0 0% 5%' : '0 0% 98%'};
                    --primary: ${hexToHsl(light.primary)};
                    --primary-foreground: ${lightPrimaryForeground};
                    --accent: ${hexToHsl(light.accent)};
                    --accent-foreground: ${lightAccentForeground};
                }
                .dark {
                    --background: ${hexToHsl(dark.background)};
                    --foreground: ${isColorLight(dark.background) ? '0 0% 5%' : '0 0% 98%'};
                    --primary: ${hexToHsl(dark.primary)};
                    --primary-foreground: ${darkPrimaryForeground};
                    --accent: ${hexToHsl(dark.accent)};
                    --accent-foreground: ${darkAccentForeground};
                }
            `;
            setStyle(newStyle);

        } catch (error) {
            console.error("Failed to apply custom theme:", error);
            setStyle('');
        }
    }, []);

    useEffect(() => {
        generateAndApplyTheme();
        window.addEventListener('custom-theme-update', generateAndApplyTheme);
        return () => {
            window.removeEventListener('custom-theme-update', generateAndApplyTheme);
        };
    }, [generateAndApplyTheme]);


    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: style }} />
            {children}
        </>
    );
}
