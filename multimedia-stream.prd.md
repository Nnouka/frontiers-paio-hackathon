# Aura — Unified Media Streaming Platform

**Concept:** Aura is a dark-themed media streaming hub targeting power users who consume both video and audio. It combines YouTube-style video discovery (thumbnail grids, view counts, duration overlays, recommendation sidebars) with Spotify-style audio experience (persistent mini-player, queue management, playlist editing). One tab, both worlds.

**Reference screenshots:** `multimedia/` (YouTube home, watch page, search, playlist; Spotify web player home, search, now-playing, playlist, artist).

**Key differentiators:**
- Unified search: one query returns video and audio results in separate lanes
- Persistent bottom player bar that expands into full-screen now-playing view (à la Spotify)
- Smart queue: drag-to-reorder, auto-mix video + audio based on mood tag
- Zero-white-page transitions — content streams in via skeleton shimmer; no hard page reloads

---

## Visual Identity

### Typography

| Role | Font | Weight | Size | Line Height |
|---|---|---|---|---|
| Logo | Plus Jakarta Sans | 800 | 22px | — |
| Hero heading | Plus Jakarta Sans | 700 | 48px desktop / 30px mobile | 1.1 |
| Section heading | Plus Jakarta Sans | 600 | 20px | 1.3 |
| Card title | Inter | 500 | 14px | 1.4 |
| Body / description | Inter | 400 | 15px | 1.6 |
| Meta / label | Inter | 400 | 12px | 1.5 |
| Player time | JetBrains Mono | 500 | 13px | — |
| Button | Inter | 600 | 14px | — |

All fonts via `next/font/google`. Import `Plus_Jakarta_Sans`, `Inter`, and `JetBrains_Mono` from `next/font/google` in `layout.tsx`; no `@font-face` overrides needed.

### Colors

| Token | Hex | Purpose |
|---|---|---|
| `void` | #0A0A0A | App background |
| `surface` | #141414 | Card surface, sidebar, modals |
| `elevated` | #1F1F1F | Hover state, player bar, tooltips |
| `border` | #2A2A2A | Dividers, input borders |
| `indigo` | #6366F1 | Primary CTA, active states, progress fill |
| `indigo-dim` | rgba(99,102,241,0.15) | Chip hover, badge bg |
| `rose` | #F43F5E | Like button active, error, remove |
| `amber` | #F59E0B | Star ratings, trending badge |
| `white` | #FFFFFF | Primary text |
| `muted` | #9CA3AF | Secondary text, placeholder, icons |
| `ghost` | #374151 | Disabled elements |
| `overlay` | rgba(0,0,0,0.75) | Modal backdrop, lightbox |

### Spacing & Geometry

- Base unit: 8px. All spacing multiples of 8.
- Card border-radius: 10px (video thumbs), 50% (album art circles), 8px (chips/badges).
- Button height: 44px (primary), 36px (secondary). Radius: 99px (pill), 8px (square).
- Input height: 44px. Border: 1px solid `#2A2A2A`. Focus: 1.5px `#6366F1`.
- Sidebar width: 240px (expanded), 64px (collapsed icon-only on laptop).
- Player bar height: 80px (collapsed), 100vh (expanded now-playing).
- Page max-width: 1600px, 24px horizontal padding.

---

## Sitemap

```
/                   Home — personalized feed, trending, continue watching
/search             Unified results — video lane + audio lane
/watch/:id          Video player — YouTube-style with sidebar recommendations
/listen/:id         Audio player route (redirects, plays via bottom bar, opens now-playing overlay)
/playlist/:id       Playlist detail — tracklist, cover, edit mode
/channel/:handle    Creator / artist page — grid of uploads + featured
/library            User library — saved, history, playlists
/settings           Account, playback, notification preferences
```

Auth is a modal overlay; no dedicated login page.

---

## Overview & Audience

**Aura** is a unified streaming platform for users who consume both long-form video and audio — music, podcasts, live sets — without switching apps. The feed, player, and library are content-type-agnostic: one queue can hold a YouTube-style tutorial followed by a Spotify-style album track.

**Primary audience:** 18–35 power consumers who have YouTube and Spotify open simultaneously. **Secondary:** content creators who upload and manage their own channels.

---

## User Roles

| Role | Access |
|---|---|
| **Guest** | Browse home feed, search, watch/listen (3 plays per session before auth prompt). Cannot save, subscribe, or sync progress. |
| **Member** | Full playback, save/like/subscribe, create playlists, library access, cross-device progress sync. |
| **Creator** | All Member access + channel dashboard: upload, analytics, edit metadata, manage comments. |
| **Admin** | All Creator access + content moderation queue, user management, featured content curation. |

---

## Authentication

**Providers:** Google OAuth, Apple OAuth, Email + OTP (6-digit code via Resend API).

**Session:** NextAuth.js v5, JWT. Cookie: `httpOnly`, `sameSite: strict`, 90-day maxAge.

**Sign-in flow:**
1. Trigger: clicking "Sign in" in sidebar, or attempting "Save", "Subscribe", or "Like" while logged out.
2. Auth modal appears (440px centered, `background: #141414`, `border-radius: 16px`, backdrop `rgba(0,0,0,0.75)`). Header "Welcome to Aura" Plus Jakarta Sans 700 24px white. Google + Apple OAuth buttons, then "or" divider, then email input + "Continue" indigo button.
3. OTP phase: 6 individual input boxes (48×56px, JetBrains Mono 600 24px). Auto-advances on keystroke; backspace returns to previous. Auto-submits on 6th digit → POST `/api/auth/otp/verify`. "Resend code" disabled 30s with countdown.
4. On success: modal closes, session hydrates. Feed personalizes; saved state migrated from `localStorage` to server.

**Guest fallback:** Playback works unauthenticated. Save/like shows auth modal. `localStorage` tracks progress until sign-in, then migrated to `PlaybackEvent`.

---

## Main Features

### Thumbnail Grids with Duration/View Count

**Video card anatomy:**
- Thumbnail: 16:9 ratio, `border-radius: 10px`, `background: #1F1F1F`. Duration badge bottom-right: `rgba(0,0,0,0.82)` pill, JetBrains Mono 500 12px white, `padding: 2px 6px`. Watch-progress bar: 3px at thumbnail bottom edge — `#6366F1` fill on `#2A2A2A` track (shows % watched for logged-in users).
- Below thumbnail: channel avatar 32px circle + title Inter 500 14px white (2 lines, ellipsis) + channel name 12px `#9CA3AF` + "2.4M views · 3 days ago" 12px `#9CA3AF`.
- **Hover (desktop):** `translateY(-4px)` 200ms ease + shadow. After 500ms delay: preview GIF/5s clip overlays thumbnail (lazy-loaded). Three-dot ⋮ icon fades in top-right → popover: "Add to queue / Save to playlist / Not interested / Report".

**Audio / album card:** Square art, `border-radius: 10px`. Play button (40px circle, `#6366F1`) fades in bottom-right on hover. Title + artist below.

**Grid configurations:** "Trending Now" — 4 columns desktop / 2 tablet / 1 mobile, `gap: 16px`. "New from Subscriptions" — 3 columns. All grids lazy-load with skeleton shimmer.

---

### Media Player Controls

#### Video Player (`/watch/:id`)

Native `<video>` + custom control overlay. Controls fade in on hover or pause; auto-hide 3s into playback.

**Control bar (bottom, 44px, `linear-gradient(transparent, rgba(0,0,0,0.8))`):**
- **Seek bar (full-width):** 4px track → 6px on hover (150ms ease). Colors: played `#6366F1`, buffered `#6B7280`, empty `#374151`. Thumb (14px circle, `#6366F1`) visible on hover only. Click/drag to seek. Hover: time tooltip above cursor (JetBrains Mono 500 12px black pill). Chapter markers: 2px white ticks at chapter timestamps.
- **Left:** Play/Pause (40px tap, 24px icon). Skip ±10s. Volume: speaker icon mutes/unmutes; horizontal 80px slider (3px, same track style). Time "1:23 / 12:47" JetBrains Mono 500 13px `#9CA3AF`.
- **Right:** CC subtitles. Speed "1×" → popover (0.25×–2× in 0.25 steps). Quality "HD" → popover (Auto, 1080p, 720p, 480p, 360p). Theatre mode. Fullscreen.
- **Keyboard:** Space → play/pause. ←/→ → ±5s. M → mute. F → fullscreen. 0–9 → seek to 0–90%.

#### Audio Player (persistent bottom bar, 80px)

Always-visible at root layout (`background: #141414`, `border-top: 1px solid #2A2A2A`). Three-column:

- **Left 30%:** Album art 56×56px `border-radius: 6px` + title Inter 500 14px white (1 line ellipsis) + artist 12px `#9CA3AF`. Heart icon → save (rose fill, spring animation).
- **Center 40%:** Shuffle → Prev → Play/Pause (40px circle, `#6366F1`) → Next → Repeat. Seek bar 3px below controls. Time labels flanking bar, JetBrains Mono 500 11px.
- **Right 30%:** Queue icon (opens drawer). Volume icon + 80px slider. Expand ⤢ → full-screen now-playing overlay.

**Full-screen now-playing overlay:** `position: fixed`, full viewport. Background: dominant color extracted from album art via `canvas.getImageData` + `backdrop-filter: blur(80px)`. Album art 320×320px `border-radius: 16px` centered. 56px play button. Full-width seek bar. Bottom row: Lyrics toggle (slides up lyrics panel 50vh, lines highlight in sync with `currentTime`) + Queue toggle + Volume slider 160px. Swipe-down or × collapses.

---

### Playlist & Queue Management

**Live queue (across all playback):**
- Queue drawer: 320px from right, slides in 250ms. Ordered upcoming items: thumbnail 60×60px + title + duration.
- Drag-to-reorder via @dnd-kit: grab handle (⠿) on row hover. Dragged item opacity 0.5; drop target animates height 200ms.
- Add to queue: card ⋮ → "Add to queue" → item appended to `playerStore.queue[]`. Toast "Added to queue".
- Autoplay: when queue empties → fetch recommendations → next item plays with 2s Howler.js crossfade.
- Shuffle: `playerStore.shuffleQueue()` (Fisher-Yates). Items animate to new positions, 30ms stagger per item.

**Playlist page (`/playlist/:id`):**
- Hero 280px: dominant-color gradient + cover 200×200px + title, description, meta (owner · year · song count · total duration). Play + Shuffle buttons.
- Tracklist table: columns — # / Title+art / Album / Date added / Duration. Row hover: `background: #1F1F1F`. Playing row: # → equalizer bars SVG animation `#6366F1`. Row hover actions: heart + ⋮ (Add to queue / Remove / Share). Drag handle for reorder.
- **Edit mode (owner):** cover → dropzone (dashed `#6366F1` border). Title/description → `contenteditable`. Per-track × button.
- **Create playlist:** Save popover → "New playlist" → inline name input (44px, Enter to confirm) → POST `/api/playlists`.

---

### Recommendation Sidebar & Up-Next Carousel

**Watch page sidebar (right 32%, sticky):**
- Header: "Up next" Plus Jakarta Sans 600 16px + Autoplay toggle (indigo pill switch).
- 15 compact video cards: thumbnail 120×68px + title 13px 500 (2 lines) + channel 12px `#9CA3AF` + duration. Active/queued item: `border-left: 3px solid #6366F1`. Drag-to-reorder via dnd-kit.
- Populated by `GET /api/watch/:id` → `recommendations[]` ranked by tag overlap + watch history.

**Home feed carousels (horizontal scroll rails):**
- Section label + "See all →" right. Left/right arrows (36px circles, white, `box-shadow: 0 2px 8px rgba(0,0,0,0.4)`) appear on hover, fade in 150ms. Click scrolls 4 card widths.
- Native horizontal scroll, scrollbar hidden (`overflow-x: auto; scrollbar-width: none`).

---

## Data Model

```
User {
  id:            uuid (PK)
  handle:        string (unique)
  display_name:  string
  avatar_url:    string | null
  email:         string (unique)
  role:          enum(guest|member|creator|admin)
  subscriptions: uuid[] → Channel
  preferences: {
    autoplay: boolean
    quality:  enum(auto|1080p|720p|480p)
    speed:    float
    theme:    enum(dark|amoled)
  }
}

Video {
  id:            uuid (PK)
  channel_id:    uuid → Channel
  title:         string
  description:   string
  thumbnail_url: string
  stream_url:    string  -- HLS .m3u8
  duration_s:    integer
  view_count:    integer
  like_count:    integer
  chapters:      [{title, start_s}]
  tags:          string[]
  category:      string
  published_at:  timestamp
}

Track {
  id:          uuid (PK)
  artist_id:   uuid → Channel
  title:       string
  album:       string | null
  art_url:     string
  stream_url:  string
  duration_s:  integer
  play_count:  integer
  like_count:  integer
  lyrics:      [{line, start_s}] | null
  tags:        string[]
  released_at: date
}

Playlist {
  id:          uuid (PK)
  owner_id:    uuid → User
  title:       string
  description: string
  cover_url:   string | null
  is_public:   boolean
  items:       [{media_id, media_type: enum(video|track), position}]
  created_at:  timestamp
}

Channel {
  id:               uuid (PK)
  handle:           string (unique)
  display_name:     string
  avatar_url:       string
  banner_url:       string | null
  subscriber_count: integer
  verified:         boolean
}

PlaybackEvent {
  user_id:    uuid → User
  media_id:   uuid
  media_type: enum(video|track)
  progress_s: integer
  completed:  boolean
  played_at:  timestamp
}
```

Relations: User → many Playlists. Playlist items are polymorphic (Video or Track via `media_type`). PlaybackEvent powers "Continue Watching" rail and recommendation ranking. User subscribes to many Channels.

---

## Search, Filter & Sort

**Search bar:** Sticky, centered (max-width 720px), `border-radius: 99px`, `background: #1F1F1F`. Focus: `border-color: #6366F1`. Autocomplete dropdown on ≥ 2 chars: up to 8 rows (search icon for new / clock for history). Escape closes. Enter → `/search?q=...`.

**Result tabs:** All | Videos | Music | Channels | Playlists. Active tab: `border-bottom: 2px solid #6366F1`.

**Video lane:** List rows — thumbnail 168×94px + title + channel + description snippet + view count + date + duration.

**Audio lane:** Horizontal album card grid (4 cols), shown below video lane when tab = "All".

**Filter sidebar (160px, desktop only):**
- Upload date: radio pills — Any / Today / This week / This month
- Duration: pills — Any / Short <4m / Medium 4–20m / Long >20m
- Type: checkboxes — Video / Audio / Live / Playlist
- Sort by: dropdown — Relevance / Upload date / View count / Rating
- "Reset" text link clears all and re-fetches.

**API:** `GET /api/search?q=lofi&type=video&sort=view_count&duration=medium&upload_date=week`. Debounced 300ms. Response: `{ videos: [], tracks: [], channels: [] }`.

---

## Error Handling, Empty States & Notifications

**Empty states:**
- No search results: magnifying glass SVG 80px `#2A2A2A` + "No results for "[query]"" Plus Jakarta Sans 600 20px + "Try different keywords" 14px `#9CA3AF` + "Clear filters" outline button.
- Empty library: film + headphone SVG + "Your library is empty" + "Start exploring →" indigo pill → `/`.
- Empty queue: music note SVG + "Queue is empty" + "Add something to get started" 14px `#9CA3AF`.

**Loading states:** Skeleton shimmer matches exact card dimensions — 1400ms gradient sweep `linear infinite`. Player bar shows skeleton title + indeterminate progress pulse while buffering. Video player: 40px indigo spinner ring centered on black `#000` during HLS buffer.

**Error states:**
- Stream fails: "Couldn't load this video" centered + "Retry" button → re-calls `HLS.loadSource()`.
- Search API error: "Something went wrong" + "Try again" button → SWR `mutate()`.
- OTP invalid/expired: input boxes shake 200ms, border `#F43F5E`, "Invalid code — try again" 13px `#F43F5E` below.
- Network offline: toast "You're offline — playback may be limited" (neutral type, persistent until online).

**Toast notifications (bottom-right, `position: fixed`, `z-index: 9999`):**
- Slide up 400ms (`translateY(20px)→0`), auto-dismiss 3000ms, slide down 300ms.
- Types: success (indigo left border) / error (rose) / neutral (`border: 1px solid #2A2A2A`).
- Examples: "Saved to Watch Later" · "Added to queue" · "Subscribed to [Channel]" · "Removed from library".
- Max 3 stacked; 4th arrival auto-dismisses oldest.

---

## Real-time Features & Admin Tools

**Live streams:**
- HLS with 3s segments for near-live latency. Cards show "LIVE" red badge + viewer count refreshed every 30s via SWR `revalidateOnInterval`.
- Watch page right sidebar replaces recommendations with live chat (WebSocket `/api/ws/comments/:videoId`). New message: slide-in from bottom 150ms. Virtual list capped at 200 messages.

**View counts:** Incremented client-side optimistically on video load; confirmed server-side via POST `/api/history`.

**Admin tools** (role = admin, route `/admin`, hidden from nav):
- **Moderation queue:** Reported items table — title / reporter / reason / date. Actions: Approve (clear report) / Remove (`is_active: false`) / Warn creator.
- **Featured curation:** Drag-to-reorder 3 hero banner slots. Changes propagate within 60s (ISR revalidation).
- **User management:** Search by handle/email, view role, promote to Creator, suspend account.

**Payments:** Not in MVP. Stripe Checkout stub in `/settings` → "Premium" button shows "Coming soon" tooltip. Premium planned to remove guest play limit and unlock HD for all users.

---

## Navigation Structure

### Left Sidebar (permanent on desktop, drawer on mobile)

**Top — logo block (56px):** "Aura" Plus Jakarta Sans 800 white. Collapse toggle (chevron-left 20px `#9CA3AF`). Collapsed → 64px, icons only with Tippy tooltips.

| Icon | Label | Route |
|---|---|---|
| HomeIcon | Home | `/` |
| SearchIcon | Search | `/search` |
| PlaySquare | Watch | `/watch` |
| Headphones | Listen | `/listen` |
| ListMusic | Library | `/library` |
| TrendingUp | Trending | `/search?tab=trending` |

Active: `background: rgba(99,102,241,0.15)`, `color: #6366F1`, `border-left: 3px solid #6366F1`. Hover: `background: #1F1F1F`. Icon 20px, label Inter 500 14px.

**Bottom:** Avatar 32px + username 13px. Settings gear → `/settings`. Logged out: "Sign in" indigo pill 36px.

**Mobile:** Top bar (logo + hamburger + search icon). Hamburger → full-screen nav drawer. Bottom tab bar: Home / Search / Library / Now Playing / Profile.

### Footer: none — player bar occupies bottom 80px permanently.

---

## Pages & Interactions

### Home (`/`)

Hero banner (480px, 3 featured items, 6000ms cycle, crossfade 400ms). Gradient `linear-gradient(135deg, #1e1b4b 0%, #0A0A0A 60%)` + blended thumbnail. Dot indicators bottom-center. Category chip bar (sticky on scroll past hero, 56px, filters feed 200ms fade).

Feed sections (40px gap): "Continue Watching" horizontal rail → "Your Mix" audio rail → "Trending Now" 4-col grid → "New from Subscriptions" 3-col → "Recommended Podcasts" 4-col.

### Search (`/search`)

Sticky search bar + tabs row. Desktop: 160px filter sidebar left + results main column. Video lane: list rows. Audio lane: card grid. Empty state: SVG + message + clear button.

### Watch (`/watch/:id`)

68/32 two-column. Left: player (see Media Player Controls) + title + meta + action bar (like/dislike/share/save) + channel strip (avatar + subscribe button) + expandable description + comments. Right: recommendation sidebar (see above).

### Playlist (`/playlist/:id`)

Dominant-color hero + tracklist table + edit mode. See Playlist & Queue Management above.

### Channel (`/channel/:handle`)

Banner 240px + avatar 96px overlapping by 48px + name + verified badge. Stats: Subscribers / Videos / Views. Subscribe button. Tabs: Videos (3-col grid) / Playlists / About.

### Library (`/library`)

Tabs: Saved / History / Playlists. History: list with per-item "Remove" option. Playlists: grid with "New playlist" card.

### Settings (`/settings`)

Sections: Account / Playback (quality, autoplay, speed) / Notifications / Privacy. Inline save per field + success toast on update.

---

## Animations & Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Hero banner | Auto-advance | opacity crossfade | 400ms | ease |
| Hero dot indicator | Slide change | width 8px→24px, `#6366F1` | 300ms | cubic-bezier(0.16,1,0.3,1) |
| Category chip | Click | background/color fill | 150ms | ease |
| Video card hover | Mouse-enter | translateY(-4px) + shadow | 200ms | ease |
| Thumb preview | 500ms hover delay | opacity 0→1 | 200ms | ease |
| Three-dot popover | Click | translateY(-6px)→0 + opacity | 180ms | ease-out |
| Play button on audio card | Card hover | translateY(-8px) + opacity 0→1 | 200ms | ease |
| Seek bar | Hover | height 4px→6px | 150ms | ease |
| Volume slider | Icon hover | width 0→80px | 200ms | cubic-bezier(0.16,1,0.3,1) |
| Like button | Click | scale 1→1.4→1 + fill | 350ms | spring stiffness 400 damping 15 |
| Subscribe button | Click | color swap + micro-shake | 300ms | ease |
| Description expand | Show more | max-height to measured | 300ms | ease |
| Now-playing overlay open | Expand click | translateY(100vh)→0 | 350ms | cubic-bezier(0.16,1,0.3,1) |
| Now-playing overlay close | Swipe/click | translateY(0)→100vh | 280ms | ease-in |
| Album art gradient | Track change | background-color crossfade | 800ms | ease |
| Queue drawer | Queue icon | translateX(320px)→0 | 250ms | cubic-bezier(0.16,1,0.3,1) |
| Drag reorder | Drag | placeholder height + item opacity 0.5 | 200ms | ease |
| Toast notification | Trigger | translateY(20px)→0 | 400ms | ease |
| Skeleton shimmer | Loading | gradient sweep | 1400ms | linear infinite |
| Route transition | Navigation | opacity 1→0 (80ms) → 0→1 (180ms) | 260ms | ease |
| Auth modal | Trigger | backdrop 150ms + translateY(16px)→0 | 250ms | ease-out |

---

## Technical Requirements

| Library | Version | Feature |
|---|---|---|
| Next.js | 15 (App Router) | Framework, ISR `/watch/:id` revalidate 60s, streaming Suspense |
| React | 19 | UI |
| Tailwind CSS | 4 | Styling with Aura design tokens |
| Zustand | 5 | `playerStore` (track, queue, state), `authStore`, `feedStore` |
| Howler.js | 2.x | Audio playback, preloading, 2s crossfade |
| HLS.js | latest | ABR video streaming (m3u8) |
| @dnd-kit/core | latest | Drag-to-reorder queue and tracklist |
| Radix UI | latest | Popover, dialog, slider, dropdown primitives |
| NextAuth.js | 5 | Google OAuth, Apple OAuth, Email OTP via Resend |
| SWR | 2 | Feed, search, recommendations with revalidation |
| Framer Motion | 11 | Now-playing overlay, hero crossfade |
| canvas-color-thief | latest | Dominant color for now-playing gradient |
| next/image | built-in | WebP, lazy loading, responsive srcset |
| next/font | built-in | Plus Jakarta Sans, Inter, JetBrains Mono |

**API Routes:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/feed` | Personalized home feed — sections array |
| GET | `/api/search` | `?q&type&sort&duration&upload_date` |
| GET | `/api/watch/:id` | Video metadata, stream URL, recommendations |
| GET | `/api/track/:id` | Audio metadata, stream URL |
| GET | `/api/playlist/:id` | Playlist + ordered tracks |
| GET | `/api/channel/:handle` | Channel profile + uploads |
| POST | `/api/queue` | Update queue order |
| POST | `/api/history` | Log playback event |
| POST | `/api/library/save` | Toggle saved track/video |
| POST | `/api/subscribe` | Toggle channel subscription |

---

## Responsive Behavior

| Breakpoint | Specific Changes |
|---|---|
| ≥ 1280px | Sidebar 240px expanded. Watch: 68/32 split. 4-col grid. Player bar 3-col. |
| 1024–1279px | Sidebar 64px icon-only. Watch sidebar 25%. Grid 3-col. |
| 768–1023px | Sidebar hidden → bottom 5-tab nav. Watch sidebar below player. Grid 2-col. Player bar: center controls only. |
| < 768px | Top bar only. Grid 1-col. Player bar: art + play/pause + expand only. HLS auto-selects ≤720p. Recommendation sidebar lazy via `IntersectionObserver`. Canvas color-thief only on now-playing open. |

---

## Performance & Accessibility

**Targets:** LCP < 2.0s on 4G. CLS < 0.05. Initial JS ≤ 180KB gzip (HLS.js, Howler.js, Framer Motion, canvas-color-thief all in dynamic `import()` chunks).

**Video:** HLS ABR starts at lowest bitrate, steps up within 3s. Buffer 30s max / back-buffer 10s. **Audio:** Howler.js preloads next track at 80% of current.

`prefers-reduced-motion`: all transforms → `duration: 0ms`. Hero auto-advance disabled. Skeleton → static block. Drag → instant snap.

**Accessibility:** All controls Tab/Enter/Space navigable. `<video>` includes `<track kind="captions">` (VTT). Seek + volume: `role="slider"` with `aria-valuemin/max/now`. Player bar: `role="region" aria-label="Media player"`. Like/subscribe: `aria-pressed`. Modals: `role="dialog"`, `aria-modal`, focus-trapped, Escape closes. Toast region: `aria-live="polite"`. Contrast: `#FFF` on `#141414` = 14.7:1 (AAA). `#9CA3AF` on `#0A0A0A` = 6.2:1 (AA).
