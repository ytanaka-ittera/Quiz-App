USE quiz_db;

-- m_user_tbl �����f�[�^
MERGE INTO m_user_tbl AS target
USING (VALUES 
    ('����������', GETDATE()),
    ('����������', GETDATE()),
    ('����������', GETDATE()),
    ('�����Ă�', GETDATE()),
    ('�Ȃɂʂ˂�', GETDATE())
) AS source (user_name, entry_datetime)
ON target.user_name = source.user_name
WHEN NOT MATCHED THEN
    -- ���݂��Ȃ��ꍇ�̂ݑ}��
    INSERT (user_name, entry_datetime)
    VALUES (source.user_name, source.entry_datetime);

-- t_question_tbl �����f�[�^
MERGE INTO t_question_tbl AS target
USING (VALUES
    (N'���{�̎�s�́H', N'�k�C��', N'����', N'���', N'���s', 2, GETDATE()),
    (N'�u��y�͔L�ł���v��҂́H', N'�H�열�V��', N'���Ɏ�', N'�Ėڟ���', N'�{�򌫎�', 3, GETDATE()),
    (N'���̂����f���ł͂Ȃ����̂́H', N'1', N'2', N'3', N'97', 1, GETDATE()),
    (N'���f�L���uAg�v�̌��f���́H', N'�S', N'��', N'��', N'��', 3, GETDATE()),
    (N'�����́u�����������v�A�u���v�͉��H', N'����', N'��', N'�ݖ�', N'���X', 4, GETDATE())
) AS source (question_text, option_1, option_2, option_3, option_4, correct_option, entry_datetime)
ON target.question_text = source.question_text
WHEN NOT MATCHED THEN
    -- ���݂��Ȃ��ꍇ�̂ݑ}��
    INSERT (question_text, option_1, option_2, option_3, option_4, correct_option, entry_datetime)
    VALUES (source.question_text, source.option_1, source.option_2, source.option_3, source.option_4, source.correct_option, source.entry_datetime);
