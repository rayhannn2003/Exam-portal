#!/bin/bash

# Font Installation Script for Bengali PDF Generation
# This script installs SolaimanLipi and other Bengali fonts

echo "🔤 Installing Bengali fonts for PDF generation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This is not recommended for font installation."
fi

# Create fonts directory
FONTS_DIR="$HOME/.fonts"
if [ ! -d "$FONTS_DIR" ]; then
    mkdir -p "$FONTS_DIR"
    print_status "Created fonts directory: $FONTS_DIR"
fi

# Function to download and install font
install_font() {
    local font_name="$1"
    local font_url="$2"
    local font_file="$3"
    
    print_status "Installing $font_name..."
    
    # Download font
    if wget -q "$font_url" -O "/tmp/$font_file"; then
        print_status "Downloaded $font_name"
        
        # Copy to fonts directory
        cp "/tmp/$font_file" "$FONTS_DIR/"
        print_status "Installed $font_name to $FONTS_DIR"
        
        # Clean up
        rm "/tmp/$font_file"
    else
        print_error "Failed to download $font_name"
        return 1
    fi
}

print_header "Installing Bengali Fonts"

# Install SolaimanLipi font
install_font "SolaimanLipi" \
    "https://github.com/ekushey/SolaimanLipi/raw/master/SolaimanLipi.ttf" \
    "SolaimanLipi.ttf"

# Install Noto Sans Bengali font
install_font "Noto Sans Bengali" \
    "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf" \
    "NotoSansBengali-Regular.ttf"

# Install Kalpurush font
install_font "Kalpurush" \
    "https://github.com/ekushey/Kalpurush/raw/master/Kalpurush.ttf" \
    "Kalpurush.ttf"

# Update font cache
print_status "Updating font cache..."
if command -v fc-cache &> /dev/null; then
    fc-cache -fv "$FONTS_DIR"
    print_status "Font cache updated"
else
    print_warning "fc-cache not found. You may need to restart your system for fonts to be available."
fi

# Verify font installation
print_status "Verifying font installation..."
if fc-list | grep -i "solaimanlipi" > /dev/null; then
    print_status "✅ SolaimanLipi font is available"
else
    print_warning "⚠️ SolaimanLipi font not found in system"
fi

if fc-list | grep -i "noto.*bengali" > /dev/null; then
    print_status "✅ Noto Sans Bengali font is available"
else
    print_warning "⚠️ Noto Sans Bengali font not found in system"
fi

print_header "Font Installation Complete"

print_status "Fonts have been installed to: $FONTS_DIR"
print_status "You may need to restart your PDF service for the fonts to be available."
print_status "To test the fonts, run: python test_font_pdf.py"

echo ""
print_status "Available Bengali fonts:"
fc-list | grep -i -E "(solaiman|noto.*bengali|kalpurush)" | head -5
