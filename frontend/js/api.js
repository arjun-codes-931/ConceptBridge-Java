// js/api.js

const API_BASE_URL = "http://localhost:8080/api";

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = null;
        
        // Automatically try to load token from localStorage
        this.loadTokenFromStorage();
    }
    
    loadTokenFromStorage() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.token) {
                this.setToken(user.token);
                console.log("[ApiClient] Token loaded from localStorage");
            } else {
                console.warn("[ApiClient] No user/token found in localStorage");
            }
        } catch (e) {
            console.error("[ApiClient] Error loading token from localStorage:", e);
        }
    }
    
    setToken(token) {
        this.token = token;
        console.log("[ApiClient] Token set:", token ? token.substring(0, 30) + "..." : "null");
        
        // Also update localStorage if needed
        if (token) {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.token = token;
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
                console.error("[ApiClient] Error saving token to localStorage:", e);
            }
        }
    }
    
    clearToken() {
        this.token = null;
        console.log("[ApiClient] Token cleared");
    }
    
    async request(endpoint, options = {}) {
        // Ensure endpoint starts with /
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }
        
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        } else {
            console.warn(`[ApiClient] No token available for request to ${endpoint}`);
        }

        const config = {
            method: options.method || "GET",
            headers: headers,
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        console.log(`[ApiClient] ${config.method} ${url}`);
        console.log(`[ApiClient] Token: ${this.token ? "Present" : "Missing"}`);

        try {
            const response = await fetch(url, config);
            
            console.log(`[ApiClient] Response: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const text = await response.text();
                console.error(`[ApiClient] Error ${response.status}:`, text);
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            }
            
            return response.text();
            
        } catch (error) {
            console.error(`[ApiClient] Request failed:`, error);
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint);
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: "POST",
            body: data
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: "PUT",
            body: data
        });
    }

    delete(endpoint) {
        return this.request(endpoint, {
            method: "DELETE"
        });
    }
    
    // Helper method to check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }
}

// ✅ Single global instance
const api = new ApiClient();

// Debug helper function
function debugToken() {
    console.log("=== Token Debug ===");
    console.log("api.token:", api.token ? api.token.substring(0, 30) + "..." : "null");
    console.log("api.isAuthenticated():", api.isAuthenticated());
    
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("localStorage user exists:", !!user);
    if (user) {
        console.log("localStorage username:", user.username);
        console.log("localStorage token:", user.token ? user.token.substring(0, 30) + "..." : "null");
        console.log("localStorage roles:", user.roles || "No roles");
    }
    console.log("===================");
}

// Test connection function
async function testConnection() {
    try {
        console.log("[ApiClient] Testing connection...");
        
        if (!api.isAuthenticated()) {
            console.error("[ApiClient] Not authenticated");
            return false;
        }
        
        // Test a simple endpoint
        const result = await api.get("/auth/test");
        console.log("[ApiClient] Connection test successful:", result);
        return true;
        
    } catch (error) {
        console.error("[ApiClient] Connection test failed:", error);
        return false;
    }
}

// Make debug functions available globally
window.debugToken = debugToken;
window.testConnection = testConnection;