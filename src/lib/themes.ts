
export type Theme = {
    name: string;
    light: {
        background: string;
        foreground: string;
        primary: string;
        'primary-foreground': string;
        secondary: string;
        'secondary-foreground': string;
        muted: string;
        'muted-foreground': string;
        accent: string;
        'accent-foreground': string;
        destructive: string;
        'destructive-foreground': string;
        border: string;
        input: string;
        ring: string;
    },
    dark: {
        background: string;
        foreground: string;
        primary: string;
        'primary-foreground': string;
        secondary: string;
        'secondary-foreground': string;
        muted: string;
        'muted-foreground': string;
        accent: string;
        'accent-foreground': string;
        destructive: string;
        'destructive-foreground': string;
        border: string;
        input: string;
        ring: string;
    }
}

export const THEMES: Theme[] = [
    {
        name: 'default',
        light: {
            background: '208 100% 97.1%',
            foreground: '275 25% 20%',
            primary: '275 100% 25.1%',
            'primary-foreground': '0 0% 98%',
            secondary: '275 20% 92%',
            'secondary-foreground': '275 100% 25.1%',
            muted: '275 20% 92%',
            'muted-foreground': '275 10% 40%',
            accent: '180 100% 25.1%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '275 20% 85%',
            input: '275 20% 88%',
            ring: '275 100% 25.1%',
        },
        dark: {
            background: '275 20% 10%',
            foreground: '275 10% 95%',
            primary: '275 90% 75%',
            'primary-foreground': '275 100% 10%',
            secondary: '275 20% 15%',
            'secondary-foreground': '275 10% 95%',
            muted: '275 20% 15%',
            'muted-foreground': '275 10% 60%',
            accent: '180 80% 60%',
            'accent-foreground': '275 100% 10%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '0 0% 98%',
            border: '275 20% 20%',
            input: '275 20% 20%',
            ring: '275 90% 75%',
        }
    },
    {
        name: 'ocean',
        light: {
            background: '210 40% 96.1%',
            foreground: '210 40% 9.8%',
            primary: '217.2 91.2% 59.8%',
            'primary-foreground': '210 40% 98%',
            secondary: '210 40% 91.4%',
            'secondary-foreground': '210 40% 9.8%',
            muted: '210 40% 91.4%',
            'muted-foreground': '215.4 16.3% 46.9%',
            accent: '172.2 81.2% 59.8%',
            'accent-foreground': '210 40% 9.8%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '210 40% 98%',
            border: '214.3 31.8% 91.4%',
            input: '214.3 31.8% 91.4%',
            ring: '217.2 91.2% 59.8%',
        },
        dark: {
            background: '210 40% 9.8%',
            foreground: '210 40% 98%',
            primary: '217.2 91.2% 59.8%',
            'primary-foreground': '210 40% 98%',
            secondary: '210 40% 14.4%',
            'secondary-foreground': '210 40% 98%',
            muted: '210 40% 14.4%',
            'muted-foreground': '215.4 16.3% 56.9%',
            accent: '172.2 81.2% 59.8%',
            'accent-foreground': '210 40% 9.8%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '210 40% 98%',
            border: '214.3 31.8% 19.4%',
            input: '214.3 31.8% 19.4%',
            ring: '217.2 91.2% 59.8%',
        }
    },
    {
        name: 'sunset',
        light: {
            background: '20 14.3% 96.3%',
            foreground: '20 14.3% 9.8%',
            primary: '24.6 95% 53.1%',
            'primary-foreground': '20 14.3% 98%',
            secondary: '20 14.3% 91.4%',
            'secondary-foreground': '20 14.3% 9.8%',
            muted: '20 14.3% 91.4%',
            'muted-foreground': '20 14.3% 46.9%',
            accent: '47.9 95.8% 53.1%',
            'accent-foreground': '20 14.3% 9.8%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '20 14.3% 98%',
            border: '20 14.3% 91.4%',
            input: '20 14.3% 91.4%',
            ring: '24.6 95% 53.1%',
        },
        dark: {
            background: '20 14.3% 9.8%',
            foreground: '20 14.3% 98%',
            primary: '24.6 95% 53.1%',
            'primary-foreground': '20 14.3% 98%',
            secondary: '20 14.3% 14.4%',
            'secondary-foreground': '20 14.3% 98%',
            muted: '20 14.3% 14.4%',
            'muted-foreground': '20 14.3% 56.9%',
            accent: '47.9 95.8% 53.1%',
            'accent-foreground': '20 14.3% 9.8%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '20 14.3% 98%',
            border: '20 14.3% 19.4%',
            input: '20 14.3% 19.4%',
            ring: '24.6 95% 53.1%',
        }
    },
    {
        name: 'forest',
        light: {
            background: '120 60% 96%',
            foreground: '120 10% 20%',
            primary: '142.1 76.2% 36.3%',
            'primary-foreground': '142.1 76.2% 96.3%',
            secondary: '142.1 76.2% 91.4%',
            'secondary-foreground': '142.1 76.2% 36.3%',
            muted: '142.1 76.2% 91.4%',
            'muted-foreground': '120 10% 40%',
            accent: '158 64% 52%',
            'accent-foreground': '158 64% 98%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '120 60% 98%',
            border: '142.1 76.2% 86.4%',
            input: '142.1 76.2% 86.4%',
            ring: '142.1 76.2% 36.3%',
        },
        dark: {
            background: '120 10% 10%',
            foreground: '120 10% 95%',
            primary: '142.1 70.2% 46.3%',
            'primary-foreground': '142.1 70.2% 6.3%',
            secondary: '120 10% 15%',
            'secondary-foreground': '120 10% 95%',
            muted: '120 10% 15%',
            'muted-foreground': '120 10% 60%',
            accent: '158 54% 42%',
            'accent-foreground': '158 54% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '120 10% 98%',
            border: '120 10% 20%',
            input: '120 10% 20%',
            ring: '142.1 70.2% 46.3%',
        }
    }
]
