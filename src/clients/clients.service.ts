import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Client } from './entities/client.entity';
import { ClientAddress } from './entities/client.address.entity';
import { ClientContact } from './entities/client.contact.entity';
import { ClientEmployment } from './entities/client.employment.entity';
import { ClientDocument } from './entities/client.documents.entity';
import { Branch } from '../user/entities/branch.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(ClientAddress)
        private addressRepository: Repository<ClientAddress>,
        @InjectRepository(ClientContact)
        private contactRepository: Repository<ClientContact>,
        @InjectRepository(ClientEmployment)
        private employmentRepository: Repository<ClientEmployment>,
        @InjectRepository(ClientDocument)
        private documentRepository: Repository<ClientDocument>,
        @InjectRepository(Branch)
        private branchRepository: Repository<Branch>,
        private dataSource: DataSource,
    ) { }

    async createClient(createClientDto: CreateClientDto, branchID: number) {
        // Check if client already exists
        const existingClient = await this.clientRepository.findOne({
            where: { id: createClientDto.id },
        });

        if (existingClient) {
            throw new ConflictException('Client with this NIN already exists');
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
            // Create client
            const client = this.clientRepository.create({
                id: createClientDto.id,
                firstName: createClientDto.firstName,
                lastName: createClientDto.lastName,
                middleName: createClientDto.middleName,
                branchID,
            });
            await queryRunner.manager.save(client);

            // Create addresses
            const addresses = createClientDto.addresses.map((addressDto) =>
                this.addressRepository.create({
                    ...addressDto,
                    clientID: client.id,
                }),
            );
            await queryRunner.manager.save(addresses);

            // Create contacts
            const contacts = createClientDto.contacts.map((contactDto) =>
                this.contactRepository.create({
                    ...contactDto,
                    clientID: client.id,
                }),
            );
            await queryRunner.manager.save(contacts);

            // Create employment
            const employment = this.employmentRepository.create({
                ...createClientDto.employment,
                clientID: client.id,
            });
            await queryRunner.manager.save(employment);

            await queryRunner.commitTransaction();

            return this.getClientById(client.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getClientById(id: string) {
        const client = await this.clientRepository.findOne({
            where: { id },
            relations: ['addresses', 'contacts', 'employments', 'documents', 'branch'],
        });

        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return client;
    }

    async updateClient(id: string, updateClientDto: UpdateClientDto) {
        const client = await this.getClientById(id);

        if (updateClientDto.firstName) client.firstName = updateClientDto.firstName;
        if (updateClientDto.lastName) client.lastName = updateClientDto.lastName;
        if (updateClientDto.middleName !== undefined) client.middleName = updateClientDto.middleName;

        await this.clientRepository.save(client);

        return this.getClientById(id);
    }

    async deleteClient(id: string) {
        const client = await this.getClientById(id);
        await this.clientRepository.remove(client);
        return { message: 'Client deleted successfully' };
    }

    async getAllClients(paginationQuery: PaginationQueryDto) {
        const { page = 1, pageSize = 20, branchId } = paginationQuery;
        const skip = (page - 1) * pageSize;

        const query = this.clientRepository
            .createQueryBuilder('client')
            .leftJoinAndSelect('client.addresses', 'addresses')
            .leftJoinAndSelect('client.contacts', 'contacts')
            .leftJoinAndSelect('client.employments', 'employments')
            .leftJoinAndSelect('client.documents', 'documents')
            .leftJoinAndSelect('client.branch', 'branch');

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
