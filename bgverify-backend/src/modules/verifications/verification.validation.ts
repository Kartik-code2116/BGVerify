import { z } from 'zod';

export const createVerificationSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  verificationType: z.enum([
    'employment', 'education', 'address', 'identity', 'criminal',
    'court_records', 'social_media', 'passport', 'driving_license',
    'professional_certification', 'drug_test', 'credit_check',
    'global_sanctions', 'reference_check',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  inputData: z.record(z.any()).optional(),
  headless: z.boolean().optional(),
});

export const updateVerificationSchema = z.object({
  status: z.enum([
    'pending', 'assigned', 'in_progress', 'waiting_response',
    'evidence_collected', 'ai_review', 'manual_review',
    'completed', 'failed', 'cancelled',
  ]).optional(),
  result: z.enum([
    'match', 'no_match', 'partial_match', 'needs_review',
    'insufficient_data', 'pending',
  ]).optional(),
  reviewerNotes: z.string().optional(),
});

export type CreateVerificationInput = z.infer<typeof createVerificationSchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
