document.getElementById("generateBtn").addEventListener("click", async () => {
    const text = document.getElementById("inputText").value.trim();
    const type = document.getElementById("questionType").value;
    const num = parseInt(document.getElementById("numQuestions").value);

    if (!text) {
        alert("Please enter some text to generate questions!");
        return;
    }

    if (isNaN(num) || num < 1 || num > 20) {
        alert("Please enter a valid number of questions (1-20).");
        return;
    }

    const output = document.getElementById("output");
    output.innerHTML = "<p style='text-align:center; opacity:0.7;'>Generating questions... Please wait.</p>";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text, type: type, num_questions: num })
        });

        const data = await response.json();

        if (data.error) {
            output.innerHTML = `<p style="color:#ff6b6b;">Error: ${data.error}</p>`;
        } else {
            renderQuestions(data.questions, type);
        }
    } catch (err) {
        output.innerHTML = `<p style="color:#ff6b6b;">Error connecting to server: ${err.message}</p>`;
    }
});

function renderQuestions(rawText, type) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    // Split by numbered questions (e.g., 1., 2., etc.)
    const questionBlocks = rawText.trim().split(/\n\s*(?=\d+\.\s)/).filter(block => block.trim());

    questionBlocks.forEach((block, index) => {
        const div = document.createElement("div");
        div.className = "question-block";

        // Extract question text and answer
        let questionText = block.trim();
        let answerText = "No answer detected";



        if (type === "MCQ") {
        // Strong match for our enforced format
        const match = block.match(/\*\*Correct Answer:\s*([A-D])\*\*/i);
        if (match) {
            answerText = `Correct Answer: <strong>${match[1].toUpperCase()}</strong>`;
            questionText = block.replace(/\*\*Correct Answer:.*$/gim, "").trim();
        }
        } else {
            // Short Answer
            const match = block.match(/Answer:\s*(.+)/i);
            if (match) {
                answerText = match[1].trim();
            questionText = block.replace(/Answer:.*$/gim, "").trim();
            }
        }

        div.innerHTML = `
            <strong>${index + 1}. </strong>${questionText.replace(/\n/g, "<br>")}
            <br><br>
            <button class="reveal-btn">Show Answer</button>
            <div class="answer">${answerText || "No answer provided by AI"}</div>
        `;

        // Add click event to toggle answer
        div.querySelector(".reveal-btn").addEventListener("click", function () {
            const answerDiv = this.nextElementSibling;
            const isVisible = answerDiv.classList.contains("visible");
            
            answerDiv.classList.toggle("visible");
            this.textContent = isVisible ? "Show Answer" : "Hide Answer";
        });

        output.appendChild(div);
    });

    if (questionBlocks.length === 0) {
        output.innerHTML = "<p>No questions were generated.</p>";
    }
}