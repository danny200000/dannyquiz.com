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
    const countdownTime = 30; // 30 seconds
    const feedbackTime = 1000; // 1 second feedback display

    // Modal functionality
    const openModalButtons = document.querySelectorAll('[data-modal-target]');
    const closeModalButtons = document.querySelectorAll('[data-close-button]');
    const overlay = document.getElementById('overlay');

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            openModal(modal);
        });
    });

    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            closeModal(modal);
        });
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }

    function fetchQuestions(department) {
        const categoryMap = {
            "English": 10,
            "Mathematics": 19,
            "Biology": 17,
            "Chemistry": 17,
            "Physics": 17,
            "Computer Science": 18,
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
        // Reset necessary variables
        currentQuestionIndex = 0;
        score = 0;
        quizData = [];
        
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
        }, { once: true }); // Ensures this listener runs only once
    }

    function generateQuiz() {
        if (currentQuestionIndex < quizData.length) {
            const currentQuestion = quizData[currentQuestionIndex];
            questionElement.innerHTML = currentQuestion.question;
            answersElement.innerHTML = ''; // Clear previous answers
            countdownElement.style.display = 'block'; // Ensure countdown is visible
            countdownElement.innerHTML = `Time left: ${countdownTime} seconds`;

            currentQuestion.options.forEach((option) => {
                const button = document.createElement('button');
                button.innerHTML = option;
                button.addEventListener('click', () => checkAnswer(option, button, currentQuestion.correct));
                answersElement.appendChild(button);
            });

            startCountdown();
        } else {
            showScore();
        }
    }

    function startCountdown() {
        let timeLeft = countdownTime;
        clearInterval(countdownInterval); // Clear any existing interval
        countdownInterval = setInterval(() => {
            timeLeft--;
            countdownElement.innerHTML = `Time left: ${timeLeft} seconds`;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                markAnswer(null); // Mark unanswered question as incorrect
            }
        }, 1000);
    }

    function checkAnswer(selectedAnswer, button, correctAnswer) {
        clearInterval(countdownInterval); // Stop the countdown

        if (selectedAnswer === correctAnswer) {
            button.style.backgroundColor = 'green';
            score++;
        } else {
            button.style.backgroundColor = 'red';
            // Highlight the correct answer
            Array.from(answersElement.children).forEach((child) => {
                if (child.innerHTML === correctAnswer) {
                    child.style.backgroundColor = 'green';
                }
            });
        }

        setTimeout(() => {
            currentQuestionIndex++;
            generateQuiz();
        }, feedbackTime);
    }

    function markAnswer(answer) {
        if (answer === null) {
            // No answer selected, mark as incorrect
            Array.from(answersElement.children).forEach((child) => {
                if (child.innerHTML === quizData[currentQuestionIndex].correct) {
                    child.style.backgroundColor = 'green';
                }
            });
        }
        setTimeout(() => {
            currentQuestionIndex++;
            generateQuiz();
        }, feedbackTime);
    }

    function showScore() {
        questionElement.style.display = 'none';
        answersElement.style.display = 'none';
        countdownElement.style.display = 'none';
        scoreElement.innerHTML = `Your final score is ${score} out of ${quizData.length}`;
    }

    playForFreeButton.addEventListener('click', () => {
        initialOptionsElement.style.display = 'none';
        departmentOptionsElement.style.display = 'block';
    });

    departmentOptionsElement.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const department = event.target.getAttribute('data-department');
            startQuiz(department);
        }
    });

    cancelButton.addEventListener('click', () => {
        // Reset quiz
        currentQuestionIndex = 0;
        score = 0;
        initialOptionsElement.style.display = 'block';
        departmentOptionsElement.style.display = 'none';
        questionOptionsElement.style.display = 'none';
        questionElement.style.display = 'none';
        answersElement.style.display = 'none';
        scoreElement.style.display = 'none';
        walletElement.style.display = 'none';
        countdownElement.style.display = 'none';
        cancelButton.style.display = 'none'; // Hide cancel button
    });
});


