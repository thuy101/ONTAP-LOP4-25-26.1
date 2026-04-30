let currentSubject = "", examQuestions = [], currentIndex = 0;
let timerInterval, studentName = "", studentClass = "", seconds = 0;
let userAnswers = {}, isSubmitted = false;

function startApp() {
    studentName = document.getElementById('student-name').value.trim();
    studentClass = document.getElementById('student-class').value.trim();
    if (!studentName || !studentClass) return alert("Em hãy nhập đầy đủ Tên và Lớp nhé!");
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
}

function showHomeScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('home-screen').classList.remove('hidden');
}

function logout() { location.reload(); }

function showExamList(subject) {
    currentSubject = subject;
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('exam-list-screen').classList.remove('hidden');
    document.getElementById('selected-subject-display').innerText = "MÔN: " + subject.toUpperCase();
    const container = document.getElementById('exam-buttons');
    container.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.innerText = "ĐỀ SỐ " + i;
        btn.className = "btn-sub-item " + (i % 2 === 0 ? "green" : "orange");
        btn.onclick = () => startQuiz(i);
        container.appendChild(btn);
    }
}

function startQuiz(examNum) {
    let pool = window.questions[currentSubject];
    let step = Math.max(1, Math.floor((pool.length - 10) / 4));
    examQuestions = [];
    for(let i=0; i<10; i++) examQuestions.push(pool[((examNum-1)*step + i) % pool.length]);

    currentIndex = 0; userAnswers = {}; isSubmitted = false; seconds = 0;
    document.getElementById('exam-list-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('header-subject-name').innerText = `${currentSubject} - Đề ${examNum}`;
    document.getElementById('info-name').innerText = studentName;
    document.getElementById('info-class').innerText = studentClass;
    document.getElementById('result-box').classList.add('hidden');
    document.getElementById('submit-btn').classList.remove('hidden');
    renderNav();
    showQuestion(0);
    startTimer();
}

function showQuestion(idx) {
    currentIndex = idx;
    const qArea = document.getElementById('question-area');
    const q = examQuestions[idx];
    document.querySelectorAll('.nav-q-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`nav-q-${idx}`).classList.add('active');

    let html = `<div class="q-title">Câu ${idx + 1}: ${q.q}</div>`;
    
    if (q.type && q.type.startsWith("group")) {
        q.subQuestions.forEach((sub, sIdx) => {
            const saved = userAnswers[`q${idx}_s${sIdx}`];
            const correctVal = q.type === "group-fill" ? q.corrects[sIdx] : q.subQuestions[sIdx].correct;
            let bgColor = "";
            if(isSubmitted) bgColor = (saved == correctVal) ? "#c8e6c9" : "#ffcdd2";

            html += `<div class="sub-item-box" style="background:${bgColor}; padding:15px; border-radius:10px; margin-bottom:10px; font-size:26px;">
                <span>${sub.text.replace('(....)', '______')}</span>
                <select onchange="saveAns(${idx}, ${sIdx}, this.value)" ${isSubmitted?'disabled':''} style="font-size:22px;">
                    <option value="">-- Chọn --</option>
                    ${q.type === 'group-ds' ? 
                        `<option value="0" ${saved=='0'?'selected':''}>Đúng</option><option value="1" ${saved=='1'?'selected':''}>Sai</option>` : 
                        q.options.map((o, oi) => `<option value="${oi}" ${saved==oi?'selected':''}>${o}</option>`).join('')}
                </select>
                ${isSubmitted ? `<b style="color:green; margin-left:10px;"> (Đúng: ${q.type==='group-ds'?(correctVal==0?'Đúng':'Sai'):q.options[correctVal]})</b>` : ''}
            </div>`;
        });
    } else {
        q.a.forEach((opt, i) => {
            const isCorrect = (i === q.correct);
            const isChosen = (userAnswers[`q${idx}`] == i);
            let stateClass = "";
            if (isSubmitted) {
                if (isCorrect) stateClass = "correct-ans";
                else if (isChosen) stateClass = "wrong-ans";
            } else if (isChosen) {
                stateClass = "selected-ans";
            }

            html += `<label class="ans-opt ${stateClass}">
                <input type="radio" name="q${idx}" value="${i}" ${isChosen?'checked':''} ${isSubmitted?'disabled':''} onchange="saveAns(${idx}, -1, this.value)"> ${opt}
            </label>`;
        });
    }
    qArea.innerHTML = html;
    document.getElementById('prev-btn').style.visibility = (idx === 0) ? "hidden" : "visible";
    document.getElementById('next-btn').innerText = (idx === 9) ? (isSubmitted?"XEM KẾT QUẢ":"NỘP BÀI") : "CÂU TIẾP ▶";
}

function saveAns(qIdx, sIdx, val) {
    if (isSubmitted) return;
    if (sIdx === -1) userAnswers[`q${qIdx}`] = val;
    else userAnswers[`q${qIdx}_s${sIdx}`] = val;
    document.getElementById(`nav-q-${qIdx}`).classList.add('done');
    showQuestion(qIdx);
}

function nextQuestion() {
    if (currentIndex < 9) showQuestion(currentIndex + 1);
    else if (!isSubmitted) submitQuiz();
    else showHomeScreen();
}

function prevQuestion() { if (currentIndex > 0) showQuestion(currentIndex - 1); }

function renderNav() {
    const nav = document.getElementById('question-nav');
    nav.innerHTML = "";
    examQuestions.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = "nav-q-btn"; btn.id = "nav-q-" + i;
        btn.innerText = i + 1; btn.onclick = () => showQuestion(i);
        nav.appendChild(btn);
    });
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        let m = Math.floor(seconds / 60).toString().padStart(2, '0');
        let s = (seconds % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `⏱ ${m}:${s}`;
    }, 1000);
}

function submitQuiz() {
    if(!confirm("Em có chắc chắn muốn nộp bài không?")) return;
    isSubmitted = true; clearInterval(timerInterval);
    let score = 0;
    examQuestions.forEach((q, idx) => {
        let isRight = false;
        if (q.type && q.type.startsWith("group")) {
            let allCorrect = true;
            let total = q.type === "group-fill" ? q.corrects.length : q.subQuestions.length;
            for(let s=0; s<total; s++) {
                let correctVal = q.type === "group-fill" ? q.corrects[s] : q.subQuestions[s].correct;
                if (userAnswers[`q${idx}_s${s}`] != correctVal) allCorrect = false;
            }
            if (allCorrect) isRight = true;
        } else { if (userAnswers[`q${idx}`] == q.correct) isRight = true; }
        if (isRight) score++;
        else document.getElementById(`nav-q-${idx}`).classList.add('wrong-nav');
    });

    const rank = score >= 8 ? "ĐẠT" : "CHƯA ĐẠT";
    const rankColor = score >= 8 ? "green" : "red";
    document.getElementById('result-box').classList.remove('hidden');
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('final-score').innerHTML = `<h1 style="font-size:70px; color:${rankColor}; margin:5px">${score}/10</h1>`;
    document.getElementById('final-rank').innerHTML = `<span style="font-size:30px; font-weight:bold; color:${rankColor}">${rank}</span>`;
    saveGoldBoard(score);
    showQuestion(0);
}

function saveGoldBoard(score) {
    let boards = JSON.parse(localStorage.getItem('goldBoard') || "[]");
    boards.push({
        name: studentName, class: studentClass, subject: currentSubject,
        score: score + "/10", time: document.getElementById('timer').innerText,
        date: new Date().toLocaleString('vi-VN')
    });
    localStorage.setItem('goldBoard', JSON.stringify(boards));
}

function showGoldBoard() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('gold-board-screen').classList.remove('hidden');
    const body = document.getElementById('gold-board-body');
    body.innerHTML = "";
    let boards = JSON.parse(localStorage.getItem('goldBoard') || "[]");
    boards.reverse().forEach(b => {
        body.innerHTML += `<tr><td>${b.date}</td><td>${b.name}</td><td>${b.class}</td><td>${b.subject}</td><td>${b.score}</td><td>${b.time}</td></tr>`;
    });
}

function backToMenu() { if(confirm("Em muốn dừng làm bài để về Menu?")) showHomeScreen(); }