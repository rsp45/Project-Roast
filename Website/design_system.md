## Brand & Style

The brand identity is built on the concept of "The Interrogator"â€”a sophisticated, analytical entity that dissects financial data with surgical precision. The UI evokes the feeling of a premium high-frequency trading desk fused with a modern investigative dashboard. 

The design style is a hybrid of **Minimalism** and **Glassmorphism**, specifically tailored for a dark-mode fintech environment. It balances a professional, authoritative tone with tech-forward visual flair. The aesthetic utilizes deep, layered charcoals to provide a canvas for high-contrast data visualization, while subtle frosted-glass effects and micro-interactions signify the presence of an underlying "live" AI intelligence. The emotional response is one of confidence, transparency, and high-performance reliability.

## Layout & Spacing

The layout utilizes a **Fixed Grid** philosophy for desktop (1440px max-width) and a fluid approach for smaller viewports. A 12-column grid provides the structure for data interrogation modules. 

The spacing rhythm is based on a 4px baseline, ensuring all components align to a technical grid. Margins are generous (40px) to allow the "sophisticated" aspect of the brand to breathe, preventing the interface from feeling cluttered despite the high density of information. Sidebars and utility panels use fixed widths (280px - 320px) to maintain consistent scanning patterns.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and **Tonal Layering** rather than traditional heavy shadows.

- **Level 0 (Base):** Pure Black (#000000).
- **Level 1 (Modules):** Surface color #121212 with a subtle 1px border (#FFFFFF at 5% opacity).
- **Level 2 (Overlays/Popovers):** Semi-transparent glass effect (Backdrop filter: blur 12px) with a subtle "ambient" shadow: `0 8px 32px rgba(0, 0, 0, 0.5)`.

Interactive elements should feel "tactile" through light. Hover states on cards should trigger a subtle inner-glow or a slight increase in the border-opacity to signify engagement.

## Components

- **Buttons:** Primary buttons use the signature Red (#C52B39) with white text. Secondary buttons are ghost-style with a subtle white border. All buttons use 4px rounding and high-contrast labels.
- **Cards/Modules:** Used for trade data. They feature a #121212 background, 1px subtle borders, and a slight glassmorphic header area.
- **Inputs:** Dark fields (#000000) with a 1px white border at 15% opacity. Focus state transitions the border to the signature Red.
- **Chips/Status:** For trade status (e.g., "Roast Complete", "Flagged"). Use JetBrains Mono for the text. "Flagged" items use a low-opacity Red background with a solid Red border.
- **Data Visualization:** High-contrast line charts with glowing strokes. Use Red for negative trends or "roasted" anomalies and White/Grey for baseline data.
- **Micro-interactions:** Elements should subtly "lift" on hover via border-color transitions rather than scaling, maintaining the technical rigidity of the tool.