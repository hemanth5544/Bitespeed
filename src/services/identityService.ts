import { Contact } from '../models/Contact';
import { IdentifyRequest, IdentifyResponse } from '../types/request';
import { Op } from 'sequelize';

export class IdentityService {
  async identify({ email, phoneNumber }: IdentifyRequest): Promise<IdentifyResponse> {
    if (!email && !phoneNumber) {
      throw new Error('At least one of email or phoneNumber is required');
    }
    //first fetch alll contacts from Db
    const initialContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {},
        ],
        deletedAt: null,
      },
    });

    if (!initialContacts.length) {
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        contact: {
          primaryContatctId: newContact.id,
          emails: newContact.email ? [newContact.email] : [],
          phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
          secondaryContactIds: [],
        },
      };
    }

   
   
  }

  