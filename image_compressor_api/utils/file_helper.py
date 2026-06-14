import os
from werkzeug.utils import secure_filename
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, upload_folder):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, unique_filename)
        file.save(filepath)
        return filepath, unique_filename
    return None, None

def get_file_size(filepath):
    try:
        return os.path.getsize(filepath)
    except OSError:
        return 0

def calculate_compression_percentage(original_size, compressed_size):
    if original_size == 0:
        return 0
    savings = original_size - compressed_size
    percentage = (savings / original_size) * 100
    return max(0, round(percentage, 2))
