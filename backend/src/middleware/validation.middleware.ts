import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      res.status(400).json({
        status: "error",
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
      return;
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);

    if (error) {
      res.status(400).json({
        status: "error",
        message: "Query validation error",
        details: error.details.map((detail) => detail.message),
      });
      return;
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);

    if (error) {
      res.status(400).json({
        status: "error",
        message: "Parameter validation error",
        details: error.details.map((detail) => detail.message),
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("student", "teacher", "admin").required(),
    courses: Joi.array().items(Joi.string()).optional(),
    metadata: Joi.object().optional(),
  }),

  notification: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    body: Joi.string().min(1).max(1000).required(),
    recipient_id: Joi.alternatives()
      .try(Joi.string().uuid(), Joi.string().valid("all"))
      .required(),
    link: Joi.string().uri().optional(),
  }),

  chat: Joi.object({
    userId: Joi.string().uuid().required(),
    message: Joi.string().min(1).max(1000).required(),
    conversationId: Joi.string().uuid().optional(),
  }),

  schedule: Joi.object({
    date: Joi.date().iso().required(),
    start_time: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    end_time: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    room: Joi.string().min(1).max(50).required(),
    course_id: Joi.string().uuid().required(),
    teacher_id: Joi.string().uuid().required(),
  }),

  attendanceEvent: Joi.object({
    classId: Joi.string().required(),
    timestamp: Joi.date().iso().required(),
    students: Joi.array()
      .items(
        Joi.object({
          userId: Joi.string().uuid().required(),
          status: Joi.string()
            .valid("present", "absent", "late", "excused")
            .required(),
        })
      )
      .required(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};
