# WebDev Project on Aether

## Product Requirement documents (PRD)

Your PRD should:

* Clearly define both visual and technical vision, the underlying application logic for a high-end web experience.
* Must be detailed enough for an AI agent to build a fully functional site without requiring any clarifications

You will be writing PRDs for the following categories:

1. Normal Website

Precise typography, asymmetric layouts, whitespce, editorial pacing

2. Cool Transition

Page transitions, scroll animations, sequenced reveals, crossfades

3. Representation Format

Horizontal scrolling, parallax layers, narrative-driven visualization

4. SVG & Vector Graphics

Animated SVGs, path morphing, data-driven graphics, SVG filters

5. 3D & WebGL / Game

Three.js scenes, shaders, physics simulations, game-like interactions

## Workflow
Here is the expected workflow for production tasks

1. Read the brief from the perspective of a reasonable client

2. Write a PRD covering both the visual/technical specs AND the app logic

3. Upload 3-10 reference images, e.g, screenshots of award-winning sites whose style you want to replicate, wireframes, or AI mockups
4. Select the target resolution

## PRD Outline 

Your PRD should describe the visual identity, page-by-page breakdown, animation specs, and technical requirements. Include both the visual ambition and the underlying application logic

### Visual identity

- Typography: named fonts, weights, sizes, roles
- Colors: hex values with assigned purpose
- Spacing: padding, borders, radius

### Pages & Interactions

- Each page: what's on it, where elements sit
- Each interaction: what the user does -> what happens

### Animations & Motion

- Every animation: duration in ms, named easing curve
- Multi-step transitions: ordered steps with timing

### Technical Requirements

- Named libraries: connected to specific features
- 3D: Camera, lights, materials with property values
- SVG: technique named, animation approach defined

### Application Logic

- Data model: entities with fields and relationships
- Auth: method, provider, what changes when logged in
- Flows: at least 2 features walked through step by step

### Responsive behavior

- Named breakpoints: with specific changes per tier
- How heavy visuals (3D/SVG) scale down on mobile

### Performance & Accessibility

- At least one number (FPS, asset budget, load time)
- At least one named technique (Draco, KTX2, etc)
- prefers-reduced-motion: what specifically changes

## Quick Tips

### Keep these in mind

- Be specific, e.g. "3-column card grid with 16px gap" instead of "some cards"
- Describe interactive flows step by step
- Include concrete values, e.g. hex colors, font names, pixel sizes

### Avoid the following

- Don't be vague; "modern UX" tells an agent nothing
- Don't pad with filler; quality over word count