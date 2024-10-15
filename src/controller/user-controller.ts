import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user';
import logger from '../utils/logger';

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      logger.info(`User registration failed : ${email} already exist`);
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({ 
      message: "Register Successfully",
      token 
    });

  } catch (error) {
    logger.error("Error occur")
    res.status(500).json({ message: 'Server Error' });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.info(`Login failed for email: ${email}, user not found`); 
      res.status(400).json({ message: 'Invalid Credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.info(`Login failed for email: ${email}, incorrect password`); 
      res.status(400).json({ message: 'Invalid Credentials' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
    logger.info(`Login successful for email: ${email}`); 

    res.json({
      message: "Login Successfully",
      token 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, sort = 'name', order = 'asc', search, filter } = req.query;

    const filterObj: any = {};

    if (search) {
      filterObj.$or = [
        { name: { $regex: search, $options: 'i' } },  
        { email: { $regex: search, $options: 'i' } }  
      ];
    }


    if (filter) {
      filterObj.role = filter;  
    }

  
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

  
    const users = await User.find(filterObj)
      .sort({ [sort as string]: order === 'asc' ? 1 : -1 })  
      .skip(skip)  
      .limit(limitNum); 
 
    const totalUsers = await User.countDocuments(filterObj);

    res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      totalUsers
    });
    
    logger.info('Users fetched successfully with pagination, filtering, and sorting');
  } catch (error) {
    logger.error(`Error fetching users:`);
    res.status(500).json({ message: 'Server Error' });
  }
};
export { registerUser, loginUser , getUsers};
