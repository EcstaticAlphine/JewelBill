/*
  app.js
  Main JavaScript logic for JewelBill Application
  (Wi-Fi Bridge Version)
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Element Selectors ---
    const getEl = (id) => document.getElementById(id);

    // Rates
    const goldRateInput = getEl('gold-rate-input');
    const silverRateInput = getEl('silver-rate-input');
    const setRatesBtn = getEl('set-rates-btn');
    const ratesInputContainer = getEl('rates-input-container');
    const ratesDisplay = getEl('rates-display');
    const goldRateDisplay = getEl('gold-rate-display');
    const silverRateDisplay = getEl('silver-rate-display');
    const editRatesBtn = getEl('edit-rates-btn');
    const appBody = getEl('app-body');

    // Customer
    const customerNameInput = getEl('customer-name');
    const customerPhoneInput = getEl('customer-phone');
    const customerAddressInput = getEl('customer-address');
    const selectCustomerBtn = getEl('select-customer-btn');
    const saveCustomerCheckbox = getEl('save-customer-checkbox');
    const customerModal = getEl('customer-modal');
    const closeCustomerModal = getEl('close-customer-modal');
    const customerSearch = getEl('customer-search');
    const customerListModal = getEl('customer-list-modal');

    // Forms
    const goldItemForm = getEl('gold-item-form');
    const silverItemForm = getEl('silver-item-form');
    const oldGoldForm = getEl('old-gold-form');
    const paymentForm = getEl('payment-form');
    const shopDetailsForm = getEl('shop-details-form');

    // Form Buttons
    const addGoldItemBtn = getEl('add-gold-item-btn');
    const addSilverItemBtn = getEl('add-silver-item-btn');
    const addOldGoldBtn = getEl('add-old-gold-btn');

    // Item Lists
    const itemsList = getEl('items-list');
    const silverItemsList = getEl('silver-items-list');
    const oldGoldList = getEl('old-gold-list');
    const paymentList = getEl('payment-list');

    // Billing & Summary
    const billingContainer = getEl('billing-container');
    const chargesConfig = getEl('charges-config');
    const wastageInput = getEl('wastage');
    const gstInput = getEl('gst');
    const recalculateBtn = getEl('recalculate-btn');
    const summarySection = getEl('summary-section');
    const paymentSection = getEl('payment-section');
    const actionButtons = getEl('action-buttons');

    // Action Buttons
    const previewEstimateBtn = getEl('preview-estimate-btn');
    const printEstimateBtn = getEl('print-estimate-btn');
    const generateBillBtn = getEl('generate-bill-btn');
    const resetBtn = getEl('reset-btn');

    // Settings
    const settingsBtn = getEl('settings-btn');
    const settingsPanel = getEl('settings-panel');
    const shopNameInput = getEl('shop-name');
    const shopPhoneInput = getEl('shop-phone');
    const shopEmailInput = getEl('shop-email');
    const shopAddressInput = getEl('shop-address');
    // Wi-Fi selectors
    const printerIpInput = getEl('printer-ip');
    const bridgeUrlInput = getEl('bridge-url');
    const statusLabel = getEl('status-label');

    // History
    const historyBtn = getEl('history-btn');
    const historyModal = getEl('history-modal');
    const closeHistoryModal = getEl('close-history-modal');
    const historyListModal = getEl('history-list-modal');

    // Print Sections
    const billSection = document.querySelector('.bill-section');
    const thermalReceiptPreviewModal = getEl('thermal-receipt-modal');
    const thermalReceiptContent = getEl('thermal-receipt-content');
    const closeThermalPreviewBtn = getEl('close-thermal-preview');
    // A4 Print elements
    const shopNamePrint = getEl('shop-name-print');
    const shopPhonePrint = getEl('shop-phone-print');
    const shopEmailPrint = getEl('shop-email-print');
    const shopAddressPrint = getEl('shop-address-print');
    const invoiceTitlePrint = getEl('invoice-title-print');
    const billNoPrint = getEl('bill-no-print');
    const billDatePrint = getEl('bill-date-print');
    const customerNamePrint = getEl('customer-name-print');
    const customerPhonePrint = getEl('customer-phone-print');
    const customerAddressPrint = getEl('customer-address-print');
    const itemsListPrint = getEl('items-list-print');
    const oldGoldListPrint = getEl('old-gold-list-print');
    const summarySectionPrint = getEl('summary-section-print');
    const paymentListPrint = getEl('payment-list-print');
    const oldGoldSectionPrint = getEl('old-gold-section-print');
    const paymentSectionPrint = getEl('payment-section-print');


    // Toasts
    const restoreToast = getEl('restore-toast');
    const settingsToast = getEl('settings-toast');

    // --- 2. Application State ---
    let items = [], silverItems = [], oldGoldItems = [], paymentDetails = [];
    let customers = [], billHistory = [];
    let shopDetails = {};
    let goldRate22k = 0, silverRate = 0, lastBillNum = 0;
    let currentBillSaved = false;
    const billPrefix = "AJ", billPadding = 3;

    // --- 3. Helper Functions ---
    const formatCurrency = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) { return '₹ 0.00'; }
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const generateNextBillNumber = () => {
        lastBillNum++;
        const numStr = lastBillNum.toString().padStart(billPadding, '0');
        return `${billPrefix}${numStr}`;
    };
    const showToast = (toastEl) => {
        if (!toastEl) return;
        toastEl.classList.add('show');
        setTimeout(() => { toastEl.classList.remove('show'); }, 3000);
    };

    // --- 4. State Management (LocalStorage) ---
    const saveState = () => {
        const currentBillState = {
            goldRate22k, silverRate,
            customerName: customerNameInput.value, customerPhone: customerPhoneInput.value, customerAddress: customerAddressInput.value,
            items, silverItems, oldGoldItems, paymentDetails,
            wastage: wastageInput.value, gst: gstInput.value,
            ratesSet: goldRate22k > 0 && silverRate > 0,
            discount: getEl('discount-input')?.value || 0,
            currentBillSaved: currentBillSaved
        };
        localStorage.setItem('jewelBillCurrentState', JSON.stringify(currentBillState));
        localStorage.setItem('jewelBillCustomers', JSON.stringify(customers));
        localStorage.setItem('jewelBillHistory', JSON.stringify(billHistory));
        localStorage.setItem('jewelBillLastBillNum', lastBillNum.toString());
    };
    const saveRates = () => {
        localStorage.setItem('jewelBillRates', JSON.stringify({ goldRate22k, silverRate }));
        const currentState = JSON.parse(localStorage.getItem('jewelBillCurrentState')) || {};
        currentState.goldRate22k = goldRate22k; currentState.silverRate = silverRate;
        currentState.ratesSet = goldRate22k > 0 && silverRate > 0;
        localStorage.setItem('jewelBillCurrentState', JSON.stringify(currentState));
    };
    const saveShopDetails = () => { localStorage.setItem('jewelBillShopDetails', JSON.stringify(shopDetails)); };
    const loadState = () => {
        customers = JSON.parse(localStorage.getItem('jewelBillCustomers')) || [];
        billHistory = JSON.parse(localStorage.getItem('jewelBillHistory')) || [];
        shopDetails = JSON.parse(localStorage.getItem('jewelBillShopDetails')) || {};
        lastBillNum = parseInt(localStorage.getItem('jewelBillLastBillNum')) || 0;
        
        shopNameInput.value = shopDetails.name || ''; 
        shopPhoneInput.value = shopDetails.phone || '';
        shopEmailInput.value = shopDetails.email || ''; 
        shopAddressInput.value = shopDetails.address || '';
        printerIpInput.value = shopDetails.printerIp || '';
        bridgeUrlInput.value = shopDetails.bridgeUrl || 'http://127.0.0.1:3000';

        const savedRates = JSON.parse(localStorage.getItem('jewelBillRates'));
        if (savedRates) {
            goldRate22k = savedRates.goldRate22k || 0; silverRate = savedRates.silverRate || 0;
            goldRateInput.value = goldRate22k || ''; silverRateInput.value = silverRate || '';
        }
        const savedCurrentState = localStorage.getItem('jewelBillCurrentState');
        if (!savedCurrentState) { updateRateDisplay(!(goldRate22k > 0 && silverRate > 0)); return; }
        const state = JSON.parse(savedCurrentState);
        goldRate22k = state.goldRate22k || goldRate22k; silverRate = state.silverRate || silverRate;
        customerNameInput.value = state.customerName || ''; customerPhoneInput.value = state.customerPhone || ''; customerAddressInput.value = state.customerAddress || '';
        items = state.items || []; silverItems = state.silverItems || []; oldGoldItems = state.oldGoldItems || []; paymentDetails = state.paymentDetails || [];
        wastageInput.value = state.wastage || '12'; gstInput.value = state.gst || '3';
        currentBillSaved = state.currentBillSaved || false;
        if (state.ratesSet && goldRate22k > 0 && silverRate > 0) {
            updateRateDisplay(false); renderAllLists(); showToast(restoreToast);
            if (currentBillSaved) generateBillBtn.textContent = 'Reprint A4 Bill';
        } else updateRateDisplay(true);
    };

    // --- 5. UI Rendering Functions ---
    const renderAllLists = () => {
        renderGoldItems(); renderSilverItems(); renderOldGoldItems(); renderPayments();
        if (currentBillSaved) {
            currentBillSaved = false;
            generateBillBtn.textContent = 'Generate & Print A4 Bill';
        }
        calculateTotals();
    };
    const updateRateDisplay = (isEditing) => {
        if (isEditing) {
            ratesInputContainer.classList.remove('hidden'); ratesDisplay.classList.add('hidden');
            appBody.classList.add('hidden'); goldRateInput.focus();
        } else {
            goldRateDisplay.textContent = formatCurrency(goldRate22k); silverRateDisplay.textContent = formatCurrency(silverRate);
            ratesInputContainer.classList.add('hidden'); ratesDisplay.classList.remove('hidden');
            if (goldRate22k > 0 && silverRate > 0) appBody.classList.remove('hidden');
            else appBody.classList.add('hidden');
        }
    };
    const recalculateAllItemValues = () => {
        items.forEach(item => {
            const netWeight = item.grossWeight - item.stoneWeight;
            const purityAdjustedWeight = netWeight * (item.karat / 22);
            item.netWeight = netWeight; item.purityAdjustedWeight = purityAdjustedWeight;
            item.goldValue = purityAdjustedWeight * goldRate22k;
        });
        silverItems.forEach(item => { item.value = item.weight * silverRate; });
        oldGoldItems.forEach(item => {
            const purityAdjustedWeight = item.netWeight * (item.purityPercent / 91.6);
            item.purityAdjustedWeight = purityAdjustedWeight;
            item.goldValue = purityAdjustedWeight * goldRate22k;
        });
    };
    const renderGoldItems = () => {
        if (items.length === 0) { itemsList.innerHTML = ''; return; }
        const tableHeader = `<h3 class="text-lg font-semibold text-gray-700 mb-2">Gold Items</h3><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead class="bg-gray-50"><tr><th class="p-2">Item</th><th class="p-2 text-right">Net Wt.</th><th class="p-2 text-right">Value</th><th class="p-2 text-right">Making</th><th class="p-2 no-print"></th></tr></thead><tbody>`;
        const tableRows = items.map((item) => {
            const makingChargeValue = item.makingCharge.type === 'perGram' ? item.grossWeight * item.makingCharge.value : item.makingCharge.value;
            return `<tr class="border-b"><td class="p-2 font-medium">${item.name} (${item.karat}K)</td><td class="p-2 text-right">${item.netWeight.toFixed(3)}g</td><td class="p-2 text-right">${formatCurrency(item.goldValue)}</td><td class="p-2 text-right">${formatCurrency(makingChargeValue)}</td><td class="p-2 text-right no-print flex justify-end gap-2"><button class="icon-btn text-blue-500 hover:text-blue-700" data-id="${item.id}" data-type="gold" data-action="edit" aria-label="Edit Gold Item">&#9998;</button><button class="icon-btn text-red-500 hover:text-red-700" data-id="${item.id}" data-type="gold" data-action="delete" aria-label="Delete Gold Item">&#128465;</button></td></tr>`;
        }).join('');
        itemsList.innerHTML = tableHeader + tableRows + `</tbody></table></div>`;
    };
    const renderSilverItems = () => {
        if (silverItems.length === 0) { silverItemsList.innerHTML = ''; return; }
        const tableHeader = `<h3 class="text-lg font-semibold text-gray-700 mb-2">Silver Items</h3><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead class="bg-gray-50"><tr><th class="p-2">Item</th><th class="p-2 text-right">Weight</th><th class="p-2 text-right">Value</th><th class="p-2 no-print"></th></tr></thead><tbody>`;
        const tableRows = silverItems.map((item) => `<tr class="border-b"><td class="p-2 font-medium">${item.name}</td><td class="p-2 text-right">${item.weight.toFixed(2)}g</td><td class="p-2 text-right">${formatCurrency(item.value)}</td><td class="p-2 text-right no-print flex justify-end gap-2"><button class="icon-btn text-blue-500 hover:text-blue-700" data-id="${item.id}" data-type="silver" data-action="edit" aria-label="Edit Silver Item">&#9998;</button><button class="icon-btn text-red-500 hover:text-red-700" data-id="${item.id}" data-type="silver" data-action="delete" aria-label="Delete Silver Item">&#128465;</button></td></tr>`).join('');
        silverItemsList.innerHTML = tableHeader + tableRows + `</tbody></table></div>`;
    };
    const renderOldGoldItems = () => {
        if (oldGoldItems.length === 0) { oldGoldList.innerHTML = ''; return; }
        const tableHeader = `<h3 class="text-lg font-semibold text-gray-700 mt-6 mb-2">Exchanged Items</h3><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead class="bg-gray-50"><tr><th class="p-2">Item</th><th class="p-2 text-right">Net Wt. / Purity</th><th class="p-2 text-right">Value (-)</th><th class="p-2 no-print"></th></tr></thead><tbody>`;
        const tableRows = oldGoldItems.map((item) => `<tr class="border-b"><td class="p-2 font-medium">${item.name}</td><td class="p-2 text-right">${item.netWeight.toFixed(2)}g (${item.purityPercent}%)</td><td class="p-2 text-right">${formatCurrency(item.goldValue)}</td><td class="p-2 text-right no-print flex justify-end gap-2"><button class="icon-btn text-blue-500 hover:text-blue-700" data-id="${item.id}" data-type="oldGold" data-action="edit" aria-label="Edit Old Gold Item">&#9998;</button><button class="icon-btn text-red-500 hover:text-red-700" data-id="${item.id}" data-type="oldGold" data-action="delete" aria-label="Delete Old Gold Item">&#128465;</button></td></tr>`).join('');
        oldGoldList.innerHTML = tableHeader + tableRows + `</tbody></table></div>`;
    };
    const renderPayments = () => {
        if (paymentDetails.length === 0) { paymentList.innerHTML = ''; return; }
        const tableHeader = `<div class="overflow-x-auto mt-4"><table class="w-full text-sm text-left"><thead class="bg-gray-50"><tr><th class="p-2">Mode</th><th class="p-2">Reference</th><th class="p-2 text-right">Amount</th><th class="p-2 no-print"></th></tr></thead><tbody>`;
        const tableRows = paymentDetails.map(p => `<tr class="border-b"><td class="p-2 font-medium">${p.mode}</td><td class="p-2 text-gray-600">${p.ref || '-'}</td><td class="p-2 text-right">${formatCurrency(p.amount)}</td><td class="p-2 text-right no-print"><button class="icon-btn text-red-500 hover:text-red-700" data-id="${p.id}" data-type="payment" data-action="delete" aria-label="Delete Payment">&#128465;</button></td></tr>`).join('');
        paymentList.innerHTML = tableHeader + tableRows + `</tbody></table></div>`;
    };

    // --- 6. Calculation Logic ---
    const calculateTotals = (returnObject = false) => {
        const savedState = JSON.parse(localStorage.getItem('jewelBillCurrentState')) || {};
        const totalItemsInBill = items.length + silverItems.length + oldGoldItems.length;
        if (totalItemsInBill === 0) {
            summarySection.classList.add('hidden'); chargesConfig.classList.add('hidden');
            actionButtons.classList.add('hidden'); paymentSection.classList.add('hidden');
            if (!returnObject) saveState(); return;
        }
        chargesConfig.classList.remove('hidden'); actionButtons.classList.remove('hidden'); paymentSection.classList.remove('hidden');
        const wastagePercent = parseFloat(wastageInput.value) || 0; const gstPercent = parseFloat(gstInput.value) || 0;
        const goldSubtotal = items.reduce((sum, item) => sum + item.goldValue, 0);
        const wastageValue = (goldSubtotal * wastagePercent) / 100;
        const goldMakingCharges = items.reduce((sum, item) => (sum + (item.makingCharge.type === 'perGram' ? item.grossWeight * item.makingCharge.value : item.makingCharge.value)), 0);
        const silverSubtotal = silverItems.reduce((sum, item) => sum + item.value, 0);
        const totalBeforeGst = goldSubtotal + wastageValue + goldMakingCharges + silverSubtotal;
        const gstValue = (totalBeforeGst * gstPercent) / 100; const grandTotal = totalBeforeGst + gstValue;
        const oldGoldTotal = oldGoldItems.reduce((sum, item) => sum + item.goldValue, 0);
        let discount = 0;
        const discountInput = getEl('discount-input');
        if (discountInput) discount = parseFloat(discountInput.value) || 0;
        else discount = parseFloat(savedState.discount) || 0;
        const netPayable = grandTotal - oldGoldTotal - discount;
        const totalPaid = paymentDetails.reduce((sum, p) => sum + p.amount, 0);
        const balanceDue = netPayable - totalPaid;
        let summaryHTML = `<div class="space-y-2 text-sm">`;
        if (goldSubtotal > 0) {
            summaryHTML += `<div class="flex justify-between"><span class="text-gray-600">Total Gold Value</span><span class="font-semibold">${formatCurrency(goldSubtotal)}</span></div><div class="flex justify-between"><span class="text-gray-600">Wastage (${wastagePercent}%)</span><span class="font-semibold">${formatCurrency(wastageValue)}</span></div><div class="flex justify-between"><span class="text-gray-600">Total Making Charges</span><span class="font-semibold">${formatCurrency(goldMakingCharges)}</span></div>`;
        }
        if (silverSubtotal > 0) {
            summaryHTML += `<div class="flex justify-between ${goldSubtotal > 0 ? 'border-t mt-2 pt-2' : ''}"><span class="text-gray-600">Total Silver Value</span><span class="font-semibold">${formatCurrency(silverSubtotal)}</span></div>`;
        }
        summaryHTML += `<div class="flex justify-between font-bold border-t pt-2 mt-2"><span>Total before GST</span><span>${formatCurrency(totalBeforeGst)}</span></div><div class="flex justify-between"><span class="text-gray-600">GST (${gstPercent}%)</span><span class="font-semibold">${formatCurrency(gstValue)}</span></div><div class="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Bill Total</span><span>${formatCurrency(grandTotal)}</span></div>`;
        if (oldGoldTotal > 0) {
            summaryHTML += `<div class="flex justify-between text-blue-600"><span class="font-semibold">Less: Old Gold Exchange</span><span class="font-semibold">- ${formatCurrency(oldGoldTotal)}</span></div>`;
        }
        summaryHTML += `<div class="grid grid-cols-1 gap-4 pt-4 no-print"><div><label for="discount-input" class="form-label">Discount (-)</label><input type="number" id="discount-input" value="${(discount || 0).toFixed(2)}" class="form-input" placeholder="0.00"></div></div>`;
        if (discount > 0) {
            summaryHTML += `<div class="flex justify-between text-red-600"><span class="font-semibold">Discount</span><span class="font-semibold">- ${formatCurrency(discount)}</span></div>`;
        }
        summaryHTML += `<div class="flex justify-between text-xl font-bold bg-yellow-100 p-2 rounded-md mt-2"><span>Net Amount Payable</span><span>${formatCurrency(netPayable)}</span></div><div class="flex justify-between text-lg font-semibold mt-2 pt-2 border-t"><span>Total Paid</span><span>${formatCurrency(totalPaid)}</span></div><div class="flex justify-between text-xl font-bold ${balanceDue > 0.009 ? 'text-red-600' : 'text-green-600'}"><span>Balance Due</span><span>${formatCurrency(balanceDue)}</span></div></div>`;
        summarySection.innerHTML = summaryHTML;
        summarySection.classList.remove('hidden');
        getEl('discount-input').addEventListener('input', () => calculateTotals(false));
        if (returnObject) {
            return { goldRate22k, silverRate, goldSubtotal, wastageValue, goldMakingCharges, silverSubtotal, totalBeforeGst, gstValue, grandTotal, oldGoldTotal, discount, netPayable, totalPaid, balanceDue, wastagePercent, gstPercent };
        } else {
            saveState();
        }
    };

    // --- 7. Modal Logic ---
    const openCustomerModal = () => {
        renderCustomerListModal(); customerModal.classList.remove('hidden'); customerSearch.focus();
    };
    const closeCustomerModalHandler = () => customerModal.classList.add('hidden');
    const renderCustomerListModal = (searchTerm = '') => {
        customerListModal.innerHTML = ''; const lowerSearchTerm = searchTerm.toLowerCase();
        const filteredCustomers = customers.filter(c => (c.name && c.name.toLowerCase().includes(lowerSearchTerm)) || (c.phone && c.phone.includes(searchTerm)) || (c.address && c.address.toLowerCase().includes(lowerSearchTerm)));
        if (filteredCustomers.length === 0) {
            customerListModal.innerHTML = '<li class="text-gray-500 text-center py-4">No customers found.</li>'; return;
        }
        filteredCustomers.forEach(customer => {
            const li = document.createElement('li');
            li.className = 'p-2 border-b hover:bg-gray-100 cursor-pointer flex justify-between items-center';
            li.innerHTML = `<div class="flex-grow mr-2"><span class="font-medium">${customer.name}</span><br><span class="text-sm text-gray-500">${customer.phone || 'No phone'}</span><br><span class="text-xs text-gray-400">${customer.address || 'No address'}</span></div><button class="icon-btn text-red-500 hover:text-red-700 p-1" data-id="${customer.id}" aria-label="Delete Customer">&#128465;</button>`;
            li.querySelector('div').addEventListener('click', () => {
                customerNameInput.value = customer.name; customerPhoneInput.value = customer.phone || ''; customerAddressInput.value = customer.address || '';
                saveCustomerCheckbox.checked = false; closeCustomerModalHandler(); saveState();
            });
            li.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation(); if (confirm(`Delete ${customer.name}?`)) {
                    customers = customers.filter(c => c.id !== customer.id); saveState(); renderCustomerListModal(customerSearch.value);
                }
            });
            customerListModal.appendChild(li);
        });
    };
    const openHistoryModal = () => { renderHistoryListModal(); historyModal.classList.remove('hidden'); };
    const closeHistoryModalHandler = () => historyModal.classList.add('hidden');
    const handleDeleteBill = (billNumber) => {
        if (!confirm(`Are you sure you want to delete bill ${billNumber}? This cannot be undone.`)) return;
        const numPart = parseInt(billNumber.replace(billPrefix, ''));
        if (numPart === lastBillNum) lastBillNum--;
        billHistory = billHistory.filter(b => b.billNumber !== billNumber);
        saveState(); renderHistoryListModal(); 
    };
    const renderHistoryListModal = () => {
        historyListModal.innerHTML = ''; const sortedHistory = [...billHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        if (sortedHistory.length === 0) {
            historyListModal.innerHTML = '<li class="text-gray-500 text-center py-4">No past bills found.</li>'; return;
        }
        sortedHistory.forEach(bill => {
            const li = document.createElement('li'); li.className = 'p-3 border rounded-md flex flex-col gap-2';
            const billDate = new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
            const netPayable = bill.totals?.netPayable ?? 0;
            li.innerHTML = `<div class="flex justify-between items-center mb-1"><span class="font-semibold text-blue-600">${bill.billNumber}</span> <span class="text-xs text-gray-500">${billDate}</span></div><div class="text-sm mb-1">Cust: <span class="font-medium">${bill.customer?.name || 'N/A'}</span>${bill.customer?.phone ? `<span class="text-gray-500 text-xs"> (${bill.customer.phone})</span>` : ''}</div><div class="text-sm font-bold text-right mb-2">Total: ${formatCurrency(netPayable)}</div><div class="flex justify-end gap-2 border-t pt-2 mt-1"><button data-bill-number="${bill.billNumber}" data-action="print" data-print-type="thermal" class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded">Estimate</button><button data-bill-number="${bill.billNumber}" data-action="print" data-print-type="a4" class="text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded">A4 Bill</button><button data-bill-number="${bill.billNumber}" data-action="delete-bill" class="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded">Delete</button></div>`;
            li.querySelectorAll('button[data-action="print"]').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); const billNumToPrint = e.target.dataset.billNumber; const printType = e.target.dataset.printType;
                    const billToPrint = billHistory.find(b => b.billNumber === billNumToPrint);
                    if (billToPrint) {
                        closeHistoryModalHandler();
                        setTimeout(() => {
                            if (printType === 'a4') prepareA4Print(true, billToPrint, true); 
                            else if (printType === 'thermal') triggerWiFiPrint(billToPrint); // <-- Use Wi-Fi print
                        }, 50);
                    } else alert(`Error: Could not find bill ${billNumToPrint} data.`);
                });
            });
            const deleteButton = li.querySelector('button[data-action="delete-bill"]');
            if (deleteButton) deleteButton.addEventListener('click', (e) => { e.stopPropagation(); handleDeleteBill(e.target.dataset.billNumber); });
            historyListModal.appendChild(li);
        });
    };
    const openThermalPreview = () => {
        const plainText = prepareThermalText(null);
        if (plainText) {
            thermalReceiptContent.textContent = plainText;
            thermalReceiptPreviewModal.classList.remove('hidden');
        } else alert("Cannot generate preview with no items.");
    };
    const closeThermalPreview = () => {
        thermalReceiptPreviewModal.classList.add('hidden');
        thermalReceiptContent.textContent = '';
    };

    // --- 8. Form Submit Handlers ---
    const handleGoldFormSubmit = (e) => {
        e.preventDefault(); const name = getEl('item-name').value; if (!name) { alert('Please enter gold item name.'); return; }
        const grossWeight = parseFloat(getEl('gross-weight').value); const stoneWeight = parseFloat(getEl('stone-weight').value) || 0;
        const karat = parseInt(getEl('karat').value); const makingChargeType = getEl('making-charge-type').value;
        const makingChargeValue = parseFloat(getEl('making-charge-value').value); const editingId = getEl('editing-gold-item-id').value;
        if (isNaN(grossWeight) || grossWeight <= 0 || stoneWeight < 0 || grossWeight < stoneWeight) { alert('Please enter valid weights.'); return; }
        if (isNaN(makingChargeValue) || makingChargeValue < 0) { alert('Please enter a valid making charge.'); return; }
        const netWeight = grossWeight - stoneWeight; const purityAdjustedWeight = netWeight * (karat / 22);
        const goldValue = purityAdjustedWeight * goldRate22k;
        const itemData = { name, grossWeight, stoneWeight, karat, netWeight, purityAdjustedWeight, goldValue, makingCharge: { type: makingChargeType, value: makingChargeValue } };
        if (editingId) {
            const index = items.findIndex(item => item.id == editingId); if (index > -1) items[index] = { ...items[index], ...itemData };
        } else { itemData.id = Date.now(); items.push(itemData); }
        goldItemForm.reset(); getEl('karat').value = '22'; getEl('making-charge-type').value = 'perGram';
        getEl('stone-weight').value = '0'; getEl('editing-gold-item-id').value = ''; addGoldItemBtn.textContent = 'Add Gold Item';
        getEl('item-name').focus(); renderAllLists();
    };
    const handleSilverFormSubmit = (e) => {
        e.preventDefault(); const name = getEl('silver-item-name').value; if (!name) { alert('Please enter silver item name.'); return; }
        const weight = parseFloat(getEl('silver-item-weight').value); const editingId = getEl('editing-silver-item-id').value;
        if (isNaN(weight) || weight <= 0) { alert('Please enter a valid weight.'); return; }
        const value = weight * silverRate; const itemData = { name, weight, value };
        if (editingId) {
            const index = silverItems.findIndex(item => item.id == editingId); if (index > -1) silverItems[index] = { ...silverItems[index], ...itemData };
        } else { itemData.id = Date.now(); silverItems.push(itemData); }
        silverItemForm.reset(); getEl('editing-silver-item-id').value = ''; addSilverItemBtn.textContent = 'Add Silver Item';
        getEl('silver-item-name').focus(); renderAllLists();
    };
    const handleOldGoldFormSubmit = (e) => {
        e.preventDefault(); const name = getEl('old-item-name').value; if (!name) { alert('Please enter old gold item name.'); return; }
        const netWeight = parseFloat(getEl('old-item-weight').value); const purityPercent = parseFloat(getEl('old-item-purity').value);
        const editingId = getEl('editing-old-gold-item-id').value;
        if (isNaN(netWeight) || netWeight <= 0 || isNaN(purityPercent) || purityPercent <= 0 || purityPercent > 100) { alert('Please enter a valid weight and purity (1-100%).'); return; }
        const purityAdjustedWeight = netWeight * (purityPercent / 91.6); const goldValue = purityAdjustedWeight * goldRate22k;
        const itemData = { name, netWeight, purityPercent, purityAdjustedWeight, goldValue };
        if (editingId) {
            const index = oldGoldItems.findIndex(item => item.id == editingId); if (index > -1) oldGoldItems[index] = { ...oldGoldItems[index], ...itemData };
        } else { itemData.id = Date.now(); oldGoldItems.push(itemData); }
        oldGoldForm.reset(); getEl('editing-old-gold-item-id').value = ''; addOldGoldBtn.textContent = 'Add Old Gold';
        getEl('old-item-name').focus(); renderAllLists();
    };
    const handlePaymentFormSubmit = (e) => {
        e.preventDefault(); const mode = getEl('payment-mode').value; const amount = parseFloat(getEl('payment-amount').value);
        const ref = getEl('payment-ref').value;
        if (isNaN(amount) || amount <= 0) { alert('Please enter a valid payment amount.'); return; }
        paymentDetails.push({ id: Date.now(), mode, amount, ref });
        paymentForm.reset(); getEl('payment-mode').value = 'Cash'; getEl('payment-amount').focus(); renderAllLists();
    };
    const handleShopDetailsSubmit = (e) => {
        e.preventDefault();
        shopDetails.name = shopNameInput.value.trim();
        shopDetails.phone = shopPhoneInput.value.trim();
        shopDetails.email = shopEmailInput.value.trim();
        shopDetails.address = shopAddressInput.value.trim();
        shopDetails.printerIp = printerIpInput.value.trim();
        shopDetails.bridgeUrl = bridgeUrlInput.value.trim();
        saveShopDetails();
        statusLabel.textContent = "Details saved. Ensure Bridge Server is running.";
        statusLabel.style.color = "green";
        showToast(settingsToast);
        settingsPanel.classList.add('hidden');
    };

    // --- 9. Item Edit/Delete Logic ---
    const handleListClick = (e) => {
        const target = e.target.closest('button[data-action]'); if (!target) return;
        const { id, type, action } = target.dataset; if (!id || !type || !action) return;
        if (action === 'delete') handleItemDelete(id, type);
        else if (action === 'edit') handleItemEdit(id, type);
    };
    const handleItemDelete = (id, type) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        switch (type) {
            case 'gold': items = items.filter(item => item.id != id); break;
            case 'silver': silverItems = silverItems.filter(item => item.id != id); break;
            case 'oldGold': oldGoldItems = oldGoldItems.filter(item => item.id != id); break;
            case 'payment': paymentDetails = paymentDetails.filter(p => p.id != id); break;
        }
        renderAllLists();
    };
    const handleItemEdit = (id, type) => {
        let item;
        switch (type) {
            case 'gold':
                item = items.find(item => item.id == id); if (!item) return;
                getEl('item-name').value = item.name; getEl('gross-weight').value = item.grossWeight;
                getEl('stone-weight').value = item.stoneWeight; getEl('karat').value = item.karat;
                getEl('making-charge-type').value = item.makingCharge.type; getEl('making-charge-value').value = item.makingCharge.value;
                getEl('editing-gold-item-id').value = item.id; addGoldItemBtn.textContent = 'Update Gold Item'; getEl('item-name').focus();
                break;
            case 'silver':
                item = silverItems.find(item => item.id == id); if (!item) return;
                getEl('silver-item-name').value = item.name; getEl('silver-item-weight').value = item.weight;
                getEl('editing-silver-item-id').value = item.id; addSilverItemBtn.textContent = 'Update Silver Item'; getEl('silver-item-name').focus();
                break;
            case 'oldGold':
                item = oldGoldItems.find(item => item.id == id); if (!item) return;
                getEl('old-item-name').value = item.name; getEl('old-item-weight').value = item.netWeight;
                getEl('old-item-purity').value = item.purityPercent;
                getEl('editing-old-gold-item-id').value = item.id; addOldGoldBtn.textContent = 'Update Old Gold'; getEl('old-item-name').focus();
                break;
        }
    };

    // --- 10. Wi-Fi Printing Logic ---
    const prepareA4Print = (isFinalBill, billData = null, isReprint = false) => {
        const displayData = billData || {
            billNumber: `EST-${Date.now().toString().slice(-6)}`, date: new Date().toISOString(),
            customer: { name: customerNameInput.value, phone: customerPhoneInput.value, address: customerAddressInput.value },
            items: items, silverItems: silverItems, oldGoldItems: oldGoldItems, paymentDetails: paymentDetails,
            totals: calculateTotals(true), shopDetails: shopDetails
        };
        shopNamePrint.textContent = displayData.shopDetails?.name || 'JewelBill';
        shopPhonePrint.textContent = displayData.shopDetails?.phone || '(Not Set)';
        shopEmailPrint.textContent = displayData.shopDetails?.email || '(Not Set)';
        shopAddressPrint.textContent = displayData.shopDetails?.address || '(Not Set)';
        let title = 'ESTIMATE';
        if (isFinalBill) title = isReprint ? 'DUPLICATE INVOICE' : 'FINAL INVOICE';
        invoiceTitlePrint.textContent = title;
        billNoPrint.textContent = displayData.billNumber;
        billDatePrint.textContent = new Date(displayData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        customerNamePrint.textContent = displayData.customer?.name || 'N/A';
        customerPhonePrint.textContent = displayData.customer?.phone || 'N/A';
        customerAddressPrint.textContent = displayData.customer?.address || 'N/A';
        itemsListPrint.innerHTML = ''; let itemRowsHTML = '';
        const allItems = [...(displayData.items || []), ...(displayData.silverItems || [])];
        const totals = displayData.totals;
        allItems.forEach(item => {
            let itemName = item.name, netWeight, rate, value, makingCharge = 0, subtotal = 0, isGold = item.hasOwnProperty('karat');
            if (isGold) {
                itemName += ` (${item.karat}K)`; netWeight = item.netWeight?.toFixed(3); rate = totals?.goldRate22k || goldRate22k;
                value = (item.purityAdjustedWeight || (item.netWeight * (item.karat / 22))) * rate;
                makingCharge = item.makingCharge.type === 'perGram' ? item.grossWeight * item.makingCharge.value : item.makingCharge.value;
                subtotal = value + makingCharge;
            } else {
                netWeight = item.weight?.toFixed(2); rate = totals?.silverRate || silverRate; value = item.weight * rate; subtotal = value;
            }
            itemRowsHTML += `<tr><td>${itemName}</td><td>${netWeight || '-'}g</td><td>${formatCurrency(rate)}</td><td>${formatCurrency(value)}</td><td>${isGold ? formatCurrency(makingCharge) : '-'}</td><td>${formatCurrency(subtotal)}</td></tr>`;
        });
        itemsListPrint.innerHTML = itemRowsHTML;
        if (displayData.oldGoldItems?.length > 0) {
            oldGoldListPrint.innerHTML = ''; let oldGoldRowsHTML = ''; const rateUsed = totals?.goldRate22k || goldRate22k;
            displayData.oldGoldItems.forEach(item => {
                const value = (item.purityAdjustedWeight || (item.netWeight * (item.purityPercent / 91.6))) * rateUsed;
                oldGoldRowsHTML += `<tr><td>${item.name}</td><td>${item.netWeight.toFixed(2)}g</td><td>${item.purityPercent}%</td><td>${formatCurrency(rateUsed)}</td><td>${formatCurrency(value)}</td></tr>`;
            });
            oldGoldListPrint.innerHTML = oldGoldRowsHTML; oldGoldSectionPrint.classList.remove('hidden');
        } else { oldGoldSectionPrint.classList.add('hidden'); oldGoldListPrint.innerHTML = ''; }
        summarySectionPrint.innerHTML = '';
        if (totals) {
            let summaryHTML = ``; const combinedItemSubtotal = (totals.goldSubtotal || 0) + (totals.silverSubtotal || 0) + (totals.goldMakingCharges || 0);
            summaryHTML += `<div class="flex"><span>Subtotal</span><span class="font-semibold">${formatCurrency(combinedItemSubtotal)}</span></div>`;
            if ((totals.wastageValue || 0) > 0) summaryHTML += `<div class="flex"><span>Wastage (${totals.wastagePercent || 0}%)</span><span>${formatCurrency(totals.wastageValue || 0)}</span></div>`;
            summaryHTML += `<div class="flex"><span>Tax/GST (${totals.gstPercent || 0}%)</span><span>${formatCurrency(totals.gstValue || 0)}</span></div>`;
            if ((totals.oldGoldTotal || 0) > 0) summaryHTML += `<div class="flex"><span>Less: Old Gold</span><span>- ${formatCurrency(totals.oldGoldTotal || 0)}</span></div>`;
            if ((totals.discount || 0) > 0) summaryHTML += `<div class="flex"><span>Discount</span><span>- ${formatCurrency(totals.discount || 0)}</span></div>`;
            summaryHTML += `<div class="flex border-t border-b-2 border-pink-500 py-1 my-1 text-sm"><span class="font-bold">TOTAL</span><span class="font-bold">${formatCurrency(totals.netPayable || 0)}</span></div>`;
            if (isFinalBill) {
                summaryHTML += `<div class="flex text-xs mt-1"><span>Total Paid</span><span>${formatCurrency(totals.totalPaid || 0)}</span></div>`;
                summaryHTML += `<div class="flex text-xs font-semibold ${ (totals.balanceDue || 0) > 0.009 ? 'text-red-600' : 'text-green-600' }"><span>Balance Due</span><span>${formatCurrency(totals.balanceDue || 0)}</span></div>`;
            }
            summarySectionPrint.innerHTML = summaryHTML;
        }
        if (isFinalBill && displayData.paymentDetails?.length > 0) {
            paymentListPrint.innerHTML = displayData.paymentDetails.map(p => `<p>${p.mode}: ${formatCurrency(p.amount)} ${p.ref ? `(${p.ref})` : ''}</p>`).join('');
            paymentSectionPrint.classList.remove('hidden');
        } else { paymentSectionPrint.classList.add('hidden'); paymentListPrint.innerHTML = ''; }
        document.body.classList.add('printing-a4'); document.body.classList.remove('printing-thermal');
        window.print(); document.body.classList.remove('printing-a4');
    };
    const prepareThermalText = (billData = null) => {
        const source = billData || {
            customer: { name: customerNameInput.value, phone: customerPhoneInput.value, address: customerAddressInput.value },
            items, silverItems, oldGoldItems, totals: calculateTotals(true), shopDetails: shopDetails
        };
        const totals = source.totals;
        const line = (label, value, width = 32) => {
            const labelStr = label.toString(); const valueStr = value.toString();
            const spaces = Math.max(0, width - labelStr.length - valueStr.length);
            return `${labelStr}${' '.repeat(spaces)}${valueStr}\n`;
        };
        const center = (text, width = 32) => {
            if (!text) return '\n';
            const spaces = Math.max(0, Math.floor((width - text.length) / 2));
            return `${' '.repeat(spaces)}${text}\n`;
        };
        const wrap = (text, width = 32) => {
             if (!text) return '\n'; let wrapped = '';
             for (let i = 0; i < text.length; i += width) { wrapped += text.substring(i, i + width) + '\n'; }
             return wrapped;
        };
        const hr = '--------------------------------\n';
        let text = center(source.shopDetails.name || 'JewelBill');
        text += hr;
        text += center(billData ? `DUPLICATE BILL (${billData.billNumber})` : 'ESTIMATE');
        text += hr;
        text += line(`Date:`, new Date(billData ? billData.date : Date.now()).toLocaleDateString('en-IN'));
        text += `Cust: ${source.customer?.name || 'N/A'}\n`;
        if (source.customer?.phone) text += `Phone: ${source.customer.phone}\n`;
        if (source.customer?.address) text += `Addr: ${wrap(source.customer.address)}`;
        text += hr;
        if (source.items.length > 0) {
            text += `Gold Items\n`;
            source.items.forEach(item => { const makingCharge = (item.makingCharge.type === 'perGram' ? item.grossWeight * item.makingCharge.value : item.makingCharge.value);
                text += `${item.name} (${item.karat}K)\n`; text += line(` Net Wt:${item.netWeight.toFixed(3)}g`, formatCurrency(item.goldValue)); text += line(` Making Charge:`, formatCurrency(makingCharge));
            }); text += hr;
        }
        if (source.silverItems.length > 0) {
            text += `Silver Items\n`;
            source.silverItems.forEach(item => { text += `${item.name}\n`; text += line(` Weight:${item.weight.toFixed(2)}g`, formatCurrency(item.value)); }); text += hr;
        }
        if (totals.goldSubtotal > 0) text += line('Gold Value:', formatCurrency(totals.goldSubtotal));
        if (totals.wastageValue > 0) text += line('Wastage:', formatCurrency(totals.wastageValue));
        if (totals.goldMakingCharges > 0) text += line('Making Charges:', formatCurrency(totals.goldMakingCharges));
        if (totals.silverSubtotal > 0) text += line('Silver Value:', formatCurrency(totals.silverSubtotal));
        text += line('Total Before GST:', formatCurrency(totals.totalBeforeGst));
        if (totals.gstValue > 0) text += line(`GST (${totals.gstPercent}%):`, formatCurrency(totals.gstValue));
        text += line('Bill Total:', formatCurrency(totals.grandTotal));
        if (totals.oldGoldTotal > 0) text += line('Old Gold (-):', formatCurrency(totals.oldGoldTotal));
        if (totals.discount > 0) text += line('Discount (-):', formatCurrency(totals.discount));
        text += '================================\n'; text += line('NET PAYABLE:', formatCurrency(totals.netPayable)); text += '================================\n\n';
        if (billData && source.paymentDetails?.length > 0) {
            text += `Payments Received\n`; source.paymentDetails.forEach(p => { text += line(`${p.mode}:`, formatCurrency(p.amount)); }); text += hr;
            text += line('Total Paid:', formatCurrency(totals.totalPaid ?? 0)); text += line('Balance Due:', formatCurrency(totals.balanceDue ?? 0)); text += hr;
        }
        text += center('Thank You!') + '\n\n\n\n';
        return text;
    };
    
    /**
     * ** Wi-Fi Print Function **
     */
    const triggerWiFiPrint = async (billData = null) => {
        const printerIp = shopDetails.printerIp;
        const bridgeUrl = shopDetails.bridgeUrl;
        if (!printerIp || !bridgeUrl) {
            alert("Printer IP or Bridge URL is not set. Please check Settings.");
            return;
        }
        const plainText = prepareThermalText(billData);
        if (!plainText) {
            alert("Cannot generate estimate content.");
            return;
        }
        statusLabel.textContent = 'Sending to bridge...';
        statusLabel.style.color = 'inherit';
        try {
            const response = await fetch(`${bridgeUrl}/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ printerIp: printerIp, text: plainText })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server responded with ${response.status}`);
            }
            const result = await response.json();
            console.log('Print job sent:', result);
            statusLabel.textContent = 'Print job sent successfully!';
            statusLabel.style.color = 'green';
        } catch (error) {
            console.error('Print Failed!', error);
            if (error instanceof TypeError) { 
                statusLabel.textContent = 'Error: Bridge Server is not reachable.';
                alert('Error: Could not connect to the Bridge Server.\n\nPlease ensure the server is running on your computer and the URL is correct.');
            } else {
                statusLabel.textContent = `Print Failed: ${error.message}`;
                alert(`Print Failed: ${error.message}`);
            }
            statusLabel.style.color = 'red';
        }
    };
    
    // --- 11. Main Action Button Handlers ---
    const handleGenerateBill = () => {
        if (items.length === 0 && silverItems.length === 0) { alert("Cannot generate bill with no items."); return; }
        let billToPrint;
        if (currentBillSaved) {
            if (billHistory.length > 0) { billToPrint = billHistory[billHistory.length - 1]; prepareA4Print(true, billToPrint, true); } 
            else { alert("Error: Bill state saved, but no bill found in history."); return; }
        } else {
            const billNumber = generateNextBillNumber(); const billDate = new Date().toISOString();
            const currentCustomer = { name: customerNameInput.value.trim(), phone: customerPhoneInput.value.trim(), address: customerAddressInput.value.trim() };
            const billTotals = calculateTotals(true);
            const billData = {
                billNumber, date: billDate, customer: currentCustomer,
                items: JSON.parse(JSON.stringify(items)), silverItems: JSON.parse(JSON.stringify(silverItems)),
                oldGoldItems: JSON.parse(JSON.stringify(oldGoldItems)), paymentDetails: JSON.parse(JSON.stringify(paymentDetails)),
                totals: billTotals, shopDetails: JSON.parse(JSON.stringify(shopDetails))
            };
            billHistory.push(billData); billToPrint = billData;
            if (saveCustomerCheckbox.checked && currentCustomer.name) {
                const existingCustomerIndex = customers.findIndex(c => c.name.toLowerCase() === currentCustomer.name.toLowerCase() || (c.phone && currentCustomer.phone && c.phone === currentCustomer.phone));
                if (existingCustomerIndex === -1) {
                    customers.push({ id: Date.now(), name: currentCustomer.name, phone: currentCustomer.phone, address: currentCustomer.address });
                }
            }
            currentBillSaved = true; generateBillBtn.textContent = 'Reprint A4 Bill'; saveState();
            prepareA4Print(true, billToPrint, false); 
            alert(`Bill ${billNumber} saved successfully!`);
        }
    };
    const resetFormLogic = () => {
        items = []; silverItems = []; oldGoldItems = []; paymentDetails = [];
        customerNameInput.value = ''; customerPhoneInput.value = ''; customerAddressInput.value = '';
        saveCustomerCheckbox.checked = false;
        currentBillSaved = false; generateBillBtn.textContent = 'Generate & Print A4 Bill';
        const currentState = JSON.parse(localStorage.getItem('jewelBillCurrentState')) || {};
        currentState.customerName = ''; currentState.customerPhone = ''; currentState.customerAddress = '';
        currentState.items = []; currentState.silverItems = []; currentState.oldGoldItems = [];
        currentState.paymentDetails = []; currentState.discount = 0; currentState.currentBillSaved = false;
        localStorage.setItem('jewelBillCurrentState', JSON.stringify(currentState));
        renderAllLists(); window.scrollTo({ top: 0, behavior: 'smooth' });
        if (appBody && !appBody.classList.contains('hidden')) customerNameInput.focus();
        else goldRateInput.focus();
        console.log("Form reset for new bill.");
    };

    // --- 12. Event Listeners ---
    setRatesBtn.addEventListener('click', () => {
        const goldRate = parseFloat(goldRateInput.value); const silverR = parseFloat(silverRateInput.value);
        if (!isNaN(goldRate) && goldRate > 0 && !isNaN(silverR) && silverR > 0) {
            goldRate22k = goldRate; silverRate = silverR; saveRates(); recalculateAllItemValues(); renderAllLists(); updateRateDisplay(false);
        } else alert('Please enter valid positive rates...');
    });
    editRatesBtn.addEventListener('click', () => updateRateDisplay(true));
    goldItemForm.addEventListener('submit', handleGoldFormSubmit);
    silverItemForm.addEventListener('submit', handleSilverFormSubmit);
    oldGoldForm.addEventListener('submit', handleOldGoldFormSubmit);
    paymentForm.addEventListener('submit', handlePaymentFormSubmit);
    shopDetailsForm.addEventListener('submit', handleShopDetailsSubmit);
    billingContainer.addEventListener('click', handleListClick);
    paymentSection.addEventListener('click', handleListClick);
    settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
    selectCustomerBtn.addEventListener('click', openCustomerModal);
    closeCustomerModal.addEventListener('click', closeCustomerModalHandler);
    customerSearch.addEventListener('input', (e) => renderCustomerListModal(e.target.value));
    historyBtn.addEventListener('click', openHistoryModal);
    closeHistoryModal.addEventListener('click', closeHistoryModalHandler);
    recalculateBtn.addEventListener('click', () => calculateTotals(false));
    previewEstimateBtn.addEventListener('click', openThermalPreview);
    closeThermalPreviewBtn.addEventListener('click', closeThermalPreview);
    
    // Correct listener for Wi-Fi print
    printEstimateBtn.addEventListener('click', () => triggerWiFiPrint(null));
    
    generateBillBtn.addEventListener('click', handleGenerateBill);
    resetBtn.addEventListener('click', () => {
        if (items.length > 0 || silverItems.length > 0 || customerNameInput.value) {
            if (confirm('Start a new bill? ...')) resetFormLogic();
        } else resetFormLogic();
    });
    
    // No connect button listener
    
    customerNameInput.addEventListener('input', saveState);
    customerPhoneInput.addEventListener('input', saveState);
    customerAddressInput.addEventListener('input', saveState);
    wastageInput.addEventListener('input', () => calculateTotals(false));
    gstInput.addEventListener('input', () => calculateTotals(false));
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js') .then(reg => console.log('SW registered.', reg)) .catch(err => console.error('SW registration failed:', err)); });
    }

    // --- 13. Initial Load ---
    loadState();
});