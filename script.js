document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Google Sheets ID and sheet name - replace with your actual public Google Sheet details
    const SHEET_ID = '1ErtscBueM00zoBC49ILYiXtYF76_2MK5L93Qq9evmck';
    const SHEET_NAME = 'Sheet1';
    const API_KEY = ''; // Not needed for public sheets
    
    const searchBtn = document.getElementById('searchBtn');
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

    function searchByTSCode(tsCode) {
        if (!tsCode) {
            showError('Please enter a TS Code');
            return;
        }

        showLoading(true);

        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

        fetch(url)
            .then(response => response.text())
            .then(csvData => {
                const rows = csvData.split(/\r?\n/);
                const headers = rows[0].split(',');

                // Find column indexes
                const tsCodeIndex = headers.findIndex(h => 
                    h.trim().replace(/^"|"$/g, '').toLowerCase() === 'ts code'
                );
                const toolToUseIndex = headers.findIndex(h => 
                    h.trim().replace(/^"|"$/g, '').toLowerCase() === 'tool to use'
                );

                if (tsCodeIndex === -1 || toolToUseIndex === -1) {
                    showError('Required columns not found.');
                    showLoading(false);
                    return;
                }

                const matchedTools = [];

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    // Better CSV parsing that handles quoted fields with commas
                    const rowData = parseCSVRow(row);
                    
                    const currentTS = rowData[tsCodeIndex]?.replace(/^"|"$/g, '').trim();
                    
                    // Case-insensitive comparison and remove any non-alphanumeric characters
                    const searchCode = tsCode.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    const sheetCode = currentTS?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    
                    if (sheetCode === searchCode) {
                        const tools = rowData[toolToUseIndex]?.replace(/^"|"$/g, '').trim();
                        if (tools) {
                            // Improved tool splitting that handles various formats
                            const toolChunks = tools.split(/(?=TT\d+)/g)
                                .map(t => t.trim())
                                .filter(t => t.startsWith('TT'));
                            
                            matchedTools.push(...toolChunks);
                        }
                    }
                }

                showLoading(false);

                if (matchedTools.length > 0) {
                    displayTSCodeResults(tsCode, matchedTools);
                } else {
                    showNoResults();
                }
            })
            .catch(error => {
                console.error('Error fetching TS code data:', error);
                showError('Failed to search by TS Code.');
                showLoading(false);
            });
    }

    // Helper function to properly parse CSV rows that might contain commas within quoted fields
    function parseCSVRow(row) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"' && row[i + 1] === '"') {
                current += '"'; // handle escaped quote
                i++;
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }


// Search function
    function searchTool(toolNumber) {    
        if (!toolNumber) {
            showError('Please enter a tool number');
            return;
        }
        
        showLoading(true);
        fetchToolData(toolNumber);
    }
    
    // Fetch data from Google Sheets
    function fetchToolData(toolNumber) {
        // Public Google Sheets URL (CSV format)
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
        
        fetch(url)
            .then(response => response.text())
            .then(csvData => {
                processCSVData(csvData, toolNumber);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                showError('Failed to fetch tool data. Please try again later.');
                showLoading(false);
            });
    }
    
    // Process CSV data
    function processCSVData(csvData, searchToolNumber) {
        const rows = csvData.split(/\r?\n/);
        const headers = rows[0].split(',');
        
        // Find the tool in the data
        let toolData = null;
        
        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i].split(',');
            if (rowData.length === headers.length) {
                const toolNumber = rowData[0].replace(/^"|"$/g, ''); // Remove quotes if present
                if (toolNumber.toLowerCase() === searchToolNumber.toLowerCase()) {
                    toolData = {};
                    for (let j = 0; j < headers.length; j++) {
                        const header = headers[j].replace(/^"|"$/g, '').trim();
                        toolData[header] = rowData[j].replace(/^"|"$/g, '').trim();
                    }
                    break;
                }
            }
        }
        
        showLoading(false);
        
        if (toolData) {
            displayToolData(toolData);
        } else {
            showNoResults();
        }
    }
    
    // Display tool data
    function displayToolData(toolData) {
        noResults.style.display = 'none';
        resultsTable.style.display = 'block';
        
        // Clear previous results (except header)
        resultsTable.innerHTML = ''; // Clear all previous rows

        
        // Add tool data rows
        addTableRow('Tool Number', toolData['Tool Number'] || 'N/A');
        addTableRow('Location', toolData['Location'] || 'N/A');
        addTableRow('Tonnage Required', toolData['Tonnage Required'] || 'N/A');
        addTableRow('Remarks', toolData['Remarks'] || 'N/A');
        addTableRow('Tool Type', toolData['Tool Type'] || 'N/A');
        addTableRow('TS Part Number', toolData['Parts to Produce'] || 'N/A');
        addTableRow('Tool Manufacturing Date', toolData['Tool Manufacturing Date'] || 'N/A');
        
        // Animate the results
        const rows = resultsTable.querySelectorAll('.table-row:not(.header)');
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