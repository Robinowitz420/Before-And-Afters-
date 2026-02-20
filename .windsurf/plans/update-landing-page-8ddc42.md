# Update Landing Page Design

Update the landing page to match the new visual design while preserving all existing functionality and links.

## Design Changes
- **Hero Section**: Implement a new layout with a specific background image and typography as seen in `LANDING-PAGE.jpg`.
- **Typography**: Apply the font styles and weights from the design mock.
- **Color Palette**: Update the global and section-specific colors to match the brand identity in the mock.
- **Sections**: Reorder or add sections to mirror the flow of the new design.

## Functional Requirements
- **Preserve Links**: All existing buttons and links must retain their current destinations:
    - `Enter the Closet` -> `onEnterCloset` function
    - `Join the Club` -> `/memberships`
    - `Learn More` -> `#what-you-get`
    - `Start Your Free Trial` -> `/profile-wizard`
    - `Get Started` -> `/profile-wizard`
- **Responsive Design**: Ensure the new layout is mobile-friendly.
- **Accessibility**: Maintain proper heading hierarchy and button labels.

## Implementation Steps
1. Create a backup of `src/app/LandingClient.tsx`.
2. Extract colors and spacing from the JPG.
3. Update `tailwind.config.ts` if new brand colors are required.
4. Refactor `LandingClient.tsx` section by section to match the mock layout.
5. Verify all click handlers and navigation links work as expected.
