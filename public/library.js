// ── Auth Guard ─────────────────────────────────────────────────────────────
const savedUser = localStorage.getItem('user');
const token = localStorage.getItem('token');

if (!savedUser || !token) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html?redirect=library';
}
const user = JSON.parse(savedUser || '{}');

// API Helper for Authenticated Requests
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    // Public routes don't strictly need a token
    const isPublicRoute = url.includes('/api/story/getAllStories') || url.includes('/api/story/getStoryById');

    if (!token && !isPublicRoute) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html?openAuth=login';
        throw new Error('Please login to continue.');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html?openAuth=login';
        throw new Error('Session expired. Please login again.');
    }
    
    return response;
}


// ── Navbar ──────────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

document.getElementById('navWelcome').textContent = `Hi, ${user.name}! 👋`;

// Show Admin link if user is admin
const adminLink = document.getElementById('adminLink');
if (adminLink && user.role === 'admin') {
    adminLink.style.display = 'inline';
}

function goToDashboard(e) {
    e.preventDefault();
    window.location.href = 'index.html#dashboard';
}

function handleHomeClick(e) {
    e.preventDefault();
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = 'index.html#dashboard';
    } else {
        window.location.href = 'index.html?openAuth=login';
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ── Auth Modal (for toggleFavourite edge case) ───────────────────────────────
const authOverlay = document.getElementById('authOverlay');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function openAuth(mode) { authOverlay.classList.add('active'); toggleAuth(mode); }
function closeAuth() { authOverlay.classList.remove('active'); }
function toggleAuth(mode) {
    const isLogin = mode === 'login';
    if (loginTab) loginTab.classList.toggle('active', isLogin);
    if (registerTab) registerTab.classList.toggle('active', !isLogin);
    if (loginForm) loginForm.style.display = isLogin ? 'flex' : 'none';
    if (registerForm) registerForm.style.display = isLogin ? 'none' : 'flex';
}
if (authOverlay) {
    authOverlay.addEventListener('click', (e) => { if (e.target === authOverlay) closeAuth(); });
}

// ── Story Data ───────────────────────────────────────────────────────────────
let allStories = [];
let activeCategory = 'All';
let searchQuery = '';

async function loadStories() {
    const grid = document.getElementById('storiesGrid');
    try {
        const res = await fetch('/api/story/getAllStories');
        if (res.ok) {
            allStories = await res.json();
            renderCategories();
            applyFilters();
        } else {
            grid.innerHTML = '<div class="loading-state"><p>No stories found yet. Magical things are coming! ✨</p></div>';
        }
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<div class="loading-state"><p>The library is undergoing some magic. Please check back later!</p></div>';
    }
}

// ── Categories ───────────────────────────────────────────────────────────────
function renderCategories() {
    const cats = ['All', ...new Set(allStories.map(s => s.category).filter(Boolean))];
    const container = document.getElementById('categoryFilters');
    if (!container) return;
    container.innerHTML = cats.map(cat => `
        <button class="category-btn ${cat === 'All' ? 'active' : ''}"
                onclick="filterByCategory('${cat}')">${cat === 'All' ? 'All Stories' : cat}</button>
    `).join('');
}

function filterByCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        const label = cat === 'All' ? 'All Stories' : cat;
        btn.classList.toggle('active', btn.textContent.trim() === label);
    });
    applyFilters();
}

// ── Search ───────────────────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilters();
    });
}

// ── Filter + Render ──────────────────────────────────────────────────────────
function applyFilters() {
    const q = searchQuery.toLowerCase().trim();
    const filtered = allStories.filter(s => {
        const matchCat = activeCategory === 'All' || s.category === activeCategory;
        const matchSearch = !q
            || (s.title && s.title.toLowerCase().includes(q))
            || (s.author && s.author.toLowerCase().includes(q));
        return matchCat && matchSearch;
    });
    renderStories(filtered);
}

function renderStories(stories) {
    const grid = document.getElementById('storiesGrid');
    const count = document.getElementById('storiesCount');

    if (count) {
        count.textContent = stories.length
            ? `Showing ${stories.length} ${stories.length === 1 ? 'story' : 'stories'}`
            : '';
    }

    if (!stories.length) {
        if (grid) grid.innerHTML = '<div class="loading-state"><p>No stories match your search. Try something else! 🔍</p></div>';
        return;
    }

    if (grid) {
        grid.innerHTML = stories.map(story => `
            <div class="story-card animate-up">
                
                <div class="story-content">
                    <h3>${story.title}</h3>
                    <p class="author">By ${story.author}</p>
                    <p class="story-type"><i data-lucide="tag" style="width:13px;height:13px;vertical-align:middle;margin-right:4px;"></i>${story.category || 'General'}</p>
                    <p class="excerpt">${story.content ? story.content.substring(0, 100) + '...' : 'Once upon a time...'}</p>
                    <div class="story-actions">
                        <button class="btn-read" onclick="readStory('${story._id}')">Read Now</button>
                        <button class="btn-fav" 
                            onclick="toggleFavourite('${story._id}')" 
                            ondblclick="removeFavourite('${story._id}')"
                            title="Click to add, Double-click to remove">
                            <i data-lucide="heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
}

// ── Read Story ───────────────────────────────────────────────────────────────
const storyOverlay = document.getElementById('storyOverlay');
const storyTitle   = document.getElementById('storyTitle');
const storyMeta    = document.getElementById('storyMeta');
const storyBody    = document.getElementById('storyBody');

function readStory(id) {
    const story = allStories.find(s => s._id === id || s.id === id);
    if (!story) {
        console.warn('Story not found in local cache, fetching...');
        fetch(`/api/story/getStoryById/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.title) {
                    displayStory(data);
                }
            })
            .catch(err => console.error('Fetch error:', err));
        return;
    }

    displayStory(story);
}

function displayStory(story) {
    const overlay = document.getElementById('storyOverlay');
    const title = document.getElementById('storyTitle');
    const meta = document.getElementById('storyMeta');
    const body = document.getElementById('storyBody');
    const takeQuizBtn = document.getElementById('takeQuizBtn');

    if (!overlay || !title || !body) {
        console.error('Story reader elements not found');
        return;
    }

    title.textContent = story.title || 'Untitled Tale';
    if (meta) meta.textContent = `By ${story.author || 'Unknown'} | ${story.category || 'Story'}`;
    body.textContent = story.content || 'No content available for this magical tale.';

    const imageContainer = document.getElementById('storyImageContainer');
    const storyImage = document.getElementById('storyImage');
    if (imageContainer && storyImage) {
        if (story.image) {
            storyImage.src = `/assets/${story.image}`;
            storyImage.alt = story.title;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }
    }

    // Reset view to story
    backToStory();

    // Check for quiz
    currentStoryID = story._id || story.id;
    checkIfQuizExists(currentStoryID);

    // Reset TTS button
    const ttsBtn = document.getElementById('ttsBtn');
    if (ttsBtn) {
        const span = ttsBtn.querySelector('span');
        const icon = ttsBtn.querySelector('i');
        if (span) span.textContent = 'Read Aloud';
        if (icon) icon.setAttribute('data-lucide', 'volume-2');
        if (window.lucide) window.lucide.createIcons();
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

let speechInstance = null;

function toggleTTS() {
    const ttsBtn = document.getElementById('ttsBtn');
    const content = document.getElementById('storyBody').textContent;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        ttsBtn.querySelector('span').textContent = 'Read Aloud';
        ttsBtn.querySelector('i').setAttribute('data-lucide', 'volume-2');
    } else {
        speechInstance = new SpeechSynthesisUtterance(content);
        speechInstance.rate = 0.9;
        speechInstance.pitch = 1.1;
        
        speechInstance.onend = () => {
            ttsBtn.querySelector('span').textContent = 'Read Aloud';
            ttsBtn.querySelector('i').setAttribute('data-lucide', 'volume-2');
            if (window.lucide) window.lucide.createIcons();
        };

        window.speechSynthesis.speak(speechInstance);
        ttsBtn.querySelector('span').textContent = 'Stop Reading';
        ttsBtn.querySelector('i').setAttribute('data-lucide', 'volume-x');
    }
    if (window.lucide) window.lucide.createIcons();
}

function closeStory() {
    window.speechSynthesis.cancel();
    storyOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    backToStory();
}

// ── Quiz Logic ───────────────────────────────────────────────────────────────
let currentStoryID = null;
let currentQuiz = null;

async function checkIfQuizExists(storyID) {
    const takeQuizBtn = document.getElementById('takeQuizBtn');
    try {
        const response = await authFetch(`/api/quiz/getQuiz/${storyID}`);
        if (response.ok) {
            currentQuiz = await response.json();
            takeQuizBtn.style.display = 'flex';
            if (window.lucide) window.lucide.createIcons();
        } else {
            currentQuiz = null;
            takeQuizBtn.style.display = 'none';
        }
    } catch (error) {
        takeQuizBtn.style.display = 'none';
    }
}

function startQuiz() {
    if (!currentQuiz) return;
    document.getElementById('storyMainView').style.display = 'none';
    document.getElementById('ttsBtn').style.display = 'none';
    document.getElementById('takeQuizBtn').style.display = 'none';
    document.getElementById('quizView').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    renderQuiz();
}

function backToStory() {
    document.getElementById('storyMainView').style.display = 'block';
    document.getElementById('ttsBtn').style.display = 'flex';
    if (currentQuiz) document.getElementById('takeQuizBtn').style.display = 'flex';
    document.getElementById('quizView').style.display = 'none';
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
}

function renderQuiz() {
    const container = document.getElementById('quizContainer');
    container.innerHTML = currentQuiz.questions.map((q, qIndex) => `
        <div class="quiz-question" style="margin-bottom: 2rem; text-align: left;">
            <p style="font-weight: 600; margin-bottom: 1rem; color: var(--text-main);">${qIndex + 1}. ${q.questionText}</p>
            <div class="quiz-options" style="display: grid; gap: 0.5rem;">
                ${q.options.map((opt, oIndex) => `
                    <label class="quiz-option" style="display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--bg); border-radius: 50px; cursor: pointer; transition: var(--transition);">
                        <input type="radio" name="question-${q._id}" value="${oIndex}" style="cursor: pointer;">
                        <span style="color: var(--text-main);">${opt}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('') + `
        <button class="btn-primary" onclick="submitUserQuiz()" style="width: 100%; margin-top: 1rem;">Submit Answers</button>
    `;

    container.querySelectorAll('.quiz-option').forEach(label => {
        label.addEventListener('click', function() {
            const name = this.querySelector('input').name;
            container.querySelectorAll(`input[name="${name}"]`).forEach(input => {
                input.parentElement.style.background = 'var(--bg)';
                input.parentElement.style.color = 'var(--text-main)';
            });
            this.style.background = 'var(--primary-light)';
            this.style.color = 'white';
        });
    });
}

async function submitUserQuiz() {
    const answers = [];
    let allAnswered = true;
    currentQuiz.questions.forEach(q => {
        const selected = document.querySelector(`input[name="question-${q._id}"]:checked`);
        if (selected) answers.push({ questionID: q._id, selectedIndex: parseInt(selected.value) });
        else allAnswered = false;
    });
    if (!allAnswered) { alert('Please answer all questions! ✨'); return; }

    try {
        const response = await authFetch('/api/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({ quizID: currentQuiz._id, answers })
        });
        if (response.ok) showQuizResults(await response.json());
    } catch (error) { console.error(error); }
}

function showQuizResults(data) {
    document.getElementById('quizContainer').style.display = 'none';
    const results = document.getElementById('quizResults');
    const scoreDisplay = document.getElementById('scoreDisplay');
    results.style.display = 'block';
    scoreDisplay.textContent = `${data.score} / ${data.totalQuestions}`;
    if (data.percentage >= 70) {
        scoreDisplay.innerHTML += '<div style="font-size: 1rem; font-weight: 500; margin-top: 0.5rem; color: var(--text-main);">Amazing! You\'re a Story Expert! 🌟</div>';
    } else {
        scoreDisplay.innerHTML += '<div style="font-size: 1rem; font-weight: 500; margin-top: 0.5rem; color: var(--text-main);">Good effort! Try reading again to get a perfect score! ✨</div>';
    }
}

// Close story modal on click outside
if (storyOverlay) {
    storyOverlay.addEventListener('click', (e) => {
        if (e.target === storyOverlay) closeStory();
    });
}

// ── Toggle Favourite ─────────────────────────────────────────────────────────
async function toggleFavourite(storyId) {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
        alert('Please login to save your favourite stories!');
        window.location.href = 'index.html?openAuth=login';
        return;
    }
    const user = JSON.parse(savedUser);

    try {
        const res = await authFetch('/api/favourite/create', {
            method: 'POST',
            body: JSON.stringify({ userID: user._id || user.id, storyID: storyId })
        });
        if (res.ok) {
            alert('Added to your favourites! ✨');
        } else {
            const data = await res.json();
            alert(data.message || 'Already in favourites!');
        }
    } catch (err) {
        alert(err.message || 'Network error. Please try again.');
    }
}

async function removeFavourite(storyId) {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    const user = JSON.parse(savedUser);

    if (!confirm('Remove this story from your favourites?')) return;

    try {
        const userId = user._id || user.id;
        const response = await authFetch(`/api/favourite/remove/${userId}/${storyId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Removed from your favourites! 💫');
        } else {
            const data = await response.json();
            alert(data.message || 'Could not remove from favourites.');
        }
    } catch (error) {
        alert(error.message || 'Network error. Please try again.');
    }
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadStories();
    
    // Header Background Switcher (Swipe Right)
    const header = document.getElementById('libraryHeader');
    if (header) {
        const slides = document.querySelectorAll('.header-slide');
        let currentIndex = 0;
        
        setInterval(() => {
            const nextIndex = (currentIndex + 1) % slides.length;
            
            // Prepare next slide (hidden on the left)
            slides[nextIndex].style.transition = 'none';
            slides[nextIndex].style.transform = 'translateX(-100%)';
            slides[nextIndex].classList.remove('prev');
            slides[nextIndex].classList.remove('active');
            
            // Trigger reflow
            slides[nextIndex].offsetHeight;
            
            // Current slide moves to the right (out of view)
            slides[currentIndex].style.transition = 'transform 1.2s cubic-bezier(0.65, 0, 0.35, 1)';
            slides[currentIndex].style.transform = 'translateX(100%)';
            slides[currentIndex].classList.remove('active');
            
            // Next slide moves to the center (from left to right)
            slides[nextIndex].style.transition = 'transform 1.2s cubic-bezier(0.65, 0, 0.35, 1)';
            slides[nextIndex].classList.add('active');
            slides[nextIndex].style.transform = 'translateX(0)';
            
            currentIndex = nextIndex;
        }, 30000); // 30 seconds
    }
});

