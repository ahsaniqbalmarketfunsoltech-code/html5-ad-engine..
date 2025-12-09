# 📋 Template Manifest & Auto-Scan System

## Overview

The system now combines **Auto-Scan (Option 3)** + **Manifest (Option 1)** for the best template synchronization experience!

**How it works:**
1. **Auto-Scan**: System automatically scans all templates on load
2. **Manifest**: Creates/updates `templates/manifest.json` automatically
3. **Validation**: Checks template structure and reports issues
4. **Sync**: Ensures all fields are captured correctly

---

## How It Works

### Automatic Process

1. **On Page Load**:
   - System discovers all templates (template1.html, template2.html, etc.)
   - Automatically scans each template
   - Extracts all `data-field` attributes
   - Creates/updates manifest file

2. **Template Scanning**:
   - Finds all inputs with `data-field`
   - Finds all preview elements with `data-field`
   - Determines field types (text, color, number, file, etc.)
   - Validates structure

3. **Manifest Creation**:
   - Stores template metadata in `templates/manifest.json`
   - Lists all fields used by each template
   - Records validation results

4. **During Export**:
   - Uses manifest to verify all fields are captured
   - Shows warnings if fields are missing
   - Ensures complete data capture

---

## Manifest File Structure

The manifest file (`templates/manifest.json`) looks like this:

```json
{
  "version": "1.0",
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "totalTemplates": 5,
  "templates": {
    "template5": {
      "templateName": "template5",
      "fields": [
        "headerMain", "headerSub", "subtitle", "footer", "watermark",
        "headerBg", "headerColor", "headerMainSize", "headerSubSize",
        "subtitleBg", "subtitleColor", "subtitleSize",
        "footerBg", "footerColor", "footerSize",
        "thumbnail", "rewindSeconds", "forwardSeconds",
        "playButtonSize", "controlButtonSize",
        "watermarkTop", "watermarkRight", "watermarkSize",
        "adWidth", "videoHeight"
      ],
      "fieldTypes": {
        "headerMain": "text",
        "headerBg": "color",
        "headerMainSize": "number",
        "thumbnail": "file"
      },
      "fieldCategories": {
        "text": ["headerMain", "headerSub", "subtitle", "footer", "watermark"],
        "color": ["headerBg", "headerColor", "subtitleBg", "subtitleColor"],
        "number": ["headerMainSize", "headerSubSize", "playButtonSize"],
        "file": ["thumbnail"]
      },
      "validation": {
        "valid": true,
        "errors": [],
        "warnings": [],
        "missingPreview": [],
        "missingInput": []
      },
      "hasPreviewPanel": true,
      "hasInputPanel": true,
      "scannedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## Adding New Templates

### Super Easy Process:

1. **Create Template File**:
   - Create `template6.html` in `/templates/` folder
   - Follow `TEMPLATE_SOP.md` structure
   - Use `data-field` attributes

2. **Refresh Page**:
   - System automatically discovers template6
   - Automatically scans it
   - Automatically updates manifest
   - **That's it!**

3. **Check Console**:
   - Look for: `📊 Scanned template "template6": X fields, ✅ Valid`
   - If errors: `❌ Validation errors: [...]`
   - Fix any errors shown

---

## Validation System

### What Gets Validated:

1. **Structure**:
   - ✅ Has `.preview-panel` element
   - ✅ Has `.input-panel` element (optional)
   - ✅ Has `data-field` attributes

2. **Field Matching**:
   - ✅ Every input has matching preview element
   - ✅ Preview elements have matching inputs (or are containers)

3. **Field Types**:
   - ✅ Text fields → Text elements
   - ✅ Color fields → Color elements
   - ✅ Number fields → Number elements
   - ✅ File fields → Image/background elements

### Validation Results:

**✅ Valid**: Template is ready to use
**⚠️ Warnings**: Minor issues (might still work)
**❌ Errors**: Must fix before template works properly

---

## Console Messages

### On Page Load:
```
🔍 Scanning all templates...
📊 Scanned template "template5": 31 fields, ✅ Valid
📋 Template manifest updated with 5 template(s)
```

### When Loading Template:
```
📋 Manifest shows 31 expected fields for template5
✅ Template loaded: 31 data-field element(s) found
✅ Bound 31 input field(s) to preview
```

### During Export:
```
📋 Manifest shows 31 expected fields for template5
✅ Captured image for field "thumbnail"
✅ Captured 31 field value(s)
⚠️ Missing values for 0 expected field(s)
```

---

## Benefits

### ✅ **For You**:
- **Zero configuration** - Just add template file
- **Automatic validation** - Knows if template is correct
- **Field tracking** - Knows all fields template uses
- **Error detection** - Shows what's wrong

### ✅ **For System**:
- **Complete field capture** - Ensures all fields are exported
- **Image detection** - Finds images from multiple sources
- **Validation** - Catches errors before export
- **Debugging** - Easy to see what fields template has

---

## Troubleshooting

### Template Not Scanned?
- Check browser console for errors
- Verify template file exists in `/templates/` folder
- Check file name format: `template[NUMBER].html`

### Validation Errors?
- Check console for specific errors
- Fix missing `.preview-panel` element
- Ensure all inputs have matching preview elements

### Fields Not Captured?
- Check manifest to see expected fields
- Verify `data-field` attributes match
- Check console for "Missing values" warnings

### Images Not Included?
- Check console for "Captured image" messages
- Verify image was uploaded (not just file path)
- Check `templateData` storage

---

## Manual Manifest Update

The manifest is **automatically updated**, but you can also:

1. **View Manifest**: Check `templates/manifest.json` file
2. **Delete Manifest**: System will recreate it on next load
3. **Edit Manifest**: Not recommended - let system manage it

---

## Summary

**Old Way**:
1. Add template
2. Hope it works
3. Debug if export fails

**New Way**:
1. Add template
2. System auto-scans
3. System validates
4. System shows errors
5. Fix errors
6. **Guaranteed to work!**

---

**Status**: ✅ **Fully Automatic** - Just add templates and refresh!

