# Asset Inventory - User Guide

## 🚀 Quick Start

### Adding Your First Asset
1. Click the green **"Add Asset"** button in the top right
2. Fill in the required information:
   - Asset Type (e.g., Laptop, Monitor, Desk)
   - Brand/Make
   - Model Number
   - Serial Number
   - Location/Station
   - User Name
3. Optionally upload an image
4. Click **"Add Asset"**

### Editing an Asset
1. **Double-click** anywhere on an asset row
2. Make your changes in the modal
3. Click **"Save Changes"**

---

## 📋 Main Features

### 🔍 Search & Filter
- **Search Bar**: Type to search across all fields (Asset Type, Brand, Model, Serial Number, Location, User)
- **Status Filter**: Filter by Active, Inactive, Maintenance, or Retired
- **Asset Type Filter**: Filter by specific asset types

### ☑️ Selecting Assets
- **Single Selection**: Click anywhere on a row
- **Multiple Selection**: Hold `CTRL` (or `CMD` on Mac) and click multiple rows
- **Visual Indicator**: Checkboxes appear when you hover over rows
- **Clear Selection**: Click the "Clear Selection" button

### 📊 Sorting
- **Click any column header** to sort:
  - First click: Sort ascending (A→Z, 0→9, Old→New)
  - Second click: Sort descending (Z→A, 9→0, New→Old)
  - Third click: Clear sorting
- **Visual indicator**: Arrows show current sort direction

### 📤 Exporting Data

#### Export All Assets
1. Click **"Export"** dropdown
2. Choose your format:
   - **Image**: Exports table as PNG
   - **PDF**: Creates a PDF document
   - **Excel**: Creates an Excel spreadsheet

#### Export Selected Only
1. Select the assets you want to export
2. Click **"Export"** dropdown
3. Choose **"Export Selected Only"**

#### Print View
1. Click **"Export"** → **"Print View"**
2. Use your browser's print dialog (Ctrl+P / Cmd+P)
3. Clean layout optimized for printing

### 📥 Importing Data

#### From Excel
1. Prepare your Excel file with these columns:
   - Asset Type, Brand/Make, Model Number, Serial Number
   - Status, Location/Station, User Name
2. Click **"Import"** → **"Import from Excel"**
3. Select your .xlsx or .xls file
4. Assets are automatically added

#### From CSV
1. Prepare your CSV file with the same columns
2. Click **"Import"** → **"Import from CSV"**
3. Select your .csv file

### 💾 Backup & Restore

#### Creating a Backup
1. Click **"Backup"** dropdown
2. Select **"Create Backup"**
3. A JSON file is downloaded with format: `MMDDYYYYBackUp.json`
4. Save this file safely

#### Restoring from Backup
1. Click **"Backup"** dropdown
2. Select **"Restore Backup"**
3. Choose your backup JSON file
4. All assets and custom columns are restored

⚠️ **Warning**: Restoring replaces all current data!

---

## 🎯 Bulk Actions

When you have assets selected, use **"Bulk Actions"** to:

### Update Status
1. Select multiple assets
2. Click **"Bulk Actions"** → **"Update Status"**
3. Choose new status (Active, Inactive, Maintenance, Retired)
4. Click **"Update Status"**

### Update Location
1. Select multiple assets
2. Click **"Bulk Actions"** → **"Update Location"**
3. Enter new location
4. Click **"Update Location"**

### Delete Multiple Assets
1. Select assets to delete
2. Click **"Bulk Actions"** → **"Delete Selected"**
3. Confirm the deletion
4. Assets are permanently removed

---

## 🔧 Custom Columns

### Adding a Custom Column
1. Scroll to the right of the table
2. Click **"Add Column"** button
3. Enter column name (e.g., "Department", "Cost Center")
4. Click **"Add Column"**

### Deleting a Custom Column
1. Find the custom column header
2. Click the **red trash icon** next to the column name
3. Confirm deletion
4. Column and all its data are removed

---

## 🎨 Understanding Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| Active | Green | Asset is in use |
| Inactive | Gray | Asset is not currently in use |
| Maintenance | Yellow | Asset is being serviced |
| Retired | Red | Asset is decommissioned |

---

## 💡 Advanced Tips

### Duplicate an Asset
1. Open an asset by double-clicking
2. Click **"Duplicate"** button
3. A copy is created with "-COPY" added to serial number
4. Edit the duplicate as needed

### Multi-Select Tips
- Hold `CTRL` (Windows/Linux) or `CMD` (Mac) to select multiple non-consecutive rows
- Click once on each row you want to select
- Selection count appears at the bottom

### Efficient Workflow
1. **Import** bulk assets from Excel
2. **Filter** by status or type to review specific groups
3. **Select** multiple assets for bulk updates
4. **Export** selected assets for reports
5. **Backup** regularly to protect your data

---

## ⚙️ Status Tracking

The system automatically tracks:
- **Created By**: User who added the asset
- **Modified By**: User who last edited the asset
- **Last Updated**: Timestamp of last modification

These fields are **read-only** and update automatically.

---

## 📱 Summary Dashboard

At the top of the page, you'll see:
- **Total Assets**: Total number of assets
- **Active**: Count of active assets
- **Inactive**: Count of inactive assets  
- **Maintenance**: Count of assets in maintenance

Click on any card to quickly filter by that status.

---

## ❓ Common Questions

**Q: Can I edit multiple assets at once?**
A: Yes! Use Bulk Actions to update status or location for multiple selected assets.

**Q: What happens if I delete an asset?**
A: Deletion is permanent. Make sure to backup regularly!

**Q: Can I undo an action?**
A: Currently, there's no undo. Use Restore Backup to revert to a previous state.

**Q: What image formats are supported?**
A: Most common formats (PNG, JPG, GIF, WebP) are supported for asset images.

**Q: Is there a limit to custom columns?**
A: No limit! Add as many custom columns as you need.

**Q: Can I rename a custom column?**
A: Currently, you need to delete and recreate the column. Plan column names carefully!

---

## 🎯 Best Practices

1. **Regular Backups**: Create backups weekly or after major updates
2. **Consistent Naming**: Use consistent formats for serial numbers and locations
3. **Image Optimization**: Use reasonably sized images (< 1MB) for better performance
4. **Status Updates**: Keep asset statuses current
5. **Custom Columns**: Only add columns you'll actually use
6. **Descriptive Names**: Use clear, descriptive names for asset types and locations

---

## 🆘 Troubleshooting

**Assets not appearing after import:**
- Check that your Excel/CSV has the correct column headers
- Ensure the file is in .xlsx, .xls, or .csv format

**Export not working:**
- Ensure pop-ups are not blocked in your browser
- Try a different export format

**Images not displaying:**
- Check that the image URL is accessible
- Try uploading a different image format

**Backup restore failed:**
- Ensure you're using a backup file created by this system
- Check that the JSON file is not corrupted

---

## 🎉 You're Ready!

You now have everything you need to effectively manage your asset inventory. Start by adding your first asset, then explore the various features at your own pace.

**Need help?** All actions show success/error notifications to guide you!
