import quizData from "../data/quiz.json";
import { createSectionTitle } from "../core/utils.js";

export class SpaceQuiz {
  constructor(container) {
    this.container = container;
    this.questions = [];
    this.index = 0;
    this.score = 0;
  }

  init() {
    if (!this.container) return;

    this.questions = Object.values(quizData.categories).flatMap((category) =>
      category.questions.map((question) => ({
        ...question,
        category: category.name
      }))
    );

    this.container.innerHTML = `
      ${createSectionTitle("CADET TRAINING", "Space Quiz Academy")}
      <div id="quiz-shell" class="quiz-shell"></div>
    `;

    this.renderStart();
  }

  renderStart() {
    this.container.querySelector("#quiz-shell").innerHTML = `
      <article class="side-panel quiz-card">
        <p class="section-kicker">MISSION BRIEFING</p>
        <h3>${this.questions.length} questions loaded</h3>
        <p>Answer fast, keep the streak alive, and climb the mission board.</p>
        <button class="primary-action" type="button" data-start-quiz>Start Quiz</button>
      </article>
    `;

    this.container.querySelector("[data-start-quiz]").addEventListener("click", () => {
      this.index = 0;
      this.score = 0;
      this.renderQuestion();
    });
  }

  renderQuestion() {
    const question = this.questions[this.index];

    if (!question) {
      this.renderResults();
      return;
    }

    this.container.querySelector("#quiz-shell").innerHTML = `
      <article class="side-panel quiz-card">
        <p class="section-kicker">${question.category} · Question ${this.index + 1} of ${this.questions.length}</p>
        <h3>${question.question}</h3>
        <div class="answer-grid">
          ${question.options.map((option, optionIndex) => `
            <button class="answer-button" type="button" data-answer="${optionIndex}">
              <span>${String.fromCharCode(65 + optionIndex)}</span>
              ${option}
            </button>
          `).join("")}
        </div>
        <p id="quiz-feedback"></p>
      </article>
    `;

    this.container.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => this.answer(Number(button.dataset.answer)));
    });
  }

  answer(answerIndex) {
    const question = this.questions[this.index];
    const correct = answerIndex === question.correct;
    const feedback = this.container.querySelector("#quiz-feedback");

    if (correct) {
      this.score += 100;
      feedback.textContent = `Correct. ${question.funFact}`;
      feedback.className = "feedback-ok";
    } else {
      feedback.textContent = `Signal missed. Correct answer: ${question.options[question.correct]}. ${question.explanation}`;
      feedback.className = "feedback-danger";
    }

    this.container.querySelectorAll("[data-answer]").forEach((button) => {
      button.disabled = true;
      if (Number(button.dataset.answer) === question.correct) button.classList.add("correct");
      if (Number(button.dataset.answer) === answerIndex && !correct) button.classList.add("wrong");
    });

    setTimeout(() => {
      this.index += 1;
      this.renderQuestion();
    }, 1800);
  }

  renderResults() {
    const best = Number(localStorage.getItem("cosmos_quiz_best") || 0);
    const isBest = this.score > best;

    if (isBest) {
      localStorage.setItem("cosmos_quiz_best", String(this.score));
    }

    this.container.querySelector("#quiz-shell").innerHTML = `
      <article class="side-panel quiz-card">
        <p class="section-kicker">MISSION COMPLETE</p>
        <h3>Score: ${this.score}</h3>
        <p>${isBest ? "New personal best recorded." : `Personal best: ${best}`}</p>
        <button class="primary-action" type="button" data-restart-quiz>Run Again</button>
      </article>
    `;

    this.container.querySelector("[data-restart-quiz]").addEventListener("click", () => this.renderStart());
  }
}
