/**
 * Mock implementation of fetch for tests
 */

export const mockResponses: Record<string, any> = {};

export function registerMockResponse(url: string, response: any, status = 200): void {
  mockResponses[url] = {
    data: response,
    status,
  };
}

export function clearMockResponses(): void {
  Object.keys(mockResponses).forEach(key => {
    delete mockResponses[key];
  });
}

export const mockFetch = jest
  .fn()
  .mockImplementation((url: string, options?: RequestInit): Promise<Response> => {
    const mockResponse = mockResponses[url];

    if (!mockResponse) {
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.reject(new Error('Not found')),
        text: () => Promise.reject(new Error('Not found')),
      } as unknown as Response);
    }

    const responseBody =
      typeof mockResponse.data === 'string' ? mockResponse.data : JSON.stringify(mockResponse.data);

    return Promise.resolve({
      ok: mockResponse.status >= 200 && mockResponse.status < 300,
      status: mockResponse.status,
      statusText: mockResponse.status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(mockResponse.data),
      text: () => Promise.resolve(responseBody),
    } as unknown as Response);
  });
