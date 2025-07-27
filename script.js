// Database simulation using localStorage
const DB = {
    users: JSON.parse(localStorage.getItem('matrimony_users') || '[]'),
    profiles: JSON.parse(localStorage.getItem('matrimony_profiles') || '[]'),
    interactions: JSON.parse(localStorage.getItem('matrimony_interactions') || '[]'),
    
    save() {
        localStorage.setItem('matrimony_users', JSON.stringify(this.users));
        localStorage.setItem('matrimony_profiles', JSON.stringify(this.profiles));
        localStorage.setItem('matrimony_interactions', JSON.stringify(this.interactions));
    }
};

// Current user session
let currentUser = JSON.parse(sessionStorage.getItem('current_user') || 'null');
let likesUsed = JSON.parse(sessionStorage.getItem('likes_used') || '0');
let currentProfileFilter = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateAuthButtons();
    loadProfiles();
    
    // Add some sample profiles if none exist
    if (DB.profiles.length === 0) {
        addSampleProfiles();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Add scroll listener for navbar
    setupScrollListener();
});

function setupScrollListener() {
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Load profiles when scrolling to profiles section
    if (sectionId === 'profiles') {
        loadProfiles();
        checkProfileAccess();
    }
}

function addSampleProfiles() {
    const sampleProfiles = [
        {
            id: 'sample1',
            userId: 'sample1',
            name: 'Priya Sharma',
            gender: 'female',
            age: 25,
            photos: [],
            description: 'Software engineer with a passion for music and travel. Love to explore new places and cultures.',
            summary: 'Looking for a caring and understanding life partner.'
        },
        {
            id: 'sample2',
            userId: 'sample2',
            name: 'Rahul Kumar',
            gender: 'male',
            age: 28,
            photos: [],
            description: 'Doctor by profession, loves reading and outdoor activities. Passionate about helping others.',
            summary: 'Seeking a loving and supportive partner.'
        },
        {
            id: 'sample3',
            userId: 'sample3',
            name: 'Anita Reddy',
            gender: 'female',
            age: 26,
            photos: [],
            description: 'Teacher with interests in art and cooking. Enjoy spending time with family and friends.',
            summary: 'Looking for someone who values family and tradition.'
        },
        {
            id: 'sample4',
            userId: 'sample4',
            name: 'Vikram Singh',
            gender: 'male',
            age: 30,
            photos: [],
            description: 'Business owner with a love for sports and adventure. Always ready for new challenges.',
            summary: 'Want to find my soulmate to share life adventures.'
        }
    ];
    
    DB.profiles.push(...sampleProfiles);
    DB.save();
}

function setupEventListeners() {
    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = DB.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            if (user.active) {
                currentUser = user;
                sessionStorage.setItem('current_user', JSON.stringify(user));
                likesUsed = 0;
                sessionStorage.setItem('likes_used', '0');
                updateAuthButtons();
                closeModal('loginModal');
                alert('Login successful!');
                loadProfiles();
            } else {
                alert('Your account has been deactivated. Please contact admin.');
            }
        } else {
            alert('Invalid email or password!');
        }
    });

    // Register form handler
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const phone = document.getElementById('registerPhone').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        // Check if email already exists
        if (DB.users.find(u => u.email === email)) {
            alert('Email already registered!');
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            name,
            phone,
            email,
            password,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        DB.users.push(newUser);
        DB.save();
        
        alert('Registration successful! Please login.');
        closeModal('registerModal');
        document.getElementById('registerForm').reset();
    });

    // Profile form handler
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please login first!');
            return;
        }
        
        // Get uploaded photos
        const photos = getUploadedPhotos();
        
        const profileData = {
            id: document.getElementById('profileForm').dataset.profileId || Date.now().toString(),
            userId: currentUser.id,
            name: document.getElementById('profileName').value,
            gender: document.getElementById('profileGender').value,
            age: parseInt(document.getElementById('profileAge').value),
            photos: photos,
            description: document.getElementById('profileDescription').value,
            summary: document.getElementById('profileSummary').value,
            createdAt: new Date().toISOString()
        };
        
        const existingIndex = DB.profiles.findIndex(p => p.id === profileData.id);
        
        if (existingIndex !== -1) {
            DB.profiles[existingIndex] = profileData;
            alert('Profile updated successfully!');
        } else {
            DB.profiles.push(profileData);
            alert('Profile created successfully! Now you can view other profiles.');
        }
        
        DB.save();
        closeModal('profileModal');
        document.getElementById('profileForm').reset();
        clearPhotoPreview();
        loadProfiles(); // This will remove the blur and show profiles
    });

    // Message form handler
    document.getElementById('messageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please login first!');
            return;
        }
        
        const targetProfileId = document.getElementById('messageForm').dataset.targetProfile;
        const messageText = document.getElementById('messageText').value;
        
        const interaction = {
            id: Date.now().toString(),
            fromUserId: currentUser.id,
            fromUserName: currentUser.name,
            targetProfileId: targetProfileId,
            type: 'message',
            content: messageText,
            timestamp: new Date().toISOString()
        };
        
        DB.interactions.push(interaction);
        DB.save();
        
        alert('Message sent successfully!');
        closeModal('messageModal');
        document.getElementById('messageForm').reset();
    });

    // Matchmaker form handler
    document.getElementById('matchmakerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const matchmakerRequest = {
            id: Date.now().toString(),
            fromUserId: currentUser ? currentUser.id : 'guest',
            fromUserName: document.getElementById('matchmakerName').value,
            email: document.getElementById('matchmakerEmail').value,
            phone: document.getElementById('matchmakerPhone').value,
            service: document.getElementById('matchmakerService').value,
            type: 'matchmaker',
            content: document.getElementById('matchmakerMessage').value,
            timestamp: new Date().toISOString()
        };
        
        DB.interactions.push(matchmakerRequest);
        DB.save();
        
        alert('Your request has been sent to our matchmaker. We will contact you soon!');
        closeModal('matchmakerModal');
        document.getElementById('matchmakerForm').reset();
    });

    // Photo upload handler
    document.getElementById('profilePhotos').addEventListener('change', function(e) {
        handlePhotoUpload(e.target.files);
    });
}

// NEW: Customer notifications and admin replies functionality
function loadCustomerReplies() {
    if (!currentUser) return [];
    
    const customerReplies = DB.interactions.filter(i => 
        (i.type === 'admin_reply' || i.type === 'admin_like_reply') && 
        i.targetUserId === currentUser.id
    );
    
    return customerReplies;
}

function showCustomerNotifications() {
    if (!currentUser) {
        alert('Please login first!');
        return;
    }
    
    showModal('notificationsModal');
    loadNotifications();
}

function loadNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    const replies = loadCustomerReplies();
    container.innerHTML = '';
    
    if (replies.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No admin replies yet.</p>';
        return;
    }
    
    replies.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    replies.forEach(reply => {
        const notificationCard = createNotificationCard(reply);
        container.appendChild(notificationCard);
    });
}

function createNotificationCard(reply) {
    const card = document.createElement('div');
    card.className = 'notification-card';
    
    const timestamp = new Date(reply.timestamp).toLocaleString();
    const isLikeReply = reply.type === 'admin_like_reply';
    
    // Get original interaction details
    const originalInteraction = DB.interactions.find(i => i.id === reply.originalInteractionId);
    const targetProfile = DB.profiles.find(p => p.id === originalInteraction?.targetProfileId);
    const targetName = targetProfile ? targetProfile.name : 'Unknown Profile';
    
    card.innerHTML = `
        <div class="notification-header">
            <div class="notification-type ${isLikeReply ? 'type-like-reply' : 'type-message-reply'}">
                ${isLikeReply ? '❤️ Admin replied to your like' : '💬 Admin replied to your message'}
            </div>
            <span class="notification-time">${timestamp}</span>
        </div>
        <div class="notification-content">
            <p><strong>Your ${isLikeReply ? 'like' : 'message'} to:</strong> ${targetName}</p>
            ${!isLikeReply && originalInteraction ? `
                <div class="original-message">
                    <strong>Your original message:</strong>
                    <p>"${originalInteraction.content}"</p>
                </div>
            ` : ''}
            <div class="admin-reply">
                <strong>Admin Reply:</strong>
                <p>${reply.content}</p>
                <p class="admin-signature">- MR B Matrimony Team</p>
            </div>
        </div>
        <button class="btn btn-small btn-secondary" onclick="markAsRead('${reply.id}')">
            Mark as Read
        </button>
    `;
    
    return card;
}

function markAsRead(replyId) {
    const reply = DB.interactions.find(i => i.id === replyId);
    if (reply) {
        reply.read = true;
        DB.save();
        loadNotifications();
        updateNotificationsBadge();
    }
}

function updateNotificationsBadge() {
    const badge = document.getElementById('notificationsBadge');
    if (!badge || !currentUser) return;
    
    const unreadReplies = DB.interactions.filter(i => 
        (i.type === 'admin_reply' || i.type === 'admin_like_reply') && 
        i.targetUserId === currentUser.id && 
        !i.read
    );
    
    if (unreadReplies.length > 0) {
        badge.textContent = unreadReplies.length;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Photo upload functions
let uploadedPhotos = [];

function handlePhotoUpload(files) {
    if (files.length + uploadedPhotos.length > 5) {
        alert('Maximum 5 photos allowed!');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedPhotos.push(e.target.result);
                updatePhotoPreview();
            };
            reader.readAsDataURL(file);
        } else {
            alert('Only JPG and PNG files are allowed!');
        }
    });
}

function updatePhotoPreview() {
    const container = document.getElementById('photoPreview');
    container.innerHTML = '';
    
    uploadedPhotos.forEach((photo, index) => {
        const preview = document.createElement('div');
        preview.className = 'photo-preview';
        preview.innerHTML = `
            <img src="${photo}" alt="Photo ${index + 1}">
            <button class="photo-remove" onclick="removePhoto(${index})">&times;</button>
        `;
        container.appendChild(preview);
    });
}

function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    updatePhotoPreview();
}

function clearPhotoPreview() {
    uploadedPhotos = [];
    updatePhotoPreview();
}

function getUploadedPhotos() {
    return [...uploadedPhotos];
}

// Navigation functions (keeping for backward compatibility)
function showPage(pageId) {
    // For backward compatibility, redirect to scroll function
    scrollToSection(pageId);
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    
    if (modalId === 'profileModal') {
        loadUserProfile();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Authentication functions
function updateAuthButtons() {
    const authButtons = document.getElementById('authButtons');
    const userButtons = document.getElementById('userButtons');
    const welcomeUser = document.getElementById('welcomeUser');
    const likeCounter = document.getElementById('likeCounter');

    if (currentUser) {
        authButtons.classList.add('hidden');
        userButtons.classList.remove('hidden');
        welcomeUser.textContent = `Welcome, ${currentUser.name}`;
        likeCounter.classList.remove('hidden');
        updateLikeCounter();
        
        // Update notifications badge
        updateNotificationsBadge();
    } else {
        authButtons.classList.remove('hidden');
        userButtons.classList.add('hidden');
        likeCounter.classList.add('hidden');
    }
}

function updateLikeCounter() {
    document.getElementById('likesLeft').textContent = Math.max(0, 5 - likesUsed);
}

function logout() {
    currentUser = null;
    likesUsed = 0;
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('likes_used');
    updateAuthButtons();
    scrollToSection('home');
    loadProfiles();
}

// Profile management
function loadUserProfile() {
    if (!currentUser) return;
    
    const userProfile = DB.profiles.find(p => p.userId === currentUser.id);
    
    if (userProfile) {
        document.getElementById('profileModalTitle').textContent = 'Edit Profile';
        document.getElementById('profileName').value = userProfile.name;
        document.getElementById('profileGender').value = userProfile.gender;
        document.getElementById('profileAge').value = userProfile.age;
        document.getElementById('profileDescription').value = userProfile.description;
        document.getElementById('profileSummary').value = userProfile.summary;
        document.getElementById('profileForm').dataset.profileId = userProfile.id;
        document.getElementById('deleteProfileBtn').style.display = 'block';
        
        // Load existing photos
        if (userProfile.photos) {
            uploadedPhotos = [...userProfile.photos];
            updatePhotoPreview();
        }
    } else {
        document.getElementById('profileModalTitle').textContent = 'Create Profile';
        document.getElementById('profileForm').reset();
        document.getElementById('deleteProfileBtn').style.display = 'none';
        delete document.getElementById('profileForm').dataset.profileId;
        clearPhotoPreview();
    }
}

function deleteProfile() {
    if (!currentUser) return;
    
    if (confirm('Are you sure you want to delete your profile?')) {
        const profileIndex = DB.profiles.findIndex(p => p.userId === currentUser.id);
        if (profileIndex !== -1) {
            DB.profiles.splice(profileIndex, 1);
            DB.save();
            alert('Profile deleted successfully!');
            closeModal('profileModal');
            loadProfiles(); // This will blur profiles again
        }
    }
}

// Profile display functions
function loadProfiles() {
    const container = document.getElementById('profilesContainer');
    if (!container) return;
    
    let profiles = DB.profiles;
    
    // Filter profiles based on current filter
    if (currentProfileFilter !== 'all') {
        profiles = profiles.filter(p => p.gender === currentProfileFilter);
    }
    
    // Exclude current user's profile if logged in
    if (currentUser) {
        profiles = profiles.filter(p => p.userId !== currentUser.id);
    }
    
    container.innerHTML = '';
    
    profiles.forEach(profile => {
        const profileCard = createProfileCard(profile);
        container.appendChild(profileCard);
    });
    
    // CRITICAL: Check if user needs to create profile to view others
    checkProfileViewAccess();
}

// ENHANCED: Strict profile access control - prevents viewing without creating profile
function checkProfileViewAccess() {
    const container = document.getElementById('profilesContainer');
    if (!container) return;
    
    // Remove any existing overlays first
    const existingOverlay = document.querySelector('.profile-required-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const existingBlurOverlay = container.parentElement.querySelector('.blur-overlay');
    if (existingBlurOverlay) {
        existingBlurOverlay.remove();
    }
    
    if (!currentUser) {
        // Not logged in - show login message and blur profiles
        container.classList.add('blurred');
        const overlay = document.createElement('div');
        overlay.className = 'blur-overlay';
        overlay.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                 background: rgba(102, 126, 234, 0.95); color: white; padding: 2rem 3rem; 
                 border-radius: 25px; font-weight: 600; text-align: center; font-size: 1.1rem;
                 box-shadow: 0 10px 30px rgba(0,0,0,0.3); backdrop-filter: blur(10px);">
                🔒 Please login to view profiles
            </div>
        `;
        container.parentElement.style.position = 'relative';
        container.parentElement.appendChild(overlay);
        return;
    }
    
    // Logged in - check if user has created their profile
    const userProfile = DB.profiles.find(p => p.userId === currentUser.id);
    
    if (!userProfile) {
        // User is logged in but has NOT created a profile - BLUR PROFILES and show message
        container.classList.add('blurred');
        
        const overlay = document.createElement('div');
        overlay.className = 'profile-required-overlay';
        overlay.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                 background: rgba(0, 0, 0, 0.8); z-index: 9999; display: flex; 
                 align-items: center; justify-content: center;">
                <div style="background: white; padding: 3rem; border-radius: 20px; 
                     text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">👤</div>
                    <h2 style="color: #333; margin-bottom: 1rem;">Create Your Profile First!</h2>
                    <p style="color: #666; margin-bottom: 2rem; line-height: 1.6;">
                        You must create and save your profile before you can view other profiles. 
                        This ensures all members are serious about finding their perfect match.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-primary" onclick="showModal('profileModal'); document.querySelector('.profile-required-overlay').remove();" 
                                style="padding: 1rem 2rem; font-size: 1rem;">
                            Create Profile Now
                        </button>
                        <button class="btn btn-secondary" onclick="document.querySelector('.profile-required-overlay').remove();" 
                                style="padding: 1rem 2rem; font-size: 1rem;">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        return;
    }
    
    // User has profile - show profiles normally (remove blur)
    container.classList.remove('blurred');
}

function createProfileCard(profile) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    
    // Create photo slider
    const photoSlider = createPhotoSlider(profile.photos || [], profile.name);
    
    card.innerHTML = `
        ${photoSlider}
        <div class="profile-content">
            <h3>${profile.name}</h3>
            <p><strong>Age:</strong> ${profile.age}</p>
            <p><strong>Gender:</strong> ${profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</p>
            <p><strong>Summary:</strong> ${profile.summary || 'No summary provided'}</p>
            <div class="profile-actions">
                ${currentUser ? `
                    <button class="btn btn-primary" onclick="likeProfile('${profile.id}')" ${likesUsed >= 5 ? 'disabled' : ''}>
                        ❤️ Like
                    </button>
                    <button class="btn btn-secondary" onclick="sendMessage('${profile.id}')">
                        💬 Message
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

function createPhotoSlider(photos, name) {
    if (!photos || photos.length === 0) {
        return `
            <div class="profile-image">
                ${name.charAt(0).toUpperCase()}
            </div>
        `;
    }
    
    if (photos.length === 1) {
        return `
            <div class="profile-image">
                <img src="${photos[0]}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
        `;
    }
    
    const sliderId = `slider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const slides = photos.map(photo => 
        `<div class="photo-slide"><img src="${photo}" alt="${name}"></div>`
    ).join('');
    
    const indicators = photos.map((_, index) => 
        `<div class="photo-indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide('${sliderId}', ${index})"></div>`
    ).join('');
    
    return `
        <div class="photo-slider" id="${sliderId}">
            <div class="photo-slider-container">
                ${slides}
            </div>
            ${photos.length > 1 ? `
                <button class="photo-nav prev" onclick="previousSlide('${sliderId}')">&lt;</button>
                <button class="photo-nav next" onclick="nextSlide('${sliderId}')">&gt;</button>
                <div class="photo-indicators">
                    ${indicators}
                </div>
            ` : ''}
        </div>
    `;
}

// Photo slider functions
function nextSlide(sliderId) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const container = slider.querySelector('.photo-slider-container');
    const slides = slider.querySelectorAll('.photo-slide');
    const indicators = slider.querySelectorAll('.photo-indicator');
    
    let currentIndex = 0;
    indicators.forEach((indicator, index) => {
        if (indicator.classList.contains('active')) {
            currentIndex = index;
        }
    });
    
    const nextIndex = (currentIndex + 1) % slides.length;
    container.style.transform = `translateX(-${nextIndex * 100}%)`;
    
    indicators.forEach(indicator => indicator.classList.remove('active'));
    indicators[nextIndex].classList.add('active');
}

function previousSlide(sliderId) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const container = slider.querySelector('.photo-slider-container');
    const slides = slider.querySelectorAll('.photo-slide');
    const indicators = slider.querySelectorAll('.photo-indicator');
    
    let currentIndex = 0;
    indicators.forEach((indicator, index) => {
        if (indicator.classList.contains('active')) {
            currentIndex = index;
        }
    });
    
    const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    container.style.transform = `translateX(-${prevIndex * 100}%)`;
    
    indicators.forEach(indicator => indicator.classList.remove('active'));
    indicators[prevIndex].classList.add('active');
}

function goToSlide(sliderId, index) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const container = slider.querySelector('.photo-slider-container');
    const indicators = slider.querySelectorAll('.photo-indicator');
    
    container.style.transform = `translateX(-${index * 100}%)`;
    
    indicators.forEach(indicator => indicator.classList.remove('active'));
    indicators[index].classList.add('active');
}

function filterProfiles(filter) {
    currentProfileFilter = filter;
    loadProfiles();
    
    // Update filter button styles
    document.querySelectorAll('.filter-buttons button').forEach(btn => {
        btn.className = 'btn btn-secondary';
    });
    
    const buttons = document.querySelectorAll('.filter-buttons button');
    if (filter === 'all') {
        buttons[0].className = 'btn btn-primary';
    } else if (filter === 'male') {
        buttons[1].className = 'btn btn-primary';
    } else if (filter === 'female') {
        buttons[2].className = 'btn btn-primary';
    }
}

function checkProfileAccess() {
    // Additional access checks can be implemented here
    checkProfileViewAccess();
}

// Interaction functions - ONLY work if user has created profile
function likeProfile(profileId) {
    if (!currentUser) {
        alert('Please login first!');
        return;
    }
    
    // Check if user has created their profile
    const userProfile = DB.profiles.find(p => p.userId === currentUser.id);
    if (!userProfile) {
        alert('Please create your profile first before liking other profiles!');
        showModal('profileModal');
        return;
    }
    
    if (likesUsed >= 5) {
        alert('You have reached the maximum number of likes (5) for today!');
        return;
    }
    
    // Check if already liked
    const existingLike = DB.interactions.find(i => 
        i.fromUserId === currentUser.id && 
        i.targetProfileId === profileId && 
        i.type === 'like'
    );
    
    if (existingLike) {
        alert('You have already liked this profile!');
        return;
    }
    
    const interaction = {
        id: Date.now().toString(),
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        targetProfileId: profileId,
        type: 'like',
        content: '',
        timestamp: new Date().toISOString()
    };
    
    DB.interactions.push(interaction);
    DB.save();
    
    likesUsed++;
    sessionStorage.setItem('likes_used', likesUsed.toString());
    updateLikeCounter();
    
    alert('Profile liked successfully!');
    loadProfiles();
}

function sendMessage(profileId) {
    if (!currentUser) {
        alert('Please login first!');
        return;
    }
    
    // Check if user has created their profile
    const userProfile = DB.profiles.find(p => p.userId === currentUser.id);
    if (!userProfile) {
        alert('Please create your profile first before sending messages!');
        showModal('profileModal');
        return;
    }
    
    document.getElementById('messageForm').dataset.targetProfile = profileId;
    showModal('messageModal');
}

// Click outside modal to close
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
