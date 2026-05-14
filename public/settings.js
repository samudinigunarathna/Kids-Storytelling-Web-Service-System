// ── Auth Guard ─────────────────────────────────────────────────────────────
const savedUser = localStorage.getItem('user');
const token = localStorage.getItem('token');

if (!savedUser || !token) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html?redirect=settings';
}
const user = JSON.parse(savedUser || '{}');

// API Helper for Authenticated Requests
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    // Public routes don't strictly need a token (though settings shouldn't use them)
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


// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    populateProfile();
    const welcome = document.getElementById('navWelcome');
    if (welcome) welcome.textContent = `Hi, ${user.name}! 👋`;

    // Setup form listeners
    const profileForm = document.getElementById('profileForm');
    if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) passwordForm.addEventListener('submit', handlePasswordUpdate);
});

// ── Populate Profile ─────────────────────────────────────────────────────────
function populateProfile() {
    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const childNameInput = document.getElementById('profileChildName');
    const roleInput = document.getElementById('profileRole');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (childNameInput) childNameInput.value = user.childName || '';
    if (roleInput) roleInput.value = user.role || 'user';
}

// ── Navigation ──────────────────────────────────────────────────────────────
function switchSection(sectionId) {
    // Update Sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('onclick').includes(sectionId));
    });

    // Update Content
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) targetSection.classList.add('active');
}

function goToDashboard(e) {
    e.preventDefault();
    window.location.href = 'index.html#dashboard';
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ── Profile Update ──────────────────────────────────────────────────────────
async function handleEmailUpdate() {
    const newEmail = document.getElementById('profileEmail').value;
    if (!newEmail || newEmail === user.email) {
        alert('Please enter a new email address.');
        return;
    }

    if (!confirm('Are you sure you want to change your email? You will need to use the new email for your next login.')) {
        return;
    }

    try {
        const response = await authFetch(`/api/user/update/${user._id || user.id}`, {
            method: 'PUT',
            body: JSON.stringify({ email: newEmail })
        });

        if (response.ok) {
            const newUser = await response.json();
            const mergedUser = { ...user, ...newUser };
            localStorage.setItem('user', JSON.stringify(mergedUser));
            alert('Email updated successfully! ✨');
            window.location.reload();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to update email.');
        }
    } catch (error) {
        console.error('Update error:', error);
        alert(error.message || 'Network error. Please try again.');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    const updatedData = {
        name: document.getElementById('profileName').value,
        childName: document.getElementById('profileChildName').value,
        email: document.getElementById('profileEmail').value
    };

    try {
        const response = await authFetch(`/api/user/update/${user._id || user.id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            const newUser = await response.json();
            // Update local storage
            const mergedUser = { ...user, ...newUser };
            localStorage.setItem('user', JSON.stringify(mergedUser));
            alert('Profile updated successfully! ✨');
            window.location.reload();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to update profile.');
        }
    } catch (error) {
        console.error('Update error:', error);
        alert(error.message || 'Network error. Please try again.');
    }
}

// ── Password Update ─────────────────────────────────────────────────────────
async function handlePasswordUpdate(e) {
    e.preventDefault();
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!current || !newPass || !confirm) {
        alert('Please fill in all password fields.');
        return;
    }

    if (newPass !== confirm) {
        alert('New passwords do not match!');
        return;
    }

    try {
        // In a real app, we'd verify 'current' password on the backend too.
        const response = await authFetch(`/api/user/update/${user._id || user.id}`, {
            method: 'PUT',
            body: JSON.stringify({ password: newPass })
        });

        if (response.ok) {
            alert('Password changed successfully! 🔐');
            document.getElementById('passwordForm').reset();
        } else {
            alert('Failed to change password.');
        }
    } catch (error) {
        alert(error.message || 'Network error. Please try again.');
    }
}

// ── Account Deletion ────────────────────────────────────────────────────────
async function deleteAccount() {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await authFetch(`/api/user/delete/${user._id || user.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Your account has been deleted. We are sorry to see you go! 👋');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        } else {
            alert('Failed to delete account.');
        }
    } catch (error) {
        alert(error.message || 'Network error. Please try again.');
    }
}

