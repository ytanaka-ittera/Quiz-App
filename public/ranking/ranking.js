//////////////////////////////////////////////////////////
// ランキング画面のロジック
//////////////////////////////////////////////////////////
const socket = io();
let countdownInterval = null;

// ページロード時にランキングを取得
window.onload = fetchRanking;

// ランキングデータを取得してテーブルに表示
async function fetchRanking() {
    try {
        const response = await fetch('/api/ranking');
        const rankingData = await response.json();

        const tbody = document.querySelector('#ranking tbody');
        tbody.innerHTML = '';

        rankingData.forEach((user, index) => {

            const rankingNo = index + 1;
            const row = document.createElement('tr');
            row.id = `rank-${rankingNo}`;
            row.classList.add('ranking-row');

            row.innerHTML = `
                <td class="radio-cell" data-row="${rankingNo}">
                    <input type="radio" name="rankingSelect" value="${rankingNo}" id="radio-${rankingNo}">
                </td>
                <td>${rankingNo}</td>
                <td>${user.user_name}</td>
                <td>${user.CorrectAnswers}</td>
                <td>${user.TotalTime.toFixed(2)}</td>
            `;
            tbody.appendChild(row);

            // セル全体をクリック可能にするイベント
            const radioCell = row.querySelector('.radio-cell');
            radioCell.addEventListener('click', () => {
                document.getElementById(`radio-${rankingNo}`).click(); // ラジオボタンをクリック
            });

            addRadioEventListeners();
        });
    } catch (error) {
        console.error('ランキング取得エラー：', error);
    }
}

// ラジオボタンイベントリスナー
function addRadioEventListeners() {
    const radios = document.querySelectorAll('input[name="rankingSelect"]');

    radios.forEach((radio) => {
        radio.addEventListener('change', (event) => {
            highlightRow(event.target.value);
        });
    });
}

// ハイライト処理
function highlightRow(selectedValue) {
    document.querySelectorAll('.ranking-row').forEach((row) => {
        row.classList.remove('highlight');
    });

    document.getElementById(`rank-${selectedValue}`).classList.add('highlight');
}

// 結果発表準備
function sendPreparation() {
    fetch('/api/ranking/top5')
        .then(res => res.json())
        .then(ranking => {
            socket.emit('setRankingToMonitor', ranking); // モニター画面に送信
        })
        .catch(err => {
            console.error('ランキングTOP5取得エラー：', err);
        });
}

// ランキング表示
function sendRanking()
{
    const rowId = getSelectedRowId();
    if (rowId) {
        // 選択された順位を表示させる
        socket.emit('showRanking', `rank-${rowId}`);
    }
}

// 選択された行を取得する
function getSelectedRowId() {
    const selectedRadio = document.querySelector('input[name="rankingSelect"]:checked');
    if (selectedRadio) {
        return selectedRadio.value;
    } else {
        alert('表示する順位を選択してください。');
        return null;
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

// カウントダウンを停止
function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval); // カウントダウンを停止
        countdownInterval = null; // 変数をリセット
        socket.emit('stopCountdown'); // ユーザー画面にもカウントダウン停止を通知
    }
}