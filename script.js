document.addEventListener('DOMContentLoaded', () => {
    const irises = document.querySelectorAll('.iris');
    const quoteDisplay = document.getElementById('quote');
    const authorDisplay = document.getElementById('author');
    const fetchBtn = document.getElementById('fetch-btn');
    const langBtns = document.querySelectorAll('.lang-btn');

    let currentLanguage = 'en'; 
    let lastIndex = -1;

    // --- Part 1: Eye Tracking Core ---
    function handleEyeTracking(clientX, clientY) {
        irises.forEach(iris => {
            const rect = iris.getBoundingClientRect();
            const eyeX = rect.left + rect.width / 2;
            const eyeY = rect.top + rect.height / 2;
            
            const angle = Math.atan2(clientY - eyeY, clientX - eyeX);
            const maxRadius = 10; 
            const distance = Math.min(maxRadius, Math.hypot(clientX - eyeX, clientY - eyeY) / 14);
            
            const translateX = Math.cos(angle) * distance;
            const translateY = Math.sin(angle) * distance;
            
            iris.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });
    }

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) handleEyeTracking(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) handleEyeTracking(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
        handleEyeTracking(e.clientX, e.clientY);
    });

    // --- Part 2: Sentiment Classifier ---
    function computeSentiment(quoteText) {
        const text = quoteText.toLowerCase();
        const mappings = {
            sad: ['hurt', 'pain', 'sad', 'break', 'cry', 'lonely', 'miss', 'tear', 'sorrow', 'die', 'leave', 'lost', 'grief', 'agony', 'void', 'oblivion', 'বেদনা', 'অভিমানী', 'জল', 'আঁধার', 'একা', 'ছারখার', 'নষ্ট'],
            happy: ['joy', 'happy', 'laugh', 'smile', 'bright', 'grow', 'alive', 'light', 'friend', 'celebrate', 'hope', 'coffee', 'sun', 'সুখ', 'হাসলে', 'হাসি', 'বসন্ত', 'মিষ্টি', 'আকাশ', 'গল্প'],
            loved: ['love', 'heart', 'forever', 'beautiful', 'kiss', 'adore', 'soul', 'sweet', 'marry', 'precious', 'dear', 'cherish', 'tenderest', 'পরাণ', 'ভালোবাসিয়া', 'ভালোবাসা', 'বঁধুয়া', 'প্রিয়া', 'তুমি', 'চাই', 'রূপকথা']
        };

        for (let mood in mappings) {
            if (mappings[mood].some(word => text.includes(word))) return mood;
        }
        return 'nothing';
    }

    // --- Part 3: Dataset Data Routing Router ---
    function displayLocalQuote() {
        quoteDisplay.classList.add('fade-out');
        authorDisplay.classList.add('fade-out');
        fetchBtn.disabled = true;
        fetchBtn.innerText = currentLanguage === 'en' ? "Channelling..." : "খোঁজা হচ্ছে...";

        const activeSource = currentLanguage === 'en' ? window.englishQuotes : window.bengaliQuotes;

        if (!activeSource || activeSource.length === 0) {
            fetchBtn.disabled = false;
            return;
        }

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * activeSource.length);
        } while (randomIndex === lastIndex && activeSource.length > 1);
        
        lastIndex = randomIndex;
        const rawQuote = activeSource[randomIndex];

        let quoteText = rawQuote;
        let authorText = currentLanguage === 'en' ? "Unknown Source" : "অজানা উৎস";

        if (rawQuote.includes(' -')) {
            const splitIndex = rawQuote.lastIndexOf(' -');
            quoteText = rawQuote.substring(0, splitIndex).trim();
            authorText = rawQuote.substring(splitIndex + 2).trim();
        }

        const moodResult = computeSentiment(quoteText);

        setTimeout(() => {
            document.body.className = moodResult;
            quoteDisplay.innerText = `"${quoteText}"`;
            authorDisplay.innerText = `— ${authorText}`;

            quoteDisplay.classList.remove('fade-out');
            authorDisplay.classList.remove('fade-out');
            fetchBtn.disabled = false;
            fetchBtn.innerText = currentLanguage === 'en' ? "Turn the page" : "পরবর্তী পৃষ্ঠা";
        }, 350);
    }

    // --- Part 4: Control Click Event Triggers ---
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.classList.contains('active')) return;

            langBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            currentLanguage = e.target.getAttribute('data-lang');
            lastIndex = -1; 
            displayLocalQuote();
        });
    });

    displayLocalQuote();
    fetchBtn.addEventListener('click', displayLocalQuote);
});