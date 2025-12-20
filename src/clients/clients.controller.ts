import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import {
  ClientResponseDto,
  PaginatedClientsResponseDto,
} from './dto/client-response.dto';
import { ResponseUtil } from '../common/utils/response.utils';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Profile } from '../user/entities/profile.entity';
import type { Request } from 'express';
import { BodyLimit } from '../common/decorators/body-limit.decorator';
import { BodyLimitInterceptor } from '../common/interceptors/body-limit.interceptor';
import { PaginationQueryWithBranchDto } from '../common/dtos/pagination.dtos';
import { Pagination } from '../common/decorators/pagination.decorator';

@Controller('clients')
@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }


  @Post()
  @Permissions('clients.add')
  @BodyLimit('20mb')
  @UseInterceptors(BodyLimitInterceptor)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Client already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions for cross-branch operations',
  })
  @ApiResponse({ status: 413, description: 'Payload too large (exceeds 5MB)' })
  async createClient(
    @Body() createClientDto: CreateClientDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;

    // Determine which branchID to use
    let branchID: number;

    if (createClientDto.branchID !== undefined) {
      // User specified a branchID - check if they have branch management permissions
      const userPermissions = user.auth.roles
        .flatMap((userRole) => userRole.role.permissions)
        .map((rolePerm) => rolePerm.permission.name);

      const hasBranchPermissions = userPermissions.some(
        (perm) =>
          perm === 'branch.view-branch' || perm === 'branch.manage-branch',
      );

      if (!hasBranchPermissions) {
        throw new ForbiddenException(
          'Insufficient permissions to create clients in other branches',
        );
      }

      branchID = createClientDto.branchID;
    } else {
      // No branchID specified, use user's branch
      branchID = user.branchID;
    }

    const client = await this.clientsService.createClient(
      createClientDto,
      branchID,
    );
    return ResponseUtil.success('Client created successfully', client);
  }

  @Get()
  @Permissions('clients.read')
  @ApiOperation({ summary: 'Get all clients with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Clients retrieved successfully',
    type: PaginatedClientsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions for cross-branch operations',
  })
  @Pagination()
  async getAllClients(
    @Query() paginationQuery: PaginationQueryWithBranchDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;

    // If branchId is specified in query, check permissions
    if (
      paginationQuery.branchId !== undefined &&
      paginationQuery.branchId !== user.branchID
    ) {
      const userPermissions = user.auth.roles
        .flatMap((userRole) => userRole.role.permissions)
        .map((rolePerm) => rolePerm.permission.name);

      const hasBranchPermissions = userPermissions.some(
        (perm) =>
          perm === 'branch.view-branch' || perm === 'branch.manage-branch',
      );

      if (!hasBranchPermissions) {
        throw new ForbiddenException(
          'Insufficient permissions to view clients from other branches',
        );
      }
    } else if (paginationQuery.branchId === undefined) {
      // No branchId specified, filter by user's branch
      paginationQuery.branchId = user.branchID;
    }

    const result = await this.clientsService.getAllClients(paginationQuery);
    return ResponseUtil.success('Clients retrieved successfully', result);
  }

  @Get(':id')
  @Permissions('clients.read')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiParam({ name: 'id', description: 'Client National ID (NIN)' })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClientById(@Param('id') id: string) {
    const client = await this.clientsService.getClientById(id);
    return ResponseUtil.success('Client retrieved successfully', client);
  }

  @Put(':id')
  @Permissions('clients.update')
  @ApiOperation({ summary: 'Update client information' })
  @ApiParam({ name: 'id', description: 'Client National ID (NIN)' })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateClient(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientsService.updateClient(id, updateClientDto);
    return ResponseUtil.success('Client updated successfully', client);
  }

  @Delete(':id')
  @Permissions('clients.delete')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiParam({ name: 'id', description: 'Client National ID (NIN)' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteClient(@Param('id') id: string) {
    const result = await this.clientsService.deleteClient(id);
    return ResponseUtil.success(result.message);
  }

  @Post(':id/documents')
  @Permissions('clients.documents.add')
  @ApiOperation({ summary: 'Add document to client' })
  @ApiParam({ name: 'id', description: 'Client National ID (NIN)' })
  @ApiResponse({ status: 201, description: 'Document added successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addDocument(
    @Param('id') id: string,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    const document = await this.clientsService.addDocument(
      id,
      createDocumentDto,
    );
    return ResponseUtil.success('Document added successfully', document);
  }

  @Post(':id/addresses')
  @Permissions('clients.addresses.add')
  @ApiOperation({ summary: 'Add address to client' })
  @ApiParam({ name: 'id', description: 'Client National ID (NIN)' })
  @ApiResponse({ status: 201, description: 'Address added successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addAddress(
    @Param('id') id: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const address = await this.clientsService.addAddress(id, createAddressDto);
    return ResponseUtil.success('Address added successfully', address);
  }

  @Post(':id/contacts')
  @Permissions('clients.contacts.create')
  @ApiOperation({ summary: 'Add contact to client' })
  @ApiParam({ name: 'id', description: 'Client National ID (NIN)' })
  @ApiResponse({ status: 201, description: 'Contact added successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addContact(
    @Param('id') id: string,
    @Body() createContactDto: CreateContactDto,
  ) {
    const contact = await this.clientsService.addContact(id, createContactDto);
    return ResponseUtil.success('Contact added successfully', contact);
  }
}
