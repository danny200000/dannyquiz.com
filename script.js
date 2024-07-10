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
    let playForFree = false;

    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            updateWalletBalanceUI(user.uid);
        }
    });

    function updateWalletBalance(userId, amount) {
        const userRef = db.collection('users').doc(userId);
        return userRef.update({
            walletBalance: firebase.firestore.FieldValue.increment(amount)
        });
    }

    function getWalletBalance(userId) {
        return db.collection('users').doc(userId).get().then(doc => doc.data().walletBalance);
    }

    function updateWalletBalanceUI(userId) {
        getWalletBalance(userId).then(balance => {
            walletBalanceElement.textContent = balance;
            initialOptionsElement.style.display = 'none';
            walletElement.style.display = 'block';
        });
    }

    async function fetchQuestions(department) {
        try {
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
            const response = await fetch(`https://opentdb.com/api.php?amount=${totalQuestions}&category=${categoryMap[department]}&type=multiple`);
            const data = await response.json();
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
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
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
        if (selectedElement) {
            if (selectedOption === currentQuestion.correct) {
                selectedElement.style.backgroundColor = 'green';
                score++;
            } else {
                selectedElement.style.backgroundColor = 'red';
            }
        }

        // Disable all answer buttons after selection or timeout
        const allAnswerElements = document.querySelectorAll('.answer');
        allAnswerElements.forEach(answer => {
            answer.style.pointerEvents = 'none';
            if (answer.textContent === currentQuestion.correct) {
                answer.style.backgroundColor = 'green';
            }
        });

        setTimeout(() => {
            currentQuestionIndex++;
            generateQuiz();
        }, feedbackTime);
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        questionOptionsElement.style.display = 'block';
        document.getElementById('question').style.display = 'none';
        document.getElementById('answers').style.display = 'none';
        document.getElementById('score').style.display = 'none';
        document.getElementById('cancel-button').style.display = 'none'; // Hide cancel button
    }

    function exitQuiz() {
        initialOptionsElement.style.display = 'block';
        walletElement.style.display = 'none';
        document.getElementById('question').style.display = 'none';
        document.getElementById('answers').style.display = 'none';
        document.getElementById('score').style.display = 'none';
        document.getElementById('cancel-button').style.display = 'none'; // Hide cancel button
    }

    cancelButton.addEventListener('click', () => {
        // Calculate score up to the current question index
        const finalScore = score;
        currentQuestionIndex = 0;
        score = 0;
        questionElement.textContent = `You scored ${finalScore} out of ${totalQuestions}`;
        answersElement.innerHTML = '';
        countdownElement.innerHTML = '';
        clearInterval(countdownInterval); // Stop countdown
        document.getElementById('cancel-button').style.display = 'none'; // Hide cancel button
    });

    playForFreeButton.addEventListener('click', () => {
        initialOptionsElement.style.display = 'none';
        departmentOptionsElement.style.display = 'block';
    });

    departmentOptionsElement.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const department = event.target.getAttribute('data-department');
            startQuiz(department); // Start quiz with the selected department
        }
    });

    addFundsButton.addEventListener('click', () => {
        const amount = parseInt(prompt('Enter amount to add:'));
        firebase.auth().signInAnonymously().then((cred) => {
            updateWalletBalance(cred.user.uid, amount).then(() => {
                updateWalletBalanceUI(cred.user.uid);
            });
        });
    });

});
