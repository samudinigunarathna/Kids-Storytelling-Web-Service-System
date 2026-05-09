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

// Auth Integration
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
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
            // You could store the user data in localStorage here
            localStorage.setItem('user', JSON.stringify(data.user));
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
    const landingPage = document.getElementById('landingPage');
    const dashboardPage = document.getElementById('dashboardPage');

    if (user) {
        guestLinks.style.display = 'none';
        userLinks.style.display = 'flex';
        showSection('dashboard');
        
        // Populate dashboard and nav
        document.getElementById('navWelcome').textContent = `Hi, ${user.name}!`;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('childName').textContent = user.childName || 'Not specified';
        fetchStats(user);
    } else {
        guestLinks.style.display = 'flex';
        userLinks.style.display = 'none';
        document.getElementById('navWelcome').textContent = '';
        showSection('landing');
    }
}

function showSection(section) {
    const landingPage = document.getElementById('landingPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (section === 'dashboard') {
        landingPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        window.scrollTo(0, 0);
    } else {
        landingPage.style.display = 'block';
        dashboardPage.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('user');
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
            const favRes = await fetch(`/api/favourite/getFavourites/${userId}`);
            if (favRes.ok) {
                const favourites = await favRes.json();
                document.getElementById('favouritesCount').textContent = favourites.length;
            } else if (favRes.status === 404) {
                document.getElementById('favouritesCount').textContent = '0';
            }
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Check auth state on load
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        updateAuthState(user);
    }
    loadStories();
});

async function loadStories() {
    const grid = document.getElementById('storiesGrid');
    if (!grid) return;

    try {
        const response = await fetch('/api/story/getAllStories');
        if (response.ok) {
            const stories = await response.json();
            grid.innerHTML = stories.map(story => `
                <div class="story-card animate-up">
                    <div class="story-badge">${story.category}</div>
                    <div class="story-content">
                        <h3>${story.title}</h3>
                        <p class="author">By ${story.author}</p>
                        <p class="excerpt">${story.content ? story.content.substring(0, 100) + '...' : 'Once upon a time...'}</p>
                        <div class="story-actions">
                            <button class="btn-read" onclick="readStory('${story._id}')">Read Now</button>
                            <button class="btn-fav" onclick="toggleFavourite('${story._id}')">
                                <i data-lucide="heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Re-initialize Lucide icons for new elements
            if (window.lucide) {
                window.lucide.createIcons();
            }
        } else {
            grid.innerHTML = '<p>No stories found yet. Magical things are coming!</p>';
        }
    } catch (error) {
        console.error('Error loading stories:', error);
        grid.innerHTML = '<p>The library is currently undergoing some magic. Please check back later!</p>';
    }
}

function readStory(id) {
    alert('Magical reading view coming soon! Story ID: ' + id);
}

async function toggleFavourite(storyId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login to save your favourite stories!');
        openAuth('login');
        return;
    }

    try {
        const response = await fetch('/api/favourite/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        alert('Network error. Please try again.');
    }
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const inputs = e.target.querySelectorAll('input');
    
    const userData = {
        name: inputs[0].value,
        email: inputs[1].value,
        password: inputs[2].value,
        childName: inputs[3].value
    };
    
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
            alert('Account created! Let the stories begin.');
            closeAuth();
            localStorage.setItem('user', JSON.stringify(data));
            updateAuthState(data);
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
