IF NOT EXISTS (
    SELECT name FROM master.dbo.sysdatabases WHERE name = 'quiz_db'
)
BEGIN
    CREATE DATABASE quiz_db;
    PRINT 'データベース quiz_db を作成しました。';
END
ELSE
BEGIN
    PRINT 'データベース quiz_db はすでに存在します。';
END
