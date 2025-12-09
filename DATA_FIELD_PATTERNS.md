# 🎯 Data-Field Pattern Guide

## Universal Pattern-Based System

The sync system now works with **ANY data-field name** using intelligent patterns! You don't need to use specific field names - just follow the naming patterns below.

## 📋 Supported Patterns

### 1. **Text Content** (Any Name)
```html
<!-- Input -->
<input type="text" data-field="productName" value="Premium Product">

<!-- Preview -->
<h1 data-field="productName">Premium Product</h1>
```
✅ **Works with ANY field name** - just match the `data-field` value!

---

### 2. **Font Sizes** (Ends with `Size` or `FontSize`)
```html
<!-- Input -->
<input type="number" data-field="productTitleSize" value="24">

<!-- Preview -->
<h1 data-field="productTitle">Product Title</h1>
<!-- System automatically applies fontSize to productTitle element -->
```

**Pattern**: `[baseName]Size` or `[baseName]FontSize`
- `productTitleSize` → Updates `productTitle` element's font size
- `headerMainSize` → Updates `headerMain` element's font size
- `buttonTextFontSize` → Updates `buttonText` element's font size

---

### 3. **Background Colors** (Ends with `Bg`, `BgColor`, or contains `Background`)
```html
<!-- Input -->
<input type="color" data-field="cardBg" value="#ffffff">
<input type="color" data-field="sectionBackground" value="#f0f0f0">

<!-- Preview -->
<div data-field="cardBg">Content</div>
```

**Pattern**: 
- `[name]Bg` → Background color
- `[name]BgColor` → Background color
- `[name]Background` → Background color

**Examples**: `headerBg`, `productCardBg`, `sectionBackground`, `footerBgColor`

---

### 4. **Text Colors** (Ends with `Color` or contains `TextColor`)
```html
<!-- Input -->
<input type="color" data-field="titleColor" value="#000000">
<input type="color" data-field="buttonTextColor" value="#ffffff">

<!-- Preview -->
<h1 data-field="titleColor">Title</h1>
<!-- System automatically applies color to element AND all child text elements -->
```

**Pattern**:
- `[name]Color` → Text color
- `[name]TextColor` → Text color

**Examples**: `headerColor`, `productTitleColor`, `buttonTextColor`, `footerTextColor`

---

### 5. **Width** (Contains `Width`)
```html
<!-- Input -->
<input type="number" data-field="cardWidth" value="300">

<!-- Preview -->
<div data-field="cardWidth">Content</div>
```

**Pattern**: `[name]Width`
**Examples**: `imageWidth`, `containerWidth`, `buttonWidth`, `cardWidth`

---

### 6. **Height** (Contains `Height`, but not `LineHeight`)
```html
<!-- Input -->
<input type="number" data-field="sectionHeight" value="400">

<!-- Preview -->
<div data-field="sectionHeight">Content</div>
```

**Pattern**: `[name]Height`
**Examples**: `videoHeight`, `imageHeight`, `sectionHeight`, `containerHeight`

---

### 7. **Padding** (Contains `Padding`)
```html
<!-- Input -->
<input type="number" data-field="cardPadding" value="20">
<input type="number" data-field="sectionPaddingTop" value="15">
<input type="number" data-field="headerPaddingBottom" value="10">
```

**Patterns**:
- `[name]Padding` → All sides
- `[name]PaddingTop` → Top only
- `[name]PaddingBottom` → Bottom only
- `[name]PaddingLeft` → Left only
- `[name]PaddingRight` → Right only

**Examples**: `cardPadding`, `sectionPaddingTop`, `headerPaddingBottom`, `containerPaddingLeft`

---

### 8. **Margin** (Contains `Margin`)
```html
<!-- Input -->
<input type="number" data-field="sectionMargin" value="10">
<input type="number" data-field="cardMarginTop" value="20">
```

**Patterns**:
- `[name]Margin` → All sides
- `[name]MarginTop` → Top only
- `[name]MarginBottom` → Bottom only
- `[name]MarginLeft` → Left only
- `[name]MarginRight` → Right only

**Examples**: `cardMargin`, `sectionMarginTop`, `imageMarginBottom`

---

### 9. **Button Sizes** (Contains `ButtonSize` or `Button` + `Size`)
```html
<!-- Input -->
<input type="number" data-field="playButtonSize" value="80">
<input type="number" data-field="submitButtonSize" value="120">

<!-- Preview -->
<button class="play-button" data-field="playButton">Play</button>
```

**Pattern**: `[name]ButtonSize`
**Examples**: `playButtonSize`, `submitButtonSize`, `iconButtonSize`, `controlButtonSize`

---

### 10. **Position Fields** (Contains `Top`, `Bottom`, `Left`, `Right`)
```html
<!-- Input -->
<input type="number" data-field="logoTop" value="20">
<input type="number" data-field="badgeRight" value="15">
```

**Patterns**:
- `[name]Top` → `top` position
- `[name]Bottom` → `bottom` position
- `[name]Left` → `left` position
- `[name]Right` → `right` position

**Examples**: `watermarkTop`, `logoRight`, `badgeBottom`, `iconLeft`

---

### 11. **Image/File Uploads** (Contains image-related keywords)
```html
<!-- Input -->
<input type="file" data-field="productImage" accept="image/*">
<input type="file" data-field="backgroundThumbnail" accept="image/*">

<!-- Preview -->
<img data-field="productImage" src="">
<div data-field="backgroundThumbnail">Content</div>
```

**Pattern**: Any field containing:
- `thumbnail`
- `background`
- `image`
- `banner`
- `logo`
- `photo`
- `picture`

**Examples**: `productImage`, `backgroundThumbnail`, `heroBanner`, `companyLogo`

**Note**: If element has children, it becomes a background image. If it's an `<img>` tag, it updates the `src`.

---

### 12. **Time/Seconds** (Ends with `Seconds`)
```html
<!-- Input -->
<input type="number" data-field="rewindSeconds" value="10">
<input type="number" data-field="forwardSeconds" value="10">
```

**Pattern**: `[name]Seconds`
**Examples**: `rewindSeconds`, `forwardSeconds`, `skipSeconds`

---

## 🎨 Complete Example Template

```html
<div class="input-panel">
  <!-- Text Content -->
  <input type="text" data-field="productName" value="Premium Product">
  <input type="text" data-field="productPrice" value="$99.99">
  
  <!-- Font Sizes -->
  <input type="number" data-field="productNameSize" value="32">
  <input type="number" data-field="productPriceSize" value="24">
  
  <!-- Colors -->
  <input type="color" data-field="cardBg" value="#ffffff">
  <input type="color" data-field="productNameColor" value="#000000">
  
  <!-- Dimensions -->
  <input type="number" data-field="cardWidth" value="300">
  <input type="number" data-field="cardHeight" value="400">
  
  <!-- Padding -->
  <input type="number" data-field="cardPadding" value="20">
  <input type="number" data-field="cardPaddingTop" value="15">
  
  <!-- Images -->
  <input type="file" data-field="productImage" accept="image/*">
</div>

<div class="preview-panel">
  <div data-field="cardBg" style="width: 300px; height: 400px; padding: 20px;">
    <h1 data-field="productName" style="font-size: 32px; color: #000000;">Premium Product</h1>
    <p data-field="productPrice" style="font-size: 24px;">$99.99</p>
    <img data-field="productImage" src="" alt="Product">
  </div>
</div>
```

---

## ✅ Key Rules

1. **Match data-field values** - Input and preview must have the same `data-field` value
2. **Follow naming patterns** - Use the patterns above for automatic detection
3. **Case insensitive** - `productName` and `ProductName` work the same
4. **Flexible naming** - You can use ANY name as long as it follows the pattern

---

## 🚀 Benefits

- ✅ **No hardcoded field names** - Works with any template
- ✅ **Automatic detection** - System recognizes patterns automatically
- ✅ **Future-proof** - Add new templates without code changes
- ✅ **Flexible** - Use descriptive names that make sense for your template

---

## 💡 Tips

1. **Be descriptive**: Use names like `productCardBg` instead of `bg1`
2. **Be consistent**: Use the same naming style throughout your template
3. **Test patterns**: Check browser console to see if fields are being detected
4. **Combine patterns**: You can combine patterns (e.g., `productCardPaddingTop`)

---

**Remember**: The system is pattern-based, so as long as you follow the naming patterns, it will work automatically! 🎉

