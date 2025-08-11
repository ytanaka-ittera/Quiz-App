const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sql = require("mssql");
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;  // ポート番号

const config = {
    user: "sa",
    password: "sa",
    server: "localhost",
    port: 1433,
    database: "quiz_db",
    options: {
        encrypt: false, // Windows Authentication を使用している場合は false
        enableArithAbort: true,
    },
};

// DB接続
async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log("DB接続に成功しました。");
        return pool;
    } catch (err) {
        console.error("DB接続エラー：", err);
    }
}

module.exports = connectToDatabase;

// セッション設定
app.use(session({
    secret: 'secret-key', // セッションの署名用キー
    resave: false, // セッションが変更されていない場合でも保存するか
    saveUninitialized: false, // 初期化されていないセッションを保存するか
    cookie: {
        secure: false, // HTTPS を使用する場合は true に設定
        maxAge: 1000 * 60 * 60 // セッション有効期限（ミリ秒）
    }
}));

// JSONパーサー
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// サーバーのポートを設定
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

server.on('error', (error) => {
    console.error('サーバーエラー：', error);
});

// ユーザー画面のルート（localhost:3000）
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// 管理者画面のルート（localhost:3000/admin）
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin/admin.html');
    app.use(express.static('public'));
});

// ランキング画面のルート（localhost:3000/ranking)
app.get('/ranking', (req, res) => {
    res.sendFile(__dirname + '/public/ranking/ranking.html');
    app.use(express.static('public'));
});

// モニター画面のルート（localhost:3000/monitor）
app.get('/monitor', (req, res) => {
    res.sendFile(__dirname + '/public/monitor/monitor.html');
    app.use(express.static('public'));
});

// ログイン
app.post('/login', async (req, res) => {
    const { username } = req.body;
    const authResult = await authenticateUser(username);

    if (authResult.success) {
        app.use(express.static('public'));
        req.session.user = { id: authResult.userId, username: username };
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'ユーザー名が間違っています。' });
    }
});

// ユーザー認証
async function authenticateUser(username) {
    const pool = await connectToDatabase();
    const result = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM m_user_tbl WHERE user_name = @username");

    if (result.recordset.length === 0) {
        return { success: false, message: "対象ユーザーが存在しません。" };
    }

    const user = result.recordset[0];
    return { success: true, userId: user.UserID };
}

// ログアウト処理
app.post('/logout', (req, res) => {
    req.session.destroy(); // セッションを破棄
    res.json({ success: true });
});

// ユーザー画面へのアクセス制限
app.get('/user/user.html', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/public/user/user.html');
});

// ユーザー認証
function requireLogin(req, res, next) {
    if (req.session.user) {
        next(); // 認証成功
    } else {
        res.sendFile(__dirname + '/public/error.html');
    }
}

// ユーザー情報取得
app.get('/getUser', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, username: req.session.user.username });
    } else {
        res.sendFile(__dirname + '/public/error.html');
    }
});

// 問題一覧取得 API
app.get('/api/questions', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM t_question_tbl ORDER BY question_id ASC');

        res.json(result.recordset);
    } catch (err) {
        console.error('問題一覧取得エラー：', err);
        res.status(500).send('問題一覧の取得に失敗しました。');
    }
});

// ランキングデータ取得 API
app.get('/api/ranking', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT 
                user_name,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS CorrectAnswers,
                SUM(answer_time) AS TotalTime
            FROM 
                t_user_answer_tbl
            WHERE 
                CAST(entry_datetime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY 
                user_name
            ORDER BY 
                CorrectAnswers DESC,
                TotalTime ASC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error('ランキング取得エラー：', error);
        res.status(500).send('ランキング取得に失敗しました。');
    }
});

// ランキングTOP5取得 API
app.get('/api/ranking/top5', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT TOP 5
                user_name,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS CorrectAnswers,
                SUM(answer_time) AS TotalTime
            FROM 
                t_user_answer_tbl
            WHERE 
                CAST(entry_datetime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY 
                user_name
            ORDER BY 
                CorrectAnswers DESC,
                TotalTime ASC
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error('ランキングTOP5取得エラー：', error);
        res.status(500).send('ランキングTOP5取得に失敗しました。');
    }
});

// ユーザーの回答保存
app.post('/saveUserAnswer', async (req, res) => {
    const { userName, questionID, userAnswer, answerTime, isCorrect } = req.body;

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('UserName', sql.NVarChar(100), userName)
            .input('QuestionID', sql.Int, questionID)
            .input('UserAnswer', sql.Int, userAnswer)
            .input('AnswerTime', sql.Numeric(10, 2), answerTime)
            .input('IsCorrect', sql.Bit, isCorrect ? 1 : 0)
            .query(`
                INSERT INTO t_user_answer_tbl (user_name, question_id, selected_option, answer_time, is_correct)
                VALUES (@UserName, @QuestionID, @UserAnswer, @AnswerTime, @IsCorrect)
            `);

        res.status(200).send({ message: '回答保存に成功' });
    } catch (error) {
        console.error('ユーザーの回答保存エラー：', error);
        res.status(500).send('ユーザーの回答保存に失敗しました。');
    }
});

// Socket.ioの接続イベント
io.on('connection', (socket) => {

    // 画面初期化
    socket.on('sendInit', () => {
        console.log('画面初期化');
        io.emit('receiveInit');
    });

    // モニター画面に問題表示
    socket.on('sendQuestion', (question, questionID, answerID) => {
        console.log('問題表示：', question);
        io.emit('receiveQuestion', question, questionID, answerID);
        io.emit('userInit');
    });

    // モニター画面に選択肢表示
    socket.on('sendOptions', (options) => {
        io.emit('receiveOptions', options);
    });

    // ユーザー画面に問題・選択肢表示
    socket.on('sendUsers', (question, questionID, answerID, options) => {
        io.emit('receiveUsers', question, questionID, answerID, options);
    });

    // カウントダウン開始
    socket.on('startCountdown', (data) => {
        io.emit('countdownStart', { timeLeft: data.timeLeft });
    });

    // カウントダウン更新
    socket.on('updateCountdown', (data) => {
        io.emit('countdownUpdate', { timeLeft: data.timeLeft });
    });

    // カウントダウン停止
    socket.on('stopCountdown', () => {
        io.emit('countdownStopped');
    });

    // タイムアップ
    socket.on('timeUp', () => {
        io.emit('disableOptions'); // ユーザー画面の選択肢を非活性化
        io.emit('showMessage', { message: 'TIME UP！', duration: 3000 }); // メッセージ表示（3秒間）
    });

    // スクリーン注目モーダル表示
    socket.on('sendScreenON', () => {
        io.emit('showMessage', { message: 'スクリーンをご覧ください', duration: null })
    })

    // スクリーン注目モーダル解除
    socket.on('sendScreenOFF', () => {
        io.emit('closeMessage')
    })

    // 正解表示
    socket.on('sendAnswer', (answer) => {
        console.log('正解表示：', answer);
        io.emit('receiveAnswer', answer);
    });

    // ユーザーの回答受信
    socket.on('userAnswer', (data) => {
        io.emit('receiveAnswerFromUser', data);
    });

    // モニター画面にランキングTOP5をセット
    socket.on('setRankingToMonitor', (rankingData) => {
        io.emit('receiveInit');
        io.emit('showMessage', { message: 'スクリーンをご覧ください', duration: null })
        io.emit('setRankingTop5', rankingData);
    });

    // 選択した順位を表示
    socket.on('showRanking', (rankID) => {
        io.emit('removeHiddenClass', rankID);
    });

    socket.on('disconnect', () => {
        console.log('接続を切断しました。');
    });
});
