USE quiz_db;

-- ユーザー情報テーブル
IF NOT EXISTS (
    SELECT * FROM sysobjects WHERE name='m_user_tbl' AND xtype='U'
)
BEGIN
    CREATE TABLE m_user_tbl (
        user_id INT IDENTITY(1,1) PRIMARY KEY,
        user_name NVARCHAR(100) NOT NULL,
        entry_datetime DATETIME DEFAULT GETDATE()
    );
    PRINT 'テーブル [m_user_tbl] を作成しました。';
END
ELSE
BEGIN
    PRINT 'テーブル [m_user_tbl] はすでに存在します。';
END

-- 問題テーブル
IF NOT EXISTS (
    SELECT * FROM sysobjects WHERE name='t_question_tbl' AND xtype='U'
)
BEGIN
    CREATE TABLE t_question_tbl (
        question_id INT IDENTITY(1,1) PRIMARY KEY,
        question_text NVARCHAR(MAX) NOT NULL,
        option_1 NVARCHAR(255) NOT NULL,
        option_2 NVARCHAR(255) NOT NULL,
        option_3 NVARCHAR(255) NOT NULL,
        option_4 NVARCHAR(255) NOT NULL,
        correct_option INT NOT NULL,
        entry_datetime DATETIME DEFAULT GETDATE()
    );
    PRINT 'テーブル [t_question_tbl] を作成しました。';
END
ELSE
BEGIN
    PRINT 'テーブル [t_question_tbl] はすでに存在します。';
END

-- ユーザー回答テーブル
IF NOT EXISTS (
    SELECT * FROM sysobjects WHERE name='t_user_answer_tbl' AND xtype='U'
)
BEGIN
    CREATE TABLE t_user_answer_tbl (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_name NVARCHAR(100) NOT NULL,
        question_id INT NOT NULL,
        selected_option INT NOT NULL,
        answer_time NUMERIC(10, 2) NOT NULL,
        is_correct BIT NOT NULL,
        entry_datetime DATETIME DEFAULT GETDATE()
    );
    PRINT 'テーブル [t_user_answer_tbl] を作成しました。';
END
ELSE
BEGIN
    PRINT 'テーブル [t_user_answer_tbl] はすでに存在します。';
END
