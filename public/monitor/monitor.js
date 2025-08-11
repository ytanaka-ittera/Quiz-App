//////////////////////////////////////////////////////////
// モニター画面のロジック
//////////////////////////////////////////////////////////
const socket = io();
const questionDisplay = document.getElementById('question-display');
const optionsDisplay = document.getElementById('options-display');
const countdownElement = document.getElementById('countdown');
const buttons = document.querySelectorAll('.option-button');
const rankingDisplay = document.getElementById('ranking-display');

let startTime;

// 問題文表示
if (questionDisplay) {
    socket.on('receiveQuestion', (question, questionID, answerID) => {

        // 前問題の内容をクリア
        document.getElementById("question").innerText = '';

        questionDisplay.style.display = "none";
        optionsDisplay.style.display = "none";
        countdownElement.style.display = "none";
        rankingDisplay.style.display = "none";

        buttons.forEach((button) => {
            button.disabled = false; // ボタンを有効化
            button.classList.remove('selected'); // 強調表示を削除
        });

        // 新しい問題文を表示
        document.getElementById("question").innerText = "Q." + question;
        document.getElementById("hdnQuestionID").value = questionID;
        document.getElementById("hdnCorrectOption").value = answerID;
        questionDisplay.style.display = '';
    });
}

// 選択肢表示
if (optionsDisplay) {
    socket.on('receiveOptions', (options) => {

        // 選択肢ブロック表示
        optionsDisplay.style.display = '';

        // カウントダウンプロック表示
        countdownElement.style.display = 'block';
        countdownElement.innerText = '';

        // 各ボタンに選択肢を表示
        document.getElementById("option-1").innerText = options[0];
        document.getElementById("option-2").innerText = options[1];
        document.getElementById("option-3").innerText = options[2];
        document.getElementById("option-4").innerText = options[3];

        // 選択肢表示時のタイムスタンプを記録
        startTime = Date.now();
    });
}

// 解答表示
socket.on('receiveAnswer', (answer) => {

    // カウントダウンブロック非表示
    countdownElement.style.display = 'none';

    // 選択肢ボタンの制御
    buttons.forEach((button) => {
        button.disabled = true; // ボタンを無効化
        button.classList.remove('selected'); // 強調表示を削除
    });

    // 正解の選択肢に強調表示を追加
    const answerNo = document.getElementById("hdnCorrectOption").value;
    const selectedButton = document.getElementById(`option-${answerNo}`);
    selectedButton.classList.add('selected');
});

// 初期化
socket.on('receiveInit', () => {

    // 前問題の内容をクリア
    document.getElementById("question").innerText = '';

    questionDisplay.style.display = "none";
    optionsDisplay.style.display = "none";
    countdownElement.style.display = "none";
    rankingDisplay.style.display = "none";

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

// メッセージ表示
socket.on('showMessage', (data) => {
    if (data.message != 'スクリーンをご覧ください') {
        showModal(data.message, data.duration);
    }
});

// モーダル表示
function showModal(message, duration) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');

    // メッセージを設定してモーダルを表示
    modal.style.display = 'flex';
    content.innerHTML = `<span>${message}</span>`;

    // 指定時間後にモーダルを非表示
    if (duration != null) {
        setTimeout(() => {
            modal.style.display = 'none';
            content.innerHTML = '';
        }, duration);
    }
}

// モーダル解除
socket.on('closeMessage', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
});

// ランキングTOP5取得
if (rankingDisplay) {
    socket.on('setRankingTop5', (rankingData) => {

        rankingDisplay.style.display = '';

        const tbody = document.querySelector('#ranking tbody');
        tbody.innerHTML = '';

        rankingData.forEach((user, index) => {

            const rankingNo = index + 1;
            const row = document.createElement('tr');
            row.id = `rank-${rankingNo}`;

            row.innerHTML = `
                <td>${rankingNo}</td>
                <td style="visibility: hidden;">${user.user_name}</td>
                <td style="visibility: hidden;">${user.CorrectAnswers}</td>
                <td style="visibility: hidden;">${user.TotalTime}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

// 選択された順位を表示
if (rankingDisplay) {
    socket.on('removeHiddenClass', rankID => {

        // 表示対象の行を取得
        const row = document.getElementById(rankID);

        if (row) {
            const hiddenCells = row.querySelectorAll('[style*="visibility: hidden"]');
            hiddenCells.forEach(cell => {
                cell.style.visibility = 'visible';
            });
        }
    });
}