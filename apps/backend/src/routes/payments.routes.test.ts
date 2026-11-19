import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentError } from '../errors/payment.error';
import { paymentService } from '../services/payment.service';
import paymentsRouter from './payments.routes';

vi.mock('../services/payment.service', () => ({
  paymentService: {
    findAvailableCatalogItems: vi.fn(),
    createRecharge: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/payments', paymentsRouter);

const findCatalogMock = vi.mocked(paymentService.findAvailableCatalogItems);
const createRechargeMock = vi.mocked(paymentService.createRecharge);
const TEST_SECRET = 'payments-test-secret';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const CATALOG_ITEM_ID = '22222222-2222-4222-8222-222222222222';

describe('Payments routes', () => {
  let token: string;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('JWT_SECRET', TEST_SECRET);
    token = jwt.sign({}, TEST_SECRET, {
      subject: USER_ID,
      expiresIn: '1h',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exige autenticação para consultar o catálogo', async () => {
    const response = await request(app).get('/payments/catalog');

    expect(response.status).toBe(401);
    expect(findCatalogMock).not.toHaveBeenCalled();
  });

  it('normaliza o telefone e cria uma recarga', async () => {
    const result = {
      id: 'payment-1',
      amountBRL: 20,
      coinsSpent: 200,
      status: 'COMPLETED' as const,
      externalId: 'provider-1',
    };
    createRechargeMock.mockResolvedValue(result);

    const response = await request(app)
      .post('/payments/recharge')
      .set('Authorization', `Bearer ${token}`)
      .send({
        catalogItemId: CATALOG_ITEM_ID,
        phoneNumber: '(11) 91234-5678',
      });

    expect(response.status).toBe(201);
    expect(createRechargeMock).toHaveBeenCalledExactlyOnceWith(
      USER_ID,
      {
        catalogItemId: CATALOG_ITEM_ID,
        phoneNumber: '11912345678',
      },
    );
  });

  it('rejeita campos extras e telefone inválido antes do service', async () => {
    const response = await request(app)
      .post('/payments/recharge')
      .set('Authorization', `Bearer ${token}`)
      .send({
        catalogItemId: CATALOG_ITEM_ID,
        phoneNumber: '1191234567',
        coinsSpent: 1,
      });

    expect(response.status).toBe(400);
    expect(createRechargeMock).not.toHaveBeenCalled();
  });

  it('mapeia falha do provedor para HTTP 502', async () => {
    createRechargeMock.mockRejectedValue(
      new PaymentError(
        'PROVIDER_FAILURE',
        'Não foi possível solicitar a recarga ao provedor',
      ),
    );

    const response = await request(app)
      .post('/payments/recharge')
      .set('Authorization', `Bearer ${token}`)
      .send({
        catalogItemId: CATALOG_ITEM_ID,
        phoneNumber: '11912345678',
      });

    expect(response.status).toBe(502);
  });
});
