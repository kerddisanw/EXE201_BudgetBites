import axios from 'axios';
import { API_URL } from '../config/config';

const MAX_BYTES = 10 * 1024 * 1024;

function baseUrl() {
    return String(API_URL || '').replace(/\/$/, '');
}

async function postImage(path, file) {
    const token = localStorage.getItem('token');
    const body = new FormData();
    body.append('file', file);
    try {
        return await axios.post(`${baseUrl()}${path}`, body, {
            timeout: 120000,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
    } catch (e) {
        if (e.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        throw e;
    }
}

/**
 * POST /api/images/partners — multipart field "file"
 */
export function uploadPartnerImage(file) {
    if (file.size > MAX_BYTES) {
        return Promise.reject(new Error('FILE_TOO_LARGE'));
    }
    return postImage('/images/partners', file);
}

/**
 * POST /api/images/packages — multipart field "file"
 */
export function uploadPackageImage(file) {
    if (file.size > MAX_BYTES) {
        return Promise.reject(new Error('FILE_TOO_LARGE'));
    }
    return postImage('/images/packages', file);
}

/**
 * POST /api/images/menu-items — multipart field "file"
 */
export function uploadMenuItemImage(file) {
    if (file.size > MAX_BYTES) {
        return Promise.reject(new Error('FILE_TOO_LARGE'));
    }
    return postImage('/images/menu-items', file);
}

export { MAX_BYTES as MAX_IMAGE_UPLOAD_BYTES };
