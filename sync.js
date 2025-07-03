class SyncManager {
    constructor() {
        this.apiBaseUrl = 'https://inventry-mn6a.onrender.com';
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || null;
        this.isSyncing = false;
    }

    async syncAllData() {
        if (this.isSyncing) return;
        this.isSyncing = true;
        
        try {
            // Update sync status UI
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
                activities: JSON.parse(localStorage.getItem('activities') || '[]')
            };

            // Send data to server and get updated data
            const response = await fetch(`${this.apiBaseUrl}/sync`, {
                method: 'POST',
                headers: auth.getAuthHeaders(),
                body: JSON.stringify(localData)
            });

            if (!response.ok) {
                throw new Error('Sync failed');
            }

            const serverData = await response.json();

            // Store received data in local storage
            localStorage.setItem('products', JSON.stringify(serverData.products || []));
            localStorage.setItem('categories', JSON.stringify(serverData.categories || []));
            localStorage.setItem('suppliers', JSON.stringify(serverData.suppliers || []));
            localStorage.setItem('sales', JSON.stringify(serverData.sales || []));
            localStorage.setItem('purchases', JSON.stringify(serverData.purchases || []));
            localStorage.setItem('adjustments', JSON.stringify(serverData.adjustments || []));
            localStorage.setItem('activities', JSON.stringify(serverData.activities || []));
            
            if (serverData.settings) {
                localStorage.setItem('settings', JSON.stringify(serverData.settings));
            }

            // Update last sync time
            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('lastSyncTime', this.lastSyncTime);
            
            // Update sync status UI
            this.updateSyncStatus('online');
            
            // Show success message
            showToast('Data synchronized successfully');
            
            // Reload the UI
            window.location.reload();
            
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            this.updateSyncStatus('offline');
            showToast('Sync failed: ' + error.message, 'error');
            return false;
        } finally {
            this.isSyncing = false;
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
                indicator.classList.add('online');
                text.textContent = 'Online';
                break;
            case 'offline':
                indicator.classList.add('offline');
                text.textContent = 'Offline';
                break;
            case 'syncing':
                indicator.classList.add('syncing');
                text.textContent = 'Syncing...';
                break;
        }
    }

    checkConnection() {
        return new Promise((resolve) => {
            fetch(`${this.apiBaseUrl}/health`, {
                method: 'GET',
                cache: 'no-store'
            })
            .then(response => {
                if (response.ok) {
                    this.updateSyncStatus('online');
                    resolve(true);
                } else {
                    this.updateSyncStatus('offline');
                    resolve(false);
                }
            })
            .catch(() => {
                this.updateSyncStatus('offline');
                resolve(false);
            });
        });
    }

    // Initialize automatic sync checks
    initAutoSync() {
        // Check connection status every 30 seconds
        setInterval(() => this.checkConnection(), 30000);
        
        // Initial check
        this.checkConnection();
        
        // Sync when coming back online
        window.addEventListener('online', () => {
            this.checkConnection().then(online => {
                if (online) this.syncAllData();
            });
        });
    }
}

// Initialize sync manager
const syncManager = new SyncManager();

// Make it available globally
window.syncManager = syncManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (auth.isAuthenticated()) {
        syncManager.initAutoSync();
        
        // Set up manual sync button
        const syncButton = document.getElementById('syncButton');
        if (syncButton) {
            syncButton.addEventListener('click', () => syncManager.syncAllData());
        }
    }
});
// In your sync manager
async function resolveConflicts(localData, serverData) {
    // For each entity type, merge changes favoring the most recent
    const mergedData = {};
    
    ['products', 'categories', 'suppliers', 'sales', 'purchases', 'adjustments'].forEach(entityType => {
        const localEntities = localData[entityType] || [];
        const serverEntities = serverData[entityType] || [];
        
        const merged = [...serverEntities];
        const serverIds = new Set(serverEntities.map(e => e.id));
        
        // Add local entities that don't exist on server
        localEntities.forEach(localEntity => {
            if (!serverIds.has(localEntity.id)) {
                merged.push(localEntity);
            }
        });
        
        mergedData[entityType] = merged;
    });
    
    return mergedData;
}
