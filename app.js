let allQuestions = [];
let questions = [];
let index = 0;
let selected = false;
let quizWrong = 0;

let difficultQuestions = JSON.parse(localStorage.getItem("difficult")) || [];
let savedProgress = JSON.parse(localStorage.getItem("progress")) || null;

// تحميل الأسئلة
fetch('questions.json')
.then(res => res.json())
.then(data => {

  allQuestions = data.map((q,i)=>({
    ...q,
    id: i
  }));

  questions = [...allQuestions];

  // 🔥 استرجاع التقدم
  if(savedProgress){
    index = savedProgress.index;
    quizWrong = savedProgress.quizWrong;
  }

  loadQuestion();
});

// حفظ التقدم
function saveProgress(){
  localStorage.setItem("progress", JSON.stringify({
    index,
    quizWrong
  }));
}

// عرض السؤال
function loadQuestion(){
  selected = false;

  if(index >= questions.length){
    showResult();
    return;
  }

  let q = questions[index];

  document.getElementById("progress").innerText =
  `السؤال ${index+1}/${questions.length}`;

  document.getElementById("wrongCount").innerText =
  `❌ الأخطاء: ${quizWrong}`;

  document.getElementById("question").innerText = q.question;

  document.getElementById("progressFill").style.width =
  ((index / questions.length) * 100) + "%";

  let answers = document.getElementById("answers");
  answers.innerHTML = "";

  document.getElementById("markDifficult").checked =
  difficultQuestions.includes(q.id);

  q.options.forEach((opt,i)=>{
    let btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = ()=>checkAnswer(i,btn);
    answers.appendChild(btn);
  });

  saveProgress();
}

// التحقق
function checkAnswer(i,btn){
  if(selected) return;
  selected = true;

  let q = questions[index];
  let buttons = document.querySelectorAll("#answers button");

  if(i === q.correct){
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    buttons[q.correct].classList.add("correct");

    quizWrong++;
    // added by me to update quizwrong when checkanswer
    document.getElementById("wrongCount").innerText =
  `❌ الأخطاء: ${quizWrong}`;   

    // إضافة للصعبة تلقائياً
    if(!difficultQuestions.includes(q.id)){
      difficultQuestions.push(q.id);
      localStorage.setItem("difficult", JSON.stringify(difficultQuestions));
    }

    updateWrongUI();
  }

  saveProgress();
}

// التالي
function next(){
  index++;
  loadQuestion();
}

// السابق
function prev(){
  if(index > 0){
    index--;
    loadQuestion();
  }
}

// النتائج
function showResult(){

  localStorage.removeItem("progress");

  document.querySelector(".app").innerHTML = `
    <div class="card result">
      <h2>🎉 انتهى الاختبار</h2>
      <p>عدد الأخطاء: ${quizWrong}</p>

      <button onclick="restart()">🔄 إعادة الاختبار</button>
      <button onclick="startDifficult()">🔥 الأسئلة الصعبة</button>
    </div>
  `;
}

// checkbox
document.addEventListener("change", function(e){
  if(e.target.id === "markDifficult"){
    let q = questions[index];

    if(e.target.checked){
      if(!difficultQuestions.includes(q.id)){
        difficultQuestions.push(q.id);
      }
    } else {
      difficultQuestions = difficultQuestions.filter(id=>id !== q.id);
    }

    localStorage.setItem("difficult", JSON.stringify(difficultQuestions));
  }
});

// إعادة
function restart(){
  localStorage.removeItem("progress");
  location.reload();
}

// الصعبة
function startDifficult(){

  if(difficultQuestions.length === 0){
    alert("لا توجد أسئلة صعبة");
    return;
  }

  questions = allQuestions.filter(q =>
    difficultQuestions.includes(q.id)
  );

  index = 0;
  quizWrong = 0;

  loadQuestion();
}

// الوضع الليلي
function toggleDark(){
  document.body.classList.toggle("dark");
}