import { CreateSchoolInput } from '../schemas/school.schema';
import { SchoolRepository} from '../repositories/school.repository';

export class SchoolService {
  constructor(private readonly schoolRepository = new SchoolRepository()) {}

  async createSchool(data: CreateSchoolInput) {
    const [nameSchool] = await Promise.all([
      this.schoolRepository.findByName(data.school_name)
    ]);

    if (nameSchool) {
      throw new Error('Escola já cadastrada');
    }

    return this.schoolRepository.createWithProfile(data);
  }

  async readSchool(id: String) {
    const school = await this.schoolRepository.findById(id);
    if (!school) {
      throw new Error('Escola não encontrada');
    }

    return school;
  }
}

export const schoolService = new SchoolService;
