const params = new URLSearchParams(window.location.search);
const assessmentId = params.get("assessmentId");

let questions = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", loadQuestions);

async function loadQuestions() {
    questions = await api.get(`/api/student/quiz/${assessmentId}/questions`);
    showQuestion();
}

function showQuestion() {
    const q = questions[currentIndex];
    document.getElementById("questionText").innerText = q.questionText;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.onclick = () => submitAnswer(q.id, opt);
        optionsDiv.appendChild(btn);
    });
}

function submitAnswer(questionId, answer) {
    api.post(`/api/student/quiz/${assessmentId}/answer`, {
        questionId: questionId,
        answer: answer
    }).then(res => {
        alert(res.correct ? "✅ Correct" : "❌ Wrong");

        currentIndex++;
        if (currentIndex < questions.length) {
            showQuestion();
        } else {
            alert("Quiz Finished");
        }
    });
}
