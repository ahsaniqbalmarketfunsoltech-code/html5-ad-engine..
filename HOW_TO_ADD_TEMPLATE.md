# 🚀 How to Add a New Template (Super Easy!)

## The Simple 3-Step Process

### Step 1: Create Your Template File

1. **Copy** an existing template as a starting point:
   - Right-click on `template1.html` (or any template)
   - Select "Copy"
   
2. **Rename** following the pattern:
   - `template6.html`
   - `template7.html`
   - `template8.html`
   - etc.

3. **Edit** the content as needed
   - Follow the structure in `TEMPLATE_SOP.md`
   - Use `data-field` attributes for all inputs and preview elements

### Step 2: Save to Templates Folder

Save your file to: **`/templates/template[NUMBER].html`**

Examples:
- `/templates/template6.html`
- `/templates/template7.html`

### Step 3: Refresh Browser

Just refresh your browser:
- Press **F5**
- Or **Ctrl+R** (Windows/Linux)
- Or **Cmd+R** (Mac)

## ✅ That's It!

The system will **automatically**:
- ✅ Discover your new template
- ✅ Add it to the dropdown menu
- ✅ Scan and validate the structure
- ✅ Update the manifest file

**No configuration needed!** 🎉

---

## 🔍 Verify It Worked

1. Open browser console (Press **F12**)
2. Look for these messages:
   ```
   🔍 Auto-discovering templates in /templates/ folder...
     ✓ Found: template1
     ✓ Found: template2
     ✓ Found: template6  ← Your new template!
   ✅ Discovered 3 template(s): template1, template2, template6
   🎉 Template system ready!
   ```

3. Check the template dropdown
   - Should show "Template 6" (or your number)

---

## 🐛 Troubleshooting

### Template not appearing?

**Check the filename:**
- ✅ Correct: `template6.html`
- ❌ Wrong: `Template6.html` (capital T)
- ❌ Wrong: `template-6.html` (dash instead of number)
- ❌ Wrong: `mytemplate.html` (must follow pattern)

**Check the location:**
- ✅ Correct: `/templates/template6.html`
- ❌ Wrong: `/template6.html` (not in templates folder)
- ❌ Wrong: `/templates/subfolder/template6.html` (no subfolders)

**Check the console (F12):**
- Look for error messages
- Should see `✓ Found: template6`
- If you see `⚠️ No templates found`, check folder location

**Try a hard refresh:**
- **Windows/Linux**: Ctrl+Shift+R
- **Mac**: Cmd+Shift+R
- This clears the browser cache

### Console shows errors?

**Validation errors:**
- Check that your template follows `TEMPLATE_SOP.md` structure
- Ensure all inputs have `data-field` attributes
- Ensure preview elements have matching `data-field` attributes

**File not found:**
- Double-check the filename and location
- Make sure the file has `.html` extension

---

## 📋 Template Naming Rules

**Pattern:** `template[NUMBER].html`

**Valid names:**
- ✅ `template1.html`
- ✅ `template5.html`
- ✅ `template10.html`
- ✅ `template99.html`

**Invalid names:**
- ❌ `Template1.html` (capital T)
- ❌ `template_1.html` (underscore)
- ❌ `template-1.html` (dash)
- ❌ `mytemplate.html` (doesn't follow pattern)
- ❌ `template1.htm` (wrong extension)

---

## 🎯 What You DON'T Need to Do

**No manual configuration required:**

- ❌ Don't edit `engine.js`
- ❌ Don't update any template lists
- ❌ Don't modify `index.html`
- ❌ Don't rebuild or compile anything
- ❌ Don't restart any servers

**Just drop the file and refresh!** 🚀

---

## 📚 Next Steps

After adding your template:

1. **Test it**: Select it from the dropdown and verify it works
2. **Customize it**: Edit the content, colors, and layout
3. **Export it**: Try exporting to different languages
4. **Share it**: Your template is ready to use!

---

## 💡 Pro Tips

**Start from an existing template:**
- Copy `template1.html` for a simple layout
- Copy `template4.html` for a product card
- Copy `template5.html` for a video player

**Use descriptive field names:**
- `productName` instead of `text1`
- `headerBg` instead of `color1`
- `logoImage` instead of `img1`

**Follow the pattern system:**
- See `DATA_FIELD_PATTERNS.md` for automatic features
- Use `[name]Size` for font sizes
- Use `[name]Bg` for background colors
- Use `[name]Color` for text colors

---

## 🎉 You're Done!

Adding templates is now as simple as:
1. Copy a template file
2. Rename it with the next number
3. Refresh the browser

**The system handles everything else automatically!**

For detailed template structure guidelines, see `TEMPLATE_SOP.md`.
