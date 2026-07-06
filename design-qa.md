**Source Visual Truth**
- Path: `C:\Users\Lenovo\Downloads\ChatGPT Image 7 ก.ค. 2569 06_10_32.png`

**Implementation**
- URL: `http://127.0.0.1:3000/content/administrative-structure`
- Screenshot: `C:\xampp\htdocs\ita\ita-next\screenshots\administrative-structure-full-width.png`
- Viewport: 1680 x 980
- State: public page, desktop

**Full-View Comparison Evidence**
- The implemented page now uses a full-width administrative structure section instead of a boxed article layout.
- The director card is placed above the main divisions, with a dashed connector to the college committee card.
- The main connector line drops from the director card, branches horizontally, and points down to every division card.
- The academic division spans two columns and splits its content into A/B groups like the source mockup.
- Duty lists inside cards use vertical rails and dot connectors to match the visual language of the mockup.

**Focused Region Comparison Evidence**
- Focused region checked: director-to-committee connector and director-to-division branch.
- Result: connector direction and branch structure are present and readable at desktop size.

**Findings**
- No P0/P1/P2 blockers remain for the requested structure-chart fidelity.

**Patches Made Since Previous QA Pass**
- Removed the duplicate generic content heading for this page.
- Expanded the structure page to full width.
- Added complete connector lines from director to committee and from director to all divisions.
- Converted duty items into connected lists.
- Made the academic division a wide two-column card.

**Follow-Up Polish**
- P3: Decorative background waves and the bottom contact strip in the mockup are not copied exactly because the site already has a shared header/footer shell. They can be added as a separate visual polish pass if desired.

**final result: passed**
