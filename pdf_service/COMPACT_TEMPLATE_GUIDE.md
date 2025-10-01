# Compact Bengali Question Paper Template

## Overview

This template is specifically designed for generating compact Bengali exam question papers that can fit **60 questions in 2 A4 pages** using WeasyPrint. It features:

- **Bengali numbering**: ১, ২, ৩, ৪, ৫, ৬, ৭, ৮, ৯, ১০...
- **English option labels**: A, B, C, D with circular bubbles
- **Professional layout**: Two-column design for maximum space efficiency
- **Optimized fonts**: Noto Sans Bengali and Hind Siliguri for proper Bengali text rendering

## Template Features

### 🎯 **Space Optimization**
- **Margins**: 0.5" top, 0.4" sides and bottom
- **Font size**: 9pt for body text, 8pt for options
- **Line height**: 1.25 for optimal readability
- **Question spacing**: Minimal padding for maximum density

### 🔤 **Font Support**
- **Primary**: Noto Sans Bengali (Google Fonts)
- **Fallback**: Hind Siliguri
- **English text**: Arial for option labels and numbers
- **Automatic font loading**: Via Google Fonts CDN

### 📝 **Question Layout**
- **Two-column design**: 30 questions per column
- **Bengali numbering**: Automatic conversion (1 → ১, 2 → ২, etc.)
- **Circular option bubbles**: Professional A, B, C, D labels
- **Compact spacing**: Optimized for 60 questions in 2 pages

### 🎨 **Visual Design**
- **Clean borders**: Subtle question separation
- **Professional styling**: Consistent with academic standards
- **Print optimization**: Enhanced for PDF generation
- **Color scheme**: Black text on white background

## Usage

### 1. **Basic Usage**

```python
from services.template_engine import TemplateEngine

template_engine = TemplateEngine()
html_content = await template_engine.render_question_paper_template(
    exam=exam,
    exam_set=exam_set,
    template_type="compact_bengali",
    customization=customization
)
```

### 2. **Template Type**

Use `template_type="compact_bengali"` to activate this template.

### 3. **Customization Options**

```python
customization = PaperCustomization(
    paper_size="A4",
    orientation="portrait",
    font_size="9pt",  # XSMALL for maximum compactness
    margin_type="narrow",
    show_answer_spaces=True,
    header_options=HeaderOptions(
        show_title=True,
        show_class=True,
        show_date=True,
        show_duration=True,
        show_marks=True,
        show_instructions=True,
        organization_name="শিক্ষা বোর্ড"
    ),
    footer_options=FooterOptions(
        show_page_numbers=True,
        show_instructions=True
    )
)
```

## File Structure

```
pdf_service/
├── templates/
│   └── compact_bengali_question_paper.html  # Main template
├── static/
│   └── compact_bengali.css                  # WeasyPrint CSS
├── test_compact_pdf.py                      # Test script
└── COMPACT_TEMPLATE_GUIDE.md               # This guide
```

## Template Components

### 1. **Header Section**
- Organization name (Bengali)
- Exam title (Bengali)
- Class, date, duration, marks (Bengali)
- Set name (Bengali)

### 2. **Instructions Section**
- General instructions in Bengali
- Compact, bullet-point format
- Optional custom instructions

### 3. **Questions Section**
- **Two-column layout**: 30 questions per column
- **Bengali numbering**: ১, ২, ৩, ৪, ৫, ৬, ৭, ৮, ৯, ১০...
- **Question text**: Bengali with proper font rendering
- **MCQ options**: A, B, C, D with circular bubbles
- **Answer spaces**: Minimal, inline design

### 4. **Footer Section**
- Page numbers in Bengali
- Optional custom text
- Minimal design

## CSS Classes

### **Bengali Text**
```css
.bengali-text     /* Bengali text styling */
.bengali-number   /* Bengali number styling */
```

### **English Text**
```css
.english-text     /* English text styling */
```

### **Layout**
```css
.questions-container  /* Two-column container */
.question-column     /* Individual column */
.question           /* Individual question */
.option             /* MCQ option */
.option-key         /* A, B, C, D bubble */
.option-text        /* Option text */
```

## Bengali Number Conversion

The template automatically converts numbers to Bengali digits:

| English | Bengali |
|---------|---------|
| 1       | ১       |
| 2       | ২       |
| 3       | ৩       |
| 4       | ৪       |
| 5       | ৫       |
| 6       | ৬       |
| 7       | ৭       |
| 8       | ৮       |
| 9       | ৯       |
| 10      | ১০      |

## Testing

### **Test Script**
```bash
cd /home/rayhan/Documents/exam-portal/pdf_service
source venv/bin/activate
python test_compact_pdf.py
```

### **Generated Files**
- `test_compact_bengali_60q.pdf` - PDF with 60 questions
- `test_compact_bengali_60q.html` - HTML template preview

## Performance

### **File Sizes**
- **PDF**: ~70KB for 60 questions
- **HTML**: ~115KB for 60 questions

### **Page Count**
- **60 questions**: 2 A4 pages
- **30 questions per page**: Optimal density
- **Print-ready**: Professional quality

## Browser Compatibility

### **WeasyPrint Support**
- ✅ Full Bengali font support
- ✅ Circular option bubbles
- ✅ Two-column layout
- ✅ Print optimization

### **Web Browser Support**
- ✅ Google Fonts loading
- ✅ CSS Grid/Flexbox
- ✅ Print media queries
- ✅ Bengali text rendering

## Customization

### **Font Size Options**
- `9pt` - XSMALL (maximum compactness)
- `10pt` - SMALL
- `11pt` - MEDIUM
- `12pt` - LARGE

### **Margin Options**
- `narrow` - 0.4" margins (recommended)
- `normal` - 1" margins
- `wide` - 1.5" margins

### **Paper Sizes**
- `A4` - Standard (recommended)
- `A3` - Larger format
- `Legal` - US legal size
- `Letter` - US letter size

## Troubleshooting

### **Font Issues**
1. Ensure Google Fonts are accessible
2. Check WeasyPrint installation
3. Verify Bengali font support

### **Layout Issues**
1. Check margin settings
2. Verify font size compatibility
3. Test with different question counts

### **Print Issues**
1. Use WeasyPrint for PDF generation
2. Check print media queries
3. Verify page break settings

## Best Practices

### **Question Writing**
- Keep questions concise
- Use clear Bengali text
- Limit option text length
- Maintain consistent formatting

### **Template Usage**
- Use `compact_bengali` template type
- Set font size to `9pt` for maximum density
- Use narrow margins for space efficiency
- Test with actual question data

### **PDF Generation**
- Use WeasyPrint for best results
- Enable print color adjustment
- Test with different browsers
- Verify Bengali text rendering

## Support

For issues or questions:
1. Check the test script output
2. Verify template syntax
3. Test with sample data
4. Review WeasyPrint logs

---

**Template Version**: 1.0.0  
**Last Updated**: September 2025  
**Compatibility**: WeasyPrint 60+, Python 3.11+
