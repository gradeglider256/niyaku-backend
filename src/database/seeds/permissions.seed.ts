import { DataSource } from 'typeorm';
import { Permission } from '../../user/entities/permission.entity';

export class CreatePermissionsSeed {
  async run(dataSource: DataSource): Promise<void> {
    const manager = dataSource.manager;

    const permissions = [
      { name: 'employee.add', description: 'Can add new employees' },
      { name: 'employee.manage', description: 'Can manage existing employees' },
      { name: 'user.read', description: 'Can read users' },
      { name: 'branch.read', description: 'Can read branches' },
      { name: 'role.read', description: 'Can read roles' },
      { name: 'branch.manage', description: 'Can manage branches' },
      { name: 'role.manage', description: 'Can manage roles' },
      { name: 'branch.add', description: 'Can add new branches' },
      { name: 'role.add', description: 'Can add new roles' },

      // Client permissions
      { name: 'clients.add', description: 'Can create new clients' },
      { name: 'clients.read', description: 'Can read clients' },
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
        description: 'Can read documents of clients',
      },
      {
        name: 'clients.addresses.read',
        description: 'Can read addresses of clients',
      },
      {
        name: 'clients.contacts.read',
        description: 'Can read contacts of clients',
      },

      // loan and disbursement
      {
        name: 'loan.add',
        description: 'Can add a new loan object',
      },
      {
        name: 'loan.read',
        description: 'Can read loans and details of the loan',
      },
      {
        name: 'loan.update',
        description: 'update loan details',
      },
      {
        name: 'loan.delete',
        description: 'delete a loan.',
      },
      {
        name: 'loan.approve',
        description: 'can approve a loan',
      },
      {
        name: 'loan.reject',
        description: 'can reject a loan',
      },

      // disbursement
      {
        name: 'disbursement.add',
        description: 'Can add a new disbursement object',
      },
      {
        name: 'disbursement.read',
        description: 'Can read disbursements and details of the disbursement',
      },
      {
        name: 'disbursement.update',
        description: 'update disbursement details',
      },
      {
        name: 'disbursement.delete',
        description: 'delete a disbursement.',
      },

      // Repayment
      {
        name: 'repayment.read',
        description: 'delete a repayments.',
      },
      {
        name: 'repayment.record',
        description: 'record a repayments.',
      },

      // Assessment permissions.
      {
        name: 'assessment.read',
        description: 'this allows the user to view a clients assessments,',
      },
      {
        name: 'assessment.perform',
        description:
          'this allows the user to perform an assessment on a clients',
      },
      {
        name: 'assessment.manage',
        description:
          'allows a user to manage the assessment data such as add clients document, salary history and other relevant details.',
      },

      //System configuration
      {
        name: 'sys-config.read',
        description: 'allows users to read the current system configuration',
      },
      {
        name: 'sys-config.update',
        description: 'allows user to update the system configuration',
      },
      {
        name: 'sys-config.manage',
        description:
          'for managing different aspects of the system configuration',
      },
      {
        name: 'reports.read',
        description: 'allows users to access dashboard data.',
      },

      //Activity log permissions
      {
        name: 'activity_logs.read',
        description: 'allows users to view activity logs',
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
