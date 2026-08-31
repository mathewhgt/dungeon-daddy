# Dungeon Daddy — Comprehensive User Manual
**Version 2.0 (D&D 5e 2024 & 2014 Edition Support)**

Welcome to **Dungeon Daddy**, an all-in-one Dungeon Master campaign management suite and Virtual Tabletop (VTT). This manual is structured into two main parts:
1. **Part 1: Use Cases & Workflows** — Step-by-step guides for preparing and running sessions, battlemaps, combat, campaigns, character creation, note-taking, and loot generation.
2. **Part 2: Complete Feature Reference** — In-depth breakdown of every module, panel, modal, tool, setting, and keyboard shortcut available across the application.

---

# Table of Contents

- [Quick Reference: Global Hotkeys](#quick-reference-global-hotkeys)
- [PART 1: Use Cases & Workflows](#part-1-use-cases--workflows)
  - [1. Battlemaps & Virtual Tabletop (VTT)](#1-battlemaps--virtual-tabletop-vtt)
    - [1.1 How to Create a New Battlemap](#11-how-to-create-a-new-battlemap)
    - [1.2 Importing Background Images](#12-importing-background-images)
    - [1.3 Calibrating & Resizing the Grid](#13-calibrating--resizing-the-grid)
    - [1.4 Placing and Configuring Tokens](#14-placing-and-configuring-tokens)
    - [1.5 Setting Up Dynamic Fog of War & Vision](#15-setting-up-dynamic-fog-of-war--vision)
    - [1.6 Placing Interactive Map Pins (Points of Interest)](#16-placing-interactive-map-pins-points-of-interest)
    - [1.7 Running a Live Battlemap Session](#17-running-a-live-battlemap-session)
    - [1.8 Using Spell Templates & Animated Spell Effects](#18-using-spell-templates--animated-spell-effects)
    - [1.9 Projecting to an External Player Display / TV Table](#19-projecting-to-an-external-player-display--tv-table)
  - [2. Running Combat Encounters](#2-running-combat-encounters)
    - [2.1 Building Encounters with CR Scaling](#21-building-encounters-with-cr-scaling)
    - [2.2 Launching Combat from the Encounter Builder or Battlemap](#22-launching-combat-from-the-encounter-builder-or-battlemap)
    - [2.3 Running Turns, Rounds, and Initiative](#23-running-turns-rounds-and-initiative)
    - [2.4 Managing HP, Temporary HP, and Damage Calculation](#24-managing-hp-temporary-hp-and-damage-calculation)
    - [2.5 Automated Concentration Checks](#25-automated-concentration-checks)
    - [2.6 Condition Tracking & Duration Countdowns](#26-condition-tracking--duration-countdowns)
    - [2.7 Handling Legendary Actions, Lair Actions, and Reactions](#27-handling-legendary-actions-lair-actions-and-reactions)
  - [3. Managing Your Campaign & Sessions](#3-managing-your-campaign--sessions)
    - [3.1 Creating & Switching Campaigns](#31-creating--switching-campaigns)
    - [3.2 Tracking Calendar Dates, Quests, and Faction Reputations](#32-tracking-calendar-dates-quests-and-faction-reputations)
    - [3.3 Organizing Session Notes with Nested Folders](#33-organizing-session-notes-with-nested-folders)
    - [3.4 Using Slash Commands & Embedding Statblocks in Notes](#34-using-slash-commands--embedding-statblocks-in-notes)
    - [3.5 Embedding Live Interactive DC Check Cards](#35-embedding-live-interactive-dc-check-cards)
    - [3.6 Quick Navigation with the Radial Menu](#36-quick-navigation-with-the-radial-menu)
    - [3.7 Pinning Frequently Used Content with Bookmarks](#37-pinning-frequently-used-content-with-bookmarks)
  - [4. Managing the Party & Character Sheets](#4-managing-the-party--character-sheets)
    - [4.1 Managing the Party Roster & Passive Dashboard](#41-managing-the-party-roster--passive-dashboard)
    - [4.2 Running Short and Long Rests](#42-running-short-and-long-rests)
    - [4.3 Tracking Party Currency and Group Loot](#43-tracking-party-currency-and-group-loot)
    - [4.4 Editing Character Sheets (2024 / 2014 Rules)](#44-editing-character-sheets-2024--2014-rules)
    - [4.5 Printing & Exporting Character Sheets](#45-printing--exporting-character-sheets)
  - [5. Creating Characters with the 2024 Character Builder](#5-creating-characters-with-the-2024-character-builder)
    - [5.1 Step 1: Origin (Species & Background)](#51-step-1-origin-species--background)
    - [5.2 Step 2: Class & Subclass Selection](#52-step-2-class--subclass-selection)
    - [5.3 Step 3: Ability Score Generation (Standard Array, Point Buy, Rolling)](#53-step-3-ability-score-generation-standard-array-point-buy-rolling)
    - [5.4 Step 4: Class Features & Spells](#54-step-4-class-features--spells)
    - [5.5 Step 5: Equipment & Narrative Details](#55-step-5-equipment--narrative-details)
    - [5.6 Step 6: Review, Validation, and Export to Party](#56-step-6-review-validation-and-export-to-party)
  - [6. Generating Content On-the-Fly](#6-generating-content-on-the-fly)
    - [6.1 Generating Individual & Hoard Loot by CR](#61-generating-individual--hoard-loot-by-cr)
    - [6.2 Generating Merchant Shop Inventories](#62-generating-merchant-shop-inventories)
    - [6.3 Generating Dynamic NPCs with Roleplay Hooks](#63-generating-dynamic-npcs-with-roleplay-hooks)
  - [7. Expanding the Compendium & Homebrew Content](#7-expanding-the-compendium--homebrew-content)
    - [7.1 Searching and Filtering Monsters, Spells, Items, and Roll Tables](#71-searching-and-filtering-monsters-spells-items-and-roll-tables)
    - [7.2 Creating Custom Homebrew Monsters, Spells, and Items](#72-creating-custom-homebrew-monsters-spells-and-items)
    - [7.3 Building Custom Multi-Tier Roll Tables](#73-building-custom-multi-tier-roll-tables)
    - [7.4 Adding Custom Sourcebooks & Chapters in the Handbook](#74-adding-custom-sourcebooks--chapters-in-the-handbook)
- [PART 2: Feature-by-Feature Reference](#part-2-feature-by-feature-reference)
  - [1. Titlebar & Application Header](#1-titlebar--application-header)
  - [2. Primary Navigation Sidebar](#2-primary-navigation-sidebar)
  - [3. Battlemap (VTT) Module](#3-battlemap-vtt-module)
  - [4. Combat Tracker Module](#4-combat-tracker-module)
  - [5. Encounter Builder Module](#5-encounter-builder-module)
  - [6. Compendium Module](#6-compendium-module)
  - [7. Party Management Module](#7-party-management-module)
  - [8. Notes & Worldbuilding Module](#8-notes--worldbuilding-module)
  - [9. Tools & Generators Module](#9-tools--generators-module)
  - [10. Handbook Module](#10-handbook-module)
  - [11. Template Manager Module](#11-template-manager-module)
  - [12. Global Drawers & Overlays](#12-global-drawers--overlays)
    - [12.1 Dice Tray Drawer (Ctrl + D)](#121-dice-tray-drawer-ctrl--d)
    - [12.2 Session Bookmarks Drawer (Ctrl + B)](#122-session-bookmarks-drawer-ctrl--b)
    - [12.3 Quick Action Radial HUD (Ctrl + Space)](#123-quick-action-radial-hud-ctrl--space)
  - [13. External Display & Player View System](#13-external-display--player-view-system)
  - [14. Database Snapshots, Rollback & Backup System](#14-database-snapshots-rollback--backup-system)
  - [15. Settings & Customization](#15-settings--customization)

---

# Quick Reference: Global Hotkeys

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Ctrl + Space` | Toggle Global Quick-Action Radial Menu | Global |
| `Ctrl + D` | Toggle Global 3D Dice Tray Drawer | Global |
| `Ctrl + B` | Toggle Session Bookmarks Drawer | Global |
| `Ctrl + F` | Focus Search Bar in active view (Compendium/Handbook/Notes) | Global |
| `Ctrl + S` | Force Save Database / Active Note / Entity | Global |
| `Space` + Drag | Pan across Battlemap Canvas | VTT |
| `Mouse Wheel` | Zoom in / Zoom out on Battlemap | VTT |
| `Shift` + Click/Drag | Freehand Line / Measurement Ruler | VTT |
| `Alt` + Click | Quick Ping on Battlemap (visible to external player view) | VTT |
| `Escape` | Close active modal / Clear selection / Dismiss overlay | Global |

---

# PART 1: Use Cases & Workflows

---

## 1. Battlemaps & Virtual Tabletop (VTT)

The Battlemap module transforms Dungeon Daddy into an interactive tabletop. It supports high-resolution image backgrounds, customizable square and hexagonal grids, dynamic fog-of-war with line-of-sight raycasting, interactive compendium-linked pins, token condition/HP tracking, dynamic spell animations, and dual-monitor projector casting.

```
+------------------------------------------------------------------------------------+
|  [VTT Toolbar] (Select, Move, Fog Brush, Walls, Pins, Ruler, Spell AOE, Ping)      |
+------------------------------------------------------------------------------------+
|                                                                                    |
|    +----------------------------------------------------+    +------------------+  |
|    |                                                    |    | Token Drawer /   |  |
|    |             Interactive Battlemap Canvas           |    | Map Layers       |  |
|    |                                                    |    | - Monsters       |  |
|    |   [Token: Goblin]       (Pin: Secret Door)         |    | - Players        |  |
|    |          \                  /                      |    | - Map Settings   |  |
|    |           \________________/                       |    | - Fog Controls   |  |
|    |                                                    |    +------------------+  |
|    +----------------------------------------------------+                          |
|  [VTT Combat HUD: Turn Order, Round Counter, Quick Damage, Concentration Triggers] |
+------------------------------------------------------------------------------------+
```

### 1.1 How to Create a New Battlemap
1. Click **Battlemaps** in the sidebar navigation (or press `Ctrl + Space` -> select **Maps**).
2. In the top-left map dropdown, click **Manage Maps** or click the `+ New Map` button.
3. In the **Map Manager Modal**:
   - Enter a **Map Title** (e.g., *"Cragmaw Hideout - Main Cavern"*).
   - Choose a **Category / Folder** (e.g., *Dungeons, Wilderness, Towns, Encounters*).
   - Set the **Grid Dimensions** in squares (Width × Height, default `30 × 20`).
   - Set the **Grid Cell Size** in pixels (default `50px`).
   - Select the **Grid Type** (*Square, Hex Horizontal, Hex Vertical, or Gridless*).
   - Set default **Grid Color** and **Grid Opacity** (0% to 100%).
4. Click **Create Map**. The new canvas opens immediately.

---

### 1.2 Importing Background Images
You can set any local image file or web URL as your map background:
1. Open your map and click the **Map Settings** (gear icon) or **Map Manager** on the toolbar.
2. In the **Background Image** section:
   - **Local File:** Click **Upload Image / Browse** and select your `.jpg`, `.png`, `.webp`, or `.svg` file.
   - **Image URL:** Paste any direct web image link into the **Image URL** field.
3. Once loaded, you can adjust:
   - **Image Offset X / Y**: Shift the background beneath the grid.
   - **Image Scale / Fit**: Scale the background proportionally or stretch to fill grid dimensions.
4. Click **Apply Changes**.

---

### 1.3 Calibrating & Resizing the Grid
When importing a pre-gridded map image, use the **Grid Calibration Tool** to align Dungeon Daddy’s digital grid with the artwork’s printed squares:

#### Method A: 3-Point Calibration HUD (Recommended)
1. Click the **Calibrate Grid** icon on the VTT toolbar.
2. The **Grid Calibration HUD** appears at the top of the canvas.
3. Click and drag the **3-Point Calibration Box** over any visible 3×3 square section on your map artwork.
4. The calibration engine will automatically calculate the exact pixel size per square and adjust the map offset to snap cleanly into place.
5. Click **Confirm Calibration**.

#### Method B: Manual Fine-Tuning Modal
1. Click **Resize / Adjust Grid** in the toolbar.
2. Use the interactive sliders or numeric inputs to tweak:
   - **Cell Size (px)**: Fine-tune in 0.5px increments.
   - **Horizontal / Vertical Offset (px)**: Nudge the grid along X and Y axes.
   - **Map Bounds**: Expand or shrink the total width and height in squares without distorting token positions.
3. Click **Save Grid Settings**.

---

### 1.4 Placing and Configuring Tokens
Tokens represent Player Characters, Monsters, NPCs, and Objects on the grid.

1. **Adding Player Tokens**: Open the **Tokens / Party** drawer on the right side of the canvas. Drag any player character directly onto a grid cell.
2. **Adding Monster Tokens**: Open the **Compendium / Monsters** tab within the token drawer. Search for any monster (e.g., *"Bugbear"* or *"Ancient Red Dragon"*) and drag it onto the canvas.
   - You can add multiple instances; they will automatically be labeled with unique numbers (*Bugbear 1, Bugbear 2*).
3. **Configuring Token Properties**: Right-click any token on the map to open the **Token Context Menu**:
   - **Size**: Change footprint (*Tiny [0.5×0.5], Small/Medium [1×1], Large [2×2], Huge [3×3], Gargantuan [4×4+]*).
   - **HP & Temp HP**: View and adjust current/maximum Hit Points.
   - **Conditions**: Apply D&D 5e status conditions (*Blinded, Charmed, Frightened, Invisible, Paralyzed, Poisoned, Prone, Stunned, Unconscious, Exhaustion, etc.*) with visual badge rings.
   - **Elevation**: Set height above or below ground in feet (e.g., `+30 ft Flying`).
   - **Visibility**: Toggle **Hidden from Players** (renders the token semi-transparent for the DM and invisible on the Player Display).
   - **Rotation**: Rotate facing angle.
   - **Delete**: Remove token from the canvas.

---

### 1.5 Setting Up Dynamic Fog of War & Vision
Dungeon Daddy supports both **Manual Fog Brushes** and **Dynamic Raycast Line-of-Sight (LoS)**:

```
[DM View: Everything Visible]                   [Player View: Fog of War Applied]
+-------------------------------+               +-------------------------------+
| Token (Goblin)                |               | ############################# |
| [Wall]-----------------[Wall] |               | ######### (Hidden) ########## |
|           (Door)              |     ===>      | ############################# |
|                               |               |                               |
|        Token (Player)         |               |        Token (Player)         |
+-------------------------------+               +-------------------------------+
```

1. **Enabling Fog of War**:
   - In the VTT toolbar, toggle the **Fog of War** switch to **ON**.
2. **Dynamic Line of Sight (LoS) & Walls**:
   - Select the **Wall Tool** from the toolbar.
   - Click to draw wall segments along dungeon walls, columns, and closed barriers.
   - Draw **Doors / Portals**: Click the segment and mark it as a *Door*. In live play, clicking a door instantly toggles it between *Open* (allows vision/movement) and *Closed* (blocks vision).
   - When a player token moves, the dynamic raycast engine automatically calculates the visible polygon and reveals explored areas.
3. **Manual Fog Brush Controls**:
   - **Reveal Brush**: Paint over areas to manually uncover them.
   - **Hide Brush**: Paint over areas to restore black fog.
   - **Adjust Brush Size**: Change the brush diameter from 1 to 10 grid squares.
   - **Reset Fog**: Instantly re-cover the entire map with fog.

---

### 1.6 Placing Interactive Map Pins (Points of Interest)
Map Pins allow you to anchor rich DM notes, secrets, monster traps, and compendium links directly onto specific rooms or landmarks:

1. Select the **Pin Tool** from the toolbar.
2. Click anywhere on the map to open the **Pin Editor Modal**:
   - **Pin Title**: Enter a name (e.g., *"Room 4: The Goblin Armory"* or *"Chest with Poison Needle Trap"*).
   - **Pin Icon & Color**: Select an icon (*Skull, Chest, Book, Trap, Portal, Question Mark, Star*) and color-code it.
   - **Linked Entity**: Attach a **Campaign Note**, **Monster Statblock**, **Item**, **Spell**, or **Roll Table**.
   - **DM Secret Notes**: Write private text visible only to the DM on hover/click.
   - **Visibility**: Toggle whether this pin is visible to players on the external display.
3. **Hover & Click**: Hovering over a pin displays a quick tooltip summary. Clicking it opens the full linked entity (such as the room's campaign note or the monster's statblock) in an instant popover without leaving the map.

---

### 1.7 Running a Live Battlemap Session
When running an active combat encounter directly on the battlemap:

1. **Launch Combat from Map**:
   - Click the **Start Encounter from Map** button on the VTT toolbar.
   - Dungeon Daddy will automatically detect all player and monster tokens currently on the map, roll or prompt for initiative, and initialize the **VTT Combat HUD**.
2. **Interactive Turn Flow**:
   - The active combatant is highlighted with an animated golden ring on the map.
   - The **VTT Combat HUD** displays current initiative order, round number, active turn, and one-click *Next Turn / Previous Turn* buttons.
3. **Movement & Path Ruler**:
   - Drag any token to move it. A path ruler displays total distance traveled in feet using your configured measurement rules (5-10-5, Euclidean, or Manhattan).
4. **Quick Damage & Healing**:
   - Click on any token's health bar or right-click to apply damage, healing, or temporary HP.
5. **Live DM Ping**:
   - Hold `Alt` and click anywhere on the canvas to emit an animated ping visible on both DM and player screens.

---

### 1.8 Using Spell Templates & Animated Spell Effects
Dungeon Daddy includes an integrated spell area-of-effect (AoE) visualizer and particle animation engine:

```
[Spell AoE Selector]
- Circle / Sphere (e.g., 20ft Fireball)
- Cone (e.g., 60ft Cone of Cold, 15ft Burning Hands)
- Line (e.g., 100ft Lightning Bolt)
- Square / Cube (e.g., 15ft Thunderwave)
- Cylinder / Aura (e.g., 15ft Spirit Guardians)
```

1. Select the **Spell AoE Tool** from the toolbar.
2. Choose your shape: **Circle/Sphere, Cone, Line, Cube/Square, or Aura**.
3. Set the **Radius / Length in feet** (e.g., `20 ft` for Fireball).
4. Hover your mouse over the canvas to preview the template footprint and see exactly which grid squares and tokens are caught inside the blast zone.
5. Click to cast: Trigger full animated visual effects (fireballs exploding, lightning bolts arcing, radiant healing bursts) that render across both the DM map and the Player Display.

---

### 1.9 Projecting to an External Player Display / TV Table
If you use a secondary monitor, digital TV game table, or projector:

1. Click the **Display** icon in the top header or go to **Settings -> External Display**.
2. Click **Launch Player Window**.
3. A clean, distraction-free window opens. Drag it to your secondary screen and press `F11` for full screen.
4. **What Players See**:
   - The battlemap rendered in real-time.
   - Real-time token movement and dynamic Fog of War (DM-only tokens and secret pins remain hidden).
   - Spell AoE animations and DM live pings.
   - Active combat tracker banner (monster exact HP can be masked to show descriptive health bars like *Healthy, Bloodied, Critical*).
   - Any handout images, letters, or NPC portraits projected via the **Project Media** button.

---

## 2. Running Combat Encounters

The Combat module unites the Encounter Builder, Initiative Tracker, 5e 2024 Concentration Engine, and Monster Statblocks into a streamlined combat cockpit.

---

### 2.1 Building Encounters with CR Scaling
1. Navigate to **Encounters** in the sidebar.
2. Click **Create Encounter** and name it (e.g., *"Ambush at Wyvern Tor"*).
3. The **Encounter Builder** calculates difficulty thresholds (*Easy, Medium, Hard, Deadly, and Daily XP Budget*) based on your active party's character count and levels.
4. Use the monster compendium sidebar to search and filter monsters by **Challenge Rating (CR)**, **Creature Type** (*Undead, Beast, Fiend, etc.*), **Size**, and **Environment**.
5. Click `+ Add to Encounter` on any monster.
6. The difficulty gauge updates dynamically:
   - Adjust monster counts using `+` and `-`.
   - The engine automatically calculates Adjusted XP based on encounter group multipliers.
7. Click **Save Encounter**.

---

### 2.2 Launching Combat from the Encounter Builder or Battlemap
- **From Encounter Builder**: Click **Start Combat** on any saved encounter. The combatants are loaded into the Combat Tracker.
- **From Battlemap**: Click **Start Encounter from Map Tokens**.
- **From Scratch**: Navigate to **Combat** and click `+ Add Combatant` to manually add players, monsters, or NPCs.

---

### 2.3 Running Turns, Rounds, and Initiative
1. **Roll Initiative**: Click **Roll All Monster Initiative** to instantly roll initiative with dexterity modifiers, or enter manual rolls for players.
2. Click **Start Combat**. The tracker sorts all combatants in descending initiative order.
3. Use the **Next Turn** (`Space` / `→`) and **Previous Turn** (`←`) buttons to cycle through combatants.
4. When reaching the top of the order, the **Round Counter** increments automatically.
5. All round-based effects, condition timers, and recharge abilities trigger prompt notifications.

---

### 2.4 Managing HP, Temporary HP, and Damage Calculation
On any combatant's card:
- Click the **HP Value** to open the **Quick Damage / Heal Calculator**.
- Enter an amount:
  - Click **Damage**: Deducts from Temporary HP first, then subtracts remainder from current HP.
  - Click **Heal**: Adds to current HP (capped at Max HP).
  - Click **Add Temp HP**: Sets temporary hit points (does not stack, replaces if higher).
- **Death Saves**: When a player drops to 0 HP, death save failure/success checkboxes appear automatically.

---

### 2.5 Automated Concentration Checks
When any spellcaster marked as concentrating takes damage:
1. Dungeon Daddy automatically calculates the required **Concentration Save DC**:
   `DC = Math.max(10, Math.floor(damage / 2))`
2. A **Concentration Check Prompt** immediately pops up displaying the DC, spell name, and a **Roll Constitution Save** button.
3. If the save succeeds, concentration is maintained. If it fails, the concentration status and associated spell effects are automatically cleared.

---

### 2.6 Condition Tracking & Duration Countdowns
1. Click `+ Condition` on any combatant card.
2. Select any 5e condition (*e.g., Restrained, Poisoned, Stunned, Blessed*).
3. Optional: Set a **Duration in Rounds** (e.g., `1 Round` for Stunning Strike or `10 Rounds` for 1 minute).
4. The tracker will decrement the counter at the start/end of the combatant's turn and automatically remove expired conditions with an alert notification.

---

### 2.7 Handling Legendary Actions, Lair Actions, and Reactions
- **Legendary Actions**: Legendary monsters display interactive action points (e.g., `3/3`). Click to spend actions between player turns; points automatically reset at the start of the monster's turn.
- **Lair Actions**: When enabled, the tracker automatically injects a **Lair Action marker at Initiative Count 20** (losing all initiative ties).
- **Reaction Tracker**: Toggle the *Reaction Used* checkbox when an opportunity attack or Shield spell is cast; resets automatically at the start of their next turn.

---

## 3. Managing Your Campaign & Sessions

---

### 3.1 Creating & Switching Campaigns
1. Open **Campaign** in the sidebar.
2. Click **New Campaign**, enter a name (e.g., *"Curse of Strahd"*), description, and initial party members.
3. Switch active campaigns at any time via the dropdown in the sidebar header. All notes, maps, encounters, and party data isolate cleanly per campaign.

---

### 3.2 Tracking Calendar Dates, Quests, and Faction Reputations
Within the Campaign Overview:
- **In-Game Calendar**: Track current year, month, day, and time of day (Dawn, Noon, Dusk, Midnight). Advance days with 1-click rest buttons.
- **Quest Tracker**: Organize quests by status (*Active, Completed, Failed*) with objective checklists and reward notes.
- **Faction Reputation**: Track major world factions (e.g., *Harpers, Zhentarim, Lords' Alliance*) with reputation meters (-100 to +100) and relationship notes.

---

### 3.3 Organizing Session Notes with Nested Folders
1. Navigate to **Notes** in the sidebar.
2. Click `+ New Folder` to create categories (e.g., *Sessions, NPCs, Locations, Lore, Factions*).
3. Drag and drop notes between folders to maintain a structured campaign hierarchy.
4. Pin crucial notes to the top of your tree for instant access during live play.

---

### 3.4 Using Slash Commands & Embedding Statblocks in Notes
The rich note editor supports markdown and interactive `/` slash commands. While typing in any note:

```
Type "/" to insert:
- /monster    -> Embed interactive Monster Statblock
- /spell      -> Embed searchable Spell Card
- /item       -> Embed Item Card with rarity & attunement
- /table      -> Embed Live Roll Table with one-click roll button
- /check      -> Embed Live Interactive Party DC Check Card
- /image      -> Embed image gallery or player handout
- /spoiler    -> Create DM Secret block (collapsible)
- /callout    -> Create styled Warning / Tip / Lore callout
```

- **Entity Auto-Linking**: Type `@` or `[[` followed by any monster, spell, item, or note name (e.g., `[[Goblin Boss]]` or `[[Fireball]]`) to create an instant clickable link that opens a hover preview tooltip.

---

### 3.5 Embedding Live Interactive DC Check Cards
When planning traps, puzzles, or environmental hazards:
1. Type `/check` or click **Insert DC Check** in the note toolbar.
2. Configure the card:
   - **Check Name**: e.g., *"Spotting the Tripwire"*.
   - **Skill / Saving Throw**: e.g., *Wisdom (Perception)* or *Dexterity Save*.
   - **Difficulty Class (DC)**: e.g., `DC 15`.
   - **Success / Failure Outcomes**: Outline narrative consequences.
3. During the session, the embedded card displays every active party member with their specific skill modifier and a 1-click **Roll for Player** button that instantly compares against the DC.

---

### 3.6 Quick Navigation with the Radial Menu
Press `Ctrl + Space` anywhere in Dungeon Daddy to trigger the **Radial Quick-Action HUD**:
- Move your cursor in any direction to instantly jump to **Maps, Combat, Compendium, Notes, Party, Dice Tray, or Handbook**.
- Quick Search: Type immediately to search the compendium without lifting your hands from the keyboard.

---

### 3.7 Pinning Frequently Used Content with Bookmarks
Press `Ctrl + B` to open the **Bookmarks Drawer**:
- Click the **Bookmark Icon** on any Monster, Spell, Item, Rule Chapter, Note, or Map to pin it.
- Organize bookmarks by custom tags (e.g., *"Session 12 Boss"*, *"Tavern Rules"*, *"Loot"*).
- Instant 1-click access to all pinned entities during active gameplay.

---

## 4. Managing the Party & Character Sheets

---

### 4.1 Managing the Party Roster & Passive Dashboard
Navigate to **Party** to view the active party dashboard:
- **Passive Stat Hub**: View all players' **Passive Perception, Passive Insight, Passive Investigation, and Passive Stealth** in a single glance.
- **Vitality Meters**: Monitor current HP, Max HP, Temp HP, Armor Class (AC), Spell Save DC, and Inspiration tokens.
- **Add Character**: Click `+ New Character` to build a character via the wizard or manually import a character JSON.

---

### 4.2 Running Short and Long Rests
- **Short Rest**:
  - Click **Short Rest** on the party dashboard or an individual character sheet.
  - Spends available Hit Dice to recover HP.
  - Recharges short-rest features (e.g., Warlock Pact Slots, Fighter Action Surge, Monk Focus Points).
- **Long Rest**:
  - Click **Long Rest**.
  - Restores full HP to all characters.
  - Recovers spent Hit Dice (up to half of total level).
  - Resets all spell slots, daily features, and reduces Exhaustion level by 1.

---

### 4.3 Tracking Party Currency and Group Loot
1. Open the **Party Inventory & Currency** tab.
2. **Currency Pool**: Manage shared Copper (CP), Silver (SP), Electrum (EP), Gold (GP), and Platinum (PP).
3. **Split Currency**: Click **Split Evenly** to divide total loot across all active party members automatically.
4. **Group Bag of Holding**: Store unassigned party loot, quest items, and identify item values and total carrying weight.

---

### 4.4 Editing Character Sheets (2024 / 2014 Rules)
Click on any party member to open their complete character sheet:
- **Core Attributes**: Ability scores with automatic modifier calculations, saving throw proficiencies, skill proficiencies, and expertise.
- **Combat Tab**: AC, Initiative bonus, Walking/Flying/Swimming speeds, Hit Points, Hit Dice tracker, and Death Saves.
- **Spellcasting Hub**: Spell slots tracker (Level 1–9), Cantrips, Prepared Spells, Spell Attack Bonus, and Spell Save DC. Click any spell to view full rules or roll directly.
- **Inventory & Attunement**: Track equipped weapons, armor, magical items, weight/encumbrance, and 3 attunement slots.
- **Features & Traits**: Species traits, class features, subclass abilities, and custom feats.

---

### 4.5 Printing & Exporting Character Sheets
1. Open the character sheet and click the **Print / Export** icon in the header.
2. Select your print format:
   - **Official 5e Printable Sheet** (clean 2-page or 3-page layout).
   - **Compact DM Summary Card** (pocket statblock for DM screens).
3. Click **Print / Save as PDF**.

---

## 5. Creating Characters with the 2024 Character Builder

The integrated Character Creator guides players and DMs through the complete 6-step D&D 2024 ruleset:

```
[Step 1: Origin]   -->  [Step 2: Class]    -->  [Step 3: Ability Scores]
(Species & Background)  (Class & Subclass)      (Standard Array / Point Buy / Roll)
       |                        |                              |
       v                        v                              v
[Step 4: Features]  --> [Step 5: Equipment] --> [Step 6: Review & Save]
(Spells & Feats)        (Weapons, Packs, Gold)  (Final Validation & Add to Party)
```

---

### 5.1 Step 1: Origin (Species & Background)
- Select your **Species** (e.g., *Human, Elf, Dwarf, Dragonborn, Tiefling, Halfling, Gnome, Orc, Goliath, Aasimar*).
- Select your **2024 Background** (e.g., *Acolyte, Criminal, Guard, Guide, Noble, Sage, Sailor, Soldier, Wayfarer*).
- Backgrounds automatically assign:
  - Three Ability Score bonuses (+2/+1 or +1/+1/+1).
  - Origin Feat (e.g., *Alert, Magic Initiate, Tough, Lucky, Crafter*).
  - Skill and tool proficiencies.

---

### 5.2 Step 2: Class & Subclass Selection
- Choose any core 2024 class (*Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard*).
- Select starting level (1 to 20).
- Select your **Subclass** (available at level 3, or customized for homebrew).
- Select primary armor and weapon proficiencies.

---

### 5.3 Step 3: Ability Score Generation (Standard Array, Point Buy, Rolling)
Choose your preferred generation method:
- **Standard Array**: Assign `15, 14, 13, 12, 10, 8` across Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma.
- **Point Buy**: Spend 27 points with interactive up/down controls and real-time cost calculation.
- **Roll Scores**: Interactive 3D rolling for `4d6 drop lowest` with one-click rerolls.

---

### 5.4 Step 4: Class Features & Spells
- Configure starting class choices (e.g., Fighter Fighting Style, Rogue Expertise).
- Choose starting **Cantrips** and **Prepared Spells** from the integrated 2024 spellbook with level and school filters.

---

### 5.5 Step 5: Equipment & Narrative Details
- Choose starting equipment packages or take starting gold to purchase equipment.
- Fill in character name, alignment, gender, physical description, personality traits, ideals, bonds, and flaws.

---

### 5.6 Step 6: Review, Validation, and Export to Party
- Review the interactive summary sheet. The validation engine flags missing choices or invalid score allocations.
- Click **Save & Add to Party** to instantly generate the character sheet and party token.

---

## 6. Generating Content On-the-Fly

---

### 6.1 Generating Individual & Hoard Loot by CR
1. Open **Tools -> Loot Generator**.
2. Select your loot type:
   - **Individual Treasure**: Fast pocket loot for single monsters based on CR (0-4, 5-10, 11-16, 17+).
   - **Hoard Treasure**: Dungeon hoard containing coins, valuable gemstones, art objects, and rolling on Magic Item Tables A through I.
3. Click **Generate Loot**.
4. Results can be edited, copied as markdown, or sent directly to the **Party Currency / Inventory Pool** with 1 click.

---

### 6.2 Generating Merchant Shop Inventories
1. In the Loot Generator, switch to the **Shop Generator** tab.
2. Choose a shop type (*Blacksmith, Magic Emporium, General Store, Alchemist/Apothecary, Fletcher, Temple*).
3. Set the settlement size (*Village, Town, City, Metropolis*) and price markup/discount.
4. Click **Generate Shop**. Items are automatically populated with stock quantities, descriptions, and adjusted gold prices.

---

### 6.3 Generating Dynamic NPCs with Roleplay Hooks
1. Open **Tools -> NPC Generator**.
2. Select race, gender, and archetype (or leave as *Random*).
3. Click **Generate NPC** to instantly create:
   - Name and Pronunciation.
   - Physical appearance, clothing, and notable quirks.
   - Personality traits, ideals, bonds, and hidden flaws/secrets.
   - Dialogue hooks and motivation.
   - Mini combat statblock (AC, HP, basic attacks).
4. Click **Save as Compendium NPC** or **Insert into Current Note**.

---

## 7. Expanding the Compendium & Homebrew Content

---

### 7.1 Searching and Filtering Monsters, Spells, Items, and Roll Tables
Navigate to **Compendium** in the sidebar:
- **Monsters**: Filter by CR (0 to 30), Creature Type, Size, and Search keyword. Click any monster to open the interactive statblock with rollable actions and spell links.
- **Spells**: Filter by Class, Level (Cantrip to 9th), School of Magic, Concentration, and Ritual tags.
- **Items**: Filter by Item Category (*Weapon, Armor, Wondrous, Potion, Ring, Scroll, Wand*), Rarity (*Common to Artifact*), and Attunement requirement.
- **Roll Tables**: Browse tables for random encounters, wild magic surges, trinkets, tavern menus, and dungeon weather.

---

### 7.2 Creating Custom Homebrew Monsters, Spells, and Items
1. In the Compendium, click `+ New Monster`, `+ New Spell`, or `+ New Item`.
2. The **Entity Editor Modal** provides full schema validation:
   - **Monsters**: Configure AC, HP formulas, speeds, ability scores, damage resistances/immunities, condition immunities, senses, languages, CR, traits, actions, bonus actions, reactions, and legendary actions.
   - **Spells**: Set level, school, casting time, range, components (V, S, M with gold cost), duration, concentration/ritual tags, and scaling damage formulas.
   - **Items**: Set rarity, item type, weight, gold cost, attunement, stat modifiers, and magic properties.
3. Click **Save Homebrew**. Your custom creations appear seamlessly alongside official SRD content with custom homebrew badges.

---

### 7.3 Building Custom Multi-Tier Roll Tables
1. In Compendium, open the **Roll Tables** tab and click `+ New Table`.
2. Enter Table Title, Description, and Dice Formula (e.g., `1d20` or `1d100`).
3. Add rows with range values (*Min-Max*), result text, and optional **Nested Sub-Table Links** (e.g., rolling a 20 rolls on a legendary sub-table).
4. Click **Test Roll** to verify table probabilities, then click **Save Table**.

---

### 7.4 Adding Custom Sourcebooks & Chapters in the Handbook
1. Navigate to **Handbook** in the sidebar.
2. Click `+ Add Custom Book` to create your own campaign setting guide, homebrew expansion, or house rules compendium.
3. Click `+ Add Chapter` to write markdown chapters with rich tables, callouts, and illustrations.

---

# PART 2: Feature-by-Feature Reference

---

## 1. Titlebar & Application Header
The top application bar provides system controls, active session status, and instant tool triggers:

- **Active Campaign Indicator**: Displays current active campaign name with quick-switch dropdown.
- **Global Search (`Ctrl + F`)**: Universal search indexing monsters, spells, items, rules, and notes.
- **Projector / External Display Button**: Launches or manages the secondary player window.
- **Quick Dice Tray Button (`Ctrl + D`)**: Opens the 3D dice drawer overlay.
- **Bookmarks Drawer Button (`Ctrl + B`)**: Opens the session bookmark drawer.
- **Database Status Indicator**: Displays live save state and snapshot point count. Click to open the **Database Rollback Modal**.
- **Window Controls**: Frameless Minimize, Maximize/Restore, and Close buttons.

---

## 2. Primary Navigation Sidebar
The left sidebar switches between the core modules of Dungeon Daddy:

- **Compendium**: Browse, search, and edit Monsters, NPCs, Spells, Items, and Roll Tables.
- **Party**: Character sheets, party passive stats, rest manager, and currency ledger.
- **Notes**: Hierarchical markdown worldbuilding and session notes editor.
- **Encounters**: CR-based encounter builder and difficulty calculator.
- **Combat Tracker**: Initiative order, HP tracking, condition timers, and concentration engine.
- **Battlemaps (VTT)**: Virtual tabletop canvas with dynamic fog of war, tokens, and spell templates.
- **Tools**: Character Creator (2024), Loot Generator, Shop Generator, and NPC Generator.
- **Handbook**: Official 2024 Player's Handbook, DMG rules reference, and custom homebrew books.
- **Templates**: Custom statblock and sheet styling template engine.
- **Settings**: Audio, visual themes, measurement rules, hotkeys, and data backups.
- **Collapse / Expand Toggle**: Minimizes sidebar to slim icon rail.

---

## 3. Battlemap (VTT) Module

### Canvas Controls
- **Pan**: Hold `Space` and drag, or use Middle Mouse Click and drag.
- **Zoom**: Scroll Mouse Wheel, or use the on-screen `+` / `-` zoom controls.
- **Grid Calibration HUD**: Interactive 3-point calibration box to match image artwork grids.

### Toolbar Tools
1. **Select / Move Tool**: Select and drag tokens, measure movement distances.
2. **Fog of War Brush**:
   - *Reveal Mode*: Erases fog to expose map.
   - *Hide Mode*: Restores black fog.
   - *Brush Size Slider*: Scales brush radius from 1 to 10 grid units.
   - *Reset Fog*: Re-covers map in complete fog.
3. **Wall & Door Tool (Dynamic Line-of-Sight)**:
   - Click to place vision-blocking wall segments.
   - Click wall segments to convert into clickable doors (Open / Closed).
4. **Pin Tool**: Place points of interest linked to notes, monsters, items, or secret DM text.
5. **Measurement Ruler Tool**: Measure point-to-point and waypoint distances in feet.
6. **Spell AoE Visualizer**: Render interactive circles, cones, lines, cubes, and aura templates.
7. **Live Ping (`Alt + Click`)**: Pulse animated visual beacon on DM and player screens.
8. **Drawing Tool**: Freehand lines, rectangles, and circles with custom color picker.

### Token Features
- Token scaling: Tiny (0.5×0.5), Medium (1×1), Large (2×2), Huge (3×3), Gargantuan (4×4+).
- Health bars, temporary HP rings, condition badges, elevation tags, rotation wheels.
- Token visibility toggle (DM secret vs Player visible).

---

## 4. Combat Tracker Module

- **Initiative Order Display**: Descending sort with drag-and-drop reordering.
- **Round & Turn Counter**: Automatic round progression with notification triggers.
- **Quick Damage / Heal Modal**: One-click arithmetic for HP, Temp HP, and Maximum HP changes.
- **Automated Concentration Engine**: Calculates DC on damage taken (`max(10, floor(damage/2))`) with one-click saving throws and auto-clearing.
- **Condition Tracker**: 5e status effects with round duration timers and automatic expiration.
- **Death Save Tracker**: 3 success and 3 failure checkboxes for downed players.
- **Legendary & Lair Actions**: Point counters and initiative 20 lair triggers.
- **Reaction Tracker**: Per-round reaction toggles with start-of-turn reset.
- **Combat Log**: Chronological audit trail of all attacks, rolls, damage, and conditions.

---

## 5. Encounter Builder Module

- **XP & Difficulty Budget**: Live calculation of Easy, Medium, Hard, and Deadly thresholds based on active party composition.
- **Daily XP Budget Meter**: Tracks total adventuring day resource drain.
- **Monster Browser Sidebar**: Filterable bestiary with instant add buttons.
- **Group Multiplier Engine**: Applies official 5e encounter size multipliers to calculate Adjusted XP.
- **Save / Load Templates**: Store reusable encounter templates (e.g., *"4× Goblin + 1× Goblin Boss"*).
- **One-Click Launch**: Transfers encounter directly to the Combat Tracker or Battlemap.

---

## 6. Compendium Module

- **Bestiary Tab**: Complete SRD & 2024 monster database with clickable attack rolls and spell slots.
- **Spellbook Tab**: Complete spell list filterable by Class, Level (Cantrip–9th), School, Concentration, and Ritual.
- **Armory & Magic Items Tab**: Weapons, armor, wondrous items, potions, scrolls, and artifacts with rarity filters.
- **Roll Tables Tab**: Interactive dice tables with nested sub-table capabilities.
- **Entity Editor**: Full modal editor to build and export custom homebrew entities.

---

## 7. Party Management Module

- **Passive Stat Dashboard**: Centralized Passive Perception, Insight, Investigation, and Stealth monitors.
- **Rest Engine**: Automated Short Rest (hit dice expenditure, feature recharge) and Long Rest (full recovery, hit dice recovery, exhaustion reduction).
- **Party Ledger & Bag of Holding**: Shared currency pool (CP/SP/EP/GP/PP), automatic split calculator, and group loot inventory.
- **Character Sheet View**: Complete 2024 / 2014 character sheets with spell slots, feature lists, inventory, and printable export.

---

## 8. Notes & Worldbuilding Module

- **Hierarchical Folder Tree**: Drag-and-drop organization for campaign notes, session logs, NPCs, and locations.
- **Slash Commands (`/`)**: Quick insert menu for statblocks, spell cards, item cards, roll tables, DC check cards, and media.
- **Entity Auto-Linking (`@` / `[[`)**: Mention any compendium entity or note for instant hover preview cards.
- **Interactive DC Check Cards**: Live skill check widgets with one-click party rolling.
- **Player Projection**: 1-click button to project letters, clues, maps, and illustrations to the player display.

---

## 9. Tools & Generators Module

- **2024 Character Builder**: 6-step guided wizard for Origin, Class, Ability Scores, Features, Equipment, and Review.
- **Loot Generator**: CR-based individual treasure, hoard treasure, and magic item tables.
- **Shop Generator**: Dynamic merchant inventory generator with settlement scaling and price multipliers.
- **NPC Generator**: On-the-fly NPC creation with race, appearance, personality, quirks, ideals, bonds, flaws, and mini statblocks.

---

## 10. Handbook Module

- **Official Rulebooks**: Searchable Player's Handbook (2024) and DMG rules with chapter tree navigation.
- **Keyword Highlighting & Search**: Fast text filtering with instant jump-to-section.
- **Custom Homebrew Books**: Build custom sourcebooks and chapters for house rules and campaign settings.

---

## 11. Template Manager Module

- **Statblock Customizer**: Modify visual styling, fonts, and layouts for monster statblocks and cards.
- **Character Sheet Themes**: Choose between Classic Parchment, Modern Dark, and Minimalist Print styles.
- **Template Reset**: Restore default templates with a single click.

---

## 12. Global Drawers & Overlays

### 12.1 Dice Tray Drawer (`Ctrl + D`)
- **Polyhedral Dice**: 3D physics-based rolling for d4, d6, d8, d10, d12, d20, and d100.
- **Formula Builder**: Custom expression evaluation (e.g., `4d6kh3 + 3`, `8d6 + 5`).
- **Advantage / Disadvantage Toggles**: One-click modifier toggles.
- **Roll History**: Persistent session log of all player and DM rolls.
- **Secret DM Rolls**: Roll dice hidden from the player view.

### 12.2 Session Bookmarks Drawer (`Ctrl + B`)
- Instant access to pinned Monsters, Spells, Items, Notes, Rules, and Map Pins.
- Custom tag filtering and one-click quick-open.

### 12.3 Quick Action Radial HUD (`Ctrl + Space`)
- Radial mouse navigation for lightning-fast module switching.
- Integrated quick search bar for compendium lookup during active combat.

---

## 13. External Display & Player View System

- **Secondary Monitor Output**: Clean, full-screen player window for TV tables and projectors.
- **Synchronized Fog of War**: Reveals only areas explored by player tokens in real time.
- **Masked Combat Tracker**: Shows initiative turn order and visual health bars (*Healthy, Injured, Bloodied, Critical*) while hiding DM notes and exact monster HP.
- **Media Projector**: Cast illustrations, puzzle handouts, NPC portraits, and letters with smooth fade-in animations.
- **Spell AoE & Ping Sync**: Displays DM pings and spell animations in real time.

---

## 14. Database Snapshots, Rollback & Backup System

- **Automatic Snapshots**: System automatically creates recovery snapshots before major imports or bulk edits.
- **Manual Snapshots**: Create named restore points before crucial campaign sessions.
- **Point-in-Time Rollback Modal**: Inspect snapshot timestamps, entity counts, and restore previous states with 1 click.
- **Full JSON Export / Import**: Backup entire campaign database or transfer to other devices.

---

## 15. Settings & Customization

- **Theme & Appearance**: Dark fantasy, midnight slate, and high-contrast color palettes.
- **Measurement Rules**: Configure grid measurement between D&D 5e Standard (5-10-5), Euclidean, or Chebyshev (Manhattan).
- **Sound Effects**: Toggle audio triggers for dice rolls, turn transitions, and spell animations.
- **Storage & Cloud Sync**: Monitor local IndexedDB/Electron file storage usage and configure backups.
- **Keyboard Shortcuts**: View and customize global hotkey bindings.

---
*Dungeon Daddy is built for Dungeon Masters who value speed, precision, and immersive storytelling. Roll high!*
