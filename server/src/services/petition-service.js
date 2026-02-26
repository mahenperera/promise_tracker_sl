import Petition from "../models/Petition.js";
import PetitionSignature from "../models/PetitionSignature.js";

const safeInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

export const createPetition = async (userId, data) => {
  const petition = await Petition.create({
    createdBy: userId,
    title: data.title,
    subjectLine: data.subjectLine ?? "",
    addressedTo: data.addressedTo,
    body: data.body,
    evidenceSummary: data.evidenceSummary ?? "",
    deadline: data.deadline ?? null,
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
    petitioner: {
      name: data.petitioner.name,
      contact: data.petitioner.contact,
      address: data.petitioner.address ?? "",
      nic: data.petitioner.nic ?? "",
    },
    declarationAccepted: data.declarationAccepted,
    status: "submitted",
    isActive: true,
  });

  return petition;
};

// Public list: only approved
export const listPublicPetitions = async ({
  search = "",
  page = 1,
  limit = 10,
}) => {
  const query = { status: "approved", isActive: true };

  if (search && search.trim()) {
    query.$text = { $search: search.trim() };
  }

  const safePage = Math.max(safeInt(page, 1), 1);
  const safeLimit = Math.min(Math.max(safeInt(limit, 10), 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Petition.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .select("-petitioner.nic"), // don’t leak nic publicly
    Petition.countDocuments(query),
  ]);

  return {
    items,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

// Citizen's own petitions (any status)
export const listMyPetitions = async (
  userId,
  { page = 1, limit = 10 } = {},
) => {
  const safePage = Math.max(safeInt(page, 1), 1);
  const safeLimit = Math.min(Math.max(safeInt(limit, 10), 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const query = { createdBy: userId };

  const [items, total] = await Promise.all([
    Petition.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Petition.countDocuments(query),
  ]);

  return {
    items,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

// Access control in service: you pass role + userId
export const getPetitionByIdWithAccess = async (id, userId, role) => {
  const petition = await Petition.findById(id);
  if (!petition) return null;

  // public can only see approved
  if (petition.status === "approved" && petition.isActive) {
    // hide nic in public response
    const obj = petition.toObject();
    if (role !== "admin" && petition.createdBy !== userId) {
      if (obj.petitioner) obj.petitioner.nic = "";
    }
    return obj;
  }

  // owner or admin can see non-approved
  const isOwner = petition.createdBy === userId;
  const isAdmin = role === "admin";

  if (!isOwner && !isAdmin) return "FORBIDDEN";

  return petition;
};

// Admin list all (with optional status)
export const adminListPetitions = async ({
  status,
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const query = {};

  if (status) query.status = status;
  if (search && search.trim()) query.$text = { $search: search.trim() };

  const safePage = Math.max(safeInt(page, 1), 1);
  const safeLimit = Math.min(Math.max(safeInt(limit, 10), 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Petition.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Petition.countDocuments(query),
  ]);

  return {
    items,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const adminApprovePetition = async (id, adminUserId) => {
  const updated = await Petition.findByIdAndUpdate(
    id,
    {
      status: "approved",
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
      rejectionReason: "",
      isActive: true,
    },
    { returnDocument: "after", runValidators: true },
  );

  return updated;
};

export const adminRejectPetition = async (id, adminUserId, reason = "") => {
  const updated = await Petition.findByIdAndUpdate(
    id,
    {
      status: "rejected",
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
      rejectionReason: reason || "",
      isActive: true,
    },
    { returnDocument: "after", runValidators: true },
  );

  return updated;
};

export const signPetition = async (petitionId, userId) => {
  const petition = await Petition.findById(petitionId);
  if (!petition) return { error: "NOT_FOUND" };

  if (!petition.isActive || petition.status !== "approved") {
    return { error: "NOT_SIGNABLE" };
  }

  try {
    await PetitionSignature.create({ petitionId, userId });

    // keep count in sync (not perfect for high scale, but more than enough here)
    await Petition.findByIdAndUpdate(
      petitionId,
      { $inc: { signCount: 1 } },
      { returnDocument: "after" },
    );

    return { ok: true };
  } catch (err) {
    // duplicate sign
    if (err && err.code === 11000) return { error: "ALREADY_SIGNED" };
    throw err;
  }
};
