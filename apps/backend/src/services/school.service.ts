import { CreateSchoolInput, UpdateSchoolInput } from '../schemas/school.schema';
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

  async readSchool(id: string) {
    const school = await this.schoolRepository.findById(id);
    if (!school) {
      throw new Error('Escola não encontrada');
    }

    return school;
  }

  async updateSchool(id: string, data: UpdateSchoolInput) {
    const school = await this.schoolRepository.findById(id);
    if (!school) {
      throw new Error('Escola não encontrada');
    }

    if (data.school_name) {
      const schoolWithSameName = await this.schoolRepository.findByName(data.school_name);
      if (schoolWithSameName && schoolWithSameName.id !== id) {
        throw new Error('Escola já cadastrada');
      }
    }

    return this.schoolRepository.update(id, data);
  }

  async deleteSchool(id: string) {
    const school = await this.schoolRepository.findById(id);
    if (!school) {
      throw new Error('Escola não encontrada');
    }

    return this.schoolRepository.delete(id);
  }
}

export const schoolService = new SchoolService;
