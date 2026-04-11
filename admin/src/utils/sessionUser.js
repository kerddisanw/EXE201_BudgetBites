export function getStoredUser() {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function isAdminUser(user) {
    return user?.role === 'ADMIN';
}
