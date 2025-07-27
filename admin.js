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

let isAdminLoggedIn = false;

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    setupAdminEventListeners();
});

function setupAdminEventListeners() {
    // Admin login form handler
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('adminUserId').value;
        const password = document.getElementById('adminPassword').value;
        
        if (userId === 'LikiTh@8197' && password === 'password') {
            isAdminLoggedIn = true;
            showAdminPanel();
            loadAdminData();
            alert('Admin login successful!');
        } else {
            alert('Invalid admin credentials!');
        }
    });
}

function showAdminPanel() {
    document.querySelector('.admin-login-container').style.display = 'none';
    document.getElementById('adminPanel').classList.remove('hidden');
}

function adminLogout() {
    isAdminLoggedIn = false;
    document.querySelector('.admin-login-container').style.display = 'flex';
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('adminLoginForm').reset();
}

function showAdminTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hide all content
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab and content
    event.target.classList.add('active');
    document.getElementById('admin' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    
    // Load specific data based on tab
    if (tabName === 'users') {
        loadUsersData();
    } else if (tabName === 'profiles') {
        loadProfilesData();
    } else if (tabName === 'interactions') {
        loadInteractionsData();
    }
}

function loadAdminData() {
    loadUsersData();
    loadProfilesData();
    loadInteractionsData();
}

function loadUsersData() {
    const totalUsers = DB.users.length;
    const activeUsers = DB.users.filter(u => u.active).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('inactiveUsers').textContent = inactiveUsers;
    
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    DB.users.forEach(user => {
        const userItem = createUserItem(user);
        usersList.appendChild(userItem);
    });
}

function createUserItem(user) {
    const item = document.createElement('div');
    item.className = 'user-item';
    
    const joinDate = new Date(user.createdAt).toLocaleDateString();
    
    item.innerHTML = `
        <div class="user-info">
            <h4>${user.name}</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Joined:</strong> ${joinDate}</p>
        </div>
        <div class="user-actions">
            <span class="user-status ${user.active ? 'status-active' : 'status-inactive'}">
                ${user.active ? 'Active' : 'Inactive'}
            </span>
            <button class="btn ${user.active ? 'btn-secondary' : 'btn-primary'}" 
                    onclick="toggleUserStatus('${user.id}')">
                ${user.active ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn btn-danger" onclick="deleteUser('${user.id}')" style="margin-left: 0.5rem;">
                🗑️ Delete
            </button>
        </div>
    `;
    
    return item;
}

function toggleUserStatus(userId) {
    const user = DB.users.find(u => u.id === userId);
    if (user) {
        user.active = !user.active;
        DB.save();
        loadUsersData();
        alert(`User ${user.active ? 'activated' : 'deactivated'} successfully!`);
    }
}

// NEW: Delete user functionality
function deleteUser(userId) {
    const user = DB.users.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Are you sure you want to permanently delete user "${user.name}"? This will also delete their profile and all interactions.`)) {
        // Delete user
        const userIndex = DB.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            DB.users.splice(userIndex, 1);
        }
        
        // Delete user's profile
        const profileIndex = DB.profiles.findIndex(p => p.userId === userId);
        if (profileIndex !== -1) {
            DB.profiles.splice(profileIndex, 1);
        }
        
        // Delete user's interactions
        DB.interactions = DB.interactions.filter(i => i.fromUserId !== userId);
        
        DB.save();
        loadUsersData();
        loadProfilesData(); // Refresh profiles count
        loadInteractionsData(); // Refresh interactions
        alert('User deleted successfully!');
    }
}

function loadProfilesData() {
    const totalProfiles = DB.profiles.length;
    const maleProfiles = DB.profiles.filter(p => p.gender === 'male').length;
    const femaleProfiles = DB.profiles.filter(p => p.gender === 'female').length;
    
    document.getElementById('totalProfiles').textContent = totalProfiles;
    document.getElementById('maleProfiles').textContent = maleProfiles;
    document.getElementById('femaleProfiles').textContent = femaleProfiles;
    
    const profilesList = document.getElementById('adminProfilesList');
    profilesList.innerHTML = '';
    
    DB.profiles.forEach(profile => {
        const profileCard = createAdminProfileCard(profile);
        profilesList.appendChild(profileCard);
    });
}

function createAdminProfileCard(profile) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    
    const user = DB.users.find(u => u.id === profile.userId);
    const userName = user ? user.name : 'Unknown User';
    
    const imageContent = profile.photos && profile.photos.length > 0 ? 
        `<img src="${profile.photos[0]}" alt="${profile.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
        profile.name.charAt(0).toUpperCase();
    
    card.innerHTML = `
        <div class="profile-image">
            ${imageContent}
        </div>
        <div class="profile-content">
            <h3>${profile.name}</h3>
            <p><strong>User:</strong> ${userName}</p>
            <p><strong>Age:</strong> ${profile.age}</p>
            <p><strong>Gender:</strong> ${profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</p>
            <p><strong>Description:</strong> ${profile.description.substring(0, 100)}${profile.description.length > 100 ? '...' : ''}</p>
            <div class="profile-actions">
                <button class="btn btn-danger" onclick="deleteUserProfile('${profile.id}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function deleteUserProfile(profileId) {
    if (confirm('Are you sure you want to delete this profile?')) {
        const profileIndex = DB.profiles.findIndex(p => p.id === profileId);
        if (profileIndex !== -1) {
            DB.profiles.splice(profileIndex, 1);
            DB.save();
            loadProfilesData();
            alert('Profile deleted successfully!');
        }
    }
}

function loadInteractionsData() {
    const totalLikes = DB.interactions.filter(i => i.type === 'like').length;
    const totalMessages = DB.interactions.filter(i => i.type === 'message').length;
    const totalMatchmaker = DB.interactions.filter(i => i.type === 'matchmaker').length;
    
    document.getElementById('totalLikes').textContent = totalLikes;
    document.getElementById('totalMessages').textContent = totalMessages;
    
    const interactionsList = document.getElementById('interactionsList');
    interactionsList.innerHTML = '';
    
    // Group interactions by user
    const groupedInteractions = groupInteractionsByUser();
    
    // Create summary cards for each user
    Object.keys(groupedInteractions).forEach(userId => {
        const userInteractions = groupedInteractions[userId];
        const summaryCard = createUserInteractionSummary(userInteractions);
        interactionsList.appendChild(summaryCard);
    });
    
    // Add matchmaker requests separately
    const matchmakerRequests = DB.interactions.filter(i => i.type === 'matchmaker');
    if (matchmakerRequests.length > 0) {
        const matchmakerSection = document.createElement('div');
        matchmakerSection.innerHTML = '<h4 style="margin: 2rem 0 1rem 0; color: #667eea;">Matchmaker Requests</h4>';
        interactionsList.appendChild(matchmakerSection);
        
        matchmakerRequests.forEach(request => {
            const requestCard = createMatchmakerRequestCard(request);
            interactionsList.appendChild(requestCard);
        });
    }
}

function groupInteractionsByUser() {
    const grouped = {};
    
    DB.interactions.filter(i => i.type !== 'matchmaker').forEach(interaction => {
        const userId = interaction.fromUserId;
        if (!grouped[userId]) {
            grouped[userId] = [];
        }
        grouped[userId].push(interaction);
    });
    
    return grouped;
}

function createUserInteractionSummary(userInteractions) {
    const firstInteraction = userInteractions[0];
    const userName = firstInteraction.fromUserName;
    const likes = userInteractions.filter(i => i.type === 'like').length;
    const messages = userInteractions.filter(i => i.type === 'message').length;
    const lastActivity = new Date(Math.max(...userInteractions.map(i => new Date(i.timestamp)))).toLocaleString();
    
    const summaryCard = document.createElement('div');
    summaryCard.className = 'interaction-summary-card';
    summaryCard.innerHTML = `
        <div class="interaction-summary-header" onclick="toggleUserInteractions('${firstInteraction.fromUserId}')">
            <div>
                <h4>${userName}</h4>
                <p>Likes: ${likes} | Messages: ${messages}</p>
                <p style="font-size: 0.9rem; color: #666;">Last activity: ${lastActivity}</p>
            </div>
            <div class="expand-icon">▼</div>
        </div>
        <div class="interaction-details" id="details-${firstInteraction.fromUserId}" style="display: none;">
            <div class="interaction-actions" style="margin-bottom: 1rem;">
                <button class="btn btn-danger btn-small" onclick="deleteAllUserInteractions('${firstInteraction.fromUserId}')">
                    🗑️ Delete All Interactions
                </button>
            </div>
            ${userInteractions.map(interaction => createInteractionDetail(interaction)).join('')}
        </div>
    `;
    
    return summaryCard;
}

// ENHANCED: Create interaction detail with delete AND reply buttons
function createInteractionDetail(interaction) {
    const targetProfile = DB.profiles.find(p => p.id === interaction.targetProfileId);
    const targetName = targetProfile ? targetProfile.name : 'Unknown Profile';
    const timestamp = new Date(interaction.timestamp).toLocaleString();
    
    return `
        <div class="interaction-detail" id="interaction-${interaction.id}">
            <div class="interaction-detail-header">
                <span class="interaction-type ${interaction.type === 'like' ? 'type-like' : 'type-message'}">
                    ${interaction.type === 'like' ? '❤️ Like' : '💬 Message'}
                </span>
                <span>To: ${targetName}</span>
                <span style="font-size: 0.9rem; color: #666;">${timestamp}</span>
                <div class="interaction-buttons">
                    <button class="btn btn-success btn-small" onclick="replyToInteraction('${interaction.id}')" style="margin-right: 0.5rem;">
                        🔔 Reply
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteInteraction('${interaction.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
            ${interaction.content ? `
                <div class="interaction-content">
                    ${interaction.content}
                </div>
            ` : ''}
        </div>
    `;
}

// NEW: Reply to customer interaction
function replyToInteraction(interactionId) {
    const interaction = DB.interactions.find(i => i.id === interactionId);
    if (!interaction) return;
    
    const user = DB.users.find(u => u.id === interaction.fromUserId);
    const targetProfile = DB.profiles.find(p => p.id === interaction.targetProfileId);
    
    if (!user || !targetProfile) {
        alert('User or profile not found!');
        return;
    }
    
    const interactionType = interaction.type === 'like' ? 'like' : 'message';
    const actionText = interaction.type === 'like' ? 'liked' : 'sent a message to';
    
    const replyText = prompt(
        `Reply to ${user.name} who ${actionText} ${targetProfile.name}:\n\n` +
        (interaction.content ? `Original message: "${interaction.content}"\n\n` : '') +
        'Enter your admin reply:'
    );
    
    if (replyText && replyText.trim()) {
        // Create admin reply interaction
        const adminReply = {
            id: Date.now().toString(),
            type: interaction.type === 'like' ? 'admin_like_reply' : 'admin_reply',
            fromUserId: 'admin',
            fromUserName: 'MR B Matrimony Admin',
            targetUserId: interaction.fromUserId,
            originalInteractionId: interactionId,
            content: replyText.trim(),
            timestamp: new Date().toISOString(),
            read: false
        };
        
        DB.interactions.push(adminReply);
        DB.save();
        
        alert(`Reply sent to ${user.name} successfully! They will see it in their notifications.`);
        
        // Update the interaction display to show it has been replied to
        const interactionElement = document.getElementById(`interaction-${interactionId}`);
        if (interactionElement) {
            const replyButton = interactionElement.querySelector('.btn-success');
            if (replyButton) {
                replyButton.innerHTML = '✅ Replied';
                replyButton.disabled = true;
                replyButton.style.opacity = '0.6';
            }
        }
    }
}

// NEW: Delete individual interaction
function deleteInteraction(interactionId) {
    if (confirm('Are you sure you want to delete this interaction?')) {
        const interactionIndex = DB.interactions.findIndex(i => i.id === interactionId);
        if (interactionIndex !== -1) {
            DB.interactions.splice(interactionIndex, 1);
            DB.save();
            
            // Remove the interaction from the DOM
            const interactionElement = document.getElementById(`interaction-${interactionId}`);
            if (interactionElement) {
                interactionElement.remove();
            }
            
            // Refresh the data counts
            loadInteractionsData();
            alert('Interaction deleted successfully!');
        }
    }
}

// NEW: Delete all interactions for a specific user
function deleteAllUserInteractions(userId) {
    const user = DB.users.find(u => u.id === userId);
    const userName = user ? user.name : 'Unknown User';
    
    if (confirm(`Are you sure you want to delete ALL interactions from user "${userName}"? This action cannot be undone.`)) {
        const beforeCount = DB.interactions.length;
        DB.interactions = DB.interactions.filter(i => i.fromUserId !== userId);
        const deletedCount = beforeCount - DB.interactions.length;
        
        DB.save();
        loadInteractionsData(); // Refresh the entire interactions list
        alert(`Successfully deleted ${deletedCount} interactions from ${userName}!`);
    }
}

function createMatchmakerRequestCard(request) {
    const timestamp = new Date(request.timestamp).toLocaleString();
    
    const card = document.createElement('div');
    card.className = 'matchmaker-request-card';
    card.innerHTML = `
        <div class="matchmaker-header">
            <h4>${request.fromUserName}</h4>
            <span class="interaction-type" style="background: #ff6b6b; color: white;">
                🤝 Matchmaker Request
            </span>
            <button class="btn btn-danger btn-small" onclick="deleteMatchmakerRequest('${request.id}')" style="margin-left: auto;">
                🗑️ Delete
            </button>
        </div>
        <div class="matchmaker-details">
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>Phone:</strong> ${request.phone}</p>
            <p><strong>Service:</strong> ${request.service.replace('-', ' ').toUpperCase()}</p>
            <p><strong>Date:</strong> ${timestamp}</p>
        </div>
        <div class="matchmaker-message">
            <strong>Message:</strong>
            <p>${request.content}</p>
        </div>
    `;
    
    return card;
}

// NEW: Delete matchmaker request
function deleteMatchmakerRequest(requestId) {
    if (confirm('Are you sure you want to delete this matchmaker request?')) {
        const requestIndex = DB.interactions.findIndex(i => i.id === requestId);
        if (requestIndex !== -1) {
            DB.interactions.splice(requestIndex, 1);
            DB.save();
            loadInteractionsData(); // Refresh the interactions list
            alert('Matchmaker request deleted successfully!');
        }
    }
}

function toggleUserInteractions(userId) {
    const details = document.getElementById(`details-${userId}`);
    const icon = details.previousElementSibling.querySelector('.expand-icon');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        icon.textContent = '▲';
    } else {
        details.style.display = 'none';
        icon.textContent = '▼';
    }
}
// NEW: Reply to customer interaction
function replyToInteraction(interactionId) {
    const interaction = DB.interactions.find(i => i.id === interactionId);
    if (!interaction) return;
    
    const user = DB.users.find(u => u.id === interaction.fromUserId);
    const targetProfile = DB.profiles.find(p => p.id === interaction.targetProfileId);
    
    if (!user || !targetProfile) {
        alert('User or profile not found!');
        return;
    }
    
    const actionText = interaction.type === 'like' ? 'liked' : 'sent a message to';
    
    const replyText = prompt(
        `Reply to ${user.name} who ${actionText} ${targetProfile.name}:\n\n` +
        (interaction.content ? `Original message: "${interaction.content}"\n\n` : '') +
        'Enter your admin reply:'
    );
    
    if (replyText && replyText.trim()) {
        const adminReply = {
            id: Date.now().toString(),
            type: interaction.type === 'like' ? 'admin_like_reply' : 'admin_reply',
            fromUserId: 'admin',
            fromUserName: 'MR B Matrimony Admin',
            targetUserId: interaction.fromUserId,
            originalInteractionId: interactionId,
            content: replyText.trim(),
            timestamp: new Date().toISOString(),
            read: false
        };
        
        DB.interactions.push(adminReply);
        DB.save();
        
        alert(`Reply sent to ${user.name} successfully!`);
    }
}

// Update your existing createInteractionDetail function to include reply button
function createInteractionDetail(interaction) {
    const targetProfile = DB.profiles.find(p => p.id === interaction.targetProfileId);
    const targetName = targetProfile ? targetProfile.name : 'Unknown Profile';
    const timestamp = new Date(interaction.timestamp).toLocaleString();
    
    return `
        <div class="interaction-detail">
            <div class="interaction-detail-header">
                <span class="interaction-type ${interaction.type === 'like' ? 'type-like' : 'type-message'}">
                    ${interaction.type === 'like' ? '❤️ Like' : '💬 Message'}
                </span>
                <span>To: ${targetName}</span>
                <span style="font-size: 0.9rem; color: #666;">${timestamp}</span>
                <button class="btn btn-success btn-small" onclick="replyToInteraction('${interaction.id}')" style="margin-left: auto;">
                    🔔 Reply
                </button>
            </div>
            ${interaction.content ? `
                <div class="interaction-content">
                    ${interaction.content}
                </div>
            ` : ''}
        </div>
    `;
}
