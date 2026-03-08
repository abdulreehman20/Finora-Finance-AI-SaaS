## Prompt 1

> **Act as a senior Frontend Developer.**
>
> Build a **premium, modern, and user-friendly landing page** for my expense / money management app in the frontend directory (Next.js). Use **[https://www.copilot.money/](https://www.copilot.money/)** as visual reference (layout and feel), but use a different color theme and do not copy content verbatim.

---

### Requirements (exact)

1. **Navbar**

   * Modern navbar like the reference.
   * Left: logo. Center/left: links (Home, Features, Reviews, Pricing) that anchor-scroll to sections. Right: Get Started / Login button.

2. **Hero**

   * Strong 4–5 word headline, short description, and Get Started CTA.
   * Include a dashboard mockup image on the right with smooth Framer Motion animation for a realistic feel.

3. **Features**

   * Use a Bento Grid style layout (reference: [https://magicui.design/docs/components/bento-grid](https://magicui.design/docs/components/bento-grid)) to display app features. Design and content should match the app (expense tracking, reports, AI insights, etc.).

4. **Reviews**

   * Reviews section using a Bento Grid. Include realistic sample reviews with user image, name, and short quote.

5. **Pricing**

   * Monthly and yearly plans:

     * Monthly: $10 / month
     * Yearly: $8 / month (billed $96/year)
   * Clean pricing cards and toggle for monthly/yearly.

6. **Footer**

   * Modern, better-than-reference footer. Include links, social icons, and newsletter/email capture area.

---

### Design & Tech

* Use the project’s Next.js frontend directory.
* Use **Framer Motion** for animations.
* Responsive, accessible, and production-ready CSS (Tailwind / CSS modules / your project style — match existing project styling).
* Add placeholder dashboard images/assets (or use existing project assets).
* Keep code clean, typed (TSX), and modular (components folder).

---

### Deliverables

* Implemented page at: `@frontend/src/app/page.tsx` (or the project’s landing page file).
* New components (Navbar, Hero, FeaturesGrid, ReviewsGrid, Pricing, Footer) with styles and animations.
* README note listing where to update images/colors and how to run the frontend.

---

## Prompt 2

> **Act as a senior frontend developer.**
>
> Build a **premium, modern, responsive landing page** for my app using **Next.js**, **Tailwind CSS**, and **shadcn**. Use the exact details below — do not omit or change anything I specified.

**Global design**

* Color theme: **Green, White & Black** (use these across the site; accents where needed)
* Use a high-quality web font (best-looking professional font for UI)
* Make it fully **responsive** (mobile, tablet, laptop, desktop)

**Project setup**

* Initialize Next.js project with **Tailwind CSS** and **shadcn**.
* Add the color theme into shadcn config.

**Page structure & components to implement**

1. **Navbar**

   * Use the **resizable navbar** style from: `https://ui.aceternity.com/components/resizable-navbar`
   * Links: Home, About, Features, Pricing (anchor to sections)
   * Left: Logo. Right: **Get Started** (replace “book a call”) and Login button
   * Apply site color theme/effects

2. **Hero**

   * Use **background ripple effect**: `https://ui.aceternity.com/components/background-ripple-effect`
   * Add a top label/button: **AI powered financial assistant**
   * Strong 4–5 word heading + short description
   * Buttons: Login & Get Started
   * Use **container scroll animation** for the dashboard image: `https://ui.aceternity.com/components/container-scroll-animation`
   * Include a dashboard image with smooth Framer Motion animation and theme colors

3. **Our Purpose Section**

   * 2×2 grid (2 rows × 2 cols) with color effects matching theme
   * Each grid: icon, heading, description — all inside one box
   * Include loading icon centered as in the reference image (I will supply image)
   * Layout and visuals should match my provided image (use my image assets)

4. **Key Features**

   * Use **three-column bento grid**: `https://ui.aceternity.com/blocks/bento-grids/three-column-bento-grid`
   * Add **glowing effect**: `https://ui.aceternity.com/components/glowing-effect`
   * Populate with features related to expense & money management (icons, headings, short copy)
   * Ensure theme colors and glowing accents

5. **Reviews**

   * Use **testimonials background with drag**: `https://ui.aceternity.com/blocks/testimonials/testimonials-background-with-drag`
   * Add multiple realistic reviews with user image & name
   * Match theme style/colors

6. **Pricing**

   * Clean pricing cards with toggle Monthly / Yearly
   * Monthly: **$10/month**; Yearly: **$8/month** (billed $96/year)
   * Show plan features and CTA

7. **CTA Section**

   * Use **CTA with background noise**: `https://ui.aceternity.com/blocks/cta-sections/cta-with-background-noise`
   * Match color theme and add strong CTA button

8. **Footer**

   * Use **simple footer with four grids**: `https://ui.aceternity.com/blocks/footers/simple-footer-with-four-grids`
   * Remove extra links; include only important links
   * Apply color theme and modern styling

**Animations & polish**

* Use **Framer Motion** for smooth, professional animations (hero image, CTAs, subtle entrance animations)
* Ensure polished spacing, typography, and visual hierarchy

**Deliverables**

* Fully implemented landing page in Next.js (components modularized: Navbar, Hero, PurposeGrid, FeaturesGrid, Reviews, Pricing, CTA, Footer)
* Tailwind + shadcn theme configured with Green/White/Black
* Responsive behaviors for all viewports
* README note: how to run, where to update images/colors

---


## Prompt 3

Update the Hero Section and other landing page details:

**Hero**

* Place the main hero heading like the reference image. This app is an expense tracker / money management app, so write a suitable heading and description for that.
* Add a gradient line (just like the reference) above the description.
* Write a catchy description beneath the gradient line.
* Keep the CTA buttons in place. Remove the active-users / tracks-tracker / AI-reports numbers section from the hero. If you want something in that area, add subtle padding or spacing so the layout looks balanced.
* Remove the extra black space below the buttons/numbers. Immediately after the buttons, add a scrolling/animated dashboard image so the hero looks attractive, similar to how images render in the reference.

**Features Grid**

* Keep the current grid content unchanged. Add the glowing-effect component (`https://ui.aceternity.com/components/glowing-effect`) to the feature grid so it looks more eye-catching. Do not change the grid layout or contents—just add the glowing effect.

**Reviews**

* Make the reviews section a continuous marquee of cards.
* Move the first row of review cards right-to-left and the second row left-to-right for alternating motion.

**CTA**

* Replace the current CTA with this component: `https://ui.aceternity.com/blocks/cta-sections/cta-with-background-noise`.
* Use the site theme colors for the background noise, and include the images I placed in the `public` folder.

**Footer**

* Replace the current footer with this Aceternity footer: `https://ui.aceternity.com/blocks/footers/simple-footer-with-four-grids`.
* Update the brand text from “DevStudio” to **Finora AI**. Remove extra/unnecessary links—keep only important links.

**Site Background**

* Add the grid-and-dot background component: `https://ui.aceternity.com/components/grid-and-dot-backgrounds` across the site, but reduce its opacity so it’s subtle.
* Replace the current black background effect with a green-gradient tinted grid (very low opacity) so it doesn’t overpower the UI.
* Ensure this background **does not** interfere with the Hero’s existing Background Ripple Effect—leave the ripple effect exactly as it is.

**Navbar**

* Add a top margin/padding so the navbar isn’t glued to the top of the page.

**File & Naming Conventions**

* All new files must use lowercase filenames (e.g., `fotter.tsx` → `footer.tsx`, `cta-section.tsx`).
* Update any previously created files to follow the same lowercase naming convention.

**Responsiveness & QA**

* Ensure the entire site is fully responsive and delivers the same stunning experience on mobile, tablet, and desktop.
* After making changes, check everything visually and functionally to confirm the site looks and works well.

**Note**

* The provided image is only a reference. Do **not** copy its exact colors or theme.

---

Act as a world-class frontend developer and implement these updates exactly as specified. Make sure everything looks polished and works correctly.
