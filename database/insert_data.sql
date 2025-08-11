USE quiz_db;

-- m_user_tbl 初期データ
MERGE INTO m_user_tbl AS target
USING (VALUES 
    ('あいうえお', GETDATE()),
    ('かきくけこ', GETDATE()),
    ('さしすせそ', GETDATE()),
    ('たちつてと', GETDATE()),
    ('なにぬねの', GETDATE())
) AS source (user_name, entry_datetime)
ON target.user_name = source.user_name
WHEN NOT MATCHED THEN
    -- 存在しない場合のみ挿入
    INSERT (user_name, entry_datetime)
    VALUES (source.user_name, source.entry_datetime);

-- t_question_tbl 初期データ
MERGE INTO t_question_tbl AS target
USING (VALUES
    (N'日本の首都は？', N'北海道', N'東京', N'大阪', N'京都', 2, GETDATE()),
    (N'「吾輩は猫である」作者は？', N'芥川龍之介', N'太宰治', N'夏目漱石', N'宮沢賢治', 3, GETDATE()),
    (N'次のうち素数ではないものは？', N'1', N'2', N'3', N'97', 1, GETDATE()),
    (N'元素記号「Ag」の元素名は？', N'鉄', N'銅', N'銀', N'鉛', 3, GETDATE()),
    (N'料理の「さしすせそ」、「そ」は何？', N'砂糖', N'塩', N'醤油', N'味噌', 4, GETDATE())
) AS source (question_text, option_1, option_2, option_3, option_4, correct_option, entry_datetime)
ON target.question_text = source.question_text
WHEN NOT MATCHED THEN
    -- 存在しない場合のみ挿入
    INSERT (question_text, option_1, option_2, option_3, option_4, correct_option, entry_datetime)
    VALUES (source.question_text, source.option_1, source.option_2, source.option_3, source.option_4, source.correct_option, source.entry_datetime);
