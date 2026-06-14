import { HealthController } from './health.controller';

function makeMockDataSource(isInitialized: boolean) {
  return {
    isInitialized,
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };
}

describe('HealthController', () => {
  // ─── Healthy state ─────────────────────────────────────────────

  describe('when database is initialized', () => {
    let controller: HealthController;
    let mockDataSource: ReturnType<typeof makeMockDataSource>;

    beforeEach(() => {
      mockDataSource = makeMockDataSource(true);
      controller = new HealthController(mockDataSource as any);
    });

    it('returns status "healthy"', async () => {
      const result = await controller.check();
      expect(result.status).toBe('healthy');
    });

    it('reports database.connected = true', async () => {
      const result = await controller.check();
      expect(result.database.connected).toBe(true);
    });

    it('returns a non-negative database latency', async () => {
      const result = await controller.check();
      expect(result.database.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('executes a SELECT 1 query to measure latency', async () => {
      await controller.check();
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('includes a valid ISO timestamp', async () => {
      const result = await controller.check();
      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('includes process uptime as a positive number', async () => {
      const result = await controller.check();
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThan(0);
    });
  });

  // ─── Unhealthy state ───────────────────────────────────────────

  describe('when database is not initialized', () => {
    let controller: HealthController;
    let mockDataSource: ReturnType<typeof makeMockDataSource>;

    beforeEach(() => {
      mockDataSource = makeMockDataSource(false);
      controller = new HealthController(mockDataSource as any);
    });

    it('returns status "unhealthy"', async () => {
      const result = await controller.check();
      expect(result.status).toBe('unhealthy');
    });

    it('reports database.connected = false', async () => {
      const result = await controller.check();
      expect(result.database.connected).toBe(false);
    });

    it('returns latencyMs = -1 (no query run)', async () => {
      const result = await controller.check();
      expect(result.database.latencyMs).toBe(-1);
    });

    it('does not attempt to query the database', async () => {
      await controller.check();
      expect(mockDataSource.query).not.toHaveBeenCalled();
    });

    it('still includes timestamp and uptime fields', async () => {
      const result = await controller.check();
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });
});
