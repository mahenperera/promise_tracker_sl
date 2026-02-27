import Petition from "../models/Petition.js";
import PetitionSignature from "../models/PetitionSignature.js";
import User from "../models/User.js";

const safeInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

export const createPetition = async (userId, data) => {
  // Keep this in sync with the User model (userId UUID + email)
  const user = await User.findOne({ userId }).select("email");
  if (!user) {
    const err = new Error("User not found for this token");
    err.status = 401;
    throw err;
  }

  const petition = await Petition.create({
    createdBy: userId,
    petitionerEmail: user.email, // Filled automatically from the DB

    title: data.title,
    subjectLine: data.subjectLine ?? "",
    addressedTo: data.addressedTo,
    body: data.body,

    evidenceSummary: data.evidenceSummary ?? "",
    deadline: data.deadline ?? null,
    attachments: Array.isArray(data.attachments) ? data.attachments : [],

    declarationAccepted: data.declarationAccepted,
    status: "submitted",
    isActive: true,

    signedBy: [],
    signCount: 0,
  });

  return petition;
};

export const listPublicPetitions = async ({
  search = "",
  page = 1,
  limit = 10,
}) => {
  const query = { status: "approved", isActive: true };
  if (search && search.trim()) query.$text = { $search: search.trim() };

  const safePage = Math.max(safeInt(page, 1), 1);
  const safeLimit = Math.min(Math.max(safeInt(limit, 10), 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Petition.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .select("-signedBy"), // Keep signer UUIDs private — don’t send them in public APIs
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

export const getPetitionByIdWithAccess = async (id, userId, role) => {
  const petition = await Petition.findById(id);
  if (!petition) return null;

  const isOwner = petition.createdBy === userId;
  const isAdmin = role === "admin";

  // If the token isn't verified, we treat the request as public access.
  const isLoggedIn = !!userId; // userId is set only if JWT is valid (tryJwtAuth)
  const isPublic = !isLoggedIn;

  // Approved = public
  if (petition.status === "approved" && petition.isActive) {
    const obj = petition.toObject();

    // If there's no token, treat it as public and don't return signedBy
    if (isPublic) obj.signedBy = [];

    // Auth users can view signedBy
    return obj;
  }

  // If it's not approved yet, only the owner or an admin can access it
  if (!isOwner && !isAdmin) return "FORBIDDEN";
  return petition;
};

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
  return Petition.findByIdAndUpdate(
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
};

export const adminRejectPetition = async (id, adminUserId, reason = "") => {
  return Petition.findByIdAndUpdate(
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
};

export const signPetition = async (petitionId, userId) => {
  const petition = await Petition.findById(petitionId);
  if (!petition) return { error: "NOT_FOUND" };

  if (!petition.isActive || petition.status !== "approved") {
    return { error: "NOT_SIGNABLE" };
  }

  try {
    // 1) Create signature entry
    await PetitionSignature.create({ petitionId, userId });

    // 2) Add the UUID to petition.signedBy
    const updated = await Petition.findByIdAndUpdate(
      petitionId,
      { $addToSet: { signedBy: userId } },
      { returnDocument: "after" },
    );

    // 3) Keep signCount in sync
    const signCount = updated?.signedBy?.length || 0;
    await Petition.findByIdAndUpdate(petitionId, { signCount });

    return { ok: true, signCount };
  } catch (err) {
    if (err && err.code === 11000) return { error: "ALREADY_SIGNED" };
    throw err;
  }
};
