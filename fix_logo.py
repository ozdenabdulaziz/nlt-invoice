import sys
from PIL import Image

def remove_checkerboard(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    # We want to keep dark colors (text/logo).
    # The checkerboard is white/gray.
    for item in data:
        r, g, b, a = item
        # Calculate perceived brightness
        brightness = (r * 299 + g * 587 + b * 114) / 1000
        
        # If the pixel is dark, it's the logo. Keep it.
        # Otherwise, make it completely transparent.
        if brightness < 150:
            new_data.append((r, g, b, 255))
        else:
            new_data.append((255, 255, 255, 0))
            
    img.putdata(new_data)
    
    # Let's also crop it to its bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")

remove_checkerboard("apps/web/public/logo.png", "apps/web/public/logo_transparent.png")
