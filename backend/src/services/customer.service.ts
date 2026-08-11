import {
  createCustomer,
  updateCustomer,
  findCustomerById,
  findCustomers,
  updateCustomerNotes,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerQueryParams,
} from "../models/customer.model";

export const addCustomerService = async (
  input: CreateCustomerInput
): Promise<Customer> => {
  return await createCustomer(input);
};

export const editCustomerService = async (
  id: number,
  input: UpdateCustomerInput
): Promise<Customer | null> => {
  return await updateCustomer(id, input);
};

export const getCustomerByIdService = async (
  id: number
): Promise<Customer | null> => {
  return await findCustomerById(id);
};

export const getCustomersService = async (
  params: CustomerQueryParams
): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> => {
  return await findCustomers(params);
};

export const addFollowUpNotesService = async (
  id: number,
  notes?: string,
  follow_up_date?: string
): Promise<Customer | null> => {
  return await updateCustomerNotes(id, notes, follow_up_date);
};
