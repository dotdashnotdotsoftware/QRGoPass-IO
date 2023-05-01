const mockGetErr = jest.fn();
const mockGetData = jest.fn();
const mockGet = jest.fn();
const mockPut = jest.fn();
jest.mock('aws-sdk', () => {
	class mockDocumentClient {
        async get(params, callback) {
			mockGet(params, callback);
            return;
        }
        async put(params) {
			mockPut(params);
            return;
        }
    }
    return {
        DynamoDB: {
            DocumentClient: mockDocumentClient,
    }};
});

function getValidEvent() {
	return {
		UUID: "289d256c-4088-4369-ada0-d00e710b768e"
	}
}

function getValidStoredEvent() {
	return {
		Item: {
			UUID: "289d256c-4088-4369-ada0-d00e710b768e",
			V: "1",
			Data: "Hello World"
		}
	}
}

describe('handler tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		mockGetErr.mockReturnValue(undefined);
		mockGetData.mockReturnValue(getValidStoredEvent());
		mockGet.mockImplementation((params, callback) => callback(mockGetErr(), mockGetData()));
	});

	it('returns no data when an error occurs', () => {
		const handler = require('./index.js').handler;

		const mockCallback = jest.fn();

		mockGetErr.mockReturnValue("A test error");
		mockGetData.mockReturnValue(null);

		const event = getValidEvent();
		handler(event, null, mockCallback);

		expect(mockCallback).toHaveBeenCalledTimes(1);
		expect(mockCallback).toHaveBeenCalledWith(null, null);
	});

	it.each([
		null,
		undefined,
		{}
	])('returns no data when no record is found', (testCase) => {
		const handler = require('./index.js').handler;

		const mockCallback = jest.fn();

		mockGetData.mockReturnValue(testCase);

		const event = getValidEvent();
		handler(event, null, mockCallback);

		expect(mockCallback).toHaveBeenCalledTimes(1);
		expect(mockCallback).toHaveBeenCalledWith(null, null);
	});

	it('returns the data it found', () => {
		const handler = require('./index.js').handler;

		const mockCallback = jest.fn();

		const storedEvent = getValidStoredEvent();
		mockGetData.mockReturnValue(storedEvent);

		const event = getValidEvent();
		handler(event, null, mockCallback);

		expect(mockCallback).toHaveBeenCalledTimes(1);
		expect(mockCallback).toHaveBeenCalledWith(null, {
			UUID: storedEvent.Item.UUID,
			V: storedEvent.Item.V,
            Data: storedEvent.Item.Data
		});
	});

	// TODO: refactor this
	it('"deletes" the data it found', () => {
		const handler = require('./index.js').handler;

		const mockCallback = jest.fn();

		const storedEvent = getValidStoredEvent();
		mockGetData.mockReturnValue(storedEvent);

		const event = getValidEvent();
		handler(event, null, mockCallback);

		expect(mockPut).toHaveBeenCalledTimes(1);
		expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
			Item: expect.objectContaining({
				UUID: storedEvent.Item.UUID
			})
		}, expect.anything()));
	});
});