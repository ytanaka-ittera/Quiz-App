//////////////////////////////////////////////////////////
// ユーザー画面のロジック
//////////////////////////////////////////////////////////
const socket = io();
const questionDisplay = document.getElementById('question-display');
const optionsDisplay = document.getElementById('options-display');
const answerDisplay = document.getElementById('answer-display');
const countdownElement = document.getElementById('countdown');
const buttons = document.querySelectorAll('.option-button');

let startTime;

// 問題文表示
if (questionDisplay && optionsDisplay && answerDisplay) {
    socket.on('userInit', () => {

        // 前問題の内容をクリア
        questionDisplay.style.display = "none";
        optionsDisplay.style.display = "none";
        answerDisplay.style.display = "none";
        countdownElement.style.display = "none";

        buttons.forEach((button) => {
            button.disabled = false; // ボタンを有効化
            button.classList.remove('selected'); // 強調表示を削除
        });

        document.getElementById("question").innerText = '';
        document.getElementById("hdnQuestionID").value = '';
        document.getElementById("hdnCorrectOption").value = '';
    });
}

// 問題・選択肢表示
if (questionDisplay && optionsDisplay) {
    socket.on('receiveUsers', (question, questionID, answerID, options) => {

        // 問題文を表示
        document.getElementById("question").innerText = "Q." + question;
        document.getElementById("hdnQuestionID").value = questionID;
        document.getElementById("hdnCorrectOption").value = answerID;
        questionDisplay.style.display = '';

        // 各ボタンに選択肢を表示
        document.getElementById("option-1").innerText = options[0];
        document.getElementById("option-2").innerText = options[1];
        document.getElementById("option-3").innerText = options[2];
        document.getElementById("option-4").innerText = options[3];
        optionsDisplay.style.display = '';

        // カウントダウンプロック表示
        countdownElement.style.display = 'block';
        countdownElement.innerText = '';

        // 選択肢表示時のタイムスタンプを記録
        startTime = Date.now();
    });
}

// 解答表示
if (answerDisplay) {
    socket.on('receiveAnswer', (answer) => {

        // カウントダウンブロック非表示
        countdownElement.style.display = 'none';

        // 正誤判定
        const correctOption = document.getElementById("hdnCorrectOption").value;
        const selectedButton = document.querySelector('.option-button.selected');
        let selectedOption = null;
        if (selectedButton) {
            selectedOption = selectedButton.value;
        }

        const isCorrect = correctOption === selectedOption;
        if (isCorrect) {
            showModal("correct", 3000); // 正解モーダル表示(3秒間)
        }
        else {
            showModal("incorrect", 3000);   // 不正解モーダル表示(3秒間)
        }

        // 正解を表示
        setTimeout(() => {
            answerDisplay.style.display = '';
            document.getElementById("answer").innerText = '';
            document.getElementById("answer").innerText = answer;
        }, 3500);
    });
}

// 初期化
socket.on('receiveInit', () => {

    // 前問題の内容をクリア
    document.getElementById("question").innerText = '';

    questionDisplay.style.display = "none";
    optionsDisplay.style.display = "none";
    answerDisplay.style.display = "none";
    countdownElement.style.display = "none";

    document.getElementById("hdnQuestionID").value = '';
    document.getElementById("hdnCorrectOption").value = '';

    buttons.forEach((button) => {
        button.disabled = false; // ボタンを有効化
        button.classList.remove('selected'); // 強調表示を削除
    });
});

// カウントダウン開始
socket.on('countdownStart', (data) => {
    countdownElement.innerText = `残り時間: ${data.timeLeft}秒`;
});

// カウントダウン更新
socket.on('countdownUpdate', (data) => {
    countdownElement.innerText = `残り時間: ${data.timeLeft}秒`;
});

// カウントダウン停止
socket.on('countdownStopped', () => {
    countdownElement.innerText = ``;
});

// タイムアップ
socket.on('disableOptions', () => {
    buttons.forEach((button) => {
        button.disabled = true; // ボタンを無効化
    });
});

// メッセージ表示
socket.on('showMessage', (data) => {
    showModal(data.message, data.duration);
});

// モーダル表示
function showModal(message, duration) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');

    // メッセージを設定してモーダルを表示
    modal.style.display = 'flex';

    if (message == "correct") {
        content.innerHTML = `
            <span style="font-size: 5rem">〇</span>
            <br />
            <span>正解！</span>
        `;
        content.classList.add("correct");
        content.classList.remove("incorrect");
    }
    else if (message == "incorrect") {
        content.innerHTML = `
            <span style="font-size: 5rem">×</span>
            <br />
            <span>不正解…</span>
        `;
        content.classList.add("incorrect");
        content.classList.remove("correct");
    }
    else {
        content.innerHTML = `
            <span>${message}</span>
        `;
        content.classList.remove("correct");
        content.classList.remove("incorrect");
    }

    // 指定時間後にモーダルを非表示
    if (duration != null) {
        setTimeout(() => {
            modal.style.display = 'none';
            content.innerHTML = '';
            content.classList.remove("correct");
            content.classList.remove("incorrect");
        }, duration);
    }
}

// モーダル解除
socket.on('closeMessage', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
});

// ユーザーの回答送信
function sendSelectAnswer(optionNumber) {

    // 選択肢ボタンの制御
    buttons.forEach((button) => {
        button.disabled = true; // ボタンを無効化
        button.classList.remove('selected'); // 強調表示を削除
    });

    // クリックされたボタンに強調表示を追加
    const selectedButton = document.getElementById(`option-${optionNumber}`);
    selectedButton.classList.add('selected');

    // ユーザーの選択肢をサーバーに送信
    const origin = document.getElementById('username-display').innerText;
    const userName = origin.replace("チーム：", "");
    const currentTime = Date.now(); // 現在時刻
    const elapsedTime = ((currentTime - startTime) / 1000).toFixed(2); // 経過時間（秒）

    socket.emit('userAnswer', {
        userName: userName, // ユーザー名
        selectedOption: optionNumber, // ユーザーが選択した選択肢
        elapsedTime: elapsedTime // 経過時間
    });

    const questionID = document.getElementById("hdnQuestionID").value;
    const isCorrect = document.getElementById("hdnCorrectOption").value === optionNumber;

    // 回答をDBに保存
    saveAnswerToDB(userName, questionID, optionNumber, elapsedTime, isCorrect);
}

// DB保存処理
function saveAnswerToDB(username, questionID, userAnswer, elapsedTime, isCorrect) {
    fetch('/saveUserAnswer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userName: username,
            questionID: questionID,
            userAnswer: userAnswer,
            answerTime: elapsedTime,
            isCorrect: isCorrect,
        }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('回答保存に成功しました。');
            } else {
                console.error('回答保存に失敗しました。');
            }
        })
        .catch((error) => {
            console.error('回答保存エラー：', error);
        });
}