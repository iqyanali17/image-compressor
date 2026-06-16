from flask import Blueprint, request, send_from_directory, jsonify
from utils.response import success_response, error_response
from utils.file_helper import save_uploaded_file
from middleware.auth_middleware import require_auth
from services.image_service import process_and_compress, fetch_history
from services.analysis_service import analyze_image
from repositories.image_repo import increment_download_count
from config import Config
import os

image_bp = Blueprint('image', __name__)


def _parse_optional_dimension(field_name):
    raw_value = request.form.get(field_name)
    if raw_value in (None, ''):
        return None
    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name.capitalize()} must be a whole number")
    if value < 1:
        raise ValueError(f"{field_name.capitalize()} must be greater than zero")
    return value


def _parse_boolean(field_name, default=False):
    raw_value = request.form.get(field_name)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in ('true', '1', 'yes', 'on')


@image_bp.route('/analyze', methods=['POST'])
@require_auth
def analyze():
    if 'image' not in request.files:
        return error_response("No image file provided", 400)

    file = request.files['image']
    if file.filename == '':
        return error_response("No selected file", 400)

    filepath, unique_name = save_uploaded_file(file, Config.UPLOAD_FOLDER)
    if not filepath:
        return error_response("Invalid file type", 400)

    analysis = analyze_image(filepath)

    return success_response(data={
        "file_id": unique_name,
        "analysis": analysis
    }, message="Image analyzed successfully")


@image_bp.route('/compress', methods=['POST'])
@require_auth
def compress():
    user_id = request.user_id

    if 'image' not in request.files:
        return error_response("No image file provided", 400)

    file = request.files['image']

    format = request.form.get('format')
    level = request.form.get('level')
    custom_quality = request.form.get('quality', type=int)
    try:
        width = _parse_optional_dimension('width')
        height = _parse_optional_dimension('height')
    except ValueError as error:
        return error_response(str(error), 400)
    maintain_aspect_ratio = _parse_boolean('maintainAspectRatio', True)
    analysis_type = request.form.get('analysisType')
    analysis_data = None
    if analysis_type:
        analysis_data = {
            "type": analysis_type,
            "recommended_quality": request.form.get('recommendedQuality', type=int),
            "recommended_format": request.form.get('recommendedFormat')
        }

    filepath, _ = save_uploaded_file(file, Config.UPLOAD_FOLDER)
    if not filepath:
        return error_response("Invalid file type", 400)

    result, error = process_and_compress(
        user_id=user_id,
        filepath=filepath,
        original_filename=file.filename,
        format=format,
        level=level,
        custom_quality=custom_quality,
        width=width,
        height=height,
        maintain_aspect_ratio=maintain_aspect_ratio,
        analysis_data=analysis_data
    )

    if error:
        return error_response(error, 400)

    return success_response(data=result, message="Image compressed successfully")


@image_bp.route('/download/<filename>', methods=['GET'])
def download(filename):
    """
    Serve the compressed file as a download with proper Content-Disposition header.
    Increments download_count in the database.
    """
    compressed_folder = os.path.abspath(Config.COMPRESSED_FOLDER)
    file_path = os.path.join(compressed_folder, filename)

    if not os.path.isfile(file_path):
        return error_response("File not found", 404)

    # Increment download count (fire-and-forget; don't block on failure)
    try:
        increment_download_count(filename)
    except Exception as e:
        print(f"Warning: could not increment download count for '{filename}': {e}")

    return send_from_directory(
        compressed_folder,
        filename,
        as_attachment=True,
        download_name=filename  # explicit friendly filename in Content-Disposition
    )


@image_bp.route('/history', methods=['GET'])
@require_auth
def history():
    try:
        user_id = request.user_id
        records = fetch_history(user_id)
        return success_response(data=records, message="History fetched successfully")
    except Exception as e:
        print(f"History route error: {e}")
        return error_response("Failed to fetch history", 500)
