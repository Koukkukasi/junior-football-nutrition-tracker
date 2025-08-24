import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { prisma } from '../db';

const router = Router();

// Clerk webhook endpoint for user events
router.post('/clerk', async (req: Request, res: Response) => {
  try {
    // Get the headers
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing svix headers');
      res.status(400).json({ error: 'Missing svix headers' });
      return;
    }

    // Get the body
    const body = JSON.stringify(req.body);

    // Create a new Svix instance with your webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    // Handle the webhook event
    const eventType = evt.type;
    console.log(`Webhook received: ${eventType}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      const email = email_addresses?.[0]?.email_address || `${id}@placeholder.com`;
      const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Player';

      console.log(`Processing ${eventType} for user ${id} with email ${email}`);

      try {
        // Use upsert to create or update the user
        const user = await prisma.user.upsert({
          where: { clerkId: id },
          update: {
            email,
            name,
            updatedAt: new Date()
          },
          create: {
            clerkId: id,
            email,
            name,
            age: 16, // Default age
            role: 'PLAYER',
            ageGroup: '16-18', // Default age group
            dataConsent: false,
            completedOnboarding: false
          }
        });

        console.log(`User ${eventType === 'user.created' ? 'created' : 'updated'} in database:`, user.id);
      } catch (dbError) {
        console.error('Database error during user sync:', dbError);
        // Return 200 to Clerk to prevent retries if it's a duplicate user issue
        // The auth middleware will handle creating the user if needed
      }
    } else if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      try {
        // Soft delete or hard delete based on your requirements
        await prisma.user.delete({
          where: { clerkId: id }
        });
        console.log(`User ${id} deleted from database`);
      } catch (dbError) {
        console.error('Database error during user deletion:', dbError);
        // User might already be deleted
      }
    }

    // Return a 200 response to acknowledge receipt of the webhook
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;