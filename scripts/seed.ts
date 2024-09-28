import { PRISMA } from '../src/shared/prisma-singleton';
import { PermissionType, RoleType } from '../src/shared/types/generated';

const main = async () => {
	// Create the roles.
	await PRISMA.role.createMany({
		data: [
			{
				name: RoleType.ADMINISTRATOR,
				permissions: [
					PermissionType.CREATE,
					PermissionType.READ,
					PermissionType.UPDATE,
					PermissionType.DELETE
				]
			},
			{ name: 'CREATOR', permissions: [] },
			{ name: 'READER', permissions: [] }
		]
	});
};

main();
