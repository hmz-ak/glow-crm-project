import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/password';

const prisma = new PrismaClient();

const daysFromNow = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function main() {
  await prisma.followUpTask.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.businessMember.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo Owner',
      email: 'owner@flowcrm.test',
      passwordHash: hashPassword('password123'),
    },
  });

  const demoBusiness = await prisma.business.create({
    data: {
      name: 'Glow Studio',
      industry: 'Salon and services',
      memberships: { create: { userId: demoUser.id, role: 'Owner' } },
    },
  });

  const amina = await prisma.customer.create({
    data: {
      name: 'Amina Khan',
      businessId: demoBusiness.id,
      phone: '+92 300 1112233',
      email: 'amina@example.com',
      address: 'DHA Phase 5',
      notes: 'Prefers WhatsApp reminders the night before.',
      tags: JSON.stringify(['VIP', 'Salon']),
    },
  });

  const omar = await prisma.customer.create({
    data: {
      name: 'Omar Siddiqui',
      businessId: demoBusiness.id,
      phone: '+92 321 4455667',
      address: 'Gulberg',
      notes: 'Asked about weekly home cleaning.',
      tags: JSON.stringify(['Home service']),
    },
  });

  const sara = await prisma.customer.create({
    data: {
      name: 'Sara Malik',
      businessId: demoBusiness.id,
      phone: '+92 333 9988776',
      email: 'sara@example.com',
      address: 'Johar Town',
      tags: JSON.stringify(['Follow-up']),
    },
  });

  const aminaLead = await prisma.lead.create({
    data: {
      customerId: amina.id,
      businessId: demoBusiness.id,
      source: 'Instagram DM',
      serviceType: 'Hair color appointment',
      status: 'Booked',
      valueEstimate: 12000,
      urgency: 'Hot',
      nextFollowUpDate: daysFromNow(1, 18),
      notes: 'Wants balayage before weekend event.',
    },
  });

  const omarLead = await prisma.lead.create({
    data: {
      customerId: omar.id,
      businessId: demoBusiness.id,
      source: 'Google Business',
      serviceType: 'Deep cleaning quote',
      status: 'Contacted',
      valueEstimate: 18000,
      urgency: 'Hot',
      nextFollowUpDate: daysFromNow(0, 17),
      notes: 'Needs quote today for 3-bedroom apartment.',
    },
  });

  const saraLead = await prisma.lead.create({
    data: {
      customerId: sara.id,
      businessId: demoBusiness.id,
      source: 'Referral',
      serviceType: 'Facial treatment',
      status: 'Follow-up',
      valueEstimate: 6000,
      urgency: 'Normal',
      nextFollowUpDate: daysFromNow(-1, 11),
      notes: 'Asked for package details, no response after first message.',
    },
  });

  const aminaAppointment = await prisma.appointment.create({
    data: {
      customerId: amina.id,
      businessId: demoBusiness.id,
      leadId: aminaLead.id,
      service: 'Hair color appointment',
      scheduledAt: daysFromNow(0, 15),
      status: 'Booked',
      price: 12000,
      notes: 'Patch test complete.',
    },
  });

  await prisma.appointment.create({
    data: {
      customerId: sara.id,
      businessId: demoBusiness.id,
      leadId: saraLead.id,
      service: 'Facial treatment consultation',
      scheduledAt: daysFromNow(2, 12),
      status: 'Follow-up',
      price: 6000,
    },
  });

  await prisma.payment.create({
    data: {
      customerId: amina.id,
      businessId: demoBusiness.id,
      appointmentId: aminaAppointment.id,
      amount: 12000,
      paidAmount: 5000,
      status: 'Partial',
      method: 'Cash',
      dueAt: daysFromNow(0, 18),
    },
  });

  await prisma.payment.create({
    data: {
      customerId: sara.id,
      businessId: demoBusiness.id,
      amount: 6000,
      paidAmount: 0,
      status: 'Unpaid',
      method: 'Bank transfer',
      dueAt: daysFromNow(2, 18),
    },
  });

  await prisma.followUpTask.createMany({
    data: [
      {
        customerId: omar.id,
        businessId: demoBusiness.id,
        leadId: omarLead.id,
        dueAt: daysFromNow(0, 17),
        reason: 'Send deep cleaning estimate',
        status: 'Open',
        suggestedMessage:
          'Hi Omar, thanks for asking about deep cleaning. I can reserve a slot this week. Would you like me to send the final quote here?',
      },
      {
        customerId: sara.id,
        businessId: demoBusiness.id,
        leadId: saraLead.id,
        dueAt: daysFromNow(-1, 11),
        reason: 'Nudge after package details',
        status: 'Open',
        suggestedMessage:
          'Hi Sara, just checking if you had a chance to review the facial package details. I can hold a consultation slot for you.',
      },
      {
        customerId: amina.id,
        businessId: demoBusiness.id,
        leadId: aminaLead.id,
        dueAt: daysFromNow(1, 18),
        reason: 'Pre-appointment reminder',
        status: 'Open',
        suggestedMessage:
          'Hi Amina, quick reminder for your hair color appointment today. Reply here if you need to adjust the time.',
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      businessId: demoBusiness.id,
      actorUserId: demoUser.id,
      model: 'Business',
      modelId: demoBusiness.id,
      action: 'SEED',
      description: 'Seeded demo workspace',
      changes: JSON.stringify({ email: demoUser.email, password: 'password123' }),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
