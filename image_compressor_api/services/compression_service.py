from PIL import Image
import os
from werkzeug.utils import secure_filename
from config import Config

MAX_RESIZE_DIMENSION = 20000
MAX_RESIZE_PIXELS = 100_000_000


def _generate_compressed_filename(base_name: str, ext: str, output_folder: str) -> str:
    """
    Generate a friendly compressed filename, avoiding filesystem collisions.
    Pattern: {base_name}_compressed.{ext}
    Increments to {base_name}_compressed(1).{ext}, (2).{ext}, etc. if the file exists.
    """
    candidate = f"{base_name}_compressed.{ext}"
    output_path = os.path.join(output_folder, candidate)

    if not os.path.exists(output_path):
        return candidate

    counter = 1
    while True:
        candidate = f"{base_name}_compressed({counter}).{ext}"
        output_path = os.path.join(output_folder, candidate)
        if not os.path.exists(output_path):
            return candidate
        counter += 1


def _calculate_resize_dimensions(
    original_width: int,
    original_height: int,
    width: int = None,
    height: int = None,
    maintain_aspect_ratio: bool = True
):
    if width is None and height is None:
        return original_width, original_height

    if width is not None and (width < 1 or width > MAX_RESIZE_DIMENSION):
        raise ValueError(f"Width must be between 1 and {MAX_RESIZE_DIMENSION} pixels")
    if height is not None and (height < 1 or height > MAX_RESIZE_DIMENSION):
        raise ValueError(f"Height must be between 1 and {MAX_RESIZE_DIMENSION} pixels")

    if maintain_aspect_ratio:
        aspect_ratio = original_width / original_height
        if width is not None:
            target_width = width
            target_height = max(1, round(width / aspect_ratio))
        else:
            target_height = height
            target_width = max(1, round(height * aspect_ratio))
    else:
        target_width = width if width is not None else original_width
        target_height = height if height is not None else original_height

    if target_width * target_height > MAX_RESIZE_PIXELS:
        raise ValueError("Requested resolution exceeds the 100 megapixel limit")

    return target_width, target_height


def compress_image(
    filepath: str,
    original_filename: str,
    format: str = "webp",
    level: str = "medium",
    custom_quality: int = None,
    width: int = None,
    height: int = None,
    maintain_aspect_ratio: bool = True
):
    """
    Compresses image using Pillow.
    Levels: low (90), medium (75), high (50).
    Formats: jpg/jpeg, png, webp.

    Returns:
        (output_path, compressed_filename, original_filename_clean,
         original_width, original_height, compressed_width, compressed_height)
        or (None, None, None) on error.
    """
    quality_map = {
        "low": 90,
        "medium": 75,
        "high": 50
    }

    quality = custom_quality if custom_quality else quality_map.get(level.lower(), 75)
    format = format.lower()
    if format == 'jpg':
        format = 'jpeg'

    # Sanitize and extract the base name from the original uploaded filename
    safe_name = secure_filename(original_filename)
    if '.' in safe_name:
        base_name = safe_name.rsplit('.', 1)[0]
    else:
        base_name = safe_name

    # Determine the output extension
    output_ext = 'jpg' if format == 'jpeg' else format

    output_folder = Config.COMPRESSED_FOLDER
    os.makedirs(output_folder, exist_ok=True)

    # Generate a collision-free friendly filename
    compressed_filename = _generate_compressed_filename(base_name, output_ext, output_folder)
    output_path = os.path.join(output_folder, compressed_filename)

    try:
        with Image.open(filepath) as img:
            original_width, original_height = img.size
            target_width, target_height = _calculate_resize_dimensions(
                original_width,
                original_height,
                width,
                height,
                maintain_aspect_ratio
            )

            if (target_width, target_height) != img.size:
                img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)

            # Convert RGBA/LA to RGB for JPEG
            if format == 'jpeg' and img.mode in ('RGBA', 'LA'):
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background

            if format == 'png':
                img.save(output_path, format='PNG', optimize=True)
            else:
                img.save(output_path, format=format.upper(), quality=quality, optimize=True)

        return (
            output_path,
            compressed_filename,
            safe_name,
            original_width,
            original_height,
            target_width,
            target_height
        )

    except Exception as e:
        print(f"Compression error: {e}")
        return None, None, None, None, None, None, None
