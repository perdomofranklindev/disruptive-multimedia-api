import { PRISMA } from '../src/shared/prisma-singleton';
import { PermissionType, RoleType } from '../src/shared/types/generated';

const main = async () => {
	// Create the roles.
	const creationRolesResponse = await PRISMA.role.createMany({
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
			{
				name: RoleType.CREATOR,
				permissions: [
					PermissionType.CREATE,
					PermissionType.READ,
					PermissionType.UPDATE
				]
			},
			{ name: RoleType.READER, permissions: [PermissionType.READ] }
		]
	});

	console.log('Roles created: ', JSON.stringify(creationRolesResponse));
};

main();
