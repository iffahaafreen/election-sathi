document.addEventListener('DOMContentLoaded', () => {
    let currentLang = 'en';
    let currentQuizQuestion = 0;
    let quizScore = 0;

    const a11yAnnouncer = document.getElementById('a11y-announcer');
    const langToggleBtn = document.getElementById('langToggle');
    const appRoot = document.getElementById('app-root');

    // Chatbot elements — must be declared here (before setupChatbot is called)
    // to avoid a Temporal Dead Zone crash that blocks the initial render
    const chatbotToggleBtn = document.getElementById('chatbotToggle');
    const chatbotPanel = document.getElementById('chatbotPanel');
    const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSendBtn = document.getElementById('chatbotSendBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');

    // Scroll-to-top button
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.className = 'scroll-top-btn hidden';
    scrollTopBtn.setAttribute('aria-label', 'Back to top');
    scrollTopBtn.innerHTML = '↑';
    document.body.appendChild(scrollTopBtn);
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('hidden', window.scrollY < 400);
    });

    initI18n();
    setupChatbot();
    setupNavLinks();
    window.addEventListener('hashchange', router);
    // Fix 4: small delay so all scripts (i18n.js data) are fully evaluated
    setTimeout(router, 0);

    function initI18n() {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            langToggleBtn.setAttribute('aria-pressed', currentLang === 'hi' ? 'true' : 'false');
            router();
            announceToScreenReader(`Language changed to ${currentLang === 'en' ? 'English' : 'हिंदी'}`);
        });
    }

    function updateStaticTranslations() {
        document.querySelectorAll('header [data-i18n], footer [data-i18n], .chatbot-container [data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) el.textContent = translations[currentLang][key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[currentLang][key]) el.setAttribute('placeholder', translations[currentLang][key]);
        });
        document.documentElement.lang = currentLang;
        // Update scroll-to-top aria label
        scrollTopBtn.setAttribute('aria-label', translations[currentLang].scrollTopLabel || 'Back to top');
    }

    function router() {
        updateStaticTranslations();
        const hash = window.location.hash;
        if (!hash || hash === '#home') {
            renderHomeView();
        } else if (hash.startsWith('#phase/')) {
            const index = parseInt(hash.split('/')[1]) - 1;
            if (!isNaN(index) && timelineData[currentLang][index]) {
                renderPhaseView(index);
            } else {
                window.location.hash = '#home';
            }
        } else if (hash === '#glossary') {
            renderGlossaryView();
        } else {
            renderHomeView();
        }
    }

    // ─── HOME VIEW ────────────────────────────────────────────────────────────
    function renderHomeView() {
        const t = translations[currentLang];
        appRoot.innerHTML = `
            <!-- Hero -->
            <section id="hero" class="hero-section">
                <div class="container hero-container">
                    <div class="hero-content">
                        <h2 class="hero-title">${t.heroTitle}</h2>
                        <p class="hero-tagline">${t.heroTagline}</p>
                        <a href="#home" data-target="timeline" class="btn btn-primary">${t.startLearningCTA}</a>
                    </div>
                    <div class="hero-visual">
                        <svg class="mascot-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Friendly mascot">
                            <circle cx="100" cy="100" r="90" fill="var(--light-bg)" stroke="var(--saffron)" stroke-width="8"/>
                            <circle cx="100" cy="100" r="70" fill="var(--white)"/>
                            <circle cx="75" cy="85" r="10" fill="var(--navy-blue)"/>
                            <circle cx="125" cy="85" r="10" fill="var(--navy-blue)"/>
                            <path d="M70 120 Q100 150 130 120" stroke="var(--navy-blue)" stroke-width="8" stroke-linecap="round" fill="transparent"/>
                            <circle cx="100" cy="40" r="15" stroke="var(--navy-blue)" stroke-width="3" fill="transparent"/>
                            <path d="M60 160 Q100 180 140 160" stroke="var(--green)" stroke-width="12" stroke-linecap="round" fill="transparent"/>
                        </svg>
                    </div>
                </div>
            </section>

            <!-- MCC Highlight Card -->
            <section class="mcc-banner-section">
                <div class="container">
                    <div class="mcc-card">
                        <div class="mcc-card-icon">📋</div>
                        <div class="mcc-card-body">
                            <h3>${t.mccCardTitle}</h3>
                            <p>${t.mccCardDesc}</p>
                        </div>
                        <a href="#phase/2" class="btn btn-secondary mcc-card-link">${t.mccCardLink}</a>
                    </div>
                </div>
            </section>

            <!-- Timeline -->
            <section id="timeline" class="timeline-section" aria-labelledby="timeline-heading">
                <div class="container">
                    <h2 id="timeline-heading" class="section-title">${t.timelineTitle}</h2>
                    <p class="section-desc">${t.timelineDesc}</p>
                    <div class="timeline-scroll-container" role="region" aria-label="Interactive Election Timeline">
                        <div class="timeline-track" id="timelineTrack"></div>
                    </div>
                </div>
            </section>

            <!-- Am I Ready to Vote -->
            <section id="ready-checker" class="ready-section" aria-labelledby="ready-heading">
                <div class="container">
                    <h2 id="ready-heading" class="section-title">${t.readyTitle}</h2>
                    <p class="section-desc">${t.readyDesc}</p>
                    <div class="ready-card">
                        <div class="ready-field">
                            <label for="readyAge">${t.readyAgeLabel}</label>
                            <input type="number" id="readyAge" min="1" max="120" placeholder="e.g. 22" aria-describedby="readyResult">
                        </div>
                        <div class="ready-field">
                            <label>${t.readyDocsLabel}</label>
                            <div class="ready-docs-grid">
                                <label class="doc-option"><input type="checkbox" id="hasVoterId"> Voter ID (EPIC)</label>
                                <label class="doc-option"><input type="checkbox" id="hasAadhaar"> Aadhaar Card</label>
                                <label class="doc-option"><input type="checkbox" id="hasPan"> PAN Card</label>
                                <label class="doc-option"><input type="checkbox" id="hasPassport"> Passport</label>
                            </div>
                        </div>
                        <button id="readyCheckBtn" class="btn btn-primary">${t.readyCheckBtn}</button>
                        <div id="readyResult" class="ready-result hidden" aria-live="polite"></div>
                    </div>
                </div>
            </section>

            <!-- Video Learning Hub -->
            <section id="learning" class="learning-section" aria-labelledby="learning-heading">
                <div class="container">
                    <h2 id="learning-heading" class="section-title">${t.learningTitle}</h2>
                    <p class="section-desc">${t.learningDesc}</p>
                    <div class="video-grid" id="videoGrid"></div>
                </div>
            </section>

            <!-- Quiz -->
            <section id="quiz" class="quiz-section" aria-labelledby="quiz-heading">
                <div class="container quiz-container">
                    <div class="quiz-header">
                        <h2 id="quiz-heading" class="section-title">${t.quizTitle}</h2>
                        <p class="section-desc">${t.quizDesc}</p>
                    </div>
                    <div id="quizApp" class="quiz-app" aria-live="polite">
                        <div id="quizIntro">
                            <button id="startQuizBtn" class="btn btn-primary">${t.startQuizBtn}</button>
                        </div>
                        <div id="quizArea" class="hidden">
                            <div class="quiz-progress">
                                <span id="quizProgressText">${t.questionXofY.replace('{X}', 1).replace('{Y}', getQuizLength())}</span>
                                <div class="progress-bar-container" aria-hidden="true">
                                    <div id="quizProgressBar" class="progress-bar"></div>
                                </div>
                            </div>
                            <h3 id="questionText" class="question-text">Question goes here?</h3>
                            <div id="optionsContainer" class="options-container" role="radiogroup" aria-labelledby="questionText"></div>
                            <div id="feedbackArea" class="feedback-area hidden" aria-live="assertive">
                                <p id="feedbackText"></p>
                                <button id="nextQuestionBtn" class="btn btn-secondary hidden">${t.nextQuestion}</button>
                            </div>
                        </div>
                        <div id="quizResults" class="hidden text-center">
                            <h3>${t.quizCompleted}</h3>
                            <p id="scoreText" class="score-text"></p>
                            <button id="restartQuizBtn" class="btn btn-primary">${t.restartQuiz}</button>
                        </div>
                    </div>
                </div>
            </section>
        `;

        renderTimelineCards();
        renderVideoGrid();
        setupQuiz();
        setupReadyChecker();
        setupInnerNavLinks();

        setTimeout(() => {
            if (window.scrollTarget) {
                const el = document.getElementById(window.scrollTarget);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                window.scrollTarget = null;
            } else if (window.location.hash === '#home' || window.location.hash === '') {
                window.scrollTo(0, 0);
            }
        }, 100);
    }

    // ─── PHASE VIEW ───────────────────────────────────────────────────────────
    function renderPhaseView(index) {
        const t = translations[currentLang];
        const item = timelineData[currentLang][index];
        const total = timelineData[currentLang].length;
        const indicatorText = t.phaseIndicator.replace('{X}', index + 1);
        const prevHref = index > 0 ? `#phase/${index}` : `#phase/${index + 1}`;
        const nextHref = index < total - 1 ? `#phase/${index + 2}` : `#phase/${index + 1}`;
        const prevDisabled = index === 0;
        const nextDisabled = index === total - 1;

        // Progress bar
        let progressHtml = '';
        for (let i = 0; i < total; i++) {
            let cls = 'progress-segment';
            if (i < index) cls += ' completed';
            else if (i === index) cls += ' active';
            progressHtml += `<div class="${cls}" title="Phase ${i + 1}"></div>`;
        }

        // Video — skip entirely if noVideo:true; support a second video via videoSrc2
        let videoHtml = '';
        if (!item.noVideo) {
            if (item.videoSrc && !item.videoSrc.includes('dQw4w9WgXcQ')) {
                const src1 = item.videoSrc.includes('?') ? item.videoSrc : item.videoSrc + '?rel=0';
                videoHtml = `<div class="video-container" style="margin-bottom:1rem;"><iframe id="phaseDetailVideo" width="100%" height="315" src="${src1}" title="Phase video" style="border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                if (item.videoSrc2) {
                    const src2 = item.videoSrc2.includes('?') ? item.videoSrc2 : item.videoSrc2 + '?rel=0';
                    videoHtml += `<div class="video-container"><iframe width="100%" height="315" src="${src2}" title="Phase video 2" style="border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                }
            }
        }

        // Extra rich content (links, cards, etc.) defined per phase in i18n.js
        const extraHtml = item.extraHtml || '';

        // Polling day sub-steps (Phase 5)
        let subStepsHtml = '';
        if (item.subSteps && item.subSteps.length) {
            const steps = item.subSteps.map(s => `
                <li class="polling-step">
                    <span class="polling-step-icon">${s.icon}</span>
                    <span>${s[currentLang] || s.en}</span>
                </li>`).join('');
            subStepsHtml = `
                <div class="polling-steps-box">
                    <h4>${t.pollingStepsTitle}</h4>
                    <ol class="polling-steps-list">${steps}</ol>
                </div>`;
        }

        // Last phase: replace "Next Phase" with "Back to Home"
        const nextBtn = nextDisabled
            ? `<a href="#home" class="btn btn-primary">${t.backToHome || '🏠 Back to Home'}</a>`
            : `<a href="${nextHref}" class="btn btn-primary">${t.nextPhase}</a>`;

        appRoot.innerHTML = `
            <section id="phaseDetailView" class="phase-detail-section" aria-labelledby="phaseDetailTitle">
                <div class="container phase-detail-container">
                    <a href="#home" class="btn-back" style="text-decoration:underline; font-weight:600; color:var(--navy-blue);">${t.backToPhases}</a>
                    <div class="phase-progress-bar">${progressHtml}</div>
                    <div class="phase-content-wrapper">
                        <div class="phase-header">
                            <span class="phase-number-large">${item.phase}</span>
                            <h2 id="phaseDetailTitle" class="phase-detail-title" tabindex="-1">${item.title}</h2>
                        </div>
                        <p class="phase-detail-desc">${item.desc}</p>
                        ${subStepsHtml}
                        <div class="fact-box phase-fact-box">
                            <h4>💡 ${t.didYouKnow}</h4>
                            <p>${item.fact}</p>
                        </div>
                        ${videoHtml}
                        ${extraHtml}
                    </div>
                    <div class="phase-nav-buttons">
                        <a href="${prevHref}" class="btn btn-secondary${prevDisabled ? ' btn-disabled' : ''}" ${prevDisabled ? 'aria-disabled="true" tabindex="-1"' : ''}>${t.prevPhase}</a>
                        <span class="phase-indicator" aria-live="polite">${indicatorText}</span>
                        ${nextBtn}
                    </div>
                </div>
            </section>`;

        setTimeout(() => {
            const title = document.getElementById('phaseDetailTitle');
            if (title) title.focus();
            announceToScreenReader(`${item.title}`);
        }, 100);
    }

    // ─── GLOSSARY VIEW ────────────────────────────────────────────────────────
    function renderGlossaryView() {
        const t = translations[currentLang];
        const terms = glossaryData[currentLang];
        const cardsHtml = terms.map((item, i) => `
            <div class="glossary-card" id="gloss-${i}">
                <h3 class="glossary-term">${item.term}</h3>
                <p class="glossary-def">${item.definition}</p>
            </div>`).join('');

        appRoot.innerHTML = `
            <section class="glossary-section" aria-labelledby="glossary-heading">
                <div class="container">
                    <a href="#home" class="btn-back" style="display:inline-block; margin-bottom:1.5rem; text-decoration:underline; font-weight:600; color:var(--navy-blue);">${t.glossaryBackBtn}</a>
                    <h2 id="glossary-heading" class="section-title">${t.glossaryTitle}</h2>
                    <p class="section-desc">${t.glossaryDesc}</p>
                    <div class="glossary-search-bar">
                        <input type="search" id="glossarySearch" placeholder="Search terms…" aria-label="Search glossary terms">
                    </div>
                    <div class="glossary-grid" id="glossaryGrid">${cardsHtml}</div>
                </div>
            </section>`;

        // Live search
        document.getElementById('glossarySearch').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.glossary-card').forEach(card => {
                const matches = card.textContent.toLowerCase().includes(q);
                card.style.display = matches ? '' : 'none';
            });
        });

        window.scrollTo(0, 0);
        setTimeout(() => {
            const heading = document.getElementById('glossary-heading');
            if (heading) heading.focus();
        }, 100);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────
    // Fix 3: safe accessor so renderHomeView never throws when data isn't ready
    function getQuizLength() {
        try {
            return quizQuestions[currentLang].length;
        } catch (e) {
            return 0;
        }
    }

    // ─── COMPONENT RENDERS ────────────────────────────────────────────────────
    function renderTimelineCards() {
        const track = document.getElementById('timelineTrack');
        if (!track) return;
        // Fix 5: guard against missing data
        if (!timelineData || !timelineData[currentLang]) return;
        track.innerHTML = '';
        timelineData[currentLang].forEach((item, index) => {
            const card = document.createElement('a');
            card.className = 'timeline-card';
            card.href = `#phase/${index + 1}`;
            card.style.cssText = 'display:block; text-decoration:none; color:inherit;';
            card.setAttribute('aria-label', `Phase ${item.phase}: ${item.title}`);
            card.innerHTML = `
                <div class="phase-number">${item.phase}</div>
                <h3 class="phase-title">${item.title}</h3>
                <div class="phase-icon">${item.icon}</div>`;
            track.appendChild(card);
        });
    }

    function renderVideoGrid() {
        const grid = document.getElementById('videoGrid');
        if (!grid) return;
        // Fix 5: guard against missing data
        if (!videosData || !videosData[currentLang]) return;
        grid.innerHTML = '';
        videosData[currentLang].forEach(video => {
            const vSrc = video.src.includes('?') ? video.src : video.src + '?rel=0';
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-container">
                    <iframe width="100%" height="315" src="${vSrc}" title="${video.title}" style="border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-desc">${video.desc}</p>
                </div>`;
            grid.appendChild(card);
        });
    }

    // ─── READY CHECKER ────────────────────────────────────────────────────────
    function setupReadyChecker() {
        const btn = document.getElementById('readyCheckBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const t = translations[currentLang];
            const age = parseInt(document.getElementById('readyAge').value);
            const hasAnyId = document.getElementById('hasVoterId').checked ||
                document.getElementById('hasAadhaar').checked ||
                document.getElementById('hasPan').checked ||
                document.getElementById('hasPassport').checked;
            const result = document.getElementById('readyResult');
            result.classList.remove('hidden');
            let html = '';
            if (!isNaN(age)) {
                html += `<p class="${age >= 18 ? 'ready-yes' : 'ready-no'}">${age >= 18 ? t.readyEligible : t.readyNotEligible}</p>`;
            }
            html += `<p class="${hasAnyId ? 'ready-yes' : 'ready-warn'}">${hasAnyId ? t.readyHasId : t.readyNoId}</p>`;
            result.innerHTML = html;
            announceToScreenReader('Eligibility check complete.');
        });
    }

    // ─── NAV LINKS ────────────────────────────────────────────────────────────
    function setupNavLinks() {
        document.querySelectorAll('header .main-nav a[data-target]').forEach(link => {
            link.addEventListener('click', () => {
                window.scrollTarget = link.getAttribute('data-target');
                if (window.location.hash === '#home' || window.location.hash === '') {
                    const el = document.getElementById(window.scrollTarget);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    window.scrollTarget = null;
                }
            });
        });
    }

    function setupInnerNavLinks() {
        document.querySelectorAll('#app-root a[data-target]').forEach(link => {
            link.addEventListener('click', () => {
                window.scrollTarget = link.getAttribute('data-target');
                if (window.location.hash === '#home' || window.location.hash === '') {
                    const el = document.getElementById(window.scrollTarget);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    window.scrollTarget = null;
                }
            });
        });
    }

    // ─── QUIZ ─────────────────────────────────────────────────────────────────
    function setupQuiz() {
        const startBtn = document.getElementById('startQuizBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const restartBtn = document.getElementById('restartQuizBtn');
        if (startBtn) startBtn.addEventListener('click', startQuiz);
        if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
        if (restartBtn) restartBtn.addEventListener('click', resetQuiz);
    }

    function startQuiz() {
        document.getElementById('quizIntro').classList.add('hidden');
        document.getElementById('quizArea').classList.remove('hidden');
        document.getElementById('quizResults').classList.add('hidden');
        currentQuizQuestion = 0;
        quizScore = 0;
        loadQuestion();
    }

    function loadQuestion() {
        const questions = quizQuestions[currentLang];
        const q = questions[currentQuizQuestion];
        const t = translations[currentLang];
        const progressStr = t.questionXofY.replace('{X}', currentQuizQuestion + 1).replace('{Y}', questions.length);
        document.getElementById('quizProgressText').textContent = progressStr;
        document.getElementById('quizProgressBar').style.width = `${(currentQuizQuestion / questions.length) * 100}%`;
        document.getElementById('questionText').textContent = q.question;
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
            btn.textContent = opt;
            btn.addEventListener('click', () => handleAnswer(i, btn, q.correctAnswer));
            container.appendChild(btn);
        });
        document.getElementById('feedbackArea').classList.add('hidden');
        document.getElementById('nextQuestionBtn').classList.add('hidden');
    }

    function handleAnswer(selectedIndex, btnEl, correctIndex) {
        document.getElementById('optionsContainer').querySelectorAll('button').forEach((btn, i) => {
            btn.disabled = true;
            if (i === selectedIndex) btn.setAttribute('aria-checked', 'true');
        });
        const feedbackArea = document.getElementById('feedbackArea');
        const feedbackText = document.getElementById('feedbackText');
        const nextBtn = document.getElementById('nextQuestionBtn');
        feedbackArea.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
        if (selectedIndex === correctIndex) {
            btnEl.classList.add('correct');
            feedbackText.textContent = currentLang === 'en' ? '✅ Correct! Well done.' : '✅ सही! बहुत बढ़िया।';
            quizScore++;
        } else {
            btnEl.classList.add('incorrect');
            document.getElementById('optionsContainer').querySelectorAll('button')[correctIndex].classList.add('correct');
            feedbackText.textContent = currentLang === 'en' ? '❌ Incorrect. The correct answer is highlighted.' : '❌ गलत। सही उत्तर हाइलाइट किया गया है।';
        }
        nextBtn.focus();
    }

    function nextQuestion() {
        currentQuizQuestion++;
        if (currentQuizQuestion < quizQuestions[currentLang].length) {
            loadQuestion();
            document.getElementById('questionText').focus();
        } else {
            showResults();
        }
    }

    function showResults() {
        document.getElementById('quizArea').classList.add('hidden');
        document.getElementById('quizResults').classList.remove('hidden');
        const total = quizQuestions[currentLang].length;
        document.getElementById('quizProgressBar').style.width = '100%';
        const scoreEl = document.getElementById('scoreText');
        scoreEl.textContent = currentLang === 'en'
            ? `You scored ${quizScore} out of ${total}`
            : `आपने ${total} में से ${quizScore} अंक प्राप्त किए`;
        announceToScreenReader(scoreEl.textContent);
    }

    function resetQuiz() { startQuiz(); }

    // ─── CHATBOT ──────────────────────────────────────────────────────────────

    function setupChatbot() {
        // Fix: null-check every element before attaching listeners
        if (chatbotToggleBtn) chatbotToggleBtn.addEventListener('click', toggleChatbot);
        if (chatbotCloseBtn) chatbotCloseBtn.addEventListener('click', closeChatbot);
        if (chatbotSendBtn) chatbotSendBtn.addEventListener('click', handleChatSubmit);
        if (chatbotInput) chatbotInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleChatSubmit(); });
    }

    function toggleChatbot() {
        const isHidden = chatbotPanel.classList.contains('hidden');
        chatbotPanel.classList.toggle('hidden', !isHidden);
        chatbotToggleBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        if (isHidden) setTimeout(() => chatbotInput.focus(), 300);
    }

    function closeChatbot() {
        chatbotPanel.classList.add('hidden');
        chatbotToggleBtn.setAttribute('aria-expanded', 'false');
        chatbotToggleBtn.focus();
    }

    function handleChatSubmit() {
        const query = chatbotInput.value.trim();
        if (!query) return;
        addChatMessage(query, 'user');
        chatbotInput.value = '';
        setTimeout(() => addChatMessage(getChatbotResponse(query), 'bot'), 500);
    }

    function addChatMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        div.innerHTML = `<p>${text}</p>`;
        chatbotMessages.appendChild(div);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function getChatbotResponse(query) {
        const q = query.toLowerCase();
        const answers = chatbotAnswers[currentLang];
        for (const item of answers) {
            if (item.keywords.some(kw => q.includes(kw.toLowerCase()))) return item.answer;
        }
        return currentLang === 'en'
            ? "I'm sorry, I couldn't find an exact answer. Try asking about EVM, VVPAT, registration, NOTA, or polling booth."
            : "क्षमा करें, मुझे सटीक उत्तर नहीं मिला। EVM, VVPAT, पंजीकरण, या मतदान केंद्र के बारे में पूछें।";
    }

    function announceToScreenReader(msg) {
        a11yAnnouncer.textContent = '';
        setTimeout(() => { a11yAnnouncer.textContent = msg; }, 100);
    }
});
