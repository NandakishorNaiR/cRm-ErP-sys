import { Request, Response } from "express";
import {
  createChallanService,
  updateChallanStatusService,
  getChallanByIdService,
  getChallansService,
} from "../services/challan.service";

export const createChallan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { customer_id, status, items } = req.body;
    const created_by = req.user.id;

    const challan = await createChallanService({
      customer_id: Number(customer_id),
      status,
      items,
      created_by,
    });

    res.status(201).json({
      success: true,
      message: `Sales challan created as ${challan.status}`,
      data: challan,
    });
  } catch (error: any) {
    if (error.statusCode === 400 || (error.message && error.message.includes("Insufficient stock"))) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    if (error.statusCode === 404 || (error.message && error.message.includes("not found"))) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("createChallan error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sales challan",
    });
  }
};

export const updateChallanStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
      return;
    }

    const { status } = req.body;
    const created_by = req.user.id;

    const challan = await updateChallanStatusService(id, status, created_by);

    if (!challan) {
      res.status(404).json({
        success: false,
        message: "Sales challan not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Sales challan status updated to ${status}`,
      data: challan,
    });
  } catch (error: any) {
    if (error.statusCode === 400 || (error.message && error.message.includes("Insufficient stock"))) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    if (error.statusCode === 404 || (error.message && error.message.includes("not found"))) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("updateChallanStatus error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update sales challan status",
    });
  }
};

export const getChallans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customer_id = req.query.customer_id ? Number(req.query.customer_id) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await getChallansService({
      customer_id,
      status,
      search,
      page,
      limit,
    });

    const totalPages = Math.ceil(result.total / result.limit) || 1;

    res.status(200).json({
      success: true,
      data: result.challans,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("getChallans error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales challans",
    });
  }
};

export const getChallanById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
      return;
    }

    const challan = await getChallanByIdService(id);
    if (!challan) {
      res.status(404).json({
        success: false,
        message: "Sales challan not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (error) {
    console.error("getChallanById error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales challan",
    });
  }
};
