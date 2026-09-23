import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { masterclassId } = await req.json();

    const course = await base44.entities.Masterclass.get(masterclassId);
    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    await base44.entities.Receipt.create({
      userId: user.id,
      entityType: 'Masterclass',
      entityId: masterclassId,
      amount: course.price,
      status: 'COMPLETED'
    });

    await base44.asServiceRole.entities.Masterclass.update(masterclassId, {
      enrolled: (course.enrolled || 0) + 1
    });

    await base44.asServiceRole.functions.invoke('sendNotification', {
      userId: course.instructorId,
      type: 'ENROLLMENT',
      title: 'New Student',
      message: `${user.full_name} enrolled in "${course.title}"`
    });

    return Response.json({ success: true, course });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});