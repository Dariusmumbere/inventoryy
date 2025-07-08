class SyncManager {
    constructor() {
        this.apiBaseUrl = 'https://inventry-mn6a.onrender.com';
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || null;
        this.isSyncing = false;
        this.syncListeners = [];
    }

    onSync(listener) {
        this.syncListeners.push(listener);
    }

    notifySyncListeners(event, data = null) {
        this.syncListeners.forEach(listener => listener(event, data));
    }

    async validateSyncData(data) {
        const errors = [];
        
        // Check products
        data.products.forEach((product, index) => {
            if (!product.purchase_price && product.purchase_price !== 0) {
                errors.push(`Product "${product.name}" (ID: ${product.id}) is missing purchase price`);
            }
            if (!product.unit) {
                errors.push(`Product "${product.name}" (ID: ${product.id}) is missing unit`);
            }
        });
        
        if (errors.length > 0) {
            throw new Error(`Sync validation failed:\n${errors.join('\n')}`);
        }
    }

    async syncAllData(forceReload = false) {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return false;
        }
        
        this.isSyncing = true;
        this.notifySyncListeners('sync-start');
        
        try {
            this.updateSyncStatus('syncing');
            
            // Prepare data to send to server
            const localData = {
                last_sync_time: this.lastSyncTime,
                products: JSON.parse(localStorage.getItem('products') || '[]'),
                categories: JSON.parse(localStorage.getItem('categories') || '[]'),
                suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
                sales: JSON.parse(localStorage.getItem('sales') || '[]'),
                purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
                adjustments: JSON.parse(localStorage.getItem('adjustments') || '[]'),
                activities: JSON.parse(localStorage.getItem('activities') || '[]'),
                settings: JSON.parse(localStorage.getItem('settings') || 'null')
            };

            // Transform and validate data
            localData.products = localData.products.map(product => ({
                id: product.id,
                user_id: product.userId || null,
                name: product.name,
                category_id: product.categoryId || null,
                description: product.description || null,
                purchase_price: parseFloat(product.purchasePrice) || 0,
                selling_price: parseFloat(product.sellingPrice) || 0,
                stock: parseInt(product.stock) || 0,
                reorder_level: parseInt(product.reorderLevel) || 0,
                unit: product.unit || 'pcs',
                barcode: product.barcode || null,
                created_at: product.createdAt || new Date().toISOString()
            }));

            // Ensure dates are properly formatted
            ['sales', 'purchases', 'adjustments', 'activities'].forEach(key => {
                localData[key] = localData[key].map(item => ({
                    ...item,
                    date: item.date || new Date().toISOString()
                }));
            });

            // Validate before sending
            await this.validateSyncData(localData);

            // Send data to server
            const response = await fetch(`${this.apiBaseUrl}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.getAuthHeaders()
                },
                body: JSON.stringify(localData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Sync failed with status ' + response.status);
            }

            const serverData = await response.json();

            // Store received data
            const storageUpdates = {
                products: serverData.products,
                categories: serverData.categories,
                suppliers: serverData.suppliers,
                sales: serverData.sales,
                purchases: serverData.purchases,
                adjustments: serverData.adjustments,
                activities: serverData.activities,
                settings: serverData.settings
            };

            Object.entries(storageUpdates).forEach(([key, value]) => {
                if (value !== undefined) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            });

            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('lastSyncTime', this.lastSyncTime);
            
            this.updateSyncStatus('online');
            showToast('Data synchronized successfully');
            this.notifySyncListeners('sync-success', serverData);
            
            if (forceReload) {
                window.location.reload();
            }
            
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            this.updateSyncStatus('offline');
            this.notifySyncListeners('sync-error', error);
            
            if (error.message.includes('purchase_price') && error.message.includes('null value')) {
                showToast('Sync failed: Product purchase price is required', 'error');
            } else if (error.message.includes('Duplicate data')) {
                showToast('Sync conflict: Some data already exists on server', 'warning');
            } else if (error.message.includes('Validation error')) {
                showToast('Sync failed: Invalid data format', 'error');
            } else if (error.message.includes('401')) {
                showToast('Session expired. Please login again.', 'error');
                auth.logout();
            } else {
                showToast('Sync failed: ' + error.message, 'error');
            }
            
            return false;
        } finally {
            this.isSyncing = false;
            this.notifySyncListeners('sync-complete');
        }
    }

    updateSyncStatus(status) {
        const syncStatus = document.getElementById('syncStatus');
        if (!syncStatus) return;
        
        const indicator = syncStatus.querySelector('.indicator');
        const text = syncStatus.querySelector('.text');
        
        syncStatus.className = 'sync-status';
        indicator.className = 'indicator';
        
        switch(status) {
            case 'online':
                syncStatus.classList.add('online');
                indicator.classList.add('online');
                text.textContent = 'Online';
                break;
            case 'offline':
                syncStatus.classList.add('offline');
                indicator.classList.add('offline');
                text.textContent = 'Offline';
                break;
            case 'syncing':
                syncStatus.classList.add('syncing');
                indicator.classList.add('syncing');
                text.textContent = 'Syncing...';
                break;
        }
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`, {
                method: 'GET',
                cache: 'no-store',
                headers: auth.getAuthHeaders()
            });
            
            if (response.ok) {
                this.updateSyncStatus('online');
                return true;
            } else {
                this.updateSyncStatus('offline');
                return false;
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            this.updateSyncStatus('offline');
            return false;
        }
    }

    initAutoSync() {
        setInterval(() => this.checkConnection(), 30000);
        
        this.checkConnection().then(online => {
            if (online) {
                const hasLocalData = localStorage.getItem('products') !== null;
                if (hasLocalData) {
                    this.syncAllData().catch(() => {});
                }
            }
        });
        
        window.addEventListener('online', () => {
            this.checkConnection().then(online => {
                if (online) this.syncAllData().catch(() => {});
            });
        });

        auth.onAuthStateChanged((user) => {
            if (user) {
                this.checkConnection();
            }
        });
    }

    clearLocalData() {
        [
            'products', 'categories', 'suppliers', 'sales', 
            'purchases', 'adjustments', 'activities', 'settings',
            'lastSyncTime'
        ].forEach(key => localStorage.removeItem(key));
    }
}

const syncManager = new SyncManager();

document.addEventListener('DOMContentLoaded', () => {
    if (auth.isAuthenticated()) {
        syncManager.initAutoSync();
        
        const syncButton = document.getElementById('syncButton');
        if (syncButton) {
            syncButton.addEventListener('click', () => {
                syncManager.syncAllData(true).catch(() => {});
            });
        }
    }
});

window.syncManager = syncManager;
