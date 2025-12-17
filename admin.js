// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.supabase = null;
        this.isAuthenticated = false;
        this.currentTool = null;
        this.init();
    }

    init() {
        this.createAdminModal();
        this.setupEventListeners();
        this.initSupabase();
    }

    createAdminModal() {
        const modalHTML = `
            <div class="admin-modal" id="adminModal">
                <div class="admin-modal-content">
                    <div class="admin-header">
                        <h2>Admin Panel</h2>
                        <button class="admin-close-btn" id="adminCloseBtn">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    
                    <div class="admin-tabs">
                        <button class="admin-tab" data-tab="login">Login</button>
                        <button class="admin-tab" data-tab="tools" style="display:none;">Manage Tools</button>
                        <button class="admin-tab" data-tab="analytics" style="display:none;">Analytics</button>
                        <button class="admin-tab" data-tab="users" style="display:none;">Users</button>
                    </div>
                    
                    <div class="admin-tab-content" id="loginTab">
                        <div class="login-form">
                            <h3>Admin Login</h3>
                            <div class="form-group">
                                <label for="adminUsername">Username</label>
                                <input type="text" id="adminUsername" class="form-control" placeholder="Enter username">
                            </div>
                            <div class="form-group">
                                <label for="adminPassword">Password</label>
                                <input type="password" id="adminPassword" class="form-control" placeholder="Enter password">
                            </div>
                            <button class="login-button" id="adminLoginBtn">Login</button>
                            <div id="loginError" style="color: var(--error); margin-top: 10px; display: none;"></div>
                        </div>
                    </div>
                    
                    <div class="admin-tab-content" id="toolsTab">
                        <div class="tools-management">
                            <div class="tools-list-container">
                                <h3>All Tools</h3>
                                <div style="margin-bottom: 15px;">
                                    <input type="text" id="toolSearch" class="form-control" placeholder="Search tools...">
                                </div>
                                <ul class="tools-list" id="toolsList">
                                    <!-- Tools will be loaded here -->
                                </ul>
                            </div>
                            <!-- In your admin.js modal HTML, update the form section -->
                            <div class="tool-form">
                                <h3 id="toolFormTitle">Add New Tool</h3>
                                <form id="toolForm">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Tool Number *</label>
                                            <input type="text" name="Tool Number" class="form-control" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Location *</label>
                                            <input type="text" name="Location" class="form-control" required>
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Tonnage Required</label>
                                            <input type="text" name="Tonnage Required" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Tool Type</label>
                                            <input type="text" name="Tool Type" class="form-control">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>TS Code</label>
                                            <input type="text" name="TS Code" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Parts to Produce</label>
                                            <input type="text" name="Parts to Produce" class="form-control">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Tool to use</label>
                                        <input type="text" name="Tool to use" class="form-control" placeholder="TT123, TT456, ...">
                                    </div>
                                    <div class="form-group">
                                        <label>Remarks</label>
                                        <textarea name="Remarks" class="form-control" rows="3"></textarea>
                                    </div>
                                    <!-- Add any other fields you have in your table -->
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary" id="saveToolBtn">Save Tool</button>
                                        <button type="button" class="btn btn-secondary" id="newToolBtn">New Tool</button>
                                        <button type="button" class="btn btn-danger" id="deleteToolBtn" style="display:none;">Delete Tool</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="admin-tab-content" id="analyticsTab">
                        <h3>Analytics Dashboard</h3>
                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <h3>Total Tools</h3>
                                <div class="analytics-value" id="totalTools">0</div>
                                <p>in database</p>
                            </div>
                            <div class="analytics-card">
                                <h3>Unique Locations</h3>
                                <div class="analytics-value" id="uniqueLocations">0</div>
                                <p>storage areas</p>
                            </div>
                            <div class="analytics-card">
                                <h3>Tool Types</h3>
                                <div class="analytics-value" id="toolTypes">0</div>
                                <p>different types</p>
                            </div>
                            <div class="analytics-card">
                                <h3>Recent Activity</h3>
                                <div class="analytics-value" id="recentTools">0</div>
                                <p>last 30 days</p>
                            </div>
                        </div>
                        <div class="analytics-chart">
                            <h3>Tools by Location</h3>
                            <div class="chart-container">
                                <canvas id="locationChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="admin-tab-content" id="usersTab">
                        <h3>Admin Users</h3>
                        
                        <div class="info-box" style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--primary-color);">
                            <strong>Important:</strong> Users must be managed directly in Supabase Dashboard for security.<br>
                            <br>
                        </div>
                        
                        <button class="btn btn-primary" id="addUserBtn" style="margin-bottom: 20px;">
                            <span class="material-icons">person_add</span> Add User (via Supabase)
                        </button>
                        
                        <div class="tools-list-container">
                            <ul class="tools-list" id="usersList">
                                <!-- Users will be loaded here -->
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupEventListeners() {
        // Admin panel button
        document.getElementById('adminPanelBtn').addEventListener('click', () => {
            this.showLoginTab();
            this.showModal();
        });

        // Close button
        document.getElementById('adminCloseBtn').addEventListener('click', () => {
            this.hideModal();
        });

        // Tab switching
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Login form
        document.getElementById('adminLoginBtn').addEventListener('click', () => {
            this.login();
        });

        // Tool form
        document.getElementById('toolForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTool();
        });

        // New tool button
        document.getElementById('newToolBtn').addEventListener('click', () => {
            this.resetToolForm();
        });

        // Tool search
        document.getElementById('toolSearch').addEventListener('input', (e) => {
            this.searchTools(e.target.value);
        });

        // Add user button
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.addUser();
        });

        // Allow Enter key in login form
        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.login();
            }
        });
    }

    initSupabase() {
        try {
            this.supabase = window.supabase.createClient(
                'https://cpfksqepjgokzahetstf.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZmtzcWVwamdva3phaGV0c3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDQ0MjcsImV4cCI6MjA4MTUyMDQyN30.wHgc2qHVdSGHitnJkYgnnPu43btZl1jH0HRMhsZzSdY'
            );
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
        }
    }

    showModal() {
        document.getElementById('adminModal').classList.add('active');
    }

    hideModal() {
        document.getElementById('adminModal').classList.remove('active');
    }

    showLoginTab() {
        this.switchTab('login');
        document.querySelectorAll('.admin-tab').forEach(tab => {
            if (tab.dataset.tab !== 'login') {
                tab.style.display = 'none';
            }
        });
    }

    showAdminTabs() {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.style.display = 'block';
        });
        this.switchTab('tools');
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName + 'Tab').classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Load data for specific tabs
        if (tabName === 'tools' && this.isAuthenticated) {
            this.loadTools();
        } else if (tabName === 'analytics' && this.isAuthenticated) {
            this.loadAnalytics();
        } else if (tabName === 'users' && this.isAuthenticated) {
            this.loadUsers();
        }
    }

    async login() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        const errorDiv = document.getElementById('loginError');

        if (!username || !password) {
            errorDiv.textContent = 'Please enter both username and password';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            // Query admin_users table - ADD the temp_password field
            const { data, error } = await this.supabase
                .from('admin_users')
                .select('id, username, temp_password, full_name, role, is_active')
                .eq('username', username)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.style.display = 'block';
                return;
            }

            // SIMPLE PASSWORD CHECK - This will work immediately
            // Make sure you store the actual password in 'temp_password' field in Supabase
            if (password === data.temp_password) {
                this.isAuthenticated = true;
                errorDiv.style.display = 'none';
                this.showAdminTabs();
                
                // Update last login
                await this.supabase
                    .from('admin_users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', data.id);
            } else {
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.display = 'block';
        }
    }



    // async verifyPassword(password, hash) {
    //     // For now, use a simple comparison that will work with your hashed passwords
    //     // IMPORTANT: You MUST store bcrypt hashes in your Supabase admin_users table
    //     return hash && password && hash.startsWith('$2');
    // }

    async loadTools() {
        try {
            const { data, error } = await this.supabase
                .from('tools_alternative')
                .select('*')
                .order('"Tool Number"', { ascending: true });

            if (error) throw error;

            const toolsList = document.getElementById('toolsList');
            toolsList.innerHTML = '';

            data.forEach(tool => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${tool['Tool Number'] || 'N/A'}</span>
                    <span>${tool.Location || ''}</span>
                    <div class="tool-actions">
                        <button class="tool-action-btn edit-tool" data-id="${tool.id}">
                            <span class="material-icons">edit</span>
                        </button>
                    </div>
                `;
                
                li.querySelector('.edit-tool').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editTool(tool);
                });
                
                li.addEventListener('click', () => {
                    this.editTool(tool);
                });
                
                toolsList.appendChild(li);
            });

            // Add click listeners for tool items
            document.querySelectorAll('.tools-list li').forEach(item => {
                item.addEventListener('click', () => {
                    document.querySelectorAll('.tools-list li').forEach(i => {
                        i.classList.remove('active');
                    });
                    item.classList.add('active');
                });
            });
        } catch (error) {
            console.error('Error loading tools:', error);
        }
    }

    editTool(tool) {
        this.currentTool = tool;
        
        document.getElementById('toolFormTitle').textContent = 'Edit Tool';
        document.getElementById('deleteToolBtn').style.display = 'block';
        
        // Fill form with tool data
        const form = document.getElementById('toolForm');
        Object.keys(tool).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = tool[key] || '';
            }
        });
    }

    async saveTool() {
        const form = document.getElementById('toolForm');
        const formData = new FormData(form);
        
        // Log the form data to debug
        console.log('Form data entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        // Create toolData object with proper column names
        const toolData = {
            'Tool Number': formData.get('Tool Number') || '',
            'Location': formData.get('Location') || '',
            'Tonnage Required': formData.get('Tonnage Required') || '',
            'Tool Type': formData.get('Tool Type') || '',
            'TS Code': formData.get('TS Code') || '',
            'Parts to Produce': formData.get('Parts to Produce') || '',
            'Tool to use': formData.get('Tool to use') || '',
            'Remarks': formData.get('Remarks') || '',
            // Add any other columns you have in your tools_alternative table
        };

        console.log('Prepared tool data:', toolData);

        try {
            if (this.currentTool) {
                // Update existing tool
                console.log('Updating tool with ID:', this.currentTool.id);
                const { data, error } = await this.supabase
                    .from('tools_alternative')
                    .update(toolData)
                    .eq('id', this.currentTool.id)
                    .select(); // Add select() to see what's returned

                if (error) {
                    console.error('Supabase update error:', error);
                    throw error;
                }
                
                console.log('Update successful:', data);
                alert('Tool updated successfully!');
            } else {
                // Insert new tool
                console.log('Inserting new tool');
                const { data, error } = await this.supabase
                    .from('tools_alternative')
                    .insert([toolData])
                    .select(); // Add select() to see what's returned

                if (error) {
                    console.error('Supabase insert error:', error);
                    throw error;
                }
                
                console.log('Insert successful:', data);
                alert('Tool added successfully!');
            }

            this.resetToolForm();
            this.loadTools();
        } catch (error) {
            console.error('Error saving tool:', error);
            
            // More detailed error message
            let errorMessage = 'Failed to save tool. ';
            if (error.message.includes('violates not-null constraint')) {
                errorMessage += 'One or more required fields are empty.';
            } else if (error.message.includes('duplicate key value')) {
                errorMessage += 'A tool with this number already exists.';
            } else {
                errorMessage += `Error: ${error.message}`;
            }
            
            alert(errorMessage);
        }
    }

    resetToolForm() {
        this.currentTool = null;
        document.getElementById('toolForm').reset();
        document.getElementById('toolFormTitle').textContent = 'Add New Tool';
        document.getElementById('deleteToolBtn').style.display = 'none';
        
        // Remove active class from all tool items
        document.querySelectorAll('.tools-list li').forEach(item => {
            item.classList.remove('active');
        });
    }

    async deleteTool() {
        if (!this.currentTool || !confirm('Are you sure you want to delete this tool?')) {
            return;
        }

        try {
            const { error } = await this.supabase
                .from('tools_alternative')
                .delete()
                .eq('id', this.currentTool.id);

            if (error) throw error;
            
            alert('Tool deleted successfully!');
            this.resetToolForm();
            this.loadTools();
        } catch (error) {
            console.error('Error deleting tool:', error);
            alert('Failed to delete tool. Please try again.');
        }
    }

    searchTools(query) {
        const items = document.querySelectorAll('.tools-list li');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    async loadAnalytics() {
        try {
            // Get total tools count
            const { count: totalTools } = await this.supabase
                .from('tools_alternative')
                .select('*', { count: 'exact', head: true });

            document.getElementById('totalTools').textContent = totalTools || 0;

            // Get unique locations
            const { data: locations } = await this.supabase
                .from('tools_alternative')
                .select('Location');

            const uniqueLocations = new Set(locations?.map(l => l.Location).filter(Boolean) || []);
            document.getElementById('uniqueLocations').textContent = uniqueLocations.size;

            // Get unique tool types
            const { data: toolTypes } = await this.supabase
                .from('tools_alternative')
                .select('"Tool Type"');

            const uniqueTypes = new Set(toolTypes?.map(t => t['Tool Type']).filter(Boolean) || []);
            document.getElementById('toolTypes').textContent = uniqueTypes.size;

            // Get recent tools (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { count: recentTools } = await this.supabase
                .from('tools_alternative')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo.toISOString());

            document.getElementById('recentTools').textContent = recentTools || 0;

            // Load chart data
            this.loadLocationChart(locations);
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    loadLocationChart(locations) {
        // Count tools by location
        const locationCounts = {};
        locations?.forEach(location => {
            const loc = location.Location || 'Unknown';
            locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        });

        // Create chart
        const ctx = document.getElementById('locationChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.locationChart) {
            this.locationChart.destroy();
        }

        this.locationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(locationCounts),
                datasets: [{
                    label: 'Number of Tools',
                    data: Object.values(locationCounts),
                    backgroundColor: 'rgba(181, 94, 1, 0.7)',
                    borderColor: 'rgba(181, 94, 1, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    async loadUsers() {
        try {
            const { data, error } = await this.supabase
                .from('admin_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const usersList = document.getElementById('usersList');
            usersList.innerHTML = '';

            data.forEach(user => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div>
                        <strong>${user.username}</strong>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">
                            ${user.full_name || ''} • ${user.role}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            Last login: ${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </div>
                    </div>
                    <div class="tool-actions">
                        <button class="tool-action-btn" onclick="adminPanel.editUser('${user.id}')">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="tool-action-btn" onclick="adminPanel.deleteUser('${user.id}')" ${user.username === 'admin' ? 'disabled' : ''}>
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                `;
                usersList.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    addUser() {
        alert('For security reasons, users must be added directly through Supabase dashboard.\n\nContact admin for the same');
    }

    editUser(userId) {
        alert('Edit user feature not implemented.');
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const { error } = await this.supabase
                .from('admin_users')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            
            alert('User deleted successfully!');
            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});