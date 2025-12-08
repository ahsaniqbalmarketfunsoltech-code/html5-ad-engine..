# Template Creation SOP - Quick Guide

## Essential Structure

```html
<div class="template-wrapper">
  <div class="input-panel">
    <!-- Input controls here -->
  </div>
  <div class="preview-panel">
    <!-- Preview content DIRECTLY here - NO extra wrappers -->
  </div>
</div>
```

## Required CSS (Copy Exactly)

```css
.template-wrapper {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.input-panel {
  flex: 1;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
}

.preview-panel {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;              /* REQUIRED */
  align-items: center;        /* REQUIRED */
  justify-content: center;     /* REQUIRED */
  min-height: 400px;
}
```

## Data Binding Rules

**Same `data-field` value = Automatic binding**

```html
<!-- Input (Left Panel) -->
<input type="text" data-field="title" value="Hello">

<!-- Preview (Right Panel) -->
<h1 data-field="title">Hello</h1>
```

## Common Patterns

| Input Type | Preview Element | Example |
|------------|----------------|---------|
| Text | Text element | `<input data-field="title">` → `<h1 data-field="title">` |
| Color (bg) | Container div | `<input type="color" data-field="bgColor">` → `<div data-field="bgColor">` |
| Color (text) | Text element | `<input type="color" data-field="textColor">` → `<span data-field="textColor">` |
| Image | `<img>` tag | `<input type="file" data-field="image">` → `<img data-field="image">` |
| Range | Container | `<input type="range" data-field="padding">` → `<div data-field="padding">` |

## Critical Rules

1. ✅ Preview content goes **DIRECTLY** inside `.preview-panel` (no extra wrappers)
2. ✅ All inputs need `data-field` attribute
3. ✅ All preview elements need matching `data-field` attribute
4. ✅ `.preview-panel` must have `display: flex`, `align-items: center`, `justify-content: center`
5. ❌ No `!important` flags (unless absolutely necessary)
6. ❌ No extra wrapper divs around preview content
7. ❌ No custom JavaScript for binding (system handles it)




## Checklist

- [ ] Preview content directly in `.preview-panel` (no extra wrappers)
- [ ] All inputs have `data-field` attribute
- [ ] All preview elements have matching `data-field` attribute
- [ ] `.preview-panel` has `display: flex`, `align-items: center`, `justify-content: center`
- [ ] Template file named correctly (e.g., `template5.html`)
- [ ] Template file placed in `/templates/` folder
- [ ] Preview shows on right side
- [ ] Inputs update preview in real-time

