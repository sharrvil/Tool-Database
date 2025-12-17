document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Supabase configuration
    const SUPABASE_URL = 'https://cpfksqepjgokzahetstf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZmtzcWVwamdva3phaGV0c3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDQ0MjcsImV4cCI6MjA4MTUyMDQyN30.wHgc2qHVdSGHitnJkYgnnPu43btZl1jH0HRMhsZzSdY';
    
    // Initialize Supabase client - check if supabase is available
    let supabase;
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        showError('Failed to initialize database connection. Please refresh the page.');
        return;
    }
    
    const searchInput = document.getElementById('searchInput');
    const searchToolBtn = document.getElementById('searchToolBtn');
    const searchTSBtn = document.getElementById('searchTSBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');
    const resultsTable = document.getElementById('resultsTable');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Event listeners
    searchToolBtn.addEventListener('click', function () {
        searchTool(searchInput.value.trim());
    });

    searchTSBtn.addEventListener('click', function () {
        searchByTSCode(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchTool(searchInput.value.trim()); // Default search by tool number
        }
    });
    
    function displayTSCodeResults(tsCode, tools) {
        noResults.style.display = 'none';
        resultsTable.style.display = 'block';
        resultsTable.innerHTML = '';

        addTableRow('TS Code', tsCode);

        tools.forEach((tool, index) => {
            addTableRow(`Tool ${index + 1}`, tool);
        });

        const rows = resultsTable.querySelectorAll('.table-row');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(10px)';
            setTimeout(() => {
                row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }
    
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        // Remove existing error
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Insert after the input field
        searchInput.parentNode.insertBefore(errorDiv, searchInput.nextSibling);

        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                errorDiv.remove();
            }, 300);
        }, 3000);
    }

    async function searchByTSCode(tsCode) {
        if (!tsCode) {
            showError('Please enter a TS Code');
            return;
        }

        if (!supabase) {
            showError('Database connection not available. Please refresh the page.');
            return;
        }

        showLoading(true);

        try {
            // Clean the search term - remove non-alphanumeric and convert to lowercase
            const searchCode = tsCode.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            
            // Query Supabase for EXACT matching TS Code - using tools_alternative table
            const { data, error } = await supabase
                .from('tools_alternative')
                .select('*')
                .eq('TS Code', searchCode); // Use eq for exact match instead of ilike
            
            if (error) {
                console.error('Supabase error:', error);
                showError('Failed to search by TS Code.');
                showLoading(false);
                return;
            }

            showLoading(false);

            if (data && data.length > 0) {
                // Extract all tools from the matching rows
                const matchedTools = [];
                data.forEach(row => {
                    if (row['Tool to use']) {
                        // Parse tools from the Tool to use field
                        const tools = row['Tool to use'].trim();
                        if (tools) {
                            // Split by TT prefix
                            const toolChunks = tools.split(/(?=TT\d+)/g)
                                .map(t => t.trim())
                                .filter(t => t.startsWith('TT'));
                            
                            matchedTools.push(...toolChunks);
                        }
                    }
                });

                if (matchedTools.length > 0) {
                    displayTSCodeResults(tsCode, matchedTools);
                } else {
                    showNoResults();
                }
            } else {
                showNoResults();
            }
        } catch (error) {
            console.error('Error fetching TS code data:', error);
            showError('Failed to search by TS Code.');
            showLoading(false);
        }
    }
    // Search function
    async function searchTool(toolNumber) {    
        if (!toolNumber) {
            showError('Please enter a tool number');
            return;
        }
        
        if (!supabase) {
            showError('Database connection not available. Please refresh the page.');
            return;
        }
        
        showLoading(true);
        await fetchToolData(toolNumber);
    }
    
    // Fetch data from Supabase
    async function fetchToolData(toolNumber) {
        try {
            // Clean the search term
            const searchToolNumber = toolNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            
            // Query Supabase for the tool - using tools_alternative table
            const { data, error } = await supabase
                .from('tools_alternative') // Changed from 'tools' to 'tools_alternative'
                .select('*')
                .or(`"Tool Number".ilike.%${searchToolNumber}%,"Tool Number".ilike.%${toolNumber}%`)
                .limit(1);
            
            if (error) {
                console.error('Supabase error:', error);
                showError('Failed to fetch tool data. Please try again later.');
                showLoading(false);
                return;
            }

            showLoading(false);
            
            if (data && data.length > 0) {
                displayToolData(data[0]);
            } else {
                showNoResults();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showError('Failed to fetch tool data. Please try again later.');
            showLoading(false);
        }
    }
    
    // Display tool data
    function displayToolData(toolData) {
        noResults.style.display = 'none';
        resultsTable.style.display = 'block';
        
        // Clear previous results
        resultsTable.innerHTML = '';
        
        // Map Supabase column names to display labels - using tools_alternative column names
        const fieldMappings = {
            'Tool Number': 'Tool Number',
            'Location': 'Location',
            'Tonnage Required': 'Tonnage Required',
            'Remarks': 'Remarks',
            'Tool Type': 'Tool Type',
            'TS Part Number': 'Parts to Produce', // Changed to match tools_alternative column
            'Tool Manufacturing Date': 'Tool Manufacturing Date' // Changed to match tools_alternative column
        };
        
        // Add tool data rows
        Object.keys(fieldMappings).forEach(label => {
            const fieldName = fieldMappings[label];
            const value = toolData[fieldName] || 'N/A';
            addTableRow(label, value);
        });
        
        // Animate the results
        const rows = resultsTable.querySelectorAll('.table-row');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(10px)';
            setTimeout(() => {
                row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }
    
    // Helper to add a table row
    function addTableRow(label, value) {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        const labelCell = document.createElement('div');
        labelCell.className = 'table-cell';
        labelCell.textContent = label;
        
        const valueCell = document.createElement('div');
        valueCell.className = 'table-cell';
        valueCell.textContent = value;
        
        row.appendChild(labelCell);
        row.appendChild(valueCell);
        resultsTable.appendChild(row);
    }
    
    // Show no results message
    function showNoResults() {
        noResults.style.display = 'block';
        resultsTable.style.display = 'none';
    }
    
    // Show/hide loading overlay
    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }
});