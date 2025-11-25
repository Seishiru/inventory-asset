# Index Column Resize - User Guide

## Quick Start

### 1. Unlock the Column
- Look for the **lock icon** (🔒) next to "Index" in the table header
- Click the lock icon
- The icon changes to an **open lock** (🔓) in green
- A green vertical line appears on the right edge of the Index column

### 2. Resize the Column
- Move your mouse near the right edge of the Index column header
- The cursor will change to a resize cursor (↔)
- Click and hold, then drag left or right
- The column width changes in real-time
- A tooltip shows the current width in pixels

### 3. Save or Revert
- Release the mouse button
- A popup appears at the bottom-right corner
- Click **"Save"** to keep the new width
- Click **"Revert"** to go back to the previous width
- The column automatically locks after your choice

## Visual Guide

### Lock States

**Locked (Default)**
```
┌──────────────┐
│ Index 🔒     │  ← Gray lock icon
└──────────────┘
```

**Unlocked**
```
┌──────────────┐
│ Index 🔓   │ │  ← Green lock icon + green resize line
└──────────────┘
```

### Resize Handle

The resize handle has two parts:
1. **Visible indicator**: Thin green line (1px)
2. **Invisible hitbox**: Wide clickable area (6px)

**Why?** The thin line looks clean, but the wide hitbox makes it easy to grab!

### During Resize

```
┌──────────────────┐
│     72px         │  ← Width tooltip
├──────────────────┤
│ Index 🔓       ║ │  ← Glowing dark green line
└──────────────────┘
     ↕ Drag here
```

### Save/Revert Popup

```
┌────────────────────────────────┐
│ Column Width Changed           │
│ Do you want to save the new    │
│ width (92px)?                  │
│                                │
│         [Revert]    [Save]     │
└────────────────────────────────┘
```

## Features

### Width Constraints
- **Minimum:** 40px (prevents unreadable column)
- **Maximum:** 200px (prevents excessive space)
- **Default:** 64px

### Visual Feedback

| State | Indicator | Color |
|-------|-----------|-------|
| Locked | Lock icon | Gray |
| Unlocked | Open lock | Green |
| Idle resize handle | Thin line | Light green (#4ade80) |
| Active resizing | Glowing line | Dark green (#16a34a) |
| Width tooltip | Dark box | Black background, white text |

### Smart Auto-Lock

If you resize the column back to its original width, the popup won't appear. The column will automatically lock, keeping your workflow smooth!

## Keyboard & Mouse

### Mouse Actions
- **Click lock icon:** Toggle lock/unlock
- **Hover near right edge:** Cursor changes to resize (↔)
- **Click & drag:** Resize column width
- **Release mouse:** Show save/revert popup

### Cursor Changes
- **Normal:** Arrow pointer
- **Over lock icon:** Pointer with tooltip
- **Over resize handle:** Column resize (↔)
- **During resize:** Column resize everywhere (prevents accidental selection)

## Tips & Tricks

### Easy Grabbing
The resize handle has a wide invisible area (6px), so you don't need to be precise. Just move your cursor near the right edge and it will work!

### Quick Revert
If you don't like the new width while dragging, just resize it back to the original size before releasing. The column will auto-lock without showing the popup.

### Width Tooltip
The black tooltip above the column shows the exact width in pixels while you're resizing. Use this to set precise widths!

### One-Click Lock
After resizing, if you change your mind, just click the lock icon again (while unlocked). If the width changed, you'll see the save/revert popup.

## Troubleshooting

### "I can't see the resize handle"
- Make sure you clicked the lock icon first (should turn green)
- Look for a green vertical line on the right edge of the Index column
- Try moving your mouse slowly along the right edge

### "The resize handle won't drag"
- Ensure the lock icon is green (🔓), not gray (🔒)
- Click directly on the green line or just to the right of it
- The hitbox extends 2px to the right of the visible line

### "The popup won't appear"
- This is normal if you resized back to the original width
- The column auto-locks when no change is detected
- Try resizing to a different width

### "My cursor doesn't change"
- Move your cursor closer to the right edge of the Index column
- The resize cursor (↔) appears when you're in the hitbox area
- Make sure the column is unlocked (green lock icon)

## Horizontal Scrolling

### When Does It Appear?
When your table has many columns and they don't fit on the screen, a horizontal scrollbar will appear at the bottom of the table.

### How to Use
- Scroll left/right using the scrollbar
- Use trackpad gestures (two-finger swipe)
- Use Shift + Mouse wheel on mouse/trackpad

### Resizing While Scrolled
The resize functionality works even when you've scrolled horizontally! The resize handle stays aligned with the Index column.

## Technical Details

### Width Range
- **Min:** 40px (1 character + padding)
- **Max:** 200px (plenty of space for large numbers)
- **Increment:** 1px (smooth, precise resizing)

### State Persistence
Currently, the column width **does not persist** across page reloads. Each session starts with the default 64px width.

*Future enhancement: Save to localStorage for persistent preferences*

## Accessibility

### Visual Indicators
- Lock icon clearly shows locked/unlocked state
- Color coding: Gray (locked), Green (unlocked)
- Resize handle is bright green for visibility
- Glowing effect when actively resizing

### Tooltips
- Lock icon: "Unlock to resize" or "Lock column (XXpx)"
- Resize handle: "Drag to resize"
- Width indicator: Shows exact pixels during resize

### Keyboard Support
- Lock button is fully keyboard accessible
- Tab to focus, Enter/Space to toggle
- Standard button behavior

## Common Workflows

### Quick Resize
1. Click lock 🔒 → 🔓
2. Drag resize handle
3. Click "Save" in popup
4. Done! Column is locked at new width

### Try Before Commit
1. Click lock 🔒 → 🔓
2. Drag to test different widths
3. Resize back to original (no popup)
4. Unlock again to try different size
5. When happy, resize and click "Save"

### Revert Mistake
1. Accidentally resized too much
2. See popup appear
3. Click "Revert" button
4. Column returns to previous width
5. Column auto-locks

## Summary

The Index column resize feature provides:
- ✅ Easy lock/unlock with visual feedback
- ✅ Smooth, real-time width adjustment
- ✅ Precise pixel-level control (40-200px)
- ✅ Non-destructive editing (can revert)
- ✅ Smart auto-lock for unchanged widths
- ✅ Clear visual indicators throughout
- ✅ Professional save/revert workflow

**Remember:** The column is always locked by default. Click the lock icon to start resizing!
