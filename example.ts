import { PRISMA } from './src/shared/prisma-instance';
import { PermissionType } from '@prisma/client';
import { Role } from './src/modules/role/role-types';

const main = async () => {
	console.log(
		'Admin role created: ',
		await PRISMA.role.create({
			data: {
				name: Role.Admin,
				permissions: [
					PermissionType.CREATE,
					PermissionType.READ,
					PermissionType.UPDATE,
					PermissionType.DELETE
				]
			}
		})
	);
	console.log(
		'Admin role created: ',
		await PRISMA.role.create({
			data: {
				name: Role.Admin,
				permissions: [
					PermissionType.CREATE,
					PermissionType.READ,
					PermissionType.UPDATE,
					PermissionType.DELETE
				]
			}
		})
	);
};

main();
