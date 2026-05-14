// ── Auth Guard ─────────────────────────────────────────────────────────────
const savedUser = localStorage.getItem('user');
if (!savedUser) {
    window.location.href = 'index.html?redirect=settings';
}
const user = JSON.parse(savedUser || '{}');

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    populateProfile();
    document.getElementById('navWelcome').textContent = `Hi, ${user.name}! 👋`;

    // Setup form listeners
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordUpdate);
});

// ── Populate Profile ─────────────────────────────────────────────────────────
function populateProfile() {
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profileChildName').value = user.childName || '';
    document.getElementById('profileRole').value = user.role || 'user';
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
    document.getElementById(`${sectionId}Section`).classList.add('active');
}

function goToDashboard(e) {
    e.preventDefault();
    window.location.href = 'index.html#dashboard';
}

function logout() {
    localStorage.removeItem('user');
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
        const response = await fetch(`/api/user/update/${user._id || user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
        alert('Network error. Please try again.');
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
        const response = await fetch(`/api/user/update/${user._id || user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
        alert('Network error. Please try again.');
    }
}

// ── Password Update (Simulated) ──────────────────────────────────────────────
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
        const response = await fetch(`/api/user/update/${user._id || user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPass })
        });

        if (response.ok) {
            alert('Password changed successfully! 🔐');
            document.getElementById('passwordForm').reset();
        } else {
            alert('Failed to change password.');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// ── Account Deletion ────────────────────────────────────────────────────────
async function deleteAccount() {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/user/delete/${user._id || user.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Your account has been deleted. We are sorry to see you go! 👋');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        } else {
            alert('Failed to delete account.');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}
