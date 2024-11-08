import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			"meteor-effect": "meteor 5s linear infinite",
  			"shimmer": "shimmer 2s linear infinite",
  			"spotlight": "spotlight 2s ease .75s 1 forwards",
  			"scroll": "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
  		},
  		keyframes: {
  			meteor: {
  				"0%": { transform: "rotate(215deg) translateX(0)", opacity: 1 },
  				"70%": { opacity: 1 },
  				"100%": {
  					transform: "rotate(215deg) translateX(-500px)",
  					opacity: 0,
  				},
  			},
  			shimmer: {
  				from: {
  					backgroundPosition: "0 0"
  				},
  				to: {
  					backgroundPosition: "-200% 0"
  				}
  			},
  			spotlight: {
  				"0%": {
  					opacity: "0",
  					transform: "translate(-72%, -62%) scale(0.5)",
  				},
  				"100%": {
  					opacity: "1",
  					transform: "translate(-50%,-40%) scale(1)",
  				},
  			},
  			scroll: {
  				to: {
  					transform: "translate(calc(-50% - 0.5rem))",
  				},
  			},
  		},
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
export default config;
