import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { requestId, action, notes } = await req.json();

    const request = await base44.asServiceRole.entities.VerificationRequest.get(requestId);
    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.VerificationRequest.update(requestId, {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      reviewedBy: user.id,
      reviewNotes: notes || ''
    });

    if (action === 'approve') {
      await base44.asServiceRole.auth.updateUser(request.userId, {
        role: request.type
      });

      await base44.asServiceRole.entities.Badge.create({
        userId: request.userId,
        type: 'VERIFIED',
        name: 'Verified Artist',
        description: 'Official verified account'
      });
    }

    await base44.asServiceRole.functions.invoke('sendNotification', {
      userId: request.userId,
      type: 'VERIFICATION',
      title: action === 'approve' ? 'Verification Approved' : 'Verification Declined',
      message: action === 'approve' 
        ? 'Your account has been verified!'
        : `Your verification request was declined. ${notes || ''}`
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});