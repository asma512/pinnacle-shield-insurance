let currentQuote = null;

document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Selectors ---
    const btnSave = document.getElementById('btnSave');
    const btnReset = document.getElementById('btnReset');
    const savedQuotesList = document.getElementById('savedQuotesList');
    const savedQuotesSection = document.getElementById('savedQuotesSection');

    const quoteForm = document.getElementById('quoteForm');
    const typeRadios = document.querySelectorAll('input[name="insuranceType"]');
    const resultSection = document.getElementById('quoteResult');
    const premiumDisplay = document.getElementById('premiumDisplay');

    // --- 2. Initial Execution ---
    // Load saved data immediately when the page opens
    renderSavedQuotes();

    // --- 3. Form Switching Logic ---
    typeRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            // Hide all sections
            document.getElementById('autoFields').classList.add('d-none');
            document.getElementById('homeFields').classList.add('d-none');
            document.getElementById('lifeFields').classList.add('d-none');

            // Show selected section
            const selected = this.value + 'Fields';
            document.getElementById(selected).classList.remove('d-none');
            
            // Clear previous errors and results
            clearErrors(quoteForm);
            resultSection.classList.add('d-none');
        });
    });

    // --- 4. Validation and Calculation Trigger ---
    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors(quoteForm);

        const selectedType = document.querySelector('input[name="insuranceType"]:checked').value;
        let isValid = false;

        let resultData = {
            name: "",
            type: selectedType.charAt(0).toUpperCase() + selectedType.slice(1),
            monthly: 0,
            breakdown: []
        };

        // Route to specific validation and data gathering
        if (selectedType === 'auto') {
            isValid = validateAuto();
            if (isValid) {
                resultData.name = document.getElementById('fullName').value;
                resultData.monthly = calculateAuto();
                resultData.breakdown = [
                    { f: 'Age', v: document.getElementById('age').value, i: 'Age-based scaling' },
                    { f: 'Vehicle', v: document.getElementById('vehicleModel').value, i: 'Model year impact' },
                    { f: 'Record', v: document.getElementById('drivingRecord').value, i: 'Safety history' }
                ];
            }
        } else if (selectedType === 'home') {
            isValid = validateHome();
            if (isValid) {
                resultData.name = document.getElementById('homeFullName').value;
                resultData.monthly = calculateHome();
                resultData.breakdown = [
                    { f: 'Home Value', v: `$${document.getElementById('homeValue').value}`, i: 'Asset value' },
                    { f: 'Structure', v: document.getElementById('constructionType').value, i: 'Material durability' }
                ];
            }
        } else if (selectedType === 'life') {
            isValid = validateLife();
            if (isValid) {
                resultData.name = document.getElementById('lifeFullName').value;
                resultData.monthly = calculateLife();
                resultData.breakdown = [
                    { f: 'Coverage', v: document.getElementById('coverageAmount').value, i: 'Benefit amount' },
                    { f: 'Health', v: document.querySelector('input[name="smoker"]:checked').value === 'yes' ? 'Smoker' : 'Non-Smoker', i: 'Risk profile' }
                ];
            }
        }

        if (isValid) {
            currentQuote = resultData; // Capture state for the Save button
            displayResults(resultData);
        }
    });

    // --- 5. Save Logic (Independent Listener) ---
    btnSave.addEventListener('click', () => {
        if (!currentQuote) return;

        const saved = JSON.parse(localStorage.getItem('insurance_quotes')) || [];
        
        const quoteToSave = {
            ...currentQuote,
            id: Date.now(),
            dateSaved: new Date().toLocaleDateString()
        };

        saved.push(quoteToSave);
        localStorage.setItem('insurance_quotes', JSON.stringify(saved));
        
        renderSavedQuotes(); 
        alert("Quote saved successfully!");
    });

    // --- 6. Reset Logic (Independent Listener) ---
    btnReset.addEventListener('click', () => {
        quoteForm.reset();
        resultSection.classList.add('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Trigger a change to reset visible fields to 'Auto'
        document.getElementById('typeAuto').dispatchEvent(new Event('change'));
        currentQuote = null; 
    });

    // --- 7. Helper Functions ---

    function showError(id, message) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('is-invalid');
            const feedback = el.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.textContent = message;
            }
        }
    }

    function clearErrors(form) {
        const invalids = form.querySelectorAll('.is-invalid');
        invalids.forEach(el => el.classList.remove('is-invalid'));
    }

    // --- Validation Logic ---
    function validateAuto() {
        let valid = true;
        const fullName = document.getElementById('fullName').value.trim();
        const age = document.getElementById('age').value;
        const zip = document.getElementById('zipCode').value.trim();
        const year = document.getElementById('vehicleYear').value;
        const model = document.getElementById('vehicleModel').value.trim();

        // Full Name
        if (!fullName) {
            showError('fullName', 'Name is required');
            valid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
            showError('fullName', 'Name can only contain letters');
            valid = false;
        }

        // Age
        if (!age) {
            showError('age', 'Age is required');
            valid = false;
        } else if (isNaN(age) || age < 16 || age > 100) {
            showError('age', 'Age must be between 16 and 100');
            valid = false;
        }

        // ZIP Code
        if (!zip) {
            showError('zipCode', 'ZIP code is required');
            valid = false;
        } else if (!/^\d{5}$/.test(zip)) {
            showError('zipCode', 'ZIP code must be exactly 5 digits');
            valid = false;
        }

        // Vehicle Year
        if (!year) {
            showError('vehicleYear', 'Year is required');
            valid = false;
        } else if (isNaN(year) || year < 1990 || year > 2026) {
            showError('vehicleYear', 'Year must be between 1990 and 2026');
            valid = false;
        }

        // Vehicle Model
        if (!model) {
            showError('vehicleModel', 'Model is required');
            valid = false;
        } else if (!/[A-Za-z]/.test(model)) {
            showError('vehicleModel', 'Model must contain at least 1 letter');
            valid = false;
        }
        if (!document.getElementById('vehicleMake').value) { showError('vehicleMake', 'Select a make'); valid = false; }
        if (!document.getElementById('annualMileage').value) { showError('annualMileage', 'Select annual mileage'); valid = false; }
        if (!document.getElementById('drivingRecord').value) { showError('drivingRecord', 'Select driving record'); valid = false; }


        return valid;
    }

    function validateHome() {
        let valid = true;
        const fullName = document.getElementById('homeFullName').value.trim();
        const age = document.getElementById('homeAge').value;
        const zip = document.getElementById('homeZip').value.trim();
        const homeValue = document.getElementById('homeValue').value;
        const yearBuilt = document.getElementById('yearBuilt').value;
        const sqft = document.getElementById('sqFootage').value;

        // Full Name
        if (!fullName) {
            showError('homeFullName', 'Full name is required');
            valid = false;
        } else if (fullName.length < 2 || !/^[A-Za-z\s]+$/.test(fullName)) {
            showError('homeFullName', 'Must be at least 2 letters and only alphabetic');
            valid = false;
        }

        // Age
        if (!age) {
            showError('homeAge', 'Age is required');
            valid = false;
        } else if (isNaN(age) || age < 18 || age > 100) {
            showError('homeAge', 'Age must be 18–100');
            valid = false;
        }

        // ZIP Code
        if (!zip) {
            showError('homeZip', 'ZIP code is required');
            valid = false;
        } else if (!/^\d{5}$/.test(zip)) {
            showError('homeZip', 'ZIP code must be exactly 5 digits');
            valid = false;
        }

        // Home Value
        if (!homeValue) {
            showError('homeValue', 'Home value is required');
            valid = false;
        } else if (homeValue < 50000) {
            showError('homeValue', 'Minimum home value is $50,000');
            valid = false;
        }

        // Year Built
        if (!yearBuilt) {
            showError('yearBuilt', 'Year built is required');
            valid = false;
        } else if (isNaN(yearBuilt) || yearBuilt < 1900 || yearBuilt > 2026) {
            showError('yearBuilt', 'Year must be 1900–2026');
            valid = false;
        }

        // Square Footage
        if (!sqft) {
            showError('sqFootage', 'Square footage is required');
            valid = false;
        } else if (isNaN(sqft) || sqft < 500 || sqft > 10000) {
            showError('sqFootage', 'Square footage must be 500–10,000');
            valid = false;
        }

        // Construction Type
        if (!constructionType) {
            showError('constructionType', 'Please select a construction type');
            valid = false;
        }

        if (!document.getElementById('constructionType').value) { showError('constructionType', 'Select type'); valid = false; }

        return valid;
    }

    function validateLife() {
        let valid = true;
        const fullName = document.getElementById('lifeFullName').value.trim();
        const age = document.getElementById('lifeAge').value;
        const zip = document.getElementById('lifeZip').value.trim();

         // Full Name
        if (!fullName) {
            showError('lifeFullName', 'Full name is required');
            valid = false;
        } else if (fullName.length < 2 || !/^[A-Za-z\s]+$/.test(fullName)) {
            showError('lifeFullName', 'Must be at least 2 letters and only contain letters');
            valid = false;
        }

        // Age
        if (!age) {
            showError('lifeAge', 'Age is required');
            valid = false;
        } else if (isNaN(age) || age < 18 || age > 85) {
            showError('lifeAge', 'Age must be 18–85');
            valid = false;
        }

        // ZIP Code
        if (!zip) {
            showError('lifeZip', 'ZIP code is required');
            valid = false;
        } else if (!/^\d{5}$/.test(zip)) {
            showError('lifeZip', 'ZIP code must be exactly 5 digits');
            valid = false;
        }
        if (!document.getElementById('gender').value) { showError('gender', 'Gender required'); valid = false; }
        if (!document.querySelector('input[name="smoker"]:checked')) { showError('smokerYes', 'Select smoker option'); valid = false; }
        if (!document.getElementById('coverageAmount').value) { showError('coverageAmount', 'Amount required'); valid = false; }
        if (!document.getElementById('exercise').value) { showError('exercise', 'Exercise required'); valid = false; }
        if (!document.querySelector('input[name="lifeCoverage"]:checked')) { showError('lifeBasic', 'Level required'); valid = false; }

        return valid;
    }

    // --- Calculation Formulas ---
    function calculateAuto() {
        let rate = 75; 
        const age = parseInt(document.getElementById('age').value);
        const year = parseInt(document.getElementById('vehicleYear').value);
        const vehicleAge = new Date().getFullYear() - year;

        if (age < 25) rate *= 1.5;
        else if (age > 65) rate *= 1.3;

        if (vehicleAge < 3) rate *= 1.3;
        else if (vehicleAge > 10) rate *= 0.8;

        const mileageMap = { 'Under 5,000': 0.8, '5,000–10,000': 1.0, '10,001–15,000': 1.1, '15,001–20,000': 1.3, 'Over 20,000': 1.5 };
        rate *= (mileageMap[document.getElementById('annualMileage').value] || 1.0);

        const recordMap = { 'Clean': 1.0, '1 Ticket': 1.2, '2+ Tickets': 1.5, 'Accident in Last 3 Years': 1.8 };
        rate *= (recordMap[document.getElementById('drivingRecord').value] || 1.0);

        const coverage = document.querySelector('input[name="autoCoverage"]:checked').value;
        const coverageMap = { 'basic': 0.8, 'standard': 1.0, 'premium': 1.4 };
        return rate * coverageMap[coverage];
    }

    function calculateHome() {
        const homeValue = parseFloat(document.getElementById('homeValue').value) || 0;
        const yearBuilt = parseInt(document.getElementById('yearBuilt').value) || 2000;
        const sqft = parseInt(document.getElementById('sqFootage').value) || 0;
        
        let rate = (homeValue * 0.003) / 12;
        if (yearBuilt < 1970) rate *= 1.4;
        const constructMap = { 'Wood Frame': 1.2, 'Brick': 1.0, 'Concrete': 0.9, 'Steel': 0.85 };
        rate *= (constructMap[document.getElementById('constructionType').value] || 1.0);
        rate += (sqft * 0.01);

        if (document.getElementById('securitySystem').checked) rate *= 0.95;
        const coverage = document.querySelector('input[name="homeCoverage"]:checked').value;
        return rate * { 'basic': 0.8, 'standard': 1.0, 'premium': 1.4 }[coverage];
    }

    function calculateLife() {
        const amount = parseFloat(document.getElementById('coverageAmount').value.replace(/[$,]/g, '')) || 0;
        const age = parseInt(document.getElementById('lifeAge').value) || 30;
        
        let rate = (amount * 0.0005) / 12;
        if (age <= 30) rate *= 1.0;
        else if (age <= 45) rate *= 1.5;
        else rate *= 4.0;

        if (document.querySelector('input[name="smoker"]:checked').value === 'yes') rate *= 2.0;
        const coverage = document.querySelector('input[name="lifeCoverage"]:checked').value;
        return rate * { 'basic': 0.8, 'standard': 1.0, 'premium': 1.4 }[coverage];
    }

    function displayResults(data) {
        const tbody = document.querySelector('#breakdownTable tbody');
        tbody.innerHTML = ''; 

        document.getElementById('resName').textContent = data.name;
        document.getElementById('resType').textContent = data.type;
        document.getElementById('resMonthly').textContent = `$${data.monthly.toFixed(2)}`;
        document.getElementById('resAnnual').textContent = `Total: $${(data.monthly * 12).toFixed(2)} / year`;

        data.breakdown.forEach(item => {
            const row = document.createElement('tr');
            const tdFactor = document.createElement('td');
            tdFactor.textContent = item.f;
            const tdInfo = document.createElement('td');
            tdInfo.textContent = item.v; 
            const tdImpact = document.createElement('td');
            tdImpact.textContent = item.i;

            row.append(tdFactor, tdInfo, tdImpact);
            tbody.appendChild(row);
        });

        resultSection.classList.remove('d-none');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    function renderSavedQuotes() {
        const saved = JSON.parse(localStorage.getItem('insurance_quotes')) || [];
        if (!savedQuotesList || !savedQuotesSection) return;

        if (saved.length > 0) {
            savedQuotesSection.classList.remove('d-none');
            savedQuotesList.innerHTML = saved.map(quote => `
                <div class="card mb-2 shadow-sm border-start border-4 border-success">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${quote.type} Insurance</strong> - ${quote.name} <br>
                            <small class="text-muted">
                                Monthly: $${quote.monthly.toFixed(2)} | 
                                Annual: $${(quote.monthly * 12).toFixed(2)} | 
                                Saved: ${quote.dateSaved}
                            </small>
                        </div>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteQuote(${quote.id})">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            savedQuotesSection.classList.add('d-none');
        }
    }

    // Global delete function
    window.deleteQuote = function(id) {
        let saved = JSON.parse(localStorage.getItem('insurance_quotes')) || [];
        saved = saved.filter(q => q.id !== id);
        localStorage.setItem('insurance_quotes', JSON.stringify(saved));
        renderSavedQuotes();
    };
});