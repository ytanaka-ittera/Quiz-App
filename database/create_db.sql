IF NOT EXISTS (
    SELECT name FROM master.dbo.sysdatabases WHERE name = 'quiz_db'
)
BEGIN
    CREATE DATABASE quiz_db;
    PRINT '�f�[�^�x�[�X quiz_db ���쐬���܂����B';
END
ELSE
BEGIN
    PRINT '�f�[�^�x�[�X quiz_db �͂��łɑ��݂��܂��B';
END
