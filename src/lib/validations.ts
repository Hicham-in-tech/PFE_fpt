import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const teamSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
  projectDescription: z.string().optional(),
});

export const teamMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  cin: z.string().optional(),
  cne: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  githubLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedinLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
});

export const observationSchema = z.object({
  teamId: z.number().int().positive(),
  message: z.string().min(1, "Message is required"),
});

export const messageSchema = z.object({
  teamId: z.number().int().positive(),
  message: z.string().min(1, "Message is required"),
});

export const evaluationSchema = z.object({
  teamId: z.number().int().positive(),
  score: z.number().min(0).max(20),
});

export const createCoordinatorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
