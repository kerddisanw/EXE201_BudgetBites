export function formatMoneyVnd(n) {
    const num = Number(n);
    if (n == null || Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(num);
}
