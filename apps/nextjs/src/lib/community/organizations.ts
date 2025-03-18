/**
 * This file contains functions for interacting with organizations in the database.
 */
import prisma from "@saasfly/db";
import type { Organization, OrganizationMember } from "@prisma/client";

export type OrganizationWithMemberCount = Organization & {
  memberCount: number;
};

/**
 * Get organizations for a specific user
 * @param userId The ID of the user
 * @returns Organizations the user is a member of
 */
export async function getUserOrganizations(userId: string): Promise<OrganizationWithMemberCount[]> {
  // Get all organizations where the user is a member
  const organizationMembers = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
  });

  // For each organization, get the member count
  const organizations = await Promise.all(
    organizationMembers.map(async (member: { organization: Organization, organizationId: string }) => {
      const memberCount = await prisma.organizationMember.count({
        where: { organizationId: member.organizationId },
      });

      return {
        ...member.organization,
        memberCount,
      };
    })
  );

  return organizations;
}

/**
 * Get an organization by its ID
 * @param id The ID of the organization
 * @returns The organization or null if not found
 */
export async function getOrganizationById(id: string): Promise<OrganizationWithMemberCount | null> {
  const organization = await prisma.organization.findUnique({
    where: { id },
  });

  if (!organization) return null;

  const memberCount = await prisma.organizationMember.count({
    where: { organizationId: id },
  });

  return {
    ...organization,
    memberCount,
  };
}

/**
 * Get an organization by its slug
 * @param slug The slug of the organization
 * @returns The organization or null if not found
 */
export async function getOrganizationBySlug(slug: string): Promise<OrganizationWithMemberCount | null> {
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) return null;

  const memberCount = await prisma.organizationMember.count({
    where: { organizationId: organization.id },
  });

  return {
    ...organization,
    memberCount,
  };
}

/**
 * Create a new organization
 * @param data The organization data
 * @param creatorId The ID of the user creating the organization
 * @returns The created organization
 */
export async function createOrganization(
  data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>,
  creatorId: string
): Promise<OrganizationWithMemberCount> {
  // Use a transaction to create both the organization and the first member (creator)
  return await prisma.$transaction(async (tx: typeof prisma) => {
    // Create the organization
    const organization = await tx.organization.create({
      data,
    });

    // Add the creator as the first member with admin role
    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: creatorId,
        role: "admin",
        isAdmin: true,
      },
    });

    // Return the organization with member count (which is 1)
    return {
      ...organization,
      memberCount: 1,
    };
  });
}

/**
 * Update an organization
 * @param id The ID of the organization
 * @param data The updated organization data
 * @returns The updated organization
 */
export async function updateOrganization(
  id: string, 
  data: Partial<Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<OrganizationWithMemberCount | null> {
  // Verify organization exists
  const exists = await prisma.organization.findUnique({
    where: { id },
  });

  if (!exists) return null;

  // Update the organization
  const organization = await prisma.organization.update({
    where: { id },
    data,
  });

  // Get member count
  const memberCount = await prisma.organizationMember.count({
    where: { organizationId: id },
  });

  return {
    ...organization,
    memberCount,
  };
}

/**
 * Delete an organization
 * @param id The ID of the organization
 * @returns Whether the deletion was successful
 */
export async function deleteOrganization(id: string): Promise<boolean> {
  try {
    // Check if organization exists
    const exists = await prisma.organization.findUnique({
      where: { id },
    });

    if (!exists) return false;

    // Delete the organization (members will be deleted through cascade)
    await prisma.organization.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting organization:", error);
    return false;
  }
}

/**
 * Get all organizations
 * @returns All organizations
 */
export async function getAllOrganizations(): Promise<OrganizationWithMemberCount[]> {
  // Get all organizations
  const organizations = await prisma.organization.findMany();

  // For each organization, get the member count
  const organizationsWithMemberCount = await Promise.all(
    organizations.map(async (org: Organization) => {
      const memberCount = await prisma.organizationMember.count({
        where: { organizationId: org.id },
      });

      return {
        ...org,
        memberCount,
      };
    })
  );

  return organizationsWithMemberCount;
}

/**
 * Add a user to an organization
 * @param organizationId The ID of the organization
 * @param userId The ID of the user
 * @param role The role of the user in the organization
 * @param isAdmin Whether the user is an admin
 * @returns The created organization member
 */
export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: string = "member",
  isAdmin: boolean = false
): Promise<OrganizationMember> {
  return await prisma.organizationMember.create({
    data: {
      organizationId,
      userId,
      role,
      isAdmin,
    },
  });
}

/**
 * Remove a user from an organization
 * @param organizationId The ID of the organization
 * @param userId The ID of the user
 * @returns Whether the deletion was successful
 */
export async function removeOrganizationMember(
  organizationId: string,
  userId: string
): Promise<boolean> {
  try {
    // Check if membership exists
    const exists = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    if (!exists) return false;

    // Delete the membership
    await prisma.organizationMember.delete({
      where: {
        id: exists.id,
      },
    });

    return true;
  } catch (error) {
    console.error("Error removing organization member:", error);
    return false;
  }
}

/**
 * Update a user's role in an organization
 * @param organizationId The ID of the organization
 * @param userId The ID of the user
 * @param role The new role
 * @param isAdmin Whether the user is an admin
 * @returns The updated organization member
 */
export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: string,
  isAdmin?: boolean
): Promise<OrganizationMember | null> {
  // Check if membership exists
  const exists = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!exists) return null;

  // Update role and admin status
  return await prisma.organizationMember.update({
    where: {
      id: exists.id,
    },
    data: {
      role,
      ...(isAdmin !== undefined ? { isAdmin } : {}),
    },
  });
}
