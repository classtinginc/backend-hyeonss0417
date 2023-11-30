declare namespace Express {
  type User = import('.prisma/client').User;

  interface Request {
    user: User;
  }
}
