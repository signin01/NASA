import { state } from "../core/state.js";
import { createSectionTitle, escapeHtml } from "../core/utils.js";

export class MissionChat {
  constructor(container) {
    this.container = container;
    this.messages = [];
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("HOUSTON COMMS", "Mission Control Chat")}

      <div class="chat-layout">
        <aside class="side-panel">
          <h3>AI Settings</h3>
          <label class="field-label">
            Anthropic API Key
            <input id="anthropic-key" type="password" placeholder="Stored in this browser only" />
          </label>
          <button class="chip" type="button" data-save-key>Save Key</button>
          <button class="chip" type="button" data-clear-chat>Clear Comms</button>
          <p class="muted-copy">Browser-only API calls can be blocked by CORS. If that happens, this panel uses local space context mode.</p>
        </aside>

        <section class="chat-panel">
          <div id="chat-messages" class="chat-messages"></div>
          <div class="quick-searches">
            ${[
              "Explain today's APOD",
              "How close is the nearest asteroid?",
              "What is space weather right now?",
              "Tell me about current ISS crew"
            ].map((prompt) => `<button class="chip" type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
          </div>
          <form id="chat-form" class="chat-form">
            <input name="message" type="text" placeholder="Ask Houston..." autocomplete="off" />
            <button class="primary-action" type="submit">Send</button>
          </form>
        </section>
      </div>
    `;

    this.bind();
    this.loadKey();
    this.addMessage("houston", "Houston online. Ask me about space data, missions, or the dashboard telemetry.");
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-save-key]")) {
        localStorage.setItem("cosmos_anthropic_key", this.container.querySelector("#anthropic-key").value.trim());
        this.addMessage("system", "API key saved locally.");
      }

      if (event.target.closest("[data-clear-chat]")) {
        this.messages = [];
        this.renderMessages();
      }

      const prompt = event.target.closest("[data-prompt]");
      if (prompt) {
        this.send(prompt.dataset.prompt);
      }
    });

    this.container.querySelector("#chat-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.target.elements.message;
      const value = input.value.trim();
      if (!value) return;

      input.value = "";
      this.send(value);
    });
  }

  loadKey() {
    this.container.querySelector("#anthropic-key").value = localStorage.getItem("cosmos_anthropic_key") || "";
  }

  async send(text) {
    this.addMessage("user", text);

    const key = localStorage.getItem("cosmos_anthropic_key");
    if (!key) {
      this.addMessage("houston", this.localAnswer(text));
      return;
    }

    try {
      const context = this.buildContext();
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `${context}\n\nUser question: ${text}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const answer = data.content?.map((item) => item.text).join("\n") || "Signal returned empty.";
      this.addMessage("houston", answer);
    } catch (error) {
      state.addError("Mission Chat", error);
      this.addMessage("houston", `${this.localAnswer(text)}\n\nRemote AI signal blocked or unavailable.`);
    }
  }

  buildContext() {
    const iss = state.get("data.iss");
    const astronauts = state.get("data.astronauts") || [];
    const kp = state.get("data.kpIndex");

    return [
      "You are HOUSTON, a concise expert space science assistant.",
      iss ? `Current ISS: lat ${iss.latitude}, lon ${iss.longitude}, alt ${iss.altitude} km, speed ${iss.velocity} km/h.` : "",
      `Current known crew count: ${astronauts.length}.`,
      kp ? `Latest Kp data: ${JSON.stringify(kp).slice(0, 240)}.` : ""
    ].filter(Boolean).join("\n");
  }

  localAnswer(text) {
    const lower = text.toLowerCase();

    if (lower.includes("iss")) {
      const iss = state.get("data.iss");
      return iss
        ? `The ISS is currently near ${Number(iss.latitude).toFixed(2)} latitude, ${Number(iss.longitude).toFixed(2)} longitude, at about ${Number(iss.altitude).toFixed(0)} km altitude.`
        : "ISS telemetry is not loaded yet. Open the ISS tracker section and refresh the signal.";
    }

    if (lower.includes("crew") || lower.includes("astronaut")) {
      const people = state.get("data.astronauts") || [];
      return people.length
        ? `Current crew list: ${people.map((person) => `${person.name} on ${person.craft}`).join(", ")}.`
        : "Crew data is not loaded yet.";
    }

    if (lower.includes("apod")) {
      const apod = state.get("data.apod");
      return apod ? `Today's APOD is "${apod.title}". ${apod.explanation?.slice(0, 220)}` : "APOD data is not loaded yet.";
    }

    return "Local Houston mode is active. Ask about ISS, crew, APOD, asteroids, launches, or space weather after those sections load.";
  }

  addMessage(role, text) {
    this.messages.push({ role, text });
    this.messages = this.messages.slice(-20);
    this.renderMessages();
  }

  renderMessages() {
    const target = this.container.querySelector("#chat-messages");
    target.innerHTML = this.messages.map((message) => `
      <article class="chat-message ${message.role}">
        <strong>${message.role === "user" ? "You" : message.role === "system" ? "System" : "Houston"}</strong>
        <p>${escapeHtml(message.text)}</p>
      </article>
    `).join("");

    target.scrollTop = target.scrollHeight;
  }
}
