import {
  createTicket,
  getTickets,
  getTicketById,
  replyToTicket,
  updateTicketById,
  assignTicket,
  deleteTicketById,
} from "../services/ticket-service.js";

import {
  validateCreateTicket,
  validateReply,
  validateUpdateTicket,
} from "../validators/ticket-validator.js";

export const createTicketHandler = async (req, res, next) => {
  try {
    const validation = validateCreateTicket(req.body);
    if (!validation.ok)
      return res.status(400).json({ errors: validation.errors });

    const ticket = await createTicket(req.body, req.user);

    res.status(201).json({ message: "Ticket created", data: ticket });
  } catch (err) {
    next(err);
  }
};

export const listTicketsHandler = async (req, res, next) => {
  try {
    const tickets = await getTickets({
      user: req.user,
      status: req.query.status,
      assigned: req.query.assigned,
    });

    res.json({ data: tickets });
  } catch (err) {
    next(err);
  }
};

export const getTicketHandler = async (req, res, next) => {
  try {
    const ticket = await getTicketById(req.params.id, req.user);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json({ data: ticket });
  } catch (err) {
    next(err);
  }
};

export const replyTicketHandler = async (req, res, next) => {
  try {
    const validation = validateReply(req.body);
    if (!validation.ok)
      return res.status(400).json({ errors: validation.errors });

    const updated = await replyToTicket(
      req.params.id,
      req.body.message,
      req.user,
    );

    if (!updated) return res.status(404).json({ message: "Ticket not found" });

    res.json({ message: "Reply added", data: updated });
  } catch (err) {
    next(err);
  }
};

export const updateTicketHandler = async (req, res, next) => {
  try {
    const validation = validateUpdateTicket(req.body);
    if (!validation.ok)
      return res.status(400).json({ errors: validation.errors });

    const updated = await updateTicketById(req.params.id, req.body);

    if (!updated) return res.status(404).json({ message: "Ticket not found" });

    res.json({ message: "Ticket updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const assignTicketHandler = async (req, res, next) => {
  try {
    const updated = await assignTicket(req.params.id, req.body.assignedTo);

    if (!updated) return res.status(404).json({ message: "Ticket not found" });

    res.json({ message: "Ticket assigned", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteTicketHandler = async (req, res, next) => {
  try {
    const deleted = await deleteTicketById(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Ticket not found" });

    res.json({ message: "Ticket deleted" });
  } catch (err) {
    next(err);
  }
};
