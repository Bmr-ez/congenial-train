document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth Status
    try {
        const response = await fetch('/api/me');
        if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
                initializeDashboard(data);
                document.body.classList.remove('auth-pending');
            }
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }

    // Load dynamic stats if authenticated
    if (!document.body.classList.contains('auth-pending')) {
        loadStats();
    }
});

function initializeDashboard(data) {
    const user = data.discord;
    const internal = data.internal;
    const guilds = data.guilds || [];

    // Update Sidebar User Pill
    const avatarImg = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null;

    const userPill = document.querySelector('.user-pill');
    if (userPill) {
        const avatarDiv = userPill.querySelector('.avatar');
        if (avatarImg) {
            avatarDiv.innerHTML = `<img src="${avatarImg}" style="width:100%; height:100%; border-radius:50%;">`;
        } else {
            avatarDiv.textContent = user.username.charAt(0).toUpperCase();
        }
        userPill.querySelector('.user-name').textContent = user.username;
        userPill.querySelector('.user-role').textContent = internal.levels.level >= 10 ? 'Elite Member' : 'System User';
    }

    // Update Welcome Title
    const welcomeTitle = document.querySelector('.welcome-text h2 span');
    if (welcomeTitle) {
        welcomeTitle.textContent = user.username;
    }

    const welcomeDesc = document.querySelector('.welcome-text p');
    if (welcomeDesc) {
        welcomeDesc.textContent = `Prime AI is currently connected to ${guilds.length} of your servers.`;
    }

    // Populate Guilds List
    const guildList = document.getElementById('guildList');
    if (guildList && guilds.length > 0) {
        guildList.innerHTML = '';
        guilds.slice(0, 8).forEach(guild => {
            const iconUrl = guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';

            const guildItem = document.createElement('div');
            guildItem.className = 'log-item';
            guildItem.innerHTML = `
                <div class="log-time"><img src="${iconUrl}" style="width:30px; border-radius:8px;"></div>
                <div class="log-content">
                    <strong>${guild.name}</strong><br>
                    <span style="font-size:0.8rem; opacity:0.6;">${guild.permissions_new ? 'Administrator' : 'Member'}</span>
                </div>
            `;
            guildList.appendChild(guildItem);
        });
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        // Update Stats Cards
        const totalUsersEl = document.getElementById('totalUsersVal');
        if (totalUsersEl) totalUsersEl.textContent = stats.total_users.toLocaleString();

        const totalCmdsEl = document.getElementById('totalCmdsVal');
        if (totalCmdsEl) totalCmdsEl.textContent = stats.total_commands >= 1000
            ? (stats.total_commands / 1000).toFixed(1) + 'k'
            : stats.total_commands;

        const aiReflectionsEl = document.getElementById('aiReflectionsVal');
        if (aiReflectionsEl) aiReflectionsEl.textContent = stats.ai_reflections >= 1000
            ? (stats.ai_reflections / 1000).toFixed(1) + 'k'
            : stats.ai_reflections;

        const statusLabel = document.querySelector('.status-indicator span');
        if (statusLabel) statusLabel.textContent = `SYSTEM ${stats.system_status}`;

        const uptimeVal = document.getElementById('uptimeVal');
        if (uptimeVal) {
            const h = Math.floor(stats.uptime_seconds / 3600);
            const m = Math.floor((stats.uptime_seconds % 3600) / 60);
            uptimeVal.textContent = `${h}h ${m}m`;
        }

        const ramVal = document.getElementById('ramVal');
        if (ramVal) ramVal.textContent = `${Math.round(stats.ram_usage)}%`;

        // Update Vibe Chart
        const vibeChart = document.getElementById('vibeChart');
        if (vibeChart && stats.vibe_distribution) {
            const totalVibes = Object.values(stats.vibe_distribution).reduce((a, b) => a + b, 0);
            if (totalVibes > 0) {
                vibeChart.innerHTML = '';
                const colors = {
                    'creative': 'var(--p)',
                    'technical': 'var(--s)',
                    'casual': '#fff',
                    'respectful': 'var(--t)',
                    'rude': '#ff5555'
                };

                Object.entries(stats.vibe_distribution).forEach(([vibe, count]) => {
                    const percent = Math.round((count / totalVibes) * 100);
                    const bar = document.createElement('div');
                    bar.className = 'vibe-bar';
                    bar.style = `--val: ${percent}%; --color: ${colors[vibe.toLowerCase()] || '#888'};`;
                    bar.innerHTML = `
                        <span class="v-label">${vibe.charAt(0).toUpperCase() + vibe.slice(1)}</span>
                        <div class="v-progress"></div>
                        <span class="v-percent">${percent}%</span>
                    `;
                    vibeChart.appendChild(bar);
                });
            }
        }

        // Update Activity Feed
        const activityList = document.getElementById('activityList');
        if (activityList && stats.activities && stats.activities.length > 0) {
            activityList.innerHTML = '';
            stats.activities.forEach(act => {
                const item = document.createElement('div');
                item.className = 'log-item';
                item.innerHTML = `
                    <div class="log-time">${act.time}</div>
                    <div class="log-content">
                        <strong>${act.type}:</strong> ${act.content}
                    </div>
                `;
                activityList.appendChild(item);
            });
        }
    } catch (error) {
        console.warn('Failed to load stats', error);
    }
}

// Back to Top Functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', () => {
    const btt = document.getElementById('backToTop');
    if (window.scrollY > 300) {
        btt.classList.add('active');
    } else {
        btt.classList.remove('active');
    }
});
