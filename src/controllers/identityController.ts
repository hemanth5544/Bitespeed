import { Request, Response } from 'express';
import { IdentityService } from '../services/identityService';
import { IdentifyRequest } from '../types/request';

const identityService = new IdentityService();

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body as IdentifyRequest;
    const response = await identityService.identify({ email, phoneNumber });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};