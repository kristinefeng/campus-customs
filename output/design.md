# Problem 10: Styling the Storefront

What changed, and why each change should help a Campus Customs shopper stay and buy.

---

## The starting point

The site worked but read like an unstyled template: a white box with one line of
text for a homepage, system fonts, flat product tiles, and — underneath it all —
Vite's untouched starter stylesheet still pinning the page to a fixed 1126px and
centring every block of text.

## 1. A typographic identity

- **Headings:** Fraunces, a variable serif, at weights 600–900.
- **Body:** Inter.

**Why:** Yale's visual language is serif. A system sans says "unfinished project";
a serif wordmark and serif headlines say "shop". The pairing also creates obvious
hierarchy — a shopper's eye lands on the product name before the description
without any size trickery.

## 2. Colour: navy, gold, and paper

| Token | Value | Use |
|---|---|---|
| `--primary` | `#0e2d4d` | Navy. Navbar, hero, headings. |
| `--primary-deep` | `#081d33` | Hero gradient base. |
| `--accent` | `#c9a227` | Gold. Eyebrows, stats, hero CTA, card hover border. |
| `--secondary` | `#c8452f` | Brick red. Prices, chat button. |
| `--paper` | `#fbfaf7` | Warm off-white page background. |

**Why:** The previous palette was a brighter navy with orange-gold and a cool grey
background — closer to a dashboard than a campus store. Deepening the navy and
warming the background to paper makes the product photography (mostly navy
garments on white or black) sit on the page instead of fighting it. Gold is
reserved for things worth clicking, so it never competes with itself.

## 3. A hero that sells something

Replaced the one-line welcome box with a full hero: gold eyebrow, a 4.2rem serif
headline ("Wear the *Blue*" with *Blue* in italic gold), supporting copy, two
CTAs, and a stat strip (100+ pieces · XS–XXL · Live inventory). On the right,
three real catalogue photographs are staggered at slight rotations and lift
together on hover. A huge, barely-visible "Y" sits behind the copy.

**Why:** A shopper landing on the old homepage saw no merchandise at all and had
to click "Products" on faith. Now they see three actual garments above the fold.
The stat strip answers the two questions that stop a purchase — *do you have my
size* and *is it really in stock* — before they are asked.

## 4. Product cards

- Fixed `1 / 1` media frame, so the catalogue's mixed source images share a baseline.
- Image scales to 1.06 over 0.6s on hover; card lifts 8px; border warms to gold.
- Price in serif brick red, visually distinct from the name.
- `loading="lazy"` on every image.

**Why:** The grid holds 100 products of varying photo dimensions; a shared aspect
ratio is what makes it read as a catalogue rather than a pile. Lazy loading means
the page no longer pulls 100 images at once on first paint.

## 5. Hero CTA contrast

The shared `.cta-btn` is navy — invisible against a navy hero. Inside the hero it
is gold on deep navy instead.

**Why:** The primary action on the most important screen was effectively
camouflaged.

## 6. Supporting sections

- **Value props:** three cards, numbered 01–03 in gold, covering licensing, live
  stock, and durability — the three objections to buying campus merch online.
- **Campus favourites:** four real products straight from the API, with a "View
  all →" out to the full catalogue.
- **About Us:** four sections on a gold-ruled grid.

## 7. Removing what was fighting us

Deleted 166 lines of dead Vite template CSS and replaced `index.css` wholesale. It
had been forcing `text-align: center` onto every page, pinning `#root` to 1126px,
drawing stray borders down both sides, setting a purple accent, and — via a
`prefers-color-scheme: dark` block — would have flipped the background to near
black for any visitor browsing in dark mode.

**Why:** This was invisible on the author's machine and would have shown up on
someone else's.

## 8. Responsive

Verified at 1024px and 375px. On mobile the navbar wraps to two centred rows
(previously five links overflowed off-screen), the hero stacks, and the chat panel
is constrained to the viewport (previously it overflowed). No horizontal scroll at
either width.

---

## Why this should help the business

A shopper who lands on merchandise rather than a sentence has a reason to scroll.
Live size counts on the card and in the hero remove the main anxiety of buying
apparel online — ordering something that turns out to be gone. And the fixes in
§7 and §8 matter most for the shoppers the old build served worst: anyone on a
phone, and anyone with dark mode switched on.
