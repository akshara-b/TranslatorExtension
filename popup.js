document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('subtitleDisplay').textContent = "Processing...";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getURL" }, (response) => {
        if (response && response.url) {
          console.log("Sending URL to server:", response.url);
          fetch('http://localhost:3000/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: response.url })
          })
          .then(res => {
            console.log("Server status:", res.status);
            if (!res.ok) throw new Error("Server error");
            return res.json();
          })
          .then(data => {
            console.log("Server response:", data);
            document.getElementById('subtitleDisplay').textContent = data.transcript || "No transcript received";
          })
          .catch(err => {
            console.error("Fetch error:", err);
            document.getElementById('subtitleDisplay').textContent = "Error: " + err.message;
          });
        } else {
          document.getElementById('subtitleDisplay').textContent = "No URL received!";
        }
      });
    });
  });
});