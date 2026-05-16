// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Auth Overlay Logic
const authOverlay = document.getElementById('authOverlay');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function openAuth(mode) {
    authOverlay.classList.add('active');
    toggleAuth(mode);
}

function closeAuth() {
    authOverlay.classList.remove('active');
}

function toggleAuth(mode) {
    if (mode === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'flex';
        loginForm.style.display = 'none';
    }
}

// Close modal on click outside
authOverlay.addEventListener('click', (e) => {
    if (e.target === authOverlay) closeAuth();
});

// Smooth Scroll for links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section > div').forEach(el => {
    // Check if it already has the animation class, if not, prepare it
    if (!el.classList.contains('animate-up')) {
        el.style.opacity = '0';
        observer.observe(el);
    }
});

// API Helper for Authenticated Requests
// API Helper for Authenticated Requests
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    console.log('authFetch check - Token:', token ? 'Exists' : 'MISSING', 'User:', savedUser ? 'Exists' : 'MISSING');
    
    // If we're trying to hit an API route that isn't login/create, we probably need a token
    const isAuthRoute = url.includes('/api/user/login') || url.includes('/api/user/create') || url.includes('/api/story/getAllStories') || url.includes('/api/story/getStoryById');
    
    if (!token && !isAuthRoute) {
        console.warn('Blocking request: No token found for protected route');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        updateAuthState(null);
        openAuth('login');
        throw new Error('Please login to continue.');
    }


    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Sending token in header:', `Bearer ${token.substring(0, 10)}...`);
    } else {
        console.warn('No token found in localStorage for authFetch');
    }

    const response = await fetch(url, { ...options, headers });

    
    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        updateAuthState(null);
        openAuth('login');
        throw new Error('Session expired. Please login again.');
    }
    
    return response;
}


// Auth Integration
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    const originalText = btn.textContent;
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Welcome back to DreamTales!');
            closeAuth();
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            updateAuthState(data.user);
        } else {
            alert('Error: ' + (data.message || 'Login failed'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

function updateAuthState(user) {
    const guestLinks = document.querySelector('.guest-links');
    const userLinks = document.querySelector('.user-links');

    if (user) {
        guestLinks.style.display = 'none';
        userLinks.style.display = 'flex';

        // Redirect to library if that was the original intent
        const redirect = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        if (redirect === 'stories') {
            window.location.href = 'library.html';
            return;
        }

        showSection('dashboard');

        // Populate dashboard and nav
        document.getElementById('navWelcome').textContent = `Hi, ${user.name}!`;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('childName').textContent = user.childName || 'Not specified';
        // Show Admin link if user is admin
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.style.display = user.role === 'admin' ? 'inline' : 'none';
        }

        fetchStats(user);
    } else {
        guestLinks.style.display = 'flex';
        userLinks.style.display = 'none';
        const welcome = document.getElementById('navWelcome');
        if (welcome) welcome.textContent = '';
        showSection('landing');
    }
}

function showSection(section) {
    const landingPage = document.getElementById('landingPage');
    const dashboardPage = document.getElementById('dashboardPage');

    if (landingPage) landingPage.style.display = 'none';
    if (dashboardPage) dashboardPage.style.display = 'none';

    if (section === 'dashboard' && dashboardPage) {
        dashboardPage.style.display = 'block';
        createFlyingAssets();
    } else if (landingPage) {
        landingPage.style.display = 'block';
    }
    window.scrollTo(0, 0);
}

function createFlyingAssets() {
    const container = document.getElementById('flyingAssetsContainer');
    if (!container) return;
    
    // Clear existing assets if any
    container.innerHTML = '';
    
    const assetCount = 15;
    const colors = ['#FF75A0', '#645CBB', '#FFC4D0', '#FF9AB9'];
    
    for (let i = 0; i < assetCount; i++) {
        const asset = document.createElement('img');
        asset.src = 'background_pic.png';
        asset.className = 'flying-asset';
        
        // Randomize size
        const size = Math.random() * 40 + 40; // 40px to 80px
        asset.style.width = `${size}px`;
        
        // Randomize start position (Y axis)
        const startY = Math.random() * 100;
        asset.style.top = `${startY}vh`;
        
        // Randomize duration and delay
        const duration = Math.random() * 15 + 10; // 10s to 25s
        const delay = Math.random() * 10;
        asset.style.animationDuration = `${duration}s`;
        asset.style.animationDelay = `-${delay}s`; // Start mid-animation for variety
        
        // Randomize end trajectory
        const yEnd = Math.random() * 2 - 1; // -1 to 1 (variation in vertical direction)
        asset.style.setProperty('--y-end', yEnd);

        container.appendChild(asset);
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    updateAuthState(null);
    alert('Logged out. See you soon!');
}

async function fetchStats(user) {
    try {
        // Fetch Total Stories
        const storiesRes = await fetch('/api/story/getAllStories');
        if (storiesRes.ok) {
            const stories = await storiesRes.json();
            document.getElementById('totalStoriesCount').textContent = stories.length;
        }

        // Fetch Favourites for current user
        if (user && (user._id || user.id)) {
            const userId = user._id || user.id;
            const favRes = await authFetch(`/api/favourite/getFavourites/${userId}`);
            if (favRes.ok) {
                const favourites = await favRes.json();
                document.getElementById('favouritesCount').textContent = favourites.length;
                renderFavouritesGrid(favourites);
            } else if (favRes.status === 404) {
                document.getElementById('favouritesCount').textContent = '0';
                renderFavouritesGrid([]);
            }
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

let allFavourites = [];

function renderFavouritesGrid(favourites) {
    const grid = document.getElementById('favouritesGrid');
    if (!grid) return;

    allFavourites = favourites; // Store for readStory

    if (!favourites || favourites.length === 0) {
        grid.innerHTML = `
            <div class="empty-msg">
                <p>No favourites yet. Go explore the library! ✨</p>
            </div>`;
        return;
    }

    grid.innerHTML = favourites.map(fav => {
        const story = fav.storyID;
        if (!story) return '';
        return `
            <div class="fav-card animate-up">
                <div class="fav-info">
                    <h4>${story.title}</h4>
                    <p>${story.category || 'Story'}</p>
                </div>
                <button class="btn-read" onclick="readStory('${story._id}', true)">Read</button>
            </div>
        `;
    }).join('');
}

// ── Story Reader Logic ──────────────────────────────────────────────────────
const storyOverlay = document.getElementById('storyOverlay');
const storyTitle   = document.getElementById('storyTitle');
const storyMeta    = document.getElementById('storyMeta');
const storyBody    = document.getElementById('storyBody');

function readStory(id, fromFavs = false) {
    let story;
    if (fromFavs) {
        const fav = (allFavourites || []).find(f => f.storyID && (f.storyID._id === id || f.storyID.id === id));
        story = fav ? fav.storyID : null;
    }

    if (!story) {
        // Fallback: if not in favs, we fetch it
        fetch(`/api/story/getStoryById/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.title) {
                    displayStory(data);
                } else {
                    alert('Oops! This story could not be found. 🪄');
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                alert('Magical connection lost. Please try again! 🌐');
            });
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
            let imageSrc = story.image.trim();
            if (imageSrc.includes('drive.google.com')) {
                const match = imageSrc.match(/\/d\/([a-zA-Z0-9_-]+)/) || imageSrc.match(/id=([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    imageSrc = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                }
            } else if (!imageSrc.startsWith('http')) {
                imageSrc = `/assets/${imageSrc}`;
            }
            storyImage.src = imageSrc;
            storyImage.alt = story.title;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }
    }

    // Reset view to story (in case coming from a previous quiz)
    backToStory();

    // Check if story has a quiz
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
    document.body.style.overflow = 'hidden';
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
        speechInstance.rate = 0.9; // Slightly slower for kids
        speechInstance.pitch = 1.1; // Slightly higher/friendly pitch
        
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
    window.speechSynthesis.cancel(); // Stop any reading
    storyOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    backToStory(); // Reset view
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
    if (currentQuiz) {
        document.getElementById('takeQuizBtn').style.display = 'flex';
    }
    document.getElementById('quizView').style.display = 'none';
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
}

function renderQuiz() {
    const container = document.getElementById('quizContainer');
    container.innerHTML = currentQuiz.questions.map((q, qIndex) => `
        <div class="quiz-question" style="margin-bottom: 2rem;">
            <p style="font-weight: 600; margin-bottom: 1rem;">${qIndex + 1}. ${q.questionText}</p>
            <div class="quiz-options" style="display: grid; gap: 0.5rem;">
                ${q.options.map((opt, oIndex) => `
                    <label class="quiz-option" style="display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--bg); border-radius: 50px; cursor: pointer; transition: var(--transition);">
                        <input type="radio" name="question-${q._id}" value="${oIndex}" style="cursor: pointer;">
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('') + `
        <button class="btn-primary" onclick="submitUserQuiz()" style="width: 100%; margin-top: 1rem;">Submit Answers</button>
    `;

    // Add click effect for labels
    container.querySelectorAll('.quiz-option').forEach(label => {
        label.addEventListener('click', function() {
            const name = this.querySelector('input').name;
            container.querySelectorAll(`input[name="${name}"]`).forEach(input => {
                input.parentElement.style.background = 'var(--bg)';
                input.parentElement.style.borderColor = 'transparent';
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
        if (selected) {
            answers.push({
                questionID: q._id,
                selectedIndex: parseInt(selected.value)
            });
        } else {
            allAnswered = false;
        }
    });

    if (!allAnswered) {
        alert('Please answer all questions before submitting! ✨');
        return;
    }

    try {
        const response = await authFetch('/api/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({
                quizID: currentQuiz._id,
                answers: answers
            })
        });

        if (response.ok) {
            const data = await response.json();
            showQuizResults(data);
        } else {
            alert('Error submitting quiz. Please try again.');
        }
    } catch (error) {
        console.error('Quiz submit error:', error);
    }
}

function showQuizResults(data) {
    document.getElementById('quizContainer').style.display = 'none';
    const results = document.getElementById('quizResults');
    const scoreDisplay = document.getElementById('scoreDisplay');
    
    results.style.display = 'block';
    scoreDisplay.textContent = `${data.score} / ${data.totalQuestions}`;
    
    if (data.percentage >= 70) {
        scoreDisplay.innerHTML += '<div style="font-size: 1rem; font-weight: 500; margin-top: 0.5rem;">Amazing! You\'re a Story Expert! 🌟</div>';
    } else {
        scoreDisplay.innerHTML += '<div style="font-size: 1rem; font-weight: 500; margin-top: 0.5rem;">Good effort! Try reading the story again to get a perfect score! ✨</div>';
    }
}

if (storyOverlay) {
    storyOverlay.addEventListener('click', (e) => {
        if (e.target === storyOverlay) closeStory();
    });
}

async function toggleFavourite(storyId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login to save your favourite stories!');
        openAuth('login');
        return;
    }

    try {
        const response = await authFetch('/api/favourite/create', {
            method: 'POST',
            body: JSON.stringify({
                userID: user._id || user.id,
                storyID: storyId
            })
        });

        if (response.ok) {
            alert('Added to your favourites!');
            fetchStats(user); // Update dashboard stats
        } else {
            const data = await response.json();
            alert(data.message || 'Already in favourites!');
        }
    } catch (error) {
        alert(error.message || 'Network error. Please try again.');
    }
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const inputs = e.target.querySelectorAll('input');
    
    const name = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value;
    const childName = inputs[3].value.trim();

    // Validations
    if (!name || !email || !password || !childName) {
        alert('All fields are required! ✨');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address for your magical account! 📧');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long to keep your tales safe! 🔐');
        return;
    }

    if (name.length < 2) {
        alert('Please enter a valid name.');
        return;
    }

    const userData = { name, email, password, childName };
    
    const originalText = btn.textContent;
    btn.textContent = 'Creating Magic...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/user/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Account created! Let the stories begin. ✨');
            closeAuth();
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            updateAuthState(data.user);
        } else {
            alert('Error: ' + (data.message || 'Registration failed'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

function handleStartReading(event) {
    event.preventDefault();
    const user = localStorage.getItem('user');
    if (!user) {
        sessionStorage.setItem('redirectAfterLogin', 'stories');
        openAuth('login');
    } else {
        window.location.href = 'library.html';
    }
}

function handleHomeClick(event) {
    event.preventDefault();
    const user = localStorage.getItem('user');
    if (user) {
        showSection('dashboard');
    } else {
        openAuth('login');
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
            fetchStats(user); // Refresh dashboard stats and grid
        } else {
            const data = await response.json();
            alert(data.message || 'Could not remove from favourites.');
        }
    } catch (error) {
        alert(error.message || 'Network error. Please try again.');
    }
}

// Check auth state on load
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    
    // Handle redirect from library.html auth guard
    if (params.get('redirect') === 'library' || params.get('openAuth') === 'login') {
        sessionStorage.setItem('redirectAfterLogin', 'stories');
        openAuth('login');
    }

    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
        const user = JSON.parse(savedUser);
        updateAuthState(user);
    } else {
        // If one is missing, clear both to be safe
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        updateAuthState(null);
    }
});


