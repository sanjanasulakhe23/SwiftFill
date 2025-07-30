// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fill_form") {
    fillGoogleForm();
  }
});

function normalize(text) {
  return text.toLowerCase().replace(/\*/g, "").trim();
}

function fillGoogleForm() {
  chrome.storage.local.get(null, (values) => {
    console.log("🔍 Values from storage:", values);

    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]');
    inputs.forEach(input => {
      let question = "";
      let container = input.closest('div[role="listitem"]');
      if (container) {
        const questionDiv = container.querySelector("div[role='heading'], div[jsname], div[aria-label]");
        if (questionDiv) {
          question = normalize(questionDiv.innerText || "");
        } else {
          question = normalize(container.innerText);
        }
      }

      for (const key in values) {
        if (question.includes(normalize(key))) {
          input.value = values[key];
          input.dispatchEvent(new Event("input", { bubbles: true }));
          console.log(`✅ Filled ${key}: ${values[key]}`);
          break;
        }
      }
    });

    // Radio buttons
    const radios = document.querySelectorAll('div[role="radio"]');
    radios.forEach(radio => {
      const label = normalize(radio.innerText);
      for (const key in values) {
        if (label === normalize(values[key])) {
          radio.click();
          console.log(`🎯 Clicked radio for ${label}`);
          break;
        }
      }
    });

    // Dropdowns
    const dropdowns = document.querySelectorAll('div[role="listbox"]');
    dropdowns.forEach(drop => {
      let label = "";
      let container = drop.closest('div[role="listitem"]');
      if (container) {
        const questionDiv = container.querySelector("div[role='heading'], div[jsname], div[aria-label]");
        if (questionDiv) {
          label = normalize(questionDiv.innerText || "");
        }
      }
      for (const key in values) {
        if (label.includes(normalize(key))) {
          drop.click();
          setTimeout(() => {
            const options = document.querySelectorAll('div[role="option"]');
            options.forEach(option => {
              if (normalize(option.innerText) === normalize(values[key])) {
                option.click();
                console.log(`✅ Selected: ${values[key]} for ${key}`);
              }
            });
          }, 300);
          break;
        }
      }
    });

    // Checkboxes
    const checkboxes = document.querySelectorAll('div[role="checkbox"]');
    checkboxes.forEach(checkbox => {
      const label = normalize(checkbox.innerText);
      for (const key in values) {
        if (label === normalize(values[key])) {
          if (!checkbox.getAttribute("aria-checked") || checkbox.getAttribute("aria-checked") === "false") {
            checkbox.click();
            console.log(`☑️ Checked box for ${label}`);
          }
          break;
        }
      }
    });

    // Show banner
    const banner = document.createElement("div");
    banner.textContent = "✅ Form autofilled successfully!";
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      font-size: 16px;
      font-family: sans-serif;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 9999;
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 3000);
  });
}