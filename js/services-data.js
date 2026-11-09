/* Original assignment service rates, shared by estimates and booking totals. */
window.travelServices = Object.freeze({
    transfer: { name: 'Airport transfer', unit: 'trip', rates: { standard: 25, premium: 45, vip: 0 } },
    car: { name: 'Car rental', unit: 'day', rates: { standard: 35, premium: 70, vip: 120 } },
    tour: { name: 'Guided city tour', unit: 'person', rates: { standard: 20, premium: 50, vip: 100 } }
});
window.quoteTravelService = function (serviceId, tier = 'standard', quantity = 1) {
    const service = window.travelServices[serviceId];
    if (!service || !Object.hasOwn(service.rates, tier)) return null;
    const count = serviceId === 'tour' && tier !== 'standard' ? 1 : Number(quantity);
    if (!Number.isInteger(count) || count < 1 || count > 365) return null;
    return { rate: service.rates[tier], quantity: count, total: service.rates[tier] * count };
};
