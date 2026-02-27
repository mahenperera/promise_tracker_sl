import Ticket from "../models/Ticket.js";
import Politician from "../models/Politician.js";
import User from "../models/User.js";

// Create ticket
export const createTicket = async (data, user) => {
  if (data.politicianId) {
    const exists = await Politician.exists({ _id: data.politicianId });

    if (!exists) {
      const err = new Error("Invalid politicianId");
      err.statusCode = 400;
      throw err;
    }
  }

  return Ticket.create({
    ...data,
    createdBy: user.userId,
  });
};

// Get all tickets
// Admin - All tickets or filter by assigned
// Citizen - Only their tickets
export const getTickets = async ({ user, status, assigned }) => {
  const query = {};

  if (user.role === "citizen") {
    query.createdBy = user.userId;
  }

  if (user.role === "admin") {
    if (assigned === "me") {
      query.assignedTo = user.userId;
    }

    if (assigned === "unassigned") {
      query.assignedTo = null;
    }
  }

  const allowedStatuses = ["open", "in_progress", "resolved", "closed"];

  if (status && allowedStatuses.includes(status)) {
    query.status = status;
  }

  return Ticket.find(query)
    .sort({ createdAt: -1 })
    .populate("politicianId", "fullName slug party");
};

// Get ticket
export const getTicketById = async (id, user) => {
  const ticket = await Ticket.findById(id).populate(
    "politicianId",
    "fullName slug party",
  );

  if (!ticket) return null;

  if (user.role === "citizen" && ticket.createdBy !== user.userId) {
    const err = new Error("Not authorized");
    err.statusCode = 403;
    throw err;
  }

  return ticket;
};

// Reply to ticket
export const replyToTicket = async (id, message, user) => {
  const ticket = await Ticket.findById(id);

  if (!ticket) return null;

  if (user.role === "citizen" && ticket.createdBy !== user.userId) {
    const err = new Error("Not authorized");
    err.statusCode = 403;
    throw err;
  }

  ticket.replies.push({
    senderId: user.userId,
    senderRole: user.role,
    message,
  });

  ticket.lastRepliedAt = new Date();

  if (user.role === "admin") {
    ticket.status = "in_progress";
  }

  await ticket.save();

  return ticket;
};

// Update ticket
export const updateTicketById = async (id, data) => {
  return Ticket.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Assign ticket to admin
export const assignTicket = async (id, adminUserId) => {
  const admin = await User.findOne({ userId: adminUserId, role: "admin" });

  if (!admin) {
    const err = new Error("Admin user not found");
    err.statusCode = 400;
    throw err;
  }

  return Ticket.findByIdAndUpdate(
    id,
    { assignedTo: adminUserId },
    { returnDocument: "after" },
  );
};

// Delete ticket
export const deleteTicketById = async (id) => {
  return Ticket.findByIdAndDelete(id);
};
