document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Google Sheets ID and sheet name - replace with your actual public Google Sheet details
    const SHEET_ID = '1ErtscBueM00zoBC49ILYiXtYF76_2MK5L93Qq9evmck';
    const SHEET_NAME = 'Sheet1';
    const API_KEY = ''; // Not needed for public sheets
    
    const searchBtn = document.getElementById('searchBtn');
    const toolNumberInput = document.getElementById('toolNumber');
    const resultsContainer = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');
    const resultsTable = document.getElementById('resultsTable');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Event listeners
    searchBtn.addEventListener('click', searchTool);
    toolNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTool();
        }
    });
    
    // Search function
    function searchTool() {
        const toolNumber = toolNumberInput.value.trim();
        
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
        while (resultsTable.children.length > 1) {
            resultsTable.removeChild(resultsTable.lastChild);
        }
        
        // Add tool data rows
        addTableRow('Tool Number', toolData['Tool Number'] || 'N/A');
        addTableRow('Location', toolData['Location'] || 'N/A');
        addTableRow('Tonnage Required', toolData['Tonnage Force'] || 'N/A');
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
    
    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Remove any existing error message
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        searchBtn.parentNode.insertBefore(errorDiv, searchBtn.nextSibling);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                errorDiv.remove();
            }, 300);
        }, 3000);
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