import { DataSource } from 'typeorm';
import { Permission } from '../../user/entities/permission.entity';

export class CreatePermissionsSeed {
  async run(dataSource: DataSource): Promise<void> {
    const manager = dataSource.manager;

    const permissions = [
      { name: 'employee.add', description: 'Can add new employees' },
      { name: 'employee.manage', description: 'Can manage existing employees' },
      { name: 'user.read', description: 'Can view users' },
      { name: 'branch.read', description: 'Can view branches' },
      { name: 'role.read', description: 'Can view roles' },
      { name: 'branch.manage', description: 'Can manage branches' },
      { name: 'role.manage', description: 'Can manage roles' },
      { name: 'branch.add', description: 'Can add new branches' },
      { name: 'role.add', description: 'Can add new roles' },

      // Client permissions
      { name: 'clients.add', description: 'Can create new clients' },
      { name: 'clients.read', description: 'Can view clients' },
      { name: 'clients.update', description: 'Can update client information' },
      { name: 'clients.delete', description: 'Can delete clients' },
      {
        name: 'clients.documents.add',
        description: 'Can add documents to clients',
      },
      {
        name: 'clients.addresses.add',
        description: 'Can add addresses to clients',
      },
      {
        name: 'clients.contacts.create',
        description: 'Can add contacts to clients',
      },
      {
        name: 'clients.documents.read',
        description: 'Can view documents of clients',
      },
      {
        name: 'clients.addresses.read',
        description: 'Can view addresses of clients',
      },
      {
        name: 'clients.contacts.read',
        description: 'Can view contacts of clients',
      },
    ];

    for (const perm of permissions) {
      const existing = await manager.findOne(Permission, {
        where: { name: perm.name },
      });
      if (!existing) {
        const newPerm = manager.create(Permission, perm);
        await manager.save(Permission, newPerm);
        console.log(`Permission ${perm.name} created`);
      } else {
        console.log(`Permission ${perm.name} already exists`);
      }
    }
  }
}
