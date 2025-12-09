/**
 * Template Scanner & Manifest System
 * Automatically scans templates and creates/manages manifest file
 * Combines auto-scan (Option 3) with manifest (Option 1) for best of both worlds
 */

var TemplateScanner = {
  manifest: null,
  manifestPath: 'templates/manifest.json',
  
  /**
   * Initialize scanner - load or create manifest
   */
  init: async function() {
    try {
      // Try to load existing manifest
      var response = await fetch(this.manifestPath);
      if (response.ok) {
        this.manifest = await response.json();
        console.log('✅ Loaded template manifest:', Object.keys(this.manifest.templates || {}).length + ' templates');
        return true;
      }
    } catch (e) {
      console.log('📝 No manifest found, will create one automatically');
    }
    
    // Create empty manifest structure
    this.manifest = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      templates: {}
    };
    
    return false;
  },
  
  /**
   * Scan a template file and extract all data-field information
   * Returns field metadata for the template
   */
  scanTemplate: async function(templateName) {
    try {
      var response = await fetch('templates/' + templateName + '.html');
      if (!response.ok) {
        console.warn('⚠️ Could not scan template:', templateName);
        return null;
      }
      
      var html = await response.text();
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      
      var fields = {
        text: [],
        color: [],
        number: [],
        file: [],
        select: [],
        textarea: []
      };
      
      var allFields = new Set();
      var fieldTypes = {};
      var previewElements = [];
      var inputElements = [];
      
      // Find all elements with data-field attributes
      var allDataFields = doc.querySelectorAll('[data-field]');
      
      allDataFields.forEach(function(el) {
        var fieldName = el.getAttribute('data-field');
        if (!fieldName) return;
        
        allFields.add(fieldName);
        
        // Determine field type
        if (el.tagName === 'INPUT') {
          inputElements.push(fieldName);
          var inputType = el.type || 'text';
          
          if (inputType === 'color') {
            fields.color.push(fieldName);
            fieldTypes[fieldName] = 'color';
          } else if (inputType === 'number' || inputType === 'range') {
            fields.number.push(fieldName);
            fieldTypes[fieldName] = 'number';
          } else if (inputType === 'file') {
            fields.file.push(fieldName);
            fieldTypes[fieldName] = 'file';
          } else {
            fields.text.push(fieldName);
            fieldTypes[fieldName] = 'text';
          }
        } else if (el.tagName === 'TEXTAREA') {
          inputElements.push(fieldName);
          fields.textarea.push(fieldName);
          fieldTypes[fieldName] = 'textarea';
        } else if (el.tagName === 'SELECT') {
          inputElements.push(fieldName);
          fields.select.push(fieldName);
          fieldTypes[fieldName] = 'select';
        } else {
          // Preview element
          previewElements.push(fieldName);
        }
      });
      
      // Validate: Check if every input has a matching preview element
      var validation = {
        valid: true,
        errors: [],
        warnings: [],
        missingPreview: [],
        missingInput: []
      };
      
      inputElements.forEach(function(fieldName) {
        if (!previewElements.includes(fieldName)) {
          validation.missingPreview.push(fieldName);
          validation.warnings.push('Input field "' + fieldName + '" has no matching preview element');
        }
      });
      
      previewElements.forEach(function(fieldName) {
        if (!inputElements.includes(fieldName)) {
          // This is OK - preview-only elements are fine (like containers)
          // But log it for reference
          if (!fieldName.includes('Bg') && !fieldName.includes('Width') && !fieldName.includes('Height')) {
            validation.warnings.push('Preview element "' + fieldName + '" has no matching input (might be container)');
          }
        }
      });
      
      if (validation.missingPreview.length > 0) {
        validation.valid = false;
        validation.errors.push('Missing preview elements for ' + validation.missingPreview.length + ' input field(s)');
      }
      
      // Check for required structure
      var hasPreviewPanel = doc.querySelector('.preview-panel') !== null;
      var hasInputPanel = doc.querySelector('.input-panel') !== null;
      
      if (!hasPreviewPanel) {
        validation.valid = false;
        validation.errors.push('Missing .preview-panel element');
      }
      
      if (!hasInputPanel) {
        validation.warnings.push('Missing .input-panel element (might be OK if using shared panel)');
      }
      
      var result = {
        templateName: templateName,
        fields: Array.from(allFields).sort(),
        fieldTypes: fieldTypes,
        fieldCategories: fields,
        inputCount: inputElements.length,
        previewCount: previewElements.length,
        validation: validation,
        hasPreviewPanel: hasPreviewPanel,
        hasInputPanel: hasInputPanel,
        scannedAt: new Date().toISOString()
      };
      
      console.log('📊 Scanned template "' + templateName + '":', result.fields.length + ' fields, ' + 
                  (validation.valid ? '✅ Valid' : '❌ Invalid'));
      
      if (validation.errors.length > 0) {
        console.error('❌ Validation errors:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Validation warnings:', validation.warnings);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error scanning template "' + templateName + '":', error);
      return null;
    }
  },
  
  /**
   * Scan all templates and update manifest
   */
  scanAllTemplates: async function(templateList) {
    console.log('🔍 Scanning all templates...');
    
    var scannedTemplates = {};
    var scanPromises = [];
    
    templateList.forEach(function(templateName) {
      var promise = TemplateScanner.scanTemplate(templateName).then(function(result) {
        if (result) {
          scannedTemplates[templateName] = result;
        }
        return result;
      });
      scanPromises.push(promise);
    });
    
    await Promise.all(scanPromises);
    
    // Update manifest
    this.manifest.templates = scannedTemplates;
    this.manifest.lastUpdated = new Date().toISOString();
    this.manifest.totalTemplates = Object.keys(scannedTemplates).length;
    
    console.log('✅ Scan complete! Scanned ' + Object.keys(scannedTemplates).length + ' template(s)');
    
    return scannedTemplates;
  },
  
  /**
   * Get manifest data
   */
  getManifest: function() {
    return this.manifest;
  },
  
  /**
   * Get template metadata
   */
  getTemplateMetadata: function(templateName) {
    if (this.manifest && this.manifest.templates && this.manifest.templates[templateName]) {
      return this.manifest.templates[templateName];
    }
    return null;
  },
  
  /**
   * Validate template before export
   */
  validateTemplateForExport: function(templateName) {
    var metadata = this.getTemplateMetadata(templateName);
    if (!metadata) {
      return {
        valid: false,
        error: 'Template not found in manifest. Please scan templates first.'
      };
    }
    
    return metadata.validation;
  },
  
  /**
   * Get all fields for a template
   */
  getAllFields: function(templateName) {
    var metadata = this.getTemplateMetadata(templateName);
    if (metadata) {
      return metadata.fields || [];
    }
    return [];
  },
  
  /**
   * Check if field exists in template
   */
  hasField: function(templateName, fieldName) {
    var fields = this.getAllFields(templateName);
    return fields.includes(fieldName);
  },
  
  /**
   * Get field type
   */
  getFieldType: function(templateName, fieldName) {
    var metadata = this.getTemplateMetadata(templateName);
    if (metadata && metadata.fieldTypes) {
      return metadata.fieldTypes[fieldName] || 'unknown';
    }
    return 'unknown';
  }
};

