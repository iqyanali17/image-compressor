import mysql.connector
from mysql.connector import Error
import sys
import os

# Add parent directory to path so we can import Config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

def run_migrations():
    try:
        # Connect without specific database to create it if it doesn't exist
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        cursor = connection.cursor()
        
        print(f"Ensuring database '{Config.DB_NAME}' exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.DB_NAME}")
        cursor.execute(f"USE {Config.DB_NAME}")
        
        print("Ensuring 'image_history' table exists...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS image_history (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id VARCHAR(255) NOT NULL,
                original_filename VARCHAR(255) NOT NULL,
                compressed_filename VARCHAR(255) NOT NULL,
                original_size BIGINT,
                compressed_size BIGINT,
                compression_percentage FLOAT,
                image_type VARCHAR(100),
                recommended_quality INT,
                recommended_format VARCHAR(20),
                output_format VARCHAR(20),
                original_width INT,
                original_height INT,
                compressed_width INT,
                compressed_height INT,
                download_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        dimension_columns = {
            "original_width": "INT",
            "original_height": "INT",
            "compressed_width": "INT",
            "compressed_height": "INT"
        }
        for column_name, column_type in dimension_columns.items():
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = %s
                  AND TABLE_NAME = 'image_history'
                  AND COLUMN_NAME = %s
            """, (Config.DB_NAME, column_name))
            if cursor.fetchone()[0] == 0:
                cursor.execute(
                    f"ALTER TABLE image_history ADD COLUMN {column_name} {column_type}"
                )
        
        connection.commit()
        print("Migrations executed successfully!")
        
    except Error as e:
        print(f"Error during migration: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    run_migrations()
