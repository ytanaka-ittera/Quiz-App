@echo off
SETLOCAL

SET SERVER=localhost
SET USER=sa
SET PASSWORD=sa
SET DB_NAME=quiz_db
SET LOG_FILE=%~n0.log

    cls
    echo.
    echo.
    echo.
    echo -------------------------------
    echo    �f�[�^�x�[�X�쐬���� �J�n
    echo -------------------------------
    echo �i%DB_NAME%�j���쐬���܂��B
    echo.
    echo �����𒆎~�������Ƃ��� Ctrl + C �������Ă��������B
PAUSE
    cls
    echo.
    echo.
    echo.
    echo �i%DB_NAME%�j�쐬��

echo %time% >> %LOG_FILE%

sqlcmd -S %SERVER% -d master -U %USER% -P %PASSWORD% -i create_db.sql >> %LOG_FILE%

IF %ERRORLEVEL% NEQ 0 (
    echo �f�[�^�x�[�X�쐬�ŃG���[���������܂����B >> %LOG_FILE%
    GOTO END
)

    cls
    echo.
    echo.
    echo.
    echo -------------------------------
    echo      �e�[�u���쐬���� �J�n
    echo -------------------------------
    echo �i%DB_NAME%�j�Ƀe�[�u�����쐬���܂��B
    echo.
    echo �����𒆎~�������Ƃ��� Ctrl + C �������Ă��������B
PAUSE
    cls
    echo.
    echo.
    echo.
    echo �i%DB_NAME%�j�e�[�u���쐬��

sqlcmd -S %SERVER% -d %DB_NAME% -U %USER% -P %PASSWORD% -i create_tables.sql >> %LOG_FILE%

IF %ERRORLEVEL% NEQ 0 (
    echo �e�[�u���쐬�ŃG���[���������܂����B >> %LOG_FILE%
    GOTO END
)

    cls
    echo.
    echo.
    echo.
    echo -------------------------------
    echo      �����f�[�^�o�^���� �J�n
    echo -------------------------------
    echo �i%DB_NAME%�j�̃e�[�u���ɏ����f�[�^��o�^���܂��B
    echo �����l��ύX�������ꍇ�Ainsert_data.sql��ҏW���Ă�����s���Ă��������B
    echo.
    echo �����𒆎~�������Ƃ��� Ctrl + C �������Ă��������B
PAUSE
    cls
    echo.
    echo.
    echo.
    echo �i%DB_NAME%�j�����f�[�^�o�^��

sqlcmd -S %SERVER% -d %DB_NAME% -U %USER% -P %PASSWORD% -i insert_data.sql >> %LOG_FILE%

IF %ERRORLEVEL% NEQ 0 (
    echo �����f�[�^�o�^�ŃG���[���������܂����B >> %LOG_FILE%
    GOTO END
)

echo %time% >> %LOG_FILE%

:END
ENDLOCAL

    cls
    echo.
    echo.
    echo.
    echo -------------------------------
    echo       �������I�����܂����B
    echo -------------------------------
PAUSE
