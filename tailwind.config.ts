import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-navy': '#3b3b6d',
                'brand-crimson': '#b42434',
                'brand-navy-light': '#4e4e8a',
                'brand-navy-dark': '#2d2d54',
            },
        },
    },
    plugins: [],
};
export default config;
