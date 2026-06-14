from database.db import get_db_connection
from models.image_history import ImageHistory


def save_compression_record(
    user_id,
    original_filename,
    compressed_filename,
    original_size,
    compressed_size,
    percentage,
    analysis_data,
    output_format,
    original_width,
    original_height,
    compressed_width,
    compressed_height
):
    conn = get_db_connection()
    if not conn:
        return None

    try:
        cursor = conn.cursor()

        sql = """
            INSERT INTO image_history (
                user_id,
                original_filename,
                compressed_filename,
                original_size,
                compressed_size,
                compression_percentage,
                image_type,
                recommended_quality,
                recommended_format,
                output_format,
                original_width,
                original_height,
                compressed_width,
                compressed_height,
                download_count
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0)
        """
        cursor.execute(sql, (
            user_id,
            original_filename,
            compressed_filename,
            original_size,
            compressed_size,
            percentage,
            analysis_data.get('type') if analysis_data else None,
            analysis_data.get('recommended_quality') if analysis_data else None,
            analysis_data.get('recommended_format') if analysis_data else None,
            output_format,
            original_width,
            original_height,
            compressed_width,
            compressed_height
        ))

        history_id = cursor.lastrowid
        conn.commit()
        return history_id

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"DB Insert Error: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def get_user_history(user_id):
    conn = get_db_connection()
    if not conn:
        return []

    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT
                id, user_id,
                original_filename, compressed_filename,
                original_size, compressed_size,
                compression_percentage,
                image_type, recommended_quality, recommended_format,
                output_format, download_count,
                original_width, original_height,
                compressed_width, compressed_height,
                created_at
            FROM image_history
            WHERE user_id = %s
            ORDER BY created_at DESC
        """
        cursor.execute(sql, (user_id,))
        rows = cursor.fetchall()

        result = []
        for row in rows:
            history_model = ImageHistory(
                id=row['id'],
                user_id=row['user_id'],
                original_filename=row['original_filename'],
                compressed_filename=row['compressed_filename'],
                original_size=row['original_size'],
                compressed_size=row['compressed_size'],
                compression_percentage=row['compression_percentage'],
                image_type=row['image_type'],
                recommended_quality=row['recommended_quality'],
                recommended_format=row['recommended_format'],
                output_format=row['output_format'],
                download_count=row['download_count'],
                original_width=row['original_width'],
                original_height=row['original_height'],
                compressed_width=row['compressed_width'],
                compressed_height=row['compressed_height'],
                created_at=row['created_at']
            )
            result.append(history_model.to_dict())

        return result

    except Exception as e:
        print(f"DB Select Error: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def increment_download_count(compressed_filename):
    """Increment the download_count for a given compressed_filename."""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        cursor = conn.cursor()
        sql = """
            UPDATE image_history
            SET download_count = download_count + 1
            WHERE compressed_filename = %s
        """
        cursor.execute(sql, (compressed_filename,))
        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        print(f"DB Update Error (download count): {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
