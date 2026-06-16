import mysql.connector
from mysql.connector import Error
from config import Config

def get_db_connection():
    try:
        connect_args = dict(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
        )

        # Aiven (and most managed MySQL services) require SSL.
        # Set DB_SSL=true in your Render environment to enable it.
        if Config.DB_SSL:
            connect_args["ssl_disabled"] = False
            # If a CA cert path is provided, verify the server certificate.
            if Config.DB_SSL_CA:
                connect_args["ssl_ca"] = Config.DB_SSL_CA

        connection = mysql.connector.connect(**connect_args)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None
