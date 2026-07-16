// API Base URL (Point to the Docker container port mapped to host)
const API_BASE_URL = 'http://localhost:5000/api';

let currentCustomerId = 'cust-1';
let currentMerchantId = 'merch-1'; // Default active merchant profile

let appState = {
    currentRole: 'customer', // 'customer' or 'merchant'
    customerTab: 'browse', // 'browse' or 'orders'
    listings: [],
    orders: [],
    savings: {
        customerCoins: 0,

        customerCashSaved: 0,
        merchantSales: 0,
        merchantRevenue: 0,

    }
};

// Fetch initial state from the API
async function initAppState() {
    await refreshState();
    // Default active role to customer on load
    appState.currentRole = 'customer';
    appState.customerTab = 'browse';
}

// Fetch lists and statistics from API and update local appState
async function refreshState() {
    try {
        // Fetch listings depending on role (customer gets all, merchant gets their own)
        let listingsUrl = `${API_BASE_URL}/listings`;
        if (appState.currentRole === 'merchant') {
            listingsUrl += `?merchantId=${currentMerchantId}`;
        }
        const listingsRes = await fetch(listingsUrl);
        if (listingsRes.ok) {
            appState.listings = await listingsRes.json();
        }

        // Fetch orders
        let ordersUrl = `${API_BASE_URL}/orders`;
        if (appState.currentRole === 'customer') {
            ordersUrl += `?customerId=${currentCustomerId}`;
        } else {
            ordersUrl += `?merchantId=${currentMerchantId}`;
        }
        const ordersRes = await fetch(ordersUrl);
        if (ordersRes.ok) {
            appState.orders = await ordersRes.json();
        }

        // Fetch savings dynamically
        let savingsUrl = `${API_BASE_URL}/savings`;
        if (appState.currentRole === 'customer') {
            savingsUrl += `?customerId=${currentCustomerId}`;
        } else {
            savingsUrl += `?merchantId=${currentMerchantId}`;
        }
        const savingsRes = await fetch(savingsUrl);
        if (savingsRes.ok) {
            appState.savings = await savingsRes.json();
        }

        // Refresh analytics if on merchant finance tab
        if (appState.currentRole === 'merchant') {
            await refreshMerchantAnalytics();
        }
    } catch (e) {
        console.error('Failed to communicate with the Backend API:', e);
        showToast('Gagal terhubung ke server backend.', '⚠️');
    }
}

// Profile selection change handler
async function handleProfileChange(value) {
    if (value.startsWith('cust-')) {
        currentCustomerId = value;
        setRole('customer');
    } else if (value.startsWith('merch-')) {
        currentMerchantId = value;
        setRole('merchant');
    }
}

// Format Currency Utility (Indonesian Rupiah)
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(number);
}

// Show Custom Notification Toast
function showToast(message, icon = '🎉') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('.toast-icon').innerText = icon;
    toast.querySelector('.toast-text').innerText = message;
    
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3500);
}

// Update Impact Badge / Revenue Badge in App Header
function updateHeaderImpactBadge() {
    const impactBadge = document.getElementById('user-impact-badge');
    if (!impactBadge) return;
    
    const cash = appState.savings.customerCashSaved !== undefined ? appState.savings.customerCashSaved : 0;
    const revenue = appState.savings.merchantRevenue !== undefined ? appState.savings.merchantRevenue : 0;

    if (appState.currentRole === 'customer') {
        impactBadge.innerHTML = `
            <span>Uang Dihemat: </span>
            <span class="impact-value" id="header-eco-score">💰 ${formatRupiah(cash)}</span>
        `;
    } else {
        impactBadge.innerHTML = `
            <span>Pendapatan: </span>
            <span class="impact-value" id="header-eco-score">💰 ${formatRupiah(revenue)}</span>
        `;
    }
}

// Role Switcher Flow
async function setRole(role) {
    appState.currentRole = role;
    
    // Sync the profile selector dropdown value
    const profileSelector = document.getElementById('profile-selector');
    if (profileSelector) {
        profileSelector.value = role === 'customer' ? currentCustomerId : currentMerchantId;
    }
    
    const customerView = document.getElementById('customer-portal');
    const merchantView = document.getElementById('merchant-portal');
    
    if (role === 'customer') {
        if (customerView) customerView.classList.add('active');
        if (merchantView) merchantView.classList.remove('active');
        
        await refreshState();
        renderCustomerPortal();
    } else {
        if (customerView) customerView.classList.remove('active');
        if (merchantView) merchantView.classList.add('active');
        
        // Reset merchant sub-tab on role switch
        switchMerchantTab('manage');
    }
    
    // Smooth scroll to top when switching roles
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
}

// Render Customer Portal
function renderCustomerPortal() {
    updateHeaderImpactBadge();
    switchCustomerTab(appState.customerTab);
}

// Navigation & Category Filters
let currentCategory = 'all';
let searchQuery = '';

function setCategoryFilter(category, element) {
    currentCategory = category;
    
    // Update active class on category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    element.classList.add('active');
    
    renderListingsFeed();
}

function handleSearch(query) {
    searchQuery = query.toLowerCase().trim();
    renderListingsFeed();
}

// Render Listings for Customers
function renderListingsFeed() {
    const feedContainer = document.getElementById('listings-feed');
    if (!feedContainer) return;
    feedContainer.innerHTML = '';
    
    const filteredListings = appState.listings.filter(item => {
        if (!item.active) return false;
        
        const matchesCategory = currentCategory === 'all' || item.category.toLowerCase() === currentCategory.toLowerCase();
        const matchesSearch = item.title.toLowerCase().includes(searchQuery) || 
                              item.merchantName.toLowerCase().includes(searchQuery) ||
                              item.description.toLowerCase().includes(searchQuery);
        
        return matchesCategory && matchesSearch;
    });
    
    if (filteredListings.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍲</div>
                <h3>Tidak Ada Makanan Tersedia</h3>
                <p>Belum ada surplus makanan yang terdaftar untuk kategori ini. Merchant belum menambahkan listing baru hari ini.</p>
            </div>
        `;
        return;
    }
    
    filteredListings.forEach(item => {
        const discountPct = Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100);
        const isStockLow = item.quantity <= 2;
        const stockPct = item.maxQuantity > 0 ? (item.quantity / item.maxQuantity) * 100 : 0;
        
        // Display Expiry Badges and extra discount info
        let extraBadgeHtml = '';
        if (item.extraDiscountPct > 0) {
            extraBadgeHtml = `<span style="background: var(--accent-orange); color: white; padding: 0.15rem 0.4rem; border-radius: var(--radius-sm); font-size: 0.7rem; font-weight: 700; display: inline-block; margin-top: 0.2rem;">⏱️ EXTRA DISKON -${item.extraDiscountPct}%</span>`;
        }

        let expiryTextHtml = '';
        if (item.hoursRemaining < 1) {
            const mins = Math.round(item.hoursRemaining * 60);
            expiryTextHtml = `<span style="color: var(--accent-orange); font-weight: 700; font-size: 0.8rem;">⏱️ Expire dalam ${mins} menit!</span>`;
        } else if (item.hoursRemaining < 6) {
            expiryTextHtml = `<span style="color: var(--accent-orange); font-weight: 700; font-size: 0.8rem;">⏱️ Expire dalam ${Math.round(item.hoursRemaining)} jam!</span>`;
        } else if (item.hoursRemaining < 24) {
            expiryTextHtml = `<span style="color: var(--primary-dark); font-size: 0.8rem; font-weight: 600;">⏱️ Expire dalam ${Math.round(item.hoursRemaining)} jam</span>`;
        } else {
            const days = Math.round(item.hoursRemaining / 24);
            expiryTextHtml = `<span style="color: var(--text-muted); font-size: 0.8rem;">⏱️ Expire dalam ${days} hari</span>`;
        }

        const priceRowHtml = item.extraDiscountPct > 0
            ? `<div class="price-row">
                <div class="prices">
                    <span class="original-price">${formatRupiah(item.originalPrice)}</span>
                    <span style="text-decoration: line-through; font-size: 0.75rem; color: var(--text-muted); margin: 0 0.2rem;">${formatRupiah(item.baseDiscountPrice)}</span>
                    <span class="discounted-price">${formatRupiah(item.discountPrice)}</span>
                </div>
                <button class="reserve-btn" onclick="openReservationModal('${item.id}')" ${item.quantity === 0 ? 'disabled' : ''}>
                    ${item.quantity === 0 ? 'Habis' : 'Pesan Sekarang'}
                </button>
               </div>`
            : `<div class="price-row">
                <div class="prices">
                    <span class="original-price">${formatRupiah(item.originalPrice)}</span>
                    <span class="discounted-price">${formatRupiah(item.discountPrice)}</span>
                </div>
                <button class="reserve-btn" onclick="openReservationModal('${item.id}')" ${item.quantity === 0 ? 'disabled' : ''}>
                    ${item.quantity === 0 ? 'Habis' : 'Pesan Sekarang'}
                </button>
               </div>`;

        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <div class="card-image-wrapper">
                <span class="discount-tag">-${discountPct}%</span>
                <span class="category-tag">${item.category}</span>
                <img src="${item.image || 'assets/hero.png'}" alt="${item.title}" onerror="this.src='assets/hero.png'">
            </div>
            <div class="card-info">
                <span class="merchant-name"><i class="fas fa-store"></i> ${item.merchantName}</span>
                <h4 class="food-title">${item.title}</h4>
                <div class="pickup-time">
                    <span>⏱️ Ambil: <strong>${item.pickupTime}</strong></span>
                </div>
                <div style="margin: 0.3rem 0 0.5rem 0;">
                    ${expiryTextHtml} <br>
                    ${extraBadgeHtml}
                </div>
                
                <div class="stock-bar-wrapper ${isStockLow ? 'stock-low' : ''}">
                    <div class="stock-info">
                        <span>Tersisa: ${item.quantity} porsi</span>
                        <span>${Math.round(stockPct)}% tersisa</span>
                    </div>
                    <div class="stock-bar-bg">
                        <div class="stock-bar-fill" style="width: ${stockPct}%"></div>
                    </div>
                </div>
                
                ${priceRowHtml}
            </div>
        `;
        feedContainer.appendChild(card);
    });
}

// Reservation & Checkout Flow
let activeListingForOrder = null;
let orderQuantity = 1;

function openReservationModal(listingId) {
    const listing = appState.listings.find(item => item.id === listingId);
    if (!listing) return;
    
    activeListingForOrder = listing;
    orderQuantity = 1;
    
    document.getElementById('modal-food-title').innerText = listing.title;
    document.getElementById('modal-merchant-name').innerText = listing.merchantName;
    document.getElementById('modal-original-price').innerText = formatRupiah(listing.originalPrice);
    document.getElementById('modal-discount-price').innerText = formatRupiah(listing.discountPrice);
    document.getElementById('modal-pickup-time').innerText = listing.pickupTime;
    
    updateCheckoutCalculation();
    
    document.getElementById('checkout-modal').classList.add('active');
}

function closeReservationModal() {
    document.getElementById('checkout-modal').classList.remove('active');
    activeListingForOrder = null;
}

function changeOrderQty(change) {
    if (!activeListingForOrder) return;
    
    const newQty = orderQuantity + change;
    if (newQty >= 1 && newQty <= activeListingForOrder.quantity) {
        orderQuantity = newQty;
        updateCheckoutCalculation();
    }
}

function updateCheckoutCalculation() {
    if (!activeListingForOrder) return;
    
    document.getElementById('qty-display').innerText = orderQuantity;
    
    const subtotal = activeListingForOrder.discountPrice * orderQuantity;
    const originalSubtotal = activeListingForOrder.originalPrice * orderQuantity;
    const savings = originalSubtotal - subtotal;
    
    document.getElementById('checkout-qty').innerText = `${orderQuantity} Porsi`;
    document.getElementById('checkout-total').innerText = formatRupiah(subtotal);
    document.getElementById('checkout-savings').innerText = formatRupiah(savings);
}

async function confirmCheckout() {
    if (!activeListingForOrder) return;
    
    const listing = appState.listings.find(item => item.id === activeListingForOrder.id);
    if (!listing || listing.quantity < orderQuantity) {
        showToast('Maaf, stok makanan tidak cukup!', '⚠️');
        closeReservationModal();
        return;
    }
    
    const subtotal = listing.discountPrice * orderQuantity;
    const originalSubtotal = listing.originalPrice * orderQuantity;
    const savingsAmount = originalSubtotal - subtotal;

    
    const orderId = `FW-${Date.now().toString().slice(-6)}`;
    
    const now = new Date();
    const dateStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString('id-ID');

    const newOrder = {
        id: orderId,
        listingId: listing.id,
        customerId: currentCustomerId,
        quantity: orderQuantity,
        totalPrice: subtotal,
        pickupTime: listing.pickupTime,
        status: 'pending',
        date: dateStr,
        co2Saved: 0,
        cashSaved: savingsAmount
    };

    try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Terjadi kesalahan saat checkout');
        }

        await refreshState();
        closeReservationModal();
        
        showToast(`Pesanan ${orderId} berhasil dipesan!`, '🎉');
        
        setRole('customer');
        switchCustomerTab('orders');
    } catch (e) {
        console.error('Checkout error:', e);
        showToast(`Maaf, gagal checkout: ${e.message}`, '⚠️');
        closeReservationModal();
    }
}

// Switch between Customer Tabs
function switchCustomerTab(tab) {
    appState.customerTab = tab;
    
    const browseTabBtn = document.getElementById('tab-browse-btn');
    const ordersTabBtn = document.getElementById('tab-orders-btn');
    const browseView = document.getElementById('customer-browse-view');
    const ordersView = document.getElementById('customer-orders-view');
    
    if (tab === 'browse') {
        if (browseTabBtn) browseTabBtn.classList.add('active');
        if (ordersTabBtn) ordersTabBtn.classList.remove('active');
        if (browseView) browseView.style.display = 'block';
        if (ordersView) ordersView.style.display = 'none';
        renderListingsFeed();
    } else {
        if (browseTabBtn) browseTabBtn.classList.remove('active');
        if (ordersTabBtn) ordersTabBtn.classList.add('active');
        if (browseView) browseView.style.display = 'none';
        if (ordersView) ordersView.style.display = 'block';
        renderCustomerOrders();
    }
}

// Render Customer's Orders & Savings Dashboard
function renderCustomerOrders() {
    const container = document.getElementById('customer-orders-list');
    if (!container) return;
    container.innerHTML = '';
    
    const cash = appState.savings.customerCashSaved !== undefined ? appState.savings.customerCashSaved : 0;
    const points = appState.savings.customerCoins !== undefined ? appState.savings.customerCoins : 0;

    // Update Stats Display in Customer Dashboard Panel
    document.getElementById('cust-stat-cash').innerText = formatRupiah(cash);
    document.getElementById('cust-stat-points').innerText = `${points} Poin`;
    
    if (appState.orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>Belum Ada Pesanan</h3>
                <p>Kamu belum menyelamatkan makanan apa pun hari ini. Mulai jelajahi makanan lezat di sekitar mu!</p>
            </div>
        `;
        return;
    }
    
    appState.orders.forEach(order => {
        let badgeClass = 'pending';
        let statusText = 'Ready for Pickup';
        
        if (order.status === 'claimed') {
            badgeClass = 'claimed';
            statusText = 'Selesai Diambil';
        } else if (order.status === 'cancelled') {
            badgeClass = 'cancelled';
            statusText = 'Dibatalkan';
        }
        
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header">
                <span class="order-id">ID Pesanan: ${order.id}</span>
                <span class="order-status-badge ${badgeClass}">${statusText}</span>
            </div>
            <div class="order-detail-row">
                <span class="order-food-name">${order.foodTitle}</span>
                <span class="order-qty-price">${order.quantity}x porsi • <strong>${formatRupiah(order.totalPrice)}</strong></span>
            </div>
            <div class="order-detail-row" style="margin-top: -5px; font-size: 0.8rem; color: var(--text-muted);">
                <span>Toko: <strong>${order.merchantName}</strong></span>
                <span>${order.date}</span>
            </div>
            <div class="order-detail-row" style="font-size: 0.8rem; background: var(--bg-mint); padding: 0.4rem; border-radius: var(--radius-sm);">
                <span>📍 Lokasi Pengambilan: Silakan tunjukkan ID Pesanan ke kasir merchant.</span>
                <span>Ambil Sebelum: <strong>${order.pickupTime.split(' Hari Ini')[0]}</strong></span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Switch between Merchant Portal views (Manage vs Financial Reports)
let activeMerchantTab = 'manage';
function switchMerchantTab(tab) {
    activeMerchantTab = tab;
    const manageBtn = document.getElementById('tab-merch-manage-btn');
    const financeBtn = document.getElementById('tab-merch-finance-btn');
    const manageView = document.getElementById('merchant-manage-view');
    const financeView = document.getElementById('merchant-finance-view');
    
    if (tab === 'manage') {
        if (manageBtn) {
            manageBtn.classList.add('active');
            manageBtn.style.color = 'var(--primary)';
            manageBtn.style.borderBottom = '3px solid var(--primary)';
        }
        if (financeBtn) {
            financeBtn.classList.remove('active');
            financeBtn.style.color = 'var(--text-muted)';
            financeBtn.style.borderBottom = '3px solid transparent';
        }
        if (manageView) manageView.style.display = 'block';
        if (financeView) financeView.style.display = 'none';
        
        refreshState().then(() => renderMerchantPortal());
    } else {
        if (manageBtn) {
            manageBtn.classList.remove('active');
            manageBtn.style.color = 'var(--text-muted)';
            manageBtn.style.borderBottom = '3px solid transparent';
        }
        if (financeBtn) {
            financeBtn.classList.add('active');
            financeBtn.style.color = 'var(--primary)';
            financeBtn.style.borderBottom = '3px solid var(--primary)';
        }
        if (manageView) manageView.style.display = 'none';
        if (financeView) financeView.style.display = 'block';
        
        refreshMerchantAnalytics();
    }
}

// Render Merchant Dashboard
function renderMerchantPortal() {
    const sales = appState.savings.merchantSales !== undefined ? appState.savings.merchantSales : 0;
    const revenue = appState.savings.merchantRevenue !== undefined ? appState.savings.merchantRevenue : 0;

    // Update Stats Display in Merchant Dashboard
    document.getElementById('merch-stat-sales').innerText = sales;
    document.getElementById('merch-stat-revenue').innerText = formatRupiah(revenue);
    
    updateHeaderImpactBadge();
    renderMerchantListingsTable();
    renderMerchantOrdersList();
}

// Render Listings Table (Merchant)
function renderMerchantListingsTable() {
    const tableBody = document.getElementById('merchant-listings-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    if (appState.listings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    Belum ada surplus makanan yang kamu tawarkan. Buat listing pertama dengan form di samping!
                </td>
            </tr>
        `;
        return;
    }
    
    appState.listings.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="table-food-item">
                    <img class="table-food-thumb" src="${item.image}" alt="${item.title}" onerror="this.src='assets/hero.png'">
                    <div>
                        <strong style="color: var(--primary-dark);">${item.title}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${item.category}</div>
                    </div>
                </div>
            </td>
            <td>
                <div><span style="text-decoration: line-through; font-size: 0.75rem; color: var(--text-muted);">${formatRupiah(item.originalPrice)}</span></div>
                <strong style="color: var(--primary);">${formatRupiah(item.discountPrice)}</strong>
            </td>
            <td>${item.quantity} / ${item.maxQuantity}</td>
            <td>
                <label class="switch-control">
                    <input type="checkbox" ${item.active ? 'checked' : ''} onchange="toggleListingActive('${item.id}', this.checked)">
                    <span class="switch-slider"></span>
                </label>
            </td>
            <td>
                <button class="btn-delete" onclick="deleteListing('${item.id}')" title="Hapus Listing"><i class="fas fa-trash-alt">🗑️</i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Toggle Listing Active Status
async function toggleListingActive(listingId, isActive) {
    try {
        const res = await fetch(`${API_BASE_URL}/listings/${listingId}/toggle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: isActive })
        });

        if (!res.ok) throw new Error('Gagal mengubah status penawaran.');

        await refreshState();
        showToast(`Listing di-toggled menjadi ${isActive ? 'Aktif' : 'Nonaktif'}`, '⚙️');
        renderListingsFeed();
        renderMerchantPortal();
    } catch (e) {
        console.error('Toggle error:', e);
        showToast('Gagal mengubah status penawaran.', '⚠️');
    }
}

// Delete Listing
async function deleteListing(listingId) {
    if (confirm('Apakah Anda yakin ingin menghapus tawaran makanan ini?')) {
        try {
            const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Gagal menghapus listing.');

            await refreshState();
            showToast('Makanan berhasil dihapus dari daftar.', '🗑️');
            renderMerchantPortal();
            renderListingsFeed();
        } catch (e) {
            console.error('Delete error:', e);
            showToast('Gagal menghapus penawaran.', '⚠️');
        }
    }
}

// Add New Listing Form Handler (incorporating dynamic expiry inputs)
async function handleAddListingSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('food-name').value.trim();
    const originalPrice = parseInt(document.getElementById('original-price').value);
    const discountPrice = parseInt(document.getElementById('discount-price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const category = document.getElementById('category').value;
    const pickupTimeInput = document.getElementById('pickup-time').value.trim();
    const expiryTimeInput = document.getElementById('expiry-time').value;
    const description = document.getElementById('description').value.trim() || 'Surplus makanan lezat siap dikonsumsi.';
    
    // Auto-assign image based on category
    let image = 'assets/hero.png';
    if (category.toLowerCase() === 'bakery') {
        image = 'assets/bakery.png';
    } else if (category.toLowerCase() === 'meals') {
        image = 'assets/salad.png';
        if (title.toLowerCase().includes('sushi') || title.toLowerCase().includes('ikan') || title.toLowerCase().includes('jepang')) {
            image = 'assets/sushi.png';
        }
    } else if (category.toLowerCase() === 'desserts' || title.toLowerCase().includes('manis')) {
        image = 'assets/bakery.png';
    }
    
    if (!title || isNaN(originalPrice) || isNaN(discountPrice) || isNaN(quantity) || !pickupTimeInput || !expiryTimeInput) {
        showToast('Lengkapi semua data form!', '⚠️');
        return;
    }
    
    if (discountPrice >= originalPrice) {
        showToast('Harga diskon harus lebih murah dari harga normal!', '⚠️');
        return;
    }
    
    const newListing = {
        id: `food-${Date.now()}`,
        merchantId: currentMerchantId,
        title: title,
        description: description,
        originalPrice: originalPrice,
        discountPrice: discountPrice,
        quantity: quantity,
        maxQuantity: quantity,
        pickupTime: `${pickupTimeInput} Hari Ini`,
        expiryTime: new Date(expiryTimeInput).toISOString(),
        category: category,
        image: image,
        active: true
    };

    try {
        const res = await fetch(`${API_BASE_URL}/listings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newListing)
        });

        if (!res.ok) throw new Error('Gagal menambahkan listing.');

        await refreshState();
        showToast('Tawaran makanan surplus berhasil dipublikasikan!', '📢');
        document.getElementById('add-listing-form').reset();
        
        renderMerchantPortal();
        renderListingsFeed();
    } catch (e) {
        console.error('Create listing error:', e);
        showToast('Gagal mempublikasikan penawaran.', '⚠️');
    }
}

// Render Orders List (Merchant view)
function renderMerchantOrdersList() {
    const listContainer = document.getElementById('merchant-orders-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    const pendingOrders = appState.orders.filter(order => order.status === 'pending');
    
    if (pendingOrders.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">
                Belum ada pesanan masuk yang menunggu klaim pelanggan.
            </div>
        `;
        return;
    }
    
    pendingOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-card';
        orderDiv.innerHTML = `
            <div class="order-header">
                <span class="order-id">Klaim ID: ${order.id}</span>
                <span class="order-status-badge pending">Siap Diambil</span>
            </div>
            <div class="order-detail-row">
                <span class="order-food-name">${order.foodTitle}</span>
                <span class="order-qty-price">${order.quantity} Porsi • <strong>${formatRupiah(order.totalPrice)}</strong></span>
            </div>
            <div class="order-detail-row" style="margin-top: -5px; font-size: 0.8rem; color: var(--text-muted);">
                <span>Ambil: ${order.pickupTime}</span>
                <span>Waktu Order: ${order.date}</span>
            </div>
            <div class="order-actions">
                <button class="btn-small btn-success" onclick="merchantClaimOrder('${order.id}')">Klaim Diambil</button>
                <button class="btn-small btn-outline" onclick="merchantCancelOrder('${order.id}')">Batalkan</button>
            </div>
        `;
        listContainer.appendChild(orderDiv);
    });
}

// Action: Claim Order (Merchant marks pickup)
async function merchantClaimOrder(orderId) {
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}/claim`, {
            method: 'PUT'
        });

        if (!res.ok) throw new Error('Gagal mengklaim pesanan.');

        await refreshState();
        showToast(`Pesanan ${orderId} berhasil diserahkan!`, '✅');
        
        renderMerchantPortal();
        renderCustomerOrders();
    } catch (e) {
        console.error('Claim error:', e);
        showToast('Gagal memproses klaim pesanan.', '⚠️');
    }
}

// Action: Cancel Order (Merchant cancels pickup, restores stock)
async function merchantCancelOrder(orderId) {
    if (confirm(`Apakah Anda yakin ingin membatalkan pesanan ${orderId}? Stok akan dikembalikan.`)) {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
                method: 'PUT'
            });

            if (!res.ok) throw new Error('Gagal membatalkan pesanan.');

            await refreshState();
            showToast(`Pesanan ${orderId} dibatalkan.`, '❌');
            
            renderMerchantPortal();
            renderCustomerOrders();
            renderListingsFeed();
        } catch (e) {
            console.error('Cancel error:', e);
            showToast('Gagal membatalkan pesanan.', '⚠️');
        }
    }
}

// Fetch analytics from backend and render CSS graphs
async function refreshMerchantAnalytics() {
    try {
        const res = await fetch(`${API_BASE_URL}/analytics/merchant/${currentMerchantId}`);
        if (!res.ok) return;
        const analytics = await res.json();

        // A. Render Daily Revenue Chart using beautiful CSS bars
        const chartContainer = document.getElementById('revenue-chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '';
            const dailyData = analytics.dailyRevenue || [];
            
            if (dailyData.length === 0) {
                chartContainer.innerHTML = '<div style="color: var(--text-muted); padding: 2rem;">Belum ada riwayat pendapatan.</div>';
            } else {
                const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 1);
                dailyData.forEach(d => {
                    const pct = (d.revenue / maxRevenue) * 100;
                    const bar = document.createElement('div');
                    bar.style.display = 'flex';
                    bar.style.flexDirection = 'column';
                    bar.style.alignItems = 'center';
                    bar.style.flex = '1';
                    // Strip decimals and formatting for chart labels
                    const displayRev = formatRupiah(d.revenue).replace(',00', '').replace('Rp', 'Rp');
                    bar.innerHTML = `
                        <span style="font-size: 0.7rem; font-weight: 700; color: var(--primary); margin-bottom: 0.3rem;">${displayRev}</span>
                        <div style="width: 25px; height: ${Math.max(10, pct * 1.1)}px; background: linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%); border-radius: var(--radius-sm) var(--radius-sm) 0 0; transition: height 0.5s ease;"></div>
                        <span style="font-size: 0.65rem; color: var(--text-muted); margin-top: 0.4rem; white-space: nowrap;">${d.date_label.split(' ')[0]}</span>
                    `;
                    chartContainer.appendChild(bar);
                });
            }
        }

        // B. Render Category breakdown chart (progress bars)
        const catContainer = document.getElementById('category-chart-container');
        if (catContainer) {
            catContainer.innerHTML = '';
            const catData = analytics.categoryBreakdown || [];
            
            if (catData.length === 0) {
                catContainer.innerHTML = '<div style="color: var(--text-muted);">Belum ada porsi terjual.</div>';
            } else {
                const totalQty = catData.reduce((acc, c) => acc + c.quantity, 0);
                catData.forEach(c => {
                    const pct = (c.quantity / totalQty) * 100;
                    const itemDiv = document.createElement('div');
                    itemDiv.style.marginBottom = '0.5rem';
                    itemDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.3rem;">
                            <span>${c.category}</span>
                            <span>${c.quantity} porsi (${Math.round(pct)}%)</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${pct}%; height: 100%; background: var(--primary); border-radius: 4px;"></div>
                        </div>
                    `;
                    catContainer.appendChild(itemDiv);
                });
            }
        }

        // C. Render Claim success rate gauge
        const statusData = analytics.statusBreakdown || [];
        const successRateEl = document.getElementById('claim-success-rate');
        if (successRateEl) {
            const claimed = (statusData.find(s => s.status === 'claimed') || { count: 0 }).count;
            const cancelled = (statusData.find(s => s.status === 'cancelled') || { count: 0 }).count;
            const pending = (statusData.find(s => s.status === 'pending') || { count: 0 }).count;
            const total = claimed + cancelled + pending;
            
            const rate = total > 0 ? Math.round((claimed / total) * 100) : 100;
            successRateEl.innerText = `${rate}%`;
            if (rate >= 80) successRateEl.style.color = 'var(--primary)';
            else if (rate >= 50) successRateEl.style.color = 'var(--accent-orange)';
            else successRateEl.style.color = 'red';
        }

        // D. Render financial transactions table
        const tableBody = document.getElementById('merchant-financial-history-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            const claimedOrders = appState.orders.filter(o => o.status === 'claimed');
            if (claimedOrders.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1rem;">
                            Belum ada riwayat transaksi finansial yang selesai.
                        </td>
                    </tr>
                `;
            } else {
                claimedOrders.forEach(o => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><strong>${o.id}</strong></td>
                        <td>${o.date}</td>
                        <td style="color: var(--primary); font-weight: 700;">+ ${formatRupiah(o.totalPrice)}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        }
    } catch (e) {
        console.error('Error refreshing merchant analytics:', e);
    }
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize State (Wait for backend fetch)
    await initAppState();
    
    // 2. Set default active profile state on dropdown
    const profileSelector = document.getElementById('profile-selector');
    if (profileSelector) {
        profileSelector.value = appState.currentRole === 'customer' ? currentCustomerId : currentMerchantId;
    }

    // 3. Set default customer role
    setRole('customer');
    
    // 4. Register Search input event
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
    
    // 5. Register Form Submission
    const addListingForm = document.getElementById('add-listing-form');
    if (addListingForm) {
        addListingForm.addEventListener('submit', handleAddListingSubmit);
    }
    
    // 6. Generate dynamic particles for aesthetics
    const mainHeader = document.getElementById('app-header');
    if (mainHeader) {
        createLeafParticles(mainHeader);
    }
});

// Little aesthetic detail: floating leaf particles in header
function createLeafParticles(container) {
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('span');
        particle.className = 'leaf-particle';
        particle.innerText = '🍃';
        particle.style.left = `${Math.random() * 80 + 10}%`;
        particle.style.top = `${Math.random() * 40 + 30}%`;
        particle.style.fontSize = `${Math.random() * 0.4 + 0.6}rem`;
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        particle.style.opacity = Math.random() * 0.15 + 0.05;
        container.appendChild(particle);
    }
}
