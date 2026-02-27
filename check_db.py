
import os
import psycopg2
from database import db_manager

def check_guilds():
    try:
        with db_manager.get_connection() as conn:
            with db_manager.get_cursor(conn) as cursor:
                cursor.execute("SELECT guild_id FROM guild_settings LIMIT 5")
                rows = cursor.fetchall()
                print(f"Guild Settings IDs: {rows}")
                
                cursor.execute("SELECT DISTINCT guild_id FROM user_levels")
                rows = cursor.fetchall()
                print(f"Distinct User Level Guild IDs: {rows}")
                
                cursor.execute("SELECT COUNT(*) FROM user_levels WHERE guild_id = 0")
                count = cursor.fetchone()[0]
                print(f"Rows with guild_id=0: {count}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_guilds()
