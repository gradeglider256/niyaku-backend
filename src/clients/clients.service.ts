/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Client,
  IndividualClient,
  BusinessClient,
  ClientType,
} from './entities/client.entity';
import { ClientAddress } from './entities/client.address.entity';
import { ClientContact } from './entities/client.contact.entity';
import { ClientDocument } from './entities/client.documents.entity';
import { BusinessRepresentative } from './entities/business-representative.entity';
import { Branch } from '../user/entities/branch.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentsService } from '../documents/documents.service';
import { PaginationQueryWithBranchDto } from 'src/common/dtos/pagination.dtos';
import { EmploymentHistory } from '../credit_assessment/entities/employment.entity';
import { SalaryHistory } from '../credit_assessment/entities/salary.entity';
import { CompanyEarnings } from '../credit_assessment/entities/company-earnings.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(ClientAddress)
    private addressRepository: Repository<ClientAddress>,
    @InjectRepository(ClientContact)
    private contactRepository: Repository<ClientContact>,
    @InjectRepository(ClientDocument)
    private documentRepository: Repository<ClientDocument>,
    @InjectRepository(BusinessRepresentative)
    private representativeRepository: Repository<BusinessRepresentative>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private dataSource: DataSource,
    private documentsService: DocumentsService,
  ) {}

  async createClient(createClientDto: CreateClientDto, branchID: number) {
    // Check if client already exists
    // For individual check NIN, for business check Registration Number
    const qb = this.clientRepository.createQueryBuilder('client');

    if (createClientDto.type === ClientType.INDIVIDUAL && createClientDto.nin) {
      qb.where('client.nin = :nin', { nin: createClientDto.nin });
    } else if (
      createClientDto.type === ClientType.BUSINESS &&
      createClientDto.registrationNumber
    ) {
      qb.where('client.registrationNumber = :regNum', {
        regNum: createClientDto.registrationNumber,
      });
    } else {
      // Should be caught by DTO validation but extra safety
    }

    const existingClient = await qb.getOne();

    if (existingClient) {
      throw new ConflictException(
        createClientDto.type === ClientType.INDIVIDUAL
          ? 'Client with this NIN already exists'
          : 'Client with this Registration Number already exists',
      );
    }

    // Validate branch exists
    const branch = await this.branchRepository.findOne({
      where: { id: branchID },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchID} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let client: Client;

      if (createClientDto.type === ClientType.INDIVIDUAL) {
        client = new IndividualClient();
        (client as IndividualClient).firstName = createClientDto.firstName!;
        (client as IndividualClient).lastName = createClientDto.lastName!;
        (client as IndividualClient).middleName =
          createClientDto.middleName ?? '';
        (client as IndividualClient).nin = createClientDto.nin!;
      } else {
        client = new BusinessClient();
        (client as BusinessClient).businessName = createClientDto.businessName!;
        (client as BusinessClient).registrationNumber =
          createClientDto.registrationNumber!;
        (client as BusinessClient).businessType = createClientDto.businessType!;
      }

      client.type = createClientDto.type;
      client.branchID = branchID;

      await queryRunner.manager.save(client);

      // Create addresses
      if (createClientDto.addresses) {
        const addresses = createClientDto.addresses.map((addressDto) =>
          this.addressRepository.create({
            ...addressDto,
            clientID: client.id,
          }),
        );
        await queryRunner.manager.save(addresses);
      }

      // Create contacts
      if (createClientDto.contacts) {
        const contacts = createClientDto.contacts.map((contactDto) =>
          this.contactRepository.create({
            ...contactDto,
            clientID: client.id,
          }),
        );
        await queryRunner.manager.save(contacts);
      }

      // Create Representatives (Business Only)
      if (
        createClientDto.type === ClientType.BUSINESS &&
        createClientDto.representatives
      ) {
        const representatives = createClientDto.representatives.map((rep) =>
          this.representativeRepository.create({
            ...rep,
            clientId: client.id,
          }),
        );
        await queryRunner.manager.save(representatives);
      }

      // Upload Documents (if provided)
      if (createClientDto.documents && createClientDto.documents.length > 0) {
        for (const docDto of createClientDto.documents) {
          // Save the file using DocumentsService
          const document = await this.documentsService.saveDocument(
            docDto.fileContent,
            docDto.fileName,
            docDto.mimeType,
          );

          // Create ClientDocument linking to the generic Document
          const clientDocument = this.documentRepository.create({
            clientID: client.id,
            documentId: document.id,
            documentType: docDto.documentType,
          });
          await queryRunner.manager.save(clientDocument);
        }
      }

      // Create Employment History with Salary History for Individual clients
      if (
        createClientDto.type === ClientType.INDIVIDUAL &&
        createClientDto.employmentHistory
      ) {
        const employmentDtos = createClientDto.employmentHistory;

        console.log(employmentDtos);

        // Create Employment History records
        if (employmentDtos && employmentDtos.length > 0) {
          // Create all employment records
          const employmentRecords = employmentDtos.map((employmentDto) => {
            return queryRunner.manager.create(EmploymentHistory, {
              clientID: client.id,
              employerName: employmentDto.employerName,
              industry: employmentDto.industry,
              position: employmentDto.position,
              contractType: employmentDto.contractType,
              contractDuration: employmentDto.contractDuration,
              startDate: employmentDto.startDate,
              endDate: employmentDto.endDate,
              status: employmentDto.status,
              branchID: branchID,
            });
          });

          // Batch save all employment records
          const savedEmployments = await queryRunner.manager.save(
            EmploymentHistory,
            employmentRecords,
          );

          // Create all salary records for all employments
          const allSalaryRecords: any[] = [];

          savedEmployments.forEach((savedEmployment, index) => {
            const employmentDto = employmentDtos[index];

            if (employmentDto.salaries && employmentDto.salaries.length > 0) {
              const salaryRecords = employmentDto.salaries.map((salaryDto) => {
                return queryRunner.manager.create(SalaryHistory, {
                  baseSalary: salaryDto.baseSalary,
                  allowances: salaryDto.allowances || 0,
                  deductions: salaryDto.deductions || 0,
                  year: salaryDto.year,
                  employmentHistoryID: savedEmployment.id,
                  isVerified: false,
                  isCurrent: true,
                });
              });

              allSalaryRecords.push(...salaryRecords);
            }
          });

          // Batch save all salary records
          if (allSalaryRecords.length > 0) {
            await queryRunner.manager.save(SalaryHistory, allSalaryRecords);
          }
        }
      }

      // Create Company Earnings for Business clients
      if (
        createClientDto.type === ClientType.BUSINESS &&
        createClientDto.companyEarnings &&
        createClientDto.companyEarnings.length > 0
      ) {
        const earningsRecords = createClientDto.companyEarnings.map(
          (earningsDto) => {
            return queryRunner.manager.create(CompanyEarnings, {
              clientID: client.id,
              monthlyEarning: earningsDto.monthlyEarning,
              financialYear: earningsDto.financialYear,
              isAudited: earningsDto.isAudited || false,
            });
          },
        );

        await queryRunner.manager.save(CompanyEarnings, earningsRecords);
      }

      await queryRunner.commitTransaction();

      return this.getClientById(client.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getClientById(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    const relations = [
      'addresses',
      'contacts',
      'documents',
      'branch',
      'assessmentReports',
      'financials',
      'employmentHistory',
      'companyEarnings',
    ];

    if (client.type === ClientType.BUSINESS) {
      relations.push('representatives', 'companyEarnings');
    } else if (client.type === ClientType.INDIVIDUAL) {
      relations.push('employmentHistory', 'employmentHistory.salaryHistory');
    }

    const fullClient = await this.clientRepository.findOne({
      where: { id },
      relations,
    });

    if (!fullClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return fullClient;
  }

  async updateClient(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.getClientById(id);

    if (client.type === ClientType.INDIVIDUAL) {
      const indClient = client as IndividualClient;
      if (updateClientDto.firstName)
        indClient.firstName = updateClientDto.firstName;
      if (updateClientDto.lastName)
        indClient.lastName = updateClientDto.lastName;
      if (updateClientDto.middleName !== undefined)
        indClient.middleName = updateClientDto.middleName;
    }

    await this.clientRepository.save(client);

    return this.getClientById(id);
  }

  async deleteClient(id: string) {
    const client = await this.getClientById(id);
    await this.clientRepository.remove(client);
    return { message: 'Client deleted successfully' };
  }

  async getAllClients(paginationQuery: PaginationQueryWithBranchDto) {
    const { page = 1, pageSize = 20, branchId } = paginationQuery;
    const skip = (page - 1) * pageSize;

    const query = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.addresses', 'addresses')
      .leftJoinAndSelect('client.contacts', 'contacts')
      .leftJoinAndSelect('client.documents', 'documents')
      .leftJoinAndSelect('client.branch', 'branch')
      .leftJoinAndSelect('client.representatives', 'representatives');

    if (branchId) {
      query.where('client.branchID = :branchId', { branchId });
    }

    const [data, total] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async addDocument(clientId: string, createDocumentDto: CreateDocumentDto) {
    const client = await this.getClientById(clientId);

    const document = this.documentRepository.create({
      ...createDocumentDto,
      clientID: client.id,
    });

    await this.documentRepository.save(document);
    return document;
  }

  async addAddress(clientId: string, createAddressDto: CreateAddressDto) {
    const client = await this.getClientById(clientId);

    const address = this.addressRepository.create({
      ...createAddressDto,
      clientID: client.id,
    });

    await this.addressRepository.save(address);
    return address;
  }

  async addContact(clientId: string, createContactDto: CreateContactDto) {
    const client = await this.getClientById(clientId);

    const contact = this.contactRepository.create({
      ...createContactDto,
      clientID: client.id,
    });

    await this.contactRepository.save(contact);
    return contact;
  }
}
