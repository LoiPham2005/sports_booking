import { customAlphabet } from 'nanoid';

const bookingCodeGen = customAlphabet('0123456789', 8);
const tokenGen = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 24);

export const generateBookingCode = (): string => bookingCodeGen();
export const generateToken = (): string => tokenGen();
