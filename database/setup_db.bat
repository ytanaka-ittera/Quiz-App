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
    echo    データベース作成処理 開始
    echo -------------------------------
    echo （%DB_NAME%）を作成します。
    echo.
    echo 処理を中止したいときは Ctrl + C を押してください。
PAUSE
    cls
    echo.
    echo.
    echo.
    echo （%DB_NAME%）作成中

echo %time% >> %LOG_FILE%

sqlcmd -S %SERVER% -d master -U %USER% -P %PASSWORD% -i create_db.sql >> %LOG_FILE%

IF %ERRORLEVEL% NEQ 0 (
    echo データベース作成でエラーが発生しました。 >> %LOG_FILE%
    GOTO END
)

    cls
    echo.
    echo.
    echo.
    echo -------------------------------
    echo      テーブル作成処理 開始
    echo -------------------------------
    echo （%DB_NAME%）にテーブルを作成します。
    echo.
    echo 処理を中止したいときは Ctrl + C を押してください。
PAUSE
    cls
    echo.
    echo.
    echo.
    echo （%DB_NAME%）テーブル作成中

sqlcmd -S %SERVER% -d %DB_NAME% -U %USER% -P %PASSWORD% -i create_tables.sql >> %LOG_FILE%

IF %ERRORLEVEL% NEQ 0 (
    echo テーブル作成でエラーが発生しました。 >> %LOG_FILE%
    GOTO END
)

    cls
    echo.
    echo.
    echo.
    echo -------------------------------
    echo      初期データ登録処理 開始
    echo -------------------------------
    echo （%DB_NAME%）のテーブルに初期データを登録します。
    echo 初期値を変更したい場合、insert_data.sqlを編集してから実行してください。
    echo.
    echo 処理を中止したいときは Ctrl + C を押してください。
PAUSE
    cls
    echo.
    echo.
    echo.
    echo （%DB_NAME%）初期データ登録中

sqlcmd -S %SERVER% -d %DB_NAME% -U %USER% -P %PASSWORD% -i insert_data.sql >> %LOG_FILE%

IF %ERRORLEVEL% NEQ 0 (
    echo 初期データ登録でエラーが発生しました。 >> %LOG_FILE%
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
    echo       処理が終了しました。
    echo -------------------------------
PAUSE
