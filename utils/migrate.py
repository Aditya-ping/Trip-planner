import os
import glob
import sqlite3

def run_migrations(db_path="database.db", migrations_dir="migrations"):
    """
    Applies all unapplied SQL migration files in migrations_dir to db_path.
    Tracks applied migrations in the schema_version table.
    Backward compatible with existing databases and columns.
    """
    if not os.path.exists(migrations_dir):
        os.makedirs(migrations_dir, exist_ok=True)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Ensure schema_version tracking table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()

    # 2. Retrieve already applied versions
    cursor.execute("SELECT version FROM schema_version")
    applied_versions = {row[0] for row in cursor.fetchall()}

    # 3. Find and sort all .sql migration files
    sql_files = sorted(glob.glob(os.path.join(migrations_dir, "*.sql")))

    for filepath in sql_files:
        filename = os.path.basename(filepath)
        try:
            version_num = int(filename.split("_")[0])
        except ValueError:
            continue

        if version_num in applied_versions:
            continue

        print(f"[Migration Runner] Applying {filename} (Version {version_num})...")

        with open(filepath, "r", encoding="utf-8") as f:
            sql_script = f.read()

        # Execute statements individually to handle backward compatibility gracefully
        statements = [s.strip() for s in sql_script.split(";") if s.strip()]
        for stmt in statements:
            try:
                cursor.execute(stmt)
            except sqlite3.OperationalError as err:
                err_msg = str(err).lower()
                # Ignore duplicate column/table/index errors when retrofitting an existing db
                if "duplicate column" in err_msg or "already exists" in err_msg:
                    pass
                else:
                    print(f"[Migration Warning] Statement failed: {stmt} -> {err}")
                    raise err

        # Record migration as applied
        cursor.execute("INSERT INTO schema_version (version) VALUES (?)", (version_num,))
        conn.commit()

    conn.close()

if __name__ == "__main__":
    run_migrations()
