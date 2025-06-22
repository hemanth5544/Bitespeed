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

   
    const allLinkedContacts = await this.getAllLinkedContacts(initialContacts);

    // Step 4: Determine the primary contact (oldest by createdAt)
    const primaryContact = allLinkedContacts.reduce((prev, curr) =>
      prev.createdAt < curr.createdAt ? prev : curr
    );

    // Step 5: Check if new information is provided
    const hasNewInfo =
      (email && !allLinkedContacts.some(c => c.email === email)) ||
      (phoneNumber && !allLinkedContacts.some(c => c.phoneNumber === phoneNumber));

    if (hasNewInfo) {
      const newSecondary = await Contact.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      allLinkedContacts.push(newSecondary);
    }

    // Step 6: Update other primary contacts to secondary
    const otherPrimaries = allLinkedContacts.filter(
      c => c.linkPrecedence === 'primary' && c.id !== primaryContact.id
    );

    if (otherPrimaries.length) {
      for (const contact of otherPrimaries) {
        await Contact.update(
          {
            linkPrecedence: 'secondary',
            linkedId: primaryContact.id,
            updatedAt: new Date(),
          },
          { where: { id: contact.id } }
        );
        contact.linkPrecedence = 'secondary';
        contact.linkedId = primaryContact.id;
      }
    }

    
    const emails = Array.from(
      new Set(allLinkedContacts.map(c => c.email).filter((e): e is string => !!e))
    );
    const phoneNumbers = Array.from(
      new Set(allLinkedContacts.map(c => c.phoneNumber).filter((p): p is string => !!p))
    );
    const secondaryContactIds = Array.from(
      new Set(
        allLinkedContacts
          .filter(c => c.id !== primaryContact.id && c.linkPrecedence === 'secondary')
          .map(c => c.id)
      )
    );

    //prefer teh primary details first
    const orderedEmails = primaryContact.email
      ? [primaryContact.email, ...emails.filter(e => e !== primaryContact.email)]
      : emails;
    const orderedPhoneNumbers = primaryContact.phoneNumber
      ? [primaryContact.phoneNumber, ...phoneNumbers.filter(p => p !== primaryContact.phoneNumber)]
      : phoneNumbers;

    return {
      contact: {
        primaryContatctId: primaryContact.id,
        emails: orderedEmails,
        phoneNumbers: orderedPhoneNumbers,
        secondaryContactIds,
      },
    };
  }

  //helper to find all likned contafcts
  private async getAllLinkedContacts(initialContacts: Contact[]): Promise<Contact[]> {
    //TODO: use set to rmeove duplicates

    const allContacts = new Set<Contact>(initialContacts);
    const processedIds = new Set<number>();
    let contactsToProcess = [...initialContacts];

    while (contactsToProcess.length) {
      const currentContact = contactsToProcess.shift()!;
      if (processedIds.has(currentContact.id)) continue;

      processedIds.add(currentContact.id);

      // Fetch contacts linked by {email, phoneNumber, linkedId} this three
      const linkedContacts = await Contact.findAll({
        where: {
          [Op.or]: [
            currentContact.email ? { email: currentContact.email } : {},
            currentContact.phoneNumber ? { phoneNumber: currentContact.phoneNumber } : {},
            currentContact.linkedId ? { id: currentContact.linkedId } : {},
            { linkedId: currentContact.id },
          ],
          deletedAt: null,
        },
      });

      for (const contact of linkedContacts) {
        if (!processedIds.has(contact.id)) {
          allContacts.add(contact);
          contactsToProcess.push(contact);
        }
      }
    }

    return Array.from(allContacts);
  }

  
}