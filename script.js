document.addEventListener('DOMContentLoaded', () => {
    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');
    const scoreElement = document.getElementById('score');
    const countdownElement = document.createElement('div');
    countdownElement.className = 'countdown';
    answersElement.parentElement.insertBefore(countdownElement, answersElement);

    const walletBalanceElement = document.getElementById('wallet-balance');
    const playForFreeButton = document.getElementById('play-for-free');
    const addFundsButton = document.getElementById('add-funds');
    const initialOptionsElement = document.getElementById('initial-options');
    const departmentOptionsElement = document.getElementById('department-options');
    const questionOptionsElement = document.getElementById('question-options');
    const walletElement = document.getElementById('wallet');
    const cancelButton = document.getElementById('cancel-button');

    let currentQuestionIndex = 0;
    let score = 0;
    let totalQuestions = 10; // Default number of questions
    let quizData = [];
    let countdownInterval;
    let countdownTimeout;

    const countdownTime = 30; // 30 seconds
    const feedbackTime = 1000; // 1 second feedback display

    function fetchQuestions(department) {
        const categoryMap = {
            "English": 10,
            "Mathematics": 19,
            "Biology": 17,
            "Chemistry": 17,
            "Physics": 17,
            "Computer": 18,
            "Geography": 22,
            "History": 23
        };

        return fetch(`https://opentdb.com/api.php?amount=${totalQuestions}&category=${categoryMap[department]}&type=multiple`)
            .then(response => response.json())
            .then(data => {
                quizData = data.results.map((item) => {
                    const formattedQuestion = {
                        question: item.question,
                        options: [...item.incorrect_answers, item.correct_answer],
                        correct: item.correct_answer
                    };
                    // Shuffle the options
                    formattedQuestion.options.sort(() => Math.random() - 0.5);
                    return formattedQuestion;
                });
            })
            .catch(error => console.error('Error fetching questions:', error));
    }

    function startQuiz(department) {
        departmentOptionsElement.style.display = 'none';
        questionOptionsElement.style.display = 'block';
        questionOptionsElement.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                totalQuestions = parseInt(event.target.getAttribute('data-questions'));
                fetchQuestions(department).then(() => {
                    questionOptionsElement.style.display = 'none';
                    document.getElementById('question').style.display = 'block';
                    document.getElementById('answers').style.display = 'block';
                    document.getElementById('score').style.display = 'block';
                    document.getElementById('cancel-button').style.display = 'block'; // Show cancel button
                    generateQuiz();
                });
            }
        });
    }

    function generateQuiz() {
        if (currentQuestionIndex < quizData.length) {
            const currentQuestion = quizData[currentQuestionIndex];
            questionElement.innerHTML = currentQuestion.question;
            answersElement.innerHTML = ''; // Clear previous answers
            countdownElement.innerHTML = ''; // Clear previous countdown

            currentQuestion.options.forEach((option) => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer';
                answerDiv.textContent = option;
                answerDiv.onclick = () => handleAnswerClick(option, answerDiv);
                answersElement.appendChild(answerDiv);
            });

            startCountdown();
        } else {
            // Display final score with restart and exit options
            questionElement.textContent = `You scored ${score} out of ${totalQuestions}`;
            answersElement.innerHTML = '';

            const restartButton = document.createElement('button');
            restartButton.textContent = 'Restart';
            restartButton.onclick = () => restartQuiz();

            const exitButton = document.createElement('button');
            exitButton.textContent = 'Exit';
            exitButton.onclick = () => exitQuiz();

            answersElement.appendChild(restartButton);
            answersElement.appendChild(exitButton);

            countdownElement.innerHTML = '';
        }
    }

    function startCountdown() {
        let timeLeft = countdownTime;
        countdownElement.textContent = `${timeLeft}`;

        countdownInterval = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = `${timeLeft}`;

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                handleAnswerClick(null, null); // No answer selected
            }
        }, 1000);
    }

    function handleAnswerClick(selectedOption, selectedElement) {
        clearInterval(countdownInterval);

        const currentQuestion = quizData[currentQuestionIndex];
        const correctAnswer = currentQuestion.correct;

        if (selectedOption === correctAnswer) {
            selectedElement.style.background = 'green'; // Correct answer
            score++;
        } else if (selectedOption !== null) {
            selectedElement.style.background = 'red'; // Incorrect answer
        }

        // Show correct answer
        const correctIndex = currentQuestion.options.findIndex(opt => opt === correctAnswer);
        answersElement.children[correctIndex].style.background = 'green';

        // Move to next question after feedback
        countdownTimeout = setTimeout(() => {
            currentQuestionIndex++;
            generateQuiz();
        }, feedbackTime);
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizData = []; // Reset quiz data
        generateQuiz();
    }

    function exitQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizData = []; // Reset quiz data
        initialOptionsElement.style.display = 'block';
        departmentOptionsElement.style.display = 'none';
        questionElement.style.display = 'none';
        answersElement.style.display = 'none';
        scoreElement.style.display = 'none';
        walletElement.style.display = 'none';
        cancelButton.style.display = 'none';
        clearInterval(countdownInterval);
        clearTimeout(countdownTimeout);
        countdownElement.innerHTML = '';
    }

    playForFreeButton.addEventListener('click', () => {
        initialOptionsElement.style.display = 'none';
        departmentOptionsElement.style.display = 'block';
    });

    addFundsButton.addEventListener('click', () => {
        // Simulate login or prompt for login here
        walletElement.style.display = 'block';
    });

    cancelButton.addEventListener('click', () => {
        const confirmExit = confirm('Are you sure you want to cancel the quiz?');
        if (confirmExit) {
            clearInterval(countdownInterval);
            clearTimeout(countdownTimeout);
            countdownElement.innerHTML = '';
            location.reload(); // Reload the page to refresh the quiz
        }
    });

    // Populate questions based on department selected
    departmentOptionsElement.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const department = event.target.getAttribute('data-department');
            startQuiz(department);
        }
    });

});
