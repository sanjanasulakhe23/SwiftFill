document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings-form");

  chrome.storage.local.get(null, (data) => {
    for (const key in data) {
      const input = form.elements.namedItem(key);
      if (input) input.value = data[key];
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const values = {};
    for (const input of form.elements) {
      if (input.name) {
        values[input.name] = input.value;
      }
    }
    chrome.storage.local.set(values, () => {
      alert("Information saved!");
    });
  });
});