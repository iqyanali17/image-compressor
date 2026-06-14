from services.compression_service import compress_image
from repositories.image_repo import save_compression_record, get_user_history
from utils.file_helper import get_file_size, calculate_compression_percentage
import os


def _format_file_size(size_bytes):
    if size_bytes < 1024:
        return f"{size_bytes} B"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.2f} MB"


def process_and_compress(
    user_id,
    filepath,
    original_filename,
    format=None,
    level=None,
    custom_quality=None,
    width=None,
    height=None,
    maintain_aspect_ratio=True,
    analysis_data=None
):
    # Compression uses user-selected settings. AI analysis is only performed
    # through the separate /analyze endpoint when explicitly requested.
    final_format = format or "webp"
    final_quality = custom_quality
    final_level = level or "medium"

    # 2. Compress the image (friendly filename generated inside)
    original_size = get_file_size(filepath)
    (
        output_path,
        compressed_filename,
        clean_original_filename,
        original_width,
        original_height,
        compressed_width,
        compressed_height
    ) = compress_image(
        filepath=filepath,
        original_filename=original_filename,
        format=final_format,
        level=final_level,
        custom_quality=final_quality,
        width=width,
        height=height,
        maintain_aspect_ratio=maintain_aspect_ratio
    )

    if not output_path:
        return None, "Failed to compress image"

    compressed_size = get_file_size(output_path)
    percentage = calculate_compression_percentage(original_size, compressed_size)

    # 3. Save to History
    history_id = save_compression_record(
        user_id=user_id,
        original_filename=clean_original_filename,
        compressed_filename=compressed_filename,
        original_size=original_size,
        compressed_size=compressed_size,
        percentage=percentage,
        analysis_data=analysis_data,
        output_format=final_format,
        original_width=original_width,
        original_height=original_height,
        compressed_width=compressed_width,
        compressed_height=compressed_height
    )

    return {
        "history_id": history_id,
        "original_filename": clean_original_filename,
        "compressed_filename": compressed_filename,
        "original_size": original_size,
        "compressed_size": compressed_size,
        "savings_percentage": percentage,
        "original_width": original_width,
        "original_height": original_height,
        "compressed_width": compressed_width,
        "compressed_height": compressed_height,
        "originalWidth": original_width,
        "originalHeight": original_height,
        "compressedWidth": compressed_width,
        "compressedHeight": compressed_height,
        "originalSize": _format_file_size(original_size),
        "compressedSize": _format_file_size(compressed_size),
        "savedPercentage": percentage,
        "analysis": analysis_data
    }, None


def fetch_history(user_id):
    return get_user_history(user_id)
