"use strict";
/**
 * Mock implementation of fetch for tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockFetch = exports.mockResponses = void 0;
exports.registerMockResponse = registerMockResponse;
exports.clearMockResponses = clearMockResponses;
exports.mockResponses = {};
function registerMockResponse(url, response, status = 200) {
    exports.mockResponses[url] = {
        data: response,
        status,
    };
}
function clearMockResponses() {
    Object.keys(exports.mockResponses).forEach(key => {
        delete exports.mockResponses[key];
    });
}
exports.mockFetch = jest
    .fn()
    .mockImplementation((url, options) => {
    const mockResponse = exports.mockResponses[url];
    if (!mockResponse) {
        return Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            json: () => Promise.reject(new Error('Not found')),
            text: () => Promise.reject(new Error('Not found')),
        });
    }
    const responseBody = typeof mockResponse.data === 'string' ? mockResponse.data : JSON.stringify(mockResponse.data);
    return Promise.resolve({
        ok: mockResponse.status >= 200 && mockResponse.status < 300,
        status: mockResponse.status,
        statusText: mockResponse.status === 200 ? 'OK' : 'Error',
        json: () => Promise.resolve(mockResponse.data),
        text: () => Promise.resolve(responseBody),
    });
});
