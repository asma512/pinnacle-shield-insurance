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
    const step2Container = document.getElementById('step2Container');
 
    // --- 2. Initial Execution ---
    // Load saved data immediately when the page opens
    renderSavedQuotes();

    // --- 3. Form Switching Logic ---
    typeRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            
            step2Container.classList.remove('hidden');

            // 1. Define all sections
            const sections = ['autoFields', 'homeFields', 'lifeFields'];
            const selectedSectionId = this.value + 'Fields';

            sections.forEach(id => {
                const section = document.getElementById(id);
                if (id === selectedSectionId) {
                    // Show and Enable inputs
                    section.classList.remove('hidden');
                    toggleInputs(section, false); 
                } else {
                    // Hide and Disable inputs
                    section.classList.add('hidden');
                    toggleInputs(section, true);
                }
            });
            
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
                // 1. Get Values
                const age = parseInt(document.getElementById('age').value);
                const vYear = parseInt(document.getElementById('vehicleYear').value);
                const vAge = 2026 - vYear; // Current year is 2026
                const mileage = document.getElementById('annualMileage').value;
                const record = document.getElementById('drivingRecord').value;
                const coverage = document.querySelector('input[name="autoCoverage"]:checked').value;

                // 2. Logic for specific "Impact" messages (multipliers)
                const ageImpact = age < 25 ? 'x1.5' : (age > 65 ? 'x1.3' : 'x1.00');
                
                const vAgeImpact = vAge < 3 ? 'x1.3' : (vAge > 10 ? 'x0.80' : 'x1.00');
                
                const mileageMap = {
                    'Under 5,000': 'x0.80',
                    '5,000–10,000': 'x1.00',
                    '10,001–15,000': 'x1.1',
                    '15,001–20,000': 'x1.3',
                    'Over 20,000': 'x1.5'
                };
                
                const recordMap = {
                    'Clean': 'x1.00',
                    '1 Ticket': 'x1.2',
                    '2+ Tickets': 'x1.5',
                    'Accident in Last 3 Years': 'x1.8'
                };

                const coverageMap = {
                    'basic': 'x0.80',
                    'standard': 'x1.00',
                    'premium': 'x1.4'
                };

                // 3. Construct the breakdown to match image_792b96.png
                resultData.name = document.getElementById('fullName').value;
                resultData.monthly = calculateAuto(); // Your math function
                resultData.breakdown = [
                    { f: 'Base monthly rate', v: '$75.00', i: 'Starting rate' },
                    { f: 'Age factor', v: `${age} years`, i: ageImpact },
                    { f: 'Vehicle age factor', v: `${vAge} years old`, i: vAgeImpact },
                    { f: 'Mileage factor', v: mileage, i: mileageMap[mileage] || 'x1.00' },
                    { f: 'Driving record', v: record, i: recordMap[record] || 'x1.00' },
                    { f: 'Coverage level', v: coverage.charAt(0).toUpperCase() + coverage.slice(1), i: coverageMap[coverage] }
                ];
            }
        } else if (selectedType === 'home') {
            isValid = validateHome();
            if (isValid) {
                // 1. Get Values
            const hValue = parseFloat(document.getElementById('homeValue').value) || 0;
            const yearBuilt = parseInt(document.getElementById('yearBuilt').value);
            const sqFt = parseFloat(document.getElementById('sqFootage').value) || 0;
            const construction = document.getElementById('constructionType').value;
            const security = document.getElementById('securitySystem').checked;
            const sprinklers = document.getElementById('fireSprinklers').checked;
            const coverage = document.querySelector('input[name="homeCoverage"]:checked').value;

            // 2. Logic for specific "Impact" messages (multipliers and additions)
            const baseMonthly = (hValue * 0.003) / 12;

            const yearImpact = yearBuilt < 1970 ? 'x1.4' : (yearBuilt <= 1999 ? 'x1.1' : 'x1.00');
            
            const constructionMap = {
                'Wood Frame': 'x1.2',
                'Brick': 'x1.0',
                'Concrete': 'x0.9',
                'Steel': 'x0.85'
            };

            const securityImpact = security ? 'x0.95' : 'x1.00';
            const sprinklerImpact = sprinklers ? 'x0.92' : 'x1.00';

            const coverageMap = {
                'basic': 'x0.80',
                'standard': 'x1.00',
                'premium': 'x1.4'
            };

            // 3. Construct the breakdown to match image_792b96.png
            resultData.name = document.getElementById('homeFullName').value;
            resultData.monthly = calculateHome(); // Your math function
            resultData.breakdown = [
                { f: 'Base monthly rate', v: `$${baseMonthly.toFixed(2)}`, i: 'Value-based rate' },
                { f: 'Year built factor', v: `Built in ${yearBuilt}`, i: yearImpact },
                { f: 'Construction factor', v: construction, i: constructionMap[construction] || 'x1.00' },
                { f: 'Size adjustment', v: `${sqFt} sq ft`, i: `+$${(sqFt * 0.01).toFixed(2)}/mo` },
                { f: 'Security discount', v: security ? 'Installed' : 'None', i: securityImpact },
                { f: 'Sprinkler discount', v: sprinklers ? 'Installed' : 'None', i: sprinklerImpact },
                { f: 'Coverage level', v: coverage.charAt(0).toUpperCase() + coverage.slice(1), i: coverageMap[coverage] }
            ];
            }
        } else if (selectedType === 'life') {
            isValid = validateLife();
            if (isValid) {
            // 1. Get Values
            const rawCoverage = document.getElementById('coverageAmount').value; // e.g., "$250,000"
            const coverageValue = parseFloat(rawCoverage.replace(/[\$,]/g, '')) || 0;
            const age = parseInt(document.getElementById('lifeAge').value);
            const gender = document.getElementById('gender').value;
            const exercise = document.getElementById('exercise').value;
            const smoker = document.querySelector('input[name="smoker"]:checked').value;
            const preExisting = document.getElementById('preExisting').checked;
            const coverageLevel = document.querySelector('input[name="lifeCoverage"]:checked').value;

            // 2. Logic for specific "Impact" messages (multipliers)
            const baseMonthly = (coverageValue * 0.0005) / 12;

            // Age Multiplier
            let ageImpact = 'x1.0';
            if (age >= 31 && age <= 45) ageImpact = 'x1.5';
            else if (age >= 46 && age <= 60) ageImpact = 'x2.5';
            else if (age > 60) ageImpact = 'x4.0';

            const smokerImpact = smoker === 'yes' ? 'x2.0' : 'x1.0';

            const exerciseMap = {
                'Rarely': 'x1.3',
                '1–2 times/week': 'x1.1',
                '3–4 times/week': 'x1.0',
                '5+ times/week': 'x0.9'
            };

            const preExistingImpact = preExisting ? 'x1.5' : 'x1.0';

            const genderMap = {
                'Male': 'x1.1',
                'Female': 'x1.0',
                'Non-binary': 'x1.05'
            };

            const levelMap = {
                'basic': 'x0.8',
                'standard': 'x1.0',
                'premium': 'x1.4'
            };

            // 3. Construct the breakdown to match image_792b96.png
            resultData.name = document.getElementById('lifeFullName').value;
            resultData.monthly = calculateLife(); 
            resultData.breakdown = [
                { f: 'Base monthly rate', v: `$${baseMonthly.toFixed(2)}`, i: 'Coverage-based rate' },
                { f: 'Age factor', v: `${age} years`, i: ageImpact },
                { f: 'Smoker factor', v: smoker.charAt(0).toUpperCase() + smoker.slice(1), i: smokerImpact },
                { f: 'Exercise frequency', v: exercise, i: exerciseMap[exercise] || 'x1.0' },
                { f: 'Health history', v: preExisting ? 'Conditions present' : 'None reported', i: preExistingImpact },
                { f: 'Gender factor', v: gender, i: genderMap[gender] || 'x1.0' },
                { f: 'Coverage level', v: coverageLevel.charAt(0).toUpperCase() + coverageLevel.slice(1), i: levelMap[coverageLevel] }
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

    document.getElementById('btnPrint').addEventListener('click', function() {
        window.print();
    });

    // --- 7. Helper Functions ---

    // Helper function to enable/disable inputs inside a div
    function toggleInputs(container, isDisabled) {
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = isDisabled;
        });
    }

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