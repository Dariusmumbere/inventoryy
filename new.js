// Initialize jsPDF
const { jsPDF } = window.jspdf;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const menuItems = document.querySelectorAll('.menu-item');
const tabContents = document.querySelectorAll('.tab-content');
const tabs = document.querySelectorAll('.tab');
const productModal = document.getElementById('productModal');
const categoryModal = document.getElementById('categoryModal');
const supplierModal = document.getElementById('supplierModal');
const saleModal = document.getElementById('saleModal');
const purchaseModal = document.getElementById('purchaseModal');
const inventoryModal = document.getElementById('inventoryModal');
const alertModal = document.getElementById('alertModal');
const overlay = document.getElementById('overlay');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const notificationBell = document.getElementById('notificationBell');
const notificationBadge = document.getElementById('notificationBadge');
const alertBody = document.getElementById('alertBody');
const markAllAsReadBtn = document.getElementById('markAllAsRead');
const syncButton = document.getElementById('syncButton');
const syncStatus = document.getElementById('syncStatus');

// Data Storage
let products = JSON.parse(localStorage.getItem('products')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let adjustments = JSON.parse(localStorage.getItem('adjustments')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let alerts = JSON.parse(localStorage.getItem('alerts')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
    businessName: 'StockMaster UG',
    currency: 'UGX',
    taxRate: 18,
    lowStockThreshold: 5,
    invoicePrefix: 'INV',
    purchasePrefix: 'PUR'
};

// Sync Status
let lastSyncTime = localStorage.getItem('lastSyncTime') || null;
let isOnline = navigator.onLine;
let isSyncing = false;

// Initialize with empty data
if (!localStorage.getItem('settings')) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Initialize alerts if empty
if (alerts.length === 0) {
    alerts = [
        {
            id: 1,
            title: 'Welcome to StockMaster UG',
            message: 'Thank you for using our inventory management system. Get started by adding your products.',
            type: 'info',
            date: new Date().toISOString(),
            read: false
        }
    ];
    localStorage.setItem('alerts', JSON.stringify(alerts));
}

// Utility Functions
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateNotificationBadge() {
    const unreadCount = alerts.filter(alert => !alert.read).length;
    notificationBadge.textContent = unreadCount;
    notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

function loadAlerts() {
    alertBody.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.read ? '' : 'unread'}">
            <div class="alert-item-title">${alert.title}</div>
            <div class="alert-item-message">${alert.message}</div>
            <div class="alert-item-time">${new Date(alert.date).toLocaleString()}</div>
        </div>
    `).join('');

    // Add click handlers to mark alerts as read
    document.querySelectorAll('.alert-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            if (!alerts[index].read) {
                alerts[index].read = true;
                localStorage.setItem('alerts', JSON.stringify(alerts));
                updateNotificationBadge();
                item.classList.remove('unread');
            }
        });
    });
}

function addAlert(title, message, type = 'info') {
    const newAlert = {
        id: alerts.length > 0 ? Math.max(...alerts.map(a => a.id)) + 1 : 1,
        title,
        message,
        type,
        date: new Date().toISOString(),
        read: false
    };
    
    alerts.unshift(newAlert);
    localStorage.setItem('alerts', JSON.stringify(alerts));
    updateNotificationBadge();
    loadAlerts();
}

function updateSyncStatus() {
    if (!isOnline) {
        syncStatus.innerHTML = '<span class="indicator offline"></span><span class="text">Offline</span>';
        return;
    }
    
    if (isSyncing) {
        syncStatus.innerHTML = '<span class="indicator syncing"></span><span class="text">Syncing...</span>';
    } else {
        syncStatus.innerHTML = '<span class="indicator online"></span><span class="text">Online</span>';
    }
}

// Data Management Functions
function loadTabData(tabId) {
    switch(tabId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'current':
            case 'adjustments':
            case 'transfers':
            loadCurrentInventory();
            break;
        case 'sales':
            loadSales();
            break;
        case 'purchases':
            loadPurchases();
            break;
        case 'reports':
            loadReports();
            break;
        case 'inventory-report':
            loadInventoryReport();
            break;
        case 'sales-report':
            loadSalesReport();
            break;
        case 'purchase-report':
            loadPurchaseReport();
            break;
        case 'profit-loss':
            loadProfitLossReport();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

function loadDashboardData() {
    // Calculate stats
    const totalProducts = products.length;
    const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
    
    // Update DOM
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('outOfStockItems').textContent = outOfStockItems;
    document.getElementById('inventoryValue').textContent = `UGX ${inventoryValue.toLocaleString()}`;
    
    // Set change percentages to 0 (since we removed sample data)
    document.getElementById('productChange').textContent = '0%';
    document.getElementById('lowStockChange').textContent = '0%';
    document.getElementById('outOfStockChange').textContent = '0%';
    document.getElementById('inventoryValueChange').textContent = '0%';
    
    // Load activities
    const activitiesTable = document.getElementById('activitiesTable');
    activitiesTable.innerHTML = activities.slice(0, 5).map(activity => `
        <tr>
            <td>${new Date(activity.date).toLocaleDateString()}</td>
            <td>${activity.activity}</td>
            <td>${activity.user}</td>
            <td>${activity.details}</td>
        </tr>
    `).join('');
    
    // Load low stock items
    const lowStockTable = document.getElementById('lowStockTable');
    const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel).slice(0, 5);
    lowStockTable.innerHTML = lowStockProducts.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        return `
            <tr>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.stock} ${product.unit}</td>
                <td>
                    <button class="action-btn edit" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Load recent sales
    const recentSalesTable = document.getElementById('recentSalesTable');
    recentSalesTable.innerHTML = sales.slice(0, 5).map(sale => {
        const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        return `
            <tr>
                <td>${new Date(sale.date).toLocaleDateString()}</td>
                <td>${sale.invoiceNumber}</td>
                <td>UGX ${totalAmount.toLocaleString()}</td>
                <td><span class="badge badge-success">Completed</span></td>
            </tr>
        `;
    }).join('');
    
    if (sales.length === 0) {
        recentSalesTable.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <p>No recent sales found</p>
                </td>
            </tr>
        `;
    }
}

function loadProducts() {
    const productsTable = document.getElementById('productsTable');
    productsTable.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const status = product.stock === 0 ? 'Out of Stock' : 
                       product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
        const statusClass = product.stock === 0 ? 'badge-danger' : 
                          product.stock <= product.reorderLevel ? 'badge-warning' : 'badge-success';
        
        return `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.sellingPrice.toLocaleString()}</td>
                <td>${product.stock} ${product.unit}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="action-btn edit" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (products.length === 0) {
        productsTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-boxes"></i>
                    <p>No products found. Add your first product to get started.</p>
                    <button class="btn btn-primary" id="addProductBtnEmpty">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </td>
            </tr>
        `;
        
        document.getElementById('addProductBtnEmpty').addEventListener('click', () => {
            document.getElementById('addProductBtn').click();
        });
    }
}

function loadCategories() {
    const categoriesTable = document.getElementById('categoriesTable');
    categoriesTable.innerHTML = categories.map(category => {
        const productCount = products.filter(p => p.categoryId === category.id).length;
        
        return `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description || 'N/A'}</td>
                <td>${productCount}</td>
                <td>
                    <button class="action-btn edit" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (categories.length === 0) {
        categoriesTable.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-tags"></i>
                    <p>No categories found. Add your first category to get started.</p>
                    <button class="btn btn-primary" id="addCategoryBtnEmpty">
                        <i class="fas fa-plus"></i> Add Category
                    </button>
                </td>
            </tr>
        `;
        
        document.getElementById('addCategoryBtnEmpty').addEventListener('click', () => {
            document.getElementById('addCategoryBtn').click();
        });
    }
}

function loadSuppliers() {
    const suppliersTable = document.getElementById('suppliersTable');
    suppliersTable.innerHTML = suppliers.map(supplier => {
        const productsSupplied = supplier.products.map(id => {
            const product = products.find(p => p.id === id);
            return product ? product.name : 'Unknown';
        }).join(', ');
        
        return `
            <tr>
                <td>${supplier.id}</td>
                <td>${supplier.name}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.email || 'N/A'}</td>
                <td>${productsSupplied || 'N/A'}</td>
                <td>
                    <button class="action-btn edit" data-id="${supplier.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${supplier.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (suppliers.length === 0) {
        suppliersTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-truck"></i>
                    <p>No suppliers found. Add your first supplier to get started.</p>
                    <button class="btn btn-primary" id="addSupplierBtnEmpty">
                        <i class="fas fa-plus"></i> Add Supplier
                    </button>
                </td>
            </tr>
        `;
        
        document.getElementById('addSupplierBtnEmpty').addEventListener('click', () => {
            document.getElementById('addSupplierBtn').click();
        });
    }
}

function loadSales() {
    const salesTable = document.getElementById('salesTable');
    salesTable.innerHTML = sales.map(sale => {
        const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        return `
            <tr>
                <td>${sale.id}</td>
                <td>${new Date(sale.date).toLocaleDateString()}</td>
                <td>${sale.invoiceNumber}</td>
                <td>${sale.customer || 'Walk-in Customer'}</td>
                <td>${itemsCount}</td>
                <td>UGX ${totalAmount.toLocaleString()}</td>
                <td><span class="badge badge-success">Completed</span></td>
                <td>
                    <button class="action-btn edit" data-id="${sale.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${sale.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (sales.length === 0) {
        salesTable.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <p>No sales records found. Add your first sale to get started.</p>
                    <button class="btn btn-primary" id="addSaleBtnEmpty">
                        <i class="fas fa-plus"></i> New Sale
                    </button>
                </td>
            </tr>
        `;
        
        document.getElementById('addSaleBtnEmpty').addEventListener('click', () => {
            document.getElementById('addSaleBtn').click();
        });
    }
}

function loadPurchases() {
    const purchasesTable = document.getElementById('purchasesTable');
    purchasesTable.innerHTML = purchases.map(purchase => {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        const itemsCount = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        return `
            <tr>
                <td>${purchase.id}</td>
                <td>${new Date(purchase.date).toLocaleDateString()}</td>
                <td>${purchase.referenceNumber}</td>
                <td>${supplier ? supplier.name : 'N/A'}</td>
                <td>${itemsCount}</td>
                <td>UGX ${totalAmount.toLocaleString()}</td>
                <td><span class="badge badge-success">Completed</span></td>
                <td>
                    <button class="action-btn edit" data-id="${purchase.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${purchase.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (purchases.length === 0) {
        purchasesTable.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-shopping-basket"></i>
                    <p>No purchase records found. Add your first purchase to get started.</p>
                    <button class="btn btn-primary" id="addPurchaseBtnEmpty">
                        <i class="fas fa-plus"></i> New Purchase
                    </button>
                </td>
            </tr>
        `;
        
        document.getElementById('addPurchaseBtnEmpty').addEventListener('click', () => {
            document.getElementById('addPurchaseBtn').click();
        });
    }
}

function loadInventory() {
    loadCurrentInventory();
}

function loadCurrentInventory() {
    const inventoryTable = document.getElementById('inventoryTable');
    inventoryTable.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const status = product.stock === 0 ? 'Out of Stock' : 
                       product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
        const statusClass = product.stock === 0 ? 'badge-danger' : 
                          product.stock <= product.reorderLevel ? 'badge-warning' : 'badge-success';
        
        return `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.stock} ${product.unit}</td>
                <td>${product.reorderLevel} ${product.unit}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm adjust-stock" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Adjust
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (products.length === 0) {
        inventoryTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-warehouse"></i>
                    <p>No inventory items found. Add products to see them here.</p>
                </td>
            </tr>
        `;
    }
}

function loadAdjustments() {
    const adjustmentsTable = document.getElementById('adjustmentsTable');
    adjustmentsTable.innerHTML = adjustments.map(adj => {
        const product = products.find(p => p.id === adj.productId);
        return `
            <tr>
                <td>${adj.id}</td>
                <td>${new Date(adj.date).toLocaleDateString()}</td>
                <td>${product ? product.name : 'N/A'}</td>
                <td>${adj.type === 'add' ? '+' : '-'}${adj.quantity}</td>
                <td>${adj.reason}</td>
                <td>${adj.user || 'System'}</td>
            </tr>
        `;
    }).join('');
    
    if (adjustments.length === 0) {
        adjustmentsTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <p>No stock adjustments found. Make adjustments to see them here.</p>
                </td>
            </tr>
        `;
    }
}

function loadReports() {
    loadInventoryReport();
}

function loadInventoryReport() {
    const inventoryReportTable = document.getElementById('inventoryReportTable');
    inventoryReportTable.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const totalValue = product.stock * product.purchasePrice;
        const status = product.stock === 0 ? 'Out of Stock' : 
                       product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
        const statusClass = product.stock === 0 ? 'badge-danger' : 
                          product.stock <= product.reorderLevel ? 'badge-warning' : 'badge-success';
        
        return `
            <tr>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.stock} ${product.unit}</td>
                <td>${product.purchasePrice.toLocaleString()}</td>
                <td>${totalValue.toLocaleString()}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
            </tr>
        `;
    }).join('');
    
    if (products.length === 0) {
        inventoryReportTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-boxes"></i>
                    <p>No inventory data available. Add products to generate reports.</p>
                </td>
            </tr>
        `;
    }
}

function loadSalesReport() {
    // Initialize chart
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    // Group sales by month
    const salesByMonth = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    sales.forEach(sale => {
        const date = new Date(sale.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = 0;
        }
        
        const total = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        salesByMonth[monthYear] += total;
    });
    
    // Fill in missing months with 0
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const salesData = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 11 + i, 1);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        salesData.push(salesByMonth[monthYear] || 0);
    }
    
    const monthLabels = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 11 + i, 1);
        monthLabels.push(months[date.getMonth()] + ' ' + date.getFullYear().toString().slice(-2));
    }
    
    window.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Sales (UGX)',
                data: salesData,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return 'UGX ' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'UGX ' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Load sales report table
    const salesReportTable = document.getElementById('salesReportTable');
    salesReportTable.innerHTML = sales.slice(0, 10).map(sale => {
        const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        return `
            <tr>
                <td>${new Date(sale.date).toLocaleDateString()}</td>
                <td>${sale.invoiceNumber}</td>
                <td>${sale.customer || 'Walk-in Customer'}</td>
                <td>${itemsCount}</td>
                <td>${totalAmount.toLocaleString()}</td>
                <td><span class="badge badge-success">Completed</span></td>
            </tr>
        `;
    }).join('');
    
    if (sales.length === 0) {
        salesReportTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>No sales data available. Make sales to generate reports.</p>
                </td>
            </tr>
        `;
    }
}

function loadPurchaseReport() {
    // Initialize chart
    const ctx = document.getElementById('purchasesChart').getContext('2d');
    if (window.purchasesChart) {
        window.purchasesChart.destroy();
    }
    
    // Group purchases by month
    const purchasesByMonth = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    purchases.forEach(purchase => {
        const date = new Date(purchase.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!purchasesByMonth[monthYear]) {
            purchasesByMonth[monthYear] = 0;
        }
        
        const total = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        purchasesByMonth[monthYear] += total;
    });
    
    // Fill in missing months with 0
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const purchasesData = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 11 + i, 1);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        purchasesData.push(purchasesByMonth[monthYear] || 0);
    }
    
    const monthLabels = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 11 + i, 1);
        monthLabels.push(months[date.getMonth()] + ' ' + date.getFullYear().toString().slice(-2));
    }
    
    window.purchasesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Purchases (UGX)',
                data: purchasesData,
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                borderColor: 'rgba(245, 158, 11, 1)',
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
                        callback: function(value) {
                            return 'UGX ' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'UGX ' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Load purchase report table
    const purchaseReportTable = document.getElementById('purchaseReportTable');
    purchaseReportTable.innerHTML = purchases.slice(0, 10).map(purchase => {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        const itemsCount = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        return `
            <tr>
                <td>${new Date(purchase.date).toLocaleDateString()}</td>
                <td>${purchase.referenceNumber}</td>
                <td>${supplier ? supplier.name : 'N/A'}</td>
                <td>${itemsCount}</td>
                <td>${totalAmount.toLocaleString()}</td>
                <td><span class="badge badge-success">Completed</span></td>
            </tr>
        `;
    }).join('');
    
    if (purchases.length === 0) {
        purchaseReportTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-chart-bar"></i>
                    <p>No purchase data available. Make purchases to generate reports.</p>
                </td>
            </tr>
        `;
    }
}

function loadProfitLossReport() {
    // Initialize chart
    const ctx = document.getElementById('profitLossChart').getContext('2d');
    if (window.profitLossChart) {
        window.profitLossChart.destroy();
    }
    
    // Group sales by month
    const salesByMonth = {};
    purchases.forEach(purchase => {
        const date = new Date(purchase.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = 0;
        }
        
        const total = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        salesByMonth[monthYear] += total;
    });
    
    // Group purchases by month
    const purchasesByMonth = {};
    purchases.forEach(purchase => {
        const date = new Date(purchase.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!purchasesByMonth[monthYear]) {
            purchasesByMonth[monthYear] = 0;
        }
        
        const total = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        purchasesByMonth[monthYear] += total;
    });
    
    // Prepare data
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const profitData = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 11 + i, 1);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        const revenue = salesByMonth[monthYear] || 0;
        const cogs = purchasesByMonth[monthYear] || 0;
        const grossProfit = revenue - cogs;
        profitData.push(grossProfit);
    }
    
    const monthLabels = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 11 + i, 1);
        monthLabels.push(months[date.getMonth()] + ' ' + date.getFullYear().toString().slice(-2));
    }
    
    window.profitLossChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Gross Profit (UGX)',
                data: profitData,
                backgroundColor: profitData.map(value => 
                    value >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                ),
                borderColor: profitData.map(value => 
                    value >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return 'UGX ' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'UGX ' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Load profit & loss table
    const profitLossTable = document.getElementById('profitLossTable');
    profitLossTable.innerHTML = [];
    
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 11 + i, 1);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = months[date.getMonth()] + ' ' + date.getFullYear().toString().slice(-2);
        
        const revenue = salesByMonth[monthYear] || 0;
        const cogs = purchasesByMonth[monthYear] || 0;
        const grossProfit = revenue - cogs;
        const expenses = Math.floor(revenue * 0.2); // Assuming 20% expenses
        const netProfit = grossProfit - expenses;
        
        profitLossTable.innerHTML += `
            <tr>
                <td>${monthName}</td>
                <td>${revenue.toLocaleString()}</td>
                <td>${cogs.toLocaleString()}</td>
                <td>${grossProfit.toLocaleString()}</td>
                <td>${expenses.toLocaleString()}</td>
                <td>${netProfit.toLocaleString()}</td>
            </tr>
        `;
    }
    
    if (sales.length === 0 && purchases.length === 0) {
        profitLossTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <p>No financial data available. Record sales and purchases to generate reports.</p>
                </td>
            </tr>
        `;
    }
}

function loadSettings() {
    document.getElementById('businessName').value = settings.businessName;
    document.getElementById('currency').value = settings.currency;
    document.getElementById('taxRate').value = settings.taxRate;
    document.getElementById('lowStockThreshold').value = settings.lowStockThreshold;
    document.getElementById('invoicePrefix').value = settings.invoicePrefix;
    document.getElementById('purchasePrefix').value = settings.purchasePrefix;
}

// Sync Functionality
async function syncData() {
    if (!isOnline) {
        showToast('Cannot sync - offline', 'warning');
        return;
    }
    
    if (isSyncing) {
        showToast('Sync already in progress', 'info');
        return;
    }
    
    try {
        isSyncing = true;
        updateSyncStatus();
        showToast('Syncing data with server...');
        
        // Get current user ID from auth
        const userId = auth.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        
        // Prepare data to send with all required fields
        const syncData = {
            last_sync_time: lastSyncTime,
            products: JSON.parse(localStorage.getItem('products')) || [],
            categories: JSON.parse(localStorage.getItem('categories')) || [],
            suppliers: JSON.parse(localStorage.getItem('suppliers')) || [],
            sales: JSON.parse(localStorage.getItem('sales')) || [],
            purchases: JSON.parse(localStorage.getItem('purchases')) || [],
            adjustments: JSON.parse(localStorage.getItem('adjustments')) || [],
            activities: JSON.parse(localStorage.getItem('activities')) || [],
            settings: JSON.parse(localStorage.getItem('settings')) || {
                business_name: 'StockMaster UG',
                currency: 'UGX',
                tax_rate: 18,
                low_stock_threshold: 5,
                invoice_prefix: 'INV',
                purchase_prefix: 'PUR'
            }
        };
        
        // Add user_id to all data before sending
        const cleanedData = {
            ...syncData,
            products: syncData.products.map(p => ({ ...p, user_id: userId })),
            categories: syncData.categories.map(c => ({ ...c, user_id: userId })),
            suppliers: syncData.suppliers.map(s => ({ ...s, user_id: userId })),
            sales: syncData.sales.map(s => ({ ...s, user_id: userId })),
            purchases: syncData.purchases.map(p => ({ ...p, user_id: userId })),
            adjustments: syncData.adjustments.map(a => ({ ...a, user_id: userId })),
            activities: syncData.activities.map(a => ({ ...a, user_id: userId })),
            settings: syncData.settings ? { ...syncData.settings, user_id: userId } : null
        };
        
        // Call sync API
        const response = await fetch(`${auth.apiBaseUrl}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...auth.getAuthHeaders()
            },
            body: JSON.stringify(cleanedData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Sync error response:', errorData);
            throw new Error(errorData.detail || 'Sync failed');
        }
        
        const result = await response.json();
        console.log('Sync successful:', result);
        
        // Update local data with server changes
        if (result.products) {
            localStorage.setItem('products', JSON.stringify(result.products));
            products = result.products;
        }
        
        if (result.categories) {
            localStorage.setItem('categories', JSON.stringify(result.categories));
            categories = result.categories;
        }
        
        if (result.suppliers) {
            localStorage.setItem('suppliers', JSON.stringify(result.suppliers));
            suppliers = result.suppliers;
        }
        
        if (result.sales) {
            localStorage.setItem('sales', JSON.stringify(result.sales));
            sales = result.sales;
        }
        
        if (result.purchases) {
            localStorage.setItem('purchases', JSON.stringify(result.purchases));
            purchases = result.purchases;
        }
        
        if (result.adjustments) {
            localStorage.setItem('adjustments', JSON.stringify(result.adjustments));
            adjustments = result.adjustments;
        }
        
        if (result.activities) {
            localStorage.setItem('activities', JSON.stringify(result.activities));
            activities = result.activities;
        }
        
        if (result.settings) {
            localStorage.setItem('settings', JSON.stringify(result.settings));
            settings = result.settings;
        }
        
        // Update last sync time
        lastSyncTime = result.last_sync_time || new Date().toISOString();
        localStorage.setItem('lastSyncTime', lastSyncTime);
        
        showToast('Data synchronized successfully');
        
        // Refresh UI
        const activeTab = document.querySelector('.tab-content.active').id;
        loadTabData(activeTab);
        
    } catch (error) {
        console.error('Sync error:', error);
        showToast('Sync failed: ' + error.message, 'error');
    } finally {
        isSyncing = false;
        updateSyncStatus();
    }
}

// PDF Export Functionality
function exportToPDF(title, headers, data, fileName) {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Add business name
    doc.text(`${settings.businessName}`, 14, 28);
    
    // Add table
    doc.autoTable({
        startY: 35,
        head: [headers],
        body: data,
        margin: { top: 10 },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontSize: 9
        }
    });
    
    // Save the PDF
    doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the dashboard
    loadDashboardData();
    loadSettings();
    updateNotificationBadge();
    loadAlerts();
    updateSyncStatus();
    
    // Update user info in the topbar
    if (auth.isAuthenticated()) {
        document.getElementById('userFullName').textContent = auth.user.full_name;
        document.getElementById('userRole').textContent = auth.user.role;
    }
    
    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Menu item click handler
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
            
            // Load data for the selected tab
            loadTabData(target);
        });
    });

    // Tab click handler
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding tab content
            const parent = tab.closest('.tab-content');
            const siblingContents = parent.querySelectorAll('.tab-content');
            siblingContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Load data for the selected sub-tab
            loadTabData(tabId);
        });
    });

    // Modal close handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.classList.remove('active');
            categoryModal.classList.remove('active');
            supplierModal.classList.remove('active');
            saleModal.classList.remove('active');
            purchaseModal.classList.remove('active');
            inventoryModal.classList.remove('active');
            overlay.classList.remove('active');
        });
    });

    // Alert modal handlers
    notificationBell.addEventListener('click', () => {
        alertModal.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    document.querySelector('.alert-close').addEventListener('click', () => {
        alertModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    markAllAsReadBtn.addEventListener('click', () => {
        alerts = alerts.map(alert => ({ ...alert, read: true }));
        localStorage.setItem('alerts', JSON.stringify(alerts));
        updateNotificationBadge();
        loadAlerts();
    });

    overlay.addEventListener('click', () => {
        alertModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Sync button
    syncButton.addEventListener('click', syncData);

    // Network status events
    window.addEventListener('online', () => {
        isOnline = true;
        updateSyncStatus();
        syncData();
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        updateSyncStatus();
        showToast('Connection lost. Working in offline mode.', 'warning');
    });

    // Periodically sync data (every 5 minutes)
    setInterval(() => {
        if (isOnline && auth.isAuthenticated()) {
            syncData();
        }
    }, 5 * 60 * 1000);

    // Add Product
    document.getElementById('addProductBtn').addEventListener('click', () => {
        // Populate category dropdown
        const categorySelect = document.getElementById('productCategory');
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
        
        // Reset form
        document.getElementById('productForm').reset();
        productModal.classList.add('active');
        overlay.classList.add('active');
    });

    // Save Product
    document.getElementById('saveProduct').addEventListener('click', () => {
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            name: document.getElementById('productName').value,
            categoryId: parseInt(document.getElementById('productCategory').value),
            description: document.getElementById('productDescription').value,
            purchasePrice: parseFloat(document.getElementById('productPurchasePrice').value),
            sellingPrice: parseFloat(document.getElementById('productSellingPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            reorderLevel: parseInt(document.getElementById('productReorderLevel').value),
            unit: document.getElementById('productUnit').value,
            barcode: document.getElementById('productBarcode').value,
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Add activity
        activities.unshift({
            id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
            date: new Date().toISOString(),
            activity: 'Product added',
            user: 'John Doe',
            details: `Added new product: ${newProduct.name}`
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Add alert for low stock if applicable
        if (newProduct.stock <= newProduct.reorderLevel) {
            addAlert(
                'Low Stock Alert',
                `Product ${newProduct.name} is low on stock (${newProduct.stock} ${newProduct.unit}). Consider restocking.`,
                'warning'
            );
        }
        
        productModal.classList.remove('active');
        overlay.classList.remove('active');
        showToast('Product added successfully');
        loadProducts();
        loadDashboardData();
    });

    // Add Category
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        document.getElementById('categoryForm').reset();
        categoryModal.classList.add('active');
        overlay.classList.add('active');
    });

    // Save Category
    document.getElementById('saveCategory').addEventListener('click', () => {
        const form = document.getElementById('categoryForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const newCategory = {
            id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value
        };
        
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        
        // Add activity
        activities.unshift({
            id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
            date: new Date().toISOString(),
            activity: 'Category added',
            user: 'John Doe',
            details: `Added new category: ${newCategory.name}`
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        
        categoryModal.classList.remove('active');
        overlay.classList.remove('active');
        showToast('Category added successfully');
        loadCategories();
    });

    // Add Supplier
    document.getElementById('addSupplierBtn').addEventListener('click', () => {
        // Populate products dropdown
        const productsSelect = document.getElementById('supplierProducts');
        productsSelect.innerHTML = '';
        products.forEach(product => {
            productsSelect.innerHTML += `<option value="${product.id}">${product.name}</option>`;
        });
        
        // Reset form
        document.getElementById('supplierForm').reset();
        supplierModal.classList.add('active');
        overlay.classList.add('active');
    });

    // Save Supplier
    document.getElementById('saveSupplier').addEventListener('click', () => {
        const form = document.getElementById('supplierForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const selectedProducts = Array.from(document.getElementById('supplierProducts').selectedOptions)
            .map(option => parseInt(option.value));
        
        const newSupplier = {
            id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
            name: document.getElementById('supplierName').value,
            contactPerson: document.getElementById('supplierContactPerson').value,
            phone: document.getElementById('supplierPhone').value,
            email: document.getElementById('supplierEmail').value,
            address: document.getElementById('supplierAddress').value,
            products: selectedProducts,
            paymentTerms: document.getElementById('supplierPaymentTerms').value
        };
        
        suppliers.push(newSupplier);
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
        
        // Add activity
        activities.unshift({
            id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
            date: new Date().toISOString(),
            activity: 'Supplier added',
            user: 'John Doe',
            details: `Added new supplier: ${newSupplier.name}`
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        
        supplierModal.classList.remove('active');
        overlay.classList.remove('active');
        showToast('Supplier added successfully');
        loadSuppliers();
    });

    // Add Sale
    document.getElementById('addSaleBtn').addEventListener('click', () => {
        // Reset form
        document.getElementById('saleForm').reset();
        document.getElementById('saleItemsTable').innerHTML = '';
        document.getElementById('saleDate').valueAsDate = new Date();
        document.getElementById('saleTotal').value = '0';
        
        saleModal.classList.add('active');
        overlay.classList.add('active');
    });

    // Add Sale Item
    document.getElementById('addSaleItem').addEventListener('click', () => {
        const saleItemsTable = document.getElementById('saleItemsTable');
        const rowId = Date.now();
        
        // Create product dropdown
        let productOptions = '<option value="">Select Product</option>';
        products.forEach(product => {
            if (product.stock > 0) { // Only show products with available stock
                productOptions += `<option value="${product.id}" data-price="${product.sellingPrice}">${product.name} (${product.stock} available, ${product.sellingPrice.toLocaleString()} UGX)</option>`;
            }
        });
        
        if (productOptions === '<option value="">Select Product</option>') {
            showToast('No products available for sale', 'error');
            return;
        }
        
        saleItemsTable.innerHTML += `
            <tr id="row-${rowId}">
                <td>
                    <select class="form-control product-select" required>
                        ${productOptions}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control quantity" min="1" value="1" required>
                </td>
                <td>
                    <input type="number" class="form-control price" value="" required>
                </td>
                <td>
                    <input type="text" class="form-control total" readonly>
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm remove-item" data-row="${rowId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        
        // Add event listeners to the new row
        const row = document.getElementById(`row-${rowId}`);
        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity');
        const priceInput = row.querySelector('.price');
        const totalInput = row.querySelector('.total');
        
        productSelect.addEventListener('change', function() {
            if (this.value) {
                const selectedOption = this.options[this.selectedIndex];
                priceInput.value = selectedOption.getAttribute('data-price');
                totalInput.value = (priceInput.value * quantityInput.value).toLocaleString();
                updateSaleTotal();
            } else {
                priceInput.value = '';
                totalInput.value = '';
            }
        });
        
        quantityInput.addEventListener('input', function() {
            if (productSelect.value) {
                const selectedOption = productSelect.options[productSelect.selectedIndex];
                const productText = selectedOption.text;
                const availableStock = parseInt(productText.match(/\((\d+) available/)[1]);
                
                if (this.value > availableStock) {
                    this.value = availableStock;
                    showToast(`Cannot exceed available stock of ${availableStock}`, 'warning');
                }
                
                totalInput.value = (priceInput.value * this.value).toLocaleString();
                updateSaleTotal();
            }
        });
        
        priceInput.addEventListener('input', function() {
            if (productSelect.value && quantityInput.value) {
                totalInput.value = (this.value * quantityInput.value).toLocaleString();
                updateSaleTotal();
            }
        });
        
        row.querySelector('.remove-item').addEventListener('click', function() {
            row.remove();
            updateSaleTotal();
        });
    });

    // Update Sale Total
    function updateSaleTotal() {
        const rows = document.querySelectorAll('#saleItemsTable tr');
        let total = 0;
        
        rows.forEach(row => {
            const totalInput = row.querySelector('.total');
            if (totalInput.value) {
                total += parseFloat(totalInput.value.replace(/,/g, ''));
            }
        });
        
        document.getElementById('saleTotal').value = total.toLocaleString();
    }

    // Save Sale
    document.getElementById('saveSale').addEventListener('click', () => {
        const form = document.getElementById('saleForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const rows = document.querySelectorAll('#saleItemsTable tr');
        if (rows.length === 0) {
            showToast('Please add at least one item to the sale', 'error');
            return;
        }
        
        const saleItems = [];
        rows.forEach(row => {
            const productSelect = row.querySelector('.product-select');
            const productId = parseInt(productSelect.value);
            const product = products.find(p => p.id === productId);
            const quantity = parseInt(row.querySelector('.quantity').value);
            const price = parseFloat(row.querySelector('.price').value);
            
            if (product.stock < quantity) {
                showToast(`Not enough stock for ${product.name}. Available: ${product.stock}`, 'error');
                return;
            }
            
            saleItems.push({
                productId,
                productName: product.name,
                quantity,
                price
            });
        });
        
        if (saleItems.length === 0) return;
        
        // Generate invoice number
        const invoiceNumber = `${settings.invoicePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const newSale = {
            id: sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1,
            date: document.getElementById('saleDate').value,
            invoiceNumber,
            customer: document.getElementById('saleCustomer').value || 'Walk-in Customer',
            items: saleItems,
            paymentMethod: document.getElementById('salePaymentMethod').value,
            notes: document.getElementById('saleNotes').value
        };
        
        // Update product stock
        saleItems.forEach(item => {
            const productIndex = products.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                products[productIndex].stock -= item.quantity;
                
                // Add low stock alert if applicable
                if (products[productIndex].stock <= products[productIndex].reorderLevel) {
                    addAlert(
                        'Low Stock Alert',
                        `Product ${products[productIndex].name} is low on stock (${products[productIndex].stock} ${products[productIndex].unit}). Consider restocking.`,
                        'warning'
                    );
                }
            }
        });
        
        localStorage.setItem('products', JSON.stringify(products));
        
        // Save sale
        sales.push(newSale);
        localStorage.setItem('sales', JSON.stringify(sales));
        
        // Add activity
        const totalAmount = saleItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        activities.unshift({
            id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
            date: new Date().toISOString(),
            activity: 'Sale recorded',
            user: 'John Doe',
            details: `Recorded sale ${invoiceNumber} for UGX ${totalAmount.toLocaleString()}`
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Add success alert
        addAlert(
            'New Sale Recorded',
            `Sale ${invoiceNumber} for UGX ${totalAmount.toLocaleString()} has been recorded.`,
            'success'
        );
        
        saleModal.classList.remove('active');
        overlay.classList.remove('active');
        showToast('Sale recorded successfully');
        loadSales();
        loadDashboardData();
    });

    // Add Purchase
    document.getElementById('addPurchaseBtn').addEventListener('click', () => {
        // Populate suppliers dropdown
        const supplierSelect = document.getElementById('purchaseSupplier');
        supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
        suppliers.forEach(supplier => {
            supplierSelect.innerHTML += `<option value="${supplier.id}">${supplier.name}</option>`;
        });
        
        // Reset form
        document.getElementById('purchaseForm').reset();
        document.getElementById('purchaseItemsTable').innerHTML = '';
        document.getElementById('purchaseDate').valueAsDate = new Date();
        document.getElementById('purchaseTotal').value = '0';
        
        purchaseModal.classList.add('active');
        overlay.classList.add('active');
    });

    // Add Purchase Item
    document.getElementById('addPurchaseItem').addEventListener('click', () => {
        const purchaseItemsTable = document.getElementById('purchaseItemsTable');
        const rowId = Date.now();
        
        // Create product dropdown
        let productOptions = '<option value="">Select Product</option>';
        products.forEach(product => {
            productOptions += `<option value="${product.id}" data-price="${product.purchasePrice}">${product.name} (${product.purchasePrice.toLocaleString()} UGX)</option>`;
        });
        
        purchaseItemsTable.innerHTML += `
            <tr id="row-${rowId}">
                <td>
                    <select class="form-control product-select" required>
                        ${productOptions}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control quantity" min="1" value="1" required>
                </td>
                <td>
                    <input type="number" class="form-control price" readonly>
                </td>
                <td>
                    <input type="text" class="form-control total" readonly>
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm remove-item" data-row="${rowId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        
        // Add event listeners to the new row
        const row = document.getElementById(`row-${rowId}`);
        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity');
        const priceInput = row.querySelector('.price');
        const totalInput = row.querySelector('.total');
        
        productSelect.addEventListener('change', function() {
            if (this.value) {
                const selectedOption = this.options[this.selectedIndex];
                priceInput.value = selectedOption.getAttribute('data-price');
                totalInput.value = (priceInput.value * quantityInput.value).toLocaleString();
                updatePurchaseTotal();
            } else {
                priceInput.value = '';
                totalInput.value = '';
            }
        });
        
        quantityInput.addEventListener('input', function() {
            if (productSelect.value) {
                totalInput.value = (priceInput.value * this.value).toLocaleString();
                updatePurchaseTotal();
            }
        });
        
        row.querySelector('.remove-item').addEventListener('click', function() {
            row.remove();
            updatePurchaseTotal();
        });
    });

    // Update Purchase Total
    function updatePurchaseTotal() {
        const rows = document.querySelectorAll('#purchaseItemsTable tr');
        let total = 0;
        
        rows.forEach(row => {
            const totalInput = row.querySelector('.total');
            if (totalInput.value) {
                total += parseFloat(totalInput.value.replace(/,/g, ''));
            }
        });
        
        document.getElementById('purchaseTotal').value = total.toLocaleString();
    }

    // Save Purchase
    document.getElementById('savePurchase').addEventListener('click', () => {
        const form = document.getElementById('purchaseForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const supplierId = parseInt(document.getElementById('purchaseSupplier').value);
        if (!supplierId) {
            showToast('Please select a supplier', 'error');
            return;
        }
        
        const rows = document.querySelectorAll('#purchaseItemsTable tr');
        if (rows.length === 0) {
            showToast('Please add at least one item to the purchase', 'error');
            return;
        }
        
        const purchaseItems = [];
        rows.forEach(row => {
            const productSelect = row.querySelector('.product-select');
            const productId = parseInt(productSelect.value);
            const product = products.find(p => p.id === productId);
            const quantity = parseInt(row.querySelector('.quantity').value);
            const price = parseFloat(row.querySelector('.price').value);
            
            purchaseItems.push({
                productId,
                productName: product.name,
                quantity,
                price
            });
        });
        
        if (purchaseItems.length === 0) return;
        
        // Generate reference number
        const referenceNumber = `${settings.purchasePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const newPurchase = {
            id: purchases.length > 0 ? Math.max(...purchases.map(p => p.id)) + 1 : 1,
            date: document.getElementById('purchaseDate').value,
            referenceNumber,
            supplierId,
            items: purchaseItems,
            paymentMethod: document.getElementById('purchasePaymentMethod').value,
            notes: document.getElementById('purchaseNotes').value
        };
        
        // Update product stock
        purchaseItems.forEach(item => {
            const productIndex = products.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                products[productIndex].stock += item.quantity;
            }
        });
        
        localStorage.setItem('products', JSON.stringify(products));
        
        // Save purchase
        purchases.push(newPurchase);
        localStorage.setItem('purchases', JSON.stringify(purchases));
        
        // Add activity
        const totalAmount = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        activities.unshift({
            id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
            date: new Date().toISOString(),
            activity: 'Purchase recorded',
            user: 'John Doe',
            details: `Recorded purchase ${referenceNumber} for UGX ${totalAmount.toLocaleString()}`
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Add success alert
        addAlert(
            'New Purchase Recorded',
            `Purchase ${referenceNumber} for UGX ${totalAmount.toLocaleString()} has been recorded.`,
            'success'
        );
        
        purchaseModal.classList.remove('active');
        overlay.classList.remove('active');
        showToast('Purchase recorded successfully');
        loadPurchases();
        loadDashboardData();
    });

    // Add Inventory Adjustment
    document.getElementById('addInventoryBtn').addEventListener('click', () => {
        // Populate product dropdown
        const productSelect = document.getElementById('adjustmentProduct');
        productSelect.innerHTML = '<option value="">Select Product</option>';
        products.forEach(product => {
            productSelect.innerHTML += `<option value="${product.id}">${product.name} (Current: ${product.stock} ${product.unit})</option>`;
        });
        
        // Reset form
        document.getElementById('inventoryForm').reset();
        inventoryModal.classList.add('active');
        overlay.classList.add('active');
    });

    // Save Adjustment
    document.getElementById('saveAdjustment').addEventListener('click', () => {
        const form = document.getElementById('inventoryForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const productId = parseInt(document.getElementById('adjustmentProduct').value);
        const type = document.getElementById('adjustmentType').value;
        const quantity = parseInt(document.getElementById('adjustmentQuantity').value);
        const reason = document.getElementById('adjustmentReason').value;
        
        // Find product
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            showToast('Product not found', 'error');
            return;
        }
        
        // Update stock
        if (type === 'add') {
            products[productIndex].stock += quantity;
        } else {
            if (products[productIndex].stock < quantity) {
                showToast('Not enough stock to remove', 'error');
                return;
            }
            products[productIndex].stock -= quantity;
        }
        
        localStorage.setItem('products', JSON.stringify(products));
        
        // Record adjustment
        const newAdjustment = {
            id: adjustments.length > 0 ? Math.max(...adjustments.map(a => a.id)) + 1 : 1,
            date: new Date().toISOString(),
            productId,
            type,
            quantity,
            reason,
            user: 'John Doe'
        };
        
        adjustments.push(newAdjustment);
        localStorage.setItem('adjustments', JSON.stringify(adjustments));
        
        // Add activity
        const product = products[productIndex];
        activities.unshift({
            id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
            date: new Date().toISOString(),
            activity: 'Stock adjusted',
            user: 'John Doe',
            details: `Adjusted stock for ${product.name}: ${type === 'add' ? '+' : '-'}${quantity} units`
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Add alert for low stock if applicable
        if (products[productIndex].stock <= products[productIndex].reorderLevel) {
            addAlert(
                'Low Stock Alert',
                `Product ${products[productIndex].name} is low on stock (${products[productIndex].stock} ${products[productIndex].unit}). Consider restocking.`,
                'warning'
            );
        }
        
        inventoryModal.classList.remove('active');
        overlay.classList.remove('active');
        showToast('Stock adjusted successfully');
        loadInventory();
        loadDashboardData();
    });

    // Save Settings
    document.getElementById('saveSettings').addEventListener('click', () => {
        const form = document.getElementById('settingsForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        settings = {
            businessName: document.getElementById('businessName').value,
            currency: document.getElementById('currency').value,
            taxRate: parseFloat(document.getElementById('taxRate').value),
            lowStockThreshold: parseInt(document.getElementById('lowStockThreshold').value),
            invoicePrefix: document.getElementById('invoicePrefix').value,
            purchasePrefix: document.getElementById('purchasePrefix').value
        };
        
        localStorage.setItem('settings', JSON.stringify(settings));
        
        // Add activity
        activities.unshift({
            id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
            date: new Date().toISOString(),
            activity: 'Settings updated',
            user: 'John Doe',
            details: 'System settings were updated'
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        
        showToast('Settings saved successfully');
    });

    // Print functionality
    document.getElementById('printDashboard').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('printReport').addEventListener('click', () => {
        window.print();
    });

    // PDF Export functionality
    document.getElementById('exportDashboard').addEventListener('click', () => {
        const title = 'Dashboard Summary Report';
        const headers = ['Metric', 'Value', 'Change'];
        
        const totalProducts = products.length;
        const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length;
        const outOfStockItems = products.filter(p => p.stock === 0).length;
        const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
        
        const data = [
            ['Total Products', totalProducts, '0%'],
            ['Low Stock Items', lowStockItems, '0%'],
            ['Out of Stock Items', outOfStockItems, '0%'],
            ['Inventory Value', `UGX ${inventoryValue.toLocaleString()}`, '0%']
        ];
        
        exportToPDF(title, headers, data, 'dashboard_report');
    });

    document.getElementById('exportProducts').addEventListener('click', () => {
        const title = 'Products Report';
        const headers = ['ID', 'Name', 'Category', 'Price (UGX)', 'Stock', 'Status'];
        
        const data = products.map(product => {
            const category = categories.find(c => c.id === product.categoryId);
            const status = product.stock === 0 ? 'Out of Stock' : 
                           product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
            
            return [
                product.id,
                product.name,
                category ? category.name : 'N/A',
                product.sellingPrice.toLocaleString(),
                `${product.stock} ${product.unit}`,
                status
            ];
        });
        
        exportToPDF(title, headers, data, 'products_report');
    });

    document.getElementById('exportCategories').addEventListener('click', () => {
        const title = 'Categories Report';
        const headers = ['ID', 'Name', 'Description', 'No. of Products'];
        
        const data = categories.map(category => {
            const productCount = products.filter(p => p.categoryId === category.id).length;
            return [
                category.id,
                category.name,
                category.description || 'N/A',
                productCount
            ];
        });
        
        exportToPDF(title, headers, data, 'categories_report');
    });

    document.getElementById('exportSuppliers').addEventListener('click', () => {
        const title = 'Suppliers Report';
        const headers = ['ID', 'Name', 'Contact', 'Email', 'Products Supplied'];
        
        const data = suppliers.map(supplier => {
            const productsSupplied = supplier.products.map(id => {
                const product = products.find(p => p.id === id);
                return product ? product.name : 'Unknown';
            }).join(', ');
            
            return [
                supplier.id,
                supplier.name,
                supplier.phone,
                supplier.email || 'N/A',
                productsSupplied || 'N/A'
            ];
        });
        
        exportToPDF(title, headers, data, 'suppliers_report');
    });

    document.getElementById('exportInventory').addEventListener('click', () => {
        const title = 'Current Inventory Report';
        const headers = ['ID', 'Product', 'Category', 'Current Stock', 'Reorder Level', 'Status'];
        
        const data = products.map(product => {
            const category = categories.find(c => c.id === product.categoryId);
            const status = product.stock === 0 ? 'Out of Stock' : 
                           product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
            
            return [
                product.id,
                product.name,
                category ? category.name : 'N/A',
                `${product.stock} ${product.unit}`,
                `${product.reorderLevel} ${product.unit}`,
                status
            ];
        });
        
        exportToPDF(title, headers, data, 'inventory_report');
    });

    document.getElementById('exportAdjustments').addEventListener('click', () => {
        const title = 'Stock Adjustments Report';
        const headers = ['ID', 'Date', 'Product', 'Adjustment', 'Reason', 'By'];
        
        const data = adjustments.map(adj => {
            const product = products.find(p => p.id === adj.productId);
            return [
                adj.id,
                new Date(adj.date).toLocaleDateString(),
                product ? product.name : 'N/A',
                `${adj.type === 'add' ? '+' : '-'}${adj.quantity}`,
                adj.reason,
                adj.user || 'System'
            ];
        });
        
        exportToPDF(title, headers, data, 'adjustments_report');
    });

    document.getElementById('exportSales').addEventListener('click', () => {
        const title = 'Sales Report';
        const headers = ['ID', 'Date', 'Invoice No.', 'Customer', 'Items', 'Total (UGX)', 'Status'];
        
        const data = sales.map(sale => {
            const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            
            return [
                sale.id,
                new Date(sale.date).toLocaleDateString(),
                sale.invoiceNumber,
                sale.customer || 'Walk-in Customer',
                itemsCount,
                totalAmount.toLocaleString(),
                'Completed'
            ];
        });
        
        exportToPDF(title, headers, data, 'sales_report');
    });

    document.getElementById('exportPurchases').addEventListener('click', () => {
        const title = 'Purchases Report';
        const headers = ['ID', 'Date', 'Reference', 'Supplier', 'Items', 'Total (UGX)', 'Status'];
        
        const data = purchases.map(purchase => {
            const supplier = suppliers.find(s => s.id === purchase.supplierId);
            const itemsCount = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            
            return [
                purchase.id,
                new Date(purchase.date).toLocaleDateString(),
                purchase.referenceNumber,
                supplier ? supplier.name : 'N/A',
                itemsCount,
                totalAmount.toLocaleString(),
                'Completed'
            ];
        });
        
        exportToPDF(title, headers, data, 'purchases_report');
    });

    document.getElementById('exportReport').addEventListener('click', () => {
        const activeTab = document.querySelector('#reports .tab.active');
        if (!activeTab) return;
        
        const tabId = activeTab.getAttribute('data-tab');
        
        switch(tabId) {
            case 'inventory-report':
                document.getElementById('exportInventoryReport').click();
                break;
            case 'sales-report':
                document.getElementById('exportSalesReport').click();
                break;
            case 'purchase-report':
                document.getElementById('exportPurchaseReport').click();
                break;
            case 'profit-loss':
                document.getElementById('exportProfitLoss').click();
                break;
        }
    });

    document.getElementById('exportInventoryReport').addEventListener('click', () => {
        const title = 'Inventory Valuation Report';
        const headers = ['Product', 'Category', 'Current Stock', 'Unit Price (UGX)', 'Total Value (UGX)', 'Status'];
        
        const data = products.map(product => {
            const category = categories.find(c => c.id === product.categoryId);
            const totalValue = product.stock * product.purchasePrice;
            const status = product.stock === 0 ? 'Out of Stock' : 
                           product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
            
            return [
                product.name,
                category ? category.name : 'N/A',
                `${product.stock} ${product.unit}`,
                product.purchasePrice.toLocaleString(),
                totalValue.toLocaleString(),
                status
            ];
        });
        
        exportToPDF(title, headers, data, 'inventory_valuation_report');
    });

    document.getElementById('exportSalesReport').addEventListener('click', () => {
        const title = 'Sales Analysis Report';
        const headers = ['Date', 'Invoice No.', 'Customer', 'Items', 'Total (UGX)', 'Status'];
        
        const data = sales.map(sale => {
            const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            
            return [
                new Date(sale.date).toLocaleDateString(),
                sale.invoiceNumber,
                sale.customer || 'Walk-in Customer',
                itemsCount,
                totalAmount.toLocaleString(),
                'Completed'
            ];
        });
        
        exportToPDF(title, headers, data, 'sales_analysis_report');
    });

    document.getElementById('exportPurchaseReport').addEventListener('click', () => {
        const title = 'Purchase Analysis Report';
        const headers = ['Date', 'Reference', 'Supplier', 'Items', 'Total (UGX)', 'Status'];
        
        const data = purchases.map(purchase => {
            const supplier = suppliers.find(s => s.id === purchase.supplierId);
            const itemsCount = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            
            return [
                new Date(purchase.date).toLocaleDateString(),
                purchase.referenceNumber,
                supplier ? supplier.name : 'N/A',
                itemsCount,
                totalAmount.toLocaleString(),
                'Completed'
            ];
        });
        
        exportToPDF(title, headers, data, 'purchase_analysis_report');
    });

    document.getElementById('exportProfitLoss').addEventListener('click', () => {
        const title = 'Profit & Loss Statement';
        const headers = ['Period', 'Revenue (UGX)', 'Cost of Goods Sold (UGX)', 'Gross Profit (UGX)', 'Expenses (UGX)', 'Net Profit (UGX)'];
        
        // Group sales by month
        const salesByMonth = {};
        sales.forEach(sale => {
            const date = new Date(sale.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            
            if (!salesByMonth[monthYear]) {
                salesByMonth[monthYear] = 0;
            }
            
            const total = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            salesByMonth[monthYear] += total;
        });
        
        // Group purchases by month
        const purchasesByMonth = {};
        purchases.forEach(purchase => {
            const date = new Date(purchase.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            
            if (!purchasesByMonth[monthYear]) {
                purchasesByMonth[monthYear] = 0;
            }
            
            const total = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            purchasesByMonth[monthYear] += total;
        });
        
        // Prepare data
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const data = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - 11 + i, 1);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = months[date.getMonth()] + ' ' + date.getFullYear().toString().slice(-2));
            
            const revenue = salesByMonth[monthYear] || 0;
            const cogs = purchasesByMonth[monthYear] || 0;
            const grossProfit = revenue - cogs;
            const expenses = Math.floor(revenue * 0.2); // Assuming 20% expenses
            const netProfit = grossProfit - expenses;
            
            data.push([
                monthName,
                revenue.toLocaleString(),
                cogs.toLocaleString(),
                grossProfit.toLocaleString(),
                expenses.toLocaleString(),
                netProfit.toLocaleString()
            ]);
        }
        
        exportToPDF(title, headers, data, 'profit_loss_statement');
    });

    // Search functionality
    document.getElementById('productSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#productsTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('categorySearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#categoriesTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('supplierSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#suppliersTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('salesSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#salesTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('purchasesSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#purchasesTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('inventorySearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#inventoryTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Event delegation for dynamically added elements
    document.addEventListener('click', (e) => {
        if (e.target.closest('.adjust-stock')) {
            const productId = parseInt(e.target.closest('.adjust-stock').getAttribute('data-id'));
            
            // Populate product dropdown
            const productSelect = document.getElementById('adjustmentProduct');
            productSelect.innerHTML = '<option value="">Select Product</option>';
            products.forEach(product => {
                productSelect.innerHTML += `<option value="${product.id}" ${product.id === productId ? 'selected' : ''}>${product.name} (Current: ${product.stock} ${product.unit})</option>`;
            });
            
            // Reset form
            document.getElementById('inventoryForm').reset();
            inventoryModal.classList.add('active');
            overlay.classList.add('active');
        }
        
        if (e.target.closest('.action-btn.delete')) {
            if (confirm('Are you sure you want to delete this item?')) {
                const id = parseInt(e.target.closest('.action-btn').getAttribute('data-id'));
                
                // Determine which table the delete button is in
                if (e.target.closest('#productsTable')) {
                    products = products.filter(p => p.id !== id);
                    localStorage.setItem('products', JSON.stringify(products));
                    showToast('Product deleted successfully');
                    loadProducts();
                    loadDashboardData();
                } else if (e.target.closest('#categoriesTable')) {
                    // Check if category is in use
                    const productsUsingCategory = products.filter(p => p.categoryId === id);
                    if (productsUsingCategory.length > 0) {
                        showToast('Cannot delete category - it is being used by products', 'error');
                        return;
                    }
                    
                    categories = categories.filter(c => c.id !== id);
                    localStorage.setItem('categories', JSON.stringify(categories));
                    showToast('Category deleted successfully');
                    loadCategories();
                } else if (e.target.closest('#suppliersTable')) {
                    // Check if supplier is in use
                    const purchasesUsingSupplier = purchases.filter(p => p.supplierId === id);
                    if (purchasesUsingSupplier.length > 0) {
                        showToast('Cannot delete supplier - they have purchase records', 'error');
                        return;
                    }
                    
                    suppliers = suppliers.filter(s => s.id !== id);
                    localStorage.setItem('suppliers', JSON.stringify(suppliers));
                    showToast('Supplier deleted successfully');
                    loadSuppliers();
                } else if (e.target.closest('#salesTable')) {
                    sales = sales.filter(s => s.id !== id);
                    localStorage.setItem('sales', JSON.stringify(sales));
                    showToast('Sale record deleted successfully');
                    loadSales();
                } else if (e.target.closest('#purchasesTable')) {
                    purchases = purchases.filter(p => p.id !== id);
                    localStorage.setItem('purchases', JSON.stringify(purchases));
                    showToast('Purchase record deleted successfully');
                    loadPurchases();
                }
            }
        }
        
        if (e.target.closest('.action-btn.edit')) {
            const id = parseInt(e.target.closest('.action-btn').getAttribute('data-id'));
            
            // Determine which table the edit button is in
            if (e.target.closest('#productsTable')) {
                const product = products.find(p => p.id === id);
                if (!product) return;
                
                // Populate category dropdown
                const categorySelect = document.getElementById('productCategory');
                categorySelect.innerHTML = '<option value="">Select Category</option>';
                categories.forEach(category => {
                    categorySelect.innerHTML += `<option value="${category.id}" ${category.id === product.categoryId ? 'selected' : ''}>${category.name}</option>`;
                });
                
                // Fill form
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productPurchasePrice').value = product.purchasePrice;
                document.getElementById('productSellingPrice').value = product.sellingPrice;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productReorderLevel').value = product.reorderLevel;
                document.getElementById('productUnit').value = product.unit;
                document.getElementById('productBarcode').value = product.barcode || '';
                
                // TODO: Implement update functionality
                productModal.classList.add('active');
                overlay.classList.add('active');
            } else if (e.target.closest('#categoriesTable')) {
                const category = categories.find(c => c.id === id);
                if (!category) return;
                
                // Fill form
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryDescription').value = category.description || '';
                
                // TODO: Implement update functionality
                categoryModal.classList.add('active');
                overlay.classList.add('active');
            } else if (e.target.closest('#suppliersTable')) {
                const supplier = suppliers.find(s => s.id === id);
                if (!supplier) return;
                
                // Populate products dropdown
                const productsSelect = document.getElementById('supplierProducts');
                productsSelect.innerHTML = '';
                products.forEach(product => {
                    const isSelected = supplier.products.includes(product.id);
                    productsSelect.innerHTML += `<option value="${product.id}" ${isSelected ? 'selected' : ''}>${product.name}</option>`;
                });
                
                // Fill form
                document.getElementById('supplierName').value = supplier.name;
                document.getElementById('supplierContactPerson').value = supplier.contactPerson || '';
                document.getElementById('supplierPhone').value = supplier.phone;
                document.getElementById('supplierEmail').value = supplier.email || '';
                document.getElementById('supplierAddress').value = supplier.address || '';
                document.getElementById('supplierPaymentTerms').value = supplier.paymentTerms || '';
                
                // TODO: Implement update functionality
                supplierModal.classList.add('active');
                overlay.classList.add('active');
            }
        }
        
        if (e.target.closest('#viewAllLowStock')) {
            // Navigate to inventory tab and show low stock items
            document.querySelector('.menu-item[data-target="inventory"]').click();
            document.querySelector('.tab[data-tab="current"]').click();
            
            // Filter to show only low stock items
            document.getElementById('inventorySearch').value = 'low stock';
            document.getElementById('inventorySearch').dispatchEvent(new Event('input'));
        }
        
        if (e.target.closest('#viewAllSales')) {
            // Navigate to sales tab
            document.querySelector('.menu-item[data-target="sales"]').click();
        }
        
        if (e.target.closest('#refreshActivities')) {
            loadDashboardData();
            showToast('Activities refreshed');
        }
    });
});
