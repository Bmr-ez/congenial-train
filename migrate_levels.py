
import os
from database import db_manager

def migrate_levels(target_guild_id):
    try:
        with db_manager.get_connection() as conn:
            with db_manager.get_cursor(conn) as cursor:
                # 1. Update all guild_id=0 to the target guild ID
                # We use COALESCE or distinct checks to avoid primary key conflicts if some users already started in the new guild
                print(f"Migrating levels with guild_id=0 to {target_guild_id}...")
                
                # First, find conflicts (users who have both 0 and target_id)
                cursor.execute("SELECT user_id FROM user_levels WHERE guild_id = %s" if db_manager.is_postgres else "SELECT user_id FROM user_levels WHERE guild_id = ?", (target_guild_id,))
                existing_users = {row[0] for row in cursor.fetchall()}
                
                cursor.execute("SELECT user_id, xp, level FROM user_levels WHERE guild_id = 0")
                legacy_rows = cursor.fetchall()
                
                for uid, xp, level in legacy_rows:
                    if uid in existing_users:
                        # Update existing row with higher values
                        update_query = "UPDATE user_levels SET xp = GREATEST(xp, %s), level = GREATEST(level, %s) WHERE guild_id = %s AND user_id = %s" if db_manager.is_postgres else "UPDATE user_levels SET xp = MAX(xp, ?), level = MAX(level, ?) WHERE guild_id = ? AND user_id = ?"
                        cursor.execute(update_query, (xp, level, target_guild_id, uid))
                    else:
                        # Insert new row
                        insert_query = "INSERT INTO user_levels (guild_id, user_id, xp, level) VALUES (%s, %s, %s, %s)" if db_manager.is_postgres else "INSERT INTO user_levels (guild_id, user_id, xp, level) VALUES (?, ?, ?, ?)"
                        cursor.execute(insert_query, (target_guild_id, uid, xp, level))
                
                # Delete the legacy rows
                cursor.execute("DELETE FROM user_levels WHERE guild_id = 0")
                
                conn.commit()
                print("Migration complete.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # The guild ID we found in settings
    MIGRATE_TO = 887601856505868348
    migrate_levels(MIGRATE_TO)
