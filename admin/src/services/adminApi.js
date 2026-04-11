import api from './api';

export const adminDashboardService = {
    getStats: () => api.get('/admin/dashboard/stats'),
    getCustomers: () => api.get('/admin/dashboard/customers'),
    toggleCustomerActive: (id) => api.patch(`/admin/dashboard/customers/${id}/active`)
};

export const adminPartnerService = {
    getAllPartners: () => api.get('/admin/partners'),
    getPartnerById: (id) => api.get(`/admin/partners/${id}`),
    createPartner: (body) => api.post('/admin/partners', body),
    setPartnerActive: (id, value) => api.put(`/admin/partners/${id}/active?value=${value}`),
    setPartnerStatus: (id, value) => api.put(`/admin/partners/${id}/status?value=${value}`)
};

export const adminMenuService = {
    getMenusByPartner: (partnerId) => api.get(`/menus/partners/${partnerId}`),
    createMenu: (body) => api.post('/menus', body),
    updateMenu: (menuId, body) => api.put(`/menus/${menuId}`, body)
};

export const adminPackageService = {
    getAllPackages: () => api.get('/admin/packages'),
    createPackage: (body) => api.post('/packages', body)
};

export const adminSubscriptionService = {
    getAllSubscriptions: () => api.get('/subscriptions'),
    updateSubscriptionStatus: (id, status) =>
        api.patch(`/subscriptions/${id}/status?status=${encodeURIComponent(status)}`)
};
