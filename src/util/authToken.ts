import { checkAdminToken } from "../dao/adminUser";

export async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  const isValid = await checkAdminToken(token);

  if(!isValid) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
  else {
    next()
  }
}