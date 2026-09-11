import { HealthRepository } from '../repositories/health.repository';

export class HealthService {
	constructor(private readonly healthRepository = new HealthRepository()) {}

	check() {
		return this.healthRepository.checkConnection();
	}
}

export const healthService = new HealthService();