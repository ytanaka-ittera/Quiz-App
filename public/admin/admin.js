//////////////////////////////////////////////////////////
// 管理者画面のロジック
//////////////////////////////////////////////////////////
const socket = io();
let countdownInterval = null;

// ページロード時に一覧を取得
window.onload = fetchQuestions;

// 問題一覧をDBから取得
async function fetchQuestions() {
    try {
        const response = await fetch('/api/questions'); // API呼び出し
        const questions = await response.json(); // JSONデータを取得

        const tbody = document.querySelector('#question tbody');
        tbody.innerHTML = ''; // 既存のデータをクリア

        questions.forEach((question, index) => {

            const questionID = question.question_id;

            // 問題文
            const questionRow = document.createElement('tr');
            questionRow.id = `td-question${questionID}`;
            questionRow.classList.add('question-row');

            questionRow.innerHTML = `
                <td rowspan="2" class="radio-cell" data-row="${questionID}">
                    <input type="radio" name="quizSelect" value="${questionID}" id="radio-${questionID}">
                </td>
                <td id="no" rowspan="2">${questionID}</td>
                <td id="question" colspan="5">${question.question_text}</td>
            `;
            tbody.appendChild(questionRow);

            // 選択肢・正解
            const optionRow = document.createElement('tr');
            optionRow.id = `td-option${questionID}`;
            optionRow.classList.add('option-row');

            let correctAnswerText = "";
            const correctOption = question.correct_option;
            switch (correctOption) {
                case 1:
                    correctAnswerText = "A：" + question[`option_${correctOption}`];
                    break;
                case 2:
                    correctAnswerText = "B：" + question[`option_${correctOption}`];
                    break;
                case 3:
                    correctAnswerText = "C：" + question[`option_${correctOption}`];
                    break;
                case 4:
                    correctAnswerText = "D：" + question[`option_${correctOption}`];
                    break;
                default:
                    correctAnswerText = "正解が設定されていません";
                    break;
            }

            optionRow.innerHTML = `
                <td id="option-1">A：${question.option_1}</td>
                <td id="option-2">B：${question.option_2}</td>
                <td id="option-3">C：${question.option_3}</td>
                <td id="option-4">D：${question.option_4}</td>
                <td id="answer" style="color: #ff0000; text-align: center;" data-value="${question.correct_option}">${correctAnswerText}</td>
            `;
            tbody.appendChild(optionRow);

            // セル全体をクリック可能にするイベント
            const radioCell = questionRow.querySelector('.radio-cell');
            radioCell.addEventListener('click', () => {
                document.getElementById(`radio-${index + 1}`).click(); // ラジオボタンをクリック
            });

            addRadioEventListeners();
            sendInit();
            sendScreenOFF();
        });
    } catch (error) {
        console.error('問題一覧取得エラー：', error);
    }
}

// ラジオボタンイベントリスナー
function addRadioEventListeners() {
    const radios = document.querySelectorAll('input[name="quizSelect"]');

    radios.forEach((radio) => {
        radio.addEventListener('change', (event) => {
            highlightRow(event.target.value);
        });
    });
}

// ハイライト処理
function highlightRow(selectedValue) {
    document.querySelectorAll('.question-row, .option-row').forEach((row) => {
        row.classList.remove('highlight');
    });

    document.getElementById(`td-question${selectedValue}`).classList.add('highlight');
    document.getElementById(`td-option${selectedValue}`).classList.add('highlight');
}

// 問題文表示
function sendQuestion() {
    stopCountdown();
    const tbody = document.querySelector('#answers tbody');
    tbody.innerHTML = '';

    const rowId = getSelectedRowId();
    if (rowId) {
        // 選択された行の問題を取得
        const questionRow = document.querySelector(`#td-question${rowId}`);
        const question = questionRow.querySelector("#question").innerText;
        const questionID = rowId;

        const optionRow = document.querySelector(`#td-option${rowId}`);
        const answerID = optionRow.querySelector("#answer").dataset.value;

        // モニター画面に問題文表示
        socket.emit('sendQuestion', question, questionID, answerID);
    }
}

// 選択肢表示
function sendOption() {
    stopCountdown();

    const rowId = getSelectedRowId();
    if (rowId) {
        // 選択された行の選択肢を取得
        const row = document.querySelector(`#td-option${rowId}`);
        const options = [
            row.querySelector("#option-1").innerText,
            row.querySelector("#option-2").innerText,
            row.querySelector("#option-3").innerText,
            row.querySelector("#option-4").innerText,
        ]

        // モニター画面に選択肢表示
        socket.emit('sendOptions', options);
    }
}

// ユーザー画面に問題文と選択肢表示
function sendUser() {
    stopCountdown();

    const rowId = getSelectedRowId();
    if (rowId) {
        // 選択された行の問題を取得
        const questionRow = document.querySelector(`#td-question${rowId}`);
        const question = questionRow.querySelector("#question").innerText;
        const questionID = rowId;

        const optionRow = document.querySelector(`#td-option${rowId}`);
        const answerID = optionRow.querySelector("#answer").dataset.value;

        // 選択された行の選択肢を取得
        const OptionRow = document.querySelector(`#td-option${rowId}`);
        const options = [
            OptionRow.querySelector("#option-1").innerText,
            OptionRow.querySelector("#option-2").innerText,
            OptionRow.querySelector("#option-3").innerText,
            OptionRow.querySelector("#option-4").innerText,
        ]

        // モニター画面に表示
        socket.emit('sendUsers', question, questionID, answerID, options);

        // 1秒後にカウントダウンを開始
        setTimeout(() => {
            startCountdown(10); // 10秒間のカウントダウン
        }, 1000);
    }
}

// 解答表示
function sendAnswer() {
    stopCountdown();

    const rowId = getSelectedRowId();
    if (rowId) {
        // 選択された行の正解を取得
        const row = document.querySelector(`#td-option${rowId}`);
        const answer = row.querySelector("#answer").innerText;

        // 解答表示
        socket.emit('sendAnswer', answer);
    }
}

// 画面初期化
function sendInit() {
    stopCountdown();
    socket.emit('sendInit');
}

// スクリーン注目
function sendScreenON() {
    socket.emit('sendScreenON');
}

// スクリーン注目解除
function sendScreenOFF() {
    socket.emit('sendScreenOFF');
}

// 選択された行を取得する
function getSelectedRowId() {
    const selectedRadio = document.querySelector('input[name="quizSelect"]:checked');
    if (selectedRadio) {
        return selectedRadio.value;
    } else {
        alert('問題を選択してください。');
        return null;
    }
}

// カウントダウンを開始
function startCountdown(seconds) {
    let timeLeft = seconds;

    // サーバーにカウントダウン開始の通知
    socket.emit('startCountdown', { timeLeft });

    countdownInterval = setInterval(() => {
        timeLeft--;
        socket.emit('updateCountdown', { timeLeft }); // 残り時間を通知

        if (timeLeft <= 0) {
            clearInterval(countdownInterval); // カウントダウン停止
            socket.emit('timeUp'); // TimeUp通知
        }
    }, 1000);
}

// カウントダウンを停止
function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval); // カウントダウンを停止
        countdownInterval = null; // 変数をリセット
        socket.emit('stopCountdown'); // カウントダウン停止を通知
    }
}

// ユーザーの回答受信
socket.on('receiveAnswerFromUser', (data) => {
    addAnswerToTable(data);
});

// ユーザーの回答一覧作成
function addAnswerToTable(data) {

    // ユーザー回答のリスト要素を作成
    const tbody = document.querySelector('#answers tbody');

    const answerRow = document.createElement('tr');
    answerRow.id = `td-answer`;

    answerRow.innerHTML = `
        <td id="no">${tbody.children.length + 1}</td>
        <td id="team">${data.userName}</td>
        <td id="time">${data.elapsedTime}秒</td>
        <td id="userAnswer">${String.fromCharCode(64 + parseInt(data.selectedOption, 10))}</td>
    `;
    tbody.appendChild(answerRow);
}