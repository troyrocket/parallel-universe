# Design System Strategy: The Terminal Echo

### 1. Overview & Creative North Star
**Creative North Star: "The Digital Architect"**
This design system rejects the "friendly" consumer web in favor of a high-end, brutalist digital environment. It is inspired by the raw power of the Command Line Interface (CLI) and the immersive depth of simulated realities. We are not just building an interface; we are exposing a "Parallel Universe" through a sophisticated, technical lens.

The experience moves beyond a basic "hacker" trope by utilizing **intentional asymmetry**, **extreme typographic tension**, and **tonal depth**. We replace standard rounded components with sharp 0px corners and use the "Terminal Echo"—where data isn't just displayed, it is staged—to create a sense of mystery and underground prestige.

### 2. Colors & Surface Architecture
The palette is rooted in the void, utilizing a spectrum of blacks and neon luminescence to simulate a glowing phosphor monitor.

*   **Primary Foundation:** The `surface` (#131313) acts as our "Digital Void."
*   **The Pulse:** `primary_container` (#00FF41) is our high-energy accent, reserved for critical data and primary interactions.
*   **Subdued Data:** `on_surface_variant` (#b9ccb2) provides a "ghosted" look for secondary information, mimicking low-intensity terminal text.

**The "No-Line" Rule**
Standard 1px borders are strictly prohibited for sectioning. Structural definition must be achieved through background shifts. For example, a `surface_container_low` (#1b1b1b) hero area transitions into a `surface` (#131313) content area without a physical line.

**Surface Hierarchy & Nesting**
Treat the UI as a series of nested data-wells. 
- Use `surface_container_lowest` (#0e0e0e) for the most backgrounded elements.
- Stack `surface_container` (#1f1f1f) cards on top to create a "lifted" feel through value rather than shadow.

**The Glass & Gradient Rule**
To elevate the system from "flat" to "premium," use `surface_variant` (#353535) with a 40% opacity and a heavy `backdrop-blur` for overlays. Main CTAs should utilize a subtle vertical gradient from `secondary` (#69df5c) to `primary_container` (#00FF41) to give the neon a "gas-filled" glowing quality.

### 3. Typography
The system uses **Space Grotesk** to bridge the gap between technical monospaced rhythm and editorial elegance.

*   **Display (The Statement):** `display-lg` (3.5rem) should be used for high-impact "hacker-manifesto" style headers. Use `letter-spacing: -0.02em` to make it feel dense and authoritative.
*   **Labels (The Metadata):** `label-sm` (0.6875rem) should always be in ALL CAPS with `letter-spacing: 0.1em`. These mimic terminal status bars and system readouts.
*   **The Cursor Integration:** Every headline should be prefixed with a `>_` symbol in `primary_container` to reinforce the "Active Terminal" state.

### 4. Elevation & Depth: Tonal Layering
Traditional shadows have no place in a digital simulation. Depth is achieved through light emission and stacking.

*   **The Layering Principle:** Place `surface_container_highest` (#353535) elements only on top of `surface_container_low` (#1b1b1b) to create a natural, high-contrast focal point.
*   **Ambient Shadows:** When a floating modal is required, use a shadow with a 60px blur, 0% offset, and 8% opacity of the `primary_container` color. This creates a "neon glow" rather than a physical shadow.
*   **The "Ghost Border" Fallback:** If a container requires definition against a similar background, use `outline_variant` (#3b4b37) at 15% opacity. It must be barely perceptible—a "trace" of a boundary.

### 5. Components

**Buttons**
*   **Primary:** Solid `primary_container` (#00FF41) background, `on_primary` (#003907) text. Sharp 0px corners. On hover, apply a `primary_fixed` (#72ff70) outer glow.
*   **Secondary:** No background. `outline` (#84967e) "Ghost Border" (20% opacity). Text in `primary`. Prefix text with `[ ` and suffix with ` ]` to mimic CLI button syntax.

**Input Fields**
*   **Style:** Minimalist underline only using `outline`. 
*   **Active State:** The underline shifts to `primary_container`. A blinking `_` (underscore) must appear at the end of the user's cursor.
*   **Error State:** Use `error` (#ffb4ab) for text and the underline, simulating a "System Failure" warning.

**Cards & Lists**
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Use the spacing scale—specifically `12` (2.75rem)—to separate list items. For cards, use a background shift to `surface_container_high` (#2a2a2a). 
*   **Interaction:** On hover, a card’s background should subtly "glitch" or shift 2px to the right to simulate digital instability.

**System Chips**
*   Used for status (e.g., `STABLE`, `ENCRYPTED`). Small `label-sm` text inside a `surface_container_highest` box with a 1px `primary` left-border only.

### 6. Do's and Don'ts

**Do:**
*   **Embrace Asymmetry:** Use `spacing-24` (5.5rem) for a left margin and `spacing-8` (1.75rem) for a right margin to create an editorial, non-standard grid.
*   **Use Mono-glyphs:** Use symbols like `//`, `::`, and `01` as decorative "texture" in the background of sections.
*   **High Contrast:** Ensure all text on `background` uses `on_background` or `primary` for maximum legibility.

**Don't:**
*   **No Rounds:** Never use border-radius. Every corner in this universe is a sharp 90-degree angle.
*   **No Standard Gradients:** Avoid "sunset" or colorful gradients. Only use monochromatic or neon-to-dark-neon transitions.
*   **No Softness:** Avoid icons with rounded caps. Use "Lucide" or "Phosphor" icons set to "Bold" or "Thin" with square terminals.
*   **No Dividers:** Never use a horizontal rule `<hr>` to separate content. Use whitespace or tonal shifts only.