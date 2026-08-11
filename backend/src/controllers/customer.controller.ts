import { Request, Response } from "express";
import {
  addCustomerService,
  editCustomerService,
  getCustomerByIdService,
  getCustomersService,
  addFollowUpNotesService,
} from "../services/customer.service";

export const addCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customer = await addCustomerService(req.body);
    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("addCustomer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

export const editCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const customer = await editCustomerService(id, req.body);
    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("editCustomer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

export const getCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const customer_type = req.query.customer_type ? String(req.query.customer_type) : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await getCustomersService({
      search,
      status,
      customer_type,
      page,
      limit,
    });

    const totalPages = Math.ceil(result.total / result.limit) || 1;

    res.status(200).json({
      success: true,
      data: result.customers,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("getCustomers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const getCustomerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const customer = await getCustomerByIdService(id);
    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("getCustomerById error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

export const addFollowUpNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const { notes, follow_up_date } = req.body;
    const customer = await addFollowUpNotesService(id, notes, follow_up_date);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Follow-up notes updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("addFollowUpNotes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update follow-up notes",
    });
  }
};
