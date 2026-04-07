import sys
from PIL import Image

def build_favicon():
    img = Image.open("apps/web/public/logo.png")
    width, height = img.size
    px = img.load()

    left, top, right, bottom = img.getbbox()

    empty_cols = []
    for x in range(left, right):
        is_empty = True
        for y in range(top, bottom):
            if px[x, y][3] > 10:
                is_empty = False
                break
        if is_empty:
            empty_cols.append(x)

    gaps = []
    current_gap = []
    for col in empty_cols:
        if not current_gap or col == current_gap[-1] + 1:
            current_gap.append(col)
        else:
            gaps.append(current_gap)
            current_gap = [col]
    if current_gap:
        gaps.append(current_gap)

    n_right = right
    for gap in gaps:
        if len(gap) > 0 and gap[0] > left + 20: 
            n_right = gap[0]
            break

    empty_rows = []
    for y in range(top, bottom):
        is_empty = True
        for x in range(left, right):
            if px[x, y][3] > 10:
                is_empty = False
                break
        if is_empty:
            empty_rows.append(y)

    row_gaps = []
    current_gap = []
    for row in empty_rows:
        if not current_gap or row == current_gap[-1] + 1:
            current_gap.append(row)
        else:
            row_gaps.append(current_gap)
            current_gap = [row]
    if current_gap:
        row_gaps.append(current_gap)

    n_bottom = bottom
    for gap in row_gaps:
        if len(gap) > 0 and gap[0] > top + 20:
            n_bottom = gap[0]
            break

    # To be extremely safe, we might have accidentally cut inside the N if it's not contiguous.
    # The 'N' with a diagonal slice MIGHT have a transparent line passing all the way through diagonally!
    # Wait, a diagonal slice does NOT produce an empty vertical column. An empty column x must be empty for ALL y.
    # So a diagonal slice is totally fine.

    n_left, n_top, n_right, n_bottom = left, top, n_right, n_bottom

    n_img = img.crop((n_left, n_top, n_right, n_bottom))

    # Refine the crop of the extracted component to its actual bbox
    crop_bbox = n_img.getbbox()
    if crop_bbox:
        n_img = n_img.crop(crop_bbox)

    n_width, n_height = n_img.size
    max_dim = max(n_width, n_height)
    
    target_scale = 435.0 / max_dim
    new_size = (int(n_width * target_scale), int(n_height * target_scale))
    n_img_scaled = n_img.resize(new_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0)) 

    paste_x = (512 - new_size[0]) // 2
    paste_y = (512 - new_size[1]) // 2
    canvas.paste(n_img_scaled, (paste_x, paste_y))

    canvas.save("apps/web/app/icon.png")
    canvas.save("apps/web/public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    canvas.save("apps/web/public/apple-icon.png")
    print("SUCCESS")

build_favicon()
