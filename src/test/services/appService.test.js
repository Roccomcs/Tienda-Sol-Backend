import { jest } from "@jest/globals";
import AppService from '../../services/appService.js';

describe('AppService', () => {
    let appService;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();
        appService = new AppService();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('healthCheck debería responder 200 con status ok', async () => {
        await appService.healthCheck({}, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }));
    });
});
