// Add new templates by just dropping .html files into /templates/ folder
// Template files should be named: template1.html, template2.html, template3.html, etc.
// They will automatically appear in the dropdown without changing code

/**
 * Template Engine - Core functionality for dynamic template loading and binding
 * This file contains all the logic for auto-binding inputs to preview elements
 * Converted from Google Apps Script to pure static web app
 */

var TemplateEngine = {
  currentTemplate: null,
  templateData: {},
  audioFile: null,
  languageDropdownInitialized: false,
  templateList: [], // Auto-populated by discovery - NO MANUAL UPDATES NEEDED!

  /**
   * Initialize the template engine
   */
  init: async function () {
    // Initialize template scanner/manifest system
    if (typeof TemplateScanner !== 'undefined') {
      await TemplateScanner.init();
    }

    this.loadTemplates();
    this.setupEventListeners();
    // Initialize dropdown after a delay to ensure DOM is ready
    // Use longer delay to ensure shared panel elements are available
    setTimeout(function () {
      TemplateEngine.initializeLanguageDropdown();
    }, 800);
  },

  /**
   * Load available templates - automatically discovers ALL templates in /templates/ folder
   * Scans template1 through template100 - NO manual configuration needed!
   */
  loadTemplates: function () {
    var self = this;
    var discoveredTemplates = [];
    var checkPromises = [];

    console.log('🔍 Auto-discovering templates in /templates/ folder...');

    // Scan for template1 through template100 (no hardcoded list!)
    for (var i = 1; i <= 100; i++) {
      (function (templateName) {
        var checkPromise = fetch('templates/' + templateName + '.html', { method: 'HEAD' })
          .then(function (response) {
            if (response.ok) {
              console.log('  ✓ Found: ' + templateName);
              return templateName;
            }
            return null;
          })
          .catch(function () {
            return null;
          });
        checkPromises.push(checkPromise);
      })('template' + i);
    }

    Promise.all(checkPromises).then(function (results) {
      discoveredTemplates = results.filter(function (t) { return t !== null; });

      // Sort templates naturally (template1, template2, template10, not template1, template10, template2)
      discoveredTemplates.sort(function (a, b) {
        var numA = parseInt(a.replace(/template/i, '')) || 0;
        var numB = parseInt(b.replace(/template/i, '')) || 0;
        return numA - numB;
      });

      console.log('✅ Discovered ' + discoveredTemplates.length + ' template(s):', discoveredTemplates.join(', '));

      // Update internal list
      self.templateList = discoveredTemplates;

      // Auto-scan all discovered templates and update manifest
      if (typeof TemplateScanner !== 'undefined') {
        TemplateScanner.scanAllTemplates(discoveredTemplates).then(function () {
          console.log('📋 Template manifest updated with ' + discoveredTemplates.length + ' template(s)');
        }).catch(function (error) {
          console.warn('⚠️ Could not scan templates for manifest:', error);
        });
      }

      self.populateTemplateDropdown(discoveredTemplates);

      // Show success message
      if (discoveredTemplates.length > 0) {
        console.log('🎉 Template system ready! Templates: ' + discoveredTemplates.join(', '));
      } else {
        console.warn('⚠️ No templates found in /templates/ folder. Add .html files and refresh.');
      }
    }).catch(function (error) {
      console.error('❌ Template auto-discovery failed:', error);
      self.populateTemplateDropdown([]);
    });
  },

  /**
   * Populate template dropdown
   */
  populateTemplateDropdown: function (templates) {
    var select = document.getElementById('templateSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Select a Template --</option>';

    if (templates.length === 0) {
      select.innerHTML = '<option value="">⚠️ No templates found - Add templates to /templates/ folder and refresh</option>';
      console.warn('⚠️ No templates found. Add .html files to /templates/ folder and refresh the page.');
      return;
    }

    templates.forEach(function (template) {
      var option = document.createElement('option');
      option.value = template;
      // Format display name: template1 -> Template 1, template2 -> Template 2
      var displayName = template.replace(/^template/i, 'Template ');
      option.textContent = displayName;
      select.appendChild(option);
    });

    console.log('📝 Template dropdown populated with ' + templates.length + ' template(s)');
  },

  /**
   * Setup event listeners
   */
  setupEventListeners: function () {
    var select = document.getElementById('templateSelect');
    if (select) {
      select.addEventListener('change', this.handleTemplateChange.bind(this));
    }

    // Export button listeners
    var zipBtn = document.getElementById('downloadZipBtn');
    if (zipBtn) {
      zipBtn.addEventListener('click', function () {
        // Show time estimate before starting
        var languages = TemplateEngine.getSelectedLanguages();
        if (languages.length > 0 && typeof ExportFunctions !== 'undefined' && ExportFunctions.calculateTimeEstimate) {
          var estimatedTime = ExportFunctions.calculateTimeEstimate(languages);
          var timeEstimateDiv = document.getElementById('timeEstimate');
          var timeEstimateValue = document.getElementById('timeEstimateValue');
          if (timeEstimateDiv && timeEstimateValue) {
            timeEstimateDiv.style.display = 'block';
            timeEstimateValue.textContent = ExportFunctions.formatTimeEstimate(estimatedTime);
          }
        }
        TemplateEngine.downloadZip();
      });
    }

    var imagesBtn = document.getElementById('downloadImagesBtn');
    if (imagesBtn) {
      imagesBtn.addEventListener('click', function () {
        // Show time estimate before starting
        var languages = TemplateEngine.getSelectedLanguages();
        if (languages.length > 0 && typeof ExportFunctions !== 'undefined' && ExportFunctions.calculateImagesTimeEstimate) {
          var estimatedTime = ExportFunctions.calculateImagesTimeEstimate(languages);
          var timeEstimateDiv = document.getElementById('timeEstimate');
          var timeEstimateValue = document.getElementById('timeEstimateValue');
          if (timeEstimateDiv && timeEstimateValue) {
            timeEstimateDiv.style.display = 'block';
            timeEstimateValue.textContent = ExportFunctions.formatTimeEstimate(estimatedTime);
          }
        }
        TemplateEngine.downloadImages();
      });
    }

    var videoBtn = document.getElementById('downloadVideoBtn');
    if (videoBtn) {
      videoBtn.addEventListener('click', function () {
        // Show time estimate before starting (if audio is loaded)
        if (TemplateEngine.audioFile && typeof ExportFunctions !== 'undefined' && ExportFunctions.calculateVideoTimeEstimate) {
          // Get audio duration for estimation
          var audioFile = TemplateEngine.audioFile;
          var reader = new FileReader();
          reader.onload = function (e) {
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(e.target.result).then(function (decodedAudio) {
              var languages = TemplateEngine.getSelectedLanguages();
              if (languages.length > 0) {
                var estimatedTime = ExportFunctions.calculateVideoTimeEstimate(languages, decodedAudio.duration);
                var timeEstimateDiv = document.getElementById('timeEstimate');
                var timeEstimateValue = document.getElementById('timeEstimateValue');
                if (timeEstimateDiv && timeEstimateValue) {
                  timeEstimateDiv.style.display = 'block';
                  var timeText = ExportFunctions.formatTimeEstimate(estimatedTime);
                  timeText += ' (Audio: ' + Math.ceil(decodedAudio.duration) + 's per video)';
                  timeEstimateValue.textContent = timeText;
                }
              }
            }).catch(function (err) {
              console.warn('Could not decode audio for time estimate:', err);
            });
          };
          reader.readAsArrayBuffer(audioFile);
        }
        TemplateEngine.downloadVideo();
      });
    }

    // Blur intensity control with live preview
    var blurIntensitySlider = document.getElementById('blurIntensity');
    var blurValueDisplay = document.getElementById('blurValue');
    if (blurIntensitySlider && blurValueDisplay) {
      blurIntensitySlider.addEventListener('input', function () {
        blurValueDisplay.textContent = this.value;
        // Update live preview
        if (typeof TemplateEngine !== 'undefined') {
          TemplateEngine.updateBlurPreview(parseInt(this.value));
        }
      });

      // Initialize preview on load (wait for ExportFunctions to be available)
      var initPreview = function () {
        if (typeof TemplateEngine !== 'undefined' && typeof ExportFunctions !== 'undefined' && ExportFunctions.createBlurredAdBackground) {
          TemplateEngine.updateBlurPreview(parseInt(blurIntensitySlider.value));
        } else {
          setTimeout(initPreview, 200);
        }
      };
      setTimeout(initPreview, 500);
    }
  },

  /**
   * Handle template selection change
   */
  handleTemplateChange: function (event) {
    var templateName = event.target.value;
    if (!templateName) {
      var container = document.getElementById('templateContainer');
      if (container) {
        container.innerHTML = '<div class="loading" id="loading"><div class="spinner"></div><p>Loading template...</p></div>';
      }
      var sharedPanel = document.getElementById('sharedPanel');
      if (sharedPanel) {
        sharedPanel.style.display = 'none';
      }
      this.currentTemplate = null;
      this.templateData = {};
      this.audioFile = null;
      return;
    }

    // Always load template, even if switching between templates
    this.loadTemplate(templateName);
  },

  /**
   * Load template content dynamically using fetch
   */
  loadTemplate: function (templateName) {
    var container = document.getElementById('templateContainer');
    var sharedPanel = document.getElementById('sharedPanel');

    if (!container) return;

    // Clear container and recreate loading element
    container.innerHTML = '<div class="loading active" id="loading"><div class="spinner"></div><p>Loading template...</p></div>';

    this.currentTemplate = templateName;
    this.templateData = {};
    this.audioFile = null;

    // Hide video button initially
    var videoBtn = document.getElementById('downloadVideoBtn');
    if (videoBtn) {
      videoBtn.style.display = 'none';
    }

    // Fetch template content
    fetch('templates/' + templateName + '.html')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Template not found: ' + templateName);
        }
        return response.text();
      })
      .then(function (htmlContent) {
        var loading = document.getElementById('loading');
        if (loading) {
          loading.classList.remove('active');
        }
        container.innerHTML = htmlContent;
        if (sharedPanel) {
          sharedPanel.style.display = 'block';
        }

        // Validate template structure if scanner is available
        if (typeof TemplateScanner !== 'undefined') {
          var validation = TemplateScanner.validateTemplateForExport(templateName);
          if (validation && !validation.valid) {
            console.warn('⚠️ Template validation issues:', validation.errors);
            if (validation.errors.length > 0) {
              console.error('❌ Template "' + templateName + '" has validation errors:', validation.errors);
            }
          }
          if (validation && validation.warnings && validation.warnings.length > 0) {
            console.warn('⚠️ Template "' + templateName + '" warnings:', validation.warnings);
          }
        }

        // Initialize binding after template loads
        TemplateEngine.initializeBinding();

        // Update language dropdown text (dropdown is already initialized on page load)
        setTimeout(function () {
          TemplateEngine.updateLanguageDropdownText();
        }, 100);
      })
      .catch(function (error) {
        console.error('Error loading template:', error);
        var loading = document.getElementById('loading');
        if (loading) {
          loading.classList.remove('active');
        }
        container.innerHTML = '<div class="error" style="padding: 40px; text-align: center; color: #d32f2f;">Error loading template: ' + error.message + '</div>';
      });
  },

  /**
   * Initialize auto-binding between inputs and preview elements
   */
  initializeBinding: function () {
    var container = document.getElementById('templateContainer');
    if (!container) return;

    // Find all input elements with data-field attributes
    var inputs = container.querySelectorAll('[data-field]');

    inputs.forEach(function (input) {
      var fieldName = input.getAttribute('data-field');

      // Initialize template data
      if (!TemplateEngine.templateData[fieldName]) {
        TemplateEngine.templateData[fieldName] = input.value || input.textContent || '';
      }

      // Setup event listeners based on input type
      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        // For number inputs, use 'input' event for real-time updates
        if (input.type === 'number' || input.type === 'range') {
          input.addEventListener('input', function () {
            TemplateEngine.updatePreview(fieldName, input.value);
          });
        }
        // For all inputs, also listen to 'change' event
        input.addEventListener('change', function () {
          TemplateEngine.updatePreview(fieldName, input.value);
        });
        // For text inputs, also listen to 'input' for real-time updates
        if (input.type === 'text' || input.type === 'textarea' || input.type === 'color') {
          input.addEventListener('input', function () {
            TemplateEngine.updatePreview(fieldName, input.value);
          });
        }
      } else if (input.tagName === 'SELECT') {
        input.addEventListener('change', function () {
          TemplateEngine.updatePreview(fieldName, input.value);
        });
      }

      // Handle file inputs (for images and audio)
      if (input.type === 'file') {
        input.addEventListener('change', function (e) {
          TemplateEngine.handleFileInput(fieldName, e.target.files[0]);
        });
      }
    });

    // Initialize preview elements with current values
    this.syncPreview();
  },

  /**
   * Update preview element when input changes
   * 
   * UNIVERSAL PATTERN-BASED SYSTEM - Works with ANY data-field name!
   * 
   * Supported Patterns (see DATA_FIELD_PATTERNS.md for details):
   * 
   * 1. TEXT CONTENT: Any field name (just match data-field values)
   *    Example: productName, title, description
   * 
   * 2. FONT SIZES: [name]Size or [name]FontSize
   *    Example: productTitleSize → updates productTitle element's fontSize
   * 
   * 3. BACKGROUND COLORS: [name]Bg, [name]BgColor, or contains Background
   *    Example: cardBg, sectionBackground → sets backgroundColor
   * 
   * 4. TEXT COLORS: [name]Color or contains TextColor
   *    Example: titleColor, buttonTextColor → sets color (and child text elements)
   * 
   * 5. WIDTH: [name]Width
   *    Example: cardWidth, imageWidth → sets width
   * 
   * 6. HEIGHT: [name]Height (not LineHeight)
   *    Example: sectionHeight, videoHeight → sets height
   * 
   * 7. PADDING: [name]Padding, [name]PaddingTop/Bottom/Left/Right
   *    Example: cardPadding, sectionPaddingTop → sets padding
   * 
   * 8. MARGIN: [name]Margin, [name]MarginTop/Bottom/Left/Right
   *    Example: cardMargin, sectionMarginTop → sets margin
   * 
   * 9. BUTTON SIZES: [name]ButtonSize
   *    Example: playButtonSize, submitButtonSize → sets button width/height
   * 
   * 10. POSITIONS: [name]Top/Bottom/Left/Right (not Padding/Margin)
   *     Example: logoTop, badgeRight → sets position
   * 
   * 11. IMAGES: Contains thumbnail/background/image/banner/logo/photo/picture
   *     Example: productImage, backgroundThumbnail → handles image uploads
   * 
   * 12. TIME/SECONDS: [name]Seconds
   *     Example: rewindSeconds, forwardSeconds → updates text content
   * 
   * All patterns are case-insensitive and work automatically!
   */
  updatePreview: function (fieldName, value) {
    var container = document.getElementById('templateContainer');
    if (!container) return;

    this.templateData[fieldName] = value;

    // Find the input element to check its type
    var inputElement = container.querySelector('input[data-field="' + fieldName + '"]');
    var inputType = inputElement ? inputElement.type : '';

    // ========================================================================
    // PATTERN 1: Font Size (works with ANY field ending in Size/FontSize)
    // Examples: headerMainSize, productTitleSize, buttonTextFontSize, etc.
    // ========================================================================
    if (inputType === 'number' && (fieldName.endsWith('Size') || fieldName.includes('FontSize'))) {
      // Extract base field name (e.g., "productTitle" from "productTitleSize")
      var baseFieldName = fieldName.replace(/Size$/i, '').replace(/FontSize$/i, '');

      // Find the preview element with the base field name
      var textContainer = container.querySelector('[data-field="' + baseFieldName + '"]');

      if (textContainer) {
        // Try to find a child element with class matching the base name (e.g., .product-title)
        // This handles cases like: productTitleSize -> .product-title
        var className = baseFieldName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        var sizeTarget = textContainer.querySelector('.' + className) ||
          textContainer.querySelector('[class*="' + baseFieldName.toLowerCase() + '"]') ||
          textContainer.querySelector('[class*="' + className + '"]') ||
          textContainer;

        sizeTarget.style.fontSize = value + 'px';
        return;
      }
      return; // Exit early for font size inputs
    }

    // Find all preview elements with matching data-field
    var previewElements = container.querySelectorAll('[data-field="' + fieldName + '"]');

    previewElements.forEach(function (element) {
      // Skip input elements (only update preview elements)
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
        return;
      }

      // ========================================================================
      // PATTERN 8: Color Inputs (works with ANY field ending in Bg/Color/Background)
      // Examples: headerBg, productCardColor, sectionBackground, buttonTextColor, etc.
      // ========================================================================
      if (inputType === 'color') {
        // Background colors: ends with 'Bg' or contains 'BgColor' or 'Background'
        if (fieldName.endsWith('Bg') || fieldName.includes('BgColor') ||
          fieldName.includes('Background') || fieldName.toLowerCase().includes('background')) {
          element.style.backgroundColor = value;
          // Remove any hex code text that might be showing
          if (element.textContent && element.textContent.match(/^#[0-9a-fA-F]{3,6}$/)) {
            element.textContent = '';
          }
          return;
        }
        // Text colors: ends with 'Color' or contains 'TextColor'
        if (fieldName.endsWith('Color') || fieldName.includes('TextColor') ||
          fieldName.toLowerCase().includes('textcolor')) {
          element.style.color = value;
          // Also update ALL child text elements (universal pattern)
          var childTextElements = element.querySelectorAll(
            '[class*="text"], [class*="title"], [class*="heading"], ' +
            'h1, h2, h3, h4, h5, h6, p, span, div'
          );
          childTextElements.forEach(function (textEl) {
            // Only update if it's actually a text element (not an input)
            if (textEl.tagName !== 'INPUT' && textEl.tagName !== 'TEXTAREA' && textEl.tagName !== 'SELECT') {
              textEl.style.color = value;
              // Remove any hex code text from children too
              if (textEl.textContent && textEl.textContent.match(/^#[0-9a-fA-F]{3,6}$/)) {
                textEl.textContent = '';
              }
            }
          });
          return;
        }
      }

      // Handle number inputs (dimensions, padding, margin, etc. - NOT font sizes, handled above)
      if (inputType === 'number') {
        // Width: ends with 'Width' or contains 'Width' - ONLY update style, NOT text content
        if (fieldName.endsWith('Width') || fieldName.includes('Width')) {
          element.style.width = value + 'px';
          // Remove any numeric text that might be showing (like "320")
          if (element.textContent && element.textContent.trim().match(/^\d+$/)) {
            // Only remove if it's a pure number and element has children (means it's a container)
            if (element.children.length > 0) {
              var textNodes = [];
              for (var i = 0; i < element.childNodes.length; i++) {
                if (element.childNodes[i].nodeType === 3) { // Text node
                  textNodes.push(element.childNodes[i]);
                }
              }
              textNodes.forEach(function (node) {
                if (node.textContent.trim().match(/^\d+$/)) {
                  node.remove();
                }
              });
            }
          }
          return;
        }
        // Height: ends with 'Height' or contains 'Height'
        if (fieldName.endsWith('Height') || fieldName.includes('Height')) {
          element.style.height = value + 'px';
          // Remove any numeric text that might be showing
          if (element.textContent && element.textContent.trim().match(/^\d+$/)) {
            if (element.children.length > 0) {
              var textNodes = [];
              for (var i = 0; i < element.childNodes.length; i++) {
                if (element.childNodes[i].nodeType === 3) { // Text node
                  textNodes.push(element.childNodes[i]);
                }
              }
              textNodes.forEach(function (node) {
                if (node.textContent.trim().match(/^\d+$/)) {
                  node.remove();
                }
              });
            }
          }
          return;
        }
        // ========================================================================
        // PATTERN 2: Padding (works with ANY field containing Padding)
        // Examples: headerPaddingTop, productCardPadding, sectionPaddingBottom, etc.
        // ========================================================================
        if (fieldName.includes('Padding')) {
          // Check for directional padding (Top, Bottom, Left, Right)
          if (fieldName.includes('PaddingTop') || fieldName.includes('PaddingTop')) {
            var currentPadding = window.getComputedStyle(element).padding || '0';
            var paddingParts = currentPadding.split(' ');
            element.style.paddingTop = value + 'px';
            // Preserve other padding values
            if (paddingParts.length >= 2) {
              element.style.paddingRight = paddingParts[1] || paddingParts[0] || '0';
            }
            if (paddingParts.length >= 3) {
              element.style.paddingBottom = paddingParts[2] || paddingParts[0] || '0';
            }
            if (paddingParts.length >= 4) {
              element.style.paddingLeft = paddingParts[3] || paddingParts[1] || paddingParts[0] || '0';
            } else if (paddingParts.length >= 2) {
              element.style.paddingLeft = paddingParts[1] || paddingParts[0] || '0';
            }
            return;
          }
          if (fieldName.includes('PaddingBottom')) {
            var currentPadding = window.getComputedStyle(element).padding || '0';
            var paddingParts = currentPadding.split(' ');
            element.style.paddingBottom = value + 'px';
            if (paddingParts.length >= 1) {
              element.style.paddingTop = paddingParts[0] || '0';
            }
            if (paddingParts.length >= 2) {
              element.style.paddingRight = paddingParts[1] || paddingParts[0] || '0';
            }
            if (paddingParts.length >= 4) {
              element.style.paddingLeft = paddingParts[3] || paddingParts[1] || paddingParts[0] || '0';
            } else if (paddingParts.length >= 2) {
              element.style.paddingLeft = paddingParts[1] || paddingParts[0] || '0';
            }
            return;
          }
          if (fieldName.includes('PaddingLeft')) {
            var currentPadding = window.getComputedStyle(element).padding || '0';
            var paddingParts = currentPadding.split(' ');
            element.style.paddingLeft = value + 'px';
            if (paddingParts.length >= 1) {
              element.style.paddingTop = paddingParts[0] || '0';
            }
            if (paddingParts.length >= 2) {
              element.style.paddingRight = paddingParts[1] || paddingParts[0] || '0';
            }
            if (paddingParts.length >= 3) {
              element.style.paddingBottom = paddingParts[2] || paddingParts[0] || '0';
            }
            return;
          }
          if (fieldName.includes('PaddingRight')) {
            var currentPadding = window.getComputedStyle(element).padding || '0';
            var paddingParts = currentPadding.split(' ');
            element.style.paddingRight = value + 'px';
            if (paddingParts.length >= 1) {
              element.style.paddingTop = paddingParts[0] || '0';
            }
            if (paddingParts.length >= 3) {
              element.style.paddingBottom = paddingParts[2] || paddingParts[0] || '0';
            }
            if (paddingParts.length >= 4) {
              element.style.paddingLeft = paddingParts[3] || paddingParts[1] || paddingParts[0] || '0';
            } else if (paddingParts.length >= 2) {
              element.style.paddingLeft = paddingParts[1] || paddingParts[0] || '0';
            }
            return;
          }
          // Generic padding (all sides)
          element.style.padding = value + 'px';
          return;
        }
        // ========================================================================
        // PATTERN 3: Margin (works with ANY field containing Margin)
        // Examples: sectionMargin, cardMarginTop, containerMarginBottom, etc.
        // ========================================================================
        if (fieldName.includes('Margin')) {
          // Check for directional margin
          if (fieldName.includes('MarginTop')) {
            element.style.marginTop = value + 'px';
            return;
          }
          if (fieldName.includes('MarginBottom')) {
            element.style.marginBottom = value + 'px';
            return;
          }
          if (fieldName.includes('MarginLeft')) {
            element.style.marginLeft = value + 'px';
            return;
          }
          if (fieldName.includes('MarginRight')) {
            element.style.marginRight = value + 'px';
            return;
          }
          // Generic margin (all sides)
          element.style.margin = value + 'px';
          return;
        }
        // ========================================================================
        // PATTERN 4: Button Sizes (works with ANY field containing ButtonSize)
        // Examples: playButtonSize, submitButtonSize, iconButtonSize, etc.
        // ========================================================================
        if (fieldName.includes('ButtonSize') || (fieldName.includes('Size') && fieldName.includes('Button'))) {
          // Extract button name (e.g., "play" from "playButtonSize")
          var buttonName = fieldName.replace(/ButtonSize$/i, '').replace(/Size$/i, '');
          var buttonClass = buttonName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

          // Try multiple selectors to find buttons
          var buttons = container.querySelectorAll(
            '.' + buttonClass + '-button, ' +
            '.' + buttonName.toLowerCase() + '-button, ' +
            '[class*="' + buttonName.toLowerCase() + '"]' +
            '[class*="button"], ' +
            '[data-size="' + fieldName + '"], ' +
            '[data-size="' + buttonName + 'ButtonSize"], ' +
            '[data-field="' + fieldName + '"]'
          );

          if (buttons.length === 0) {
            // Fallback: try to find by data-field with base name
            var baseName = fieldName.replace(/ButtonSize$/i, '').replace(/Size$/i, '');
            buttons = container.querySelectorAll('[data-field*="' + baseName + '"]');
          }

          // Also try finding by class names like "play-button", "control-button", etc.
          if (buttons.length === 0) {
            if (buttonName.toLowerCase().includes('play')) {
              buttons = container.querySelectorAll('.play-button, .play-btn, [class*="play"][class*="button"]');
            } else if (buttonName.toLowerCase().includes('control')) {
              buttons = container.querySelectorAll('.control-btn, .control-button, [class*="control"][class*="button"]');
            }
          }

          buttons.forEach(function (btn) {
            if (btn.tagName !== 'INPUT' && btn.tagName !== 'TEXTAREA' && btn.tagName !== 'SELECT') {
              btn.style.width = value + 'px';
              btn.style.height = value + 'px';

              // If it's a play button, also update icon size
              if (buttonName.toLowerCase().includes('play')) {
                var icon = btn.querySelector('.play-icon, [class*="icon"]');
                if (icon) {
                  var iconSize = Math.min(value * 0.25, 22);
                  icon.style.borderLeftWidth = iconSize + 'px';
                  icon.style.borderTopWidth = (iconSize * 0.6) + 'px';
                  icon.style.borderBottomWidth = (iconSize * 0.6) + 'px';
                }
              }
            }
          });

          if (buttons.length > 0) {
            return;
          }
        }

        // ========================================================================
        // PATTERN 5: Position Fields (Top, Bottom, Left, Right)
        // Examples: watermarkTop, logoRight, badgeBottom, iconLeft, etc.
        // ========================================================================
        if (fieldName.includes('Top') && !fieldName.includes('Padding') && !fieldName.includes('Margin')) {
          // Special handling for watermark: find watermark element by base name
          if (fieldName.includes('watermark') || fieldName.includes('Watermark')) {
            var watermark = container.querySelector('.watermark[data-field="watermark"], [class*="watermark"][data-field*="watermark"]');
            if (watermark) {
              watermark.style.top = value + 'px';
              return;
            }
          }
          element.style.top = value + 'px';
          return;
        }
        if (fieldName.includes('Bottom') && !fieldName.includes('Padding') && !fieldName.includes('Margin')) {
          if (fieldName.includes('watermark') || fieldName.includes('Watermark')) {
            var watermark = container.querySelector('.watermark[data-field="watermark"], [class*="watermark"][data-field*="watermark"]');
            if (watermark) {
              watermark.style.bottom = value + 'px';
              return;
            }
          }
          element.style.bottom = value + 'px';
          return;
        }
        if (fieldName.includes('Left') && !fieldName.includes('Padding') && !fieldName.includes('Margin')) {
          if (fieldName.includes('watermark') || fieldName.includes('Watermark')) {
            var watermark = container.querySelector('.watermark[data-field="watermark"], [class*="watermark"][data-field*="watermark"]');
            if (watermark) {
              watermark.style.left = value + 'px';
              return;
            }
          }
          element.style.left = value + 'px';
          return;
        }
        if (fieldName.includes('Right') && !fieldName.includes('Padding') && !fieldName.includes('Margin')) {
          // Special handling for watermark: find watermark element by base name
          if (fieldName.includes('watermark') || fieldName.includes('Watermark')) {
            var watermark = container.querySelector('.watermark[data-field="watermark"], [class*="watermark"][data-field*="watermark"]');
            if (watermark) {
              watermark.style.right = value + 'px';
              return;
            }
          }
          element.style.right = value + 'px';
          return;
        }

        // ========================================================================
        // PATTERN 6: Section Heights (works with ANY field containing Height)
        // Examples: videoHeight, imageHeight, sectionHeight, etc.
        // ========================================================================
        if (fieldName.includes('Height') && !fieldName.includes('LineHeight')) {
          // Special handling for videoHeight: find video-section
          if (fieldName.includes('video') || fieldName.includes('Video')) {
            var videoSection = container.querySelector('.video-section, [class*="video-section"], [class*="video"]');
            if (videoSection) {
              videoSection.style.height = value + 'px';
              return;
            }
          }
          // Try to find section by class name derived from field name
          var sectionName = fieldName.replace(/Height$/i, '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
          var section = container.querySelector('.' + sectionName + '-section, [class*="' + sectionName + '"]') || element;
          section.style.height = value + 'px';
          return;
        }

        // ========================================================================
        // PATTERN 6B: Watermark Size (special case for watermark font size)
        // ========================================================================
        if (fieldName.includes('watermarkSize') || fieldName.includes('WatermarkSize')) {
          var watermark = container.querySelector('.watermark[data-field="watermark"], [class*="watermark"][data-field*="watermark"]');
          if (watermark) {
            watermark.style.fontSize = value + 'px';
            return;
          }
        }

        // ========================================================================
        // PATTERN 7: Seconds/Time Fields (text content for buttons)
        // Examples: rewindSeconds, forwardSeconds, skipSeconds, etc.
        // ========================================================================
        if (fieldName.includes('Seconds')) {
          // Try to find button or element that should display this
          var actionName = fieldName.replace(/Seconds$/i, '');
          var actionClass = actionName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

          // Look for buttons or spans that might contain this value
          var targetElements = container.querySelectorAll(
            '[class*="' + actionName.toLowerCase() + '"], ' +
            '[class*="' + actionClass + '"], ' +
            'button, .btn, [class*="button"]'
          );

          // Update text content in likely elements
          targetElements.forEach(function (el) {
            if (el.textContent && (el.textContent.includes('⏩') || el.textContent.includes('⏪') ||
              el.textContent.match(/\d+/))) {
              // Replace number in text
              el.textContent = el.textContent.replace(/\d+/, value);
            }
          });

          // Also update the element itself if it's a text element
          if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
            element.textContent = value;
          }
          return;
        }
      }

      // ========================================================================
      // PATTERN 9: File Inputs (images, audio) - works with ANY field name
      // Examples: thumbnail, backgroundImage, productImage, logo, banner, etc.
      // ========================================================================
      if (inputType === 'file' && value && (value.startsWith('data:') || value.startsWith('blob:'))) {
        // Check if element is a container that should show background image
        // Pattern: any field containing: thumbnail, background, image, banner, logo, photo, picture
        var isBackgroundImage = element.classList.contains('video-section') ||
          element.classList.contains('image-container') ||
          element.classList.contains('background') ||
          fieldName.toLowerCase().includes('thumbnail') ||
          fieldName.toLowerCase().includes('background') ||
          fieldName.toLowerCase().includes('image') ||
          fieldName.toLowerCase().includes('banner') ||
          fieldName.toLowerCase().includes('logo') ||
          fieldName.toLowerCase().includes('photo') ||
          fieldName.toLowerCase().includes('picture') ||
          (element.children.length > 0 && element.tagName !== 'IMG');

        if (isBackgroundImage) {
          element.style.backgroundImage = 'url(' + value + ')';
          element.style.backgroundSize = 'cover';
          element.style.backgroundPosition = 'center';
          // Remove any file path text
          if (element.textContent && (element.textContent.includes('fakepath') ||
            element.textContent.includes('C:\\') ||
            element.textContent.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
            element.textContent = '';
          }
          return;
        }
        // Otherwise treat as img src
        if (element.tagName === 'IMG') {
          element.src = value;
          return;
        }
      }

      // Handle style updates (padding, margin, etc.)
      if (fieldName.includes('Padding')) {
        element.style.padding = value;
        return;
      }

      if (fieldName.includes('Margin')) {
        element.style.margin = value;
        return;
      }

      // Update based on element type
      if (element.tagName === 'IMG') {
        if (value && (value.startsWith('data:') || value.startsWith('http') || value.startsWith('blob:'))) {
          element.src = value;
        }
      } else if (element.tagName === 'VIDEO' || element.tagName === 'AUDIO') {
        if (value && (value.startsWith('data:') || value.startsWith('http') || value.startsWith('blob:'))) {
          element.src = value;
        }
      } else {
        // Default: update text content
        // BUT: Skip if element has width/height data-field (these are style-only)
        if (fieldName.includes('Width') || fieldName.includes('Height') ||
          fieldName.includes('Size') || fieldName.includes('Padding') ||
          fieldName.includes('Margin') || fieldName.includes('Top') ||
          fieldName.includes('Bottom') || fieldName.includes('Right') ||
          fieldName.includes('Left')) {
          // These are style-only fields, don't update text content
          return;
        }

        // Skip file paths
        if (typeof value === 'string' && (value.includes('fakepath') || value.includes('C:\\') || value.match(/^[A-Z]:\\.*\.(jpg|jpeg|png|gif|webp)$/i))) {
          return; // Skip file paths
        }

        // Skip hex color codes (they should only be used for styles, not text)
        if (typeof value === 'string' && value.match(/^#[0-9a-fA-F]{3,6}$/)) {
          return; // Skip hex codes as text content
        }

        // Skip pure numeric values if element has children (it's a container, not a text element)
        if (typeof value === 'string' && value.trim().match(/^\d+$/) && element.children.length > 0) {
          var dataField = element.getAttribute('data-field');
          // If it's a dimension field, don't set as text
          if (dataField && (dataField.includes('Width') || dataField.includes('Height') ||
            dataField.includes('Size') || dataField.includes('Padding') ||
            dataField.includes('Margin'))) {
            return; // Skip numeric values for dimension fields
          }
        }

        element.textContent = value;
        // Also try innerHTML for HTML content (but be careful)
        if (value && value.includes('<')) {
          element.innerHTML = value;
        }
      }
    });
  },

  /**
   * Handle file input (images, audio)
   * Stores image data URL in templateData for export
   */
  handleFileInput: function (fieldName, file) {
    if (!file) return;

    var reader = new FileReader();

    reader.onload = function (e) {
      var dataUrl = e.target.result;

      // IMPORTANT: Store in templateData FIRST before updating preview
      // This ensures getFieldValues() can find the image
      TemplateEngine.templateData[fieldName] = dataUrl;

      console.log('Image uploaded for field "' + fieldName + '":', dataUrl.substring(0, 50) + '...');

      // Remove any file path text that might be showing in preview
      var container = document.getElementById('templateContainer');
      if (container) {
        // Find and remove any text elements showing file paths
        var allElements = container.querySelectorAll('.preview-panel *');
        allElements.forEach(function (el) {
          var text = el.textContent || '';
          if ((text.includes('fakepath') || text.includes('C:\\') ||
            text.match(/^[A-Z]:\\.*\.(jpg|jpeg|png|gif|webp)$/i) ||
            (file.name && text.includes(file.name))) &&
            el.tagName !== 'INPUT' && el.tagName !== 'LABEL') {
            // Only remove if it's not a data-field element with actual content
            var dataField = el.getAttribute('data-field');
            if (!dataField || dataField === fieldName) {
              el.style.display = 'none';
              el.textContent = '';
              el.innerHTML = '';
            }
          }
        });
      }

      // Update preview to show the image
      TemplateEngine.updatePreview(fieldName, dataUrl);

      // Check if it's an audio file
      if (file.type.startsWith('audio/')) {
        TemplateEngine.audioFile = file;
        var videoBtn = document.getElementById('downloadVideoBtn');
        if (videoBtn) {
          videoBtn.style.display = 'inline-block';
        }
      }
    };

    reader.onerror = function (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/')) {
      reader.readAsDataURL(file);
    }
  },

  /**
   * Sync all preview elements with current input values
   */
  syncPreview: function () {
    var container = document.getElementById('templateContainer');
    if (!container) return;

    var inputs = container.querySelectorAll('[data-field]');

    inputs.forEach(function (input) {
      var fieldName = input.getAttribute('data-field');
      var value = input.value || input.textContent || '';

      if (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA' && input.tagName !== 'SELECT') {
        return;
      }

      // Skip file inputs during initial sync (they'll be handled when file is selected)
      if (input.type === 'file') {
        return;
      }

      TemplateEngine.updatePreview(fieldName, value);
    });

    // Remove any file path text overlays and hex codes that might be showing
    var allElements = container.querySelectorAll('.preview-panel *');
    allElements.forEach(function (el) {
      var text = el.textContent || '';

      // Remove file paths
      if ((text.includes('fakepath') || text.includes('C:\\') ||
        text.match(/^[A-Z]:\\.*\.(jpg|jpeg|png|gif|webp)$/i)) &&
        el.tagName !== 'INPUT' && el.tagName !== 'LABEL') {
        var dataField = el.getAttribute('data-field');
        if (!dataField || dataField.includes('thumbnail') || dataField.includes('image')) {
          el.style.display = 'none';
          el.textContent = '';
          el.innerHTML = '';
        }
      }

      // Remove hex color codes showing as text (like #00000, #2c5f8d, #8b2e2e)
      if (text.match(/^#[0-9a-fA-F]{3,6}$/) && el.tagName !== 'INPUT' && el.tagName !== 'LABEL') {
        var dataField = el.getAttribute('data-field');
        // Only remove if it's a color field (Bg, Color) or if it's not a content field
        if (dataField && (dataField.includes('Bg') || dataField.includes('Color'))) {
          el.textContent = '';
          el.innerHTML = '';
        } else if (!dataField) {
          el.style.display = 'none';
          el.textContent = '';
          el.innerHTML = '';
        }
      }

      // Remove pure numeric text (like "320") from container elements that have children
      // This prevents width/height values from showing as text
      if (text.match(/^\d+$/) && el.tagName !== 'INPUT' && el.tagName !== 'LABEL' && el.children.length > 0) {
        var dataField = el.getAttribute('data-field');
        // Remove if it's a dimension field (Width, Height) or if it's a container
        if (dataField && (dataField.includes('Width') || dataField.includes('Height'))) {
          // Remove text nodes that are pure numbers
          var textNodes = [];
          for (var i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === 3) { // Text node
              textNodes.push(el.childNodes[i]);
            }
          }
          textNodes.forEach(function (node) {
            if (node.textContent.trim().match(/^\d+$/)) {
              node.remove();
            }
          });
        }
      }
    });
  },

  /**
   * Get all field values from current template
   * Captures images from preview elements directly to ensure uploaded images are included
   * Uses manifest to ensure all fields are captured
   */
  getFieldValues: function () {
    var container = document.getElementById('templateContainer');
    if (!container) return {};

    var inputs = container.querySelectorAll('[data-field]');
    var currentValues = {};
    var templateName = this.currentTemplate;

    // Get expected fields from manifest if available
    var expectedFields = [];
    if (typeof TemplateScanner !== 'undefined' && templateName) {
      expectedFields = TemplateScanner.getAllFields(templateName);
      if (expectedFields.length > 0) {
        console.log('📋 Manifest shows ' + expectedFields.length + ' expected fields for ' + templateName);
      }
    }

    // Get current values from all input elements
    inputs.forEach(function (input) {
      var fieldName = input.getAttribute('data-field');

      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
        if (input.type === 'file') {
          // For file inputs, check multiple sources:
          // 1. Check templateData (stored when file was uploaded)
          // 2. Check preview image element src (current displayed image)
          // 3. Check background-image style
          var imageValue = null;

          if (TemplateEngine.templateData[fieldName] &&
            (TemplateEngine.templateData[fieldName].startsWith('data:') ||
              TemplateEngine.templateData[fieldName].startsWith('blob:'))) {
            imageValue = TemplateEngine.templateData[fieldName];
          } else {
            // Try to get from preview image element
            var previewImg = container.querySelector('img[data-field="' + fieldName + '"]');
            if (previewImg && previewImg.src &&
              (previewImg.src.startsWith('data:') || previewImg.src.startsWith('blob:'))) {
              imageValue = previewImg.src;
            } else {
              // Try to get from background-image style
              var bgElement = container.querySelector('[data-field="' + fieldName + '"]');
              if (bgElement) {
                var bgImage = window.getComputedStyle(bgElement).backgroundImage;
                if (bgImage && bgImage !== 'none' && (bgImage.includes('data:') || bgImage.includes('blob:'))) {
                  // Extract URL from background-image: url("data:image/...")
                  var urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                  if (urlMatch && urlMatch[1]) {
                    imageValue = urlMatch[1];
                  }
                }
              }
            }
          }

          if (imageValue) {
            currentValues[fieldName] = imageValue;
            console.log('✅ Captured image for field "' + fieldName + '"');
          } else {
            console.warn('⚠️ No image found for field "' + fieldName + '"');
          }
        } else {
          var value = input.value || '';
          if (value) {
            currentValues[fieldName] = value;
          }
        }
      }
    });

    // Also get values from preview elements (for images that might not have input)
    var previewImages = container.querySelectorAll('img[data-field]');
    previewImages.forEach(function (img) {
      var fieldName = img.getAttribute('data-field');
      // Only add if it's a data URL or blob URL (uploaded image)
      if (img.src && (img.src.startsWith('data:') || img.src.startsWith('blob:'))) {
        if (!currentValues[fieldName] || !currentValues[fieldName].startsWith('data:')) {
          currentValues[fieldName] = img.src;
          console.log('✅ Captured image from preview element for field "' + fieldName + '"');
        }
      }
    });

    // Also check background images from elements
    var allElements = container.querySelectorAll('[data-field]');
    allElements.forEach(function (el) {
      var fieldName = el.getAttribute('data-field');
      if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT') {
        var bgImage = window.getComputedStyle(el).backgroundImage;
        if (bgImage && bgImage !== 'none' && (bgImage.includes('data:') || bgImage.includes('blob:'))) {
          var urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
          if (urlMatch && urlMatch[1] && (urlMatch[1].startsWith('data:') || urlMatch[1].startsWith('blob:'))) {
            if (!currentValues[fieldName] || !currentValues[fieldName].startsWith('data:')) {
              currentValues[fieldName] = urlMatch[1];
              console.log('✅ Captured background image for field "' + fieldName + '"');
            }
          }
        }
      }
    });

    // Merge with templateData to include any programmatically set values
    for (var key in this.templateData) {
      if (!currentValues.hasOwnProperty(key)) {
        currentValues[key] = this.templateData[key];
      } else if (key in this.templateData &&
        this.templateData[key] &&
        this.templateData[key].startsWith('data:')) {
        // Prefer templateData for images (more reliable)
        currentValues[key] = this.templateData[key];
      }
    }

    // Validate against manifest if available
    if (expectedFields.length > 0) {
      var missingFields = expectedFields.filter(function (field) {
        return !currentValues.hasOwnProperty(field);
      });
      if (missingFields.length > 0) {
        console.warn('⚠️ Missing values for ' + missingFields.length + ' expected field(s):', missingFields);
      }

      var extraFields = Object.keys(currentValues).filter(function (field) {
        return !expectedFields.includes(field);
      });
      if (extraFields.length > 0) {
        console.log('ℹ️ Found ' + extraFields.length + ' extra field(s) not in manifest:', extraFields);
      }
    }

    console.log('✅ Captured ' + Object.keys(currentValues).length + ' field value(s):', Object.keys(currentValues));
    return currentValues;
  },

  /**
   * Get selected languages
   */
  getSelectedLanguages: function () {
    var checkboxes = document.querySelectorAll('.language-checkbox input[type="checkbox"]:checked');
    var languages = [];
    checkboxes.forEach(function (cb) {
      // Skip the "Select All" checkbox
      if (cb.id !== 'selectAllLanguages' && cb.value) {
        languages.push(cb.value);
      }
    });
    return languages;
  },

  /**
   * Select or deselect all languages
   */
  toggleSelectAllLanguages: function (selectAll) {
    var checkboxes = document.querySelectorAll('.language-checkbox input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
      // Skip the "Select All" checkbox itself
      if (cb.id !== 'selectAllLanguages') {
        cb.checked = selectAll;
      }
    });
    this.updateLanguageDropdownText();
  },

  /**
   * Update language dropdown text
   */
  updateLanguageDropdownText: function () {
    var selected = this.getSelectedLanguages();
    var text = document.getElementById('languageDropdownText');
    if (text) {
      if (selected.length === 0) {
        text.textContent = 'Select Languages (0 selected)';
      } else if (selected.length === 1) {
        text.textContent = '1 language selected';
      } else {
        text.textContent = selected.length + ' languages selected';
      }
    }
  },

  /**
   * Initialize language dropdown
   */
  initializeLanguageDropdown: function () {
    var dropdown = document.getElementById('languageDropdown');
    var button = document.getElementById('languageDropdownButton');
    var content = document.getElementById('languageDropdownContent');
    var searchInput = document.getElementById('languageSearch');
    var list = document.getElementById('languageDropdownList');

    if (!dropdown || !button || !content || !list) {
      console.log('Language dropdown elements not found, retrying in 200ms...');
      // Retry after a short delay if elements aren't ready
      setTimeout(function () {
        TemplateEngine.initializeLanguageDropdown();
      }, 200);
      return;
    }

    // Prevent duplicate initialization - but allow re-initialization if needed
    if (dropdown.dataset.initialized === 'true') {
      console.log('Language dropdown already initialized, just updating text');
      this.updateLanguageDropdownText();
      // Re-attach checkbox listeners in case they were lost
      var checkboxes = list.querySelectorAll('input[type="checkbox"]');
      var self = this;
      checkboxes.forEach(function (cb) {
        if (!cb.hasAttribute('data-dropdown-listener')) {
          cb.setAttribute('data-dropdown-listener', 'true');
          cb.addEventListener('change', function () {
            self.updateLanguageDropdownText();
          });
        }
      });
      return;
    }

    // Mark as initialized
    dropdown.dataset.initialized = 'true';
    console.log('Initializing language dropdown...');

    // Toggle dropdown
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      if (dropdown.classList.contains('open')) {
        content.style.display = 'flex';
        if (searchInput) searchInput.focus();
      } else {
        content.style.display = 'none';
      }
    });

    // Close dropdown when clicking outside
    var clickOutsideHandler = function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        content.style.display = 'none';
      }
    };
    document.addEventListener('click', clickOutsideHandler);

    // Store handler for cleanup if needed
    dropdown._clickOutsideHandler = clickOutsideHandler;

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        var searchTerm = this.value.toLowerCase();
        var checkboxes = list.querySelectorAll('.language-checkbox');
        checkboxes.forEach(function (checkbox) {
          var selectAllCheckbox = checkbox.querySelector('#selectAllLanguages');
          // Always show "Select All" checkbox
          if (selectAllCheckbox) {
            checkbox.style.display = 'flex';
          } else {
            var label = checkbox.querySelector('label');
            if (label) {
              var text = label.textContent.toLowerCase();
              checkbox.style.display = text.includes(searchTerm) ? 'flex' : 'none';
            }
          }
        });
      });
    }

    // Handle "Select All" checkbox
    var selectAllCheckbox = document.getElementById('selectAllLanguages');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', function () {
        var self = TemplateEngine;
        var selectAll = this.checked;
        self.toggleSelectAllLanguages(selectAll);
      });
    }

    // Update dropdown text when checkboxes change
    var checkboxes = list.querySelectorAll('input[type="checkbox"]');
    var self = this;
    checkboxes.forEach(function (cb) {
      // Check if listener already exists
      if (!cb.hasAttribute('data-dropdown-listener')) {
        cb.setAttribute('data-dropdown-listener', 'true');
        cb.addEventListener('change', function () {
          // Update "Select All" checkbox state
          if (cb.id !== 'selectAllLanguages') {
            var allCheckboxes = list.querySelectorAll('.language-checkbox input[type="checkbox"]:not(#selectAllLanguages)');
            var checkedCount = list.querySelectorAll('.language-checkbox input[type="checkbox"]:not(#selectAllLanguages):checked').length;
            if (selectAllCheckbox) {
              selectAllCheckbox.checked = (checkedCount === allCheckboxes.length);
              selectAllCheckbox.indeterminate = (checkedCount > 0 && checkedCount < allCheckboxes.length);
            }
          }
          self.updateLanguageDropdownText();
        });
      }
    });

    // Initial update
    this.updateLanguageDropdownText();

    // Update "Select All" checkbox initial state
    if (selectAllCheckbox) {
      var allCheckboxes = list.querySelectorAll('.language-checkbox input[type="checkbox"]:not(#selectAllLanguages)');
      var checkedCount = list.querySelectorAll('.language-checkbox input[type="checkbox"]:not(#selectAllLanguages):checked').length;
      selectAllCheckbox.checked = (checkedCount === allCheckboxes.length);
      selectAllCheckbox.indeterminate = (checkedCount > 0 && checkedCount < allCheckboxes.length);
    }

    console.log('Language dropdown initialized successfully');
  },

  /**
   * Update blur preview demo
   * Shows live preview of blur effect
   */
  updateBlurPreview: function (blurIntensity) {
    var previewCanvas = document.getElementById('blurPreviewCanvas');
    if (!previewCanvas || typeof ExportFunctions === 'undefined') {
      return;
    }

    try {
      var ctx = previewCanvas.getContext('2d');
      var previewWidth = 200;
      var previewHeight = 150;

      // Create demo source image (320x480 scaled down for preview)
      var sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = 320;
      sourceCanvas.height = 480;
      var sourceCtx = sourceCanvas.getContext('2d');

      // Draw a colorful demo ad pattern
      // Background gradient
      var bgGradient = sourceCtx.createLinearGradient(0, 0, 320, 480);
      bgGradient.addColorStop(0, '#667eea');
      bgGradient.addColorStop(0.5, '#764ba2');
      bgGradient.addColorStop(1, '#f093fb');
      sourceCtx.fillStyle = bgGradient;
      sourceCtx.fillRect(0, 0, 320, 480);

      // Add some demo content (circles, rectangles, text)
      sourceCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      sourceCtx.fillRect(40, 100, 240, 120);

      sourceCtx.fillStyle = '#667eea';
      sourceCtx.font = 'bold 24px Arial';
      sourceCtx.textAlign = 'center';
      sourceCtx.fillText('DEMO AD', 160, 160);

      sourceCtx.fillStyle = '#764ba2';
      sourceCtx.font = '16px Arial';
      sourceCtx.fillText('Sample Content', 160, 190);

      // Add some decorative elements
      sourceCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      sourceCtx.beginPath();
      sourceCtx.arc(80, 250, 30, 0, Math.PI * 2);
      sourceCtx.fill();

      sourceCtx.beginPath();
      sourceCtx.arc(240, 250, 30, 0, Math.PI * 2);
      sourceCtx.fill();

      sourceCtx.fillStyle = '#fff';
      sourceCtx.fillRect(120, 300, 80, 40);
      sourceCtx.fillStyle = '#667eea';
      sourceCtx.font = 'bold 14px Arial';
      sourceCtx.fillText('BUTTON', 160, 325);

      // Now apply blur effect using ExportFunctions method
      if (ExportFunctions.createBlurredAdBackground) {
        var blurredBg = ExportFunctions.createBlurredAdBackground(sourceCanvas, previewWidth, previewHeight, blurIntensity);

        // Draw blurred background
        ctx.drawImage(blurredBg, 0, 0);

        // Draw centered sharp demo ad on top (maintains 320×480 aspect ratio, no stretching)
        // Math.min ensures ad fits within preview while maintaining exact aspect ratio
        var scale = Math.min(previewWidth / 320, previewHeight / 480);
        var scaledWidth = 320 * scale;  // Maintains 320×480 aspect ratio
        var scaledHeight = 480 * scale; // Maintains 320×480 aspect ratio
        var x = (previewWidth - scaledWidth) / 2;  // Center horizontally
        var y = (previewHeight - scaledHeight) / 2; // Center vertically

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // Draw ad - maintains original aspect ratio, never stretched
        ctx.drawImage(sourceCanvas, x, y, scaledWidth, scaledHeight);
      } else {
        // Fallback: simple preview
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, previewWidth, previewHeight);
        ctx.fillStyle = '#999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Preview Loading...', previewWidth / 2, previewHeight / 2);
      }
    } catch (error) {
      console.error('Error updating blur preview:', error);
      var ctx = previewCanvas.getContext('2d');
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
      ctx.fillStyle = '#999';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Preview Error', previewCanvas.width / 2, previewCanvas.height / 2);
    }
  },

  /**
   * Download ZIP file
   */
  downloadZip: function () {
    if (typeof ExportFunctions !== 'undefined') {
      ExportFunctions.downloadZip();
    }
  },

  /**
   * Download images
   */
  downloadImages: function () {
    if (typeof ExportFunctions !== 'undefined') {
      ExportFunctions.downloadImages();
    }
  },

  /**
   * Download video
   */
  downloadVideo: function () {
    if (typeof ExportFunctions !== 'undefined') {
      ExportFunctions.downloadVideo();
    }
  }
};

