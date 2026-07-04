const tweets = document.querySelectorAll('article');
JSON.stringify(Array.from(tweets).map(t => t.textContent.substring(0, 100)));